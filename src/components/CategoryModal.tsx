import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Globe,
  Building2,
  Smartphone,
  Store,
  Boxes,
  Package,
  Truck,
  Layers,
  Tag,
  Zap,
  Star,
  Briefcase,
  ShieldCheck,
  Coins,
  Flame,
  Megaphone,
  HeartHandshake,
  Share2,
  FolderPlus,
  Palette
} from 'lucide-react';
import { ConnectedMerchantPlatform, PlatformCategoryConfig } from '../types';

// Map of available Lucide icons for categories
export const CATEGORY_ICON_MAP: Record<string, { Icon: React.ElementType; label: string }> = {
  ShoppingBag: { Icon: ShoppingBag, label: 'حقيبة تسوق' },
  Globe: { Icon: Globe, label: 'موقع إلكتروني' },
  Building2: { Icon: Building2, label: 'مبنى وسلسلة تجزئة' },
  Smartphone: { Icon: Smartphone, label: 'سوشيال وهاتف' },
  Store: { Icon: Store, label: 'متجر محلي' },
  Boxes: { Icon: Boxes, label: 'مستودعات وتوريد' },
  Package: { Icon: Package, label: 'طرود وشحنات' },
  Truck: { Icon: Truck, label: 'شحن وتوزيع' },
  Layers: { Icon: Layers, label: 'طبقات وتصنيفات' },
  Tag: { Icon: Tag, label: 'عروض وتخفيضات' },
  Zap: { Icon: Zap, label: 'مبيعات فورية' },
  Sparkles: { Icon: Sparkles, label: 'مميز وحصري' },
  Star: { Icon: Star, label: 'VIP ومعتمد' },
  Briefcase: { Icon: Briefcase, label: 'أعمال وجملة B2B' },
  ShieldCheck: { Icon: ShieldCheck, label: 'رسمي وموثوق' },
  Coins: { Icon: Coins, label: 'تقسيط ودفع آجل' },
  Flame: { Icon: Flame, label: 'الأكثر طلباً' },
  Megaphone: { Icon: Megaphone, label: 'حملات وترويج' },
  HeartHandshake: { Icon: HeartHandshake, label: 'شراكات وتوكيل' },
  Share2: { Icon: Share2, label: 'شبكات تسويق' },
};

export const getCategoryIconComponent = (iconName: string): React.ElementType => {
  return CATEGORY_ICON_MAP[iconName]?.Icon || Layers;
};

// Preset Color Themes for Categories
export const CATEGORY_COLOR_THEMES: Record<
  string,
  {
    name: string;
    headerColor: string;
    badgeBg: string;
    borderStyle: string;
    bgStyle: string;
    tagColor: string;
    swatchBg: string;
  }
