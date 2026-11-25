import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  RefreshCw,
  ExternalLink,
  Trash2,
  Check,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Hash,
  Plus,
  ShieldCheck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Product, Trader, supabase } from '../lib/supabase';
import {
  CompetingStoreItem,
  getTraderCompetingStores,
  saveTraderCompetingStores,
  harvestSingleCompetingStore,
  recalculateStoreStats,
  resolveTraderMerchantSellerId,
} from '../utils/competingStoresManager';

interface CompetingStoresManagerModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
  onStoresUpdated?: () => void;
}

export const CompetingStoresManagerModal: React.FC<CompetingStoresManagerModalProps> = ({
  trader,
  isOpen,
  onClose,
  onShowToast,
  onStoresUpdated,
}) => {
  const [stores, setStores] = useState<CompetingStoreItem[]>([]);
  const [storeUrl, setStoreUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [traderProducts, setTraderProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [refreshingStoreId, setRefreshingStoreId] = useState<string | null>(null);
  const [harvestError, setHarvestError] = useState<string | null>(null);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  const merchantSellerId = resolveTraderMerchantSellerId(trader);

  useEffect(() => {
    if (!isOpen || !trader?.id) return;
    const loadedStores = getTraderCompetingStores(trader.id);
    setStores(loadedStores);
    if (loadedStores.length > 0 && !expandedStoreId) {
      setExpandedStoreId(loadedStores[0].id);
    }

    const fetchCatalog = async () => {
      setIsLoadingProducts(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('trader_id', trader.id);
        setTraderProducts(Array.isArray(data) ? (data as Product[]) : []);
      } catch {
        setTraderProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    void fetchCatalog();
  }, [isOpen, trader?.id]);

  if (!isOpen) return null;

  const persistStores = (nextStores: CompetingStoreItem[]) => {
    setStores(nextStores);
    saveTraderCompetingStores(trader.id, nextStores);
    onStoresUpdated?.();
  };

  const handleHarvestNewStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = storeUrl.trim();
    if (!cleanUrl) {
      onShowToast?.('⚠️ يرجى لصق رابط متجر المنافس أولاً');
      return;
    }

    setIsHarvesting(true);
    setHarvestError(null);
    try {
      const harvestedStore = await harvestSingleCompetingStore({
        trader,
        storeUrl: cleanUrl,
        storeName: storeName.trim() || undefined,
        traderProducts,
      });

      const nextStores = [harvestedStore, ...stores];
      persistStores(nextStores);
      setExpandedStoreId(harvestedStore.id);
      setStoreUrl('');
      setStoreName('');
      onShowToast?.(
        `✅ تم حصد ${harvestedStore.harvestedCount} منتج من "${harvestedStore.storeName}" (${harvestedStore.matchedCount} منتج مشابه)`
      );
    } catch (err: any) {
      const msg = err?.message || 'تعذر حصد متجر المنافس — تأكد من الرابط';
      setHarvestError(msg);
      onShowToast?.(`❌ ${msg}`);
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleReharvestStore = async (targetStore: CompetingStoreItem) => {
    setRefreshingStoreId(targetStore.id);
    setHarvestError(null);
    try {
      const refreshed = await harvestSingleCompetingStore({
        trader,
        storeUrl: targetStore.storeUrl,
        storeName: targetStore.storeName,
        traderProducts,
        existingStoreId: targetStore.id,
        previousProducts: targetStore.products,
      });
      const nextStores = stores.map((s) => (s.id === targetStore.id ? refreshed : s));
      persistStores(nextStores);
      onShowToast?.(`🔄 تم تحديث أسعار ومنتجات "${refreshed.storeName}" بنجاح`);
    } catch (err: any) {
      const msg = err?.message || 'تعذر تحديث المتجر المنافس';
      setHarvestError(msg);
      onShowToast?.(`❌ ${msg}`);
    } finally {
      setRefreshingStoreId(null);
    }
  };

  const handleDeleteStore = (storeId: string) => {
    const nextStores = stores.filter((s) => s.id !== storeId);
    persistStores(nextStores);
    if (expandedStoreId === storeId) {
      setExpandedStoreId(nextStores[0]?.id || null);
    }
    onShowToast?.('🗑️ تم حذف المتجر المنافس');
  };

  const handleConfirmMatch = (storeId: string, productId: string, accept: boolean) => {
    const nextStores = stores.map((store) => {
      if (store.id !== storeId) return store;
      const updatedProducts = store.products.map((p) =>
        p.id === productId
          ? { ...p, confirmed: accept, rejected: !accept }
          : p
      );
      return recalculateStoreStats({ ...store, products: updatedProducts });
    });
    persistStores(nextStores);
    onShowToast?.(accept ? '✅ تم تأكيد المنافس المحتمل واعتماد مراقبة سعره يومياً' : 'تم تجاهل المنتج');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 text-right shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                متاجر المنافسين لـ: <span className="text-amber-300">{trader.seller_name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Seller ID التاجر: <span className="font-mono text-sky-300 font-bold">{merchantSellerId || 'غير محدد'}</span>
                {' · '}عدد منتجات التاجر للمقارنة: <span className="font-mono text-emerald-300 font-bold">{isLoadingProducts ? '...' : traderProducts.length}</span>
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

        {/* Add Competing Store Form */}
        <form onSubmit={handleHarvestNewStore} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-xs font-black text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>إضافة رابط متجر منافس جديد (يسمح بأكثر من رابط متجر لكل تاجر):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="اسم المتجر المنافس (اختياري)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="url"
              required
              dir="ltr"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://www.amazon.eg/s?me=SELLER_ID أو رابط نون/جوميا"
              className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400">
              يستخرج الذكاء الاصطناعي منتجات المتجر الحقيقية، يستبعد أي منتج يخص التاجر (<span className="font-mono text-sky-300">{merchantSellerId || '-'}</span>)، ويقارن بالـ ASIN ثم تشابه الاسم (≥ 70%).
            </p>
            <button
              type="submit"
              disabled={isHarvesting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isHarvesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isHarvesting ? 'جاري حصد المتجر...' : 'حصد المنافس ⚡'}</span>
            </button>
          </div>
        </form>

        {harvestError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{harvestError}</span>
          </div>
        )}

        {/* Competing Stores List */}
        {stores.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <Store className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">لا توجد متاجر منافسين مضافة لهذا التاجر بعد</p>
            <p className="text-xs text-slate-500">
              الصق رابط متجر منافس من أمازون (s?me=...) أو نون أو جوميا واضغط "حصد المنافس" لبدء المقارنة والمراقبة اليومية.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => {
              const isExpanded = expandedStoreId === store.id;
              const isRefreshing = refreshingStoreId === store.id;
              const visibleProducts = (store.products || []).filter((p) => !p.rejected);
              const potentialPending = visibleProducts.filter(
                (p) => p.matchType === 'potential_title' && !p.confirmed
              );
              const confirmedOrExact = visibleProducts.filter(
                (p) => p.matchType === 'exact_asin' || p.confirmed
              );

              return (
                <div
                  key={store.id}
                  className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden"
                >
                  {/* Store Summary Row */}
                  <div
                    onClick={() => setExpandedStoreId(isExpanded ? null : store.id)}
                    className="p-4 cursor-pointer hover:bg-slate-900/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-white">{store.storeName}</span>
                        {store.storeSellerId && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
                            Seller ID: {store.storeSellerId}
                          </span>
                        )}
                        {potentialPending.length > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            {potentialPending.length} منافس محتمل بانتظار التأكيد
                          </span>
                        )}
                      </div>
                      <a
                        href={store.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-mono text-sky-400 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                        dir="ltr"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{store.storeUrl}</span>
                      </a>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          آخر فحص: {new Date(store.lastHarvestedAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">المحصد</div>
                        <div className="text-xs font-black text-white font-mono">{store.harvestedCount}</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">الشبيهة</div>
                        <div className="text-xs font-black text-sky-300 font-mono">{store.matchedCount}</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[115px]">
                        <div className="text-[10px] text-slate-400">متوسط فرق السعر</div>
                        {store.pricePosition === 'cheaper' ? (
                          <div className="text-xs font-black text-rose-400 inline-flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>أرخص بـ {Math.abs(store.avgPriceDiffAmount).toLocaleString()} ج.م</span>
                          </div>
                        ) : store.pricePosition === 'expensive' ? (
                          <div className="text-xs font-black text-emerald-400 inline-flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>أغلى بـ {Math.abs(store.avgPriceDiffAmount).toLocaleString()} ج.م</span>
                          </div>
                        ) : store.pricePosition === 'equal' ? (
                          <div className="text-xs font-black text-sky-300">متساوي السعر</div>
                        ) : (
                          <div className="text-xs font-bold text-slate-500">لا يوجد تطابق مؤكد</div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleReharvestStore(store);
                        }}
                        disabled={isRefreshing}
                        className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 cursor-pointer disabled:opacity-50"
                        title="تحديث الأسعار الآن"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStore(store.id);
                        }}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer"
                        title="حذف المتجر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Products & Confirmations */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-3 max-h-80 overflow-y-auto">
                      {visibleProducts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">لا توجد منتجات متاحة في هذا المتجر</p>
                      ) : (
                        <>
                          {potentialPending.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-black text-amber-300">
                                منتجات بتشابه ≥ 70% — بانتظار تأكيد المؤسس (منافس محتمل):
                              </div>
                              {potentialPending.map((item) => (
                                <div
                                  key={item.id}
                                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/25 text-amber-200">
                                        منافس محتمل ({item.similarityPercent}% تشابه)
                                      </span>
                                      <span className="text-[10px] font-mono text-sky-300 inline-flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        Seller ID: {item.sellerId || store.storeSellerId || 'غير محدد'}
                                      </span>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate">{item.title}</div>
                                    <div className="text-[11px] text-slate-300">
                                      يقارن مع منتجك: <strong className="text-amber-300">{item.matchedProductTitle}</strong> (سعرك: {item.matchedTraderPrice?.toLocaleString()} ج.م) — سعر المنافس: <strong className="text-emerald-300 font-mono">{item.price.toLocaleString()} ج.م</strong>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmMatch(store.id, item.id, true)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>تأكيد كمنافس</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmMatch(store.id, item.id, false)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] cursor-pointer"
                                    >
                                      تجاهل
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="text-xs font-black text-slate-300">
                              المنتجات المحصودة والمقارنة ({confirmedOrExact.length} مطابق/مؤكد من {visibleProducts.length}):
                            </div>
                            {visibleProducts
                              .filter((p) => !(p.matchType === 'potential_title' && !p.confirmed))
                              .map((item) => {
                                const isCheaper =
                                  item.confirmed &&
                                  item.matchedTraderPrice &&
                                  item.price < item.matchedTraderPrice;
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                      isCheaper
                                        ? 'bg-rose-950/25 border-rose-500/40'
                                        : 'bg-slate-950 border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.title}
                                          className="w-10 h-10 rounded-lg object-contain bg-white shrink-0"
                                        />
                                      )}
                                      <div className="min-w-0 space-y-0.5">
                                        <div className="text-xs font-bold text-white truncate">{item.title}</div>
                                        <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                                          {item.asin && <span className="text-sky-300">ASIN: {item.asin}</span>}
                                          <span className="text-slate-400">
                                            Seller ID: {item.sellerId || store.storeSellerId || 'غير محدد'}
                                          </span>
                                          {item.matchType === 'exact_asin' && (
                                            <span className="text-emerald-300 inline-flex items-center gap-0.5 font-sans font-bold">
                                              <ShieldCheck className="w-3 h-3" /> مطابقة تامة بالـ ASIN
                                            </span>
                                          )}
                                          {item.matchType === 'potential_title' && item.confirmed && (
                                            <span className="text-sky-300 font-sans font-bold">
                                              مؤكد بالاسم ({item.similarityPercent}%)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                                      <div>
                                        <span className="text-[10px] text-slate-400 block">سعره</span>
                                        <strong className={isCheaper ? 'text-rose-400' : 'text-amber-300'}>
                                          {item.price.toLocaleString()} ج.م
                                        </strong>
                                      </div>
                                      {item.matchedTraderPrice ? (
                                        <div>
                                          <span className="text-[10px] text-slate-400 block">سعرك</span>
                                          <strong className="text-white">
                                            {item.matchedTraderPrice.toLocaleString()} ج.م
                                          </strong>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
