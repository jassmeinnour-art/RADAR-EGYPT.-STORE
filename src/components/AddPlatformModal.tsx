import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Store,
  ShoppingBag,
  Globe,
  Building2,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Percent,
  UserCheck,
  Zap,
  Info,
  KeyRound,
  Link2,
  Loader2,
  Bot,
  Layers,
  Tag
} from 'lucide-react';
import { ConnectedMerchantPlatform, PlatformCategoryConfig } from '../types';
import { getCategoryIconComponent, CATEGORY_ICON_MAP } from './CategoryModal';

export type NewPlatformCategory = 'marketplace' | 'website' | 'retail_chain' | 'social' | string;

interface AddPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlatform: (platformData: {
    name: string;
    category: string;
    sellerName: string;
    commissionFeePercent: number;
    isConnected: boolean;
    websiteUrl?: string;
    suggestedIcon?: string;
  }) => void;
  availableCategories?: PlatformCategoryConfig[];
  onOpenQuickHelp?: () => void;
}

export const AddPlatformModal: React.FC<AddPlatformModalProps> = ({
  isOpen,
  onClose,
  onAddPlatform,
  availableCategories,
  onOpenQuickHelp,
}) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('marketplace');
  const [sellerName, setSellerName] = useState('');
  const [commissionFee, setCommissionFee] = useState<number>(5);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Auto-Classification State (Gemini Powered)
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<{
    categoryKey: string;
    categoryTitle: string;
    iconName: string;
    detectedName: string;
    suggestedCommission: number;
    explanation: string;
    confidence: number;
  } | null>(null);
  const [selectedIconName, setSelectedIconName] = useState<string>('ShoppingBag');

  // Reset fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setWebsiteUrl('');
      setName('');
      setCategory('marketplace');
      setSellerName('');
      setCommissionFee(5);
      setIsConnected(true);
      setValidationError(null);
      setIsClassifying(false);
      setAiClassificationResult(null);
      setSelectedIconName('ShoppingBag');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Gemini AI Auto-Classification Engine
  const handleAutoClassifyWithAI = async (overrideUrl?: string, overrideName?: string) => {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : websiteUrl).trim();
    const targetName = (overrideName !== undefined ? overrideName : name).trim();

    if (!targetUrl && !targetName) {
      setValidationError('يرجى إدخال رابط الموقع أو اسم المنصة أولاً للبدء في التحليل الذكي');
      return;
    }

    setIsClassifying(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/classify-channel-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: targetUrl,
          platformName: targetName,
          availableCategories: availableCategories || []
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result = json.data;
        setAiClassificationResult(result);

        // Auto-assign category without manual intervention
        if (result.categoryKey) {
          setCategory(result.categoryKey);
        }

        // Auto-assign icon
        if (result.iconName) {
          setSelectedIconName(result.iconName);
        }

        // Auto-assign name if not filled or if only URL was given
        if ((!name.trim() || targetUrl.includes(name.trim())) && result.detectedName) {
          setName(result.detectedName);
        }

        // Auto-assign commission fee
        if (result.suggestedCommission !== undefined && (commissionFee === 5 || commissionFee === 0)) {
          setCommissionFee(result.suggestedCommission);
        }
      }
    } catch (err) {
      console.warn('[AI Classification Error]:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Trigger classification when pasting a URL
  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.startsWith('http') || pastedText.includes('.com') || pastedText.includes('.eg') || pastedText.includes('.'))) {
      setWebsiteUrl(pastedText);
      setTimeout(() => {
        handleAutoClassifyWithAI(pastedText, name);
      }, 50);
    }
  };

  if (!isOpen) return null;

  const defaultCategoryOptions: {
    id: NewPlatformCategory;
    label: string;
    english: string;
    Icon: React.ElementType;
    badgeBg: string;
    borderActive: string;
    desc: string;
  }[] = [
    {
      id: 'marketplace',
      label: 'ماركت بليس',
      english: 'Marketplace',
      Icon: ShoppingBag,
      badgeBg: 'bg-sky-50 text-sky-900 border-sky-300',
      borderActive: 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-200',
      desc: 'منصات تسوق متعددة البائعين (أمازون، نون، جوميا، كنز، هومزمارت...)',
    },
    {
      id: 'website',
      label: 'موقع إلكتروني',
      english: 'E-commerce',
      Icon: Globe,
      badgeBg: 'bg-sky-50 text-sky-900 border-sky-300',
      borderActive: 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-200',
      desc: 'متجر إلكتروني خاص (شوبيفاي، سلة، زد، ووكومرس، متجر مخصص...)',
    },
    {
      id: 'retail_chain',
      label: 'سلسلة تجزئة',
      english: 'Retail Chain',
      Icon: Building2,
      badgeBg: 'bg-teal-50 text-teal-900 border-teal-300',
      borderActive: 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-200',
      desc: 'سلاسل تجزئة وموزعين معتمدين (بي تك، العربي جروب، 2B، راية...)',
    },
    {
      id: 'social',
      label: 'سوشيال ميديا',
      english: 'Social Commerce',
      Icon: Smartphone,
      badgeBg: 'bg-purple-50 text-purple-900 border-purple-300',
      borderActive: 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200',
      desc: 'قنوات البيع عبر شبكات التواصل (فيسبوك، تيك توك شوب، إنستغرام...)',
    },
  ];

  const categoryOptions =
    availableCategories && availableCategories.length > 0
      ? availableCategories.map((c) => ({
          id: c.key,
          label: c.title,
          english: c.englishTitle || (c.isCustom ? 'Custom' : c.key),
          Icon: getCategoryIconComponent(c.iconName),
          badgeBg: c.badgeBg || 'bg-indigo-50 text-indigo-900 border-indigo-300',
          borderActive: 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200',
          desc: c.isCustom
            ? `تصنيف مخصص: ${c.title}`
            : c.key === 'marketplace'
            ? 'منصات تسوق متعددة البائعين (أمازون، نون، جوميا...)'
            : c.key === 'website'
            ? 'متجر إلكتروني خاص (شوبيفاي، سلة، زد، ووكومرس...)'
            : c.key === 'retail_chain'
            ? 'سلاسل تجزئة وموزعين معتمدين (بي تك، العربي جروب...)'
            : 'قنوات البيع عبر شبكات التواصل (فيسبوك، تيك توك...)',
        }))
      : defaultCategoryOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError('يرجى إدخال اسم المنصة أولاً');
      return;
    }

    onAddPlatform({
      name: trimmed,
      category,
      sellerName: sellerName.trim() || 'متجر التاجر المعتمد',
      commissionFeePercent: commissionFee >= 0 ? commissionFee : 0,
      isConnected,
      websiteUrl: websiteUrl.trim() || undefined,
      suggestedIcon: selectedIconName || undefined,
    });
  };

  const SelectedIconComponent = CATEGORY_ICON_MAP[selectedIconName]?.Icon || getCategoryIconComponent(selectedIconName);

  return (
    <div
      id="add-platform-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="add-platform-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                  إضافة قناة / منصة بيع جديدة
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  <span>مدعوم بـ Gemini AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                الصق رابط الموقع أو اكتب اسم المنصة ليتم تصنيفها وتعيين الأيقونة تلقائياً
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenQuickHelp && (
              <button
                type="button"
                id="btn-open-quick-help-from-add-modal"
                onClick={() => {
                  onClose();
                  onOpenQuickHelp();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#000000] border-2 border-[#000000] font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title="فتح دليل خطوات الربط واستخراج مفاتيح API بالتنسيق المجدول"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#000000]" />
                <span className="hidden sm:inline">دليل الـ API المجدول</span>
                <span className="sm:hidden">دليل الـ API</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-right">
          
          {/* Quick Help Banner for Direct API Links */}
          {onOpenQuickHelp && (
            <div className="p-3 bg-amber-50 border-2 border-[#000000] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-[#000000]">
                  تريد استخراج مفاتيح الـ API أو تفاصيل ربط منصتك (أمازون، نون، جوميا، سلة...)؟
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuickHelp();
                }}
                className="px-3 py-1.5 bg-[#000000] hover:bg-slate-800 text-amber-300 border border-[#000000] rounded-lg text-xs font-black shrink-0 cursor-pointer transition-colors shadow-2xs"
              >
                عرض الدليل المجدول ⚡
              </button>
            </div>
          )}
          
          {/* AI-Powered URL Auto-Classification Input */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-purple-50/30 border border-indigo-100/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-new-platform-url" className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                <span>رابط الموقع أو المتجر (URL) للتصنيف التلقائي الذكي:</span>
              </label>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                كشف فوري ⚡
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="input-new-platform-url"
                  type="text"
                  dir="ltr"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onPaste={handleUrlPaste}
                  onBlur={() => {
                    if (websiteUrl.trim() && !aiClassificationResult) {
                      handleAutoClassifyWithAI(websiteUrl, name);
                    }
                  }}
                  placeholder="https://noon.com/egypt-ar/ أو btech.com أو shopify.com..."
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-indigo-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>

              <button
                type="button"
                disabled={isClassifying || (!websiteUrl.trim() && !name.trim())}
                onClick={() => handleAutoClassifyWithAI(websiteUrl, name)}
                className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
                title="تحليل رابط الموقع وتصنيف القناة تلقائياً بواسطة Gemini"
              >
                {isClassifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحليل...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    <span>تصنيف بـ Gemini ✨</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Classification Feedback Badge */}
            {aiClassificationResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300/80 text-emerald-950 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1 text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم التصنيف التلقائي الذكي بواسطة Gemini:</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono">
                    دقة {Math.round((aiClassificationResult.confidence || 0.95) * 100)}%
                  </span>
                </div>
                
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {aiClassificationResult.explanation}
                </p>

                <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/70 text-[11px] flex-wrap">
                  <span className="font-bold">الفئة المختارة:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
                    {aiClassificationResult.categoryTitle}
                  </span>
                  <span>•</span>
                  <span className="font-bold">الأيقونة المحددة:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 font-bold">
                    <SelectedIconComponent className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{CATEGORY_ICON_MAP[selectedIconName]?.label || selectedIconName}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">العمولة المقترحة: <strong className="text-emerald-900 font-mono">{aiClassificationResult.suggestedCommission}%</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Platform Name Input */}
          <div>
            <label htmlFor="input-new-platform-name" className="block text-xs font-bold text-slate-800 mb-1.5">
              اسم المنصة أو المتجر <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-new-platform-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="مثال: نون مصر، متجر شوبيفاي الرئيسي، بي تك، صفحة فيسبوك..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium bg-white transition-all focus:outline-hidden ${
                  validationError
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
            </div>
            {validationError && (
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* Platform Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800">
                فئة وتصنيف المنصة <span className="text-rose-500">*</span>
              </label>
              {aiClassificationResult && (
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>تم التعيين التلقائي دون تدخل</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoryOptions.map((opt) => {
                const isSelected = category === opt.id;
                const IconComponent = opt.Icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCategory(opt.id);
                      // Auto-select typical icon if not manually changed
                      if (opt.id === 'marketplace') setSelectedIconName('ShoppingBag');
                      else if (opt.id === 'website') setSelectedIconName('Globe');
                      else if (opt.id === 'retail_chain') setSelectedIconName('Building2');
                      else if (opt.id === 'social') setSelectedIconName('Smartphone');
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1.5 cursor-pointer select-none ${
                      isSelected
                        ? opt.borderActive
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <IconComponent className="w-4 h-4 text-indigo-600" />
                        <span>{opt.label}</span>
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">{opt.english}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Icon Customizer (AI Selected) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <SelectedIconComponent className="w-4 h-4 text-indigo-600" />
                <span>الأيقونة المعينة للمنصة: <strong className="text-indigo-900">{CATEGORY_ICON_MAP[selectedIconName]?.label || selectedIconName}</strong></span>
              </span>
              <span className="text-[10px] text-slate-400">انقر للتغيير</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.entries(CATEGORY_ICON_MAP).slice(0, 10).map(([iconKey, val]) => {
                const IconComp = val.Icon;
                const isCurrent = selectedIconName === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIconName(iconKey)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={val.label}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seller / Store Name (Optional) */}
          <div>
            <label htmlFor="input-new-platform-seller-name" className="block text-xs font-bold text-slate-800 mb-1.5">
              اسم حساب البائع / المتجر على المنصة <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                id="input-new-platform-seller-name"
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="مثال: متجر التاجر المعتمد - مصر"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">يُستخدم لتحديد اسم متجرك ومقارنته بالمنافسين الآخرين في قائمة العروض</p>
          </div>

          {/* Commission Fee & Real-time Sync Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            {/* Commission Fee */}
            <div>
              <label htmlFor="input-new-platform-commission" className="block text-xs font-bold text-slate-800 mb-1.5">
                نسبة عمولة المنصة (%)
              </label>
              <div className="relative">
                <input
                  id="input-new-platform-commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionFee}
                  onChange={(e) => setCommissionFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Instant Real-Time Sync Toggle */}
            <div className="flex flex-col justify-center">
              <span className="block text-xs font-bold text-slate-800 mb-1.5">
                حالة التزامن المباشر
              </span>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isConnected}
                  onChange={(e) => setIsConnected(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                />
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">تفعيل التزامن الفوري</span>
                  <span className="text-[10px] text-slate-500">جاهزة فوراً لإرسال الأسعار واستقبال الطلبات</span>
                </div>
              </label>
            </div>
          </div>

          {/* Sync Credentials Requirement Notice */}
          <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200/80 flex items-start gap-2 text-right">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-900 leading-relaxed">
              <strong>تنويه:</strong> بعد الحفظ ستظهر لك نافذة لتأكيد بيانات الربط (مفتاح API أو البريد الإلكتروني للتاجر) لضمان تفعيل مزامنة الأسعار وتحديث العروض فورياً مع المنصة.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="btn-submit-add-platform"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-200" />
              <span>حفظ وإضافة القناة ⚡</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

