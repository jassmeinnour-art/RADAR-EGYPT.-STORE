import { MerchantCatalogProduct, ProductData } from '../types';

export interface ProductAutoTag {
  id: string;
  label: string;
  category: 'buybox' | 'category' | 'feature' | 'promotion' | 'stock' | 'quality' | 'market' | 'brand';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon?: string;
}

/**
 * Keyword match configurations mapped to Tag Definitions
 */
interface KeywordRule {
  id: string;
  label: string;
  category: ProductAutoTag['category'];
  keywords: string[];
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon?: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    id: 'tag-electronics',
    label: 'إلكترونيات وتكنولوجيا',
    category: 'category',
    keywords: ['سماعة', 'شاحن', 'بلوتوث', 'لاسلكي', 'هاتف', 'موبايل', 'أيفون', 'سامسونج', 'باور بنك', 'ساعة ذكية', 'كاميرا', 'شاشة', 'لابتوب', 'حاسوب', 'usb', 'كابل'],
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    icon: '⚡'
  },
  {
    id: 'tag-furniture',
    label: 'أثاث وديكور',
    category: 'category',
    keywords: ['أثاث', 'طاولة', 'مكتب', 'كرسي', 'سرير', 'دولاب', 'كنبة', 'رف', 'أرفف', 'ستيل', 'خشب', 'زجاج', 'ديكور', 'مجلفن', 'شاسيه'],
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-500/30',
    icon: '🛋️'
  },
  {
    id: 'tag-appliances',
    label: 'أجهزة منزلية',
    category: 'category',
    keywords: ['ثلاجة', 'غسالة', 'مكيف', 'تكييف', 'مروحة', 'ميكروويف', 'بوتاجاز', 'سخان', 'خلاط', 'قلاية', 'قلاية هوائية', 'مكنسة', 'ديب فريزر'],
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    icon: '🔌'
  },
  {
    id: 'tag-kitchen',
    label: 'مستلزمات مطبخ',
    category: 'category',
    keywords: ['مطبخ', 'طاهي', 'حلل', 'طقم طهي', 'جرانيت', 'سيراميك', 'مقلاة', 'أواني', 'صينية', 'سكين', 'حافظة طعام'],
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
    icon: '🍳'
  },
  {
    id: 'tag-fashion',
    label: 'أزياء وموضة',
    category: 'category',
    keywords: ['ملابس', 'قميص', 'بنطال', 'حذاء', 'كوتشي', 'حقيبة', 'شنطة', 'فستان', 'ساعة يد', 'نظارة', 'جلابية'],
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-500/30',
    icon: '👔'
  },
  {
    id: 'tag-warranty',
    label: 'ضمان أصلي معتمد',
    category: 'quality',
    keywords: ['ضمان', 'أصلي', 'مستورد', 'عالي الجودة', 'مقاوم للصدأ', 'مقاوم للماء', 'شهادة جودة', 'ضمان سنة', 'ضمان سنتين', 'أصلي 100%'],
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    icon: '🛡️'
  },
  {
    id: 'tag-fast-shipping',
    label: 'شحن سريع إكسبريس',
    category: 'feature',
    keywords: ['شحن سريع', 'توصيل مجاني', 'إكسبريس', 'توصيل غداً', 'fba', 'fbn', 'برايم', 'تسليم فوري'],
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-500/30',
    icon: '🚀'
  },
  {
    id: 'tag-special-deal',
    label: 'عرض خصم خاص',
    category: 'promotion',
    keywords: ['عرض خاص', 'خصم', 'طقم', 'عبوة', 'تخفيض', 'توفير', 'باقة', 'جملة', 'صفقة'],
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-500/30',
    icon: '🏷️'
  },
  {
    id: 'tag-trending',
    label: 'تريند الأكثر طلباً',
    category: 'market',
    keywords: ['تريند', 'الأكثر مبيعاً', 'الأعلى تقييماً', 'طلب عالي', 'رائج', 'شديد التحمل'],
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-500/30',
    icon: '🔥'
  }
];

/**
 * Extracts automated tags for any merchant catalog product or product item
 */
