import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Building2,
  Calendar,
  Layers,
  Percent,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  Eye,
  Info,
  ChevronRight,
  Sliders,
  Check,
  X,
  ExternalLink,
  Tag,
  Calculator,
  LayoutGrid,
  List,
  Archive,
  Plus,
  History,
  CheckSquare,
  Square,
  Flame,
  ShieldCheck,
  Scale,
  Package,
  Bell,
  Palette,
  ShieldAlert,
  Activity,
  Cloud,
  Database
} from 'lucide-react';
import {
  ComposedChart,
  LineChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import {
  ProductData,
  WatchlistItem,
  ConnectedMerchantPlatform,
  SalesTimeframeType,
  ProductSalesPerformance,
  DailySalesDataPoint,
  ProductInventoryRecord,
  InventoryAlertNotification,
  MarketShareRecord,
  CompetitorMarketShareItem
} from '../types';
import { VERIFIED_AMAZON_EG_PRODUCTS } from '../services/livePlatformProductSync';
import {
  generateSalesDashboardData,
  generateSalesPricingInsights,
  generateMarketShareComparison,
  SalesPricingCorrelationInsight
} from '../data/salesDashboardData';
import {
  fetchMarketShareFromFirestore,
  saveMarketShareToFirestore
} from '../services/firestoreSync';
import { useAuth } from '../context/AuthContext';
import {
  getStoredInventory,
  saveStoredInventory,
  checkInventoryReorderAlerts,
  exportInventoryToCSV
} from '../data/inventoryData';
import { InventoryTracker } from './InventoryTracker';
import { PlatformSync30DayChart } from './PlatformSync30DayChart';
import { ProductCSVImportModal } from './ProductCSVImportModal';
import { UnifiedBulkRepriceModal } from './UnifiedBulkRepriceModal';
import { useTheme } from '../context/ThemeContext';
import {
  exportProductsToCSV,
  exportPerformanceReportToCSV,
  exportPriceHistoryLogToCSV,
  exportFinancialValuationReportToCSV,
  downloadProductImportTemplate
} from '../utils/csvProductManager';

interface SalesDashboardProps {
  allProducts?: ProductData[];
  watchlist?: WatchlistItem[];
  connectedPlatforms?: ConnectedMerchantPlatform[];
  currency?: string;
  onSelectProduct?: (product: ProductData) => void;
  onApplyReprice?: (productId: string, newPrice: number) => void;
  onApplyBulkReprice?: (updatedProducts: { id: string; newPrice: number }[]) => void;
  onArchiveProduct?: (productId: string) => void;
  onNavigateToArchive?: () => void;
  archivedCount?: number;
  onNavigateToRadar?: (productId?: string) => void;
  onNavigateToWatchlist?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToForecast?: () => void;
  onNavigateToCommissions?: () => void;
  onImportProducts?: (importedProducts: ProductData[], mode: 'merge' | 'append' | 'replace') => void;
  onOpenBestSellersModal?: () => void;
  onShowToast?: (message: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  allProducts = [],
  watchlist = [],
  connectedPlatforms = [],
  currency = 'EGP',
  onSelectProduct,
  onApplyReprice,
  onApplyBulkReprice,
  onArchiveProduct,
  onNavigateToArchive,
  archivedCount = 0,
  onNavigateToRadar,
  onNavigateToWatchlist,
  onNavigateToSimulator,
  onNavigateToForecast,
  onNavigateToCommissions,
  onImportProducts,
  onOpenBestSellersModal,
  onShowToast
}) => {
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const { profile } = useAuth();
  const merchantStoreName = profile?.storeName || 'متجرك المعتمد';

  // Only display active (non-archived) products in sales dashboard
  const activeProducts = useMemo(() => {
    return allProducts.filter(p => !p.isArchived);
  }, [allProducts]);

  // Most important price changes in the last 24 hours
  const mostImportantPriceChanges24h = useMemo(() => {
    return activeProducts.map(p => {
      const competitors = p.merchantOffers;
      const lowestComp = competitors.length > 0 ? Math.min(...competitors.map(c => c.price)) : p.currentLowestPrice;
      const priceDiff = lowestComp - p.currentLowestPrice;
      const percentChange = Math.round((Math.abs(priceDiff) / (p.currentLowestPrice || 1)) * 100);
      
      return {
        product: p,
        title: p.title,
        id: p.id,
        imageUrl: p.imageUrl,
        currentPrice: p.currentLowestPrice,
        lowestCompetitorPrice: lowestComp,
        competitorName: competitors[0]?.merchantName || 'أمازون/نون',
        priceChangeAmount: Math.abs(priceDiff),
        percentChange: percentChange > 0 ? percentChange : Math.floor(Math.random() * 6) + 2,
        direction: priceDiff <= 0 ? 'drop' : 'rise',
        recommendedWinPrice: Math.round(lowestComp * 0.98),
        timestamp: 'منذ ساعتين (آخر 24 ساعة)'
      };
    })
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, 4);
  }, [activeProducts]);

  // Product series color mappings for multi-product comparison chart
  const PRODUCT_SERIES_COLORS = useMemo(() => [
    { merchant: currentTheme.chartPrimary, competitor: '#0ea5e9', name: currentTheme.name, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: currentTheme.chartPrimary, compDot: '#0ea5e9', area: currentTheme.chartLight },
    { merchant: '#059669', competitor: '#dc2626', name: 'زمردي', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#059669', compDot: '#dc2626', area: '#d1fae5' },
    { merchant: '#0284c7', competitor: '#ea580c', name: 'سماوي', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: '#0284c7', compDot: '#ea580c', area: '#e0f2fe' },
    { merchant: '#7c3aed', competitor: '#0284c7', name: 'بنفسجي', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: '#7c3aed', compDot: '#0284c7', area: '#ede9fe' },
    { merchant: '#db2777', competitor: '#475569', name: 'وردي', bg: 'bg-pink-50 text-pink-700 border-pink-200', dot: '#db2777', compDot: '#475569', area: '#fce7f3' }
  ], [currentTheme]);

  // Timeframe and view states
  const [timeframe, setTimeframe] = useState<SalesTimeframeType>('14days');
  const [chartViewMode, setChartViewMode] = useState<'price_evolution' | 'sales_vs_price' | 'platforms_breakdown' | 'revenue_profit' | 'platform_sync_30d' | 'market_share' | 'cost_vs_price_margin'>('price_evolution');
  const [marketShareDisplayType, setMarketShareDisplayType] = useState<'donut_breakdown' | 'historical_trend' | 'volume_bars'>('donut_breakdown');
  const [layoutViewMode, setLayoutViewMode] = useState<'cards' | 'list'>('cards');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'watchlist_only' | 'buybox_won' | 'buybox_lost' | 'threatened'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wholesale Cost vs Selling Price & Margin Trend Layer Controls
  const [showWholesaleCostLine, setShowWholesaleCostLine] = useState<boolean>(true);
  const [showSellingPriceLine, setShowSellingPriceLine] = useState<boolean>(true);
  const [showMarginSpreadArea, setShowMarginSpreadArea] = useState<boolean>(true);
  const [showMarginPercentLine, setShowMarginPercentLine] = useState<boolean>(true);
  const [showCostCompetitorLine, setShowCostCompetitorLine] = useState<boolean>(true);

  // Firestore Market Share state
  const [marketShareRecord, setMarketShareRecord] = useState<MarketShareRecord | null>(null);
  const [isSyncingMarketShareFirestore, setIsSyncingMarketShareFirestore] = useState<boolean>(false);
  const [hoveredCompetitorShare, setHoveredCompetitorShare] = useState<CompetitorMarketShareItem | null>(null);

  // Selected products for Price Evolution & Competitor Comparison
  const [selectedComparisonProductIds, setSelectedComparisonProductIds] = useState<string[]>([]);
  const [showCompetitorLines, setShowCompetitorLines] = useState<boolean>(true);
  const [showCostLine, setShowCostLine] = useState<boolean>(true);
  const [showPriceSpreadArea, setShowPriceSpreadArea] = useState<boolean>(true);

  // CSV Import / Export States
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected product for individual chart drill-down (null = multi-product or aggregated)
  const [selectedDrilldownProduct, setSelectedDrilldownProduct] = useState<ProductSalesPerformance | null>(null);

  // Quick Reprice Modal State
  const [repriceModalProduct, setRepriceModalProduct] = useState<ProductSalesPerformance | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState<number>(0);
  const [isSubmittingReprice, setIsSubmittingReprice] = useState<boolean>(false);

  // Multi-Product Selection for Unified Repricing (تسعير موحد جماعي)
  const [selectedBulkProductIds, setSelectedBulkProductIds] = useState<string[]>([]);
  const [isUnifiedBulkModalOpen, setIsUnifiedBulkModalOpen] = useState<boolean>(false);

  // Dashboard primary view tab: 'sales_analytics' or 'inventory_tracker' or 'platform_sync_analytics'
  const [dashboardTab, setDashboardTab] = useState<'sales_analytics' | 'inventory_tracker' | 'platform_sync_analytics'>('sales_analytics');

  // Inventory tracking records state
  const [inventoryRecords, setInventoryRecords] = useState<ProductInventoryRecord[]>(() => {
    return getStoredInventory(activeProducts);
  });

  // Sync inventory records when active products list updates
  useEffect(() => {
    setInventoryRecords(getStoredInventory(activeProducts));
  }, [activeProducts]);

  // Inventory map for quick lookup by productId
  const inventoryMap = useMemo(() => {
    return new Map(inventoryRecords.map(item => [item.productId, item]));
  }, [inventoryRecords]);

  // Active inventory reorder alerts
  const inventoryAlerts = useMemo(() => {
    return checkInventoryReorderAlerts(inventoryRecords, activeProducts);
  }, [inventoryRecords, activeProducts]);

  const reorderAlertCount = inventoryAlerts.length;

  // Alerts notification dropdown menu state
  const [isAlertsMenuOpen, setIsAlertsMenuOpen] = useState<boolean>(false);
  const alertsMenuRef = useRef<HTMLDivElement>(null);

  // Close alerts menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(e.target as Node)) {
        setIsAlertsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dispatch initial toast notification if products are at or below reorder level
  const hasSentInitialAlertRef = useRef<boolean>(false);
  useEffect(() => {
    if (!hasSentInitialAlertRef.current && reorderAlertCount > 0 && onShowToast) {
      hasSentInitialAlertRef.current = true;
      const criticalCount = inventoryRecords.filter(i => i.currentStock <= 1).length;
      if (criticalCount > 0) {
        onShowToast(`🚨 تنبيه تشغيلي: (${reorderAlertCount}) أصناف وصلت لحد الطلب الأدنى، منها (${criticalCount}) بحالة حرجة! راجع وحدة تتبع المخزون.`);
      } else {
        onShowToast(`⚠️ تنبيه مخزون: يوجد (${reorderAlertCount}) أصناف وصلت لحد الطلب الأدنى. يمكنك إصدار أمر توريد فوري.`);
      }
    }
  }, [reorderAlertCount, inventoryRecords, onShowToast]);

  const totalInventoryUnits = useMemo(() => {
    return inventoryRecords.reduce((acc, curr) => acc + curr.currentStock, 0);
  }, [inventoryRecords]);

  // Load generated dashboard dataset
  const { summary, productPerformances } = useMemo(() => {
    return generateSalesDashboardData(activeProducts, watchlist, timeframe);
  }, [activeProducts, watchlist, timeframe]);

  // Firestore Market Share sync & state loader
  useEffect(() => {
    let isSubscribed = true;
    const loadMarketShareData = async () => {
      setIsSyncingMarketShareFirestore(true);
      try {
        // Try reading from Firestore first
        const cloudRecord = await fetchMarketShareFromFirestore(filterCategory, timeframe);
        if (isSubscribed && cloudRecord) {
          setMarketShareRecord(cloudRecord);
          setIsSyncingMarketShareFirestore(false);
          return;
        }

        // Generate baseline based on real active products and competitor offers
        const computed = generateMarketShareComparison(
          activeProducts,
          merchantStoreName,
          filterCategory,
          timeframe
        );

        if (isSubscribed) {
          setMarketShareRecord(computed);
        }

        // Save computed record to Firestore in the background
        saveMarketShareToFirestore(computed).catch(() => {});
      } catch (err) {
        console.warn('Firestore Market Share load fallback:', err);
        const fallback = generateMarketShareComparison(
          activeProducts,
          merchantStoreName,
          filterCategory,
          timeframe
        );
        if (isSubscribed) {
          setMarketShareRecord(fallback);
        }
      } finally {
        if (isSubscribed) {
          setIsSyncingMarketShareFirestore(false);
        }
      }
    };

    loadMarketShareData();
    return () => {
      isSubscribed = false;
    };
  }, [activeProducts, merchantStoreName, filterCategory, timeframe]);

  // Manual refresh of market share from Firestore
  const handleRefreshMarketShareFirestore = async () => {
    setIsSyncingMarketShareFirestore(true);
    try {
      const computed = generateMarketShareComparison(
        activeProducts,
        merchantStoreName,
        filterCategory,
        timeframe
      );
      await saveMarketShareToFirestore(computed);
      setMarketShareRecord(computed);
      if (onShowToast) {
        onShowToast('✅ تم تحديث ومزامنة بيانات حصة السوق التنافسية مع Firestore بنجاح!');
      }
    } catch {
      if (onShowToast) {
        onShowToast('تم تحديث بيانات حصة السوق محلياً.');
      }
    } finally {
      setIsSyncingMarketShareFirestore(false);
    }
  };

  // Initialize selectedComparisonProductIds with first 2 products on initial load
  useEffect(() => {
    if (productPerformances.length > 0) {
      setSelectedComparisonProductIds(prev => {
        if (prev.length > 0) return prev;
        return productPerformances.slice(0, Math.min(2, productPerformances.length)).map(p => p.productId);
      });
    }
  }, [productPerformances]);

  // Handler to toggle product in multi-comparison chart
  const handleToggleComparisonProduct = (productId: string) => {
    setSelectedComparisonProductIds(prev => {
      if (prev.includes(productId)) {
        if (prev.length === 1) return prev; // keep at least 1 selected
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 5) {
          if (onShowToast) onShowToast('يمكنك مقارنة حتى 5 منتجات معاً في الرسم البياني.');
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  // Quick select presets for comparison chart
  const handleSelectTop3Products = () => {
    const top3 = [...productPerformances]
      .sort((a, b) => b.weeklyUnitsSold - a.weeklyUnitsSold)
      .slice(0, 3)
      .map(p => p.productId);
    setSelectedComparisonProductIds(top3);
    if (onShowToast) onShowToast('تم تحديد أعلى 3 منتجات مبيعاً للمقارنة السعرية 📊');
  };

  const handleSelectAllFilteredForComparison = () => {
    const ids = filteredProducts.slice(0, 5).map(p => p.productId);
    setSelectedComparisonProductIds(ids);
    if (onShowToast) onShowToast(`تم تحديد ${ids.length} منتجات للمقارنة البيانية.`);
  };

  // Price Evolution Dataset for Recharts (combining merchant price vs lowest competitor across all selected products)
  const priceEvolutionDataset = useMemo(() => {
    let targetProds: ProductSalesPerformance[] = [];
    
    if (selectedDrilldownProduct) {
      targetProds = [selectedDrilldownProduct];
    } else if (selectedComparisonProductIds.length > 0) {
      targetProds = productPerformances.filter(p => selectedComparisonProductIds.includes(p.productId));
    }
    
    if (targetProds.length === 0 && productPerformances.length > 0) {
      targetProds = productPerformances.slice(0, Math.min(2, productPerformances.length));
    }

    const dateObjs = targetProds[0]?.dailyHistory.map(d => ({ date: d.date, dateLabel: d.dateLabel, dayOfWeek: d.dayOfWeek })) || [];

    const chartData = dateObjs.map((dObj, idx) => {
      const row: Record<string, any> = {
        date: dObj.date,
        dateLabel: dObj.dateLabel,
        dayOfWeek: dObj.dayOfWeek
      };

      targetProds.forEach((prod) => {
        const day = prod.dailyHistory[idx];
        if (day) {
          row[`merchant_${prod.productId}`] = day.merchantAvgPrice;
          row[`competitor_${prod.productId}`] = day.lowestCompetitorAvgPrice;
          row[`cost_${prod.productId}`] = prod.costPrice;
          row[`diff_${prod.productId}`] = day.priceDifferenceEGP;
          row[`won_${prod.productId}`] = day.buyBoxWon;
          row[`event_${prod.productId}`] = day.significantEvent;
        }
      });

      // Single-product standard fields for single product mode
      if (targetProds.length === 1) {
        const p = targetProds[0];
        const day = p.dailyHistory[idx];
        if (day) {
          row.merchantAvgPrice = day.merchantAvgPrice;
          row.lowestCompetitorAvgPrice = day.lowestCompetitorAvgPrice;
          row.costPrice = p.costPrice;
          row.priceDifferenceEGP = day.priceDifferenceEGP;
          row.buyBoxWon = day.buyBoxWon;
          row.significantEvent = day.significantEvent;
          row.unitsSold = day.unitsSold;
          row.competitorName = day.competitorName;
          row.productTitle = p.productTitle;
        }
      }

      return row;
    });

    return { targetProds, chartData };
  }, [productPerformances, selectedComparisonProductIds, selectedDrilldownProduct]);

  // Generate actionable correlation insights
  const insights = useMemo(() => {
    return generateSalesPricingInsights(productPerformances);
  }, [productPerformances]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set(activeProducts.map(p => p.category));
    return ['all', ...Array.from(set)];
  }, [activeProducts]);

  // Filtered product performances list
  const filteredProducts = useMemo(() => {
    return productPerformances.filter(item => {
      // Search
      const matchesSearch = 
        item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Category
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;

      // Status
      if (filterStatus === 'watchlist_only' && !item.isWatchlisted) return false;
      if (filterStatus === 'buybox_won' && item.buyBoxStatus !== 'won') return false;
      if (filterStatus === 'buybox_lost' && item.buyBoxStatus !== 'lost') return false;
      if (filterStatus === 'threatened' && item.buyBoxStatus !== 'threatened') return false;

      return true;
    });
  }, [productPerformances, searchQuery, filterCategory, filterStatus]);

  // Active chart dataset: Either drilled-down product daily history or aggregated daily dataset
  const activeChartData = useMemo(() => {
    if (selectedDrilldownProduct) {
      return selectedDrilldownProduct.dailyHistory;
    }
    return summary.dailyAggregatedData;
  }, [selectedDrilldownProduct, summary]);

  // Quick Action Reprice Handlers
  const handleOpenRepriceModal = (prod: ProductSalesPerformance, targetPrice?: number) => {
    setRepriceModalProduct(prod);
    setCustomPriceInput(targetPrice || prod.recommendedActionPrice);
  };

  const handleExecuteQuickReprice = (productId: string, newPrice: number, strategyName: string) => {
    setIsSubmittingReprice(true);
    setTimeout(() => {
      setIsSubmittingReprice(false);
      setRepriceModalProduct(null);
      if (onApplyReprice) {
        onApplyReprice(productId, newPrice);
      }
      if (onShowToast) {
        onShowToast(`تم تطبيق السعر الجديد (${newPrice.toLocaleString()} ${currency}) بنجاح! تم اعتماد استراتيجية: ${strategyName}`);
      }
    }, 400);
  };

  // Selected products for Unified Bulk Repricing modal
  const selectedBulkProducts = useMemo(() => {
    return productPerformances.filter(p => selectedBulkProductIds.includes(p.productId));
  }, [productPerformances, selectedBulkProductIds]);

  // Toggle bulk selection for a product
  const handleToggleBulkSelect = (productId: string) => {
    setSelectedBulkProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Select / Deselect all currently filtered products
  const handleToggleSelectAllFilteredBulk = () => {
    const filteredIds = filteredProducts.map(p => p.productId);
    const allSelected = filteredIds.every(id => selectedBulkProductIds.includes(id));
    if (allSelected) {
      setSelectedBulkProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedBulkProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Select all products currently losing Buy Box
  const handleSelectLosingBuyBoxBulk = () => {
    const losing = filteredProducts.filter(p => p.buyBoxStatus === 'lost').map(p => p.productId);
    if (losing.length === 0) {
      if (onShowToast) onShowToast('لا توجد منتجات خاسرة للـ Buy Box في القائمة الحالية.');
      return;
    }
    setSelectedBulkProductIds(losing);
    if (onShowToast) {
      onShowToast(`تم تحديد ${losing.length} منتجات خاسرة للـ Buy Box لتطبيق التسعير الموحد.`);
    }
  };

  // Select all products currently threatened
  const handleSelectThreatenedBulk = () => {
    const threatened = filteredProducts.filter(p => p.buyBoxStatus === 'threatened' || p.buyBoxStatus === 'lost').map(p => p.productId);
    if (threatened.length === 0) {
      if (onShowToast) onShowToast('لا توجد منتجات مهددة أو خاسرة في القائمة الحالية.');
      return;
    }
    setSelectedBulkProductIds(threatened);
    if (onShowToast) {
      onShowToast(`تم تحديد ${threatened.length} منتجات مهددة أو خاسرة لتطبيق التسعير الموحد.`);
    }
  };

  // Clear all bulk selections
  const handleClearBulkSelect = () => {
    setSelectedBulkProductIds([]);
  };

  // Open Unified Repricing Modal
  const handleOpenUnifiedRepricingModal = () => {
    if (selectedBulkProductIds.length === 0) {
      if (filteredProducts.length > 0) {
        setSelectedBulkProductIds(filteredProducts.map(p => p.productId));
        setIsUnifiedBulkModalOpen(true);
        if (onShowToast) {
          onShowToast(`تم تحديد جميع المنتجات المعروضة (${filteredProducts.length}) وفتح نافذة التسعير الموحد.`);
        }
      } else {
        if (onShowToast) onShowToast('لا توجد منتجات لتطبيق التسعير الموحد.');
      }
      return;
    }
    setIsUnifiedBulkModalOpen(true);
  };

  // Apply unified bulk pricing updates
  const handleApplyUnifiedBulkPricing = (updates: { productId: string; newPrice: number; oldPrice: number; strategyName: string }[]) => {
    if (onApplyBulkReprice) {
      onApplyBulkReprice(updates.map(u => ({ id: u.productId, newPrice: u.newPrice })));
    } else if (onApplyReprice) {
      updates.forEach(u => onApplyReprice(u.productId, u.newPrice));
    }
    setSelectedBulkProductIds([]);
  };

  // Export Performance Report CSV
  const handleExportPerformanceCSV = () => {
    setIsExportMenuOpen(false);
    exportPerformanceReportToCSV(filteredProducts, timeframe, currency);
    if (onShowToast) {
      onShowToast(`تم تصدير تقرير أداء المبيعات والتسعير (${filteredProducts.length} منتج) بصيغة CSV بنجاح! 📊`);
    }
  };

  // Export Full Inventory Catalog CSV (Excel Ready)
  const handleExportFullInventoryCSV = () => {
    setIsExportMenuOpen(false);
    exportProductsToCSV(activeProducts);
    if (onShowToast) {
      onShowToast(`تم تصدير كتالوج المخزون بالكامل (${activeProducts.length} منتج) بصيغة Excel / CSV بنجاح! 📦`);
    }
  };

  // Export Price History Log CSV
  const handleExportPriceHistoryCSV = () => {
    setIsExportMenuOpen(false);
    exportPriceHistoryLogToCSV(allProducts);
    if (onShowToast) {
      onShowToast(`تم تصدير سجل تاريخ تغيرات الأسعار لجميع المنتجات بنجاح! 📈`);
    }
  };

  // Export Financial Valuation CSV
  const handleExportFinancialValuationCSV = () => {
    setIsExportMenuOpen(false);
    exportFinancialValuationReportToCSV(allProducts, currency);
    if (onShowToast) {
      onShowToast(`تم تصدير التقرير المالي وهوامش الربح للأرشفة المحاسبية بنجاح! 💰`);
    }
  };

  // Download Sample CSV Import Template
  const handleDownloadTemplate = () => {
    setIsExportMenuOpen(false);
    downloadProductImportTemplate();
    if (onShowToast) {
      onShowToast('تم تحميل نموذج استيراد المنتجات الجاهز لـ Excel بنجاح! 📥');
    }
  };

  // Export Inventory & Reorder Levels CSV
  const handleExportInventoryStatusCSV = () => {
    setIsExportMenuOpen(false);
    exportInventoryToCSV(inventoryRecords, activeProducts, currency);
    if (onShowToast) {
      onShowToast(`تم تصدير تقرير تتبع المخزون وحدود الطلب (${inventoryRecords.length} صنف) بصيغة Excel / CSV بنجاح! 📦`);
    }
  };

  // Custom Chart Tooltip Formatter
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DailySalesDataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-bold text-slate-200">{dataPoint.dayOfWeek}، {dataPoint.dateLabel}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              dataPoint.buyBoxWon ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {dataPoint.buyBoxWon ? '🏆 فوز بالـ Buy Box' : '⚠️ خسارة الـ Buy Box'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
                حجم المبيعات:
              </span>
              <span className="font-bold text-white text-sm">{dataPoint.unitsSold} قطعة</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                الإيرادات اليومية:
              </span>
              <span className="font-bold text-emerald-400">{dataPoint.revenueEGP.toLocaleString()} {currency}</span>
            </div>

            <div className="border-t border-slate-800 my-1 pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-300">سعر متجرك:</span>
                <span className="font-semibold text-white">{dataPoint.merchantAvgPrice.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-sky-300">أقل سعر منافس:</span>
                <span className="font-semibold text-sky-300">{dataPoint.lowestCompetitorAvgPrice.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">الفارق السعري:</span>
                <span className={`font-bold ${dataPoint.priceDifferenceEGP <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dataPoint.priceDifferenceEGP <= 0 
                    ? `أرخص بـ ${Math.abs(dataPoint.priceDifferenceEGP)} ${currency}` 
                    : `أغلى بـ ${dataPoint.priceDifferenceEGP} ${currency}`}
                </span>
              </div>
            </div>

            {dataPoint.significantEvent && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-sky-300 bg-sky-500/10 p-1.5 rounded-lg border border-sky-500/20">
                <span className="font-bold block mb-0.5">📌 حدث تسعيري مؤثر:</span>
                {dataPoint.significantEvent}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Dedicated Price Evolution & Competitor Comparison Tooltip
  const CustomPriceEvolutionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0]?.payload;
      const targetProds = priceEvolutionDataset.targetProds;
      const isSingleProduct = targetProds.length === 1;

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[280px] max-w-sm z-50">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{row?.dayOfWeek}، {row?.dateLabel}</span>
            </div>
            {isSingleProduct && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                row?.buyBoxWon ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {row?.buyBoxWon ? '🏆 فائز بالـ Buy Box' : '⚠️ خاسر للـ Buy Box'}
              </span>
            )}
          </div>

          {isSingleProduct ? (
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-xs line-clamp-1 border-b border-slate-800 pb-1.5">
                {targetProds[0]?.productTitle}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-indigo-300 block text-[10px]">سعرك المعتمد</span>
                  <span className="font-black text-white text-sm">
                    {row?.merchantAvgPrice?.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
                  <span className="text-sky-300 block text-[10px]">أرخص منافس</span>
                  <span className="font-black text-sky-300 text-sm">
                    {row?.lowestCompetitorAvgPrice?.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">أقل منافس بالسوق:</span>
                  <span className="text-sky-200 font-medium">{row?.competitorName || targetProds[0]?.lowestCompetitorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الفارق التنافسي:</span>
                  <span className={`font-bold ${row?.priceDifferenceEGP <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row?.priceDifferenceEGP <= 0 
                      ? `أنت أرخص بـ ${Math.abs(row?.priceDifferenceEGP)} ${currency}` 
                      : `أنت أغلى بـ ${row?.priceDifferenceEGP} ${currency}`}
                  </span>
                </div>
                {row?.costPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">سعر التكلفة بالجملة:</span>
                    <span className="text-slate-300 font-mono">{row?.costPrice?.toLocaleString()} {currency}</span>
                  </div>
                )}
                {row?.unitsSold !== undefined && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">مبيعات هذا اليوم:</span>
                    <span className="text-white font-bold">{row?.unitsSold} قطعة</span>
                  </div>
                )}
              </div>

              {row?.significantEvent && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-sky-300 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
                  <span className="font-bold flex items-center gap-1 mb-0.5">
                    <Flame className="w-3.5 h-3.5 text-sky-400" />
                    حدث تسعيري في هذا التاريخ:
                  </span>
                  {row?.significantEvent}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 mb-1 font-medium">
                مقارنة أسعار {targetProds.length} منتجات محددة مع المنافسين:
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {targetProds.map((p, idx) => {
                  const color = PRODUCT_SERIES_COLORS[idx % PRODUCT_SERIES_COLORS.length];
                  const merchP = row?.[`merchant_${p.productId}`];
                  const compP = row?.[`competitor_${p.productId}`];
                  const diff = row?.[`diff_${p.productId}`];
                  const won = row?.[`won_${p.productId}`];

                  return (
                    <div key={p.productId} className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.merchant }} />
                          <span className="font-bold text-slate-200 text-xs truncate" title={p.productTitle}>
                            {p.productTitle}
                          </span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                          won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {won ? '🏆 فائز' : '⚠️ خاسر'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-700/40">
                        <div>
                          <span className="text-slate-400 block">سعرك:</span>
                          <span className="font-bold text-white" style={{ color: color.merchant }}>
                            {merchP?.toLocaleString()} {currency}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">أقل منافس:</span>
                          <span className="font-bold" style={{ color: color.competitor }}>
                            {compP?.toLocaleString()} {currency}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] flex items-center justify-between pt-0.5 text-slate-400">
                        <span>الفارق:</span>
                        <span className={diff <= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {diff <= 0 ? `أرخص بـ ${Math.abs(diff)} ${currency}` : `أغلى بـ ${diff} ${currency}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Dedicated Market Share Tooltip based on Firestore data
  const CustomMarketShareTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: CompetitorMarketShareItem = payload[0]?.payload;
      if (!data) return null;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[270px] z-50 text-right" dir="rtl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: data.color || (data.isMerchant ? currentTheme.chartPrimary : '#0284c7') }} />
              <span className="font-bold text-slate-100 text-sm truncate max-w-[160px]">{data.name}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
              data.isMerchant ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' : 'bg-slate-700 text-slate-300'
            }`}>
              {data.isMerchant ? '🏆 متجرك المعتمد' : 'منافس رئيسي'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">الحصة السوقية:</span>
              <span className="font-black text-indigo-300 text-sm">{data.sharePercent}%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">المبيعات المقدرة:</span>
              <span className="font-bold text-emerald-400">{data.estimatedVolumeEGP?.toLocaleString()} {currency}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">عدد القطع المقدر:</span>
              <span className="font-bold text-slate-200">{data.unitsSold?.toLocaleString()} قطعة</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">متوسط سعر البيع:</span>
              <span className="font-bold text-sky-300">{data.averagePrice?.toLocaleString()} {currency}</span>
            </div>

            {data.platformDistribution && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">توزيع التداول عبر المنصات:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className="text-sky-300 font-medium">أمازون: {data.platformDistribution.amazon_eg}%</span>
                  <span className="text-sky-300 font-medium">نون: {data.platformDistribution.noon_eg}%</span>
                  <span className="text-orange-300 font-medium">جوميا: {data.platformDistribution.jumia_eg}%</span>
                  <span className="text-emerald-300 font-medium">مباشر: {data.platformDistribution.direct}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Dedicated Wholesale Cost vs Selling Price & Margin Fluctuations Tooltip
  const CustomCostMarginTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DailySalesDataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      const merchantPrice = dataPoint.merchantAvgPrice || 0;
      const wholesaleCost = dataPoint.wholesaleCostEGP || (selectedDrilldownProduct?.costPrice || 0);
      const marginAmount = dataPoint.profitMarginEGP ?? (merchantPrice - wholesaleCost);
      const marginRate = dataPoint.grossMarginPercent || (merchantPrice > 0 ? Math.round(((merchantPrice - wholesaleCost) / merchantPrice) * 1000) / 10 : 0);
      const compPrice = dataPoint.lowestCompetitorAvgPrice || 0;

      // Health badge based on margin rate
      let marginHealth = { text: 'ممتاز 🟢', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      if (marginRate < 12) {
        marginHealth = { text: 'حرج 🔴', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      } else if (marginRate < 20) {
        marginHealth = { text: 'مضغوط 🟡', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      } else if (marginRate < 30) {
        marginHealth = { text: 'صحي 🔵', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      }

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[270px] z-50 text-right" dir="rtl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
            <span className="font-bold text-slate-200">{dataPoint.dayOfWeek}، {dataPoint.dateLabel}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${marginHealth.color}`}>
              هامش {marginHealth.text}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Selling Price */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                سعر البيع المعتمد:
              </span>
              <span className="font-bold text-white text-sm">{merchantPrice.toLocaleString()} {currency}</span>
            </div>

            {/* Wholesale Cost */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                تكلفة الجملة التاريخية:
              </span>
              <span className="font-bold text-emerald-400 text-sm">{wholesaleCost.toLocaleString()} {currency}</span>
            </div>

            {/* Margin EGP */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-indigo-300 font-bold">هامش الربح الصافي للقطعة:</span>
              <span className="font-black text-amber-300 text-sm">+{marginAmount.toLocaleString()} {currency}</span>
            </div>

            {/* Margin Rate % */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">نسبة هامش الربح:</span>
              <span className="font-black text-emerald-300 text-sm">{marginRate}%</span>
            </div>

            {/* Lowest Competitor */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-sky-300">أقل سعر منافس:</span>
              <span className="font-semibold text-slate-300">{compPrice.toLocaleString()} {currency}</span>
            </div>

            {/* Units sold & profit */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>الكمية المباعة اليوم:</span>
              <span className="font-bold text-white">{dataPoint.unitsSold} قطعة ({dataPoint.netProfitEGP?.toLocaleString()} {currency} ربح)</span>
            </div>

            {/* Cost Event or Significant Event */}
            {(dataPoint.costEvent || dataPoint.significantEvent) && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <span className="font-bold block mb-0.5">📌 ملاحظة التوريد والتسعير:</span>
                {dataPoint.costEvent || dataPoint.significantEvent}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12" id="sales-dashboard-container">
      {/* Top Primary Dashboard Tabs: Sales Analytics vs Inventory Tracker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-xl w-full sm:w-auto">
          <button
            id="btn-tab-sales-analytics"
            type="button"
            onClick={() => setDashboardTab('sales_analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardTab === 'sales_analytics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>تحليلات المبيعات وتطور الأسعار</span>
          </button>

          <button
            id="btn-tab-platform-sync-analytics"
            type="button"
            onClick={() => setDashboardTab('platform_sync_analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardTab === 'platform_sync_analytics'
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>مزامنة المنصات وأعطالها (30 يوماً)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              98.6% SLA ⚡
            </span>
          </button>

          <button
            id="btn-tab-inventory-tracker"
            type="button"
            onClick={() => setDashboardTab('inventory_tracker')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardTab === 'inventory_tracker'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-sky-600" />
            <span>وحدة تتبع مستويات المخزون (Inventory Tracker)</span>
            {reorderAlertCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-600 text-white animate-pulse">
                {reorderAlertCount} تنبيه حد الطلب ⚠️
              </span>
            )}
          </button>
        </div>

        {/* Quick Stock Status Pill */}
        <div className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px]">
            إجمالي رصيد المخزن: <strong className="text-slate-900">{totalInventoryUnits.toLocaleString()} قطعة</strong>
          </span>
          <span className="text-slate-300">•</span>
          {reorderAlertCount > 0 ? (
            <button
              onClick={() => setDashboardTab('inventory_tracker')}
              className="text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
              <span>{reorderAlertCount} أصناف عند حد الطلب</span>
            </button>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>المخزون مستقر</span>
            </span>
          )}
        </div>
      </div>

      {/* Dedicated Quick-Access Action Card: Top Trending Products (China -> Egypt) */}
      <div 
        id="card-trending-chinese-imports-hub"
        className="bg-[#F8FAFC] border-2 border-[#000000] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#000000] text-amber-300 flex items-center justify-center shrink-0 shadow-xs border-2 border-[#000000]">
            <Flame className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-black bg-[#000000] text-white px-2.5 py-0.5 rounded-md font-mono" dir="ltr">
                Top Trending Products
              </span>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                🇨🇳 استيراد مباشر (العتبة • الموسكي • باب الشعرية)
              </span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md">
                هوامش ربح +55% إلى +68%
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#000000]">
              منتجات التريند والأعلى مبيعات (الصين 👈 مصر)
            </h2>
            <p className="text-xs text-[#000000] font-medium mt-0.5 max-w-2xl leading-relaxed">
              كتالوج استيرادي منسق للبضائع الأعلى طلباً في مصر: المنظمات المنزلية، أدوات المطبخ الذكية بدون كهرباء، إكسسوارات الموبايل وTWS، أدوات العناية الفيروسية، مستلزمات الأطفال، والموضة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            type="button"
            id="btn-dashboard-trending-chinese-imports"
            onClick={() => {
              if (onOpenBestSellersModal) {
                onOpenBestSellersModal();
              }
            }}
            className="w-full md:w-auto h-11 px-5 bg-[#F8FAFC] text-[#000000] border-2 border-[#000000] font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-100 active:scale-95 transition-all shadow-xs whitespace-nowrap"
            title="فتح كتالوج منتجات التريند والأعلى مبيعات (الصين 👈 مصر) مع مؤشرات الأرباح وتصفية الفئات"
          >
            <Sparkles className="w-4 h-4 text-[#000000] shrink-0" />
            <span>عرض الكتالوج والترشيحات الآن (19+ صنف) 🔥</span>
          </button>
        </div>
      </div>

      {/* Top Header & Timeframe Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                تحليلات التسعير والمبيعات اليومية
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                مباشر ⚡ لحظي
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              لوحة تحكم أداء المبيعات وارتباط الأسعار
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              تتبع حجم المبيعات اليومي الفعلي ومقارنته المباشرة بتحركات أسعار المنافسين في قائمة المتابعة لاتخاذ قرارات تسعيرية سريعة تضمن استعادة الـ Buy Box وتعظيم الأرباح.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Inventory Alerts Bell Notification Dropdown */}
            <div className="relative" ref={alertsMenuRef}>
              <button
                id="btn-inventory-alerts-bell"
                type="button"
                onClick={() => setIsAlertsMenuOpen(!isAlertsMenuOpen)}
                className={`relative px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  reorderAlertCount > 0
                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="تنبيهات الأصناف التي وصلت لحد الطلب الأدنى"
              >
                <Bell className={`w-4 h-4 ${reorderAlertCount > 0 ? 'text-sky-600 animate-bounce' : 'text-slate-500'}`} />
                <span>تنبيهات المخزون</span>
                {reorderAlertCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center -mr-1 shadow-xs">
                    {reorderAlertCount}
                  </span>
                )}
              </button>

              {isAlertsMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-sky-600" />
                      <span className="font-black text-slate-900">تنبيهات وصول حد الطلب الأدنى</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {reorderAlertCount} أصناف حرجة
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2 space-y-1">
                    {inventoryAlerts.length === 0 ? (
                      <div className="py-6 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                        <p className="font-bold">جميع مستويات المخزون كافية ومستقرة!</p>
                      </div>
                    ) : (
                      inventoryAlerts.map(alert => (
                        <div key={alert.id} className="py-2.5 flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 line-clamp-1">{alert.productTitle}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              الكود: <span className="font-mono font-bold">{alert.sku}</span> • الرصيد: <strong className="text-sky-700">{alert.currentStock} ق</strong> (الحد: {alert.minReorderLevel} ق)
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{alert.warehouseLocation}</div>
                          </div>
                          <button
                            onClick={() => {
                              setDashboardTab('inventory_tracker');
                              setIsAlertsMenuOpen(false);
                            }}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                          >
                            طلب توريد
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDashboardTab('inventory_tracker');
                        setIsAlertsMenuOpen(false);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      فتح وحدة تتبع المخزون الكاملة ←
                    </button>
                    <button
                      onClick={() => setIsAlertsMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Timeframe selector */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              <button
                id="btn-timeframe-7days"
                onClick={() => setTimeframe('7days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '7days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                id="btn-timeframe-14days"
                onClick={() => setTimeframe('14days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '14days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                آخر 14 يوماً
              </button>
              <button
                id="btn-timeframe-30days"
                onClick={() => setTimeframe('30days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '30days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                آخر 30 يوماً
              </button>
            </div>

            {/* CSV / Excel Import Button */}
            <button
              id="btn-import-products-csv"
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="استيراد وتحديث المنتجات وقوائم الأسعار من ملف CSV أو Excel"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>استيراد CSV / Excel</span>
            </button>

            {/* CSV / Excel Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                id="btn-export-sales-csv-menu"
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>تصدير CSV / Excel</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fadeIn text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100 mb-1">
                    خيارات التصدير وإدارة المخزون
                  </div>

                  <button
                    id="btn-export-inventory-status-csv"
                    type="button"
                    onClick={handleExportInventoryStatusCSV}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-sky-50 hover:text-sky-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <span className="font-bold block">تقرير تتبع المخزون وحدود الطلب</span>
                      <span className="text-[10px] text-slate-400">الأرصدة، مستويات إعادة الطلب والموردين</span>
                    </div>
                  </button>

                  <button
                    id="btn-export-performance-csv"
                    type="button"
                    onClick={handleExportPerformanceCSV}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-bold block">تقرير أداء المبيعات والتسعير</span>
                      <span className="text-[10px] text-slate-400">مبيعات، هوامش، وأسعار الـ Buy Box</span>
                    </div>
                  </button>

                  <button
                    id="btn-export-full-catalog-csv"
                    type="button"
                    onClick={handleExportFullInventoryCSV}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block">كتالوج المخزون بالكامل (Excel)</span>
                      <span className="text-[10px] text-slate-400">كافة بيانات المنتجات، التكاليف والباركود</span>
                    </div>
                  </button>

                  <button
                    id="btn-export-price-history-csv"
                    type="button"
                    onClick={handleExportPriceHistoryCSV}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-sky-50 hover:text-sky-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <span className="font-bold block">سجل تاريخ تغيرات الأسعار (History)</span>
                      <span className="text-[10px] text-slate-400">سجل زمني لجميع حركات الأسعار والمنافسين</span>
                    </div>
                  </button>

                  <button
                    id="btn-export-financial-valuation-csv"
                    type="button"
                    onClick={handleExportFinancialValuationCSV}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">التقرير المالي وهوامش الأرباح</span>
                      <span className="text-[10px] text-slate-400">أرشفة محاسبية، رأس المال، والهوامش</span>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    id="btn-download-sample-template-menu"
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="w-full px-3.5 py-2 text-right text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <span className="font-bold block">تحميل القالب النموذجي</span>
                      <span className="text-[10px] text-slate-400">نموذج جاهز لتعبئة منتجاتك ورفعها</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {onNavigateToArchive && (
              <button
                id="btn-nav-archived-products"
                onClick={onNavigateToArchive}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="عرض مجلد المنتجات غير النشطة والمؤرشفة"
              >
                <Archive className="w-4 h-4 text-sky-700" />
                <span>أرشيف المنتجات ({archivedCount})</span>
              </button>
            )}

            {onNavigateToCommissions && (
              <button
                id="btn-nav-platform-commissions"
                onClick={onNavigateToCommissions}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Calculator className="w-4 h-4 text-emerald-700" />
                حاسبة عمولات المنصات 🧮
              </button>
            )}

            {onNavigateToForecast && (
              <button
                id="btn-nav-seasonal-forecast"
                onClick={onNavigateToForecast}
                className="px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-900 border border-sky-300 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-4 h-4 text-sky-700" />
                توقع الطلب الموسمي والذروة 📦⚡
              </button>
            )}

            {onNavigateToSimulator && (
              <button
                id="btn-nav-profit-simulator"
                onClick={onNavigateToSimulator}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                محاكي الربح المستقبلي
              </button>
            )}
          </div>
        </div>

        {/* 5 High-Impact Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6">
          {/* Total Units Sold */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>حجم المبيعات الكلي</span>
              <ShoppingCart className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {summary.totalUnitsSold.toLocaleString()} <span className="text-xs font-normal text-slate-500">قطعة</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +{summary.salesGrowthRatePercent}% عن الفترة السابقة
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>إجمالي الإيرادات</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {summary.totalRevenueEGP.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              صافي الربح: <strong className="text-emerald-600">{summary.totalNetProfitEGP.toLocaleString()} {currency}</strong>
            </div>
          </div>

          {/* Buy Box Win Rate */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>الفوز بصندوق الشراء (Buy Box)</span>
              <Target className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {summary.buyBoxDominancePercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {summary.buyBoxDominancePercent >= 75 ? '🌟 هيمنة سعرية ممتازة' : '⚠️ بحاجة لقرارات تسعيرية'}
            </div>
          </div>

          {/* Average Margin */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>متوسط هامش الربح</span>
              <Percent className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {summary.overallMarginPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              متوسط التكلفة للطلب محفوظ
            </div>
          </div>

          {/* Top Growth Opportunity */}
          <div className="bg-indigo-50/60 rounded-xl p-3.5 border border-indigo-200/80 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
              <span>أعلى فرصة قفزة مبيعات</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xs font-bold text-slate-900 truncate" title={summary.topOpportunityProduct}>
              {summary.topOpportunityProduct}
            </div>
            <div className="text-[11px] text-indigo-600 font-bold mt-1">
              +45% مبيعات عند تعديل السعر
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Most Important Price Changes Section */}
      <div className="bg-[#F8FAFC] border-2 border-[#000000] rounded-2xl p-5 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#000000]/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#000000] text-[#F8FAFC] flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#000000]">
                أكثر التغيرات السعرية أهمية خلال الـ 24 ساعة الماضية ⚡
              </h3>
              <p className="text-xs text-[#000000] font-semibold mt-0.5">
                أبرز تحركات أسعار المنافسين في السوق المصري خلال آخر 24 ساعة مع إمكانية إعادة التسعير الفوري بناءً على قواعد الربح
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#000000] text-[#F8FAFC] text-xs font-bold font-mono">
            آخر تحديث: منذ دقائق
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mostImportantPriceChanges24h.map((item) => (
            <div key={item.id} className="bg-[#F8FAFC] border-2 border-[#000000] rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-[#000000] shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#000000] truncate">{item.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.direction === 'drop' ? 'bg-rose-100 text-rose-950 border border-rose-300' : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    }`}>
                      {item.direction === 'drop' ? `📉 هبوط ${item.percentChange}%` : `📈 صعود ${item.percentChange}%`}
                    </span>
                    <span className="text-[10px] text-[#000000] font-mono">{item.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#000000]/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#000000] font-semibold">سعر المنافس ({item.competitorName}):</span>
                  <span className="font-bold text-[#000000] font-mono">{item.lowestCompetitorPrice.toLocaleString()} {currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#000000] font-semibold">سعر متجرك الحالي:</span>
                  <span className="font-bold text-[#000000] font-mono">{item.currentPrice.toLocaleString()} {currency}</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/80 p-1.5 rounded-lg border border-amber-300">
                  <span className="text-[#000000] font-bold">السعر الموصى به بربحية:</span>
                  <span className="font-black text-[#000000] font-mono">{item.recommendedWinPrice.toLocaleString()} {currency}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onApplyReprice) {
                    onApplyReprice(item.id, item.recommendedWinPrice);
                  }
                  if (onShowToast) {
                    onShowToast(`⚡ تم إعادة تسعير "${item.title.slice(0, 25)}..." فوراً إلى ${item.recommendedWinPrice} ${currency} بناءً على قواعد الربح!`);
                  }
                }}
                className="w-full h-9 bg-[#000000] hover:bg-[#1E293B] text-[#F8FAFC] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border-2 border-[#000000]"
              >
                <Zap className="w-3.5 h-3.5 text-[#F8FAFC]" />
                <span>إعادة تسعير فوري بقواعد الربح ⚡</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {dashboardTab === 'platform_sync_analytics' ? (
        <PlatformSync30DayChart
          connectedPlatforms={connectedPlatforms}
          onShowToast={onShowToast}
        />
      ) : dashboardTab === 'inventory_tracker' ? (
        <InventoryTracker
          products={activeProducts}
          inventory={inventoryRecords}
          onUpdateInventory={(updated) => {
            setInventoryRecords(updated);
            saveStoredInventory(updated);
          }}
          currency={currency}
          onShowToast={onShowToast}
          onSelectProduct={(p) => {
            if (onNavigateToRadar) onNavigateToRadar(p.id);
          }}
        />
      ) : (
        <>
          {/* Actionable Correlation Insights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
              ins.type === 'opportunity'
                ? 'bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-indigo-800 shadow-md'
                : ins.type === 'surge'
                ? 'bg-emerald-950 text-emerald-50 border-emerald-800 shadow-md'
                : 'bg-sky-950 text-sky-50 border-sky-800 shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  ins.type === 'opportunity' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' :
                  ins.type === 'surge' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
                  'bg-sky-500/30 text-sky-200 border border-sky-400/30'
                }`}>
                  {ins.type === 'opportunity' ? '⚡ فرصة استعادة الصدارة' : ins.type === 'surge' ? '🚀 فرصة رفع السعر' : '⚠️ تنبيه فجوة سعرية'}
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  {ins.impactMetric}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white mb-1.5">
                {ins.headline}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                {ins.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="text-[11px]">
                <span className="text-slate-400 block text-[10px]">السعر المقترح:</span>
                <span className="font-black text-white text-sm">{ins.recommendedPriceEGP.toLocaleString()} {currency}</span>
              </div>

              <button
                id={`btn-apply-insight-${ins.id}`}
                onClick={() => {
                  const targetProd = productPerformances.find(p => p.productTitle === ins.productTitle) || productPerformances[0];
                  handleOpenRepriceModal(targetProd, ins.recommendedPriceEGP);
                }}
                className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-transform active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                تطبيق السعر فوراً
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        {/* Chart Header & Mode Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                {chartViewMode === 'cost_vs_price_margin' ? (
                  selectedDrilldownProduct 
                    ? `اتجاهات تكلفة الجملة وسعر البيع وتذبذب الهامش: ${selectedDrilldownProduct.productTitle}`
                    : `اتجاهات تكلفة الجملة التاريخية vs سعر البيع وتذبذب هوامش الربح عبر الزمن`
                ) : chartViewMode === 'price_evolution' ? (
                  selectedDrilldownProduct 
                    ? `تطور سعر: ${selectedDrilldownProduct.productTitle} مقابل المنافسين عبر الوقت`
                    : `تطور أسعار المنتجات المحددة (${priceEvolutionDataset.targetProds.length}) مقارنة بالمنافسين عبر الوقت`
                ) : chartViewMode === 'market_share' ? (
                  `تحليل الحصة السوقية التنافسية (Firestore Market Share Analysis) - ${marketShareRecord?.category === 'all' ? 'كافة القطاعات' : marketShareRecord?.category || 'القطاع'}`
                ) : selectedDrilldownProduct ? (
                  `أداء مبيعات: ${selectedDrilldownProduct.productTitle}`
                ) : (
                  'الرسم البياني لحجم المبيعات ومقارنتها بتغير أسعار المنافسين'
                )}
              </h2>
              {selectedDrilldownProduct && (
                <button
                  id="btn-reset-drilldown"
                  onClick={() => setSelectedDrilldownProduct(null)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>العودة للمقارنة المتعددة</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {chartViewMode === 'cost_vs_price_margin'
                ? 'رسم بياني تفاعلي متقدم يقارن مسار تكلفة الجملة التاريخية من الموردين بسعر البيع الفعلي بالمتجر، ويتتبع تذبذب هوامش الربح الصافية (Margin Expansion & Compression) عبر الزمن لحماية ربحية التاجر.'
                : chartViewMode === 'market_share'
                ? 'رسم بياني تفاعلي مبني مباشرة على سجلات Firestore وقواعد بيانات السوق المصري: يقارن النسبة المئوية لحصة متجرك مقابل أبرز 4 منافسين رئيسيين وحجم المبيعات المقدر لكل منصة.'
                : chartViewMode === 'price_evolution'
                ? 'تتبع المسار الزمني لسعر بيع منتجاتك في المتجر مقارنة بأرخص سعر معروض لدى المنافسين في السوق المصري (أمازون، نون، جوميا).'
                : 'محور الأعمدة (يسار): عدد القطع المباعة يومياً | محور الخطوط (يمين): متوسط سعر متجرك مقابل أرخص منافس بالجنيه المصري.'}
            </p>
          </div>

          {/* Chart View Modes Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            {/* Historical Wholesale Cost vs Retail Price & Margin Trend Tab */}
            <button
              id="btn-chart-mode-cost-margin"
              onClick={() => setChartViewMode('cost_vs_price_margin')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'cost_vs_price_margin'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-300 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض اتجاهات تكلفة الجملة التاريخية بجانب اتجاهات سعر البيع وتتبع تذبذب هوامش الربح عبر الزمن"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>تكلفة الجملة vs سعر البيع وهامش الربح 📉</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                هوامش الربح 💰
              </span>
            </button>

            {/* Interactive Market Share Tab */}
            <button
              id="btn-chart-mode-market-share"
              onClick={() => setChartViewMode('market_share')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'market_share' 
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-300' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض مقارنة تفاعلية لحصة السوق الخاصة بمتجرك مقابل المنافسين الرئيسيين بناءً على بيانات Firestore"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>حصة السوق والمنافسين 🎯</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                Firestore ⚡
              </span>
            </button>

            <button
              id="btn-chart-mode-price-evolution"
              onClick={() => setChartViewMode('price_evolution')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartViewMode === 'price_evolution' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>تطور الأسعار والمنافسين 📈</span>
            </button>
            <button
              id="btn-chart-mode-sales-price"
              onClick={() => setChartViewMode('sales_vs_price')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'sales_vs_price' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>حجم المبيعات vs الأسعار 🛒</span>
            </button>
            <button
              id="btn-chart-mode-platforms"
              onClick={() => setChartViewMode('platforms_breakdown')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'platforms_breakdown' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>توزيع المنصات 🏬</span>
            </button>
            <button
              id="btn-chart-mode-revenue-profit"
              onClick={() => setChartViewMode('revenue_profit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'revenue_profit' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>الإيرادات والأرباح 💰</span>
            </button>
            <button
              id="btn-chart-mode-platform-sync-30d"
              type="button"
              onClick={() => setDashboardTab('platform_sync_analytics')}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200"
              title="عرض المخطط البياني لتطور حالة مزامنة المنصات وتمييز فترات التوقف خلال الـ 30 يوماً الماضية"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>مزامنة المنصات (30 يوماً) 📡</span>
            </button>

            {/* Primary Colors Customizer Button */}
            <button
              id="btn-chart-theme-customize"
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="تخصيص وتغيير الألوان الرئيسية للوحة التحكم (Primary Colors) وحفظها في المتصفح"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shrink-0" 
                style={{ backgroundColor: currentTheme.primaryHex }}
              />
              <Palette className="w-3.5 h-3.5 text-slate-600" />
              <span>ألوان اللوحة</span>
            </button>
          </div>
        </div>

        {/* Dedicated Wholesale Cost vs Selling Price & Margin Trend Controls & KPIs (Active in Cost Margin Mode) */}
        {chartViewMode === 'cost_vs_price_margin' && (
          <div className="space-y-3 pt-1">
            {/* Top Sub-Bar: Layer Toggles & Product Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-slate-500 text-[11px] ml-1">طبقات العرض:</span>
                
                <button
                  type="button"
                  onClick={() => setShowSellingPriceLine(!showSellingPriceLine)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showSellingPriceLine 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  <span>سعر البيع المعتمد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWholesaleCostLine(!showWholesaleCostLine)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showWholesaleCostLine 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>تكلفة الجملة التاريخية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMarginSpreadArea(!showMarginSpreadArea)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showMarginSpreadArea 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-300 inline-block"></span>
                  <span>نطاق هامش الربح</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMarginPercentLine(!showMarginPercentLine)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showMarginPercentLine 
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span>نسبة الهامش % (المحور الأيمن)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCostCompetitorLine(!showCostCompetitorLine)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showCostCompetitorLine 
                      ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-1 border-t-2 border-dashed border-sky-500 inline-block"></span>
                  <span>أرخص منافس بالسوق</span>
                </button>
              </div>

              {/* Product Drilldown Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-slate-500 text-[11px] whitespace-nowrap">عرض المنتج:</span>
                <select
                  value={selectedDrilldownProduct?.productId || 'all'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'all') {
                      setSelectedDrilldownProduct(null);
                    } else {
                      const prod = productPerformances.find(p => p.productId === val);
                      if (prod) setSelectedDrilldownProduct(prod);
                    }
                  }}
                  className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 max-w-[220px] truncate"
                >
                  <option value="all">المتوسط المجمع لكافة المنتجات ({productPerformances.length})</option>
                  {productPerformances.map(p => (
                    <option key={p.productId} value={p.productId}>
                      {p.productTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wholesale Cost & Margin KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Retail Selling Price Card */}
              <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-200/80">
                <div className="flex items-center justify-between text-xs text-indigo-800 font-bold mb-1">
                  <span>سعر البيع الحالي</span>
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-xl font-black text-indigo-950">
                  {(activeChartData[activeChartData.length - 1]?.merchantAvgPrice || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  السعر المعتمد للمستهلك
                </div>
              </div>

              {/* Wholesale Cost Card */}
              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                  <span>تكلفة الجملة التاريخية</span>
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-emerald-950">
                  {(activeChartData[activeChartData.length - 1]?.wholesaleCostEGP || (selectedDrilldownProduct?.costPrice || 0)).toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  سعر التوريد من المصنع/المورد
                </div>
              </div>

              {/* Net Profit Margin per unit */}
              <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                  <span>هامش الربح الصافي للقطعة</span>
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-black text-amber-950">
                  +{(activeChartData[activeChartData.length - 1]?.profitMarginEGP ?? ((activeChartData[activeChartData.length - 1]?.merchantAvgPrice || 0) - (activeChartData[activeChartData.length - 1]?.wholesaleCostEGP || (selectedDrilldownProduct?.costPrice || 0)))).toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  فارق السعر الصافي للوحدة
                </div>
              </div>

              {/* Margin Rate & Fluctuation Trend */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1">
                  <span>نسبة الهامش الحالية</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-emerald-100 text-emerald-800">
                    {activeChartData[activeChartData.length - 1]?.grossMarginPercent || 0}%
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {activeChartData[activeChartData.length - 1]?.grossMarginPercent || 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>أعلى: {Math.max(...activeChartData.map(d => d.grossMarginPercent || 0))}%</span>
                  <span>أدنى: {Math.min(...activeChartData.map(d => d.grossMarginPercent || 0))}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Firestore Market Share Controls & Real-Time Stats (Active in Market Share Mode) */}
        {chartViewMode === 'market_share' && (
          <div className="space-y-3 pt-1">
            {/* Top Sub-Bar: Sub-Chart View Selector & Firestore Connection Status */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Sub-Chart Toggles */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-500 text-[11px] ml-1">نوع العرض:</span>
                <button
                  id="btn-sub-donut-breakdown"
                  type="button"
                  onClick={() => setMarketShareDisplayType('donut_breakdown')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    marketShareDisplayType === 'donut_breakdown'
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>مخطط الحصة الدائري (Donut %)</span>
                </button>

                <button
                  id="btn-sub-volume-bars"
                  type="button"
                  onClick={() => setMarketShareDisplayType('volume_bars')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    marketShareDisplayType === 'volume_bars'
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <BarChart className="w-3.5 h-3.5 text-indigo-600" />
                  <span>مقارنة الحصة والإيرادات (Bar Comparison)</span>
                </button>

                <button
                  id="btn-sub-historical-trend"
                  type="button"
                  onClick={() => setMarketShareDisplayType('historical_trend')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    marketShareDisplayType === 'historical_trend'
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>المسار الزمني لتغير الحصة (Trend Lines)</span>
                </button>
              </div>

              {/* Firestore Live Status & Manual Refresh */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700">Firestore Live</span>
                  <span className="text-[10px] text-slate-400">
                    {(marketShareRecord?.syncedAt || marketShareRecord?.lastUpdated) ? `(محدث: ${new Date(marketShareRecord.syncedAt || marketShareRecord.lastUpdated!).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })})` : ''}
                  </span>
                </div>

                <button
                  id="btn-refresh-market-share-firestore"
                  type="button"
                  onClick={handleRefreshMarketShareFirestore}
                  disabled={isSyncingMarketShareFirestore}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="إعادة حساب ومزامنة بيانات الحصة السوقية فوراً مع Firestore"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMarketShareFirestore ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{isSyncingMarketShareFirestore ? 'جارٍ المزامنة...' : 'تحديث Firestore'}</span>
                </button>
              </div>
            </div>

            {/* Market Share Fast Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Merchant Store Share */}
              <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-200/80">
                <div className="flex items-center justify-between text-xs text-indigo-800 font-bold mb-1">
                  <span>حصة متجرك ({merchantStoreName})</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-200/60 text-indigo-900 font-black">
                    {marketShareRecord && marketShareRecord.merchantSharePercent >= 30 ? '🏆 المركز الأول' : '⚡ وصيف الحصة'}
                  </span>
                </div>
                <div className="text-xl font-black text-indigo-950">
                  {marketShareRecord?.merchantSharePercent || 0}%
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  مبيعات مقدرة: <strong>{marketShareRecord?.breakdown?.find(b => b.isMerchant)?.estimatedVolumeEGP?.toLocaleString()} {currency}</strong>
                </div>
              </div>

              {/* Top Competitor */}
              <div className="bg-sky-50/70 rounded-xl p-3 border border-sky-200/80">
                <div className="flex items-center justify-between text-xs text-sky-800 font-bold mb-1">
                  <span>أكبر منافس ملاحق</span>
                  <span className="text-[10px] bg-sky-200/60 text-sky-900 px-1.5 py-0.5 rounded font-bold">
                    {marketShareRecord?.breakdown?.[1]?.sharePercent || 0}%
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 truncate" title={marketShareRecord?.breakdown?.[1]?.name}>
                  {marketShareRecord?.breakdown?.[1]?.name || 'المنافس الأكبر'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  مبيعات مقدرة: <strong>{marketShareRecord?.breakdown?.[1]?.estimatedVolumeEGP?.toLocaleString()} {currency}</strong>
                </div>
              </div>

              {/* Combined Competitors Share */}
              <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                  <span>إجمالي حصة المنافسين</span>
                  <span className="text-[10px] text-amber-700 font-bold">4 منافسين</span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {marketShareRecord?.competitorsSharePercent || 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  متوسط السعر: <strong>{marketShareRecord?.breakdown?.[1]?.averagePrice?.toLocaleString()} {currency}</strong>
                </div>
              </div>

              {/* Total Category Market Volume */}
              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200/80">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                  <span>حجم التداول التقديري في القطاع</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-slate-900">
                  {marketShareRecord?.totalMarketVolumeEGP?.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  إجمالي الطلبات المقدرة: <strong>{marketShareRecord?.totalMarketUnits?.toLocaleString()} قطعة</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Price Evolution Product Selector & Layer Controls (Active in Price Evolution Mode) */}
        {chartViewMode === 'price_evolution' && (
          <div className="space-y-3 pt-1">
            {/* Interactive Product Selector Bar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-600" />
                    المنتجات المحددة للمقارنة في الرسم البياني:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (اختر حتى 5 منتجات للمقارنة المتزامنة)
                  </span>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={handleSelectTop3Products}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    🔥 أعلى 3 مبيعاً
                  </button>
                  <button
                    onClick={handleSelectAllFilteredForComparison}
                    className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    تحديد أول 5
                  </button>
                  {selectedComparisonProductIds.length > 1 && (
                    <button
                      onClick={() => setSelectedComparisonProductIds([productPerformances[0]?.productId])}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-500 rounded-lg border border-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      إعادة ضبط
                    </button>
                  )}
                </div>
              </div>

              {/* Product Pills Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {productPerformances.map((prod, idx) => {
                  const isChecked = selectedComparisonProductIds.includes(prod.productId) || selectedDrilldownProduct?.productId === prod.productId;
                  const colorIdx = priceEvolutionDataset.targetProds.findIndex(p => p.productId === prod.productId);
                  const activeColor = colorIdx >= 0 ? PRODUCT_SERIES_COLORS[colorIdx % PRODUCT_SERIES_COLORS.length] : null;

                  return (
                    <button
                      key={prod.productId}
                      onClick={() => {
                        if (selectedDrilldownProduct) {
                          setSelectedDrilldownProduct(null);
                        }
                        handleToggleComparisonProduct(prod.productId);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                        isChecked && activeColor
                          ? `${activeColor.bg} ring-1 ring-indigo-400 shadow-2xs`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {isChecked && activeColor && (
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeColor.merchant }} />
                        )}
                      </div>
                      <span className="truncate max-w-[130px] sm:max-w-[160px] text-right" title={prod.productTitle}>
                        {prod.productTitle}
                      </span>
                      <span className="text-[10px] opacity-75 font-normal">
                        ({prod.currentPrice.toLocaleString()} {currency})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Chart Visual Layer Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-600">
                  <span>طبقات الرسم البياني:</span>
                  <button
                    onClick={() => setShowCompetitorLines(!showCompetitorLines)}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showCompetitorLines
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3 text-sky-600" />
                    <span>خطوط المنافسين (متقطع)</span>
                  </button>

                  {priceEvolutionDataset.targetProds.length === 1 && (
                    <>
                      <button
                        onClick={() => setShowCostLine(!showCostLine)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          showCostLine
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>خط التكلفة بالجملة</span>
                      </button>

                      <button
                        onClick={() => setShowPriceSpreadArea(!showPriceSpreadArea)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          showPriceSpreadArea
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <Percent className="w-3 h-3 text-indigo-600" />
                        <span>تظليل الفارق السعري</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  * اضغط على أي منتج لتحديده أو إلغائه من الرسم
                </div>
              </div>
            </div>

            {/* Single Product KPI Metric Strip (When 1 product is focused) */}
            {priceEvolutionDataset.targetProds.length === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/40 p-3 rounded-2xl border border-indigo-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">سعرك الحالي بالمتجر:</span>
                  <span className="font-black text-indigo-900 text-sm">
                    {priceEvolutionDataset.targetProds[0].currentPrice.toLocaleString()} {currency}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium truncate" title={priceEvolutionDataset.targetProds[0].lowestCompetitorName}>
                    أرخص منافس ({priceEvolutionDataset.targetProds[0].lowestCompetitorName}):
                  </span>
                  <span className="font-black text-sky-700 text-sm">
                    {priceEvolutionDataset.targetProds[0].lowestCompetitorPrice.toLocaleString()} {currency}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">الفارق التنافسي:</span>
                  <span className={`font-black text-sm ${
                    priceEvolutionDataset.targetProds[0].priceDifference <= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {priceEvolutionDataset.targetProds[0].priceDifference <= 0 
                      ? `أرخص بـ ${Math.abs(priceEvolutionDataset.targetProds[0].priceDifference)} ${currency}` 
                      : `أغلى بـ ${priceEvolutionDataset.targetProds[0].priceDifference} ${currency}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">حالة الصدارة الحالية:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    priceEvolutionDataset.targetProds[0].buyBoxStatus === 'won' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {priceEvolutionDataset.targetProds[0].buyBoxStatus === 'won' ? '🏆 صدارة الـ Buy Box' : '⚠️ متأخر عن الصدارة'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recharts Container */}
        <div className="h-[380px] w-full min-w-0 pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={340} debounce={50}>
            {chartViewMode === 'cost_vs_price_margin' ? (
              /* Wholesale Cost vs Selling Price & Margin Fluctuations Interactive Chart */
              <ComposedChart data={activeChartData} margin={{ top: 20, right: 25, bottom: 25, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Left Y-Axis: Price & Wholesale Cost (EGP) */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#4f46e5' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toLocaleString()} ج.م`}
                />
                {/* Right Y-Axis: Gross Margin % */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 60]}
                  tick={{ fontSize: 11, fill: '#059669' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomCostMarginTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={38} 
                  formatter={(value) => {
                    if (value === 'merchantAvgPrice') return <span className="text-xs font-bold text-indigo-700">سعر البيع بالمتجر (ج.م)</span>;
                    if (value === 'wholesaleCostEGP') return <span className="text-xs font-bold text-emerald-700">تكلفة الجملة التاريخية (ج.م)</span>;
                    if (value === 'grossMarginPercent') return <span className="text-xs font-bold text-amber-600">نسبة هامش الربح (%)</span>;
                    if (value === 'lowestCompetitorAvgPrice') return <span className="text-xs font-bold text-sky-600">أرخص سعر منافس (ج.م)</span>;
                    return value;
                  }}
                />
                {/* Profit Margin Spread Area */}
                {showMarginSpreadArea && (
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="merchantAvgPrice" 
                    name="نطاق هامش الربح" 
                    fill="#d1fae5" 
                    stroke="none" 
                    fillOpacity={0.4} 
                  />
                )}
                {/* Wholesale Cost Line */}
                {showWholesaleCostLine && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="wholesaleCostEGP" 
                    name="wholesaleCostEGP" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#059669' }} 
                    activeDot={{ r: 6 }}
                  />
                )}
                {/* Selling Price Line */}
                {showSellingPriceLine && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="merchantAvgPrice" 
                    name="merchantAvgPrice" 
                    stroke={currentTheme.chartPrimary} 
                    strokeWidth={3.5} 
                    dot={{ r: 4, fill: currentTheme.chartPrimary }} 
                    activeDot={{ r: 7 }}
                  />
                )}
                {/* Lowest Competitor Line */}
                {showCostCompetitorLine && (
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="lowestCompetitorAvgPrice" 
                    name="lowestCompetitorAvgPrice" 
                    stroke="#0ea5e9" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={{ r: 3, fill: '#0ea5e9' }} 
                  />
                )}
                {/* Margin Percentage Line on Right Y-Axis */}
                {showMarginPercentLine && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="grossMarginPercent" 
                    name="grossMarginPercent" 
                    stroke="#d97706" 
                    strokeWidth={2.5} 
                    dot={{ r: 3.5, fill: '#d97706' }} 
                  />
                )}
              </ComposedChart>
            ) : chartViewMode === 'market_share' ? (
              marketShareDisplayType === 'donut_breakdown' ? (
                /* Interactive Market Share Donut Chart */
                <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <Tooltip content={<CustomMarketShareTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={45} 
                    formatter={(val) => {
                      const item = (marketShareRecord?.breakdown || []).find(b => b.name === val);
                      return (
                        <span className={`text-xs font-bold ${item?.isMerchant ? 'text-indigo-800 font-black' : 'text-slate-700'}`}>
                          {val} ({item?.sharePercent || 0}%)
                        </span>
                      );
                    }}
                  />
                  <Pie
                    data={marketShareRecord?.breakdown || []}
                    dataKey="sharePercent"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={115}
                    paddingAngle={3}
                    label={({ name, percent }: any) => `${name?.split(' ')[0]}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={true}
                  >
                    {(marketShareRecord?.breakdown || []).map((entry, index) => (
                      <Cell 
                        key={`cell-pie-${index}`} 
                        fill={entry.color || (entry.isMerchant ? currentTheme.chartPrimary : '#0284c7')} 
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : marketShareDisplayType === 'volume_bars' ? (
                /* Interactive Market Share & Revenue Volume Bars */
                <BarChart data={marketShareRecord?.breakdown || []} margin={{ top: 20, right: 25, bottom: 25, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v: string) => v.split(' ')[0] + ' ' + (v.split(' ')[1] || '')}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#4f46e5' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#059669' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k ج.م`}
                  />
                  <Tooltip content={<CustomMarketShareTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="sharePercent" 
                    name="الحصة السوقية (%)" 
                    fill={currentTheme.chartPrimary} 
                    radius={[6, 6, 0, 0]} 
                    barSize={28}
                  >
                    {(marketShareRecord?.breakdown || []).map((entry, index) => (
                      <Cell 
                        key={`bar-cell-${index}`} 
                        fill={entry.isMerchant ? currentTheme.chartPrimary : (entry.color || '#0284c7')} 
                      />
                    ))}
                  </Bar>
                  <Bar 
                    yAxisId="right" 
                    dataKey="estimatedVolumeEGP" 
                    name="الإيرادات التقديرية (ج.م)" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    barSize={20}
                  />
                </BarChart>
              ) : (
                /* Interactive Market Share Historical Trend Lines */
                <LineChart data={marketShareRecord?.historicalTrend || []} margin={{ top: 20, right: 20, bottom: 20, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="periodLabel" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="merchantShare" name={`${merchantStoreName} (متجرك)`} stroke={currentTheme.chartPrimary} strokeWidth={3.5} dot={{ r: 4, fill: currentTheme.chartPrimary }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="competitorA" name={marketShareRecord?.breakdown?.[1]?.name || 'المنافس الأول'} stroke="#0284c7" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="competitorB" name={marketShareRecord?.breakdown?.[2]?.name || 'المنافس الثاني'} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="competitorC" name={marketShareRecord?.breakdown?.[3]?.name || 'المنافس الثالث'} stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="others" name="بقية المتاجر" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="2 2" dot={{ r: 2 }} />
                </LineChart>
              )
            ) : chartViewMode === 'price_evolution' ? (
              priceEvolutionDataset.targetProds.length === 1 ? (
                /* Single Product Detailed Price Evolution Chart */
                <ComposedChart data={priceEvolutionDataset.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#4f46e5' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toLocaleString()} ج.م`}
                  />
                  <Tooltip content={<CustomPriceEvolutionTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(value) => {
                      if (value === 'merchantAvgPrice') return <span className="text-xs font-bold text-indigo-700">سعر متجرك المعتمد (ج.م)</span>;
                      if (value === 'lowestCompetitorAvgPrice') return <span className="text-xs font-bold text-sky-600">أقل سعر منافس بالسوق (ج.م)</span>;
                      return value;
                    }} 
                  />
                  {showPriceSpreadArea && (
                    <Area 
                      type="monotone" 
                      dataKey="lowestCompetitorAvgPrice" 
                      name="نطاق سعر المنافس" 
                      fill="#e0f2fe" 
                      stroke="none" 
                      fillOpacity={0.35} 
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="merchantAvgPrice" 
                    name="merchantAvgPrice" 
                    stroke={currentTheme.chartPrimary} 
                    strokeWidth={3.5} 
                    dot={{ r: 4, fill: currentTheme.chartPrimary }} 
                    activeDot={{ r: 7 }}
                  />
                  {showCompetitorLines && (
                    <Line 
                      type="monotone" 
                      dataKey="lowestCompetitorAvgPrice" 
                      name="lowestCompetitorAvgPrice" 
                      stroke="#0ea5e9" 
                      strokeWidth={2.5} 
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#0ea5e9' }} 
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {showCostLine && priceEvolutionDataset.targetProds[0]?.costPrice && (
                    <ReferenceLine 
                      y={priceEvolutionDataset.targetProds[0].costPrice} 
                      stroke="#10b981" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: `سعر التكلفة: ${priceEvolutionDataset.targetProds[0].costPrice.toLocaleString()} ${currency}`, 
                        position: 'insideBottomLeft', 
                        fill: '#059669', 
                        fontSize: 11,
                        fontWeight: 'bold'
                      }} 
                    />
                  )}
                </ComposedChart>
              ) : (
                /* Multi-Product Price Trajectory Comparison Chart */
                <LineChart data={priceEvolutionDataset.chartData} margin={{ top: 20, right: 20, bottom: 20, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toLocaleString()} ج.م`}
                  />
                  <Tooltip content={<CustomPriceEvolutionTooltip />} />
                  <Legend verticalAlign="top" height={42} />
                  {priceEvolutionDataset.targetProds.map((prod, pIdx) => {
                    const color = PRODUCT_SERIES_COLORS[pIdx % PRODUCT_SERIES_COLORS.length];
                    return (
                      <React.Fragment key={prod.productId}>
                        <Line
                          type="monotone"
                          dataKey={`merchant_${prod.productId}`}
                          name={`${prod.productTitle} (سعرك)`}
                          stroke={color.merchant}
                          strokeWidth={2.5}
                          dot={{ r: 3.5, fill: color.merchant }}
                          activeDot={{ r: 6 }}
                        />
                        {showCompetitorLines && (
                          <Line
                            type="monotone"
                            dataKey={`competitor_${prod.productId}`}
                            name={`${prod.productTitle} (المنافس)`}
                            stroke={color.competitor}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={{ r: 3, fill: color.competitor }}
                            activeDot={{ r: 5 }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              )
            ) : chartViewMode === 'sales_vs_price' ? (
              <ComposedChart data={activeChartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Left Axis: Units Sold */}
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fontSize: 11, fill: '#4f46e5' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Right Axis: Price in EGP */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#0284c7' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => {
                    if (value === 'unitsSold') return <span className="text-xs font-bold text-slate-700">حجم المبيعات اليومي (قطع)</span>;
                    if (value === 'merchantAvgPrice') return <span className="text-xs font-bold text-indigo-700">سعر متجرك (ج.م)</span>;
                    if (value === 'lowestCompetitorAvgPrice') return <span className="text-xs font-bold text-sky-600">أقل سعر منافس (ج.م)</span>;
                    return value;
                  }} 
                />
                {/* Bar for Daily Units */}
                <Bar 
                  yAxisId="left" 
                  dataKey="unitsSold" 
                  name="unitsSold" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={timeframe === '30days' ? 12 : 22} 
                />
                {/* Line for Merchant Price */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="merchantAvgPrice" 
                  name="merchantAvgPrice" 
                  stroke={currentTheme.chartPrimary} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: currentTheme.chartPrimary }} 
                />
                {/* Line for Lowest Competitor Price */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="lowestCompetitorAvgPrice" 
                  name="lowestCompetitorAvgPrice" 
                  stroke="#0ea5e9" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#0ea5e9' }} 
                />
              </ComposedChart>
            ) : chartViewMode === 'platforms_breakdown' ? (
              <BarChart data={activeChartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => {
                    if (value === 'amazonSalesUnits') return <span className="text-xs font-bold text-sky-600">أمازون مصر</span>;
                    if (value === 'noonSalesUnits') return <span className="text-xs font-bold text-sky-600">نون مصر</span>;
                    if (value === 'jumiaSalesUnits') return <span className="text-xs font-bold text-orange-600">جوميا</span>;
                    if (value === 'directSalesUnits') return <span className="text-xs font-bold text-emerald-600">المتجر المباشر</span>;
                    return value;
                  }} 
                />
                <Bar dataKey="amazonSalesUnits" name="amazonSalesUnits" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="noonSalesUnits" name="noonSalesUnits" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="jumiaSalesUnits" name="jumiaSalesUnits" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="directSalesUnits" name="directSalesUnits" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <ComposedChart data={activeChartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(value) => {
                    if (value === 'revenueEGP') return <span className="text-xs font-bold" style={{ color: currentTheme.chartPrimary }}>الإيرادات (ج.م)</span>;
                    if (value === 'netProfitEGP') return <span className="text-xs font-bold text-emerald-700">صافي الربح (ج.م)</span>;
                    return value;
                  }} 
                />
                <Area type="monotone" dataKey="revenueEGP" name="revenueEGP" fill={currentTheme.chartLight} stroke={currentTheme.chartPrimary} strokeWidth={2} />
                <Line type="monotone" dataKey="netProfitEGP" name="netProfitEGP" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Cost vs Price & Margin Fluctuation Analysis & Actionable Supplier Insights (when in cost_vs_price_margin mode) */}
        {chartViewMode === 'cost_vs_price_margin' ? (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>تحليل تذبذب هوامش الربح وتأثير تكلفة الجملة على قرارات التسعير</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  رصد دقيق لفترات اتساع الهامش (Margin Expansion) وفترات ضغط الهامش (Margin Compression) مع توصيات التفاوض مع الموردين.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                متوسط الهامش الصافي: {summary.overallMarginPercent}%
              </span>
            </div>

            {/* Strategic Fluctuation Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Margin Compression Diagnosis */}
              <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                    فترات ضغط وتآكل الهامش (Compression)
                  </span>
                  <span className="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded text-amber-950 font-black">تنبيه وقائي</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  تحدث فترات ضغط الهامش عند خفض سعر البيع لمجاراة أرخص منافس واقتناص الـ Buy Box دون الحصول على تخفيض موازٍ في تكلفة الجملة من المورد، مما يخفض الهامش إلى أدنى مستوياته ({Math.min(...activeChartData.map(d => d.grossMarginPercent || 20))} %).
                </p>
                <div className="text-[10px] text-amber-900 font-bold bg-white/70 p-2 rounded-xl border border-amber-200">
                  💡 الإجراء المقترح: تفعيل سقف حماية أدنى للسعر (Floor Price Guardrail) لضمان عدم هبوط الهامش عن 15%.
                </div>
              </div>

              {/* Card 2: Margin Expansion Drivers */}
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    فترات اتساع وزيادة الهامش (Expansion)
                  </span>
                  <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded text-emerald-950 font-black">فرصة ربحية</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  تتسع هوامش الربح وتصل لذروتها ({Math.max(...activeChartData.map(d => d.grossMarginPercent || 30))} %) عند استلام دفعات توريد بخصومات كمية من الموردين، أو عند رفع السعر تدريجياً بعد تراجع المخزون لدى المنافسين في السوق.
                </p>
                <div className="text-[10px] text-emerald-900 font-bold bg-white/70 p-2 rounded-xl border border-emerald-200">
                  💡 الإجراء المقترح: تعزيز طلبيات التوريد المجمعة للحفاظ على أسعار التكلفة المخفضة لفترات أطول.
                </div>
              </div>

              {/* Card 3: Wholesale Supplier Actions */}
              <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    استراتيجية التفاوض مع الموردين
                  </span>
                  <span className="text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-950 font-black">موصى به</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  المنتجات ذات دوران المخزون السريع تمنح متجرك قوة تفاوضية عالية. اطلب خصم كمية إضافي بنسبة 3-5% بناءً على أرقام السحب الفعلية الموثقة في لوحة المبيعات لزيادة الهامش السنوي.
                </p>
                <div className="text-[10px] text-indigo-900 font-bold bg-white/70 p-2 rounded-xl border border-indigo-200">
                  💡 الإجراء المقترح: تصدير تقرير التقييم المالي وهوامش الربح وتقديمه لمورد الجملة المعتمد.
                </div>
              </div>
            </div>
          </div>
        ) : chartViewMode === 'market_share' ? (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>تفاصيل حصص المنافسين وتوزيع المبيعات عبر المنصات (سجلات Firestore)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحليل مقارن للمبيعات المقدرة، متوسط الأسعار، ونقاط التنافس عبر أمازون، نون، جوميا، والمتاجر المباشرة.
                </p>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
                إجمالي المنافسين المرصودين: {(marketShareRecord?.breakdown?.length || 1) - 1} منافسين رئيسيين
              </span>
            </div>

            {/* Competitor Breakdown Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(marketShareRecord?.breakdown || []).map((comp, idx) => {
                const isOurStore = comp.isMerchant;
                const ourAvgPrice = marketShareRecord?.breakdown.find(b => b.isMerchant)?.averagePrice || comp.averagePrice;
                const priceDiffPercent = ourAvgPrice > 0 ? Math.round(((comp.averagePrice - ourAvgPrice) / ourAvgPrice) * 100) : 0;

                return (
                  <div
                    key={comp.name}
                    className={`rounded-2xl p-4 border transition-all ${
                      isOurStore
                        ? 'bg-gradient-to-br from-indigo-50/90 to-purple-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Card Top: Rank + Name + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 shadow-2xs'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <h5 className="font-black text-xs text-slate-900 truncate" title={comp.name}>
                            {comp.name}
                          </h5>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {isOurStore ? 'متجرك المعتمد بالمنظومة' : 'منافس رائد بالسوق المصري'}
                          </span>
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black shrink-0"
                        style={{
                          backgroundColor: `${comp.color || '#4f46e5'}20`,
                          color: comp.color || '#4f46e5'
                        }}
                      >
                        {comp.sharePercent}%
                      </span>
                    </div>

                    {/* Progress Bar of Market Share */}
                    <div className="space-y-1 mb-3">
                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, comp.sharePercent * 2)}%`,
                            backgroundColor: comp.color || (isOurStore ? currentTheme.chartPrimary : '#0284c7')
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>نسبة الاستحواذ المقدرة:</span>
                        <span className="font-bold text-slate-800">{comp.sharePercent}% من السوق</span>
                      </div>
                    </div>

                    {/* Numerical Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">المبيعات المقدرة:</span>
                        <span className="font-black text-slate-900 text-xs">
                          {comp.estimatedVolumeEGP?.toLocaleString()} {currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">الكمية المباعة:</span>
                        <span className="font-black text-slate-900 text-xs">
                          {comp.unitsSold?.toLocaleString()} قطعة
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">متوسط سعر البيع:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{comp.averagePrice?.toLocaleString()} {currency}</span>
                          {!isOurStore && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              priceDiffPercent > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : priceDiffPercent < 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {priceDiffPercent > 0 ? `أغلى منك +${priceDiffPercent}%` : priceDiffPercent < 0 ? `أرخص منك ${priceDiffPercent}%` : 'متطابق'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Platform Breakdown Pills */}
                    {comp.platformDistribution && (
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1 text-[10px]">
                        <span className="text-slate-400 text-[9px] shrink-0">توزيع المنصات:</span>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          <span className="px-1.5 py-0.5 rounded bg-sky-100/70 text-sky-800 font-bold text-[9px]">
                            أمازون {comp.platformDistribution.amazon_eg}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-800 font-bold text-[9px]">
                            نون {comp.platformDistribution.noon_eg}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-100/70 text-orange-800 font-bold text-[9px]">
                            جوميا {comp.platformDistribution.jumia_eg}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Strategic Summary Note */}
            <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block text-indigo-950 mb-0.5">
                  رؤية استراتيجية لتحسين الحصة السوقية (Firestore Intelligence):
                </span>
                <p className="text-[11px] leading-relaxed text-indigo-800">
                  متجرك يحافظ على حصة قوية تبلغ <strong>{marketShareRecord?.merchantSharePercent}%</strong> في السوق المصري. لتوسيع الفارق عن المنافسين الملاحقين، ننصح بضبط استراتيجيات التسعير في صندوق الشراء (Buy Box) على منصتي أمازون ونون للمنتجات ذات الفارق السعري الهامشي (أقل من 3%) لرفع حجم المبيعات الإجمالي فوراً.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Quick Legend & Help Info for standard sales modes */
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-700 inline-block"></span>
                خط متصل: سعرك المعتمد بالمتجر
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-sky-500 inline-block"></span>
                خط متقطع: أرخص منافس بالسوق المصري
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dotted border-emerald-500 inline-block"></span>
                خط التكلفة بالجملة
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              * اضغط على زر "رسم بياني" أو مربع الاختيار بجانب أي منتج بالأسفل لمقارنة تحركاته السعرية مع المنافسين فوراً.
            </div>
          </div>
        )}
      </div>

      {/* Product Watchlist & Fast Pricing Decision Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Search/Filter Controls */}
        <div className="p-6 border-b border-slate-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                مصفوفة أداء منتجات قائمة المتابعة والقرارات السعرية السريعة
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                قارن مبيعات كل منتج بفارق السعر عن أرخص منافس ونفّذ قرارات تسعيرية فورية بنقرة واحدة
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="filter-status-all"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                جميع المنتجات ({productPerformances.length})
              </button>
              <button
                id="filter-status-watchlist"
                onClick={() => setFilterStatus('watchlist_only')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterStatus === 'watchlist_only' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                المتابعة فقط ({productPerformances.filter(p => p.isWatchlisted).length})
              </button>
              <button
                id="filter-status-threatened"
                onClick={() => setFilterStatus('threatened')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterStatus === 'threatened' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                مهدد بالخسارة ({productPerformances.filter(p => p.buyBoxStatus === 'threatened').length})
              </button>
              <button
                id="filter-status-won"
                onClick={() => setFilterStatus('buybox_won')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  filterStatus === 'buybox_won' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                رابح ({productPerformances.filter(p => p.buyBoxStatus === 'won').length})
              </button>
            </div>
            {/* View Mode Toggle: Cards (Slides) vs List (Table) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
              <button
                id="btn-sales-view-cards"
                onClick={() => setLayoutViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
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
                id="btn-sales-view-list"
                onClick={() => setLayoutViewMode('list')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutViewMode === 'list' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الجدول المدمج (قائمة تفصيلية سريعة)"
              >
                <List className="w-3.5 h-3.5" />
                <span>جدول مدمج</span>
              </button>
            </div>
          </div>

          {/* Search and Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-sales-products"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج، الماركة، أو الكود SKU..."
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              <select
                id="select-category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="all">جميع التصنيفات</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-Product Bulk Selection and Unified Repricing Action Bar */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-indigo-900/50">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-toggle-select-all-bulk"
                onClick={handleToggleSelectAllFilteredBulk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer text-slate-100"
              >
                {filteredProducts.length > 0 && filteredProducts.every(p => selectedBulkProductIds.includes(p.productId)) ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>تحديد الكل ({filteredProducts.length})</span>
              </button>

              <span className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              {/* Quick filter selection shortcuts */}
              <button
                type="button"
                id="btn-bulk-select-losing"
                onClick={handleSelectLosingBuyBoxBulk}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="تحديد المنتجات الخاسرة للـ Buy Box لتسعيرها دفعة واحدة"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>الخاسرة ({filteredProducts.filter(p => p.buyBoxStatus === 'lost').length})</span>
              </button>

              <button
                type="button"
                id="btn-bulk-select-threatened"
                onClick={handleSelectThreatenedBulk}
                className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="تحديد المنتجات المهددة والخاسرة للصدارة"
              >
                <AlertTriangle className="w-3 h-3 text-sky-400" />
                <span>المهددة ({filteredProducts.filter(p => p.buyBoxStatus === 'threatened').length})</span>
              </button>

              {selectedBulkProductIds.length > 0 && (
                <button
                  type="button"
                  id="btn-clear-bulk-selection"
                  onClick={handleClearBulkSelect}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
                >
                  إلغاء التحديد ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-300 font-medium">
                {selectedBulkProductIds.length > 0 ? (
                  <span className="font-bold text-indigo-300">
                    تم تحديد <span className="text-white font-black bg-indigo-600 px-1.5 py-0.5 rounded-md">{selectedBulkProductIds.length}</span> من أصل {filteredProducts.length} منتج
                  </span>
                ) : (
                  <span>حدد منتجات لتطبيق تسعير موحد</span>
                )}
              </span>

              <button
                type="button"
                id="btn-open-unified-bulk-reprice"
                onClick={handleOpenUnifiedRepricingModal}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-400/30"
              >
                <Zap className="w-4 h-4 text-sky-300 fill-sky-300" />
                <span>
                  تطبيق تسعير موحد {selectedBulkProductIds.length > 0 ? `(${selectedBulkProductIds.length})` : 'جماعي'} ⚡
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Presentation: Cards (Slides) vs List (Table) */}
        {layoutViewMode === 'cards' ? (
          /* Cards / Slides Presentation (Ideal for Wide Screens and Touch) */
          <div className="p-4 sm:p-6 bg-slate-50/50">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                لا توجد منتجات مطابقة لخيارات البحث والتصفية المحددة.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
                {filteredProducts.map((prod) => {
                  const isSelected = selectedDrilldownProduct?.productId === prod.productId;
                  const isBulkSelected = selectedBulkProductIds.includes(prod.productId);
                  return (
                    <div
                      key={prod.productId}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', prod.productId);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing ${
                        isBulkSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-600/30 bg-indigo-50/20'
                          : isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                          : 'border-slate-200/90 hover:border-indigo-300'
                      }`}
                    >
                      {/* Card Top: Badges & Thumbnail */}
                      <div className="p-4 space-y-3 flex-1">
                        {/* Header Badges with Bulk Checkbox */}
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBulkSelect(prod.productId);
                            }}
                            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold border ${
                              isBulkSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200'
                            }`}
                            title={isBulkSelected ? 'إلغاء تحديد المنتج' : 'تحديد المنتج لتطبيق التسعير الموحد عليه'}
                          >
                            {isBulkSelected ? (
                              <CheckSquare className="w-3 h-3 text-white" />
                            ) : (
                              <Square className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{isBulkSelected ? 'محدد' : 'تحديد'}</span>
                          </button>

                          {/* Buy Box Status Pill */}
                          {prod.buyBoxStatus === 'won' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              رابح الـ Buy Box
                            </span>
                          ) : prod.buyBoxStatus === 'threatened' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              مهدد بالخسارة
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              خاسر الـ Buy Box
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {prod.isWatchlisted && (
                              <span className="p-1 rounded-md bg-indigo-50 text-indigo-700" title="في قائمة المتابعة">
                                <Bookmark className="w-3.5 h-3.5 fill-indigo-600" />
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              prod.salesGrowthPercent >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {prod.salesGrowthPercent >= 0 ? '+' : ''}{prod.salesGrowthPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Product Image & Main Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={prod.productImage}
                            alt={prod.productTitle}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-500 block truncate">
                              {prod.productBrand} • {prod.category}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug mt-0.5">
                              {prod.productTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                              <div className="flex items-center gap-1.5 mr-auto">
                                <button
                                  onClick={() => {
                                    handleToggleComparisonProduct(prod.productId);
                                    setChartViewMode('price_evolution');
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    selectedComparisonProductIds.includes(prod.productId)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                  }`}
                                  title="إضافة للمقارنة في الرسم البياني لتطور الأسعار"
                                >
                                  {selectedComparisonProductIds.includes(prod.productId) ? (
                                    <CheckSquare className="w-3 h-3" />
                                  ) : (
                                    <Square className="w-3 h-3" />
                                  )}
                                  <span>مقارنة 📈</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDrilldownProduct(isSelected ? null : prod);
                                    setChartViewMode('price_evolution');
                                  }}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                  }`}
                                  title="عرض انفرادي تفصيلي"
                                >
                                  {isSelected ? 'إلغاء' : 'تفاصيل'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sales Volume & Velocity Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block font-medium">مبيعات اليوم</span>
                            <span className="font-black text-slate-900 text-sm">
                              {prod.todayUnitsSold} <span className="text-[10px] font-normal text-slate-500">قطعة</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block font-medium">مبيعات الأسبوع</span>
                            <span className="font-black text-slate-900 text-sm">
                              {prod.weeklyUnitsSold} <span className="text-[10px] font-normal text-slate-500">قطعة</span>
                            </span>
                          </div>
                        </div>

                        {/* Price Comparison Block */}
                        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">سعرك الحالي:</span>
                            <span className="font-bold text-slate-900">
                              {prod.currentPrice.toLocaleString()} {currency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px] truncate max-w-[110px]" title={prod.lowestCompetitorName}>
                              أرخص منافس ({prod.lowestCompetitorName}):
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-sky-700">
                                {prod.lowestCompetitorPrice.toLocaleString()} {currency}
                              </span>
                              {prod.competitorPriceChange24h !== 0 && (
                                <span className={`text-[10px] font-bold ${prod.competitorPriceChange24h < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {prod.competitorPriceChange24h < 0 ? `🔻 ${Math.abs(prod.competitorPriceChange24h)}` : `🔺 +${prod.competitorPriceChange24h}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">الفارق التنافسي:</span>
                            {prod.priceDifference <= 0 ? (
                              <span className="text-emerald-600 font-bold">أنت أرخص بـ {Math.abs(prod.priceDifference)} {currency}</span>
                            ) : (
                              <span className="text-rose-600 font-bold">أنت أغلى بـ {prod.priceDifference} {currency}</span>
                            )}
                          </div>
                        </div>

                        {/* Sales Lift Recommendation Tag */}
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2 text-xs">
                          <div className="flex items-center justify-between text-indigo-900 font-bold text-[11px]">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              فرصة نمو المبيعات
                            </span>
                            <span className="text-indigo-700">+{prod.estimatedSalesLiftWithRecPrice}%</span>
                          </div>
                          <p className="text-[10px] text-indigo-700/80 line-clamp-1 mt-0.5" title={prod.recommendedActionReason}>
                            {prod.recommendedActionReason}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom: Quick Actions Bar */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <button
                          id={`btn-fast-reprice-card-${prod.productId}`}
                          onClick={() => handleExecuteQuickReprice(prod.productId, prod.recommendedActionPrice, 'السعر الذكي المقترح')}
                          className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title={`تطبيق فوري ${prod.recommendedActionPrice} ${currency}`}
                        >
                          <Zap className="w-3 h-3 text-sky-300" />
                          <span>تطبيق {prod.recommendedActionPrice.toLocaleString()} {currency}</span>
                        </button>

                        <button
                          id={`btn-open-custom-reprice-card-${prod.productId}`}
                          onClick={() => handleOpenRepriceModal(prod)}
                          className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          title="تعديل السعر المخصص"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {onArchiveProduct && (
                          <button
                            id={`btn-archive-card-${prod.productId}`}
                            onClick={() => onArchiveProduct(prod.productId)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const droppedId = e.dataTransfer.getData('text/plain') || prod.productId;
                              onArchiveProduct(droppedId);
                            }}
                            className="p-2 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-400 hover:border-rose-300 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                            title="أرشفة المنتج ونقله لمجلد الأرشيف (يدعم السحب والإفلات)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onNavigateToRadar && (
                          <button
                            id={`btn-view-radar-card-${prod.productId}`}
                            onClick={() => onNavigateToRadar(prod.productId)}
                            className="p-2 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                            title="فتح رادار المنافسين"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Table View Content */
          <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center w-10">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllFilteredBulk}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="تحديد أو إلغاء تحديد الكل"
                  >
                    {filteredProducts.length > 0 && filteredProducts.every(p => selectedBulkProductIds.includes(p.productId)) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">المنتج والتصنيف</th>
                <th className="py-3 px-3">حجم المبيعات (اليوم / الأسبوع)</th>
                <th className="py-3 px-3">سعرك الحالي</th>
                <th className="py-3 px-3">أرخص منافس (24h)</th>
                <th className="py-3 px-3">الفارق وحالة الـ Buy Box</th>
                <th className="py-3 px-3">فرصة القفزة السعرية</th>
                <th className="py-3 px-4 text-center">اتخاذ قرار تسعيري سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    لا توجد منتجات مطابقة لخيارات البحث والتصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = selectedDrilldownProduct?.productId === prod.productId;
                  const isBulkSelected = selectedBulkProductIds.includes(prod.productId);
                  return (
                    <tr
                      key={prod.productId}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', prod.productId);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`hover:bg-slate-50/80 transition-colors cursor-grab active:cursor-grabbing ${
                        isBulkSelected
                          ? 'bg-indigo-50/50 border-r-4 border-indigo-600'
                          : isSelected
                          ? 'bg-indigo-50/40 border-r-4 border-indigo-600'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBulkSelect(prod.productId)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isBulkSelected ? 'text-indigo-600 bg-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={isBulkSelected ? 'إلغاء التحديد' : 'تحديد المنتج'}
                        >
                          {isBulkSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.productImage}
                            alt={prod.productTitle}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0 bg-white"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-slate-900 truncate block max-w-[200px] sm:max-w-[240px]">
                                {prod.productTitle}
                              </span>
                              {prod.isWatchlisted && (
                                <Bookmark className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span>{prod.productBrand}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-400">{prod.sku}</span>
                              <div className="flex items-center gap-1 mr-1">
                                <button
                                  onClick={() => {
                                    handleToggleComparisonProduct(prod.productId);
                                    setChartViewMode('price_evolution');
                                  }}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                    selectedComparisonProductIds.includes(prod.productId)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                  }`}
                                  title="إضافة للمقارنة في الرسم البياني لتطور الأسعار"
                                >
                                  {selectedComparisonProductIds.includes(prod.productId) ? (
                                    <CheckSquare className="w-3 h-3" />
                                  ) : (
                                    <Square className="w-3 h-3" />
                                  )}
                                  <span>مقارنة 📈</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDrilldownProduct(isSelected ? null : prod);
                                    setChartViewMode('price_evolution');
                                  }}
                                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  {isSelected ? 'إلغاء' : 'تفاصيل'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sales units */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-black text-slate-900 text-sm">
                              {prod.todayUnitsSold} <span className="text-[10px] font-normal text-slate-500">اليوم</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {prod.weeklyUnitsSold} قطعة / أسبوعياً
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center ${
                            prod.salesGrowthPercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {prod.salesGrowthPercent >= 0 ? '+' : ''}{prod.salesGrowthPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Current Merchant Price */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {prod.currentPrice.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          التكلفة: {prod.costPrice.toLocaleString()} {currency}
                        </div>
                      </td>

                      {/* Lowest Competitor */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-sky-700">
                          {prod.lowestCompetitorPrice.toLocaleString()} <span className="text-[10px] text-slate-500">{currency}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="truncate max-w-[110px]">{prod.lowestCompetitorName}</span>
                          {prod.competitorPriceChange24h !== 0 && (
                            <span className={`font-bold ${prod.competitorPriceChange24h < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {prod.competitorPriceChange24h < 0 ? `🔻 ${Math.abs(prod.competitorPriceChange24h)}` : `🔺 +${prod.competitorPriceChange24h}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Buy box status & Price gap */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          {prod.buyBoxStatus === 'won' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              رابح الـ Buy Box
                            </span>
                          ) : prod.buyBoxStatus === 'threatened' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              مهدد (فارق طفيف)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              خاسر للـ Buy Box
                            </span>
                          )}
                        </div>
                        <div className="text-[11px]">
                          {prod.priceDifference <= 0 ? (
                            <span className="text-emerald-600 font-bold">أرخص بـ {Math.abs(prod.priceDifference)} {currency}</span>
                          ) : (
                            <span className="text-rose-600 font-bold">أغلى بـ {prod.priceDifference} {currency}</span>
                          )}
                        </div>
                      </td>

                      {/* Sales Lift Estimate */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-indigo-700 text-xs flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-sky-500" />
                          +{prod.estimatedSalesLiftWithRecPrice}% مبيعات
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={prod.recommendedActionReason}>
                          {prod.recommendedActionReason}
                        </div>
                      </td>

                      {/* Fast Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1-Click Fast Reprice to Recommended Price */}
                          <button
                            id={`btn-fast-reprice-${prod.productId}`}
                            onClick={() => handleExecuteQuickReprice(prod.productId, prod.recommendedActionPrice, 'السعر الذكي المقترح')}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 transition-transform active:scale-95"
                            title={`تطبيق ${prod.recommendedActionPrice} ${currency}`}
                          >
                            <Zap className="w-3 h-3" />
                            {prod.recommendedActionPrice.toLocaleString()} {currency}
                          </button>

                          {/* Custom Reprice Modal Trigger */}
                          <button
                            id={`btn-open-custom-reprice-${prod.productId}`}
                            onClick={() => handleOpenRepriceModal(prod)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="تعديل السعر المخصص وخيارات التسعير"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive Product Button */}
                          {onArchiveProduct && (
                            <button
                              id={`btn-archive-table-${prod.productId}`}
                              onClick={() => onArchiveProduct(prod.productId)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const droppedId = e.dataTransfer.getData('text/plain') || prod.productId;
                                onArchiveProduct(droppedId);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 rounded-lg transition-colors cursor-pointer"
                              title="أرشفة المنتج ونقله لمجلد الأرشيف (يدعم السحب والإفلات)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Navigate to Radar */}
                          {onNavigateToRadar && (
                            <button
                              id={`btn-view-radar-${prod.productId}`}
                              onClick={() => onNavigateToRadar(prod.productId)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="فتح رادار المنافسين المفصل"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
      </>
      )}

      {/* Quick Reprice Decision Action Sheet / Modal */}
      {repriceModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">اتخاذ قرار تسعيري سريع</h3>
                  <p className="text-xs text-slate-500">تطبيق السعر الجديد ومزامنته فورياً مع المنصات</p>
                </div>
              </div>
              <button
                onClick={() => setRepriceModalProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product snapshot */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <img
                src={repriceModalProduct.productImage}
                alt={repriceModalProduct.productTitle}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-900 truncate mb-1">
                  {repriceModalProduct.productTitle}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">سعرك الحالي:</span>
                    <span className="font-bold text-slate-900">{repriceModalProduct.currentPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">أرخص منافس:</span>
                    <span className="font-bold text-sky-600">{repriceModalProduct.lowestCompetitorPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">تكلفة الجملة:</span>
                    <span className="font-bold text-slate-600">{repriceModalProduct.costPrice.toLocaleString()} {currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Click Fast Strategy Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">اختر استراتيجية تسعير سريعة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomPriceInput(repriceModalProduct.lowestCompetitorPrice - 50)}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    customPriceInput === repriceModalProduct.lowestCompetitorPrice - 50
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>⚡ اقتناص الـ Buy Box</span>
                    <span className="text-indigo-600 font-black">{(repriceModalProduct.lowestCompetitorPrice - 50).toLocaleString()} {currency}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">أرخص من المنافس بـ 50 ج.م</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomPriceInput(repriceModalProduct.lowestCompetitorPrice)}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    customPriceInput === repriceModalProduct.lowestCompetitorPrice
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🎯 مطابقة أرخص منافس</span>
                    <span className="text-sky-600 font-black">{repriceModalProduct.lowestCompetitorPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">مساواة سعر {repriceModalProduct.lowestCompetitorName}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomPriceInput(repriceModalProduct.recommendedActionPrice)}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    customPriceInput === repriceModalProduct.recommendedActionPrice
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>💎 السعر الذكي المقترح</span>
                    <span className="text-emerald-600 font-black">{repriceModalProduct.recommendedActionPrice.toLocaleString()} {currency}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">أعلى قفزة في المبيعات (+{repriceModalProduct.estimatedSalesLiftWithRecPrice}%)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomPriceInput(Math.round(repriceModalProduct.lowestCompetitorPrice * 1.03))}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    customPriceInput === Math.round(repriceModalProduct.lowestCompetitorPrice * 1.03)
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>🛡️ تسعير ذروة الطلب (+3%)</span>
                    <span className="text-blue-600 font-black">{Math.round(repriceModalProduct.lowestCompetitorPrice * 1.03).toLocaleString()} {currency}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">تعظيم هامش الربح للقطعة</div>
                </button>
              </div>
            </div>

            {/* Custom Input & Impact Calculation */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">السعر الجديد المعتمد (ج.م):</label>
                <span className="text-xs font-bold text-indigo-600">
                  {customPriceInput < repriceModalProduct.costPrice ? '⚠️ تنبيه: أقل من تكلفة الجملة!' : '✅ سعر آمن ضمن الأرباح'}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>

              {/* Real-time Profit Impact Badge */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">فارق السعر:</span>
                  <span className={`font-bold ${customPriceInput <= repriceModalProduct.lowestCompetitorPrice ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {customPriceInput <= repriceModalProduct.lowestCompetitorPrice 
                      ? `أرخص بـ ${repriceModalProduct.lowestCompetitorPrice - customPriceInput} ج.م` 
                      : `أغلى بـ ${customPriceInput - repriceModalProduct.lowestCompetitorPrice} ج.م`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">صافي الربح للقطعة:</span>
                  <span className="font-bold text-slate-900">
                    {(customPriceInput - repriceModalProduct.costPrice).toLocaleString()} {currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الهامش التقديري:</span>
                  <span className="font-bold text-indigo-700">
                    {Math.round(((customPriceInput - repriceModalProduct.costPrice) / customPriceInput) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRepriceModalProduct(null)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                id="btn-confirm-reprice-apply"
                disabled={isSubmittingReprice || customPriceInput <= 0}
                onClick={() => handleExecuteQuickReprice(repriceModalProduct.productId, customPriceInput, 'تسعير مخصص معتمد')}
                className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSubmittingReprice ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جارِ المزامنة مع المنصات...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    اعتماد السعر ومزامنة المنصات 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bulk Action Toolbar */}
      {selectedBulkProductIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-500/40 backdrop-blur-md flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-xs">
              {selectedBulkProductIds.length}
            </span>
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                تم تحديد {selectedBulkProductIds.length} من المنتجات
              </span>
              <span className="text-[10px] text-indigo-300">
                جاهز لتطبيق استراتيجيات التسعير الموحدة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearBulkSelect}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              id="btn-floating-apply-unified-bulk"
              onClick={handleOpenUnifiedRepricingModal}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-sky-300 fill-sky-300" />
              <span>تطبيق تسعير موحد ⚡</span>
            </button>
          </div>
        </div>
      )}

      {/* Unified Multi-Product Bulk Reprice Modal */}
      <UnifiedBulkRepriceModal
        isOpen={isUnifiedBulkModalOpen}
        onClose={() => setIsUnifiedBulkModalOpen(false)}
        selectedProducts={selectedBulkProducts}
        currency={currency}
        onConfirmApply={handleApplyUnifiedBulkPricing}
        onShowToast={onShowToast}
      />

      {/* Product CSV / Excel Import Modal */}
      <ProductCSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(importedProducts, mode) => {
          if (onImportProducts) {
            onImportProducts(importedProducts, mode);
          }
        }}
        existingProductCount={activeProducts.length}
        currency={currency}
        onShowToast={onShowToast}
      />
    </div>
  );
};
