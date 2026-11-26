import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type PrimaryThemeId =
  | 'sky'
  | 'slate'
  | 'indigo'
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'rose'
  | 'teal';

export interface PrimaryThemeConfig {
  id: PrimaryThemeId;
  name: string;
  nameEn: string;
  description: string;
  primaryHex: string;
  hoverHex: string;
  activeHex: string;
  lightHex: string;
  lightHoverHex: string;
  borderHex: string;
  textHex: string;
  chartPrimary: string;
  chartFill: string;
  chartLight: string;
  category: 'classic' | 'modern' | 'vibrant' | 'minimal';
}

export const THEME_PRESETS: PrimaryThemeConfig[] = [
  {
    id: 'sky',
    name: 'الأبيض الهادئ المريح للعين والتباين الأسود الفائق (Soft Off-White & Solid Black)',
    nameEn: 'Glare-Free Off-White & High-Contrast Black',
    description:
      'النسق الرسمي عالي الوضوح لضعاف البصر وراحة العين: خلفية أوف-وايت هادئة خالية من التوهج (#F8FAFC)، ونصوص سوداء صريحة (#000000)، وإطارات أزرار صلبة بلون الشعار الداكن (#000000).',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'minimal',
  },
  {
    id: 'slate',
    name: 'الأبيض الهادئ القياسي (Standard Soft Off-White)',
    nameEn: 'Standard Soft Off-White',
    description:
      'نسق أوف-وايت مريح للعين (#F8FAFC) مع خط أسود واضح (#000000) وحدود أزرار بلون الشعار الداكن (#000000).',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'minimal',
  },
  {
    id: 'indigo',
    name: 'الكلاسيكي عالي التباين',
    nameEn: 'High-Contrast Classic',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) لراحة العين الفائقة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'classic',
  },
  {
    id: 'blue',
    name: 'التجاري عالي الوضوح',
    nameEn: 'Clear Commercial Off-White',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) وإطارات سوداء صلبة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'classic',
  },
  {
    id: 'emerald',
    name: 'الاستثماري عالي الوضوح',
    nameEn: 'Clear Emerald Off-White',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) وإطارات سوداء صلبة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'modern',
  },
  {
    id: 'purple',
    name: 'الإمبراطوري عالي الوضوح',
    nameEn: 'Clear Imperial Off-White',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) وإطارات سوداء صلبة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'modern',
  },
  {
    id: 'rose',
    name: 'العصري عالي الوضوح',
    nameEn: 'Clear Modern Off-White',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) وإطارات سوداء صلبة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'vibrant',
  },
  {
    id: 'teal',
    name: 'الهادئ عالي الوضوح',
    nameEn: 'Clear Soothing Off-White',
    description: 'خلفية أوف-وايت هادئة (#F8FAFC) ونصوص سوداء (#000000) وإطارات سوداء صلبة.',
    primaryHex: '#000000',
    hoverHex: '#1E293B',
    activeHex: '#0F172A',
    lightHex: '#F8FAFC',
    lightHoverHex: '#F1F5F9',
    borderHex: '#000000',
    textHex: '#000000',
    chartPrimary: '#000000',
    chartFill: '#000000',
    chartLight: '#F8FAFC',
    category: 'modern',
  },
];

const LOCAL_STORAGE_THEME_KEY = 'radar_global_primary_theme_v7_offwhite_black';
const LOCAL_STORAGE_COLOR_MODE_KEY = 'radar_global_color_mode_v7_offwhite_black';
export const LOCAL_STORAGE_THEME_VARIANT_KEY = 'radar_active_theme_variant';
export const LOCAL_STORAGE_HIGH_CONTRAST_KEY = 'radar_high_contrast_mode';
export const LOCAL_STORAGE_DARK_PALETTE_KEY = 'radar_custom_dark_palette';
export const LOCAL_STORAGE_DARK_TOKENS_KEY = 'radar_custom_dark_tokens_v1';
const THEME_CACHE_PURGE_KEY = 'radar_soft_offwhite_black_cache_purged_v7';

export type ColorModePreference = 'system' | 'light' | 'dark' | 'scheduled';
export type ResolvedColorMode = 'light' | 'dark';
export type ThemeVariantId = 'dark-high-contrast' | 'clean-light';
export type DarkPaletteId = 'default' | 'deep-blue' | 'charcoal' | 'dark-gray' | 'custom';

