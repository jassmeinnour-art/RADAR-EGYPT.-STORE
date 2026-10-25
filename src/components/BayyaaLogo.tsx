import React, { useState } from 'react';

interface BayyaaLogoProps {
  className?: string;
  imgClassName?: string;
  variant?: 'icon' | 'full' | 'banner' | 'badge' | 'header' | 'standalone';
  alt?: string;
  showText?: boolean;
}

/**
 * Bayyaa Logo Component (منصة بياع - Official Bayyaa Standalone Logo)
 * Completely isolated from 'Radar' branding.
 * Renders the exact official uploaded Bayyaa logo image (orange background with shopping cart and 'Bayyaa / بياع' text)
 * as a standalone, prominent brand element with responsive scaling.
 */
export const BayyaaLogo: React.FC<BayyaaLogoProps> = ({
  className = '',
  imgClassName = 'w-full h-full object-contain',
  variant = 'icon',
  alt = 'منصة بياع الرسمية - Official Bayyaa Platform',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);
  const [usePngFallback, setUsePngFallback] = useState(false);

  // Preferred public image paths for the actual Bayyaa logo image
  const logoSrc = usePngFallback ? '/bayyaa-logo.png' : '/bayyaa-logo.jpg';

  const handleImageError = () => {
    if (!usePngFallback) {
      setUsePngFallback(true);
    } else {
      setImgError(true);
    }
  };

  const renderLogoImage = () => {
    if (!imgError) {
      return (
        <img
          src={logoSrc}
          alt={alt}
          onError={handleImageError}
          className={`select-none transition-transform duration-300 ${imgClassName}`}
          loading="eager"
        />
      );
    }

    // High-fidelity Vector SVG Fallback with exact Bayyaa branding colors (#FF6B00, #0F2A4A, #FFFFFF)
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
            <stop offset="100%" stopColor="#E05E00" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="36" fill="url(#bayyaaOrangeGrad)" />
        {/* Shopping Cart & Movement Speed Slashes */}
        <path d="M 45 65 L 68 65 L 85 125 L 155 125 L 168 80 L 76 80" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="95" cy="150" r="13" fill="#FFFFFF" />
        <circle cx="145" cy="150" r="13" fill="#FFFFFF" />
        <text x="100" y="45" fill="#FFFFFF" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">بياع • BAYYAA</text>
      </svg>
    );
  };

  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-4 shrink-0 ${className}`}>
        {/* Exact Standalone Bayyaa Logo - Large, Prominent & Distinct */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FF6B00] p-1.5 shadow-2xl shadow-[#FF6B00]/40 shrink-0 flex items-center justify-center overflow-hidden border-3 border-white ring-4 ring-[#FF6B00]/30 hover:scale-105 transition-all">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center">
            {renderLogoImage()}
          </div>
        </div>
        {showText && (
          <div className="flex flex-col text-right">
            <span className="font-black text-white text-xl sm:text-3xl leading-tight tracking-tight font-['Alexandria'] drop-shadow-md">
              منصة بياع
            </span>
            <span className="text-sm sm:text-base text-amber-300 font-black tracking-[0.25em] uppercase drop-shadow-sm">
              Bayyaa Marketplace
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 shrink-0 ${className}`}>
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FF6B00] p-1 shadow-lg shadow-[#FF6B00]/30 shrink-0 flex items-center justify-center overflow-hidden border-2 border-white ring-2 ring-[#FF6B00]/40 hover:scale-105 transition-all">
          <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center">
            {renderLogoImage()}
          </div>
        </div>
        {showText && (
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white font-['Alexandria']">
                منصة بياع
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FF6B00] text-white">
                رسمي
              </span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold tracking-wider uppercase font-mono">
              Bayyaa EG
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0F2A4A] border-2 border-[#FF6B00] shadow-md shadow-[#0F2A4A]/40 shrink-0 ${className}`}>
        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white p-0.5 border border-[#FF6B00]/40">
          {renderLogoImage()}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-white font-['Alexandria']">
            منصة بياع
          </span>
          <span className="text-[9px] text-amber-400 font-bold tracking-wider uppercase">
            Bayyaa Hub
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'standalone') {
    return (
      <div className={`relative rounded-3xl bg-[#FF6B00] p-2 shadow-2xl shadow-[#FF6B00]/40 border-3 border-white ring-4 ring-[#FF6B00]/30 shrink-0 flex items-center justify-center overflow-hidden ${className}`}>
        <div className="w-full h-full rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
          {renderLogoImage()}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {renderLogoImage()}
    </div>
  );
};

export default BayyaaLogo;
