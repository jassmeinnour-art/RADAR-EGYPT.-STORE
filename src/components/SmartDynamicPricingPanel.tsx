import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  ShieldCheck,
  Lock,
  Unlock,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  History,
  Play,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  ProductData,
  ProductPricingPlan,
  SmartDynamicPricingRuleType,
  SmartDynamicPricingEventLog,
} from '../types';
import {
  getOrCreatePricingPlan,
  saveStoredPricingPlan,
  evaluateSmartDynamicPrice,
  applySmartDynamicPricingToPlan,
  getDynamicPricingRuleLabel,
  loadSmartDynamicPricingLogs,
  recordSmartDynamicPricingLog,
} from '../data/pricingGuardrailsData';
import { logUserActivity } from '../services/userLogsService';

interface SmartDynamicPricingPanelProps {
  product: ProductData;
  allProducts?: ProductData[];
  currency: string;
  onAutoAdjustProductPrice: (
    productId: string,
    newMerchantPrice: number,
    updatedCompetitorPrice?: number,
    competitorName?: string,
    reasonLabel?: string
  ) => void;
  onBulkAutoAdjustAllProducts?: (
    adjustments: { productId: string; newPrice: number; guardrailStatus: string }[]
  ) => void;
  onNavigateToGuardrails?: () => void;
  onShowToast?: (msg: string) => void;
}