export interface DarkPaletteTokens {
  appBg: string;
  appBgSecondary: string;
  surfaceBg: string;
  surfaceElevated: string;
  cardBg: string;
  cardBgHover: string;
  cardBorder: string;
  sidebarBg: string;
  sidebarSurface: string;
  headerBg: string;
  inputBg: string;
  inputBorder: string;
  tableHeaderBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryColor: string;
  accentColor: string;
}

export type DarkPaletteTokenKey = keyof DarkPaletteTokens;

export interface DarkPalettePresetMeta {
  id: Exclude<DarkPaletteId, 'custom'>;
  label: string;
  labelEn: string;
  description: string;
  tokens: DarkPaletteTokens;
}

export const DARK_PALETTE_PRESETS: Record<Exclude<DarkPaletteId, 'custom'>, DarkPalettePresetMeta> = {
  default: {
    id: 'default',
    label: 'أوبسيديان داكن (الافتراضي)',
    labelEn: 'Obsidian Slate',
    description: 'الوضع الليلي القياسي للتجارة بتباين عالٍ وحدود واضحة.',
    tokens: {
      appBg: '#020617',
      appBgSecondary: '#090E1A',
      surfaceBg: '#0F172A',
      surfaceElevated: '#1E293B',
      cardBg: '#0F172A',
      cardBgHover: '#1E293B',
      cardBorder: '#475569',
      sidebarBg: '#020617',
      sidebarSurface: '#0F172A',
      headerBg: '#090E1A',
      inputBg: '#020617',
      inputBorder: '#64748B',
      tableHeaderBg: '#162033',
      textPrimary: '#FFFFFF',
      textSecondary: '#E2E8F0',
      primaryColor: '#F59E0B',
      accentColor: '#38BDF8',
    },
  },
  'deep-blue': {
    id: 'deep-blue',
    label: 'أزرق داكن (كحلي ليلي)',
    labelEn: 'Deep Blue',
    description: 'خلفية كحلية عميقة مع حدود زرقاء باردة مريحة لساعات المراقبة الطويلة.',
    tokens: {
      appBg: '#0B1329',
      appBgSecondary: '#070D1F',
      surfaceBg: '#101935',
      surfaceElevated: '#1A2747',
      cardBg: '#141E38',
      cardBgHover: '#22325C',
      cardBorder: '#314875',
      sidebarBg: '#070D1F',
      sidebarSurface: '#101935',
      headerBg: '#070D1F',
      inputBg: '#091024',
      inputBorder: '#3B5998',
      tableHeaderBg: '#192646',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5E1',
      primaryColor: '#38BDF8',
      accentColor: '#60A5FA',
    },
  },
  charcoal: {
    id: 'charcoal',
    label: 'أسود فحم (OLED)',
    labelEn: 'Charcoal Black',
    description: 'فحمي محايد بدون أي صبغة زرقاء، مثالي لشاشات OLED وتقليل التوهج.',
    tokens: {
      appBg: '#121212',
      appBgSecondary: '#0A0A0A',
      surfaceBg: '#181818',
      surfaceElevated: '#262626',
      cardBg: '#1C1C1E',
      cardBgHover: '#2C2C2E',
      cardBorder: '#3F3F46',
      sidebarBg: '#0D0D0D',
      sidebarSurface: '#18181B',
      headerBg: '#0D0D0D',
      inputBg: '#101012',
      inputBorder: '#52525B',
      tableHeaderBg: '#222225',
      textPrimary: '#FAFAFA',
      textSecondary: '#D4D4D8',
      primaryColor: '#F59E0B',
      accentColor: '#FBBF24',
    },
  },
  'dark-gray': {
    id: 'dark-gray',
    label: 'رمادي داكن (استوديو)',
    labelEn: 'Dark Gray',
    description: 'درجات رمادية متوازنة وخفيفة التباين على العين لجلسات التحليل الممتدة.',
    tokens: {
      appBg: '#14181F',
      appBgSecondary: '#0E1218',
      surfaceBg: '#1D232D',
      surfaceElevated: '#2D3544',
      cardBg: '#1F2530',
      cardBgHover: '#2E3646',
      cardBorder: '#475161',
      sidebarBg: '#0E1218',
      sidebarSurface: '#1B212B',
      headerBg: '#0E1218',
      inputBg: '#11161E',
      inputBorder: '#64748B',
      tableHeaderBg: '#252C39',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      primaryColor: '#34D399',
      accentColor: '#60A5FA',
    },
  },
};

