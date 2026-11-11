import React from 'react';
import { 
  ShoppingBag, 
  ExternalLink,
  Info
} from 'lucide-react';
import headerBrandLogo from '../assets/images/regenerated_image_1793023955535.png';

export const BayyaaAdBanner: React.FC = () => {
  const openBayyaa = () => {
    window.open('https://bayyaa.com', '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" dir="rtl">
      <div className="relative group">
        {/* Ad Label */}
        <div className="absolute -top-3 right-6 z-20 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg border border-amber-400">
          <span>إعلان ممول</span>
          <Info className="w-3 h-3" />
        </div>

        <div className="rounded-3xl bg-slate-900 border-2 border-orange-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10 text-right">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-xl flex items-center justify-center shrink-0 border border-white/20">
              <img
                src={headerBrandLogo}
                alt="منصة بياع"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = '/bayyaa-logo.jpg';
                }}
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Alexandria']">
                اكتشف منصة بياع (BAYYAA)
              </h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                سوق إلكتروني مصري مستقل يتيح لك عرض وبيع منتجاتك مباشرة للمستهلكين. انضم لآلاف التجار في أسرع المنصات نمواً.
              </p>
              <div className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>إعلان - لا يوجد ربط برمجى أو تقنى بين تطبيق رادار ومنصة بياع الخارجية</span>
              </div>
            </div>
          </div>

          <button
            onClick={openBayyaa}
            className="relative z-10 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20 active:scale-95 group/btn"
          >
            <ShoppingBag className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            <span>زيارة موقع بياع الخارجي</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
