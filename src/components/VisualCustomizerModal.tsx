import React, { useState, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Palette, 
  Type, 
  Square, 
  Sparkles,
  Save,
  CheckCircle2,
  HardDrive,
  Trash2,
  Download,
  Upload,
  FileCode,
  Eye,
  Sliders,
  Check,
  Layers,
  Sun,
  Moon,
  AlertCircle
} from 'lucide-react';
import { 
  useVisualCustomizer, 
  THEME_PRESETS, 
  ThemePresetKey,
  SupportedFontFamily,
  SupportedFontWeight,
  SupportedShadow,
  getShadowCssValue
} from '../context/VisualCustomizerContext';

export const VisualCustomizerModal: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetDefaults, 
    applyThemePreset,
    isCustomizerOpen, 
    setIsCustomizerOpen,
    saveSettingsToStorage,
    clearStorageAndReset,
    exportSettingsToJson,
    importSettingsFromJson,
  } = useVisualCustomizer();

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'cards' | 'presets'>('colors');
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [jsonFeedback, setJsonFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSave = () => {
    const success = saveSettingsToStorage();
    if (success) {
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    }
  };

  const handleDownloadThemeJson = () => {
    exportSettingsToJson('radar-visual-theme-pro.json');
    setJsonFeedback("تم تصدير ثيم 'radar-visual-theme-pro.json' بنجاح إلى جهازك! 📥");
    setTimeout(() => setJsonFeedback(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importSettingsFromJson(content);
        if (success) {
          setJsonFeedback('تم استيراد الثيم وتطبيقه وحفظه في المتصفح بنجاح! ✓');
        } else {
          setJsonFeedback('عذراً، تعذر قراءة ملف JSON أو يحتوي على بنية غير صالحة ⚠️');
        }
        setTimeout(() => setJsonFeedback(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isCustomizerOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-end animate-fadeIn"
      dir="rtl"
    >
      {/* Slide-over Drawer / Sidebar Modal */}
      <div 
        className="bg-slate-900 border-r border-amber-500/40 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden font-['Cairo',sans-serif] text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#FF8C00] flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Palette className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Visual Theme Customizer Pro
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LIVE PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                لوحة تحكم كاملة في ألوان، خطوط، بطاقات وظلال التطبيق في الوقت الفعلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetDefaults}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs transition cursor-pointer border border-slate-700"
              title="إعادة التعيين للوضع الافتراضي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
              title="إغلاق اللوحة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-4 pt-3 border-b border-slate-800 bg-slate-950/80 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'colors' 
                ? 'border-amber-400 text-amber-300 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>الألوان الرئيسية (Colors)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'typography' 
                ? 'border-amber-400 text-amber-300 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4 text-sky-400" />
            <span>النصوص والخطوط (Typography)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cards' 
                ? 'border-amber-400 text-amber-300 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-4 h-4 text-emerald-400" />
            <span>الإطارات والبطاقات (Cards)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'presets' 
                ? 'border-amber-400 text-amber-300 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>أنماط جاهزة وتصدير (Presets)</span>
          </button>
        </div>

        {/* Feedback message */}
        {jsonFeedback && (
          <div className="px-4 py-2 bg-gradient-to-r from-sky-950 to-indigo-950 border-b border-sky-600/40 text-sky-200 text-xs font-bold flex items-center justify-between animate-fadeIn shrink-0">
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>{jsonFeedback}</span>
            </span>
            <button type="button" onClick={() => setJsonFeedback(null)} className="text-sky-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">

          {/* ========================================================
              SECTION 1: الألوان الرئيسية (مع Color Picker)
             ======================================================== */}
          {activeTab === 'colors' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">
                  انقر على مربع اللون أو عدل الكود السداسي (Hex) لتغيير الواجهة فوراً:
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  تحديث حي ⚡
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Primary */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون أساسي (Primary)</span>
                    <span className="text-[11px] text-slate-400">برتقالي رادار والأزرار الرئيسية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-300 uppercase">{settings.colorPrimary}</span>
                    <input
                      type="color"
                      value={settings.colorPrimary}
                      onChange={(e) => updateSettings({ colorPrimary: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 2. Secondary */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون ثانوي (Secondary)</span>
                    <span className="text-[11px] text-slate-400">كحلي غامق للشريط والقوائم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 uppercase">{settings.colorSecondary}</span>
                    <input
                      type="color"
                      value={settings.colorSecondary}
                      onChange={(e) => updateSettings({ colorSecondary: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 3. Background */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون الخلفية (Background)</span>
                    <span className="text-[11px] text-slate-400">خلفية الشاشة العامة (#0a0f1f)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 uppercase">{settings.colorBackground}</span>
                    <input
                      type="color"
                      value={settings.colorBackground}
                      onChange={(e) => updateSettings({ colorBackground: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 4. Text */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون النص (Text)</span>
                    <span className="text-[11px] text-slate-400">النصوص والفقرات العامة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 uppercase">{settings.colorText}</span>
                    <input
                      type="color"
                      value={settings.colorText}
                      onChange={(e) => updateSettings({ colorText: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 5. Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون البطاقات (Card)</span>
                    <span className="text-[11px] text-slate-400">خلفية كروت المنتجات والقوائم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 uppercase">{settings.colorCard}</span>
                    <input
                      type="color"
                      value={settings.colorCard}
                      onChange={(e) => updateSettings({ colorCard: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 6. Border */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-white block">لون الحدود (Border)</span>
                    <span className="text-[11px] text-slate-400">الفواصل وإطارات البطاقات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300 uppercase">{settings.colorBorder}</span>
                    <input
                      type="color"
                      value={settings.colorBorder}
                      onChange={(e) => updateSettings({ colorBorder: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 7. Success */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-emerald-400 block">لون النجاح (Success)</span>
                    <span className="text-[11px] text-slate-400">شارات الفوز بالباي بوكس والأرباح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 uppercase">{settings.colorSuccess}</span>
                    <input
                      type="color"
                      value={settings.colorSuccess}
                      onChange={(e) => updateSettings({ colorSuccess: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>

                {/* 8. Error */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-rose-400 block">لون الخطأ (Error)</span>
                    <span className="text-[11px] text-slate-400">تنبيهات انخفاض السعر والمخزون</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-rose-400 uppercase">{settings.colorError}</span>
                    <input
                      type="color"
                      value={settings.colorError}
                      onChange={(e) => updateSettings({ colorError: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 2: النصوص والخطوط (Typography)
             ======================================================== */}
          {activeTab === 'typography' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Font Family Selection */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="text-xs font-black text-amber-300 block">
                  نوع الخط العربي والإنجليزي (Font Family):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Cairo', name: 'Cairo (افتراضي)', sample: 'رادار التاجر الذكي' },
                    { id: 'Tajawal', name: 'Tajawal (تجوال)', sample: 'رادار التاجر الذكي' },
                    { id: 'Inter', name: 'Inter (عصري)', sample: 'Radar Merchant' },
                    { id: 'Amiri', name: 'Amiri (أصيل)', sample: 'رادار التاجر الذكي' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateSettings({ fontFamily: f.id as SupportedFontFamily })}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        settings.fontFamily === f.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ fontFamily: `'${f.id}', sans-serif` }}
                    >
                      <span className="text-xs block font-bold">{f.name}</span>
                      <span className="text-[11px] opacity-80 mt-1 block truncate">{f.sample}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Sliders */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                {/* 1. Base Font Size (12px to 20px) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">حجم الخط العام (Base Font Size):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.fontSizeBase}px (افتراضي 14px)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    step="1"
                    value={settings.fontSizeBase}
                    onChange={(e) => updateSettings({ fontSizeBase: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>12px (صغير)</span>
                    <span>14px (قياسي)</span>
                    <span>20px (كبير)</span>
                  </div>
                </div>

                {/* 2. Heading H1 Size (20px to 40px) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">حجم العناوين الرئيسية (H1 Heading Size):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.fontSizeH1}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="40"
                    step="1"
                    value={settings.fontSizeH1}
                    onChange={(e) => updateSettings({ fontSizeH1: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>20px</span>
                    <span>26px</span>
                    <span>40px</span>
                  </div>
                </div>

                {/* 3. Small Text Size (10px to 16px) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">حجم النصوص الصغيرة والشارات (Small Text):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.fontSizeSmall}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="16"
                    step="1"
                    value={settings.fontSizeSmall}
                    onChange={(e) => updateSettings({ fontSizeSmall: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>10px</span>
                    <span>12px</span>
                    <span>16px</span>
                  </div>
                </div>

                {/* 4. Line Height Slider (1.2 to 2.0) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">تباعد الأسطر (Line Height):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.lineHeight}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.05"
                    value={settings.lineHeight}
                    onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>1.2 (مدمج)</span>
                    <span>1.6 (مريح)</span>
                    <span>2.0 (واسع)</span>
                  </div>
                </div>
              </div>

              {/* Heading Color & Font Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-300 block">وزن الخط (Font Weight):</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: '300', label: 'خفيف (Light)' },
                      { id: '400', label: 'عادي (Regular)' },
                      { id: '700', label: 'عريض (Bold)' },
                      { id: '800', label: 'ثقيل (ExtraBold)' }
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateSettings({ fontWeight: w.id as SupportedFontWeight })}
                        className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          settings.fontWeight === w.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-amber-300 block">لون العناوين (Heading Color):</span>
                    <span className="text-[11px] text-slate-400">Color Picker منفصل لعناوين الأقسام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-300 uppercase">{settings.colorHeading}</span>
                    <input
                      type="color"
                      value={settings.colorHeading}
                      onChange={(e) => updateSettings({ colorHeading: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 3: الإطارات والبطاقات (Cards & Borders)
             ======================================================== */}
          {activeTab === 'cards' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                {/* Border Radius Slider (0px to 30px) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">انحناء الزوايا (Border Radius):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.borderRadius}px (افتراضي 12px)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={settings.borderRadius}
                    onChange={(e) => updateSettings({ borderRadius: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>0px (حاد ومربع)</span>
                    <span>12px (قياسي)</span>
                    <span>30px (دائري وناعم)</span>
                  </div>
                </div>

                {/* Border Width Slider (0px to 4px) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-200">سُمك الحدود (Border Width):</span>
                    <span className="font-mono text-amber-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {settings.borderWidth}px (افتراضي 1px)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={settings.borderWidth}
                    onChange={(e) => updateSettings({ borderWidth: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>0px (بدون إطار)</span>
                    <span>1px (ناعم)</span>
                    <span>4px (عريض)</span>
                  </div>
                </div>

                {/* Card Shadow Selection */}
                <div>
                  <label className="text-xs font-black text-amber-300 block mb-2">
                    ظل البطاقات (Card Shadow Effect):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'none', label: 'بدون ظل (None)' },
                      { id: 'small', label: 'خفيف (Small)' },
                      { id: 'medium', label: 'متوسط (Medium)' },
                      { id: 'large', label: 'عميق (Large)' },
                      { id: 'glow', label: 'توهج (Glow)' }
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => updateSettings({ cardShadow: sh.id as SupportedShadow })}
                        className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          settings.cardShadow === sh.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 4: الأنماط السريعة والتصدير (Presets & Storage)
             ======================================================== */}
          {activeTab === 'presets' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Presets Grid */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-amber-300 block">
                  أنماط مظهر جاهزة بنقرة واحدة (One-Click Presets):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(THEME_PRESETS) as ThemePresetKey[]).map((key) => {
                    const preset = THEME_PRESETS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyThemePreset(key)}
                        className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-right transition flex flex-col gap-1 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white group-hover:text-amber-300">
                            {preset.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                            تطبيق
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* JSON Export/Import & Persistence */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-black text-amber-300 block">
                  النسخ الاحتياطي والمزامنة (Backup & Sync):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadThemeJson}
                    className="p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>تصدير ملف الثيم (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>استيراد ثيم من ملف (JSON)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,application/json"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              LIVE PREVIEW BOX (معاينة حية للمظهر الجديد)
             ======================================================== */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <Eye className="w-4 h-4" />
                معاينة حية تفاعلية للبطاقات والنصوص والأزرار:
              </span>
              <span className="font-mono text-emerald-400 font-bold">مباشر ⚡</span>
            </div>

            {/* Dynamic Card Preview */}
            <div 
              className="p-5 transition-all duration-200 space-y-3"
              style={{
                backgroundColor: settings.colorCard,
                borderRadius: `${settings.borderRadius}px`,
                borderWidth: `${settings.borderWidth}px`,
                borderColor: settings.colorBorder,
                borderStyle: settings.borderWidth > 0 ? 'solid' : 'none',
                boxShadow: getShadowCssValue(settings.cardShadow),
                fontFamily: `'${settings.fontFamily}', sans-serif`,
                color: settings.colorText,
                lineHeight: settings.lineHeight
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 
                  style={{ 
                    fontSize: `${settings.fontSizeH1}px`, 
                    color: settings.colorHeading,
                    fontWeight: settings.fontWeight
                  }}
                  className="font-black"
                >
                  لوحة تحكم رادار التاجر الذكي
                </h3>
                <span 
                  className="px-2 py-0.5 rounded-full font-bold"
                  style={{ 
                    backgroundColor: `${settings.colorSuccess}25`, 
                    color: settings.colorSuccess,
                    fontSize: `${settings.fontSizeSmall}px`
                  }}
                >
                  ✓ Buy Box Winner
                </span>
              </div>

              <p 
                style={{ 
                  fontSize: `${settings.fontSizeBase}px`,
                  color: settings.colorText 
                }}
              >
                هذه المعاينة توضح التنسيق المباشر للألوان، وانحناء الحواف ({settings.borderRadius}px)، ونوع الخط ({settings.fontFamily}).
              </p>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  style={{
                    backgroundColor: settings.colorPrimary,
                    color: '#ffffff',
                    borderRadius: `${settings.borderRadius}px`,
                    fontSize: `${settings.fontSizeBase}px`,
                    fontWeight: settings.fontWeight,
                    padding: '8px 16px',
                    border: 'none',
                    cursor: 'default'
                  }}
                  className="font-bold shadow-md flex items-center gap-2"
                >
                  <span>زر الإجراء الرئيسي</span>
                  <span>←</span>
                </button>

                <span 
                  style={{ 
                    color: settings.colorError,
                    fontSize: `${settings.fontSizeSmall}px`
                  }}
                  className="font-bold flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>تنبيه هبوط السعر</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>يتم الحفظ تلقائياً في LocalStorage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                showSavedFeedback
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
            >
              {showSavedFeedback ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>تم التثبيت ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>تثبيت التنسيق</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearStorageAndReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
              title="مسح من الذاكرة والعودة للافتراضي"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCustomizerModal;
