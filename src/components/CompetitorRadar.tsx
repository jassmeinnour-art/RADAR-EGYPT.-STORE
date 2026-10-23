import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingDown, 
  TrendingUp,
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Sparkles,
  ShoppingBag,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark,
  Bell,
  Camera,
  Image as ImageIcon,
  BarChart3,
  Archive,
  FileSpreadsheet,
  Clock,
  Palette,
  Upload,
  Volume2,
  Truck,
  Flame,
  Lock,
  Unlock,
  X,
  Calendar,
  MessageCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import { ProductData, MerchantOffer, ProductPricingPlan } from '../types';
import { isFurnitureOrBedding } from '../utils/competitorCSVManager';
import { ProfitMarginCalculator } from './ProfitMarginCalculator';
import { CompetitorPriceHistoryChart } from './CompetitorPriceHistoryChart';
import { SmartDynamicPricingPanel } from './SmartDynamicPricingPanel';
import { PricingGuardrailsManager } from './PricingGuardrailsManager';
import { WhatsAppAutoRepriceModal } from './WhatsAppAutoRepriceModal';
import {
  getOrCreatePricingPlan,
  evaluateSmartDynamicPrice,
  applySmartDynamicPricingToPlan,
  recordSmartDynamicPricingLog,
  getDynamicPricingRuleLabel,
  checkPriceFloorProximity,
  saveStoredPricingPlan,
} from '../data/pricingGuardrailsData';
import { exportSingleProductFullAuditCSV } from '../utils/csvProductManager';
import { ExportReportsButton } from './ExportReportsButton';
import { exportSingleProductCompetitorsToSpreadsheet } from '../utils/competitorPriceExport';
import { useTheme } from '../context/ThemeContext';
import { useAudioNotifications } from '../context/AudioNotificationContext';

interface CompetitorRadarProps {
  product: ProductData | null | undefined;
  allProducts?: ProductData[];
  currency: string;
  selectedDiscount: number;
  setSelectedDiscount: (discount: number) => void;
  onApplyWinningPrice: (calculatedWinningPrice: number, discountValue: number) => void;
  onAutoAdjustProductPrice?: (
    productId: string,
    newMerchantPrice: number,
    updatedCompetitorPrice?: number,
    competitorName?: string,
    reasonLabel?: string
  ) => void;
  onBulkAutoAdjustAllProducts?: (
    adjustments: { productId: string; newPrice: number; guardrailStatus: string }[]
  ) => void;
  onNavigateToGuardrails?: () => void;
  onOpenRepriceModal: () => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (product: ProductData) => void;
  onOpenAlertModal?: (product: ProductData) => void;
  onArchiveProduct?: (product: ProductData) => void;
  onOpenStudio?: () => void;
  onOpenBulkReprice?: () => void;
  onOpenPeriodicReports?: () => void;
  onOpenProfitSimulator?: () => void;
  onOpenSalesDashboard?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenChannelCompetitorImport?: (platformCode?: string) => void;
  onOpenGenerateWaybillModal?: (product: ProductData) => void;
  onOpenBestSellersModal?: () => void;
  onSelectProduct?: (product: ProductData) => void;
}

