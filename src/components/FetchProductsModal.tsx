import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Globe, Mail, Store, Key, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase, Trader, multiTenantDb, isDemoOrOrphanProduct } from '../lib/supabase';
import { dataCache } from '../utils/dataCache';

interface FetchProductsModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSyncCompleted?: (stats: { total: number; new: number; updated: number }) => void;
}

export const FetchProductsModal: React.FC<FetchProductsModalProps> = ({
  trader,
  isOpen,
  onClose,
  onShowToast,
  onSyncCompleted,
}) => {
  const defaultStoreUrl =
    trader.store_url ||
    trader.storefront_link ||
    trader.destination_url ||
    trader.seller_link ||
    (trader.seller_id ? `https://www.amazon.eg/s?me=${trader.seller_id}` : '');

  const [storeUrlInput, setStoreUrlInput] = useState<string>(defaultStoreUrl);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStats, setFetchStats] = useState<{ total: number; new: number; updated: number } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    setStoreUrlInput(
      trader.store_url ||
        trader.storefront_link ||
        trader.destination_url ||
        trader.seller_link ||
        (trader.seller_id ? `https://www.amazon.eg/s?me=${trader.seller_id}` : '')
    );
    setFetchStats(null);
    setFetchError(null);
  }, [trader, isOpen]);

  if (!isOpen) return null;

  const destinationUrl = trader.destination_url || trader.seller_link || '';
  const storefrontUrl = trader.store_url || trader.storefront_link || '';
  const traderGmail = trader.gmail || trader.email || '';

  const handleStartFetch = async () => {
    setIsFetching(true);
    setFetchError(null);
    setFetchStats(null);

    try {
      const targetUrl = storeUrlInput.trim() || storefrontUrl || destinationUrl;
      let scrapedItems: any[] = [];

      // Method 1: Live storefront scrape via backend endpoint (supports pagination / multiple pages)
      if (targetUrl) {
        const res = await fetch(
          `/api/scrape/storefront?trader_id=${encodeURIComponent(trader.id)}&url=${encodeURIComponent(
            targetUrl
          )}&platform=${encodeURIComponent(trader.platform || 'amazon')}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.products)) {
            scrapedItems = json.products;
          }
        }
      }

      // Method 2 fallback: Connected trader sync API
      if (scrapedItems.length === 0) {
        const syncRes = await multiTenantDb.syncTrader(trader.id);
        if (syncRes.success && Array.isArray(syncRes.products)) {
          scrapedItems = syncRes.products;
        }
      }

      // Strictly strip any demo/orphan rows before persisting
      const validProducts = scrapedItems
        .map((item) => ({
          ...item,
          trader_id: trader.id,
          platform: item.platform || trader.platform || 'amazon',
          sku: item.sku || item.asin || '',
        }))
        .filter((item) => item.sku && !isDemoOrOrphanProduct(item));

      if (validProducts.length === 0) {
        const msg =
          'لم يتم العثور على منتجات قابلة للاستيراد من الرابط حالياً. يمكنك استخدام زر "استيراد من Excel" لرفع ملف المخزون كاملاً فوراً.';
        setFetchError(msg);
        onShowToast?.(`⚠️ ${msg}`);
        return;
      }

      // Check existing products for this trader to compute accurate new vs updated counts
      const { data: existingRows } = await supabase
        .from('products')
        .select('id, sku')
        .eq('trader_id', trader.id);

      const existingSkus = new Set(
        (Array.isArray(existingRows) ? existingRows : []).map((r: any) => String(r.sku || '').toUpperCase())
      );

      let newCount = 0;
      let updatedCount = 0;
      validProducts.forEach((p) => {
        if (existingSkus.has(String(p.sku || '').toUpperCase())) {
          updatedCount += 1;
        } else {
          newCount += 1;
        }
      });

      await multiTenantDb.saveScrapedProducts(trader.id, validProducts);
      dataCache.invalidate('products_');

      const stats = {
        total: validProducts.length,
        new: newCount,
        updated: updatedCount,
      };
      setFetchStats(stats);
      try {
        localStorage.setItem('radar_last_sync_stats', JSON.stringify(stats));
      } catch {}

      onSyncCompleted?.(stats);
      onShowToast?.(`✅ تم سحب ${stats.total} منتج (${stats.new} جديد / ${stats.updated} محدث) بنجاح!`);
    } catch (err: any) {
      const msg = err?.message || 'حدث خطأ أثناء الاتصال بخدمة السحب';
      setFetchError(msg);
      onShowToast?.(`❌ فشل السحب: ${msg}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-['Cairo']" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-amber-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>سحب كل منتجات المتجر</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-slate-300 text-xs">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-400">التاجر:</span>
              <span className="font-black text-white">{trader.seller_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-bold text-slate-400">حساب الجيميل:</span>
              <span className="font-mono text-slate-200" dir="ltr">{traderGmail || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-400">Seller ID:</span>
              <span className="font-mono font-bold text-amber-300" dir="ltr">{trader.seller_id || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-slate-400">لينك الوجهة:</span>
              {destinationUrl ? (
                <a href={destinationUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline truncate" dir="ltr">
                  {destinationUrl}
                </a>
              ) : (
                <span className="text-slate-500">لا يوجد</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-400">لينك المتجر:</span>
              {storefrontUrl ? (
                <a href={storefrontUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline truncate" dir="ltr">
                  {storefrontUrl}
                </a>
              ) : (
                <span className="text-slate-500">لا يوجد</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط المتجر المستهدف للسحب</label>
            <input
              type="url"
              value={storeUrlInput}
              onChange={(e) => setStoreUrlInput(e.target.value)}
              placeholder="https://www.amazon.eg/s?me=..."
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {fetchError && (
            <div className="p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl flex items-start gap-2 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{fetchError}</span>
            </div>
          )}

          {fetchStats && (
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-sm font-black text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم السحب بنجاح</span>
              </div>
              <p className="text-xs text-emerald-200 font-mono">
                إجمالي: {fetchStats.total} | جديد: {fetchStats.new} | محدث: {fetchStats.updated}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartFetch}
            disabled={isFetching}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>يتم المزامنة وسحب المنتجات...</span>
              </>
            ) : (
              <span>ابدأ السحب</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
