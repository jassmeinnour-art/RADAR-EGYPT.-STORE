import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Edit3,
  TrendingUp,
  TrendingDown,
  Eye,
  ExternalLink,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ShoppingBag,
  SlidersHorizontal,
  Copy,
  Check,
  Tag,
  Sparkles,
  ArrowRightLeft,
  Box
} from 'lucide-react';
import { MerchantCatalogProduct } from '../types';
import { extractAutoTags } from '../utils/productAutoTagger';
import { calculateProductStockoutMetrics } from '../services/inventoryForecastService';

interface SwipeableProductCardProps {
  product: MerchantCatalogProduct;
  searchQuery?: string;
  isPinned?: boolean;
  isWatchlisted?: boolean;
  onTogglePin: (productId: string) => void;
  onOpenReprice: (product: MerchantCatalogProduct) => void;
  onShowHistory: (product: MerchantCatalogProduct) => void;
  onInspect: (product: MerchantCatalogProduct) => void;
  onToggleWatchlist: (product: MerchantCatalogProduct) => void;
  onMatchBuyBox: (product: MerchantCatalogProduct) => void;
  onToggleRepricer: (product: MerchantCatalogProduct) => void;
  onOpenRuleModal: (product: MerchantCatalogProduct) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onSetTagFilter?: (tag: string) => void;
  onOpenStockForecast?: (product: MerchantCatalogProduct) => void;
}

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <span>{text}</span>;
  try {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5 font-bold shadow-xs">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
};