// Safe Badge for displaying merchant/store logo or emoji
const MerchantLogoBadge: React.FC<{
  logo?: string;
  merchantName?: string;
  platformName?: string;
}> = ({ logo, merchantName, platformName }) => {
  const isUrl =
    Boolean(logo) &&
    (logo!.startsWith('http://') ||
      logo!.startsWith('https://') ||
      logo!.startsWith('/') ||
      logo!.startsWith('data:image/'));

  if (isUrl) {
    return (
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
        <img
          src={logo}
          alt={merchantName || 'شعار المتجر'}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Determine fallback emoji/icon
  const getFallbackIcon = () => {
    if (logo && logo.length <= 4) return logo;
    const name = `${merchantName || ''} ${platformName || ''}`.toLowerCase();
    if (name.includes('amazon') || name.includes('أمازون')) return '🛒';
    if (name.includes('noon') || name.includes('نون')) return '🟡';
    if (name.includes('jumia') || name.includes('جوميا')) return '🟠';
    if (name.includes('btech') || name.includes('بي تك') || name.includes('b.tech')) return '🔵';
    if (name.includes('2b') || name.includes('كمبيوتر')) return '💻';
    if (name.includes('knz') || name.includes('كنز')) return '🏷️';
    if (name.includes('homzmart') || name.includes('هومزمارت')) return '🛋️';
    if (name.includes('elaraby') || name.includes('العربي')) return '🏭';
    return '🏬';
  };

  return (
    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-base select-none">
      {getFallbackIcon()}
    </div>
  );
};

export const CompetitorRadar: React.FC<CompetitorRadarProps> = ({
  product: rawProduct,
  allProducts = [],
  currency,
  selectedDiscount,
  setSelectedDiscount,
  onApplyWinningPrice,
  onAutoAdjustProductPrice,
  onBulkAutoAdjustAllProducts,
  onNavigateToGuardrails,
  onOpenRepriceModal,
  isWatchlisted = false,
  onToggleWatchlist,
  onOpenAlertModal,
  onArchiveProduct,
  onOpenStudio,
  onOpenBulkReprice,
  onOpenPeriodicReports,
  onOpenProfitSimulator,
  onOpenSalesDashboard,
  onShowToast,
  onOpenChannelCompetitorImport,
  onOpenGenerateWaybillModal,
  onOpenBestSellersModal,
  onSelectProduct
}) => {
  const product = rawProduct || (allProducts && allProducts.length > 0 ? allProducts[0] : null);
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const { playPriceAlertSound, playCompetitorStatusSound, setActiveGlobalSettingsTab } = useAudioNotifications();
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  // Track out-of-stock simulation overrides per offer
  const [stockOverrides, setStockOverrides] = useState<Record<string, boolean>>({});
  // Pricing plan synchronized with PricingGuardrailsManager
  const [pricingPlan, setPricingPlan] = useState<ProductPricingPlan>(() => getOrCreatePricingPlan(product));
  // Expand/collapse state for the integrated PricingGuardrailsManager module
  const [isGuardrailsManagerExpanded, setIsGuardrailsManagerExpanded] = useState<boolean>(false);
  // Selected competitor offer for the 7-day Quick Comparison Modal
  const [quickCompareOffer, setQuickCompareOffer] = useState<MerchantOffer | null>(null);
  // WhatsApp Automated Alerts & Auto-Repricing Modal State
  const [isWhatsAppRepriceModalOpen, setIsWhatsAppRepriceModalOpen] = useState<boolean>(false);
  const [selectedWhatsAppCompetitor, setSelectedWhatsAppCompetitor] = useState<MerchantOffer | null>(null);
  // Ref to track last alerted price and prevent repetitive audio spam
  const lastAlertedPriceRef = useRef<number | null>(null);
  const onShowToastRef = useRef(onShowToast);
  const playPriceAlertSoundRef = useRef(playPriceAlertSound);
  onShowToastRef.current = onShowToast;
  playPriceAlertSoundRef.current = playPriceAlertSound;

  useEffect(() => {
    const handlePlanSync = () => {
      if (product) {
        setPricingPlan(getOrCreatePricingPlan(product));
      }
    };
    window.addEventListener('merchant_pricing_guardrails_updated', handlePlanSync);
    return () => window.removeEventListener('merchant_pricing_guardrails_updated', handlePlanSync);
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      setPricingPlan(getOrCreatePricingPlan(product));
    }
  }, [product?.id]);

  const handleToggleCompetitorStock = (offer: MerchantOffer) => {
    const currentStatus = stockOverrides[offer.id] !== undefined ? stockOverrides[offer.id] : true;
    const nextStatus = !currentStatus;
    
    setStockOverrides(prev => ({ ...prev, [offer.id]: nextStatus }));

    if (!nextStatus) {
      // Competitor is now OUT OF STOCK -> trigger custom competitor alert sound & Smart Dynamic Pricing if enabled!
      playCompetitorStatusSound();
      if (product) {
        const plan = getOrCreatePricingPlan(product);
        if (plan.autoRepriceWithinBounds && plan.autoRaiseOnStockoutOrSurge !== false) {
          const evalRes = evaluateSmartDynamicPrice(
            product,
            plan,
            offer.price,
            offer.merchantName,
            offer.platformName,
            true
          );
          applySmartDynamicPricingToPlan(plan, evalRes, `تعديل تلقائي عند نفاد مخزون المنافس (${offer.merchantName})`);
          recordSmartDynamicPricingLog({
            id: `sdp-stockout-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            productId: product.id,
            productTitle: product.title,
            triggerReasonAr: `نفاد مخزون المنافس (${offer.merchantName}) — رفع السعر للسقف الأعلى`,
            competitorName: offer.merchantName,
            competitorPlatform: offer.platformName || 'منصة منافسة',
            previousCompetitorPrice: offer.price,
            newCompetitorPrice: offer.price,
            previousMerchantPrice: evalRes.previousSellingPrice,
            rawTargetPrice: evalRes.rawCalculatedPrice,
            newMerchantPrice: evalRes.finalApprovedPrice,
            floorPriceGuardrail: evalRes.effectiveFloorPrice,
            ceilingPriceGuardrail: evalRes.effectiveCeilingPrice,
            netProfitEGP: evalRes.netProfitEGP,
            netMarginPercent: evalRes.netMarginPercent,
            guardrailStatus: evalRes.guardrailStatus,
            ruleAppliedLabel: getDynamicPricingRuleLabel(plan.repriceRuleType, plan.undercutMode, plan.undercutValue, plan.targetNetMarginPercent),
            platformsUpdatedCount: plan.platformGuardrails.length,
          });
          if (onAutoAdjustProductPrice) {
            onAutoAdjustProductPrice(product.id, evalRes.finalApprovedPrice, undefined, offer.merchantName, 'رفع تلقائي للسقف عند نفاد مخزون المنافس');
          } else {
            onApplyWinningPrice(evalRes.finalApprovedPrice, selectedDiscount);
          }
        }
      }
      if (onShowToast) {
        onShowToast(`⚠️ نفاد مخزون المنافس [${offer.merchantName}]! قام التسعير الديناميكي الذكي برفع سعرك تلقائياً نحو السقف الأعلى لتعظيم الربح 🏆`);
      }
    } else {
      // Returned in stock
      playCompetitorStatusSound();
      if (onShowToast) {
        onShowToast(`تمت استعادة حالة توفر منتج المنافس [${offer.merchantName}] بالمخزن وإعادة موازنة السعر الديناميكي 📦`);
      }
    }
  };

  if (!product) {
    return (
      <div className="w-full max-w-full px-4 py-6 sm:p-8 lg:p-12 bg-white rounded-3xl text-center border border-slate-200 shadow-sm space-y-4 overflow-hidden">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-200">
          <Zap className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Alexandria']">لا توجد منتجات مسجلة حالياً، يرجى المزامنة</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          لم يتم ربط أو مزامنة أي منتجات فعلية من متجرك على منصات التجارة الإلكترونية بعد. قم بالمزامنة الحية أو استعرض قائمة أفضل المنتجات مبيعاً على المنصات لإضافتها لقائمة المتابعة بضغطة زر.
        </p>
        {onOpenBestSellersModal && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              id="btn-radar-empty-open-bestsellers"
              onClick={onOpenBestSellersModal}
              className="h-10 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-black font-['Alexandria'] flex items-center gap-2 shadow-lg shadow-sky-500/20 border border-sky-400 transition-all cursor-pointer active:scale-95"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>عرض أفضل المنتجات مبيعاً (Best Sellers) وإضافتها للمتابعة 🔥</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const isFurniture = isFurnitureOrBedding(product);
  const rawOffers = product.merchantOffers || [];
  
  // Strict Category Filter: Reject any dummy headphone or audio offers on furniture products
  const merchantOffers = isFurniture
    ? rawOffers.filter(offer => {
        const lower = ((offer.merchantName || '') + ' ' + (offer.warranty || '')).toLowerCase();
        return !lower.includes('سماع') && !lower.includes('headphone') && 
               !lower.includes('soundcore') && !lower.includes('أنكر') && !lower.includes('q30');
      })
    : rawOffers;

  const specs = product.specs || [];

  // Find lowest competitor offer
  const lowestOffer = merchantOffers.length > 0 
    ? merchantOffers.reduce((prev, curr) => curr.price < prev.price ? curr : prev, merchantOffers[0])
    : null;

  const lowestPrice = lowestOffer?.price || product.currentLowestPrice || 2500;
  const wholesaleCost = product.estimatedWholesaleCost || 2000;

  // Calculate winning price based on selected discount
  const winningPrice = Math.round(lowestPrice * (1 - selectedDiscount / 100));
  const profitMargin = winningPrice - wholesaleCost;
  const profitMarginPercent = winningPrice > 0 ? Math.round((profitMargin / winningPrice) * 100) : 0;
  const discountSavingsAmount = lowestPrice - winningPrice;

  // Evaluate proximity to the minimum protection floor (PricingGuardrailsManager)
  const proximity = checkPriceFloorProximity(
    winningPrice,
    pricingPlan,
    filterPlatform !== 'all' ? filterPlatform : undefined
  );

  // Trigger alert when price approaches or breaches the minimum protection guardrail
  useEffect(() => {
    if (!product?.id) return;
    if (proximity.isApproachingFloor || proximity.isBreached) {
      if (lastAlertedPriceRef.current !== winningPrice) {
        lastAlertedPriceRef.current = winningPrice;
        playPriceAlertSoundRef.current?.({ repeat: proximity.isBreached ? 2 : 1 });
        if (onShowToastRef.current) {
          onShowToastRef.current(
            proximity.isBreached
              ? `🚨 تنبيه صمام الأمان: السعر (${winningPrice.toLocaleString()} ${currency}) يكسر الحد الأدنى للحماية (${proximity.effectiveFloorPrice.toLocaleString()} ${currency})!`
              : `⚠️ تنبيه صمام الأمان: السعر (${winningPrice.toLocaleString()} ${currency}) يقترب من الحد الأدنى للحماية (${proximity.effectiveFloorPrice.toLocaleString()} ${currency}) بفارق ${proximity.distanceToFloorEGP} ج.م فقط!`
          );
        }
      }
    } else {
      lastAlertedPriceRef.current = null;
    }
  }, [
    winningPrice,
    proximity.isApproachingFloor,
    proximity.isBreached,
    proximity.effectiveFloorPrice,
    proximity.distanceToFloorEGP,
    product?.id,
    currency
  ]);

  const handleLockFloorPrice = () => {
    const safeFloor = proximity.effectiveFloorPrice;
    const updatedGuardrails = pricingPlan.platformGuardrails.map(g => ({
      ...g,
      isFloorPriceLocked: true,
      actualSellingPrice: Math.max(g.minAllowedPrice, safeFloor, g.actualSellingPrice),
    }));
    const updatedPlan: ProductPricingPlan = {
      ...pricingPlan,
      platformGuardrails: updatedGuardrails,
      suggestedOptimalPrice: Math.max(safeFloor, pricingPlan.suggestedOptimalPrice),
      lastModifiedAt: 'الآن (قفل أمان فوري)',
      modifiedBy: 'صمام الأمان التلقائي 🛡️'
    };
    saveStoredPricingPlan(updatedPlan);
    setPricingPlan(updatedPlan);
    if (winningPrice < safeFloor) {
      onApplyWinningPrice(safeFloor, selectedDiscount);
    }
    playCompetitorStatusSound();
    if (onShowToast) {
      onShowToast(`🛡️ تم تفعيل قفل صمام الأمان وتثبيت الحد الأدنى الآمن (${safeFloor.toLocaleString()} ${currency}) لمنع أي خسارة!`);
    }
  };

  const handleSnapToSafeFloorPrice = () => {
    const safePrice = Math.max(proximity.effectiveFloorPrice, pricingPlan.costPrice + 15);
    onApplyWinningPrice(safePrice, selectedDiscount);
    playCompetitorStatusSound();
    if (onShowToast) {
      onShowToast(`⚡ تم ضبط وتثبيت السعر فوراً عند الحد الأدنى الآمن (${safePrice.toLocaleString()} ${currency})!`);
    }
  };

  const filteredOffers = merchantOffers.filter(offer => {
    if (filterPlatform === 'all') return true;
    return offer.platform === filterPlatform;
  });

  const [isExportingCompetitors, setIsExportingCompetitors] = useState(false);

  const handleExportCompetitors = (format: 'xlsx' | 'csv') => {
    setIsExportingCompetitors(true);
    try {
      const currentMerchantPrice = product.suggestedRetailPrice || winningPrice;
      const result = exportSingleProductCompetitorsToSpreadsheet(
        product.title,
        currentMerchantPrice,
        filteredOffers,
        format,
        currency
      );
      if (onShowToast) {
        onShowToast(`📊 تم تصدير قائمة أسعار المنافسين (${result.rowCount} منافس) بصيغة ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Competitor export error:', err);
    } finally {
      setIsExportingCompetitors(false);
    }
  };

  const discountPresets = [
    { value: 2, label: '-2%', desc: 'أقل بفارق بسيط' },
    { value: 5, label: '-5%', desc: 'الخيار الذهبي (Buy Box)' },
    { value: 10, label: '-10%', desc: 'خصم هجومي قوي' },
    { value: 15, label: '-15%', desc: 'تصفية سريعة' },
  ];

  return (
    <div className="space-y-6 w-full max-w-full px-4 sm:px-0 overflow-hidden">
      
      {/* Prominent High-Priority Alert Banner: Price Approaching Floor Protection */}
      {(proximity.isApproachingFloor || proximity.isBreached) && (
        <div
          id="floor-proximity-alert-banner"
          className={`w-full max-w-full px-4 py-4 sm:p-6 rounded-3xl border-2 shadow-2xl relative overflow-hidden transition-all ${
            proximity.isBreached
              ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-rose-500/80 text-white shadow-rose-950/60 ring-2 ring-rose-500/40'
              : 'bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-sky-500/80 text-white shadow-sky-950/60 ring-2 ring-sky-500/40'
          }`}
        >
          <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
            proximity.isBreached ? 'bg-rose-500/30' : 'bg-sky-500/30'
          }`} />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  proximity.isBreached
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/50'
                    : 'bg-sky-500 text-slate-950 shadow-sky-500/50'
                }`}>
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      proximity.isBreached
                        ? 'bg-rose-500 text-white'
                        : 'bg-sky-400 text-slate-950'
                    }`}>
                      {proximity.isBreached ? '🚨 إنذار حرج — كسر صمام الأمان' : '⚠️ تنبيه صمام الأمان — اقتراب حرج'}
                    </span>
                    <span className="text-xs text-slate-300 font-bold">
                      وحدة PricingGuardrailsManager نشطة • ({proximity.platformName})
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black font-['Alexandria'] text-white mt-1">
                    {proximity.statusHeadlineAr}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-radar-whatsapp-autoreprice"
                  onClick={() => {
                    const lowestComp = filteredOffers.find(o => o.price === lowestPrice) || filteredOffers[0] || null;
                    setSelectedWhatsAppCompetitor(lowestComp);
                    setIsWhatsAppRepriceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-700/30 cursor-pointer border border-emerald-400/40"
                  title="إرسال تنبيه واتساب فوري وتعديل السعر تلقائياً بنقرة واحدة"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-200" />
                  <span>📱 إشعار واتساب وتعديل السعر (Auto-Reprice)</span>
                </button>

                <button
                  type="button"
                  id="btn-radar-lock-floor-now"
                  onClick={handleLockFloorPrice}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                  title="قفل وتثبيت السعر عند الحد الأدنى الآمن لمنع أي تآكل في الأرباح"
                >
                  <Lock className="w-4 h-4" />
                  <span>🔒 تفعيل قفل صمام الأمان فوراً</span>
                </button>

                <button
                  type="button"
                  id="btn-radar-snap-floor-now"
                  onClick={handleSnapToSafeFloorPrice}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition border border-white/20 cursor-pointer"
                  title="رفع السعر التنافسي إلى الحد الأدنى المحمي"
                >
                  <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
                  <span>ضبط عند الحد الآمن ({proximity.effectiveFloorPrice.toLocaleString()} {currency})</span>
                </button>

                <button
                  type="button"
                  id="btn-radar-scroll-to-guardrails"
                  onClick={() => {
                    setIsGuardrailsManagerExpanded(true);
                    setTimeout(() => {
                      const el = document.getElementById('integrated-pricing-guardrails-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-200" />
                  <span>فتح وحدة Guardrails المدمجة ⚙️</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">السعر المستهدف الحالي:</span>
                <span className="text-base font-black font-mono text-white">
                  {winningPrice.toLocaleString()} {currency}
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">الحد الأدنى للحماية (Floor):</span>
                <span className="text-base font-black font-mono text-sky-300">
                  {proximity.effectiveFloorPrice.toLocaleString()} {currency}
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">الفارق المتبقي عن كسر الحماية:</span>
                <span className={`text-base font-black font-mono ${
                  proximity.isBreached ? 'text-rose-400' : 'text-sky-400'
                }`}>
                  {proximity.distanceToFloorEGP > 0 ? `+${proximity.distanceToFloorEGP.toLocaleString()} ${currency}` : `${proximity.distanceToFloorEGP.toLocaleString()} ${currency}`}
                </span>
              </div>

              <div className="bg-black/30 backdrop-blur-md rounded-xl p-2.5 border border-white/5">
                <span className="text-[10px] text-slate-400 block">حالة درع رأس المال:</span>
                <span className={`text-xs font-black block mt-0.5 ${
                  proximity.isBreached ? 'text-rose-400' : 'text-sky-300'
                }`}>
                  {proximity.isBreached ? 'مخترق (سعر خطر)' : `هامش حرج (${proximity.proximityPercent.toFixed(1)}%)`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
              {proximity.statusExplanationAr}
            </p>
          </div>
        </div>
      )}

      {/* Spotlight: 1-Click Lowest Price Winning Box (البوكس الرئيسي للتسعير التنافسي) */}
      <div className="w-full max-w-full px-4 py-4 sm:p-6 lg:p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-500/30 relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Header row */}
          <div className="flex flex-col gap-4 border-b-2 border-[#000000] pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] text-[#000000] text-[11px] font-bold border-2 border-[#000000] flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#000000]" />
                    رادار التسعير التنافسي الذكي
                  </span>
                  <span className="text-xs text-[#000000] font-semibold">
                    السوق المصري • محدث الآن
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black font-['Cairo','Alexandria'] text-[#000000]">
                  {product.title}
                </h2>
                <p className="text-xs text-[#000000]">
                  الماركة: <strong className="font-extrabold">{product.brand}</strong> | الموديل: <strong className="font-extrabold">{product.model}</strong> | الباركود: <strong className="font-mono">{product.barcode || '62288990011'}</strong>
                </p>
              </div>

              {/* Product Thumbnail & SKU Badge */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 rounded-2xl border-2 border-[#000000] shrink-0 self-start lg:self-center">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-13 h-13 rounded-xl object-cover border-2 border-[#000000]"
                />
                <div className="text-right">
                  <div className="text-[10px] text-[#000000] font-bold">رمز المنتج (SKU)</div>
                  <div className="text-xs font-mono font-extrabold text-[#000000]">{product.sku || 'SKU-EG-8821'}</div>
                  <div className="text-[11px] font-bold text-[#000000] mt-0.5">ثقة التطابق 99.2%</div>
                </div>
              </div>
            </div>

            {/* Cleanly Aligned Horizontal Action Bar for Quick Radar Tools */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t-2 border-[#000000]">
              {onOpenBestSellersModal && (
                <button
                  type="button"
                  id="btn-radar-open-bestsellers-modal"
                  onClick={onOpenBestSellersModal}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="عرض قائمة أفضل المنتجات مبيعاً على المنصات وإضافتها لقائمة المتابعة بضغطة زر"
                >
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span>أفضل المنتجات مبيعاً (Best Sellers) 🔥</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('competitor-price-history-chart-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                title="النزول مباشرة للرسم البياني التفاعلي لتاريخ تغيرات أسعار المنافسين وسلوك السوق"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>تاريخ وسلوك الأسعار 📉</span>
              </button>

              {onOpenSalesDashboard && (
                <button
                  type="button"
                  onClick={onOpenSalesDashboard}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="فتح لوحة تحكم أداء المبيعات ومقارنتها بتغير أسعار المنافسين"
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>لوحة أداء المبيعات 📈</span>
                </button>
              )}

              {onOpenProfitSimulator && (
                <button
                  type="button"
                  onClick={onOpenProfitSimulator}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="فتح محاكي الربح المستقبلي والنمذجة التنبؤية لاستراتيجيات التسعير"
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>محاكي الربح المستقبلي 💎</span>
                </button>
              )}

              {onOpenPeriodicReports && (
                <button
                  type="button"
                  onClick={onOpenPeriodicReports}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="عرض تقارير الأداء الدورية ورسوم الـ Buy Box البيانية المتقدمة"
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>تقارير الأداء والـ Buy Box 📊</span>
                </button>
              )}

              {onOpenBulkReprice && (
                <button
                  type="button"
                  onClick={onOpenBulkReprice}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="التحديث الجماعي للأسعار لكافة المنتجات أو رفع ملف CSV"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span>التحديث الجماعي (CSV) 🚀</span>
                </button>
              )}

              {onOpenStudio && (
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="فتح استوديو تصميم زوايا المنتج والكاميرا"
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>استوديو الكاميرا والزوايا 📸</span>
                </button>
              )}

              {onToggleWatchlist && (
                <button
                  type="button"
                  onClick={() => onToggleWatchlist(product)}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                >
                  <Bookmark className="w-3.5 h-3.5 shrink-0" />
                  <span>{isWatchlisted ? 'في قائمة المتابعة ✓' : 'حفظ بالمتابعة'}</span>
                </button>
              )}

              <button
                type="button"
                id="btn-radar-whatsapp-autoreprice-top"
                onClick={() => {
                  const lowestComp = filteredOffers.find(o => o.price === lowestPrice) || filteredOffers[0] || null;
                  setSelectedWhatsAppCompetitor(lowestComp);
                  setIsWhatsAppRepriceModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-600 text-xs font-black whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="نظام تنبيهات واتساب الفوري والتعديل التلقائي للسعر (Auto-Repricing)"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>تنبيهات واتساب والتسعير التلقائي ⚡</span>
              </button>

              {onOpenAlertModal && (
                <button
                  type="button"
                  onClick={() => onOpenAlertModal(product)}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5 shrink-0" />
                  <span>تنبيهات السعر</span>
                </button>
              )}

              {onArchiveProduct && (
                <button
                  type="button"
                  id="btn-radar-archive-product"
                  onClick={() => onArchiveProduct(product)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    onArchiveProduct(product);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-rose-50 text-[#000000] hover:text-rose-700 border-2 border-[#000000] hover:border-rose-400 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer active:scale-95"
                  title="أرشفة هذا المنتج وعزله عن القوائم النشطة (يدعم السحب والإفلات)"
                >
                  <Archive className="w-3.5 h-3.5 shrink-0" />
                  <span>أرشفة الصنف 🗄️</span>
                </button>
              )}
            </div>
          </div>

          {/* Pricing Intelligence Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: Current Lowest Market Price */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm space-y-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-400" />
                أرخص سعر منافس في السوق المصري
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-sky-300">
                  {lowestPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-300">{currency}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                لدى: <strong className="text-white">{lowestOffer?.merchantName}</strong> ({lowestOffer?.deliveryTime})
              </div>
            </div>

            {/* Box 2: Wholesale Cost Reference */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm space-y-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                تكلفة الجملة المقدرة (شارع عبد العزيز / البستان)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-300">
                  {wholesaleCost.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-300">{currency}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                أقل كمية طلب: <strong className="text-white">3-5 قطع كاش</strong>
              </div>
            </div>

            {/* Box 3: Your Winning Undercut Price (التسعير الذكي لتاجرنا) */}
            <div className={`border-2 rounded-2xl p-4 backdrop-blur-md space-y-1.5 shadow-lg transition-all ${
              proximity.isBreached
                ? 'bg-rose-500/20 border-rose-400/80 shadow-rose-950/40'
                : proximity.isApproachingFloor
                ? 'bg-sky-500/20 border-sky-400/80 shadow-sky-950/40'
                : 'bg-emerald-500/15 border-emerald-400/60 shadow-emerald-950/40'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                  proximity.isBreached ? 'text-rose-200' : proximity.isApproachingFloor ? 'text-sky-200' : 'text-emerald-300'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 animate-pulse ${
                    proximity.isBreached ? 'text-rose-400' : proximity.isApproachingFloor ? 'text-sky-400' : 'text-emerald-400'
                  }`} />
                  سعر بيعك الرابح المقترح (أقل من أرخص منافس)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  proximity.isBreached
                    ? 'bg-rose-600 text-white'
                    : proximity.isApproachingFloor
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                }`}>
                  {proximity.isBreached
                    ? '🚨 كسر الحد الأدنى!'
                    : proximity.isApproachingFloor
                    ? `⚠️ اقتراب من الحد (+${proximity.distanceToFloorEGP} ج.م)`
                    : '🛡️ محمي'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-black ${
                  proximity.isBreached ? 'text-rose-300' : proximity.isApproachingFloor ? 'text-sky-300' : 'text-emerald-400'
                }`}>
                  {winningPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-200">{currency}</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md mr-auto">
                  وفر للزبون {discountSavingsAmount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="text-[11px] text-slate-200 flex items-center justify-between">
                <span>صافي ربحك: <strong>+{profitMargin.toLocaleString()} {currency}</strong></span>
                <span className="font-bold">الحد الأدنى: {proximity.effectiveFloorPrice.toLocaleString()} {currency}</span>
              </div>
            </div>

          </div>

          {/* 1-Click Undercut & Discount Selector Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            
            {/* Discount Percent Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3 h-3 text-indigo-400 shrink-0" />
                اختر نسبة الخصم المرغوبة تحت أرخص منافس (مع فحص صمام الأمان الفوري):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto scroller-sm pb-1">
                {discountPresets.map((preset) => {
                  const presetPrice = Math.round(lowestPrice * (1 - preset.value / 100));
                  const presetProx = checkPriceFloorProximity(
                    presetPrice,
                    pricingPlan,
                    filterPlatform !== 'all' ? filterPlatform : undefined
                  );
                  const isSelected = selectedDiscount === preset.value;

                  return (
                    <button
                      key={preset.value}
                      onClick={() => setSelectedDiscount(preset.value)}
                      className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 justify-center shrink-0 ${
                        isSelected
                          ? presetProx.isBreached
                            ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                            : presetProx.isApproachingFloor
                            ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/30 ring-1 ring-sky-300'
                            : 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                          : presetProx.isBreached
                          ? 'bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-500/50'
                          : presetProx.isApproachingFloor
                          ? 'bg-sky-950/60 hover:bg-sky-900/70 text-sky-200 border border-sky-500/50'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                      title={
                        presetProx.isBreached
                          ? `تنبيه: خصم ${preset.label} يجعل السعر (${presetPrice} ج.م) أقل من الحد الأدنى للحماية (${presetProx.effectiveFloorPrice} ج.م)!`
                          : presetProx.isApproachingFloor
                          ? `تنبيه: خصم ${preset.label} يجعل السعر (${presetPrice} ج.م) يقترب من الحد الأدنى للحماية!`
                          : `خصم آمن (${presetPrice} ج.م)`
                      }
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] opacity-75 hidden md:inline">({preset.desc})</span>
                      {presetProx.isBreached && <span className="text-[10px]">🚨</span>}
                      {!presetProx.isBreached && presetProx.isApproachingFloor && <span className="text-[10px]">⚠️</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* 1-Click Reprice & Apply Button - High Contrast Emerald */}
              <button
                onClick={() => onApplyWinningPrice(winningPrice, selectedDiscount)}
                className="h-9 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs whitespace-nowrap flex items-center gap-1.5 justify-center shadow-lg shadow-emerald-600/30 border border-emerald-500/50 transition-all cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-white fill-white shrink-0" />
                <span>اعتماد السعر ({winningPrice.toLocaleString()} {currency}) وتجهيز النشر</span>
              </button>

              {/* Generate Shipping Waybill Button for Active Product */}
              {onOpenGenerateWaybillModal && product && (
                <button
                  type="button"
                  onClick={() => onOpenGenerateWaybillModal(product)}
                  className="h-9 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-300 hover:text-emerald-200 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 justify-center shadow-md border border-emerald-500/40 transition-all cursor-pointer shrink-0"
                  title="توليد بوليصة شحن فورية لهذا المنتج وجدولتها وربطها بالمخزون"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>توليد بوليصة شحن 🚚</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Smart Dynamic Pricing & Profit Guardrails Autopilot Engine (التسعير الديناميكي الذكي المرتبط بقواعد حماية الأرباح) */}
      <SmartDynamicPricingPanel
        product={product}
        allProducts={allProducts}
        currency={currency}
        onAutoAdjustProductPrice={(productId, newMerchantPrice, updatedCompetitorPrice, competitorName, reasonLabel) => {
          if (onAutoAdjustProductPrice) {
            onAutoAdjustProductPrice(productId, newMerchantPrice, updatedCompetitorPrice, competitorName, reasonLabel);
          } else {
            onApplyWinningPrice(newMerchantPrice, selectedDiscount);
          }
        }}
        onBulkAutoAdjustAllProducts={onBulkAutoAdjustAllProducts}
        onNavigateToGuardrails={() => {
          setIsGuardrailsManagerExpanded(true);
          setTimeout(() => {
            const el = document.getElementById('integrated-pricing-guardrails-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onShowToast={onShowToast}
      />

      {/* Integrated PricingGuardrailsManager Unit inside CompetitorRadar (وحدة صمام أمان وحدود التسعير المدمجة) */}
      <div
        className={`w-full max-w-full px-4 py-4 sm:p-6 lg:p-7 bg-white rounded-3xl border shadow-sm space-y-5 transition-all overflow-hidden ${
          proximity.isBreached
            ? 'border-rose-300 ring-2 ring-rose-500/20'
            : proximity.isApproachingFloor
            ? 'border-sky-300 ring-2 ring-sky-500/20'
            : 'border-slate-200'
        }`}
        id="integrated-pricing-guardrails-section"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              proximity.isBreached
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : proximity.isApproachingFloor
                ? 'bg-sky-100 text-sky-700 border border-sky-300'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                  وحدة صمام أمان وحدود التسعير المدمجة (Pricing Guardrails Manager)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                  proximity.isBreached
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : proximity.isApproachingFloor
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {proximity.isBreached
                    ? '🚨 خطر كسر الحد الأدنى!'
                    : proximity.isApproachingFloor
                    ? `⚠️ اقتراب من الحد الأدنى (+${proximity.distanceToFloorEGP} ج.م)`
                    : '🛡️ درع الحماية نشط ومؤمّن'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة فورية للحد الأدنى الحرج (Floor Price) والحد الأقصى (Ceiling Price) وأقفال حماية رأس المال لكل منصة مباشرة داخل الرادار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(proximity.isApproachingFloor || proximity.isBreached) && (
              <button
                type="button"
                onClick={handleLockFloorPrice}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>قفل وحماية الحد الأدنى</span>
              </button>
            )}
            <button
              type="button"
              id="btn-toggle-expand-guardrails-manager"
              onClick={() => setIsGuardrailsManagerExpanded(!isGuardrailsManagerExpanded)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isGuardrailsManagerExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>طي وحدة Guardrails</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>عرض وتعديل حدود الحماية الكاملة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Strip when collapsed */}
        {!isGuardrailsManagerExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">تكلفة الجملة الفعلية (Cost):</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {pricingPlan.costPrice.toLocaleString('ar-EG')} {currency}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">الحد الأدنى للحماية (Floor):</span>
              <span className="text-sm font-black text-rose-700 font-mono">
                {proximity.effectiveFloorPrice.toLocaleString('ar-EG')} {currency}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">الحد الأقصى (Ceiling):</span>
              <span className="text-sm font-black text-indigo-700 font-mono">
                {pricingPlan.globalMaxPrice.toLocaleString('ar-EG')} {currency}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">الفارق عن الحد الأدنى:</span>
              <span className={`text-sm font-black font-mono ${
                proximity.isBreached ? 'text-rose-600' : proximity.isApproachingFloor ? 'text-sky-600' : 'text-emerald-600'
              }`}>
                {proximity.distanceToFloorEGP > 0 ? `+${proximity.distanceToFloorEGP.toLocaleString('ar-EG')}` : proximity.distanceToFloorEGP.toLocaleString('ar-EG')} {currency} ({proximity.proximityPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Full Embedded PricingGuardrailsManager */}
        {isGuardrailsManagerExpanded && (
          <div className="pt-2">
            <PricingGuardrailsManager
              products={allProducts.length > 0 ? allProducts : [product]}
              selectedProduct={product}
              currency={currency}
              onSelectProduct={(prod) => {
                if (onSelectProduct) onSelectProduct(prod);
              }}
              onAutoAdjustProductPrice={onAutoAdjustProductPrice}
              onBulkAutoAdjustAllProducts={onBulkAutoAdjustAllProducts}
              onShowToast={onShowToast}
              onNavigateToSimulator={onOpenProfitSimulator}
              hideDynamicPricingPanel={true}
            />
          </div>
        )}
      </div>

      {/* Embedded Profit Margin & Operational Fees Calculator (آلة حاسبة لهامش الربح والرسوم وتقارير الأداء) */}
      <ProfitMarginCalculator
        product={product}
        currency={currency}
        winningPrice={winningPrice}
        selectedDiscount={selectedDiscount}
        onApplyCustomPrice={(price) => {
          onApplyWinningPrice(price, selectedDiscount);
          if (onShowToast) onShowToast(`تم اعتماد السعر ${price.toLocaleString()} ${currency} وتحديث الرادار`);
        }}
        onShowToast={onShowToast}
      />

      {/* Competitor Price History Interactive Chart (تاريخ تغيرات وسلوك أسعار المنافسين عبر الزمن) */}
      <CompetitorPriceHistoryChart
        product={product}
        currency={currency}
        winningPrice={winningPrice}
        onApplyWinningPrice={onApplyWinningPrice}
        onShowToast={onShowToast}
      />

      {/* Competitor Platforms Comparison Table & Cards (جدول مقارنة المنافسين المباشر) */}
      <div className="w-full max-w-full px-4 py-4 sm:p-6 lg:p-7 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md space-y-5 text-slate-100 overflow-hidden" id="competitor-comparison-table-section">
        
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-white font-['Alexandria']">
                جدول مقارنة المنافسين المباشر (Direct Competitor Live Table)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مقارنة فورية لأعمدة (اسم المنافس، سعر البيع الحالي، مدة الشحن، تقييم البائع) مع تظليل تلقائي ذكي لأفضل سعر في مصر
            </p>
          </div>

          {/* Platform Filters & Export */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {onOpenChannelCompetitorImport && (
                <button
                  type="button"
                  onClick={() => onOpenChannelCompetitorImport(filterPlatform !== 'all' ? filterPlatform : undefined)}
                  id="btn-radar-import-competitor-csv"
                  className="h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 flex items-center gap-1.5 justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="استيراد قائمة منافسين جديدة عبر ملف CSV لقناة بيع محددة ودمجهم بالرادار فوراً"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>استيراد منافسين (CSV) 📥</span>
                </button>
              )}

              {/* Export Reports Button (Excel .xlsx / CSV via xlsx) */}
              <ExportReportsButton
                onExport={handleExportCompetitors}
                isLoading={isExportingCompetitors}
                count={filteredOffers.length}
                variant="emerald"
                buttonLabel="تصدير التقارير"
                tooltip="تحميل قائمة الأسعار الحالية للمنافسين لهذا المنتج بصيغة Excel أو CSV باستخدام مكتبة xlsx"
              />

              {/* Theme Colors Switcher Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveGlobalSettingsTab('theme');
                  setIsThemeModalOpen(true);
                }}
                id="btn-radar-theme-customize"
                className="h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1.5 justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="تخصيص الألوان الرئيسية لرادار الأسعار ولوحة التحكم (Primary Colors)"
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shrink-0" 
                  style={{ backgroundColor: currentTheme.primaryHex }}
                />
                <Palette className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>ألوان الرادار</span>
              </button>

              {/* Competitor Audio Notifications Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveGlobalSettingsTab('audio');
                  setIsThemeModalOpen(true);
                }}
                id="btn-radar-audio-customize"
                className="h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5 justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                title="تخصيص النغمات الصوتية لتغيرات حالة المنافسين والـ Buy Box"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>نغمات المنافسين 🔊</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scroller-sm">
              <button
                onClick={() => setFilterPlatform('all')}
                className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                  filterPlatform === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>جميع المنصات ({merchantOffers.length})</span>
              </button>
              <button
                onClick={() => setFilterPlatform('amazon_eg')}
                className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                  filterPlatform === 'amazon_eg'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>أمازون مصر</span>
              </button>
              <button
                onClick={() => setFilterPlatform('noon_eg')}
                className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                  filterPlatform === 'noon_eg'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>نون مصر</span>
              </button>
              <button
                onClick={() => setFilterPlatform('jumia_eg')}
                className={`h-8 px-3 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1.5 justify-center transition-all cursor-pointer ${
                  filterPlatform === 'jumia_eg'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>جوميا</span>
              </button>
            </div>
          </div>
        </div>

        {/* Highlight Banner for Best Price */}
        {lowestOffer && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-teal-500/10 border border-emerald-300/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div className="text-xs text-slate-800">
                <span className="font-bold text-emerald-800">أفضل وأقل سعر متاح حالياً بالسوق: </span>
                <span className="font-black text-slate-900 font-mono text-sm">{lowestPrice.toLocaleString()} {currency}</span>
                <span className="text-slate-500 mr-2">لدى ({lowestOffer.merchantName} - {lowestOffer.platformName})</span>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
              مظلل باللون الأخضر والذهبي بالجدول أدناه 👇
            </span>
          </div>
        )}

        {/* Structured Comparison Table or No-Competitors Notice */}
        {filteredOffers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/90 rounded-2xl border border-dashed border-slate-300 space-y-3" id="no-competitors-banner">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100/70 text-sky-800 flex items-center justify-center text-xl shadow-xs">
              🛋️
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 font-['Alexandria']">
                لا توجد عروض منافسين مسجلة لقطعة الأثاث الحالية ({product.title})
              </h4>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                يعمل محرك الرادار بنمط <strong className="text-indigo-700 font-bold">المطابقة الصارم لقطاع الأثاث والمفروشات</strong>. تم تلقائياً استبعاد أي بيانات وهمية أو منتجات خارج تخصص الأثاث. أنت البائع الحصري لهذا المنتج حالياً، أو يمكنك استيراد ملف CSV مخصص بأسعار منافسي الأثاث الفعليين.
              </p>
            </div>
            {onOpenChannelCompetitorImport && (
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChannelCompetitorImport(filterPlatform !== 'all' ? filterPlatform : undefined)}
                  className="h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 justify-center cursor-pointer active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>استيراد أسعار منافسين لقطعة الأثاث (CSV)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto scroller-sm rounded-2xl border border-slate-800 shadow-xl custom-scrollbar">
            <table className="w-full max-w-full text-right border-collapse" id="direct-competitors-table">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-300 text-xs font-black">
                  <th className="py-3.5 px-4">اسم المنافس والمنصة</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">سعر البيع الحالي</th>
                  <th className="py-3.5 px-4">مدة الشحن والتوصيل</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">تقييم البائع</th>
                  <th className="py-3.5 px-4">حالة التوفر والضمان</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">الإجراءات والمقارنة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredOffers.map((offer) => {
                  const isLowest = offer.id === lowestOffer?.id;
                  const diffFromLowest = offer.price - lowestPrice;

                  return (
                    <tr
                      key={offer.id}
                      className={`transition-colors duration-150 ${
                        isLowest
                          ? 'bg-emerald-950/40 hover:bg-emerald-950/60 font-medium'
                          : 'hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      {/* Column 1: Competitor Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 w-full max-w-full">
                          <MerchantLogoBadge
                            logo={offer.merchantLogo}
                            merchantName={offer.merchantName}
                            platformName={offer.platformName}
                          />
                          <div className="min-w-0 w-full max-w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white font-['Alexandria'] truncate max-w-full">
                                <bdi>{offer.merchantName}</bdi>
                              </span>
                              {isLowest && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-2xs flex items-center gap-1 shrink-0">
                                  <span>🏆</span> أفضل سعر (Buy Box)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              <bdi>{offer.platformName}</bdi>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Selling Price with auto-highlighting */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base font-black font-mono ${
                              isLowest ? 'text-emerald-400 text-lg' : 'text-white'
                            }`}>
                              <bdi>{offer.price.toLocaleString()}</bdi>
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">{currency}</span>
                          </div>
                          {diffFromLowest > 0 ? (
                            <span className="text-[10px] font-semibold text-rose-400 block">
                              <bdi>أعلى بـ +{diffFromLowest.toLocaleString()} {currency}</bdi>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 block">
                              ✓ السعر الأرخص بالسوق
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Shipping Duration */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="text-sm shrink-0">🚚</span>
                          <span className="font-medium text-[11px] leading-tight"><bdi>{offer.deliveryTime}</bdi></span>
                        </div>
                        {offer.fulfillmentType && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {offer.fulfillmentType === 'fba' ? 'مستودعات أمازون FBA' : 'شحن بائع مباشر'}
                          </span>
                        )}
                      </td>

                      {/* Column 4: Seller Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sky-500 font-bold"><bdi>⭐ {offer.rating}</bdi></span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            <bdi>({offer.reviewCount.toLocaleString()})</bdi>
                          </span>
                        </div>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-sky-400 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (offer.rating / 5) * 100)}%` }} 
                          />
                        </div>
                      </td>

                      {/* Column 5: Stock Status & Warranty */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const isInStock = stockOverrides[offer.id] !== undefined ? stockOverrides[offer.id] : true;
                          return (
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => handleToggleCompetitorStock(offer)}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap transition-all cursor-pointer border ${
                                  isInStock
                                    ? 'text-emerald-700 bg-emerald-100/70 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border-emerald-200'
                                    : 'text-rose-700 bg-rose-100 hover:bg-emerald-50 hover:text-emerald-700 border-rose-300 animate-pulse'
                                }`}
                                title={isInStock ? "انقر لمحاكاة نفاد مخزون هذا المنافس وإطلاق تنبيه صوتي" : "انقر لإعادة توفر المنتج بالمخزن"}
                              >
                                {isInStock ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>متوفر بالمخزن</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                                    <span>نفد المخزون ⚠️</span>
                                  </>
                                )}
                              </button>
                              {offer.warranty && (
                                <span className="text-[10px] text-slate-500 block leading-tight">
                                  <bdi>🛡️ {offer.warranty}</bdi>
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Column 6: Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWhatsAppCompetitor(offer);
                              setIsWhatsAppRepriceModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/40 cursor-pointer shadow-2xs"
                            title="إرسال تنبيه واتساب فوري وتعديل السعر تلقائياً لهذا المنافس"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>واتساب وتعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuickCompareOffer(offer)}
                            id={`btn-quick-compare-${offer.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-sky-300 text-xs font-bold transition-all border border-sky-500/40 cursor-pointer shadow-2xs"
                            title="مقارنة سريعة لتاريخ تغير سعر هذا المنافس مقابل سعرك خلال الأسبوع الماضي"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                            <span>مقارنة سريعة</span>
                          </button>

                          <a
                            href={offer.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 cursor-pointer shadow-2xs"
                          >
                            <span>فتح بالمتجر</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
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

      {/* Product Quick Specs Accordion */}
      <div className="w-full max-w-full px-4 py-4 sm:p-5 bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <button
          onClick={() => setShowAllSpecs(!showAllSpecs)}
          className="w-full flex items-center justify-between text-right cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 font-['Alexandria']">
              المواصفات الفنية المعتمدة للمنتج ({specs.reduce((acc, s) => acc + (s.items?.length || 0), 0)} خاصية)
            </h4>
          </div>
          {showAllSpecs ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showAllSpecs && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specs.map((cat, idx) => (
              <div key={idx} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <h5 className="text-xs font-bold text-indigo-700">{cat.category}</h5>
                <div className="space-y-1.5 text-xs">
                  {(cat.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">{item.label}:</span>
                      <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Competitor 7-Day Price Comparison Modal */}
      {quickCompareOffer && (() => {
        const compBase = quickCompareOffer.price;
        const myCurrentPrice = winningPrice;
        const floorPrice = proximity.effectiveFloorPrice;
        const rawHistory = product.priceHistory || [];
        const now = new Date();

        // Generate 7-day chronological data for this specific competitor vs merchant price
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
          const daysAgo = 6 - i;
          const d = new Date(now);
          d.setDate(d.getDate() - daysAgo);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = daysAgo === 0
            ? 'اليوم'
            : daysAgo === 1
            ? 'أمس'
            : d.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' });

          // Deterministic subtle variance for past 6 days based on competitor ID and day index
          const seed = (quickCompareOffer.id.charCodeAt(0) + i * 7) % 5;
          const compMultipliers = [1.035, 1.028, 1.02, 1.015, 0.995, 1.01, 1.0];
          const myMultipliers = [1.025, 1.02, 1.012, 1.008, 1.0, 1.004, 1.0];

          const matchedRecord = rawHistory.find(
            h => h.date === dateStr && h.merchant && h.merchant.includes(quickCompareOffer.merchantName.split(' ')[0])
          );

          const competitorPrice = daysAgo === 0
            ? compBase
            : matchedRecord
            ? matchedRecord.price
            : Math.round(compBase * (compMultipliers[i] + (seed - 2) * 0.003));

          const merchantPrice = daysAgo === 0
            ? myCurrentPrice
            : Math.round(myCurrentPrice * myMultipliers[i]);

          const diff = merchantPrice - competitorPrice;

          return {
            dateStr,
            dayLabel: dayName,
            competitorPrice,
            merchantPrice,
            floorPrice,
            diff,
            statusLabel: diff < 0 ? 'سعرك أرخص (متفوق)' : diff === 0 ? 'سعر متطابق' : 'المنافس أرخص'
          };
        });

        const minCompWeek = Math.min(...weeklyData.map(d => d.competitorPrice));
        const maxCompWeek = Math.max(...weeklyData.map(d => d.competitorPrice));
        const avgCompWeek = Math.round(weeklyData.reduce((acc, d) => acc + d.competitorPrice, 0) / weeklyData.length);
        const daysMerchantWon = weeklyData.filter(d => d.merchantPrice <= d.competitorPrice).length;
        const suggestedUndercutForThisOffer = Math.max(floorPrice, Math.round(quickCompareOffer.price * (1 - selectedDiscount / 100)));

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setQuickCompareOffer(null)}
          >
            <div
              className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              id="quick-competitor-compare-modal"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <MerchantLogoBadge
                    logo={quickCompareOffer.merchantLogo}
                    merchantName={quickCompareOffer.merchantName}
                    platformName={quickCompareOffer.platformName}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-sky-400" />
                        مقارنة الأسبوع الماضي (آخر 7 أيام)
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        <bdi>{quickCompareOffer.platformName}</bdi>
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria'] mt-1">
                      تاريخ تغير سعر ({quickCompareOffer.merchantName}) مقابل سعرك
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickCompareOffer(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                  title="إغلاق نافذة المقارنة السريعة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3 space-y-1">
                  <span className="text-[11px] text-slate-400 block">سعر المنافس الحالي:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-sky-400">
                      {quickCompareOffer.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400">{currency}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    متوسط الأسبوع: {avgCompWeek.toLocaleString()} {currency}
                  </span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3 space-y-1">
                  <span className="text-[11px] text-slate-400 block">سعرك التنافسي الحالي:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {myCurrentPrice.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400">{currency}</span>
                  </div>
                  <span className={`text-[10px] font-bold block ${
                    myCurrentPrice <= quickCompareOffer.price ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {myCurrentPrice < quickCompareOffer.price
                      ? `أقل بـ ${(quickCompareOffer.price - myCurrentPrice).toLocaleString()} ${currency} ✓`
                      : myCurrentPrice > quickCompareOffer.price
                      ? `أعلى بـ +${(myCurrentPrice - quickCompareOffer.price).toLocaleString()} ${currency}`
                      : 'مساوٍ لسعر المنافس'}
                  </span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3 space-y-1">
                  <span className="text-[11px] text-slate-400 block">نطاق المنافس (7 أيام):</span>
                  <div className="text-xs font-black font-mono text-slate-200">
                    {minCompWeek.toLocaleString()} - {maxCompWeek.toLocaleString()} {currency}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    تذبذب أسبوعي: {(maxCompWeek - minCompWeek).toLocaleString()} {currency}
                  </span>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3 space-y-1">
                  <span className="text-[11px] text-slate-400 block">تفوقك السعري بالأسبوع:</span>
                  <div className="text-base font-black text-emerald-400">
                    {daysMerchantWon} من 7 أيام 🏆
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    الحد الأدنى الآمن: {floorPrice.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* 7-Day Line Chart */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>منحنى مقارنة السعر اليومي (الأسبوع الماضي)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-sky-300 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                      سعر {quickCompareOffer.merchantName}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                      سعرك ({myCurrentPrice.toLocaleString()} {currency})
                    </span>
                  </div>
                </div>

                <div className="h-60 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={220}>
                    <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="dayLabel"
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 11 }}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `${val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          direction: 'rtl',
                          textAlign: 'right'
                        }}
                        formatter={(value: any, name: string) => [
                          `${Number(value).toLocaleString()} ${currency}`,
                          name === 'competitorPrice' ? `سعر ${quickCompareOffer.merchantName}` : 'سعرك'
                        ]}
                      />
                      <Legend
                        formatter={(value) =>
                          value === 'competitorPrice' ? `سعر ${quickCompareOffer.merchantName}` : 'سعرك الحالي'
                        }
                      />
                      <ReferenceLine
                        y={floorPrice}
                        stroke="#f43f5e"
                        strokeDasharray="4 4"
                        label={{
                          value: `الحد الأدنى الآمن (${floorPrice})`,
                          fill: '#fb7185',
                          fontSize: 10,
                          position: 'insideBottomLeft'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="competitorPrice"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="merchantPrice"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Breakdown Compact Table */}
              <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">اليوم</th>
                      <th className="py-2.5 px-3">سعر المنافس</th>
                      <th className="py-2.5 px-3">سعرك</th>
                      <th className="py-2.5 px-3">الفارق السعري</th>
                      <th className="py-2.5 px-3">الوضع التنافسي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {weeklyData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-slate-200">{row.dayLabel}</td>
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">
                          {row.competitorPrice.toLocaleString()} {currency}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                          {row.merchantPrice.toLocaleString()} {currency}
                        </td>
                        <td className={`py-2 px-3 font-mono font-bold ${
                          row.diff <= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {row.diff > 0 ? `+${row.diff.toLocaleString()}` : row.diff.toLocaleString()} {currency}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.diff < 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : row.diff === 0
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {row.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onApplyWinningPrice(suggestedUndercutForThisOffer, selectedDiscount);
                    if (onShowToast) {
                      onShowToast(`⚡ تم اعتماد سعر (${suggestedUndercutForThisOffer.toLocaleString()} ${currency}) للتفوق على [${quickCompareOffer.merchantName}]!`);
                    }
                    setQuickCompareOffer(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/25"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>اعتماد سعر التفوق على هذا المنافس ({suggestedUndercutForThisOffer.toLocaleString()} {currency})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickCompareOffer(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* WhatsApp Automated Alert & 1-Click Auto-Reprice Modal */}
      <WhatsAppAutoRepriceModal
        isOpen={isWhatsAppRepriceModalOpen}
        onClose={() => setIsWhatsAppRepriceModalOpen(false)}
        product={product}
        pricingPlan={pricingPlan}
        competitorOffer={selectedWhatsAppCompetitor || filteredOffers.find(o => o.price === lowestPrice) || filteredOffers[0] || null}
        onApplyReprice={(prodId, newPrice, compName, reason) => {
          if (onAutoAdjustProductPrice) {
            onAutoAdjustProductPrice(prodId, newPrice, undefined, compName, reason);
          } else {
            onApplyWinningPrice(newPrice, selectedDiscount);
          }
          if (onShowToast) {
            onShowToast(`⚡ تم التعديل التلقائي للسعر إلى (${newPrice.toLocaleString()} ${currency}) بنجاح!`);
          }
        }}
      />

    </div>
  );
};
