import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Maximize2, 
  Eye,
  Share2,
  Sliders,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, PlatformAspectRatio } from '../types';
import { 
  LiveAdStyleEditorPanel, 
  AdElementStyleConfig, 
  DEFAULT_AD_STYLE_CONFIG 
} from './LiveAdStyleEditorPanel';

interface SocialMediaOverlayPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductData | null;
  currentImageSrc: string;
  productTitle: string;
  productPrice: string;
  currency: string;
  selectedBadgeText?: string;
  onShowToast?: (msg: string) => void;
  onExportRatio?: (ratio: PlatformAspectRatio) => void;
}

export const SocialMediaOverlayPreviewModal: React.FC<SocialMediaOverlayPreviewModalProps> = ({
  isOpen,
  onClose,
  product,
  currentImageSrc,
  productTitle,
  productPrice,
  currency,
  selectedBadgeText = '🔥 خصم خاص حصري',
  onShowToast,
  onExportRatio
}) => {
  const [activeMockupTab, setActiveMockupTab] = useState<'story' | 'post' | 'reel' | 'ad'>('story');
  const [isExportingMockup, setIsExportingMockup] = useState(false);
  const [showStyleEditor, setShowStyleEditor] = useState(true);

  // Live Text & Style State
  const [adStyleConfig, setAdStyleConfig] = useState<AdElementStyleConfig>(() => ({
    ...DEFAULT_AD_STYLE_CONFIG,
    titleText: productTitle || DEFAULT_AD_STYLE_CONFIG.titleText,
    priceText: `${productPrice || '3,450'} ${currency || 'ج.م'}`,
    badgeText: selectedBadgeText || DEFAULT_AD_STYLE_CONFIG.badgeText,
  }));

  // Sync props when productTitle/price changes
  useEffect(() => {
    if (productTitle) {
      setAdStyleConfig(prev => ({
        ...prev,
        titleText: productTitle,
        priceText: `${productPrice} ${currency}`,
        badgeText: selectedBadgeText || prev.badgeText
      }));
    }
  }, [productTitle, productPrice, currency, selectedBadgeText]);

  if (!isOpen) return null;

  const handleExport = (ratio: PlatformAspectRatio) => {
    setIsExportingMockup(true);
    setTimeout(() => {
      setIsExportingMockup(false);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onShowToast?.(`✅ تم تصدير تصميم المعاينة الفورية المعدّلة بنجاح! 🚀`);
      onExportRatio?.(ratio);
      onClose();
    }, 1000);
  };

  const handleResetDefaults = () => {
    setAdStyleConfig({
      ...DEFAULT_AD_STYLE_CONFIG,
      titleText: productTitle || DEFAULT_AD_STYLE_CONFIG.titleText,
      priceText: `${productPrice || '3,450'} ${currency || 'ج.م'}`,
      badgeText: selectedBadgeText || DEFAULT_AD_STYLE_CONFIG.badgeText,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn text-right"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[95vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-lg border border-indigo-400/40 text-white font-black text-lg">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">معاينة وتعديل تصميم الإعلان الفوري (Live Text & Style Studio)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Interactive Editor
                </span>
              </div>
              <p className="text-xs text-slate-400">التحكم المباشر في الألوان، الخطوط والمواضع للستوري والبوست قبل التصدير</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStyleEditor(!showStyleEditor)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                showStyleEditor
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>{showStyleEditor ? 'إخفاء لوحة التحكم' : 'إظهار لوحة التحكم والتعديل'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mockup Type Switcher Tabs */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMockupTab('story')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'story'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ستوري 9:16</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('post')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'post'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بوست مربّع 1:1</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('reel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'reel'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ريلز / تيك توك 9:16</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('ad')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'ad'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>إعلان عريض 16:9</span>
          </button>
        </div>

        {/* Main Content Layout (Preview + Live Style Editor Panel) */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#06080E] grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Mockup Canvas Container */}
          <div className={`${showStyleEditor ? 'lg:col-span-6' : 'lg:col-span-12'} flex items-center justify-center min-h-[480px]`}>
            {activeMockupTab === 'story' && (
              <div className="w-[310px] h-[550px] rounded-[32px] bg-slate-950 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-3.5 text-white">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                  <span>09:41</span>
                  <div className="w-16 h-2.5 bg-slate-800 rounded-full mx-auto" />
                  <span>5G 🔋</span>
                </div>

                {/* Story Content Overlay Mockup */}
                <div className="flex-1 my-2 rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 relative overflow-hidden flex flex-col items-center justify-between p-3 shadow-inner">
                  {/* Top Badge with Dynamic Styles */}
                  <div 
                    className="px-3 py-1 rounded-full font-black text-[10px] shadow-md transition-all duration-150 inline-block"
                    style={{
                      backgroundColor: adStyleConfig.badgeBgColor,
                      color: adStyleConfig.badgeTextColor,
                      fontSize: `${adStyleConfig.badgeFontSize}px`,
                      transform: `translate(${adStyleConfig.badgeX}px, ${adStyleConfig.badgeY}px)`
                    }}
                  >
                    {adStyleConfig.badgeText}
                  </div>

                  {/* Product Image */}
                  <div className="w-full flex-1 flex items-center justify-center my-2 relative">
                    <img 
                      src={currentImageSrc} 
                      alt="Story Preview" 
                      className="max-h-[220px] max-w-[90%] object-contain drop-shadow-2xl animate-fadeIn"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Price Bottom Overlay */}
                  <div className="w-full bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-center space-y-1.5 overflow-hidden">
                    <h4 
                      className="font-black line-clamp-2 transition-all duration-150"
                      style={{
                        color: adStyleConfig.titleColor,
                        fontSize: `${adStyleConfig.titleFontSize}px`,
                        transform: `translate(${adStyleConfig.titleX}px, ${adStyleConfig.titleY}px)`
                      }}
                    >
                      {adStyleConfig.titleText}
                    </h4>

                    <div 
                      className="font-black transition-all duration-150"
                      style={{
                        color: adStyleConfig.priceColor,
                        fontSize: `${adStyleConfig.priceFontSize}px`,
                        transform: `translate(${adStyleConfig.priceX}px, ${adStyleConfig.priceY}px)`
                      }}
                    >
                      {adStyleConfig.priceText}
                    </div>

                    <div 
                      className="font-bold transition-all duration-150"
                      style={{
                        color: adStyleConfig.taglineColor,
                        fontSize: `${adStyleConfig.taglineFontSize}px`,
                        transform: `translate(${adStyleConfig.taglineX}px, ${adStyleConfig.taglineY}px)`
                      }}
                    >
                      {adStyleConfig.taglineText}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Swipe Up Button */}
                <div 
                  className="text-center pb-1 transition-all duration-150"
                  style={{
                    transform: `translate(${adStyleConfig.ctaX}px, ${adStyleConfig.ctaY}px)`
                  }}
                >
                  <span 
                    className="px-3 py-1 rounded-lg font-bold shadow-sm inline-block cursor-pointer"
                    style={{
                      backgroundColor: adStyleConfig.ctaBgColor,
                      color: adStyleConfig.ctaTextColor,
                      fontSize: `${adStyleConfig.ctaFontSize}px`,
                    }}
                  >
                    {adStyleConfig.ctaText}
                  </span>
                </div>
              </div>
            )}

            {activeMockupTab === 'post' && (
              <div className="w-[380px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col">
                <div className="flex items-center justify-between p-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-xs font-bold">ت</div>
                    <span className="text-xs font-bold text-white">متجر التاجر المصري المعتمد</span>
                  </div>
                  <span className="text-slate-400">•••</span>
                </div>

                {/* Square Image */}
                <div className="relative aspect-square bg-slate-900 flex items-center justify-center overflow-hidden p-4">
                  <div 
                    className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md font-black shadow transition-all duration-150"
                    style={{
                      backgroundColor: adStyleConfig.badgeBgColor,
                      color: adStyleConfig.badgeTextColor,
                      fontSize: `${adStyleConfig.badgeFontSize}px`,
                      transform: `translate(${adStyleConfig.badgeX}px, ${adStyleConfig.badgeY}px)`
                    }}
                  >
                    {adStyleConfig.badgeText}
                  </div>

                  <img 
                    src={currentImageSrc} 
                    alt="Post Preview" 
                    className="max-h-[85%] max-w-[85%] object-contain drop-shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Post Caption Footer */}
                <div className="p-3.5 space-y-2 bg-slate-900/90 border-t border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span 
                      className="font-black transition-all duration-150"
                      style={{
                        color: adStyleConfig.priceColor,
                        fontSize: `${adStyleConfig.priceFontSize}px`,
                        transform: `translate(${adStyleConfig.priceX}px, ${adStyleConfig.priceY}px)`
                      }}
                    >
                      {adStyleConfig.priceText}
                    </span>

                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg font-bold shadow transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: adStyleConfig.ctaBgColor,
                        color: adStyleConfig.ctaTextColor,
                        fontSize: `${adStyleConfig.ctaFontSize}px`,
                        transform: `translate(${adStyleConfig.ctaX}px, ${adStyleConfig.ctaY}px)`
                      }}
                    >
                      {adStyleConfig.ctaText}
                    </button>
                  </div>

                  <p 
                    className="font-semibold line-clamp-2 transition-all duration-150"
                    style={{
                      color: adStyleConfig.titleColor,
                      fontSize: `${adStyleConfig.titleFontSize}px`,
                      transform: `translate(${adStyleConfig.titleX}px, ${adStyleConfig.titleY}px)`
                    }}
                  >
                    {adStyleConfig.titleText}
                  </p>

                  <div 
                    className="font-bold transition-all duration-150 text-[10px]"
                    style={{
                      color: adStyleConfig.taglineColor,
                      transform: `translate(${adStyleConfig.taglineX}px, ${adStyleConfig.taglineY}px)`
                    }}
                  >
                    {adStyleConfig.taglineText}
                  </div>
                </div>
              </div>
            )}

            {activeMockupTab === 'reel' && (
              <div className="w-[310px] h-[550px] rounded-[32px] bg-slate-950 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-3.5 text-white">
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                  <span>00:15 / 00:30</span>
                  <span className="text-rose-400 font-bold">● REC</span>
                </div>

                <div className="flex-1 my-2 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-between p-3">
                  <div 
                    className="px-2.5 py-0.5 rounded-full font-black text-[10px] shadow"
                    style={{
                      backgroundColor: adStyleConfig.badgeBgColor,
                      color: adStyleConfig.badgeTextColor,
                      fontSize: `${adStyleConfig.badgeFontSize}px`,
                      transform: `translate(${adStyleConfig.badgeX}px, ${adStyleConfig.badgeY}px)`
                    }}
                  >
                    {adStyleConfig.badgeText}
                  </div>

                  <img 
                    src={currentImageSrc} 
                    alt="Reel Preview" 
                    className="max-h-[200px] max-w-[85%] object-contain drop-shadow-2xl my-2"
                    referrerPolicy="no-referrer"
                  />

                  <div className="w-full text-center bg-slate-950/80 p-2 rounded-xl border border-slate-800 space-y-1">
                    <h4 
                      className="font-black truncate"
                      style={{
                        color: adStyleConfig.titleColor,
                        fontSize: `${adStyleConfig.titleFontSize}px`,
                        transform: `translate(${adStyleConfig.titleX}px, ${adStyleConfig.titleY}px)`
                      }}
                    >
                      {adStyleConfig.titleText}
                    </h4>

                    <div 
                      className="font-black"
                      style={{
                        color: adStyleConfig.priceColor,
                        fontSize: `${adStyleConfig.priceFontSize}px`,
                        transform: `translate(${adStyleConfig.priceX}px, ${adStyleConfig.priceY}px)`
                      }}
                    >
                      {adStyleConfig.priceText}
                    </div>
                  </div>
                </div>

                <div className="text-center pb-1">
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-xl font-bold shadow cursor-pointer"
                    style={{
                      backgroundColor: adStyleConfig.ctaBgColor,
                      color: adStyleConfig.ctaTextColor,
                      fontSize: `${adStyleConfig.ctaFontSize}px`,
                      transform: `translate(${adStyleConfig.ctaX}px, ${adStyleConfig.ctaY}px)`
                    }}
                  >
                    {adStyleConfig.ctaText}
                  </button>
                </div>
              </div>
            )}

            {activeMockupTab === 'ad' && (
              <div className="w-full max-w-lg bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>إعلان ممول (Sponsored Facebook Ad)</span>
                  <span className="text-indigo-400 font-bold">RADAR Studio</span>
                </div>

                <div className="relative aspect-[16/9] bg-slate-900 flex items-center justify-center overflow-hidden p-4">
                  <div 
                    className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md font-black shadow"
                    style={{
                      backgroundColor: adStyleConfig.badgeBgColor,
                      color: adStyleConfig.badgeTextColor,
                      fontSize: `${adStyleConfig.badgeFontSize}px`,
                      transform: `translate(${adStyleConfig.badgeX}px, ${adStyleConfig.badgeY}px)`
                    }}
                  >
                    {adStyleConfig.badgeText}
                  </div>

                  <img 
                    src={currentImageSrc} 
                    alt="Ad Preview" 
                    className="max-h-[85%] max-w-[85%] object-contain drop-shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 border-t border-slate-800">
                  <div className="min-w-0">
                    <div 
                      className="font-black truncate transition-all duration-150"
                      style={{
                        color: adStyleConfig.titleColor,
                        fontSize: `${adStyleConfig.titleFontSize}px`,
                        transform: `translate(${adStyleConfig.titleX}px, ${adStyleConfig.titleY}px)`
                      }}
                    >
                      {adStyleConfig.titleText}
                    </div>

                    <div 
                      className="font-bold mt-0.5 transition-all duration-150"
                      style={{
                        color: adStyleConfig.priceColor,
                        fontSize: `${adStyleConfig.priceFontSize}px`,
                        transform: `translate(${adStyleConfig.priceX}px, ${adStyleConfig.priceY}px)`
                      }}
                    >
                      {adStyleConfig.priceText}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer shrink-0 transition-all duration-150"
                    style={{
                      backgroundColor: adStyleConfig.ctaBgColor,
                      color: adStyleConfig.ctaTextColor,
                      fontSize: `${adStyleConfig.ctaFontSize}px`,
                      transform: `translate(${adStyleConfig.ctaX}px, ${adStyleConfig.ctaY}px)`
                    }}
                  >
                    {adStyleConfig.ctaText}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Text & Style Editor Panel Column */}
          {showStyleEditor && (
            <div className="lg:col-span-6 animate-fadeIn">
              <LiveAdStyleEditorPanel
                styleConfig={adStyleConfig}
                onChangeConfig={setAdStyleConfig}
                onResetDefaults={handleResetDefaults}
                onShowToast={onShowToast}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span>المقاس النشط: </span>
            <strong className="text-indigo-300">
              {activeMockupTab === 'story' && '1080 × 1920 px (9:16)'}
              {activeMockupTab === 'post' && '2000 × 2000 px (1:1)'}
              {activeMockupTab === 'reel' && '1080 × 1920 px (9:16)'}
              {activeMockupTab === 'ad' && '1920 × 1080 px (16:9)'}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              إغلاق المعاينة
            </button>

            <button
              type="button"
              disabled={isExportingMockup}
              onClick={() => {
                const ratio = activeMockupTab === 'story' || activeMockupTab === 'reel' ? '9:16' : activeMockupTab === 'post' ? '1:1' : '16:9';
                handleExport(ratio);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingMockup ? 'جاري تصدير التصميم...' : 'تصدير هذا التصميم المخصص (HD) 📥'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