const MANAGED_DARK_CSS_VAR_NAMES = [
  '--app-bg',
  '--app-bg-primary',
  '--app-bg-secondary',
  '--app-bg-surface',
  '--app-bg-card',
  '--surface-bg',
  '--surface-elevated',
  '--surface-subtle',
  '--card-bg',
  '--card-bg-elevated',
  '--card-bg-hover',
  '--card-border',
  '--card-border-strong',
  '--app-border-color',
  '--divider-color',
  '--sidebar-bg',
  '--sidebar-surface',
  '--sidebar-border',
  '--sidebar-hover-bg',
  '--sidebar-text',
  '--sidebar-text-muted',
  '--sidebar-active-bg',
  '--header-bg',
  '--header-border',
  '--header-text',
  '--input-bg',
  '--input-border',
  '--input-border-focus',
  '--input-text',
  '--table-header-bg',
  '--table-row-bg',
  '--table-row-hover',
  '--table-border',
  '--card-text',
  '--card-text-secondary',
  '--text-primary',
  '--text-secondary',
  '--app-text-primary',
  '--app-text-secondary',
  '--primary-color',
  '--primary-border',
  '--accent-color',
  '--primary-chart-stroke',
  '--primary-chart-fill',
  '--chart-tooltip-bg',
  '--chart-tooltip-border',
  '--chart-tooltip-text',
] as const;

export function normalizeHexColor(value: string, fallback = '#000000'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const shortMatch = /^#([0-9a-fA-F]{3})$/.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('');
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  const fullMatch = /^#([0-9a-fA-F]{6})$/.exec(trimmed);
  if (fullMatch) {
    return `#${fullMatch[1].toUpperCase()}`;
  }
  return fallback;
}

export function isValidHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex, '#000000').slice(1);
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function getContrastGrade(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Low' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Low';
}

export function buildCssVariableMapFromDarkTokens(tokens: DarkPaletteTokens): Record<string, string> {
  return {
    '--app-bg': tokens.appBg,
    '--app-bg-primary': tokens.appBg,
    '--app-bg-secondary': tokens.appBgSecondary,
    '--app-bg-surface': tokens.surfaceBg,
    '--app-bg-card': tokens.cardBg,
    '--surface-bg': tokens.surfaceBg,
    '--surface-elevated': tokens.surfaceElevated,
    '--surface-subtle': tokens.appBgSecondary,
    '--card-bg': tokens.cardBg,
    '--card-bg-elevated': tokens.surfaceElevated,
    '--card-bg-hover': tokens.cardBgHover,
    '--card-border': tokens.cardBorder,
    '--card-border-strong': tokens.inputBorder,
    '--app-border-color': tokens.cardBorder,
    '--divider-color': tokens.cardBorder,
    '--sidebar-bg': tokens.sidebarBg,
    '--sidebar-surface': tokens.sidebarSurface,
    '--sidebar-border': tokens.cardBorder,
    '--sidebar-hover-bg': tokens.cardBgHover,
    '--sidebar-text': tokens.textPrimary,
    '--sidebar-text-muted': tokens.textSecondary,
    '--sidebar-active-bg': tokens.primaryColor,
    '--header-bg': tokens.headerBg,
    '--header-border': tokens.cardBorder,
    '--header-text': tokens.textPrimary,
    '--input-bg': tokens.inputBg,
    '--input-border': tokens.inputBorder,
    '--input-border-focus': tokens.accentColor,
    '--input-text': tokens.textPrimary,
    '--table-header-bg': tokens.tableHeaderBg,
    '--table-row-bg': tokens.cardBg,
    '--table-row-hover': tokens.cardBgHover,
    '--table-border': tokens.cardBorder,
    '--card-text': tokens.textPrimary,
    '--card-text-secondary': tokens.textSecondary,
    '--text-primary': tokens.textPrimary,
    '--text-secondary': tokens.textSecondary,
    '--app-text-primary': tokens.textPrimary,
    '--app-text-secondary': tokens.textSecondary,
    '--primary-color': tokens.primaryColor,
    '--primary-border': tokens.primaryColor,
    '--accent-color': tokens.accentColor,
    '--primary-chart-stroke': tokens.accentColor,
    '--primary-chart-fill': tokens.accentColor,
    '--chart-tooltip-bg': tokens.appBg,
    '--chart-tooltip-border': tokens.cardBorder,
    '--chart-tooltip-text': tokens.textPrimary,
  };
}

