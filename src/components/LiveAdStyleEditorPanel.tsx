import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Move, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Trash2, 
  Sparkles, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Zap,
  Tag,
  ShoppingBag,
  Info
} from 'lucide-react';

export interface AdElementStyleConfig {
  // Title
  titleText: string;
  titleColor: string;
  titleFontSize: number; // in px
  titleX: number; // in px
  titleY: number; // in px

  // Price
  priceText: string;
  priceColor: string;
  priceFontSize: number;
  priceX: number;
  priceY: number;

  // Badge
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  badgeFontSize: number;
  badgeX: number;
  badgeY: number;

  // CTA Button
  ctaText: string;
  ctaBgColor: string;
  ctaTextColor: string;
  ctaFontSize: number;
  ctaX: number;
  ctaY: number;

  // Tagline
  taglineText: string;
  taglineColor: string;
  taglineFontSize: number;
  taglineX: number;
  taglineY: number;
}

export const DEFAULT_AD_STYLE_CONFIG: AdElementStyleConfig = {
  titleText: 'منتج ممتاز عالي الجودة',
  titleColor: '#ffffff',
  titleFontSize: 14,
  titleX: 0,
  titleY: 0,

  priceText: '3,450 ج.م',
  priceColor: '#fbbf24',
  priceFontSize: 16,
  priceX: 0,
  priceY: 0,

  badgeText: '🔥 خصم خاص حصري',
  badgeBgColor: '#f59e0b',
  badgeTextColor: '#020617',
  badgeFontSize: 11,
  badgeX: 0,
  badgeY: 0,

  ctaText: 'اطلب الآن 🛒',
  ctaBgColor: '#4f46e5',
  ctaTextColor: '#ffffff',
  ctaFontSize: 12,
  ctaX: 0,
  ctaY: 0,

  taglineText: 'شحن سريع لجميع المحافظات 📦',
  taglineColor: '#34d399',
  taglineFontSize: 10,
  taglineX: 0,
  taglineY: 0,
};

export interface SavedAdStylePreset {
  id: string;
  name: string;
  config: AdElementStyleConfig;
  createdAt: string;
}

interface LiveAdStyleEditorPanelProps {
  styleConfig: AdElementStyleConfig;
  onChangeConfig: (newConfig: AdElementStyleConfig) => void;
  onResetDefaults?: () => void;
  onShowToast?: (msg: string) => void;
  compact?: boolean;
}

