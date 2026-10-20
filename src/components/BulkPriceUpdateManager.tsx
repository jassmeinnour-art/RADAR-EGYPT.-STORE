import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Upload,
  Download,
  FileSpreadsheet,
  TrendingDown,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Trash2,
  Copy,
  Share2,
  Check,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Store,
  HelpCircle,
  X,
  FileText,
  Sliders,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ProductData, 
  ConnectedMerchantPlatform, 
  BulkPricingStrategyType, 
  BulkPriceItem, 
  BulkRepriceAuditLog 
} from '../types';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface BulkPriceUpdateManagerProps {
  products: ProductData[];
  currency?: string;
  connectedPlatforms: ConnectedMerchantPlatform[];
  onApplyBulkPricesToProducts?: (updatedProducts: { id: string; newPrice: number }[]) => void;
  onSelectProductForRadar?: (productId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const BulkPriceUpdateManager: React.FC<BulkPriceUpdateManagerProps> = ({
  products,
  currency = 'EGP',
  connectedPlatforms,
  onApplyBulkPricesToProducts,
  onSelectProductForRadar,
  onShowToast
}) => {
  // Mode: Catalog items selection vs CSV File upload
  const [activeMode, setActiveMode] = useState<'catalog' | 'csv_upload'>('catalog');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBuyBoxStatus, setFilterBuyBoxStatus] = useState<string>('all'); // all, losing, winning, matching

  // Selected Strategy Configuration
  const [selectedStrategy, setSelectedStrategy] = useState<BulkPricingStrategyType>('lowest_minus_percent');
  const [strategyPercentValue, setStrategyPercentValue] = useState<number>(2); // Default -2% as requested by user!
  const [strategyFixedValue, setStrategyFixedValue] = useState<number>(20); // 20 EGP
  const [targetProfitMarginPercent, setTargetProfitMarginPercent] = useState<number>(20); // 20% cost-plus
  const [fixedCustomPriceValue, setFixedCustomPriceValue] = useState<number>(1000);
  
  // Guardrails / Safety Rules
  const [enableMinProfitFloor, setEnableMinProfitFloor] = useState<boolean>(true);
  const [minProfitMarginPercentFloor, setMinProfitMarginPercentFloor] = useState<number>(8); // 8% minimum net margin
  const [roundToNiceNumber, setRoundToNiceNumber] = useState<boolean>(true); // e.g. round to nearest 5 or 9 EGP

  // Execution & Modal States
  const [isProcessingSync, setIsProcessingSync] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState<boolean>(false);
  const [lastAuditLog, setLastAuditLog] = useState<BulkRepriceAuditLog | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [auditLogsHistory, setAuditLogsHistory] = useState<BulkRepriceAuditLog[]>([
    {
      id: 'log-prev-1',
      timestamp: 'اليوم، 10:45 ص',
      strategyApplied: 'سعر المنافس الأقل ناقص 2%',
      strategyLabel: 'lowest_minus_percent (-2%)',
      productsUpdatedCount: 6,
      platformsSynced: ['أمازون مصر', 'نون مصر', 'جوميا'],
      totalRevenueImpactEGP: 14850,
      status: 'success'
    }
  ]);

  // CSV Drag & Drop state
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [csvTextContent, setCsvTextContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and maintain the bulk working items state
  const [bulkItems, setBulkItems] = useState<BulkPriceItem[]>(() => {
    return products.map((p) => {
      const wholesale = p.estimatedWholesaleCost || Math.round(p.currentLowestPrice * 0.7);
      const lowestComp = p.currentLowestPrice;
      const initialNewPrice = Math.round(lowestComp * 0.98); // -2% by default
      const commFee = initialNewPrice * 0.1;
      const netProfit = Math.round(initialNewPrice - wholesale - commFee);
      const margin = initialNewPrice > 0 ? Math.round((netProfit / initialNewPrice) * 1000) / 10 : 0;
      const roi = wholesale > 0 ? Math.round((netProfit / wholesale) * 1000) / 10 : 0;

      const lowestOffer = p.merchantOffers && p.merchantOffers.length > 0
        ? [...p.merchantOffers].sort((a, b) => a.price - b.price)[0]
        : null;

      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        sku: p.sku || `SKU-${p.id.toUpperCase()}`,
        imageUrl: p.imageUrl,
        wholesaleCost: wholesale,
        currentPrice: p.suggestedRetailPrice || p.currentLowestPrice,
        lowestCompetitorPrice: lowestComp,
        lowestCompetitorMerchant: lowestOffer ? lowestOffer.merchantName : 'متجر منافس بالسوق',
        averageMarketPrice: p.averagePrice || lowestComp * 1.08,
        highestPrice: p.highestPrice || lowestComp * 1.25,
        newCalculatedPrice: initialNewPrice,
        isManuallyEdited: false,
        selected: true, // Default all selected
        buyBoxStatus: 'winning',
        expectedNetProfit: netProfit,
        expectedProfitMarginPercent: margin,
        roiPercent: roi,
        isValidPrice: true,
        activePlatforms: ['أمازون مصر', 'نون مصر', 'جوميا']
      };
    });
  });

  // Calculate pricing based on chosen strategy for a given item
  const calculatePriceForStrategy = (
    item: BulkPriceItem, 
    strat: BulkPricingStrategyType,
    percentVal: number,
    fixedVal: number,
    marginVal: number,
    customFixedVal: number,
    enforceFloor: boolean,
    minFloorPercent: number,
    shouldRound: boolean
  ): { 
    newPrice: number; 
    netProfit: number; 
    marginPercent: number; 
    roiPercent: number; 
    status: 'winning' | 'matching' | 'higher' | 'below_cost_warning';
    isValid: boolean;
    error?: string;
  } => {
    let rawPrice = item.currentPrice;

    switch (strat) {
      case 'lowest_minus_percent':
        rawPrice = item.lowestCompetitorPrice * (1 - percentVal / 100);
        break;
      case 'lowest_minus_fixed':
        rawPrice = item.lowestCompetitorPrice - fixedVal;
        break;
      case 'match_lowest':
        rawPrice = item.lowestCompetitorPrice;
        break;
      case 'cost_plus_margin':
        // Price where Net Profit = wholesale * marginVal%
        // Price = Wholesale * (1 + marginVal/100) / (1 - Commission (10%))
        rawPrice = (item.wholesaleCost * (1 + marginVal / 100)) / 0.9;
        break;
      case 'average_minus_percent':
        rawPrice = item.averageMarketPrice * (1 - percentVal / 100);
        break;
      case 'fixed_custom_price':
        rawPrice = customFixedVal;
        break;
    }

    // Minimum Floor Calculation: Wholesale + 10% Platform fee + Min Net Margin %
    const minAllowablePrice = (item.wholesaleCost * (1 + minFloorPercent / 100)) / 0.9;

    let finalPrice = rawPrice;
    let belowCost = false;

    if (enforceFloor && finalPrice < minAllowablePrice) {
      finalPrice = minAllowablePrice;
      belowCost = true;
    }

    if (shouldRound) {
      // Round to nearest integer or marketing ending like .00
      finalPrice = Math.round(finalPrice);
    } else {
      finalPrice = Math.round(finalPrice * 10) / 10;
    }

    // Prevent <= 0
    if (finalPrice <= item.wholesaleCost) {
      belowCost = true;
    }

    const estimatedCommission = finalPrice * 0.1;
    const netProfit = Math.round(finalPrice - item.wholesaleCost - estimatedCommission);
    const marginPercent = finalPrice > 0 ? Math.round((netProfit / finalPrice) * 1000) / 10 : 0;
    const roiPercent = item.wholesaleCost > 0 ? Math.round((netProfit / item.wholesaleCost) * 1000) / 10 : 0;

    let status: 'winning' | 'matching' | 'higher' | 'below_cost_warning' = 'winning';
    if (netProfit < 0 || marginPercent < minFloorPercent) {
      status = 'below_cost_warning';
    } else if (finalPrice < item.lowestCompetitorPrice) {
      status = 'winning';
    } else if (Math.abs(finalPrice - item.lowestCompetitorPrice) <= 2) {
      status = 'matching';
    } else {
      status = 'higher';
    }

    return {
      newPrice: finalPrice,
      netProfit,
      marginPercent,
      roiPercent,
      status,
      isValid: netProfit >= 0,
      error: netProfit < 0 ? 'السعر المقترح يسبب خسارة تشغيلية' : undefined
    };
  };

  // Recalculate all selected items whenever strategy parameters change or button is clicked
  const handleApplyStrategyToSelected = () => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (!item.selected) return item;

        const res = calculatePriceForStrategy(
          item,
          selectedStrategy,
          strategyPercentValue,
          strategyFixedValue,
          targetProfitMarginPercent,
          fixedCustomPriceValue,
          enableMinProfitFloor,
          minProfitMarginPercentFloor,
          roundToNiceNumber
        );

        return {
          ...item,
          newCalculatedPrice: res.newPrice,
          expectedNetProfit: res.netProfit,
          expectedProfitMarginPercent: res.marginPercent,
          roiPercent: res.roiPercent,
          buyBoxStatus: res.status,
          isValidPrice: res.isValid,
          validationError: res.error,
          isManuallyEdited: false
        };
      })
    );

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 }
    });

    const strategyLabels: Record<BulkPricingStrategyType, string> = {
      lowest_minus_percent: `سعر المنافس الأقل ناقص ${strategyPercentValue}%`,
      lowest_minus_fixed: `سعر المنافس الأقل ناقص ${strategyFixedValue} ${currency}`,
      match_lowest: 'مطابقة أقل سعر في السوق',
      cost_plus_margin: `تكلفة الجملة + هامش ربح ${targetProfitMarginPercent}%`,
      average_minus_percent: `متوسط السوق ناقص ${strategyPercentValue}%`,
      fixed_custom_price: `سعر موحد ${fixedCustomPriceValue} ${currency}`
    };

    if (onShowToast) {
      onShowToast(`تم تطبيق استراتيجية "${strategyLabels[selectedStrategy]}" على المنتجات المحددة بنجاح 🎯`);
    }
  };

  // Toggle single item selection
  const handleToggleSelectItem = (id: string) => {
    setBulkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Select all or deselect all
  const handleSelectAll = (select: boolean) => {
    setBulkItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // Invert selection
  const handleInvertSelection = () => {
    setBulkItems((prev) => prev.map((item) => ({ ...item, selected: !item.selected })));
  };

  // Individual manual price edit
  const handleManualPriceChange = (id: string, newPriceVal: number) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const comm = newPriceVal * 0.1;
        const profit = Math.round(newPriceVal - item.wholesaleCost - comm);
        const margin = newPriceVal > 0 ? Math.round((profit / newPriceVal) * 1000) / 10 : 0;
        const roi = item.wholesaleCost > 0 ? Math.round((profit / item.wholesaleCost) * 1000) / 10 : 0;

        let status: 'winning' | 'matching' | 'higher' | 'below_cost_warning' = 'winning';
        if (profit < 0 || margin < minProfitMarginPercentFloor) {
          status = 'below_cost_warning';
        } else if (newPriceVal < item.lowestCompetitorPrice) {
          status = 'winning';
        } else if (Math.abs(newPriceVal - item.lowestCompetitorPrice) <= 2) {
          status = 'matching';
        } else {
          status = 'higher';
        }

        return {
          ...item,
          newCalculatedPrice: newPriceVal,
          expectedNetProfit: profit,
          expectedProfitMarginPercent: margin,
          roiPercent: roi,
          buyBoxStatus: status,
          isManuallyEdited: true,
          isValidPrice: profit >= 0
        };
      })
    );
  };

  // Reset item to original price
  const handleResetSingleItem = (id: string) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          newCalculatedPrice: item.currentPrice,
          isManuallyEdited: false
        };
      })
    );
  };

  // Filtered Items
  const filteredBulkItems = useMemo(() => {
    return bulkItems.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.title.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }

      // Category
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }

      // Buy Box Status filter
      if (filterBuyBoxStatus === 'winning' && item.buyBoxStatus !== 'winning') return false;
      if (filterBuyBoxStatus === 'matching' && item.buyBoxStatus !== 'matching') return false;
      if (filterBuyBoxStatus === 'losing' && item.buyBoxStatus !== 'higher') return false;
      if (filterBuyBoxStatus === 'warning' && item.buyBoxStatus !== 'below_cost_warning') return false;

      return true;
    });
  }, [bulkItems, searchQuery, filterCategory, filterBuyBoxStatus]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    bulkItems.forEach((b) => set.add(b.category));
    return Array.from(set);
  }, [bulkItems]);

  // Selected Items KPI Analytics
  const selectedItemsAnalytics = useMemo(() => {
    const selected = bulkItems.filter((b) => b.selected);
    const count = selected.length;
    const totalCurrentRevenue = selected.reduce((acc, curr) => acc + curr.currentPrice, 0);
    const totalNewRevenue = selected.reduce((acc, curr) => acc + curr.newCalculatedPrice, 0);
    const totalWholesaleCost = selected.reduce((acc, curr) => acc + curr.wholesaleCost, 0);
    const totalEstimatedNetProfit = selected.reduce((acc, curr) => acc + curr.expectedNetProfit, 0);
    const avgMarginPercent = count > 0 
      ? Math.round((selected.reduce((acc, curr) => acc + curr.expectedProfitMarginPercent, 0) / count) * 10) / 10 
      : 0;
    
    const winningCount = selected.filter((b) => b.buyBoxStatus === 'winning').length;
    const matchingCount = selected.filter((b) => b.buyBoxStatus === 'matching').length;
    const atRiskCount = selected.filter((b) => b.buyBoxStatus === 'below_cost_warning').length;

    const buyBoxWinRate = count > 0 ? Math.round(((winningCount + matchingCount) / count) * 100) : 0;

    return {
      count,
      totalCurrentRevenue,
      totalNewRevenue,
      revenueDifference: totalNewRevenue - totalCurrentRevenue,
      totalWholesaleCost,
      totalEstimatedNetProfit,
      avgMarginPercent,
      winningCount,
      matchingCount,
      atRiskCount,
      buyBoxWinRate
    };
  }, [bulkItems]);

  // Handle 1-Click Sync to Connected Platforms
  const handleExecuteBulkSync = () => {
    const selected = bulkItems.filter((b) => b.selected);
    if (selected.length === 0) {
      if (onShowToast) onShowToast('يرجى تحديد منتج واحد على الأقل لتطبيق التحديث');
      return;
    }

    setIsProcessingSync(true);
    setSyncProgress(10);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setSyncProgress(100);
      setIsProcessingSync(false);

      // Create Audit Log
      const activePlatformNames = connectedPlatforms.filter(p => p.isConnected).map(p => p.name);
      const newLog: BulkRepriceAuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        strategyApplied: `استراتيجية موحدة (${selectedStrategy})`,
        strategyLabel: `${selectedStrategy === 'lowest_minus_percent' ? `أقل سعر - ${strategyPercentValue}%` : selectedStrategy}`,
        productsUpdatedCount: selected.length,
        platformsSynced: activePlatformNames.length > 0 ? activePlatformNames : ['أمازون مصر', 'نون مصر', 'جوميا'],
        totalRevenueImpactEGP: selectedItemsAnalytics.totalNewRevenue,
        status: 'success'
      };

      setLastAuditLog(newLog);
      setAuditLogsHistory((prev) => [newLog, ...prev]);
      setShowSyncSuccessModal(true);

      // Push callback if provided
      if (onApplyBulkPricesToProducts) {
        onApplyBulkPricesToProducts(selected.map(s => ({ id: s.id, newPrice: s.newCalculatedPrice })));
      }

      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.5 }
      });

      if (onShowToast) {
        onShowToast(`🚀 تم تحديث أسعار ${selected.length} منتج ومزامنتها بنجاح مع المنصات!`);
      }
    }, 1200);
  };

  // CSV Template Exporter
  const handleDownloadCsvTemplate = () => {
    const headers = ['SKU', 'Product_Title_Arabic', 'Brand', 'Category', 'Wholesale_Cost_EGP', 'Current_Price_EGP', 'Lowest_Competitor_Price_EGP', 'Recommended_New_Price_EGP'];
    const rows = bulkItems.map(item => [
      `"${item.sku}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.brand}"`,
      `"${item.category}"`,
      item.wholesaleCost,
      item.currentPrice,
      item.lowestCompetitorPrice,
      item.newCalculatedPrice
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `merchant_bulk_repricing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('تم تنزيل ملف CSV المحدث بنجاح 📥');
  };

  // CSV File Upload Parser
  const handleProcessCsvFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvTextContent(text);
      parseAndApplyCsvContent(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseAndApplyCsvContent = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        if (onShowToast) onShowToast('الملف فارغ أو لا يحتوي على صفوف صالحة');
        return;
      }

      // Simple CSV header identification
      const headerLine = lines[0].toLowerCase();
      let importedCount = 0;

      const newParsedItems: BulkPriceItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Split by comma ignoring commas inside quotes
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"(.*)"$/, '$1').trim());
        
        if (cols.length >= 4) {
          const sku = cols[0] || `SKU-IMP-${i}`;
          const title = cols[1] || `منتج مستورد ${i}`;
          const brand = cols[2] || 'عام';
          const wholesale = parseFloat(cols[3]) || 500;
          const currentPrice = parseFloat(cols[4]) || wholesale * 1.3;
          const lowestComp = parseFloat(cols[5]) || currentPrice * 0.95;

          const initialCalc = Math.round(lowestComp * 0.98); // -2%
          const comm = initialCalc * 0.1;
          const netProfit = Math.round(initialCalc - wholesale - comm);
          const margin = initialCalc > 0 ? Math.round((netProfit / initialCalc) * 1000) / 10 : 0;

          newParsedItems.push({
            id: `imp-${i}-${Date.now()}`,
            title,
            brand,
            category: 'منتجات مستوردة من CSV',
            sku,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
            wholesaleCost: wholesale,
            currentPrice,
            lowestCompetitorPrice: lowestComp,
            lowestCompetitorMerchant: 'أقل منافس بالسوق',
            averageMarketPrice: lowestComp * 1.06,
            highestPrice: lowestComp * 1.2,
            newCalculatedPrice: initialCalc,
            isManuallyEdited: false,
            selected: true,
            buyBoxStatus: 'winning',
            expectedNetProfit: netProfit,
            expectedProfitMarginPercent: margin,
            roiPercent: wholesale > 0 ? Math.round((netProfit / wholesale) * 1000) / 10 : 0,
            isValidPrice: netProfit >= 0,
            activePlatforms: ['أمازون مصر', 'نون مصر', 'جوميا']
          });
          importedCount++;
        }
      }

      if (newParsedItems.length > 0) {
        setBulkItems((prev) => [...newParsedItems, ...prev]);
        setActiveMode('catalog');
        if (onShowToast) onShowToast(`تم استيراد ${importedCount} منتج من ملف CSV بنجاح ودمجها مع القائمة 📊`);
      }
    } catch (err) {
      if (onShowToast) onShowToast('حدث خطأ أثناء قراءة ملف CSV. تأكد من سلامة التنسيق.');
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const selected = bulkItems.filter(b => b.selected);
    const summary = `🚀 ملخص عملية التحديث الجماعي للأسعار
الاستراتيجية المطبقة: ${selectedStrategy === 'lowest_minus_percent' ? `سعر المنافس الأقل - ${strategyPercentValue}%` : selectedStrategy}
عدد المنتجات المحدثة: ${selected.length} منتج
إجمالي حجم الإيرادات المتوقع: ${selectedItemsAnalytics.totalNewRevenue.toLocaleString()} ${currency}
متوسط هامش الربح الصافي: ${selectedItemsAnalytics.avgMarginPercent}%
نسبة الفوز بالـ Buy Box: ${selectedItemsAnalytics.buyBoxWinRate}%
المنصات المستهدفة: أمازون مصر، نون مصر، جوميا، المتجر الخاص
تاريخ التنفيذ: ${new Date().toLocaleDateString('ar-EG')}
----------------------------------------
تم التحديث والاعتماد عبر نظام رادار التاجر الذكي مصر 🇪🇬`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    if (onShowToast) onShowToast('تم نسخ ملخص التحديث الجماعي لمشاركته مع الفريق 📋');
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*تقرير التحديث الجماعي للأسعار عبر رادار التاجر* 📊\n\n• الاستراتيجية: سعر المنافس الأقل ناقص ${strategyPercentValue}%\n• عدد المنتجات المحدثة: ${selectedItemsAnalytics.count} منتج\n• نسبة الفوز بالـ Buy Box: ${selectedItemsAnalytics.buyBoxWinRate}%\n• إجمالي الإيرادات المتوقعة: ${selectedItemsAnalytics.totalNewRevenue.toLocaleString()} ${currency}\n• متوسط هامش الربح: ${selectedItemsAnalytics.avgMarginPercent}%\n\n_تم التحديث والمزامنة الفورية مع المنصات_ ✅`);
    safeOpenUrl(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="space-y-6" id="bulk-price-update-manager-container">
      
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>محرك التسعير الجماعي الفوري (Bulk Repricing Engine)</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.8 Fast-Sync</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Alexandria'] leading-snug">
              التحديث الجماعي للأسعار وتطبيق استراتيجيات الفوز بالـ Buy Box
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              حدد عدة منتجات أو ارفع قائمة (CSV) لتطبيق استراتيجية تسعير ذكية موحدة (مثل <strong className="text-emerald-300 font-black">"سعر المنافس الأقل ناقص 2%"</strong>) على كافة منتجاتك بضغطة زر مع الحفاظ الصارم على هوامش الأرباح ونقاط التعادل.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveMode('catalog')}
              id="mode-catalog-btn"
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'catalog'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>كتالوج المنتجات ({bulkItems.length})</span>
            </button>

            <button
              onClick={() => setActiveMode('csv_upload')}
              id="mode-csv-upload-btn"
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'csv_upload'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملف CSV / Excel 📑</span>
            </button>
          </div>
        </div>

        {/* Quick Batch KPIs Overview Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="bg-slate-800/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-bold block">المنتجات المحددة للتطبيق</span>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {selectedItemsAnalytics.count} <span className="text-xs text-slate-400 font-normal">من {bulkItems.length}</span>
            </div>
            <span className="text-[10px] text-indigo-300 font-medium">جاهزة للتحديث الفوري</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-bold block">نسبة الفوز بالـ Buy Box</span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5">
              {selectedItemsAnalytics.buyBoxWinRate}%
            </div>
            <span className="text-[10px] text-emerald-300 font-medium">{selectedItemsAnalytics.winningCount} منتج متفوق بالسعر</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-bold block">متوسط هامش الربح الصافي</span>
            <div className="text-lg sm:text-xl font-black text-teal-300 font-mono mt-0.5">
              {selectedItemsAnalytics.avgMarginPercent}%
            </div>
            <span className="text-[10px] text-teal-400 font-medium">إجمالي أرباح +{selectedItemsAnalytics.totalEstimatedNetProfit.toLocaleString()} {currency}</span>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-bold block">إجمالي مبيعات الدفعة</span>
            <div className="text-lg sm:text-xl font-black text-sky-300 font-mono mt-0.5">
              {selectedItemsAnalytics.totalNewRevenue.toLocaleString()} <span className="text-xs font-normal">{currency}</span>
            </div>
            <span className="text-[10px] text-sky-200 font-medium">وفق الأسعار الجديدة</span>
          </div>
        </div>
      </div>

      {/* CSV UPLOAD MODE VIEW */}
      {activeMode === 'csv_upload' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn" id="csv-upload-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>رفع وتعديل ملف تسعير جماعي (CSV / Excel Import)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ارفع ملف المنتجات بصيغة CSV أو حمّل النموذج الجاهز المتوافق مع شيتات أمازون ونون وجوميا
              </p>
            </div>

            <button
              onClick={handleDownloadCsvTemplate}
              className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>تحميل نموذج CSV جاهز 📥</span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleProcessCsvFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDraggingFile 
                ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]' 
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessCsvFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-800 font-['Alexandria']">
              {uploadedFileName ? `تم اختيار: ${uploadedFileName}` : 'اسحب وأفلت ملف CSV هنا أو اضغط للاختيار من جهازك'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              يدعم ملفات CSV الصادرة من Excel أو Google Sheets التي تحتوي على أعمدة (SKU, Title, Wholesale, Price).
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 shadow-xs">
                ترميز UTF-8 معتمد
              </span>
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 shadow-xs">
                أقصى حجم 10 ميجابايت
              </span>
            </div>
          </div>

          {/* Direct CSV Text Paste Area */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>أو الصق نص أسطر الـ CSV هنا مباشرة (Quick Paste):</span>
              </label>
              {csvTextContent && (
                <button
                  onClick={() => setCsvTextContent('')}
                  className="text-[11px] text-red-600 hover:underline font-bold"
                >
                  مسح النص
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={csvTextContent}
              onChange={(e) => setCsvTextContent(e.target.value)}
              placeholder="SKU, Product_Title, Brand, Wholesale_Cost, Current_Price, Lowest_Competitor&#10;SKU-SAM-S24, Samsung Galaxy S24, Samsung, 32000, 39500, 38900&#10;SKU-IPH-15P, Apple iPhone 15 Pro, Apple, 48000, 56000, 54900"
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => parseAndApplyCsvContent(csvTextContent)}
                disabled={!csvTextContent.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>معالجة النص المنسوخ وإضافته للجدول</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED PRICING STRATEGY CONTROL PANEL (شريط تطبيق الاستراتيجية الموحدة) */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 sm:p-7 shadow-md space-y-6 relative overflow-hidden" id="strategy-control-panel">
        
        {/* Strategy Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                اختيار وتطبيق استراتيجية التسعير الموحدة (Unified Pricing Strategy)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              اختر القاعدة الرياضية التي تريد تطبيقها على جميع المنتجات المحددة بنقرة واحدة
            </p>
          </div>

          {/* Quick Apply Button */}
          <button
            onClick={handleApplyStrategyToSelected}
            id="apply-strategy-to-all-btn"
            className="h-11 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
            <span>تطبيق الاستراتيجية على ({selectedItemsAnalytics.count} منتج محدد) 🎯</span>
          </button>
        </div>

        {/* Strategy Options Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* Strategy 1: Lowest Competitor Minus % (Requested by User!) */}
          <div
            onClick={() => setSelectedStrategy('lowest_minus_percent')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'lowest_minus_percent'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  <Percent className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  سعر المنافس الأقل ناقص نسبة %
                </h4>
              </div>
              {selectedStrategy === 'lowest_minus_percent' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              حساب سعر أقل من أرخص منافس بنسبة مئوية (مثل -1% أو -2% أو -5%) للفوز الفوري بالـ Buy Box.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200/80 w-fit">
              <span>الأكثر استخداماً وفعالية 🏆</span>
            </div>
          </div>

          {/* Strategy 2: Lowest Competitor Minus Fixed EGP */}
          <div
            onClick={() => setSelectedStrategy('lowest_minus_fixed')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'lowest_minus_fixed'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  سعر المنافس الأقل ناقص مبلغ ثابت
                </h4>
              </div>
              {selectedStrategy === 'lowest_minus_fixed' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              خصم مبلغ مالي ثابت ومحدد من أقل سعر منافس (مثل -25 ج.م أو -50 ج.م) لكسر سعره تماماً.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 w-fit">
              <span>خصم دقيق بالجنيه 💵</span>
            </div>
          </div>

          {/* Strategy 3: Match Lowest Competitor Price */}
          <div
            onClick={() => setSelectedStrategy('match_lowest')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'match_lowest'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  مطابقة أقل سعر في السوق تماماً
                </h4>
              </div>
              {selectedStrategy === 'match_lowest' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              التسعير بنفس سعر أقل متجر منافس دون إشعال حرب أسعار، مع الاعتماد على سرعة التوصيل والتقييم.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200/80 w-fit">
              <span>تجنب حرق الأسعار ⚖️</span>
            </div>
          </div>

          {/* Strategy 4: Cost Plus Target Margin % */}
          <div
            onClick={() => setSelectedStrategy('cost_plus_margin')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'cost_plus_margin'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  تكلفة الجملة + هامش ربح مستهدف %
                </h4>
              </div>
              {selectedStrategy === 'cost_plus_margin' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              ضمان تحقيق صافي ربح بنسبة محددة (مثل +20% أو +25%) فوق سعر شراء الجملة والعمولات.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-teal-700 bg-white px-2.5 py-1 rounded-lg border border-teal-200/80 w-fit">
              <span>أمان مالي كامل 🛡️</span>
            </div>
          </div>

          {/* Strategy 5: Average Market Price Minus % */}
          <div
            onClick={() => setSelectedStrategy('average_minus_percent')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'average_minus_percent'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  <Tag className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  متوسط أسعار السوق ناقص نسبة %
                </h4>
              </div>
              {selectedStrategy === 'average_minus_percent' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              التسعير نسبة أقل من متوسط السوق (Amazon + Noon + Jumia) لتحقيق توازن بين المبيعات والأرباح.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200/80 w-fit">
              <span>توازن بين الربح والبيع 📊</span>
            </div>
          </div>

          {/* Strategy 6: Custom Fixed Unified Price */}
          <div
            onClick={() => setSelectedStrategy('fixed_custom_price')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              selectedStrategy === 'fixed_custom_price'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-100 ring-2 ring-indigo-600/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                  تحديد سعر موحد مخصص
                </h4>
              </div>
              {selectedStrategy === 'fixed_custom_price' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              وضع سعر ثابت موحد لجميع المنتجات المحددة (مناسب لعروض اليوم الواحد أو الباقات الموحدة).
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-200/80 w-fit">
              <span>عروض وتصفيات 🏷️</span>
            </div>
          </div>

        </div>

        {/* Dynamic Parameter Sliders / Numeric Controls based on active strategy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Strategy 1 Parameter: Lowest Minus % */}
          {selectedStrategy === 'lowest_minus_percent' && (
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span>نسبة الخصم من أقل سعر منافس:</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono text-sm">
                    -{strategyPercentValue}%
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 5, 8, 10].map((quickVal) => (
                    <button
                      key={quickVal}
                      onClick={() => setStrategyPercentValue(quickVal)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        strategyPercentValue === quickVal
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      -{quickVal}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={strategyPercentValue}
                onChange={(e) => setStrategyPercentValue(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          {/* Strategy 2 Parameter: Lowest Minus Fixed Amount */}
          {selectedStrategy === 'lowest_minus_fixed' && (
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span>المبلغ المخصوم من أقل منافس:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono text-sm">
                    -{strategyFixedValue} {currency}
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {[10, 20, 50, 100, 200].map((quickVal) => (
                    <button
                      key={quickVal}
                      onClick={() => setStrategyFixedValue(quickVal)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        strategyFixedValue === quickVal
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      -{quickVal}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={strategyFixedValue}
                onChange={(e) => setStrategyFixedValue(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          {/* Strategy 4 Parameter: Cost Plus Margin % */}
          {selectedStrategy === 'cost_plus_margin' && (
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span>هامش الربح الصافي المستهدف فوق التكلفة:</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-mono text-sm">
                    +{targetProfitMarginPercent}%
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  {[10, 15, 20, 25, 30].map((quickVal) => (
                    <button
                      key={quickVal}
                      onClick={() => setTargetProfitMarginPercent(quickVal)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                        targetProfitMarginPercent === quickVal
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{quickVal}%
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={targetProfitMarginPercent}
                onChange={(e) => setTargetProfitMarginPercent(parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          )}

          {/* Strategy 5 Parameter: Average Minus % */}
          {selectedStrategy === 'average_minus_percent' && (
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span>نسبة الخصم عن متوسط السوق:</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono text-sm">
                    -{strategyPercentValue}%
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={strategyPercentValue}
                onChange={(e) => setStrategyPercentValue(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          )}

          {/* Strategy 6 Parameter: Fixed Custom Price */}
          {selectedStrategy === 'fixed_custom_price' && (
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black text-slate-900 block">
                أدخل السعر الموحد بالجنيه المصري ({currency}):
              </label>
              <input
                type="number"
                value={fixedCustomPriceValue}
                onChange={(e) => setFixedCustomPriceValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-sm font-black font-mono focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Match Lowest Info */}
          {selectedStrategy === 'match_lowest' && (
            <div className="flex-1 text-xs text-slate-600 font-bold">
              سيتم تسعير كل منتج بنفس سعر أقل منافس له في السوق المحلي مباشرة مع الحفاظ على الربحية.
            </div>
          )}

          {/* Safety Guardrails Toggle Switches */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 md:pt-0 md:border-r md:border-slate-200 md:pr-4">
            
            {/* Minimum Floor Stop-Loss */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={enableMinProfitFloor}
                onChange={(e) => setEnableMinProfitFloor(e.target.checked)}
                className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>حماية الحد الأدنى للأرباح (لا يقل عن {minProfitMarginPercentFloor}%)</span>
              </span>
            </label>

            {/* Round to nice integer */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={roundToNiceNumber}
                onChange={(e) => setRoundToNiceNumber(e.target.checked)}
                className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
              />
              <span>تقريب لأقرب رقم صحيح</span>
            </label>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* PRODUCTS PREVIEW & LIVE REPRICING TABLE (جدول المعاينة والتعديل التفاعلي) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5" id="products-batch-table-container">
        
        {/* Table Controls & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Search and Category Filters */}
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الماركة، أو الـ SKU..."
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">كل التصنيفات ({bulkItems.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Buy Box Status Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterBuyBoxStatus('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterBuyBoxStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterBuyBoxStatus('winning')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterBuyBoxStatus === 'winning' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الفائزة ({bulkItems.filter(b => b.buyBoxStatus === 'winning').length})
              </button>
              <button
                onClick={() => setFilterBuyBoxStatus('matching')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterBuyBoxStatus === 'matching' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                المتعادلة ({bulkItems.filter(b => b.buyBoxStatus === 'matching').length})
              </button>
              <button
                onClick={() => setFilterBuyBoxStatus('warning')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterBuyBoxStatus === 'warning' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                تنبيه هامش ({bulkItems.filter(b => b.buyBoxStatus === 'below_cost_warning').length})
              </button>
            </div>
          </div>

          {/* Quick Selection Actions */}
          <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
            <button
              onClick={() => handleSelectAll(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              تحديد الكل
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء التحديد
            </button>
            <button
              onClick={handleInvertSelection}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              عكس التحديد
            </button>
          </div>

        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-right border-collapse text-xs">
            
            {/* Table Head */}
            <thead className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={bulkItems.length > 0 && bulkItems.every(b => b.selected)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded-sm accent-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 min-w-[220px]">المنتج والـ SKU</th>
                <th className="p-3.5 text-center min-w-[100px]">سعر الجملة</th>
                <th className="p-3.5 text-center min-w-[100px]">السعر الحالي</th>
                <th className="p-3.5 text-center min-w-[130px]">أقل سعر منافس بالسوق</th>
                <th className="p-3.5 text-center min-w-[150px] bg-indigo-950/80 text-sky-300">
                  السعر المقترح الجديد
                </th>
                <th className="p-3.5 text-center min-w-[110px]">صافي الربح / الهامش</th>
                <th className="p-3.5 text-center min-w-[120px]">حالة الـ Buy Box</th>
                <th className="p-3.5 text-center w-20">إجراءات</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
              {filteredBulkItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                    <p className="font-bold">لا توجد منتجات تطابق شروط البحث أو الفلتر المحددة</p>
                  </td>
                </tr>
              ) : (
                filteredBulkItems.map((item) => {
                  const priceDiff = item.newCalculatedPrice - item.currentPrice;
                  const priceDiffPercent = item.currentPrice > 0 
                    ? Math.round(((item.newCalculatedPrice - item.currentPrice) / item.currentPrice) * 1000) / 10 
                    : 0;

                  const compDiff = item.newCalculatedPrice - item.lowestCompetitorPrice;
                  const compDiffPercent = item.lowestCompetitorPrice > 0
                    ? Math.round(((item.newCalculatedPrice - item.lowestCompetitorPrice) / item.lowestCompetitorPrice) * 1000) / 10
                    : 0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        item.selected ? 'bg-indigo-50/15' : 'opacity-60 bg-slate-50/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="w-4 h-4 rounded-sm accent-indigo-600 cursor-pointer"
                        />
                      </td>

                      {/* Product Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-100 p-1 border border-slate-200 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[9px] font-bold">
                                {item.brand}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.sku}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]" title={item.title}>
                              {item.title}
                            </h4>
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Cost */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                        {item.wholesaleCost.toLocaleString()} {currency}
                      </td>

                      {/* Current Merchant Price */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">
                        {item.currentPrice.toLocaleString()} {currency}
                      </td>

                      {/* Lowest Competitor in Egypt Market */}
                      <td className="p-3.5 text-center">
                        <div className="font-mono font-black text-rose-700">
                          {item.lowestCompetitorPrice.toLocaleString()} {currency}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[130px] mx-auto" title={item.lowestCompetitorMerchant}>
                          {item.lowestCompetitorMerchant}
                        </span>
                      </td>

                      {/* New Calculated Price (Editable) */}
                      <td className="p-3 text-center bg-indigo-50/40">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={item.newCalculatedPrice}
                            onChange={(e) => handleManualPriceChange(item.id, parseFloat(e.target.value) || 0)}
                            className="w-24 p-1.5 rounded-lg bg-white border-2 border-indigo-300 font-mono font-black text-center text-indigo-950 focus:border-indigo-600 focus:outline-hidden shadow-xs"
                          />
                          <span className="text-[10px] font-bold text-slate-500">{currency}</span>
                        </div>

                        {/* Price Change Diff Tag */}
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-mono">
                          {compDiff < 0 ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              {compDiff} ج.م ({compDiffPercent}%) عن المنافس
                            </span>
                          ) : compDiff === 0 ? (
                            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">
                              مطابق للمنافس ⚖️
                            </span>
                          ) : (
                            <span className="text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded-md">
                              +{compDiff} ج.م أعلى من المنافس
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Net Profit & Margin */}
                      <td className="p-3.5 text-center">
                        <div className={`font-mono font-black text-xs ${item.expectedNetProfit >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
                          {item.expectedNetProfit >= 0 ? `+${item.expectedNetProfit.toLocaleString()}` : item.expectedNetProfit.toLocaleString()} {currency}
                        </div>
                        <span className={`text-[10px] font-bold ${item.expectedProfitMarginPercent >= 15 ? 'text-emerald-700' : item.expectedProfitMarginPercent >= 8 ? 'text-teal-700' : 'text-sky-700'}`}>
                          هامش {item.expectedProfitMarginPercent}%
                        </span>
                      </td>

                      {/* Buy Box Status Badge */}
                      <td className="p-3.5 text-center">
                        {item.buyBoxStatus === 'winning' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black inline-flex items-center gap-1 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            <span>فائز بالـ Buy Box 🏆</span>
                          </span>
                        )}
                        {item.buyBoxStatus === 'matching' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black inline-flex items-center gap-1 border border-blue-300">
                            <span>مطابق للمنافس ⚖️</span>
                          </span>
                        )}
                        {item.buyBoxStatus === 'higher' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold inline-flex items-center gap-1 border border-slate-300">
                            <span>أعلى من السوق ⚠️</span>
                          </span>
                        )}
                        {item.buyBoxStatus === 'below_cost_warning' && (
                          <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black inline-flex items-center gap-1 border border-sky-300" title="السعر يقترب من تكلفة الشراء أو يسبب خسارة">
                            <AlertTriangle className="w-3 h-3 text-sky-700" />
                            <span>تنبيه هامش ربح 🛑</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.isManuallyEdited && (
                            <button
                              onClick={() => handleResetSingleItem(item.id)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="استعادة السعر الأصلي"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onSelectProductForRadar && (
                            <button
                              onClick={() => onSelectProductForRadar(item.id)}
                              className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="فتح في رادار المنافسين التفصيلي"
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

        {/* Master Execution Deck (شريط التنفيذ والتصدير الرئيسي) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          
          <div className="space-y-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-['Alexandria']">
                جاهز للتطبيق والمزامنة الفورية
              </span>
            </div>
            <p className="text-xs text-slate-300">
              سيتم تحديث أسعار <strong className="text-white font-black">{selectedItemsAnalytics.count} منتج</strong> مباشرة على (أمازون مصر، نون، جوميا) بضغطة واحدة.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSummary ? 'تم النسخ!' : 'نسخ التقرير'}</span>
            </button>

            {/* Share WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="h-10 px-3.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-bold flex items-center gap-1.5 border border-emerald-700/60 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>مشاركة واتساب</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleDownloadCsvTemplate}
              className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير ملف CSV 📥</span>
            </button>

            {/* Primary Action Button: 1-Click Sync */}
            <button
              onClick={handleExecuteBulkSync}
              disabled={isProcessingSync || selectedItemsAnalytics.count === 0}
              id="execute-bulk-sync-platforms-btn"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessingSync ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>جاري المزامنة مع المنصات ({syncProgress}%)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-sky-300" />
                  <span>تطبيق ومزامنة الأسعار مع المنصات فوراً 🚀</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* AUDIT LOGS & EXECUTION HISTORY (سجل التحديثات الجماعية السابقة) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
              سجل التحديثات والمزامنة الجماعية (Bulk Audit Logs)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {auditLogsHistory.length} عمليات مسجلة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditLogsHistory.map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-['Alexandria']">
                  {log.strategyApplied}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  ✓ مكتملة بنجاح
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>تاريخ التنفيذ: {log.timestamp}</span>
                <span className="font-mono text-slate-800 font-bold">{log.productsUpdatedCount} منتج تم تحديثه</span>
              </div>
              <div className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                <span>المنصات:</span>
                <span className="text-indigo-700 font-bold">{log.platformsSynced.join(' • ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUCCESS CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showSyncSuccessModal && lastAuditLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-scaleUp">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Alexandria']">
                تم تطبيق وتحديث الأسعار بنجاح! 🚀
              </h3>
              <p className="text-xs text-slate-500">
                تم إرسال الأسعار الجديدة وتفعيلها على قنوات المبيعات المتصلة بالتاجر
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">الاستراتيجية المعتمدة:</span>
                <span className="font-bold text-slate-900">{lastAuditLog.strategyApplied}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">عدد المنتجات المحدثة:</span>
                <span className="font-bold text-emerald-800 font-mono">{lastAuditLog.productsUpdatedCount} منتج</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">المنصات المتصلة:</span>
                <span className="font-bold text-indigo-900">{lastAuditLog.platformsSynced.join(' • ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حجم مبيعات الدفعة المتوقع:</span>
                <span className="font-bold text-slate-900 font-mono">{lastAuditLog.totalRevenueImpactEGP.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSyncSuccessModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
              >
                حسناً، متابعة العمل
              </button>
              <button
                onClick={() => {
                  handleDownloadCsvTemplate();
                  setShowSyncSuccessModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                تنزيل شيت CSV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
