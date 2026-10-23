import React, { useState, useRef, useEffect } from 'react';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  Download, 
  Save, 
  FolderOpen, 
  Sparkles, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Palette, 
  Type, 
  Tag, 
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';

interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  icon: string;
  description: string;
}

const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: 'ig_story', name: 'قصة إنستغرام (Instagram Story)', platform: 'Instagram', width: 1080, height: 1920, icon: '📱', description: 'أبعاد عمودية مثالية للقصص والإعلانات الممولة' },
  { id: 'fb_feed', name: 'منشور فيسبوك / إعلان (Facebook Feed)', platform: 'Facebook', width: 1200, height: 630, icon: '🌐', description: 'أبعاد أفقية واسعة مخصصة للمنشورات والروابط التسويقية' },
  { id: 'ig_square', name: 'مربع إنستغرام (Instagram Square)', platform: 'Instagram', width: 1080, height: 1080, icon: '🟧', description: 'المربع الكلاسيكي لشبكة منشورات المتجر' },
  { id: 'tiktok_banner', name: 'بانر تيك توك / ريلز (TikTok / Reels)', platform: 'TikTok', width: 1080, height: 1920, icon: '🎬', description: 'أبعاد عمودية عالية الجودة للفيديوهات والمنتجات الرائجة' },
  { id: 'amazon_square', name: 'قائمة أمازون ونون (Marketplace Listing)', platform: 'Amazon / Noon', width: 2000, height: 2000, icon: '📦', description: 'دقة عالية مربعة متوافقة مع متطلبات منصات التجارة الإلكترونية' }
];

const BACKGROUND_THEMES = [
  { id: 'dark_luxury', name: 'داكن فاخر (Luxury Dark)', bg: '#090d16', accent: '#f59e0b', text: '#ffffff' },
  { id: 'clean_white', name: 'أبيض نقي (Clean Studio)', bg: '#ffffff', accent: '#1e293b', text: '#0f172a' },
  { id: 'gradient_amber', name: 'تدرج ذهبي دافئ (Amber Gold)', bg: 'linear-gradient(135deg, #78350f 0%, #1c1917 100%)', solid: '#292524', accent: '#fbbf24', text: '#ffffff' },
  { id: 'royal_emerald', name: 'زمردي متجر (Royal Emerald)', bg: '#064e3b', solid: '#064e3b', accent: '#34d399', text: '#ffffff' },
  { id: 'modern_indigo', name: 'نيون أزرق حديث (Cyber Neon)', bg: '#1e1b4b', solid: '#1e1b4b', accent: '#818cf8', text: '#ffffff' }
];

const BADGE_PRESETS = [
  { id: 'sale_20', label: '🔥 خصم خاص 20%' },
  { id: 'bestseller', label: '⭐ الأكثر مبيعاً في مصر' },
  { id: 'freeship', label: '🚚 شحن مجاني بالكامل' },
  { id: 'limited', label: '⏳ كمية محدودة لفترة وجيزة' },
  { id: 'original', label: '🛡️ منتج أصلي مضمون 100%' }
];

interface SavedTemplate {
  id: string;
  name: string;
  presetId: string;
  width: number;
  height: number;
  themeId: string;
  title: string;
  price: string;
  badge: string;
  imageUrl: string;
  updatedAt: string;
}

