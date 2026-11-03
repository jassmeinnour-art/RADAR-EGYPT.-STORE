import React from 'react';

interface AnimatedLogoItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  left: string;
  animationDuration: string;
  animationDelay: string;
  sizePx: number;
}

const LOGOS: AnimatedLogoItem[] = [
  { id: 'amz-1', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '6%', animationDuration: '18s', animationDelay: '0s', sizePx: 52 },
  { id: 'noon-1', name: 'نون مصر', shortName: 'Noon', color: '#FEE000', left: '18%', animationDuration: '22s', animationDelay: '3s', sizePx: 48 },
  { id: 'jumia-1', name: 'جوميا مصر', shortName: 'Jumia', color: '#F68B1E', left: '28%', animationDuration: '20s', animationDelay: '1s', sizePx: 42 },
  { id: 'raneen-1', name: 'رنين', shortName: 'Raneen', color: '#0055A5', left: '38%', animationDuration: '25s', animationDelay: '5s', sizePx: 50 },
  { id: 'kenzz-1', name: 'كنز', shortName: 'Kenzz', color: '#10B981', left: '48%', animationDuration: '16s', animationDelay: '2s', sizePx: 36 },
  { id: 'homz-1', name: 'هومزمارت', shortName: 'Homzmart', color: '#6366F1', left: '58%', animationDuration: '24s', animationDelay: '4s', sizePx: 45 },
  { id: 'bayyaa-1', name: 'منصة بياع', shortName: 'Bayyaa', color: '#FF6B00', left: '68%', animationDuration: '19s', animationDelay: '0.5s', sizePx: 58 },
  { id: 'amz-2', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '78%', animationDuration: '21s', animationDelay: '7s', sizePx: 40 },
  { id: 'noon-2', name: 'نون مصر', shortName: 'Noon', color: '#FEE000', left: '88%', animationDuration: '27s', animationDelay: '2.5s', sizePx: 55 },
  { id: 'jumia-2', name: 'جوميا مصر', shortName: 'Jumia', color: '#F68B1E', left: '12%', animationDuration: '17s', animationDelay: '8s', sizePx: 38 },
  { id: 'raneen-2', name: 'رنين', shortName: 'Raneen', color: '#0055A5', left: '32%', animationDuration: '23s', animationDelay: '1.5s', sizePx: 46 },
  { id: 'kenzz-2', name: 'كنز', shortName: 'Kenzz', color: '#10B981', left: '52%', animationDuration: '29s', animationDelay: '6s', sizePx: 54 },
  { id: 'homz-2', name: 'هومزمارت', shortName: 'Homzmart', color: '#6366F1', left: '72%', animationDuration: '15s', animationDelay: '9s', sizePx: 34 },
  { id: 'bayyaa-2', name: 'منصة بياع', shortName: 'Bayyaa', color: '#FF6B00', left: '82%', animationDuration: '26s', animationDelay: '4.5s', sizePx: 60 },
  { id: 'amz-3', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '92%', animationDuration: '20s', animationDelay: '11s', sizePx: 44 }
];

export const AnimatedLogosBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-auto" 
      dir="rtl"
      aria-hidden="true"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.id}
          className="absolute bottom-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 shadow-2xl backdrop-blur-md opacity-25 hover:opacity-90 hover:scale-125 transition-all duration-300 cursor-pointer"
          style={{
            left: logo.left,
            backgroundColor: `${logo.color}22`,
            borderColor: `${logo.color}55`,
            animation: `bubbleFloatUp ${logo.animationDuration} linear infinite`,
            animationDelay: logo.animationDelay,
            fontSize: `${Math.max(10, Math.round(logo.sizePx * 0.26))}px`,
          }}
          title={logo.name}
        >
          {/* Logo Bullet Dot */}
          <span 
            className="rounded-full shadow-lg shrink-0 animate-pulse"
            style={{ 
              backgroundColor: logo.color,
              width: `${Math.round(logo.sizePx * 0.22)}px`,
              height: `${Math.round(logo.sizePx * 0.22)}px`
            }}
          />
          {/* Logo Brand Name */}
          <span className="font-black tracking-wide text-white whitespace-nowrap">
            {logo.name}
          </span>
        </div>
      ))}

      {/* Bubble Upward Keyframes */}
      <style>{`
        @keyframes bubbleFloatUp {
          0% {
            transform: translateY(110vh) rotate(0deg) scale(0.85);
            opacity: 0.15;
          }
          25% {
            transform: translateY(80vh) rotate(6deg) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translateY(50vh) rotate(-6deg) scale(1.05);
            opacity: 0.45;
          }
          75% {
            transform: translateY(20vh) rotate(4deg) scale(1);
            opacity: 0.35;
          }
          100% {
            transform: translateY(-20vh) rotate(-8deg) scale(0.9);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
};

