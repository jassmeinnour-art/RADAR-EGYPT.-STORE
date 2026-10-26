import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VisualSettings {
  cardMaxWidth: number; // 400 - 1200 px
  cardWidthMode: 'full' | 'standard' | 'compact' | 'custom';
  cardPadding: number; // 12 - 48 px
  cardBorderRadius: number; // 8 - 36 px
  cardBorderWidth: number; // 1 - 6 px
  cardBackgroundColor: string; // hex
  cardBorderColor: string; // hex
  
  buttonWidthMode: 'full' | 'auto' | 'custom';
  buttonCustomWidth: number; // 200 - 600 px
  buttonPaddingY: number; // 8 - 28 px
  buttonPaddingX: number; // 12 - 48 px
  buttonMarginTop: number; // 8 - 48 px
  buttonMarginRight: number; // -40 - 60 px
  buttonMarginLeft: number; // -40 - 60 px
  buttonTranslateX: number; // -40 - 60 px
  buttonBorderRadius: number; // 6 - 32 px
  buttonFontSize: number; // 12 - 24 px
  buttonFontWeight: '600' | '700' | '800' | '900';
  buttonAlignment: 'center' | 'right' | 'left' | 'between';
  buttonColorStart: string; // hex
  buttonColorEnd: string; // hex
  buttonTextColor: string; // hex

  textWrapMode: 'nowrap' | 'normal';
  titleFontSize: number; // 16 - 32 px
  bodyFontSize: number; // 12 - 20 px
  textColorPrimary: string; // hex
  accentColor: string; // hex
}

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  cardMaxWidth: 720,
  cardWidthMode: 'standard',
  cardPadding: 26,
  cardBorderRadius: 20,
  cardBorderWidth: 2,
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#ff6b00',

  buttonWidthMode: 'full',
  buttonCustomWidth: 380,
  buttonPaddingY: 16,
  buttonPaddingX: 24,
  buttonMarginTop: 24,
  buttonMarginRight: 0,
  buttonMarginLeft: 16,
  buttonTranslateX: 16,
  buttonBorderRadius: 14,
  buttonFontSize: 16,
  buttonFontWeight: '800',
  buttonAlignment: 'center',
  buttonColorStart: '#ff6b00',
  buttonColorEnd: '#e65c00',
  buttonTextColor: '#ffffff',

  textWrapMode: 'nowrap',
  titleFontSize: 22,
  bodyFontSize: 15,
  textColorPrimary: '#0f172a',
  accentColor: '#ff6b00',
};

interface VisualCustomizerContextType {
  settings: VisualSettings;
  updateSettings: (newSettings: Partial<VisualSettings>) => void;
  resetDefaults: () => void;
  applyPreset: (presetName: 'full_wide' | 'compact' | 'comfortable' | 'custom_offset') => void;
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
const LEGACY_STORAGE_KEYS = ['radar_visual_style_settings', 'bayyaa_visual_settings'];

/**
 * Validates and safely merges stored settings with defaults to guarantee type safety and prevent NaN
 * Supports both raw flat settings and categorized merchant-radar-styles.json format
 */
function sanitizeLoadedSettings(parsed: any): VisualSettings {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_VISUAL_SETTINGS;
  }

  const source = parsed.rawSettings || parsed.settings || parsed;
  const dims = parsed.dimensions || {};
  const margins = parsed.marginsAndSpacings || {};
  const borders = parsed.borders || {};
  const colors = parsed.colors || {};

