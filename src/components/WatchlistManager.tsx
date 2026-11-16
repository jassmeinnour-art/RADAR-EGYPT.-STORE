import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bookmark, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Search, 
  Zap, 
  Bell, 
  Building2, 
  Eye, 
  ArrowUpRight, 
  Layers, 
  Store,
  Tag,
  Clock,
  Calendar,
  Filter,
  DollarSign,
  ArrowRight,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Percent,
  Calculator,
  RefreshCw,
  X,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  List,
  BellOff,
  Settings,
  Play
} from 'lucide-react';
import { ProductData, WatchlistItem, WatchlistProductPriceAlertConfig } from '../types';
import { AddWatchlistManualModal } from './AddWatchlistManualModal';
import { 
  getWebNotificationPermission, 
  requestWebNotificationPermission, 
  simulateWatchlistPriceChange,
  getStoredWatchlist,
  saveStoredWatchlist,
  removeFromWatchlist as removeStoredItem,
  addToWatchlist as addStoredItem,
  updateWatchlistTargetPrice as updateStoredTargetPrice,
  toggleWatchlistPriceAlert,
  updateWatchlistProductPriceAlertConfig,
  triggerCompetitorPriceCheckForWatchlistItem,
  requestBrowserPermissionOnFirstAlertActivation,
  PricingEngineAlertEvaluationResult
} from '../services/watchlistNotificationService';
import { WatchlistNotificationModal } from './WatchlistNotificationModal';
import { AutoPricingSettingsModal } from './AutoPricingSettingsModal';
import { loadAutoPricingRules } from '../data/autoPricingEngineData';
import { AutoPricingRule } from '../types/autoPricing';

