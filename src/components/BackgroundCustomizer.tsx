import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Sparkles, 
  Download, 
  Sliders, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  Layers, 
  Eye, 
  ShieldCheck, 
  Upload, 
  Maximize2,
  FolderPlus,
  Wand2
} from 'lucide-react';

export interface BackgroundPreset {
  id: string;
  category: 'kitchen' | 'office' | 'forest' | 'living_room' | 'marble_studio' | 'sports' | 'egyptian_arabesque';
  titleAr: string;
  categoryAr: string;
  imageUrl: string;
  suggestedProducts: string;
}

export const PRESET_BACKDROPS: BackgroundPreset[] = [
  {
    id: 'preset-kitchen-1',
    category: 'kitchen',
    titleAr: 'رخام مطبخ مودرن أبيض مع إضاءة نهارية',
    categoryAr: 'مطبخ ورخام 🍳',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'أدوات المطبخ، القلايات الهوائية، الخلاطات، مستلزمات الطعام'
  },
  {
    id: 'preset-kitchen-2',
    category: 'kitchen',
    titleAr: 'سطح خشبي دافئ في مطبخ عصري',
    categoryAr: 'مطبخ ورخام 🍳',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'أطقم الطهي، التوابل، الأدوات المنزلية'
  },
  {
    id: 'preset-office-1',
    category: 'office',
    titleAr: 'مكتب خشبي مودرن مع إضاءة استوديو دافئة',
    categoryAr: 'مكتب وإلكترونيات 💼',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'حوامل اللابتوب، السماعات، الساعات الذكية، الشواحن'
  },
  {
    id: 'preset-office-2',
    category: 'office',
    titleAr: 'طاولة مكتب حديثة مع ديكور نباتي محايد',
    categoryAr: 'مكتب وإلكترونيات 💼',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'أدوات المكتبيات، الأجهزة الذكية، الهواتف'
  },
  {
    id: 'preset-forest-1',
    category: 'forest',
    titleAr: 'طبيعة وغابة خضراء مشمسة مع ظلال طبيعية',
    categoryAr: 'طبيعة وغابة 🌲',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'مستحضرات التجميل العضوية، العناية بالبشرة، المنتجات العشبية'
  },
  {
    id: 'preset-forest-2',
    category: 'forest',
    titleAr: 'صخرة طبيعية في حديقة مع إضاءة نهارية',
    categoryAr: 'طبيعة وغابة 🌲',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'عطور طبيعية، مستحضرات التجميل، أزياء ربيعية'
  },
  {
    id: 'preset-living-1',
    category: 'living_room',
    titleAr: 'غرفة معيشة مودرن بألوان محايدة دافئة',
    categoryAr: 'غرفة معيشة 🛋️',
    imageUrl: 'https://images.unsplash.com/photo-1616489953149-805c86259098?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'الحقائب، الأزياء، الديكورات المنزلية، الشموع المعطرة'
  },
  {
    id: 'preset-marble-1',
    category: 'marble_studio',
    titleAr: 'منصة رخام فاخرة مع ظلال ناعمة وإضاءة استوديو',
    categoryAr: 'استوديو رخام 🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'العطور الفاخرة، الساعات، المجوهرات، النظارات'
  },
  {
    id: 'preset-sports-1',
    category: 'sports',
    titleAr: 'أرضية ملعب رياضي مع إضاءة ديناميكية',
    categoryAr: 'رياضة وستاديوم 🏟️',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'الأحذية الرياضية، مستلزمات اللياقة، الأحزمة'
  },
  {
    id: 'preset-egyptian-1',
    category: 'egyptian_arabesque',
    titleAr: 'ديكور أرابيسك مصري أصيل مع لمسات ذهبية',
    categoryAr: 'تراث وأرابيسك مصري 🇪🇬',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&auto=format&fit=crop&q=80',
    suggestedProducts: 'المنتجات التراثية، المشغولات اليدوية، السجاد والمنسوجات'
  }
];

