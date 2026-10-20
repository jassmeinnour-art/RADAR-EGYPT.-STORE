import { 
  DecorativeBackgroundId, 
  ProductAngleType, 
  PlatformAspectRatio, 
  ProductFeatureCallout,
  SocialMediaFrameId,
  SocialMediaFrameConfig
} from '../types';

export interface StudioBackgroundPreset {
  id: DecorativeBackgroundId;
  name: string;
  nameAr?: string;
  category: 'ecommerce_compliance' | 'luxury_studio' | 'lifestyle_home' | 'social_creative';
  description: string;
  bgCss: string;
  badge: string;
  isCompliantWithAmazon: boolean;
  shadowColor: string;
  previewGradient: string;
}

export interface AnglePresetConfig {
  id: ProductAngleType;
  title: string;
  subtitle: string;
  icon: string;
  rotationY: number;
  rotationX: number;
  rotationZ: number;
  zoomScale: number;
  panX: number;
  panY: number;
  shadowOffsetY: number;
  shadowBlur: number;
  recommendedAspect: PlatformAspectRatio;
  bestFor: string;
}

export interface PlatformRatioConfig {
  id: PlatformAspectRatio;
  name: string;
  pixelDimensions: string;
  aspectClass: string;
  ratioValue: number; // width / height
  platforms: string[];
  recommendedBadge: string;
}

export const PLATFORM_ASPECT_RATIOS: PlatformRatioConfig[] = [
  {
    id: '1:1',
    name: 'مربع متساوي (1:1 Square)',
    pixelDimensions: '2000 × 2000 px',
    aspectClass: 'aspect-square',
    ratioValue: 1,
    platforms: ['أمازون مصر', 'نون مصر', 'جوميا', 'إنستجرام بوست', 'فيسبوك'],
    recommendedBadge: 'الأساسي للمنصات (معتمد)',
  },
  {
    id: '9:16',
    name: 'عمودي ستوري وريلز (9:16 Vertical)',
    pixelDimensions: '1080 × 1920 px',
    aspectClass: 'aspect-[9/16]',
    ratioValue: 9 / 16,
    platforms: ['تيك توك شوب', 'إنستجرام ريلز', 'ستوري واتساب', 'سناب شات'],
    recommendedBadge: 'الأفضل للسوشيال وتيك توك',
  },
  {
    id: '4:5',
    name: 'عمودي فييد (4:5 Portrait)',
    pixelDimensions: '1080 × 1350 px',
    aspectClass: 'aspect-[4/5]',
    ratioValue: 4 / 5,
    platforms: ['إنستجرام فييد', 'إعلانات فيسبوك موبايل'],
    recommendedBadge: 'أعلى نسبة تفاعل',
  },
  {
    id: '16:9',
    name: 'أفقي عريض (16:9 Landscape)',
    pixelDimensions: '1920 × 1080 px',
    aspectClass: 'aspect-[16/9]',
    ratioValue: 16 / 9,
    platforms: ['بانر المتجر الخاص (سلة/زد)', 'يوتيوب', 'إعلانات الويب'],
    recommendedBadge: 'بانر المتاجر والويب',
  },
  {
    id: '4:3',
    name: 'كتالوج قياسي (4:3 Standard)',
    pixelDimensions: '1600 × 1200 px',
    aspectClass: 'aspect-[4/3]',
    ratioValue: 4 / 3,
    platforms: ['كتالوج الواتساب التجاري', 'معارض المنتجات'],
    recommendedBadge: 'كتالوج الواتساب',
  },
];