export const SmartDynamicPricingPanel: React.FC<SmartDynamicPricingPanelProps> = ({
  product,
  allProducts = [],
  currency,
  onAutoAdjustProductPrice,
  onBulkAutoAdjustAllProducts,
  onNavigateToGuardrails,
  onShowToast,
}) => {
  const [plan, setPlan] = useState<ProductPricingPlan>(() => getOrCreatePricingPlan(product));
  const [logs, setLogs] = useState<SmartDynamicPricingEventLog[]>(() => loadSmartDynamicPricingLogs());
  const [customSimCompetitorPrice, setCustomSimCompetitorPrice] = useState<string>('');
  const [showExecutionLogs, setShowExecutionLogs] = useState<boolean>(true);
  const [lastTriggeredAnimation, setLastTriggeredAnimation] = useState<boolean>(false);

  // Sync plan when product changes or when guardrails are updated elsewhere
  useEffect(() => {
    const freshPlan = getOrCreatePricingPlan(product);
    setPlan(freshPlan);
    const offers = product.merchantOffers || [];
    const lowest =
      offers.length > 0
        ? offers.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), offers[0]).price
        : product.currentLowestPrice || freshPlan.suggestedOptimalPrice;
    setCustomSimCompetitorPrice(String(Math.max(100, lowest - 50)));
  }, [product?.id]);

  useEffect(() => {
    const handlePlanUpdated = () => {
      setPlan(getOrCreatePricingPlan(product));
    };
    const handleLogsUpdated = () => {
      setLogs(loadSmartDynamicPricingLogs());
    };
    window.addEventListener('merchant_pricing_guardrails_updated', handlePlanUpdated);
    window.addEventListener('merchant_smart_dynamic_pricing_log_added', handleLogsUpdated);
    return () => {
      window.removeEventListener('merchant_pricing_guardrails_updated', handlePlanUpdated);
      window.removeEventListener('merchant_smart_dynamic_pricing_log_added', handleLogsUpdated);
    };
  }, [product?.id]);

  // Live evaluation of current product & plan
  const evaluation = useMemo(() => {
    return evaluateSmartDynamicPrice(product, plan);
  }, [product, plan]);

  const primaryGuardrail = plan.platformGuardrails[0];
  const isFloorLocked = primaryGuardrail ? primaryGuardrail.isFloorPriceLocked : true;

  // Position of finalApprovedPrice within [effectiveFloorPrice, effectiveCeilingPrice] for visual progress bar
  const guardrailRangePercent = useMemo(() => {
    const span = Math.max(1, evaluation.effectiveCeilingPrice - evaluation.effectiveFloorPrice);
    const pos = ((evaluation.finalApprovedPrice - evaluation.effectiveFloorPrice) / span) * 100;
    return Math.max(0, Math.min(100, Math.round(pos)));
  }, [evaluation]);

  // Persist changes to plan and optionally trigger auto-reprice if enabled
  const updatePlanAndSync = (
    updater: (prev: ProductPricingPlan) => ProductPricingPlan,
    autoApplyNow: boolean = false,
    reasonAr?: string
  ) => {
    const nextPlan = updater(plan);
    setPlan(nextPlan);
    saveStoredPricingPlan(nextPlan);

    if (autoApplyNow || nextPlan.autoRepriceWithinBounds) {
      const nextEval = evaluateSmartDynamicPrice(product, nextPlan);
      const syncedPlan = applySmartDynamicPricingToPlan(nextPlan, nextEval);
      setPlan(syncedPlan);
      onAutoAdjustProductPrice(
        product.id,
        nextEval.finalApprovedPrice,
        undefined,
        undefined,
        reasonAr || 'تحديث قواعد التسعير الديناميكي الذكي'
      );
    }
  };

  // Trigger a simulated competitor price shift and watch Smart Dynamic Pricing adjust product price automatically
  const handleSimulateCompetitorPriceChange = (
    newCompPrice: number,
    scenarioLabelAr: string,
    allOutOfStock: boolean = false
  ) => {
    const validCompPrice = Math.max(50, Math.round(newCompPrice));
    const prevCompPrice = evaluation.competitorLowestPrice;
    const prevMerchantPrice = evaluation.finalApprovedPrice;

    // Ensure autoRepriceWithinBounds is enabled when testing dynamic reaction
    const activePlan: ProductPricingPlan = {
      ...plan,
      autoRepriceWithinBounds: true,
    };

    const nextEval = evaluateSmartDynamicPrice(
      product,
      activePlan,
      validCompPrice,
      evaluation.competitorMerchantName,
      evaluation.competitorPlatformName,
      allOutOfStock
    );

    const updatedPlan = applySmartDynamicPricingToPlan(
      activePlan,
      nextEval,
      `تسعير ديناميكي تلقائي (${scenarioLabelAr})`
    );
    setPlan(updatedPlan);

    // Record audit log entry
    const newLog: SmartDynamicPricingEventLog = {
      id: `sdp-log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      productId: product.id,
      productTitle: product.title,
      triggerReasonAr: scenarioLabelAr,
      competitorName: nextEval.competitorMerchantName,
      competitorPlatform: nextEval.competitorPlatformName,
      previousCompetitorPrice: prevCompPrice,
      newCompetitorPrice: validCompPrice,
      previousMerchantPrice: prevMerchantPrice,
      rawTargetPrice: nextEval.rawCalculatedPrice,
      newMerchantPrice: nextEval.finalApprovedPrice,
      floorPriceGuardrail: nextEval.effectiveFloorPrice,
      ceilingPriceGuardrail: nextEval.effectiveCeilingPrice,
      netProfitEGP: nextEval.netProfitEGP,
      netMarginPercent: nextEval.netMarginPercent,
      guardrailStatus: nextEval.guardrailStatus,
      ruleAppliedLabel: getDynamicPricingRuleLabel(
        updatedPlan.repriceRuleType,
        updatedPlan.undercutMode,
        updatedPlan.undercutValue,
        updatedPlan.targetNetMarginPercent
      ),
      platformsUpdatedCount: updatedPlan.platformGuardrails.length,
    };

    const updatedLogs = recordSmartDynamicPricingLog(newLog);
    setLogs(updatedLogs);

    // Update parent product state (both merchant price and lowest competitor price)
    onAutoAdjustProductPrice(
      product.id,
      nextEval.finalApprovedPrice,
      validCompPrice,
      nextEval.competitorMerchantName,
      scenarioLabelAr
    );

    logUserActivity({
      actionType: 'price_update',
      actionTitle: `تسعير ديناميكي ذكي: ${product.title.slice(0, 35)}`,
      details: `${scenarioLabelAr} | سعر المنافس: ${validCompPrice} ج.م -> سعرك التلقائي: ${nextEval.finalApprovedPrice} ج.م (${nextEval.statusHeadlineAr})`,
      platform: nextEval.competitorPlatformName,
      status: 'success',
      metadata: {
        productId: product.id,
        previousPrice: prevMerchantPrice,
        newPrice: nextEval.finalApprovedPrice,
        competitorPrice: validCompPrice,
        guardrailStatus: nextEval.guardrailStatus,
      },
    });

    setLastTriggeredAnimation(true);
    setTimeout(() => setLastTriggeredAnimation(false), 1800);

    if (onShowToast) {
      if (nextEval.guardrailStatus === 'floor_protected') {
        onShowToast(
          `🛡️ تدخل صمام أمان الأرباح (Floor Guardrail)! هبط المنافس إلى ${validCompPrice.toLocaleString()} ${currency}، وتم تثبيت سعرك عند الحد الأدنى المحمي (${nextEval.finalApprovedPrice.toLocaleString()} ${currency}) لمنع الخسارة.`
        );
      } else if (nextEval.guardrailStatus === 'ceiling_capped') {
        onShowToast(
          `🚀 تم رفع سعرك تلقائياً إلى السقف الأعلى (${nextEval.finalApprovedPrice.toLocaleString()} ${currency}) لتعظيم هامش الربح (${nextEval.netMarginPercent}%)!`
        );
      } else {
        onShowToast(
          `⚡ التسعير الديناميكي الذكي: تغير سعر المنافس إلى ${validCompPrice.toLocaleString()} ${currency} ← تم ضبط سعرك تلقائياً إلى ${nextEval.finalApprovedPrice.toLocaleString()} ${currency} (صافي ربح +${nextEval.netProfitEGP.toLocaleString()} ${currency})`
        );
      }
    }
  };

  // Run Smart Dynamic Pricing across ALL active catalog products at once
  const handleRunSmartDynamicPricingAllCatalog = () => {
    const targetList = allProducts.length > 0 ? allProducts.filter((p) => !p.isArchived) : [product];
    const adjustments: { productId: string; newPrice: number; guardrailStatus: string }[] = [];

    targetList.forEach((prod) => {
      const prodPlan = getOrCreatePricingPlan(prod);
      const activeProdPlan: ProductPricingPlan = { ...prodPlan, autoRepriceWithinBounds: true };
      const prodEval = evaluateSmartDynamicPrice(prod, activeProdPlan);
      applySmartDynamicPricingToPlan(activeProdPlan, prodEval, 'تطبيق شامل للتسعير الديناميكي الذكي');
      adjustments.push({
        productId: prod.id,
        newPrice: prodEval.finalApprovedPrice,
        guardrailStatus: prodEval.guardrailStatus,
      });
    });

    setPlan(getOrCreatePricingPlan(product));

    if (onBulkAutoAdjustAllProducts) {
      onBulkAutoAdjustAllProducts(adjustments);
    } else {
      onAutoAdjustProductPrice(
        product.id,
        evaluation.finalApprovedPrice,
        undefined,
        undefined,
        'تطبيق التسعير الديناميكي الذكي'
      );
    }

    const floorProtectedCount = adjustments.filter((a) => a.guardrailStatus === 'floor_protected').length;
    if (onShowToast) {
      onShowToast(
        `⚡ تم تشغيل التسعير الديناميكي الذكي على ${adjustments.length} منتجات بنجاح! (${floorProtectedCount} منتجات محمية بصمام الحد الأدنى Floor)`
      );
    }
  };

  return (
    <section
      id="smart-dynamic-pricing-engine-panel"
      dir="rtl"
      className={`rounded-3xl bg-slate-900 border transition-all duration-200 p-5 sm:p-7 text-slate-100 shadow-xl space-y-6 ${
        lastTriggeredAnimation
          ? 'border-emerald-400 ring-2 ring-emerald-400/30'
          : 'border-slate-800'
      }`}
    >
      {/* Top Bar: Title, Autopilot Toggle & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>محرك التسعير الديناميكي الذكي المرتبط بقواعد حماية الأرباح (Smart Dynamic Pricing)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono tabular-nums">
              {plan.autoRepriceWithinBounds ? 'نشط تلقائياً 24/7' : 'وضع يدوي'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white font-['Alexandria']">
            الضبط التلقائي لسعر منتجك فور تغير سعر المنافس مع حماية صارمة للحد الأدنى والأقصى
          </h3>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            يراقب المحرك أسعار المنافسين لحظياً ويقوم بتعديل سعرك تلقائياً لاقتناص الـ Buy Box، مع الالتزام الصارم بـ{' '}
            <strong className="text-rose-300">الحد الأدنى المحمي (Floor Price)</strong> لمنع الخسارة، و
            <strong className="text-indigo-300">الحد الأقصى (Ceiling Price)</strong> لتعظيم الأرباح عند شح المعروض.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Master Auto-Reprice Toggle Button */}
          <button
            type="button"
            id="btn-toggle-smart-dynamic-pricing"
            onClick={() => {
              const nextState = !plan.autoRepriceWithinBounds;
              updatePlanAndSync(
                (prev) => ({
                  ...prev,
                  autoRepriceWithinBounds: nextState,
                  lastModifiedAt: 'الآن',
                }),
                nextState,
                nextState
                  ? 'تفعيل التسعير الديناميكي الذكي التلقائي'
                  : 'إيقاف التسعير الديناميكي التلقائي مؤقتاً'
              );
              if (onShowToast) {
                onShowToast(
                  nextState
                    ? '✅ تم تفعيل التسعير الديناميكي الذكي: سيتم ضبط السعر تلقائياً عند أي تغير في سعر المنافس ضمن حدود الأمان'
                    : '⏸️ تم إيقاف الضبط التلقائي للسعر والعودة للتحكم اليدوي'
                );
              }
            }}
            className={`h-10 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
              plan.autoRepriceWithinBounds
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                plan.autoRepriceWithinBounds ? 'bg-white animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>
              {plan.autoRepriceWithinBounds
                ? 'التسعير الديناميكي الذكي: مفعّل ⚡'
                : 'تفعيل التسعير الديناميكي الذكي'}
            </span>
          </button>

          {/* Apply across all catalog products */}
          {allProducts.length > 1 && (
            <button
              type="button"
              id="btn-run-dynamic-pricing-all-catalog"
              onClick={handleRunSmartDynamicPricingAllCatalog}
              className="h-10 px-3.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="فحص وضبط أسعار جميع المنتجات النشطة في الكتالوج وفق قواعد حماية الأرباح"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>ضبط جميع المنتجات ({allProducts.filter((p) => !p.isArchived).length})</span>
            </button>
          )}

          {/* Navigate to full Pricing Guardrails Manager */}
          {onNavigateToGuardrails && (
            <button
              type="button"
              id="btn-open-guardrails-from-dynamic-pricing"
              onClick={onNavigateToGuardrails}
              className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>جدول حدود المنصات (Guardrails)</span>
            </button>
          )}
        </div>
      </div>

      {/* Mechanism-to-Outcome Chain: 3-Column Live Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Step 1: Competitor Trigger State */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">01. رصد سعر المنافس المؤثر</span>
            <span className="font-mono tabular-nums text-[11px] text-sky-400">
              {evaluation.competitorPlatformName}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span
                id="sdp-current-competitor-price"
                className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-sky-300"
              >
                {evaluation.competitorLowestPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{currency}</span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              المنافس الأقل: <strong className="text-slate-200">{evaluation.competitorMerchantName}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>تكلفة الجملة المعتمدة:</span>
            <span className="font-mono tabular-nums font-bold text-slate-200">
              {evaluation.costPrice.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Step 2: Guardrail Validation & Clamping Engine */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">02. فحص قواعد حماية الأرباح (Guardrails)</span>
            <button
              type="button"
              onClick={() => {
                updatePlanAndSync(
                  (prev) => ({
                    ...prev,
                    platformGuardrails: prev.platformGuardrails.map((g) => ({
                      ...g,
                      isFloorPriceLocked: !isFloorLocked,
                    })),
                  }),
                  true,
                  !isFloorLocked ? 'قفل صمام الحد الأدنى للأرباح' : 'فتح قفل الحد الأدنى'
                );
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
                isFloorLocked
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-sky-950/80 text-sky-300 border-sky-500/40'
              }`}
              title="قفل أو فتح حماية الحد الأدنى (Floor Price Lock)"
            >
              {isFloorLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{isFloorLocked ? 'قفل الحد الأدنى نشط' : 'الحد الأدنى غير مقفول'}</span>
            </button>
          </div>

          {/* Visual Guardrail Spectrum Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
              <span className="text-rose-400 font-bold">
                الحد الأدنى (Floor): {evaluation.effectiveFloorPrice.toLocaleString()}
              </span>
              <span className="text-indigo-300 font-bold">
                السقف (Ceiling): {evaluation.effectiveCeilingPrice.toLocaleString()}
              </span>
            </div>

            <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-200 ${
                  evaluation.guardrailStatus === 'floor_protected'
                    ? 'bg-rose-500'
                    : evaluation.guardrailStatus === 'ceiling_capped'
                    ? 'bg-indigo-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(8, guardrailRangePercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                السعر المبدئي المحسوب:{' '}
                <strong className="font-mono tabular-nums text-slate-200">
                  {evaluation.rawCalculatedPrice.toLocaleString()} {currency}
                </strong>
              </span>
              <span className="font-mono tabular-nums text-emerald-400 font-bold">
                Buy Box: {evaluation.buyBoxProbabilityPercent}%
              </span>
            </div>
          </div>

          {/* Status Verdict Line */}
          <div
            className={`pt-2 border-t border-slate-800/80 text-[11px] font-bold flex items-center gap-1.5 ${
              evaluation.guardrailStatus === 'floor_protected'
                ? 'text-rose-300'
                : evaluation.guardrailStatus === 'ceiling_capped'
                ? 'text-indigo-300'
                : 'text-emerald-300'
            }`}
          >
            {evaluation.guardrailStatus === 'floor_protected' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{evaluation.statusHeadlineAr}</span>
          </div>
        </div>

        {/* Step 3: Final Auto-Adjusted Price & Protected Net Profit */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
            evaluation.guardrailStatus === 'floor_protected'
              ? 'bg-rose-950/25 border-rose-500/50'
              : 'bg-emerald-950/25 border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">03. سعرك الديناميكي المعتمد تلقائياً</span>
            <span className="font-mono tabular-nums text-[11px] text-emerald-300 font-bold">
              {evaluation.priceDeltaFromCompetitor < 0
                ? `${evaluation.priceDeltaFromCompetitor} ${currency} عن المنافس`
                : evaluation.priceDeltaFromCompetitor === 0
                ? 'مطابق للمنافس'
                : `+${evaluation.priceDeltaFromCompetitor} ${currency} (محمي بالحد الأدنى)`}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span
                id="sdp-final-approved-price"
                className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-400"
              >
                {evaluation.finalApprovedPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-200">{currency}</span>
            </div>

            <div className="text-left font-mono tabular-nums">
              <div className="text-xs font-black text-white">
                صافي الربح: +{evaluation.netProfitEGP.toLocaleString()} {currency}
              </div>
              <div className="text-[11px] text-emerald-300 font-bold">
                هامش صافي: {evaluation.netMarginPercent}% بعد العمولات
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
            {evaluation.statusExplanationAr}
          </p>
        </div>
      </div>

      {/* Strategy & Guardrails Inline Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
            <h4 className="text-xs sm:text-sm font-black text-white font-['Alexandria']">
              إعداد قاعدة التسعير الديناميكي وحدود حماية الأرباح (Pricing Guardrails)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            أي تعديل في القاعدة أو الحدود يتم حفظه وتطبيقه فوراً على الرادار والمنصات المتصلة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Strategy Selector */}
          <div className="md:col-span-4 space-y-1">
            <label
              htmlFor="sdp-rule-type-select"
              className="text-[11px] font-bold text-slate-300 block"
            >
              استراتيجية الاستجابة لتغير سعر المنافس:
            </label>
            <select
              id="sdp-rule-type-select"
              value={plan.repriceRuleType}
              onChange={(e) => {
                const nextRule = e.target.value as SmartDynamicPricingRuleType;
                updatePlanAndSync(
                  (prev) => ({
                    ...prev,
                    repriceRuleType: nextRule,
                  }),
                  true,
                  'تغيير استراتيجية التسعير الديناميكي'
                );
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="undercut_lowest_competitor">
                كسر سعر أرخص منافس (Undercut Buy Box)
              </option>
              <option value="match_lowest_competitor">
                مطابقة سعر أرخص منافس تماماً (Match Lowest)
              </option>
              <option value="target_margin_percentage">
                تأمين هامش ربح صافي مستهدف % (Target Margin)
              </option>
              <option value="match_market_median">
                موازنة السعر مع متوسط السوق (Market Median)
              </option>
            </select>
          </div>

          {/* Undercut Amount / Target Margin Control */}
          <div className="md:col-span-3 space-y-1">
            {plan.repriceRuleType === 'target_margin_percentage' ? (
              <>
                <label
                  htmlFor="sdp-target-margin-input"
                  className="text-[11px] font-bold text-emerald-300 block"
                >
                  هامش الربح الصافي المستهدف (%):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    id="sdp-target-margin-input"
                    type="number"
                    min={3}
                    max={60}
                    value={plan.targetNetMarginPercent ?? 14}
                    onChange={(e) => {
                      const val = Math.max(2, Math.min(60, Number(e.target.value) || 10));
                      updatePlanAndSync(
                        (prev) => ({ ...prev, targetNetMarginPercent: val }),
                        true,
                        `تحديد هامش الربح المستهدف ${val}%`
                      );
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 font-mono tabular-nums font-bold text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-400 shrink-0">%</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="sdp-undercut-value-input"
                    className="text-[11px] font-bold text-slate-300"
                  >
                    فارق خفض السعر تحت المنافس:
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        updatePlanAndSync(
                          (prev) => ({ ...prev, undercutMode: 'fixed_egp', undercutValue: 25 }),
                          true
                        )
                      }
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        (plan.undercutMode || 'fixed_egp') === 'fixed_egp'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ج.م
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updatePlanAndSync(
                          (prev) => ({ ...prev, undercutMode: 'percentage', undercutValue: 2 }),
                          true
                        )
                      }
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        plan.undercutMode === 'percentage'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <input
                  id="sdp-undercut-value-input"
                  type="number"
                  min={1}
                  max={plan.undercutMode === 'percentage' ? 35 : 1000}
                  value={plan.undercutValue ?? 25}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 1);
                    updatePlanAndSync(
                      (prev) => ({ ...prev, undercutValue: val }),
                      true,
                      'تحديث فارق التسعير الديناميكي'
                    );
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 font-mono tabular-nums font-bold text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </>
            )}
          </div>

          {/* Global / Primary Floor Guardrail Input */}
          <div className="md:col-span-2.5 space-y-1">
            <label
              htmlFor="sdp-floor-price-input"
              className="text-[11px] font-bold text-rose-300 block"
            >
              الحد الأدنى المحمي (Floor):
            </label>
            <input
              id="sdp-floor-price-input"
              type="number"
              value={evaluation.effectiveFloorPrice}
              onChange={(e) => {
                const nextFloor = Math.max(50, Number(e.target.value) || plan.costPrice);
                updatePlanAndSync(
                  (prev) => ({
                    ...prev,
                    globalMinPrice: nextFloor,
                    platformGuardrails: prev.platformGuardrails.map((g, i) =>
                      i === 0 ? { ...g, minAllowedPrice: nextFloor } : g
                    ),
                  }),
                  true,
                  `تعديل الحد الأدنى (Floor) إلى ${nextFloor} ج.م`
                );
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-rose-500/40 font-mono tabular-nums font-bold text-xs text-rose-200 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Global / Primary Ceiling Guardrail Input */}
          <div className="md:col-span-2.5 space-y-1">
            <label
              htmlFor="sdp-ceiling-price-input"
              className="text-[11px] font-bold text-indigo-300 block"
            >
              الحد الأقصى (Ceiling):
            </label>
            <input
              id="sdp-ceiling-price-input"
              type="number"
              value={evaluation.effectiveCeilingPrice}
              onChange={(e) => {
                const nextCeiling = Math.max(
                  evaluation.effectiveFloorPrice + 50,
                  Number(e.target.value) || plan.globalMaxPrice
                );
                updatePlanAndSync(
                  (prev) => ({
                    ...prev,
                    globalMaxPrice: nextCeiling,
                    platformGuardrails: prev.platformGuardrails.map((g, i) =>
                      i === 0 ? { ...g, maxAllowedPrice: nextCeiling } : g
                    ),
                  }),
                  true,
                  `تعديل الحد الأقصى (Ceiling) إلى ${nextCeiling} ج.م`
                );
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-indigo-500/40 font-mono tabular-nums font-bold text-xs text-indigo-200 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Live Competitor Price Shift Simulator (محاكي تغير سعر المنافس لاختبار الاستجابة التلقائية) */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400 shrink-0" />
            <h4 className="text-xs sm:text-sm font-black text-white font-['Alexandria']">
              اختبار الاستجابة التلقائية عند تغير سعر المنافس (Live Competitor Shift Simulator)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            اضغط على أي سيناريو لمحاكاة تغير سعر المنافس ومشاهدة كيف يضبط النظام سعرك تلقائياً ضمن حدود الحماية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Scenario 1: Moderate Competitor Price Drop */}
          <button
            type="button"
            id="btn-sim-competitor-drop-normal"
            onClick={() => {
              const targetComp = Math.max(
                evaluation.effectiveFloorPrice + 60,
                evaluation.competitorLowestPrice - 60
              );
              handleSimulateCompetitorPriceChange(
                targetComp,
                'تخفيض المنافس لسعره بمقدار 60 ج.م على أمازون'
              );
            }}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
              <span>1. هبوط تنافسي (-60 ج.م)</span>
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              يخفض سعرك تلقائياً تحت المنافس لاقتناص الـ Buy Box ضمن النطاق الآمن
            </p>
          </button>

          {/* Scenario 2: Aggressive Price War Below Floor Guardrail */}
          <button
            type="button"
            id="btn-sim-competitor-crash-floor"
            onClick={() => {
              const crashPrice = Math.max(100, evaluation.effectiveFloorPrice - 180);
              handleSimulateCompetitorPriceChange(
                crashPrice,
                'حرب أسعار حادة (سعر المنافس كسر الحد الأدنى)'
              );
            }}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
              <span>2. كسر الحد الأدنى (Floor Test)</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              يهبط المنافس لـ {(evaluation.effectiveFloorPrice - 180).toLocaleString()} ج.م ← يتدخل القفل ويثبت سعرك عند{' '}
              {evaluation.effectiveFloorPrice.toLocaleString()} ج.م
            </p>
          </button>

          {/* Scenario 3: Competitor Stockout / Price Surge to Ceiling */}
          <button
            type="button"
            id="btn-sim-competitor-surge-ceiling"
            onClick={() => {
              const surgePrice = evaluation.effectiveCeilingPrice + 150;
              handleSimulateCompetitorPriceChange(
                surgePrice,
                'ارتفاع أسعار المنافسين ونفاد مخزون الأرخص',
                true
              );
            }}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-right transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-1">
              <span>3. شح المعروض (Ceiling Surge)</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              يرفع سعرك تلقائياً إلى السقف الأعلى ({evaluation.effectiveCeilingPrice.toLocaleString()} ج.م) لتعظيم الربح
            </p>
          </button>

          {/* Scenario 4: Custom Competitor Price Input */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex flex-col justify-between gap-2">
            <label
              htmlFor="input-custom-sim-competitor-price"
              className="text-[11px] font-bold text-sky-300 block"
            >
              4. أدخل سعر منافس جديد ({currency}):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-custom-sim-competitor-price"
                type="number"
                value={customSimCompetitorPrice}
                onChange={(e) => setCustomSimCompetitorPrice(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 font-mono tabular-nums font-bold text-xs text-white focus:outline-none focus:border-sky-400"
                placeholder="مثال: 3250"
              />
              <button
                type="button"
                id="btn-apply-custom-sim-competitor-price"
                onClick={() => {
                  const num = Number(customSimCompetitorPrice);
                  if (!num || num <= 0) return;
                  handleSimulateCompetitorPriceChange(
                    num,
                    `تغير سعر المنافس المباشر إلى ${num.toLocaleString()} ${currency}`
                  );
                }}
                className="h-8 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                ضبط تلقائي ⚡
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Execution Audit Log Table */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowExecutionLogs(!showExecutionLogs)}
            className="flex items-center gap-2 text-xs font-black text-slate-200 hover:text-white cursor-pointer"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>سجل عمليات التسعير الديناميكي الذكي وحماية الأرباح ({logs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExecutionLogs(!showExecutionLogs)}
            className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
          >
            {showExecutionLogs ? 'إخفاء السجل ▲' : 'عرض السجل ▼'}
          </button>
        </div>

        {showExecutionLogs && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full min-w-[720px] text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] bg-slate-900/60">
                  <th className="py-2.5 px-3.5 font-bold">التوقيت والمنتج</th>
                  <th className="py-2.5 px-3.5 font-bold">حركة سعر المنافس</th>
                  <th className="py-2.5 px-3.5 font-bold">الضبط التلقائي لسعرك</th>
                  <th className="py-2.5 px-3.5 font-bold">حالة قواعد الحماية (Guardrails)</th>
                  <th className="py-2.5 px-3.5 font-bold">صافي الربح المحمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {logs.slice(0, 6).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-200 truncate max-w-[210px]">
                        {log.productTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {log.timestamp} · {log.competitorName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono tabular-nums whitespace-nowrap">
                      <span className="text-slate-400 line-through text-[11px]">
                        {log.previousCompetitorPrice.toLocaleString()}
                      </span>
                      <span className="mx-1.5 text-slate-500">←</span>
                      <span className="font-bold text-sky-300">
                        {log.newCompetitorPrice.toLocaleString()} {currency}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono tabular-nums whitespace-nowrap">
                      <span className="text-slate-400 line-through text-[11px]">
                        {log.previousMerchantPrice.toLocaleString()}
                      </span>
                      <span className="mx-1.5 text-slate-500">←</span>
                      <span className="font-black text-emerald-400 text-sm">
                        {log.newMerchantPrice.toLocaleString()} {currency}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5">
                        {log.guardrailStatus === 'floor_protected' ? (
                          <span className="text-rose-300 font-bold text-[11px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>حماية الحد الأدنى ({log.floorPriceGuardrail.toLocaleString()})</span>
                          </span>
                        ) : log.guardrailStatus === 'ceiling_capped' ? (
                          <span className="text-indigo-300 font-bold text-[11px] flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>تثبيت عند السقف ({log.ceilingPriceGuardrail.toLocaleString()})</span>
                          </span>
                        ) : (
                          <span className="text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>ضمن النطاق الآمن · Buy Box</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {log.triggerReasonAr}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono tabular-nums whitespace-nowrap">
                      <span className="font-bold text-emerald-400">
                        +{log.netProfitEGP.toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        هامش صافي {log.netMarginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