  const parsePx = (val: any, fallback: number): number => {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val === 'string') {
      const parsedNum = parseFloat(val);
      if (!isNaN(parsedNum)) return parsedNum;
    }
    return fallback;
  };

  return {
    cardMaxWidth: parsePx(source.cardMaxWidth ?? dims.cardMaxWidth, DEFAULT_VISUAL_SETTINGS.cardMaxWidth),
    cardWidthMode: ['full', 'standard', 'compact', 'custom'].includes(source.cardWidthMode ?? dims.cardWidthMode)
      ? (source.cardWidthMode ?? dims.cardWidthMode)
      : DEFAULT_VISUAL_SETTINGS.cardWidthMode,
    cardPadding: parsePx(source.cardPadding ?? margins.cardPadding, DEFAULT_VISUAL_SETTINGS.cardPadding),
    cardBorderRadius: parsePx(source.cardBorderRadius ?? borders.cardBorderRadius, DEFAULT_VISUAL_SETTINGS.cardBorderRadius),
    cardBorderWidth: parsePx(source.cardBorderWidth ?? borders.cardBorderWidth, DEFAULT_VISUAL_SETTINGS.cardBorderWidth),
    cardBackgroundColor: typeof (source.cardBackgroundColor ?? colors.cardBackgroundColor) === 'string'
      ? (source.cardBackgroundColor ?? colors.cardBackgroundColor)
      : DEFAULT_VISUAL_SETTINGS.cardBackgroundColor,
    cardBorderColor: typeof (source.cardBorderColor ?? colors.cardBorderColor) === 'string'
      ? (source.cardBorderColor ?? colors.cardBorderColor)
      : DEFAULT_VISUAL_SETTINGS.cardBorderColor,

    buttonWidthMode: ['full', 'auto', 'custom'].includes(source.buttonWidthMode ?? dims.buttonWidthMode)
      ? (source.buttonWidthMode ?? dims.buttonWidthMode)
      : DEFAULT_VISUAL_SETTINGS.buttonWidthMode,
    buttonCustomWidth: parsePx(source.buttonCustomWidth ?? dims.buttonCustomWidth, DEFAULT_VISUAL_SETTINGS.buttonCustomWidth),
    buttonPaddingY: parsePx(source.buttonPaddingY ?? margins.buttonPaddingY, DEFAULT_VISUAL_SETTINGS.buttonPaddingY),
    buttonPaddingX: parsePx(source.buttonPaddingX ?? margins.buttonPaddingX, DEFAULT_VISUAL_SETTINGS.buttonPaddingX),
    buttonMarginTop: parsePx(source.buttonMarginTop ?? margins.buttonMarginTop, DEFAULT_VISUAL_SETTINGS.buttonMarginTop),
    buttonMarginRight: parsePx(source.buttonMarginRight ?? margins.buttonMarginRight, DEFAULT_VISUAL_SETTINGS.buttonMarginRight),
    buttonMarginLeft: parsePx(source.buttonMarginLeft ?? margins.buttonMarginLeft, DEFAULT_VISUAL_SETTINGS.buttonMarginLeft),
    buttonTranslateX: parsePx(source.buttonTranslateX ?? margins.buttonTranslateX, DEFAULT_VISUAL_SETTINGS.buttonTranslateX),
    buttonBorderRadius: parsePx(source.buttonBorderRadius ?? borders.buttonBorderRadius, DEFAULT_VISUAL_SETTINGS.buttonBorderRadius),
    buttonFontSize: parsePx(source.buttonFontSize ?? dims.buttonFontSize, DEFAULT_VISUAL_SETTINGS.buttonFontSize),
    buttonFontWeight: ['600', '700', '800', '900'].includes(source.buttonFontWeight)
      ? source.buttonFontWeight
      : DEFAULT_VISUAL_SETTINGS.buttonFontWeight,
    buttonAlignment: ['center', 'right', 'left', 'between'].includes(source.buttonAlignment ?? margins.buttonAlignment)
      ? (source.buttonAlignment ?? margins.buttonAlignment)
      : DEFAULT_VISUAL_SETTINGS.buttonAlignment,
    buttonColorStart: typeof (source.buttonColorStart ?? colors.buttonGradientStart) === 'string'
      ? (source.buttonColorStart ?? colors.buttonGradientStart)
      : DEFAULT_VISUAL_SETTINGS.buttonColorStart,
    buttonColorEnd: typeof (source.buttonColorEnd ?? colors.buttonGradientEnd) === 'string'
      ? (source.buttonColorEnd ?? colors.buttonGradientEnd)
      : DEFAULT_VISUAL_SETTINGS.buttonColorEnd,
    buttonTextColor: typeof (source.buttonTextColor ?? colors.buttonTextColor) === 'string'
      ? (source.buttonTextColor ?? colors.buttonTextColor)
      : DEFAULT_VISUAL_SETTINGS.buttonTextColor,

    textWrapMode: ['nowrap', 'normal'].includes(source.textWrapMode)
      ? source.textWrapMode
      : DEFAULT_VISUAL_SETTINGS.textWrapMode,
    titleFontSize: parsePx(source.titleFontSize ?? dims.titleFontSize, DEFAULT_VISUAL_SETTINGS.titleFontSize),
    bodyFontSize: parsePx(source.bodyFontSize ?? dims.bodyFontSize, DEFAULT_VISUAL_SETTINGS.bodyFontSize),
    textColorPrimary: typeof (source.textColorPrimary ?? colors.textColorPrimary) === 'string'
      ? (source.textColorPrimary ?? colors.textColorPrimary)
      : DEFAULT_VISUAL_SETTINGS.textColorPrimary,
    accentColor: typeof (source.accentColor ?? colors.accentColor) === 'string'
      ? (source.accentColor ?? colors.accentColor)
      : DEFAULT_VISUAL_SETTINGS.accentColor,
  };
}

