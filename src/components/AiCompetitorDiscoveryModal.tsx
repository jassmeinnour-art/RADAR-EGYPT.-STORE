import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Store,
  Hash,
} from 'lucide-react';
import { Product, supabase } from '../lib/supabase';
import { saveCompetitorPricesLocally } from '../utils/sellerCentralExcelImporter';

export interface ExtractedCompetitorOffer {
  competitorName: string;
  sellerId: string;
  price: number;
  imageUrl?: string;
  condition?: string;
  platform: string;
  productTitle?: string;
  sourceUrl?: string;
  isSelfMerchant?: boolean;
}

interface AiCompetitorDiscoveryModalProps {
  product: Product;
  merchantSellerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  onCompetitorSaved?: () => void;
}

export const AiCompetitorDiscoveryModal: React.FC<AiCompetitorDiscoveryModalProps> = ({
  product,
  merchantSellerId: propMerchantSellerId,
  isOpen,
  onClose,
  onShowToast,
  onCompetitorSaved,
}) => {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [offers, setOffers] = useState<ExtractedCompetitorOffer[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(0);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const merchantSellerId = String(propMerchantSellerId || product.trader_id || '')
    .trim()
    .toUpperCase();

  const asinOrSku = (product.asin || product.sku || '').trim();
  const searchLinks = [
    {
      name: 'أمازون — بائعون آخرون (Other Sellers / See all buying options)',
      icon: '🛒',
      url: `https://www.amazon.eg/gp/offer-listing/${encodeURIComponent(asinOrSku)}`,
    },
    {
      name: 'نون مصر (Noon Egypt)',
      icon: '🛍️',
      url: `https://www.noon.com/egypt-ar/search?q=${encodeURIComponent(product.title)}`,
    },
    {
      name: 'جوميا مصر (Jumia Egypt)',
      icon: '🟠',
      url: `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(product.title)}`,
    },
    {
      name: 'جوجل شوبينج (Google Shopping)',
      icon: '🌐',
      url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(asinOrSku)}`,
    },
  ];

  const handleCopyLink = (url: string, index: number) => {
    navigator.clipboard?.writeText?.(url);
    setCopiedLinkIndex(index);
    onShowToast?.('📋 تم نسخ الرابط بنجاح');
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  const checkOfferIsSelf = (offer: ExtractedCompetitorOffer): boolean => {
    if (offer.isSelfMerchant) return true;
    const sId = String(offer.sellerId || '').trim().toUpperCase();
    return Boolean(merchantSellerId && sId && sId === merchantSellerId);
  };

  const handleExtractWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = competitorUrl.trim();
    if (!cleanUrl) {
      onShowToast?.('⚠️ يرجى لصق رابط المنافس أولاً');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setOffers([]);

    try {
      const res = await fetch('/api/ai/extract-competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorUrl: cleanUrl,
          productTitle: product.title,
          productAsin: product.asin || product.sku,
          merchantSellerId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(
          data?.error ||
            'لم يتم العثور على سعر حقيقي في هذا الرابط — لن نقوم باختراع أي سعر وهمي.'
        );
      }

      const rawList: ExtractedCompetitorOffer[] = Array.isArray(data.offers) && data.offers.length > 0
        ? data.offers
        : data.competitor
        ? [data.competitor]
        : [];

      const normalizedList = rawList
        .filter((o) => Number(o?.price) > 0)
        .map((o) => {
          const sId = String(o.sellerId || '').trim().toUpperCase();
          return {
            ...o,
            sellerId: sId,
            price: Number(o.price),
            platform: String(o.platform || 'amazon').toLowerCase(),
            condition: o.condition || 'جديد',
            isSelfMerchant: Boolean(
              o.isSelfMerchant || (merchantSellerId && sId && sId === merchantSellerId)
            ),
          };
        });

      if (normalizedList.length === 0) {
        throw new Error('لم يتم العثور على عروض بأسعار حقيقية في الرابط.');
      }

      setOffers(normalizedList);
      const firstRealIdx = normalizedList.findIndex((o) => !checkOfferIsSelf(o));
      setSelectedOfferIndex(firstRealIdx >= 0 ? firstRealIdx : 0);

      if (firstRealIdx < 0) {
        onShowToast?.('⚠️ كل العروض المستخرجة تخص متجرك أنت (هذا أنت - مش منافس)');
      } else {
        onShowToast?.(`✨ تم استخراج ${normalizedList.length} عرض من الرابط الحقيقي!`);
      }
    } catch (err: any) {
      const msg =
        err?.message ||
        'لم يتم العثور على سعر حقيقي في الرابط — تأكد من لصق رابط صفحة بائع أو منتج مفتوحة تحتوي على السعر.';
      setExtractError(msg);
      onShowToast?.(`❌ ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const realCompetitorOffers = offers.filter((o) => !checkOfferIsSelf(o));
  const selectedOffer = offers[selectedOfferIndex] || null;
  const selectedIsSelf = selectedOffer ? checkOfferIsSelf(selectedOffer) : false;

  const handleSaveCompetitor = async () => {
    if (!selectedOffer) return;
    if (selectedIsSelf) {
      onShowToast?.('⚠️ هذا العرض يخصك أنت (هذا أنت - مش منافس) — لا يمكن حفظه كمنافس.');
      return;
    }
    if (!selectedOffer.price || selectedOffer.price <= 0) {
      onShowToast?.('⚠️ السعر المستخرج غير صالح.');
      return;
    }

    try {
      const realPrices = realCompetitorOffers.map((o) => o.price).filter((p) => p > 0);
      const lowestRealPrice =
        realPrices.length > 0 ? Math.min(...realPrices) : selectedOffer.price;

      const competitorRecord = {
        product_id: product.id,
        asin: (product.asin || product.sku || '').trim().toUpperCase(),
        competitor_price: selectedOffer.price,
        buy_box_price: lowestRealPrice,
        competitors_count: realCompetitorOffers.length || 1,
        competitor_seller_id: selectedOffer.sellerId || null,
        competitor_name: selectedOffer.competitorName || 'منافس بالسوق',
        competitor_url: competitorUrl.trim(),
        owner_seller_id: merchantSellerId || null,
        image_url: selectedOffer.imageUrl || undefined,
        updated_at: new Date().toISOString(),
      };

      saveCompetitorPricesLocally([competitorRecord]);
      try {
        await supabase.from('competitor_prices').insert([
          {
            product_id: competitorRecord.product_id,
            asin: competitorRecord.asin,
            competitor_price: competitorRecord.competitor_price,
            buy_box_price: competitorRecord.buy_box_price,
            competitors_count: competitorRecord.competitors_count,
            updated_at: competitorRecord.updated_at,
          },
        ]);
      } catch {
        // Local storage already persisted cleanly
      }

      onShowToast?.(
        `✅ تم حفظ المنافس الحقيقي "${selectedOffer.competitorName}" بسعر ${selectedOffer.price.toLocaleString()} ج.م` +
          (selectedOffer.sellerId ? ` (Seller ID: ${selectedOffer.sellerId})` : '')
      );
      onCompetitorSaved?.();
      onClose();
    } catch (err: any) {
      onShowToast?.(`❌ فشل حفظ المنافس: ${err.message || 'حدث خطأ'}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-right shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">اكتشاف المنافسين بالذكاء الاصطناعي 🤖</h3>
              <p className="text-xs text-slate-400">
                المنتج: <strong className="text-amber-300">{product.title}</strong> | معرف بائعك (Seller ID):{' '}
                <span className="font-mono text-sky-300 font-bold">{merchantSellerId || 'غير محدد'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Real Platform Links (Prioritizing Amazon Other Sellers / Buying Options) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            1. ابحث عن المنافسين من قسم البائعين الآخرين (Other Sellers) أو المنصات الأخرى:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {searchLinks.map((link, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{link.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate" title={link.name}>
                      {link.name}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-sky-400 hover:underline truncate block"
                    >
                      فتح الصفحة ↗
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition cursor-pointer"
                    title="فتح الرابط"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link.url, idx)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    title="نسخ الرابط"
                  >
                    {copiedLinkIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Paste Real Competitor Link */}
        <form onSubmit={handleExtractWithAi} className="space-y-3 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300">
            2. الصق رابط المنافس أو رابط صفحة البائعين الآخرين (Other Sellers) هنا:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="https://www.amazon.eg/gp/offer-listing/... أو رابط نون/جوميا"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={isExtracting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shrink-0 inline-flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isExtracting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isExtracting ? 'جاري الفحص...' : 'استخراج المنافسين ⚡'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            يتم استبعاد أي عرض يحمل نفس Seller ID الخاص بالتاجر تلقائياً (<span className="font-mono text-sky-300">{merchantSellerId || '-'}</span>) ولا يتم اختراع أي سعر وهمي.
          </p>
        </form>

        {/* Explicit Real Extraction Error (No fake fallback prices) */}
        {extractError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{extractError}</span>
          </div>
        )}

        {/* Step 3: Extracted Offers List with Self-Exclusion & Seller IDs */}
        {offers.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>العروض المستخرجة من الرابط الحقيقي ({offers.length}):</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                منافسين حقيقيين: {realCompetitorOffers.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {offers.map((offer, idx) => {
                const isSelf = checkOfferIsSelf(offer);
                const isSelected = idx === selectedOfferIndex && !isSelf;

                return (
                  <div
                    key={`${offer.sellerId || offer.competitorName}-${offer.price}-${idx}`}
                    onClick={() => {
                      if (!isSelf) setSelectedOfferIndex(idx);
                    }}
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelf
                        ? 'bg-rose-950/30 border-rose-500/50 opacity-85 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 cursor-pointer shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white">
                          {offer.competitorName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 inline-flex items-center gap-1">
                          <Hash className="w-3 h-3 text-sky-400" />
                          <span>Seller ID: {offer.sellerId || 'غير متوفر في الصفحة'}</span>
                        </span>
                      </div>

                      {isSelf ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-[11px] font-black">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>هذا أنت - مش منافس</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>منافس حقيقي (Seller ID مختلف) — {offer.condition || 'جديد'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400">السعر</div>
                        <div className="text-base font-black text-amber-400 font-mono">
                          {offer.price.toLocaleString()} ج.م
                        </div>
                      </div>
                      {!isSelf && (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {realCompetitorOffers.length > 0 && selectedOffer && !selectedIsSelf ? (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveCompetitor}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    حفظ المنافس ({selectedOffer.price.toLocaleString()} ج.م) في رادار المنتجات 🏆
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold text-center">
                لم يتم رصد أي منافس بسعر مختلف عن التاجر — تم استبعاد عروضك الخاصة ولن يتم حفظ منافس وهمي.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
