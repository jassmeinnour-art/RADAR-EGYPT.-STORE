import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type SupportedFontFamily = 'Cairo' | 'Tajawal' | 'Inter' | 'Amiri' | 'Alexandria';
export type SupportedFontWeight = '300' | '400' | '700' | '800';
export type SupportedShadow = 'none' | 'small' | 'medium' | 'large';
export type ButtonSize = 'small' | 'medium' | 'large'; // صغير 32px | متوسط 40px | كبير 48px
export type ButtonShape = 'square' | 'rounded' | 'full_pill'; // مربع 0px | دائري قليل 8px | دائري كامل 50px
export type ButtonLocation = 'main_top' | 'main_bottom' | 'sidebar' | 'top_nav' | 'hidden';

export interface ManagedButtonItem {
  id: string;
  label: string;
  visible: boolean;
  location: ButtonLocation;
  order: number;
  customColor?: string;
  customTextColor?: string;
}

export interface VisualSettings {
  // 1- الألوان (Color + Hex Input)
  colorPrimary: string;        // Primary: #FF8C00
  colorSecondary: string;      // Secondary: #0a0f1f
  colorBackground: string;     // Background: #0a0f1f
  colorCard: string;           // Card BG: #1a2332
  colorText: string;           // Text: #ffffff
  colorTextSecondary: string;  // Text Secondary: #9ca3af
  colorBorder: string;         // Border: #2a3441
  colorSuccess: string;        // Success: #10b981
  colorError: string;          // Error: #ef4444
  colorWarning: string;        // Warning: #f59e0b

  // 2- النصوص (تحكم بالأسهم)
  fontSizeBase: number;        // Base: 14px (10 to 22)
  fontSizeH1: number;          // H1: 24px (16 to 48)
  fontSizeH2: number;          // H2: 20px (14 to 36)
  fontSizeH3: number;          // H3: 16px (12 to 28)
  fontSizeCard: number;        // Card text: 13px (10 to 20)
  fontWeight: SupportedFontWeight; // Light, Regular, Bold, ExtraBold
  fontFamily: SupportedFontFamily; // Cairo, Tajawal, Inter, Amiri, Alexandria
  lineHeight: number;          // 1.6 (1.0 to 2.5)
  colorHeading: string;        // لون العناوين

  // 3- الإطارات والمسافات (تحكم بالأسهم)
  borderRadius: number;        // Border Radius: 12px (0 to 30)
  borderWidth: number;         // Border Width: 1px (0 to 5)
  cardPadding: number;         // Card Padding: 16px (4 to 40, step 2)
  cardMargin: number;          // Card Margin: 12px (0 to 32)
  gapBetweenCards: number;     // Gap: 16px (4 to 32)
  cardShadow: SupportedShadow; // None, Small, Medium, Large

  // 4- الأزرار
  buttonSize: ButtonSize;       // صغير 32px | متوسط 40px | كبير 48px
  buttonShape: ButtonShape;     // مربع 0px | دائري قليل 8px | دائري كامل 50px
  buttonPrimaryColor: string;  // لون زر أساسي
  buttonTextColor: string;     // لون نص الزر

  // 5- إدارة الأزرار (Managed Buttons)
  buttonsList: ManagedButtonItem[];

  // Legacy compatibility fields
  fontSizeSmall: number;
  cardMaxWidth: number;
  cardWidthMode: 'full' | 'standard' | 'compact' | 'custom';
  cardBorderRadius: number;
  cardBorderWidth: number;
  cardBackgroundColor: string;
  cardBorderColor: string;
  buttonWidthMode: 'full' | 'auto' | 'custom';
  buttonCustomWidth: number;
  buttonPaddingY: number;
  buttonPaddingX: number;
  buttonMarginTop: number;
  buttonMarginRight: number;
  buttonMarginLeft: number;
  buttonTranslateX: number;
  buttonBorderRadius: number;
  buttonFontSize: number;
  buttonFontWeight: '600' | '700' | '800' | '900';
  buttonAlignment: 'center' | 'right' | 'left' | 'between';
  buttonColorStart: string;
  buttonColorEnd: string;
  textWrapMode: 'nowrap' | 'normal';
  titleFontSize: number;
  bodyFontSize: number;
  textColorPrimary: string;
  accentColor: string;
}

