import React, { useState } from 'react';

interface BayyaaLogoProps {
  className?: string;
  imgClassName?: string;
  variant?: 'icon' | 'full' | 'banner' | 'badge';
  alt?: string;
  showText?: boolean;
}

/**
 * Bayyaa Logo Component (منصة بياع - Bayyaa Logo)
 * Renders the actual uploaded Bayyaa brand image logo file with responsive scaling,
 * maintaining proper aspect ratio and visual clarity across mobile and desktop views.
 */
export const BayyaaLogo: React.FC<BayyaaLogoProps> = ({
  className = '',
  imgClassName = 'w-full h-full object-contain',
  variant = 'icon',
  alt = 'منصة بياع - Bayyaa Logo',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Preferred public image paths for the actual Bayyaa logo image
  const logoSrc = '/bayyaa-logo.jpg';

  const renderImageOrFallback = () => {
    if (!imgError) {
      return (
        <img
          src={logoSrc}
          alt={alt}
          onError={() => setImgError(true)}
          className={`select-none rounded-xl ${imgClassName}`}
          loading="eager"
        />
      );
    }

    // Elegant Vector SVG Fallback with Bayyaa branding typography & emblem
    return (
      <svg
        viewBox="0 0 200 200"
        className={`select-none ${imgClassName}`}
        role="img"
        aria-label={alt}
      >
        <defs>
          <linearGradient id="bayyaaOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="50%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#D94100" />
          </linearGradient>
          <radialGradient id="bayyaaDarkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="44" fill="url(#bayyaaDarkGlow)" stroke="url(#bayyaaOrangeGrad)" strokeWidth="6" />
        {/* Shopping Cart & Speed Slash Icon */}
        <path d="M 50 65 L 70 65 L 85 125 L 155 125 L 168 80 L 78 80" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="95" cy="148" r="12" fill="#FF6B00" />
        <circle cx="145" cy="148" r="12" fill="#FF6B00" />
        {/* Bayyaa Arabic Typography Emblem Accent */}
        <path d="M 120 45 Q 140 25 160 45" fill="none" stroke="#FF8C00" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  };

  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-4 shrink-0 ${className}`}>
        {/* Exact Standalone Bayyaa Logo - Prominent & Distinct */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-0.5 shadow-xl shadow-black/10 shrink-0 flex items-center justify-center overflow-hidden group border border-slate-100">
          {renderImageOrFallback()}
        </div>
        {showText && (
          <div className="flex flex-col text-right">
            <span className="font-black text-white text-lg sm:text-2xl leading-tight tracking-tight font-['Alexandria']">
              منصة بياع
            </span>
            <span className="text-sm text-amber-400 font-black tracking-[0.2em] uppercase">
              Bayyaa Platform
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F2A4A] border-2 border-[#FF6B00] shadow-sm shrink-0 ${className}`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white p-0.5">
          {renderImageOrFallback()}
        </div>
        <span className="text-xs font-black text-white font-['Alexandria']">
          منصة بياع (Bayyaa)
        </span>
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {renderImageOrFallback()}
    </div>
  );
};

export default BayyaaLogo;
