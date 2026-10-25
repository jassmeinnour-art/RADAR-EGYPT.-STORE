import React, { useState } from 'react';

interface RadarBrandLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  useImageLogo?: boolean;
}

/**
 * Self-contained RADAR & Bayyaa Brand Emblem.
 * Supports rendering the actual uploaded Bayyaa brand logo image file (/bayyaa-logo.jpg)
 * while preserving fallback SVG vector graphics with zero broken dependencies.
 */
export const RadarBrandLogo: React.FC<RadarBrandLogoProps> = ({
  className = 'w-9 h-9',
  animated = false,
  useImageLogo = true,
}) => {
  const [imgError, setImgError] = useState(false);

  if (useImageLogo && !imgError) {
    return (
      <img
        src="/bayyaa-logo.jpg"
        alt="شعار بياع ورادار التاجر الذكي - Bayyaa Logo"
        onError={() => setImgError(true)}
        className={`select-none rounded-xl object-contain shrink-0 max-w-full max-h-full ${className}`}
        loading="eager"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`select-none shrink-0 ${className}`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
      width="100%"
      height="100%"
      role="img"
      aria-label="RADAR & Bayyaa — Global Marketplaces Tracking"
    >
      <defs>
        <linearGradient id="radarInlineGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B48222" />
        </linearGradient>
        <radialGradient id="radarInlineCoreBg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1B160D" />
          <stop offset="100%" stopColor="#08090D" />
        </radialGradient>
      </defs>

      {/* Deep Obsidian Rounded Container */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="22"
        fill="url(#radarInlineCoreBg)"
        stroke="url(#radarInlineGoldRing)"
        strokeWidth="2.5"
        strokeOpacity="0.6"
      />

      {/* Subtle Inner Geodesic Crosshairs */}
      <circle
        cx="50"
        cy="50"
        r="22"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeOpacity="0.25"
        strokeDasharray="3 3"
      />
      <line x1="20" y1="50" x2="80" y2="50" stroke="#D4AF37" strokeOpacity="0.18" strokeWidth="1" />
      <line x1="50" y1="20" x2="50" y2="80" stroke="#D4AF37" strokeOpacity="0.18" strokeWidth="1" />

      {/* Iconic Open Gold Radar Sweep Ring */}
      <path
        d="M 50 18 A 32 32 0 1 1 23 32"
        fill="none"
        stroke="url(#radarInlineGoldRing)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Glowing Gold Target Pulse Node in Upper-Right Quadrant */}
      <circle
        cx="61"
        cy="36"
        r="6.5"
        fill="#FBBF24"
        fillOpacity="0.3"
        className={animated ? 'animate-ping' : ''}
      />
      <circle cx="61" cy="36" r="4" fill="#FEF3C7" />
    </svg>
  );
};

export default RadarBrandLogo;