export const ANGLE_PRESETS: AnglePresetConfig[] = [
  {
    id: 'front_hero',
    title: 'منظور أمامي رئيسي (Front Hero 0°)',
    subtitle: 'اللقطة القياسية المعتمدة لعرض واجهة المنتج الرئيسية',
    icon: '🎯',
    rotationY: 0,
    rotationX: 0,
    rotationZ: 0,
    zoomScale: 1.0,
    panX: 0,
    panY: 0,
    shadowOffsetY: 24,
    shadowBlur: 20,
    recommendedAspect: '1:1',
    bestFor: 'الصورة الرئيسية على أمازون ونون وجوميا'
  },
  {
    id: 'isometric_3d',
    title: 'منظور ثلاثي الأبعاد مائل (3D Isometric 45°)',
    subtitle: 'إبراز عمق المنتج وأبعاده مع زاوية منظور مجسمة وواقعية',
    icon: '📐',
    rotationY: 28,
    rotationX: 12,
    rotationZ: -3,
    zoomScale: 1.05,
    panX: -4,
    panY: 6,
    shadowOffsetY: 30,
    shadowBlur: 26,
    recommendedAspect: '1:1',
    bestFor: 'الصورة الثانية في الكتالوج لإظهار الحجم والعمق'
  },
  {
    id: 'top_down_flatlay',
    title: 'منظور علوي مسطح (Top-Down Flat Lay)',
    subtitle: 'استعراض المنتج ومحتويات العلبة والملحقات من الأعلى',
    icon: '📸',
    rotationY: 0,
    rotationX: 42,
    rotationZ: 0,
    zoomScale: 0.95,
    panX: 0,
    panY: -10,
    shadowOffsetY: 12,
    shadowBlur: 16,
    recommendedAspect: '1:1',
    bestFor: 'كتالوج الملحقات والعلبة والمتاجر الخاصة'
  },
  {
    id: 'macro_details',
    title: 'زاوية ماكرو مقربة للتفاصيل (Macro Details 2x)',
    subtitle: 'تركيز فائق على خامات التصنيع، الأزرار، واللوجو وشاشات العرض',
    icon: '🔍',
    rotationY: -14,
    rotationX: 6,
    rotationZ: 4,
    zoomScale: 1.65,
    panX: 15,
    panY: -12,
    shadowOffsetY: 35,
    shadowBlur: 30,
    recommendedAspect: '4:5',
    bestFor: 'إثبات جودة الخامات والتصنيع الفاخر'
  },
  {
    id: 'side_ports',
    title: 'منظور جانبي والمنافذ (Side & Ports Profile)',
    subtitle: 'استعراض النحافة، منافذ الشحن Type-C، والوصلات الجانبية',
    icon: '🔌',
    rotationY: -40,
    rotationX: 8,
    rotationZ: 0,
    zoomScale: 1.1,
    panX: 8,
    panY: 0,
    shadowOffsetY: 26,
    shadowBlur: 22,
    recommendedAspect: '1:1',
    bestFor: 'شرح المواصفات التقنية ومنافذ التوصيل'
  },
  {
    id: 'pedestal_floating',
    title: 'منصة العرض العائمة (Floating Pedestal 3D)',
    subtitle: 'رفع المنتج فوق قاعدة عرض فاخرة مع انعكاس وإضاءة درامية',
    icon: '🏛️',
    rotationY: 18,
    rotationX: -6,
    rotationZ: -2,
    zoomScale: 1.0,
    panX: 0,
    panY: -18,
    shadowOffsetY: 48,
    shadowBlur: 35,
    recommendedAspect: '9:16',
    bestFor: 'إعلانات السوشيال ميديا وتيك توك والبانرات الفاخرة'
  },
];

