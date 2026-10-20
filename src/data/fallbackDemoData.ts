import { CustomerOrder, OrderItem, ProductData } from '../types';

export interface FallbackDemoProduct extends ProductData {
  profitMarginPercent: number;
  netProfitEGP: number;
  demandIndex: number;
  marketRankInEgypt: number;
  topCompetitorName: string;
  priceTrend?: string;
  competitorsCount?: number;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export const FALLBACK_DEMO_PRODUCTS: FallbackDemoProduct[] = [
  {
    id: 'DEMO-PRD-001',
    sku: 'DSK-HYD-120-BLK',
    barcode: '6224009812014',
    title: 'مكتب عمل ومذاكرة هيدروليك معدني مقاوم للخدش 120×60 سم - أسود مطفي (star steel)',
    titleEn: 'Hydraulic Heavy Duty Metal Study Desk 120x60 cm - Matte Black',
    brand: 'ستار ستيل (Star Steel)',
    model: 'SS-HYD-120',
    category: 'أثاث وتجهيزات مكتبية',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 98,
    description: 'مكتب عمل ومذاكرة هيدروليكي فائق التحمل بهيكل حديد صلب مطلي إلكتروستاتيك مقاوم للصدأ، سطح خشب MDF سمك 18 مم مقاوم للمياه والحرارة والخدش، مزود بأرجل مانعة للانزلاق ومدخل كابلات منظم.',
    estimatedWholesaleCost: 1450,
    suggestedRetailPrice: 2850,
    currentLowestPrice: 2650,
    highestPrice: 3200,
    averagePrice: 2790,
    currency: 'ج.م',
    tags: ['مكاتب', 'أثاث مكتبي', 'ستار ستيل'],
    quickHighlights: ['تحمل عالي 120 كجم', 'سطح مقاوم للمياه والخدش', 'شحن سريع بالمحافظات'],
    specs: [],
    priceTrend: 'down',
    inStock: true,
    rating: 4.8,
    reviewsCount: 312,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 45.3,
    netProfitEGP: 1200,
    demandIndex: 94,
    marketRankInEgypt: 1,
    topCompetitorName: 'أمازون مصر - متجر النصر للأثاث',
    merchantOffers: [
      {
        id: 'off-1',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 2650,
        currency: 'ج.م',
        rating: 4.9,
        reviewCount: 312,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      },
      {
        id: 'off-2',
        merchantName: 'متجر الفراعنة للتوريدات',
        storeType: 'online',
        platform: 'noon_eg',
        price: 2790,
        currency: 'ج.م',
        rating: 4.6,
        reviewCount: 150,
        deliveryTime: 'يومين',
        deliveryCost: '50 ج.م',
        isVerified: true,
        stockStatus: 'in_stock'
      }
    ]
  },
  {
    id: 'DEMO-PRD-002',
    sku: 'CHR-MED-MESH-01',
    barcode: '6224009812021',
    title: 'كرسي مكتب طبي شبكي هيدروليك بمسند رأس داعم للفقرات القطنية 3D',
    titleEn: 'Ergonomic Breathable Mesh Office Chair with Lumbar Support & Headrest',
    brand: 'أرجو لايف (ErgoLife EG)',
    model: 'EL-MESH-900',
    category: 'أثاث وتجهيزات مكتبية',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 96,
    description: 'كرسي مريح مصمم لدعم جلسات العمل الطويلة، ظهر شبكي هوائي مرن مانع للتعرق، مسند رأس قابل لتعديل الارتفاع والزاوية، ماكينة رفع هيدروليكية فئة 4 وشاسيه نجمة خماسي كروم مدعم.',
    estimatedWholesaleCost: 980,
    suggestedRetailPrice: 2100,
    currentLowestPrice: 1890,
    highestPrice: 2350,
    averagePrice: 1990,
    currency: 'ج.م',
    tags: ['كراسي طبية', 'أثاث مكتبي'],
    quickHighlights: ['ظهر شبكي مسامي', 'دعم قطني قابل للتعديل', 'ضمان سنتين'],
    specs: [],
    priceTrend: 'stable',
    inStock: true,
    rating: 4.7,
    reviewsCount: 245,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 48.1,
    netProfitEGP: 910,
    demandIndex: 91,
    marketRankInEgypt: 2,
    topCompetitorName: 'نون مصر - كراسي إكسبريس',
    merchantOffers: [
      {
        id: 'off-21',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 1890,
        currency: 'ج.م',
        rating: 4.8,
        reviewCount: 245,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  },
  {
    id: 'DEMO-PRD-003',
    sku: 'ACC-LAP-ALU-360',
    barcode: '6224009812038',
    title: 'حامل لابتوب ألومنيوم مريح قابل للدوران 360 درجة وتعديل الارتفاع وتبديد الحرارة',
    titleEn: '360 Rotating Aluminum Ergonomic Laptop Stand with Heat Dissipation',
    brand: 'تيك برو (TechPro)',
    model: 'TP-ALU-360',
    category: 'إلكترونيات واكسسوارات كمبيوتر',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 97,
    description: 'مصنوع من سبائك الألومنيوم المستخدمة في الطيران، قاعدة دوارة 360 درجة بنقرات ميكانيكية دقيقة، مفاصل هيدروليكية مزدوجة تتحمل حتى 10 كجم، متوافق مع جميع أجهزة ماك بوك ولابتوب حتى 17.3 بوصة.',
    estimatedWholesaleCost: 260,
    suggestedRetailPrice: 690,
    currentLowestPrice: 590,
    highestPrice: 750,
    averagePrice: 640,
    currency: 'ج.م',
    tags: ['اكسسوارات لابتوب', 'حامل ألومنيوم'],
    quickHighlights: ['دوران 360 درجة', 'تبريد طبيعي للهيكل', 'خفيف الوزن'],
    specs: [],
    priceTrend: 'down',
    inStock: true,
    rating: 4.9,
    reviewsCount: 518,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 55.9,
    netProfitEGP: 330,
    demandIndex: 98,
    marketRankInEgypt: 3,
    topCompetitorName: 'جوميا مصر - سمارت ستور',
    merchantOffers: [
      {
        id: 'off-31',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 590,
        currency: 'ج.م',
        rating: 4.9,
        reviewCount: 518,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  },
  {
    id: 'DEMO-PRD-004',
    sku: 'LED-RGBIC-TV-STRIP',
    barcode: '6224009812045',
    title: 'إضاءة ليد ذكية خلف الشاشات RGBIC مع مستشعر صوت وتزامن ألوان واي فاي 3.8 متر',
    titleEn: 'Smart RGBIC TV Backlight Strip with Sound Sync & App Control',
    brand: 'لومينكس (Luminex Smart)',
    model: 'LX-RGBIC-TV',
    category: 'إلكترونيات وأجهزة ذكية',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 95,
    description: 'شريط إضاءة RGBIC مجزء يتيح عرض ألوان متعددة في نفس الوقت، يتزامن مع صوت الألعاب والموسيقى والتلفزيون لحظياً، تحكم كامل عبر تطبيق الهاتف أو الريموت اللاسلكي، متوافق مع شاشات 43 إلى 65 بوصة.',
    estimatedWholesaleCost: 310,
    suggestedRetailPrice: 799,
    currentLowestPrice: 699,
    highestPrice: 850,
    averagePrice: 749,
    currency: 'ج.م',
    tags: ['إضاءة ذكية', 'RGBIC'],
    quickHighlights: ['تزامن صوتي ذكي', 'تحكم عبر التطبيق', 'ألوان متعددة RGBIC'],
    specs: [],
    priceTrend: 'stable',
    inStock: true,
    rating: 4.6,
    reviewsCount: 189,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 55.6,
    netProfitEGP: 389,
    demandIndex: 88,
    marketRankInEgypt: 4,
    topCompetitorName: 'أمازون مصر - سمارت جيزموز',
    merchantOffers: [
      {
        id: 'off-41',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 699,
        currency: 'ج.م',
        rating: 4.8,
        reviewCount: 189,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  },
  {
    id: 'DEMO-PRD-005',
    sku: 'APP-COF-3IN1-19BAR',
    barcode: '6224009812052',
    title: 'ماكينة قهوة إسبريسو وكبسولات متعددة 3 في 1 ضغط 19 بار بمبخر حليب إيطالي',
    titleEn: '3-in-1 Multi Capsule & Ground Espresso Coffee Machine 19 Bar',
    brand: 'باريستا ماستر (Barista Master)',
    model: 'BM-ESP-19B',
    category: 'أجهزة منزلية ومطبخ',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 99,
    description: 'ماكينة تحضير قهوة احترافية تدعم كبسولات نسبريسو وكبسولات دولتشي جوستو والبن المطحون، مضخة ضغط إيطالية أصلية 19 بار مع خزان ماء سعة 1.2 لتر وعصا تبخير الحليب لصنع الكابتشينو واللاتيه برغوة كريمية غنية.',
    estimatedWholesaleCost: 1850,
    suggestedRetailPrice: 3600,
    currentLowestPrice: 3250,
    highestPrice: 3850,
    averagePrice: 3400,
    currency: 'ج.م',
    tags: ['ماكينة قهوة', 'إسبريسو', 'مطبخ'],
    quickHighlights: ['ضغط إيطالي 19 بار', 'متوافقة 3 في 1', 'مبخر حليب ستانلس'],
    specs: [],
    priceTrend: 'down',
    inStock: true,
    rating: 4.9,
    reviewsCount: 420,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 43.1,
    netProfitEGP: 1400,
    demandIndex: 96,
    marketRankInEgypt: 5,
    topCompetitorName: 'نون مصر - كافيه إكسبريس',
    merchantOffers: [
      {
        id: 'off-51',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 3250,
        currency: 'ج.م',
        rating: 4.9,
        reviewCount: 420,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  },
  {
    id: 'DEMO-PRD-006',
    sku: 'BTY-AIR-STYLER-IONIC',
    barcode: '6224009812069',
    title: 'مصفف وفرد شعر حراري بالأيونات سيراميك تورمالين سريع التسخين شاشة رقمية',
    titleEn: 'Ionic Tourmaline Ceramic Hair Straightener & Styler with Digital Display',
    brand: 'جلامور كير (Glamour Care)',
    model: 'GC-ION-450',
    category: 'صحة وعناية شخصية',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 96,
    description: 'مصفف حراري متطور بألواح سيراميك تورمالين مطلية بالكيراتين، تقنية الأيونات السالبة لمنع الهيشان وإضفاء لمعان فائق، تحكم في 6 درجات حرارة تصل إلى 450 فهرنهايت مع خاصية إيقاف التشغيل التلقائي للأمان.',
    estimatedWholesaleCost: 320,
    suggestedRetailPrice: 950,
    currentLowestPrice: 790,
    highestPrice: 1050,
    averagePrice: 850,
    currency: 'ج.م',
    tags: ['عناية شخصية', 'مصفف شعر'],
    quickHighlights: ['تقنية الأيونات السالبة', 'سيراميك تورمالين', 'شاشة رقمية'],
    specs: [],
    priceTrend: 'stable',
    inStock: true,
    rating: 4.8,
    reviewsCount: 295,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 59.5,
    netProfitEGP: 470,
    demandIndex: 93,
    marketRankInEgypt: 6,
    topCompetitorName: 'جوميا مصر - بيوتي بلازا',
    merchantOffers: [
      {
        id: 'off-61',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 790,
        currency: 'ج.م',
        rating: 4.8,
        reviewCount: 295,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  },
  {
    id: 'DEMO-PRD-007',
    sku: 'LUG-FIB-SET-3PCS',
    barcode: '6224009812076',
    title: 'طقم حقائب سفر أمتعة فايبر مرنة 3 قطع كفرات مزدوجة 360 درجة وقفل أمان TSA',
    titleEn: '3-Piece Lightweight Flexible Polycarbonate Luggage Set with TSA Lock',
    brand: 'فوياجر مصر (Voyager EG)',
    model: 'VY-SET-3TSA',
    category: 'أزياء وحقائب سفر',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
    confidenceScore: 97,
    description: 'طقم حقائب سفر فاخر مكون من 3 مقاسات (20 بوصة كابينة طائرة + 24 بوصة متوسطة + 28 بوصة كبيرة عائلية)، مصنوع من مادة البولي كربونات غير القابلة للكسر وخفيفة الوزن، 4 عجلات مزدوجة ناعمة الحركة وقفل أرقام TSA معتمد.',
    estimatedWholesaleCost: 2100,
    suggestedRetailPrice: 4500,
    currentLowestPrice: 3850,
    highestPrice: 4800,
    averagePrice: 4100,
    currency: 'ج.م',
    tags: ['حقائب سفر', 'سفر وسياحة'],
    quickHighlights: ['طقم 3 قطع متدرج', 'قفل أمان TSA معتمد', 'عجلات مزدوجة 360'],
    specs: [],
    priceTrend: 'down',
    inStock: true,
    rating: 4.9,
    reviewsCount: 164,
    sellerId: 'AMZ-EG-STARSTEEL',
    merchantSynced: true,
    isUserImported: true,
    profitMarginPercent: 45.5,
    netProfitEGP: 1750,
    demandIndex: 89,
    marketRankInEgypt: 7,
    topCompetitorName: 'نون مصر - ترافيل ليدرز',
    merchantOffers: [
      {
        id: 'off-71',
        merchantName: 'متجر التاجر المعتمد (أنت)',
        storeType: 'online',
        platform: 'amazon_eg',
        price: 3850,
        currency: 'ج.م',
        rating: 4.9,
        reviewCount: 164,
        deliveryTime: 'يوم عمل واحد',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        isBestDeal: true
      }
    ]
  }
];

export const FALLBACK_DEMO_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-demo-cai-101',
    orderNumber: 'ORD-EG-2026-9811',
    platformSource: 'amazon_eg',
    platformSourceName: 'أمازون مصر (Amazon Egypt)',
    customerName: 'م. حسام الدين عبد الرحمن',
    customerPhone: '01098231455',
    customerEmail: 'hossam.elsharkawy@gmail.com',
    governorate: 'القاهرة',
    fullAddress: 'شارع التسعين الشمالي، التجمع الخامس، مبنى 14B الدور الثاني شقة 204',
    createdAt: '2026-10-17T08:15:00Z',
    scheduledDispatchDate: '2026-10-18T16:00:00Z',
    orderStatus: 'scheduled',
    paymentMethod: 'cod',
    isPaid: false,
    totalShippingFeeEGP: 0,
    subtotalEGP: 2650,
    discountEGP: 0,
    grandTotalEGP: 2650,
    notes: 'برجاء الاتصال قبل الوصول بنصف ساعة. العمارة بجوار مسجد الحمد.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-101',
        productId: 'DEMO-PRD-001',
        productTitle: 'مكتب عمل ومذاكرة هيدروليك معدني مقاوم للخدش 120×60 سم - أسود مطفي (star steel)',
        sku: 'DSK-HYD-120-BLK',
        quantity: 1,
        unitPrice: 2650,
        totalPrice: 2650,
        productImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
        courierId: 'bosta',
        courierName: 'بوسطة للشحن السريع (Bosta)',
        waybillNumber: 'BST-EG-8829104',
        weightKg: 14.5,
        warehouseLocation: 'مخزن القاهرة الرئيسي - رف A-12',
        itemStatus: 'ready_for_pickup',
        shippingFeeEGP: 0,
        barcode: '6224009812014',
        generatedAt: '2026-10-17T08:15:00Z'
      }
    ]
  },
  {
    id: 'ord-demo-gza-102',
    orderNumber: 'ORD-EG-2026-9812',
    platformSource: 'noon_eg',
    platformSourceName: 'نون مصر (Noon Partners)',
    customerName: 'د. سارة محمود خليل',
    customerPhone: '01124589920',
    customerEmail: 'dr.sara.khalil@outlook.com',
    governorate: 'الجيزة',
    fullAddress: 'الشيخ زايد، الحي الثامن، كمبوند الياسمين، فيلا 22 شارع البستان',
    createdAt: '2026-10-17T07:45:00Z',
    scheduledDispatchDate: '2026-10-18T14:00:00Z',
    orderStatus: 'shipped',
    paymentMethod: 'vodafone_cash',
    isPaid: true,
    totalShippingFeeEGP: 0,
    subtotalEGP: 1890,
    discountEGP: 0,
    grandTotalEGP: 1890,
    notes: 'الدفع تم مسبقاً عبر فوري باي. الاستلام في مكتب الأمن عند البوابة.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-102',
        productId: 'DEMO-PRD-002',
        productTitle: 'كرسي مكتب طبي شبكي هيدروليك بمسند رأس داعم للفقرات القطنية 3D',
        sku: 'CHR-MED-MESH-01',
        quantity: 1,
        unitPrice: 1890,
        totalPrice: 1890,
        productImage: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80',
        courierId: 'mylerz',
        courierName: 'مايلرز إكسبريس (Mylerz)',
        waybillNumber: 'MYL-EG-4729104',
        weightKg: 12.0,
        warehouseLocation: 'مخزن القاهرة الرئيسي - رف B-04',
        itemStatus: 'in_transit',
        shippingFeeEGP: 0,
        barcode: '6224009812021',
        generatedAt: '2026-10-17T07:45:00Z'
      }
    ]
  },
  {
    id: 'ord-demo-alx-103',
    orderNumber: 'ORD-EG-2026-9813',
    platformSource: 'amazon_eg',
    platformSourceName: 'أمازون مصر (Amazon Egypt)',
    customerName: 'أ. طارق عبد الرازق إبراهيم',
    customerPhone: '01283391002',
    customerEmail: 'tarek.abdelrazek@yahoo.com',
    governorate: 'الإسكندرية',
    fullAddress: 'طريق الجيش، لوران، برج الكورنيش، الدور 6 شقة 602 بجوار فندق المحروسة',
    createdAt: '2026-10-17T06:30:00Z',
    scheduledDispatchDate: '2026-10-19T13:00:00Z',
    orderStatus: 'scheduled',
    paymentMethod: 'cod',
    isPaid: false,
    totalShippingFeeEGP: 0,
    subtotalEGP: 1289,
    discountEGP: 0,
    grandTotalEGP: 1289,
    notes: 'تحصيل نقدي عند الاستلام شاملاً المنتجين معاً.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-103-a',
        productId: 'DEMO-PRD-003',
        productTitle: 'حامل لابتوب ألومنيوم مريح قابل للدوران 360 درجة وتعديل الارتفاع',
        sku: 'ACC-LAP-ALU-360',
        quantity: 1,
        unitPrice: 590,
        totalPrice: 590,
        productImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        courierId: 'aramex',
        courierName: 'أرامكس مصر (Aramex EG)',
        waybillNumber: 'ARX-EG-3392811',
        weightKg: 1.2,
        warehouseLocation: 'مخزن الإسكندرية الفرعي - رف C-01',
        itemStatus: 'ready_for_pickup',
        shippingFeeEGP: 0,
        barcode: '6224009812038',
        generatedAt: '2026-10-17T06:30:00Z'
      },
      {
        id: 'item-demo-103-b',
        productId: 'DEMO-PRD-004',
        productTitle: 'إضاءة ليد ذكية خلف الشاشات RGBIC مع مستشعر صوت وتزامن واي فاي',
        sku: 'LED-RGBIC-TV-STRIP',
        quantity: 1,
        unitPrice: 699,
        totalPrice: 699,
        productImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        courierId: 'aramex',
        courierName: 'أرامكس مصر (Aramex EG)',
        waybillNumber: 'ARX-EG-3392812',
        weightKg: 0.6,
        warehouseLocation: 'مخزن الإسكندرية الفرعي - رف C-03',
        itemStatus: 'ready_for_pickup',
        shippingFeeEGP: 0,
        barcode: '6224009812045',
        generatedAt: '2026-10-17T06:30:00Z'
      }
    ]
  },
  {
    id: 'ord-demo-mns-104',
    orderNumber: 'ORD-EG-2026-9814',
    platformSource: 'noon_eg',
    platformSourceName: 'نون مصر (Noon Partners)',
    customerName: 'أ. ياسمين مصطفى نور',
    customerPhone: '01004928172',
    customerEmail: 'yasmeen.nour2026@gmail.com',
    governorate: 'الدقهلية',
    fullAddress: 'شارع الجمهورية، أمام مجمع المحاكم، عمارة برج النور الدور 4',
    createdAt: '2026-10-17T09:00:00Z',
    scheduledDispatchDate: '2026-10-19T15:00:00Z',
    orderStatus: 'scheduled',
    paymentMethod: 'vodafone_cash',
    isPaid: true,
    totalShippingFeeEGP: 0,
    subtotalEGP: 3250,
    discountEGP: 0,
    grandTotalEGP: 3250,
    notes: 'تم الدفع عبر محفظة فودافون كاش مسبقاً. تغليف ضد الكسر.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-104',
        productId: 'DEMO-PRD-005',
        productTitle: 'ماكينة قهوة إسبريسو وكبسولات متعددة 3 في 1 ضغط 19 بار بمبخر حليب',
        sku: 'APP-COF-3IN1-19BAR',
        quantity: 1,
        unitPrice: 3250,
        totalPrice: 3250,
        productImage: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
        courierId: 'bosta',
        courierName: 'بوسطة للشحن السريع (Bosta)',
        waybillNumber: 'BST-EG-9948210',
        weightKg: 4.8,
        warehouseLocation: 'مخزن القاهرة الرئيسي - رف D-08',
        itemStatus: 'ready_for_pickup',
        shippingFeeEGP: 0,
        barcode: '6224009812052',
        generatedAt: '2026-10-17T09:00:00Z'
      }
    ]
  },
  {
    id: 'ord-demo-tnt-105',
    orderNumber: 'ORD-EG-2026-9815',
    platformSource: 'jumia_eg',
    platformSourceName: 'جوميا مصر (Jumia Seller Center)',
    customerName: 'م. محمد الشناوي',
    customerPhone: '01552940118',
    customerEmail: 'mohamed.shennawy@gmail.com',
    governorate: 'الغربية',
    fullAddress: 'شارع النحاس، تقاطع شارع محب، عمارة الأطباء الدور 3',
    createdAt: '2026-10-16T14:20:00Z',
    scheduledDispatchDate: '2026-10-17T12:00:00Z',
    orderStatus: 'delivered',
    paymentMethod: 'cod',
    isPaid: true,
    totalShippingFeeEGP: 0,
    subtotalEGP: 790,
    discountEGP: 0,
    grandTotalEGP: 790,
    notes: 'تم الاستلام والتحصيل بنجاح بواسطة مندوب جوميا.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-105',
        productId: 'DEMO-PRD-006',
        productTitle: 'مصفف وفرد شعر حراري بالأيونات سيراميك تورمالين سريع التسخين',
        sku: 'BTY-AIR-STYLER-IONIC',
        quantity: 1,
        unitPrice: 790,
        totalPrice: 790,
        productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        courierId: 'jumia_logistics',
        courierName: 'جوميا إكسبريس للخدمات اللوجستية',
        waybillNumber: 'JUM-EG-6629103',
        weightKg: 0.9,
        warehouseLocation: 'مخزن طنطا الفرعي - رف E-02',
        itemStatus: 'delivered',
        shippingFeeEGP: 0,
        barcode: '6224009812069',
        generatedAt: '2026-10-16T14:20:00Z'
      }
    ]
  },
  {
    id: 'ord-demo-ast-106',
    orderNumber: 'ORD-EG-2026-9816',
    platformSource: 'amazon_eg',
    platformSourceName: 'أمازون مصر (Amazon Egypt)',
    customerName: 'أ. أحمد فؤاد النجار',
    customerPhone: '01018273645',
    customerEmail: 'ahmed.elnaggar.eng@gmail.com',
    governorate: 'أسيوط',
    fullAddress: 'شارع الهلالي، أمام ديوان عام المحافظة، عمارة السلام الدور 5',
    createdAt: '2026-10-17T09:40:00Z',
    scheduledDispatchDate: '2026-10-20T17:00:00Z',
    orderStatus: 'scheduled',
    paymentMethod: 'cod',
    isPaid: false,
    totalShippingFeeEGP: 0,
    subtotalEGP: 3850,
    discountEGP: 0,
    grandTotalEGP: 3850,
    notes: 'تحصيل كاش 3,850 ج.م عند باب الشقة.',
    merchantId: 'merchant-star-steel',
    merchantName: 'متجر ستار ستيل المعتمد',
    items: [
      {
        id: 'item-demo-106',
        productId: 'DEMO-PRD-007',
        productTitle: 'طقم حقائب سفر أمتعة فايبر مرنة 3 قطع كفرات مزدوجة وقفل TSA',
        sku: 'LUG-FIB-SET-3PCS',
        quantity: 1,
        unitPrice: 3850,
        totalPrice: 3850,
        productImage: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
        courierId: 'mylerz',
        courierName: 'مايلرز إكسبريس (Mylerz)',
        waybillNumber: 'MYL-EG-7738291',
        weightKg: 10.5,
        warehouseLocation: 'مخزن الصعيد المركزي - رف F-10',
        itemStatus: 'ready_for_pickup',
        shippingFeeEGP: 0,
        barcode: '6224009812076',
        generatedAt: '2026-10-17T09:40:00Z'
      }
    ]
  }
];

