import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  X,
  ArrowUpRight,
  ShoppingBag,
  Building2,
  Zap,
  BellRing,
  Plus,
  Layers,
  Eye,
  Volume2,
  Check,
  Award,
  DollarSign,
  PackageCheck,
  Bookmark,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, WatchlistItem } from '../types';
import {
  BEST_SELLER_CATEGORIES,
  PROACTIVE_BEST_SELLER_RECOMMENDATIONS} from '../data/bestSellerRecommendationsData';
import { BestSellerRecommendation } from '@/data/BestSellerRecommendation';

interface ProactiveBestSellerAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProducts: ProductData[];
  watchlist?: WatchlistItem[];
  onToggleWatchlist?: (product: ProductData) => void;
  onBulkAddToWatchlist?: (products: ProductData[]) => void;
  onAddAndInspectProduct: (product: ProductData) => void;
  onBulkAddRecommendations: (products: ProductData[]) => void;
  onPlayAlertSound?: () => void;
  onShowToast?: (msg: string) => void;
  currency?: string;
}

const SESSION_ALERT_SEEN_KEY = 'merchant_radar_bestseller_alert_seen_session_v1';
const AUTO_ALERT_PREF_KEY = 'merchant_radar_bestseller_auto_alert_enabled_v1';

export function isBestSellerAutoAlertEnabled(): boolean {
  try {
    const raw = localStorage.getItem(AUTO_ALERT_PREF_KEY);
    if (raw === null) return true; // Enabled by default so user gets alerted immediately on app entry
    return JSON.parse(raw) === true;
  } catch {
    return true;
  }
}

export function setBestSellerAutoAlertEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_ALERT_PREF_KEY, JSON.stringify(enabled));
  } catch {
    // ignore
  }
}

export function hasSeenBestSellerAlertThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_ALERT_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markBestSellerAlertSeenThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_ALERT_SEEN_KEY, 'true');
  } catch {
    // ignore
  }
}

