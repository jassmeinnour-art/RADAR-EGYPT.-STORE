import React from 'react';

interface FloatingPlatformItem {
  name: string;
  code: string;
  color: string;
  top: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
}

const FLOATING_PLATFORMS: FloatingPlatformItem[] = [
  { name: 'أمازون مصر', code: 'AMZ', color: '#FF9900', top: '8%', left: '88%', delay: '0s', duration: '9s', size: 'text-xs' },
  { name: 'نون مصر', code: 'NOON', color: '#FEE000', top: '22%', left: '5%', delay: '1.5s', duration: '11s', size: 'text-xs' },
  { name: 'جوميا مصر', code: 'JUMIA', color: '#F68B1E', top: '65%', left: '82%', delay: '0.7s', duration: '10s', size: 'text-[11px]' },
  { name: 'رنين', code: 'RANEEN', color: '#0055A5', top: '75%', left: '10%', delay: '2.2s', duration: '12s', size: 'text-xs' },
  { name: 'كنز', code: 'KENZZ', color: '#10B981', top: '12%', left: '42%', delay: '1.2s', duration: '8.5s', size: 'text-[11px]' },
  { name: 'هومزمارت', code: 'HOMZ', color: '#6366F1', top: '50%', left: '92%', delay: '3s', duration: '10.5s', size: 'text-[10px]' },
  { name: 'راية', code: 'RAYA', color: '#EF4444', top: '85%', left: '45%', delay: '0.3s', duration: '9.5s', size: 'text-[11px]' }
];

interface FloatingAnimatedLogosBackgroundProps {
  isFixedFullscreen?: boolean;
}

export const FloatingAnimatedLogosBackground: React.FC<FloatingAnimatedLogosBackgroundProps> = ({
  isFixedFullscreen = true
}) => {
  return (
    <div 
      className={`${
        isFixedFullscreen ? 'fixed inset-0 pointer-events-none z-0 overflow-hidden' : 'relative w-full h-40 overflow-hidden'
      } opacity-25 select-none`} 
      dir="rtl"
    >
      {FLOATING_PLATFORMS.map((plat) => (
        <div
          key={plat.code}
          className="absolute flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xl backdrop-blur-[2px] transition-all"
          style={{
            top: plat.top,
            left: plat.left,
            backgroundColor: `${plat.color}15`,
            animation: `floatLogoBackground ${plat.duration} ease-in-out infinite`,
            animationDelay: plat.delay,
          }}
        >
          <span 
            className="w-2.5 h-2.5 rounded-full shadow-md animate-pulse"
            style={{ backgroundColor: plat.color }}
          />
          <span className={`font-black tracking-wider ${plat.size}`} style={{ color: '#ffffff' }}>
            {plat.name}
          </span>
        </div>
      ))}

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes floatLogoBackground {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-18px) translateX(10px) scale(1.08);
            opacity: 0.65;
          }
        }
      `}</style>
    </div>
  );
};
