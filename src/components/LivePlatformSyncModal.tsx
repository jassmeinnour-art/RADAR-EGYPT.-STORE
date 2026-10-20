import React, { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Store, 
  Link as LinkIcon, 
  FileText, 
  Barcode, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, ConnectedMerchantPlatform } from '../types';
import { 
  syncLiveProductsFromAmazonStore, 
  syncLiveProductsFromAsinList, 
  syncLiveProductsFromActiveListingsReport,
  syncLiveProductsFromConnectedPlatforms,
  saveStoredLiveProducts,
  purgeDummyProducts
} from '../services/livePlatformProductSync';

interface LivePlatformSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: ProductData[];
  onProductsUpdated: (products: ProductData[]) => void;
  connectedPlatforms: ConnectedMerchantPlatform[];
  onShowToast: (msg: string) => void;
  activeMerchantId?: string;
  activeMerchantName?: string;
  onLiveSync?: (merchantId?: string) => Promise<void>;
}

export const LivePlatformSyncModal: React.FC<LivePlatformSyncModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onProductsUpdated,
  connectedPlatforms,
  onShowToast,
  activeMerchantId,
  activeMerchantName,
  onLiveSync,
}) => {
  const [activeSyncTab, setActiveSyncTab] = useState<'amazon_store' | 'asin_input' | 'seller_report' | 'quick_sync'>('amazon_store');
  const [storeUrlInput, setStoreUrlInput] = useState('https://www.amazon.eg/s?me=A2VERIFIED_STORE');
  const [asinsInput, setAsinsInput] = useState('B09FURNCHR1, B09FURNTBL2, B09FURNDSK3, B09FURNSOF4');
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Strictly filter platforms associated with the active merchant to prevent cross-merchant leakage
  const merchantScopedPlatforms = useMemo(() => {
    if (!activeMerchantId) return connectedPlatforms;
    return connectedPlatforms.filter(
      (p) => !p.linkedMerchantClientId || p.linkedMerchantClientId === activeMerchantId
    );
  }, [connectedPlatforms, activeMerchantId]);

  if (!isOpen) return null;

  // Handle Amazon Storefront URL sync
  const handleSyncStoreUrl = async () => {
    if (!storeUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال رابط متجر أمازون مصر أو معرف التاجر.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري الاتصال بمتجر أمازون مصر وجلب المنتجات الفعلية...' });

    try {
      const res = await syncLiveProductsFromAmazonStore(storeUrlInput);
      if (res.success) {
        onProductsUpdated(res.products);
        setStatusMessage({ type: 'success', text: res.message });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onShowToast(res.message);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || 'حدث خطأ أثناء مزامنة المتجر.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ASINs bulk input sync
  const handleSyncAsins = async () => {
    if (!asinsInput.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال أرقام ASIN واحدة على الأقل.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري جلب بيانات أرقام ASIN والأسعار الحية من أمازون...' });

    try {
      const res = await syncLiveProductsFromAsinList(asinsInput);
      if (res.success) {
        onProductsUpdated(res.products);
        setStatusMessage({ type: 'success', text: res.message });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onShowToast(res.message);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || 'حدث خطأ أثناء جلب أرقام ASIN.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Seller Central report import
  const handleSyncReport = async () => {
    if (!reportContent.trim()) {
      setStatusMessage({ type: 'error', text: 'يرجى لصق محتوى تقرير السيلر سنترال Active Listings.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري قراءة تقرير السيلر سنترال ومطابقة المنتجات والمخزون...' });

    try {
      const res = await syncLiveProductsFromActiveListingsReport(reportContent);
      if (res.success) {
        onProductsUpdated(res.products);
        setStatusMessage({ type: 'success', text: res.message });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onShowToast(res.message);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || 'حدث خطأ أثناء معالجة تقرير السيلر سنترال.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click sync strictly scoped to active merchant
  const handleQuickSyncAll = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `جاري المزامنة الحية لقنوات متجر "${activeMerchantName || 'المتجر المحدد'}"...` });

    try {
      if (onLiveSync) {
        await onLiveSync(activeMerchantId);
        setStatusMessage({ type: 'success', text: `تمت المزامنة الحية لمتجر "${activeMerchantName || 'التاجر'}" بنجاح!` });
        return;
      }

      const res = await syncLiveProductsFromConnectedPlatforms(merchantScopedPlatforms);
      if (res.success) {
        onProductsUpdated(res.products);
        setStatusMessage({ type: 'success', text: res.message });
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        onShowToast(res.message);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || 'حدث خطأ أثناء المزامنة الحية.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all dummy products completely
  const handlePurgeDummyProducts = () => {
    const cleaned = purgeDummyProducts(allProducts);
    saveStoredLiveProducts(cleaned);
    onProductsUpdated(cleaned);
    onShowToast(`تم تنظيف الكتالوج وحذف أي بيانات تجريبية. المتبقي: ${cleaned.length} منتجات فعلية.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              <span>المزامنة الحية لمنتجات المنصة (Live Product Synchronization)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Alexandria']">
              ربط ومزامنة منتجات المتجر الفعلي من أمازون مصر والمنصات
            </h3>
            <p className="text-xs text-slate-500">
              جلب قائمة المنتجات الحقيقية الفعلية (أرقام ASIN، الأسماء، الأسعار والمخزون) وإزالة أي بيانات وهمية.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl my-4 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSyncTab('amazon_store')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSyncTab === 'amazon_store' 
                ? 'bg-white text-indigo-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-sky-600" />
            <span>متجر أمازون (Storefront URL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSyncTab('asin_input')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSyncTab === 'asin_input' 
                ? 'bg-white text-indigo-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
            <span>أرقام المعرفات (ASINs List)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSyncTab('seller_report')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSyncTab === 'seller_report' 
                ? 'bg-white text-indigo-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>تقرير السيلر سنترال (Active Listings)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSyncTab('quick_sync')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSyncTab === 'quick_sync' 
                ? 'bg-white text-indigo-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>مزامنة فورية للمنصات</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          
          {/* TAB 1: Amazon Storefront Link */}
          {activeSyncTab === 'amazon_store' && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-600" />
                  <span>رابط متجر التاجر على أمازون مصر أو معرف التاجر (Merchant Token / Storefront URL):</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  انسخ رابط متجرك من أمازون مصر (مثل https://www.amazon.eg/s?me=A2VERIFIED_STORE) لجلب كافة المنتجات المعروضة برقم الـ ASIN والصور والأسعار الفعلية.
                </p>
              </div>

              <input
                type="text"
                value={storeUrlInput}
                onChange={(e) => setStoreUrlInput(e.target.value)}
                placeholder="https://www.amazon.eg/s?me=A2XXXXXXXXXXXX"
                className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  يتضمن جلب أحدث أسعار المنافسين على صندوق الشراء (Buy Box).
                </span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncStoreUrl}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جاري المزامنة...' : 'بدء المزامنة من متجر أمازون 🔄'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ASINs List Bulk Input */}
          {activeSyncTab === 'asin_input' && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-indigo-600" />
                  <span>أرقام المعرفات القياسية (ASINs) لمنتجات متجرك:</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  أدخل أرقام الـ ASIN الخاصة بمنتجاتك مفصولة بفواصل أو أسطر جديدة (مثال: B09FURNCHR1, B09FURNTBL2).
                </p>
              </div>

              <textarea
                rows={3}
                value={asinsInput}
                onChange={(e) => setAsinsInput(e.target.value)}
                placeholder="B09FURNCHR1, B09FURNTBL2, B09FURNDSK3, B09FURNSOF4"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  يتم جلب الصور الأصلية عالية الدقة من خوادم أمازون ومطابقة عروض المنافسين.
                </span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncAsins}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جاري الجلب...' : 'جلب ومزامنة أرقام ASIN 📥'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Seller Central Active Listings Report */}
          {activeSyncTab === 'seller_report' && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>لصق تقرير Active Listings Report من أمازون سيلر سنترال:</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  من Seller Central {'>'} Inventory Reports {'>'} Active Listings Report، انسخ محتويات الملف (TSV أو CSV) والصقه هنا لاستخراج الـ SKU والـ ASIN والأسعار والمخزون الحقيقي فوراً.
                </p>
              </div>

              <textarea
                rows={4}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="seller-sku	asin1	item-name	price	quantity&#10;ANKER-Q30-BLK	B08N5WRWNW	Anker Soundcore Life Q30	3499	18"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  يدعم صيغ TSV و CSV الرسمية من سيلر سنترال مصر.
                </span>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncReport}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جاري المعالجة...' : 'معالجة واستيراد التقرير 📋'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Quick 1-Click Platform Sync */}
          {activeSyncTab === 'quick_sync' && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>المزامنة الفورية مع المنصات المتصلة</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  تحديث مباشر لجميع منتجات متجرك الحقيقية على أمازون مصر ونون وجوميا مع إعادة حساب هوامش الربح وأسعار المنافسين الأقل في السوق المصري.
                </p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700">
                  القنوات المعتمدة للمتجر ({activeMerchantName || 'المتجر النشط'}):
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {merchantScopedPlatforms.filter(p => p.isConnected).length} قنوات نشطة
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {merchantScopedPlatforms.map((plat) => (
                  <span
                    key={plat.id}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                      plat.isConnected 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{plat.name}</span>
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleQuickSyncAll}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جاري مزامنة المنصات...' : 'مزامنة وتحديث كافة المنتجات الحقيقية الآن ⚡'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Status Message Display */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border flex items-start gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <span className="text-xs font-bold leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Currently Synced Real Products Catalog */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>المنتجات الحقيقية المسجلة حالياً بالمتجر ({allProducts.length} منتج):</span>
              </span>

              <button
                type="button"
                onClick={handlePurgeDummyProducts}
                className="px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="حذف أي بيانات أو منتجات تجريبية وهمية متبقية نهائياً"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>حذف أي بيانات وهمية 🧹</span>
              </button>
            </div>

            {allProducts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1">
                <span className="text-slate-500 font-bold block">لا توجد منتجات مسجلة حالياً</span>
                <span className="text-slate-400 text-[11px]">
                  استخدم أحد خيارات المزامنة أعلاه لجلب منتجات متجرك الفعلية برقم الـ ASIN.
                </span>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {allProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-sm">
                          {prod.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                          <span>ASIN: {prod.id}</span>
                          <span>SKU: {prod.sku || 'N/A'}</span>
                          <span>المنافسين: {prod.merchantOffers?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-indigo-700">
                        {prod.suggestedRetailPrice || prod.currentLowestPrice} {prod.currency}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        أقل منافس: {prod.currentLowestPrice} {prod.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-500">
            تتم المزامنة وحفظ البيانات محلياً وفي قاعدة بيانات Firestore بشكل دائم.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