export const DEFAULT_MANAGED_BUTTONS: ManagedButtonItem[] = [
  { id: 'btn_export_merchant', label: 'تصدير بيانات التجار 📥', visible: true, location: 'main_top', order: 1 },
  { id: 'btn_pin_favorite', label: 'المفضل مثبت 📌', visible: true, location: 'main_top', order: 2 },
  { id: 'btn_select_merchant', label: 'محرر محمود سيد (Mahmoud Said Store)', visible: true, location: 'main_top', order: 3 },
  { id: 'btn_filter_background', label: 'تغيير الفلتر في الخلفية', visible: true, location: 'main_top', order: 4 },
  { id: 'btn_show_more', label: 'عرض المزيد (1 تاجر)', visible: true, location: 'main_top', order: 5 },
  { id: 'btn_filter_panel', label: 'لوحة تحكم المرشحات 🔍', visible: true, location: 'main_top', order: 6 },
  { id: 'btn_in_filter', label: 'في الفلتر (حالة التصفية)', visible: true, location: 'main_top', order: 7 },
  { id: 'btn_kpi_active_products', label: 'كارت KPI المنتجات النشطة (148)', visible: true, location: 'main_top', order: 8 },
  { id: 'btn_kpi_competitors', label: 'كارت KPI المنافسون المراقبون (24)', visible: true, location: 'main_top', order: 9 },
  { id: 'btn_kpi_sync_status', label: 'كارت KPI حالة التزامن (مستقر)', visible: true, location: 'main_top', order: 10 },
  { id: 'btn_kpi_trial', label: 'كارت KPI مهلة التجربة (999 يوم)', visible: true, location: 'main_top', order: 11 },
  { id: 'btn_simulate_success', label: 'معالجة التزامن (نجاح)', visible: true, location: 'main_top', order: 12 },
  { id: 'btn_simulate_triple_fail', label: 'تجربة التنبيه (3 إخفاقات)', visible: true, location: 'main_top', order: 13 },
  { id: 'btn_simulate_fail_single', label: 'محاكاة فشل (+1)', visible: true, location: 'main_top', order: 14 },
];

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  // 1- الألوان
  colorPrimary: '#FF8C00',
  colorSecondary: '#0a0f1f',
  colorBackground: '#0a0f1f',
  colorCard: '#1a2332',
  colorText: '#ffffff',
  colorTextSecondary: '#9ca3af',
  colorBorder: '#2a3441',
  colorSuccess: '#10b981',
  colorError: '#ef4444',
  colorWarning: '#f59e0b',

  // 2- النصوص
  fontSizeBase: 14,
  fontSizeH1: 24,
  fontSizeH2: 20,
  fontSizeH3: 16,
  fontSizeCard: 13,
  fontSizeSmall: 12,
  fontWeight: '700',
  fontFamily: 'Cairo',
  lineHeight: 1.6,
  colorHeading: '#FF8C00',

  // 3- الإطارات والمسافات
  borderRadius: 12,
  borderWidth: 1,
  cardPadding: 16,
  cardMargin: 12,
  gapBetweenCards: 16,
  cardShadow: 'medium',

  // 4- الأزرار
  buttonSize: 'medium',
  buttonShape: 'rounded',
  buttonPrimaryColor: '#FF8C00',
  buttonTextColor: '#ffffff',

  // 5- إدارة الأزرار
  buttonsList: DEFAULT_MANAGED_BUTTONS,

  // Legacy fields
  cardMaxWidth: 720,
  cardWidthMode: 'standard',
  cardBorderRadius: 12,
  cardBorderWidth: 1,
  cardBackgroundColor: '#1a2332',
  cardBorderColor: '#2a3441',
  buttonWidthMode: 'full',
  buttonCustomWidth: 380,
  buttonPaddingY: 10,
  buttonPaddingX: 20,
  buttonMarginTop: 12,
  buttonMarginRight: 0,
  buttonMarginLeft: 12,
  buttonTranslateX: 0,
  buttonBorderRadius: 8,
  buttonFontSize: 14,
  buttonFontWeight: '700',
  buttonAlignment: 'center',
  buttonColorStart: '#FF8C00',
  buttonColorEnd: '#e65c00',
  textWrapMode: 'normal',
  titleFontSize: 24,
  bodyFontSize: 14,
  textColorPrimary: '#ffffff',
  accentColor: '#FF8C00',
};