export const SwipeableProductCard: React.FC<SwipeableProductCardProps> = ({
  product,
  searchQuery = '',
  isPinned = false,
  isWatchlisted = false,
  onTogglePin,
  onOpenReprice,
  onShowHistory,
  onInspect,
  onToggleWatchlist,
  onMatchBuyBox,
  onToggleRepricer,
  onOpenRuleModal,
  onCopy,
  copiedId,
  onSetTagFilter,
  onOpenStockForecast
}) => {
  const x = useMotionValue(0);
  const [swipeFeedback, setSwipeFeedback] = useState<'watchlist' | 'reprice' | null>(null);

  // Calculate AI Stock Depletion Risk Metrics
  const stockMetrics = calculateProductStockoutMetrics(product);

  // Background indicator transforms during swipe drag
  // Positive x (> 0): dragging to the right -> Right Swipe Action (Watchlist)
  // Negative x (< 0): dragging to the left -> Left Swipe Action (Quick Reprice)
  const rightSwipeOpacity = useTransform(x, [20, 100], [0.2, 1]);
  const leftSwipeOpacity = useTransform(x, [-100, -20], [1, 0.2]);
  
  const rightSwipeScale = useTransform(x, [20, 120], [0.8, 1.15]);
  const leftSwipeScale = useTransform(x, [-120, -20], [1.15, 0.8]);

  const isWinning = product.isBuyBoxWinner;
  const isHigher = product.priceGapAmount > 0;
  const autoTags = extractAutoTags(product);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const threshold = 75; // Minimum drag offset to trigger action

    if (info.offset.x > threshold) {
      // Swiped Right -> Send/Toggle Watchlist
      setSwipeFeedback('watchlist');
      onToggleWatchlist(product);
      setTimeout(() => setSwipeFeedback(null), 1200);
    } else if (info.offset.x < -threshold) {
      // Swiped Left -> Open Quick Reprice Modal
      setSwipeFeedback('reprice');
      onOpenReprice(product);
      setTimeout(() => setSwipeFeedback(null), 1200);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl mb-3 shadow-sm select-none border border-slate-200 bg-slate-900">
      
      {/* UNDER-CARD REVEAL BACKGROUND (SWIPE RIGHT: WATCHLIST) */}
      <motion.div
        style={{ opacity: rightSwipeOpacity, scale: rightSwipeScale }}
        className="absolute inset-y-0 right-0 left-1/2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-start pr-6 gap-3 z-0 rounded-l-3xl"
      >
        <div className="flex items-center gap-2 font-black text-sm text-white drop-shadow-md">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-md">
            <Bookmark className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div className="text-right">
            <span className="block text-xs text-emerald-100 font-bold">السحب لليمين</span>
            <span className="text-sm font-black">{isWatchlisted ? 'في المتابعة ⭐' : 'إضافة للمتابعة ⭐'}</span>
          </div>
        </div>
      </motion.div>

      {/* UNDER-CARD REVEAL BACKGROUND (SWIPE LEFT: QUICK REPRICE) */}
      <motion.div
        style={{ opacity: leftSwipeOpacity, scale: leftSwipeScale }}
        className="absolute inset-y-0 left-0 right-1/2 bg-gradient-to-l from-indigo-600 via-purple-600 to-amber-600 text-white flex items-center justify-end pl-6 gap-3 z-0 rounded-r-3xl"
      >
        <div className="flex items-center gap-2 font-black text-sm text-white drop-shadow-md">
          <div className="text-left">
            <span className="block text-xs text-indigo-100 font-bold">السحب لليسار</span>
            <span className="text-sm font-black">تعديل السعر السريع ⚡</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-md">
            <Edit3 className="w-5 h-5 text-amber-300" />
          </div>
        </div>
      </motion.div>

      {/* FOREGROUND SWIPEABLE PRODUCT CARD */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className={`relative z-10 p-4 sm:p-5 bg-white transition-colors border-r-4 ${
          isPinned
            ? 'bg-amber-50/90 border-r-amber-500 shadow-md'
            : (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5)
            ? 'bg-amber-50/40 border-r-amber-500'
            : 'border-r-indigo-600'
        }`}
      >
        {/* SWIPE ACTION FEEDBACK OVERLAY BANNER */}
        {swipeFeedback === 'watchlist' && (
          <div className="mb-3 p-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between gap-2 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>تم تحديث قائمة المتابعة بنجاح ⭐</span>
            </div>
            <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full font-mono">Watchlist Sync</span>
          </div>
        )}

        {swipeFeedback === 'reprice' && (
          <div className="mb-3 p-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-between gap-2 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-300" />
              <span>جاري فتح شاشة تعديل السعر السريع... ⚡</span>
            </div>
            <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded-full font-mono">Quick Reprice</span>
          </div>
        )}

        {/* TOP ROW: Image + Title + Platform Badge + Pin */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
                }}
              />
              {isWatchlisted && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md" title="في قائمة المتابعة">
                  ⭐
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isPinned && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black shrink-0">
                    <Pin className="w-2.5 h-2.5 fill-current rotate-45" />
                    <span>مثبت</span>
                  </span>
                )}
                {product.platform === 'amazon_eg' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
                    <span>🛒</span>
                    <span>أمازون</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 font-bold text-[10px]">
                    <span>🛍️</span>
                    <span>نون</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">{product.brand}</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug" title={product.title}>
                <HighlightedText text={product.title} highlight={searchQuery} />
              </h4>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>SKU: <span className="font-bold text-slate-800">{product.sku}</span></span>
                {product.asin && (
                  <>
                    <span>•</span>
                    <span>ASIN: <span className="font-bold text-indigo-600">{product.asin}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Icons Top Right */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onTogglePin(product.id)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isPinned
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50'
              }`}
              title={isPinned ? 'إلغاء التثبيت' : 'تثبيت بالقمة 📌'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current rotate-45' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onToggleWatchlist(product)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={isWatchlisted ? 'في قائمة المتابعة' : 'إضافة لقائمة المتابعة'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-600 text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* PRICING & BUY BOX COMPARISON BOX */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">سعرك</span>
            <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
              {product.merchantPrice.toLocaleString('ar-EG')}
            </span>
            <span className="text-[9px] text-slate-400 block">ج.م</span>
          </div>

          <div className="border-r border-l border-slate-200/80 px-1">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">أدنى منافس</span>
            <span className="font-mono font-black text-xs sm:text-sm text-sky-600">
              {product.lowestCompetitorPrice.toLocaleString('ar-EG')}
            </span>
            <span className="text-[9px] text-slate-400 block truncate" title={product.lowestCompetitorName}>
              {product.lowestCompetitorName.slice(0, 10)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Buy Box</span>
            <span className="font-mono font-black text-xs sm:text-sm text-indigo-700">
              {product.buyBoxPrice.toLocaleString('ar-EG')}
            </span>
            <span className="text-[9px] font-bold block">
              {isWinning ? <span className="text-emerald-600">فائز 🏆</span> : <span className="text-slate-400 truncate">{product.buyBoxWinner.slice(0, 8)}</span>}
            </span>
          </div>
        </div>

        {/* STATUS BADGES & GAP INDICATOR */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.pricingStatus === 'winning_buybox' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                🏆 فائز بالـ Buy Box
              </span>
            )}
            {product.pricingStatus === 'competitive' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300">
                🟢 سعر منافس
              </span>
            )}
            {product.pricingStatus === 'higher_than_buybox' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-300">
                🟡 أعلى من Buy Box
              </span>
            )}
            {product.pricingStatus === 'needs_repricing' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 animate-pulse">
                🔴 بحاجة لتعديل السعر
              </span>
            )}

            {/* AI STOCK DEPLETION RISK BADGE */}
            <button
              type="button"
              onClick={() => onOpenStockForecast && onOpenStockForecast(product)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition cursor-pointer hover:opacity-80 ${stockMetrics.riskBadge.bg} ${stockMetrics.riskBadge.text} ${stockMetrics.riskBadge.border}`}
              title="اضغط للتحليل والتنبؤ بنفاد المخزون بالذكاء الاصطناعي"
            >
              <span>{stockMetrics.riskBadge.label}</span>
            </button>
          </div>

          <div className="font-mono text-xs">
            {isWinning ? (
              <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>متصدر</span>
              </span>
            ) : isHigher ? (
              <span className="text-rose-600 font-extrabold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{product.priceGapAmount.toLocaleString('ar-EG')} ج.م (+{product.priceGapPercent}%)</span>
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-{product.priceGapAmount} ج.م ({product.priceGapPercent}%)</span>
              </span>
            )}
          </div>
        </div>

        {/* TAGS PILLS */}
        {autoTags.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1 flex-wrap">
            {autoTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onSetTagFilter && onSetTagFilter(tag.label)}
                className={`text-[9px] px-2 py-0.5 rounded-md border font-bold ${tag.badgeBg} ${tag.badgeText} ${tag.badgeBorder}`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {/* BUTTON ACTION BAR */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenReprice(product)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل السعر</span>
            </button>

            {!isWinning && (
              <button
                type="button"
                onClick={() => onMatchBuyBox(product)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300 transition cursor-pointer"
              >
                <span>طابق {product.buyBoxPrice}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenStockForecast && onOpenStockForecast(product)}
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-90 font-bold text-xs transition cursor-pointer shadow-xs"
              title="التنبؤ بنفاد المخزون بالذكاء الاصطناعي"
            >
              <Box className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onShowHistory(product)}
              className="p-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-xs transition cursor-pointer"
              title="عرض سجل الأسعار التاريخي"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onInspect(product)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
              title="فحص عروض المنافسين"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onOpenRuleModal(product)}
              className="p-2 rounded-xl bg-slate-100 text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition cursor-pointer"
              title="قواعد معدل الأسعار التلقائي"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SWIPE GESTURE HINT FOOTER */}
        <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 font-bold pt-1 border-t border-slate-100/60">
          <ArrowRightLeft className="w-3 h-3 text-indigo-500 animate-pulse" />
          <span>اسحب لليمين للمتابعة ⭐ | اسحب لليسار للتعديل ⚡</span>
        </div>

      </motion.div>
    </div>
  );
};