> = {
  slate: {
    name: 'سليت داكن (ماركت بليس)',
    headerColor: 'text-slate-950',
    badgeBg: 'bg-slate-100/90 text-slate-900 border-slate-300/80',
    borderStyle: 'border-slate-200/70',
    bgStyle: 'bg-slate-50/25',
    tagColor: 'text-slate-800 bg-slate-100/80 border border-slate-200',
    swatchBg: 'bg-slate-600',
  },
  sky: {
    name: 'سماوي (مواقع إلكترونية)',
    headerColor: 'text-sky-950',
    badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-300/80',
    borderStyle: 'border-sky-200/70',
    bgStyle: 'bg-sky-50/25',
    tagColor: 'text-sky-800 bg-sky-100/80 border border-sky-200',
    swatchBg: 'bg-sky-500',
  },
  teal: {
    name: 'تيل مائي (سلاسل تجزئة)',
    headerColor: 'text-teal-950',
    badgeBg: 'bg-teal-100/90 text-teal-900 border-teal-300/80',
    borderStyle: 'border-teal-200/70',
    bgStyle: 'bg-teal-50/25',
    tagColor: 'text-teal-800 bg-teal-100/80 border border-teal-200',
    swatchBg: 'bg-teal-500',
  },
  purple: {
    name: 'بنفسجي (سوشيال ميديا)',
    headerColor: 'text-purple-950',
    badgeBg: 'bg-purple-100/90 text-purple-900 border-purple-300/80',
    borderStyle: 'border-purple-200/70',
    bgStyle: 'bg-purple-50/25',
    tagColor: 'text-purple-800 bg-purple-100/80 border border-purple-200',
    swatchBg: 'bg-purple-500',
  },
  emerald: {
    name: 'زمردي (جملة وتوريدات)',
    headerColor: 'text-emerald-950',
    badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80',
    borderStyle: 'border-emerald-200/70',
    bgStyle: 'bg-emerald-50/25',
    tagColor: 'text-emerald-800 bg-emerald-100/80 border border-emerald-200',
    swatchBg: 'bg-emerald-500',
  },
  indigo: {
    name: 'نيلي (توكيلات وشركاء)',
    headerColor: 'text-indigo-950',
    badgeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-300/80',
    borderStyle: 'border-indigo-200/70',
    bgStyle: 'bg-indigo-50/25',
    tagColor: 'text-indigo-800 bg-indigo-100/80 border border-indigo-200',
    swatchBg: 'bg-indigo-500',
  },
  rose: {
    name: 'وردي (عروض ومواسم خاصة)',
    headerColor: 'text-rose-950',
    badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-300/80',
    borderStyle: 'border-rose-200/70',
    bgStyle: 'bg-rose-50/25',
    tagColor: 'text-rose-800 bg-rose-100/80 border border-rose-200',
    swatchBg: 'bg-rose-500',
  },
  orange: {
    name: 'برتقالي (تقسيط ومبيعات فلاش)',
    headerColor: 'text-orange-950',
    badgeBg: 'bg-orange-100/90 text-orange-900 border-orange-300/80',
    borderStyle: 'border-orange-200/70',
    bgStyle: 'bg-orange-50/25',
    tagColor: 'text-orange-800 bg-orange-100/80 border border-orange-200',
    swatchBg: 'bg-orange-500',
  },
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialCategory?: PlatformCategoryConfig | null;
  onSave: (
    categoryData: PlatformCategoryConfig,
    assignedPlatformIds?: string[]
  ) => void;
  onDelete?: (categoryKey: string) => void;
  connectedPlatforms?: ConnectedMerchantPlatform[];
  existingCategories?: PlatformCategoryConfig[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialCategory,
  onSave,
  onDelete,
  connectedPlatforms = [],
  existingCategories = [],
}) => {
  const [title, setTitle] = useState('');
  const [englishTitle, setEnglishTitle] = useState('');
  const [iconName, setIconName] = useState('Layers');
  const [colorThemeKey, setColorThemeKey] = useState('emerald');
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when modal opens or initialCategory changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialCategory) {
        setTitle(initialCategory.title);
        setEnglishTitle(initialCategory.englishTitle || '');
        setIconName(initialCategory.iconName || 'Layers');

        // Detect matching color theme or fallback
        const matchingTheme = Object.keys(CATEGORY_COLOR_THEMES).find((k) =>
          initialCategory.badgeBg?.includes(k)
        );
        setColorThemeKey(matchingTheme || 'indigo');
        setSelectedPlatformIds([]);
      } else {
        // Create mode defaults
        setTitle('');
        setEnglishTitle('');
        setIconName('Store');
        setColorThemeKey('emerald');
        setSelectedPlatformIds([]);
      }
      setValidationError(null);
    }
  }, [isOpen, mode, initialCategory]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = CATEGORY_COLOR_THEMES[colorThemeKey] || CATEGORY_COLOR_THEMES.emerald;
  const CurrentIcon = getCategoryIconComponent(iconName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('يرجى كتابة اسم التصنيف أولاً');
      return;
    }

    // In create mode, check duplicate titles
    if (mode === 'create') {
      const isDuplicate = existingCategories.some(
        (c) => c.title.toLowerCase() === trimmedTitle.toLowerCase()
      );
      if (isDuplicate) {
        setValidationError('يوجد تصنيف آخر يحمل نفس هذا الاسم بالفعل');
        return;
      }
    }

    const key =
      mode === 'edit' && initialCategory
        ? initialCategory.key
        : `custom_cat_${Date.now()}`;

    const config: PlatformCategoryConfig = {
      key,
      title: trimmedTitle,
      englishTitle: englishTitle.trim() || undefined,
      iconName,
      headerColor: currentTheme.headerColor,
      badgeBg: currentTheme.badgeBg,
      borderStyle: currentTheme.borderStyle,
      bgStyle: currentTheme.bgStyle,
      tagColor: currentTheme.tagColor,
      isCustom: mode === 'edit' && initialCategory ? initialCategory.isCustom ?? true : true,
    };

    onSave(config, mode === 'create' ? selectedPlatformIds : undefined);
  };

  const handleTogglePlatform = (platId: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(platId) ? prev.filter((id) => id !== platId) : [...prev, platId]
    );
  };

  return (
    <div
      id="category-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="category-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              {mode === 'create' ? (
                <FolderPlus className="w-5 h-5" />
              ) : (
                <Pencil className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{mode === 'create' ? 'إنشاء تصنيف مخصص جديد' : 'تعديل التصنيف'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {mode === 'create' ? 'تصنيف مخصص' : 'تخصيص الهوية'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'create'
                  ? 'أنشئ تصنيفاً مستقلاً لتجميع قنواتك وفروعك بمرونة عالية'
                  : 'أعد تسمية التصنيف أو غيّر أيقونته ونمطه اللوني لسهولة التمييز'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/60">
          <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>معاينة مظهر التصنيف المباشر في شريط المنصات:</span>
          </div>
          <div
            className={`rounded-xl border p-2.5 flex items-center justify-between gap-3 ${currentTheme.borderStyle} ${currentTheme.bgStyle}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border flex items-center justify-center ${currentTheme.badgeBg}`}>
                <CurrentIcon className="w-4 h-4 shrink-0" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black ${currentTheme.headerColor}`}>
                    {title.trim() || 'اسم التصنيف'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${currentTheme.tagColor}`}>
                    {mode === 'create'
                      ? `${selectedPlatformIds.length} منصات محددة`
                      : 'نشط ومفعل'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight block">
                  {englishTitle.trim() || 'Category Subtitle'}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-600 font-bold">
              معاينة حية
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-right">
          {/* Category Title Input (إعادة تسمية التصنيف) */}
          <div>
            <label htmlFor="input-category-title" className="block text-xs font-bold text-slate-800 mb-1.5">
              اسم التصنيف <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-category-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="مثال: متاجر الجملة والتوريدات، منصات التقسيط، فروع المعارض..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold bg-white transition-all focus:outline-hidden ${
                validationError
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
              autoFocus
            />
            {validationError && (
              <p className="text-xs text-rose-600 font-semibold mt-1">{validationError}</p>
            )}
          </div>

          {/* English / Secondary Subtitle */}
          <div>
            <label htmlFor="input-category-english" className="block text-xs font-bold text-slate-800 mb-1.5">
              العنوان الفرعي أو الإنجليزي <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <input
              id="input-category-english"
              type="text"
              value={englishTitle}
              onChange={(e) => setEnglishTitle(e.target.value)}
              placeholder="مثال: Wholesale & Bulk Hub أو Retail Showrooms"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
            />
          </div>

          {/* Change Category Icon (تغيير أيقونة التصنيف) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                اختيار أيقونة التصنيف <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <CurrentIcon className="w-3.5 h-3.5" />
                <span>المحددة: {CATEGORY_ICON_MAP[iconName]?.label || iconName}</span>
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
              {Object.entries(CATEGORY_ICON_MAP).map(([key, item]) => {
                const IconComp = item.Icon;
                const isSelected = iconName === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIconName(key)}
                    title={item.label}
                    className={`h-10 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs scale-105 ring-2 ring-indigo-300'
                        : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>السمة والنمط اللوني للتصنيف</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(CATEGORY_COLOR_THEMES).map(([tKey, tVal]) => {
                const isSelected = colorThemeKey === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setColorThemeKey(tKey)}
                    className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 font-bold'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full shrink-0 ${tVal.swatchBg} shadow-2xs`} />
                    <span className="text-[11px] text-slate-800 truncate">{tVal.name.split(' ')[0]}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 mr-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional: Assign Platforms to Category in Create Mode */}
          {mode === 'create' && connectedPlatforms.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                نقل منصات حالية إلى هذا التصنيف فوراً <span className="text-slate-400 font-normal">(اختياري)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {connectedPlatforms.map((plat) => {
                  const isChecked = selectedPlatformIds.includes(plat.id);
                  return (
                    <label
                      key={plat.id}
                      className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePlatform(plat.id)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded-xs focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="truncate">{plat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {/* Delete button if custom category in edit mode */}
            {mode === 'edit' && initialCategory?.isCustom && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف تصنيف "${initialCategory.title}"؟ سيتم نقل المنصات التابعة له إلى الماركت بليس.`)) {
                    onDelete(initialCategory.key);
                  }
                }}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="حذف هذا التصنيف المخصص"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف التصنيف</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-save-category"
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                <span>{mode === 'create' ? 'إنشاء التصنيف المخصص 🚀' : 'حفظ التعديلات 💾'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