export function extractAutoTags(product: MerchantCatalogProduct | ProductData | any): ProductAutoTag[] {
  const tags: ProductAutoTag[] = [];
  const addedIds = new Set<string>();

  const titleText = ((product.title || '') + ' ' + (product.titleEn || '')).toLowerCase();
  const descText = (product.description || product.suggestedAction || '').toLowerCase();
  const categoryText = (product.category || '').toLowerCase();
  const brandText = (product.brand || '').toLowerCase();
  const fullText = `${titleText} ${descText} ${categoryText} ${brandText}`;

  // 1. BuyBox & Pricing Intelligence Status Tags
  if (product.pricingStatus === 'winning_buybox' || product.isBuyBoxWinner) {
    tags.push({
      id: 'tag-buybox-winner',
      label: '🏆 فائز بالـ Buy Box',
      category: 'buybox',
      badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      badgeText: 'text-emerald-800 dark:text-emerald-200 font-bold',
      badgeBorder: 'border-emerald-500/40',
      icon: '🏆'
    });
    addedIds.add('tag-buybox-winner');
  } else if (
    product.pricingStatus === 'higher_than_buybox' ||
    product.pricingStatus === 'needs_repricing' ||
    (product.priceGapPercent && product.priceGapPercent > 5)
  ) {
    tags.push({
      id: 'tag-price-higher',
      label: '⚠️ أعلى من المنافسين',
      category: 'buybox',
      badgeBg: 'bg-rose-500/15 dark:bg-rose-500/25',
      badgeText: 'text-rose-800 dark:text-rose-200 font-bold',
      badgeBorder: 'border-rose-500/40',
      icon: '⚠️'
    });
    addedIds.add('tag-price-higher');
  } else if (product.priceGapPercent && product.priceGapPercent < -5) {
    tags.push({
      id: 'tag-best-deal',
      label: '⚡ صفقة سعر مميز',
      category: 'buybox',
      badgeBg: 'bg-amber-500/15 dark:bg-amber-500/25',
      badgeText: 'text-amber-800 dark:text-amber-200 font-bold',
      badgeBorder: 'border-amber-500/40',
      icon: '⚡'
    });
    addedIds.add('tag-best-deal');
  }

  // 2. Stock Levels Auto-Tags
  const stockQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : 10;
  if (stockQty === 0 || product.shippingStatus === 'out_of_stock') {
    tags.push({
      id: 'tag-out-stock',
      label: '❌ نفاد المخزون',
      category: 'stock',
      badgeBg: 'bg-slate-500/15 dark:bg-slate-500/25',
      badgeText: 'text-slate-700 dark:text-slate-300',
      badgeBorder: 'border-slate-500/40',
      icon: '❌'
    });
    addedIds.add('tag-out-stock');
  } else if (stockQty > 0 && stockQty <= 5) {
    tags.push({
      id: 'tag-low-stock',
      label: '🔥 كمية محدودة جداً',
      category: 'stock',
      badgeBg: 'bg-orange-500/15 dark:bg-orange-500/25',
      badgeText: 'text-orange-800 dark:text-orange-200 font-bold',
      badgeBorder: 'border-orange-500/40',
      icon: '🔥'
    });
    addedIds.add('tag-low-stock');
  } else if (stockQty >= 30) {
    tags.push({
      id: 'tag-abundant-stock',
      label: '📦 مخزون وفير جاهز',
      category: 'stock',
      badgeBg: 'bg-teal-500/15 dark:bg-teal-500/25',
      badgeText: 'text-teal-800 dark:text-teal-200',
      badgeBorder: 'border-teal-500/40',
      icon: '📦'
    });
    addedIds.add('tag-abundant-stock');
  }

  // 3. Keyword-Based Auto-Tagging Engine
  for (const rule of KEYWORD_RULES) {
    if (addedIds.has(rule.id)) continue;

    const matchesKeyword = rule.keywords.some(kw => fullText.includes(kw.toLowerCase()));
    if (matchesKeyword) {
      tags.push({
        id: rule.id,
        label: rule.label,
        category: rule.category,
        badgeBg: rule.badgeBg,
        badgeText: rule.badgeText,
        badgeBorder: rule.badgeBorder,
        icon: rule.icon
      });
      addedIds.add(rule.id);
    }
  }

  // 4. Platform Brand Auto-Tags
  if (brandText && brandText.length > 2 && !brandText.includes('generic')) {
    const brandTagId = `tag-brand-${brandText.replace(/\s+/g, '-')}`;
    if (!addedIds.has(brandTagId) && tags.length < 6) {
      tags.push({
        id: brandTagId,
        label: `🏷️ الماركة: ${product.brand}`,
        category: 'brand',
        badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        badgeText: 'text-blue-700 dark:text-blue-300 font-medium',
        badgeBorder: 'border-blue-500/30',
        icon: '🏷️'
      });
      addedIds.add(brandTagId);
    }
  }

  return tags;
}

/**
 * Runs auto-tagging across a batch of products and updates their tags array
 */
export function autoTagProductCatalog(products: MerchantCatalogProduct[]): {
  updatedProducts: MerchantCatalogProduct[];
  totalTagsAppliedCount: number;
} {
  let totalTagsAppliedCount = 0;

  const updatedProducts = products.map(prod => {
    const autoTags = extractAutoTags(prod);
    const tagLabels = autoTags.map(t => t.label);

    // Merge custom existing tags with new auto tags without duplicates
    const existingTags = Array.isArray(prod.tags) ? prod.tags : [];
    const combinedTagsSet = new Set([...existingTags, ...tagLabels]);
    const finalTags = Array.from(combinedTagsSet);

    totalTagsAppliedCount += autoTags.length;

    return {
      ...prod,
      tags: finalTags,
      autoTags: autoTags
    };
  });

  return {
    updatedProducts,
    totalTagsAppliedCount
  };
}
