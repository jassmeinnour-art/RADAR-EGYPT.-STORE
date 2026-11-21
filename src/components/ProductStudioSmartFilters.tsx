import React, { useState, useMemo } from 'react';
import { Palette, Sparkles, RotateCcw, Check } from 'lucide-react';

export type SmartFilterCategory = 'all' | 'commercial' | 'illustrative' | 'editorial';

export interface SmartArtisticFilter {
  id: string;
  label: string;
  category: Exclude<SmartFilterCategory, 'all'>;
  categoryLabel: string;
  description: string;
  cssFilter: string;
  swatchClass: string;
}

export const SMART_ARTISTIC_FILTERS: SmartArtisticFilter[] = [
  {
    id: 'none',
    label: 'النمط القياسي (واقعي)',
    category: 'commercial',
    categoryLabel: 'قياسي',
    description: 'تصوير واقعي مباشر للمنتج مع الخلفية المختارة دون تأثير فني إضافي.',
    cssFilter: '',
    swatchClass: 'from-slate-200 via-white to-slate-300',
  },
  {
    id: 'restaurant_pro',
    label: 'تصوير مطاعم احترافي',
    category: 'commercial',
    categoryLabel: 'تجاري وضيافة',
    description: 'إضاءة مطعم دافئة، عمق ميداني سينمائي وبوكيه ذهبي يبرز الشهية والفخامة.',
    cssFilter: 'contrast(108%) saturate(124%) sepia(14%) brightness(103%)',
    swatchClass: 'from-amber-800 via-orange-500 to-yellow-200',
  },
  {
    id: 'playful_cartoon',
    label: 'نمط كرتوني للتسويق المرح',
    category: 'illustrative',
    categoryLabel: 'كرتوني ومرح',
    description: 'تحويل المشهد إلى أسلوب كرتوني 3D مشرق بألوان مبهجة لحملات السوشيال المرحة.',
    cssFilter: 'saturate(160%) contrast(116%) brightness(106%)',
    swatchClass: 'from-pink-500 via-amber-400 to-sky-400',
  },
  {
    id: 'editorial_luxury',
    label: 'تحريري لمجلات الموضة',
    category: 'editorial',
    categoryLabel: 'إعلاني فاخر',
    description: 'تباين تحريري راقٍ مع ظلال هندسية نظيفة وتدرجات لونية متزنة للإعلانات الراقية.',
    cssFilter: 'contrast(118%) saturate(92%) brightness(98%)',
    swatchClass: 'from-zinc-800 via-stone-500 to-stone-200',
  },
  {
    id: 'watercolor_craft',
    label: 'ألوان مائية فنية',
    category: 'illustrative',
    categoryLabel: 'فني مرسوم',
    description: 'لوحة ألوان مائية ناعمة بلمسات فرشاة يدوية تناسب الهدايا والعطور والمنتجات الحرفية.',
    cssFilter: 'saturate(115%) contrast(94%) brightness(107%) sepia(8%)',
    swatchClass: 'from-teal-200 via-rose-200 to-amber-100',
  },
  {
    id: 'pop_art_bold',
    label: 'بوب آرت إعلاني جريء',
    category: 'illustrative',
    categoryLabel: 'جرافيك جريء',
    description: 'ألوان بوب آرت متباينة وخلفيات جرافيكية حيوية لجذب الانتباه الفوري في الإعلانات.',
    cssFilter: 'saturate(175%) contrast(126%) hue-rotate(-6deg)',
    swatchClass: 'from-rose-600 via-yellow-400 to-cyan-500',
  },
  {
    id: 'golden_vintage',
    label: 'كلاسيكي ذهبي (ريترو)',
    category: 'editorial',
    categoryLabel: 'كلاسيكي',
    description: 'دفء أفلام التصوير الكلاسيكية بلمسة حنين أنيقة تمنح المنتج طابعاً عريقاً وأصيلاً.',
    cssFilter: 'sepia(28%) contrast(106%) brightness(101%) saturate(112%)',
    swatchClass: 'from-amber-900 via-amber-500 to-stone-300',
  },
  {
    id: 'cafe_cozy',
    label: 'أجواء مقاهي دافئة',
    category: 'commercial',
    categoryLabel: 'ضيافة ومشروبات',
    description: 'إضاءة صباحية دافئة بطابع الكافيهات العصرية مع انعكاسات خشبية ناعمة.',
    cssFilter: 'sepia(16%) saturate(118%) brightness(104%) contrast(104%)',
    swatchClass: 'from-stone-700 via-amber-700 to-orange-200',
  },
];

