import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  Moon,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  DARK_PALETTE_PRESETS,
  type DarkPaletteId,
  type DarkPaletteTokenKey,
  buildCssVariableMapFromDarkTokens,
  getContrastGrade,
  getContrastRatio,
  isValidHexColor,
  normalizeHexColor,
  useTheme,
} from '../context/ThemeContext';

interface DarkPaletteSettingsPageProps {
  onShowToast?: (message: string) => void;
}

interface TokenFieldMeta {
  key: DarkPaletteTokenKey;
  cssVar: string;
  label: string;
  description: string;
  group: 'surfaces' | 'shell' | 'typography';
}

const TOKEN_FIELDS: TokenFieldMeta[] = [
  // Surfaces & Borders
  {
    key: 'appBg',
    cssVar: '--app-bg',
    label: 'خلفية التطبيق الرئيسية',
    description: 'لون الخلفية الأساسية لجميع صفحات النظام.',
    group: 'surfaces',
  },
  {
    key: 'appBgSecondary',
    cssVar: '--app-bg-secondary',
    label: 'الخلفية الثانوية',
    description: 'تُستخدم للمناطق الغائرة والفواصل الخفيفة.',
    group: 'surfaces',
  },
  {
    key: 'cardBg',
    cssVar: '--card-bg',
    label: 'خلفية البطاقات والحاويات',
    description: 'سطح بطاقات الإحصائيات والنماذج والجداول.',
    group: 'surfaces',
  },
  {
    key: 'surfaceElevated',
    cssVar: '--surface-elevated',
    label: 'الأسطح المرتفعة',
    description: 'القوائم المنسدلة وحالات التحويم والبطاقات المتداخلة.',
    group: 'surfaces',
  },
  {
    key: 'cardBorder',
    cssVar: '--card-border',
    label: 'لون الحدود والفواصل',
    description: 'الخطوط الرفيعة حول البطاقات والجداول والسايدبار.',
    group: 'surfaces',
  },
  // Navigation & Inputs
  {
    key: 'sidebarBg',
    cssVar: '--sidebar-bg',
    label: 'خلفية القائمة الجانبية',
    description: 'لون الخلفية الخاص بشريط التنقل الجانبي.',
    group: 'shell',
  },
  {
    key: 'headerBg',
    cssVar: '--header-bg',
    label: 'خلفية الشريط العلوي',
    description: 'شريط العنوان العلوي وأدوات الوصول السريع.',
    group: 'shell',
  },
  {
    key: 'inputBg',
    cssVar: '--input-bg',
    label: 'خلفية حقول الإدخال',
    description: 'مربعات البحث، القوائم المنسدلة، وحقول النماذج.',
    group: 'shell',
  },
  {
    key: 'inputBorder',
    cssVar: '--input-border',
    label: 'حدود حقول الإدخال',
    description: 'إطار الحقول التفاعلية في الوضع الليلي.',
    group: 'shell',
  },
  {
    key: 'tableHeaderBg',
    cssVar: '--table-header-bg',
    label: 'خلفية ترويسة الجداول',
    description: 'رأس الجداول في تقارير الأسعار والمنتجات.',
    group: 'shell',
  },
  // Typography & Accents
  {
    key: 'textPrimary',
    cssVar: '--text-primary',
    label: 'لون النص الأساسي',
    description: 'العناوين والأرقام الرئيسية والقيم المهمة.',
    group: 'typography',
  },
  {
    key: 'textSecondary',
    cssVar: '--text-secondary',
    label: 'لون النص الثانوي',
    description: 'الأوصاف والتسميات التوضيحية والنصوص المساعدة.',
    group: 'typography',
  },
  {
    key: 'primaryColor',
    cssVar: '--primary-color',
    label: 'اللون الأساسي (Primary)',
    description: 'الأزرار الأساسية، العنصر النشط في القائمة، والتركيز.',
    group: 'typography',
  },
  {
    key: 'accentColor',
    cssVar: '--accent-color',
    label: 'لون التمييز والمؤشرات (Accent)',
    description: 'مؤشرات الرسوم البيانية والروابط وحالات التركيز.',
    group: 'typography',
  },
];

