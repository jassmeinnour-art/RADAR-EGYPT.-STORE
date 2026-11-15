import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface VirtualProductGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  estimatedRowHeight?: number;
  rowGap?: number;
  overscanRows?: number;
  maxViewportHeight?: number;
  className?: string;
}

function getColumnCount(width: number): number {
  if (width >= 1024) return 3; // lg:grid-cols-3
  if (width >= 768) return 2;  // md:grid-cols-2
  return 1;                    // grid-cols-1
}

export function VirtualProductGrid<T>({
  items,
  renderItem,
  keyExtractor,
  estimatedRowHeight = 430,
  rowGap = 20,
  overscanRows = 2,
  maxViewportHeight = 760,
  className = '',
}: VirtualProductGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [viewportHeight, setViewportHeight] = useState<number>(maxViewportHeight);

  const measureContainer = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      const measuredW = el.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280);
      const measuredH = el.clientHeight || maxViewportHeight;
      setViewportWidth(measuredW);
      setViewportHeight(measuredH > 0 ? measuredH : maxViewportHeight);
    } else if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);
    }
  }, [maxViewportHeight]);

  useEffect(() => {
    measureContainer();

    const el = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measureContainer();
      });
      ro.observe(el);
    }

    const onWindowResize = () => measureContainer();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onWindowResize, { passive: true });
    }

    return () => {
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onWindowResize);
      }
    };
  }, [measureContainer]);

  // Reset scroll position when dataset changes significantly (e.g., new filter applied)
  useEffect(() => {
    if (containerRef.current && scrollTop > 0 && items.length === 0) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const nextTop = e.currentTarget.scrollTop;
    setScrollTop(nextTop);
  }, []);

  const columnCount = useMemo(() => getColumnCount(viewportWidth), [viewportWidth]);
  const rowStride = estimatedRowHeight + rowGap;
  const totalRows = Math.ceil(items.length / columnCount);

  const { startRow, endRow, topSpacerHeight, bottomSpacerHeight } = useMemo(() => {
    if (totalRows === 0) {
      return { startRow: 0, endRow: -1, topSpacerHeight: 0, bottomSpacerHeight: 0 };
    }
    const visibleStart = Math.floor(scrollTop / rowStride);
    const visibleEnd = Math.ceil((scrollTop + viewportHeight) / rowStride);

    const sRow = Math.max(0, visibleStart - overscanRows);
    const eRow = Math.min(totalRows - 1, visibleEnd + overscanRows);

    const topSpacer = sRow * rowStride;
    const remainingRows = Math.max(0, totalRows - 1 - eRow);
    const bottomSpacer = remainingRows * rowStride;

    return {
      startRow: sRow,
      endRow: eRow,
      topSpacerHeight: topSpacer,
      bottomSpacerHeight: bottomSpacer,
    };
  }, [totalRows, scrollTop, rowStride, viewportHeight, overscanRows]);

  const visibleSlice = useMemo(() => {
    if (endRow < startRow) return [];
    const startIdx = startRow * columnCount;
    const endIdx = Math.min(items.length, (endRow + 1) * columnCount);
    return items.slice(startIdx, endIdx).map((item, offset) => ({
      item,
      index: startIdx + offset,
    }));
  }, [items, startRow, endRow, columnCount]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      role="region"
      aria-label="شبكة المنتجات الافتراضية"
      data-testid="virtual-product-grid"
      data-total-items={items.length}
      data-rendered-items={visibleSlice.length}
      data-columns={columnCount}
      style={{ maxHeight: `${maxViewportHeight}px` }}
      className={`overflow-y-auto overflow-x-hidden pr-1 scroll-smooth ${className}`}
      dir="rtl"
    >
      {topSpacerHeight > 0 && (
        <div
          aria-hidden="true"
          data-testid="virtual-top-spacer"
          style={{ height: `${topSpacerHeight}px` }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleSlice.map(({ item, index }) => (
          <div key={keyExtractor(item, index)} className="min-h-[400px]">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {bottomSpacerHeight > 0 && (
        <div
          aria-hidden="true"
          data-testid="virtual-bottom-spacer"
          style={{ height: `${bottomSpacerHeight}px` }}
        />
      )}
    </div>
  );
}

export default VirtualProductGrid;
