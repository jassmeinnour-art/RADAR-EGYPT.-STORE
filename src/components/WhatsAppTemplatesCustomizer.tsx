import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
  Send,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
  MessageSquare,
  AlertCircle,
  Tag,
  Link as LinkIcon,
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  WhatsAppAlertTemplate, 
  WhatsAppTemplateCategory, 
  ProductData,
  ConnectedMerchantPlatform 
} from '../types';
import { 
  DEFAULT_WHATSAPP_ALERT_TEMPLATES, 
  WHATSAPP_TEMPLATE_VARIABLES, 
  fillTemplateVariables 
} from '../data/defaultWhatsAppTemplates';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface WhatsAppTemplatesCustomizerProps {
  products: ProductData[];
  activeProduct: ProductData;
  connectedPlatforms: ConnectedMerchantPlatform[];
  currency?: string;
  onOpenRepriceModal?: (productId?: string) => void;
  onSelectProduct?: (product: ProductData) => void;
}

export const WhatsAppTemplatesCustomizer: React.FC<WhatsAppTemplatesCustomizerProps> = ({
  products,
  activeProduct,
  connectedPlatforms,
  currency = 'ج.م',
  onOpenRepriceModal,
  onSelectProduct
}) => {
  // Local storage or state for templates
  const [templates, setTemplates] = useState<WhatsAppAlertTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_wa_templates');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_WHATSAPP_ALERT_TEMPLATES;
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tpl-price-drop-urgent');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppAlertTemplate | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('+201012345678');
  const [testMerchantName, setTestMerchantName] = useState<string>('متجر الصفوة للتجارة والإلكترونيات');
  const [testProduct, setTestProduct] = useState<ProductData>(activeProduct);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);

  // Save to localStorage whenever templates change
  const saveTemplatesToStorage = (updated: WhatsAppAlertTemplate[]) => {
    setTemplates(updated);
    try {
      localStorage.setItem('merchant_radar_wa_templates', JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const filteredTemplates = templates.filter(tpl => {
    if (activeCategoryFilter === 'all') return true;
    return tpl.category === activeCategoryFilter;
  });

  // Calculate simulated parameters from testProduct
  const currentLowest = testProduct.currentLowestPrice;
  const oldPrice = currentLowest + 180;
  const newPrice = currentLowest;
  const dropAmount = 180;
  const dropPercent = Math.round((dropAmount / oldPrice) * 100);
  const recommendedWinPrice = Math.round(currentLowest * 0.95);
  const wholesaleCost = testProduct.estimatedWholesaleCost;
  const netProfit = recommendedWinPrice - wholesaleCost;
  const profitMarginPercent = Math.round((netProfit / recommendedWinPrice) * 100);
  const competitorName = testProduct.merchantOffers[0]?.merchantName 
    ? `${testProduct.merchantOffers[0].merchantName} (${testProduct.merchantOffers[0].platformName})`
    : 'بي تك (B.TECH) على أمازون مصر';

  // Live rendered preview string
  const activeTemplateForPreview = isEditing && editingTemplate ? editingTemplate : selectedTemplate;
  
  const livePreviewText = activeTemplateForPreview
    ? fillTemplateVariables(activeTemplateForPreview.templateBody, {
        merchantName: testMerchantName,
        productTitle: testProduct.title,
        productId: testProduct.id,
        oldPrice,
        newPrice,
        dropAmount,
        dropPercent,
        competitorName,
        recommendedPrice: recommendedWinPrice,
        profitMarginPercent,
        currency,
        includeRepriceUrl: activeTemplateForPreview.includeDirectRepriceLink,
        customRepriceUrl: `https://merchant-radar.eg/reprice?prod=${testProduct.id}&price=${recommendedWinPrice}&ref=wa_radar`
      })
    : '';

  // Actions
  const handleStartCreateNew = () => {
    const newTpl: WhatsAppAlertTemplate = {
      id: `tpl-custom-${Date.now()}`,
      title: 'قالب تنبيه مخصص جديد',
      description: 'قالب رسائل واتساب مخصص للتجار لمتابعة تغيرات الأسعار والمخزون.',
      category: 'custom',
      triggerEventLabel: 'تنبيه مخصص للمسوق',
      includeDirectRepriceLink: true,
      directLinkDomainPlaceholder: 'https://merchant-radar.eg/reprice',
      sampleMerchantPhone: '+201000000000',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateBody: `📢 *إشعار تسعير خاص من رادار التاجر الذكي* 📢

مرحباً عزيزي *{merchant_name}*،
نود إبلاغك بتحديث هام بخصوص منتجك:

📦 *المنتج:* {product_name}
💰 *سعرك الحالي:* {old_price} {currency}
🎯 *السعر الموصى به:* {recommended_price} {currency}

🔗 *رابط مراجعة وتطبيق السعر فوراً في التطبيق:*
{reprice_direct_url}

_رادار التاجر الذكي - السوق المصري_`
    };

    setEditingTemplate(newTpl);
    setIsEditing(true);
  };

  const handleStartEdit = (tpl: WhatsAppAlertTemplate) => {
    setEditingTemplate({ ...tpl });
    setIsEditing(true);
  };

  const handleDuplicateTemplate = (tpl: WhatsAppAlertTemplate) => {
    const duplicated: WhatsAppAlertTemplate = {
      ...tpl,
      id: `tpl-copy-${Date.now()}`,
      title: `${tpl.title} (نسخة مخصصة)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...templates, duplicated];
    saveTemplatesToStorage(updated);
    setSelectedTemplateId(duplicated.id);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleDeleteTemplate = (tplId: string) => {
    if (templates.length <= 1) return;
    const updated = templates.filter(t => t.id !== tplId);
    saveTemplatesToStorage(updated);
    if (selectedTemplateId === tplId) {
      setSelectedTemplateId(updated[0].id);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('هل تريد استعادة جميع قوالب الواتساب الافتراضية؟ سيتم مسح أي تعديلات غير محفوظة.')) {
      saveTemplatesToStorage(DEFAULT_WHATSAPP_ALERT_TEMPLATES);
      setSelectedTemplateId(DEFAULT_WHATSAPP_ALERT_TEMPLATES[0].id);
      setIsEditing(false);
      setEditingTemplate(null);
    }
  };

  const handleSaveEditing = () => {
    if (!editingTemplate) return;
    const isNew = !templates.some(t => t.id === editingTemplate.id);
    let updated: WhatsAppAlertTemplate[];
    if (isNew) {
      updated = [...templates, { ...editingTemplate, updatedAt: new Date().toISOString() }];
    } else {
      updated = templates.map(t => t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString() } : t);
    }
    saveTemplatesToStorage(updated);
    setSelectedTemplateId(editingTemplate.id);
    setIsEditing(false);
    setEditingTemplate(null);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleInsertVariable = (variableKey: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      templateBody: editingTemplate.templateBody + ` ${variableKey} `
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(livePreviewText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(livePreviewText);
    const cleanPhone = testPhoneNumber.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    safeOpenUrl(url);
  };

  const getCategoryBadge = (category: WhatsAppTemplateCategory) => {
    switch (category) {
      case 'price_drop':
        return { label: 'هبوط سعر وباي بوكس', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'demand_surge':
        return { label: 'ارتفاع طلب ومخزون', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'competitor_stockout':
        return { label: 'نفاد منافس وفرصة ربح', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'bulk_reprice':
        return { label: 'اعتماد تسعير مجمع', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'profit_margin_review':
        return { label: 'مراجعة عمولات المنصات', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'قالب حر مخصص', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم نسخ نص الرسالة مع المتغيرات إلى الحافظة بنجاح!</span>
        </div>
      )}

      {saveSuccessToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حفظ قالب تنبيه الواتساب بنجاح!</span>
        </div>
      )}

      {/* Top Banner & Introduction */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black font-['Alexandria'] flex items-center gap-2">
                  <span>تخصيص قوالب تنبيهات ورسائل الواتساب للتجار</span>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-400/20 text-emerald-300 rounded-md border border-emerald-400/30">
                    WhatsApp Templates Builder
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/80">
                  صمم رسائل آلية احترافية تُرسل للتجار على واتساب عند هبوط الأسعار أو تغير الطلب، مع روابط ذكية للتعديل الفوري
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleStartCreateNew}
              className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء قالب جديد</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="إعادة تعيين القوالب إلى الافتراضية"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">استعادة الافتراضي</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>متغيرات ديناميكية تلقائية (اسم التاجر، السعر، الهبوط)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>روابط مباشرة لصفحات تعديل السعر داخل التطبيق</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>معاينة حية ومحاكاة فورية لتطبيق واتساب الحقيقي</span>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'جميع القوالب' },
          { id: 'price_drop', label: '📉 هبوط السعر والباي بوكس' },
          { id: 'demand_surge', label: '🔥 طلب موسمي ومخزون' },
          { id: 'competitor_stockout', label: '🏆 نفاد منافس ورفع سعر' },
          { id: 'bulk_reprice', label: '📋 اعتماد تسعير مجمع' },
          { id: 'profit_margin_review', label: '📊 مراجعة عمولات المنصات' },
          { id: 'custom', label: '✏️ قوالب مخصصة' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Template Cards & Live Simulator / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Template Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>مكتبة القوالب المتاحة ({filteredTemplates.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">اختر قالباً للمعاينة أو التعديل</span>
          </div>

          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-0.5">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              const catBadge = getCategoryBadge(tpl.category);

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    if (isEditing) {
                      setIsEditing(false);
                      setEditingTemplate(null);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-right space-y-2.5 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>
                        {tpl.isDefault && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            قالب معتمد
                          </span>
                        )}
                        {tpl.includeDirectRepriceLink && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>رابط تعديل مباشر</span>
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-black text-slate-900 leading-snug">
                        {tpl.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartEdit(tpl)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="تعديل القالب"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicateTemplate(tpl)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="نسخ كقالب جديد"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!tpl.isDefault && (
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="حذف القالب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>الحدث: <strong className="text-slate-700">{tpl.triggerEventLabel}</strong></span>
                    <span>آخر تحديث: {new Date(tpl.updatedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live WhatsApp Simulator & Customizer Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Test Parameters Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>بيانات المعاينة والاختبار المباشر:</span>
              </span>
              <span className="text-[11px] text-slate-500">
                تُستبدل المتغيرات ({'{...}'}) ببيانات هذا المنتج فوراً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">المنتج التجريبي:</label>
                <select
                  value={testProduct.id}
                  onChange={(e) => {
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setTestProduct(p);
                  }}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title.slice(0, 45)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم التاجر الشريك:</label>
                <input
                  type="text"
                  value={testMerchantName}
                  onChange={(e) => setTestMerchantName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px] font-bold text-slate-600 shrink-0">رقم هاتف الواتساب للتجربة:</label>
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="+201012345678"
                className="w-48 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Editor Mode vs Preview Mode */}
          {isEditing && editingTemplate ? (
            /* Template Editor Box */
            <div className="bg-white rounded-3xl border border-indigo-300 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">محرر قالب الواتساب المخصص</h4>
                    <p className="text-[10px] text-slate-500">عدل النص، المتغيرات، وروابط التعديل المباشر</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingTemplate(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEditing}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">عنوان القالب:</label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">فئة التنبيه:</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="price_drop">📉 هبوط سعر وباي بوكس</option>
                    <option value="demand_surge">🔥 ارتفاع طلب موسمي ومخزون</option>
                    <option value="competitor_stockout">🏆 نفاد منافس ورفع سعر</option>
                    <option value="bulk_reprice">📋 اعتماد تسعير مجمع</option>
                    <option value="profit_margin_review">📊 مراجعة عمولات المنصات</option>
                    <option value="custom">✏️ مخصص</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">وصف مختصر للقالب:</label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-normal focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Direct Link Option Toggle */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-indigo-600" />
                  <div>
                    <strong className="text-xs font-bold text-indigo-950 block">
                      تضمين رابط مباشر لصفحة تعديل المنتج في التطبيق ({'{reprice_direct_url}'})
                    </strong>
                    <span className="text-[10px] text-indigo-700">
                      يُمكّن التاجر من الضغط على الرابط في رسالة الواتساب لفتح شاشة تعديل السعر فوراً
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={editingTemplate.includeDirectRepriceLink}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, includeDirectRepriceLink: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Variable Chips Inserter Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    إدراج المتغيرات التلقائية بنقرة زر:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    انقر على أي متغير لإضافته في نص الرسالة
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {WHATSAPP_TEMPLATE_VARIABLES.map(v => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => handleInsertVariable(v.key)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title={`${v.label} - مثال: ${v.exampleValue}`}
                    >
                      + {v.label} <code className="text-emerald-700 font-mono">{v.key}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  نص رسالة الواتساب (يدعم تنسيق الواتساب: *عريض*، _مائل_):
                </label>
                <textarea
                  rows={11}
                  value={editingTemplate.templateBody}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, templateBody: e.target.value })}
                  dir="rtl"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Live WhatsApp Chat Bubble Simulator */
            <div className="bg-[#0b141a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* WhatsApp App Bar */}
              <div className="bg-[#202c33] px-4 py-3 border-b border-slate-700 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">
                      رادار التاجر الذكي (WhatsApp Business Bot)
                    </h5>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>متصل الآن • إشعار آلي فوري</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(selectedTemplate)}
                    className="px-2.5 py-1 rounded-lg bg-[#2a3942] hover:bg-[#32434d] text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>تعديل هذا القالب</span>
                  </button>
                </div>
              </div>

              {/* Chat Canvas (WhatsApp Background with Doodle pattern aesthetic) */}
              <div className="p-4 sm:p-6 bg-[#0b141a] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] min-h-[380px] flex flex-col justify-end space-y-3">
                
                {/* Date Chip */}
                <div className="text-center">
                  <span className="px-3 py-1 rounded-lg bg-[#182229] text-[10px] text-slate-400 font-medium shadow-xs">
                    اليوم • {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* WhatsApp Message Bubble */}
                <div className="max-w-md ml-auto bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs p-4 shadow-lg space-y-3 text-right border border-[#02735e]">
                  
                  {/* Formatted Text View */}
                  <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans select-text">
                    {livePreviewText}
                  </div>

                  {/* Direct Action Box Inside WhatsApp */}
                  {selectedTemplate?.includeDirectRepriceLink && (
                    <div className="bg-[#025142] p-3 rounded-xl border border-[#047864] space-y-2 mt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
                          <Zap className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
                          <span>تعديل مباشر في تطبيق رادار التاجر</span>
                        </div>
                        <span className="text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-300 font-mono">
                          1-Click Reprice
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-300 leading-tight">
                        الضغط على الزر أدناه يفتح نافذة التحديث السعري المباشر وتحديث المنصات المتصلة تلقائياً.
                      </p>

                      <button
                        onClick={() => {
                          if (onOpenRepriceModal) {
                            onOpenRepriceModal(testProduct.id);
                          }
                          if (onSelectProduct) {
                            onSelectProduct(testProduct);
                          }
                        }}
                        className="w-full h-8 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                        <span>فتح صفحة تعديل السعر للمنتج الآن ({recommendedWinPrice.toLocaleString()} {currency})</span>
                      </button>
                    </div>
                  )}

                  {/* Message Time and Blue Double Check */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#8696a0] pt-1">
                    <span>{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[#53bdeb] font-bold tracking-tighter">✓✓</span>
                  </div>

                </div>

              </div>

              {/* Action Buttons Bar at bottom of simulator */}
              <div className="bg-[#202c33] p-3 border-t border-slate-700 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMessage}
                    className="h-8 px-3 rounded-lg bg-[#2a3942] hover:bg-[#32434d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نسخ النص للحافظة</span>
                  </button>

                  <button
                    onClick={handleOpenWhatsAppWeb}
                    className="h-8 px-3 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="فتح محادثة واتساب حقيقية وإرسال التنبيه"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    <span>إرسال تجريبي عبر واتساب</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-400">
                  إرسال إلى: <strong className="font-mono text-emerald-400">{testPhoneNumber}</strong>
                </span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