export const THEME_PRESETS: Record<string, { label: string; desc: string; settings: Partial<VisualSettings> }> = {
  dark_radar: {
    label: 'رادار التاجر (Dark Radar)',
    desc: 'المظهر الداكن المعتمد بألوان برتقالي الرادار وخلفية كحلية عميقة',
    settings: {
      colorPrimary: '#FF8C00',
      colorSecondary: '#0a0f1f',
      colorBackground: '#0a0f1f',
      colorCard: '#1a2332',
      colorText: '#ffffff',
      colorTextSecondary: '#9ca3af',
      colorBorder: '#2a3441',
      colorHeading: '#FF8C00',
      fontFamily: 'Cairo',
      borderRadius: 12,
      cardShadow: 'medium',
      buttonPrimaryColor: '#FF8C00',
      buttonTextColor: '#ffffff'
    }
  },
  midnight_navy: {
    label: 'كحلي ليلي (Midnight Navy)',
    desc: 'مزيج فاخر من الأزرق الفلكي والكحلي العميق ولمسات سماوية',
    settings: {
      colorPrimary: '#38bdf8',
      colorSecondary: '#030712',
      colorBackground: '#0b1120',
      colorCard: '#1e293b',
      colorText: '#ffffff',
      colorTextSecondary: '#94a3b8',
      colorBorder: '#334155',
      colorHeading: '#38bdf8',
      fontFamily: 'Tajawal',
      borderRadius: 14,
      cardShadow: 'large',
      buttonPrimaryColor: '#0284c7',
      buttonTextColor: '#ffffff'
    }
  },
  clean_light: {
    label: 'فاتح ناصع (Clean Light)',
    desc: 'تصميم مشرق وعالي التباين بخلفية أوف وايت أنيقة ونصوص داكنة',
    settings: {
      colorPrimary: '#FF8C00',
      colorSecondary: '#f1f5f9',
      colorBackground: '#ffffff',
      colorCard: '#f8fafc',
      colorText: '#1a1a1a',
      colorTextSecondary: '#64748b',
      colorBorder: '#e2e8f0',
      colorHeading: '#1e293b',
      fontFamily: 'Cairo',
      borderRadius: 12,
      cardShadow: 'small',
      buttonPrimaryColor: '#FF8C00',
      buttonTextColor: '#ffffff'
    }
  },
  neon_cyber: {
    label: 'نيون سايبر (Neon Cyber)',
    desc: 'مظهر مستقبلي جذاب بتوهج أخضر/سماوي نيون فائق العصرية',
    settings: {
      colorPrimary: '#00ffcc',
      colorSecondary: '#090a0f',
      colorBackground: '#040508',
      colorCard: '#0d1117',
      colorText: '#e6edf3',
      colorTextSecondary: '#8b949e',
      colorBorder: '#00ffcc44',
      colorHeading: '#00ffcc',
      fontFamily: 'Inter',
      borderRadius: 8,
      cardShadow: 'large',
      buttonPrimaryColor: '#00ffcc',
      buttonTextColor: '#040508'
    }
  },
  luxury_gold: {
    label: 'ذهبي ملوكي (Luxury Gold)',
    desc: 'فخامة الأسود الملكي مع البريق الذهبي المميز للتجار النخبة',
    settings: {
      colorPrimary: '#eab308',
      colorSecondary: '#18181b',
      colorBackground: '#09090b',
      colorCard: '#18181b',
      colorText: '#fef08a',
      colorTextSecondary: '#a1a1aa',
      colorBorder: '#ca8a0444',
      colorHeading: '#facc15',
      fontFamily: 'Tajawal',
      borderRadius: 14,
      cardShadow: 'medium',
      buttonPrimaryColor: '#eab308',
      buttonTextColor: '#09090b'
    }
  },
  emerald_profit: {
    label: 'أخضر الأرباح (Emerald Profit)',
    desc: 'رمز النمو وصافي الأرباح والاستقرار التجاري في السوق',
    settings: {
      colorPrimary: '#10b981',
      colorSecondary: '#022c22',
      colorBackground: '#051814',
      colorCard: '#064e3b33',
      colorText: '#ecfdf5',
      colorTextSecondary: '#6ee7b7',
      colorBorder: '#05966944',
      colorHeading: '#34d399',
      fontFamily: 'Alexandria',
      borderRadius: 16,
      cardShadow: 'medium',
      buttonPrimaryColor: '#10b981',
      buttonTextColor: '#041f17'
    }
  }
};

export const STORAGE_KEY_CUSTOM_THEME = 'radar_custom_theme';
export const STORAGE_KEY_LEGACY = 'radar_visual_style_settings_v1';

export function getShadowCssValue(shadow: SupportedShadow): string {
  switch (shadow) {
    case 'none': return 'none';
    case 'small': return '0 1px 3px 0 rgba(0, 0, 0, 0.2)';
    case 'medium': return '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)';
    case 'large': return '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)';
    default: return '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
  }
}

export function getButtonHeight(size: ButtonSize): number {
  switch (size) {
    case 'small': return 32;
    case 'large': return 48;
    case 'medium':
    default: return 40;
  }
}

export function getButtonRadius(shape: ButtonShape): number {
  switch (shape) {
    case 'square': return 0;
    case 'full_pill': return 50;
    case 'rounded':
    default: return 8;
  }
}

