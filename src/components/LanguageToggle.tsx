import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle: React.FC<{ variant?: 'pill' | 'icon' }> = ({ variant = 'pill' }) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 flex items-center justify-center transition cursor-pointer shadow-sm"
        title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      >
        <Globe className="w-4 h-4 text-amber-400" />
        <span className="sr-only">{language === 'ar' ? 'EN' : 'AR'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
      title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
    >
      <Globe className="w-3.5 h-3.5 text-amber-400" />
      <span>{language === 'ar' ? 'English 🌐' : 'عربي 🇪🇬'}</span>
    </button>
  );
};

export default LanguageToggle;