export function getFallbackDemoProducts(): FallbackDemoProduct[] {
  return JSON.parse(JSON.stringify(FALLBACK_DEMO_PRODUCTS));
}

export function getFallbackDemoOrders(): CustomerOrder[] {
  return JSON.parse(JSON.stringify(FALLBACK_DEMO_ORDERS));
}

/**
 * Exports products and profit margin analytics to CSV for instant download.
 */
export function exportFallbackCatalogCsv(products?: ProductData[]): void {
  const target = products && products.length > 0 ? products : FALLBACK_DEMO_PRODUCTS;
  const header = ['رمز المنتج (SKU)', 'اسم المنتج', 'العلامة التجارية', 'سعر التكلفة بالجملة (ج.م)', 'سعر البيع المقترح (ج.م)', 'أدنى سعر منافس (ج.م)', 'هامش الربح الصافي (ج.م)', 'نسبة الربح (%)', 'صندوق الشراء (Buy Box)', 'المخزون المتوفر'];
  const rows = target.map(p => {
    const cost = p.estimatedWholesaleCost || 1000;
    const price = p.currentLowestPrice || p.suggestedRetailPrice || 1500;
    const netProfit = Math.max(0, price - cost);
    const marginPercent = price > 0 ? ((netProfit / price) * 100).toFixed(1) : '0';
    return [
      `"${p.sku || p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.brand || 'عام'}"`,
      cost,
      price,
      p.currentLowestPrice || price,
      netProfit,
      `${marginPercent}%`,
      p.merchantOffers?.some(o => o.isBestDeal) ? 'فائز' : 'منافس',
      50
    ].join(',');
  });

  const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `كتالوج_منتجات_التاجر_وهوامش_الارباح_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports Courier Manifest and Waybills list to CSV for instant download.
 */
export function exportFallbackManifestCsv(orders?: CustomerOrder[]): void {
  const target = orders && orders.length > 0 ? orders : FALLBACK_DEMO_ORDERS;
  const header = ['رقم البوليصة', 'شركة الشحن', 'رقم الطلب', 'اسم العميل', 'المحافظة', 'العنوان بالكامل', 'رقم الهاتف', 'المنتج', 'الكمية', 'قيمة التحصيل (COD ج.م)', 'حالة السداد', 'حالة الشحنة'];
  const rows: string[] = [];

  target.forEach(order => {
    order.items.forEach(item => {
      rows.push([
        `"${item.waybillNumber || 'PENDING'}"`,
        `"${item.courierName || 'شركة الشحن المعتمدة'}"`,
        `"${order.orderNumber}"`,
        `"${order.customerName}"`,
        `"${order.governorate}"`,
        `"${order.fullAddress.replace(/"/g, '""')}"`,
        `"${order.customerPhone}"`,
        `"${item.productTitle.replace(/"/g, '""')}"`,
        item.quantity,
        order.isPaid ? '0 (مدفوع)' : item.totalPrice,
        order.isPaid ? 'مدفوع إلكترونياً' : 'تحصيل نقدي عند الباب',
        `"${order.orderStatus === 'delivered' ? 'تم التسليم' : order.orderStatus === 'shipped' ? 'في الطريق' : 'جاهز للتسليم'}"`
      ].join(','));
    });
  });

  const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `كشف_بوالص_الشحن_المعتمدة_للمناديب_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