export const LiveAdStyleEditorPanel: React.FC<LiveAdStyleEditorPanelProps> = ({
  styleConfig,
  onChangeConfig,
  onResetDefaults,
  onShowToast,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'title' | 'price' | 'badge' | 'cta' | 'tagline' | 'presets'>('title');
  const [presetNameInput, setPresetNameInput] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedAdStylePreset[]>(() => {
    try {
      const stored = localStorage.getItem('radar_ad_card_style_presets');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read style presets from localStorage', e);
    }
    return [
      {
        id: 'preset_gold_neon',
        name: 'ذهب نيون فاخر (Gold Neon)',
        config: {
          ...DEFAULT_AD_STYLE_CONFIG,
          titleColor: '#ffffff',
          priceColor: '#f59e0b',
          badgeBgColor: '#e11d48',
          badgeTextColor: '#ffffff',
          ctaBgColor: '#0ea5e9',
          ctaTextColor: '#ffffff'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'preset_emerald_fresh',
        name: 'زمردي طازج (Fresh Emerald)',
        config: {
          ...DEFAULT_AD_STYLE_CONFIG,
          titleColor: '#e2e8f0',
          priceColor: '#34d399',
          badgeBgColor: '#10b981',
          badgeTextColor: '#022c22',
          ctaBgColor: '#10b981',
          ctaTextColor: '#ffffff'
        },
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Save presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('radar_ad_card_style_presets', JSON.stringify(savedPresets));
    } catch (e) {
      console.warn('Could not save style presets to localStorage', e);
    }
  }, [savedPresets]);

  const updateField = <K extends keyof AdElementStyleConfig>(key: K, value: AdElementStyleConfig[K]) => {
    onChangeConfig({
      ...styleConfig,
      [key]: value
    });
  };

  const nudgePosition = (target: 'title' | 'price' | 'badge' | 'cta' | 'tagline', deltaX: number, deltaY: number) => {
    const xKey = `${target}X` as keyof AdElementStyleConfig;
    const yKey = `${target}Y` as keyof AdElementStyleConfig;
    const currentX = (styleConfig[xKey] as number) || 0;
    const currentY = (styleConfig[yKey] as number) || 0;

    onChangeConfig({
      ...styleConfig,
      [xKey]: currentX + deltaX,
      [yKey]: currentY + deltaY
    });
  };

  const handleSavePreset = () => {
    const name = presetNameInput.trim() || `نمط مخصص ${savedPresets.length + 1}`;
    const newPreset: SavedAdStylePreset = {
      id: `preset_${Date.now()}`,
      name,
      config: { ...styleConfig },
      createdAt: new Date().toISOString()
    };
    setSavedPresets([newPreset, ...savedPresets]);
    setPresetNameInput('');
    onShowToast?.(`✅ تم حفظ النمط "${name}" بنجاح في ذاكرة المتصفح! 💾`);
  };

  const handleLoadPreset = (preset: SavedAdStylePreset) => {
    onChangeConfig({ ...preset.config });
    onShowToast?.(`🎨 تم تطبيق النمط: "${preset.name}"`);
  };

  const handleDeletePreset = (id: string) => {
    setSavedPresets(savedPresets.filter(p => p.id !== id));
    onShowToast?.('🗑️ تم حذف النمط المحفوظ.');
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChangeConfig({ ...DEFAULT_AD_STYLE_CONFIG });
    }
    onShowToast?.('↺ تم إعادة تعيين كافة الخطوط والألوان والمواضع إلى الوضع الافتراضي.');
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 text-white shadow-2xl flex flex-col gap-3 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-sm">
            🎨
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>لوحة التحكم المباشرة في النصوص والألوان والمواضع</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                Live Style Editor
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">تعديل أحجام الخطوط، الألوان، والمواضع يميناً ويساراً ولأعلى وأسفل مع الحفظ الفوري</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
          title="إعادة التعيين للافتراضي"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>افتراضي</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('title')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'title' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>العنوان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('price')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'price' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>السعر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badge')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'badge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>الشارة (Badge)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cta')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'cta' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>زر الطلب (CTA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tagline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'tagline' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>الشعار السفلية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'presets' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>الحفظ والأنماط</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-3 min-h-[160px]">
        {/* TITLE CONTROL */}
        {activeTab === 'title' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">نص العنوان</label>
              <input
                type="text"
                value={styleConfig.titleText}
                onChange={(e) => updateField('titleText', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">لون النص</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleConfig.titleColor}
                    onChange={(e) => updateField('titleColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={styleConfig.titleColor}
                    onChange={(e) => updateField('titleColor', e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">حجم الخط</label>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{styleConfig.titleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={36}
                  value={styleConfig.titleFontSize}
                  onChange={(e) => updateField('titleFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Directional Nudge Pad & Offsets */}
            <PositionControlPad
              label="تحريك موضع العنوان (Positioning)"
              offsetX={styleConfig.titleX}
              offsetY={styleConfig.titleY}
              onNudge={(dx, dy) => nudgePosition('title', dx, dy)}
              onChangeX={(val) => updateField('titleX', val)}
              onChangeY={(val) => updateField('titleY', val)}
            />
          </div>
        )}

        {/* PRICE CONTROL */}
        {activeTab === 'price' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">نص السعر والعملة</label>
              <input
                type="text"
                value={styleConfig.priceText}
                onChange={(e) => updateField('priceText', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">لون السعر</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleConfig.priceColor}
                    onChange={(e) => updateField('priceColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={styleConfig.priceColor}
                    onChange={(e) => updateField('priceColor', e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">حجم خط السعر</label>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{styleConfig.priceFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={styleConfig.priceFontSize}
                  onChange={(e) => updateField('priceFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <PositionControlPad
              label="تحريك موضع السعر"
              offsetX={styleConfig.priceX}
              offsetY={styleConfig.priceY}
              onNudge={(dx, dy) => nudgePosition('price', dx, dy)}
              onChangeX={(val) => updateField('priceX', val)}
              onChangeY={(val) => updateField('priceY', val)}
            />
          </div>
        )}

        {/* BADGE CONTROL */}
        {activeTab === 'badge' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">نص الشارة الترويجية</label>
              <input
                type="text"
                value={styleConfig.badgeText}
                onChange={(e) => updateField('badgeText', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">خلفية الشارة</label>
                <input
                  type="color"
                  value={styleConfig.badgeBgColor}
                  onChange={(e) => updateField('badgeBgColor', e.target.value)}
                  className="w-full h-8 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">لون خط الشارة</label>
                <input
                  type="color"
                  value={styleConfig.badgeTextColor}
                  onChange={(e) => updateField('badgeTextColor', e.target.value)}
                  className="w-full h-8 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">الحجم ({styleConfig.badgeFontSize}px)</label>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={styleConfig.badgeFontSize}
                  onChange={(e) => updateField('badgeFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <PositionControlPad
              label="تحريك موضع الشارة الترويجية"
              offsetX={styleConfig.badgeX}
              offsetY={styleConfig.badgeY}
              onNudge={(dx, dy) => nudgePosition('badge', dx, dy)}
              onChangeX={(val) => updateField('badgeX', val)}
              onChangeY={(val) => updateField('badgeY', val)}
            />
          </div>
        )}

        {/* CTA BUTTON CONTROL */}
        {activeTab === 'cta' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">نص زر الدعوة للاتخاذ إجراء (CTA Button)</label>
              <input
                type="text"
                value={styleConfig.ctaText}
                onChange={(e) => updateField('ctaText', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">خلفية الزر</label>
                <input
                  type="color"
                  value={styleConfig.ctaBgColor}
                  onChange={(e) => updateField('ctaBgColor', e.target.value)}
                  className="w-full h-8 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">لون خط الزر</label>
                <input
                  type="color"
                  value={styleConfig.ctaTextColor}
                  onChange={(e) => updateField('ctaTextColor', e.target.value)}
                  className="w-full h-8 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">حجم الخط ({styleConfig.ctaFontSize}px)</label>
                <input
                  type="range"
                  min={9}
                  max={28}
                  value={styleConfig.ctaFontSize}
                  onChange={(e) => updateField('ctaFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <PositionControlPad
              label="تحريك موضع زر الطلب"
              offsetX={styleConfig.ctaX}
              offsetY={styleConfig.ctaY}
              onNudge={(dx, dy) => nudgePosition('cta', dx, dy)}
              onChangeX={(val) => updateField('ctaX', val)}
              onChangeY={(val) => updateField('ctaY', val)}
            />
          </div>
        )}

        {/* TAGLINE CONTROL */}
        {activeTab === 'tagline' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">النص السفلية / الميزة الإضافية</label>
              <input
                type="text"
                value={styleConfig.taglineText}
                onChange={(e) => updateField('taglineText', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">لون النص</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styleConfig.taglineColor}
                    onChange={(e) => updateField('taglineColor', e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={styleConfig.taglineColor}
                    onChange={(e) => updateField('taglineColor', e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">حجم الخط</label>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{styleConfig.taglineFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={styleConfig.taglineFontSize}
                  onChange={(e) => updateField('taglineFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <PositionControlPad
              label="تحريك موضع النص السفلية"
              offsetX={styleConfig.taglineX}
              offsetY={styleConfig.taglineY}
              onNudge={(dx, dy) => nudgePosition('tagline', dx, dy)}
              onChangeX={(val) => updateField('taglineX', val)}
              onChangeY={(val) => updateField('taglineY', val)}
            />
          </div>
        )}

        {/* PRESETS & SAVE CONTROL */}
        {activeTab === 'presets' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/30 space-y-2">
              <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>حفظ التنسيق الحالي كـ نمط مخصص (Save Preset)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  placeholder="اسم النمط (مثال: ألوان المتجر الرسمية)..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer shrink-0 active:scale-95"
                >
                  حفظ النمط
                </button>
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>الأنماط القابلة للتطبيق الفوري ({savedPresets.length})</span>
              </h5>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {savedPresets.map((preset) => (
                  <div 
                    key={preset.id}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex items-center -space-x-1">
                        <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.config.titleColor }} />
                        <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.config.priceColor }} />
                        <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.config.ctaBgColor }} />
                      </div>
                      <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition cursor-pointer"
                      >
                        تطبيق
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="حذف النمط"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PositionControlPadProps {
  label: string;
  offsetX: number;
  offsetY: number;
  onNudge: (deltaX: number, deltaY: number) => void;
  onChangeX: (val: number) => void;
  onChangeY: (val: number) => void;
}

const PositionControlPad: React.FC<PositionControlPadProps> = ({
  label,
  offsetX,
  offsetY,
  onNudge,
  onChangeX,
  onChangeY
}) => {
  return (
    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
        <span className="flex items-center gap-1">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </span>
        <span className="text-[10px] font-mono text-indigo-400 font-bold">
          X: {offsetX}px | Y: {offsetY}px
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        {/* Arrow Pad */}
        <div className="flex flex-col items-center justify-center bg-slate-900 p-2 rounded-lg border border-slate-800 w-full max-w-[150px] mx-auto">
          <button
            type="button"
            onClick={() => onNudge(0, -5)}
            className="w-7 h-7 bg-slate-800 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center text-xs transition cursor-pointer active:scale-90"
            title="تحريك للأعلى (Up 5px)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 my-1">
            <button
              type="button"
              onClick={() => onNudge(5, 0)}
              className="w-7 h-7 bg-slate-800 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center text-xs transition cursor-pointer active:scale-90"
              title="تحريك لليمين (Right 5px)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onChangeX(0);
                onChangeY(0);
              }}
              className="w-6 h-6 bg-slate-950 text-amber-400 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold transition cursor-pointer"
              title="تصفير الموضع (Reset Center)"
            >
              •
            </button>

            <button
              type="button"
              onClick={() => onNudge(-5, 0)}
              className="w-7 h-7 bg-slate-800 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center text-xs transition cursor-pointer active:scale-90"
              title="تحريك لليسار (Left 5px)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNudge(0, 5)}
            className="w-7 h-7 bg-slate-800 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center text-xs transition cursor-pointer active:scale-90"
            title="تحريك للاسفل (Down 5px)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders for fine tuning */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>الإزاحة الأفقية (X Offset)</span>
              <span className="font-mono">{offsetX}px</span>
            </div>
            <input
              type="range"
              min={-150}
              max={150}
              value={offsetX}
              onChange={(e) => onChangeX(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
              <span>الإزاحة الرأسية (Y Offset)</span>
              <span className="font-mono">{offsetY}px</span>
            </div>
            <input
              type="range"
              min={-150}
              max={150}
              value={offsetY}
              onChange={(e) => onChangeY(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