const FILTER_CATEGORY_TABS: Array<{ id: SmartFilterCategory; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'commercial', label: 'تجاري وضيافة' },
  { id: 'illustrative', label: 'كرتوني ومرح' },
  { id: 'editorial', label: 'سينمائي وإعلاني' },
];

export interface ProductStudioSmartFiltersProps {
  selectedFilterId: string;
  onSelectFilter: (filter: SmartArtisticFilter) => void;
  onApplyFilterAndGenerate?: () => void;
  hasActiveVariation?: boolean;
  isCurrentVariationMatched?: boolean;
  isGenerating?: boolean;
}

export const ProductStudioSmartFilters: React.FC<ProductStudioSmartFiltersProps> = ({
  selectedFilterId,
  onSelectFilter,
  onApplyFilterAndGenerate,
  hasActiveVariation = false,
  isCurrentVariationMatched = false,
  isGenerating = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<SmartFilterCategory>('all');

  const visibleFilters = useMemo(() => {
    if (activeCategory === 'all') return SMART_ARTISTIC_FILTERS;
    return SMART_ARTISTIC_FILTERS.filter(
      (f) => f.id === 'none' || f.category === activeCategory
    );
  }, [activeCategory]);

  const activeFilter = useMemo(
    () => SMART_ARTISTIC_FILTERS.find((f) => f.id === selectedFilterId) || SMART_ARTISTIC_FILTERS[0],
    [selectedFilterId]
  );

  return (
    <section
      aria-label="قائمة الفلاتر الذكية للأنماط الفنية"
      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            <span>3. الفلاتر الذكية (أنماط فنية جاهزة)</span>
          </h2>
          {activeFilter.id !== 'none' && (
            <button
              type="button"
              onClick={() => onSelectFilter(SMART_ARTISTIC_FILTERS[0])}
              className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-amber-500 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إلغاء الفلتر</span>
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          حوّل صورة منتجك إلى نمط فني احترافي (تصوير مطاعم، كرتوني مرح، أو تحريري) مع معاينة فورية وتوليد ذكي.
        </p>
      </div>

      {/* Category Switcher */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="تصنيف الفلاتر الذكية">
        {FILTER_CATEGORY_TABS.map((tab) => {
          const isTabActive = tab.id === activeCategory;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              aria-pressed={isTabActive}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer whitespace-nowrap shrink-0 ${
                isTabActive
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[var(--card-border-strong)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Smart Artistic Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-label="خيارات الفلاتر الذكية">
        {visibleFilters.map((filter) => {
          const isSelected = filter.id === selectedFilterId;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onSelectFilter(filter)}
              aria-pressed={isSelected}
              className={`text-right rounded-xl border p-3 transition-all cursor-pointer flex items-start gap-2.5 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-[var(--card-border-strong)]'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${filter.swatchClass} border border-black/10 shrink-0 mt-0.5 flex items-center justify-center`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-[var(--text-primary)] leading-snug">
                  {filter.label}
                </span>
                <span className="block text-[10px] font-semibold text-[var(--text-muted)] mt-0.5">
                  {filter.categoryLabel}
                </span>
                <span className="block text-[11px] text-[var(--text-secondary)] leading-snug mt-1">
                  {filter.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Status & 1-Click AI Re-Generation Bar */}
      {activeFilter.id !== 'none' && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-[var(--text-primary)] space-y-0.5">
            <div className="font-extrabold">
              الفلتر الذكي النشط: {activeFilter.label}
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              {hasActiveVariation
                ? isCurrentVariationMatched
                  ? 'الصورة المعروضة مولّدة بالفعل بهذا النمط الفني بالذكاء الاصطناعي.'
                  : 'تُعرض المعاينة اللونية الفورية للفلتر الآن؛ اضغط لتوليد المشهد بالكامل بهذا النمط.'
                : 'سيتم تحويل المشهد بالكامل إلى هذا النمط الفني عند الضغط على توليد.'}
            </div>
          </div>

          {hasActiveVariation && !isCurrentVariationMatched && onApplyFilterAndGenerate && (
            <button
              type="button"
              onClick={onApplyFilterAndGenerate}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد بالذكاء الاصطناعي بهذا الفلتر</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductStudioSmartFilters;