export const ProactiveBestSellerAlertModal: React.FC<ProactiveBestSellerAlertModalProps> = ({
  isOpen,
  onClose,
  existingProducts,
  watchlist = [],
  onToggleWatchlist,
  onBulkAddToWatchlist,
  onAddAndInspectProduct,
  onBulkAddRecommendations,
  onPlayAlertSound,
  onShowToast,
  currency = 'EGP'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoAlertOnEntry, setAutoAlertOnEntry] = useState<boolean>(() => isBestSellerAutoAlertEnabled());
  const [justAddedIds, setJustAddedIds] = useState<string[]>([]);
  const [justWatchlistedIds, setJustWatchlistedIds] = useState<string[]>([]);

  const existingIdsSet = useMemo(() => {
    return new Set((existingProducts || []).map(p => p.id));
  }, [existingProducts]);

  const watchlistedIdsSet = useMemo(() => {
    return new Set((watchlist || []).map(w => w.productId));
  }, [watchlist]);

  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') {
      return PROACTIVE_BEST_SELLER_RECOMMENDATIONS;
    }
    return PROACTIVE_BEST_SELLER_RECOMMENDATIONS.filter(item => item.categoryKey === selectedCategory);
  }, [selectedCategory]);

  // Calculate aggregate stats across all recommended best-sellers
  const totalDailyUnits = useMemo(
    () => PROACTIVE_BEST_SELLER_RECOMMENDATIONS.reduce((sum, r) => sum + r.dailySalesEstimate, 0),
    []
  );
  const avgMarginPct = useMemo(
    () =>
      Math.round(
        PROACTIVE_BEST_SELLER_RECOMMENDATIONS.reduce((sum, r) => sum + r.expectedProfitMarginPercent, 0) /
          PROACTIVE_BEST_SELLER_RECOMMENDATIONS.length
      ),
    []
  );

  useEffect(() => {
    if (isOpen && onPlayAlertSound) {
      try {
        onPlayAlertSound();
      } catch {
        // safe
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAutoAlert = () => {
    const next = !autoAlertOnEntry;
    setAutoAlertOnEntry(next);
    setBestSellerAutoAlertEnabled(next);
    if (onShowToast) {
      onShowToast(
        next
          ? 'تم تفعيل الإنذار التلقائي للمنتجات الأكثر مبيعاً فور فتح التطبيق 🔔🔥'
          : 'تم إيقاف ظهور الإنذار التلقائي عند الدخول (يمكنك فتحه في أي وقت من الشريط العلوي)'
      );
    }
  };

  const handleAddSingle = (rec: BestSellerRecommendation, inspectImmediately: boolean) => {
    setJustAddedIds(prev => Array.from(new Set([...prev, rec.product.id])));
    if (inspectImmediately) {
      onAddAndInspectProduct(rec.product);
      onClose();
    } else {
      onBulkAddRecommendations([rec.product]);
    }
  };

  const handleWatchlistSingle = (rec: BestSellerRecommendation) => {
    const isCurrentlyInWatchlist = watchlistedIdsSet.has(rec.product.id);
    if (!isCurrentlyInWatchlist) {
      setJustWatchlistedIds(prev => Array.from(new Set([...prev, rec.product.id])));
    } else {
      setJustWatchlistedIds(prev => prev.filter(id => id !== rec.product.id));
    }

    // Also ensure product is in catalog so watchlist references work seamlessly
    if (!existingIdsSet.has(rec.product.id)) {
      onBulkAddRecommendations([rec.product]);
      setJustAddedIds(prev => Array.from(new Set([...prev, rec.product.id])));
    }

    if (onToggleWatchlist) {
      onToggleWatchlist(rec.product);
    }
  };

  const handleBulkWatchlistAll = () => {
    const allProds = PROACTIVE_BEST_SELLER_RECOMMENDATIONS.map(r => r.product);
    onBulkAddRecommendations(allProds);
    setJustAddedIds(allProds.map(p => p.id));
    setJustWatchlistedIds(allProds.map(p => p.id));

    if (onBulkAddToWatchlist) {
      onBulkAddToWatchlist(allProds);
    } else if (onToggleWatchlist) {
      allProds.forEach(prod => {
        if (!watchlistedIdsSet.has(prod.id)) {
          onToggleWatchlist(prod);
        }
      });
    }

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe
    }
  };

  const handleAddAllCategories = () => {
    const allProds = PROACTIVE_BEST_SELLER_RECOMMENDATIONS.map(r => r.product);
    onBulkAddRecommendations(allProds);
    setJustAddedIds(allProds.map(p => p.id));
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // safe
    }
    if (onShowToast) {
      onShowToast(
        `🔥 تم استيراد وإضافة ${allProds.length} منتجات من الأكثر مبيعاً في جميع الفئات إلى رادار متجرك بنجاح!`
      );
    }
    onClose();
  };

  return (
    <div
      id="modal-proactive-bestseller-alert"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      dir="rtl"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        {/* Top Glowing Alert Header */}
        <div className="bg-gradient-to-l from-sky-950/90 via-slate-900 to-rose-950/80 p-5 sm:p-6 border-b border-sky-500/30 relative overflow-hidden shrink-0">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0 border border-sky-300/40">
                <BellRing className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 text-[11px] font-black">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>منتجات التريند والأعلى مبيعات (الصين 👈 مصر)</span>
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    🇨🇳 كتالوج استيرادي منسق لـ 6 فئات تجارية رابحة
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white font-['Alexandria'] flex items-center gap-2 flex-wrap">
                  <span>منتجات التريند والأعلى مبيعات (الصين 👈 مصر)</span>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-md">
                    Top Trending Products
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  كتالوج منسق ومحلل تلقائياً للبضائع الاستيرادية الصينية الأكثر طلباً في السوق المصري عبر <strong className="text-sky-300">أمازون مصر، نون، تيك توك شوب، وجوميا</strong>. يغطي: <strong className="text-amber-300">منظمات منزلية، أدوات مطبخ ذكية غير كهربائية، سماعات TWS وملحقات الموبايل، أدوات العناية والتجميل، مستلزمات الأطفال، وإكسسوارات الموضة</strong> بهوامش ربح مؤكدة (+55% إلى +67%).
                </p>
              </div>
            </div>

            {/* Right Controls: Sound test & Close */}
            <div className="flex items-center gap-2 self-end lg:self-start shrink-0">
              {onPlayAlertSound && (
                <button
                  type="button"
                  onClick={onPlayAlertSound}
                  className="h-9 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="تشغيل نغمة إنذار الترشيحات"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">صوت الإنذار</span>
                </button>
              )}

              <button
                type="button"
                id="btn-close-bestseller-alert-modal"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                title="إغلاق نافذة الترشيحات"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">منتجات مترشحة جاهزة</span>
                <span className="text-base sm:text-lg font-black text-sky-400 font-mono">
                  {PROACTIVE_BEST_SELLER_RECOMMENDATIONS.length} منتجات #1
                </span>
              </div>
              <Award className="w-5 h-5 text-sky-400 opacity-80" />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">إجمالي المبيعات اليومية بالسوق</span>
                <span className="text-base sm:text-lg font-black text-rose-400 font-mono">
                  +{totalDailyUnits} قطعة/يوم
                </span>
              </div>
              <Flame className="w-5 h-5 text-rose-400 opacity-80" />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">متوسط العائد فوق الجملة</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  +{avgMarginPct}% صافي
                </span>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400 opacity-80" />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">تغطية أسواق الاستيراد بمصر</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">
                  العتبة • الموسكي • باب الشعرية • إيوو/جوانزو
                </span>
              </div>
              <Building2 className="w-5 h-5 text-amber-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {BEST_SELLER_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.key;
              const count =
                cat.key === 'all'
                  ? PROACTIVE_BEST_SELLER_RECOMMENDATIONS.length
                  : PROACTIVE_BEST_SELLER_RECOMMENDATIONS.filter(r => r.categoryKey === cat.key).length;

              return (
                <button
                  key={cat.key}
                  type="button"
                  id={`btn-bestseller-cat-${cat.key}`}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-400/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Recommendations Grid */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-900/60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecommendations.map(rec => {
              const isAlreadyInCatalog =
                existingIdsSet.has(rec.product.id) || justAddedIds.includes(rec.product.id);
              const isWatchlisted =
                watchlistedIdsSet.has(rec.product.id) || justWatchlistedIds.includes(rec.product.id);

              return (
                <div
                  key={rec.product.id}
                  id={`bestseller-card-${rec.product.id}`}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-lg transition-all group relative overflow-hidden"
                >
                  {/* Top Category & Rank Ribbon */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-700/60 flex items-center gap-1">
                      <span>{rec.categoryBadge}</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      {rec.importOriginBadge}
                    </span>
                  </div>

                  {/* Product Identity */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 relative">
                      <img
                        src={rec.product.imageUrl}
                        alt={rec.product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                        }}
                      />
                      <span className="absolute top-0 right-0 bg-sky-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-bl-md">
                        #{rec.bestSellerRank}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xs sm:text-sm font-black text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors"
                        title={rec.product.title}
                      >
                        {rec.product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>الماركة: <strong className="text-slate-200">{rec.product.brand}</strong></span>
                        <span>•</span>
                        <span className="text-rose-300 font-bold">{rec.urgencyBadge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Why Recommended Box */}
                  <p className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800/90 rounded-xl p-2.5 leading-relaxed">
                    {rec.recommendationReason}
                  </p>

                  {/* Pricing & Profit Breakdown */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">أقل سعر منافس</span>
                      <span className="text-xs font-black text-white font-mono">
                        {rec.product.currentLowestPrice.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 block">تكلفة الجملة</span>
                      <span className="text-xs font-black text-indigo-300 font-mono">
                        {rec.product.estimatedWholesaleCost.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-300 block font-bold">هامش الربح الصافي</span>
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        +{rec.expectedProfitMarginPercent}% (+{rec.netProfitPerUnitEGP.toLocaleString()} {currency})
                      </span>
                    </div>
                  </div>

                  {/* Wholesale Source Info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{rec.supplierStockAlert}</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">
                      نمو +{rec.demandMomentumPercent}%
                    </span>
                  </div>

                  {/* Action Buttons: 1-Click Watchlist + Inspect in Radar */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      id={`btn-watchlist-bestseller-${rec.product.id}`}
                      onClick={() => handleWatchlistSingle(rec)}
                      className={`w-full h-9 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                        isWatchlisted
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400/60 shadow-inner'
                          : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                      }`}
                      title={isWatchlisted ? 'محفوظ في قائمة المتابعة (اضغط للإزالة)' : 'إضافة هذا المنتج لقائمة المتابعة بضغطة زر'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-sky-400 text-sky-400' : 'fill-slate-950 text-slate-950'}`} />
                      <span>{isWatchlisted ? 'في قائمة المتابعة ✓' : 'إضافة لقائمة المتابعة ⭐'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-inspect-bestseller-${rec.product.id}`}
                        onClick={() => handleAddSingle(rec, true)}
                        className="flex-1 h-8.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>فحص وتسعير بالرادار</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-quick-add-bestseller-${rec.product.id}`}
                        onClick={() => handleAddSingle(rec, false)}
                        disabled={isAlreadyInCatalog}
                        className={`h-8.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer active:scale-95 shrink-0 ${
                          isAlreadyInCatalog
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title={isAlreadyInCatalog ? 'مضاف بالفعل في كتالوج متجرك' : 'إضافة سريعة للكتالوج'}
                      >
                        {isAlreadyInCatalog ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>بالكتالوج</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 text-sky-400" />
                            <span>للكتالوج</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 shrink-0">
          {/* Auto-alert toggle preference */}
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAlertOnEntry}
              onChange={handleToggleAutoAlert}
              className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 accent-sky-500 cursor-pointer"
            />
            <span>إظهار نافذة أفضل المنتجات مبيعاً تلقائياً عند فتح التطبيق</span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              تصفح لاحقاً
            </button>

            <button
              type="button"
              id="btn-watchlist-all-bestsellers-now"
              onClick={handleBulkWatchlistAll}
              className="h-10 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-sky-500/20 border border-sky-400 transition-all cursor-pointer active:scale-95"
            >
              <Bookmark className="w-4 h-4 fill-slate-950" />
              <span>إضافة الكل لقائمة المتابعة بضغطة زر ({PROACTIVE_BEST_SELLER_RECOMMENDATIONS.length}) ⭐</span>
            </button>

            <button
              type="button"
              id="btn-import-all-bestsellers-now"
              onClick={handleAddAllCategories}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 border border-emerald-400/50 transition-all cursor-pointer active:scale-95"
            >
              <PackageCheck className="w-4 h-4" />
              <span>اعتماد الكل في الرادار 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
