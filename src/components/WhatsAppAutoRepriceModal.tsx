import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  Settings, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  History, 
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProductData, MerchantOffer, ProductPricingPlan } from '../types';
import {
  WhatsAppAlertConfig,
  WhatsAppRepriceAlertRecord,
  getWhatsAppAlertConfig,
  saveWhatsAppAlertConfig,
  getWhatsAppRepriceAlertLogs,
  saveWhatsAppRepriceAlertLog,
  calculateSafeRepriceTarget,
  generateWhatsAppPriceDropMessage,
  openWhatsAppChat,
  formatWhatsAppPhoneNumber
} from '../services/whatsappRepriceAlertService';

interface WhatsAppAutoRepriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductData | null;
  pricingPlan?: ProductPricingPlan | null;
  competitorOffer?: MerchantOffer | null;
  alertRecord?: WhatsAppRepriceAlertRecord | null;
  onApplyReprice?: (productId: string, newPrice: number, competitorName?: string, reasonLabel?: string) => void;
}

export const WhatsAppAutoRepriceModal: React.FC<WhatsAppAutoRepriceModalProps> = ({
  isOpen,
  onClose,
  product,
  pricingPlan,
  competitorOffer,
  alertRecord,
  onApplyReprice
}) => {
  const [activeTab, setActiveTab] = useState<'alert' | 'settings' | 'history'>('alert');
  const [config, setConfig] = useState<WhatsAppAlertConfig>(() => getWhatsAppAlertConfig());
  const [logs, setLogs] = useState<WhatsAppRepriceAlertRecord[]>(() => getWhatsAppRepriceAlertLogs());
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRepricedSuccess, setIsRepricedSuccess] = useState<boolean>(false);
  const [testSimulated, setTestSimulated] = useState<boolean>(false);

  // Active or Fallback Mock Data for previewing
  const activeProduct: ProductData = product || {
    id: 'prod-fallback-1',
    title: 'سماعة بلوتوث لاسلكية عازلة للضوضاء برو',
    sku: 'SKU-EG-AUDIO-99',
    suggestedRetailPrice: 1250,
    currentLowestPrice: 1050,
    currency: 'ج.م',
    category: 'إلكترونيات',
    barcode: '6221234567890',
  } as ProductData;

  const activeCompetitor: MerchantOffer = competitorOffer || ({
    merchantName: 'متجر الصفوة للتجارة',
    platformName: 'أمازون مصر (Amazon Egypt)',
    price: 890,
    inStock: true,
    isWinningBuyBox: true,
  } as unknown as MerchantOffer);

  const repriceEvaluation = calculateSafeRepriceTarget(activeProduct, activeCompetitor.price, pricingPlan, config);
  const breachAmount = Math.max(0, repriceEvaluation.effectiveFloor - activeCompetitor.price);
  const isBreached = breachAmount > 0;

  const currentMessageText = generateWhatsAppPriceDropMessage({
    product: activeProduct,
    competitorOffer: activeCompetitor,
    recommendedPrice: repriceEvaluation.recommendedPrice,
    effectiveFloor: repriceEvaluation.effectiveFloor,
    breachAmount,
    currency: activeProduct.currency || 'ج.م',
  });

  useEffect(() => {
    if (isOpen) {
      setConfig(getWhatsAppAlertConfig());
      setLogs(getWhatsAppRepriceAlertLogs());
      setIsRepricedSuccess(false);
      setIsCopied(false);
      setTestSimulated(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = (newConfig: WhatsAppAlertConfig) => {
    setConfig(newConfig);
    saveWhatsAppAlertConfig(newConfig);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessageText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    openWhatsAppChat(config.merchantPhoneNumber, currentMessageText);
    const updatedRecord: WhatsAppRepriceAlertRecord = alertRecord || {
      id: `alert-wa-${Date.now()}`,
      productId: activeProduct.id,
      productTitle: activeProduct.title,
      sku: activeProduct.sku || '',
      platformName: activeCompetitor.platformName,
      competitorName: activeCompetitor.merchantName,
      oldCompetitorPrice: activeProduct.currentLowestPrice,
      newCompetitorPrice: activeCompetitor.price,
      currentMerchantPrice: activeProduct.suggestedRetailPrice,
      floorPrice: repriceEvaluation.effectiveFloor,
      recommendedPrice: repriceEvaluation.recommendedPrice,
      status: 'alerted',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      whatsappSent: true,
      whatsappMessageText: currentMessageText,
      currency: activeProduct.currency || 'ج.م',
      breachAmountEGP: breachAmount,
    };
    updatedRecord.whatsappSent = true;
    saveWhatsAppRepriceAlertLog(updatedRecord);
    setLogs(getWhatsAppRepriceAlertLogs());
  };

  const handleExecute1ClickReprice = () => {
    if (onApplyReprice) {
      onApplyReprice(
        activeProduct.id,
        repriceEvaluation.recommendedPrice,
        activeCompetitor.merchantName,
        `تعديل تلقائي فوري عبر رادار واتساب: ${repriceEvaluation.strategyLabel}`
      );
    }

    const updatedRecord: WhatsAppRepriceAlertRecord = alertRecord || {
      id: `alert-wa-${Date.now()}`,
      productId: activeProduct.id,
      productTitle: activeProduct.title,
      sku: activeProduct.sku || '',
      platformName: activeCompetitor.platformName,
      competitorName: activeCompetitor.merchantName,
      oldCompetitorPrice: activeProduct.currentLowestPrice,
      newCompetitorPrice: activeCompetitor.price,
      currentMerchantPrice: activeProduct.suggestedRetailPrice,
      floorPrice: repriceEvaluation.effectiveFloor,
      recommendedPrice: repriceEvaluation.recommendedPrice,
      status: 'repriced',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      whatsappSent: false,
      whatsappMessageText: currentMessageText,
      currency: activeProduct.currency || 'ج.م',
      breachAmountEGP: breachAmount,
    };
    updatedRecord.status = 'repriced';
    saveWhatsAppRepriceAlertLog(updatedRecord);
    setLogs(getWhatsAppRepriceAlertLogs());

    setIsRepricedSuccess(true);
    setTimeout(() => {
      setIsRepricedSuccess(false);
      onClose();
    }, 1800);
  };

  const handleSimulateDrop = () => {
    setTestSimulated(true);
    handleSendWhatsApp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-600/50 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
              <MessageCircle className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-['Alexandria']">نظام تنبيهات واتساب والتسعير التلقائي</h3>
                <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  فوري ومحمي ⚡
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                إخطار فوري عند انخفاض سعر المنافس دون الحد الأدنى مع تعديل السعر بنقرة واحدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800/60 text-emerald-100 hover:text-white hover:bg-emerald-800 flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('alert')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'alert'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>التنبيه والإجراء الفوري</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات رقم الواتساب والقواعد</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل التنبيهات ({logs.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'alert' && (
            <div className="space-y-5">
              
              {/* Product and Competitor Status Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">المنتج الخاضع للرادار</span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">{activeProduct.title}</h4>
                    <span className="text-xs text-slate-500 font-mono">SKU: {activeProduct.sku || 'N/A'}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black">
                    <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                    انخفاض في سعر المنافس
                  </span>
                </div>

                {/* Price Matrix Comparison */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/80">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-bold">سعر المنافس الجديد</span>
                    <span className="text-base font-black text-rose-600 mt-0.5 block">
                      {activeCompetitor.price.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{activeCompetitor.merchantName}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block font-bold">حد الأمان لمتجرك (Floor)</span>
                    <span className="text-base font-black text-indigo-700 mt-0.5 block">
                      {repriceEvaluation.effectiveFloor.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-[10px] text-indigo-500 block">أدنى سعر مسموح</span>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                    <span className="text-[11px] text-emerald-800 block font-bold">السعر المقترح الآمن</span>
                    <span className="text-base font-black text-emerald-700 mt-0.5 block">
                      {repriceEvaluation.recommendedPrice.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-[10px] text-emerald-600 block">هامش ربح {repriceEvaluation.profitMarginPercent}%</span>
                  </div>
                </div>

                {/* Floor Alert Warning / Guardrail Status */}
                <div className={`p-3 rounded-xl flex items-center gap-3 border ${
                  isBreached 
                    ? 'bg-rose-50 border-rose-200 text-rose-800' 
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs">
                    <strong className="block font-black">
                      {isBreached ? 'المنافس كسر الحد الأدنى المسموح به!' : 'سعر المنافس يقترب بشكل حرج من الحد الأدنى!'}
                    </strong>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {repriceEvaluation.strategyLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExecute1ClickReprice}
                  disabled={isRepricedSuccess}
                  className={`w-full py-4 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isRepricedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-xl active:scale-98'
                  }`}
                >
                  {isRepricedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-200 animate-bounce" />
                      <span>تم تطبيق التعديل التلقائي بنجاح! 🚀</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span>تطبيق التعديل التلقائي الآن ({repriceEvaluation.recommendedPrice} ج.م)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-4 px-5 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>إرسال التنبيه عبر واتساب 📱</span>
                </button>
              </div>

              {/* Live Preview of WhatsApp Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    معاينة رسالة الواتساب الفورية المجهزة للتاجر:
                  </span>
                  <button
                    onClick={handleCopyMessage}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
                  </button>
                </div>
                <div className="bg-emerald-950/5 border border-emerald-200/80 rounded-2xl p-4 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono">
                  {currentMessageText}
                </div>
              </div>

              {/* Quick simulation tester */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div className="text-xs text-indigo-900">
                    <span className="font-black block">محاكاة واختبار النظام الفوري:</span>
                    <span className="text-[11px] text-indigo-700">اضغط لتجربة إرسال تنبيه الواتساب إلى رقمك المعتمد ({config.merchantPhoneNumber})</span>
                  </div>
                </div>
                <button
                  onClick={handleSimulateDrop}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <span>اختبار التنبيه</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              
              {/* WhatsApp Phone Number Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>رقم هاتف الواتساب المعتمد لتلقي التنبيهات (WhatsApp Phone):</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={config.merchantPhoneNumber}
                    onChange={(e) => handleSaveSettings({ ...config, merchantPhoneNumber: e.target.value })}
                    placeholder="مثال: 201012345678"
                    dir="ltr"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  أدخل الرقم مسبوقاً بكود الدولة (مثال لمصر: <strong>201012345678</strong> أو <strong>01012345678</strong> وسيتم تحويله تلقائياً).
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">تفعيل إشعارات الواتساب التلقائية</span>
                    <span className="text-[11px] text-slate-500">إرسال إشعار فوري عند رصد انخفاض في سعر أي منافس</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.isWhatsAppAlertsEnabled}
                    onChange={(e) => handleSaveSettings({ ...config, isWhatsAppAlertsEnabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>تفعيل التعديل التلقائي المستمر (Continuous Auto-Repricing)</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">آلي بالكامل</span>
                    </span>
                    <span className="text-[11px] text-slate-500">تطبيق السعر الآمن الجديد فوراً على المنصات دون انتظار تأكيد يدوي</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoRepriceOnAlert}
                    onChange={(e) => handleSaveSettings({ ...config, autoRepriceOnAlert: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">فتح نافذة الواتساب تلقائياً عند التنبيه</span>
                    <span className="text-[11px] text-slate-500">فتح تطبيق الواتساب أو واتساب ويب فور توليد التنبيه في الخلفية</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoOpenWhatsAppTab}
                    onChange={(e) => handleSaveSettings({ ...config, autoOpenWhatsAppTab: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">التنبيه عند كسر الحد الأدنى فقط (Floor Breach Only)</span>
                    <span className="text-[11px] text-slate-500">تجاهل التنبيهات إذا كان سعر المنافس لا يزال آمناً وأعلى من حد الأمان</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.notifyOnCriticalBreachOnly}
                    onChange={(e) => handleSaveSettings({ ...config, notifyOnCriticalBreachOnly: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Reprice Strategy Options */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-xs font-black text-slate-800 block">
                  استراتيجية التعديل التلقائي الافتراضية (Auto-Reprice Strategy):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ ...config, repriceStrategy: 'undercut_competitor_safe' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      config.repriceStrategy === 'undercut_competitor_safe'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs block">تخفيض آمن (-{config.undercutMarginEGP} ج.م)</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">خصم طفيف لاقتناص BuyBox دون كسر صمام الأمان</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ ...config, repriceStrategy: 'match_floor' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      config.repriceStrategy === 'match_floor'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs block">التثبيت عند حد الأمان</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">الالتزام بالحد الأدنى المحمي لضمان الربحية بنسبة 100%</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSettings({ ...config, repriceStrategy: 'match_competitor_if_safe' })}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      config.repriceStrategy === 'match_competitor_if_safe'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-black'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs block">مطابقة المنافس</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">مطابقة نفس السعر إن كان آمناً فقط</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-500">سجل عمليات التنبيه والتعديل التلقائي الأخيرة</span>
                {logs.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('merchant_radar_whatsapp_reprice_logs_v1');
                      setLogs([]);
                    }}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    مسح السجل
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">لا توجد تنبيهات مسجلة بعد</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">سيتم تسجيل أي هبوط في أسعار المنافسين هنا فور حدوثه</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{log.productTitle}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'repriced'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {log.status === 'repriced' ? 'تم التعديل آلياً ⚡' : 'تم الإشعار'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {log.competitorName} ({log.platformName}): خفّض إلى {log.newCompetitorPrice} ج.م | الحد الأدنى: {log.floorPrice} ج.م
                        </p>
                      </div>

                      <div className="text-left flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono block">{log.timestamp}</span>
                        <span className="text-xs font-black text-emerald-700 block mt-0.5">
                          السعر المعتمد: {log.recommendedPrice} ج.م
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام حماية الهامش الربحي وصمام الأمان مفعل 100%</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
