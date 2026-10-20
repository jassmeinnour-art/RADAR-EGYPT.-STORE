import React, { useState, useEffect, useRef } from 'react';

export interface SafeResponsiveContainerProps {
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  minHeight?: number;
  debounce?: number;
  children: React.ReactElement;
}

/**
 * Drop-in replacement for Recharts' ResponsiveContainer that uses a clean
 * ResizeObserver and clones its chart child with explicit pixel `width` and `height`.
 * This prevents the React 19 + Recharts 2.15 internal Redux store subscription
 * infinite loop ("Maximum update depth exceeded" inside forceStoreRerender).
 */
export const SafeResponsiveContainer: React.FC<SafeResponsiveContainerProps> = ({
  minHeight = 280,
  height,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedFixedHeight =
    typeof height === 'number' && height > 0
      ? height
      : typeof minHeight === 'number' && minHeight > 0
      ? minHeight
      : 300;

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 720,
    height: resolvedFixedHeight,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let isMounted = true;

    const measure = () => {
      if (!isMounted || !el) return;
      const parentEl = el.parentElement;
      const rawWidth = parentEl ? parentEl.clientWidth || el.clientWidth : el.clientWidth;
      const nextWidth = Math.max(260, Math.floor(rawWidth || 720));

      // Always use resolvedFixedHeight to avoid feedback loop with container's own inline height
      const nextHeight = resolvedFixedHeight;

      setDimensions((prev) => {
        if (Math.abs(prev.width - nextWidth) <= 4 && prev.height === nextHeight) {
          return prev;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(measure);
      });
      observer.observe(el);
      return () => {
        isMounted = false;
        if (rafId !== null) cancelAnimationFrame(rafId);
        observer.disconnect();
      };
    } else {
      window.addEventListener('resize', measure);
      return () => {
        isMounted = false;
        window.removeEventListener('resize', measure);
      };
    }
  }, [resolvedFixedHeight]);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0 overflow-hidden"
      style={{
        height: `${dimensions.height}px`,
        minHeight: `${resolvedFixedHeight}px`,
      }}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            width: dimensions.width,
            height: dimensions.height,
          })
        : children}
    </div>
  );
};
