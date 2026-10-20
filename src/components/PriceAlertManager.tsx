import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Smartphone, 
  Mail, 
  Zap, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Play, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  ShieldCheck,
  Volume2,
  RefreshCw,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  FileText,
  Package,
  Tag,
  Flame,
  Filter,
  CheckCircle,
  Eye,
  Check,
  PhoneCall,
  UserCheck,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, PriceAlert, AlertNotificationLog, ConnectedMerchantPlatform, MerchantOffer } from '../types';
import { WhatsAppTemplatesCustomizer } from './WhatsAppTemplatesCustomizer';
import { DailyPriceEmailReportModal } from './DailyPriceEmailReportModal';
import { INITIAL_CONNECTED_PLATFORMS } from '../data/sampleProducts';
import { useAudioNotifications } from '../context/AudioNotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  WhatsAppRecipient,
  WhatsAppServiceConfig,
  getWhatsAppServiceConfig,
  saveWhatsAppServiceConfig,
  addWhatsAppRecipient,
  removeWhatsAppRecipient,
  toggleWhatsAppRecipient,
  sendTestWhatsAppAlert,
  normalizeWhatsAppNumber,
  generateCompetitorPriceDropMessage,
  sendWhatsAppMessageToPhone,
  dispatchPriceDropAlertToWhatsApp
} from '../services/whatsappService';

interface PriceAlertManagerProps {
  alerts: PriceAlert[];
  notificationLogs: AlertNotificationLog[];
  products: ProductData[];
  activeProduct: ProductData;
  onAddAlert: (newAlert: PriceAlert) => void;
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onTestTriggerAlert: (alertId: string) => void;
  onMarkNotificationRead: (logId: string) => void;
  onSelectProduct: (product: ProductData) => void;
  onOpenRepriceModal: () => void;
  currency: string;
  connectedPlatforms?: ConnectedMerchantPlatform[];
  merchantStoreName?: string;
  managerEmail?: string;
  onShowToast?: (msg: string) => void;
}