export const DECORATIVE_BACKGROUNDS: StudioBackgroundPreset[] = [
  {
    id: 'pure_white',
    name: 'أبيض نقي 100% (Amazon / Noon Approved)',
    category: 'ecommerce_compliance',
    description: 'الخلفية البيضاء النقية القياسية الإلزامية للصورة الرئيسية على أمازون ونون (RGB 255, 255, 255)',
    bgCss: '#ffffff',
    badge: 'معتمد 100% لأمازون ونون',
    isCompliantWithAmazon: true,
    shadowColor: 'rgba(0,0,0,0.08)',
    previewGradient: 'from-white to-slate-100'
  },
  {
    id: 'luxury_marble',
    name: 'رخام فاخر وظلال نافذة ناعمة (Luxury White Marble)',
    category: 'luxury_studio',
    description: 'أرضية رخامية إيطالية بيضاء مع عروق رمادية فاخرة وظلال طبيعية ناعمة تعطي طابع الفخامة',
    bgCss: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
    badge: 'استوديو رخامي فاخر',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    previewGradient: 'from-slate-100 via-slate-200 to-slate-300'
  },
  {
    id: 'studio_pedestal',
    name: 'منصة عرض خرسانية مودرن (Modern Studio Pedestal)',
    category: 'luxury_studio',
    description: 'قاعدة عرض هندسية ثلاثية الأبعاد بيديستال مع إضاءة استوديو دائرية مركزة',
    bgCss: 'radial-gradient(circle at 50% 40%, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)',
    badge: 'قاعدة عرض احترافية',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(30, 41, 59, 0.22)',
    previewGradient: 'from-slate-200 to-indigo-100'
  },
  {
    id: 'nordic_wood',
    name: 'خشب نورديك طبيعي دافئ (Warm Nordic Wood)',
    category: 'lifestyle_home',
    description: 'سطح خشب البلوط الطبيعي الدافئ مع إضاءة شمسية مائلة تضفي الدفء والأناقة',
    bgCss: 'radial-gradient(circle at 60% 30%, #f0f9ff 0%, #e0f2fe 40%, #bae6fd 85%, #7dd3fc 100%)',
    badge: 'طابع طبيعي دافئ',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(120, 53, 15, 0.25)',
    previewGradient: 'from-sky-100 to-sky-200'
  },
  {
    id: 'modern_desk',
    name: 'مكتب عمل تقني مودرن (Tech Workspace Desk)',
    category: 'lifestyle_home',
    description: 'طاولة عمل تكنولوجية عصرية مع تدرجات رصاصية ناعمة مناسبة للإلكترونيات والأجهزة',
    bgCss: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
    badge: 'مكتب تقني مودرن',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(51, 65, 85, 0.22)',
    previewGradient: 'from-slate-200 to-slate-400'
  },
  {
    id: 'cyber_neon',
    name: 'استوديو نيون مستقبلي (Cyberpunk / Sleek Tech Glow)',
    category: 'social_creative',
    description: 'إضاءة نيون ناعمة بدرجات الأزرق والبنفسجي لإبراز المنتجات بقوة على تيك توك وسوشيال ميديا',
    bgCss: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
    badge: 'إعلاني للسوشيال وتيك توك 🔥',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(99, 102, 241, 0.45)',
    previewGradient: 'from-indigo-950 via-purple-900 to-slate-950'
  },
  {
    id: 'pastel_minimal',
    name: 'استوديو باستيل ناعم (Minimalist Pastel Studio)',
    category: 'social_creative',
    description: 'تدرجات لونية باستيل راقية وهادئة تعطي إحساساً بالنظافة والجاذبية للمتاجر الخاصة',
    bgCss: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
    badge: 'باستيل هادئ أنيق',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(124, 58, 237, 0.15)',
    previewGradient: 'from-blue-100 via-purple-100 to-pink-100'
  },
  {
    id: 'cozy_home',
    name: 'ديكور منزلي وصالة راقية (Cozy Lifestyle Studio)',
    category: 'lifestyle_home',
    description: 'أجواء منزلية دافئة وواقعية تعطي انطباعاً ملموساً للمشتري أثناء الاستخدام اليومي',
    bgCss: 'radial-gradient(circle at 50% 30%, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    badge: 'لايف ستايل واقعي',
    isCompliantWithAmazon: false,
    shadowColor: 'rgba(68, 64, 60, 0.2)',
    previewGradient: 'from-stone-100 to-stone-300'
  },
  {
    id: 'transparent_grid',
    name: 'خلفية شفافة مفرغة (Transparent PNG Alpha)',
    category: 'ecommerce_compliance',
    description: 'خلفية مفرغة بالكامل جاهزة للدمج في أي برنامج تصميم خارجي كـ Photoshop أو Canva',
    bgCss: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
    badge: 'تصدير شفاف PNG',
    isCompliantWithAmazon: false,
    shadowColor: 'transparent',
    previewGradient: 'from-slate-100 to-slate-200'
  },
];

export const DEFAULT_FEATURE_CALLOUTS: ProductFeatureCallout[] = [
  {
    id: 'callout-1',
    title: 'خامات ألمنيوم ومفصلات متينة 🛡️',
    xPercent: 28,
    yPercent: 32,
    direction: 'right'
  },
  {
    id: 'callout-2',
    title: 'منفذ شحن فائق السرعة Type-C ⚡',
    xPercent: 72,
    yPercent: 68,
    direction: 'left'
  },
  {
    id: 'callout-3',
    title: 'عزل ضوضاء هجين ANC 40dB 🎧',
    xPercent: 75,
    yPercent: 36,
    direction: 'left'
  },
];

