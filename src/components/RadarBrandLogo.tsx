import React from 'react';

interface RadarBrandLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

/**
 * Isolated RADAR Brand Emblem (رادار التاجر الذكي).
 * Strictly represents the Radar market tracking brand (Gold/Navy/Cyan radar sweep).
 * Completely separated from 'Bayyaa' marketplace branding.
 */
export const RadarBrandLogo: React.FC<RadarBrandLogoProps> = ({
  className = 'w-12 h-12',
  animated = false,
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-slate-950 flex items-center justify-center shadow-xl ${className}`}>
      <img 
        src="/pwa-512x512.png" 
        alt="RADAR" 
        className={`w-full h-full object-cover ${animated ? 'animate-pulse' : ''}`}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default RadarBrandLogo;
