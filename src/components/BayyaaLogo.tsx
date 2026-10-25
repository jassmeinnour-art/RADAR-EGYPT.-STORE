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
      <div className={`flex items-center gap-3 shrink-0 ${className}`}>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E05E00] p-1 shadow-lg shadow-[#FF6B00]/30 border-2 border-white/20 shrink-0 flex items-center justify-center overflow-hidden group">
          {renderImageOrFallback()}
        </div>
        {showText && (
          <div className="flex flex-col text-right">
            <span className="font-extrabold text-white text-base sm:text-lg leading-tight tracking-tight font-['Alexandria']">
              منصة بياع
            </span>
            <span className="text-xs text-amber-300 font-bold font-mono tracking-wider">
              BAYYAA PLATFORM
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0F2A4A] border border-[#FF6B00]/50 shadow-sm shrink-0 ${className}`}>
        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#FF6B00] p-0.5">
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
