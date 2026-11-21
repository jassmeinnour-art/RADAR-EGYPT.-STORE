import React, { useState, useEffect, useCallback } from 'react';
import {
  Images,
  ZoomIn,
  ZoomOut,
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Archive,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import type { GeneratedVariation } from './ProductImageStudio';

export interface ProductStudioThumbnailGalleryProps {
  variations: GeneratedVariation[];
  activeVariationId: string | null;
  onSelectVariation: (id: string) => void;
  onExportAll: () => void;
  isExportingAll: boolean;
  onDownloadVariation?: (variation: GeneratedVariation) => void;
  previewFilterStyle?: React.CSSProperties;
}

export const ProductStudioThumbnailGallery: React.FC<ProductStudioThumbnailGalleryProps> = ({
  variations,
  activeVariationId,
  onSelectVariation,
  onExportAll,
  isExportingAll,
  onDownloadVariation,
  previewFilterStyle,
}) => {
  const [quickViewIndex, setQuickViewIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const quickViewItem =
    quickViewIndex !== null && quickViewIndex >= 0 && quickViewIndex < variations.length
      ? variations[quickViewIndex]
      : null;

  const openQuickView = (index: number) => {
    const target = variations[index];
    if (!target) return;
    onSelectVariation(target.id);
    setZoomLevel(1);
    setQuickViewIndex(index);
  };

  const closeQuickView = useCallback(() => {
    setQuickViewIndex(null);
    setZoomLevel(1);
  }, []);

  const showPrevious = useCallback(() => {
    setQuickViewIndex((prev) => {
      if (prev === null || variations.length === 0) return prev;
      setZoomLevel(1);
      return (prev - 1 + variations.length) % variations.length;
    });
  }, [variations.length]);

  const showNext = useCallback(() => {
    setQuickViewIndex((prev) => {
      if (prev === null || variations.length === 0) return prev;
      setZoomLevel(1);
      return (prev + 1) % variations.length;
    });
  }, [variations.length]);

  useEffect(() => {
    if (quickViewIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeQuickView();
      } else if (e.key === 'ArrowLeft') {
        showNext();
      } else if (e.key === 'ArrowRight') {
        showPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewIndex, closeQuickView, showNext, showPrevious]);

  if (variations.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="معرض مصغر للصور المولدة"
      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm space-y-3"
    >
      {/* Gallery Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Images className="w-4 h-4 text-amber-500" />
            <span>معرض مصغر (Gallery)</span>
          </h3>
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">
            سجل التصاميم المولدة في هذه الجلسة ({variations.length}) — اضغط على أي صورة للتكبير السريع
          </p>
        </div>

        <button
          type="button"
          onClick={onExportAll}
          disabled={isExportingAll}
          aria-label="تصدير الكل كملف ZIP مضغوط"
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-extrabold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          {isExportingAll ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>جاري ضغط الملفات...</span>
            </>
          ) : (
            <>
              <Archive className="w-3.5 h-3.5" />
              <span>تصدير الكل (ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Thumbnail Grid */}
      <div
        role="list"
        aria-label="شبكة الصور المولدة"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {variations.map((item, idx) => {
          const isActive = item.id === activeVariationId;
          return (
            <div
              key={item.id}
              role="listitem"
              className={`group relative rounded-xl border p-2 transition ${
                isActive
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-[var(--card-border-strong)]'
              }`}
            >
              <button
                type="button"
                onClick={() => openQuickView(idx)}
                aria-label={`تكبير سريع: ${item.styleLabel} (${item.aspectRatio})`}
                className="w-full text-right cursor-pointer focus:outline-none"
              >
                <div className="relative w-full h-28 rounded-lg overflow-hidden mb-1.5 bg-slate-950/20">
                  <img
                    src={item.imageUrl}
                    alt={`${item.productTitle} - ${item.styleLabel}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/35 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition px-2.5 py-1 rounded-lg bg-slate-950/85 text-white text-[10px] font-extrabold flex items-center gap-1 shadow">
                      <ZoomIn className="w-3 h-3 text-amber-400" />
                      <span>تكبير سريع</span>
                    </span>
                  </span>
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/75 text-white text-[10px] font-mono font-bold">
                    {item.aspectRatio}
                  </span>
                </div>

                <div className="text-[11px] font-extrabold text-[var(--text-primary)] truncate">
                  {item.styleLabel}
                </div>
                {item.artisticFilterLabel && (
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 truncate">
                    {item.artisticFilterLabel}
                  </div>
                )}
                <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center justify-between gap-1 mt-0.5">
                  <span>{item.width}×{item.height}</span>
                  <span>{item.createdAt}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick View Lightbox Modal */}
      {quickViewItem && quickViewIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="التكبير السريع للصورة (Quick View)"
          className="fixed inset-0 z-[180] bg-slate-950/85 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center"
          onClick={closeQuickView}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-[var(--card-border-strong)] bg-[var(--card-bg)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[var(--divider-color)] flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[var(--text-primary)] truncate flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>التكبير السريع (Quick View) — {quickViewItem.productTitle}</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {quickViewItem.styleLabel}
                  {quickViewItem.artisticFilterLabel ? ` · ${quickViewItem.artisticFilterLabel}` : ''} •{' '}
                  {quickViewItem.platformLabel} ({quickViewItem.width}×{quickViewItem.height})
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
                  disabled={zoomLevel <= 1}
                  aria-label="تصغير العرض"
                  className="p-2 rounded-lg border border-[var(--card-border)] bg-[var(--surface-subtle)] text-[var(--text-primary)] disabled:opacity-40 hover:border-amber-500 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-[var(--text-secondary)]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.5).toFixed(1))))}
                  disabled={zoomLevel >= 2.5}
                  aria-label="تكبير العرض"
                  className="p-2 rounded-lg border border-[var(--card-border)] bg-[var(--surface-subtle)] text-[var(--text-primary)] disabled:opacity-40 hover:border-amber-500 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeQuickView}
                  aria-label="إغلاق التكبير السريع"
                  className="p-2 rounded-lg border border-[var(--card-border)] bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-rose-500/15 hover:text-rose-500 cursor-pointer mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Zoomed Viewport */}
            <div className="relative flex-1 min-h-[300px] max-h-[65vh] bg-slate-950/60 overflow-auto p-4 flex items-center justify-center">
              {variations.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="الصورة السابقة"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-slate-950 transition shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="الصورة التالية"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-slate-950 transition shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              <img
                src={quickViewItem.imageUrl}
                alt={`تكبير سريع - ${quickViewItem.styleLabel}`}
                style={{
                  ...previewFilterStyle,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
                className="max-h-[58vh] w-auto object-contain rounded-xl shadow-xl transition-transform duration-200"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-[var(--divider-color)] bg-[var(--surface-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-[var(--text-secondary)]">
                صورة {quickViewIndex + 1} من {variations.length} • {quickViewItem.aspectRatio} • {quickViewItem.resolution}
              </div>

              <div className="flex items-center gap-2">
                {onDownloadVariation && (
                  <button
                    type="button"
                    onClick={() => onDownloadVariation(quickViewItem)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل هذه الصورة</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeQuickView}
                  className="px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] font-bold text-xs hover:border-amber-500 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductStudioThumbnailGallery;
