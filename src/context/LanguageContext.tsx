import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  appTitle: { ar: 'رادار التاجر الذكي', en: 'Smart Merchant Radar' },
  subtitle: { ar: 'Amazon.eg · Noon · Jumia — منصة تتبع الأسعار والعمليات', en: 'Amazon.eg · Noon · Jumia — Pricing & Operations Platform' },
  login: { ar: 'تسجيل الدخول', en: 'Sign In' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  radar: { ar: 'الرادار والأسعار', en: 'Radar & Pricing' },
  aiStudio: { ar: 'أستوديو المنتجات الذكي', en: 'AI Product Studio' },
  help: { ar: 'دليل الربط والدعم', en: 'Help & Guides' },
  installApp: { ar: 'تثبيت التطبيق', en: 'Install App' },
  themeToggle: { ar: 'الوضع الليلي', en: 'Dark Mode' },
  langToggle: { ar: 'English', en: 'العربية' },
  scanProduct: { ar: 'مسح منتج جديد', en: 'Scan New Product' },
  pullOrders: { ar: 'سحب الطلبات', en: 'Pull Orders' },
  merchantsHub: { ar: 'دليل التجار', en: 'Merchants Hub' },
  focusMode: { ar: 'وضع التركيز', en: 'Focus Mode' },
  signOut: { ar: 'تسجيل الخروج', en: 'Sign Out' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('radar_app_lang') as Language) || 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('radar_app_lang', language);
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    } catch {}
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].ar || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
