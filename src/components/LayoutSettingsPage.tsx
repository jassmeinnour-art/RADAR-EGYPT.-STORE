import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Palette, 
  Layout, 
  Type, 
  Maximize2, 
  Layers,
  Sparkles,
  MousePointer,
  Square,
  Contrast,
  Moon,
  Sun
} from 'lucide-react';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutSettingsPageProps {
  onShowToast?: (msg: string) => void;
}

export const LayoutSettingsPage: React.FC<LayoutSettingsPageProps> = ({ onShowToast }) => {
  const { settings, updateSettings, saveSettingsToStorage, resetDefaults } = useVisualCustomizer();
  const { isHighContrast, setHighContrast, resolvedColorMode, toggleColorMode, darkPalette, setDarkPalette } = useTheme();
  const [localToast, setLocalToast] = useState<string | null>(null);

  useEffect(() => {
    if (!localToast) return;
    const timer = window.setTimeout(() => setLocalToast(null), 5500);
    return () => window.clearTimeout(timer);
  }, [localToast]);

  const notifyToast = (msg: string) => {
    if (onShowToast) {
      onShowToast(msg);
    } else {
      setLocalToast(msg);
    }
  };

  const handleSave = async () => {
    await saveSettingsToStorage();
    notifyToast('✅ تم حفظ كافة إعدادات التنسيق والمقاسات بنجاح!');
  };

  const handleReset = () => {
    resetDefaults();
    notifyToast('🔄 تم استعادة كافة التنسيقات والمقاسات الافتراضية');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-['Cairo']" dir="rtl">
      {/* Header Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>التحكم الشامل في شكل ومقاسات التطبيق</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Preview
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              تعديل أبعاد القائمة الجانبية، خطوط التطبيق، مساحات الأزرار والكروت مع معاينة فورية بدون إعادة تحميل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>حفظ التنسيق</span>
          </button>
        </div>
      </div>

      {/* Accessibility & High Contrast Section (Separate from Normal Dark Mode) */}
      <div
        aria-label="إعدادات التباين العالي لتحسين القراءة"
        className="p-6 rounded-3xl border shadow-xl space-y-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Contrast className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-[var(--text-primary)]">
                  وضع التباين العالي (High Contrast)
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  منفصل عن الوضع الليلي
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                يعزز تباين النصوص والحدود وحقول الإدخال لتحسين وضوح القراءة في الوضعين الفاتح والليلي بشكل مستقل عن الوضع الليلي العادي.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(isHighContrast)}
            data-testid="layout-high-contrast-switch"
            onClick={() => {
              const nextVal = !isHighContrast;
              setHighContrast?.(nextVal);
              notifyToast(
                nextVal
                  ? '✅ تم تفعيل وضع التباين العالي (High Contrast) — تم تعزيز تباين النصوص والحدود وحقول الإدخال لزيادة وضوح القراءة.'
                  : 'تم تعطيل وضع التباين العالي — تمت استعادة مستويات التباين القياسية للواجهة.'
              );
            }}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors ${
              isHighContrast
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
                : 'bg-[var(--surface-subtle)] hover:bg-[var(--card-bg-hover)] text-[var(--text-primary)] border-[var(--card-border)]'
            }`}
          >
            <span>{isHighContrast ? 'التباين العالي: مفعل' : 'تفعيل التباين العالي'}</span>
            <span
              className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${
                isHighContrast ? 'bg-emerald-300 justify-start' : 'bg-slate-600 justify-end'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white block shadow" />
            </span>
          </button>
        </div>

        <div className="pt-3 border-t border-[var(--divider-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {resolvedColorMode === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span>
              الوضع الليلي العادي:{' '}
              <strong className="text-[var(--text-primary)]">
                {resolvedColorMode === 'dark' ? 'داكن (Dark Mode)' : 'فاتح (Light Mode)'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={resolvedColorMode === 'dark'}
            data-testid="layout-dark-mode-switch"
            onClick={() => {
              const nextDark = resolvedColorMode !== 'dark';
              toggleColorMode?.();
              notifyToast(
                nextDark ? 'تم تفعيل الوضع الليلي العادي' : 'تم تفعيل الوضع النهاري الفاتح'
              );
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 transition-colors ${
              resolvedColorMode === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
                : 'bg-[var(--surface-subtle)] hover:bg-[var(--card-bg-hover)] text-[var(--text-primary)] border-[var(--card-border)]'
            }`}
          >
            {resolvedColorMode === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{resolvedColorMode === 'dark' ? 'الوضع الليلي: مفعل' : 'تبديل للوضع الليلي'}</span>
          </button>
        </div>
      </div>

      {/* Custom Dark Mode Palette Selection Card */}
      <div
        aria-label="تخصيص ألوان الوضع الليلي"
        className="p-6 rounded-3xl border shadow-xl space-y-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--card-text)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[var(--text-primary)]">
              ألوان الوضع الليلي المخصصة (Custom Dark Mode Themes)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              اختر درجة اللون المفضلة للوضع الليلي بدلاً من الوضع الافتراضي لراحة عينيك أثناء العمل التجاري.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'default', label: 'أسود أوبسيديان (افتراضي)', desc: 'الوضع الداكن القياسي العالي التباين', color: '#020617', border: '#475569' },
            { id: 'deep-blue', label: 'أزرق داكن (Deep Blue)', desc: 'خلفية كحلي ودرجات أزرق هادئة', color: '#0b1329', border: '#314875' },
            { id: 'charcoal', label: 'أسود فحم (Charcoal Black)', desc: 'أسود فاحم مريح للعين OLED', color: '#121212', border: '#3f3f46' },
            { id: 'dark-gray', label: 'رمادي داكن (Dark Gray)', desc: 'رمادي احترافي ناعم وهادئ', color: '#111827', border: '#4b5563' },
          ].map((palette) => {
            const isSelected = (darkPalette || 'default') === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => {
                  setDarkPalette(palette.id as any);
                  notifyToast(`🌙 تم تطبيق الثيم الليلي: ${palette.label}`);
                }}
                className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-[var(--surface-subtle)] hover:bg-[var(--card-bg-hover)] border-[var(--card-border)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border shadow-xs inline-block shrink-0"
                      style={{ backgroundColor: palette.color, borderColor: palette.border }}
                    />
                    <strong className="text-xs font-bold text-[var(--text-primary)]">{palette.label}</strong>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-normal">{palette.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Sidebar & Header Dimensions */}
        <div 
          className="p-6 rounded-3xl border shadow-xl space-y-5"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Layout className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">أبعاد القائمة الجانبية والهيدر</h3>
          </div>

          {/* Sidebar Width Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">عرض القائمة الجانبية (Sidebar Width)</span>
              <span className="text-amber-400 font-mono font-black">{settings.sidebarWidth || 280}px</span>
            </div>
            <input
              type="range"
              min="200"
              max="340"
              step="4"
              value={settings.sidebarWidth || 280}
              onChange={(e) => updateSettings({ sidebarWidth: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>200px (ضيقة)</span>
              <span>280px (افتراضي)</span>
              <span>340px (عريضة)</span>
            </div>
          </div>

          {/* Collapsed Sidebar Width Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">عرض القائمة المصغرة (Collapsed Width)</span>
              <span className="text-amber-400 font-mono font-black">{settings.sidebarCollapsedWidth || 70}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="2"
              value={settings.sidebarCollapsedWidth || 70}
              onChange={(e) => updateSettings({ sidebarCollapsedWidth: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50px</span>
              <span>70px (افتراضي)</span>
              <span>90px</span>
            </div>
          </div>

          {/* Sidebar Logo Size Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">حجم لوجو القائمة الجانبية (Logo Size)</span>
              <span className="text-amber-400 font-mono font-black">{settings.sidebarLogoSize || 36}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="60"
              step="2"
              value={settings.sidebarLogoSize || 36}
              onChange={(e) => updateSettings({ sidebarLogoSize: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>24px</span>
              <span>36px (افتراضي)</span>
              <span>60px</span>
            </div>
          </div>

          {/* Header Height Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">ارتفاع الهيدر العلوي (Header Height)</span>
              <span className="text-amber-400 font-mono font-black">{settings.headerHeight || 64}px</span>
            </div>
            <input
              type="range"
              min="48"
              max="80"
              step="2"
              value={settings.headerHeight || 64}
              onChange={(e) => updateSettings({ headerHeight: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>48px</span>
              <span>64px (افتراضي)</span>
              <span>80px</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fonts, Gap, Radius & Buttons */}
        <div 
          className="p-6 rounded-3xl border shadow-xl space-y-5"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Type className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-black text-white">الخطوط، الأزرار وحواف الكروت</h3>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">حجم الخط العام (Base Font Size)</span>
              <span className="text-sky-400 font-mono font-black">{settings.fontSizeBase || 14}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="20"
              step="1"
              value={settings.fontSizeBase || 14}
              onChange={(e) => updateSettings({ fontSizeBase: Number(e.target.value) })}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12px (صغير)</span>
              <span>14px (افتراضي)</span>
              <span>20px (كبير جداً)</span>
            </div>
          </div>

          {/* Button Size Selection */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-300 block">حجم الأزرار والتفاعل (Button Size)</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'صغير (32px)' },
                { id: 'medium', label: 'متوسط (40px)' },
                { id: 'large', label: 'كبير (48px)' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => updateSettings({ buttonSize: btn.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                    settings.buttonSize === btn.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Element Gap Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">المسافة بين العناصر والكروت (Gap Spacing)</span>
              <span className="text-emerald-400 font-mono font-black">{settings.appGap || settings.gapBetweenCards || 16}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={settings.appGap || settings.gapBetweenCards || 16}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateSettings({ appGap: val, gapBetweenCards: val });
              }}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4px (مدمج)</span>
              <span>16px (افتراضي)</span>
              <span>24px (واسع)</span>
            </div>
          </div>

          {/* Card Radius Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">حواف الكروت والبطاقات (Border Radius)</span>
              <span className="text-amber-400 font-mono font-black">{settings.borderRadius || 12}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="2"
              value={settings.borderRadius || 12}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateSettings({ borderRadius: val, cardBorderRadius: val });
              }}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0px (حادة)</span>
              <span>12px (انحناء متوسط)</span>
              <span>24px (دائرية)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Colors Picker & Theme Palettes */}
        <div 
          className="p-6 rounded-3xl border shadow-xl space-y-5 lg:col-span-2"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Palette className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-black text-white">تخصيص ألوان الخلفيات والأزرار (Color Pickers)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Color 1: Background Color */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300 block">لون خلفية التطبيق العامة</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.colorBackground || '#0a0f1f'}
                  onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={settings.colorBackground || '#0a0f1f'}
                  onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white uppercase text-center"
                />
              </div>
            </div>

            {/* Color 2: Card Color */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300 block">لون بطاقات الكروت (Cards)</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.colorCard || '#1a2332'}
                  onChange={(e) => updateSettings({ colorCard: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={settings.colorCard || '#1a2332'}
                  onChange={(e) => updateSettings({ colorCard: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white uppercase text-center"
                />
              </div>
            </div>

            {/* Color 3: Button Color */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300 block">لون الأزرار الأساسية (Accent)</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.buttonPrimaryColor || '#FF8C00'}
                  onChange={(e) => updateSettings({ buttonPrimaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={settings.buttonPrimaryColor || '#FF8C00'}
                  onChange={(e) => updateSettings({ buttonPrimaryColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white uppercase text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {localToast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="layout-settings-toast"
          className="fixed bottom-20 lg:bottom-5 left-5 z-[200] max-w-md bg-slate-900 text-white border border-sky-500/70 shadow-2xl rounded-2xl px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-xs sm:text-sm font-bold leading-relaxed flex-1">
            {localToast}
          </span>
          <button
            type="button"
            onClick={() => setLocalToast(null)}
            aria-label="إغلاق الإشعار"
            className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default LayoutSettingsPage;
