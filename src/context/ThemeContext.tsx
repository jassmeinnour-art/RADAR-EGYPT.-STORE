import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
    description: 'النسق الرسمي عالي الوضوح لضعاف البصر وراحة العين: خلفية أوف-وايت هادئة خالية من التوهج (#F8FAFC)، ونصوص سوداء صريحة (#000000)، وإطارات أزرار صلبة بلون الشعار الداكن (#000000).',
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
    category: 'minimal'
  },
  {
    id: 'slate',
    name: 'الأبيض الهادئ القياسي (Standard Soft Off-White)',
    nameEn: 'Standard Soft Off-White',
    description: 'نسق أوف-وايت مريح للعين (#F8FAFC) مع خط أسود واضح (#000000) وحدود أزرار بلون الشعار الداكن (#000000).',
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
    category: 'minimal'
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
    category: 'classic'
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
    category: 'classic'
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
    category: 'modern'
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
    category: 'modern'
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
    category: 'vibrant'
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
    category: 'modern'
  },
];

const LOCAL_STORAGE_THEME_KEY = 'radar_global_primary_theme_v7_offwhite_black';
const LOCAL_STORAGE_COLOR_MODE_KEY = 'radar_global_color_mode_v7_offwhite_black';
const THEME_CACHE_PURGE_KEY = 'radar_soft_offwhite_black_cache_purged_v7';

export type ColorModePreference = 'system' | 'light' | 'dark' | 'scheduled';
export type ResolvedColorMode = 'light' | 'dark';

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
  systemColorScheme: ResolvedColorMode;
  setColorMode: (mode: ColorModePreference) => void;
  toggleColorMode: () => void;
  cycleColorMode: () => ColorModePreference;
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
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'sky');
        localStorage.setItem(LOCAL_STORAGE_COLOR_MODE_KEY, 'light');
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key).catch(() => {}));
          }).catch(() => {});
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
        if (saved && THEME_PRESETS.some(t => t.id === saved)) {
          return saved as PrimaryThemeId;
        }
      } catch {
        // safe fallback
      }
    }
    return 'sky';
  });

  // Color mode preference state with localStorage persistence
  const [colorMode, setColorModeState] = useState<ColorModePreference>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_COLOR_MODE_KEY);
        if (saved === 'dark' || saved === 'light' || saved === 'system' || saved === 'scheduled') {
          return saved as ColorModePreference;
        }
      } catch {}
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
    return (hour >= THEME_SCHEDULE.lightStart && hour < THEME_SCHEDULE.darkStart) ? 'light' : 'dark';
  };

  const [scheduledColorScheme, setScheduledColorScheme] = useState<ResolvedColorMode>(getScheduledMode());

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Listen to OS system color scheme changes
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

  // Timer for scheduled mode
  useEffect(() => {
    if (colorMode !== 'scheduled') return;
    
    const interval = setInterval(() => {
      const mode = getScheduledMode();
      if (mode !== scheduledColorScheme) {
        setScheduledColorScheme(mode);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [colorMode, scheduledColorScheme]);

  const currentTheme = THEME_PRESETS.find(t => t.id === currentThemeId) || THEME_PRESETS[0];

  const resolvedColorMode: ResolvedColorMode = useMemo(() => {
    if (colorMode === 'system') {
      return systemColorScheme;
    }
    if (colorMode === 'scheduled') {
      return scheduledColorScheme;
    }
    return colorMode;
  }, [colorMode, systemColorScheme, scheduledColorScheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      root.setAttribute('data-color-mode', resolvedColorMode);
      root.setAttribute('data-color-mode-preference', colorMode);
      root.style.colorScheme = resolvedColorMode;

      if (resolvedColorMode === 'dark') {
        root.classList.add('dark', 'theme-dark');
        root.classList.remove('light', 'theme-light');
      } else {
        root.classList.add('light', 'theme-light');
        root.classList.remove('dark', 'theme-dark');
      }

      localStorage.setItem(LOCAL_STORAGE_COLOR_MODE_KEY, colorMode);
    } catch {
      // safe fallback
    }
  }, [colorMode, resolvedColorMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      root.setAttribute('data-primary-theme', currentTheme.id);

      if (resolvedColorMode === 'dark') {
        root.style.setProperty('--primary-color', '#38BDF8');
        root.style.setProperty('--primary-hover', '#0284C7');
        root.style.setProperty('--primary-active', '#0369A1');
        root.style.setProperty('--primary-light', '#0F172A');
        root.style.setProperty('--primary-light-hover', '#1E293B');
        root.style.setProperty('--primary-border', '#38BDF8');
        root.style.setProperty('--primary-text', '#F8FAFC');
        root.style.setProperty('--primary-chart-stroke', '#38BDF8');
        root.style.setProperty('--primary-chart-fill', '#38BDF8');
        root.style.setProperty('--primary-chart-light', '#0F172A');
      } else {
        root.style.setProperty('--primary-color', '#000000');
        root.style.setProperty('--primary-hover', '#1E293B');
        root.style.setProperty('--primary-active', '#0F172A');
        root.style.setProperty('--primary-light', '#F8FAFC');
        root.style.setProperty('--primary-light-hover', '#F1F5F9');
        root.style.setProperty('--primary-border', '#000000');
        root.style.setProperty('--primary-text', '#000000');
        root.style.setProperty('--primary-chart-stroke', '#000000');
        root.style.setProperty('--primary-chart-fill', '#000000');
        root.style.setProperty('--primary-chart-light', '#F8FAFC');
      }

      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme.id);
    } catch {
      // safe fallback
    }
  }, [currentTheme, resolvedColorMode]);

  const setPrimaryTheme = (themeId: PrimaryThemeId) => {
    if (THEME_PRESETS.some(t => t.id === themeId)) {
      setCurrentThemeId(themeId);
    } else {
      setCurrentThemeId('sky');
    }
  };

  const resetToDefaultTheme = () => {
    setCurrentThemeId('sky');
    setColorModeState('light');
  };

  const setColorMode = (mode: ColorModePreference) => {
    setColorModeState(mode);
    if (mode === 'scheduled') {
      setScheduledColorScheme(getScheduledMode());
    }
  };

  const toggleColorMode = () => {
    setColorModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
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
        systemColorScheme,
        setColorMode,
        toggleColorMode,
        cycleColorMode,
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
  systemColorScheme: 'light',
  setColorMode: () => {},
  toggleColorMode: () => {},
  cycleColorMode: () => 'light',
};

export const useTheme = (): ThemeContextType => {
  try {
    const context = useContext(ThemeContext);
    if (!context) {
      return FALLBACK_THEME_CONTEXT;
    }
    return context;
  } catch {
    return FALLBACK_THEME_CONTEXT;
  }
};
