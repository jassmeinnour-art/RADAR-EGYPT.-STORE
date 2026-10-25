import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData, PlatformAspectRatio } from '../types';

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

  if (!isOpen) return null;

  const handleExport = (ratio: PlatformAspectRatio) => {
    setIsExportingMockup(true);
    setTimeout(() => {
      setIsExportingMockup(false);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onShowToast?.(`✅ تم تصدير تصميم المعاينة الفورية للأبعاد القياسية بنجاح! 🚀`);
      onExportRatio?.(ratio);
      onClose();
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn text-right"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-6 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-lg border border-indigo-400/40 text-white font-black">
              📱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">معاينة فورية لتصميم المنتج (Overlay) على أبعاد السوشيال ميديا</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Live Preview Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">معاينة شكل إعلانك ومنتجك على ستوري، بوست، وريلز إنستغرام وفيسبوك قبل التصدير</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mockup Type Switcher Tabs */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMockupTab('story')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'story'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ستوري (Instagram / WhatsApp Story) 9:16</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('post')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'post'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بوست مربّع (Feed Post) 1:1</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('reel')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'reel'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ريلز / تيك توك (Reels Video) 9:16</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMockupTab('ad')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeMockupTab === 'ad'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>إعلان فيسبوك عريض (Landscape Ad) 16:9</span>
          </button>
        </div>

        {/* Preview Canvas / Mockup Container */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[#06080E]">
          {activeMockupTab === 'story' && (
            <div className="w-[320px] h-[568px] rounded-[36px] bg-slate-950 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 text-white">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                <span>09:41</span>
                <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto" />
                <span>5G 🔋</span>
              </div>

              {/* Story Content Overlay Mockup */}
              <div className="flex-1 my-3 rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 relative overflow-hidden flex flex-col items-center justify-between p-3 shadow-inner">
                {/* Top Badge */}
                <div className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-md">
                  {selectedBadgeText}
                </div>

                {/* Product Image */}
                <div className="w-full flex-1 flex items-center justify-center my-2 relative">
                  <img 
                    src={currentImageSrc} 
                    alt="Story Preview" 
                    className="max-h-[240px] max-w-[90%] object-contain drop-shadow-2xl animate-fadeIn"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Title & Price Bottom Overlay */}
                <div className="w-full bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-center space-y-1">
                  <h4 className="text-xs font-black text-white line-clamp-1">{productTitle}</h4>
                  <div className="text-amber-400 font-black text-sm">{productPrice} {currency}</div>
                  <div className="text-[9px] text-emerald-400 font-bold">اطلب الآن • شحن سريع لجميع المحافظات 📦</div>
                </div>
              </div>

              {/* Instagram Story Bottom Swipe Up Action */}
              <div className="text-center pb-1">
                <span className="text-[11px] text-slate-400 font-bold underline">المس للاستجابة السريعة (Swipe Up) ↗</span>
              </div>
            </div>
          )}

          {activeMockupTab === 'post' && (
            <div className="w-[420px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col">
              {/* Instagram Feed Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-xs font-bold">ت</div>
                  <span className="text-xs font-bold text-white">متجر التاجر المصري المعتمد</span>
                </div>
                <span className="text-slate-400">•••</span>
              </div>

              {/* Feed Square Image */}
              <div className="relative aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow">
                  {selectedBadgeText}
                </div>
                <img 
                  src={currentImageSrc} 
                  alt="Post Preview" 
                  className="max-h-[90%] max-w-[90%] object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Post Caption Footer */}
              <div className="p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-400 font-black">{productPrice} {currency}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">متاح للشحن الفوري</span>
                </div>
                <p className="text-slate-300 font-semibold line-clamp-2 text-[11px]">{productTitle}</p>
              </div>
            </div>
          )}

          {activeMockupTab === 'reel' && (
            <div className="w-[320px] h-[568px] rounded-[36px] bg-slate-950 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4 text-white">
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                <span>00:15 / 00:30</span>
                <span className="text-rose-400 font-bold">● REC</span>
              </div>

              <div className="flex-1 my-3 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={currentImageSrc} 
                  alt="Reel Preview" 
                  className="max-h-[80%] max-w-[85%] object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-amber-300">
                  🎵 صوت رائج في مصر
                </div>
              </div>

              <div className="text-center pb-2">
                <span className="text-[11px] text-indigo-300 font-bold">إعلان فيديو ريلز تفاعلي 🎬</span>
              </div>
            </div>
          )}

          {activeMockupTab === 'ad' && (
            <div className="w-full max-w-xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>إعلان ممول (Sponsored Ad)</span>
                <span className="text-indigo-400 font-bold">Facebook Ads</span>
              </div>

              <div className="relative aspect-[16/9] bg-slate-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={currentImageSrc} 
                  alt="Ad Preview" 
                  className="max-h-[90%] max-w-[90%] object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-4 bg-slate-900 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-white">{productTitle}</div>
                  <div className="text-xs text-amber-400 font-bold mt-0.5">{productPrice} {currency}</div>
                </div>
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  اطلب الآن 🛒
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
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
              <span>{isExportingMockup ? 'جاري تصدير المقاس...' : 'تصدير هذه المقاس مباشرة (HD) 📥'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