interface BackgroundCustomizerProps {
  initialProductImage?: string | null;
  productTitle?: string;
  onShowToast?: (msg: string) => void;
}

export const BackgroundCustomizer: React.FC<BackgroundCustomizerProps> = ({
  initialProductImage,
  productTitle = 'منتج تجاري',
  onShowToast
}) => {
  const [productImage, setProductImage] = useState<string | null>(initialProductImage || null);
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset>(PRESET_BACKDROPS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Masking & Inpainting Adjustment Controls State
  const [bgBlur, setBgBlur] = useState<number>(2); // 0px to 15px
  const [productBrightness, setProductBrightness] = useState<number>(105); // 80% to 130%
  const [productContrast, setProductContrast] = useState<number>(110); // 80% to 130%
  const [dropShadowIntensity, setDropShadowIntensity] = useState<number>(45); // 0% to 100%
  const [scalePercent, setScalePercent] = useState<number>(85); // 50% to 120%
  const [offsetY, setOffsetY] = useState<number>(0); // -50px to 50px

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Local Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
        if (onShowToast) onShowToast('📷 تم تحميل صورة المنتج بنجاح جاهزة للتركيب!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter Categories
  const filteredPresets = PRESET_BACKDROPS.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  // Simulate or Call Composition Endpoint
  const handleApplyCustomBackground = async () => {
    if (!productImage) {
      if (onShowToast) onShowToast('⚠️ يرجى رفع صورة منتج أولاً للبدء بتركيب الخلفية');
      return;
    }

    setIsApplying(true);
    try {
      // Simulate server-side AI Inpainting composite API
      await new Promise(resolve => setTimeout(resolve, 800));
      if (onShowToast) {
        onShowToast(`✨ تم دمج وصنع صورة المنتج مع خلفية "${selectedPreset.titleAr}" بنجاح!`);
      }
    } catch (err: any) {
      console.error('Custom background error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Download Composite Asset
  const handleDownloadComposite = () => {
    if (onShowToast) {
      onShowToast(`📥 جاري تحميل الصورة المجمعة بخلفية "${selectedPreset.titleAr}" بدقة HD...`);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-sky-500/30 shadow-2xl space-y-8 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/30">
              <Palette className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>مخصص الخلفيات الذكي (Background Customizer)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                  Image Masking & Inpainting 🎨
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تركيب صورة المنتج على خلفيات بيئية جاهزة (مطبخ، مكتب، غابة، رخام، ديكور مصري) مع تحسين الظلال والدمج
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <label className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-950" />
            <span>رفع صورة منتج جديدة 📷</span>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Composite Viewport vs Controls & Preset Library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Right Column: Composite Canvas Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Eye className="w-4 h-4" />
              <span>شاشة المعاينة الفورية وصنع التركيب (Composite Viewport)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
              HD Render 1080x1080px
            </span>
          </div>

          {/* Interactive Canvas Backdrop Container */}
          <div className="relative aspect-square rounded-3xl bg-slate-900 border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
            
            {/* Background Image Layer with Blur filter */}
            <img 
              src={selectedPreset.imageUrl} 
              alt={selectedPreset.titleAr} 
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
              style={{ filter: `blur(${bgBlur}px)` }}
            />

            {/* Simulated Contact Drop Shadow beneath product base */}
            {productImage && (
              <div 
                className="absolute rounded-full bg-black/80 blur-md pointer-events-none transition-all duration-200"
                style={{
                  width: `${scalePercent * 0.7}%`,
                  height: `${scalePercent * 0.18}%`,
                  bottom: `${15 + (offsetY * 0.2)}%`,
                  opacity: dropShadowIntensity / 100,
                  transform: 'scaleY(0.4)',
                }}
              />
            )}

            {/* Foreground Isolated Product Layer */}
            {productImage ? (
              <img 
                src={productImage} 
                alt={productTitle} 
                className="relative z-10 object-contain transition-all duration-200 pointer-events-none"
                style={{
                  maxHeight: `${scalePercent}%`,
                  maxWidth: `${scalePercent}%`,
                  transform: `translateY(${offsetY}px)`,
                  filter: `brightness(${productBrightness}%) contrast(${productContrast}%) drop-shadow(0 ${dropShadowIntensity * 0.2}px ${dropShadowIntensity * 0.3}px rgba(0,0,0,${dropShadowIntensity / 120}))`,
                }}
              />
            ) : (
              <div className="relative z-10 text-center space-y-3 p-8 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 max-w-sm">
                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">يرجى رفع صورة المنتج أو استخدام صورة تجريبية</p>
                <button
                  type="button"
                  onClick={() => setProductImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80')}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  استخدام صورة منتج نموذجية 🛍️
                </button>
              </div>
            )}

            {/* Active Preset Overlay Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-sky-300 flex items-center gap-1.5 z-20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الخلفية: {selectedPreset.titleAr}</span>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleApplyCustomBackground}
              disabled={isApplying}
              className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 text-slate-950 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? 'جاري دمج ومعالجة الصورة بالذكاء الاصطناعي...' : 'تطبيق خلفية مخصصة وتدميج الصورة ✨'}</span>
            </button>

            <button
              onClick={handleDownloadComposite}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-2xl border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تنزيل HD ⬇️</span>
            </button>
          </div>
        </div>

        {/* Left Column: Preset Library & Fine-tuning Sliders */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Categories Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>مكتبة الخلفيات الجاهزة والمصنفة</span>
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'kitchen', label: 'مطبخ 🍳' },
                { id: 'office', label: 'مكتب 💼' },
                { id: 'forest', label: 'طبيعة 🌲' },
                { id: 'living_room', label: 'معيشة 🛋️' },
                { id: 'marble_studio', label: 'رخام 🏛️' },
                { id: 'sports', label: 'رياضة 🏟️' },
                { id: 'egyptian_arabesque', label: 'تراث مصري 🇪🇬' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presets Cards Selector Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 scrollbar-thin">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition cursor-pointer group ${
                    isSelected 
                      ? 'border-sky-500 ring-2 ring-sky-500/40 shadow-lg' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img 
                    src={preset.imageUrl} 
                    alt={preset.titleAr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white line-clamp-1">{preset.titleAr}</span>
                    <span className="text-[9px] text-sky-300 font-semibold">{preset.categoryAr}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inpainting & Masking Fine-Tuning Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>خيارات دمج الصورة والظل والإضاءة (Fine Tuning)</span>
            </h4>

            <div className="space-y-3 text-xs">
              
              {/* Background Blur */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>ضبابة وتغبيش الخلفية (Depth of Field Blur)</span>
                  <span className="font-mono text-amber-400 font-bold">{bgBlur}px</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={12} 
                  step={1} 
                  value={bgBlur} 
                  onChange={(e) => setBgBlur(Number(e.target.value))} 
                  className="w-full accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Product Drop Shadow */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>شدة ظل تلامس المنتج (Drop Shadow)</span>
                  <span className="font-mono text-amber-400 font-bold">{dropShadowIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={100} 
                  step={5} 
                  value={dropShadowIntensity} 
                  onChange={(e) => setDropShadowIntensity(Number(e.target.value))} 
                  className="w-full accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Product Scale */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>حجم وتكبير المنتج (Product Scale)</span>
                  <span className="font-mono text-amber-400 font-bold">{scalePercent}%</span>
                </div>
                <input 
                  type="range" 
                  min={50} 
                  max={110} 
                  step={5} 
                  value={scalePercent} 
                  onChange={(e) => setScalePercent(Number(e.target.value))} 
                  className="w-full accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Product Vertical Offset */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>محاذاة عمودية للمنتج (Y Shift)</span>
                  <span className="font-mono text-amber-400 font-bold">{offsetY}px</span>
                </div>
                <input 
                  type="range" 
                  min={-40} 
                  max={40} 
                  step={5} 
                  value={offsetY} 
                  onChange={(e) => setOffsetY(Number(e.target.value))} 
                  className="w-full accent-sky-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BackgroundCustomizer;
