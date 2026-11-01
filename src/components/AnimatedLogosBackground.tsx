import React from 'react';

interface AnimatedLogoItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  top: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: string;
}

const LOGOS: AnimatedLogoItem[] = [
  { id: 'amz', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', top: '12%', left: '85%', animationDuration: '14s', animationDelay: '0s', size: 'text-xs' },
  { id: 'noon', name: 'نون مصر', shortName: 'Noon', color: '#FEE000', top: '28%', left: '8%', animationDuration: '16s', animationDelay: '2s', size: 'text-xs' },
  { id: 'jumia', name: 'جوميا مصر', shortName: 'Jumia', color: '#F68B1E', top: '75%', left: '80%', animationDuration: '18s', animationDelay: '1s', size: 'text-[11px]' },
  { id: 'raneen', name: 'رنين', shortName: 'Raneen', color: '#0055A5', top: '68%', left: '12%', animationDuration: '15s', animationDelay: '3.5s', size: 'text-xs' },
  { id: 'kenzz', name: 'كنز', shortName: 'Kenzz', color: '#10B981', top: '18%', left: '48%', animationDuration: '13s', animationDelay: '1.8s', size: 'text-[11px]' },
  { id: 'homz', name: 'هومزمارت', shortName: 'Homzmart', color: '#6366F1', top: '45%', left: '90%', animationDuration: '17s', animationDelay: '2.5s', size: 'text-[10px]' },
  { id: 'raya', name: 'راية', shortName: 'Raya', color: '#EF4444', top: '82%', left: '46%', animationDuration: '16s', animationDelay: '0.8s', size: 'text-[11px]' }
];

export const AnimatedLogosBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20 select-none" 
      dir="rtl"
      aria-hidden="true"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.id}
          className="absolute flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl backdrop-blur-[1px] transition-all"
          style={{
            top: logo.top,
            left: logo.left,
            backgroundColor: `${logo.color}12`,
            animation: `floatLogoKeyframe ${logo.animationDuration} ease-in-out infinite`,
            animationDelay: logo.animationDelay,
          }}
        >
          {/* Logo Bullet Icon */}
          <span 
            className="w-3 h-3 rounded-full shadow-md animate-pulse"
            style={{ backgroundColor: logo.color }}
          />
          {/* Logo Name */}
          <span className={`font-black tracking-wider ${logo.size}`} style={{ color: '#ffffff' }}>
            {logo.name}
          </span>
        </div>
      ))}

      {/* Global CSS Keyframes for smooth floating and drift */}
      <style>{`
        @keyframes floatLogoKeyframe {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-22px) translateX(12px) scale(1.06);
            opacity: 0.55;
          }
        }
      `}</style>
    </div>
  );
};
