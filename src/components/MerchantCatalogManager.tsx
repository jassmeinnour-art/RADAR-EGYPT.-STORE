import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Store,
  RefreshCw,
  Search,
  Filter,
  Key,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Edit3,
  Copy,
  Check,
  DollarSign,
  Package,
  Truck,
  Layers,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
  X,
  Eye,
  Info,
  ChevronDown,
  Lock,
  Crown,
  Tag,
  Image as ImageIcon,
  Pin,
  PinOff
} from 'lucide-react';
import { 
  MerchantCatalogProduct, 
  MerchantCatalogPricingStatus, 
  CompetitorOfferDetail, 
  MerchantRepricingRule,
  RepricingAuditLogEntry,
  RemoteMerchantClient 
} from '../types';
import {
  extractAutoTags,
  autoTagProductCatalog,
  ProductAutoTag
} from '../utils/productAutoTagger';
import {
  loadMerchantCatalog,
  saveMerchantCatalog,
  pullLiveCatalogForMerchant,
  refreshMerchantCompetitorPricing,
  updateMerchantProductPrice,
  calculateCatalogSummary,
  evaluatePricingCompetitiveness,
  loadMerchantRepricingAuditLog,
  updateProductRepricingRule,
  toggleProductRepricer,
  executeAutomatedRepricingForMerchant,
  ensureDefaultRepricingRule
} from '../utils/merchantCatalogManager';
import { generateAiTags } from '../utils/aiTagGenerator';
import { loadAllRegisteredMerchants, evaluateMerchantSubscriptionState } from '../utils/platformLaunchHelper';
import { ExportReportsButton } from './ExportReportsButton';
import { exportMerchantCatalogPricesToSpreadsheet } from '../utils/competitorPriceExport';
import {
  MerchantProfile,
  getMerchantProfiles,
  getActiveMerchantProfile,
  setActiveMerchantProfile
} from '../services/merchantProfileService';
import { MerchantProfilesModal } from './MerchantProfilesModal';
import { sendWhatsAppMessageToPhone } from '../services/whatsappService';
import { SortableDashboardGrid, SortableDashboardCard } from './SortableDashboardGrid';

interface MerchantCatalogManagerProps {
  selectedMerchant?: RemoteMerchantClient | null;
  onOpenManageApisModal?: (merchantId?: string) => void;
  onShowToast?: (message: string) => void;
}

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
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
  } catch (e) {
    return <span>{text}</span>;
  }
};

