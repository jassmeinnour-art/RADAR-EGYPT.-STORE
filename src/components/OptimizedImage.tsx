import React, { useState, useMemo, useEffect } from 'react';
import { Package } from 'lucide-react';

const LOADED_CACHE_KEY = 'radar_loaded_images_v1';

// In-memory + session cache of verified loaded image URLs so navigating pages never flickers
const loadedImageUrls = new Set<string>(
  (() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(LOADED_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  })()
);

function markImageLoaded(url: string) {
  if (!url || loadedImageUrls.has(url)) return;
  loadedImageUrls.add(url);
  try {
    if (typeof sessionStorage !== 'undefined') {
      const arr = Array.from(loadedImageUrls).slice(-300);
      sessionStorage.setItem(LOADED_CACHE_KEY, JSON.stringify(arr));
    }
  } catch {}
}

/**
 * Rewrites oversized CDN image URLs (Amazon, Unsplash, etc.) into lightweight thumbnails.
 */
export function getOptimizedThumbnailUrl(rawUrl?: string | null, maxWidth = 360): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  if (!url || url === '/placeholder-product.png') return '';

  // Amazon media CDN thumbnail optimization
  if (url.includes('media-amazon.com/images/') || url.includes('ssl-images-amazon.com/images/')) {
    return url.replace(/\._[A-Z0-9,_]+_\.(jpg|jpeg|png|webp)/i, `._AC_US${maxWidth}_.$1`);
  }

  // Unsplash optimization
  if (url.includes('images.unsplash.com/')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(maxWidth));
      u.searchParams.set('q', '75');
      u.searchParams.set('auto', 'format');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  asin?: string | null;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  objectFit?: 'cover' | 'contain';
  emptyLabel?: string;
  maxThumbWidth?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  asin,
  width = 320,
  height = 200,
  className = '',
  containerClassName = 'w-full h-[200px]',
  objectFit = 'cover',
  emptyLabel = 'لا توجد صورة',
  maxThumbWidth = 360,
}) => {
  const cleanAsin = useMemo(() => String(asin || '').trim().toUpperCase(), [asin]);
  const optimizedSrc = useMemo(() => getOptimizedThumbnailUrl(src, maxThumbWidth), [src, maxThumbWidth]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => Boolean(optimizedSrc && loadedImageUrls.has(optimizedSrc)));

  useEffect(() => {
    setHasError(false);
    setIsLoaded(Boolean(optimizedSrc && loadedImageUrls.has(optimizedSrc)));
  }, [optimizedSrc]);

  const showFallback = !optimizedSrc || hasError;

  if (showFallback) {
    return (
      <div
        data-testid={cleanAsin ? `asin-placeholder-${cleanAsin}` : 'image-placeholder'}
        className={`${containerClassName} bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center gap-2 text-slate-300 select-none shrink-0 p-3`}
        style={{ height: height ? `${height}px` : undefined }}
      >
        {cleanAsin ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <span
              dir="ltr"
              className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 font-mono text-xs font-black text-sky-300 tracking-wider"
            >
              ASIN: {cleanAsin}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">صورة المنتج غير متوفرة حالياً</span>
          </>
        ) : (
          <span className="text-xs font-bold text-slate-400">{emptyLabel}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${containerClassName} bg-slate-800 rounded-2xl border border-slate-800 overflow-hidden relative shrink-0`}
      style={{ height: height ? `${height}px` : undefined }}
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          const img = e.currentTarget;
          // Amazon P-style CDN sometimes returns a 1x1 transparent GIF for missing catalog images
          if (img.naturalWidth > 0 && (img.naturalWidth <= 1 || img.naturalHeight <= 1)) {
            setHasError(true);
            return;
          }
          markImageLoaded(optimizedSrc);
          if (!isLoaded) setIsLoaded(true);
        }}
        onError={() => setHasError(true)}
        className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