function sanitizeLoadedSettings(parsed: any): VisualSettings {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_VISUAL_SETTINGS;
  }

  const s = parsed.rawSettings || parsed.settings || parsed;

  const parseNum = (val: any, fallback: number): number => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const n = parseFloat(val);
      if (!isNaN(n)) return n;
    }
    return fallback;
  };

  const parseStr = (val: any, fallback: string): string => {
    return typeof val === 'string' && val.trim() ? val.trim() : fallback;
  };

  // Merge loaded buttons list or fallback to default
  let loadedButtons = DEFAULT_MANAGED_BUTTONS;
  if (Array.isArray(s.buttonsList) && s.buttonsList.length > 0) {
    loadedButtons = DEFAULT_MANAGED_BUTTONS.map(defBtn => {
      const found = s.buttonsList.find((b: any) => b.id === defBtn.id);
      return found ? { ...defBtn, ...found } : defBtn;
    });
  }

  return {
    ...DEFAULT_VISUAL_SETTINGS,
    colorPrimary: parseStr(s.colorPrimary, DEFAULT_VISUAL_SETTINGS.colorPrimary),
    colorSecondary: parseStr(s.colorSecondary, DEFAULT_VISUAL_SETTINGS.colorSecondary),
    colorBackground: parseStr(s.colorBackground, DEFAULT_VISUAL_SETTINGS.colorBackground),
    colorCard: parseStr(s.colorCard, DEFAULT_VISUAL_SETTINGS.colorCard),
    colorText: parseStr(s.colorText, DEFAULT_VISUAL_SETTINGS.colorText),
    colorTextSecondary: parseStr(s.colorTextSecondary, DEFAULT_VISUAL_SETTINGS.colorTextSecondary),
    colorBorder: parseStr(s.colorBorder, DEFAULT_VISUAL_SETTINGS.colorBorder),
    colorSuccess: parseStr(s.colorSuccess, DEFAULT_VISUAL_SETTINGS.colorSuccess),
    colorError: parseStr(s.colorError, DEFAULT_VISUAL_SETTINGS.colorError),
    colorWarning: parseStr(s.colorWarning, DEFAULT_VISUAL_SETTINGS.colorWarning),

    fontSizeBase: parseNum(s.fontSizeBase, DEFAULT_VISUAL_SETTINGS.fontSizeBase),
    fontSizeH1: parseNum(s.fontSizeH1, DEFAULT_VISUAL_SETTINGS.fontSizeH1),
    fontSizeH2: parseNum(s.fontSizeH2, DEFAULT_VISUAL_SETTINGS.fontSizeH2),
    fontSizeH3: parseNum(s.fontSizeH3, DEFAULT_VISUAL_SETTINGS.fontSizeH3),
    fontSizeCard: parseNum(s.fontSizeCard, DEFAULT_VISUAL_SETTINGS.fontSizeCard),
    fontSizeSmall: parseNum(s.fontSizeSmall, DEFAULT_VISUAL_SETTINGS.fontSizeSmall),
    fontWeight: ['300', '400', '700', '800'].includes(s.fontWeight) ? s.fontWeight : DEFAULT_VISUAL_SETTINGS.fontWeight,
    fontFamily: ['Cairo', 'Tajawal', 'Inter', 'Amiri', 'Alexandria'].includes(s.fontFamily) ? s.fontFamily : DEFAULT_VISUAL_SETTINGS.fontFamily,
    lineHeight: parseNum(s.lineHeight, DEFAULT_VISUAL_SETTINGS.lineHeight),
    colorHeading: parseStr(s.colorHeading, DEFAULT_VISUAL_SETTINGS.colorHeading),

    borderRadius: parseNum(s.borderRadius, DEFAULT_VISUAL_SETTINGS.borderRadius),
    borderWidth: parseNum(s.borderWidth, DEFAULT_VISUAL_SETTINGS.borderWidth),
    cardPadding: parseNum(s.cardPadding, DEFAULT_VISUAL_SETTINGS.cardPadding),
    cardMargin: parseNum(s.cardMargin, DEFAULT_VISUAL_SETTINGS.cardMargin),
    gapBetweenCards: parseNum(s.gapBetweenCards, DEFAULT_VISUAL_SETTINGS.gapBetweenCards),
    cardShadow: ['none', 'small', 'medium', 'large'].includes(s.cardShadow) ? s.cardShadow : DEFAULT_VISUAL_SETTINGS.cardShadow,

    buttonSize: ['small', 'medium', 'large'].includes(s.buttonSize) ? s.buttonSize : DEFAULT_VISUAL_SETTINGS.buttonSize,
    buttonShape: ['square', 'rounded', 'full_pill'].includes(s.buttonShape) ? s.buttonShape : DEFAULT_VISUAL_SETTINGS.buttonShape,
    buttonPrimaryColor: parseStr(s.buttonPrimaryColor, DEFAULT_VISUAL_SETTINGS.buttonPrimaryColor),
    buttonTextColor: parseStr(s.buttonTextColor, DEFAULT_VISUAL_SETTINGS.buttonTextColor),

    buttonsList: loadedButtons,

    // Legacy fields preserved
    cardMaxWidth: parseNum(s.cardMaxWidth, DEFAULT_VISUAL_SETTINGS.cardMaxWidth),
    cardWidthMode: ['full', 'standard', 'compact', 'custom'].includes(s.cardWidthMode) ? s.cardWidthMode : DEFAULT_VISUAL_SETTINGS.cardWidthMode,
    cardBorderRadius: parseNum(s.cardBorderRadius ?? s.borderRadius, DEFAULT_VISUAL_SETTINGS.cardBorderRadius),
    cardBorderWidth: parseNum(s.cardBorderWidth ?? s.borderWidth, DEFAULT_VISUAL_SETTINGS.cardBorderWidth),
    cardBackgroundColor: parseStr(s.cardBackgroundColor ?? s.colorCard, DEFAULT_VISUAL_SETTINGS.cardBackgroundColor),
    cardBorderColor: parseStr(s.cardBorderColor ?? s.colorBorder, DEFAULT_VISUAL_SETTINGS.cardBorderColor),
    buttonWidthMode: ['full', 'auto', 'custom'].includes(s.buttonWidthMode) ? s.buttonWidthMode : DEFAULT_VISUAL_SETTINGS.buttonWidthMode,
    buttonCustomWidth: parseNum(s.buttonCustomWidth, DEFAULT_VISUAL_SETTINGS.buttonCustomWidth),
    buttonPaddingY: parseNum(s.buttonPaddingY, DEFAULT_VISUAL_SETTINGS.buttonPaddingY),
    buttonPaddingX: parseNum(s.buttonPaddingX, DEFAULT_VISUAL_SETTINGS.buttonPaddingX),
    buttonMarginTop: parseNum(s.buttonMarginTop, DEFAULT_VISUAL_SETTINGS.buttonMarginTop),
    buttonMarginRight: parseNum(s.buttonMarginRight, DEFAULT_VISUAL_SETTINGS.buttonMarginRight),
    buttonMarginLeft: parseNum(s.buttonMarginLeft, DEFAULT_VISUAL_SETTINGS.buttonMarginLeft),
    buttonTranslateX: parseNum(s.buttonTranslateX, DEFAULT_VISUAL_SETTINGS.buttonTranslateX),
    buttonBorderRadius: parseNum(s.buttonBorderRadius ?? s.borderRadius, DEFAULT_VISUAL_SETTINGS.buttonBorderRadius),
    buttonFontSize: parseNum(s.buttonFontSize, DEFAULT_VISUAL_SETTINGS.buttonFontSize),
    buttonFontWeight: ['600', '700', '800', '900'].includes(s.buttonFontWeight) ? s.buttonFontWeight : DEFAULT_VISUAL_SETTINGS.buttonFontWeight,
    buttonAlignment: ['center', 'right', 'left', 'between'].includes(s.buttonAlignment) ? s.buttonAlignment : DEFAULT_VISUAL_SETTINGS.buttonAlignment,
    buttonColorStart: parseStr(s.buttonColorStart ?? s.colorPrimary, DEFAULT_VISUAL_SETTINGS.buttonColorStart),
    buttonColorEnd: parseStr(s.buttonColorEnd ?? '#e65c00', DEFAULT_VISUAL_SETTINGS.buttonColorEnd),
    textWrapMode: ['nowrap', 'normal'].includes(s.textWrapMode) ? s.textWrapMode : DEFAULT_VISUAL_SETTINGS.textWrapMode,
    titleFontSize: parseNum(s.titleFontSize ?? s.fontSizeH1, DEFAULT_VISUAL_SETTINGS.titleFontSize),
    bodyFontSize: parseNum(s.bodyFontSize ?? s.fontSizeBase, DEFAULT_VISUAL_SETTINGS.bodyFontSize),
    textColorPrimary: parseStr(s.textColorPrimary ?? s.colorText, DEFAULT_VISUAL_SETTINGS.textColorPrimary),
    accentColor: parseStr(s.accentColor ?? s.colorPrimary, DEFAULT_VISUAL_SETTINGS.accentColor),
  };
}

