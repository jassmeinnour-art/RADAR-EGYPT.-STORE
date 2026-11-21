import React, { useState, useMemo } from 'react';
import { LayoutTemplate, Sun, Maximize2, Palette, Check } from 'lucide-react';
import type { AspectRatioOption, ResolutionOption } from './ProductImageStudio';

export type TemplateCategory = 'all' | 'social' | 'ecommerce' | 'luxury' | 'campaign';

export interface StudioDesignTemplate {
  id: string;
  title: string;
  category: Exclude<TemplateCategory, 'all'>;
  categoryLabel: string;
  description: string;
  stylePresetId: string;
  styleLabel: string;
  platformPresetId: string;
  platformLabel: string;
  aspectRatio: AspectRatioOption;
  dimensionsLabel: string;
  resolution: ResolutionOption;
  lightingLabel: string;
  lightingPrompt: string;
  brightness: number;
  contrast: number;
  swatchClass: string;
}

export const STUDIO_DESIGN_TEMPLATES: StudioDesignTemplate[] = [
  {
    id: 'instagram_luxury_studio',
    title: 'قالب إنستغرام الرخامي الفاخر',
    category: 'luxury',
    categoryLabel: 'فخامة وعطور',
    description: 'مثالي للعطور ومستحضرات التجميل والساعات على رخام كارارا.',
    stylePresetId: 'luxury_marble',
    styleLabel: 'رخام فاخر',
    platformPresetId: 'instagram_post',
    platformLabel: 'بوست إنستغرام',
    aspectRatio: '1:1',
    dimensionsLabel: '1080×1080',
    resolution: '1K',
    lightingLabel: 'إضاءة استوديو دافئة متوازنة',
    lightingPrompt: 'Soft warm commercial key light with delicate golden rim highlights and crisp contact shadow.',
    brightness: 103,
    contrast: 106,
    swatchClass: 'from-stone-200 via-amber-100 to-slate-300',
  },
  {
    id: 'reels_modern_daylight',
    title: 'قالب ريلز وتيك توك العصري',
    category: 'social',
    categoryLabel: 'سوشيال ميديا',
    description: 'لقطة طولية كاملة بأجواء منزلية مضيئة تجذب الانتباه في الفيديوهات والقصص.',
    stylePresetId: 'modern_cairo_living',
    styleLabel: 'ديكور منزلي',
    platformPresetId: 'instagram_story_reels',
    platformLabel: 'ستوري / ريلز',
    aspectRatio: '9:16',
    dimensionsLabel: '1080×1920',
    resolution: '1K',
    lightingLabel: 'ضوء شمس نهاري ناعم',
    lightingPrompt: 'Airy morning window sunlight with soft sheer curtain shadows and bright lifestyle ambiance.',
    brightness: 106,
    contrast: 102,
    swatchClass: 'from-amber-100 via-orange-100 to-stone-200',
  },
  {
    id: 'marketplace_pure_white',
    title: 'قالب أمازون ونون القياسي',
    category: 'ecommerce',
    categoryLabel: 'متاجر إلكترونية',
    description: 'خلفية بيضاء نقية مطابقة لسياسات المتاجر الكبرى مع إضاءة واضحة للمنتج.',
    stylePresetId: 'pure_commercial_white',
    styleLabel: 'خلفية بيضاء',
    platformPresetId: 'instagram_post',
    platformLabel: 'متاجر 1:1',
    aspectRatio: '1:1',
    dimensionsLabel: '1080×1080',
    resolution: '1K',
    lightingLabel: 'إضاءة سوفت بوكس ساطعة',
    lightingPrompt: 'High-key dual softbox commercial e-commerce lighting on pure seamless white surface.',
    brightness: 105,
    contrast: 103,
    swatchClass: 'from-white via-slate-100 to-sky-100',
  },
  {
    id: 'arabesque_golden_campaign',
    title: 'قالب العروض الشرقية والذهبية',
    category: 'campaign',
    categoryLabel: 'حملات وعروض',
    description: 'مناسب للعروض الموسمية والهدايا مع إضاءة نحاسية دافئة وأبعاد بورتريه.',
    stylePresetId: 'ramadan_arabesque',
    styleLabel: 'أرابيسك شرقي',
    platformPresetId: 'instagram_portrait',
    platformLabel: 'إنستغرام طولي',
    aspectRatio: '3:4',
    dimensionsLabel: '1080×1440',
    resolution: '1K',
    lightingLabel: 'إضاءة درامية ذهبية دافئة',
    lightingPrompt: 'Warm golden ambient bokeh glow with subtle brushed brass reflections and rich contrast.',
    brightness: 98,
    contrast: 110,
    swatchClass: 'from-amber-900 via-amber-600 to-yellow-400',
  },
  {
    id: 'tech_neon_facebook',
    title: 'قالب الإلكترونيات والتقنية',
    category: 'social',
    categoryLabel: 'سوشيال ميديا',
    description: 'خلفية داكنة عصرية تبرز الأجهزة الذكية والإكسسوارات بإضاءة حواف قوية.',
    stylePresetId: 'neon_tech',
    styleLabel: 'تقني داكن',
    platformPresetId: 'facebook_post',
    platformLabel: 'فيسبوك / إكس',
    aspectRatio: '4:3',
    dimensionsLabel: '1440×1080',
    resolution: '1K',
    lightingLabel: 'إضاءة نيون متباينة',
    lightingPrompt: 'Dramatic cyan and amber studio rim lighting on matte dark slate with sharp metallic highlights.',
    brightness: 100,
    contrast: 114,
    swatchClass: 'from-slate-900 via-cyan-800 to-amber-600',
  },
  {
    id: 'botanical_youtube_banner',
    title: 'قالب البنرات والطبيعة المنعشة',
    category: 'campaign',
    categoryLabel: 'حملات وعروض',
    description: 'بنر عريض لإعلانات المتجر وغلاف اليوتيوب بلمسة طبيعية مشرقة.',
    stylePresetId: 'nature_botanical',
    styleLabel: 'حجر ونباتات',
    platformPresetId: 'youtube_banner',
    platformLabel: 'بنر عريض 16:9',
    aspectRatio: '16:9',
    dimensionsLabel: '1920×1080',
    resolution: '1K',
    lightingLabel: 'إضاءة شمس طبيعية منعشة',
    lightingPrompt: 'Crisp natural outdoor daylight filtering through botanical leaves with balanced composition space.',
    brightness: 104,
    contrast: 104,
    swatchClass: 'from-emerald-200 via-lime-100 to-stone-200',
  },
];