export const PriceAlertManager: React.FC<PriceAlertManagerProps> = ({
  alerts,
  notificationLogs,
  products,
  activeProduct,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  onTestTriggerAlert,
  onMarkNotificationRead,
  onSelectProduct,
  onOpenRepriceModal,
  currency,
  connectedPlatforms = INITIAL_CONNECTED_PLATFORMS,
  merchantStoreName = 'متجر التاجر المعتمد - مصر',
  managerEmail = 'jassmeinnour@gmail.com',
  onShowToast,
}) => {
  const { setIsThemeModalOpen } = useTheme();
  const { 
    settings: audioSettings, 
    setActiveGlobalSettingsTab,
    playPriceAlertSound,
    playCompetitorStatusSound 
  } = useAudioNotifications();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'alerts_list' | 'create_new' | 'whatsapp_templates' | 'whatsapp_simulator' | 'whatsapp_summary_schedule' | 'whatsapp_api_settings'>('alerts_list');

  // WhatsApp Integration Service Config & Recipients State
  const [waConfig, setWaConfig] = useState<WhatsAppServiceConfig>(() => getWhatsAppServiceConfig());
  const [newRecipientLabel, setNewRecipientLabel] = useState<string>('');
  const [newRecipientPhone, setNewRecipientPhone] = useState<string>('');
  const [newRecipientRole, setNewRecipientRole] = useState<'admin' | 'pricing_manager' | 'inventory_specialist'>('pricing_manager');
  const [testingPhoneId, setTestingPhoneId] = useState<string | null>(null);
  const [waSaveToast, setWaSaveToast] = useState<boolean>(false);

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientPhone.trim()) {
      if (onShowToast) onShowToast('يرجى إدخال رقم الهاتف أولاً');
      return;
    }
    const added = addWhatsAppRecipient(newRecipientLabel || 'مسؤول المتابعة', newRecipientPhone, newRecipientRole);
    setWaConfig(getWhatsAppServiceConfig());
    setNewRecipientLabel('');
    setNewRecipientPhone('');
    if (onShowToast) {
      onShowToast(`تمت إضافة الرقم (${added.phone}) بنجاح إلى قائمة تنبيهات واتساب! 📱`);
    }
  };

  const handleRemoveRecipient = (id: string) => {
    removeWhatsAppRecipient(id);
    setWaConfig(getWhatsAppServiceConfig());
    if (onShowToast) onShowToast('تم حذف الرقم من قائمة إشعارات واتساب');
  };

  const handleToggleRecipient = (id: string) => {
    toggleWhatsAppRecipient(id);
    setWaConfig(getWhatsAppServiceConfig());
  };

  const handleTestRecipient = async (recipient: WhatsAppRecipient) => {
    setTestingPhoneId(recipient.id);
    try {
      await sendTestWhatsAppAlert(recipient.phone, recipient.label);
      if (onShowToast) {
        onShowToast(`تم إرسال رسالة اختبار بنجاح إلى واتساب (${recipient.phone}) 🚀`);
      }
    } catch {
      if (onShowToast) onShowToast('تعذر إرسال رسالة الاختبار');
    } finally {
      setTestingPhoneId(null);
    }
  };

  const handleUpdateWaConfig = (updates: Partial<WhatsAppServiceConfig>) => {
    const updated = { ...waConfig, ...updates };
    setWaConfig(updated);
    saveWhatsAppServiceConfig(updated);
    setWaSaveToast(true);
    setTimeout(() => setWaSaveToast(false), 2000);
    if (onShowToast) onShowToast('تم حفظ إعدادات واتساب بنجاح ✅');
  };

  // Daily WhatsApp summary schedule settings state
  const [summaryScheduleSettings, setSummaryScheduleSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('merchant_radar_whatsapp_summary_schedule');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      mode: 'daily_summary',
      dispatchTime: '09:00',
      frequency: 'daily',
      includePriceDrops: true,
      includeStockAlerts: true,
      includeSpecialOffers: true,
      whatsappNumber: '01012345678',
      isSavedToast: false
    };
  });

  // Daily Email Digest modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Notification logs category filter state
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'price' | 'stock' | 'offer'>('all');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(activeProduct?.id || '');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'in_app' | 'email'>('whatsapp');
  const [triggerCondition, setTriggerCondition] = useState<'drop_below' | 'percentage_drop' | 'buybox_change'>('drop_below');
  const [targetPrice, setTargetPrice] = useState<number>(Math.round((activeProduct?.currentLowestPrice || 2500) * 0.95));
  const [thresholdPercentage, setThresholdPercentage] = useState<number>(5);
  const [recipientContact, setRecipientContact] = useState<string>('01012345678');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // WhatsApp Simulation Preview message state
  const [simulatedMsg, setSimulatedMsg] = useState<{
    phone: string;
    productTitle: string;
    oldPrice: number;
    newPrice: number;
    dropAmount: number;
    recommendedWinPrice: number;
    competitor: string;
    time: string;
  }>({
    phone: '01012345678',
    productTitle: activeProduct?.title || 'منتج إلكتروني',
    oldPrice: (activeProduct?.currentLowestPrice || 2500) + 150,
    newPrice: activeProduct?.currentLowestPrice || 2500,
    dropAmount: 150,
    recommendedWinPrice: Math.round((activeProduct?.currentLowestPrice || 2500) * 0.95),
    competitor: 'المتجر المنافس (أمازون مصر)',
    time: 'الآن'
  });

  const selectedProduct = products.find(p => p.id === selectedProductId) || activeProduct;

  // Helper to determine alert classification info for badges, icons, and contrast styles
  const getLogClassification = (log: AlertNotificationLog) => {
    const type = log.alertType || (
      log.message.includes('مخزون') ? 'stock_alert' :
      log.message.includes('عرض') || log.message.includes('Deal') || log.message.includes('كوبون') ? 'special_offer' :
      'price_drop'
    );

    switch (type) {
      case 'stock_alert':
        return {
          type: 'stock',
          label: 'تنبيه مخزون',
          icon: Package,
          badgeBg: 'bg-sky-100 text-sky-950 border border-sky-300 font-bold',
          cardBg: 'bg-sky-50/70 border-sky-200 hover:border-sky-400',
          iconColor: 'text-sky-800 bg-sky-200/90',
          dotColor: 'bg-sky-500'
        };
      case 'special_offer':
        return {
          type: 'offer',
          label: 'تنبيه عرض ترويجي',
          icon: Tag,
          badgeBg: 'bg-purple-100 text-purple-950 border border-purple-300 font-bold',
          cardBg: 'bg-purple-50/70 border-purple-200 hover:border-purple-400',
          iconColor: 'text-purple-800 bg-purple-200/90',
          dotColor: 'bg-purple-500'
        };
      case 'price_drop':
      default:
        return {
          type: 'price',
          label: 'تنبيه سعر',
          icon: TrendingDown,
          badgeBg: 'bg-rose-100 text-rose-950 border border-rose-300 font-bold',
          cardBg: 'bg-rose-50/60 border-rose-200 hover:border-rose-400',
          iconColor: 'text-rose-800 bg-rose-200/90',
          dotColor: 'bg-rose-500'
        };
    }
  };

  const filteredLogs = notificationLogs.filter(log => {
    if (logTypeFilter === 'all') return true;
    const classification = getLogClassification(log);
    return classification.type === logTypeFilter;
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      productImage: selectedProduct.imageUrl,
      channel: selectedChannel,
      triggerCondition,
      targetPrice: triggerCondition === 'drop_below' ? targetPrice : undefined,
      thresholdPercentage: triggerCondition === 'percentage_drop' ? thresholdPercentage : undefined,
      recipientContact: selectedChannel === 'in_app' ? 'إشعارات التطبيق الفورية' : recipientContact,
      isActive: true,
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };

    onAddAlert(newAlert);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
    setActiveSubTab('alerts_list');

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  const handleRunSimulator = (product: ProductData, phone: string = '01012345678') => {
    const oldP = product.currentLowestPrice + 120;
    const newP = product.currentLowestPrice;
    setSimulatedMsg({
      phone,
      productTitle: product.title,
      oldPrice: oldP,
      newPrice: newP,
      dropAmount: 120,
      recommendedWinPrice: Math.round(newP * 0.95),
      competitor: product.merchantOffers[0]?.merchantName || 'أمازون مصر',
      time: 'الآن (مباشر)'
    });
    setActiveSubTab('whatsapp_simulator');
  };

  // Track which alert is currently dispatching WhatsApp message
  const [dispatchingAlertId, setDispatchingAlertId] = useState<string | null>(null);

  const handleExecuteWhatsAppAlertTrigger = async (alert: PriceAlert) => {
    setDispatchingAlertId(alert.id);
    // 1. Call standard test trigger (adds notification log, plays audio, triggers confetti)
    onTestTriggerAlert(alert.id);

    // 2. Dispatch real WhatsApp message via services/whatsappService.ts
    const targetPhone = alert.recipientContact || waConfig.recipients[0]?.phone || '201012345678';
    const prod = products.find(p => p.id === alert.productId) || activeProduct;
    const competitorPrice = alert.targetPrice ? Math.round(alert.targetPrice * 0.95) : Math.round(prod.currentLowestPrice * 0.9);
    const lowestOffer: MerchantOffer = prod.merchantOffers?.find(o => o.price === prod.currentLowestPrice) || ({
      id: `offer-${Date.now()}`,
      merchantName: 'متجر المنافس (أمازون مصر)',
      platformName: 'أمازون مصر',
      platform: 'amazon_eg',
      price: competitorPrice,
      inStock: true,
      isWinningBuyBox: true,
      storeType: 'online',
      currency: prod.currency || currency,
    } as unknown as MerchantOffer);

    const messageText = generateCompetitorPriceDropMessage({
      productTitle: alert.productTitle,
      sku: prod.sku,
      platformName: lowestOffer.platformName,
      competitorName: lowestOffer.merchantName,
      competitorNewPrice: competitorPrice,
      targetPrice: alert.targetPrice || prod.currentLowestPrice,
      currentMerchantPrice: prod.suggestedRetailPrice,
      currency: prod.currency || currency,
      productId: prod.id,
      recommendedPrice: Math.round(competitorPrice - 5),
    });

    try {
      await sendWhatsAppMessageToPhone(targetPhone, messageText, waConfig);
      if (onShowToast) {
        onShowToast(`تم إرسال إشعار واتساب الفوري بنجاح إلى (${targetPhone}) 📱⚡`);
      }
    } catch (err) {
      console.error('Failed to send WhatsApp message:', err);
    } finally {
      setDispatchingAlertId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 font-['Alexandria']">
                  رادار وتنبيهات هبوط الأسعار الذكية
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  واتساب • التطبيق • الإيميل
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                احصل على إشعار فوري على هاتفك لحظة قيام أي منافس بخفض سعره على أمازون أو نون للرد فوراً وحماية مبيعاتك
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('alerts_list')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'alerts_list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>قائمة التنبيهات ({alerts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('whatsapp_summary_schedule')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'whatsapp_summary_schedule'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>جدول ملخص واتساب اليومي ⏰</span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] rounded-full font-mono">تخصيص</span>
            </button>

            <button
              onClick={() => setActiveSubTab('whatsapp_templates')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'whatsapp_templates'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>قوالب تنبيهات الواتساب</span>
              <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[9px] rounded-full font-mono">واتساب</span>
            </button>

            {/* WhatsApp Integration & Recipient Phone Numbers Management */}
            <button
              onClick={() => setActiveSubTab('whatsapp_api_settings')}
              id="btn-whatsapp-api-settings-tab"
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'whatsapp_api_settings'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-emerald-100/80 text-emerald-950 hover:bg-emerald-200 border border-emerald-400'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>إعدادات وأرقام واتساب 📱</span>
              <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[9px] rounded-full font-mono">
                {waConfig.recipients.filter(r => r.isActive).length} أرقام
              </span>
            </button>

            {/* Daily Price Email Report Service (SendGrid / EmailJS) */}
            <button
              type="button"
              id="btn-open-email-digest-service"
              onClick={() => setIsEmailModalOpen(true)}
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs"
              title="خدمة تقارير البريد الإلكتروني لتحركات الأسعار اليومية عبر SendGrid و EmailJS"
            >
              <Mail className="w-4 h-4 text-blue-700" />
              <span>تقارير الإيميل اليومية (SendGrid/EmailJS) ✉️</span>
              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] rounded-full font-mono">تكامل API</span>
            </button>

            <button
              onClick={() => setActiveSubTab('create_new')}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'create_new'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>ضبط تنبيه جديد</span>
            </button>

            <button
              onClick={() => handleRunSimulator(activeProduct, recipientContact)}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'whatsapp_simulator'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>محاكي الرسائل</span>
            </button>

            {/* Custom Audio Notifications Configuration Button */}
            <button
              type="button"
              onClick={() => {
                setActiveGlobalSettingsTab('audio');
                setIsThemeModalOpen(true);
              }}
              id="btn-open-audio-settings-from-alerts"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs"
              title="تخصيص نغمات التنبيهات الصوتية لهبوط الأسعار وتغير المنافسين"
            >
              <Volume2 className="w-4 h-4 text-sky-700" />
              <span>نغمات الصوت 🔊</span>
              {audioSettings.isMasterEnabled ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              ) : (
                <span className="text-[10px] text-slate-500 font-normal">مكتوم</span>
              )}
            </button>
          </div>
        </div>

        {/* 3 Channels Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          
          <div 
            onClick={() => setActiveSubTab('whatsapp_templates')}
            className="bg-emerald-50/70 hover:bg-emerald-100/60 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-emerald-950 block flex items-center gap-1.5">
                <span>قوالب وتنبيهات الواتساب (WhatsApp)</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">تخصيص القوالب ⚙️</span>
              </strong>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                رسائل واتساب تلقائية وروابط تعديل مباشر بالمتغيرات اللحظية عند تغير أسعار المنافسين أو الطلب.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-indigo-950 block">إشعارات داخل التطبيق (In-App Push)</strong>
              <p className="text-[11px] text-indigo-800 mt-0.5 leading-snug">
                تنبيهات صوتية فورية وشارات حمراء مع سجل كامل للتغيرات وفرص اقتناص الـ Buy Box.
              </p>
            </div>
          </div>

          <div 
            onClick={() => setIsEmailModalOpen(true)}
            className="bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-300 rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-blue-950 block flex items-center gap-1.5">
                <span>تقارير البريد الإلكتروني (Email Digest)</span>
                <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">تكامل وإرسال ⚙️</span>
              </strong>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-snug">
                تقرير يومي مجمع بجميع تغيرات أسعار السوق المصري وأسعار الجملة لمنتجاتك متكامل مع SendGrid و EmailJS.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Sub Tab: WhatsApp Summary Schedule Settings */}
      {activeSubTab === 'whatsapp_summary_schedule' && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  إعدادات وتخصيص الجدول الزمني اليومي لملخص تنبيهات واتساب
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  استبدل الإشعارات الفورية لكل حالة بملخص يومي ذكي ومجمع يُرسل في موعد محدد عبر الواتساب
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('alerts_list')}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
            >
              العودة للتنبيهات
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Mode & Schedule configuration */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">نوع وتيرة الإرسال عبر الواتساب:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSummaryScheduleSettings(s => ({ ...s, mode: 'instant' }))}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      summaryScheduleSettings.mode === 'instant'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">إشعارات فورية لكل حالة</span>
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">إرسال رسالة واتساب فورية لكل تغير في الأسعار أو المنافسين</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSummaryScheduleSettings(s => ({ ...s, mode: 'daily_summary' }))}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      summaryScheduleSettings.mode === 'daily_summary'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs">ملخص يومي مجدول (موصى به)</span>
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">تجميع كافة التنبيهات وإرسالها في تقرير واتساب يومي واحد منظم</p>
                  </button>
                </div>
              </div>

              {summaryScheduleSettings.mode === 'daily_summary' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">وقت الإرسال اليومي المفضل:</label>
                      <select
                        value={summaryScheduleSettings.dispatchTime}
                        onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, dispatchTime: e.target.value }))}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-800"
                      >
                        <option value="08:00">08:00 صباحاً (بداية الدوام)</option>
                        <option value="09:00">09:00 صباحاً (موصى به)</option>
                        <option value="12:00">12:00 ظهراً (منتصف اليوم)</option>
                        <option value="18:00">06:00 مساءً (نهاية الوردية)</option>
                        <option value="21:00">09:00 مساءً (الملخص الختامي)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">تكرار الجدول الزمني:</label>
                      <select
                        value={summaryScheduleSettings.frequency}
                        onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, frequency: e.target.value }))}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-800"
                      >
                        <option value="daily">يومياً (طوال أيام الأسبوع)</option>
                        <option value="twice_daily">مرتين يومياً (صباحاً ومساءً)</option>
                        <option value="weekdays_only">أيام العمل فقط (أحد - خميس)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">محتويات الملخص المتضمنة:</label>
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={summaryScheduleSettings.includePriceDrops}
                          onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, includePriceDrops: e.target.checked }))}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>تنبيهات هبوط أسعار المنافسين على أمازون ونون</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={summaryScheduleSettings.includeStockAlerts}
                          onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, includeStockAlerts: e.target.checked }))}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>تنبيهات انخفاض ونفاد مخزون المنافسين (Buy Box)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={summaryScheduleSettings.includeSpecialOffers}
                          onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, includeSpecialOffers: e.target.checked }))}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>ملخص العروض الكبرى والكوبونات النشطة في السوق المصري</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">رقم الواتساب المستلم للملخص:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={summaryScheduleSettings.whatsappNumber}
                    onChange={(e) => setSummaryScheduleSettings(s => ({ ...s, whatsappNumber: e.target.value }))}
                    placeholder="01012345678"
                    className="flex-1 h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none font-mono text-slate-800"
                  />
                  <span className="px-3 h-10 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                    🇪🇬 مصر +20
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('merchant_radar_whatsapp_summary_schedule', JSON.stringify(summaryScheduleSettings));
                    setSummaryScheduleSettings(s => ({ ...s, isSavedToast: true }));
                    setTimeout(() => setSummaryScheduleSettings(s => ({ ...s, isSavedToast: false })), 3000);
                    if (onShowToast) onShowToast('✅ تم حفظ إعدادات الجدول الزمني لملخص واتساب بنجاح');
                  }}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وتطبيق الجدول الزمني</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const phone = summaryScheduleSettings.whatsappNumber || '01012345678';
                    const formattedPhone = phone.startsWith('+') ? phone.replace('+', '') : `2${phone}`;
                    const msg = encodeURIComponent(
                      `📊 *الملخص اليومي المجمع لتنبيهات رادار التاجر الذكي* 📊\n\n` +
                      `📅 *موعد الجدول:* يومياً الساعة ${summaryScheduleSettings.dispatchTime}\n` +
                      `🏬 *المتجر:* ${merchantStoreName}\n\n` +
                      `🔹 إجمالي التنبيهات المسجلة: ${alerts.length}\n` +
                      `🔹 المنتجات المراقبة: ${products.length} منتج\n` +
                      `🔹 الحالة: نشط وفي انتظار إرسال الملخص الآلي.\n\n` +
                      `_رادار التاجر الذكي - حماية وحرية تسعير السوق المصري_`
                    );
                    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
                  }}
                  className="px-4 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="تجربة إرسال نموذج الملخص الآن عبر الواتساب"
                >
                  <Send className="w-4 h-4 text-emerald-700" />
                  <span>تجربة إرسال الملخص الآن 📱</span>
                </button>
              </div>

              {summaryScheduleSettings.isSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم حفظ الجدول الزمني وتفعيل ملخص واتساب اليومي بنجاح!</span>
                </div>
              )}
            </div>

            {/* Right: Live Preview Box of the Daily Summary */}
            <div className="bg-slate-900 rounded-2xl p-4 text-slate-100 font-sans text-xs flex flex-col justify-between border border-slate-800 shadow-inner">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs">معاينة رسالة ملخص واتساب المجدول</span>
                      <span className="text-[10px] text-slate-400 font-mono">المرسل إلى: {summaryScheduleSettings.whatsappNumber}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono">
                    جدولي: {summaryScheduleSettings.dispatchTime}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-[11px] leading-relaxed font-mono select-all">
                  <p className="text-emerald-400 font-bold">📊 *الملخص اليومي المجمع لتنبيهات رادار التاجر الذكي*</p>
                  <p className="text-slate-300">مرحباً بك، إليك ملخص تحركات الأسعار والمخزون لمتجرك ({merchantStoreName}):</p>
                  
                  <div className="space-y-1.5 my-2 border-r-2 border-emerald-500 pr-2 text-slate-300">
                    {summaryScheduleSettings.includePriceDrops && (
                      <p>📉 تم رصد (3) تخفيضات أسعار للمنافسين على أمازون ونون اليوم.</p>
                    )}
                    {summaryScheduleSettings.includeStockAlerts && (
                      <p>📦 نفاد مخزون عند منافس رئيسي لمنتج: {activeProduct?.title.slice(0, 35)}...</p>
                    )}
                    {summaryScheduleSettings.includeSpecialOffers && (
                      <p>🔥 فرصة اقتناص Buy Box متاحة الآن لهامش ربح ممتاز ({currency} {Math.round(activeProduct?.currentLowestPrice * 0.95)}).</p>
                    )}
                  </div>

                  <p className="text-slate-400 text-[10px]">
                    ⏰ يتم إرسال هذا الملخص آلياً حسب الجدول ({summaryScheduleSettings.frequency === 'daily' ? 'يومياً' : 'مرتين يومياً'}) لتجنب الإزعاج الفوري.
                  </p>
                  <p className="text-emerald-400 underline cursor-pointer">
                    🔗 افتح رادار التاجر الذكي للمراجعة وتعديل الأسعار فوراً
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>وضع التشغيل: <strong className="text-emerald-400">{summaryScheduleSettings.mode === 'daily_summary' ? 'ملخص يومي مجدول ⏰' : 'إشعارات فورية ⚡'}</strong></span>
                <span className="text-emerald-400 font-bold">جاهز للإرسال الآلي</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: WhatsApp Alert Templates Customizer */}
      {activeSubTab === 'whatsapp_templates' && (
        <WhatsAppTemplatesCustomizer
          products={products}
          activeProduct={activeProduct}
          connectedPlatforms={connectedPlatforms}
          currency={currency}
          onOpenRepriceModal={(productId) => {
            if (productId) {
              const p = products.find(prod => prod.id === productId);
              if (p) onSelectProduct(p);
            }
            onOpenRepriceModal();
          }}
          onSelectProduct={onSelectProduct}
        />
      )}

      {/* Sub Tabs Content */}
      {activeSubTab === 'create_new' && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>إعداد وضبط تنبيه جديد لمنتج</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حدد المنتج، قناة الإشعار، وشرط السعر المستهدف لتلقي التنبيهات آلياً
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('alerts_list')}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
            >
              إلغاء والعودة للقائمة
            </button>
          </div>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            {/* 1. Select Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">اختر المنتج المراد مراقبته:</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setTargetPrice(Math.round(p.currentLowestPrice * 0.95));
                }}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (أقل سعر منافس: {p.currentLowestPrice.toLocaleString()} {currency})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Channel Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">قناة استلام التنبيه:</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedChannel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">واتساب (WhatsApp)</span>
                  <span className="text-[10px] text-emerald-700 font-bold">فوري ⚡</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('in_app')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedChannel === 'in_app'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">داخل التطبيق</span>
                  <span className="text-[10px] text-indigo-600 font-bold">صوت وشارة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    selectedChannel === 'email'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">البريد الإلكتروني</span>
                  <span className="text-[10px] text-blue-600 font-bold">تقارير</span>
                </button>
              </div>
            </div>

            {/* 3. Recipient Input */}
            {selectedChannel !== 'in_app' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {selectedChannel === 'whatsapp' ? (
                      <>
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>رقم هاتف واتساب المستلم للتنبيه (WhatsApp Phone):</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>البريد الإلكتروني المستلم:</span>
                      </>
                    )}
                  </span>
                  {selectedChannel === 'whatsapp' && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      ربط مباشر بـ whatsappService ⚡
                    </span>
                  )}
                </label>
                
                <input
                  type={selectedChannel === 'whatsapp' ? 'tel' : 'email'}
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  placeholder={selectedChannel === 'whatsapp' ? '01012345678 أو 201012345678' : 'merchant@store-egypt.com'}
                  dir="ltr"
                  className="w-full h-11 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-900 font-bold font-mono"
                  required
                />

                {selectedChannel === 'whatsapp' && waConfig.recipients.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      أو اختر سريعاً من أرقام واتساب المعتمدة في النظام:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {waConfig.recipients.map((rec) => (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setRecipientContact(rec.phone)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 border cursor-pointer ${
                            recipientContact === rec.phone
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>{rec.label} ({rec.phone})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-slate-500 block">
                  {selectedChannel === 'whatsapp'
                    ? 'سيتم إرسال إشعار فوري وتلقائي عبر واتساب لهذا الرقم لحظة تحقق شرط السعر أو هبوط المنافس عن السعر المستهدف.'
                    : 'سنرسل تفاصيل التغير وروابط التعديل مباشرة لإيميلك.'}
                </span>

                {selectedChannel === 'email' && (
                  <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-2">
                    <div className="flex items-center gap-2 text-[11px] text-blue-900">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>متكامل مع خدمة تقارير البريد (SendGrid / EmailJS). سيتم تضمين هذا الصنف في التقرير اليومي المجمع تلقائياً.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>معاينة وإرسال تقرير اليوم 🚀</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. Trigger Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">شرط إرسال التنبيه:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTriggerCondition('drop_below')}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    triggerCondition === 'drop_below'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong className="text-xs block">إذا انخفض عن سعر محدد</strong>
                  <span className="text-[10px] opacity-80">مثلاً أقل من 2,500 ج.م</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerCondition('percentage_drop')}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    triggerCondition === 'percentage_drop'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong className="text-xs block">إذا هبط بنسبة معينة</strong>
                  <span className="text-[10px] opacity-80">مثلاً هبوط 5% أو أكثر</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriggerCondition('buybox_change')}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    triggerCondition === 'buybox_change'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong className="text-xs block">أي تغير في الـ Buy Box</strong>
                  <span className="text-[10px] opacity-80">تغير البائع أو نفاذ المخزون</span>
                </button>
              </div>
            </div>

            {/* Value input for condition */}
            {triggerCondition === 'drop_below' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">السعر المستهدف للتنبيه (بالجنيه):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-800 font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">{currency}</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  أقل سعر منافس حالي هو {selectedProduct.currentLowestPrice.toLocaleString()} {currency}
                </span>
              </div>
            )}

            {triggerCondition === 'percentage_drop' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">نسبة الهبوط (مثال: 5%):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={thresholdPercentage}
                    onChange={(e) => setThresholdPercentage(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-800 font-bold"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وحفظ التنبيه الذكي</span>
            </button>
          </form>
        </div>
      )}

      {/* WhatsApp Message Interactive Live Simulator */}
      {activeSubTab === 'whatsapp_simulator' && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-['Alexandria']">
                محاكي رسائل التنبيهات الحية عبر الواتساب (WhatsApp Live Preview)
              </h3>
            </div>

            <button
              onClick={() => setActiveSubTab('alerts_list')}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold"
            >
              العودة لقائمة التنبيهات
            </button>
          </div>

          <div className="max-w-md mx-auto bg-[#ECE5DD] p-4 rounded-2xl border border-[#D1D7DB] shadow-md space-y-3 font-sans" dir="rtl">
            
            {/* WhatsApp Chat Header */}
            <div className="flex items-center gap-3 bg-[#075E54] text-white p-2.5 rounded-xl shadow-xs">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                📦
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs">رادار التاجر الذكي - مصر 🇪🇬</div>
                <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>متصل الآن • تنبيهات فورية</span>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
            </div>

            {/* WhatsApp Bubble Message */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs text-slate-800 space-y-2 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>🚨 تنبيه هبوط سعر مفاجئ بالسوق المصري!</span>
                </span>
                <span className="text-[10px]">{simulatedMsg.time}</span>
              </div>

              <div className="font-bold text-slate-900 text-xs">
                {simulatedMsg.productTitle}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">المنافس:</span>
                  <strong className="text-slate-800">{simulatedMsg.competitor}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السعر السابق:</span>
                  <span className="line-through text-slate-400">{simulatedMsg.oldPrice.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">السعر الجديد (المنخفض):</span>
                  <strong className="text-rose-600 font-bold">{simulatedMsg.newPrice.toLocaleString()} {currency} (هبوط -{simulatedMsg.dropAmount} ج.م)</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-emerald-700 font-bold">سعر بيعك المقترح للفوز:</span>
                  <strong className="text-emerald-700 font-black">{simulatedMsg.recommendedWinPrice.toLocaleString()} {currency}</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight">
                💡 اضغط على الزر أدناه لإرسال سعرك الجديد مباشرة لجميع المنصات (أمازون، نون، جوميا) وضمان استمرار المبيعات.
              </p>

              {/* WhatsApp Quick Action Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={onOpenRepriceModal}
                  className="w-full h-8 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>تحديث سعري فوراً إلى {simulatedMsg.recommendedWinPrice.toLocaleString()} {currency}</span>
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1">
              يتم إرسال الرسائل عبر خادم واتساب بيزنس السريع لرقمك {simulatedMsg.phone}
            </div>

          </div>
        </div>
      )}

      {/* WhatsApp Integration & Number Management Tab */}
      {activeSubTab === 'whatsapp_api_settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          
          {/* Header Banner */}
          <div className="bg-emerald-900 text-white rounded-2xl p-5 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Smartphone className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-['Alexandria']">بوابة تنبيهات واتساب الفورية (WhatsApp Integration API)</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    waConfig.isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {waConfig.isEnabled ? 'الخدمة مفعلة ✓' : 'الخدمة متوقفة'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  إرسال إشعارات فورية إلى أرقام واتساب المعتمدة لحظة هبوط سعر المنافس عن السعر المستهدف
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUpdateWaConfig({ isEnabled: !waConfig.isEnabled })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                  waConfig.isEnabled
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <span>{waConfig.isEnabled ? 'تعطيل الخدمة مؤقتاً' : 'تفعيل الخدمة الآن'}</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Manage Phone Numbers (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Add New Recipient Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>إضافة رقم واتساب معتمد جديد (Add Recipient Number)</span>
                </h4>

                <form onSubmit={handleAddRecipient} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">اسم / صفة المسؤول:</label>
                      <input
                        type="text"
                        value={newRecipientLabel}
                        onChange={(e) => setNewRecipientLabel(e.target.value)}
                        placeholder="مثال: أحمد مصطفى - مدير المبيعات"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم الهاتف (واتساب):</label>
                      <input
                        type="tel"
                        value={newRecipientPhone}
                        onChange={(e) => setNewRecipientPhone(e.target.value)}
                        placeholder="01012345678 أو 201012345678"
                        dir="ltr"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700">الدور:</span>
                      <select
                        value={newRecipientRole}
                        onChange={(e) => setNewRecipientRole(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                      >
                        <option value="pricing_manager">مسؤول التسعير التنافسي</option>
                        <option value="admin">مدير المتجر العام</option>
                        <option value="inventory_specialist">مسؤول المخزون والتوريد</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة الرقم للقائمة</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered Phone Numbers List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>الأرقام المعتمدة لتلقي التنبيهات ({waConfig.recipients.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    المفعلة: {waConfig.recipients.filter(r => r.isActive).length} من {waConfig.recipients.length}
                  </span>
                </div>

                {waConfig.recipients.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-bold">لا توجد أرقام واتساب مضافة بعد</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">أضف رقمك أعلاه لتلقي إشعارات انخفاض الأسعار فوراً</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {waConfig.recipients.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          rec.isActive
                            ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            rec.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            <PhoneCall className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">{rec.label}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                rec.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : rec.role === 'pricing_manager'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {rec.role === 'admin' ? 'مدير عام' : rec.role === 'pricing_manager' ? 'مسؤول تسعير' : 'مخزون'}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dir-ltr block mt-0.5">
                              +{rec.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleRecipient(rec.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                              rec.isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {rec.isActive ? 'مفعل ✓' : 'معطل'}
                          </button>

                          {/* Test Message Button */}
                          <button
                            type="button"
                            onClick={() => handleTestRecipient(rec)}
                            disabled={testingPhoneId === rec.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="إرسال رسالة اختبار للتأكد من وصول التنبيهات"
                          >
                            <Send className="w-3 h-3" />
                            <span>{testingPhoneId === rec.id ? 'جارٍ الإرسال...' : 'اختبار 📲'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(rec.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="حذف الرقم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Column 2: Provider & Auto-Alert Rules (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Provider Selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>طريقة الربط ومزود الخدمة (Provider Mode)</span>
                </h4>

                <div className="space-y-2">
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    waConfig.provider === 'wa_link'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="wa_provider"
                      checked={waConfig.provider === 'wa_link'}
                      onChange={() => handleUpdateWaConfig({ provider: 'wa_link' })}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div className="text-xs">
                      <span className="block font-black">الرابط الفوري المباشر (Direct WhatsApp Link)</span>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                        يعمل فوراً بدون مفاتيح أو اشتراكات، يفتح واتساب ويب أو التطبيق برسائل منسقة بنقرة زر
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    waConfig.provider === 'cloud_api'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="wa_provider"
                      checked={waConfig.provider === 'cloud_api'}
                      onChange={() => handleUpdateWaConfig({ provider: 'cloud_api' })}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div className="text-xs">
                      <span className="block font-black">Meta WhatsApp Cloud API (الربط السحابي الرسمي)</span>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                        إرسال صامت وتلقائي 100% في الخلفية عبر واجهة برمجة تطبيقات ميتا الرسمية
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    waConfig.provider === 'ultramsg'
                      ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="wa_provider"
                      checked={waConfig.provider === 'ultramsg'}
                      onChange={() => handleUpdateWaConfig({ provider: 'ultramsg' })}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div className="text-xs">
                      <span className="block font-black">بوابة UltraMsg / Green API (Gateway)</span>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                        إرسال عبر وسيط واتساب مستقل باستخدام Instance ID والتوكن
                      </span>
                    </div>
                  </label>
                </div>

                {/* Cloud API Inputs */}
                {waConfig.provider === 'cloud_api' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 animate-fadeIn">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Phone Number ID:</label>
                      <input
                        type="text"
                        value={waConfig.cloudApiPhoneId || ''}
                        onChange={(e) => handleUpdateWaConfig({ cloudApiPhoneId: e.target.value })}
                        placeholder="10092837465..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">System User Access Token:</label>
                      <input
                        type="password"
                        value={waConfig.cloudApiToken || ''}
                        onChange={(e) => handleUpdateWaConfig({ cloudApiToken: e.target.value })}
                        placeholder="EAABwz..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* UltraMsg Inputs */}
                {waConfig.provider === 'ultramsg' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 animate-fadeIn">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Instance ID:</label>
                      <input
                        type="text"
                        value={waConfig.ultramsgInstanceId || ''}
                        onChange={(e) => handleUpdateWaConfig({ ultramsgInstanceId: e.target.value })}
                        placeholder="instance12345"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">UltraMsg Token:</label>
                      <input
                        type="password"
                        value={waConfig.ultramsgToken || ''}
                        onChange={(e) => handleUpdateWaConfig({ ultramsgToken: e.target.value })}
                        placeholder="tok_abc123..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-Alert Trigger Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>شروط وقواعد الإخطار التلقائي (Trigger Rules)</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <span className="font-bold text-slate-800">تنبيه عند هبوط السعر عن السعر المستهدف:</span>
                    <input
                      type="checkbox"
                      checked={waConfig.autoAlertOnTargetPriceDrop}
                      onChange={(e) => handleUpdateWaConfig({ autoAlertOnTargetPriceDrop: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </label>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800">الحد الأدنى لقيمة الهبوط:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={waConfig.minDropAmountEGP}
                        onChange={(e) => handleUpdateWaConfig({ minDropAmountEGP: Number(e.target.value) || 1 })}
                        className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                      <span className="text-[11px] text-slate-500 font-bold">ج.م</span>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">تضمين رابط التعديل التلقائي (Auto-Reprice Link):</span>
                      <span className="text-[10px] text-slate-400">إضافة زر في الواتساب لتعديل السعر بنقرة واحدة</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={waConfig.includeAutoRepriceLink}
                      onChange={(e) => handleUpdateWaConfig({ includeAutoRepriceLink: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </label>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Main Alerts List & Notification History Grid */}
      {activeSubTab === 'alerts_list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Active Alerts Configured (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>التنبيهات المفعلة حالياً ({alerts.length})</span>
              </h3>
              <span className="text-xs text-slate-600 font-medium">
                يتم فحص الأسعار كل 15 دقيقة
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-300 p-8 text-center space-y-3 shadow-xs">
                <Bell className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">لا توجد تنبيهات مفعلة حالياً</h4>
                <p className="text-[11px] text-slate-600">
                  قم بضبط تنبيه جديد ليتصل هاتفك فوراً عند هبوط أسعار المنافسين أو نفاد المخزون.
                </p>
                <button
                  onClick={() => setActiveSubTab('create_new')}
                  className="h-8 px-3 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  إضافة تنبيه الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-2xl border p-4 transition-all shadow-sm ${
                      alert.isActive 
                        ? 'border-slate-300 hover:border-emerald-500 hover:shadow-md ring-1 ring-slate-900/5' 
                        : 'border-slate-200 bg-slate-50/70 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-start gap-3 flex-1">
                        <img
                          src={alert.productImage}
                          alt={alert.productTitle}
                          className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0 shadow-xs"
                        />

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Channel Badge with high contrast */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border ${
                              alert.channel === 'whatsapp'
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : alert.channel === 'in_app'
                                ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                : 'bg-blue-100 text-blue-950 border-blue-300'
                            }`}>
                              {alert.channel === 'whatsapp' && <Smartphone className="w-3 h-3 text-emerald-700 shrink-0" />}
                              {alert.channel === 'in_app' && <Bell className="w-3 h-3 text-indigo-700 shrink-0" />}
                              {alert.channel === 'email' && <Mail className="w-3 h-3 text-blue-700 shrink-0" />}
                              <span>{alert.channel === 'whatsapp' ? 'واتساب' : alert.channel === 'in_app' ? 'داخل التطبيق' : 'إيميل'}</span>
                            </span>

                            {/* Trigger condition classification chip */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                              alert.triggerCondition === 'competitor_stockout'
                                ? 'bg-sky-100 text-sky-950 border-sky-300'
                                : alert.triggerCondition === 'buybox_change'
                                ? 'bg-purple-100 text-purple-950 border-purple-300'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                            }`}>
                              {alert.triggerCondition === 'competitor_stockout' && <Package className="w-3 h-3 text-sky-800" />}
                              {alert.triggerCondition === 'buybox_change' && <Tag className="w-3 h-3 text-purple-800" />}
                              {alert.triggerCondition !== 'competitor_stockout' && alert.triggerCondition !== 'buybox_change' && <TrendingDown className="w-3 h-3 text-rose-800" />}
                              <span>
                                {alert.triggerCondition === 'competitor_stockout' ? 'تنبيه مخزون' : alert.triggerCondition === 'buybox_change' ? 'تنبيه عرض وباي بوكس' : 'تنبيه هبوط سعر'}
                              </span>
                            </span>

                            <span className="text-[11px] text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              المستلم: <strong className="text-slate-900 font-bold font-mono">{alert.recipientContact}</strong>
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-950 line-clamp-1 leading-snug">
                            {alert.productTitle}
                          </h4>

                          <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                            <span className="text-slate-500">الشرط المشغل:</span>
                            {alert.triggerCondition === 'drop_below' ? (
                              <strong className="text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-black">
                                هبوط السعر عن {alert.targetPrice?.toLocaleString()} {currency}
                              </strong>
                            ) : alert.triggerCondition === 'percentage_drop' ? (
                              <strong className="text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-black">
                                هبوط بنسبة {alert.thresholdPercentage}% أو أكثر
                              </strong>
                            ) : (
                              <strong className="text-sky-900 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-black">
                                أي تغير بالـ Buy Box أو نفاد المخزون
                              </strong>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* WhatsApp Instant Dispatch Button */}
                        {alert.channel === 'whatsapp' && (
                          <button
                            type="button"
                            onClick={() => handleExecuteWhatsAppAlertTrigger(alert)}
                            disabled={dispatchingAlertId === alert.id}
                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-black flex items-center gap-1 border border-emerald-500 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            title="إرسال رسالة واتساب حية فورية عبر خدمة whatsappService"
                          >
                            <Smartphone className="w-3 h-3 text-emerald-200" />
                            <span>{dispatchingAlertId === alert.id ? 'جارٍ الإرسال...' : 'إرسال واتساب 📲'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleExecuteWhatsAppAlertTrigger(alert)}
                          className="h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[10px] font-black flex items-center gap-1 border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
                          title="إرسال تنبيه تجريبي الآن للتأكد من وصوله"
                        >
                          <Play className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                          <span>اختبار فوري</span>
                        </button>

                        <button
                          onClick={() => onToggleAlert(alert.id)}
                          className={`h-8 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all border ${
                            alert.isActive 
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title={alert.isActive ? 'تعطيل التنبيه مؤقتاً' : 'تفعيل التنبيه'}
                        >
                          {alert.isActive ? 'مفعل ✓' : 'معطل'}
                        </button>

                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-100 border border-slate-200 hover:border-rose-300 flex items-center justify-center cursor-pointer transition-colors"
                          title="حذف التنبيه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Alert History & Notification Logs with Classification Icons (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>سجل الإشعارات والتنبيهات ({notificationLogs.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="تصدير هذه التنبيهات في تقرير بريد إلكتروني مجمع عبر SendGrid أو EmailJS"
                >
                  <Mail className="w-3 h-3 text-blue-600" />
                  <span>تقرير الإيميل اليومي ✉️</span>
                </button>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">سجل الأنشطة اللحظي</span>
              </div>
            </div>

            {/* Notification Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'price', label: '📉 تنبيه سعر' },
                { id: 'stock', label: '📦 تنبيه مخزون' },
                { id: 'offer', label: '🏷️ تنبيه عرض' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLogTypeFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    logTypeFilter === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-xs max-h-[640px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    لا توجد إشعارات مطابقة لهذا التصنيف حالياً.
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const classification = getLogClassification(log);
                  const IconComp = classification.icon;

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        log.isRead 
                          ? 'bg-slate-50/90 border-slate-200 text-slate-800' 
                          : `${classification.cardBg} shadow-2xs`
                      }`}
                    >
                      {/* Top Header with Classification Icon & Platform */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Classification Icon Badge */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${classification.iconColor} shadow-2xs shrink-0`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${classification.badgeBg}`}>
                              {classification.label}
                            </span>
                            <span className="text-[11px] font-black text-slate-900">
                              {log.platformName}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-600 font-medium shrink-0">
                          {log.timestamp}
                        </span>
                      </div>

                      {/* Log Message */}
                      <p className="text-xs text-slate-800 font-medium leading-relaxed pr-1">
                        {log.message}
                      </p>

                      {/* Bottom Price & Action Footer */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 text-[11px]">
                        <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <TrendingDown className="w-3 h-3 text-rose-600" />
                          <span>تغير {log.priceDropAmount} {currency} (-{log.priceDropPercent}%)</span>
                        </span>

                        <button
                          onClick={onOpenRepriceModal}
                          className="text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg font-bold flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                          <span>تعديل السعر</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* Daily Price Email Report Modal (SendGrid / EmailJS Integration) */}
      {isEmailModalOpen && (
        <DailyPriceEmailReportModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          products={products}
          notificationLogs={notificationLogs}
          merchantStoreName={merchantStoreName}
          managerEmail={managerEmail}
          currency={currency}
          onShowToast={onShowToast}
          onOpenRepriceModal={onOpenRepriceModal}
        />
      )}

    </div>
  );
};