interface VisualCustomizerContextType {
  settings: VisualSettings;
  updateSettings: (newSettings: Partial<VisualSettings>) => void;
  updateButton: (id: string, updates: Partial<ManagedButtonItem>) => void;
  moveButtonOrder: (id: string, direction: 'up' | 'down') => void;
  resetDefaults: () => void;
  applyPreset: (presetName: 'full_wide' | 'compact' | 'comfortable' | 'custom_offset') => void;
  applyThemePreset: (presetKey: string) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (isOpen: boolean) => void;
  toggleCustomizer: () => void;
  saveSettingsToStorage: () => Promise<boolean>;
  clearStorageAndReset: () => void;
  lastSavedAt: number | null;
  hasStoredSettings: boolean;
  exportSettingsToJson: (customFileName?: string) => void;
  importSettingsFromJson: (jsonStr: string) => boolean;
}

const VisualCustomizerContext = createContext<VisualCustomizerContextType | undefined>(undefined);

export const VisualCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualSettings>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_THEME) || localStorage.getItem(STORAGE_KEY_LEGACY);
        if (stored) {
          return sanitizeLoadedSettings(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('[VisualCustomizer] Could not read from LocalStorage on mount:', e);
      }
    }
    return DEFAULT_VISUAL_SETTINGS;
  });

  const [hasStoredSettings, setHasStoredSettings] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Apply live CSS variables directly to :root
  const applyLiveStyles = useCallback((s: VisualSettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Direct :root variables specified by user
    root.style.setProperty('--primary', s.colorPrimary);
    root.style.setProperty('--secondary', s.colorSecondary);
    root.style.setProperty('--background', s.colorBackground);
    root.style.setProperty('--card-bg', s.colorCard);
    root.style.setProperty('--text', s.colorText);
    root.style.setProperty('--text-secondary', s.colorTextSecondary);
    root.style.setProperty('--border', s.colorBorder);
    root.style.setProperty('--success', s.colorSuccess);
    root.style.setProperty('--error', s.colorError);
    root.style.setProperty('--warning', s.colorWarning);

    root.style.setProperty('--radius', `${s.borderRadius}px`);
    root.style.setProperty('--border-width', `${s.borderWidth}px`);
    root.style.setProperty('--font-base', `${s.fontSizeBase}px`);
    root.style.setProperty('--font-h1', `${s.fontSizeH1}px`);
    root.style.setProperty('--font-h2', `${s.fontSizeH2}px`);
    root.style.setProperty('--font-h3', `${s.fontSizeH3}px`);
    root.style.setProperty('--font-card', `${s.fontSizeCard}px`);
    root.style.setProperty('--font-family', `'${s.fontFamily}', sans-serif`);
    root.style.setProperty('--font-weight', s.fontWeight);
    root.style.setProperty('--line-height', String(s.lineHeight));
    root.style.setProperty('--card-padding', `${s.cardPadding}px`);
    root.style.setProperty('--card-margin', `${s.cardMargin}px`);
    root.style.setProperty('--cards-gap', `${s.gapBetweenCards}px`);
    root.style.setProperty('--btn-size', `${getButtonHeight(s.buttonSize)}px`);
    root.style.setProperty('--btn-radius', `${getButtonRadius(s.buttonShape)}px`);
    root.style.setProperty('--btn-bg', s.buttonPrimaryColor);
    root.style.setProperty('--btn-text', s.buttonTextColor);

    // Backward-compatibility variables
    root.style.setProperty('--theme-primary', s.colorPrimary);
    root.style.setProperty('--theme-secondary', s.colorSecondary);
    root.style.setProperty('--theme-background', s.colorBackground);
    root.style.setProperty('--theme-text', s.colorText);
    root.style.setProperty('--theme-card', s.colorCard);
    root.style.setProperty('--theme-border', s.colorBorder);
    root.style.setProperty('--theme-success', s.colorSuccess);
    root.style.setProperty('--theme-error', s.colorError);
    root.style.setProperty('--theme-font-size', `${s.fontSizeBase}px`);
    root.style.setProperty('--theme-h1-size', `${s.fontSizeH1}px`);
    root.style.setProperty('--theme-small-size', `${s.fontSizeSmall}px`);
    root.style.setProperty('--theme-font-family', `'${s.fontFamily}', sans-serif`);
    root.style.setProperty('--theme-font-weight', s.fontWeight);
    root.style.setProperty('--theme-line-height', String(s.lineHeight));
    root.style.setProperty('--theme-heading-color', s.colorHeading);
    root.style.setProperty('--theme-border-radius', `${s.borderRadius}px`);
    root.style.setProperty('--theme-border-width', `${s.borderWidth}px`);
    root.style.setProperty('--theme-shadow', getShadowCssValue(s.cardShadow));

    // Dynamic style tag
    let styleTag = document.getElementById('radar-live-customizer-styles') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'radar-live-customizer-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --color-primary: ${s.colorPrimary};
        --color-secondary: ${s.colorSecondary};
        --color-card: ${s.colorCard};
        --color-border: ${s.colorBorder};
        --app-font-family: '${s.fontFamily}', sans-serif;
      }
      body {
        font-family: '${s.fontFamily}', sans-serif !important;
        font-size: ${s.fontSizeBase}px;
        line-height: ${s.lineHeight};
      }
      .dynamic-theme-heading, h1 {
        font-size: ${s.fontSizeH1}px;
        color: ${s.colorHeading} !important;
      }
      .dynamic-theme-card {
        background-color: ${s.colorCard} !important;
        border-radius: ${s.borderRadius}px !important;
        border-width: ${s.borderWidth}px !important;
        border-color: ${s.colorBorder} !important;
        box-shadow: ${getShadowCssValue(s.cardShadow)} !important;
        padding: ${s.cardPadding}px !important;
      }
      .dynamic-theme-button {
        border-radius: ${getButtonRadius(s.buttonShape)}px !important;
        background-color: ${s.buttonPrimaryColor} !important;
        color: ${s.buttonTextColor} !important;
        height: ${getButtonHeight(s.buttonSize)}px !important;
      }
    `;
  }, []);

  // Sync styles on changes
  useEffect(() => {
    applyLiveStyles(settings);
  }, [settings, applyLiveStyles]);

  // Synchronize with LocalStorage across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEY_CUSTOM_THEME || e.key === STORAGE_KEY_LEGACY) && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          const sanitized = sanitizeLoadedSettings(updated);
          setSettings(sanitized);
          setHasStoredSettings(true);
          setLastSavedAt(Date.now());
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to LocalStorage automatically
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const jsonStr = JSON.stringify(settings);
        localStorage.setItem(STORAGE_KEY_CUSTOM_THEME, jsonStr);
        localStorage.setItem(STORAGE_KEY_LEGACY, jsonStr);
        setHasStoredSettings(true);
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Could not write to LocalStorage:', e);
    }
  }, [settings]);

  // Manual save to localStorage AND Supabase table user_themes
  const saveSettingsToStorage = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const jsonStr = JSON.stringify(settings);
        localStorage.setItem(STORAGE_KEY_CUSTOM_THEME, jsonStr);
        localStorage.setItem(STORAGE_KEY_LEGACY, jsonStr);
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }

      // Save to Supabase table user_themes (user_id, theme_json)
      try {
        const userId = 'radar_merchant_owner';
        await supabase.from('user_themes').insert({
          user_id: userId,
          theme_json: settings,
          updated_at: new Date().toISOString()
        });
      } catch (sbErr) {
        // Graceful fallback if user_themes table not provisioned or offline
        console.info('[VisualCustomizer] Supabase user_themes saved locally.');
      }

      return true;
    } catch (e) {
      console.warn('[VisualCustomizer] Save failed:', e);
      return false;
    }
  };

  const updateSettings = (newPartial: Partial<VisualSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newPartial };
      if (newPartial.colorPrimary) {
        merged.cardBorderColor = newPartial.colorPrimary;
        merged.buttonColorStart = newPartial.colorPrimary;
        merged.accentColor = newPartial.colorPrimary;
      }
      if (newPartial.colorCard) {
        merged.cardBackgroundColor = newPartial.colorCard;
      }
      if (newPartial.colorText) {
        merged.textColorPrimary = newPartial.colorText;
      }
      if (newPartial.borderRadius !== undefined) {
        merged.cardBorderRadius = newPartial.borderRadius;
        merged.buttonBorderRadius = newPartial.borderRadius;
      }
      if (newPartial.borderWidth !== undefined) {
        merged.cardBorderWidth = newPartial.borderWidth;
      }
      if (newPartial.fontSizeH1 !== undefined) {
        merged.titleFontSize = newPartial.fontSizeH1;
      }
      if (newPartial.fontSizeBase !== undefined) {
        merged.bodyFontSize = newPartial.fontSizeBase;
      }
      return merged;
    });
  };

  const updateButton = (id: string, updates: Partial<ManagedButtonItem>) => {
    setSettings(prev => ({
      ...prev,
      buttonsList: prev.buttonsList.map(btn => btn.id === id ? { ...btn, ...updates } : btn)
    }));
  };

  const moveButtonOrder = (id: string, direction: 'up' | 'down') => {
    setSettings(prev => {
      const list = [...prev.buttonsList].sort((a, b) => a.order - b.order);
      const index = list.findIndex(b => b.id === id);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        const target = list[index - 1];
        const current = list[index];
        const tempOrder = target.order;
        target.order = current.order;
        current.order = tempOrder;
      } else if (direction === 'down' && index < list.length - 1) {
        const target = list[index + 1];
        const current = list[index];
        const tempOrder = target.order;
        target.order = current.order;
        current.order = tempOrder;
      }

      return {
        ...prev,
        buttonsList: list
      };
    });
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_VISUAL_SETTINGS);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const jsonStr = JSON.stringify(DEFAULT_VISUAL_SETTINGS);
        localStorage.setItem(STORAGE_KEY_CUSTOM_THEME, jsonStr);
        localStorage.setItem(STORAGE_KEY_LEGACY, jsonStr);
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error resetting defaults in LocalStorage:', e);
    }
  };

  const clearStorageAndReset = () => {
    setSettings(DEFAULT_VISUAL_SETTINGS);
    setHasStoredSettings(false);
    setLastSavedAt(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_CUSTOM_THEME);
        localStorage.removeItem(STORAGE_KEY_LEGACY);
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error removing from LocalStorage:', e);
    }
  };

  const applyThemePreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;
    updateSettings(preset.settings);
  };

  const applyPreset = (presetName: 'full_wide' | 'compact' | 'comfortable' | 'custom_offset') => {
    let nextSettings: VisualSettings = { ...settings };
    switch (presetName) {
      case 'full_wide':
        nextSettings = {
          ...settings,
          cardMaxWidth: 1100,
          cardWidthMode: 'custom',
          buttonWidthMode: 'full',
          cardPadding: 32,
          buttonPaddingY: 18,
          buttonPaddingX: 32,
          buttonFontSize: 18,
          buttonTranslateX: 0,
          buttonMarginLeft: 0,
          textWrapMode: 'nowrap',
        };
        break;
      case 'compact':
        nextSettings = {
          ...settings,
          cardMaxWidth: 540,
          cardWidthMode: 'compact',
          buttonWidthMode: 'full',
          cardPadding: 16,
          buttonPaddingY: 12,
          buttonPaddingX: 18,
          buttonFontSize: 14,
          buttonTranslateX: 0,
          buttonMarginLeft: 0,
          textWrapMode: 'normal',
        };
        break;
      case 'comfortable':
        nextSettings = {
          ...settings,
          cardMaxWidth: 720,
          cardWidthMode: 'standard',
          buttonWidthMode: 'full',
          cardPadding: 26,
          buttonPaddingY: 14,
          buttonPaddingX: 24,
          buttonFontSize: 15,
          buttonTranslateX: 0,
          buttonMarginLeft: 16,
          textWrapMode: 'nowrap',
        };
        break;
      case 'custom_offset':
        nextSettings = {
          ...settings,
          buttonTranslateX: -24,
          buttonMarginLeft: 32,
          buttonMarginTop: 24,
        };
        break;
    }
    setSettings(nextSettings);
  };

  const exportSettingsToJson = (customFileName?: string) => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        version: 'v5.0-arrow-control-pro',
        settings
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = customFileName || `radar_theme_settings_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[VisualCustomizer] Error exporting settings:', e);
    }
  };

  const importSettingsFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const sanitized = sanitizeLoadedSettings(parsed);
      setSettings(sanitized);
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = JSON.stringify(sanitized);
        localStorage.setItem(STORAGE_KEY_CUSTOM_THEME, serialized);
        localStorage.setItem(STORAGE_KEY_LEGACY, serialized);
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }
      return true;
    } catch (e) {
      console.error('[VisualCustomizer] Failed to parse imported JSON:', e);
      return false;
    }
  };

  const toggleCustomizer = () => {
    setIsCustomizerOpen(prev => !prev);
  };

  return (
    <VisualCustomizerContext.Provider
      value={{
        settings,
        updateSettings,
        updateButton,
        moveButtonOrder,
        resetDefaults,
        applyPreset,
        applyThemePreset,
        isCustomizerOpen,
        setIsCustomizerOpen,
        toggleCustomizer,
        saveSettingsToStorage,
        clearStorageAndReset,
        lastSavedAt,
        hasStoredSettings,
        exportSettingsToJson,
        importSettingsFromJson,
      }}
    >
      {children}
    </VisualCustomizerContext.Provider>
  );
};

export const useVisualCustomizer = () => {
  const context = useContext(VisualCustomizerContext);
  if (!context) {
    throw new Error('useVisualCustomizer must be used within a VisualCustomizerProvider');
  }
  return context;
};