const GROUP_TITLES: Record<TokenFieldMeta['group'], { title: string; subtitle: string }> = {
  surfaces: {
    title: 'الخلفيات والأسطح والحدود',
    subtitle: 'ضبط التدرج الطبقي بين الخلفية العامة، البطاقات، والفواصل',
  },
  shell: {
    title: 'القائمة الجانبية والهيدر والحقول',
    subtitle: 'تخصيص هيكل التنقل ومناطق إدخال البيانات والجداول',
  },
  typography: {
    title: 'النصوص والألوان التفاعلية',
    subtitle: 'التحكم في وضوح النصوص وألوان العلامة والتفاعل',
  },
};

export const DarkPaletteSettingsPage: React.FC<DarkPaletteSettingsPageProps> = ({
  onShowToast,
}) => {
  const {
    resolvedColorMode,
    toggleColorMode,
    isHighContrast,
    setHighContrast,
    darkPalette,
    activeDarkTokens,
    setDarkPalette,
    updateDarkToken,
    resetDarkPalette,
    enableDarkModeWithPalette,
  } = useTheme();

  const [activeGroup, setActiveGroup] = useState<TokenFieldMeta['group'] | 'all'>('all');
  const [hexDrafts, setHexDrafts] = useState<Partial<Record<DarkPaletteTokenKey, string>>>({});
  const [copiedCss, setCopiedCss] = useState(false);

  const presetList = useMemo(
    () => [
      DARK_PALETTE_PRESETS.default,
      DARK_PALETTE_PRESETS['deep-blue'],
      DARK_PALETTE_PRESETS.charcoal,
      DARK_PALETTE_PRESETS['dark-gray'],
    ],
    []
  );

  const contrastChecks = useMemo(() => {
    const primaryOnCard = getContrastRatio(activeDarkTokens.textPrimary, activeDarkTokens.cardBg);
    const secondaryOnCard = getContrastRatio(activeDarkTokens.textSecondary, activeDarkTokens.cardBg);
    const primaryAccentOnApp = getContrastRatio(activeDarkTokens.primaryColor, activeDarkTokens.appBg);

    return [
      {
        id: 'primary-text',
        label: 'النص الأساسي / البطاقة',
        vars: '--text-primary · --card-bg',
        ratio: primaryOnCard,
        grade: getContrastGrade(primaryOnCard),
        passing: primaryOnCard >= 4.5,
      },
      {
        id: 'secondary-text',
        label: 'النص الثانوي / البطاقة',
        vars: '--text-secondary · --card-bg',
        ratio: secondaryOnCard,
        grade: getContrastGrade(secondaryOnCard),
        passing: secondaryOnCard >= 4.5,
      },
      {
        id: 'accent-bg',
        label: 'اللون التفاعلي / الخلفية',
        vars: '--primary-color · --app-bg',
        ratio: primaryAccentOnApp,
        grade: getContrastGrade(primaryAccentOnApp),
        passing: primaryAccentOnApp >= 3,
      },
    ];
  }, [activeDarkTokens]);

  const generatedCssSnippet = useMemo(() => {
    const cssMap = buildCssVariableMapFromDarkTokens(activeDarkTokens);
    const lines = Object.entries(cssMap).map(([key, val]) => `  ${key}: ${val};`);
    return `html.dark[data-dark-palette="${darkPalette}"] {\n${lines.join('\n')}\n}`;
  }, [activeDarkTokens, darkPalette]);

  const previewVarsStyle = useMemo(
    () => buildCssVariableMapFromDarkTokens(activeDarkTokens) as React.CSSProperties,
    [activeDarkTokens]
  );

  const handleSelectPreset = (presetId: Exclude<DarkPaletteId, 'custom'>) => {
    setHexDrafts({});
    enableDarkModeWithPalette(presetId);
    const presetMeta = DARK_PALETTE_PRESETS[presetId];
    onShowToast?.(`تم تطبيق لوحة الوضع الليلي: ${presetMeta.label}`);
  };

  const handleColorPickerChange = (key: DarkPaletteTokenKey, value: string) => {
    const normalized = normalizeHexColor(value, activeDarkTokens[key]);
    setHexDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (resolvedColorMode !== 'dark') {
      enableDarkModeWithPalette();
    }
    updateDarkToken(key, normalized);
  };

  const handleHexTextChange = (key: DarkPaletteTokenKey, rawValue: string) => {
    setHexDrafts((prev) => ({ ...prev, [key]: rawValue }));
    if (isValidHexColor(rawValue)) {
      if (resolvedColorMode !== 'dark') {
        enableDarkModeWithPalette();
      }
      updateDarkToken(key, normalizeHexColor(rawValue, activeDarkTokens[key]));
    }
  };

  const handleHexTextBlur = (key: DarkPaletteTokenKey) => {
    setHexDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(generatedCssSnippet);
      setCopiedCss(true);
      onShowToast?.('تم نسخ متغيرات CSS الخاصة بالوضع الليلي.');
      window.setTimeout(() => setCopiedCss(false), 2200);
    } catch {
      onShowToast?.('تعذر النسخ التلقائي — يمكنك تحديد الكود ونسخه يدوياً.');
    }
  };

  const handleReset = () => {
    setHexDrafts({});
    resetDarkPalette();
    onShowToast?.('تمت استعادة لوحة الوضع الليلي القياسية (Obsidian Slate).');
  };

  const visibleGroups: TokenFieldMeta['group'][] =
    activeGroup === 'all' ? ['surfaces', 'shell', 'typography'] : [activeGroup];

  return (
    <div className="space-y-6 font-['Cairo']" dir="rtl">
      {/* Header Bar */}
      <section
        className="rounded-2xl border p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--card-border)',
                color: 'var(--primary-color)',
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate">
                لوحة ألوان الوضع الليلي المتقدمة
              </h1>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                تخصيص دقيق لألوان الوضع الليلي عبر متغيرات CSS وتطبيقها فورياً على جميع واجهات النظام.
              </p>
            </div>
          </div>

          <div
            className="text-[11px] font-mono tabular-nums flex flex-wrap items-center gap-x-2 gap-y-1 pt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>
              الحالة: {resolvedColorMode === 'dark' ? 'الوضع الليلي مفعّل' : 'الوضع النهاري نشط'}
            </span>
            <span aria-hidden="true">·</span>
            <span dir="ltr">data-dark-palette=&quot;{darkPalette}&quot;</span>
            <span aria-hidden="true">·</span>
            <span>{TOKEN_FIELDS.length} متغير CSS نشط</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="dark-palette-mode-toggle"
            onClick={() => {
              const nextIsDark = resolvedColorMode !== 'dark';
              toggleColorMode();
              onShowToast?.(
                nextIsDark
                  ? 'تم تفعيل الوضع الليلي وتطبيق لوحة الألوان المختارة.'
                  : 'تم التبديل إلى الوضع النهاري Clean Light.'
              );
            }}
            className="px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            style={{
              backgroundColor:
                resolvedColorMode === 'dark' ? 'var(--primary-color)' : 'var(--surface-elevated)',
              borderColor:
                resolvedColorMode === 'dark' ? 'var(--primary-color)' : 'var(--card-border)',
              color: resolvedColorMode === 'dark' ? '#020617' : 'var(--text-primary)',
            }}
          >
            {resolvedColorMode === 'dark' ? (
              <Moon className="w-4 h-4 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 shrink-0" />
            )}
            <span>
              {resolvedColorMode === 'dark' ? 'الوضع الليلي مفعّل' : 'تفعيل الوضع الليلي الآن'}
            </span>
          </button>

          <button
            type="button"
            data-testid="dark-palette-copy-css-btn"
            onClick={handleCopyCss}
            className="px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)',
            }}
          >
            {copiedCss ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{copiedCss ? 'تم النسخ' : 'نسخ CSS'}</span>
          </button>

          <button
            type="button"
            data-testid="dark-palette-reset-btn"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>استعادة الافتراضي</span>
          </button>
        </div>
      </section>

      {/* High Contrast notice if active */}
      {isHighContrast && (
        <div
          className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--primary-color)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="text-xs leading-relaxed">
            <strong className="font-black">وضع التباين العالي (High Contrast) مفعّل حالياً:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              يفرض التباين الفائق أولوية عرض الأسود والأبيض. يمكنك إيقافه لرؤية ألوان اللوحة المخصصة بالكامل.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setHighContrast(false);
              onShowToast?.('تم إيقاف وضع التباين العالي لتطبيق ألوان الوضع الليلي المخصصة.');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--primary-color)',
              color: '#020617',
            }}
          >
            تفعيل الألوان المخصصة
          </button>
        </div>
      )}

      {/* Curated Dark Palettes Grid */}
      <section
        aria-label="لوحات الألوان الجاهزة للوضع الليلي"
        className="rounded-2xl border p-5 sm:p-6 space-y-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black">لوحات الألوان الجاهزة</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              اختر لوحة ألوان أساسية أو عدّل أي متغير يدوياً لإنشاء لوحتك الخاصة.
            </p>
          </div>
          {darkPalette === 'custom' && (
            <span
              data-testid="dark-palette-custom-indicator"
              className="text-xs font-bold flex items-center gap-1.5 font-mono"
              style={{ color: 'var(--primary-color)' }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>وضع مخصص نشط (Custom)</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {presetList.map((preset) => {
            const isSelected = darkPalette === preset.id;
            const contrast = getContrastRatio(preset.tokens.textPrimary, preset.tokens.cardBg);
            const grade = getContrastGrade(contrast);

            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`dark-palette-preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset.id)}
                className="rounded-xl border p-4 text-right flex flex-col justify-between gap-3 cursor-pointer transition-all"
                style={{
                  backgroundColor: preset.tokens.cardBg,
                  borderColor: isSelected ? preset.tokens.primaryColor : preset.tokens.cardBorder,
                  boxShadow: isSelected
                    ? `0 0 0 1px ${preset.tokens.primaryColor}`
                    : undefined,
                  color: preset.tokens.textPrimary,
                }}
              >
                <div className="space-y-2.5 w-full">
                  {/* 4-token swatch bar */}
                  <div
                    className="grid grid-cols-4 h-7 rounded-lg overflow-hidden border"
                    style={{ borderColor: preset.tokens.cardBorder }}
                  >
                    <span title="--app-bg" style={{ backgroundColor: preset.tokens.appBg }} />
                    <span title="--card-bg" style={{ backgroundColor: preset.tokens.cardBg }} />
                    <span title="--sidebar-bg" style={{ backgroundColor: preset.tokens.sidebarBg }} />
                    <span
                      title="--primary-color"
                      style={{ backgroundColor: preset.tokens.primaryColor }}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">{preset.label}</div>
                      <div
                        className="text-[11px] font-mono truncate"
                        dir="ltr"
                        style={{ color: preset.tokens.textSecondary }}
                      >
                        {preset.labelEn}
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: preset.tokens.primaryColor,
                          color: '#020617',
                        }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: preset.tokens.textSecondary }}
                  >
                    {preset.description}
                  </p>
                </div>

                <div
                  className="pt-2 border-t flex items-center justify-between text-[11px] font-mono tabular-nums"
                  style={{
                    borderColor: preset.tokens.cardBorder,
                    color: preset.tokens.textSecondary,
                  }}
                >
                  <span>تباين {contrast}:1</span>
                  <span style={{ color: preset.tokens.primaryColor }}>{grade}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split Grid: CSS Token Controls + Live Preview & WCAG Contrast */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left/Right Column: Fine-grained CSS variable studio */}
        <section
          aria-label="تخصيص متغيرات CSS"
          className="xl:col-span-7 rounded-2xl border p-5 sm:p-6 space-y-5"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--divider-color)' }}>
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-color)' }} />
              <div>
                <h2 className="text-base font-black">محرر متغيرات CSS الدقيقة</h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  تعديل كل متغير لوني بدقة Hex وحفظه تلقائياً على مستوى التطبيق
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'surfaces', label: 'الأسطح' },
                  { id: 'shell', label: 'الهيكل' },
                  { id: 'typography', label: 'النصوص' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGroup(tab.id)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  style={{
                    backgroundColor:
                      activeGroup === tab.id ? 'var(--primary-color)' : 'var(--surface-subtle)',
                    borderColor:
                      activeGroup === tab.id ? 'var(--primary-color)' : 'var(--card-border)',
                    color: activeGroup === tab.id ? '#020617' : 'var(--text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {visibleGroups.map((groupKey) => {
              const fields = TOKEN_FIELDS.filter((f) => f.group === groupKey);
              const meta = GROUP_TITLES[groupKey];
              return (
                <div key={groupKey} className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black">{meta.title}</h3>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {meta.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((field) => {
                      const currentHex = activeDarkTokens[field.key];
                      const displayedHex = hexDrafts[field.key] ?? currentHex;
                      const isInvalidDraft =
                        hexDrafts[field.key] !== undefined && !isValidHexColor(hexDrafts[field.key]!);

                      return (
                        <div
                          key={field.key}
                          className="rounded-xl border p-3.5 space-y-2.5"
                          style={{
                            backgroundColor: 'var(--app-bg-secondary)',
                            borderColor: isInvalidDraft ? '#FB7185' : 'var(--card-border)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-black truncate">{field.label}</div>
                              <div
                                className="text-[11px] font-mono truncate"
                                dir="ltr"
                                style={{ color: 'var(--accent-color)' }}
                              >
                                {field.cssVar}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              aria-label={`${field.label} منتقي اللون`}
                              data-testid={`token-color-${field.key}`}
                              value={normalizeHexColor(currentHex, '#000000')}
                              onChange={(e) => handleColorPickerChange(field.key, e.target.value)}
                              className="w-9 h-9 rounded-lg border cursor-pointer bg-transparent shrink-0 p-0.5"
                              style={{ borderColor: 'var(--input-border)' }}
                            />
                            <input
                              type="text"
                              dir="ltr"
                              aria-label={`${field.label} كود Hex`}
                              data-testid={`token-hex-${field.key}`}
                              value={displayedHex}
                              onChange={(e) => handleHexTextChange(field.key, e.target.value)}
                              onBlur={() => handleHexTextBlur(field.key)}
                              placeholder="#000000"
                              maxLength={7}
                              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border text-xs font-mono uppercase tracking-wide focus:outline-none"
                              style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: isInvalidDraft ? '#FB7185' : 'var(--input-border)',
                                color: 'var(--input-text)',
                              }}
                            />
                          </div>

                          <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                            {field.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right/Second Column: WCAG Contrast Checker, Live App Preview & CSS Export */}
        <div className="xl:col-span-5 space-y-6">
          {/* WCAG Contrast Audit */}
          <section
            aria-label="فحص تباين الألوان WCAG"
            className="rounded-2xl border p-5 space-y-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--success-color)' }} />
              <h2 className="text-sm font-black">فحص وضوح القراءة (WCAG Contrast)</h2>
            </div>

            <div className="space-y-2.5">
              {contrastChecks.map((check) => (
                <div
                  key={check.id}
                  data-testid={`contrast-check-${check.id}`}
                  className="rounded-xl border p-3 flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--app-bg-secondary)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{check.label}</div>
                    <div
                      className="text-[10px] font-mono truncate"
                      dir="ltr"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {check.vars}
                    </div>
                  </div>
                  <div className="text-left font-mono tabular-nums shrink-0">
                    <div className="text-xs font-black">{check.ratio}:1</div>
                    <div
                      className="text-[10px] font-bold"
                      style={{ color: check.passing ? '#34D399' : '#FB7185' }}
                    >
                      {check.grade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Live Preview using live CSS variables */}
          <section
            aria-label="معاينة حية للتطبيق"
            className="rounded-2xl border p-5 space-y-3.5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-color)' }} />
                <h2 className="text-sm font-black">معاينة حية لهيكل التطبيق</h2>
              </div>
              <span
                className="text-[11px] font-mono"
                dir="ltr"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activeDarkTokens.appBg}
              </span>
            </div>

            <div
              data-testid="dark-palette-live-preview"
              style={{
                ...previewVarsStyle,
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)',
              }}
              className="rounded-xl border overflow-hidden grid grid-cols-12 min-h-[230px]"
            >
              {/* Mini Sidebar */}
              <div
                className="col-span-4 border-l p-3 space-y-2"
                style={{
                  backgroundColor: 'var(--sidebar-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="text-xs font-black tracking-wide" dir="ltr">
                  RADAR
                </div>
                <div
                  className="rounded-lg px-2 py-1.5 text-[11px] font-black"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: '#020617',
                  }}
                >
                  المنافسون
                </div>
                <div
                  className="rounded-lg px-2 py-1.5 text-[11px]"
                  style={{
                    backgroundColor: 'var(--sidebar-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  المنتجات
                </div>
                <div
                  className="rounded-lg px-2 py-1.5 text-[11px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  التقارير
                </div>
              </div>

              {/* Mini Workspace */}
              <div className="col-span-8 flex flex-col">
                <div
                  className="px-3 py-2 border-b flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: 'var(--header-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <span className="text-[11px] font-bold">لوحة المراقبة</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  />
                </div>

                <div className="p-3 space-y-2.5 flex-1">
                  <div
                    className="rounded-lg border p-2.5 flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        هامش الربح المتوقع
                      </div>
                      <div className="text-sm font-black font-mono tabular-nums">18.4%</div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-md text-[10px] font-black cursor-default"
                      style={{
                        backgroundColor: 'var(--primary-color)',
                        color: '#020617',
                      }}
                    >
                      تحديث
                    </button>
                  </div>

                  <div
                    className="rounded-lg border px-2.5 py-1.5 text-[11px]"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    بحث برقم ASIN أو المنتج...
                  </div>

                  <div
                    className="rounded-lg border overflow-hidden text-[10px]"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <div
                      className="px-2.5 py-1 font-bold flex justify-between"
                      style={{
                        backgroundColor: 'var(--table-header-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>المنتج</span>
                      <span>السعر</span>
                    </div>
                    <div
                      className="px-2.5 py-1.5 flex justify-between"
                      style={{ backgroundColor: 'var(--card-bg)' }}
                    >
                      <span>سماعة بلوتوث</span>
                      <span className="font-mono tabular-nums" style={{ color: 'var(--accent-color)' }}>
                        499 AED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CSS Output Block */}
          <section
            aria-label="كود متغيرات CSS الناتج"
            className="rounded-2xl border p-5 space-y-3"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-black">كود CSS Variables المطبّق</h2>
              <button
                type="button"
                onClick={handleCopyCss}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                style={{ color: 'var(--accent-color)' }}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCss ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre
              dir="ltr"
              data-testid="dark-palette-css-output"
              className="rounded-xl border p-3 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed"
              style={{
                backgroundColor: 'var(--app-bg-secondary)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {generatedCssSnippet}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DarkPaletteSettingsPage;
