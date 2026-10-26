import React, { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import {
  Zap,
  SlidersHorizontal,
  History,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Play,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Sparkles,
  Percent,
  DollarSign,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Edit3,
  Check,
  X,
  Eye,
  FileSpreadsheet,
  Download,
  Clock,
  Building2,
  Info,
  Flame,
  Award
} from 'lucide-react';
import {
  AutoPricingRule,
  AutoPricingProductItem,
  AutoPricingExecutionLog,
  AutoPricingTriggerCondition,
  AutoPricingActionType,
  AutoPricingGuardrailStatus
} from '../types/autoPricing';
import {
  loadAutoPricingRules,
  saveAutoPricingRules,
  loadAutoPricingProducts,
  saveAutoPricingProducts,
  loadAutoPricingLogs,
  saveAutoPricingLogs,
  getAutoPricingMasterActive,
  setAutoPricingMasterActive,
  evaluateAutoPricingRule,
  DEFAULT_AUTO_PRICING_RULES,
  RuleEvaluationResult
} from '../data/autoPricingEngineData';
import { exportAutoPricingHistoryToSpreadsheet } from '../utils/competitorPriceExport';
import { useAudioNotifications } from '../context/AudioNotificationContext';

interface AutoPricingEngineProps {
  onShowToast?: (msg: string) => void;
  currency?: string;
  onNavigateToCatalog?: () => void;
  onNavigateToRadar?: () => void;
}

export const AutoPricingEngine: React.FC<AutoPricingEngineProps> = ({
  onShowToast,
  currency = 'ج.م',
  onNavigateToCatalog,
  onNavigateToRadar
}) => {
  const { playPriceAlertSound, playCompetitorStatusSound } = useAudioNotifications();

  // Active View Tab: 'products' | 'rules' | 'history' | 'simulator'
  const [activeTab, setActiveTab] = useState<'products' | 'rules' | 'history' | 'simulator'>('products');

  // Master Engine State
  const [isEngineMasterActive, setIsEngineMasterActive] = useState<boolean>(() => getAutoPricingMasterActive());

  // Rules State
  const [rules, setRules] = useState<AutoPricingRule[]>(() => loadAutoPricingRules());
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoPricingRule | null>(null);

  // Products State
  const [products, setProducts] = useState<AutoPricingProductItem[]>(() => loadAutoPricingProducts());
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'enabled' | 'disabled' | 'undercut' | 'stockout'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkRuleAssignId, setBulkRuleAssignId] = useState<string>('');

  // History Logs State
  const [logs, setLogs] = useState<AutoPricingExecutionLog[]>(() => loadAutoPricingLogs());
  const [historySearch, setHistorySearch] = useState('');
  const debouncedHistorySearch = useDebounce(historySearch, 300);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historyRuleFilter, setHistoryRuleFilter] = useState<string>('all');

  // Simulation & Quick Run State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    product: AutoPricingProductItem;
    rule: AutoPricingRule;
    evalResult: RuleEvaluationResult;
  }[]>([]);

  // Individual Product Test Modal
  const [testingProduct, setTestingProduct] = useState<AutoPricingProductItem | null>(null);

  // Internal Toast Alert
  const [internalToast, setInternalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setInternalToast(msg);
    onShowToast?.(msg);
    setTimeout(() => {
      setInternalToast(prev => (prev === msg ? null : prev));
    }, 3800);
  };

  // Sync Master Active Toggle
  const handleToggleMasterEngine = () => {
    const nextState = !isEngineMasterActive;
    setIsEngineMasterActive(nextState);
    setAutoPricingMasterActive(nextState);
    if (nextState) {
      playCompetitorStatusSound();
      showToast('تم تفعيل محرك التسعير الآلي العام بنجاح');
    } else {
      showToast('تم إيقاف محرك التسعير الآلي العام مؤقتاً');
    }
  };

  // Save rules changes to localStorage
  const updateRules = (newRules: AutoPricingRule[]) => {
    setRules(newRules);
    saveAutoPricingRules(newRules);
  };

  // Save products changes to localStorage
  const updateProducts = (newProducts: AutoPricingProductItem[]) => {
    setProducts(newProducts);
    saveAutoPricingProducts(newProducts);
  };

  // Save logs changes to localStorage
  const addLogEntry = (newLog: AutoPricingExecutionLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveAutoPricingLogs(updated);
  };

  // Toggle Rule Active State
  const handleToggleRuleActive = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r);
    updateRules(updated);
    playCompetitorStatusSound();
    showToast('تم تحديث حالة القاعدة بنجاح');
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
      const updated = rules.filter(r => r.id !== ruleId);
      updateRules(updated);
      // Unassign deleted rule from products
      const updatedProducts = products.map(p => p.assignedRuleId === ruleId ? { ...p, assignedRuleId: null } : p);
      updateProducts(updatedProducts);
      showToast('تم حذف القاعدة وتحديث المنتجات المرتبطة بها');
    }
  };

  // Duplicate Rule
  const handleDuplicateRule = (rule: AutoPricingRule) => {
    const newRule: AutoPricingRule = {
      ...rule,
      id: `rule-custom-${Date.now()}`,
      title: `${rule.title} (نسخة جديدة)`,
      isPreset: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    updateRules([...rules, newRule]);
    playCompetitorStatusSound();
    showToast('تم نسخ وتكرار القاعدة بنجاح');
  };

  // Product Auto-Pricing Toggle
  const handleToggleProductAutoPricing = (productId: string) => {
    const updated = products.map(p => {
      if (p.productId === productId) {
        const next = !p.autoPricingEnabled;
        return { ...p, autoPricingEnabled: next };
      }
      return p;
    });
    updateProducts(updated);
    playCompetitorStatusSound();
    showToast('تم تعديل حالة تفعيل التسعير للمنتج');
  };

  // Assign Rule to Single Product
  const handleAssignRuleToProduct = (productId: string, ruleId: string) => {
    const updated = products.map(p => {
      if (p.productId === productId) {
        return { ...p, assignedRuleId: ruleId === 'none' ? null : ruleId };
      }
      return p;
    });
    updateProducts(updated);
    showToast('تم تعيين القاعدة للمنتج بنجاح');
  };

  // Bulk Assign Rule
  const handleBulkAssignRule = () => {
    if (!bulkRuleAssignId || selectedProductIds.length === 0) return;
    const ruleIdToAssign = bulkRuleAssignId === 'none' ? null : bulkRuleAssignId;
    const updated = products.map(p => {
      if (selectedProductIds.includes(p.productId)) {
        return {
          ...p,
          assignedRuleId: ruleIdToAssign,
          autoPricingEnabled: ruleIdToAssign !== null ? true : p.autoPricingEnabled
        };
      }
      return p;
    });
    updateProducts(updated);
    setSelectedProductIds([]);
    setBulkRuleAssignId('');
    playCompetitorStatusSound();
    showToast(`تم تطبيق القاعدة على ${selectedProductIds.length} منتجات بنجاح`);
  };

  // Bulk Toggle Enable/Disable
  const handleBulkToggleStatus = (enable: boolean) => {
    if (selectedProductIds.length === 0) return;
    const updated = products.map(p => {
      if (selectedProductIds.includes(p.productId)) {
        return { ...p, autoPricingEnabled: enable };
      }
      return p;
    });
    updateProducts(updated);
    setSelectedProductIds([]);
    playCompetitorStatusSound();
    showToast(`تم ${enable ? 'تفعيل' : 'تعطيل'} التسعير الآلي لـ ${selectedProductIds.length} منتجات`);
  };

  // Select all products
  const handleSelectAllProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.productId));
    } else {
      setSelectedProductIds([]);
    }
  };

  // Run Engine Sweep on All Eligible Products
  const handleRunEngineSweep = (dryRun: boolean = false) => {
    if (!isEngineMasterActive && !dryRun) {
      onShowToast?.('محرك التسعير الآلي العام معطل! يرجى تشغيل المفتاح الرئيسي أولاً.');
      return;
    }

    setIsEvaluating(true);

    setTimeout(() => {
      const activeRulesMap = new Map<string, AutoPricingRule>(rules.map(r => [r.id, r]));
      const evaluatedItems: {
        product: AutoPricingProductItem;
        rule: AutoPricingRule;
        evalResult: RuleEvaluationResult;
      }[] = [];

      const newLogs: AutoPricingExecutionLog[] = [];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const updatedProducts = products.map(prod => {
        if (!prod.autoPricingEnabled && !dryRun) return prod;
        
        // Find assigned rule or first active preset
        const ruleId = prod.assignedRuleId;
        const rule = ruleId ? activeRulesMap.get(ruleId) : rules.find(r => r.isActive);
        
        if (!rule || !rule.isActive) return prod;

        const evalResult = evaluateAutoPricingRule(prod, rule);
        evaluatedItems.push({ product: prod, rule, evalResult });

        if (evalResult.isTriggered && evalResult.priceDelta !== 0 && !dryRun) {
          // Log execution
          const logEntry: AutoPricingExecutionLog = {
            id: `exec-${Date.now()}-${prod.productId}`,
            timestamp: nowStr,
            productId: prod.productId,
            productTitle: prod.title,
            sku: prod.sku,
            ruleId: rule.id,
            ruleTitle: rule.title,
            triggerEventAr: evalResult.triggerReasonAr,
            actionTakenAr: evalResult.actionTakenAr,
            previousPrice: prod.currentPrice,
            newPrice: evalResult.finalPrice,
            priceDifference: evalResult.priceDelta,
            competitorPrice: prod.lowestCompetitorPrice,
            competitorName: prod.lowestCompetitorName,
            competitorPlatform: prod.lowestCompetitorPlatform,
            floorPrice: evalResult.floorPrice,
            ceilingPrice: evalResult.ceilingPrice,
            estimatedNetProfit: evalResult.netProfitEGP,
            estimatedNetMarginPercent: evalResult.netMarginPercent,
            guardrailStatus: (evalResult.guardrailStatus as AutoPricingGuardrailStatus) || 'safe',
            guardrailStatusLabelAr: evalResult.guardrailStatusLabelAr,
            platformsAffected: ['أمازون مصر', 'نون مصر', 'جوميا'],
            executionMode: 'automated'
          };
          newLogs.push(logEntry);

          return {
            ...prod,
            currentPrice: evalResult.finalPrice,
            lastRepricedAt: nowStr,
            lastRepriceStatus: (evalResult.guardrailStatus === 'floor_enforced' ? 'floor_hit' : 'optimal') as 'optimal' | 'floor_hit' | 'ceiling_hit' | 'pending',
            todayRepriceCount: prod.todayRepriceCount + 1
          };
        }

        return prod;
      });

      setIsEvaluating(false);
      setSimulationResults(evaluatedItems);

      if (dryRun) {
        setSimulationModalOpen(true);
      } else {
        if (newLogs.length > 0) {
          updateProducts(updatedProducts);
          const mergedLogs = [...newLogs, ...logs];
          setLogs(mergedLogs);
          saveAutoPricingLogs(mergedLogs);
          playPriceAlertSound();
          showToast(`⚡ تم فحص الأسعار وتحديث ${newLogs.length} منتجات تلقائياً بنجاح!`);
        } else {
          playCompetitorStatusSound();
          showToast('فحص المحرك مكتمل: كافة الأسعار الحالية مستقرة ومطابقة لقواعد الأمان.');
        }
      }
    }, 600);
  };

  // Run Test for Single Product
  const handleExecuteSingleProduct = (product: AutoPricingProductItem, applyImmediately: boolean = false) => {
    const rule = rules.find(r => r.id === product.assignedRuleId) || rules.find(r => r.isActive) || rules[0];
    const evalResult = evaluateAutoPricingRule(product, rule);

    if (applyImmediately && evalResult.priceDelta !== 0) {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const logEntry: AutoPricingExecutionLog = {
        id: `exec-single-${Date.now()}`,
        timestamp: nowStr,
        productId: product.productId,
        productTitle: product.title,
        sku: product.sku,
        ruleId: rule.id,
        ruleTitle: rule.title,
        triggerEventAr: evalResult.triggerReasonAr,
        actionTakenAr: evalResult.actionTakenAr,
        previousPrice: product.currentPrice,
        newPrice: evalResult.finalPrice,
        priceDifference: evalResult.priceDelta,
        competitorPrice: product.lowestCompetitorPrice,
        competitorName: product.lowestCompetitorName,
        competitorPlatform: product.lowestCompetitorPlatform,
        floorPrice: evalResult.floorPrice,
        ceilingPrice: evalResult.ceilingPrice,
        estimatedNetProfit: evalResult.netProfitEGP,
        estimatedNetMarginPercent: evalResult.netMarginPercent,
        guardrailStatus: (evalResult.guardrailStatus as AutoPricingGuardrailStatus) || 'safe',
        guardrailStatusLabelAr: evalResult.guardrailStatusLabelAr,
        platformsAffected: ['أمازون مصر', 'نون مصر'],
        executionMode: 'one_click_apply'
      };

      addLogEntry(logEntry);

      const updated = products.map(p => p.productId === product.productId ? {
        ...p,
        currentPrice: evalResult.finalPrice,
        lastRepricedAt: nowStr,
        todayRepriceCount: p.todayRepriceCount + 1
      } : p);

      updateProducts(updated);
      setTestingProduct(null);
      playPriceAlertSound();
      showToast(`تم تطبيق السعر الجديد (${evalResult.finalPrice.toLocaleString()} ${currency}) بنجاح!`);
    } else {
      setTestingProduct(product);
    }
  };

  // Export History to Excel / CSV
  const handleExportHistory = (format: 'xlsx' | 'csv') => {
    try {
      const res = exportAutoPricingHistoryToSpreadsheet(logs, format);
      playCompetitorStatusSound();
      showToast(`تم تصدير سجل التغيرات السعرية (${res.rowCount} سجل) بصيغة ${format.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء تصدير التقرير');
    }
  };

  // Clear History
  const handleClearHistory = () => {
    if (window.confirm('هل تريد مسح سجل التغيرات السعرية بالكامل؟')) {
      setLogs([]);
      saveAutoPricingLogs([]);
      showToast('تم إفراغ سجل التغيرات السعرية');
    }
  };

  // Filtered Products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = debouncedProductSearch === '' || 
        p.title.toLowerCase().includes(debouncedProductSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(debouncedProductSearch.toLowerCase()) ||
        p.lowestCompetitorName.toLowerCase().includes(debouncedProductSearch.toLowerCase());

      const matchCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;

      let matchStatus = true;
      if (productStatusFilter === 'enabled') matchStatus = p.autoPricingEnabled;
      else if (productStatusFilter === 'disabled') matchStatus = !p.autoPricingEnabled;
      else if (productStatusFilter === 'undercut') matchStatus = p.lowestCompetitorPrice < p.currentPrice;
      else if (productStatusFilter === 'stockout') matchStatus = !p.competitorInStock;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, debouncedProductSearch, productCategoryFilter, productStatusFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = debouncedHistorySearch === '' ||
        log.productTitle.toLowerCase().includes(debouncedHistorySearch.toLowerCase()) ||
        log.sku.toLowerCase().includes(debouncedHistorySearch.toLowerCase()) ||
        log.competitorName.toLowerCase().includes(debouncedHistorySearch.toLowerCase()) ||
        log.ruleTitle.toLowerCase().includes(debouncedHistorySearch.toLowerCase());

      const matchStatus = historyStatusFilter === 'all' || log.guardrailStatus === historyStatusFilter;
      const matchRule = historyRuleFilter === 'all' || log.ruleId === historyRuleFilter;

      return matchSearch && matchStatus && matchRule;
    });
  }, [logs, debouncedHistorySearch, historyStatusFilter, historyRuleFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const activeRulesCount = rules.filter(r => r.isActive).length;
    const enabledProductsCount = products.filter(p => p.autoPricingEnabled).length;
    const todayLogsCount = logs.filter(l => l.timestamp.startsWith(new Date().toISOString().split('T')[0])).length;
    const totalProfitProtected = logs.reduce((acc, curr) => acc + (curr.estimatedNetProfit > 0 ? curr.estimatedNetProfit : 0), 0);
    return {
      activeRulesCount,
      enabledProductsCount,
      todayLogsCount,
      totalProfitProtected
    };
  }, [rules, products, logs]);

  return (
    <div className="w-full space-y-6 text-slate-100 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* 1. Header Hero Card with Master Toggle and Action Bar */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/10">
                <Zap className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl md:text-3xl font-black text-white">محرك التسعير الآلي الذكي</h2>
                  <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
                    Auto-Pricing Engine
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-medium">
                  حدد قواعد ذكية مشروطة: <span className="text-amber-300 font-bold">"إذا حدث X (مثلاً: انخفاض سعر المنافس) قم بـ Y (مثلاً: تخفيض سعري بمقدار 5 جنيهات)"</span> مع صمامات أمان تحمي الحد الأدنى وهامش الربح.
                </p>
              </div>
            </div>
          </div>

          {/* Engine Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Master Switch */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">المحرك العام:</span>
              <button
                type="button"
                onClick={handleToggleMasterEngine}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                  isEngineMasterActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title={isEngineMasterActive ? 'المحرك قيد العمل' : 'المحرك معطل'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEngineMasterActive ? 'translate-x-1' : 'translate-x-7'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold ${isEngineMasterActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isEngineMasterActive ? 'شغال تلقائياً 🟢' : 'متوقف مؤقتاً ⚪'}
              </span>
            </div>

            {/* Run Engine Now (Dry run or apply) */}
            <button
              onClick={() => handleRunEngineSweep(false)}
              disabled={isEvaluating}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري فحص الأسعار...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>تشغيل فحص الأسعار الآن ⚡</span>
                </>
              )}
            </button>

            {/* Dry Run / Simulator */}
            <button
              onClick={() => handleRunEngineSweep(true)}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2"
              title="محاكاة التغيرات السعرية دون تطبيقها الفعلي"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>محاكاة تجريبية</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-amber-500/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">القواعد النشطة</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-400 font-mono">{metrics.activeRulesCount}</span>
              <span className="text-[10px] text-slate-400">من أصل {rules.length} قواعد</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-amber-500/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">المنتجات الخاضعة للتسعير</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-400 font-mono">{metrics.enabledProductsCount}</span>
              <span className="text-[10px] text-slate-400">من إجمالي {products.length} منتجات</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-amber-500/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">تعديلات منفذة اليوم</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-sky-400 font-mono">{metrics.todayLogsCount}</span>
              <span className="text-[10px] text-sky-300 font-bold">تحديث آلي 🔄</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-amber-500/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">الأرباح التقديرية المحمية</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-purple-400 font-mono">
                {metrics.totalProfitProtected.toLocaleString()} {currency}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">صمام أمان 🛡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2.5 shrink-0 ${
            activeTab === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>المنتجات المؤهلة للتسعير الآلي</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'products' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2.5 shrink-0 ${
            activeTab === 'rules'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>إدارة القواعد ("إذا حدث X قم بـ Y")</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'rules' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
          }`}>
            {rules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2.5 shrink-0 ${
            activeTab === 'history'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل تاريخ التغيرات السعرية المنفذة</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'history' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
          }`}>
            {logs.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ELIGIBLE PRODUCTS CATALOG & RULE ASSIGNMENT                        */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filter Bar & Bulk Actions */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[220px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث باسم المنتج، الكود SKU، أو المنافس..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كافة الفئات</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كافة حالات التسعير</option>
                <option value="enabled">المفعل لها التسعير الآلي ✅</option>
                <option value="disabled">المعطلة مؤقتاً ⚪</option>
                <option value="undercut">المنافس أرخص (فرصة Buy Box) ⚠️</option>
                <option value="stockout">نفاد مخزون المنافس (فرصة رفع) 🚀</option>
              </select>
            </div>

            {/* Bulk Actions Panel if items selected */}
            {selectedProductIds.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-xs">
                <span className="text-amber-300 font-bold">تم تحديد ({selectedProductIds.length}):</span>
                <select
                  value={bulkRuleAssignId}
                  onChange={(e) => setBulkRuleAssignId(e.target.value)}
                  className="bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-amber-200"
                >
                  <option value="">اختر قاعدة للتطبيق الجماعي...</option>
                  <option value="none">إلغاء القاعدة (تعطيل)</option>
                  {rules.filter(r => r.isActive).map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssignRule}
                  disabled={!bulkRuleAssignId}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
                >
                  تطبيق
                </button>
                <button
                  onClick={() => handleBulkToggleStatus(true)}
                  className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                  title="تفعيل المحدد"
                >
                  تفعيل
                </button>
                <button
                  onClick={() => handleBulkToggleStatus(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition"
                  title="إيقاف المحدد"
                >
                  إيقاف
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAllProducts}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                      />
                    </th>
                    <th className="p-4">المنتج والتفاصيل</th>
                    <th className="p-4 text-center">سعر التكلفة</th>
                    <th className="p-4 text-center">سعري الحالي</th>
                    <th className="p-4 text-center">أرخص سعر منافس</th>
                    <th className="p-4 text-center">موقف الـ Buy Box</th>
                    <th className="p-4">القاعدة المعينة</th>
                    <th className="p-4 text-center">صمام الأمان</th>
                    <th className="p-4 text-center">التسعير الآلي</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <span className="text-sm font-bold block">لا توجد منتجات مطابقة لخيارات الفرز الحالية</span>
                        <span className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر فئة مختلفة.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.productId);
                      const isWinningBuyBox = product.currentPrice <= product.lowestCompetitorPrice && product.competitorInStock;
                      const isCompetitorCheaper = product.lowestCompetitorPrice < product.currentPrice;
                      const isCompetitorStockout = !product.competitorInStock;
                      const assignedRule = rules.find(r => r.id === product.assignedRuleId);

                      return (
                        <tr
                          key={product.productId}
                          className={`hover:bg-slate-850/60 transition-colors ${
                            isSelected ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(prev => [...prev, product.productId]);
                                } else {
                                  setSelectedProductIds(prev => prev.filter(id => id !== product.productId));
                                }
                              }}
                              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                            />
                          </td>

                          {/* Product Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3 max-w-sm">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950"
                              />
                              <div className="space-y-1">
                                <span className="font-bold text-white line-clamp-1 hover:line-clamp-none transition-all block">
                                  {product.title}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                  <span className="bg-slate-800 px-1.5 py-0.5 rounded">{product.sku}</span>
                                  <span>{product.category}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cost Price */}
                          <td className="p-4 text-center font-mono text-slate-300 font-bold">
                            {product.costPrice.toLocaleString()} {currency}
                          </td>

                          {/* Current Merchant Price */}
                          <td className="p-4 text-center">
                            <span className="font-mono text-amber-400 font-bold text-sm block">
                              {product.currentPrice.toLocaleString()} {currency}
                            </span>
                            {product.lastRepricedAt && (
                              <span className="text-[10px] text-slate-500 block">
                                آخر تحديث: {product.lastRepricedAt.split(' ')[1] || 'اليوم'}
                              </span>
                            )}
                          </td>

                          {/* Lowest Competitor */}
                          <td className="p-4 text-center">
                            <span className="font-mono text-white font-bold block">
                              {product.lowestCompetitorPrice.toLocaleString()} {currency}
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                              <span className="truncate max-w-[130px]">{product.lowestCompetitorName}</span>
                            </div>
                          </td>

                          {/* Buy Box Status */}
                          <td className="p-4 text-center">
                            {isCompetitorStockout ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold">
                                🚀 نفاد المنافس (فرصة رفع)
                              </span>
                            ) : isWinningBuyBox ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold">
                                🏆 فائز بالـ Buy Box
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                                ⚠️ المنافس أرخص ({product.currentPrice - product.lowestCompetitorPrice} {currency})
                              </span>
                            )}
                          </td>

                          {/* Assigned Rule */}
                          <td className="p-4">
                            <select
                              value={product.assignedRuleId || 'none'}
                              onChange={(e) => handleAssignRuleToProduct(product.productId, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 w-full max-w-[180px]"
                            >
                              <option value="none">-- بدون قاعدة محددة --</option>
                              {rules.map(r => (
                                <option key={r.id} value={r.id}>
                                  {r.title} {!r.isActive ? '(معطلة)' : ''}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Guardrails (Floor / Ceiling) */}
                          <td className="p-4 text-center">
                            <div className="space-y-0.5 font-mono text-[11px]">
                              <div className="text-emerald-400">
                                <span className="text-[10px] text-slate-500 ml-1">الأدنى:</span>
                                {product.customFloorPrice?.toLocaleString() || Math.round(product.costPrice * 1.1).toLocaleString()} {currency}
                              </div>
                              <div className="text-slate-400">
                                <span className="text-[10px] text-slate-500 ml-1">الأقصى:</span>
                                {product.customCeilingPrice?.toLocaleString() || Math.round(product.costPrice * 1.7).toLocaleString()} {currency}
                              </div>
                            </div>
                          </td>

                          {/* Auto Pricing Toggle */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleProductAutoPricing(product.productId)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                product.autoPricingEnabled ? 'bg-amber-500' : 'bg-slate-800'
                              }`}
                              title={product.autoPricingEnabled ? 'التسعير التلقائي مفعّل' : 'التسعير التلقائي معطّل'}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  product.autoPricingEnabled ? 'translate-x-1' : 'translate-x-5'
                                }`}
                              />
                            </button>
                            <span className="block text-[10px] font-bold mt-1 text-slate-400">
                              {product.autoPricingEnabled ? 'مفعّل ✅' : 'متوقف'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleExecuteSingleProduct(product, false)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                                title="محاكاة واختبار القاعدة للمنتج"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleExecuteSingleProduct(product, true)}
                                className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg transition font-bold"
                                title="تطبيق القرار السعري فوراً"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RULES BUILDER & MANAGER ("إذا حدث X قم بـ Y")                    */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          
          {/* Top Bar with Add Rule Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white">قواعد التسعير التلقائي المشروطة</h3>
              <p className="text-xs text-slate-400">
                قم ببناء استراتيجيات تسعير متطورة تعمل على مدار الساعة بمجرد تغير حركة المنافسين في السوق.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRule(null);
                setIsRuleModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة قاعدة جديدة ("إذا حدث X...")</span>
            </button>
          </div>

          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => {
              const assignedCount = products.filter(p => p.assignedRuleId === rule.id).length;

              return (
                <div
                  key={rule.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 relative overflow-hidden backdrop-blur-xl ${
                    rule.isActive
                      ? 'bg-slate-900/90 border-amber-500/30 shadow-xl shadow-amber-500/5'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${
                        rule.isActive
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white">{rule.title}</h4>
                          {rule.isPreset && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-full">
                              قالب جاهز ⚡
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          المنتجات المطبقة عليها: <span className="text-amber-400 font-bold">{assignedCount} منتج</span>
                        </span>
                      </div>
                    </div>

                    {/* Rule Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleRuleActive(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                        rule.isActive ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      title={rule.isActive ? 'إيقاف تفعيل القاعدة' : 'تفعيل القاعدة'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.isActive ? 'translate-x-1' : 'translate-x-6'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Formula Visual Box ("إذا حدث X ... قم بـ Y") */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] font-bold shrink-0">
                        إذا حدث X:
                      </span>
                      <span className="text-slate-200 font-medium leading-relaxed">
                        {rule.conditionType === 'competitor_price_changed_by_percent' && `إذا تغير سعر المنافس بنسبة ${rule.conditionValue || 5}% أو أكثر`}
                        {rule.conditionType === 'competitor_undercuts' && 'أي منافس يبيع بسعر أقل مني (خسارة الـ Buy Box)'}
                        {rule.conditionType === 'competitor_drops' && 'انخفاض سعر السوق لأي منافس'}
                        {rule.conditionType === 'competitor_out_of_stock' && 'نفاد مخزون المنافس الرئيسي بالكامل'}
                        {rule.conditionType === 'lowest_competitor_increases' && 'ارتفاع سعر أرخص منافس في السوق'}
                        {rule.conditionType === 'price_gap_greater_than' && `فارق السعر مع المنافس أكبر من ${rule.conditionValue || 20} ج.م`}
                        {rule.conditionType === 'margin_exceeds_target' && `هامش الربح الحالي يتجاوز ${rule.conditionValue || 25}%`}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold shrink-0">
                        قم بـ Y:
                      </span>
                      <span className="text-emerald-300 font-bold leading-relaxed">
                        {rule.actionType === 'competitor_plus_fixed' && `تعديل السعر إلى (سعر المنافس + ${rule.actionValue} ج.م)`}
                        {rule.actionType === 'competitor_plus_percent' && `تعديل السعر إلى (سعر المنافس + ${rule.actionValue}%)`}
                        {rule.actionType === 'set_competitor_plus_offset' && `تعديل السعر إلى (سعر المنافس + ${rule.actionValue} ${rule.actionOffsetType === 'percent' ? '%' : 'ج.م'})`}
                        {rule.actionType === 'undercut_fixed' && `تخفيض السعر بمقدار ${rule.actionValue} جنيهات تحت سعر المنافس`}
                        {rule.actionType === 'undercut_percent' && `تخفيض السعر بنسبة ${rule.actionValue}% تحت سعر المنافس`}
                        {rule.actionType === 'match_competitor' && 'مطابقة سعر المنافس الأرخص تماماً'}
                        {rule.actionType === 'raise_fixed' && `رفع السعر بمقدار ${rule.actionValue} ج.م لتعظيم الأرباح`}
                        {rule.actionType === 'raise_percent' && `رفع السعر بنسبة ${rule.actionValue}%`}
                        {rule.actionType === 'raise_to_ceiling' && 'رفع السعر إلى السقف الأقصى المسموح'}
                        {rule.actionType === 'target_margin' && `ضبط السعر لاستهداف هامش ربح صافي ${rule.actionValue}%`}
                      </span>
                    </div>
                  </div>

                  {/* Guardrails & Notifications Pill Specs */}
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    <span className="px-2 py-1 bg-slate-800 rounded-lg flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      الحد الأدنى: {rule.guardrails.minFloorPriceEGP.toLocaleString()} {currency}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 rounded-lg flex items-center gap-1 font-mono">
                      <Percent className="w-3 h-3 text-amber-400" />
                      أقل هامش صافي: {rule.guardrails.minNetMarginPercent}%
                    </span>
                    <span className="px-2 py-1 bg-slate-800 rounded-lg flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-sky-400" />
                      أقصى تعديل يومي: {rule.guardrails.maxDailyPriceChanges} مرات
                    </span>
                    {rule.instantNotification && (
                      <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1 font-bold">
                        🔔 إشعار فوري عند التنفيذ
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-500">
                      تاريخ التحديث: {rule.updatedAt}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDuplicateRule(rule)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="نسخ وتكرار القاعدة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setIsRuleModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                        title="تعديل تفاصيل القاعدة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!rule.isPreset && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg transition"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRICE CHANGE EXECUTION HISTORY LOG                                */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* History Controls Bar */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[220px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث في سجل التغيرات بالمنتج، المنافس، أو القاعدة..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كافة حالات التنفيذ</option>
                <option value="safe">تنفيذ آمن ✅</option>
                <option value="floor_enforced">صمام الحد الأدنى 🛡️</option>
                <option value="ceiling_enforced">سقف الحد الأقصى ⚖️</option>
                <option value="margin_protected">حماية الهامش ⚠️</option>
              </select>

              {/* Rule Filter */}
              <select
                value={historyRuleFilter}
                onChange={(e) => setHistoryRuleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كافة القواعد المطبقة</option>
                {rules.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            {/* Export and Clear Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleExportHistory('xlsx')}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportHistory('csv')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                >
                  CSV
                </button>
              </div>

              <button
                onClick={handleClearHistory}
                disabled={logs.length === 0}
                className="px-3 py-2 bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40"
                title="مسح السجل"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إفراغ</span>
              </button>
            </div>
          </div>

          {/* History Log Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-4">تاريخ ووقت التنفيذ</th>
                    <th className="p-4">المنتج الخاضع للتعديل</th>
                    <th className="p-4">الشرط المحرك ("إذا حدث X")</th>
                    <th className="p-4">الإجراء المنفذ ("قم بـ Y")</th>
                    <th className="p-4 text-center">السعر السابق</th>
                    <th className="p-4 text-center">السعر الجديد</th>
                    <th className="p-4 text-center">فارق السعر</th>
                    <th className="p-4 text-center">صافي الربح والهامش</th>
                    <th className="p-4 text-center">صمام الأمان والتحقق</th>
                    <th className="p-4 text-center">المنصات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400">
                        <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <span className="text-sm font-bold block">لا توجد سجلات تسعير مطابقة للفلاتر المحددة</span>
                        <span className="text-xs text-slate-500">قم بتشغيل فحص الأسعار الآن لتوليد عمليات تسعير جديدة.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isPriceDrop = log.priceDifference < 0;
                      const isPriceRaise = log.priceDifference > 0;

                      return (
                        <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                          {/* Timestamp */}
                          <td className="p-4 whitespace-nowrap font-mono text-slate-400">
                            <span className="block font-bold text-slate-200">{log.timestamp.split(' ')[0]}</span>
                            <span className="text-[10px] text-amber-400/80">{log.timestamp.split(' ')[1] || ''}</span>
                          </td>

                          {/* Product */}
                          <td className="p-4 max-w-xs">
                            <span className="font-bold text-white line-clamp-1 block" title={log.productTitle}>
                              {log.productTitle}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span className="bg-slate-800 px-1 py-0.2 rounded">{log.sku}</span>
                              <span className="text-amber-400/90">{log.ruleTitle}</span>
                            </div>
                          </td>

                          {/* Trigger Event (إذا حدث X) */}
                          <td className="p-4 max-w-xs">
                            <span className="text-slate-200 text-xs leading-relaxed block">
                              {log.triggerEventAr}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              المنافس: <span className="text-slate-300 font-bold">{log.competitorName}</span> ({log.competitorPrice.toLocaleString()} {currency})
                            </span>
                          </td>

                          {/* Action Taken (قم بـ Y) */}
                          <td className="p-4 max-w-xs">
                            <span className="text-emerald-300 font-bold text-xs leading-relaxed block">
                              {log.actionTakenAr}
                            </span>
                          </td>

                          {/* Previous Price */}
                          <td className="p-4 text-center font-mono text-slate-400 line-through">
                            {log.previousPrice.toLocaleString()} {currency}
                          </td>

                          {/* New Price */}
                          <td className="p-4 text-center font-mono font-bold text-sm text-white">
                            {log.newPrice.toLocaleString()} {currency}
                          </td>

                          {/* Price Difference */}
                          <td className="p-4 text-center">
                            {isPriceDrop ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {log.priceDifference} {currency}
                              </span>
                            ) : isPriceRaise ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +{log.priceDifference} {currency}
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400">0 {currency}</span>
                            )}
                          </td>

                          {/* Net Profit & Margin */}
                          <td className="p-4 text-center">
                            <span className="font-mono font-bold text-emerald-400 block">
                              +{log.estimatedNetProfit.toLocaleString()} {currency}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              هامش: {log.estimatedNetMarginPercent}%
                            </span>
                          </td>

                          {/* Guardrail Status */}
                          <td className="p-4 text-center">
                            {log.guardrailStatus === 'safe' && (
                              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold">
                                ✅ آمن ومطابق
                              </span>
                            )}
                            {log.guardrailStatus === 'floor_enforced' && (
                              <span className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold" title="تم التثبيت عند الحد الأدنى Floor Price">
                                🛡️ صمام الحد الأدنى
                              </span>
                            )}
                            {log.guardrailStatus === 'ceiling_enforced' && (
                              <span className="inline-block px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-lg text-[10px] font-bold">
                                ⚖️ سقف الحد الأقصى
                              </span>
                            )}
                            {log.guardrailStatus === 'margin_protected' && (
                              <span className="inline-block px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg text-[10px] font-bold">
                                ⚠️ حماية الهامش
                              </span>
                            )}
                          </td>

                          {/* Platforms */}
                          <td className="p-4 text-center">
                            <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-1 rounded-lg">
                              {Array.isArray(log.platformsAffected) ? log.platformsAffected.join(' • ') : 'الكل'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT PRICING RULE ("إذا حدث X قم بـ Y")                  */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <RuleBuilderModal
          rule={editingRule}
          onClose={() => setIsRuleModalOpen(false)}
          onSave={(savedRule) => {
            if (editingRule) {
              const updated = rules.map(r => r.id === savedRule.id ? savedRule : r);
              updateRules(updated);
              onShowToast?.('تم تعديل القاعدة بنجاح');
            } else {
              updateRules([...rules, savedRule]);
              showToast('تم إنشاء قاعدة تسعير جديدة بنجاح');
            }
            setIsRuleModalOpen(false);
            playCompetitorStatusSound();
          }}
          currency={currency}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIMULATION SWEEP RESULTS                                          */}
      {/* ========================================================================= */}
      {simulationModalOpen && (
        <SimulationSummaryModal
          results={simulationResults}
          onClose={() => setSimulationModalOpen(false)}
          onApplyAll={() => {
            setSimulationModalOpen(false);
            handleRunEngineSweep(false);
          }}
          currency={currency}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINGLE PRODUCT TEST & PREVIEW                                     */}
      {/* ========================================================================= */}
      {testingProduct && (
        <SingleProductTestModal
          product={testingProduct}
          rules={rules}
          onClose={() => setTestingProduct(null)}
          onApply={(updatedPrice) => {
            handleExecuteSingleProduct(testingProduct, true);
          }}
          currency={currency}
        />
      )}

      {/* Floating Notification Toast */}
      {internalToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-slate-900 border-2 border-amber-500/80 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold leading-relaxed">{internalToast}</span>
          <button onClick={() => setInternalToast(null)} className="p-1 text-slate-400 hover:text-white rounded-lg mr-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

// ============================================================================
// HELPER MODAL 1: Rule Builder Modal ("إذا حدث X ... قم بـ Y")
// ============================================================================
interface RuleBuilderModalProps {
  rule: AutoPricingRule | null;
  onClose: () => void;
  onSave: (rule: AutoPricingRule) => void;
  currency: string;
}

const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({
  rule,
  onClose,
  onSave,
  currency
}) => {
  const isEdit = !!rule;

  const [title, setTitle] = useState(rule?.title || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [conditionType, setConditionType] = useState<AutoPricingTriggerCondition>(rule?.conditionType || 'competitor_price_changed_by_percent');
  const [conditionValue, setConditionValue] = useState<number>(rule?.conditionValue || 5);
  const [conditionPlatformFilter, setConditionPlatformFilter] = useState<'all' | 'amazon_eg' | 'noon_eg' | 'jumia_eg'>(rule?.conditionPlatformFilter || 'all');
  const [actionType, setActionType] = useState<AutoPricingActionType>(rule?.actionType || 'competitor_plus_fixed');
  const [actionValue, setActionValue] = useState<number>(rule?.actionValue || 10);
  const [actionOffsetType, setActionOffsetType] = useState<'fixed_egp' | 'percent'>(rule?.actionOffsetType || 'fixed_egp');
  const [instantNotification, setInstantNotification] = useState<boolean>(rule?.instantNotification ?? true);

  // Guardrails
  const [minFloorPriceEGP, setMinFloorPriceEGP] = useState<number>(rule?.guardrails.minFloorPriceEGP || 150);
  const [maxCeilingPriceEGP, setMaxCeilingPriceEGP] = useState<number>(rule?.guardrails.maxCeilingPriceEGP || 5000);
  const [minNetMarginPercent, setMinNetMarginPercent] = useState<number>(rule?.guardrails.minNetMarginPercent || 12);
  const [maxDailyPriceChanges, setMaxDailyPriceChanges] = useState<number>(rule?.guardrails.maxDailyPriceChanges || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRule: AutoPricingRule = {
      id: rule?.id || `rule-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'قاعدة تسعير مخصصة لحماية التنافسية',
      conditionType,
      conditionValue: Number(conditionValue),
      conditionPlatformFilter,
      actionType,
      actionValue: Number(actionValue),
      actionOffsetType,
      instantNotification,
      guardrails: {
        minFloorPriceEGP: Number(minFloorPriceEGP),
        maxCeilingPriceEGP: Number(maxCeilingPriceEGP),
        minNetMarginPercent: Number(minNetMarginPercent),
        maxDailyPriceChanges: Number(maxDailyPriceChanges),
        targetPlatforms: ['all']
      },
      isActive: rule ? rule.isActive : true,
      priority: rule?.priority || 1,
      isPreset: rule?.isPreset || false,
      createdAt: rule?.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onSave(newRule);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isEdit ? 'تعديل قاعدة التسعير التلقائي' : 'إنشاء قاعدة تسعير مشروطة جديدة'}
              </h3>
              <p className="text-xs text-slate-400">صمم شرط "إذا حدث X" وحدد الإجراء "قم بـ Y" مع صمامات الأمان</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Rule Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">اسم القاعدة الترويجية / الاستراتيجية *</label>
            <input
              type="text"
              required
              placeholder="مثال: صائد الـ Buy Box - خفض 5 ج.م تحت المنافس"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Section: Condition ("إذا حدث X") */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-red-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs font-bold">
                1. الشرط المشغل (إذا حدث X)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">نوع الحدث في السوق</label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="competitor_price_changed_by_percent">إذا تغير سعر المنافس بنسبة X%</option>
                  <option value="competitor_undercuts">منافس يبيع بسعر أقل مني (خسارة الـ Buy Box)</option>
                  <option value="competitor_drops">انخفاض سعر السوق لأي منافس</option>
                  <option value="competitor_out_of_stock">نفاد مخزون المنافس الرئيسي</option>
                  <option value="lowest_competitor_increases">ارتفاع سعر أرخص منافس</option>
                  <option value="price_gap_greater_than">فارق السعر مع المنافس أكبر من حد محدد</option>
                  <option value="margin_exceeds_target">هامش الربح الحالي يتجاوز نسبة معينة</option>
                </select>
              </div>

              {(conditionType === 'competitor_price_changed_by_percent' || conditionType === 'price_gap_greater_than' || conditionType === 'margin_exceeds_target') && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    {conditionType === 'competitor_price_changed_by_percent'
                      ? 'نسبة تغير سعر المنافس % (X)'
                      : conditionType === 'price_gap_greater_than'
                      ? `قيمة فارق السعر (${currency})`
                      : 'نسبة الهامش المستهدفة %'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Action ("قم بـ Y") */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
                2. الإجراء السعري التلقائي (قم بـ Y)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">نوع التعديل السعري</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="competitor_plus_fixed">سعر المنافس + Y مبلغ ثابت (ج.م)</option>
                  <option value="competitor_plus_percent">سعر المنافس + Y نسبة مئوية (%)</option>
                  <option value="undercut_fixed">تخفيض بمبلغ ثابت تحت المنافس (ج.م)</option>
                  <option value="undercut_percent">تخفيض بنسبة مئوية تحت المنافس (%)</option>
                  <option value="match_competitor">مطابقة سعر المنافس تماماً (Match Price)</option>
                  <option value="raise_fixed">رفع السعر بمبلغ محدد (ج.م)</option>
                  <option value="raise_percent">رفع السعر بنسبة مئوية (%)</option>
                  <option value="raise_to_ceiling">رفع السعر إلى السقف الأقصى المسموح</option>
                  <option value="target_margin">ضبط السعر لتحقيق هامش صافي محدد (%)</option>
                </select>
              </div>

              {actionType !== 'match_competitor' && actionType !== 'raise_to_ceiling' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    {actionType.includes('percent') || actionType === 'target_margin' ? 'النسبة المئوية % (Y)' : `المبلغ Y (${currency})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={actionValue}
                    onChange={(e) => setActionValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Instant Notification Toggle */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-sky-500/20 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🔔 الإشعارات والتنبيهات الفورية</span>
              </span>
              <p className="text-[11px] text-slate-400">
                إرسال تنبيه فوري وصوتي فور قيام المحرك بتطبيق هذه القاعدة على أي منتج.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={instantNotification}
                onChange={(e) => setInstantNotification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Section: Safety Guardrails */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. صمامات الأمان وحماية الأرباح (Guardrails)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">الحد الأدنى للسعر (Floor)</label>
                <input
                  type="number"
                  min="0"
                  value={minFloorPriceEGP}
                  onChange={(e) => setMinFloorPriceEGP(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">الحد الأقصى (Ceiling)</label>
                <input
                  type="number"
                  min="0"
                  value={maxCeilingPriceEGP}
                  onChange={(e) => setMaxCeilingPriceEGP(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">أقل هامش صافي %</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={minNetMarginPercent}
                  onChange={(e) => setMinNetMarginPercent(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">أقصى تعديل يومي</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxDailyPriceChanges}
                  onChange={(e) => setMaxDailyPriceChanges(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Real-time Formula Preview */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            <span className="font-bold block mb-1">ملخص عمل القاعدة المنطقي:</span>
            <span>
              إذا تحقق الشرط، سيقوم المحرك تلقائياً بتطبيق التعديل على أسعار المنصات مع ضمان عدم هبوط السعر تحت {minFloorPriceEGP.toLocaleString()} {currency} حتى لو نزل المنافس لأقل من ذلك.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              {isEdit ? 'حفظ التعديلات' : 'إنشاء وحفظ القاعدة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER MODAL 2: Simulation Sweep Summary Modal
// ============================================================================
interface SimulationSummaryModalProps {
  results: {
    product: AutoPricingProductItem;
    rule: AutoPricingRule;
    evalResult: RuleEvaluationResult;
  }[];
  onClose: () => void;
  onApplyAll: () => void;
  currency: string;
}

const SimulationSummaryModal: React.FC<SimulationSummaryModalProps> = ({
  results,
  onClose,
  onApplyAll,
  currency
}) => {
  const triggeredItems = results.filter(r => r.evalResult.isTriggered && r.evalResult.priceDelta !== 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">نتائج المحاكاة التجريبية للتسعير الآلي</h3>
              <p className="text-xs text-slate-400">
                فحص تم على {results.length} منتجات | تم العثور على {triggeredItems.length} منتج بحاجة لتعديل سعري
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {triggeredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">كافة الأسعار مثالية ومتوافقة مع القواعد!</h4>
              <p className="text-xs">لم يتم رصد أي تغير غير مغطى، أسعارك الحالية في صدارة المنافسة أو محمية بصمامات الأمان.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {triggeredItems.map(({ product, rule, evalResult }) => (
                <div
                  key={product.productId}
                  className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white block line-clamp-1">{product.title}</span>
                    <span className="text-[11px] text-amber-400 font-bold block">{evalResult.triggerReasonAr}</span>
                    <span className="text-[10px] text-slate-400 block">{evalResult.actionTakenAr}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 block">السعر الحالي</span>
                      <span className="font-mono text-slate-400 line-through">{product.currentPrice.toLocaleString()} {currency}</span>
                    </div>

                    <ArrowLeft className="w-4 h-4 text-amber-400" />

                    <div className="text-center">
                      <span className="text-[10px] text-emerald-400 font-bold block">السعر المقترح</span>
                      <span className="font-mono font-bold text-white text-sm">{evalResult.finalPrice.toLocaleString()} {currency}</span>
                    </div>

                    <div className="text-center border-r border-slate-800 pr-3">
                      <span className="text-[10px] text-slate-400 block">الهامش الصافي</span>
                      <span className="font-mono text-emerald-400 font-bold">%{evalResult.netMarginPercent}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
          >
            إغلاق
          </button>
          {triggeredItems.length > 0 && (
            <button
              onClick={onApplyAll}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>تطبيق التعديلات المقترحة الآن ({triggeredItems.length} منتج)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER MODAL 3: Single Product Rule Tester
// ============================================================================
interface SingleProductTestModalProps {
  product: AutoPricingProductItem;
  rules: AutoPricingRule[];
  onClose: () => void;
  onApply: (newPrice: number) => void;
  currency: string;
}

const SingleProductTestModal: React.FC<SingleProductTestModalProps> = ({
  product,
  rules,
  onClose,
  onApply,
  currency
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    product.assignedRuleId || rules[0]?.id || ''
  );

  const selectedRule = rules.find(r => r.id === selectedRuleId) || rules[0];
  const evalResult = selectedRule ? evaluateAutoPricingRule(product, selectedRule) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img src={product.imageUrl} alt={product.title} className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950" />
            <div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{product.title}</h4>
              <span className="text-[11px] text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">القاعدة المراد اختبارها على المنتج:</label>
          <select
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
          >
            {rules.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        {/* Evaluation Output */}
        {evalResult && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">حالة تحقق الشرط:</span>
              <span className={`font-bold ${evalResult.isTriggered ? 'text-amber-400' : 'text-slate-400'}`}>
                {evalResult.isTriggered ? 'الشرط تحقق ⚡' : 'الشرط لم يتحقق ⚪'}
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 block font-bold">السبب المشغل:</span>
              <p className="text-slate-200">{evalResult.triggerReasonAr}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">السعر الحالي</span>
                <span className="font-mono font-bold text-slate-300 text-sm">{product.currentPrice.toLocaleString()} {currency}</span>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <span className="text-[10px] text-amber-300 block font-bold">السعر المقترح</span>
                <span className="font-mono font-black text-amber-400 text-base">{evalResult.finalPrice.toLocaleString()} {currency}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">صمام الأمان:</span>
              <span className="font-bold text-emerald-400">{evalResult.guardrailStatusLabelAr}</span>
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl">
            إغلاق
          </button>
          {evalResult && evalResult.priceDelta !== 0 && (
            <button
              onClick={() => onApply(evalResult.finalPrice)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>تطبيق السعر المقترح فوراً</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AutoPricingEngine;
