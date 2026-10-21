import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Zap, 
  X, 
  Globe, 
  Copy, 
  Check, 
  Unlink, 
  ShieldCheck, 
  Store, 
  RefreshCw,
  Rocket
} from 'lucide-react';
import { ConnectedMerchantPlatform } from '../types';
import { 
  DEFAULT_PLATFORM_PORTALS, 
  getPlatformSellerPortalUrl, 
  directLaunchPlatformPortal, 
  autoLinkPlatformsWithGmail, 
  unlinkPlatformsFromGmail 
} from '../utils/platformLaunchHelper';

interface SmartGmailAutoLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: ConnectedMerchantPlatform[];
  onUpdatePlatforms: (updated: ConnectedMerchantPlatform[]) => void;
  currentMerchantEmail?: string;
  onShowToast: (message: string) => void;
  initialTab?: 'gmail_link' | 'launchpad';
}

export const SmartGmailAutoLinkModal: React.FC<SmartGmailAutoLinkModalProps> = ({
  isOpen,
  onClose,
  platforms,
  onUpdatePlatforms,
  currentMerchantEmail = '',
  onShowToast,
  initialTab = 'gmail_link',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'gmail_link' | 'launchpad'>(initialTab);
  const [emailInput, setEmailInput] = useState<string>(() => {
    // Check if any platform has linked Gmail
    const linked = platforms.find((p) => p.isGmailLinked && p.linkedGmail)?.linkedGmail;
    return linked || '';
  });
  const [copiedUrlCode, setCopiedUrlCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Platforms linked with Gmail count
  const linkedCount = platforms.filter((p) => p.isGmailLinked && p.isConnected).length;
  const isAllLinked = linkedCount === platforms.length && platforms.length > 0;

  // Currently active linked email
  const activeLinkedEmail = platforms.find((p) => p.isGmailLinked && p.linkedGmail)?.linkedGmail || null;

  // Handle Smart One-Click Auto-Link
  const handleExecuteSmartAutoLink = () => {
    const targetEmail = emailInput.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      onShowToast('⚠️ يرجى إدخال بريد إلكتروني صحيح (Gmail)');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const { updatedPlatforms, linkedCount: count } = autoLinkPlatformsWithGmail(platforms, targetEmail);
      onUpdatePlatforms(updatedPlatforms);
      setIsProcessing(false);
      onShowToast(`⚡ تم الربط الذكي لجميع المنصات (${count} منصة) بحساب ${targetEmail} بنجاح!`);
    }, 350);
  };

  // Handle Unlink Gmail
  const handleUnlinkAll = () => {
    const updated = unlinkPlatformsFromGmail(platforms);
    onUpdatePlatforms(updated);
    onShowToast('تم فك ربط البريد الإلكتروني عن جميع المنصات بنجاح');
  };

  // Direct Launch Single Platform
  const handleLaunch = (plat: ConnectedMerchantPlatform) => {
    const portalUrl = directLaunchPlatformPortal(plat, {
      onLaunched: (url) => {
        const platLabel = plat.name.split('(')[0].trim();
        onShowToast(`🚀 تم فتح لوحة إدارة بائعين ${platLabel} المرتبطة بحسابك`);
        // Update lastLaunchedAt
        const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        onUpdatePlatforms(
          platforms.map((p) => (p.id === plat.id ? { ...p, lastLaunchedAt: now } : p))
        );
      },
    });
  };

  // Copy portal URL helper
  const handleCopyUrl = (code: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlCode(code);
    onShowToast('تم نسخ رابط بوابة البائع إلى الحافظة 📋');
    setTimeout(() => setCopiedUrlCode(null), 2000);
  };

  // Filtered platforms for Launchpad
  const filteredPlatforms = platforms.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      (p.sellerName && p.sellerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                  الربط الذكي عبر البريد الإلكتروني (Gmail)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  ربط تلقائي موحد
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ربط وحفظ كافة حسابات ومنصات التاجر، مع اختصارات الوصول المباشر (Direct Launch)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('gmail_link')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'gmail_link'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>الربط التلقائي الذكي ({linkedCount}/{platforms.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('launchpad')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'launchpad'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>مراكز البائعين السريعة (Direct Launchpad)</span>
            </button>
          </div>

          {activeLinkedEmail && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[170px]" title={activeLinkedEmail}>
                مرتبط بـ: {activeLinkedEmail}
              </span>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'gmail_link' ? (
            <div className="space-y-4">
              {/* Feature Highlights Banner */}
              <div className="bg-linear-to-r from-indigo-50/90 via-sky-50/80 to-indigo-50/90 p-4 rounded-xl border border-indigo-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-200 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-indigo-950">
                      كيف يعمل الربط الذكي عبر بريد Gmail؟
                    </h4>
                    <p className="text-xs text-indigo-900/80 mt-0.5 leading-relaxed">
                      بمجرد إدخال بريدك الأساسي، يقوم الرادار بربط وتأكيد جميع منصاتك المسجلة (أمازون، نون، جوميا، رنين، بي تك وغيرها) تلقائياً، وتثبيتها محلياً وسحابياً، مما يتيح لك فتح أي منصة مباشرة دون الحاجة لكتابة بياناتك في كل مرة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Input & Auto-Link Execution Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  بريد التاجر الأساسي المعتمد (Primary Merchant Gmail)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="merchant.store@gmail.com"
                      className="w-full ps-9 pe-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteSmartAutoLink}
                    disabled={isProcessing || !emailInput.trim()}
                    className="px-4 py-2 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-98"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الربط والحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-sky-300 text-sky-300" />
                        <span>الربط التلقائي لكافة المنصات بنقرة واحدة</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick email presets if available */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">اقتراحات سريعة:</span>
                  {currentMerchantEmail && (
                    <button
                      type="button"
                      onClick={() => setEmailInput(currentMerchantEmail)}
                      className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 cursor-pointer font-mono"
                    >
                      {currentMerchantEmail}
                    </button>
                  )}
                  {emailInput !== 'jassmeinnour@gmail.com' && (
                    <button
                      type="button"
                      onClick={() => setEmailInput('jassmeinnour@gmail.com')}
                      className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer font-mono"
                    >
                      jassmeinnour@gmail.com
                    </button>
                  )}
                </div>
              </div>

              {/* Connected Platforms Overview List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-600" />
                    <span>المنصات المشمولة في الربط التلقائي ({platforms.length} منصة)</span>
                  </h4>
                  {activeLinkedEmail && (
                    <button
                      type="button"
                      onClick={handleUnlinkAll}
                      className="text-[11px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Unlink className="w-3 h-3" />
                      <span>فك الربط التلقائي</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pe-1">
                  {platforms.map((plat) => {
                    const meta = DEFAULT_PLATFORM_PORTALS[plat.code];
                    const portalUrl = getPlatformSellerPortalUrl(plat);
                    const isLinked = plat.isGmailLinked && plat.isConnected;

                    return (
                      <div
                        key={plat.id}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isLinked
                            ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {plat.name.split('(')[0].trim()}
                            </span>
                            {meta?.badgeText && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {meta.badgeText}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {isLinked ? (
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                مرتبط: {plat.merchantEmail}
                              </span>
                            ) : (
                              <span>حساب محلي غير مرتبط بـ Gmail</span>
                            )}
                          </p>
                        </div>

                        {/* Quick Direct Launch from link tab */}
                        <button
                          type="button"
                          onClick={() => handleLaunch(plat)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title={`فتح لوحة بائعين ${plat.name}`}
                        >
                          <Rocket className="w-3 h-3 text-indigo-600" />
                          <span>فتح</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Direct Launchpad */
            <div className="space-y-3">
              {/* Search and summary */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">اختصارات الوصول المباشر (Direct Launch): </span>
                  <span>انقر على أي منصة لفتح لوحة البائع الرسمية المرتبطة ببريدك مباشرة دون إعادة تسجيل الدخول</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المنصات..."
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                />
              </div>

              {/* Grid of Direct Launch Platform Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlatforms.map((plat) => {
                  const meta = DEFAULT_PLATFORM_PORTALS[plat.code];
                  const portalUrl = getPlatformSellerPortalUrl(plat);
                  const isLinked = plat.isGmailLinked && plat.isConnected;

                  return (
                    <div
                      key={plat.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                              <Store className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-black text-xs text-slate-900 truncate" title={plat.name}>
                              {plat.name.split('(')[0].trim()}
                            </span>
                          </div>

                          {meta?.badgeText && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${meta.accentBg}`}>
                              {meta.badgeText}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {meta?.portalDescription || 'لوحة تحكم البائع الرسمية لإدارة المنتجات والمبيعات والطلبات'}
                        </p>

                        <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1 truncate font-mono text-slate-400" title={portalUrl}>
                            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{portalUrl.replace('https://', '')}</span>
                          </div>

                          {plat.lastLaunchedAt && (
                            <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              آخر تشغيل: {plat.lastLaunchedAt}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleLaunch(plat)}
                          className="flex-1 py-1.5 px-3 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          <span>فتح لوحة البائع مباشرة</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyUrl(plat.code, portalUrl)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="نسخ رابط لوحة البائع"
                        >
                          {copiedUrlCode === plat.code ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>يتم حفظ جميع التحديثات فورياً في المتصفح والسحابة (Firestore)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
