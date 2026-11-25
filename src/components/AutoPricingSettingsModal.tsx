import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Tag,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Percent
} from 'lucide-react';
import { AutoPricingRule, AutoPricingTriggerCondition, AutoPricingActionType } from '../types/autoPricing';
import { loadAutoPricingRules, saveAutoPricingRules } from '../data/autoPricingEngineData';
import { supabase } from '../lib/supabase';

interface AutoPricingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const AutoPricingSettingsModal: React.FC<AutoPricingSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [rules, setRules] = useState<AutoPricingRule[]>(() => loadAutoPricingRules());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form state for new / edited rule
  const [ruleName, setRuleName] = useState<string>('قواعد التسعير التنافسي المخصصة');
  const [conditionType, setConditionType] = useState<AutoPricingTriggerCondition>('competitor_price_changed_by_percent');
  const [actionType, setActionType] = useState<AutoPricingActionType>('competitor_plus_fixed');
  const [deltaValue, setDeltaValue] = useState<number>(5); // e.g. 5 EGP below competitor
  const [minFloorPrice, setMinFloorPrice] = useState<number>(100);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(15);
  const [isActive, setIsActive] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const resolvedTitle = ruleName.trim() || 'قاعدة تسعير جديدة';
    const newRule: AutoPricingRule = {
      id: editingRuleId || `rule_${Date.now()}`,
      title: resolvedTitle,
      name: resolvedTitle,
      description: `قاعدة تسعير آلي: ${resolvedTitle}`,
      isActive,
      priority: rules.length + 1,
      conditionType,
      conditionValue: 2, // e.g., 2% change threshold
      conditionPlatformFilter: 'all',
      actionType,
      actionValue: deltaValue,
      guardrails: {
        minFloorPriceEGP: Number(minFloorPrice) || 50,
        maxDiscountPercentFromBaseline: Number(maxDiscountPercent) || 20,
        requireFounderApprovalAboveDeltaPercent: 25,
        pauseOnCompetitorStockOut: true,
      },
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString(),
    };

    const updatedRules = editingRuleId
      ? rules.map((r) => (r.id === editingRuleId ? newRule : r))
      : [newRule, ...rules];

    setRules(updatedRules);
    saveAutoPricingRules(updatedRules);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auto_pricing_rules_updated'));
    }

    // Sync to Supabase if configured
    try {
      await supabase.from('auto_pricing_rules').upsert(
        updatedRules.map((r) => ({
          id: r.id,
          name: r.name,
          is_active: r.isActive,
          priority: r.priority,
          condition_type: r.conditionType,
          action_type: r.actionType,
          action_value: r.actionValue,
          min_floor_price: r.guardrails.minFloorPriceEGP,
          max_discount_percent: r.guardrails.maxDiscountPercentFromBaseline,
          updated_at: r.updatedAt,
        })),
        { onConflict: 'id' }
      );
    } catch {
      // Local localStorage fallback already saved successfully
    }

    setIsSaving(false);
    setEditingRuleId(null);
    if (onShowToast) {
      onShowToast('تم حفظ قواعد محرك التسعير الآلي بنجاح ⚙️✅');
    }
  };

  const handleEditRule = (rule: AutoPricingRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name || rule.title);
    setConditionType(rule.conditionType);
    setActionType(rule.actionType);
    setDeltaValue(rule.actionValue);
    setMinFloorPrice(rule.guardrails.minFloorPriceEGP);
    setMaxDiscountPercent(rule.guardrails.maxDiscountPercentFromBaseline ?? 15);
    setIsActive(rule.isActive);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveAutoPricingRules(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auto_pricing_rules_updated'));
    }
    if (onShowToast) {
      onShowToast('تم حذف قاعدة التسعير بنجاح 🗑️');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-right shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-2xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">إعدادات وقواعد محرك التسعير الآلي</h3>
              <p className="text-xs text-slate-400">ضبط استراتيجيات التسعير التنافسي التلقائي وحدود الأمان المالية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form for adding/editing a rule */}
        <form onSubmit={handleSaveRule} className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400">
              {editingRuleId ? 'تعديل قاعدة التسعير الحالية ✍️' : 'إضافة قاعدة تسعير جديدة ➕'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <span>تفعيل القاعدة فوراً</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم القاعدة / الاستراتيجية *</label>
              <input
                type="text"
                required
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="مثال: دائماً أقل من المنافس بـ 5 جنيهات"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">حالة التفعيل (Trigger Condition)</label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value as AutoPricingTriggerCondition)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="competitor_price_changed_by_percent">عند تغير سعر المنافس بنسبة معينة</option>
                  <option value="competitor_lower_than_mine">عندما يصبح سعر المنافس أقل من سعرك</option>
                  <option value="buy_box_lost">عند فقدان صندوق الشراء (Buy Box)</option>
                  <option value="stock_level_low">عند انخفاض مخزون المنافس</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الإجراء التلقائي (Action)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as AutoPricingActionType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="competitor_plus_fixed">دائماً أقل من المنافس بمقدار ثابت (جنيهات)</option>
                  <option value="match_competitor">مساواة سعر المنافس بالضبط</option>
                  <option value="competitor_plus_percent">أقل من المنافس بنسبة مئوية (%)</option>
                  <option value="floor_price_fallback">التثبيت عند الحد الأدنى الآمن</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">مقدار الفرق (جنيه / %)</label>
                <input
                  type="number"
                  step="0.5"
                  value={deltaValue}
                  onChange={(e) => setDeltaValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأدنى الآمن (Floor Price)</label>
                <input
                  type="number"
                  value={minFloorPrice}
                  onChange={(e) => setMinFloorPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">أقصى نسبة خصم مسموحة (%)</label>
                <input
                  type="number"
                  value={maxDiscountPercent}
                  onChange={(e) => setMaxDiscountPercent(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingRuleId && (
              <button
                type="button"
                onClick={() => {
                  setEditingRuleId(null);
                  setRuleName('قواعد التسعير التنافسي المخصصة');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء التعديل
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-l from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{editingRuleId ? 'حفظ تعديلات القاعدة' : 'حفظ وإضافة القاعدة'}</span>
            </button>
          </div>
        </form>

        {/* Existing Rules List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>القواعد الحالية المفعلة ({rules.length})</span>
            <span className="text-slate-500 text-[10px]">تطبق تلقائياً على المنتجات النشطة</span>
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white">{rule.name || rule.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rule.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.isActive ? 'مفعلة' : 'متوقفة'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    الإجراء: أقل من المنافس بـ <strong className="text-orange-400">{rule.actionValue} ج.م</strong> — حد أدنى: {rule.guardrails?.minFloorPriceEGP || 50} ج.م
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditRule(rule)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer transition-colors"
                    title="حذف القاعدة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            إغلاق الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoPricingSettingsModal;