function clearDarkPaletteInlineCssVars(root: HTMLElement): void {
  for (const cssVar of MANAGED_DARK_CSS_VAR_NAMES) {
    root.style.removeProperty(cssVar);
  }
}

function readStoredDarkPalette(): DarkPaletteId {
  if (typeof window === 'undefined') return 'default';
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_DARK_PALETTE_KEY);
    if (
      saved === 'deep-blue' ||
      saved === 'charcoal' ||
      saved === 'dark-gray' ||
      saved === 'default' ||
      saved === 'custom'
    ) {
      return saved;
    }
  } catch {
    // safe fallback
  }
  return 'default';
}

function readStoredDarkTokens(): DarkPaletteTokens {
  const defaults = DARK_PALETTE_PRESETS.default.tokens;
  if (typeof window === 'undefined') return { ...defaults };
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DARK_TOKENS_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...defaults };
    const result = { ...defaults };
    for (const key of Object.keys(defaults) as DarkPaletteTokenKey[]) {
      if (typeof parsed[key] === 'string' && isValidHexColor(parsed[key])) {
        result[key] = normalizeHexColor(parsed[key], defaults[key]);
      }
    }
    return result;
  } catch {
    return { ...defaults };
  }
}

export interface ThemeVariantMeta {
  id: ThemeVariantId;
  label: string;
  labelAr: string;
  description: string;
  colorMode: ResolvedColorMode;
}

export const THEME_VARIANT_DEFINITIONS: Record<ThemeVariantId, ThemeVariantMeta> = {
  'dark-high-contrast': {
    id: 'dark-high-contrast',
    label: 'Dark High Contrast',
    labelAr: 'الوضع الداكن عالي التباين (Dark High Contrast)',
    description: 'مخصص للبيئات التجارية المظلمة بتباين نصوص فائق وحدود واضحة.',
    colorMode: 'dark',
  },
  'clean-light': {
    id: 'clean-light',
    label: 'Clean Light',
    labelAr: 'الوضع النهاري النظيف (Clean Light)',
    description: 'وضع مريح للعين خالٍ من التوهج للعمل النهاري الطويل.',
    colorMode: 'light',
  },
};

interface ThemeContextType {
  currentThemeId: PrimaryThemeId;
  currentTheme: PrimaryThemeConfig;
  allThemes: PrimaryThemeConfig[];
  setPrimaryTheme: (themeId: PrimaryThemeId) => void;
  resetToDefaultTheme: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  colorMode: ColorModePreference;
  resolvedColorMode: ResolvedColorMode;
  themeVariant: ThemeVariantId;
  systemColorScheme: ResolvedColorMode;
  isHighContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => boolean;
  setColorMode: (mode: ColorModePreference) => void;
  setThemeVariant: (variant: ThemeVariantId) => void;
  toggleColorMode: () => void;
  toggleThemeVariant: () => ThemeVariantId;
  cycleColorMode: () => ColorModePreference;
  darkPalette: DarkPaletteId;
  activeDarkTokens: DarkPaletteTokens;
  customDarkTokens: DarkPaletteTokens;
  setDarkPalette: (palette: DarkPaletteId) => void;
  updateDarkToken: (key: DarkPaletteTokenKey, value: string) => void;
  updateDarkTokens: (partial: Partial<DarkPaletteTokens>) => void;
  resetDarkPalette: () => void;
  enableDarkModeWithPalette: (palette?: DarkPaletteId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_SCHEDULE = {
  lightStart: 6, // 6:00 AM
  darkStart: 18, // 6:00 PM
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const legacyThemeKeys = [
        'radar_global_primary_theme',
        'radar_global_primary_theme_v1',
        'radar_global_primary_theme_v2',
        'radar_global_primary_theme_v3',
        'radar_global_primary_theme_v4',
        'radar_global_primary_theme_v5_sky_slate',
        'radar_global_color_mode_v5_sky_slate',
        'merchant_radar_primary_theme',
        'primary_theme',
      ];
      legacyThemeKeys.forEach((key) => localStorage.removeItem(key));

      if (localStorage.getItem(THEME_CACHE_PURGE_KEY) !== 'true') {
        localStorage.setItem(THEME_CACHE_PURGE_KEY, 'true');
        if (!localStorage.getItem(LOCAL_STORAGE_THEME_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'sky');
        }
        if (!localStorage.getItem(LOCAL_STORAGE_COLOR_MODE_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_COLOR_MODE_KEY, 'light');
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  const [currentThemeId, setCurrentThemeId] = useState<PrimaryThemeId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
        if (saved && THEME_PRESETS.some((t) => t.id === saved)) {
          return saved as PrimaryThemeId;
        }
      } catch {
        // safe fallback
      }
    }
    return 'sky';
  });

