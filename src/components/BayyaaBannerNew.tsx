import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import bannerImgPath from '/banners/bayyaa-grow-business.jpg';

interface BayyaaBannerNewProps {
  className?: string;
  onShowToast?: (msg: string) => void;
}

export const BayyaaBannerNew: React.FC<BayyaaBannerNewProps> = ({
  className = '',
  onShowToast
}) => {
  const handleClick = () => {
    if (onShowToast) {
      onShowToast('🌐 جاري توجيهك إلى منصة بياع الرسمية (bayyaa.com)...');
    }
    window.open('https://bayyaa.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`w-full max-w-full my-4 relative group ${className}`} 
      dir="rtl"
    >
      {/* Sponsored Badge Header */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>إعلان ممول | Sponsored</span>
          </span>
          <span className="text-xs text-amber-300 font-bold font-['Cairo'] hidden sm:inline">
            منصة بياع (BAYYAA EG) - الشريك التجاري للتوسع والبيع
          </span>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900/80 hover:bg-slate-800 px-3 py-1 rounded-lg border border-amber-500/30 transition cursor-pointer"
        >
          <span>زيارة الموقع الرسمى</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clickable Banner Image */}
      <div 
        onClick={handleClick}
        className="relative rounded-[16px] overflow-hidden border-2 border-amber-500/40 hover:border-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer transition-all duration-300 active:scale-[0.99]"
        title="من أول أوردر لآلاف الأوردرات مع بياع حلمك بيكبر - انقر للزيارة والتسجيل مجاناً"
      >
        <img
          src={bannerImgPath}
          alt="من أول أوردر لآلاف الأوردرات مع بياع حلمك بيكبر - Grow Your Business - منصة بياع"
          className="w-full h-auto object-cover rounded-[16px] display-block transition-transform duration-500 group-hover:scale-[1.01]"
          onError={(e) => {
            // Fallback path if bundler alias differs
            const target = e.currentTarget;
            if (!target.dataset.tried) {
              target.dataset.tried = 'true';
              target.src = '/assets/aistudio/Meta_AI_883920851_1870883850708949_2827272803761633482_n_20261102_211841.webp_f1a1c6fb.jpg';
            }
          }}
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 pointer-events-none">
          <div className="flex items-center gap-2 text-white text-xs font-black">
            <span className="p-1.5 bg-amber-500 rounded-lg text-slate-950">
              <ExternalLink className="w-4 h-4" />
            </span>
            <span>انقر للانتقال مباشرة لموقع بياع (bayyaa.com) وتكبير حجم مبيعاتك 🚀</span>
          </div>
          <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg">
            افتح الآن ⚡
          </span>
        </div>
      </div>
    </div>
  );
};

export default BayyaaBannerNew;
