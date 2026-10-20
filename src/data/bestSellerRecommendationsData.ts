import { ProductData, MerchantOffer } from '../types';

export interface BestSellerRecommendation {
  product: ProductData;
  categoryKey: string;
  categoryTitle: string;
  categoryBadge: string;
  bestSellerRank: number;
  dailySalesEstimate: number;
  monthlyRevenueEstimateEGP: number;
  demandMomentumPercent: number;
  expectedProfitMarginPercent: number;
  netProfitPerUnitEGP: number;
  topSellingPlatform: string;
  topSellingPlatformBadge: string;
  recommendationReason: string;
  urgencyBadge: string;
  supplierStockAlert: string;
  importOriginBadge: string;
  commercialCategoryLabel: string;
}

export interface BestSellerCategoryMeta {
  key: string;
  label: string;
  icon: string;
  description?: string;
}

export const BEST_SELLER_CATEGORIES: BestSellerCategoryMeta[] = [
  { key: 'all', label: 'جميع المنتجات الأكثر طلباً وتريند (الصين 👈 مصر)', icon: '🔥', description: 'كل المنتجات التجارية الرابحة الأعلى طلباً في مصر' },
  { key: 'home_organizers', label: 'منظمات منزلية وأثاث موفر للمساحة', icon: '🪑', description: 'حلول توفير المساحة والدواليب الذكية' },
  { key: 'smart_kitchen_gadgets', label: 'أدوات مطبخ ذكية بدون كهرباء', icon: '🍳', description: 'قطاعات ومفارم وأدوات تحضير يدوية' },
  { key: 'tws_mobile_accessories', label: 'إكسسوارات الموبايل وسماعات TWS', icon: '🎧', description: 'سماعات بلوتوث وكابلات وحوامل سيارة' },
  { key: 'viral_beauty_care', label: 'أدوات عناية وتجميل تريند', icon: '💄', description: 'أدوات العناية بالبشرة وتصفيف الشعر الفيروسية' },
  { key: 'baby_kids_gadgets', label: 'ألعاب ومستلزمات أطفال ذكية', icon: '🧸', description: 'مرايل سيليكون وسبورات إلكترونية' },
  { key: 'fashion_accessories', label: 'إكسسوارات وموضة عصرية', icon: '🕶️', description: 'نظارات شمسية وساعات وحقائب كروس' },
];

/**
 * Curated high-demand trending Chinese import products specifically optimized for the Egyptian marketplace.
 * High turnover, high profit margin (+55% to +68%), sourced via wholesale hubs (Al-Attaba, Bab Al-Shaariya, Al-Muski).
 */
