import React, { useRef } from 'react';
import { ExternalLink, Info, Plus } from 'lucide-react';
import { DraggableHandle } from './DraggableHandle';
import bayyaaLogo from '../assets/images/regenerated_image_1794400223452.png';

export const SponsoredAdsSection: React.FC = () => {
  const adsRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={adsRef} className="relative pt-12 border-t border-slate-800/50 space-y-8">
      <DraggableHandle elementId="home_ads" targetRef={adsRef} position="top-right" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-white">إعلانات ممولة 📣</h2>
        <p className="text-slate-500 text-[10px] font-bold">هذه إعلانات ممولة - لا يوجد ربط بين رادار والمعلنين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bayyaa Ad */}
        <div className="col-span-1 lg:col-span-1 p-6 bg-slate-900 border-2 border-orange-500/30 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute -top-3 left-6 z-20 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg">
            إعلان ممول
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 p-0.5 shadow-xl flex items-center justify-center">
              <img
                src={bayyaaLogo}
                alt="Bayyaa"
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-xl bg-slate-800"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png';
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">بياع (Bayyaa)</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">سوق التجار المستقل لبيع المنتجات مباشرة للمستهلك.</p>
            </div>
            <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Info className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-500 font-black">إعلان - لا يوجد ربط بين رادار وبياع</span>
            </div>
          </div>

          <button
            onClick={() => window.open('https://bayyaa.com', '_blank')}
            className="mt-6 w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>زيارة بياع</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Placeholder Ads */}
        <div className="p-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Plus className="w-6 h-6 text-slate-500" />
          </div>
          <h4 className="text-sm font-black text-slate-400">مساحة إعلانية متاحة</h4>
          <p className="text-[10px] text-slate-500 font-bold">تواصل معنا لحجز مساحتك الإعلانية هنا</p>
        </div>

        <div className="p-8 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Plus className="w-6 h-6 text-slate-500" />
          </div>
          <h4 className="text-sm font-black text-slate-400">مساحة إعلانية متاحة</h4>
          <p className="text-[10px] text-slate-500 font-bold">روّج لمتجرك أو خدمتك أمام آلاف التجار يومياً</p>
        </div>
      </div>
    </section>
  );
};

export default SponsoredAdsSection;
