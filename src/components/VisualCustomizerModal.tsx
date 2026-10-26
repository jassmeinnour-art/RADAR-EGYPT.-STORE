import React, { useState, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Maximize2, 
  Sliders, 
  Type, 
  MoveHorizontal, 
  Sparkles,
  Check,
  Eye,
  Minimize2,
  Save,
  CheckCircle2,
  HardDrive,
  Trash2,
  Download,
  Upload,
  FileCode,
  Palette
} from 'lucide-react';
import { useVisualCustomizer } from '../context/VisualCustomizerContext';

export const VisualCustomizerModal: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetDefaults, 
    applyPreset, 
    isCustomizerOpen, 
    setIsCustomizerOpen,
    saveSettingsToStorage,
    clearStorageAndReset,
    lastSavedAt,
    hasStoredSettings,
    exportSettingsToJson,
    importSettingsFromJson,
  } = useVisualCustomizer();

  const [activeTab, setActiveTab] = useState<'width' | 'spacing' | 'align' | 'typography' | 'colors'>('width');
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

  const handleDownloadRadarStylesJson = () => {
    exportSettingsToJson('merchant-radar-styles.json');
    setJsonFeedback("تم تحميل ملف 'merchant-radar-styles.json' بنجاح إلى جهازك! 📥");
    setTimeout(() => setJsonFeedback(null), 4000);
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
          setJsonFeedback('تم استيراد الإعدادات وتطبيقها وحفظها في المتصفح بنجاح! ✓');
        } else {
          setJsonFeedback('عذراً، تعذر قراءة ملف JSON أو يحتوي على بنية غير صالحة ⚠️');
        }
        setTimeout(() => setJsonFeedback(null), 3500);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  if (!isCustomizerOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      dir="rtl"
    >
      <div 
        className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo',sans-serif] text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#FF6B00] flex items-center justify-center text-slate-950 shadow-md">
              <Sliders className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>لوحة التحكم في التنسيق والأبعاد</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LIVE VISUAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تحكم مباشر وفوري في قياسات وهوامش وبطاقات وأزرار المنصة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="إعادة التعيين للوضع الافتراضي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">افتراضي</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            أنماط جاهزة:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('full_wide')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition shrink-0 cursor-pointer"
          >
            🌟 عريض وممتد (100%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('comfortable')}
            className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold transition shrink-0 cursor-pointer"
          >
            🛋️ مريح ومتناسق
          </button>
          <button
            type="button"
            onClick={() => applyPreset('custom_offset')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold transition shrink-0 cursor-pointer"
          >
            👉 إزاحة الزر لليمين
          </button>
          <button
            type="button"
            onClick={() => applyPreset('compact')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition shrink-0 cursor-pointer"
          >
            📱 متوافق مدمج
          </button>
        </div>

        {/* LocalStorage Persistence Banner & Quick Sync */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>الحفظ في LocalStorage: مفعّل</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (تظل التعديلات محفوظة تلقائياً حتى بعد تحديث الصفحة F5)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* JSON Export Button for merchant-radar-styles.json */}
            <button
              type="button"
              onClick={handleDownloadRadarStylesJson}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
              title="تحميل إعدادات التنسيق الحالية (الحواف، الهوامش، الألوان، الأبعاد) في ملف merchant-radar-styles.json"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>تحميل merchant-radar-styles.json</span>
            </button>

            {/* JSON Import Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
              title="استيراد وتطبيق إعدادات من ملف JSON سابق"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>استيراد JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />

            {/* Quick Manual Save Button */}
            <button
              type="button"
              onClick={handleManualSave}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                showSavedFeedback 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-105' 
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title="تثبيت الإعدادات يدوياً في ذاكرة المتصفح المحلية"
            >
              {showSavedFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>تم التثبيت ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>تثبيت في المتصفح</span>
                </>
              )}
            </button>

            {hasStoredSettings && (
              <button
                type="button"
                onClick={clearStorageAndReset}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="مسح إعدادات LocalStorage والعودة للوضع الافتراضي"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">مسح</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic JSON / Storage Feedback Toast Alert */}
        {jsonFeedback && (
          <div className="px-5 py-2 bg-gradient-to-r from-sky-950 to-indigo-950 border-b border-sky-600/40 text-sky-200 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <span>{jsonFeedback}</span>
            </span>
            <button 
              type="button" 
              onClick={() => setJsonFeedback(null)} 
              className="text-sky-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900/90 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('width')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'width' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>الأبعاد (Width)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spacing')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'spacing' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>الهوامش (Spacing)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('align')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'align' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoveHorizontal className="w-4 h-4" />
            <span>المحاذاة والإزاحة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'typography' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>الخطوط والنصوص</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'colors' 
                ? 'border-amber-400 text-amber-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>الحواف والألوان (Borders & Colors)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* TAB 1: Width & Max-Width */}
          {activeTab === 'width' && (
            <div className="space-y-4">
              {/* Card Width Mode */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-between">
                  <span>عرض بطاقة الإعلان والمنصة:</span>
                  <span className="font-mono text-xs text-slate-400">{settings.cardMaxWidth}px</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'standard', label: 'قياسي (720px)', val: 720 },
                    { id: 'full', label: 'عريض (920px)', val: 920 },
                    { id: 'compact', label: 'مضغوط (560px)', val: 560 },
                    { id: 'custom', label: 'كامل العرض (100%)', val: 1100 },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateSettings({ cardMaxWidth: mode.val, cardWidthMode: mode.id as any })}
                      className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        settings.cardMaxWidth === mode.val
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <div>
                  <input
                    type="range"
                    min="480"
                    max="1100"
                    step="20"
                    value={settings.cardMaxWidth}
                    onChange={(e) => updateSettings({ cardMaxWidth: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>480px (ضيق)</span>
                    <span>1100px (عريض جداً)</span>
                  </div>
                </div>
              </div>

              {/* Button Width Mode */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-between">
                  <span>عرض الأزرار الرئيسية (زر اشترك الآن):</span>
                  <span className="font-mono text-xs text-slate-400">
                    {settings.buttonWidthMode === 'full' ? '100% كامل العرض' : `${settings.buttonCustomWidth}px`}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ buttonWidthMode: 'full' })}
                    className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      settings.buttonWidthMode === 'full'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    عرض كامل 100% (موصى به)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ buttonWidthMode: 'auto' })}
                    className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      settings.buttonWidthMode === 'auto'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    تلقائي حسب المحتوى (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ buttonWidthMode: 'custom' })}
                    className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      settings.buttonWidthMode === 'custom'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    عرض محدد (Custom)
                  </button>
                </div>

                {settings.buttonWidthMode === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="range"
                      min="220"
                      max="640"
                      step="10"
                      value={settings.buttonCustomWidth}
                      onChange={(e) => updateSettings({ buttonCustomWidth: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>220px</span>
                      <span>{settings.buttonCustomWidth}px</span>
                      <span>640px</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Spacing & Margins */}
          {activeTab === 'spacing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                {/* Button Vertical Padding */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>الارتفاع والفراغ الداخلي للزر (Padding Y):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonPaddingY}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="28"
                    step="1"
                    value={settings.buttonPaddingY}
                    onChange={(e) => updateSettings({ buttonPaddingY: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Button Horizontal Padding */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>الفراغ الأفقي للزر (Padding X):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonPaddingX}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="48"
                    step="2"
                    value={settings.buttonPaddingX}
                    onChange={(e) => updateSettings({ buttonPaddingX: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Button Top Margin */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>المسافة الفاصلة أعلى الزر (Margin Top):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonMarginTop}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    step="2"
                    value={settings.buttonMarginTop}
                    onChange={(e) => updateSettings({ buttonMarginTop: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Button Radius */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>انحناء حواف الزر (Border Radius):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonBorderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="32"
                    step="2"
                    value={settings.buttonBorderRadius}
                    onChange={(e) => updateSettings({ buttonBorderRadius: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Offsets & Alignment */}
          {activeTab === 'align' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                {/* Horizontal Shift / Translate X */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>إزاحة الزر أفقياً (Translate X):</span>
                    <span className="font-mono text-xs text-slate-200">
                      {settings.buttonTranslateX > 0 
                        ? `يمين +${settings.buttonTranslateX}px` 
                        : settings.buttonTranslateX < 0 
                        ? `يسار ${settings.buttonTranslateX}px` 
                        : '0px (وسط)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    step="2"
                    value={settings.buttonTranslateX}
                    onChange={(e) => updateSettings({ buttonTranslateX: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>-30px (يسار)</span>
                    <button 
                      type="button" 
                      onClick={() => updateSettings({ buttonTranslateX: 0 })}
                      className="text-amber-400 hover:underline"
                    >
                      تصفير (0px)
                    </button>
                    <span>+50px (يمين)</span>
                  </div>
                </div>

                {/* Margin Left */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>الهامش الأيسر (Margin Left) لسحب الزر يميناً:</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonMarginLeft}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={settings.buttonMarginLeft}
                    onChange={(e) => updateSettings({ buttonMarginLeft: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Alignment Mode */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-amber-300 block mb-2">
                    محاذاة الزر داخل البطاقة:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'center', label: 'في الوسط (Center)' },
                      { id: 'right', label: 'محاذاة اليمين (Right)' },
                      { id: 'left', label: 'محاذاة اليسار (Left)' },
                    ].map((align) => (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => updateSettings({ buttonAlignment: align.id as any })}
                        className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          settings.buttonAlignment === align.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {align.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Typography & Anti-Wrap */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                {/* Text Wrap Control */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-amber-300 block mb-2">
                    حماية النصوص من الالتفاف والكسر (White-Space Wrap Mode):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateSettings({ textWrapMode: 'nowrap' })}
                      className={`p-3 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-2 cursor-pointer ${
                        settings.textWrapMode === 'nowrap'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 font-black shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>سطر واحد متصل (Nowrap) - بدون قطع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ textWrapMode: 'normal' })}
                      className={`p-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        settings.textWrapMode === 'normal'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span>التفاف طبيعي (Normal Wrap)</span>
                    </button>
                  </div>
                </div>

                {/* Button Font Size */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>حجم خط الزر (Button Font Size):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.buttonFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="13"
                    max="22"
                    step="1"
                    value={settings.buttonFontSize}
                    onChange={(e) => updateSettings({ buttonFontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Title Font Size */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>حجم العنوان الرئيسي (Title Font Size):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.titleFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="28"
                    step="1"
                    value={settings.titleFontSize}
                    onChange={(e) => updateSettings({ titleFontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-amber-300 block mb-2">
                    وزن وسمك الخط (Font Weight):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['600', '700', '800', '900'] as const).map((wt) => (
                      <button
                        key={wt}
                        type="button"
                        onClick={() => updateSettings({ buttonFontWeight: wt })}
                        className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          settings.buttonFontWeight === wt
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {wt === '900' ? 'Black (900)' : wt === '800' ? 'ExtraBold (800)' : wt === '700' ? 'Bold (700)' : 'SemiBold (600)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Colors & Borders (الحواف والألوان) */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                {/* Special Download Banner for merchant-radar-styles.json */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 border-2 border-sky-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/40 shadow-inner">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>ملف التنسيقات الشامل:</span>
                        <span className="text-sky-300 font-mono text-xs px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30">
                          merchant-radar-styles.json
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        تحميل إعدادات التنسيق الحالية (الحواف، الهوامش، الألوان، الأبعاد) في ملف JSON معتمد
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadRadarStylesJson}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 transition hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل merchant-radar-styles.json</span>
                  </button>
                </div>

                {/* Card Border Radius (الحواف والانحناءات) */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>انحناء حواف بطاقة الإعلان (Card Border Radius):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.cardBorderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="36"
                    step="2"
                    value={settings.cardBorderRadius}
                    onChange={(e) => updateSettings({ cardBorderRadius: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>8px (حاد)</span>
                    <span>20px (قياسي)</span>
                    <span>36px (دائري جداً)</span>
                  </div>
                </div>

                {/* Card Border Width (سُمك الحواف) */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 mb-1.5">
                    <span>سُمك إطار وحواف البطاقة (Border Width):</span>
                    <span className="font-mono text-xs text-slate-300">{settings.cardBorderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={settings.cardBorderWidth}
                    onChange={(e) => updateSettings({ cardBorderWidth: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>1px (ناعم)</span>
                    <span>2px (افتراضي)</span>
                    <span>6px (عريض)</span>
                  </div>
                </div>

                {/* Button Color Gradients (ألوان الأزرار) */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-amber-300 block mb-2">
                    تدرج لون زر الإجراء (Button Gradient Color):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'orange', label: 'برتقالي بياع', start: '#ff6b00', end: '#e65c00' },
                      { id: 'sky', label: 'أزرق رادار', start: '#0284c7', end: '#0369a1' },
                      { id: 'emerald', label: 'أخضر أرباح', start: '#059669', end: '#047857' },
                      { id: 'purple', label: 'بنفسجي متقدم', start: '#7c3aed', end: '#6d28d9' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => updateSettings({ buttonColorStart: theme.start, buttonColorEnd: theme.end })}
                        className={`p-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 cursor-pointer ${
                          settings.buttonColorStart === theme.start
                            ? 'border-white text-white shadow-lg ring-2 ring-white/40 font-black scale-102'
                            : 'border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                        style={{ background: `linear-gradient(135deg, ${theme.start} 0%, ${theme.end} 100%)` }}
                      >
                        <span>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Pickers (ألوان مخصصة) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-bold">لون إطار البطاقة:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{settings.cardBorderColor}</span>
                      <input
                        type="color"
                        value={settings.cardBorderColor}
                        onChange={(e) => updateSettings({ cardBorderColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-bold">لون خلفية البطاقة:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{settings.cardBackgroundColor}</span>
                      <input
                        type="color"
                        value={settings.cardBackgroundColor}
                        onChange={(e) => updateSettings({ cardBackgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Box with Dynamic Colors and Borders */}
          <div 
            className="p-5 shadow-inner transition-all duration-300"
            style={{
              backgroundColor: settings.cardBackgroundColor,
              border: `${settings.cardBorderWidth}px solid ${settings.cardBorderColor}`,
              borderRadius: `${settings.cardBorderRadius}px`,
              color: settings.textColorPrimary
            }}
          >
            <div className="text-[11px] font-black uppercase tracking-wider mb-3 flex items-center justify-between opacity-75">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>معاينة حية للبطاقة والزر (حواف، هوامش، ألوان، أبعاد):</span>
              </span>
              <span className="font-mono text-emerald-600 font-bold">مباشر ⚡</span>
            </div>
            
            <div 
              className="w-full flex"
              style={{
                justifyContent: settings.buttonAlignment === 'right' 
                  ? 'flex-start' 
                  : settings.buttonAlignment === 'left' 
                  ? 'flex-end' 
                  : 'center'
              }}
            >
              <button
                type="button"
                style={{
                  width: settings.buttonWidthMode === 'full' ? '100%' : settings.buttonWidthMode === 'custom' ? `${settings.buttonCustomWidth}px` : 'auto',
                  padding: `${settings.buttonPaddingY}px ${settings.buttonPaddingX}px`,
                  marginTop: `${settings.buttonMarginTop}px`,
                  marginLeft: `${settings.buttonMarginLeft}px`,
                  marginRight: `${settings.buttonMarginRight}px`,
                  transform: `translateX(${settings.buttonTranslateX}px)`,
                  borderRadius: `${settings.buttonBorderRadius}px`,
                  fontSize: `${settings.buttonFontSize}px`,
                  fontWeight: settings.buttonFontWeight,
                  whiteSpace: settings.textWrapMode,
                  background: `linear-gradient(135deg, ${settings.buttonColorStart} 0%, ${settings.buttonColorEnd} 100%)`,
                  color: settings.buttonTextColor,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.4)',
                  cursor: 'default'
                }}
              >
                <span>🛍️</span>
                <span>اشترك الآن وأضف منتجاتك في منصة بياع</span>
                <span>👈</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-center sm:text-right">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              يتم حفظ التنسيقات تلقائياً في ذاكرة المتصفح (LocalStorage) وتظل سارية بعد تحديث الصفحة
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleDownloadRadarStylesJson}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40 shadow-sm"
              title="تحميل إعدادات التنسيق الحالية في ملف merchant-radar-styles.json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل merchant-radar-styles.json</span>
            </button>
            <button
              type="button"
              onClick={handleManualSave}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                showSavedFeedback 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
            >
              {showSavedFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>محفوظ في المتصفح ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>تثبيت في LocalStorage</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                saveSettingsToStorage();
                setIsCustomizerOpen(false);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6B00] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition cursor-pointer shadow-md text-xs flex items-center gap-1"
            >
              <span>تم وتطبيق التنسيق ✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