  const [colorMode, setColorModeState] = useState<ColorModePreference>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedVariant = localStorage.getItem(LOCAL_STORAGE_THEME_VARIANT_KEY);
        if (savedVariant === 'dark-high-contrast') return 'dark';
        if (savedVariant === 'clean-light') return 'light';

        const saved = localStorage.getItem(LOCAL_STORAGE_COLOR_MODE_KEY);
        if (saved === 'dark' || saved === 'light' || saved === 'system' || saved === 'scheduled') {
          return saved as ColorModePreference;
        }
      } catch {
        // safe fallback
      }
    }
    return 'light';
  });

  const [systemColorScheme, setSystemColorScheme] = useState<ResolvedColorMode>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const getScheduledMode = (): ResolvedColorMode => {
    const hour = new Date().getHours();
    return hour >= THEME_SCHEDULE.lightStart && hour < THEME_SCHEDULE.darkStart ? 'light' : 'dark';
  };

  const [scheduledColorScheme, setScheduledColorScheme] = useState<ResolvedColorMode>(getScheduledMode());

  const [darkPalette, setDarkPaletteState] = useState<DarkPaletteId>(() => readStoredDarkPalette());
  const [customDarkTokens, setCustomDarkTokens] = useState<DarkPaletteTokens>(() => readStoredDarkTokens());

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  const [isHighContrast, setIsHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(LOCAL_STORAGE_HIGH_CONTRAST_KEY) === 'true';
      } catch {
        // safe fallback
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemColorScheme(e.matches ? 'dark' : 'light');
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    if (colorMode !== 'scheduled') return;

    const interval = setInterval(() => {
      const mode = getScheduledMode();
      if (mode !== scheduledColorScheme) {
        setScheduledColorScheme(mode);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [colorMode, scheduledColorScheme]);

  const currentTheme = THEME_PRESETS.find((t) => t.id === currentThemeId) || THEME_PRESETS[0];

  const resolvedColorMode: ResolvedColorMode = useMemo(() => {
    if (colorMode === 'system') return systemColorScheme;
    if (colorMode === 'scheduled') return scheduledColorScheme;
    return colorMode;
  }, [colorMode, systemColorScheme, scheduledColorScheme]);

  const themeVariant: ThemeVariantId =
    resolvedColorMode === 'dark' ? 'dark-high-contrast' : 'clean-light';

  const activeDarkTokens: DarkPaletteTokens = useMemo(() => {
    if (darkPalette === 'custom') {
      return customDarkTokens;
    }
    return DARK_PALETTE_PRESETS[darkPalette].tokens;
  }, [darkPalette, customDarkTokens]);

  const setDarkPalette = useCallback((palette: DarkPaletteId) => {
    setDarkPaletteState(palette);
    if (palette !== 'custom') {
      const presetTokens = { ...DARK_PALETTE_PRESETS[palette].tokens };
      setCustomDarkTokens(presetTokens);
      try {
        localStorage.setItem(LOCAL_STORAGE_DARK_TOKENS_KEY, JSON.stringify(presetTokens));
      } catch {
        // safe fallback
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_DARK_PALETTE_KEY, palette);
        document.documentElement.setAttribute('data-dark-palette', palette);
      } catch {
        // safe fallback
      }
    }
  }, []);

  const updateDarkToken = useCallback((key: DarkPaletteTokenKey, value: string) => {
    const normalized = isValidHexColor(value) ? normalizeHexColor(value) : value;
    setCustomDarkTokens((prev) => {
      const next = { ...prev, [key]: normalized };
      try {
        localStorage.setItem(LOCAL_STORAGE_DARK_TOKENS_KEY, JSON.stringify(next));
      } catch {
        // safe fallback
      }
      return next;
    });
    setDarkPaletteState('custom');
    try {
      localStorage.setItem(LOCAL_STORAGE_DARK_PALETTE_KEY, 'custom');
    } catch {
      // safe fallback
    }
  }, []);

  const updateDarkTokens = useCallback((partial: Partial<DarkPaletteTokens>) => {
    setCustomDarkTokens((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(partial) as Array<[DarkPaletteTokenKey, string | undefined]>) {
        if (typeof v === 'string') {
          next[k] = isValidHexColor(v) ? normalizeHexColor(v) : v;
        }
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_DARK_TOKENS_KEY, JSON.stringify(next));
      } catch {
        // safe fallback
      }
      return next;
    });
    setDarkPaletteState('custom');
    try {
      localStorage.setItem(LOCAL_STORAGE_DARK_PALETTE_KEY, 'custom');
    } catch {
      // safe fallback
    }
  }, []);

  const resetDarkPalette = useCallback(() => {
    const defaults = { ...DARK_PALETTE_PRESETS.default.tokens };
    setDarkPaletteState('default');
    setCustomDarkTokens(defaults);
    try {
      localStorage.setItem(LOCAL_STORAGE_DARK_PALETTE_KEY, 'default');
      localStorage.setItem(LOCAL_STORAGE_DARK_TOKENS_KEY, JSON.stringify(defaults));
      document.documentElement.setAttribute('data-dark-palette', 'default');
    } catch {
      // safe fallback
    }
  }, []);

  const enableDarkModeWithPalette = useCallback(
    (palette?: DarkPaletteId) => {
      setColorModeState('dark');
      if (palette) {
        setDarkPalette(palette);
      }
    },
    [setDarkPalette]
  );

  // Sync theme mode & active dark palette CSS variables on documentElement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      const activeVariant: ThemeVariantId =
        resolvedColorMode === 'dark' ? 'dark-high-contrast' : 'clean-light';

      root.setAttribute('data-theme', activeVariant);
      root.setAttribute('data-color-mode', resolvedColorMode);
      root.setAttribute('data-color-mode-preference', colorMode);
      root.setAttribute('data-dark-palette', darkPalette);
      root.style.colorScheme = resolvedColorMode;

      if (resolvedColorMode === 'dark') {
        root.classList.add('dark', 'theme-dark', 'theme-dark-high-contrast');
        root.classList.remove('light', 'theme-light', 'theme-clean-light');

        if (isHighContrast) {
          clearDarkPaletteInlineCssVars(root);
        } else {
          const cssVars = buildCssVariableMapFromDarkTokens(activeDarkTokens);
          for (const [varName, varVal] of Object.entries(cssVars)) {
            root.style.setProperty(varName, varVal);
          }
        }
      } else {
        root.classList.add('light', 'theme-light', 'theme-clean-light');
        root.classList.remove('dark', 'theme-dark', 'theme-dark-high-contrast');
        clearDarkPaletteInlineCssVars(root);
      }

      localStorage.setItem(LOCAL_STORAGE_COLOR_MODE_KEY, colorMode);
      localStorage.setItem(LOCAL_STORAGE_THEME_VARIANT_KEY, activeVariant);
      localStorage.setItem(LOCAL_STORAGE_DARK_PALETTE_KEY, darkPalette);
    } catch {
      // safe fallback
    }
  }, [colorMode, resolvedColorMode, darkPalette, activeDarkTokens, isHighContrast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      root.setAttribute('data-primary-theme', currentTheme.id);
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme.id);
    } catch {
      // safe fallback
    }
  }, [currentTheme, resolvedColorMode]);

  useEffect(() => {
    syncHighContrastDomAndStorage(isHighContrast);
  }, [isHighContrast]);

  const setPrimaryTheme = (themeId: PrimaryThemeId) => {
    if (THEME_PRESETS.some((t) => t.id === themeId)) {
      setCurrentThemeId(themeId);
    } else {
      setCurrentThemeId('sky');
    }
  };

  const resetToDefaultTheme = () => {
    setCurrentThemeId('sky');
    setColorModeState('light');
    setIsHighContrastState(false);
    resetDarkPalette();
  };

  const setHighContrast = (enabled: boolean) => {
    setIsHighContrastState(Boolean(enabled));
  };

  const toggleHighContrast = (): boolean => {
    const next = !isHighContrast;
    setIsHighContrastState(next);
    return next;
  };

  const setColorMode = (mode: ColorModePreference) => {
    setColorModeState(mode);
    if (mode === 'scheduled') {
      setScheduledColorScheme(getScheduledMode());
    }
  };

  const setThemeVariant = (variant: ThemeVariantId) => {
    setColorModeState(variant === 'dark-high-contrast' ? 'dark' : 'light');
  };

  const toggleColorMode = () => {
    const next: ColorModePreference = resolvedColorMode === 'dark' ? 'light' : 'dark';
    setColorModeState(next);
  };

  const toggleThemeVariant = (): ThemeVariantId => {
    const nextVariant: ThemeVariantId =
      resolvedColorMode === 'dark' ? 'clean-light' : 'dark-high-contrast';
    setColorModeState(nextVariant === 'dark-high-contrast' ? 'dark' : 'light');
    return nextVariant;
  };

  const cycleColorMode = (): ColorModePreference => {
    let next: ColorModePreference = 'light';
    if (colorMode === 'light') next = 'dark';
    else if (colorMode === 'dark') next = 'system';
    else if (colorMode === 'system') next = 'scheduled';
    else next = 'light';

    setColorModeState(next);
    if (next === 'scheduled') {
      setScheduledColorScheme(getScheduledMode());
    }
    return next;
  };

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        allThemes: THEME_PRESETS,
        setPrimaryTheme,
        resetToDefaultTheme,
        isThemeModalOpen,
        setIsThemeModalOpen,
        colorMode,
        resolvedColorMode,
        themeVariant,
        systemColorScheme,
        isHighContrast,
        setHighContrast,
        toggleHighContrast,
        setColorMode,
        setThemeVariant,
        toggleColorMode,
        toggleThemeVariant,
        cycleColorMode,
        darkPalette,
        activeDarkTokens,
        customDarkTokens,
        setDarkPalette,
        updateDarkToken,
        updateDarkTokens,
        resetDarkPalette,
        enableDarkModeWithPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const FALLBACK_THEME_CONTEXT: ThemeContextType = {
  currentThemeId: 'sky',
  currentTheme: THEME_PRESETS[0],
  allThemes: THEME_PRESETS,
  setPrimaryTheme: () => {},
  resetToDefaultTheme: () => {},
  isThemeModalOpen: false,
  setIsThemeModalOpen: () => {},
  colorMode: 'light',
  resolvedColorMode: 'light',
  themeVariant: 'clean-light',
  systemColorScheme: 'light',
  isHighContrast: false,
  setHighContrast: () => {},
  toggleHighContrast: () => false,
  setColorMode: () => {},
  setThemeVariant: () => {},
  toggleColorMode: () => {},
  toggleThemeVariant: () => 'clean-light',
  cycleColorMode: () => 'light',
  darkPalette: 'default',
  activeDarkTokens: DARK_PALETTE_PRESETS.default.tokens,
  customDarkTokens: DARK_PALETTE_PRESETS.default.tokens,
  setDarkPalette: () => {},
  updateDarkToken: () => {},
  updateDarkTokens: () => {},
  resetDarkPalette: () => {},
  enableDarkModeWithPalette: () => {},
};

function readStoredHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LOCAL_STORAGE_HIGH_CONTRAST_KEY) === 'true';
  } catch {
    return false;
  }
}

function syncHighContrastDomAndStorage(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const root = document.documentElement;
    root.setAttribute('data-high-contrast', enabled ? 'true' : 'false');
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem(LOCAL_STORAGE_HIGH_CONTRAST_KEY, enabled ? 'true' : 'false');
  } catch {
    // safe fallback
  }
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  const [standaloneHighContrast, setStandaloneHighContrast] = useState<boolean>(() =>
    readStoredHighContrast()
  );

  useEffect(() => {
    if (!context) {
      syncHighContrastDomAndStorage(standaloneHighContrast);
    }
  }, [context, standaloneHighContrast]);

  if (!context) {
    return {
      ...FALLBACK_THEME_CONTEXT,
      isHighContrast: standaloneHighContrast,
      setHighContrast: (enabled: boolean) => {
        const next = Boolean(enabled);
        setStandaloneHighContrast(next);
        syncHighContrastDomAndStorage(next);
      },
      toggleHighContrast: () => {
        const next = !standaloneHighContrast;
        setStandaloneHighContrast(next);
        syncHighContrastDomAndStorage(next);
        return next;
      },
    };
  }
  return context;
};
