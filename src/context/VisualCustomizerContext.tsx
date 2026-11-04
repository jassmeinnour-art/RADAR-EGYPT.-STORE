import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SupportedFontFamily = 'Cairo' | 'Tajawal' | 'Inter' | 'Amiri';
export type SupportedFontWeight = '300' | '400' | '700' | '800';
export type SupportedShadow = 'none' | 'small' | 'medium' | 'large' | 'glow';
export type ThemePresetKey = 'dark_radar' | 'midnight_navy' | 'clean_light' | 'neon_cyber' | 'luxury_gold' | 'emerald_profit';

export interface VisualSettings {
  // Section 1: الألوان الرئيسية (Primary, Secondary, Background, Text, Card, Border, Success, Error)
  colorPrimary: string;      // #FF8C00 (برتقالي رادار)
  colorSecondary: string;    // #0a0f1f (كحلي غامق)
  colorBackground: string;   // #0a0f1f (الخلفية)
  colorText: string;         // #ffffff / #1a1a1a (لون النص)
  colorCard: string;         // #1a2332 / #ffffff (لون البطاقات)
  colorBorder: string;       // #e5e7eb / #334155 (لون الحدود)
  colorSuccess: string;      // #10b981 (لون النجاح)
  colorError: string;        // #ef4444 (لون الخطأ)

  // Section 2: النصوص والخطوط (Typography)
  fontSizeBase: number;      // Slider 12px - 20px (افتراضي 14px)
  fontSizeH1: number;        // Slider 20px - 40px (افتراضي 26px)
  fontSizeSmall: number;     // Slider 10px - 16px (افتراضي 12px)
  fontFamily: SupportedFontFamily; // Cairo, Tajawal, Inter, Amiri
  fontWeight: SupportedFontWeight; // Light(300), Regular(400), Bold(700), ExtraBold(800)
  lineHeight: number;        // Slider 1.2 - 2.0 (افتراضي 1.6)
  colorHeading: string;      // Color picker منفصل للعناوين

  // Section 3: الإطارات والبطاقات (Borders & Cards)
  borderRadius: number;      // Slider 0px - 30px (افتراضي 12px)
  borderWidth: number;       // Slider 0px - 4px (افتراضي 1px)
  cardShadow: SupportedShadow; // None, Small, Medium, Large, Glow

  // Legacy & specific button controls preserved for existing components
  cardMaxWidth: number;
  cardWidthMode: 'full' | 'standard' | 'compact' | 'custom';
  cardPadding: number;
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
  buttonTextColor: string;
  textWrapMode: 'nowrap' | 'normal';
  titleFontSize: number;
  bodyFontSize: number;
  textColorPrimary: string;
  accentColor: string;
}

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  // Section 1
  colorPrimary: '#FF8C00',
  colorSecondary: '#0a0f1f',
  colorBackground: '#07090e',
  colorText: '#f8fafc',
  colorCard: '#0f172a',
  colorBorder: '#1e293b',
  colorSuccess: '#10b981',
  colorError: '#ef4444',

  // Section 2
  fontSizeBase: 14,
  fontSizeH1: 26,
  fontSizeSmall: 12,
  fontFamily: 'Cairo',
  fontWeight: '700',
  lineHeight: 1.6,
  colorHeading: '#FF8C00',

  // Section 3
  borderRadius: 12,
  borderWidth: 1,
  cardShadow: 'medium',

  // Legacy compatibility defaults
  cardMaxWidth: 720,
  cardWidthMode: 'standard',
  cardPadding: 26,
  cardBorderRadius: 16,
  cardBorderWidth: 1,
  cardBackgroundColor: '#0f172a',
  cardBorderColor: '#FF8C00',

  buttonWidthMode: 'full',
  buttonCustomWidth: 380,
  buttonPaddingY: 14,
  buttonPaddingX: 24,
  buttonMarginTop: 20,
  buttonMarginRight: 0,
  buttonMarginLeft: 16,
  buttonTranslateX: 0,
  buttonBorderRadius: 12,
  buttonFontSize: 15,
  buttonFontWeight: '800',
  buttonAlignment: 'center',
  buttonColorStart: '#FF8C00',
  buttonColorEnd: '#e65c00',
  buttonTextColor: '#ffffff',

  textWrapMode: 'nowrap',
  titleFontSize: 24,
  bodyFontSize: 14,
  textColorPrimary: '#f8fafc',
  accentColor: '#FF8C00',
};

