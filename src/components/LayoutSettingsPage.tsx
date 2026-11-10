import React from 'react';
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
  Square
} from 'lucide-react';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';

interface LayoutSettingsPageProps {
  onShowToast?: (msg: string) => void;
}

export const LayoutSettingsPage: React.FC<LayoutSettingsPageProps> = ({ onShowToast }) => {
  const { settings, updateSettings, saveSettingsToStorage, resetDefaults } = useVisualCustomizer();

  const handleSave = async () => {
    await saveSettingsToStorage();
    if (onShowToast) {
      onShowToast('✅ تم حفظ كافة إعدادات التنسيق والمقاسات بنجاح!');
    }
  };

  const handleReset = () => {
    resetDefaults();
    if (onShowToast) {
      onShowToast('🔄 تم استعادة كافة التنسيقات والمقاسات الافتراضية');
    }
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
    </div>
  );
};
