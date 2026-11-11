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
  imageUrl?: string;
}

const LOGOS: AnimatedLogoItem[] = [
  { id: 'amz-1', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '5%', animationDuration: '18s', animationDelay: '0s', sizePx: 48, imageUrl: 'https://cdn.simpleicons.org/amazon/FF9900' },
  { id: 'noon-1', name: 'نون مصر', shortName: 'Noon', color: '#FEE000', left: '18%', animationDuration: '22s', animationDelay: '3s', sizePx: 48, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  { id: 'jumia-1', name: 'جوميا مصر', shortName: 'Jumia', color: '#F68B1E', left: '28%', animationDuration: '20s', animationDelay: '1s', sizePx: 42, imageUrl: 'https://cdn.simpleicons.org/jumia/FF9900' },
  { id: 'raneen-1', name: 'رنين', shortName: 'Raneen', color: '#0055A5', left: '38%', animationDuration: '25s', animationDelay: '5s', sizePx: 48 },
  { id: 'kanz-1', name: 'كنز', shortName: 'Kanzz', color: '#10B981', left: '48%', animationDuration: '16s', animationDelay: '2s', sizePx: 42 },
  { id: 'homz-1', name: 'هومزمارت', shortName: 'HomeSmart', color: '#6366F1', left: '58%', animationDuration: '24s', animationDelay: '4s', sizePx: 45 },
  { id: 'amz-2', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '78%', animationDuration: '21s', animationDelay: '7s', sizePx: 44, imageUrl: 'https://cdn.simpleicons.org/amazon/FF9900' },
  { id: 'noon-2', name: 'نون مصر', shortName: 'Noon', color: '#FEE000', left: '88%', animationDuration: '27s', animationDelay: '2.5s', sizePx: 52, imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  { id: 'jumia-2', name: 'جوميا مصر', shortName: 'Jumia', color: '#F68B1E', left: '12%', animationDuration: '17s', animationDelay: '8s', sizePx: 40, imageUrl: 'https://cdn.simpleicons.org/jumia/FF9900' },
  { id: 'raneen-2', name: 'رنين', shortName: 'Raneen', color: '#0055A5', left: '32%', animationDuration: '23s', animationDelay: '1.5s', sizePx: 46 },
  { id: 'kanz-2', name: 'كنز', shortName: 'Kanzz', color: '#10B981', left: '52%', animationDuration: '29s', animationDelay: '6s', sizePx: 44 },
  { id: 'homz-2', name: 'هومزمارت', shortName: 'HomeSmart', color: '#6366F1', left: '72%', animationDuration: '15s', animationDelay: '9s', sizePx: 40 },
  { id: 'amz-3', name: 'أمازون مصر', shortName: 'Amazon', color: '#FF9900', left: '92%', animationDuration: '20s', animationDelay: '11s', sizePx: 46, imageUrl: 'https://cdn.simpleicons.org/amazon/FF9900' }
];

export const AnimatedLogosBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden select-none pointer-events-none" 
      dir="rtl"
      aria-hidden="true"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.id}
          className="absolute bottom-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 shadow-lg backdrop-blur-xs opacity-[0.12] pointer-events-none select-none"
          style={{
            left: logo.left,
            backgroundColor: `${logo.color}22`,
            borderColor: `${logo.color}55`,
            animation: `bubbleFloatUp ${logo.animationDuration} linear infinite`,
            animationDelay: logo.animationDelay,
            fontSize: `${Math.max(11, Math.round(logo.sizePx * 0.28))}px`,
          }}
          title={logo.name}
        >
          {logo.imageUrl ? (
            <img 
              src={logo.imageUrl} 
              alt={logo.name} 
              className="w-5 h-5 object-contain shrink-0" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }} 
            />
          ) : (
            <span 
              className="rounded-full shadow-lg shrink-0 animate-pulse"
              style={{ 
                backgroundColor: logo.color,
                width: `${Math.round(logo.sizePx * 0.22)}px`,
                height: `${Math.round(logo.sizePx * 0.22)}px`
              }}
            />
          )}
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
            opacity: 0.05;
          }
          25% {
            transform: translateY(80vh) rotate(6deg) scale(1);
            opacity: 0.10;
          }
          50% {
            transform: translateY(50vh) rotate(-6deg) scale(1.05);
            opacity: 0.12;
          }
          75% {
            transform: translateY(20vh) rotate(4deg) scale(1);
            opacity: 0.10;
          }
          100% {
            transform: translateY(-20vh) rotate(-8deg) scale(0.9);
            opacity: 0.04;
          }
        }
      `}</style>
    </div>
  );
};