export const THEME_PRESETS: Record<ThemePresetKey, { label: string; desc: string; settings: Partial<VisualSettings> }> = {
  dark_radar: {
    label: 'رادار التاجر (Dark Radar)',
    desc: 'المظهر الداكن المعتمد بألوان برتقالي الرادار وخلفية فحمية مريحة للعين',
    settings: {
      colorPrimary: '#FF8C00',
      colorSecondary: '#0a0f1f',
      colorBackground: '#07090e',
      colorCard: '#0f172a',
      colorText: '#f8fafc',
      colorBorder: '#1e293b',
      colorHeading: '#FF8C00',
      fontFamily: 'Cairo',
      borderRadius: 14,
      cardShadow: 'medium',
      buttonColorStart: '#FF8C00',
      buttonColorEnd: '#e65c00',
      cardBackgroundColor: '#0f172a',
      cardBorderColor: '#FF8C00'
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
      colorBorder: '#334155',
      colorHeading: '#38bdf8',
      fontFamily: 'Tajawal',
      borderRadius: 16,
      cardShadow: 'large',
      buttonColorStart: '#0284c7',
      buttonColorEnd: '#0369a1',
      cardBackgroundColor: '#1e293b',
      cardBorderColor: '#38bdf8'
    }
  },
  clean_light: {
    label: 'فاتح ناصع (Clean Light)',
    desc: 'تصميم مشرق وعالي التباين بخلفية أوف وايت أنيقة ونصوص داكنة',
    settings: {
      colorPrimary: '#FF8C00',
      colorSecondary: '#e2e8f0',
      colorBackground: '#f8fafc',
      colorCard: '#ffffff',
      colorText: '#0f172a',
      colorBorder: '#e2e8f0',
      colorHeading: '#0f172a',
      fontFamily: 'Cairo',
      borderRadius: 12,
      cardShadow: 'small',
      buttonColorStart: '#FF8C00',
      buttonColorEnd: '#e65c00',
      cardBackgroundColor: '#ffffff',
      cardBorderColor: '#FF8C00'
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
      colorBorder: '#00ffcc44',
      colorHeading: '#00ffcc',
      fontFamily: 'Inter',
      borderRadius: 8,
      cardShadow: 'glow',
      buttonColorStart: '#00ffcc',
      buttonColorEnd: '#059669',
      buttonTextColor: '#040508',
      cardBackgroundColor: '#0d1117',
      cardBorderColor: '#00ffcc'
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
      colorBorder: '#ca8a0444',
      colorHeading: '#facc15',
      fontFamily: 'Tajawal',
      borderRadius: 14,
      cardShadow: 'medium',
      buttonColorStart: '#eab308',
      buttonColorEnd: '#a16207',
      buttonTextColor: '#09090b',
      cardBackgroundColor: '#18181b',
      cardBorderColor: '#eab308'
    }
  },
  emerald_profit: {
    label: 'أخضر الأرباح (Emerald Profit)',
    desc: 'رمز النمو وصافي الأرباح والاستقرار التجاري في السوق',
    settings: {
      colorPrimary: '#10b981',
      colorSecondary: '#022c22',
      colorBackground: '#051814',
      colorCard: '#064e3b25',
      colorText: '#ecfdf5',
      colorBorder: '#05966944',
      colorHeading: '#34d399',
      fontFamily: 'Cairo',
      borderRadius: 16,
      cardShadow: 'medium',
      buttonColorStart: '#10b981',
      buttonColorEnd: '#047857',
      cardBackgroundColor: '#064e3b25',
      cardBorderColor: '#10b981'
    }
  }
};

interface VisualCustomizerContextType {
  settings: VisualSettings;
  updateSettings: (newSettings: Partial<VisualSettings>) => void;
  resetDefaults: () => void;
  applyPreset: (presetName: 'full_wide' | 'compact' | 'comfortable' | 'custom_offset') => void;
  applyThemePreset: (presetKey: ThemePresetKey) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (isOpen: boolean) => void;
  toggleCustomizer: () => void;
  saveSettingsToStorage: () => boolean;
  clearStorageAndReset: () => void;
  lastSavedAt: number | null;
  hasStoredSettings: boolean;
  exportSettingsToJson: (customFileName?: string) => void;
  importSettingsFromJson: (jsonStr: string) => boolean;
}

