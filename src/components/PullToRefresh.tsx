import React, { useCallback, useRef, useState } from 'react';
import { ArrowDown, CheckCircle2, RefreshCw } from 'lucide-react';

export const RADAR_PULL_TO_REFRESH_EVENT = 'radar_pull_to_refresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const PULL_THRESHOLD = 64;
const MAX_PULL_DISTANCE = 104;
const ACTIVATION_DEADZONE = 12;

function hasScrolledAncestor(target: EventTarget | null, boundaryEl: HTMLElement | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  let current: HTMLElement | null = target;
  while (current && current !== boundaryEl && current !== document.body) {
    if (current.dataset?.noPullRefresh !== undefined) {
      return true;
    }
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
    if (isScrollable && current.scrollTop > 2) {
      return true;
    }
    // Skip pull gesture inside fixed overlays/modals
    if (style.position === 'fixed') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isInteractiveInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isTrackingRef = useRef<boolean>(false);

  const [pullDistance, setPullDistance] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'done'>('idle');

  const resetGesture = useCallback(() => {
    startYRef.current = null;
    startXRef.current = null;
    isTrackingRef.current = false;
    setPullDistance(0);
    setStatus('idle');
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || status === 'refreshing' || e.touches.length !== 1) return;
    if (typeof window !== 'undefined' && window.scrollY > 2) return;
    if (isInteractiveInput(e.target)) return;
    if (hasScrolledAncestor(e.target, containerRef.current)) return;

    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
    isTrackingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isTrackingRef.current || startYRef.current === null || startXRef.current === null) return;
    if (status === 'refreshing' || e.touches.length !== 1) return;

    if (typeof window !== 'undefined' && window.scrollY > 2) {
      resetGesture();
      return;
    }

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startYRef.current;
    const deltaX = Math.abs(currentX - startXRef.current);

    // Abort if user is swiping horizontally or scrolling upward
    if (deltaY <= 0 || (deltaX > 16 && deltaX > deltaY)) {
      if (pullDistance > 0) {
        resetGesture();
      } else {
        isTrackingRef.current = false;
      }
      return;
    }

    if (deltaY <= ACTIVATION_DEADZONE) {
      return;
    }

    const damped = Math.min(MAX_PULL_DISTANCE, Math.round((deltaY - ACTIVATION_DEADZONE) * 0.48));
    setPullDistance(damped);
    setStatus(damped >= PULL_THRESHOLD ? 'ready' : 'pulling');
  };

  const handleTouchEnd = async () => {
    if (!isTrackingRef.current) return;
    isTrackingRef.current = false;
    startYRef.current = null;
    startXRef.current = null;

    if (pullDistance < PULL_THRESHOLD) {
      setPullDistance(0);
      setStatus('idle');
      return;
    }

    setStatus('refreshing');
    setPullDistance(54);

    const startedAt = Date.now();
    try {
      await Promise.resolve(onRefresh());
    } catch (err) {
      console.warn('[PullToRefresh] Refresh callback error:', err);
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < 450) {
      await new Promise((resolve) => window.setTimeout(resolve, 450 - elapsed));
    }

    setStatus('done');
    window.setTimeout(() => {
      setPullDistance(0);
      setStatus('idle');
    }, 850);
  };

  const showIndicator = status !== 'idle' || pullDistance > 0;
  const indicatorOpacity = status === 'refreshing' || status === 'done'
    ? 1
    : Math.min(1, Math.max(0.15, pullDistance / PULL_THRESHOLD));

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetGesture}
      className={`relative ${className}`}
    >
      {/* Floating Pull-to-Refresh Status Pill Indicator */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-16 inset-x-0 z-30 flex justify-center px-4 transition-opacity duration-200"
        style={{
          opacity: showIndicator ? indicatorOpacity : 0,
          transform: `translate3d(0, ${showIndicator ? Math.max(4, Math.min(28, pullDistance * 0.35)) : -24}px, 0)`,
        }}
      >
        <div
          dir="rtl"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-black transition-colors duration-150 ${
            status === 'done'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-300'
              : status === 'ready' || status === 'refreshing'
              ? 'bg-slate-900/95 border-amber-500/50 text-amber-300'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-200'
          }`}
        >
          {status === 'refreshing' ? (
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          ) : status === 'done' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ArrowDown
              className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-150"
              style={{
                transform: status === 'ready' ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
          <span className="whitespace-nowrap">
            {status === 'refreshing'
              ? 'جارٍ تحديث ومزامنة البيانات...'
              : status === 'done'
              ? 'تم تحديث البيانات بنجاح'
              : status === 'ready'
              ? 'أفلت الآن لتحديث البيانات'
              : 'اسحب للأسفل لتحديث البيانات'}
          </span>
        </div>
      </div>

      {/* Smooth Content Pull Displacement (Compositor-only transform) */}
      <div
        className="transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: pullDistance > 0 ? `translate3d(0, ${pullDistance}px, 0)` : 'translate3d(0, 0, 0)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
