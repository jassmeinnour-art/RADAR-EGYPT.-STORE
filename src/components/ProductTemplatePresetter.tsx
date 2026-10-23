import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Sun, 
  Contrast, 
  Image as ImageIcon,
  Check,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export interface VisualPreset {
  id: string;
  name: string;
  description: string;
  backgroundTheme: string;
  shadowIntensity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  showPedestal: boolean;
  selectedFrame: string;
  updatedAt: string;
}

const DEFAULT_PRESETS: VisualPreset[] = [
  {
    id: 'preset_egypt_gold',
    name: 'هوية متجر مصر الملكي (Gold & Marble)',
    description: 'خلفية رخامية فاخرة مع ظل ناعم، إضاءة استوديو دافئة، وإطار ذهبي رسمي.',
    backgroundTheme: 'luxury_marble',
    shadowIntensity: 65,
    brightness: 105,
    contrast: 110,
    saturation: 105,
    showPedestal: true,
    selectedFrame: 'verified_merchant_gold',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset_noon_amazon',
    name: 'معيار أمازون ونون (Pure White Studio)',
    description: 'أبيض ناصع 100% مع إضاءة متوازنة بدون ظلال قوية، معتمد رسمياً لمنصات التجارة الإلكترونية.',
    backgroundTheme: 'pure_white',
    shadowIntensity: 20,
    brightness: 100,
    contrast: 105,
    saturation: 100,
    showPedestal: false,
    selectedFrame: 'clean_minimal_story',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'preset_neon_cyber',
    name: 'استوديو نيون إلكترونيات (Cyber Neon)',
    description: 'خلفية داكنة مع إضاءة زرقاء وأرجوانية متباينة مثالية للإلكترونيات والسماعات.',
    backgroundTheme: 'neon_cyber',
    shadowIntensity: 80,
    brightness: 110,
    contrast: 120,
    saturation: 115,
    showPedestal: true,
    selectedFrame: 'black_friday_neon',
    updatedAt: new Date().toISOString()
  }
];

interface ProductTemplatePresetterProps {
  currentSettings: {
    backgroundTheme: string;
    shadowIntensity: number;
    brightness: number;
    contrast: number;
    saturation: number;
    showPedestal: boolean;
    selectedFrame: string;
  };
  onApplyPreset: (preset: VisualPreset) => void;
  onShowToast?: (msg: string) => void;
}

export function ProductTemplatePresetter({
  currentSettings,
  onApplyPreset,
  onShowToast
}: ProductTemplatePresetterProps) {
  const [presets, setPresets] = useState<VisualPreset[]>(() => {
    try {
      const saved = localStorage.getItem('radar_merchant_visual_presets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load visual presets:', e);
    }
    return DEFAULT_PRESETS;
  });

  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('radar_merchant_visual_presets', JSON.stringify(presets));
    } catch (e) {
      console.warn('Could not save visual presets:', e);
    }
  }, [presets]);

  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      alert('الرجاء إدخال اسم الهوية البصرية أو الإعداد المسبق.');
      return;
    }

    const newPreset: VisualPreset = {
      id: 'preset_' + Date.now(),
      name: presetName.trim(),
      description: presetDesc.trim() || 'إعداد مسبق مخصص للهوية البصرية لمنتجات المتجر',
      backgroundTheme: currentSettings.backgroundTheme,
      shadowIntensity: currentSettings.shadowIntensity,
      brightness: currentSettings.brightness,
      contrast: currentSettings.contrast,
      saturation: currentSettings.saturation,
      showPedestal: currentSettings.showPedestal,
      selectedFrame: currentSettings.selectedFrame,
      updatedAt: new Date().toISOString()
    };

    setPresets([newPreset, ...presets]);
    setActivePresetId(newPreset.id);
    setPresetName('');
    setPresetDesc('');
    if (onShowToast) onShowToast(`تم حفظ الهوية البصرية "${newPreset.name}" بنجاح!`);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
    if (onShowToast) onShowToast('تم حذف الإعداد المسبق.');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-6" dir="rtl" role="region" aria-label="مدير الهويات البصرية والإعدادات المسبقة">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400" aria-hidden="true">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">إعدادات الهوية البصرية السريعة (ProductTemplatePresetter)</h3>
            <p className="text-xs text-slate-400">حفظ وتطبيق إعدادات الخلفيات والديكورات بضغطة زر واحدة لضمان اتساق هوية المتجر</p>
          </div>
        </div>
      </div>

      {/* Save Current Studio Config Form */}
      <form onSubmit={handleSaveCurrentAsPreset} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>حفظ إعدادات الاستوديو الحالية كهوية بصرية جديدة</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="اسم الهوية البصرية (مثال: هوية رمضان الذهبية)..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <input
            type="text"
            value={presetDesc}
            onChange={(e) => setPresetDesc(e.target.value)}
            placeholder="وصف مختصر أو ملاحظات الديكور والظل..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>حفظ كقالب هوية بصرية</span>
          </button>
        </div>
      </form>

      {/* List of Saved Presets */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span>القوالب والهويات البصرية المتاحة للاستخدام ({presets.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div 
                key={preset.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected 
                    ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-white text-xs">{preset.name}</h5>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40">
                        مطبق حالياً ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{preset.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePresetId(preset.id);
                      onApplyPreset(preset);
                      if (onShowToast) onShowToast(`تم تطبيق الهوية البصرية "${preset.name}" بنجاح على المنتج!`);
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تطبيق فوري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition border border-slate-800"
                    title="حذف القالب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
