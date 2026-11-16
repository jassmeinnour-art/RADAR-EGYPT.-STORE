import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Package,
  Search,
  X,
  Plus,
  Trash2,
  CloudUpload,
  Radio,
  Clock,
  Layers,
  Loader2,
} from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import {
  getLocallySavedProducts,
  queueOfflineAction,
  removeOfflineQueuedAction,
  LocallySavedProduct,
  OFFLINE_SYNC_TAG,
  RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT,
  RADAR_OFFLINE_QUEUE_UPDATED_EVENT,
} from '../utils/offlineActionQueue';

interface OfflineNoticeBannerProps {
  onShowToast?: (msg: string) => void;
}

export const OfflineNoticeBanner: React.FC<OfflineNoticeBannerProps> = ({ onShowToast }) => {
  const {
    isOffline,
    cachedTasksCount,
    cachedMerchantsCount,
    cachedProductsCount,
    pendingActionsCount,
    failedActionsCount,
    pendingActions,
    isBackgroundSyncSupported,
    isServiceWorkerReady,
    backgroundSyncStatus,
    syncState,
    lastSyncError,
    isSyncingQueue,
    lastSyncedQueueCount,
    lastSyncedAt,
    checkConnection,
    syncNow,
    enableBackgroundSync,
    refreshOfflineData,
  } = useOfflineStatus();

  const [isTesting, setIsTesting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'queue'>('products');
  const [savedProducts, setSavedProducts] = useState<LocallySavedProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSyncedCount, setRecentSyncedCount] = useState<number>(0);

  // Quick offline product add form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSku, setQuickSku] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickStock, setQuickStock] = useState('10');
  const [quickPlatform, setQuickPlatform] = useState('amazon');
  const [isSavingOffline, setIsSavingOffline] = useState(false);

  const loadLocalProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const items = await getLocallySavedProducts();
      setSavedProducts(items);
    } catch {
      setSavedProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      void loadLocalProducts();
    }
  }, [isModalOpen, loadLocalProducts]);

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    const handleProductsSynced = (event: any) => {
      const synced = Number(event?.detail?.synced || 0);
      if (synced > 0) {
        setRecentSyncedCount(synced);
        if (onShowToast) {
          onShowToast(`تمت مزامنة ${synced} إجراء/منتج تلقائياً بعد عودة الاتصال ✅`);
        }
        if (dismissTimer) clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          setRecentSyncedCount(0);
        }, 6000);
      }
      if (isModalOpen) {
        void loadLocalProducts();
      }
    };

    const handleQueueUpdated = () => {
      if (isModalOpen) {
        void loadLocalProducts();
      }
    };

    window.addEventListener(RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT as any, handleProductsSynced);
    window.addEventListener(RADAR_OFFLINE_QUEUE_UPDATED_EVENT as any, handleQueueUpdated);

    return () => {
      window.removeEventListener(RADAR_OFFLINE_PRODUCTS_SYNCED_EVENT as any, handleProductsSynced);
      window.removeEventListener(RADAR_OFFLINE_QUEUE_UPDATED_EVENT as any, handleQueueUpdated);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [isModalOpen, loadLocalProducts, onShowToast]);

  const filteredSavedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return savedProducts;
    return savedProducts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.platform || '').toLowerCase().includes(q)
    );
  }, [savedProducts, searchQuery]);

  const syncStatusMeta = useMemo(() => {
    if (syncState === 'syncing' || isSyncingQueue) {
      return {
        label: 'حالة المزامنة: جاري مزامنة العمليات المؤجلة...',
        badgeClass: 'bg-sky-500/25 text-sky-200 border-sky-400/50',
        isSpinning: true,
      };
    }
    if (syncState === 'error') {
      return {
        label: `حالة المزامنة: تعذر مزامنة ${failedActionsCount} عملية ⚠️`,
        badgeClass: 'bg-red-500/25 text-red-200 border-red-400/50',
        isSpinning: false,
      };
    }
    if (syncState === 'queued') {
      return {
        label: `حالة المزامنة: في انتظار عودة الشبكة (${pendingActionsCount} عملية)`,
        badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400/50',
        isSpinning: false,
      };
    }
    if (syncState === 'synced' || recentSyncedCount > 0) {
      const count = recentSyncedCount || lastSyncedQueueCount;
      return {
        label: `حالة المزامنة: تمت المزامنة بنجاح (${count}) ✅`,
        badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50',
        isSpinning: false,
      };
    }
    return {
      label: isOffline ? 'حالة المزامنة: التخزين المحلي نشط (أوفلاين)' : 'حالة المزامنة: محدث وجاهز ✓',
      badgeClass: 'bg-slate-700/70 text-slate-200 border-slate-500/40',
      isSpinning: false,
    };
  }, [
    failedActionsCount,
    isOffline,
    isSyncingQueue,
    lastSyncedQueueCount,
    pendingActionsCount,
    recentSyncedCount,
    syncState,
  ]);

  const shouldRenderBanner =
    isOffline || pendingActionsCount > 0 || recentSyncedCount > 0 || isSyncingQueue;
  if (!shouldRenderBanner && !isModalOpen) return null;

  const handleManualCheck = async () => {
    setIsTesting(true);
    const online = await checkConnection();
    setIsTesting(false);

    if (online) {
      if (onShowToast) onShowToast('تم استعادة الاتصال بالإنترنت بنجاح! ⚡');
    } else {
      if (onShowToast) onShowToast('ما زلت في وضع الأوفلاين - يتم الاعتماد على بيانات IndexedDB المحلية 📦');
    }
  };

  const handleEnableBackgroundSync = async () => {
    const result = await enableBackgroundSync();
    if (result.supported && result.registered) {
      onShowToast?.('تم تفعيل المزامنة الخلفية (Background Sync API) بنجاح ⚡');
    } else {
      onShowToast?.('المزامنة التلقائية عند عودة الاتصال مفعّلة (وضع التوافق التلقائي للمتصفح) 🔄');
    }
  };

  const handleManualQueueSync = async () => {
    const summary = await syncNow();
    if (summary.synced > 0) {
      setRecentSyncedCount(summary.synced);
      onShowToast?.(`تمت مزامنة ${summary.synced} إجراء مع الخادم بنجاح ✅`);
    } else if (summary.failed > 0) {
      onShowToast?.(`تعذر مزامنة ${summary.failed} إجراء — سيتم إعادة المحاولة عند استقرار الاتصال ⚠️`);
    } else if (isOffline) {
      onShowToast?.('لا يوجد اتصال حالياً — ستتم المزامنة تلقائياً فور عودة الإنترنت ⏳');
    }
    await loadLocalProducts();
  };

  const handleQuickOfflineProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickSku.trim() || !quickPrice) {
      onShowToast?.('يرجى إدخال اسم المنتج والرمز (SKU) والسعر');
      return;
    }

    setIsSavingOffline(true);
    try {
      const payload = {
        title: quickTitle.trim(),
        sku: quickSku.trim().toUpperCase(),
        price: parseFloat(quickPrice) || 0,
        stock: parseInt(quickStock, 10) || 0,
        platform: quickPlatform,
        trader_id: 'offline_local_merchant',
        created_at: new Date().toISOString(),
      };

      const { syncRegistration } = await queueOfflineAction({
        type: 'add_product',
        label: `إضافة منتج: ${payload.title}`,
        payload,
      });

      setQuickTitle('');
      setQuickSku('');
      setQuickPrice('');
      setQuickStock('10');
      setShowQuickAdd(false);

      await Promise.all([refreshOfflineData(), loadLocalProducts()]);

      if (syncRegistration.supported && syncRegistration.registered) {
        onShowToast?.('تم حفظ المنتج محلياً وتسجيل المزامنة الخلفية (Background Sync) 📦⚡');
      } else {
        onShowToast?.('تم حفظ المنتج في طابور الأوفلاين (IndexedDB + localStorage) وسيتم رفعه تلقائياً عند الاتصال 📦');
      }
    } finally {
      setIsSavingOffline(false);
    }
  };

  const handleDeleteQueuedAction = async (actionId: string) => {
    await removeOfflineQueuedAction(actionId);
    await Promise.all([refreshOfflineData(), loadLocalProducts()]);
    onShowToast?.('تم حذف الإجراء من طابور المزامنة المحلية');
  };

  return (
    <>
      {shouldRenderBanner && (
        <div
          className={`border-b-2 text-white px-4 py-2.5 shadow-xl sticky top-0 z-[100] transition-all animate-in slide-in-from-top duration-300 ${
            syncState === 'synced' && !isOffline && pendingActionsCount === 0
              ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500'
              : syncState === 'syncing'
              ? 'bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-sky-400'
              : syncState === 'error'
              ? 'bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-red-500'
              : 'bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-amber-500'
          }`}
          dir="rtl"
          data-sync-state={syncState}
        >
          <div className="w-full px-2 sm:px-6 lg:px-8 xl:px-10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            {/* Right Status Alert (RTL) */}
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  syncState === 'synced' && !isOffline && pendingActionsCount === 0
                    ? 'bg-emerald-600/30 border-emerald-500/50'
                    : syncState === 'syncing'
                    ? 'bg-sky-600/30 border-sky-400/50'
                    : 'bg-red-600/30 border-red-500/50 animate-pulse'
                }`}
              >
                {syncState === 'syncing' ? (
                  <Loader2 className="w-5 h-5 text-sky-300 animate-spin" />
                ) : syncState === 'synced' && !isOffline && pendingActionsCount === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-300" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  {syncState === 'syncing' ? (
                    <span className="font-extrabold text-sky-200 text-sm sm:text-base flex items-center gap-1.5">
                      <CloudUpload className="w-4 h-4 text-sky-300 animate-bounce" />
                      جاري مزامنة العمليات المؤجلة ({pendingActionsCount})... 🔄
                    </span>
                  ) : !isOffline && recentSyncedCount > 0 && pendingActionsCount === 0 ? (
                    <span className="font-extrabold text-emerald-200 text-sm sm:text-base">
                      تمت مزامنة {recentSyncedCount} منتج/إجراء تلقائياً ✅
                    </span>
                  ) : (
                    <span className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      {isOffline
                        ? 'وضع عدم الاتصال بالإنترنت (Offline Mode)'
                        : 'إجراءات بانتظار المزامنة مع السحابة'}
                    </span>
                  )}

                  {/* Explicit Live Sync Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${syncStatusMeta.badgeClass}`}
                    data-testid="sync-status-badge"
                  >
                    {syncStatusMeta.isSpinning && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>{syncStatusMeta.label}</span>
                  </span>

                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    IndexedDB + localStorage نشط 📦
                  </span>

                  {pendingActionsCount > 0 && (
                    <span className="bg-orange-500/25 text-orange-200 border border-orange-400/50 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {pendingActionsCount} إجراء بانتظار المزامنة ⏳
                    </span>
                  )}

                  {isBackgroundSyncSupported ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                        backgroundSyncStatus === 'registered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }`}
                    >
                      <Radio className="w-3 h-3" />
                      {backgroundSyncStatus === 'registered'
                        ? 'المزامنة الخلفية (Background Sync API) مفعّلة ✓'
                        : 'Background Sync API مدعومة'}
                    </span>
                  ) : (
                    <span className="bg-slate-700/60 text-slate-300 border border-slate-600/60 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      المزامنة التلقائية عند الاتصال 🔄
                    </span>
                  )}
                </div>

                <p className="text-slate-200 text-xs font-medium mt-0.5">
                  متاح محلياً: {cachedProductsCount} منتج • {cachedTasksCount} مهمة • {cachedMerchantsCount} متجر
                  {isServiceWorkerReady ? ` • Service Worker جاهز (${OFFLINE_SYNC_TAG})` : ''}
                  {lastSyncError ? ` • سبب التعثر: ${lastSyncError}` : ''}
                  {lastSyncedAt && ` • آخر مزامنة: ${lastSyncedAt}`}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 border border-amber-500/40 active:scale-95 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>عرض المنتجات المحفوظة محلياً</span>
                <span className="bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded-md text-[10px]">
                  {cachedProductsCount}
                </span>
              </button>

              {isBackgroundSyncSupported && backgroundSyncStatus !== 'registered' && (
                <button
                  type="button"
                  onClick={handleEnableBackgroundSync}
                  className="px-3 py-1.5 bg-sky-600/80 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 border border-sky-400/40 active:scale-95 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>تفعيل المزامنة الخلفية</span>
                </button>
              )}

              {!isOffline && pendingActionsCount > 0 && (
                <button
                  type="button"
                  onClick={handleManualQueueSync}
                  disabled={isSyncingQueue}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 border border-emerald-400/40 active:scale-95 cursor-pointer"
                >
                  <CloudUpload className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingQueue ? 'جاري المزامنة...' : syncState === 'error' ? 'إعادة المحاولة الآن ⚡' : 'مزامنة فورية ⚡'}</span>
                </button>
              )}

              {isOffline && (
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 border border-amber-400/40 active:scale-95 cursor-pointer"
                  title="فحص الاتصال بالإنترنت مجدداً"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-white ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'جاري الفحص...' : 'فحص الاتصال 🔄'}</span>
                </button>
              )}

              {!isOffline && recentSyncedCount > 0 && pendingActionsCount === 0 && (
                <button
                  type="button"
                  onClick={() => setRecentSyncedCount(0)}
                  className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/50 transition-colors cursor-pointer"
                  aria-label="إغلاق إشعار المزامنة"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Locally Saved Products & Offline Action Queue */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label="المنتجات المحفوظة محلياً"
        >
          <div className="w-full max-w-3xl max-h-[88vh] flex flex-col bg-slate-950 border border-amber-500/35 rounded-2xl shadow-2xl overflow-hidden text-white">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-white">
                      المنتجات المحفوظة محلياً والمزامنة الخلفية
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${syncStatusMeta.badgeClass}`}>
                      {syncStatusMeta.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    عرض فوري للمنتجات المخزنة في IndexedDB / localStorage وإدارة الإجراءات المعلقة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs & Background Sync Status Bar */}
            <div className="px-5 py-3 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>المنتجات المحفوظة ({savedProducts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('queue')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'queue'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>طابور المزامنة ({pendingActions.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة منتج (أوفلاين)</span>
                </button>
              </div>
            </div>

            {/* Quick Add Offline Product Form */}
            {showQuickAdd && (
              <form
                onSubmit={handleQuickOfflineProductSubmit}
                className="px-5 py-4 bg-slate-900/90 border-b border-amber-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300">
                    إضافة منتج جديد للحفظ المحلي والمزامنة التلقائية
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <input
                    type="text"
                    placeholder="اسم المنتج..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="SKU..."
                    value={quickSku}
                    onChange={(e) => setQuickSku(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="السعر (ج.م)"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={quickPlatform}
                      onChange={(e) => setQuickPlatform(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="amazon">أمازون</option>
                      <option value="noon">نون</option>
                      <option value="jumia">جوميا</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSavingOffline}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shrink-0"
                    >
                      {isSavingOffline ? 'حفظ...' : 'حفظ'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'products' ? (
                <>
                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالاسم أو SKU أو المنصة في المنتجات المحفوظة محلياً..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {isLoadingProducts ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      جاري قراءة المنتجات المحفوظة محلياً...
                    </div>
                  ) : filteredSavedProducts.length === 0 ? (
                    <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3">
                      <Package className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-sm font-bold text-slate-200">
                        لا توجد منتجات محفوظة محلياً تطابق بحثك حالياً
                      </p>
                      <p className="text-xs text-slate-400">
                        يتم حفظ المنتجات تلقائياً عند تصفح كتالوج المنتجات، أو يمكنك إضافة منتج جديد في وضع الأوفلاين ليتم مزامنته لاحقاً.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredSavedProducts.map((product) => (
                        <div
                          key={`${product.offlineActionId || product.id}_${product.sku}`}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            product.isPendingSync
                              ? 'bg-amber-950/25 border-amber-500/45'
                              : 'bg-slate-900/75 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">
                                {product.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                SKU: {product.sku}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                product.isPendingSync
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                              }`}
                            >
                              {product.isPendingSync ? 'بانتظار المزامنة ⏳' : 'محفوظ محلياً 📦'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                            <span className="font-black text-amber-400">
                              {Number(product.price || 0).toLocaleString('ar-EG')} ج.م
                            </span>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span>المخزون: {product.stock ?? 0}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold uppercase">
                                {product.platform || 'amazon'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {pendingActions.length === 0 ? (
                    <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-200">
                        طابور المزامنة فارغ — جميع بياناتك محدثة!
                      </p>
                      <p className="text-xs text-slate-400">
                        أي منتج أو إجراء تقوم به أثناء انقطاع الاتصال سيظهر هنا وتتم مزامنته تلقائياً عند عودة الشبكة.
                      </p>
                    </div>
                  ) : (
                    pendingActions.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-slate-900/85 border border-amber-500/35 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-bold text-sm text-white truncate">{act.label}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                act.status === 'failed'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {act.status === 'failed' ? 'تحتاج إعادة محاولة' : 'معلق للمزامنة'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            SKU: {act.payload?.sku || '-'} • السعر: {act.payload?.price ?? 0} ج.م • أُضيف:{' '}
                            {new Date(act.createdAt).toLocaleString('ar-EG')}
                          </p>
                          {act.errorMessage && (
                            <p className="text-[11px] text-red-400">سبب التعثر: {act.errorMessage}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQueuedAction(act.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer shrink-0"
                          title="حذف من طابور الأوفلاين"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Radio
                  className={`w-4 h-4 ${
                    isBackgroundSyncSupported ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>
                  {isBackgroundSyncSupported
                    ? backgroundSyncStatus === 'registered'
                      ? `Background Sync API مفعّلة (${OFFLINE_SYNC_TAG}): ستتم المزامنة في الخلفية تلقائياً فور توفر الشبكة`
                      : 'Background Sync API مدعومة في هذا المتصفح'
                    : 'المتصفح لا يدعم Background Sync API — تعمل المزامنة التلقائية عبر مراقبة الشبكة المباشرة'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {pendingActions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleManualQueueSync}
                    disabled={isSyncingQueue}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{isSyncingQueue ? 'جاري المزامنة...' : 'مزامنة الآن ⚡'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>فحص الاتصال</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