export interface WatchlistManagerProps {
  watchlist?: WatchlistItem[];
  onSelectProduct?: (product: ProductData) => void;
  onRemoveFromWatchlist?: (productId: string) => void;
  onAddNote?: (productId: string, note: string) => void;
  onUpdateTargetAlertPrice?: (productId: string, newTargetPrice: number) => void;
  onBulkUpdateTargetAlertPrices?: (updates: { productId: string; targetAlertPrice: number }[], syncWithActiveAlerts?: boolean) => void;
  onAddManualProduct?: (newItem: WatchlistItem) => void;
  onOpenAlertModal?: (product: ProductData) => void;
  onOpenScanner?: () => void;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

type BulkStrategy = 
  | 'percent_discount' 
  | 'fixed_amount_discount' 
  | 'wholesale_markup_percent' 
  | 'wholesale_markup_fixed' 
  | 'fixed_target_price';

type RoundingMode = 'none' | 'round_5' | 'round_10' | 'round_9_ending';

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  watchlist: propWatchlist,
  onSelectProduct = () => {},
  onRemoveFromWatchlist: propOnRemove,
  onAddNote = () => {},
  onUpdateTargetAlertPrice,
  onBulkUpdateTargetAlertPrices,
  onAddManualProduct,
  onOpenAlertModal = () => {},
  onOpenScanner = () => {},
  currency = 'ج.م',
  onShowToast,
}) => {
  const [internalWatchlist, setInternalWatchlist] = useState<WatchlistItem[]>(() => getStoredWatchlist());

  // Sync internal watchlist with custom events
  useEffect(() => {
    const handleSync = () => {
      setInternalWatchlist(getStoredWatchlist());
    };
    window.addEventListener('merchant_watchlist_updated', handleSync);
    window.addEventListener('merchant_watchlist_price_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('merchant_watchlist_updated', handleSync);
      window.removeEventListener('merchant_watchlist_price_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const watchlist = propWatchlist !== undefined ? propWatchlist : internalWatchlist;

  const handleRemoveItem = (prodId: string) => {
    if (propOnRemove) {
      propOnRemove(prodId);
    }
    removeStoredItem(prodId);
    setInternalWatchlist(getStoredWatchlist());
    if (onShowToast) {
      onShowToast('تمت إزالة المنتج من قائمة المتابعة بنجاح');
    }
  };
  const onRemoveFromWatchlist = handleRemoveItem;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'price_drop' | 'stockout_opportunity' | 'alerts_active'>('all');
  const [layoutViewMode, setLayoutViewMode] = useState<'cards' | 'list'>('cards');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Auto-Pricing Engine rules & per-product Price Alerts state
  const [autoPricingRules, setAutoPricingRules] = useState<AutoPricingRule[]>(() => loadAutoPricingRules());
  const [isAutoPricingModalOpen, setIsAutoPricingModalOpen] = useState(false);
  const [expandedAlertConfigId, setExpandedAlertConfigId] = useState<string | null>(null);
  const [testPriceInputs, setTestPriceInputs] = useState<Record<string, string>>({});
  const [testingAlertProductId, setTestingAlertProductId] = useState<string | null>(null);
  const [evalFeedbackByProduct, setEvalFeedbackByProduct] = useState<Record<string, PricingEngineAlertEvaluationResult>>({});

  useEffect(() => {
    const syncRules = () => {
      setAutoPricingRules(loadAutoPricingRules());
    };
    window.addEventListener('auto_pricing_rules_updated', syncRules);
    window.addEventListener('storage', syncRules);
    return () => {
      window.removeEventListener('auto_pricing_rules_updated', syncRules);
      window.removeEventListener('storage', syncRules);
    };
  }, []);

  // Web Notifications API state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [webNotifPermission, setWebNotifPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isTestingWebNotif, setIsTestingWebNotif] = useState(false);

  useEffect(() => {
    setWebNotifPermission(getWebNotificationPermission());
  }, []);

  // Manual Add Product Modal State
  const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false);

  // Single Item Target Price Quick-Edit state
  const [editingTargetPriceId, setEditingTargetPriceId] = useState<string | null>(null);
  const [singleTargetPriceInput, setSingleTargetPriceInput] = useState<number>(0);

  // Selection state for Bulk Operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Bulk Modal Configuration State
  const [strategy, setStrategy] = useState<BulkStrategy>('percent_discount');
  const [strategyValue, setStrategyValue] = useState<number>(5); // default 5% discount
  const [roundingMode, setRoundingMode] = useState<RoundingMode>('round_5');
  const [syncActiveAlerts, setSyncActiveAlerts] = useState<boolean>(true);
  const [customPriceOverrides, setCustomPriceOverrides] = useState<Record<string, number>>({});

  // Filtered items
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter(item => {
      if (!item || !item.product) return false;
      const title = item.product.title || '';
      const brand = item.product.brand || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (filterCategory === 'price_drop') {
        return item.priceTrend === 'down';
      }
      if (filterCategory === 'stockout_opportunity') {
        return item.competitorStockStatus === 'competitor_stockout_opportunity';
      }
      if (filterCategory === 'alerts_active') {
        return Boolean(item.priceAlertEnabled || item.priceAlertConfig?.enabled);
      }
      return true;
    });
  }, [watchlist, searchQuery, filterCategory]);

  // Selected items list
  const selectedItems = useMemo(() => {
    return watchlist.filter(item => selectedProductIds.includes(item.productId));
  }, [watchlist, selectedProductIds]);

  // Calculate summary stats
  const totalTracked = watchlist.length;
  const priceDropsCount = watchlist.filter(item => item.priceTrend === 'down').length;
  const stockOpportunities = watchlist.filter(item => item.competitorStockStatus === 'competitor_stockout_opportunity').length;
  const activePriceAlertsCount = watchlist.filter(item => Boolean(item.priceAlertEnabled || item.priceAlertConfig?.enabled)).length;
  const totalPotentialProfit = watchlist.reduce((acc, item) => {
    const lowest = item.product?.currentLowestPrice || 0;
    const wholesale = item.product?.estimatedWholesaleCost || 0;
    return acc + Math.max(0, lowest - wholesale);
  }, 0);

  // Selection handlers
  const handleToggleSelect = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedProductIds.length === filteredWatchlist.length && filteredWatchlist.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredWatchlist.map(item => item.productId));
    }
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
  };

  const handleSelectPriceDrops = () => {
    const drops = filteredWatchlist.filter(item => item.priceTrend === 'down').map(i => i.productId);
    setSelectedProductIds(drops);
  };

  const handleSelectStockOpportunities = () => {
    const ops = filteredWatchlist.filter(item => item.competitorStockStatus === 'competitor_stockout_opportunity').map(i => i.productId);
    setSelectedProductIds(ops);
  };

  // Helper to compute rounded price
  const applyRounding = (rawPrice: number, mode: RoundingMode): number => {
    if (mode === 'round_5') {
      return Math.round(rawPrice / 5) * 5;
    }
    if (mode === 'round_10') {
      return Math.round(rawPrice / 10) * 10;
    }
    if (mode === 'round_9_ending') {
      const tens = Math.floor(rawPrice / 10) * 10;
      return tens + 9;
    }
    return Math.round(rawPrice);
  };

  // Calculate target price for a single item under current bulk strategy
  const computeCalculatedTargetPrice = (item: WatchlistItem): number => {
    if (customPriceOverrides[item.productId] !== undefined) {
      return customPriceOverrides[item.productId];
    }

    const lowest = item.product?.currentLowestPrice || 2500;
    const wholesale = item.product?.estimatedWholesaleCost || 2000;
    let rawPrice = lowest;

    switch (strategy) {
      case 'percent_discount': {
        const discountPercent = Math.max(0, Math.min(90, strategyValue));
        rawPrice = lowest * (1 - discountPercent / 100);
        break;
      }
      case 'fixed_amount_discount': {
        const discountAmount = Math.max(0, strategyValue);
        rawPrice = Math.max(1, lowest - discountAmount);
        break;
      }
      case 'wholesale_markup_percent': {
        const markupPercent = Math.max(0, strategyValue);
        rawPrice = wholesale * (1 + markupPercent / 100);
        break;
      }
      case 'wholesale_markup_fixed': {
        const markupAmount = Math.max(0, strategyValue);
        rawPrice = wholesale + markupAmount;
        break;
      }
      case 'fixed_target_price': {
        rawPrice = Math.max(1, strategyValue);
        break;
      }
    }

    return applyRounding(rawPrice, roundingMode);
  };

  // Open Bulk Update Modal
  const handleOpenBulkModal = () => {
    if (selectedProductIds.length === 0) return;
    setCustomPriceOverrides({});
    setIsBulkModalOpen(true);
  };

  // Apply Bulk Updates
  const handleApplyBulkUpdates = () => {
    if (selectedItems.length === 0) return;

    const updates = selectedItems.map(item => ({
      productId: item.productId,
      targetAlertPrice: computeCalculatedTargetPrice(item)
    }));

    if (onBulkUpdateTargetAlertPrices) {
      onBulkUpdateTargetAlertPrices(updates, syncActiveAlerts);
    } else {
      const updateMap = new Map(updates.map(u => [u.productId, u.targetAlertPrice]));
      const nextList = getStoredWatchlist().map(item =>
        updateMap.has(item.productId)
          ? { ...item, targetAlertPrice: updateMap.get(item.productId) }
          : item
      );
      saveStoredWatchlist(nextList);
      setInternalWatchlist(nextList);
      onShowToast?.(`تم تحديث السعر المستهدف لـ ${updates.length} منتج بنجاح`);
    }
    setIsBulkModalOpen(false);
    setSelectedProductIds([]);
    setCustomPriceOverrides({});
  };

  // Single Item Note Edit
  const handleStartEditNote = (item: WatchlistItem) => {
    setEditingNoteId(item.productId);
    setTempNote(item.merchantNotes || '');
  };

  const handleSaveNote = (productId: string) => {
    onAddNote(productId, tempNote);
    const nextList = getStoredWatchlist().map(w =>
      w.productId === productId ? { ...w, merchantNotes: tempNote } : w
    );
    saveStoredWatchlist(nextList);
    setInternalWatchlist(nextList);
    setEditingNoteId(null);
  };

  // Single Item Target Alert Price Edit
  const handleStartEditTargetPrice = (item: WatchlistItem) => {
    setEditingTargetPriceId(item.productId);
    const lowest = item.product?.currentLowestPrice || 2500;
    setSingleTargetPriceInput(item.targetAlertPrice || Math.round(lowest * 0.95));
  };

  const handleSaveSingleTargetPrice = (productId: string) => {
    if (singleTargetPriceInput > 0) {
      if (onUpdateTargetAlertPrice) {
        onUpdateTargetAlertPrice(productId, singleTargetPriceInput);
      }
      const next = updateStoredTargetPrice(productId, singleTargetPriceInput);
      setInternalWatchlist(next);
      onShowToast?.(`تم تحديث السعر المستهدف للمنتج إلى ${singleTargetPriceInput.toLocaleString()} ${currency}`);
    }
    setEditingTargetPriceId(null);
  };

  // Per-Product Price Alert Handlers (Linked with Auto-Pricing Engine)
  const getCompetitorOptions = (item: WatchlistItem): string[] => {
    const names = new Set<string>();
    (item.product?.merchantOffers || []).forEach((offer) => {
      if (offer.merchantName) names.add(offer.merchantName);
    });
    if (item.lastPriceChangeSource) names.add(item.lastPriceChangeSource);
    if (item.priceAlertConfig?.targetCompetitorName && item.priceAlertConfig.targetCompetitorName !== 'any') {
      names.add(item.priceAlertConfig.targetCompetitorName);
    }
    ['أمازون مصر (Amazon.eg)', 'نون مصر (Noon Express)', 'جوميا مصر (Jumia Mall)'].forEach((m) =>
      names.add(m)
    );
    return Array.from(names);
  };

  const handleToggleProductPriceAlert = async (item: WatchlistItem) => {
    const currentEnabled = Boolean(item.priceAlertConfig ? item.priceAlertConfig.enabled : item.priceAlertEnabled);
    const nextEnabled = !currentEnabled;
    const defaultRuleId =
      item.priceAlertConfig?.linkedRuleId ||
      autoPricingRules.find((r) => r.isActive)?.id ||
      autoPricingRules[0]?.id;
    const updated = toggleWatchlistPriceAlert(item.productId, nextEnabled, {
      targetCompetitorName: item.priceAlertConfig?.targetCompetitorName || 'any',
      linkedRuleId: defaultRuleId,
    });
    setInternalWatchlist(updated);
    if (nextEnabled) {
      setExpandedAlertConfigId(item.productId);
      onShowToast?.(`🔔 تم تفعيل تنبيهات السعر لـ "${item.product.title}" وربطه بمحرك التسعير الآلي`);
      const permResult = await requestBrowserPermissionOnFirstAlertActivation();
      setWebNotifPermission(getWebNotificationPermission());
      if (permResult.prompted) {
        if (permResult.granted) {
          onShowToast?.('🔔 تم تفعيل إذن إشعارات المتصفح الفورية لتنبيهات السعر بنجاح');
        } else if (permResult.error) {
          onShowToast?.(permResult.error);
        }
      }
    } else {
      onShowToast?.(`🔕 تم إيقاف تنبيهات السعر لـ "${item.product.title}"`);
    }
  };

  const handleUpdateProductAlertConfig = (
    productId: string,
    partial: Partial<WatchlistProductPriceAlertConfig>,
    toastMsg?: string
  ) => {
    const updated = updateWatchlistProductPriceAlertConfig(productId, partial);
    setInternalWatchlist(updated);
    if (toastMsg) {
      onShowToast?.(toastMsg);
    }
  };

  const handleRunCompetitorPriceCheck = async (item: WatchlistItem) => {
    const basePrice = item.lastCheckedPrice || item.product?.currentLowestPrice || 1000;
    const rawVal = testPriceInputs[item.productId];
    const simulatedDropDefault = Math.max(50, Math.round(basePrice * 0.94));
    const parsedPrice = rawVal !== undefined && rawVal !== '' ? Number(rawVal) : simulatedDropDefault;
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      onShowToast?.('يرجى إدخال سعر منافس صحيح أكبر من صفر');
      return;
    }

    const chosenCompetitor =
      item.priceAlertConfig?.targetCompetitorName && item.priceAlertConfig.targetCompetitorName !== 'any'
        ? item.priceAlertConfig.targetCompetitorName
        : item.product?.merchantOffers?.[0]?.merchantName || 'أمازون مصر (Amazon.eg)';

    setTestingAlertProductId(item.productId);
    try {
      const result = await triggerCompetitorPriceCheckForWatchlistItem(
        item.productId,
        parsedPrice,
        chosenCompetitor,
        'السوق المصري'
      );
      setInternalWatchlist(getStoredWatchlist());
      setEvalFeedbackByProduct((prev) => ({ ...prev, [item.productId]: result }));
      onShowToast?.(result.reason);
    } finally {
      setTestingAlertProductId(null);
    }
  };

  const renderProductPriceAlertPanel = (item: WatchlistItem) => {
    const config = item.priceAlertConfig;
    const isEnabled = Boolean(config ? config.enabled : item.priceAlertEnabled);
    const competitors = getCompetitorOptions(item);
    const selectedCompetitor = config?.targetCompetitorName || 'any';
    const selectedRuleId =
      config?.linkedRuleId || autoPricingRules.find((r) => r.isActive)?.id || autoPricingRules[0]?.id || '';
    const activeRule = autoPricingRules.find((r) => r.id === selectedRuleId);
    const basePrice = item.lastCheckedPrice || item.product?.currentLowestPrice || 1000;
    const defaultTestPrice = Math.max(50, Math.round(basePrice * 0.94));
    const testPriceVal =
      testPriceInputs[item.productId] !== undefined
        ? testPriceInputs[item.productId]
        : String(defaultTestPrice);
    const evalFeedback = evalFeedbackByProduct[item.productId];
    const isTestingThis = testingAlertProductId === item.productId;

    return (
      <div
        className={`rounded-xl border p-3.5 space-y-3 text-xs transition-all ${
          isEnabled
            ? 'bg-indigo-50/60 border-indigo-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span className="font-black text-slate-900">
              إعدادات تنبيه السعر الفوري (مرتبط بمحرك التسعير الآلي)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAutoPricingModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>تعديل قواعد التسعير</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Competitor Selector */}
          <div className="space-y-1">
            <label
              htmlFor={`competitor-select-${item.productId}`}
              className="block text-[11px] font-bold text-slate-700"
            >
              المنافس المحدد للمراقبة:
            </label>
            <select
              id={`competitor-select-${item.productId}`}
              value={selectedCompetitor}
              onChange={(e) =>
                handleUpdateProductAlertConfig(
                  item.productId,
                  { targetCompetitorName: e.target.value, enabled: true },
                  e.target.value === 'any'
                    ? 'تم ضبط المراقبة على أي منافس بالسوق'
                    : `تم تحديد المنافس (${e.target.value}) للتنبيه الفوري`
                )
              }
              className="w-full h-9 px-2.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="any">أي منافس (أرخص سعر بالسوق)</option>
              {competitors.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Auto-Pricing Engine Rule */}
          <div className="space-y-1">
            <label
              htmlFor={`rule-select-${item.productId}`}
              className="block text-[11px] font-bold text-slate-700"
            >
              قاعدة محرك التسعير المطبقة:
            </label>
            <select
              id={`rule-select-${item.productId}`}
              value={selectedRuleId}
              onChange={(e) =>
                handleUpdateProductAlertConfig(
                  item.productId,
                  { linkedRuleId: e.target.value, enabled: true },
                  'تم ربط تنبيه السعر بقاعدة محرك التسعير المحددة'
                )
              }
              className="w-full h-9 px-2.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {autoPricingRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.title || rule.name}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Custom % Threshold */}
          <div className="space-y-1">
            <label
              htmlFor={`threshold-input-${item.productId}`}
              className="block text-[11px] font-bold text-slate-700"
            >
              عتبة التغير المخصصة % (اختياري):
            </label>
            <input
              id={`threshold-input-${item.productId}`}
              type="number"
              min={0}
              max={90}
              placeholder="حسب قاعدة المحرك"
              value={config?.customChangePercentThreshold ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? undefined : Number(e.target.value);
                handleUpdateProductAlertConfig(item.productId, {
                  customChangePercentThreshold: v,
                });
              }}
              className="w-full h-9 px-2.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Rule Summary + Notification Channels */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 border border-slate-200/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-600 space-y-0.5">
            {activeRule && (
              <div className="font-bold text-indigo-900">
                القاعدة النشطة: {activeRule.title || activeRule.name}
              </div>
            )}
            {config?.lastRecommendedPrice && (
              <div className="text-emerald-700 font-bold">
                آخر سعر مقترح من المحرك: {config.lastRecommendedPrice.toLocaleString()} {currency}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.notifyChannels?.inApp !== false}
                onChange={(e) =>
                  handleUpdateProductAlertConfig(item.productId, {
                    notifyChannels: {
                      inApp: e.target.checked,
                      browserPush: config?.notifyChannels?.browserPush !== false,
                      sound: config?.notifyChannels?.sound !== false,
                    },
                  })
                }
                className="w-3.5 h-3.5 rounded text-indigo-600"
              />
              <span>إشعار فوري بالتطبيق</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.notifyChannels?.browserPush !== false}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  handleUpdateProductAlertConfig(item.productId, {
                    notifyChannels: {
                      inApp: config?.notifyChannels?.inApp !== false,
                      browserPush: checked,
                      sound: config?.notifyChannels?.sound !== false,
                    },
                  });
                  if (checked) {
                    const permResult = await requestBrowserPermissionOnFirstAlertActivation({
                      forceIfDefault: true,
                    });
                    setWebNotifPermission(getWebNotificationPermission());
                    if (permResult.prompted && permResult.error) {
                      onShowToast?.(permResult.error);
                    }
                  }
                }}
                className="w-3.5 h-3.5 rounded text-indigo-600"
              />
              <span>إشعار المتصفح</span>
            </label>
          </div>
        </div>

        {/* Instant Price-Change Verification / Simulation Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-indigo-200/60">
          <div className="flex items-center gap-1.5 flex-1">
            <label
              htmlFor={`test-price-${item.productId}`}
              className="text-[11px] font-bold text-slate-700 shrink-0"
            >
              رصد سعر منافس جديد ({currency}):
            </label>
            <input
              id={`test-price-${item.productId}`}
              type="number"
              min={1}
              value={testPriceVal}
              onChange={(e) =>
                setTestPriceInputs((prev) => ({ ...prev, [item.productId]: e.target.value }))
              }
              className="w-28 h-8 px-2 text-xs font-bold bg-white border border-indigo-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={!isEnabled || isTestingThis}
            onClick={() => handleRunCompetitorPriceCheck(item)}
            className={`h-8 px-3 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isEnabled
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>{isTestingThis ? 'جاري التقييم...' : 'فحص وإرسال إشعار فوري ⚡'}</span>
          </button>
        </div>

        {evalFeedback && (
          <div
            className={`p-2 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${
              evalFeedback.triggered
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {evalFeedback.triggered ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span>{evalFeedback.reason}</span>
          </div>
        )}
      </div>
    );
  };

  const isAllFilteredSelected = filteredWatchlist.length > 0 && selectedProductIds.length === filteredWatchlist.length;

  return (
    <div className="space-y-6 relative">
      
      {/* Header & Metric Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Bookmark className="w-6 h-6 fill-sky-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 font-['Alexandria']">
                  قائمة المتابعة والرصد التنافسي
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {totalTracked} منتجات مراقبة
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع حركة أسعار المنافسين، إدارة السعر المستهدف للتنبيه، وتحديث الأسعار جماعياً لاقتناص فرص الـ Buy Box
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddManualModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج يدوياً</span>
            </button>
            <button
              onClick={onOpenScanner}
              className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>مسح الكاميرا / الرادار</span>
            </button>
          </div>
        </div>

        {/* Web Notifications API Intelligence Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black font-['Alexandria']">
                  نظام تنبيهات المتصفح لأسعار المنافسين (Web Notifications API)
                </span>
                {webNotifPermission === 'granted' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    مفعل ويعمل لحظياً ✓
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/30">
                    بحاجة لتفعيل الإذن 🔔
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تنبيهات تلقائية منبثقة لسطح المكتب والموبايل فور رصد أي انخفاض أو صعود بأسعار المنافسين للمنتجات المضافة هنا
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {webNotifPermission !== 'granted' && (
              <button
                type="button"
                onClick={async () => {
                  const res = await requestWebNotificationPermission();
                  setWebNotifPermission(res.permission);
                  if (res.granted) {
                    if (onShowToast) onShowToast('تم تفعيل إشعارات الويب للمتصفح بنجاح! 🔔');
                  } else if (res.error) {
                    if (onShowToast) onShowToast(res.error);
                  }
                }}
                className="h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>تفعيل إشعارات المتصفح 🔔</span>
              </button>
            )}

            <button
              type="button"
              disabled={isTestingWebNotif}
              onClick={async () => {
                setIsTestingWebNotif(true);
                try {
                  const res = await simulateWatchlistPriceChange();
                  if (onShowToast) onShowToast(res.message);
                } finally {
                  setIsTestingWebNotif(false);
                }
              }}
              className="h-8 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="محاكاة هبوط سعر منافس لمنتج مراقب وإرسال إشعار فوري عبر المتصفح"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isTestingWebNotif ? 'جاري الرصد...' : '🧪 تجربة رصد هبوط سعر'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNotifModalOpen(true)}
              className="h-8 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>مركز التنبيهات</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Intelligence Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">إجمالي المنتجات المراقبة</span>
              <strong className="text-base font-black text-slate-900">{totalTracked} منتجات</strong>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-medium block">منتجات انخفض سعر منافسيها</span>
              <strong className="text-base font-black text-emerald-900">{priceDropsCount} منتج (فرصة خفض)</strong>
            </div>
          </div>

          <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-sky-800 font-medium block">فرص نفاذ مخزون المنافسين</span>
              <strong className="text-base font-black text-sky-900">{stockOpportunities} فرصة Buy Box</strong>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-blue-700 font-medium block">متوسط هامش الربح المتوقع</span>
              <strong className="text-base font-black text-blue-900">+{Math.round(totalPotentialProfit / (totalTracked || 1)).toLocaleString()} {currency}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & Bulk Select Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المنتجات المتابعة أو الماركة..."
              className="w-full h-9 pr-9 pl-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({watchlist.length})
            </button>

            <button
              onClick={() => setFilterCategory('price_drop')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterCategory === 'price_drop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>هبوط الأسعار ({priceDropsCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('stockout_opportunity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterCategory === 'stockout_opportunity'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>فرص نفاذ المخزون ({stockOpportunities})</span>
            </button>

            <button
              onClick={() => setFilterCategory('alerts_active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterCategory === 'alerts_active'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>تنبيهات السعر المفعّلة ({activePriceAlertsCount})</span>
            </button>

            {/* View Mode Switcher: Cards vs List */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0 mr-auto">
              <button
                id="btn-watchlist-view-cards"
                onClick={() => setLayoutViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutViewMode === 'cards'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الشرائح والبطاقات (مفصل للشاشات العريضة)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>عرض الشرائح</span>
              </button>
              <button
                id="btn-watchlist-view-list"
                onClick={() => setLayoutViewMode('list')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutViewMode === 'list'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض القائمة المدمجة (جدول سريع)"
              >
                <List className="w-3.5 h-3.5" />
                <span>قائمة مدمجة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Multi-Select Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className={`h-7 px-2.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] ${
                isAllFilteredSelected
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAllFilteredSelected ? 'إلغاء تحديد المعروض' : 'تحديد كل المعروض'}</span>
            </button>

            {priceDropsCount > 0 && (
              <button
                onClick={handleSelectPriceDrops}
                className="h-7 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              >
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                <span>تحديد منتجات الهبوط ({priceDropsCount})</span>
              </button>
            )}

            {stockOpportunities > 0 && (
              <button
                onClick={handleSelectStockOpportunities}
                className="h-7 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              >
                <Zap className="w-3 h-3 text-sky-600" />
                <span>تحديد نفاذ المخزون ({stockOpportunities})</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            {selectedProductIds.length > 0 ? (
              <span className="font-bold text-indigo-700">
                تم اختيار {selectedProductIds.length} من أصل {filteredWatchlist.length} منتجات
              </span>
            ) : (
              <span>حدد منتجاً واحداً أو أكثر لتعديل الأسعار المستهدفة جماعياً</span>
            )}
          </div>
        </div>
      </div>

      {/* STICKY BULK ACTIONS BAR (When Items are Selected) */}
      {selectedProductIds.length > 0 && (
        <div className="sticky top-3 z-30 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  إجراء جماعي على {selectedProductIds.length} منتجات محددة
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 text-[10px] font-bold">
                  تعديل الأسعار المستهدفة للتنبيه
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/80 mt-0.5">
                تطبيق خصم مئوي، مبلغ ثابت، أو هامش ربح محدد فوق سعر الجملة لجميع المنتجات دفعة واحدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDeselectAll}
              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              إلغاء التحديد
            </button>

            <button
              onClick={handleOpenBulkModal}
              className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>تعديل السعر المستهدف جماعياً ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Watchlist Cards Grid */}
      {filteredWatchlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد منتجات مطابقة في قائمة المتابعة</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يمكنك حفظ أي منتج في قائمة المتابعة من شاشة الرادار أو مسح منتج جديد بالكاميرا لمراقبة أسعار منافسيه بشكل دوري.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsAddManualModalOpen(true)}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black inline-flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج يدوياً (رابط وسعر مستهدف)</span>
            </button>
            <button
              onClick={onOpenScanner}
              className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>مسح منتج بالكاميرا</span>
            </button>
          </div>
        </div>
      ) : layoutViewMode === 'cards' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4.5">
          {filteredWatchlist.map((item) => {
            const product = item.product;
            const lowestPrice = product.currentLowestPrice;
            const wholesaleCost = product.estimatedWholesaleCost;
            const profit = Math.max(0, lowestPrice - wholesaleCost);
            const profitPercent = Math.round((profit / wholesaleCost) * 100);
            const isEditingNote = editingNoteId === item.productId;
            const isEditingTargetPrice = editingTargetPriceId === item.productId;
            const isSelected = selectedProductIds.includes(item.productId);

            // Target Alert Price details
            const targetAlertPrice = item.targetAlertPrice || Math.round(lowestPrice * 0.95);
            const targetDiffAmount = targetAlertPrice - lowestPrice;
            const targetDiffPercent = Math.round((targetDiffAmount / lowestPrice) * 100);
            const targetProfit = targetAlertPrice - wholesaleCost;
            const targetProfitPercent = Math.round((targetProfit / wholesaleCost) * 100);

            return (
              <div 
                key={item.productId} 
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs hover:shadow-md space-y-4 ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  
                  {/* Select Checkbox + Product Info & Thumbnail */}
                  <div className="flex items-start gap-3.5 flex-1">
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(item.productId)}
                      className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-300'
                      }`}
                      title={isSelected ? 'إلغاء التحديد' : 'تحديد للتعديل الجماعي'}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {product.brand}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                          {product.category}
                        </span>
                        {item.priceTrend === 'down' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span>هبط السعر {Math.abs(item.priceChangePercent)}%</span>
                          </span>
                        )}
                        {item.competitorStockStatus === 'competitor_stockout_opportunity' && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-200 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-sky-600" />
                            <span>فرصة نفاذ مخزون منافس</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>أضيف بتاريخ: {item.addedAt}</span>
                        <span>•</span>
                        <span>متاح لدى {product.merchantOffers?.length || 0} منصات ومتاجر</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">سعر الجملة: {wholesaleCost.toLocaleString()} {currency} (شارع عبد العزيز)</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing Comparison Panel & Target Price Badge */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                    
                    {/* Current Lowest Competitor Price */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-right flex-1 sm:flex-initial sm:min-w-[150px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        أقل سعر منافس حالياً
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900">
                          {lowestPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{currency}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        هامش المنافسة: +{profit.toLocaleString()} {currency} ({profitPercent}%)
                      </span>
                    </div>

                    {/* Target Alert Price Box (Interactive & Editable) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-200 rounded-xl p-3 text-right flex-1 sm:flex-initial sm:min-w-[170px]">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold text-indigo-900 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-indigo-600" />
                          <span>السعر المستهدف للتنبيه</span>
                        </span>
                        {!isEditingTargetPrice && (
                          <button
                            onClick={() => handleStartEditTargetPrice(item)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                            title="تعديل السعر المستهدف لهذا المنتج"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>
                        )}
                      </div>

                      {isEditingTargetPrice ? (
                        <div className="space-y-1.5 mt-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={singleTargetPriceInput}
                              onChange={(e) => setSingleTargetPriceInput(Number(e.target.value))}
                              className="w-24 h-7 text-xs font-bold px-2 bg-white border border-indigo-300 rounded-md focus:outline-none text-slate-900"
                            />
                            <span className="text-[10px] font-bold text-slate-500">{currency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTargetPriceId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() => handleSaveSingleTargetPrice(item.productId)}
                              className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer"
                            >
                              حفظ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-indigo-950">
                              {targetAlertPrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-indigo-700">{currency}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-[10px] font-medium">
                            <span className="text-indigo-700 font-bold">
                              {targetDiffAmount < 0 ? `${targetDiffAmount.toLocaleString()} ${currency} (${targetDiffPercent}%)` : `+${targetDiffAmount} ${currency}`}
                            </span>
                            <span className={targetProfit >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                              ربح: +{targetProfit.toLocaleString()} {currency}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                </div>

                {/* Merchant Private Notes Section */}
                <div className="bg-sky-50/50 border border-sky-200/70 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sky-900 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>ملاحظات التاجر واستراتيجية البيع:</span>
                    </span>
                    {!isEditingNote && (
                      <button
                        onClick={() => handleStartEditNote(item)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        تعديل الملاحظة
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="أدخل ملاحظاتك حول هذا المنتج وموردي الجملة ومواعيد الشراء..."
                        className="w-full text-xs p-2 bg-white border border-sky-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded-md cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleSaveNote(item.productId)}
                          className="px-3 py-1 text-[11px] font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-md cursor-pointer"
                        >
                          حفظ الملاحظة
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {item.merchantNotes || 'لا توجد ملاحظات مسجلة بعد. اضغط تعديل لإضافة استراتيجية الشراء أو اسم موزع الجملة.'}
                    </p>
                  )}
                </div>

                {/* Per-Product Price Alerts Strip (تنبيهات السعر + محرك التسعير الآلي) */}
                {(() => {
                  const isAlertEnabled = Boolean(
                    item.priceAlertConfig ? item.priceAlertConfig.enabled : item.priceAlertEnabled
                  );
                  const isConfigOpen = expandedAlertConfigId === item.productId;
                  const compLabel =
                    item.priceAlertConfig?.targetCompetitorName &&
                    item.priceAlertConfig.targetCompetitorName !== 'any'
                      ? item.priceAlertConfig.targetCompetitorName
                      : 'أي منافس بالسوق';
                  const linkedRule = autoPricingRules.find(
                    (r) => r.id === item.priceAlertConfig?.linkedRuleId
                  );

                  return (
                    <div className="space-y-2">
                      <div
                        className={`rounded-xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs transition-all ${
                          isAlertEnabled
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAlertEnabled}
                            aria-label={`تنبيهات السعر لـ ${product.title}`}
                            onClick={() => handleToggleProductPriceAlert(item)}
                            className={`h-7 px-3 rounded-lg font-black text-[11px] flex items-center gap-1.5 transition cursor-pointer ${
                              isAlertEnabled
                                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isAlertEnabled ? (
                              <Bell className="w-3.5 h-3.5" />
                            ) : (
                              <BellOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{isAlertEnabled ? 'تنبيهات السعر: مفعّل' : 'تفعيل تنبيهات السعر'}</span>
                          </button>

                          {isAlertEnabled && (
                            <div className="text-[11px] text-emerald-900 font-bold truncate">
                              <span>المنافس: {compLabel}</span>
                              {linkedRule && (
                                <span className="text-indigo-700 mr-2">
                                  • {linkedRule.title || linkedRule.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAlertConfigId(isConfigOpen ? null : item.productId)
                          }
                          className="h-7 px-2.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Settings className="w-3 h-3" />
                          <span>{isConfigOpen ? 'إخفاء الإعدادات' : 'إعدادات التنبيه والمحرك'}</span>
                        </button>
                      </div>

                      {isConfigOpen && renderProductPriceAlertPanel(item)}
                    </div>
                  );
                })()}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض في الرادار والتسعير الفوري</span>
                    </button>

                    <button
                      onClick={() => onOpenAlertModal(product)}
                      className="h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>تفعيل تنبيه واتساب فوري</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSelect(item.productId)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {isSelected ? 'إلغاء التحديد الجماعي' : 'تحديد للتعديل الجماعي'}
                    </button>

                    <button
                      onClick={() => onRemoveFromWatchlist(item.productId)}
                      className="h-8 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="حذف من قائمة المتابعة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إزالة من المتابعة</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Compact List / Table Presentation */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      onClick={handleSelectAllFiltered}
                      className="cursor-pointer"
                      title={isAllFilteredSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 inline" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 inline" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">المنتج والتصنيف</th>
                  <th className="py-3 px-3">حالة السعر والمخزون</th>
                  <th className="py-3 px-3">أقل سعر منافس</th>
                  <th className="py-3 px-3">سعر الجملة وهامش الربح</th>
                  <th className="py-3 px-3">السعر المستهدف للتنبيه</th>
                  <th className="py-3 px-3">تنبيهات السعر</th>
                  <th className="py-3 px-3">الملاحظات</th>
                  <th className="py-3 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredWatchlist.map((item) => {
                  const product = item.product;
                  const lowestPrice = product.currentLowestPrice;
                  const wholesaleCost = product.estimatedWholesaleCost;
                  const profit = Math.max(0, lowestPrice - wholesaleCost);
                  const profitPercent = Math.round((profit / wholesaleCost) * 100);
                  const isEditingNote = editingNoteId === item.productId;
                  const isEditingTargetPrice = editingTargetPriceId === item.productId;
                  const isSelected = selectedProductIds.includes(item.productId);
                  const isAlertEnabled = Boolean(
                    item.priceAlertConfig ? item.priceAlertConfig.enabled : item.priceAlertEnabled
                  );
                  const isConfigOpen = expandedAlertConfigId === item.productId;

                  const targetAlertPrice = item.targetAlertPrice || Math.round(lowestPrice * 0.95);
                  const targetDiffAmount = targetAlertPrice - lowestPrice;
                  const targetDiffPercent = Math.round((targetDiffAmount / lowestPrice) * 100);

                  return (
                    <React.Fragment key={item.productId}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 border-r-4 border-indigo-600' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(item.productId)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Product info */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-[200px] sm:max-w-[240px]">
                            <span className="font-bold text-slate-900 truncate block text-xs">
                              {product.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-700">{product.brand}</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-medium">{product.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Trend & Stock Badges */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {item.priceTrend === 'down' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <TrendingDown className="w-3 h-3" />
                              <span>هبط {Math.abs(item.priceChangePercent)}%</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              <Clock className="w-3 h-3" />
                              <span>مستقر</span>
                            </span>
                          )}
                          {item.competitorStockStatus === 'competitor_stockout_opportunity' && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                              <Zap className="w-3 h-3 text-sky-600" />
                              <span>نفاذ مخزون منافس</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Lowest Competitor Price */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">
                          {lowestPrice.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          متاح لدى {product.merchantOffers?.length || 0} متاجر
                        </span>
                      </td>

                      {/* Wholesale Cost & Margin */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-600 font-medium">
                          جملة: {wholesaleCost.toLocaleString()} {currency}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600">
                          هامش: +{profit.toLocaleString()} {currency} ({profitPercent}%)
                        </div>
                      </td>

                      {/* Target Alert Price */}
                      <td className="py-3 px-3">
                        {isEditingTargetPrice ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={singleTargetPriceInput}
                              onChange={(e) => setSingleTargetPriceInput(Number(e.target.value))}
                              className="w-20 h-6 text-xs font-bold px-1.5 bg-white border border-indigo-300 rounded focus:outline-none text-slate-900"
                            />
                            <button
                              onClick={() => handleSaveSingleTargetPrice(item.productId)}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingTargetPriceId(null)}
                              className="px-1 py-0.5 text-[10px] text-slate-600 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div>
                              <span className="font-black text-indigo-950 text-xs">
                                {targetAlertPrice.toLocaleString()} {currency}
                              </span>
                              <span className="block text-[10px] text-indigo-600 font-medium">
                                {targetDiffAmount >= 0 ? `+${targetDiffAmount}` : targetDiffAmount} {currency} ({targetDiffPercent}%)
                              </span>
                            </div>
                            <button
                              onClick={() => handleStartEditTargetPrice(item)}
                              className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                              title="تعديل السعر المستهدف"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Price Alerts Toggle & Settings Trigger */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAlertEnabled}
                            onClick={() => handleToggleProductPriceAlert(item)}
                            className={`px-2 py-1 rounded-md text-[10px] font-black inline-flex items-center gap-1 cursor-pointer ${
                              isAlertEnabled
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isAlertEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                            <span>{isAlertEnabled ? 'مفعّل' : 'متوقف'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedAlertConfigId(isConfigOpen ? null : item.productId)}
                            className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            {isConfigOpen ? 'إغلاق الإعدادات' : 'تخصيص المحرك'}
                          </button>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3">
                        {isEditingNote ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              className="w-32 h-6 text-[11px] px-1.5 bg-white border border-slate-300 rounded focus:outline-none text-slate-900"
                            />
                            <button
                              onClick={() => handleSaveNote(item.productId)}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer"
                            >
                              حفظ
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleStartEditNote(item)}
                            className="text-[11px] text-slate-600 hover:text-indigo-700 cursor-pointer truncate max-w-[140px]"
                            title={item.merchantNotes || item.note || 'انقر لإضافة ملاحظة'}
                          >
                            {item.merchantNotes || item.note || <span className="text-slate-300 italic">+ إضافة ملاحظة</span>}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenAlertModal(product)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            title="تفعيل تنبيه واتساب"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectProduct(product)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            title="فحص الرادار ومقارنة المنافسين"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemoveFromWatchlist(item.productId)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                            title="حذف من المتابعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isConfigOpen && (
                      <tr className="bg-indigo-50/30">
                        <td colSpan={9} className="p-3">
                          {renderProductPriceAlertPanel(item)}
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK UPDATE TARGET ALERT PRICE MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                    تعديل السعر المستهدف للتنبيه جماعياً
                  </h3>
                  <p className="text-xs text-slate-500">
                    تعديل الأسعار المستهدفة لـ <span className="font-bold text-indigo-600">({selectedItems.length}) منتجات محددة</span> دفعة واحدة مع حساب الأرباح التلقائي
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strategy Selector Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                اختر استراتيجية تحديث السعر المستهدف:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                
                {/* 1. Percent Discount from Lowest */}
                <button
                  type="button"
                  onClick={() => { setStrategy('percent_discount'); setStrategyValue(5); }}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    strategy === 'percent_discount'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">نسبة تخفيض من أقل سعر</span>
                    <Percent className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    خصم نسبة مئوية (مثلاً: -5% أو -10%) من أقل سعر منافس حالي
                  </p>
                </button>

                {/* 2. Fixed Amount Discount */}
                <button
                  type="button"
                  onClick={() => { setStrategy('fixed_amount_discount'); setStrategyValue(100); }}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    strategy === 'fixed_amount_discount'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">خصم مبلغ ثابت بالجنيه</span>
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    خصم قيمة ثابتة (مثلاً: -100 ج.م) تحت أقل سعر منافس
                  </p>
                </button>

                {/* 3. Wholesale Markup Percent */}
                <button
                  type="button"
                  onClick={() => { setStrategy('wholesale_markup_percent'); setStrategyValue(12); }}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    strategy === 'wholesale_markup_percent'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">هامش ربح فوق سعر الجملة (%)</span>
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    سعر الجملة كاش + هامش ربح مضمون (مثلاً: +12%)
                  </p>
                </button>

                {/* 4. Wholesale Markup Fixed Amount */}
                <button
                  type="button"
                  onClick={() => { setStrategy('wholesale_markup_fixed'); setStrategyValue(150); }}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer ${
                    strategy === 'wholesale_markup_fixed'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">ربح ثابت فوق الجملة (ج.م)</span>
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    سعر الجملة + ربح نقدي ثابت (مثلاً: +150 ج.م لكل قطعة)
                  </p>
                </button>

                {/* 5. Custom Fixed Target Price */}
                <button
                  type="button"
                  onClick={() => { setStrategy('fixed_target_price'); setStrategyValue(2000); }}
                  className={`p-3 rounded-2xl text-right border transition-all cursor-pointer sm:col-span-2 lg:col-span-2 ${
                    strategy === 'fixed_target_price'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">سعر موحد محدد لجميع المنتجات المحددة</span>
                    <Tag className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    تعيين رقم سعر موحد بالجنيه لجميع المنتجات المحددة
                  </p>
                </button>

              </div>
            </div>

            {/* Value Inputs & Rounding Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>
                    {strategy === 'percent_discount' && 'نسبة الخصم المطلوبة من أقل سعر منافس:'}
                    {strategy === 'fixed_amount_discount' && 'قيمة الخصم بالجنيه المصري:'}
                    {strategy === 'wholesale_markup_percent' && 'نسبة هامش الربح فوق سعر الجملة:'}
                    {strategy === 'wholesale_markup_fixed' && 'قيمة الربح الصافي فوق الجملة بالجنيه:'}
                    {strategy === 'fixed_target_price' && 'السعر الموحد بالجنيه المصري:'}
                  </span>
                  <span className="text-[11px] text-indigo-600 font-bold">
                    {strategy.includes('percent') ? `${strategyValue}%` : `${strategyValue.toLocaleString()} ${currency}`}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={strategyValue}
                    onChange={(e) => setStrategyValue(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900"
                  />
                  <span className="px-3 py-2 bg-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shrink-0">
                    {strategy.includes('percent') ? '%' : currency}
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                {strategy === 'percent_discount' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[3, 5, 8, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setStrategyValue(pct)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          strategyValue === pct 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                )}

                {strategy === 'fixed_amount_discount' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[50, 100, 150, 200, 300].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setStrategyValue(amt)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          strategyValue === amt 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        -{amt} ج.م
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rounding Mode Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  طريقة تقريب السعر (سيكولوجية التسعير المصري):
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoundingMode('round_5')}
                    className={`p-2 rounded-xl text-right border text-xs font-bold transition-all cursor-pointer ${
                      roundingMode === 'round_5'
                        ? 'bg-indigo-100/70 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>لأقرب 5 ج.م</span>
                    <span className="text-[10px] font-normal text-slate-500 block">(مثل: 2,495 ج.م)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoundingMode('round_9_ending')}
                    className={`p-2 rounded-xl text-right border text-xs font-bold transition-all cursor-pointer ${
                      roundingMode === 'round_9_ending'
                        ? 'bg-indigo-100/70 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>نهاية بـ 9 ج.م</span>
                    <span className="text-[10px] font-normal text-slate-500 block">(مثل: 2,499 ج.م)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoundingMode('round_10')}
                    className={`p-2 rounded-xl text-right border text-xs font-bold transition-all cursor-pointer ${
                      roundingMode === 'round_10'
                        ? 'bg-indigo-100/70 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>لأقرب 10 ج.م</span>
                    <span className="text-[10px] font-normal text-slate-500 block">(مثل: 2,500 ج.م)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoundingMode('none')}
                    className={`p-2 rounded-xl text-right border text-xs font-bold transition-all cursor-pointer ${
                      roundingMode === 'none'
                        ? 'bg-indigo-100/70 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>بدون تقريب خاص</span>
                    <span className="text-[10px] font-normal text-slate-500 block">(حساب مباشر)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Interactive Live Preview Table for Selected Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>معاينة فورية للأسعار المستهدفة الجديدة وهوامش الأرباح:</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  يمكنك تعديل السعر الناتج لأي منتج يدوياً في الجدول
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="p-3">المنتج</th>
                        <th className="p-3">أقل سعر منافس</th>
                        <th className="p-3">سعر الجملة</th>
                        <th className="p-3">السعر المستهدف القديم</th>
                        <th className="p-3 text-indigo-800">السعر المستهدف الجديد</th>
                        <th className="p-3">هامش الربح المتوقع</th>
                        <th className="p-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItems.map((item) => {
                        const product = item.product;
                        const lowest = product.currentLowestPrice;
                        const wholesale = product.estimatedWholesaleCost;
                        const oldTarget = item.targetAlertPrice || Math.round(lowest * 0.95);
                        const newTarget = computeCalculatedTargetPrice(item);
                        const profit = newTarget - wholesale;
                        const profitMargin = Math.round((profit / wholesale) * 100);
                        const isLoss = newTarget < wholesale;
                        const isLowMargin = profitMargin < 5 && !isLoss;

                        return (
                          <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 flex items-center gap-2.5">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                              />
                              <div className="truncate max-w-[180px]">
                                <span className="font-bold text-slate-900 block truncate">{product.title}</span>
                                <span className="text-[10px] text-slate-500">{product.brand}</span>
                              </div>
                            </td>

                            <td className="p-3 font-medium text-slate-800">
                              {lowest.toLocaleString()} {currency}
                            </td>

                            <td className="p-3 text-slate-600 font-medium">
                              {wholesale.toLocaleString()} {currency}
                            </td>

                            <td className="p-3 text-slate-400 line-through">
                              {oldTarget.toLocaleString()} {currency}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={newTarget}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setCustomPriceOverrides(prev => ({
                                      ...prev,
                                      [item.productId]: val
                                    }));
                                  }}
                                  className={`w-24 h-8 px-2 text-xs font-bold rounded-lg border focus:outline-none ${
                                    isLoss 
                                      ? 'border-rose-400 bg-rose-50 text-rose-900' 
                                      : 'border-indigo-300 bg-indigo-50/50 text-indigo-950 focus:bg-white'
                                  }`}
                                />
                                <span className="text-[10px] font-bold text-slate-500">{currency}</span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className={`font-bold ${isLoss ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {profit >= 0 ? `+${profit.toLocaleString()}` : `${profit.toLocaleString()}`} {currency}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  ({profitMargin}%)
                                </span>
                              </div>
                            </td>

                            <td className="p-3 text-center">
                              {isLoss ? (
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>أقل من الجملة</span>
                                </span>
                              ) : isLowMargin ? (
                                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold inline-flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3 text-sky-600" />
                                  <span>هامش ضئيل</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>مربح وآمن</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sync Active Alerts Checkbox */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncActiveAlerts}
                  onChange={(e) => setSyncActiveAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    مزامنة وتحديث تنبيهات الواتساب والتطبيق النشطة تلقائياً
                  </span>
                  <span className="text-[11px] text-slate-500">
                    سيتم إرسال إشعار فوري على رقم هاتفك بالواتساب عندما يصل أي منافس لهذه الأسعار الجديدة.
                  </span>
                </div>
              </label>

              <Bell className="w-5 h-5 text-indigo-600 shrink-0" />
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="h-10 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                إلغاء التعديل
              </button>

              <button
                type="button"
                onClick={handleApplyBulkUpdates}
                className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تطبيق الأسعار المستهدفة على ({selectedItems.length}) منتجات الآن</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Add Product Modal */}
      <AddWatchlistManualModal
        isOpen={isAddManualModalOpen}
        onClose={() => setIsAddManualModalOpen(false)}
        onAdd={(newItem) => {
          if (onAddManualProduct) {
            onAddManualProduct(newItem);
          } else {
            const updated = addStoredItem(newItem.product, newItem.targetAlertPrice, newItem.merchantNotes);
            setInternalWatchlist(updated);
            onShowToast?.(`تمت إضافة "${newItem.product.title}" إلى قائمة المتابعة بنجاح`);
          }
        }}
        currency={currency}
      />

      {/* Watchlist Web Notifications Modal */}
      <WatchlistNotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onNavigateToRadar={(prodId) => {
          const found = watchlist.find(w => w.productId === prodId);
          if (found) {
            onSelectProduct(found.product);
          }
        }}
        onShowToast={onShowToast}
      />

      {/* Auto-Pricing Engine Rules Modal */}
      <AutoPricingSettingsModal
        isOpen={isAutoPricingModalOpen}
        onClose={() => setIsAutoPricingModalOpen(false)}
        onShowToast={onShowToast}
      />

    </div>
  );
};

export default WatchlistManager;