const VisualCustomizerContext = createContext<VisualCustomizerContextType | undefined>(undefined);

export const STORAGE_KEY = 'radar_visual_style_settings_v1';

export function getShadowCssValue(shadow: SupportedShadow): string {
  switch (shadow) {
    case 'none': return 'none';
    case 'small': return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
    case 'medium': return '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
    case 'large': return '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
    case 'glow': return '0 0 20px rgba(255, 140, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.4)';
    default: return '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
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

  return {
    ...DEFAULT_VISUAL_SETTINGS,
    colorPrimary: parseStr(s.colorPrimary, DEFAULT_VISUAL_SETTINGS.colorPrimary),
    colorSecondary: parseStr(s.colorSecondary, DEFAULT_VISUAL_SETTINGS.colorSecondary),
    colorBackground: parseStr(s.colorBackground, DEFAULT_VISUAL_SETTINGS.colorBackground),
    colorText: parseStr(s.colorText, DEFAULT_VISUAL_SETTINGS.colorText),
    colorCard: parseStr(s.colorCard, DEFAULT_VISUAL_SETTINGS.colorCard),
    colorBorder: parseStr(s.colorBorder, DEFAULT_VISUAL_SETTINGS.colorBorder),
    colorSuccess: parseStr(s.colorSuccess, DEFAULT_VISUAL_SETTINGS.colorSuccess),
    colorError: parseStr(s.colorError, DEFAULT_VISUAL_SETTINGS.colorError),

    fontSizeBase: parseNum(s.fontSizeBase, DEFAULT_VISUAL_SETTINGS.fontSizeBase),
    fontSizeH1: parseNum(s.fontSizeH1, DEFAULT_VISUAL_SETTINGS.fontSizeH1),
    fontSizeSmall: parseNum(s.fontSizeSmall, DEFAULT_VISUAL_SETTINGS.fontSizeSmall),
    fontFamily: ['Cairo', 'Tajawal', 'Inter', 'Amiri'].includes(s.fontFamily) ? s.fontFamily : DEFAULT_VISUAL_SETTINGS.fontFamily,
    fontWeight: ['300', '400', '700', '800'].includes(s.fontWeight) ? s.fontWeight : DEFAULT_VISUAL_SETTINGS.fontWeight,
    lineHeight: parseNum(s.lineHeight, DEFAULT_VISUAL_SETTINGS.lineHeight),
    colorHeading: parseStr(s.colorHeading, DEFAULT_VISUAL_SETTINGS.colorHeading),

    borderRadius: parseNum(s.borderRadius, DEFAULT_VISUAL_SETTINGS.borderRadius),
    borderWidth: parseNum(s.borderWidth, DEFAULT_VISUAL_SETTINGS.borderWidth),
    cardShadow: ['none', 'small', 'medium', 'large', 'glow'].includes(s.cardShadow) ? s.cardShadow : DEFAULT_VISUAL_SETTINGS.cardShadow,

    // Legacy fields preserved
    cardMaxWidth: parseNum(s.cardMaxWidth, DEFAULT_VISUAL_SETTINGS.cardMaxWidth),
    cardWidthMode: ['full', 'standard', 'compact', 'custom'].includes(s.cardWidthMode) ? s.cardWidthMode : DEFAULT_VISUAL_SETTINGS.cardWidthMode,
    cardPadding: parseNum(s.cardPadding, DEFAULT_VISUAL_SETTINGS.cardPadding),
    cardBorderRadius: parseNum(s.cardBorderRadius ?? s.borderRadius, DEFAULT_VISUAL_SETTINGS.cardBorderRadius),
    cardBorderWidth: parseNum(s.cardBorderWidth ?? s.borderWidth, DEFAULT_VISUAL_SETTINGS.cardBorderWidth),
    cardBackgroundColor: parseStr(s.cardBackgroundColor ?? s.colorCard, DEFAULT_VISUAL_SETTINGS.cardBackgroundColor),
    cardBorderColor: parseStr(s.cardBorderColor ?? s.colorPrimary, DEFAULT_VISUAL_SETTINGS.cardBorderColor),

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
    buttonTextColor: parseStr(s.buttonTextColor, DEFAULT_VISUAL_SETTINGS.buttonTextColor),

    textWrapMode: ['nowrap', 'normal'].includes(s.textWrapMode) ? s.textWrapMode : DEFAULT_VISUAL_SETTINGS.textWrapMode,
    titleFontSize: parseNum(s.titleFontSize ?? s.fontSizeH1, DEFAULT_VISUAL_SETTINGS.titleFontSize),
    bodyFontSize: parseNum(s.bodyFontSize ?? s.fontSizeBase, DEFAULT_VISUAL_SETTINGS.bodyFontSize),
    textColorPrimary: parseStr(s.textColorPrimary ?? s.colorText, DEFAULT_VISUAL_SETTINGS.textColorPrimary),
    accentColor: parseStr(s.accentColor ?? s.colorPrimary, DEFAULT_VISUAL_SETTINGS.accentColor),
  };
}

export const VisualCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualSettings>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
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

  // Apply live CSS variables and inject dynamic style tag on settings change
  const applyLiveStyles = useCallback((s: VisualSettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
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

    // Dynamic global style override tag
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
      .font-sans, .font-\\[\\'Cairo\\',sans-serif\\] {
        font-family: '${s.fontFamily}', sans-serif !important;
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
      }
      .dynamic-theme-button {
        border-radius: ${s.borderRadius}px !important;
        background-color: ${s.colorPrimary} !important;
      }
    `;
  }, []);

  // Update styles whenever settings change
  useEffect(() => {
    applyLiveStyles(settings);
  }, [settings, applyLiveStyles]);

  // Check on mount if LocalStorage has stored settings
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setHasStoredSettings(true);
          setLastSavedAt(Date.now());
        }
      }
    } catch {}
  }, []);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          const sanitized = sanitizeLoadedSettings(updated);
          setSettings(sanitized);
          setHasStoredSettings(true);
          setLastSavedAt(Date.now());
        } catch {}
      } else if (e.key === STORAGE_KEY && !e.newValue) {
        setSettings(DEFAULT_VISUAL_SETTINGS);
        setHasStoredSettings(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist to LocalStorage automatically whenever settings change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Could not write to LocalStorage:', e);
    }
  }, [settings]);

  const saveSettingsToStorage = (): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[VisualCustomizer] Explicit LocalStorage save failed:', e);
      return false;
    }
  };

  const updateSettings = (newPartial: Partial<VisualSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newPartial };
      // Keep legacy synchronized with new primary colors/borders
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

  const resetDefaults = () => {
    setSettings(DEFAULT_VISUAL_SETTINGS);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VISUAL_SETTINGS));
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
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error removing from LocalStorage:', e);
    }
  };

  const applyThemePreset = (presetKey: ThemePresetKey) => {
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
          cardMaxWidth: 760,
          cardWidthMode: 'standard',
          buttonWidthMode: 'full',
          cardPadding: 24,
          buttonPaddingY: 16,
          buttonPaddingX: 24,
          buttonFontSize: 16,
          buttonTranslateX: 0,
          buttonMarginLeft: 0,
          textWrapMode: 'nowrap',
        };
        break;
      case 'custom_offset':
        nextSettings = {
          ...settings,
          buttonTranslateX: 20,
          buttonMarginLeft: 16,
          buttonAlignment: 'right',
        };
        break;
    }
    setSettings(nextSettings);
  };

  const exportSettingsToJson = (customFileName?: string): void => {
    try {
      const fileName = customFileName || 'merchant-radar-visual-theme.json';
      const payload = {
        schemaVersion: '2.0.0',
        app: 'RADAR EGYPT (رادار التاجر الذكي - Visual Theme Customizer Pro)',
        fileName,
        exportedAt: new Date().toISOString(),
        settings,
      };

      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('[VisualCustomizer] Error exporting JSON:', e);
    }
  };

  const importSettingsFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const sanitized = sanitizeLoadedSettings(parsed);
      setSettings(sanitized);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }
      return true;
    } catch (e) {
      console.warn('[VisualCustomizer] Error importing JSON settings:', e);
      return false;
    }
  };

  const toggleCustomizer = () => {
    setIsCustomizerOpen((prev) => !prev);
  };

  return (
    <VisualCustomizerContext.Provider
      value={{
        settings,
        updateSettings,
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
