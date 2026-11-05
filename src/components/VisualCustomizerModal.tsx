import React, { useState, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Save, 
  Download, 
  Upload, 
  Palette, 
  Type, 
  Square, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  MousePointerClick,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sun,
  Moon,
  Package,
  Users,
  Activity,
  Clock,
  Store,
  Filter,
  Search,
  ExternalLink,
  Crown,
  Zap,
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react';
import { 
  useVisualCustomizer, 
  SupportedFontFamily, 
  SupportedFontWeight, 
  SupportedShadow,
  ButtonSize,
  ButtonShape,
  ButtonLocation,
  ManagedButtonItem,
  getShadowCssValue,
  getButtonHeight,
  getButtonRadius,
  THEME_PRESETS
} from '../context/VisualCustomizerContext';

// Reusable Arrow Control Component per user requirement (Strictly NO <input type="range">)
interface ArrowControlProps {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
}

const ArrowControl: React.FC<ArrowControlProps> = ({
  label,
  value,
  unit = 'px',
  min,
  max,
  step = 1,
  onChange,
}) => {
  const handleInc = () => {
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  const handleDec = () => {
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      <div className="flex items-center border border-slate-700/80 rounded-lg overflow-hidden bg-slate-950 shadow-inner">
        <button
          type="button"
          onClick={handleInc}
          disabled={value >= max}
          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
          title="زيادة (+)"
        >
          ▲
        </button>
        <span className="px-2.5 py-1 min-w-[56px] text-center font-mono font-bold text-xs text-amber-300 bg-slate-900 select-none">
          {value}{unit}
        </span>
        <button
          type="button"
          onClick={handleDec}
          disabled={value <= min}
          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800"
          title="إنقاص (-)"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

// Reusable Color Row with Picker + Hex Input
interface ColorPickerRowProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPickerRow: React.FC<ColorPickerRowProps> = ({ label, value, onChange }) => {
  const adjustColor = (amount: number) => {
    // Simple hex adjustment
    const hex = value.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    onChange(`#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`);
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => adjustColor(20)} className="text-[8px] bg-slate-800 hover:bg-slate-700 px-1 rounded">▲</button>
          <button onClick={() => adjustColor(-20)} className="text-[8px] bg-slate-800 hover:bg-slate-700 px-1 rounded">▼</button>
        </div>
        <input
          type="color"
          value={value.startsWith('#') && value.length === 7 ? value : '#FF8C00'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent p-0 overflow-hidden"
          title={`اختيار ${label}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg font-mono text-[11px] text-amber-300 text-center uppercase focus:border-amber-500 outline-none"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export const VisualCustomizerModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateButton,
    moveButtonOrder,
    resetDefaults,
    applyThemePreset,
    isCustomizerOpen,
    setIsCustomizerOpen,
    saveSettingsToStorage,
    exportSettingsToJson,
    importSettingsFromJson,
  } = useVisualCustomizer();

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'borders' | 'buttons' | 'button_manager'>('colors');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [previewThemeMode, setPreviewThemeMode] = useState<'dark' | 'light'>('dark');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCustomizerOpen) return null;

  const handleSave = async () => {
    const success = await saveSettingsToStorage();
    if (success) {
      setSaveSuccessNotice('تم حفظ الإعدادات وتطبيقها بنجاح على النظام وقاعدة البيانات! 💾');
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importSettingsFromJson(content);
        if (ok) {
          setSaveSuccessNotice('تم استيراد إعدادات المظهر بنجاح! 📥');
          setTimeout(() => setSaveSuccessNotice(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sorted buttons list for manager
  const sortedButtons = [...settings.buttonsList].sort((a, b) => a.order - b.order);

  // Helper for preview card styling
  const previewCardStyle: React.CSSProperties = {
    backgroundColor: previewThemeMode === 'dark' ? settings.colorCard : '#ffffff',
    color: previewThemeMode === 'dark' ? settings.colorText : '#1a1a1a',
    borderRadius: `${settings.borderRadius}px`,
    borderWidth: `${settings.borderWidth}px`,
    borderColor: previewThemeMode === 'dark' ? settings.colorBorder : '#e2e8f0',
    boxShadow: getShadowCssValue(settings.cardShadow),
    padding: `${settings.cardPadding}px`,
    margin: `${settings.cardMargin}px 0`,
    fontFamily: `'${settings.fontFamily}', sans-serif`,
    lineHeight: settings.lineHeight,
  };

  const previewButtonStyle: React.CSSProperties = {
    backgroundColor: settings.buttonPrimaryColor,
    color: settings.buttonTextColor,
    borderRadius: `${getButtonRadius(settings.buttonShape)}px`,
    height: `${getButtonHeight(settings.buttonSize)}px`,
    fontFamily: `'${settings.fontFamily}', sans-serif`,
    fontWeight: settings.fontWeight as any,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200" dir="rtl">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white font-['Alexandria']">
                  لوحة تخصيص المظهر الشاملة (Visual Theme Customizer Pro)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Live Preview & Arrows Control ⚡
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                تحكم كامل وفوري بجميع عناصر وألوان وأزرار المنظومة مع معاينة حية بدون سلايدر.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dark / Light Preview Toggle */}
            <button
              type="button"
              onClick={() => setPreviewThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="تبديل وضع المعاينة (فاتح / داكن)"
            >
              {previewThemeMode === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{previewThemeMode === 'dark' ? 'معاينة داكنة' : 'معاينة فاتحة'}</span>
            </button>

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={resetDefaults}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="إعادة التعيين للإعدادات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين</span>
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={() => exportSettingsToJson()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="تصدير إعدادات المظهر كملف JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير JSON</span>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="استيراد إعدادات مظهر من ملف JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ التخصيص 💾</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Notice Toast */}
        {saveSuccessNotice && (
          <div className="bg-emerald-950/90 text-emerald-300 border-b border-emerald-500/40 px-4 py-2 text-center text-xs font-bold animate-in fade-in">
            {saveSuccessNotice}
          </div>
        )}

        {/* Modal Body: Left 30% Controls | Right 70% Live Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ============================================================== */}
          {/* SECTION 1: RIGHT 70% - LIVE PREVIEW (نسخة مصغرة من الداشبورد)  */}
          {/* ============================================================== */}
          <div 
            className="flex-1 lg:w-[68%] xl:w-[70%] border-b lg:border-b-0 lg:border-l border-slate-800/80 p-4 sm:p-6 overflow-y-auto transition-colors duration-200"
            style={{
              backgroundColor: previewThemeMode === 'dark' ? settings.colorBackground : '#f8fafc',
              fontFamily: `'${settings.fontFamily}', sans-serif`,
            }}
          >
            <div className="max-w-5xl mx-auto space-y-4">
              
              {/* Preview Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-700/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-400">
                    معاينة حية فورية ومطابقة للداشبورد الحقيقي (Live Preview)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Presets quick tags */}
                  <span className="text-[10px] text-slate-500 font-bold">أنماط جاهزة:</span>
                  {Object.entries(THEME_PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyThemePreset(key)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                    >
                      {p.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. TOP KPI 4 CARDS (999 يوم، مستقر، 24، 148) */}
              <div 
                className="grid grid-cols-2 sm:grid-cols-4"
                style={{ gap: `${settings.gapBetweenCards}px` }}
              >
                {/* Active Products */}
                {settings.buttonsList.find(b => b.id === 'btn_kpi_active_products')?.visible !== false && (
                  <div 
                    style={previewCardStyle}
                    className="transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span style={{ fontSize: `${settings.fontSizeCard}px` }} className="font-bold">المنتجات النشطة</span>
                      <Package className="w-4 h-4" style={{ color: settings.colorPrimary }} />
                    </div>
                    <div style={{ fontSize: `${settings.fontSizeH1}px` }} className="font-mono font-black text-white">
                      148
                    </div>
                    <span style={{ fontSize: `${settings.fontSizeCard - 2}px`, color: settings.colorSuccess }} className="font-bold">
                      محدثة في الكتالوج 🟢
                    </span>
                  </div>
                )}

                {/* Tracked Competitors */}
                {settings.buttonsList.find(b => b.id === 'btn_kpi_competitors')?.visible !== false && (
                  <div 
                    style={previewCardStyle}
                    className="transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span style={{ fontSize: `${settings.fontSizeCard}px` }} className="font-bold">المنافسون المراقبون</span>
                      <Users className="w-4 h-4 text-sky-400" />
                    </div>
                    <div style={{ fontSize: `${settings.fontSizeH1}px` }} className="font-mono font-black text-white">
                      24
                    </div>
                    <span style={{ fontSize: `${settings.fontSizeCard - 2}px` }} className="text-sky-400 font-bold">
                      متاجر بالسوق المصري
                    </span>
                  </div>
                )}

                {/* Sync Status */}
                {settings.buttonsList.find(b => b.id === 'btn_kpi_sync_status')?.visible !== false && (
                  <div 
                    style={previewCardStyle}
                    className="transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span style={{ fontSize: `${settings.fontSizeCard}px` }} className="font-bold">حالة التزامن الأخيرة</span>
                      <Activity className="w-4 h-4" style={{ color: settings.colorSuccess }} />
                    </div>
                    <div style={{ fontSize: `${settings.fontSizeH1}px`, color: settings.colorSuccess }} className="font-mono font-black">
                      مستقر
                    </div>
                    <span style={{ fontSize: `${settings.fontSizeCard - 2}px` }} className="text-slate-400 font-bold">
                      مزامنة سحابية نشطة
                    </span>
                  </div>
                )}

                {/* Trial Remaining */}
                {settings.buttonsList.find(b => b.id === 'btn_kpi_trial')?.visible !== false && (
                  <div 
                    style={previewCardStyle}
                    className="transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span style={{ fontSize: `${settings.fontSizeCard}px` }} className="font-bold">مهلة التجربة/الاشتراك</span>
                      <Clock className="w-4 h-4" style={{ color: settings.colorWarning }} />
                    </div>
                    <div style={{ fontSize: `${settings.fontSizeH1}px`, color: settings.colorWarning }} className="font-mono font-black">
                      999 يوم
                    </div>
                    <span style={{ fontSize: `${settings.fontSizeCard - 2}px` }} className="text-amber-400 underline font-bold">
                      باقة مفعلة دائمة 👑
                    </span>
                  </div>
                )}
              </div>

              {/* 2. PRODUCT CATALOG CARD (Amazon SP-API & Noon) */}
              <div style={previewCardStyle} className="transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Amazon SP-API & Noon Live Sync
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">
                        🟢 متصل بالكتالوج المعتمد
                      </span>
                    </div>
                    <h1 
                      style={{ 
                        fontSize: `${settings.fontSizeH1}px`,
                        color: settings.colorHeading,
                        fontWeight: settings.fontWeight as any
                      }} 
                      className="font-black"
                    >
                      كتالوج المنتجات ومراقبة أسعار المنافسين
                    </h1>
                    <p style={{ fontSize: `${settings.fontSizeBase}px` }} className="text-slate-400 mt-1">
                      سحب كتالوج منتجات التاجر ورصد سعر الـ Buy Box اللحظي لضمان حسم المبيعات.
                    </p>
                  </div>

                  {/* Actions inside header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      style={previewButtonStyle}
                      className="px-4 text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>تحديث الأسعار الآن</span>
                    </button>
                    <button
                      type="button"
                      style={{
                        borderRadius: `${getButtonRadius(settings.buttonShape)}px`,
                        height: `${getButtonHeight(settings.buttonSize)}px`,
                      }}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>تصدير CSV</span>
                    </button>
                  </div>
                </div>

                {/* Mini Products Table within Preview */}
                <div className="overflow-x-auto rounded-xl border border-slate-700/40">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700/50">
                      <tr>
                        <th className="p-2.5">المنتج / SKU</th>
                        <th className="p-2.5">سعرك الحالي</th>
                        <th className="p-2.5">أرخص منافس</th>
                        <th className="p-2.5">حالة الـ Buy Box</th>
                        <th className="p-2.5">الإجراء المقترح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-['Cairo']">
                      <tr className="hover:bg-slate-800/20 transition">
                        <td className="p-2.5 font-bold flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">
                            SP
                          </div>
                          <div>
                            <div className="text-white font-bold">سماعة أنكر لايف كيو 30 اللاسلكية</div>
                            <span className="text-[10px] text-slate-500 font-mono">ANK-Q30-BLK</span>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono font-black text-amber-300">2,850 ج.م</td>
                        <td className="p-2.5 font-mono text-slate-300">2,899 ج.م (أمازون)</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            فائز بالـ Buy Box 🏆
                          </span>
                        </td>
                        <td className="p-2.5">
                          <button
                            type="button"
                            style={{
                              backgroundColor: settings.buttonPrimaryColor,
                              color: settings.buttonTextColor,
                              borderRadius: `${getButtonRadius(settings.buttonShape)}px`,
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            تثبيت السعر ⚡
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-800/20 transition">
                        <td className="p-2.5 font-bold flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-[10px]">
                            EG
                          </div>
                          <div>
                            <div className="text-white font-bold">شاحن بيلكن 65 واط شحن سريع</div>
                            <span className="text-[10px] text-slate-500 font-mono">BLK-W65-DUAL</span>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono font-black text-slate-200">1,450 ج.م</td>
                        <td className="p-2.5 font-mono text-rose-400">1,399 ج.م (نون مصر)</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            أعلى من المنافس ⚠️
                          </span>
                        </td>
                        <td className="p-2.5">
                          <button
                            type="button"
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer"
                          >
                            مطابقة السعر (1,399)
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. MERCHANT FILTERING SYSTEM CARD (نظام فلترة التجار) */}
              <div style={previewCardStyle} className="transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <h3 style={{ fontSize: `${settings.fontSizeH3}px` }} className="font-bold text-white">
                      نظام فلترة التجار المتقدم (Multi-Merchant Filter)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">24 متجر متاح</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      readOnly
                      value="بحث في أسماء المتاجر والمنصات..."
                      className="w-full pr-8 pl-3 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-slate-400 cursor-default"
                    />
                  </div>

                  <select 
                    disabled 
                    className="w-full px-3 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-slate-300 cursor-default"
                  >
                    <option>جميع المنصات (أمازون، نون، جوميا)</option>
                  </select>

                  <select 
                    disabled 
                    className="w-full px-3 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-slate-300 cursor-default"
                  >
                    <option>حالة التزامن (الكل)</option>
                  </select>
                </div>

                {/* Rendered Action Buttons in main_top / main_bottom */}
                <div className="pt-2 border-t border-slate-700/30 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400">أزرار التحكم المنقولة:</span>
                  {sortedButtons
                    .filter(b => b.visible && b.location === 'main_top')
                    .map(btn => (
                      <span
                        key={btn.id}
                        style={{
                          backgroundColor: btn.customColor || settings.colorPrimary,
                          color: btn.customTextColor || settings.buttonTextColor,
                          borderRadius: `${getButtonRadius(settings.buttonShape)}px`,
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold shadow-xs inline-flex items-center gap-1"
                      >
                        {btn.label}
                      </span>
                    ))}
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: LEFT 30% - CONTROLS (تحكم بالأسهم فقط بدون سلايدر)  */}
          {/* ============================================================== */}
          <div className="w-full lg:w-[32%] xl:w-[30%] bg-slate-950 flex flex-col h-full overflow-hidden">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-800/80 bg-slate-900/70 p-1.5 gap-1 shrink-0 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('colors')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'colors' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>1- الألوان</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('typography')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'typography' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>2- النصوص</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('borders')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'borders' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>3- الإطارات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('buttons')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'buttons' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>4- الأزرار</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('button_manager')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'button_manager' 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>5- إدارة الأزرار ⚡</span>
              </button>
            </div>

            {/* Tab Controls Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-['Cairo']">
              
              {/* TAB 1: COLORS (Color Picker + Hex Input) */}
              {activeTab === 'colors' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-amber-400 mb-2">
                    🎨 منتقي الألوان وحقول Hex (تطبيق فوري):
                  </div>

                  <ColorPickerRow
                    label="اللون الأساسي Primary"
                    value={settings.colorPrimary}
                    onChange={(c) => updateSettings({ colorPrimary: c })}
                  />
                  <ColorPickerRow
                    label="اللون الثانوي Secondary"
                    value={settings.colorSecondary}
                    onChange={(c) => updateSettings({ colorSecondary: c })}
                  />
                  <ColorPickerRow
                    label="لون الخلفية Background"
                    value={settings.colorBackground}
                    onChange={(c) => updateSettings({ colorBackground: c })}
                  />
                  <ColorPickerRow
                    label="خلفية البطاقات Card BG"
                    value={settings.colorCard}
                    onChange={(c) => updateSettings({ colorCard: c })}
                  />
                  <ColorPickerRow
                    label="لون النص الأساسي Text"
                    value={settings.colorText}
                    onChange={(c) => updateSettings({ colorText: c })}
                  />
                  <ColorPickerRow
                    label="لون النص الثانوي Secondary Text"
                    value={settings.colorTextSecondary}
                    onChange={(c) => updateSettings({ colorTextSecondary: c })}
                  />
                  <ColorPickerRow
                    label="لون الحدود Border"
                    value={settings.colorBorder}
                    onChange={(c) => updateSettings({ colorBorder: c })}
                  />
                  <ColorPickerRow
                    label="لون النجاح Success"
                    value={settings.colorSuccess}
                    onChange={(c) => updateSettings({ colorSuccess: c })}
                  />
                  <ColorPickerRow
                    label="لون الخطأ Error"
                    value={settings.colorError}
                    onChange={(c) => updateSettings({ colorError: c })}
                  />
                  <ColorPickerRow
                    label="لون التحذير Warning"
                    value={settings.colorWarning}
                    onChange={(c) => updateSettings({ colorWarning: c })}
                  />
                  <ColorPickerRow
                    label="لون العناوين Heading Color"
                    value={settings.colorHeading}
                    onChange={(c) => updateSettings({ colorHeading: c })}
                  />
                </div>
              )}

              {/* TAB 2: TYPOGRAPHY (Arrows only) */}
              {activeTab === 'typography' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-amber-400 mb-2">
                    ✍️ أحجام وخطوط النصوص (تحكم بالأسهم فقط ▲▼):
                  </div>

                  <ArrowControl
                    label="حجم الخط العام Base (10-22)"
                    value={settings.fontSizeBase}
                    min={10}
                    max={22}
                    onChange={(val) => updateSettings({ fontSizeBase: val })}
                  />

                  <ArrowControl
                    label="حجم العناوين H1 (16-48)"
                    value={settings.fontSizeH1}
                    min={16}
                    max={48}
                    onChange={(val) => updateSettings({ fontSizeH1: val })}
                  />

                  <ArrowControl
                    label="حجم العناوين الفرعية H2 (14-36)"
                    value={settings.fontSizeH2}
                    min={14}
                    max={36}
                    onChange={(val) => updateSettings({ fontSizeH2: val })}
                  />

                  <ArrowControl
                    label="حجم العناوين H3 (12-28)"
                    value={settings.fontSizeH3}
                    min={12}
                    max={28}
                    onChange={(val) => updateSettings({ fontSizeH3: val })}
                  />

                  <ArrowControl
                    label="حجم نصوص البطاقات (10-20)"
                    value={settings.fontSizeCard}
                    min={10}
                    max={20}
                    onChange={(val) => updateSettings({ fontSizeCard: val })}
                  />

                  <ArrowControl
                    label="تباعد الأسطر Line Height (1.0 - 2.5)"
                    value={settings.lineHeight}
                    unit=""
                    min={1.0}
                    max={2.5}
                    step={0.1}
                    onChange={(val) => updateSettings({ lineHeight: val })}
                  />

                  {/* Font Family Dropdown */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      نوع الخط (Font Family):
                    </label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => updateSettings({ fontFamily: e.target.value as SupportedFontFamily })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-amber-500"
                    >
                      <option value="Cairo">Cairo (خط القاهرة - الافتراضي)</option>
                      <option value="Tajawal">Tajawal (خط تجوال العصري)</option>
                      <option value="Inter">Inter (خط إنتر العالمي)</option>
                      <option value="Amiri">Amiri (خط أميري الأصيل)</option>
                      <option value="Alexandria">Alexandria (خط الإسكندرية الحديث)</option>
                    </select>
                  </div>

                  {/* Font Weight Buttons */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      وزن الخط (Font Weight):
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'Light', val: '300' },
                        { label: 'Regular', val: '400' },
                        { label: 'Bold', val: '700' },
                        { label: 'Extra', val: '800' }
                      ].map(w => (
                        <button
                          key={w.val}
                          type="button"
                          onClick={() => updateSettings({ fontWeight: w.val as SupportedFontWeight })}
                          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                            settings.fontWeight === w.val
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BORDERS & SPACING (Arrows only) */}
              {activeTab === 'borders' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-amber-400 mb-2">
                    📐 الإطارات والمسافات (تحكم بالأسهم فقط ▲▼):
                  </div>

                  <ArrowControl
                    label="استدارة الحواف Border Radius (0-30)"
                    value={settings.borderRadius}
                    min={0}
                    max={30}
                    onChange={(val) => updateSettings({ borderRadius: val })}
                  />

                  <ArrowControl
                    label="سُمك الحدود Border Width (0-5)"
                    value={settings.borderWidth}
                    min={0}
                    max={5}
                    onChange={(val) => updateSettings({ borderWidth: val })}
                  />

                  <ArrowControl
                    label="الحشو الداخلي للبطاقات Padding (4-40)"
                    value={settings.cardPadding}
                    min={4}
                    max={40}
                    step={2}
                    onChange={(val) => updateSettings({ cardPadding: val })}
                  />

                  <ArrowControl
                    label="الهوامش الخارجية للبطاقات Margin (0-32)"
                    value={settings.cardMargin}
                    min={0}
                    max={32}
                    onChange={(val) => updateSettings({ cardMargin: val })}
                  />

                  <ArrowControl
                    label="المسافة البينية بين الكروت Gap (4-32)"
                    value={settings.gapBetweenCards}
                    min={4}
                    max={32}
                    onChange={(val) => updateSettings({ gapBetweenCards: val })}
                  />

                  {/* Shadow Selection */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      ظل البطاقات (Shadow):
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: 'بدون (None)', val: 'none' },
                        { label: 'خفيف', val: 'small' },
                        { label: 'متوسط', val: 'medium' },
                        { label: 'قوي', val: 'large' }
                      ].map(sh => (
                        <button
                          key={sh.val}
                          type="button"
                          onClick={() => updateSettings({ cardShadow: sh.val as SupportedShadow })}
                          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                            settings.cardShadow === sh.val
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BUTTONS STYLING */}
              {activeTab === 'buttons' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-400 mb-2">
                    🔘 تنسيق وتصميم الأزرار:
                  </div>

                  {/* Button Size */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      حجم الزر (Button Size):
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'صغير (32px)', val: 'small' },
                        { label: 'متوسط (40px)', val: 'medium' },
                        { label: 'كبير (48px)', val: 'large' }
                      ].map(sz => (
                        <button
                          key={sz.val}
                          type="button"
                          onClick={() => updateSettings({ buttonSize: sz.val as ButtonSize })}
                          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                            settings.buttonSize === sz.val
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Shape */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      شكل وحواف الزر (Button Shape):
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'مربع (0px)', val: 'square' },
                        { label: 'دائري قليل (8px)', val: 'rounded' },
                        { label: 'دائري كامل (50px)', val: 'full_pill' }
                      ].map(shp => (
                        <button
                          key={shp.val}
                          type="button"
                          onClick={() => updateSettings({ buttonShape: shp.val as ButtonShape })}
                          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                            settings.buttonShape === shp.val
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {shp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Colors */}
                  <ColorPickerRow
                    label="لون زر أساسي (Button BG)"
                    value={settings.buttonPrimaryColor}
                    onChange={(c) => updateSettings({ buttonPrimaryColor: c })}
                  />

                  <ColorPickerRow
                    label="لون نص الزر (Button Text)"
                    value={settings.buttonTextColor}
                    onChange={(c) => updateSettings({ buttonTextColor: c })}
                  />
                </div>
              )}

              {/* TAB 5: BUTTON MANAGER (إدارة الأزرار ونقلها وترتيبها) */}
              {activeTab === 'button_manager' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-amber-400">
                      ⚡ إدارة أماكن وظهور وترتيب جميع أزرار النظام:
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    يمكنك نقل أي زر إلى اللوحة الجانبية (Sidebar) أو إخفاؤه أو تغيير ترتيبه فورياً:
                  </p>

                  <div className="space-y-2">
                    {sortedButtons.map((btn, index) => (
                      <div
                        key={btn.id}
                        className={`p-2.5 rounded-xl border transition ${
                          btn.visible 
                            ? 'bg-slate-900/90 border-slate-700/80 shadow-xs' 
                            : 'bg-slate-950/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateButton(btn.id, { visible: !btn.visible })}
                              className={`p-1.5 rounded-lg border transition ${
                                btn.visible 
                                  ? 'bg-emerald-600 text-white border-emerald-500' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                              title={btn.visible ? 'إخفاء الزر' : 'إظهار الزر'}
                            >
                              {btn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <span className="text-xs font-bold text-white">
                              {btn.label}
                            </span>
                          </div>

                          {/* Order Up / Down Arrows */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveButtonOrder(btn.id, 'up')}
                              disabled={index === 0}
                              className="p-1 bg-slate-800 hover:bg-amber-600 disabled:opacity-30 rounded text-slate-200 transition cursor-pointer"
                              title="تحريك لأعلى"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-[10px] text-slate-400 px-1">
                              #{btn.order}
                            </span>
                            <button
                              type="button"
                              onClick={() => moveButtonOrder(btn.id, 'down')}
                              disabled={index === sortedButtons.length - 1}
                              className="p-1 bg-slate-800 hover:bg-amber-600 disabled:opacity-30 rounded text-slate-200 transition cursor-pointer"
                              title="تحريك لأسفل"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Location Select */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400 shrink-0">المكان:</span>
                          <select
                            value={btn.location}
                            onChange={(e) => updateButton(btn.id, { location: e.target.value as ButtonLocation })}
                            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer focus:border-amber-500"
                          >
                            <option value="main_top">الصفحة الرئيسية - أعلى (Main Top)</option>
                            <option value="main_bottom">الصفحة الرئيسية - أسفل (Main Bottom)</option>
                            <option value="sidebar">اللوحة الجانبية (Sidebar Drawer)</option>
                            <option value="top_nav">القائمة العلوية (Top Nav)</option>
                            <option value="hidden">مخفي تماماً (Hidden)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
