import React from 'react';
import { Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';

export interface PlatformBadgeMeta {
  code: string;
  name: string;
  badgeText: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  logoUrl?: string;
  description: string;
}

const SUPPORTED_PLATFORMS: PlatformBadgeMeta[] = [
  {
    code: 'amazon_eg',
    name: 'أمازون مصر',
    badgeText: 'Amazon EG',
    color: '#FF9900',
    bgGradient: 'from-amber-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/50',
    description: 'مراقبة Buy Box وسحب كتالوج FBA'
  },
  {
    code: 'noon_eg',
    name: 'نون مصر',
    badgeText: 'Noon Partners',
    color: '#FEE000',
    bgGradient: 'from-yellow-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-yellow-500/50',
    description: 'مزامنة الأسعار والطلبات الحالية'
  },
  {
    code: 'jumia_eg',
    name: 'جوميا مصر',
    badgeText: 'Jumia Seller',
    color: '#F68B1E',
    bgGradient: 'from-orange-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-orange-500/50',
    description: 'إدارة العروض ووثائق الشحن'
  },
  {
    code: 'raneen_eg',
    name: 'رنين',
    badgeText: 'Raneen EG',
    color: '#0055A5',
    bgGradient: 'from-blue-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/50',
    description: 'موردي الأدوات المنزلية والأجهزة'
  },
  {
    code: 'kenzz_eg',
    name: 'كنز',
    badgeText: 'Kenzz Shop',
    color: '#10B981',
    bgGradient: 'from-emerald-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/50',
    description: 'التجارة الاجتماعية وموردي الجملة'
  },
  {
    code: 'homzmart_eg',
    name: 'هومزمارت',
    badgeText: 'Homzmart',
    color: '#6366F1',
    bgGradient: 'from-indigo-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-indigo-500/50',
    description: 'الأثاث والديكور المنزلي في مصر'
  },
  {
    code: 'raya_eg',
    name: 'راية',
    badgeText: 'Raya Shop',
    color: '#EF4444',
    bgGradient: 'from-rose-950/80 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/50',
    description: 'الإلكترونيات والتقسيط الذكي'
  },
  {
    code: 'bayyaa_partner',
    name: 'منصة بياع',
    badgeText: 'Bayyaa Partner',
    color: '#FF6B00',
    bgGradient: 'from-orange-950/90 via-slate-900 to-amber-950/80',
    borderColor: 'border-[#FF6B00]',
    description: 'شريك التسوق والنمو التجاري الخارجي'
  }
];

export const AnimatedPlatformLogosGrid: React.FC = () => {
  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4" dir="rtl">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-['Alexandria'] text-white">
              شبكة الربط الشاملة لجميع المنصات والأسواق المصرية 🌐
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              رسوم متحركة تفاعلية توضح تغطية رادار التاجر لجميع منصات التجارة الإلكترونية الكبرى
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
          {SUPPORTED_PLATFORMS.length} منصات مرتبطة
        </span>
      </div>

      {/* Grid of Floating / Pulsing Platform Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
        {SUPPORTED_PLATFORMS.map((plat, idx) => (
          <div
            key={plat.code}
            className={`relative bg-gradient-to-b ${plat.bgGradient} border-2 ${plat.borderColor} rounded-2xl p-3.5 text-center flex flex-col items-center justify-between gap-2.5 shadow-lg group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}
            style={{
              animation: `floatPlatform 4s ease-in-out infinite`,
              animationDelay: `${idx * 0.3}s`
            }}
          >
            {/* Ambient Pulse Glow */}
            <div 
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none"
              style={{ backgroundColor: plat.color }}
            />

            {/* Floating Logo Badge Graphic */}
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-md border border-white/30 relative z-10 transition-transform group-hover:rotate-6"
              style={{ backgroundColor: plat.color, color: plat.code === 'noon_eg' ? '#000' : '#fff' }}
            >
              <span className="font-mono text-xs tracking-tighter">
                {plat.name.slice(0, 3)}
              </span>
            </div>

            <div className="space-y-1 relative z-10 w-full">
              <span className="text-xs font-black text-white block truncate" title={plat.name}>
                {plat.name}
              </span>
              <span className="text-[10px] text-slate-300 block truncate font-mono">
                {plat.badgeText}
              </span>
            </div>

            <div className="w-full pt-1.5 border-t border-slate-800/80 flex items-center justify-center">
              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>متصل 🟢</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CSS Animation Keyframes Inject */}
      <style>{`
        @keyframes floatPlatform {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
