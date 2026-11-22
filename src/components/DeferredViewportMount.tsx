import React, { useEffect, useRef, useState } from 'react';
import { usePerformanceMode } from '../context/PerformanceModeContext';

export interface DeferredViewportMountProps {
  children: React.ReactNode;
  sectionId?: string;
  minHeight?: number;
  label?: string;
  fallback?: React.ReactNode;
  /**
   * When true, enforces strict IntersectionObserver deferral even if Performance Mode is off.
   * By default, strict offscreen gating activates automatically whenever Performance Mode is on.
   */
  alwaysDefer?: boolean;
  onVisible?: () => void;
}

export const DeferredViewportMount: React.FC<DeferredViewportMountProps> = ({
  children,
  sectionId,
  minHeight = 160,
  label,
  fallback,
  alwaysDefer = false,
  onVisible,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const shouldGate = isPerformanceMode || alwaysDefer;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState<boolean>(() => !shouldGate);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (!shouldGate) {
      setHasIntersected(true);
      onVisibleRef.current?.();
      return;
    }

    if (hasIntersected) {
      onVisibleRef.current?.();
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      const timer = window.setTimeout(() => {
        setHasIntersected(true);
        onVisibleRef.current?.();
      }, 250);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            onVisibleRef.current?.();
            observer.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: isPerformanceMode ? '0px' : '220px',
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldGate, hasIntersected, isPerformanceMode]);

  const isMounted = !shouldGate || hasIntersected;

  return (
    <div
      ref={containerRef}
      data-deferred-section={sectionId}
      data-deferred-mounted={isMounted ? 'true' : 'false'}
      style={!isMounted ? { minHeight: `${minHeight}px` } : undefined}
    >
      {isMounted ? (
        children
      ) : (
        fallback || (
          <div
            aria-label={label ? `تحميل مؤجل: ${label}` : 'محتوى مؤجل لتحسين الأداء'}
            className="w-full h-full min-h-[inherit] rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)]/40 flex flex-col items-center justify-center gap-2 p-6 text-center"
          >
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {label ? `سيتم تحميل «${label}» عند التمرير لتحسين سرعة الصفحة` : 'سيتم التحميل عند التمرير لتحسين الأداء'}
            </span>
          </div>
        )
      )}
    </div>
  );
};

export default DeferredViewportMount;