const CATEGORY_TABS: Array<{ id: TemplateCategory; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'ecommerce', label: 'متاجر إلكترونية' },
  { id: 'social', label: 'سوشيال ميديا' },
  { id: 'luxury', label: 'فخامة وعطور' },
  { id: 'campaign', label: 'حملات وعروض' },
];

export interface ProductStudioTemplatesProps {
  selectedTemplateId: string | null;
  onApplyTemplate: (template: StudioDesignTemplate) => void;
}

export const ProductStudioTemplates: React.FC<ProductStudioTemplatesProps> = ({
  selectedTemplateId,
  onApplyTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');

  const visibleTemplates = useMemo(() => {
    if (activeCategory === 'all') return STUDIO_DESIGN_TEMPLATES;
    return STUDIO_DESIGN_TEMPLATES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  return (
    <section
      aria-label="مكتبة قوالب التصميم الجاهزة"
      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-amber-500" />
            <span>مكتبة قوالب التصميم الجاهزة (Templates)</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            اختر قالباً متكاملاً لضبط الأبعاد والخلفية الديكورية وإعدادات الإضاءة بضغطة زر
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="تصنيف القوالب">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.id === activeCategory;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                aria-pressed={isActive}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[var(--card-border-strong)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visibleTemplates.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template)}
              aria-pressed={isSelected}
              className={`text-right rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40 shadow-sm'
                  : 'border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-amber-500/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${template.swatchClass} border border-black/10 shrink-0`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                        {template.title}
                      </div>
                      <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {template.categoryLabel}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" />
                      <span>مُطبّق</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Template Preset Specs Badges: Dimensions, Background, Lighting */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--divider-color)] text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)]">
                  <Maximize2 className="w-3 h-3 text-sky-500" />
                  <span>{template.aspectRatio} ({template.dimensionsLabel})</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)]">
                  <Palette className="w-3 h-3 text-amber-500" />
                  <span>{template.styleLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)]">
                  <Sun className="w-3 h-3 text-orange-500" />
                  <span>{template.lightingLabel}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProductStudioTemplates;