interface ProductTemplateCanvasStudioProps {
  defaultTitle?: string;
  defaultPrice?: string;
  defaultImageUrl?: string;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export function ProductTemplateCanvasStudio({
  defaultTitle = 'كرسي مكتب هيدروليك مريح داعم للفقرات',
  defaultPrice = '3450 ج.م',
  defaultImageUrl = 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
  currency = 'ج.م',
  onShowToast
}: ProductTemplateCanvasStudioProps) {
  const [selectedPreset, setSelectedPreset] = useState<PlatformPreset>(PLATFORM_PRESETS[0]);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [useCustomSize, setUseCustomSize] = useState(false);

  const [theme, setTheme] = useState(BACKGROUND_THEMES[0]);
  const [productTitle, setProductTitle] = useState(defaultTitle);
  const [productPrice, setProductPrice] = useState(defaultPrice);
  const [selectedBadge, setSelectedBadge] = useState(BADGE_PRESETS[0].label);
  const [productImageUrl, setProductImageUrl] = useState(defaultImageUrl);
  const [templateName, setTemplateName] = useState('قالب إعلان انستغرام الجديد');

  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('radar_merchant_saved_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load saved templates:', e);
    }
    return [
      {
        id: 'tmpl_1',
        name: 'قالب قصة انستغرام الافتراضي',
        presetId: 'ig_story',
        width: 1080,
        height: 1920,
        themeId: 'dark_luxury',
        title: defaultTitle,
        price: defaultPrice,
        badge: '🔥 خصم خاص 20%',
        imageUrl: defaultImageUrl,
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Width & height calculation
  const canvasWidth = useCustomSize ? customWidth : selectedPreset.width;
  const canvasHeight = useCustomSize ? customHeight : selectedPreset.height;

  // Save templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('radar_merchant_saved_templates', JSON.stringify(savedTemplates));
    } catch (e) {
      console.warn('Could not save templates:', e);
    }
  }, [savedTemplates]);

  // Draw on Canvas using Canvas API
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Draw Background
    if (theme.id === 'gradient_amber') {
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = theme.solid || theme.bg;
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Decorative grid pattern or glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < canvasWidth; i += 60) {
      ctx.fillRect(i, 0, 1, canvasHeight);
    }

    // Load Product Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = productImageUrl;
    img.onload = () => {
      // Draw product image card box in center
      const padding = canvasWidth * 0.08;
      const boxWidth = canvasWidth - padding * 2;
      const boxHeight = canvasHeight * 0.55;
      const boxX = padding;
      const boxY = canvasHeight * 0.18;

      // Card shadow & background
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = theme.id === 'clean_white' ? '#f8fafc' : '#111827';
      ctx.roundRect ? ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 30) : ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fill();
      ctx.restore();

      // Draw image inside card with aspect fit
      const imgAspect = img.width / img.height;
      let drawW = boxWidth - 60;
      let drawH = drawW / imgAspect;
      if (drawH > boxHeight - 60) {
        drawH = boxHeight - 60;
        drawW = drawH * imgAspect;
      }
      const drawX = boxX + (boxWidth - drawW) / 2;
      const drawY = boxY + (boxHeight - drawH) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(drawX, drawY, drawW, drawH, 20) : null;
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Draw Top Badge
      ctx.fillStyle = theme.accent;
      ctx.font = `900 ${canvasWidth * 0.035}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(selectedBadge, canvasWidth / 2, boxY - 35);

      // Draw Product Title
      ctx.fillStyle = theme.text;
      ctx.font = `bold ${canvasWidth * 0.038}px Cairo, sans-serif`;
      ctx.textAlign = 'center';

      // Word wrap title
      const maxTextWidth = canvasWidth - 120;
      const words = productTitle.split(' ');
      let line = '';
      let testLine = '';
      let lines = [];
      for (let n = 0; n < words.length; n++) {
        testLine += words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
          testLine = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      // Keep max 2 lines
      if (lines.length > 2) lines = lines.slice(0, 2);

      let textStartY = boxY + boxHeight + 70;
      lines.forEach((l, idx) => {
        ctx.fillText(l.trim(), canvasWidth / 2, textStartY + idx * 50);
      });

      // Draw Price Tag Box
      const priceBoxY = textStartY + lines.length * 50 + 30;
      const priceBoxW = canvasWidth * 0.55;
      const priceBoxH = 80;
      const priceBoxX = (canvasWidth - priceBoxW) / 2;

      ctx.save();
      ctx.fillStyle = theme.accent;
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = 20;
      ctx.roundRect ? ctx.roundRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH, 20) : ctx.fillRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#0f172a';
      ctx.font = `900 ${canvasWidth * 0.05}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(productPrice, canvasWidth / 2, priceBoxY + 54);

      // Draw Footer Store Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = `bold ${canvasWidth * 0.025}px Cairo, sans-serif`;
      ctx.fillText('⚡ تم الإنشاء بواسطة منصة رادار التاجر (Radar Merchant Studio)', canvasWidth / 2, canvasHeight - 40);
    };
  }, [canvasWidth, canvasHeight, theme, productTitle, productPrice, selectedBadge, productImageUrl]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `product_template_${selectedPreset.id}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (onShowToast) onShowToast('تم تحميل صورة القالب بجودة عالية بنجاح!');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('الرجاء إدخال اسم القالب.');
      return;
    }

    const newTmpl: SavedTemplate = {
      id: 'tmpl_' + Date.now(),
      name: templateName.trim(),
      presetId: selectedPreset.id,
      width: canvasWidth,
      height: canvasHeight,
      themeId: theme.id,
      title: productTitle,
      price: productPrice,
      badge: selectedBadge,
      imageUrl: productImageUrl,
      updatedAt: new Date().toISOString()
    };

    setSavedTemplates([newTmpl, ...savedTemplates]);
    if (onShowToast) onShowToast(`تم حفظ القالب "${newTmpl.name}" بنجاح لاستخدامه لاحقاً!`);
  };

  const handleLoadTemplate = (tmpl: SavedTemplate) => {
    setTemplateName(tmpl.name);
    setProductTitle(tmpl.title);
    setProductPrice(tmpl.price);
    setSelectedBadge(tmpl.badge);
    setProductImageUrl(tmpl.imageUrl);
    const foundTheme = BACKGROUND_THEMES.find(t => t.id === tmpl.themeId);
    if (foundTheme) setTheme(foundTheme);
    const foundPreset = PLATFORM_PRESETS.find(p => p.id === tmpl.presetId);
    if (foundPreset) {
      setSelectedPreset(foundPreset);
      setUseCustomSize(false);
    } else {
      setUseCustomSize(true);
      setCustomWidth(tmpl.width);
      setCustomHeight(tmpl.height);
    }
    if (onShowToast) onShowToast(`تم استرجاع القالب "${tmpl.name}" بنجاح.`);
  };

  const handleDeleteTemplate = (id: string) => {
    setSavedTemplates(savedTemplates.filter(t => t.id !== id));
    if (onShowToast) onShowToast('تم حذف القالب المحفوظ.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProductImageUrl(event.target.result as string);
        if (onShowToast) onShowToast('تم رفع صورة المنتج بنجاح للقالب.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Layout className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">استوديو قوالب منصات التسوق (Canvas API Auto-Composer)</h2>
            <p className="text-xs text-slate-400">تصميم وتركيب صور المنتجات تلقائياً بأبعاد مخصصة لقصص إنستغرام، فيسبوك، وتيك توك مع حفظ القوالب</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تحميل الصورة النهائية (PNG)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Controls & Settings */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Platform Presets */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>اختر المنصة والأبعاد المستهدفة</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PLATFORM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setUseCustomSize(false);
                  }}
                  className={`p-3 rounded-xl border text-right transition flex flex-col gap-1 ${
                    !useCustomSize && selectedPreset.id === preset.id
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{preset.name}</span>
                    <span className="text-sm">{preset.icon}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{preset.width} × {preset.height} px</span>
                </button>
              ))}
            </div>

            {/* Custom Size Toggle */}
            <div className="pt-2">
              <button
                onClick={() => setUseCustomSize(!useCustomSize)}
                className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1.5"
              >
                <span>{useCustomSize ? '✓ استخدام الأبعاد الجاهزة' : '⚙️ تخصيص أبعاد يدويًا (Custom Dimensions)'}</span>
              </button>

              {useCustomSize && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">العرض (px)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1080)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">الارتفاع (px)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1920)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Theme & Background */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>نمط وخلفية التصميم</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BACKGROUND_THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition text-right ${
                    theme.id === th.id ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Product Details & Badge */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>بيانات المنتج والشارات الترويجية</span>
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">عنوان المنتج الظاهر</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">السعر ({currency})</label>
                  <input
                    type="text"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">الشارة التسويقية</label>
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {BADGE_PRESETS.map(b => (
                      <option key={b.id} value={b.label}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">صورة المنتج (رابط أو رفع ملف)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Save Template Section */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-3">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>حفظ القالب لاستخدامه لاحقاً</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="اسم القالب (مثال: قالب إعلانات ممولة رمضان)..."
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-white"
              />
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition shrink-0 active:scale-95"
              >
                حفظ القالب
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Canvas Preview & Saved Templates */}
        <div className="lg:col-span-6 space-y-6 flex flex-col items-center">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner w-full flex flex-col items-center">
            <span className="text-xs text-slate-400 font-bold mb-3">معاينة مباشرة للتركيب التلقائي (Canvas API Preview)</span>
            <div className="relative max-h-[500px] overflow-auto border border-slate-700 rounded-xl bg-slate-900 p-2 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[450px] w-auto h-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Saved Templates List */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 w-full space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              <span>القوالب المحفوظة مسبقاً ({savedTemplates.length})</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedTemplates.map((tmpl) => (
                <div key={tmpl.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-white truncate">{tmpl.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{tmpl.width} × {tmpl.height} px</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition"
                    >
                      استخدام
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                      title="حذف القالب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