export const SOCIAL_MEDIA_FRAMES: SocialMediaFrameConfig[] = [
  {
    id: 'none',
    name: 'بدون إطار (صورة فقط)',
    badge: 'صورة نقية',
    description: 'عرض صورة المنتج والخلفية فقط بدون أي إطار خارجي أو بطاقة تسعير',
    defaultBadgeText: '',
    defaultTagline: '',
    themeColor: 'transparent',
    accentColor: 'transparent',
    borderStyle: 'border-transparent',
    headerBg: 'transparent',
    footerBg: 'transparent',
    previewBg: 'from-slate-100 to-slate-200',
    icon: '🚫'
  },
  {
    id: 'modern_dark_social',
    name: 'قالب السوشيال الحديث الفاخر (Reels / TikTok)',
    badge: 'الأكثر طلباً وتفاعلاً 🔥',
    description: 'إطار كربوني داكن مع شريط سفلي فاخر يعرض اسم المنتج، وسعر البيع البارز بالأخضر، مع شارة العرض المعتمد',
    defaultBadgeText: '🔥 أقوى سعر بيع متاح بمصر 🇪🇬',
    defaultTagline: 'اطلب الآن • شحن سريع حتى باب المنزل • الدفع عند الاستلام 📦',
    themeColor: '#0f172a',
    accentColor: '#10b981',
    borderStyle: 'border-slate-800',
    headerBg: 'bg-slate-950/95',
    footerBg: 'bg-slate-950/95',
    previewBg: 'from-slate-900 to-slate-950',
    icon: '📱'
  },
  {
    id: 'hot_deal_flash_sale',
    name: 'قالب العرض الناري والخصم الحصري (Flash Sale)',
    badge: 'خصومات حارقة 💥',
    description: 'إطار ترويجي بألوان نارية جاذبة يعرض نسبة الخصم بالأحمر وسعر التوفير واسم المنتج بحجم بارز',
    defaultBadgeText: '⚡ تخفيض حصري لفترة محدودة ⏳',
    defaultTagline: 'سعر العرض ساري حتى نفاد الكمية • الحق الحجز الآن! 🔥',
    themeColor: '#be123c',
    accentColor: '#38bdf8',
    borderStyle: 'border-rose-600',
    headerBg: 'bg-gradient-to-r from-rose-700 via-rose-600 to-sky-600',
    footerBg: 'bg-rose-950/95',
    previewBg: 'from-rose-600 to-sky-500',
    icon: '🔥'
  },
  {
    id: 'verified_merchant_gold',
    name: 'قالب المتجر المعتمد والضمان الذهبي (Trust & Warranty)',
    badge: 'منتج أصلي 100% 🛡️',
    description: 'إطار أنيق بلون كحلي ملكي ولمسات ذهبية موثق بضمان الوكيل وشحن سريع ومعاينة قبل الاستلام',
    defaultBadgeText: '🛡️ منتج أصلي 100% معتمد • ضمان الوكيل الرسمي',
    defaultTagline: 'متجر التاجر المصري المعتمد • فحص ومعاينة قبل الاستلام ✨',
    themeColor: '#1e3a8a',
    accentColor: '#0ea5e9',
    borderStyle: 'border-sky-500/80',
    headerBg: 'bg-slate-900',
    footerBg: 'bg-slate-900',
    previewBg: 'from-blue-950 via-indigo-950 to-sky-900',
    icon: '👑'
  },
  {
    id: 'clean_minimal_story',
    name: 'قالب ستوري مينيمل نقي (Clean Minimal Story)',
    badge: 'تصميم نقي وعصري 🤍',
    description: 'إطار أبيض ثلجي ناعم بحواف مستديرة وبطاقة تسعير عائمة خفيفة مناسبة لقصص إنستجرام وواتساب',
    defaultBadgeText: '✨ تشكيلة الموسم الحصرية',
    defaultTagline: 'متوفر الآن للشراء الفوري • اسحب للأعلى للطلب 🛒',
    themeColor: '#ffffff',
    accentColor: '#6366f1',
    borderStyle: 'border-slate-200',
    headerBg: 'bg-white/95',
    footerBg: 'bg-white/95',
    previewBg: 'from-slate-100 to-indigo-50',
    icon: '✨'
  },
  {
    id: 'black_friday_neon',
    name: 'قالب عروض التوفير والجمعة البيضاء (Black Friday Mega)',
    badge: 'تخفيضات كبرى 🏷️',
    description: 'إطار نيون مستقبلي جذاب مع شارات التخفيض وفرق الأسعار التنافسية',
    defaultBadgeText: '🖤 عروض الجمعة البيضاء الكبرى • MEGA SALE',
    defaultTagline: 'أكبر خصومات السنة • وفر أكثر مع عروضنا الخاصة ⚡',
    themeColor: '#000000',
    accentColor: '#38bdf8',
    borderStyle: 'border-cyan-500',
    headerBg: 'bg-black',
    footerBg: 'bg-black',
    previewBg: 'from-black via-slate-900 to-cyan-950',
    icon: '🏷️'
  },
  {
    id: 'egypt_flag_deal',
    name: 'قالب أقوى سعر بمصر والشحن للمحافظات 🇪🇬',
    badge: 'توصيل لكل مصر 🚚',
    description: 'إطار يحمل الهوية المصرية مع إبراز خدمة التوصيل السريع لجميع المحافظات والدفع عند المعاينة',
    defaultBadgeText: '🇪🇬 السعر الأفضل في السوق المصري • بدون وسيط',
    defaultTagline: 'توصيل سريع للقاهرة والجيزة وجميع المحافظات 🚚',
    themeColor: '#831843',
    accentColor: '#10b981',
    borderStyle: 'border-emerald-600',
    headerBg: 'bg-slate-900',
    footerBg: 'bg-slate-900',
    previewBg: 'from-slate-900 via-emerald-950 to-slate-950',
    icon: '🇪🇬'
  }
];