export const VisualCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasStoredSettings, setHasStoredSettings] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Initialize state directly from LocalStorage
  const [settings, setSettings] = useState<VisualSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          // Check fallback legacy keys if available
          for (const legacyKey of LEGACY_STORAGE_KEYS) {
            const legacyRaw = localStorage.getItem(legacyKey);
            if (legacyRaw) {
              raw = legacyRaw;
              break;
            }
          }
        }

        if (raw) {
          const parsed = JSON.parse(raw);
          return sanitizeLoadedSettings(parsed);
        }
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Could not read from LocalStorage on mount:', e);
    }
    return DEFAULT_VISUAL_SETTINGS;
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

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
    } catch {
      // Ignore
    }
  }, []);

  // Multi-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          const sanitized = sanitizeLoadedSettings(updated);
          setSettings(sanitized);
          setHasStoredSettings(true);
          setLastSavedAt(Date.now());
        } catch {
          // ignore corrupted data from external tab
        }
      } else if (e.key === STORAGE_KEY && !e.newValue) {
        setSettings(DEFAULT_VISUAL_SETTINGS);
        setHasStoredSettings(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Persist to LocalStorage whenever settings change
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

  const updateSettings = (newSettings: Partial<VisualSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          setHasStoredSettings(true);
          setLastSavedAt(Date.now());
        }
      } catch (e) {
        console.warn('[VisualCustomizer] Error saving updated settings:', e);
      }
      return merged;
    });
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_VISUAL_SETTINGS);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VISUAL_SETTINGS));
        setHasStoredSettings(false);
        setLastSavedAt(Date.now());
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error resetting defaults in LocalStorage:', e);
    }
  };

  const clearStorageAndReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
        LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error removing from LocalStorage:', e);
    }
    setSettings(DEFAULT_VISUAL_SETTINGS);
    setHasStoredSettings(false);
    setLastSavedAt(null);
  };

  const applyPreset = (presetName: 'full_wide' | 'compact' | 'comfortable' | 'custom_offset') => {
    let nextSettings: VisualSettings;
    switch (presetName) {
      case 'full_wide':
        nextSettings = {
          ...DEFAULT_VISUAL_SETTINGS,
          cardMaxWidth: 920,
          cardWidthMode: 'full',
          buttonWidthMode: 'full',
          textWrapMode: 'nowrap',
          buttonTranslateX: 0,
          buttonMarginLeft: 0,
          buttonMarginRight: 0,
        };
        break;
      case 'compact':
        nextSettings = {
          ...DEFAULT_VISUAL_SETTINGS,
          cardMaxWidth: 560,
          cardWidthMode: 'compact',
          buttonWidthMode: 'auto',
          buttonPaddingY: 12,
          buttonPaddingX: 18,
          buttonFontSize: 14,
          buttonMarginTop: 16,
          textWrapMode: 'normal',
        };
        break;
      case 'comfortable':
        nextSettings = {
          ...DEFAULT_VISUAL_SETTINGS,
          cardMaxWidth: 740,
          cardWidthMode: 'standard',
          buttonWidthMode: 'full',
          buttonPaddingY: 18,
          buttonPaddingX: 28,
          buttonMarginTop: 28,
          textWrapMode: 'nowrap',
        };
        break;
      case 'custom_offset':
        nextSettings = {
          ...settings,
          buttonTranslateX: 24,
          buttonMarginLeft: 20,
          buttonAlignment: 'right',
        };
        break;
    }
    setSettings(nextSettings);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
        setHasStoredSettings(true);
        setLastSavedAt(Date.now());
      }
    } catch (e) {
      console.warn('[VisualCustomizer] Error saving preset to LocalStorage:', e);
    }
  };

  const exportSettingsToJson = (customFileName?: string): void => {
    try {
      const fileName = customFileName || 'merchant-radar-styles.json';
      const payload = {
        schemaVersion: '1.0.0',
        app: 'RADAR EGYPT (رادار التاجر)',
        fileName,
        description: 'إعدادات تنسيق وأبعاد وهوامش وحواف وألوان رادار التاجر ومنصة بياع',
        exportedAt: new Date().toISOString(),
        
        // 1. الأبعاد (Dimensions)
        dimensions: {
          cardMaxWidth: `${settings.cardMaxWidth}px`,
          cardWidthMode: settings.cardWidthMode,
          buttonWidthMode: settings.buttonWidthMode,
          buttonCustomWidth: `${settings.buttonCustomWidth}px`,
          titleFontSize: `${settings.titleFontSize}px`,
          bodyFontSize: `${settings.bodyFontSize}px`,
          buttonFontSize: `${settings.buttonFontSize}px`,
        },

        // 2. الهوامش والفراغات (Margins & Spacings)
        marginsAndSpacings: {
          cardPadding: `${settings.cardPadding}px`,
          buttonPaddingY: `${settings.buttonPaddingY}px`,
          buttonPaddingX: `${settings.buttonPaddingX}px`,
          buttonMarginTop: `${settings.buttonMarginTop}px`,
          buttonMarginRight: `${settings.buttonMarginRight}px`,
          buttonMarginLeft: `${settings.buttonMarginLeft}px`,
          buttonTranslateX: `${settings.buttonTranslateX}px`,
          buttonAlignment: settings.buttonAlignment,
        },

        // 3. الحواف والانحناءات (Borders & Radius)
        borders: {
          cardBorderRadius: `${settings.cardBorderRadius}px`,
          cardBorderWidth: `${settings.cardBorderWidth}px`,
          buttonBorderRadius: `${settings.buttonBorderRadius}px`,
        },

        // 4. الألوان والمظهر (Colors)
        colors: {
          buttonGradientStart: settings.buttonColorStart,
          buttonGradientEnd: settings.buttonColorEnd,
          buttonTextColor: settings.buttonTextColor,
          cardBackgroundColor: settings.cardBackgroundColor,
          cardBorderColor: settings.cardBorderColor,
          textColorPrimary: settings.textColorPrimary,
          accentColor: settings.accentColor,
        },

        // إعدادات كاملة لإعادة الاستيراد المباشر
        rawSettings: settings,
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
      const candidate = parsed?.settings || parsed;
      const sanitized = sanitizeLoadedSettings(candidate);
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