export const MerchantCatalogManager: React.FC<MerchantCatalogManagerProps> = ({
  selectedMerchant,
  onOpenManageApisModal,
  onShowToast
}) => {
  const [allMerchants, setAllMerchants] = useState<RemoteMerchantClient[]>(() => loadAllRegisteredMerchants());
  
  // Pinned / Favorite Merchants State (stored in localStorage)
  const [pinnedMerchantIds, setPinnedMerchantIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_pinned_merchant_ids');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['merchant-step-queen'];
  });

  const handleTogglePinMerchant = (merchantId: string) => {
    setPinnedMerchantIds(prev => {
      const exists = prev.includes(merchantId);
      const updated = exists ? prev.filter(id => id !== merchantId) : [merchantId, ...prev];
      try {
        localStorage.setItem('merchant_radar_pinned_merchant_ids', JSON.stringify(updated));
      } catch {}
      if (onShowToast) {
        const targetStore = allMerchants.find(m => m.id === merchantId)?.storeName || 'المتجر';
        onShowToast(
          exists
            ? `📌 تم إلغاء تثبيت التاجر "${targetStore}" من أعلى القائمة`
            : `⭐📌 تم تجميد وتثبيت التاجر المفضل "${targetStore}" في أعلى الجدول والقائمة لتسهيل الوصول الدائم!`
        );
      }
      return updated;
    });
  };

  const sortedMerchants = useMemo(() => {
    return [...allMerchants].sort((a, b) => {
      const aPinned = pinnedMerchantIds.includes(a.id);
      const bPinned = pinnedMerchantIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [allMerchants, pinnedMerchantIds]);

  const [activeMerchantId, setActiveMerchantId] = useState<string>(() => {
    if (selectedMerchant?.id) return selectedMerchant.id;
    try {
      const savedPinned = localStorage.getItem('merchant_radar_pinned_merchant_ids');
      if (savedPinned) {
        const list: string[] = JSON.parse(savedPinned);
        if (list.length > 0 && allMerchants.some(m => m.id === list[0])) {
          return list[0];
        }
      }
    } catch {}
    return allMerchants[0]?.id || 'merchant-step-queen';
  });

  // When prop selectedMerchant changes, update local state
  useEffect(() => {
    if (selectedMerchant?.id) {
      setActiveMerchantId(selectedMerchant.id);
    }
  }, [selectedMerchant?.id]);

  const currentMerchant = useMemo(() => {
    return allMerchants.find(m => m.id === activeMerchantId) || selectedMerchant || allMerchants[0];
  }, [allMerchants, activeMerchantId, selectedMerchant]);

  // Catalog State
  const [products, setProducts] = useState<MerchantCatalogProduct[]>(() => {
    return loadMerchantCatalog(activeMerchantId);
  });

  // Pinned Rows in Catalog Table (Stored in localStorage per merchant)
  const [pinnedProductIds, setPinnedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`merchant_catalog_pinned_rows_${activeMerchantId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-sync pinned products when switching merchant
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`merchant_catalog_pinned_rows_${activeMerchantId}`);
      setPinnedProductIds(saved ? JSON.parse(saved) : []);
    } catch {
      setPinnedProductIds([]);
    }
  }, [activeMerchantId]);

  const handleTogglePinProduct = (productId: string) => {
    setPinnedProductIds(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [productId, ...prev];
      try {
        localStorage.setItem(`merchant_catalog_pinned_rows_${activeMerchantId}`, JSON.stringify(updated));
      } catch {}
      if (onShowToast) {
        const targetProd = products.find(p => p.id === productId);
        const label = targetProd ? targetProd.sku : 'الصف';
        onShowToast(
          exists
            ? `📌 تم إلغاء تجميد الصف "${label}" من أعلى الجدول`
            : `📌 تم تجميد وتثبيت صف "${label}" في أعلى الجدول بنجاح لتسهيل الوصول إليه دائماً!`
        );
      }
      return updated;
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isRefreshingPricing, setIsRefreshingPricing] = useState(false);
  const [isRunningAutoRepricer, setIsRunningAutoRepricer] = useState(false);
  const [isOptimizingImages, setIsOptimizingImages] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Merchant Multi-Profiles State & Dialog
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [activeMerchantProfile, setActiveMerchantProfileState] = useState<MerchantProfile>(() => getActiveMerchantProfile());
  const [allProfiles, setAllProfiles] = useState<MerchantProfile[]>(() => getMerchantProfiles());
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);

  // Sync profile when switched from any component or modal
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.profile) {
        setActiveMerchantProfileState(e.detail.profile);
        setAllProfiles(getMerchantProfiles());
      }
    };
    window.addEventListener('merchant_profile_changed', handleProfileUpdate);
    return () => {
      window.removeEventListener('merchant_profile_changed', handleProfileUpdate);
    };
  }, []);

  const handleQuickSwitchProfile = (profileId: string) => {
    try {
      const updated = setActiveMerchantProfile(profileId);
      setActiveMerchantProfileState(updated);
      setAllProfiles(getMerchantProfiles());
      if (onShowToast) {
        onShowToast(`🎯 تم تبديل ملف التاجر النشط للتنبيهات إلى "${updated.profileName}"! رقم الواتساب: ${updated.whatsappNumber} (${updated.region})`);
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || 'تعذر تبديل الملف');
    }
  };

  const handleQuickTestWhatsAppAlert = async () => {
    setIsTestingWhatsApp(true);
    try {
      const msg = [
        `🚨 *تنبيه تجريبي من رادار التاجر الذكي - مصر* 🇪🇬`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 *التاجر المعتمد:* ${activeMerchantProfile.merchantName}`,
        `🏬 *المتجر:* ${activeMerchantProfile.storeName}`,
        `📍 *المنطقة:* ${activeMerchantProfile.region}`,
        `📱 *رقم الواتساب النشط للتنبيهات:* ${activeMerchantProfile.whatsappNumber}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `✅ يعمل نظام توجيه التنبيهات اللحظية وتبديل الأرقام بنجاح!`
      ].join('\n');

      await sendWhatsAppMessageToPhone(activeMerchantProfile.whatsappNumber, msg);
      if (onShowToast) {
        onShowToast(`📲 تم إرسال رسالة الاختبار بنجاح لواتساب (${activeMerchantProfile.whatsappNumber})!`);
      }
    } catch {
      if (onShowToast) onShowToast('تعذر إرسال رسالة الاختبار');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  // Automated Repricer Audit Logs & View Toggle
  const [auditLogs, setAuditLogs] = useState<RepricingAuditLogEntry[]>(() =>
    loadMerchantRepricingAuditLog(activeMerchantId)
  );
  const [showAuditLogPanel, setShowAuditLogPanel] = useState(false);

  // Repricing Rule Configuration Modal State
  const [ruleModalProduct, setRuleModalProduct] = useState<MerchantCatalogProduct | null>(null);
  const [ruleEnabled, setRuleEnabled] = useState(true);
  const [ruleMinPrice, setRuleMinPrice] = useState(1000);
  const [ruleMaxPrice, setRuleMaxPrice] = useState(5000);
  const [ruleBeatBy, setRuleBeatBy] = useState(1);
  const [ruleBenchmark, setRuleBenchmark] = useState<'buybox' | 'lowest_competitor'>('buybox');
  const [editStockThreshold, setEditStockThreshold] = useState<number>(5);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('merchant_catalog_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('merchant_catalog_search_history', JSON.stringify(newHistory));
  };
  
  const [platformFilter, setPlatformFilter] = useState<'all' | 'amazon_eg' | 'noon_eg'>('all');
  const [syncStatusFilter, setSyncStatusFilter] = useState<'all' | 'live' | 'demo' | 'auto_repricer_on' | 'auto_repricer_off'>('all');
  const [priceTierFilter, setPriceTierFilter] = useState<'all' | 'under_1000' | '1000_to_3000' | '3000_to_7000' | 'over_7000'>('all');
  const [minPriceFilter, setMinPriceFilter] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | MerchantCatalogPricingStatus>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [tagCustomInput, setTagCustomInput] = useState<string>('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'gap_desc' | 'gap_asc' | 'price_desc' | 'price_asc' | 'stock'>('gap_desc');

  // Modals State
  const [inspectProduct, setInspectProduct] = useState<MerchantCatalogProduct | null>(null);
  const [repriceProduct, setRepriceProduct] = useState<MerchantCatalogProduct | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // New Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newAsin, setNewAsin] = useState('');
  const [newPlatform, setNewPlatform] = useState<'amazon_eg' | 'noon_eg'>('amazon_eg');
  const [newPrice, setNewPrice] = useState<number>(1500);
  const [newCost, setNewCost] = useState<number>(1000);
  const [newStock, setNewStock] = useState<number>(20);
  const [newCategory, setNewCategory] = useState('أثاث ومفروشات');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLowStockThreshold, setNewLowStockThreshold] = useState<number>(5);

  // Reload catalog when merchant changes, and auto-fetch real catalog if empty
  useEffect(() => {
    let isMounted = true;
    if (activeMerchantId) {
      const items = loadMerchantCatalog(activeMerchantId);
      setProducts(items);
      setAuditLogs(loadMerchantRepricingAuditLog(activeMerchantId));

      // Auto-sync real merchant catalog if none stored yet
      if (items.length === 0 && currentMerchant) {
        setIsLoading(true);
        pullLiveCatalogForMerchant(currentMerchant, platformFilter)
          .then(pulled => {
            if (isMounted && Array.isArray(pulled)) {
              setProducts(pulled);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [activeMerchantId]);

  // Sync with cross-tab / cross-component storage updates
  useEffect(() => {
    const handleCatalogUpdate = (e: any) => {
      if (e?.detail?.merchantId === activeMerchantId) {
        setProducts(loadMerchantCatalog(activeMerchantId));
      }
    };
    window.addEventListener('merchant_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('merchant_catalog_updated', handleCatalogUpdate);
  }, [activeMerchantId]);

  // Pull / Sync Catalog action
  const handlePullCatalog = async () => {
    if (!currentMerchant) return;
    setIsLoading(true);
    setIsRateLimited(false);
    try {
      const updated = await pullLiveCatalogForMerchant(currentMerchant, platformFilter);
      setProducts(updated);
      if (onShowToast) {
        onShowToast(`✅ تم بنجاح سحب وتحديث كتالوج منتجات "${currentMerchant.storeName}" (${updated.length} منتج)! 🛍️`);
      }
    } catch (err: any) {
      if (err.message === 'RATE_LIMITED') {
        setIsRateLimited(true);
        if (onShowToast) onShowToast('⚠️ تم تجاوز حد الطلبات (Rate Limit). يرجى المحاولة بعد دقيقة.');
      } else {
        const rawMsg = String(err?.message || '');
        const cleanMsg =
          rawMsg.includes('Unexpected token') || rawMsg.includes('is not valid JSON')
            ? `تعذر تحليل استجابة الخادم — تم التحقق من كتالوج المتجر "${currentMerchant.storeName}" المحلي`
            : (rawMsg || 'حدث خطأ أثناء سحب الكتالوج');
        if (onShowToast) {
          onShowToast(`⚠️ ${cleanMsg}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Competitor Pricing & Buy Box comparison
  const handleRefreshPricing = async () => {
    if (!currentMerchant) return;
    setIsRefreshingPricing(true);
    try {
      const updated = await refreshMerchantCompetitorPricing(currentMerchant);
      setProducts(updated);
      if (onShowToast) {
        onShowToast(`⚡ تم تحديث أسعار المنافسين والـ Buy Box لجميع منتجات "${currentMerchant.storeName}"!`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ ${err.message || 'تعذر تحديث أسعار المنافسين'}`);
      }
    } finally {
      setIsRefreshingPricing(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onShowToast) onShowToast(`📋 تم نسخ: ${text}`);
  };

  // Open Reprice Modal
  const handleOpenReprice = (prod: MerchantCatalogProduct) => {
    setRepriceProduct(prod);
    setNewPriceInput(prod.merchantPrice);
  };

  // Apply Reprice
  const handleApplyReprice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repriceProduct || !activeMerchantId) return;

    const updated = updateMerchantProductPrice(activeMerchantId, repriceProduct.id, Number(newPriceInput));
    if (updated) {
      setProducts(loadMerchantCatalog(activeMerchantId));
      if (onShowToast) {
        onShowToast(`🎯 تم تحديث سعر "${updated.sku}" إلى ${updated.merchantPrice.toLocaleString('ar-EG')} ج.م بنجاح!`);
      }
    }
    setRepriceProduct(null);
  };

  // Quick match Buy Box
  const handleMatchBuyBox = (prod: MerchantCatalogProduct) => {
    if (!activeMerchantId) return;
    const targetPrice = prod.buyBoxPrice;
    const updated = updateMerchantProductPrice(activeMerchantId, prod.id, targetPrice);
    if (updated) {
      setProducts(loadMerchantCatalog(activeMerchantId));
      if (onShowToast) {
        onShowToast(`🏆 تم مطابقة الـ Buy Box لمنتج "${prod.sku}" بسعر ${targetPrice.toLocaleString('ar-EG')} ج.م!`);
      }
    }
  };

  // Quick undercut Buy Box by 5 EGP
  const handleBeatBuyBox = (prod: MerchantCatalogProduct) => {
    if (!activeMerchantId) return;
    const targetPrice = Math.max(1, prod.buyBoxPrice - 5);
    const updated = updateMerchantProductPrice(activeMerchantId, prod.id, targetPrice);
    if (updated) {
      setProducts(loadMerchantCatalog(activeMerchantId));
      if (onShowToast) {
        onShowToast(`⚡ تم تسعير المنتج بـ ${targetPrice.toLocaleString('ar-EG')} ج.م (أقل من الـ Buy Box بـ 5 ج.م) لانتزاع الصندوق!`);
      }
    }
  };

  // Toggle Automated Repricer per product directly in table
  const handleToggleProductRepricer = (prod: MerchantCatalogProduct) => {
    if (!activeMerchantId) return;
    const nextEnabled = !(prod.repricingRule?.enabled ?? true);
    const updated = toggleProductRepricer(activeMerchantId, prod.id, nextEnabled);
    if (updated) {
      setProducts(loadMerchantCatalog(activeMerchantId));
      if (onShowToast) {
        onShowToast(
          nextEnabled
            ? `🤖 تم تفعيل معدِّل الأسعار التلقائي للمنتج "${prod.sku}"`
            : `⏸️ تم إيقاف معدِّل الأسعار التلقائي للمنتج "${prod.sku}"`
        );
      }
    }
  };

  // Open Repricing Rules Modal for a specific product
  const handleOpenRuleModal = (prod: MerchantCatalogProduct) => {
    const rule = prod.repricingRule || {
      enabled: true,
      minPrice: Math.round((prod.estimatedCostEGP || prod.merchantPrice * 0.72) * 1.12),
      maxPrice: Math.round(prod.merchantPrice * 1.25),
      beatCompetitorBy: 1,
      targetBenchmark: 'buybox' as const
    };
    setRuleModalProduct(prod);
    setRuleEnabled(rule.enabled);
    setRuleMinPrice(rule.minPrice);
    setRuleMaxPrice(rule.maxPrice);
    setRuleBeatBy(rule.beatCompetitorBy);
    setRuleBenchmark(rule.targetBenchmark || 'buybox');
    setEditStockThreshold(prod.lowStockThreshold ?? 5);
  };

  // Save Repricing Rules for product
  const handleSaveRuleModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleModalProduct || !activeMerchantId || !currentMerchant) return;

    if (ruleMinPrice >= ruleMaxPrice) {
      if (onShowToast) onShowToast('⚠️ يجب أن يكون الحد الأدنى للسعر أقل من الحد الأقصى');
      return;
    }

    const updatedRule: MerchantRepricingRule = {
      enabled: ruleEnabled,
      minPrice: Number(ruleMinPrice),
      maxPrice: Number(ruleMaxPrice),
      beatCompetitorBy: Number(ruleBeatBy),
      targetBenchmark: ruleBenchmark
    };

    updateProductRepricingRule(activeMerchantId, ruleModalProduct.id, updatedRule);

    // Save low stock threshold
    const catalog = loadMerchantCatalog(activeMerchantId);
    const idx = catalog.findIndex(p => p.id === ruleModalProduct.id);
    if (idx !== -1) {
      catalog[idx].lowStockThreshold = Number(editStockThreshold);
      catalog[idx].isCriticalStock = (catalog[idx].stockQuantity ?? 0) <= Number(editStockThreshold);
      saveMerchantCatalog(activeMerchantId, catalog);
    }

    // If enabled, immediately run automated repricer for this product so price updates right away
    if (ruleEnabled) {
      const result = await executeAutomatedRepricingForMerchant(currentMerchant, [ruleModalProduct.id]);
      setProducts(result.updatedProducts);
      setAuditLogs(loadMerchantRepricingAuditLog(activeMerchantId));
      if (result.floorPriceReachedProducts.length > 0) {
        if (onShowToast) {
          onShowToast(
            `⚠️ تنبيه الحد الأدنى: وصل المنتج "${ruleModalProduct.sku}" للحد الأدنى للسعر (${Number(ruleMinPrice).toLocaleString('ar-EG')} ج.م) لحمايتك من الخسارة!`
          );
        }
      } else if (onShowToast) {
        onShowToast(`🤖 تم حفظ قواعد التسعير التلقائي وتحديث سعر "${ruleModalProduct.sku}" عبر المنصة!`);
      }
    } else {
      setProducts(loadMerchantCatalog(activeMerchantId));
      if (onShowToast) {
        onShowToast(`💾 تم حفظ قواعد التسعير للمنتج "${ruleModalProduct.sku}"`);
      }
    }

    setRuleModalProduct(null);
  };

  // Execute Automated Repricer across all enabled products for the current merchant
  const handleRunAutomatedRepricer = async () => {
    if (!currentMerchant) return;
    setIsRunningAutoRepricer(true);
    try {
      const result = await executeAutomatedRepricingForMerchant(currentMerchant);
      setProducts(result.updatedProducts);
      setAuditLogs(loadMerchantRepricingAuditLog(currentMerchant.id));
      setShowAuditLogPanel(true);

      if (result.floorPriceReachedProducts.length > 0) {
        if (onShowToast) {
          onShowToast(
            `⚠️ تم تشغيل المعدِّل التلقائي: تنبيه! ${result.floorPriceReachedProducts.length} منتج وصل للحد الأدنى للسعر (Floor Price Reached) وتوقف الخفض لحماية أرباحك.`
          );
        }
      } else if (result.newLogs.length > 0) {
        if (onShowToast) {
          onShowToast(
            `🤖⚡ تم تعديل أسعار ${result.newLogs.length} منتجات تلقائياً عبر Amazon Listings API & Noon Pricing API وانتزاع الـ Buy Box!`
          );
        }
      } else {
        if (onShowToast) {
          onShowToast(`✅ جميع المنتجات المفعلة بالمعدِّل التلقائي في أفضل سعر تنافسي حالياً.`);
        }
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`⚠️ تعذر تشغيل المعدِّل التلقائي: ${err?.message || 'خطأ غير متوقع'}`);
      }
    } finally {
      setIsRunningAutoRepricer(false);
    }
  };

  const handleOptimizeCatalogImages = async () => {
    if (products.length === 0) return;
    setIsOptimizingImages(true);
    let optimizedCount = 0;
    
    try {
      const updatedProducts = [...products];
      
      for (let i = 0; i < updatedProducts.length; i++) {
        const p = updatedProducts[i];
        if (!p.imageUrl || !p.imageUrl.startsWith('data:')) continue;
        
        try {
          const res = await fetch('/api/optimize-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: p.imageUrl, maxWidth: 400, quality: 65 })
          });
          const result = await res.json();
          if (result.success && result.data.optimizedBase64) {
            updatedProducts[i] = { ...p, imageUrl: result.data.optimizedBase64 };
            optimizedCount++;
          }
        } catch (err) {
          console.warn(`Failed to optimize image for ${p.sku}`, err);
        }
      }
      
      if (optimizedCount > 0) {
        setProducts(updatedProducts);
        saveMerchantCatalog(activeMerchantId, updatedProducts);
        if (onShowToast) onShowToast(`🖼️ تم ضغط وتحسين ${optimizedCount} صورة منتج بنجاح لتقليل زمن التحميل!`);
      } else {
        if (onShowToast) onShowToast('✅ صور الكتالوج محسنة بالفعل أو لا توجد صور للمعالجة.');
      }
    } catch (err) {
      console.error('Image optimization error:', err);
    } finally {
      setIsOptimizingImages(false);
    }
  };

  // Extract unique available tags across catalog for filter dropdown
  const availableCatalogTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      const autoTags = extractAutoTags(p);
      autoTags.forEach(t => set.add(t.label));
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [products]);

  // Batch Auto-Tagging Action
  const handleBatchAutoTagProducts = () => {
    if (products.length === 0 || !activeMerchantId) return;
    const { updatedProducts, totalTagsAppliedCount } = autoTagProductCatalog(products);
    setProducts(updatedProducts);
    saveMerchantCatalog(activeMerchantId, updatedProducts);
    if (onShowToast) {
      onShowToast(`🏷️✨ تم التصنيف التلقائي لجميع المنتجات! تم توليد وتطبيق ${totalTagsAppliedCount} وسماً ذكياً بنجاح بناءً على الكلمات المفتاحية والعناوين.`);
    }
  };

  // Add custom tag to product
  const handleAddCustomTagToProduct = (prodId: string, customTag: string) => {
    if (!customTag.trim() || !activeMerchantId) return;
    const cleanTag = customTag.trim();
    const updated = products.map(p => {
      if (p.id === prodId) {
        const existingTags = Array.isArray(p.tags) ? p.tags : [];
        if (!existingTags.includes(cleanTag)) {
          return { ...p, tags: [...existingTags, cleanTag] };
        }
      }
      return p;
    });
    setProducts(updated);
    saveMerchantCatalog(activeMerchantId, updated);
    setTagCustomInput('');
    if (inspectProduct && inspectProduct.id === prodId) {
      setInspectProduct(prev => prev ? { ...prev, tags: [...(prev.tags || []), cleanTag] } : null);
    }
    if (onShowToast) onShowToast(`🏷️ تم إضافة الوسم المخصص "${cleanTag}" للمنتج بنجاح!`);
  };

  // Add Product Submit
  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSku.trim() || !activeMerchantId) {
      if (onShowToast) onShowToast('⚠️ يرجى ملء اسم المنتج وكود الـ SKU');
      return;
    }

    // Generate AI tags
    const aiTags = await generateAiTags(newTitle, '');

    const lowestComp = Math.round(newPrice * 0.95);
    const buyBox = Math.round(newPrice * 0.97);
    const evalRes = evaluatePricingCompetitiveness(newPrice, lowestComp, buyBox);

    const tempProd = {
      id: `prod-${Date.now()}`,
      merchantId: activeMerchantId,
      merchantStoreName: currentMerchant?.storeName,
      asin: newAsin.trim() || undefined,
      sku: newSku.trim().toUpperCase(),
      title: newTitle.trim(),
      brand: currentMerchant?.storeName || 'المتجر',
      category: newCategory.trim() || 'عام',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
      platform: newPlatform,
      platformName: newPlatform === 'amazon_eg' ? 'أمازون مصر (Amazon Egypt)' : 'نون مصر (Noon Partner)',
      merchantPrice: Number(newPrice),
      estimatedCostEGP: Number(newCost),
      stockQuantity: Number(newStock),
      shippingStatus: Number(newStock) > 0 ? 'in_stock' : 'out_of_stock',
      fulfillmentType: newPlatform === 'amazon_eg' ? 'fba' : 'fbn_express',
      shippingTime: newPlatform === 'amazon_eg' ? 'توصيل غداً برايم' : 'نون إكسبريس',
      lowestCompetitorPrice: lowestComp,
      lowestCompetitorName: 'المنافس الأقرب في السوق',
      buyBoxPrice: buyBox,
      buyBoxWinner: evalRes.isBuyBoxWinner ? `${currentMerchant?.storeName} 🏆` : 'المنافس الأقرب',
      isBuyBoxWinner: evalRes.isBuyBoxWinner,
      competitorsCount: 1,
      competitors: [
        {
          id: `comp-init-${Date.now()}`,
          sellerName: 'المنافس الأقرب في السوق',
          platform: newPlatform,
          price: lowestComp,
          currency: 'EGP',
          isBuyBoxWinner: !evalRes.isBuyBoxWinner
        }
      ],
      priceGapAmount: evalRes.priceGapAmount,
      priceGapPercent: evalRes.priceGapPercent,
      pricingStatus: evalRes.pricingStatus,
      suggestedAction: evalRes.suggestedAction,
    };

    const newProd: MerchantCatalogProduct = {
      ...(tempProd as any),
      tags: aiTags,
      repricingRule: {
        ...ensureDefaultRepricingRule(tempProd as any).repricingRule!,
        enabled: true
      },
      lowStockThreshold: Number(newLowStockThreshold),
      isCriticalStock: Number(newStock) <= Number(newLowStockThreshold),
      dataMode: currentMerchant?.dataMode || 'live',
      lastRefreshedAt: new Date().toISOString()
    };

    const updated = [newProd, ...products];
    saveMerchantCatalog(activeMerchantId, updated);
    setProducts(updated);
    setIsAddProductModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewSku('');
    setNewAsin('');
    setNewPrice(1500);
    setNewCost(1000);
    setNewStock(20);
    setNewImageUrl('');

    if (onShowToast) {
      onShowToast(`🎉 تم إضافة المنتج "${newProd.sku}" مع تصنيفات ذكية بنجاح!`);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Platform filter
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;

      // Sync Status filter
      if (syncStatusFilter !== 'all') {
        const mode = p.dataMode || currentMerchant?.dataMode || 'live';
        const autoRepricerEnabled = p.repricingRule?.enabled ?? true;
        if (syncStatusFilter === 'live' && mode !== 'live') return false;
        if (syncStatusFilter === 'demo' && mode !== 'demo') return false;
        if (syncStatusFilter === 'auto_repricer_on' && !autoRepricerEnabled) return false;
        if (syncStatusFilter === 'auto_repricer_off' && autoRepricerEnabled) return false;
      }

      // Price Tier filter
      if (priceTierFilter !== 'all') {
        if (priceTierFilter === 'under_1000' && p.merchantPrice >= 1000) return false;
        if (priceTierFilter === '1000_to_3000' && (p.merchantPrice < 1000 || p.merchantPrice > 3000)) return false;
        if (priceTierFilter === '3000_to_7000' && (p.merchantPrice <= 3000 || p.merchantPrice > 7000)) return false;
        if (priceTierFilter === 'over_7000' && p.merchantPrice <= 7000) return false;
      }

      // Min / Max numeric price filter
      if (minPriceFilter !== '' && !isNaN(Number(minPriceFilter))) {
        if (p.merchantPrice < Number(minPriceFilter)) return false;
      }
      if (maxPriceFilter !== '' && !isNaN(Number(maxPriceFilter))) {
        if (p.merchantPrice > Number(maxPriceFilter)) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (p.pricingStatus !== statusFilter) return false;
      }

      // Tag filter
      if (tagFilter !== 'all') {
        const autoTags = extractAutoTags(p);
        const autoLabels = autoTags.map(t => t.label);
        const customTags = Array.isArray(p.tags) ? p.tags : [];
        const allProductTags = [...autoLabels, ...customTags];
        const matchesTag = allProductTags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase()) || tagFilter.toLowerCase().includes(t.toLowerCase()));
        if (!matchesTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(q) || (p.titleEn && p.titleEn.toLowerCase().includes(q));
        const inSku = p.sku.toLowerCase().includes(q);
        const inAsin = p.asin ? p.asin.toLowerCase().includes(q) : false;
        const inBrand = p.brand.toLowerCase().includes(q);
        const inCompetitor = p.lowestCompetitorName.toLowerCase().includes(q);
        const inPlatform = p.platform.toLowerCase().includes(q);
        const inPlatformName = p.platformName.toLowerCase().includes(q);
        if (!inTitle && !inSku && !inAsin && !inBrand && !inCompetitor && !inPlatform && !inPlatformName) return false;
      }

      // Pinned only toggle filter
      if (showPinnedOnly && !pinnedProductIds.includes(p.id)) return false;

      return true;
    }).sort((a, b) => {
      // 1. Pinned rows are ALWAYS frozen and stay at the very top of the table
      const aPinned = pinnedProductIds.includes(a.id);
      const bPinned = pinnedProductIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // 2. Regular user-selected sorting criteria
      if (sortBy === 'gap_desc') return b.priceGapPercent - a.priceGapPercent;
      if (sortBy === 'gap_asc') return a.priceGapPercent - b.priceGapPercent;
      if (sortBy === 'price_desc') return b.merchantPrice - a.merchantPrice;
      if (sortBy === 'price_asc') return a.merchantPrice - b.merchantPrice;
      if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity;
      return 0;
    });
  }, [products, platformFilter, syncStatusFilter, priceTierFilter, minPriceFilter, maxPriceFilter, statusFilter, searchQuery, sortBy, pinnedProductIds, showPinnedOnly, currentMerchant?.dataMode]);

  // Catalog Summary KPIs
  const summary = useMemo(() => calculateCatalogSummary(products), [products]);
  const merchantSubState = useMemo(() => evaluateMerchantSubscriptionState(currentMerchant), [currentMerchant]);
  const isMerchantLocked = merchantSubState.isTrialExpired && !merchantSubState.isSubscribed;

  const [isExportingCatalog, setIsExportingCatalog] = useState(false);

  const handleExportCatalogPrices = (format: 'xlsx' | 'csv') => {
    setIsExportingCatalog(true);
    try {
      const result = exportMerchantCatalogPricesToSpreadsheet(
        filteredProducts,
        format,
        currentMerchant?.storeName
      );
      if (onShowToast) {
        onShowToast(`📊 تم تصدير تقرير أسعار المنافسين بنجاح (${result.rowCount} منتج) بصيغة ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Catalog export error:', err);
    } finally {
      setIsExportingCatalog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription / 3-Day Free Trial Lock Notice if Merchant Trial Expired */}
      {isMerchantLocked && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white border-2 border-rose-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h4 className="text-sm font-black font-['Alexandria'] text-rose-200">
                انتهت فترة التجربة المجانية (3 أيام) للتاجر "{currentMerchant?.storeName}" 🔒
              </h4>
              <p className="text-xs text-rose-100/90 mt-0.5">
                تم إيقاف عمليات سحب الكتالوج ومعدِّل الأسعار التلقائي (Automated Repricer) مؤقتاً لحين تفعيل أو تجديد باقة الاشتراك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('merchant_radar_open_subscription_paywall', { detail: { merchantId: currentMerchant?.id } }));
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4" />
            <span>تجديد باقة الاشتراك الآن</span>
          </button>
        </div>
      )}
      
      {/* Top Banner & Multi-Merchant Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>كتالوج المنتجات المستقل والتحليل التنافسي</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                currentMerchant?.dataMode === 'demo'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentMerchant?.dataMode === 'demo' ? '🧪 وضع تجريبي Sandbox' : '🟢 بيانات حقيقية Live API'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-['Alexandria']">
              كتالوج المنتجات ومراقبة أسعار المنافسين (Amazon SP-API & Noon)
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              سحب كتالوج منتجات كل تاجر بشكل مستقل، ومراقبة حركة أسعار المنافسين، ورصد سعر الـ Buy Box اللحظي لحماية هوامش الربح وتحقيق أعلى مبيعات.
            </p>
          </div>

          {/* Active Merchant Selector, Pin Favorite, and Key Config */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">التاجر المحدد:</span>
                <select
                  value={activeMerchantId}
                  onChange={(e) => setActiveMerchantId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
                >
                  {sortedMerchants.map(m => {
                    const isPinned = pinnedMerchantIds.includes(m.id);
                    return (
                      <option key={m.id} value={m.id}>
                        {isPinned ? '📌 ⭐ ' : '🏬 '}{m.storeName} ({m.city || 'مصر'}){isPinned ? ' [المفضل مثبت]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Pin Active Merchant as Favorite Button */}
            <button
              type="button"
              onClick={() => handleTogglePinMerchant(activeMerchantId)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                pinnedMerchantIds.includes(activeMerchantId)
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-500/50'
              }`}
              title={
                pinnedMerchantIds.includes(activeMerchantId)
                  ? 'إلغاء تثبيت هذا التاجر المفضل'
                  : 'تجميد وتثبيت هذا التاجر كتاجر مفضل في أعلى القائمة والجدول 📌'
              }
            >
              <Pin className={`w-3.5 h-3.5 ${pinnedMerchantIds.includes(activeMerchantId) ? 'fill-current rotate-45 text-slate-950' : ''}`} />
              <span className="whitespace-nowrap">
                {pinnedMerchantIds.includes(activeMerchantId) ? 'المفضل مثبت ⭐' : 'تثبيت التاجر 📌'}
              </span>
            </button>

            {onOpenManageApisModal && (
              <button
                type="button"
                onClick={() => onOpenManageApisModal(currentMerchant?.id)}
                className="px-3 py-1.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                title="إدارة مفاتيح ربط هذا التاجر (LWA Client ID / Secret / Noon API)"
              >
                <Key className="w-3.5 h-3.5 text-sky-300" />
                <span>مفاتيح الربط 🔑</span>
              </button>
            )}
          </div>

        </div>

        {/* Quick Pinned Merchants Ribbon (تجميد والوصول الفوري للتجار المفضلين) */}
        {pinnedMerchantIds.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 fill-current rotate-45 text-amber-400" />
                <span>التجار المفضلون المثبتون في الأعلى:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {sortedMerchants.filter(m => pinnedMerchantIds.includes(m.id)).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMerchantId(m.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                      activeMerchantId === m.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-300/40'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-amber-500/40'
                    }`}
                    title={`التبديل إلى كتالوج متجر "${m.storeName}"`}
                  >
                    <span>⭐ {m.storeName}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePinMerchant(m.id);
                      }}
                      title="إلغاء تثبيت هذا التاجر"
                      className="text-slate-400 hover:text-rose-400 text-xs px-0.5"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              ({pinnedMerchantIds.length} تاجر مثبت بالأعلى)
            </span>
          </div>
        )}
      </div>

      {/* KPI Overview Cards with Drag & Drop Reordering */}
      <SortableDashboardGrid
        storageKey={`radar_dashboard_kpi_order_${activeMerchantId}`}
        defaultOrder={['total_products', 'buy_box_rate', 'needs_repricing', 'low_stock', 'price_gap', 'total_inventory']}
        renderCard={(id) => {
          switch (id) {
            case 'total_products':
              return (
                <SortableDashboardCard key="total_products" id="total_products" title="إجمالي الكتالوج">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold">إجمالي الكتالوج</span>
                      <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {summary.totalProducts} <span className="text-xs font-normal text-slate-500">منتج</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {summary.amazonProductsCount} أمازون · {summary.noonProductsCount} نون
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            case 'buy_box_rate':
              return (
                <SortableDashboardCard key="buy_box_rate" id="buy_box_rate" title="الاستحواذ على Buy Box">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold">الاستحواذ على Buy Box</span>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl font-black text-emerald-600 font-mono">
                      {summary.buyBoxWinRatePercent}%
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {summary.winningBuyBoxCount} من أصل {summary.totalProducts} منتج
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            case 'needs_repricing':
              return (
                <SortableDashboardCard key="needs_repricing" id="needs_repricing" title="بحاجة لتعديل السعر">
                  <div className={`border rounded-2xl p-4 shadow-xs h-full ${
                    summary.needsRepricingCount > 0 
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">بحاجة لتعديل السعر</span>
                      <AlertTriangle className={`w-4 h-4 ${summary.needsRepricingCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                    </div>
                    <div className={`text-xl font-black font-mono ${summary.needsRepricingCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {summary.needsRepricingCount} <span className="text-xs font-normal">منتجات</span>
                    </div>
                    <div className="text-[11px] text-rose-700 font-medium mt-1">
                      فارق السعر أعلى من 10%
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            case 'low_stock':
              return (
                <SortableDashboardCard key="low_stock" id="low_stock" title="مخزون منخفض">
                  <div className={`border rounded-2xl p-4 shadow-xs h-full ${
                    summary.lowStockCount > 0 
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">مخزون منخفض</span>
                      <AlertTriangle className={`w-4 h-4 ${summary.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                    <div className={`text-xl font-black font-mono ${summary.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {summary.lowStockCount} <span className="text-xs font-normal">منتجات</span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      أقل من حد التنبيه
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            case 'price_gap':
              return (
                <SortableDashboardCard key="price_gap" id="price_gap" title="متوسط الفارق بالسوق">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold">متوسط الفارق بالسوق</span>
                      <ArrowUpDown className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className={`text-xl font-black font-mono ${summary.averagePriceGapPercent > 0 ? 'text-sky-600' : 'text-emerald-600'}`}>
                      {summary.averagePriceGapPercent > 0 ? `+${summary.averagePriceGapPercent}%` : `${summary.averagePriceGapPercent}%`}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      مقارنة بأدنى سعر منافس
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            case 'total_inventory':
              return (
                <SortableDashboardCard key="total_inventory" id="total_inventory" title="إجمالي المخزون" className="col-span-2 sm:col-span-1">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs h-full">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-xs font-bold">إجمالي المخزون</span>
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-xl font-black text-indigo-700 font-mono truncate">
                      {summary.totalCatalogValueEGP.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {summary.totalInventoryQuantity.toLocaleString('ar-EG')} قطعة بالمستودع
                    </div>
                  </div>
                </SortableDashboardCard>
              );

            default:
              return null;
          }
        }}
      />

      {/* Floor Price Reached Warning Banner (تنبيه الوصول للحد الأدنى للسعر) */}
      {products.some(p => p.repricingRule?.floorPriceReached) && (
        <div className="bg-sky-950/90 border-2 border-sky-500/80 rounded-3xl p-4 sm:p-5 text-sky-100 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-sky-300 font-['Alexandria']">
                  تنبيه حماية الأرباح: وصول منتجات للحد الأدنى للسعر (Floor Price Reached) 🛡️
                </h3>
                <span className="text-xs font-mono text-sky-200">
                  ({products.filter(p => p.repricingRule?.floorPriceReached).length} منتج عند الحد الأدنى)
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                قام معدِّل الأسعار التلقائي بإيقاف خفض السعر لبعض المنتجات عند <strong>الحد الأدنى المسموح به (Min Price)</strong> لمنع البيع بخسارة أمام المنافسين:
                {' '}
                {products
                  .filter(p => p.repricingRule?.floorPriceReached)
                  .map(p => `${p.sku} (الحد الأدنى: ${p.repricingRule?.minPrice.toLocaleString('ar-EG')} ج.م | المنافس: ${p.buyBoxPrice.toLocaleString('ar-EG')} ج.م)`)
                  .join(' ، ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAuditLogPanel(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs transition cursor-pointer shrink-0"
          >
            عرض سجل التعديلات والتنبيهات 📜
          </button>
        </div>
      )}

      {/* Critical Stock Alert Banner (تنبيه المخزون الحرج) */}
      {products.some(p => (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 5)) && (
        <div className="bg-amber-950/90 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 text-amber-100 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300">
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-amber-300 font-['Alexandria']">
                  تنبيه المخزون الحرج: منتجات أوشكت على النفاد ⚠️
                </h3>
                <span className="text-xs font-mono text-amber-200">
                  ({products.filter(p => (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 5)).length} منتج بحاجة لإعادة توريد)
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                هناك منتجات وصل مخزونها للحد الحرج الذي حددته. يرجى مراجعة الموردين لتجنب فقدان الـ Buy Box بسبب نفاد الكمية:
                {' '}
                {products
                  .filter(p => (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 5))
                  .map(p => `${p.sku} (المتبقي: ${p.stockQuantity} قطعة | الحد: ${p.lowStockThreshold ?? 5})`)
                  .join(' ، ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSortBy('stock');
              setSearchQuery('');
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shrink-0"
          >
            ترتيب حسب المخزون 📦
          </button>
        </div>
      )}

      {/* Main Action Bar & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          
          {/* Search Input & History */}
          <div className="relative flex-1 min-w-[260px] space-y-2">
            {searchHistory.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {searchHistory.map(h => (
                  <button
                    key={h}
                    onClick={() => { setSearchQuery(h); }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-[10px] font-bold transition"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveSearchToHistory(searchQuery); }}
                placeholder="ابحث بالاسم، كود SKU، رقم ASIN، اسم المنافس، أو المنصة..."
                aria-label="بحث سريع في المنتجات"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* Pull Catalog Button */}
            <button
              type="button"
              onClick={handlePullCatalog}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="سحب الكتالوج المحدث من المنصات بناءً على مفاتيح التاجر"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'جاري السحب...' : 'سحب الكتالوج من المنصات 🔄'}</span>
            </button>

            {/* Refresh Competitor Pricing Button */}
            <button
              type="button"
              onClick={handleRefreshPricing}
              disabled={isRefreshingPricing}
              className="h-10 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="استدعاء Amazon Pricing API ورصد أدنى سعر منافس وسعر الـ Buy Box اللحظي"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRefreshingPricing ? 'animate-spin' : ''}`} />
              <span>{isRefreshingPricing ? 'جاري الفحص...' : 'فحص أسعار المنافسين ⚡'}</span>
            </button>

            {/* Batch Auto-Tagging Button */}
            <button
              type="button"
              onClick={handleBatchAutoTagProducts}
              className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              title="توليد وتطبيق الوسوم التلقائية بناءً على الكلمات المفتاحية في العنوان والوصف"
            >
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>تصنيف تلقائي (Auto-Tag) 🏷️</span>
            </button>

            {/* Run Automated Repricer Engine Button */}
            <button
              type="button"
              onClick={handleRunAutomatedRepricer}
              disabled={isRunningAutoRepricer}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="تشغيل محرك التسعير التلقائي (New Price = Math.max(Competitor Price - Beat Amount, Min Price)) وتحديث الأسعار على أمازون ونون"
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${isRunningAutoRepricer ? 'animate-spin' : ''}`} />
              <span>{isRunningAutoRepricer ? 'جاري التعديل التلقائي...' : 'تشغيل المعدِّل التلقائي 🤖⚡'}</span>
            </button>

            {/* Toggle Repricing Audit Log Panel */}
            <button
              type="button"
              onClick={() => setShowAuditLogPanel(prev => !prev)}
              className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                showAuditLogPanel
                  ? 'bg-indigo-950 text-sky-300 border-indigo-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="عرض سجل التعديلات التلقائية وتنبيهات الحد الأدنى للسعر"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>سجل التعديل التلقائي ({auditLogs.length}) 📜</span>
            </button>

            {/* Optimize Images Button */}
            <button
              type="button"
              onClick={handleOptimizeCatalogImages}
              disabled={isOptimizingImages || products.length === 0}
              className="h-10 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="ضغط صور المنتجات المخزنة وتحويلها إلى مصغرات (Thumbnails) لتقليل زمن تحميل الواجهة"
            >
              <ImageIcon className={`w-3.5 h-3.5 ${isOptimizingImages ? 'animate-pulse' : ''}`} />
              <span>{isOptimizingImages ? 'جاري الضغط...' : 'ضغط الصور 🖼️'}</span>
            </button>

            {/* Add Product Button */}
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="h-10 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج ➕</span>
            </button>

          </div>

        </div>

        {/* Filter Pills and Sorter Bar: Platform • Sync Status • Price */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            {/* 1. Platform Segmented Filter (المنصة) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-600 font-extrabold ml-1">🌐 المنصة:</span>
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('amazon_eg')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  platformFilter === 'amazon_eg'
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🛒 أمازون مصر</span>
                <span className="text-[10px] opacity-80">({products.filter(p => p.platform === 'amazon_eg').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('noon_eg')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  platformFilter === 'noon_eg'
                    ? 'bg-indigo-700 text-white font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🛍️ نون مصر</span>
                <span className="text-[10px] opacity-80">({products.filter(p => p.platform === 'noon_eg').length})</span>
              </button>
            </div>

            {/* 2. Sync Status Segmented Filter (حالة التزامن) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-600 font-extrabold ml-1">🔄 حالة التزامن:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'live', label: '🟢 متزامن مباشر (Live API)' },
                { id: 'auto_repricer_on', label: '🤖 تسعير تلقائي مفعل' },
                { id: 'auto_repricer_off', label: '⏸️ تسعير تلقائي متوقف' },
                { id: 'demo', label: '🧪 محاكاة (Demo)' }
              ].map((syncOpt) => (
                <button
                  key={syncOpt.id}
                  type="button"
                  onClick={() => setSyncStatusFilter(syncOpt.id as any)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    syncStatusFilter === syncOpt.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {syncOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Filter & Pricing Status & Sort Row (السعر وحالة المنافسة) */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Quick Price Tiers & Range Inputs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-600 font-extrabold ml-1">💰 السعر:</span>
              {[
                { id: 'all', label: 'كل الأسعار' },
                { id: 'under_1000', label: 'أقل من 1,000 ج.م' },
                { id: '1000_to_3000', label: '1,000 - 3,000 ج.م' },
                { id: '3000_to_7000', label: '3,000 - 7,000 ج.م' },
                { id: 'over_7000', label: 'أكثر من 7,000 ج.م' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    setPriceTierFilter(tier.id as any);
                    setMinPriceFilter('');
                    setMaxPriceFilter('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    priceTierFilter === tier.id && minPriceFilter === '' && maxPriceFilter === ''
                      ? 'bg-sky-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
              <div className="flex items-center gap-1 mr-1">
                <input
                  type="number"
                  value={minPriceFilter}
                  onChange={(e) => {
                    setMinPriceFilter(e.target.value);
                    if (e.target.value !== '') setPriceTierFilter('all');
                  }}
                  placeholder="من (ج.م)"
                  className="w-20 h-7 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  value={maxPriceFilter}
                  onChange={(e) => {
                    setMaxPriceFilter(e.target.value);
                    if (e.target.value !== '') setPriceTierFilter('all');
                  }}
                  placeholder="إلى (ج.م)"
                  className="w-20 h-7 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Pricing Status Filter & Sort Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-bold">حالة المنافسة:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-8 px-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="all">كل الحالات ({products.length})</option>
                  <option value="winning_buybox">🏆 فائز بالـ Buy Box ({products.filter(p => p.pricingStatus === 'winning_buybox').length})</option>
                  <option value="competitive">🟢 سعر منافس ({products.filter(p => p.pricingStatus === 'competitive').length})</option>
                  <option value="higher_than_buybox">🔵 أعلى من الـ Buy Box ({products.filter(p => p.pricingStatus === 'higher_than_buybox').length})</option>
                  <option value="needs_repricing">🔴 بحاجة لتعديل السعر ({products.filter(p => p.pricingStatus === 'needs_repricing').length})</option>
                </select>
              </div>

              {/* Tag Filter Dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-purple-700 font-bold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>الوسم الذكي:</span>
                </span>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs font-bold text-purple-900 outline-none cursor-pointer"
                >
                  <option value="all">كل الوسوم ({availableCatalogTags.length})</option>
                  {availableCatalogTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-bold">ترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 px-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="gap_desc">فارق السعر: الأعلى أولاً</option>
                  <option value="gap_asc">فارق السعر: الأقل أولاً</option>
                  <option value="price_desc">سعر المنتج: من الأعلى للأقل</option>
                  <option value="price_asc">سعر المنتج: من الأقل للأعلى</option>
                  <option value="stock">الكمية بالمخزون</option>
                </select>
              </div>

              {/* Show Pinned Only Filter Button */}
              {pinnedProductIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPinnedOnly(prev => !prev)}
                  className={`h-8 px-3 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    showPinnedOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-2 ring-amber-300/40'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title={showPinnedOnly ? 'إلغاء التصفية وعرض كافة المنتجات' : 'عرض الصفوف والمنتجات المثبتة في الأعلى فقط'}
                >
                  <Pin className={`w-3.5 h-3.5 ${showPinnedOnly ? 'fill-current rotate-45 text-slate-950' : 'text-amber-700'}`} />
                  <span>المثبت فقط ({pinnedProductIds.length})</span>
                </button>
              )}

              {(platformFilter !== 'all' || syncStatusFilter !== 'all' || priceTierFilter !== 'all' || tagFilter !== 'all' || minPriceFilter !== '' || maxPriceFilter !== '' || statusFilter !== 'all' || searchQuery !== '' || showPinnedOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setPlatformFilter('all');
                    setSyncStatusFilter('all');
                    setPriceTierFilter('all');
                    setTagFilter('all');
                    setMinPriceFilter('');
                    setMaxPriceFilter('');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setShowPinnedOnly(false);
                  }}
                  className="h-8 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                >
                  مسح الفلاتر ({filteredProducts.length}/{products.length})
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Automated Repricing Audit Log & Floor Price Notifications Panel */}
      {showAuditLogPanel && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                  سجل التعديلات التلقائية وتنبيهات الحد الأدنى للسعر (Repricing Audit Log)
                </h3>
                <span className="text-xs font-mono text-indigo-300">
                  New Price = Math.max(Competitor Price - Beat Amount, Min Price)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                توثيق لحظي لجميع عمليات تعديل الأسعار التلقائية عبر Amazon Listings Items API و Noon Price Update API وتنبيهات الوصول للحد الأدنى (Floor Price Reached).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRunAutomatedRepricer}
                disabled={isRunningAutoRepricer}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningAutoRepricer ? 'animate-spin' : ''}`} />
                <span>تشغيل المعدِّل الآن ⚡</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAuditLogPanel(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="إغلاق السجل"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <p>لا توجد عمليات تعديل تلقائي مسجلة لهذا التاجر حتى الآن.</p>
              <p className="text-[11px] text-slate-500">
                اضغط على زر "تشغيل المعدِّل التلقائي 🤖⚡" لتطبيق قواعد التسعير وتسجيل التعديلات فوراً.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ والوقت</th>
                    <th className="py-2.5 px-3">المنتج (SKU)</th>
                    <th className="py-2.5 px-3">المنصة وواجهة الـ API</th>
                    <th className="py-2.5 px-3">السعر السابق</th>
                    <th className="py-2.5 px-3">السعر الجديد</th>
                    <th className="py-2.5 px-3">المنافس وسعره</th>
                    <th className="py-2.5 px-3">الحد الأدنى (Min)</th>
                    <th className="py-2.5 px-3">حالة الحد الأدنى</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  {auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white line-clamp-1 max-w-[200px]" title={log.productTitle}>
                          {log.productTitle}
                        </div>
                        <div className="font-mono text-[10px] text-indigo-300">{log.sku}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-200">
                          {log.platform === 'amazon_eg' ? '🛒 أمازون مصر' : '🟡 نون مصر'}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]" title={log.apiEndpointUsed}>
                          {log.apiEndpointUsed}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 line-through whitespace-nowrap">
                        {log.previousPrice.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-400 whitespace-nowrap">
                        {log.newPrice.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-sky-300">
                          {log.competitorPrice.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{log.competitorName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {log.minPrice.toLocaleString('ar-EG')} ج.م
                        <span className="block text-[10px] text-slate-500">(-{log.beatAmount} ج.م)</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {log.floorPriceReached ? (
                          <span className="text-sky-300 font-bold text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>وصل للحد الأدنى (Floor Reached)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>تم التغلب على المنافس 🏆</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products & Competitors Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Table Toolbar Header with Export Reports */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Alexandria']">
                  جدول بيانات المنتجات وأسعار المنافسين
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-mono font-bold">
                  {filteredProducts.length} منتج
                </span>
                {pinnedProductIds.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black flex items-center gap-1 shadow-xs">
                    <Pin className="w-3 h-3 fill-current rotate-45" />
                    <span>{pinnedProductIds.length} صفوف مجمدة بالأعلى 📌</span>
                  </span>
                )}
                {currentMerchant && (
                  <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                    • متجر: {currentMerchant.storeName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مراقبة حية لأسعار أمازون ونون، رصد الـ Buy Box، وهوامش فارق السعر التنافسي مع إمكانية تثبيت الصفوف المفضلة في الأعلى دائماً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Export Reports Button (Excel / CSV via xlsx) */}
            <ExportReportsButton
              onExport={handleExportCatalogPrices}
              isLoading={isExportingCatalog}
              count={filteredProducts.length}
              variant="emerald"
              buttonLabel="تصدير التقارير"
              tooltip="تحميل قائمة الأسعار الحالية للمنافسين بصيغة Excel أو CSV باستخدام مكتبة xlsx"
            />
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">لا توجد منتجات مطابقة لخيارات الفلترة الحالية</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              يمكنك تغيير معايير البحث أو الضغط على "سحب الكتالوج من المنصات" لجلب منتجات التاجر مباشرة.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setPlatformFilter('all'); setStatusFilter('all'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">تثبيت 📌</th>
                  <th className="py-3.5 px-4">المنتج والتصنيف</th>
                  <th className="py-3.5 px-3">المنصة</th>
                  <th className="py-3.5 px-3">معرفات (SKU / ASIN)</th>
                  <th className="py-3.5 px-3">سعر التاجر الحالي</th>
                  <th className="py-3.5 px-3">أدنى سعر منافس</th>
                  <th className="py-3.5 px-3">سعر الـ Buy Box</th>
                  <th className="py-3.5 px-3">فارق السعر (Gap)</th>
                  <th className="py-3.5 px-3">معدِّل الأسعار التلقائي (Repricer)</th>
                  <th className="py-3.5 px-3">المخزون والشحن</th>
                  <th className="py-3.5 px-3">حالة السعر</th>
                  <th className="py-3.5 px-3">آخر تحديث</th>
                  <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredProducts.map((prod) => {
                  const isHigher = prod.priceGapAmount > 0;
                  const isWinning = prod.isBuyBoxWinner;
                  const isPinned = pinnedProductIds.includes(prod.id);

                  return (
                    <tr key={prod.id} className={`hover:bg-slate-50/70 transition-colors ${
                      isPinned
                        ? 'bg-amber-50/80 border-r-4 border-r-amber-500 shadow-xs'
                        : (prod.stockQuantity ?? 0) <= (prod.lowStockThreshold ?? 5) 
                          ? 'bg-amber-50/30 border-r-4 border-r-amber-500' 
                          : ''
                    }`}>
                      
                      {/* Pin Column */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePinProduct(prod.id)}
                          className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer inline-flex items-center justify-center ${
                            isPinned
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md hover:bg-amber-400 ring-2 ring-amber-300'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-slate-200/60'
                          }`}
                          title={isPinned ? 'إلغاء تجميد وتثبيت الصف من أعلى الجدول' : 'تجميد هذا الصف وتثبيته في أعلى الجدول دائماً 📌'}
                          aria-label={isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                        >
                          <Pin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPinned ? 'fill-current rotate-45 text-slate-950' : ''}`} />
                        </button>
                      </td>

                      {/* Product Info */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';
                            }}
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isPinned && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black shrink-0">
                                  <Pin className="w-2.5 h-2.5 fill-current rotate-45" />
                                  <span>مثبت بالأعلى 📌</span>
                                </span>
                              )}
                              <h4 className="font-bold text-slate-900 line-clamp-1 text-xs" title={prod.title}>
                                <HighlightedText text={prod.title} highlight={searchQuery} />
                              </h4>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-600">{prod.brand}</span>
                              <span>·</span>
                              <span>
                                <HighlightedText text={prod.category} highlight={searchQuery} />
                              </span>
                            </div>

                            {/* Auto & Custom Colored Tags */}
                            <div className="flex items-center gap-1 flex-wrap pt-1">
                              {extractAutoTags(prod).map(tag => (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => setTagFilter(tag.label)}
                                  className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-all cursor-pointer hover:scale-105 ${tag.badgeBg} ${tag.badgeText} ${tag.badgeBorder}`}
                                  title={`فلترة حسب الوسم: ${tag.label}`}
                                >
                                  {tag.label}
                                </button>
                              ))}
                              {Array.isArray(prod.tags) && prod.tags.map((customTag, idx) => {
                                const isAutoDuplicate = extractAutoTags(prod).some(t => t.label === customTag);
                                if (isAutoDuplicate) return null;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setTagFilter(customTag)}
                                    className="text-[10px] px-2 py-0.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-800 font-bold transition-all cursor-pointer hover:scale-105"
                                    title={`وسم مخصص: ${customTag}`}
                                  >
                                    🏷️ {customTag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {prod.platform === 'amazon_eg' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[11px]">
                            <span>🛒</span>
                            <span>أمازون مصر</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 font-bold text-[11px]">
                            <span>🟡</span>
                            <span>نون مصر</span>
                          </span>
                        )}
                      </td>

                      {/* SKU & ASIN */}
                      <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-[10px]">SKU:</span>
                            <span className="font-bold text-slate-800">{prod.sku}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(prod.sku, `sku-${prod.id}`)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5"
                              title="نسخ SKU"
                            >
                              {copiedId === `sku-${prod.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          {prod.asin && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">ASIN:</span>
                              <span className="font-bold text-indigo-600">{prod.asin}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(prod.asin!, `asin-${prod.id}`)}
                                className="text-slate-400 hover:text-indigo-600 p-0.5"
                                title="نسخ ASIN"
                              >
                                {copiedId === `asin-${prod.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Merchant Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-sm font-black text-slate-900 font-mono">
                          {prod.merchantPrice.toLocaleString('ar-EG')} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                        </div>
                        {prod.estimatedCostEGP && (
                          <div className="text-[10px] text-slate-400">
                            التكلفة: {prod.estimatedCostEGP.toLocaleString('ar-EG')} ج.م
                          </div>
                        )}
                      </td>

                      {/* Lowest Competitor Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800 font-mono">
                          {prod.lowestCompetitorPrice.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={prod.lowestCompetitorName}>
                          {prod.lowestCompetitorName}
                        </div>
                      </td>

                      {/* Buy Box Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-indigo-700 font-mono">
                          {prod.buyBoxPrice.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 truncate max-w-[130px]" title={prod.buyBoxWinner}>
                          {isWinning ? (
                            <span className="text-emerald-600 font-bold">أنت الفائز 🏆</span>
                          ) : (
                            <span>{prod.buyBoxWinner}</span>
                          )}
                        </div>
                      </td>

                      {/* Price Gap (Amount & %) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isWinning ? (
                          <div className="inline-flex items-center gap-1 text-emerald-600 font-bold font-mono text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>متصدر (0%)</span>
                          </div>
                        ) : isHigher ? (
                          <div className="space-y-0.5 font-mono">
                            <div className="text-rose-600 font-bold text-xs flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                              <span>+{prod.priceGapAmount.toLocaleString('ar-EG')} ج.م</span>
                            </div>
                            <div className="text-[10px] font-bold text-rose-500">
                              (أعلى بـ +{prod.priceGapPercent}%)
                            </div>
                          </div>
                        ) : (
                          <div className="text-emerald-600 font-bold font-mono text-xs flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                            <span>{prod.priceGapAmount} ج.م ({prod.priceGapPercent}%)</span>
                          </div>
                        )}
                      </td>

                      {/* Automated Repricer Rules & Toggle */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleProductRepricer(prod)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                                prod.repricingRule?.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                              title="تفعيل أو إيقاف التسعير التلقائي لهذا المنتج"
                            >
                              {prod.repricingRule?.enabled ? '🤖 نشط تلقائياً' : '⏸️ متوقف'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRuleModal(prod)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                              title="ضبط الحد الأدنى والأقصى ومقدار التغلب على المنافس"
                            >
                              قواعد التعديل ⚙️
                            </button>
                          </div>

                          <div className="text-[10px] font-mono text-slate-500">
                            <span>أدنى: {(prod.repricingRule?.minPrice || 0).toLocaleString('ar-EG')}</span>
                            {' · '}
                            <span>أقصى: {(prod.repricingRule?.maxPrice || 0).toLocaleString('ar-EG')}</span>
                            {' · '}
                            <span className="text-indigo-600 font-bold">(-{prod.repricingRule?.beatCompetitorBy ?? 1} ج.م)</span>
                          </div>

                          {prod.repricingRule?.floorPriceReached && (
                            <div className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-sky-600 shrink-0" />
                              <span>وصل للحد الأدنى (Floor Reached)</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className={`text-xs font-bold font-mono ${
                          (prod.stockQuantity ?? 0) <= (prod.lowStockThreshold ?? 5) ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {prod.stockQuantity} قطعة
                        </div>
                        {(prod.stockQuantity ?? 0) <= (prod.lowStockThreshold ?? 5) && (
                          <div className="text-[10px] font-black text-amber-700 animate-pulse">
                            ⚠️ نفاد وشيك
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {prod.fulfillmentType === 'fba' ? 'FBA Prime' : (prod.fulfillmentType === 'fbn_express' ? 'Noon Express' : 'شحن مباشر')}
                        </div>
                      </td>

                      {/* Price Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {prod.pricingStatus === 'winning_buybox' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                            🏆 فائز بالـ Buy Box
                          </span>
                        )}
                        {prod.pricingStatus === 'competitive' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-300">
                            🟢 سعر منافس
                          </span>
                        )}
                        {prod.pricingStatus === 'higher_than_buybox' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-300">
                            🟡 أعلى من Buy Box
                          </span>
                        )}
                        {prod.pricingStatus === 'needs_repricing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 animate-pulse">
                            🔴 بحاجة لتعديل السعر
                          </span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-3 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {prod.lastUpdated ? new Date(prod.lastUpdated).toLocaleString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Quick Reprice Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenReprice(prod)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                            title="تعديل السعر ومطابقة الـ Buy Box"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>تعديل السعر</span>
                          </button>

                          {/* Quick Match Button if not winner */}
                          {!isWinning && (
                            <button
                              type="button"
                              onClick={() => handleMatchBuyBox(prod)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[10px] transition inline-flex items-center gap-1 cursor-pointer border border-emerald-200"
                              title={`مطابقة سعر الـ Buy Box فوراً (${prod.buyBoxPrice} ج.م)`}
                            >
                              <span>طابق {prod.buyBoxPrice}</span>
                            </button>
                          )}

                          {/* Inspect Competitors Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setInspectProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="عرض قائمة كل المنافسين وعروضهم"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* External link */}
                          {prod.productUrl && (
                            <a
                              href={prod.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                              title="فتح العرض على المنصة"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Quick Pin Toggle in Actions Column */}
                          <button
                            type="button"
                            onClick={() => handleTogglePinProduct(prod.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer border ${
                              isPinned
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 border-slate-200'
                            }`}
                            title={isPinned ? 'إلغاء تجميد وتثبيت الصف' : 'تجميد هذا الصف وتثبيته في أعلى الجدول 📌'}
                            aria-label={isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current rotate-45 text-amber-800' : ''}`} />
                          </button>

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

      {/* MODAL 1: Inspect Competitors Details */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 animate-fadeIn">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    {inspectProduct.sku}
                  </span>
                  <span className="text-xs text-slate-300">
                    ({inspectProduct.platformName})
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  تحليل عروض المنافسين: {inspectProduct.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Comparison Highlight Box */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">سعرك الحالي</span>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {inspectProduct.merchantPrice.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">أدنى سعر منافس</span>
                  <div className="text-base font-black text-sky-600 font-mono">
                    {inspectProduct.lowestCompetitorPrice.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">سعر الـ Buy Box</span>
                  <div className="text-base font-black text-indigo-700 font-mono">
                    {inspectProduct.buyBoxPrice.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">
                  المتاجر والمنافسون المسجلون على المنصة ({inspectProduct.competitors.length}):
                </h4>

                <div className="space-y-2">
                  {inspectProduct.competitors.map((comp, idx) => (
                    <div 
                      key={comp.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        comp.isBuyBoxWinner 
                          ? 'bg-sky-50/70 border-sky-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comp.sellerName}</span>
                          {comp.isBuyBoxWinner && (
                            <span className="text-[10px] font-black bg-sky-500 text-slate-950 px-1.5 py-0.2 rounded">
                              الفائز بالـ Buy Box 🏆
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {comp.deliveryTime || 'توصيل خلال يومين'} {comp.rating ? `· ⭐ ${comp.rating}` : ''}
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <div className="font-black text-sm text-slate-900">
                          {comp.price.toLocaleString('ar-EG')} ج.م
                        </div>
                        <div className={`text-[10px] font-bold ${
                          inspectProduct.merchantPrice > comp.price ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {inspectProduct.merchantPrice > comp.price 
                            ? `أنت أغلى بـ +${(inspectProduct.merchantPrice - comp.price).toLocaleString('ar-EG')} ج.م`
                            : `سعرك أدنى بـ ${(comp.price - inspectProduct.merchantPrice).toLocaleString('ar-EG')} ج.م`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900">
                <span className="font-bold block mb-1">توصية النظام التسعيري الذكي:</span>
                <p className="text-indigo-800 leading-relaxed">
                  {inspectProduct.suggestedAction}
                </p>
              </div>

              {/* Product Auto-Tags and Custom Tag Management */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-purple-900 flex items-center gap-1.5 text-xs">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span>الوسوم والتصنيف التلقائي الذكي (Auto-Tags):</span>
                  </span>
                  <span className="text-[11px] text-purple-700 font-mono font-bold">
                    ({extractAutoTags(inspectProduct).length} وسم تلقائي)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {extractAutoTags(inspectProduct).map(tag => (
                    <span
                      key={tag.id}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${tag.badgeBg} ${tag.badgeText} ${tag.badgeBorder}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                  {Array.isArray(inspectProduct.tags) && inspectProduct.tags.map((customTag, idx) => {
                    const isAutoDuplicate = extractAutoTags(inspectProduct).some(t => t.label === customTag);
                    if (isAutoDuplicate) return null;
                    return (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 font-bold"
                      >
                        🏷️ {customTag}
                      </span>
                    );
                  })}
                </div>

                {/* Add custom tag input */}
                <div className="flex items-center gap-2 pt-1 border-t border-purple-200/60">
                  <input
                    type="text"
                    value={tagCustomInput}
                    onChange={(e) => setTagCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTagToProduct(inspectProduct.id, tagCustomInput);
                      }
                    }}
                    placeholder="أدخل وسم مخصص جديد (مثال: مستورد_ألمانيا، ضمان_المحل)..."
                    className="flex-1 h-8 px-3 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomTagToProduct(inspectProduct.id, tagCustomInput)}
                    className="h-8 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    إضافة وسم ➕
                  </button>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setInspectProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  const p = inspectProduct;
                  setInspectProduct(null);
                  handleOpenReprice(p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل سعر هذا المنتج الآن</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Quick Reprice & Match Buy Box */}
      {repriceProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-800 animate-fadeIn">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {repriceProduct.sku}
                </span>
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  تعديل سعر المنتج: {repriceProduct.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRepriceProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyReprice} className="p-5 space-y-4">
              
              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">خيارات تسعير ذكية سريعة:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriceInput(repriceProduct.buyBoxPrice)}
                    className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs text-right transition cursor-pointer"
                  >
                    <div className="text-[10px] text-indigo-600">مطابقة سعر الـ Buy Box</div>
                    <div className="font-mono text-sm font-black text-indigo-950">
                      {repriceProduct.buyBoxPrice.toLocaleString('ar-EG')} ج.م
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPriceInput(Math.max(1, repriceProduct.buyBoxPrice - 5))}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs text-right transition cursor-pointer"
                  >
                    <div className="text-[10px] text-emerald-600">أقل من Buy Box بـ 5 ج.م</div>
                    <div className="font-mono text-sm font-black text-emerald-950">
                      {(Math.max(1, repriceProduct.buyBoxPrice - 5)).toLocaleString('ar-EG')} ج.م
                    </div>
                  </button>
                </div>
              </div>

              {/* Manual Price Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  السعر الجديد المطلوب تطبيقه (ج.م):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(Number(e.target.value))}
                    className="w-full text-base font-black font-mono pl-14 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
              </div>

              {/* Real-time Impact Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>سعر الـ Buy Box الحالي:</span>
                  <span>{repriceProduct.buyBoxPrice.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>الوضع بعد التعديل:</span>
                  <span className={newPriceInput <= repriceProduct.buyBoxPrice ? 'text-emerald-600' : 'text-sky-600'}>
                    {newPriceInput <= repriceProduct.buyBoxPrice ? '🏆 ستفوز بالـ Buy Box' : '🟡 أعلى من الـ Buy Box'}
                  </span>
                </div>
                {repriceProduct.estimatedCostEGP && (
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>هامش الربح التقديري:</span>
                    <span className="font-bold text-indigo-700">
                      {(newPriceInput - repriceProduct.estimatedCostEGP).toLocaleString('ar-EG')} ج.م ({(((newPriceInput - repriceProduct.estimatedCostEGP) / newPriceInput) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepriceProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-xs"
                >
                  تأكيد وحفظ السعر الجديد 💾
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: Add New Product to Merchant Catalog */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 animate-fadeIn">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  إضافة منتج جديد لكتالوج "{currentMerchant?.storeName}"
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  أدخل بيانات المنتج ومحددات السعر والمخزون للمنصة المختارة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="p-5 space-y-3.5 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم وعنوان المنتج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مكتب عمل خشب زان طبيعي مودرن..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المنصة المستهدفة *</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="amazon_eg">🛒 أمازون مصر (Amazon EG)</option>
                    <option value="noon_eg">🟡 نون مصر (Noon Partner)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">كود الـ SKU الخاص بك *</label>
                  <input
                    type="text"
                    required
                    placeholder="STP-DESK-ZAN-01"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم المعرف القياسي (ASIN)</label>
                  <input
                    type="text"
                    placeholder="B0XXXXXXXX"
                    value={newAsin}
                    onChange={(e) => setNewAsin(e.target.value)}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سعر البيع (ج.م) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تكلفة الجملة (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكمية بالمخزون</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-700 block mb-1">حد التنبيه للمخزون</label>
                  <input
                    type="number"
                    min="0"
                    value={newLowStockThreshold}
                    onChange={(e) => setNewLowStockThreshold(Number(e.target.value))}
                    className="w-full font-mono px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[9px] text-slate-400">سيتم تمييز المنتج باللون الأصفر عند الوصول لهذا العدد</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رابط صورة المنتج (URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-xs"
                >
                  إضافة المنتج للكتالوج ➕
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 4: Per-Product Automated Repricing Rules Configuration */}
      {ruleModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 animate-fadeIn">
            
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    {ruleModalProduct.sku}
                  </span>
                  <span className="text-xs text-slate-300">
                    ({ruleModalProduct.platformName})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  قواعد معدِّل الأسعار التلقائي (Automated Repricer Rules)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRuleModalProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRuleModal} className="p-5 space-y-4 text-xs">
              
              {/* Enable / Disable Switch */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block">
                    تفعيل التسعير التلقائي لهذا المنتج (Enable Repricer)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    تعديل السعر تلقائياً عند تغير سعر المنافس أو الـ Buy Box على المنصة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRuleEnabled(prev => !prev)}
                  className={`px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
                    ruleEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {ruleEnabled ? '🤖 مفعَّل (Enabled)' : '⏸️ متوقف (Disabled)'}
                </button>
              </div>

              {/* Current Market Reference */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">سعرك الحالي</span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {ruleModalProduct.merchantPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">سعر الـ Buy Box</span>
                  <span className="font-mono font-black text-sm text-indigo-700">
                    {ruleModalProduct.buyBoxPrice.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">التكلفة التقديرية</span>
                  <span className="font-mono font-bold text-sm text-slate-600">
                    {(ruleModalProduct.estimatedCostEGP || Math.round(ruleModalProduct.merchantPrice * 0.72)).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>

              {/* Min Price (Floor Price) & Max Price (Ceiling Price) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الحد الأدنى للسعر (Min) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ruleMinPrice}
                    onChange={(e) => setRuleMinPrice(Number(e.target.value))}
                    className="w-full font-mono font-bold text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    الحد الأقصى (Max) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ruleMaxPrice}
                    onChange={(e) => setRuleMaxPrice(Number(e.target.value))}
                    className="w-full font-mono font-bold text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-700 block mb-1">
                    حد تنبيه المخزون *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStockThreshold}
                    onChange={(e) => setEditStockThreshold(Number(e.target.value))}
                    className="w-full font-mono font-bold text-sm px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Beat Competitor By & Benchmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    مقدار التغلب على المنافس (Beat Competitor By) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={ruleBeatBy}
                      onChange={(e) => setRuleBeatBy(Number(e.target.value))}
                      className="w-full font-mono font-bold text-sm pl-12 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      ج.م
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    مثال: خفض 1 ج.م عن سعر الـ Buy Box الحالي
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    مرجع المقارنة (Target Benchmark)
                  </label>
                  <select
                    value={ruleBenchmark}
                    onChange={(e) => setRuleBenchmark(e.target.value as 'buybox' | 'lowest_competitor')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="buybox">سعر الـ Buy Box الحالي ({ruleModalProduct.buyBoxPrice} ج.م)</option>
                    <option value="lowest_competitor">أدنى سعر منافس ({ruleModalProduct.lowestCompetitorPrice} ج.م)</option>
                  </select>
                </div>
              </div>

              {/* Formula Live Calculation Preview */}
              {(() => {
                const refPrice = ruleBenchmark === 'lowest_competitor' ? ruleModalProduct.lowestCompetitorPrice : ruleModalProduct.buyBoxPrice;
                const rawTarget = refPrice - Number(ruleBeatBy);
                const previewNewPrice = Math.min(Math.max(rawTarget, Number(ruleMinPrice)), Number(ruleMaxPrice));
                const hitFloor = rawTarget <= Number(ruleMinPrice);

                return (
                  <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    hitFloor ? 'bg-sky-50 border-sky-300 text-sky-950' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">معادلة التسعير البرمجي:</span>
                      <span className="font-mono text-[11px] font-bold">
                        New Price = Math.max(Competitor - Beat, Min)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>السعر المحسوب تلقائياً:</span>
                      <span className="font-mono text-base font-black text-indigo-700">
                        {previewNewPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    {hitFloor && (
                      <div className="text-[11px] font-bold text-sky-800 flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>
                          تنبيه: السعر المطلوب لكسر المنافس ({rawTarget} ج.م) أقل من أو يساوي الحد الأدنى، لذا سيتوقف النظام عند {Number(ruleMinPrice).toLocaleString('ar-EG')} ج.م لحمايتك من الخسارة!
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRuleModalProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
                >
                  حفظ القواعد وتطبيق التسعير التلقائي 🤖💾
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