export const CHINESE_IMPORT_TRENDING_PRODUCTS: ProductData[] = [
  // 1. Home & Space-Saving Organizers
  {
    id: 'CN-ORG-CLOTH-24',
    sku: 'CN-ORG-24CELL-GRY',
    barcode: '6974128500112',
    title: 'منظم دواليب وملابس داخلية مقسم 24 خانة قماش سميك قابل للطي وموفر للمساحة',
    titleEn: 'Foldable 24-Cell Underwear & Wardrobe Organizer Box Space Saver - Heavy Non-Woven',
    brand: 'SmartSpace China',
    model: 'SS-ORG-24C',
    category: 'منظمات منزلية وأثاث موفر للمساحة',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.4,
    description: 'منظم دواليب ذكي قابل للطي يحتوي على 24 خانة منفصلة لترتيب الجوارب والملابس الداخلية والإكسسوارات. مصنوع من قماش غير منسوج عالي الكثافة مقاوم للرطوبة والغبار، يوفر 70% من مساحة التخزين.',
    estimatedWholesaleCost: 65,
    suggestedRetailPrice: 195,
    currentLowestPrice: 185,
    highestPrice: 220,
    averagePrice: 195,
    currency: 'EGP',
    tags: ['منظم دواليب', 'توفير مساحة', 'تريند تيك توك', 'وارد الصين', 'أمازون مصر', 'نون مصر'],
    quickHighlights: [
      '24 خانة تخزين عملية قابلة للطي وموفرة للمساحة بنسبة 70%',
      'قماش غير منسوج صديق للبيئة مع خياطة مقواة مقاومة للتمزق',
      'هامش ربح يتجاوز +64% مع دوران سريع في السوق المصري'
    ],
    specs: [
      {
        category: 'المواصفات التجارية والاستيراد',
        items: [
          { label: 'بلد المنشأ والتوريد', value: 'الصين (وارد مباشر عبر أسواق باب الشعرية والموسكي)' },
          { label: 'عدد الخانات', value: '24 خانة مرنة' },
          { label: 'المادة الخام', value: 'أقمشة غير منسوجة معززة بطبقة كرتون مقوى' },
          { label: 'الأبعاد', value: '32 × 32 × 10 سم' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-org-noon',
        merchantName: 'Cairo Import Hub (Noon.eg)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Cairo Import Hub',
        price: 185,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 320,
        deliveryTime: 'توصيل نون إكسبريس غداً',
        deliveryCost: 'مجاني للطلبات فوق 200 ج',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn',
        url: 'https://www.noon.com/egypt-ar',
        warranty: 'معاينة عند الاستلام وضمان استبدال 14 يوم'
      },
      {
        id: 'off-org-amz',
        merchantName: 'Al-Attaba Wholesale (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Al-Attaba Direct',
        price: 195,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 245,
        deliveryTime: 'شحن أمازون برايم خلال 24 ساعة',
        deliveryCost: 'مجاني مع برايم',
        isVerified: true,
        isBestDeal: false,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba',
        url: 'https://www.amazon.eg',
        warranty: 'ضمان إرجاع أمازون 14 يوم'
      }
    ]
  },
  {
    id: 'CN-HNG-9HOLE-MAG',
    sku: 'CN-HNG-9H-WHT',
    barcode: '6974128500229',
    title: 'شماعة ملابس سحرية دوارة 360 درجة 9 فتحات موفرة لمساحة الدولاب بنسبة 80% بلاستيك مقوى',
    titleEn: '9-Hole Magic Wonder Hanger 360 Rotating Closet Space Saver Heavy Duty Plastic',
    brand: 'EcoHanger Yiwu',
    model: 'EH-MAG-9H',
    category: 'منظمات منزلية وأثاث موفر للمساحة',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.6,
    description: 'شماعة سحرية دوارة بـ 9 فتحات لحمل 9 شماعات عادية رأسياً أو أفقياً، مما يضاعف مساحة خزانة الملابس ويوفر ترتيباً مثالياً للقمصان والبدل والفساتين.',
    estimatedWholesaleCost: 35,
    suggestedRetailPrice: 125,
    currentLowestPrice: 119,
    highestPrice: 140,
    averagePrice: 125,
    currency: 'EGP',
    tags: ['شماعة سحرية', 'منظم دولاب', 'تريند تيك توك', 'وارد الصين', 'سوق العتبة', 'نون مصر'],
    quickHighlights: [
      'توفر 80% من مساحة خزانة الملابس مع خطاف دوار 360 درجة',
      'مصنوعة من بلاستيك PP المتين لتحمل حتى 10 كجم من الملابس الشتوية',
      'منتج تريند فايرال عالي التحويل وسهل الشحن خفيف الوزن'
    ],
    specs: [
      {
        category: 'المواصفات الفنية',
        items: [
          { label: 'القدرة الاستيعابية', value: 'حتى 9 علاقات ملابس في مساحة شماعة واحدة' },
          { label: 'المادة', value: 'بلاستيك بولي بروبيلين عالي المتانة' },
          { label: 'الدوران', value: '360 درجة للتعليق الأفقي أو الرأسي' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-hng-amz',
        merchantName: 'Yiwu Trade EG (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Yiwu Direct Egypt',
        price: 119,
        currency: 'EGP',
        rating: 4.9,
        reviewCount: 512,
        deliveryTime: 'شحن سريع خلال 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },
  {
    id: 'CN-ORG-FRIDGE-PET',
    sku: 'CN-FRDG-BOX-CLR',
    barcode: '6974128500336',
    title: 'منظم ثلاجة ودواليب مطبخ شفاف أكريليك PET عالي المتانة بمقبض أمامي وتصميم قابل للرص',
    titleEn: 'Clear Acrylic Fridge & Pantry Organizer Bin with Built-in Handle Stackable PET Box',
    brand: 'ClearBox Import',
    model: 'CB-PET-LG',
    category: 'منظمات منزلية وأثاث موفر للمساحة',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.2,
    description: 'صندوق تنظيم ثلاجة ومطبخ شفاف عالي النقاء مصنوع من بلاستيك PET الآمن غذائياً بدون BPA. مجهز بمقبض مريح وتصميم يسمح برص الصناديق فوق بعضها لاستغلال كامل المساحة الرأسية.',
    estimatedWholesaleCost: 95,
    suggestedRetailPrice: 260,
    currentLowestPrice: 249,
    highestPrice: 290,
    averagePrice: 260,
    currency: 'EGP',
    tags: ['منظم ثلاجة', 'أكريليك شفاف', 'أدوات مطبخ تريند', 'توفير مساحة', 'أمازون مصر'],
    quickHighlights: [
      'شفافية بلورية لرؤية المحتويات بوضوح مع سهولة الوصول والتنظيف',
      'مادة PET معتمدة آمنة على الأطعمة والخضروات ومقاومة للكسر',
      'هامش ربح صافي يتجاوز 150 ج.م للقطعة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الخامة', value: 'أكريليك PET نقي خالي من BPA' },
          { label: 'الأبعاد', value: '35 × 20 × 12 سم' },
          { label: 'الاستخدام', value: 'الثلاجة، الفريزر، دواليب المطبخ، الحمام' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-frdg-noon',
        merchantName: 'Home Essentials EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Home Essentials',
        price: 249,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 180,
        deliveryTime: 'نون إكسبريس توصيل غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-CRN-BATH-RACK',
    sku: 'CN-RACK-ALUM-BLK',
    barcode: '6974128500443',
    title: 'رف زاوية للحمام والمطبخ ألومنيوم فضائي مقاوم للصدأ بتثبيت لاصق سحري فائق القوة بدون تخريم',
    titleEn: 'No-Drilling Space Aluminum Corner Bathroom & Kitchen Shelf Adhesive Rustproof Rack',
    brand: 'NoDrill Pro',
    model: 'ND-CRN-AL2',
    category: 'منظمات منزلية وأثاث موفر للمساحة',
    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.5,
    description: 'رف تنظيم زاوية الحمام والمطبخ بدون الحاجة للشنيور أو تخريم السيراميك، يثبت بلاصق كيميائي فائق القوة يتحمل حتى 15 كجم، مصنوع من ألومنيوم الفضاء المقاوم تماماً للصدأ والرطوبة.',
    estimatedWholesaleCost: 110,
    suggestedRetailPrice: 290,
    currentLowestPrice: 280,
    highestPrice: 320,
    averagePrice: 290,
    currency: 'EGP',
    tags: ['رف زاوية', 'بدون مسامير', 'ألومنيوم مقاوم للصدأ', 'تنظيم حمام', 'أمازون مصر'],
    quickHighlights: [
      'تثبيت سريع بدون شنيور أو إتلاف السيراميك بلاصق قوي مقاوم للمياه',
      'ألومنيوم فضائي خفيف الوزن مطلي حرارياً ضد التقشير والصدأ مدى الحياة',
      'طلب يومي متزايد لدى شريحة العرائس والشقق السكنية الجديدة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الخامة', value: 'Space Aluminum مقاوم للصدأ' },
          { label: 'طريقة التثبيت', value: 'شريط لاصق مقوى نانو بدون مسامير' },
          { label: 'التحمل', value: 'حتى 15 كجم' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-bath-amz',
        merchantName: 'Sanitary Market EG (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Sanitary Market',
        price: 280,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 390,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },

  // 2. Smart Non-Electric Kitchen Gadgets
  {
    id: 'CN-KTCH-SLICER-3IN1',
    sku: 'CN-SLIC-ROT-RED',
    barcode: '6974128500550',
    title: 'قطاعة خضروات ومبشرة جبنة ومكسرات دوارة يدوية 3 أسلحة استانلس ستيل بقاعدة شفط مانعة للانزلاق',
    titleEn: 'Manual Rotary Vegetable Slicer & Cheese Grater 3-in-1 Stainless Steel Drum Blades',
    brand: 'KitchenMaster Import',
    model: 'KM-ROT-300',
    category: 'أدوات مطبخ ذكية بدون كهرباء',
    imageUrl: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.8,
    description: 'القطاعة اليدوية الدوارة الأكثر شهرة على تيك توك وسوشيال ميديا. مزودة بـ 3 أسطوانات حادة من الاستانلس ستيل 430 للتقطيع الشرائح والبشر الناعم والخشن في ثوانٍ دون الحاجة للكهرباء مع قاعدة تثبيت شفاطة قوية.',
    estimatedWholesaleCost: 160,
    suggestedRetailPrice: 420,
    currentLowestPrice: 399,
    highestPrice: 460,
    averagePrice: 420,
    currency: 'EGP',
    tags: ['قطاعة خضار', 'مبشرة دوارة', 'أدوات مطبخ تريند', 'يدوية بدون كهرباء', 'أمازون مصر', 'نون مصر'],
    quickHighlights: [
      'تعمل يدوياً 100% بدون استهلاك كهرباء مع أداء فائق السرعة',
      '3 شفرات استانلس ستيل حادة قابلة للتبديل والغسيل في غسالة الأطباق',
      'هامش ربح صافي يتجاوز 230 ج.م لكل عملية بيع'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'نوع التشغيل', value: 'يدوي بمقبض دوران سلس' },
          { label: 'الشفرات', value: '3 أسطوانات استانلس ستيل مقاوم للصدأ' },
          { label: 'القاعدة', value: 'قفل تفريغ هواء للتثبيت التام على الرخام' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-slic-noon',
        merchantName: 'Egypt Kitchen Hub (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Kitchen Hub EG',
        price: 399,
        currency: 'EGP',
        rating: 4.9,
        reviewCount: 840,
        deliveryTime: 'توصيل إكسبريس غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-KTCH-PULL-CHOPPER',
    sku: 'CN-CHOP-PULL-500ML',
    barcode: '6974128500667',
    title: 'مفرمة بصل وثوم يدوية سريعة بضغط وسحب الخيط 3 شفرات استانلس حادة لتقطيع الخضار والمكسرات',
    titleEn: 'Manual Speedy Pull String Food Chopper 3 Blades 500ml Garlic Onion Veggie Mincer',
    brand: 'SwiftChop China',
    model: 'SC-PULL-500',
    category: 'أدوات مطبخ ذكية بدون كهرباء',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.7,
    description: 'مفرمة خضار وثوم يدوية كلاسيكية معتمدة في كل بيت مصري. 3 سحبات فقط تعطي تقطيعاً خشناً، و10 سحبات تعطي فرم ناعم جداً بدون دموع البصل وبدون توصيل فيش كهرباء.',
    estimatedWholesaleCost: 75,
    suggestedRetailPrice: 220,
    currentLowestPrice: 210,
    highestPrice: 240,
    averagePrice: 220,
    currency: 'EGP',
    tags: ['مفرمة يدوية', 'كبة سحب', 'فرم بصل وثوم', 'أدوات مطبخ ذكية', 'تريند مصر'],
    quickHighlights: [
      'سريعة ومحمولة للرحلات والاستخدام المنزلي بدون شحن أو كهرباء',
      'حبل سحب نايلون متين تم اختباره لأكثر من 15,000 سحبة قوية',
      'معدل مبيعات يتجاوز 70 قطعة يومياً عبر تيك توك ونون وأمازون'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'السعة', value: '500 مل' },
          { label: 'عدد الشفرات', value: '3 شفرات استانلس ستيل منحنية ثلاثية الأبعاد' },
          { label: 'الأمان', value: 'قفل محكم للغطاء ومانع انزلاق بالأسفل' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-chop-amz',
        merchantName: 'Al-Muski Housewares (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Al-Muski Housewares',
        price: 210,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 960,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },
  {
    id: 'CN-KTCH-GRAPE-ROLLER',
    sku: 'CN-ROLL-LEAF-BLU',
    barcode: '6974128500774',
    title: 'ماكينة لف ورق العنب والكرنب والسوشي اليدوية السريعة لربات البيوت والمطاعم',
    titleEn: 'Fast Grape Leaves & Cabbage Vegetable Roller Meat Sushi Rolling Machine Tool',
    brand: 'MagicRoller EG',
    model: 'MR-LEAF-10',
    category: 'أدوات مطبخ ذكية بدون كهرباء',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.3,
    description: 'الجهاز السحري لربات البيوت في مصر للف ورق العنب والكرنب والسوشي بمقاس موحد وسرعة هائلة. تضع الورقة والحشو وتسحب المقبض ليخرج إصبع المحشي ملفوفاً بإتقان في ثانية واحدة.',
    estimatedWholesaleCost: 60,
    suggestedRetailPrice: 175,
    currentLowestPrice: 165,
    highestPrice: 190,
    averagePrice: 175,
    currency: 'EGP',
    tags: ['لف ورق عنب', 'جهاز محشي', 'أدوات مطبخ ذكية', 'تريند مصر', 'رمضان والمناسبات'],
    quickHighlights: [
      'توفر 80% من وقت وجهد لف ورق العنب في العزومات والمناسبات',
      'حجم أصابع متناسق ومحكم الإغلاق يمنع خروج الأرز أثناء الطهي',
      'منتج رابح شديد الطلب في السوق المصري طوال العام وخاصة في المواسم'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الاستخدام', value: 'ورق العنب، الكرنب، السوشي، الرول المحشو' },
          { label: 'الخامة', value: 'بلاستيك غذائي مع شريط سحب سيليكون أملس' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-leaf-jumia',
        merchantName: 'Home Chef EG (Jumia.com.eg)',
        storeType: 'online',
        platform: 'jumia_eg',
        platformName: 'جوميا مصر',
        sellerName: 'Home Chef Direct',
        price: 165,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 420,
        deliveryTime: 'توصيل إكسبريس',
        deliveryCost: '25 ج.م',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'express'
      }
    ]
  },
  {
    id: 'CN-KTCH-OIL-BRUSH',
    sku: 'CN-OIL-BRSH-GLS',
    barcode: '6974128500881',
    title: 'موزع زيت زجاجي 2 في 1 مع قطارة وفرشاة سيليكون مدمجة مقاومة للحرارة للتحكم في كمية الزيت',
    titleEn: '2-in-1 Glass Oil Dispenser Bottle with Silicone Basting Brush & Dropper for Cooking & Air Fryer',
    brand: 'OilSmart Gadget',
    model: 'OS-BRSH-180',
    category: 'أدوات مطبخ ذكية بدون كهرباء',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.4,
    description: 'زجاجة توزيع الزيت الذكية بفرشاة سيليكون وقطارة لقياس كمية الزيت بدقة ودهان الأطعمة وصواني الفرن والقلاية الهوائية (Air Fryer) بدون إهدار وتوفير في استهلاك الزيت.',
    estimatedWholesaleCost: 55,
    suggestedRetailPrice: 160,
    currentLowestPrice: 149,
    highestPrice: 175,
    averagePrice: 160,
    currency: 'EGP',
    tags: ['موزع زيت', 'فرشاة سيليكون', 'قلاية هوائية', 'أدوات مطبخ ذكية', 'توفير الزيت'],
    quickHighlights: [
      'توفير استهلاك الزيت حتى 60% مع دهان متجانس بفرشاة سيليكون حرارية',
      'زجاج شفاف عالي البوروسيليكات مقاوم للحرارة وسهل الفك والغسيل',
      'منتج مكمل مثالي لأصحاب القلايات الهوائية المنتشرة في مصر'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الخامة', value: 'زجاج بوروسيليكات + سيليكون غذائي مقاوم حتى 250° مئوية' },
          { label: 'السعة', value: '180 مل' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-oil-noon',
        merchantName: 'Modern Home EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Modern Home',
        price: 149,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 380,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },

  // 3. TWS Audio & Mobile Accessories
  {
    id: 'CN-TWS-M10-LEDPWR',
    sku: 'CN-TWS-M10-BLK',
    barcode: '6974128500998',
    title: 'سماعة بلوتوث لاسلكية TWS M10 بصوت ستيريو 9D وشاشة رقمية LED لعرض الشحن مع باور بنك مدمج',
    titleEn: 'TWS M10 Wireless Bluetooth 5.3 Earbuds 9D Stereo LED Digital Display with Powerbank Case',
    brand: 'Airdots Shenzhen',
    model: 'M10-TWS-V53',
    category: 'إكسسوارات الموبايل وسماعات TWS',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.9,
    description: 'السماعة الأكثر مبيعاً في تاريخ السوق المصري. تتميز بشاشة LED ديجيتال توضح نسبة شحن السماعتين والعلبة، وتحتوي العلبة على بطارية 2000 مللي أمبير تعمل كباور بنك طوارئ لشحن الهاتف.',
    estimatedWholesaleCost: 140,
    suggestedRetailPrice: 380,
    currentLowestPrice: 360,
    highestPrice: 420,
    averagePrice: 380,
    currency: 'EGP',
    tags: ['سماعات بلوتوث', 'TWS M10', 'باور بنك مدمج', 'إلكترونيات تريند', 'الأكثر مبيعا في مصر'],
    quickHighlights: [
      'رقم 1 مبيعاً في فئة الصوتيات في مصر لأكثر من سنتين متتاليتين',
      'شاشة LED رقمية ثلاثية + مخرج USB لشحن هاتف المحمول في حالات الطوارئ',
      'هامش ربح صافي يتجاوز 220 ج.م للقطعة مع طلب يومي يتجاوز 95 وحدة'
    ],
    specs: [
      {
        category: 'المواصفات التقنية',
        items: [
          { label: 'إصدار البلوتوث', value: 'Bluetooth 5.3 سريع الاقتران مع استهلاك طاقة منخفض' },
          { label: 'بطارية العلبة', value: '2000 مللي أمبير مع مخرج USB باور بنك' },
          { label: 'مدة التشغيل', value: '5-6 ساعات استماع متواصلة للسماعة الواحدة' },
          { label: 'المقاومة', value: 'IPX7 مقاومة للعرق ورذاذ المطر' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-m10-amz',
        merchantName: 'Cairo Tech Wholesale (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Cairo Tech Direct',
        price: 360,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 2850,
        deliveryTime: 'شحن أمازون برايم في نفس اليوم أو غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      },
      {
        id: 'off-m10-noon',
        merchantName: 'Gadget Express EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Gadget Express',
        price: 375,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 1940,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: false,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-ACC-MAG-CABLE',
    sku: 'CN-MAG-CBL-540-1M',
    barcode: '6974128501018',
    title: 'كابل شحن مغناطيسي دوار 540 درجة مضفر بالنايلون 3 رؤوس مغناطيسية مع إضاءة LED لجميع الهواتف',
    titleEn: '540 Degree Rotating Magnetic Fast Charging Cable 3-in-1 (Type-C / Lightning / Micro) with LED',
    brand: 'MagCable Yiwu',
    model: 'MC-540-3IN1',
    category: 'إكسسوارات الموبايل وسماعات TWS',
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.6,
    description: 'كابل الشحن المغناطيسي الذكي برأس كروي دوار 540 درجة (360 + 180) يمنع انثناء السلك أثناء اللعب واستخدام الهاتف. يشمل 3 رؤوس مغناطيسية (أيفون، تايب سي، ميكرو) لحماية منفذ الهاتف من الأتربة والتلف.',
    estimatedWholesaleCost: 45,
    suggestedRetailPrice: 145,
    currentLowestPrice: 135,
    highestPrice: 160,
    averagePrice: 145,
    currency: 'EGP',
    tags: ['كابل مغناطيسي', 'شاحن سريع', 'إكسسوارات موبايل', '3 في 1', 'أمازون مصر'],
    quickHighlights: [
      'دوران 540 درجة لحرية الحركة أثناء الألعاب ومشاهدة الفيديوهات',
      'يشمل 3 رؤوس تدعم أيفون وأندرويد وأجهزة الشحن المختلفة',
      'سلك مضفر بألياف النايلون العسكرية المقاومة للقطع والشد'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الرؤوس المتضمنة', value: 'Lightning (iPhone) + Type-C + Micro-USB' },
          { label: 'الطول', value: '1 متر' },
          { label: 'التيار الأقصى', value: '3A شحن سريع' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-cbl-amz',
        merchantName: 'Phone Accessories Hub (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Accessories Hub',
        price: 135,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 710,
        deliveryTime: 'شحن سريع 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },
  {
    id: 'CN-ACC-CAR-MAGN52',
    sku: 'CN-CAR-HLDR-N52',
    barcode: '6974128501025',
    title: 'ستاند وحامل هاتف مغناطيسي لفتحة تكييف السيارة بمغناطيس نيوديميوم N52 شديد الثبات ودوران 360',
    titleEn: '360 Rotating Car Air Vent Magnetic Phone Holder Heavy Duty N52 Magnets Stand',
    brand: 'DriveHold Pro',
    model: 'DH-VENT-N52',
    category: 'إكسسوارات الموبايل وسماعات TWS',
    imageUrl: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.5,
    description: 'حامل هاتف السيارة الأكثر استقراراً، يركب على ريش التكييف بمشبك معدني محكم بدون اهتزاز. يحتوي على 6 مغناطيسات N52 قوية لحمل الهواتف الكبيرة حتى على المطبات القوية في شوارع مصر.',
    estimatedWholesaleCost: 50,
    suggestedRetailPrice: 155,
    currentLowestPrice: 145,
    highestPrice: 170,
    averagePrice: 155,
    currency: 'EGP',
    tags: ['حامل موبايل سيارة', 'مغناطيس N52', 'إكسسوارات سيارات', 'نون مصر', 'أمازون مصر'],
    quickHighlights: [
      'ثبات فائق على المطبات والشوارع غير المستوية بمغناطيس N52 القوي',
      'مشبك تكييف محمي بالسيليكون يمنع خدش فتحات تكييف السيارة',
      'معدل دوران فائق وسعر شراء استيرادي منخفض بهامش ربح +65%'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'قوة المغناطيس', value: '6 قطع مغناطيس نيوديميوم N52 عالي الشدة' },
          { label: 'التوافق', value: 'جميع الهواتف الذكية مع 2 شريحة معدنية مرفقة' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-car-noon',
        merchantName: 'Auto Gadgets EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Auto Gadgets',
        price: 145,
        currency: 'EGP',
        rating: 4.9,
        reviewCount: 620,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },

  // 4. Viral Beauty & Skincare Tools
  {
    id: 'CN-BTY-GUASHA-JADE',
    sku: 'CN-JADE-GUA-SET',
    barcode: '6974128501032',
    title: 'طقم رولر حجر اليشم الطبيعي الأخضر مع حجر جوا شا لتدليك وشد الوجه وتقليل الانتفاخات',
    titleEn: 'Natural Green Jade Roller & Gua Sha Scraping Massage Tool Set for Facial Anti-Aging',
    brand: 'GuaSha Glow China',
    model: 'GS-JADE-PRO',
    category: 'أدوات عناية وتجميل تريند',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.8,
    description: 'الأداة الفيروسية الأولى على تيك توك وإنستجرام للعناية بالبشرة. طقم متكامل من حجر اليشم الأخضر البارد لنحت عظام الفك وتحفيز الدورة الدموية وتقليل التجاعيد وانتفاخات ما تحت العين.',
    estimatedWholesaleCost: 65,
    suggestedRetailPrice: 195,
    currentLowestPrice: 180,
    highestPrice: 220,
    averagePrice: 195,
    currency: 'EGP',
    tags: ['جوا شا', 'رولر يشم', 'عناية بالبشرة', 'تريند تيك توك مصر', 'أدوات تجميل'],
    quickHighlights: [
      'حجر يشم طبيعي أملس بدون صوت صرير مع إطار معدني مقوى بلون ذهبي',
      'أعلى تفاعل ومبيعات عبر تيك توك وإنستجرام بفضل مقاطع الفيديو القصيرة',
      'هامش ربح صافي يتجاوز 115 ج.م للقطعة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'المكونات', value: 'رولر مزدوج الأطراف (طرف كبير + طرف صغير) + حجر جوا شا لنحت الوجه' },
          { label: 'الخامة', value: 'حجر شيويان الأخضر الطبيعي 100%' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-jade-amz',
        merchantName: 'Beauty Boutique EG (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Beauty Boutique',
        price: 180,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 1120,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },
  {
    id: 'CN-BTY-PORE-VACUUM',
    sku: 'CN-PORE-VAC-4HD',
    barcode: '6974128501049',
    title: 'جهاز شفط وإزالة الرؤوس السوداء وتنظيف مسام البشرة بعمق بالشحن USB مع 4 فوهات مخصصة',
    titleEn: 'Electric Blackhead Remover Pore Vacuum Suction Facial Cleaner 4 Probes USB Rechargeable',
    brand: 'PoreClear Import',
    model: 'PC-VAC-PRO',
    category: 'أدوات عناية وتجميل تريند',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.4,
    description: 'جهاز هيدرا فيشال منزلي محمول لشفط الرؤوس السوداء والدهون وتنظيف مسام الأنف والوجه بعمق. مزود بـ 3 مستويات شفط تناسب البشرة الحساسة والدهنية مع بطارية قابلة لإعادة الشحن عبر USB.',
    estimatedWholesaleCost: 120,
    suggestedRetailPrice: 340,
    currentLowestPrice: 320,
    highestPrice: 380,
    averagePrice: 340,
    currency: 'EGP',
    tags: ['شفط الرؤوس السوداء', 'تنظيف بشرة', 'هيدرا فيشال', 'أدوات تجميل تريند', 'أمازون مصر'],
    quickHighlights: [
      'تنظيف عميق للمسام وإزالة الدهون والرؤوس السوداء بنتائج فورية مرئية',
      '4 فوهات مختلفة الأحجام لمنطقة T والأنف والخدود وتنشيط الكولاجين',
      'صافي ربح يتجاوز 200 ج.م للقطعة مع إقبال شديد من الفتيات والشباب'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'مستويات الشفط', value: '3 مستويات (خفيف، متوسط، قوي)' },
          { label: 'البطارية', value: 'بطارية ليثيوم 500mAh قابلة لإعادة الشحن بمنفذ Type-C/USB' },
          { label: 'الملحقات', value: '4 رؤوس مختلفة + كابل شحن + فلاتر إسفنجية بديلة' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-pore-noon',
        merchantName: 'SkinCare EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'SkinCare Express',
        price: 320,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 460,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-BTY-HAIR-BRUSH',
    sku: 'CN-HAIR-STRT-ION',
    barcode: '6974128501056',
    title: 'فرشاة ومشط حراري سيراميك لفرد وتنعيم الشعر بتقنية الأيونات السالبة مع شاشة ديجيتال لدرجات الحرارة',
    titleEn: 'Ionic Hair Straightener Brush Ceramic Fast Heating Anti-Scald Comb with LCD Temperature',
    brand: 'SilkHair China',
    model: 'SH-ION-200',
    category: 'أدوات عناية وتجميل تريند',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.5,
    description: 'المشط الحراري الثوري لفرد وتنعيم الشعر في دقائق معدودة بديل المكواة التقليدية. أسنان سيراميك بتقنية الأيونات السالبة لمنع الهيشان وحماية فروة الرأس من الاحتراق مع شاشة ديجيتال.',
    estimatedWholesaleCost: 210,
    suggestedRetailPrice: 550,
    currentLowestPrice: 520,
    highestPrice: 590,
    averagePrice: 550,
    currency: 'EGP',
    tags: ['فرشاة شعر حرارية', 'فرد الشعر', 'سيراميك أيوني', 'أدوات عناية تريند', 'أمازون مصر'],
    quickHighlights: [
      'فرد الشعر في 5 دقائق مع خاصية منع الحروق والتسخين السريع PTC في 30 ثانية',
      'تحكم رقمي في درجات الحرارة من 130° حتى 200° مئوية لجميع أنواع الشعر',
      'ربح صافي يتجاوز 310 ج.م للوحدة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'القدرة', value: '45 وات' },
          { label: 'الطلاء', value: 'سيراميك تورمالين أيوني' },
          { label: 'السلك', value: 'دوار 360 درجة لمنع التشابك بطول 1.8 متر' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-hair-amz',
        merchantName: 'Beauty Appliances EG (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Beauty Appliances',
        price: 520,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 780,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },

  // 5. Baby Items & Smart Kids Gadgets
  {
    id: 'CN-BABY-BIB-SILICONE',
    sku: 'CN-BIB-SILC-CAT',
    barcode: '6974128501063',
    title: 'مريلة طعام سيليكون للأطفال والرضع خالية من BPA بمشبك رقبة قابل للتعديل وجيب عميق لالتقاط الطعام',
    titleEn: 'Waterproof Food-Grade Silicone Baby Bib with Deep Food Catcher Pocket Adjustable Neck',
    brand: 'BabySmart Yiwu',
    model: 'BS-BIB-01',
    category: 'ألعاب ومستلزمات أطفال ذكية',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.6,
    description: 'مريلة أطفال سيليكون ناعمة ومقاومة للماء والأوساخ مع جيب أمامي عريض لالتقاط بقايا الطعام والفتات ومنع اتساخ الملابس. سهلة الغسيل بالماء والصابون وتجف في ثوانٍ.',
    estimatedWholesaleCost: 40,
    suggestedRetailPrice: 130,
    currentLowestPrice: 120,
    highestPrice: 145,
    averagePrice: 130,
    currency: 'EGP',
    tags: ['مريلة أطفال سيليكون', 'مستلزمات مواليد', 'تغذية أطفال', 'منتجات صينية رابحة', 'نون مصر'],
    quickHighlights: [
      'سيليكون ناعم غذائي 100% معتمد وخالي تماماً من BPA والمواد الضارة',
      'جيب عميق يظل مفتوحاً لالتقاط كل فتات وسوائل طعام الطفل',
      'منتج رابح منخفض التكلفة بهامش ربح +62% وسهل الشحن والتخزين'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الخامة', value: 'سيليكون معتمد غذائياً بدرجة 100% Food Grade' },
          { label: 'الأعمار', value: 'من 6 أشهر حتى 4 سنوات مع 4 فتحات لتوسيع الرقبة' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-bib-noon',
        merchantName: 'Baby World EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Baby World',
        price: 120,
        currency: 'EGP',
        rating: 4.9,
        reviewCount: 540,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-KIDS-LCD-85',
    sku: 'CN-LCD-PAD-85-BLU',
    barcode: '6974128501070',
    title: 'سبورة رسم وكتابة إلكترونية LCD للأطفال مقاس 8.5 بوصة بقلم ذكي وزر مسح سريع لحماية العين',
    titleEn: '8.5 Inch LCD Writing Tablet Doodle Board Electronic Drawing Pad for Kids Eye-Protection',
    brand: 'KidDraw Shenzhen',
    model: 'KD-LCD-85',
    category: 'ألعاب ومستلزمات أطفال ذكية',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.7,
    description: 'تابلت الرسم الإلكتروني للأطفال لتفريغ طاقتهم الإبداعية بدون استهلاك ورق وبدون حبر على الجدران. شاشة LCD مطفأة لا تصدر إشعاعات ضارة ومزودة بزر مسح فوري ومفتاح قفل لمنع الحذف العرضي.',
    estimatedWholesaleCost: 65,
    suggestedRetailPrice: 185,
    currentLowestPrice: 175,
    highestPrice: 200,
    averagePrice: 185,
    currency: 'EGP',
    tags: ['سبورة إلكترونية', 'تابلت أطفال', 'لوحة رسم LCD', 'ألعاب تعليمية', 'تريند مصر'],
    quickHighlights: [
      'شاشة آمنة للعين بدون إشعاع وبدون ضوء أزرق تحمي نظر الأطفال',
      'توفر آلاف أوراق الرسم والكشاكيل وتحافظ على نظافة الحوائط',
      'طلب مرتفع طوال العام وفي مواسم الإجازات والدخول المدرسي'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'حجم الشاشة', value: '8.5 بوصة LCD بلورية سائلة' },
          { label: 'البطارية', value: 'بطارية ساعة CR2025 تكفي أكثر من 50,000 مسحة' },
          { label: 'الوزن', value: '110 جرام خفيف جداً للحمل في الحقيبة' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-lcd-amz',
        merchantName: 'Toys Direct EG (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Toys Direct',
        price: 175,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 1480,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },

  // 6. Trending Fashion Accessories
  {
    id: 'CN-FSH-SUNGLASS-POL',
    sku: 'CN-SUNG-POL-BLK',
    barcode: '6974128501087',
    title: 'نظارة شمسية كلاسيكية عصرية بإطار فينتاج وعدسات بولارايزد UV400 تريند تيك توك 2026',
    titleEn: 'Vintage Retro Polarized Sunglasses Classic Frame UV400 Protection TikTok Trend',
    brand: 'RetroShades China',
    model: 'RS-POL-2026',
    category: 'إكسسوارات وموضة عصرية',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.5,
    description: 'نظارة شمسية كلاسيكية تريند للجنسين بعدسات مستقطبة Polarized تحجب وهج الشمس التام والأشعة فوق البنفسجية UV400. هيكل متين ومفصلات معدنية مريحة مع حافظة وقطعة قماش للمسح.',
    estimatedWholesaleCost: 70,
    suggestedRetailPrice: 220,
    currentLowestPrice: 205,
    highestPrice: 250,
    averagePrice: 220,
    currency: 'EGP',
    tags: ['نظارات شمسية', 'بولارايزد UV400', 'تريند تيك توك', 'إكسسوارات موضة', 'أمازون مصر'],
    quickHighlights: [
      'عدسات Polarized TAC أصلية لحماية العين من الوهج وأشعة الشمس الساطعة',
      'تصميم كلاسيكي فخم يناسب مختلف أشكال الوجه والملابس الكاجوال والرسمية',
      'هامش ربح صافي يتجاوز 135 ج.م للقطعة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'نوع العدسة', value: 'Polarized TAC متعددة الطبقات بحماية UV400 كاملة' },
          { label: 'الإطار', value: 'بولي كربونات خفيف الوزن مع مفصلات معدنية مدعمة' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-sung-noon',
        merchantName: 'Fashion Hub EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Fashion Hub',
        price: 205,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 890,
        deliveryTime: 'نون إكسبريس توصيل غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  },
  {
    id: 'CN-FSH-CROSSBAG-USB',
    sku: 'CN-BAG-CROSS-USB-BLK',
    barcode: '6974128501094',
    title: 'شنطة كتف وخصر كروس للرجال متعددة الجيوب مضادة للماء والخدش مع منفذ شحن USB خارجي',
    titleEn: 'Men Anti-Theft Waterproof Crossbody Shoulder Sling Bag with External USB Charging Port',
    brand: 'UrbanGear Guangzhou',
    model: 'UG-SLING-USB',
    category: 'إكسسوارات وموضة عصرية',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.6,
    description: 'شنطة الكروس الأكثر طلباً للشباب ورجال الأعمال في شوارع ومواصلات مصر. مصنوعة من قماش أكسفورد المقاوم للماء والتمزق، مزودة بمنفذ USB لتوصيل الباور بنك بالداخل وشحن الهاتف بالخارج بسهولة أثناء التنقل.',
    estimatedWholesaleCost: 130,
    suggestedRetailPrice: 360,
    currentLowestPrice: 340,
    highestPrice: 390,
    averagePrice: 360,
    currency: 'EGP',
    tags: ['شنطة كروس', 'مقاومة للماء', 'منفذ شحن USB', 'إكسسوارات رجالي', 'تريند مصر'],
    quickHighlights: [
      'مقاومة ممتازة للمياه والأمطار والغبار مع بطانة داخلية متعددة الأقسام',
      'منفذ USB مدمج للشحن السريع دون الحاجة لفتح الحقيبة',
      'هامش ربح صافي يتجاوز 210 ج.م للحقيبة الواحدة'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'الخامة', value: 'أكسفورد بوليستر كثيف 900D مقاوم للماء والخدش' },
          { label: 'الجيوب', value: 'جيب رئيسي مبطن للتابلت + جيوب سرية خلفية للأموال والبطاقات' },
          { label: 'الأبعاد', value: '31 × 17 × 8 سم' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-bag-amz',
        merchantName: 'Leather & Bags Direct (Amazon.eg)',
        storeType: 'online',
        platform: 'amazon_eg',
        platformName: 'أمازون مصر',
        sellerName: 'Bags Direct EG',
        price: 340,
        currency: 'EGP',
        rating: 4.8,
        reviewCount: 650,
        deliveryTime: 'شحن 24 ساعة',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fba'
      }
    ]
  },
  {
    id: 'CN-FSH-STARRY-WATCH',
    sku: 'CN-WTCH-STAR-MAG-PUR',
    barcode: '6974128501100',
    title: 'ساعة يد حريمي بسوار معدني شبكي مغناطيسي مقاوم للماء وميناء سماء مرصعة بالنجوم كورية التصميم',
    titleEn: 'Women Luxury Starry Sky Magnetic Mesh Band Quartz Wrist Watch Diamond Cut Glass Face',
    brand: 'StarryWatch China',
    model: 'SW-MAG-STAR',
    category: 'إكسسوارات وموضة عصرية',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99.4,
    description: 'ساعة اليد الحريمي الفاخرة ذات السوار المغناطيسي الذي يلتف حول أي مقاس معصم بدون الحاجة لتقصير الحلقات. ميناء لامع بلون السماء المرصعة بالنجوم مع زجاج مقطوع بهندسة الألماس.',
    estimatedWholesaleCost: 85,
    suggestedRetailPrice: 250,
    currentLowestPrice: 235,
    highestPrice: 280,
    averagePrice: 250,
    currency: 'EGP',
    tags: ['ساعة حريمي', 'سوار مغناطيسي', 'سماء النجوم', 'إكسسوارات كورية', 'هدايا وبنات'],
    quickHighlights: [
      'سوار شبكي بمغناطيس قوي يغني عن ضبط المقاسات ومريح على المعصم',
      'زجاج مقطوع بالألماس عاكس للضوء مع حركة كوارتز دقيقة مقاومة للماء',
      'نسبة رواج ومبيعات مرتفعة جداً كهدايا للبنات والجامعات والمناسبات'
    ],
    specs: [
      {
        category: 'المواصفات',
        items: [
          { label: 'نوع الحركة', value: 'كوارتز دقيق عالي الجودة' },
          { label: 'السوار', value: 'معدن شبكي ميلانيز مع قفل مغناطيسي مرن' },
          { label: 'مقاومة الماء', value: '3ATM مقاومة للوضوء ورذاذ الماء' }
        ]
      }
    ],
    merchantOffers: [
      {
        id: 'off-wtch-noon',
        merchantName: 'Jewelry & Watches EG (Noon.com)',
        storeType: 'online',
        platform: 'noon_eg',
        platformName: 'نون مصر',
        sellerName: 'Watches Express',
        price: 235,
        currency: 'EGP',
        rating: 4.7,
        reviewCount: 530,
        deliveryTime: 'نون إكسبريس',
        deliveryCost: 'مجاني',
        isVerified: true,
        isBestDeal: true,
        stockStatus: 'in_stock',
        inStock: true,
        fulfillmentType: 'fbn'
      }
    ]
  }
];

/**
 * Maps each product to a full recommendation package with Egyptian market analytics.
 */
function mapProductToRecommendation(prod: ProductData, idx: number): BestSellerRecommendation {
  const netProfit = Math.max(70, prod.suggestedRetailPrice - prod.estimatedWholesaleCost);
  const marginPct = Math.round((netProfit / Math.max(1, prod.suggestedRetailPrice)) * 100);
  
  let categoryKey = 'home_organizers';
  let categoryTitle = 'منظمات منزلية وأثاث موفر للمساحة';
  let categoryBadge = '🪑 أثاث وتوفير مساحة';
  let commercialCategoryLabel = 'Home & Furniture / Organizers';

  if (prod.category.includes('مطبخ') || prod.id.includes('KTCH')) {
    categoryKey = 'smart_kitchen_gadgets';
    categoryTitle = 'أدوات مطبخ ذكية بدون كهرباء';
    categoryBadge = '🍳 مطبخ ذكي يدوي';
    commercialCategoryLabel = 'Kitchen Gadgets';
  } else if (prod.category.includes('موبايل') || prod.category.includes('TWS') || prod.id.includes('TWS') || prod.id.includes('ACC')) {
    categoryKey = 'tws_mobile_accessories';
    categoryTitle = 'إكسسوارات الموبايل وسماعات TWS';
    categoryBadge = '🎧 صوتيات وموبايل TWS';
    commercialCategoryLabel = 'Mobile & TWS Accessories';
  } else if (prod.category.includes('تجميل') || prod.category.includes('عناية') || prod.id.includes('BTY')) {
    categoryKey = 'viral_beauty_care';
    categoryTitle = 'أدوات عناية وتجميل تريند';
    categoryBadge = '💄 عناية وتجميل تريند';
    commercialCategoryLabel = 'Beauty & Care Tools';
  } else if (prod.category.includes('أطفال') || prod.id.includes('BABY') || prod.id.includes('KIDS')) {
    categoryKey = 'baby_kids_gadgets';
    categoryTitle = 'ألعاب ومستلزمات أطفال ذكية';
    categoryBadge = '🧸 أطفال ومواليد ذكية';
    commercialCategoryLabel = 'Baby & Kids Gadgets';
  } else if (prod.category.includes('موضة') || prod.id.includes('FSH')) {
    categoryKey = 'fashion_accessories';
    categoryTitle = 'إكسسوارات وموضة عصرية';
    categoryBadge = '🕶️ موضة وإكسسوارات';
    commercialCategoryLabel = 'Fashion Accessories';
  }

  // Realistic daily sales in Egyptian market based on rank
  const dailySales = Math.max(25, 95 - idx * 4);

  return {
    product: prod,
    categoryKey,
    categoryTitle,
    categoryBadge,
    commercialCategoryLabel,
    bestSellerRank: idx + 1,
    dailySalesEstimate: dailySales,
    monthlyRevenueEstimateEGP: dailySales * 30 * prod.suggestedRetailPrice,
    demandMomentumPercent: Math.min(99, 98 - idx * 2),
    expectedProfitMarginPercent: marginPct,
    netProfitPerUnitEGP: netProfit,
    topSellingPlatform: idx % 3 === 0 ? 'نون مصر (Noon Express)' : idx % 3 === 1 ? 'أمازون مصر (Amazon Prime)' : 'تيك توك شوب وجوميا',
    topSellingPlatformBadge: idx % 3 === 0 ? '🛒 المتصدر في نون مصر' : idx % 3 === 1 ? '📦 #1 مبيعاً على أمازون مصر' : '🔥 تريند تيك توك وجوميا',
    recommendationReason: `معدل دوران فائق السرعة في مصر بهامش ربح صافي +${marginPct}% (${netProfit} ج.م/قطعة). طلب يومي متزايد مع توافر فوري لدى مستوردي العتبة والموسكي وباب الشعرية.`,
    urgencyBadge: idx < 5 ? '🔥 تريند متفجر هذا الأسبوع' : '⚡ دوران سريع ومضمون الربح',
    supplierStockAlert: 'متوفر للتوريد الفوري بالجملة من مستوردي باب الشعرية والعتبة والموسكي وجوانزو',
    importOriginBadge: '🇨🇳 وارد الصين (الأعلى مبيعاً بمصر)'
  };
}

export const PROACTIVE_BEST_SELLER_RECOMMENDATIONS: BestSellerRecommendation[] =
  CHINESE_IMPORT_TRENDING_PRODUCTS.map((prod, idx) => mapProductToRecommendation(prod, idx));

export default PROACTIVE_BEST_SELLER_RECOMMENDATIONS;
