import { 
  ProductData, 
  ProductInventoryRecord, 
  InventoryAlertNotification, 
  InventoryStockStatus, 
  ReorderPurchaseOrder,
  WhatsAppSupplierAutomationConfig,
  WhatsAppDispatchLog,
  SupplierProfile,
  SupplierProductQuote
} from '../types';
import { downloadCSV } from '../utils/csvProductManager';
import { calculateSalesVelocityAndEOQ } from '../utils/inventoryVelocityHelper';

const INVENTORY_STORAGE_KEY = 'merchant_radar_inventory_records_v1';
const REORDER_ORDERS_STORAGE_KEY = 'merchant_radar_reorder_orders_v1';
const WHATSAPP_CONFIG_STORAGE_KEY = 'merchant_radar_whatsapp_config_v1';
const WHATSAPP_LOGS_STORAGE_KEY = 'merchant_radar_whatsapp_logs_v1';
export const SUPPLIERS_STORAGE_KEY = 'merchant_radar_suppliers_data_v2';
export const SUPPLIER_QUOTES_STORAGE_KEY = 'merchant_radar_supplier_quotes_v1';

export const DEFAULT_WHATSAPP_TEMPLATE = `السلام عليكم ورحمة الله وبركاته،
تحية طيبة م/ {اسم_المورد} المحترم،

🚨 أمر توريد عاجل لحسابنا التجاري نظراً لوصول المخزون للحد الأدنى:
📦 اسم الصنف: {اسم_المنتج}
🏷️ الكود (SKU): {الكود}
📉 الرصيد الحالي بالمخزن: {المخزون_المتبقي} قطع (حد الطلب الأدنى: {حد_الطلب} قطع)
🔢 الكمية المطلوبة للتوريد: {الكمية_المطلوبة} قطعة
📍 وجهة التسليم: {المستودع}
💰 سعر الجملة المعتمد: {سعر_الجملة} ج.م
💵 إجمالي القيمة التقديرية: {إجمالي_القيمة} ج.م
📅 تاريخ وتوقيت الطلب: {تاريخ_الطلب}

نرجو التكرم بتأكيد استلام الطلب وموعد الشحن المتوقع للمستودع.
شاكرين ومقدرين حسن تعاونكم الدائم.`;

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppSupplierAutomationConfig = {
  autoTriggerEnabled: true,
  customMessageTemplate: DEFAULT_WHATSAPP_TEMPLATE,
  autoRecordPurchaseOrder: true,
  includeWarehouseLocation: true,
  includeEstimatedCost: true,
  webhookUrl: '',
  apiProvider: 'whatsapp_direct'
};

// Egyptian wholesale furniture hubs & industrial cities
export const EGYPTIAN_WAREHOUSES = [
  'مجمع مصانع ومدينة دمياط للأثاث (شطا - دمياط الجديدة)',
  'المنطقة الصناعية للأثاث المكتبي - العاشر من رمضان',
  'منطقة مصانع 6 أكتوبر وبدر لصناعات الأخشاب والأنتريهات',
  'مستودعات خامات الأخشاب والكونتر - السبتية ووسط البلد',
  'مستودع المنصورة وسندوب للأثاث المنزلي وغرف الأطفال',
  'مخزن النزهة والتجمع للأثاث والديكور العصري',
  'مستودع سموحة والمنشية لتوزيع أثاث الإسكندرية والساحل',
  'مجمع ورش الخيزران والروتان - المنصورية والهرم'
];

export const INITIAL_SUPPLIER_PROFILES: SupplierProfile[] = [
  // 1. غرف النوم والأطفال
  {
    id: 'furn-supp-01',
    name: 'مصنع الفهد للأثاث المودرن وغرف النوم (دمياط)',
    phone: '+201019823456',
    leadTimeDays: 3,
    averageDeliveryDays: 2.8,
    deliveryReliability: 98,
    warehouseLocation: 'مجمع مصانع دمياط الجديدة للأخشاب (القطاع أ)',
    notes: 'مصنع معتمد لتصنيع غرف النوم المودرن والماستر، خشب زان روماني طبيعي بدهانات دوكو فرن مقاومة للرطوبة والخدش',
    isPreferred: true,
    category: 'bedroom_kids',
    categoryArabic: 'غرف النوم والأطفال',
    city: 'دمياط الجديدة',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أثاث معتمد',
    speedScore: 'fast',
    pricingTier: 'competitive',
    specialties: ['خشب زان أحمر مجفف', 'إم دي إف تايلاندي مستورد', 'ميكانيزم هيدروليك تركي', 'غرف نوم ماستر كاملة'],
    minimumOrderValue: 25000,
    isVerified: true
  },
  {
    id: 'furn-supp-02',
    name: 'مجمع المنصورة لأثاث الأطفال وغرف الشباب (سندوب)',
    phone: '+201124567891',
    leadTimeDays: 2,
    averageDeliveryDays: 2.1,
    deliveryReliability: 97,
    warehouseLocation: 'مستودع المنصورة وسندوب للأثاث المنزلي وغرف الأطفال',
    notes: 'تخصص غرف أطفال وشبابي آمنة بحواف دائرية، ألوان صديقة للبيئة، إنتاج كميات وتوريد سريع للتجار والمعارض',
    isPreferred: true,
    category: 'bedroom_kids',
    categoryArabic: 'غرف النوم والأطفال',
    city: 'المنصورة (سندوب)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أثاث وغرف أطفال',
    speedScore: 'lightning',
    pricingTier: 'budget',
    specialties: ['سراير دورين خشب سويد وزان', 'غرف أطفال كاملة', 'دواليب سحاب جرار', 'مكاتب مذاكرة أطفال'],
    minimumOrderValue: 15000,
    isVerified: true
  },
  {
    id: 'furn-supp-03',
    name: 'مصانع دمياط المتحدة للأثاث الكلاسيك والنيوكلاسيك (شطا)',
    phone: '+201235678902',
    leadTimeDays: 5,
    averageDeliveryDays: 4.8,
    deliveryReliability: 95,
    warehouseLocation: 'مجمع مصانع ومدينة دمياط للأثاث (شطا - دمياط الجديدة)',
    notes: 'أفخم مصانع الأويما اليدوية والنيوكلاسيك في دمياط، مناسبة للمعارض الراقية وعقود الفنادق والفلل',
    isPreferred: false,
    category: 'bedroom_kids',
    categoryArabic: 'غرف النوم والأطفال',
    city: 'دمياط (طريق شطا)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع كلاسيك ونيوكلاسيك',
    speedScore: 'moderate',
    pricingTier: 'premium',
    specialties: ['أويما دمياطي حفر يدوي دقيق', 'تعتيق ورق ذهب وفضي', 'قشرة أرو وجوز تركي', 'غرف ملكية فاخرة'],
    minimumOrderValue: 40000,
    isVerified: true
  },
  {
    id: 'furn-supp-04',
    name: 'ورش ومصنع البارون لسراير الكابوتونيه والهياكل المبطنة',
    phone: '+201098761234',
    leadTimeDays: 2,
    averageDeliveryDays: 1.9,
    deliveryReliability: 96,
    warehouseLocation: 'مجمع مصانع دمياط الجديدة للأخشاب (القطاع أ)',
    notes: 'توريد فوري بضاعة حاضرة لكافة مقاسات السراير الكابوتونيه وسحارات التخزين الهيدروليكية',
    isPreferred: false,
    category: 'bedroom_kids',
    categoryArabic: 'غرف النوم والأطفال',
    city: 'دمياط (الأعصر)',
    factoryType: 'workshop',
    factoryTypeArabic: 'ورشة تصنيع متخصصة',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['سراير كابوتونيه منجدة', 'قماش قطيفة وجلد مقلوب', 'سحارة تخزين هيدروليك', 'خشب كونتر مفرغ وزان'],
    minimumOrderValue: 12000,
    isVerified: true
  },

  // 2. الصالونات والأنتريهات والركنات
  {
    id: 'furn-supp-05',
    name: 'الشركة المصرية الإيطالية لإسفنج الأثاث عالي الكثافة (6 أكتوبر)',
    phone: '+201004561234',
    leadTimeDays: 1,
    averageDeliveryDays: 1.2,
    deliveryReliability: 99,
    warehouseLocation: 'منطقة مصانع 6 أكتوبر وبدر لصناعات الأخشاب والأنتريهات',
    notes: 'المورد الأول لكبرى ورش ومصانع تنجيد الصالونات بمصر، تقطيع ليزر بأي مقاسات وسمك مع شهادات اختبار الجودة',
    isPreferred: true,
    category: 'living_sofas',
    categoryArabic: 'الصالونات والأنتريهات والركنات',
    city: 'مدينة 6 أكتوبر',
    factoryType: 'raw_materials',
    factoryTypeArabic: 'مورد خامات ومصنع إسفنج',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['إسفنج كثافة 33-36 سوفت وهارد', 'دنلوب طبي عالي المرونة', 'ريبوند مضغوط كثافة 85', 'ضمان 10 سنوات ضد الهبوط'],
    minimumOrderValue: 8000,
    isVerified: true
  },
  {
    id: 'furn-supp-06',
    name: 'مصنع الأندلس لشاسيهات وهياكل الكنب والركنات (طما / دمياط)',
    phone: '+201115672345',
    leadTimeDays: 2,
    averageDeliveryDays: 2.2,
    deliveryReliability: 97,
    warehouseLocation: 'مجمع مصانع ومدينة دمياط للأثاث (شطا - دمياط الجديدة)',
    notes: 'تصنيع شاسيهات الزان المقوى للأنتريهات والركنات مع ميكانيزمات السرير وسحارات التخزين الجاهزة للتنجيد',
    isPreferred: true,
    category: 'living_sofas',
    categoryArabic: 'الصالونات والأنتريهات والركنات',
    city: 'دمياط والدقهلية',
    factoryType: 'workshop',
    factoryTypeArabic: 'مصنع شاسيهات وهياكل خشبية',
    speedScore: 'fast',
    pricingTier: 'budget',
    specialties: ['خشب زان أبيض وروماني معالج حرارياً', 'ميكانيزم كنبة سرير تركي مصفح', 'قواعد شاسيه زنبرك فولاذي', 'هياكل ركنات حرف L و U'],
    minimumOrderValue: 10000,
    isVerified: true
  },
  {
    id: 'furn-supp-07',
    name: 'المتحدة للأقمشة ومستلزمات التنجيد العصرية (وكالة البلح وجسر السويس)',
    phone: '+201226783456',
    leadTimeDays: 1,
    averageDeliveryDays: 1.1,
    deliveryReliability: 98,
    warehouseLocation: 'مستودعات خامات الأخشاب والكونتر - السبتية ووسط البلد',
    notes: 'وكيل مستورد لأحدث كتالوجات أقمشة الكنب والستائر، بضاعة حاضرة وتوصيل فوري لورش التنجيد خلال 24 ساعة',
    isPreferred: false,
    category: 'living_sofas',
    categoryArabic: 'الصالونات والأنتريهات والركنات',
    city: 'القاهرة (جسر السويس والوكالة)',
    factoryType: 'importer_distributor',
    factoryTypeArabic: 'مستورد وموزع معتمد',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['أقمشة كتان معالج ضد البقع', 'فيلفت هيدروفوبيك ووتر بروف', 'جلد مقلوب هافان وبني', 'شرايط شد وسوست استيل'],
    minimumOrderValue: 5000,
    isVerified: true
  },
  {
    id: 'furn-supp-08',
    name: 'مصنع إيليت ليفينج للركنات المودرن والأنتريهات (مدينة بدر والعاشر)',
    phone: '+201557894561',
    leadTimeDays: 4,
    averageDeliveryDays: 3.8,
    deliveryReliability: 96,
    warehouseLocation: 'منطقة مصانع 6 أكتوبر وبدر لصناعات الأخشاب والأنتريهات',
    notes: 'إنتاج ركنات وصالونات عصرية كاملة التشطيب جاهزة للعرض الفوري في صالات البيع والمتاجر الإلكترونية',
    isPreferred: true,
    category: 'living_sofas',
    categoryArabic: 'الصالونات والأنتريهات والركنات',
    city: 'مدينة بدر والعاشر من رمضان',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أثاث مودرن متكامل',
    speedScore: 'fast',
    pricingTier: 'premium',
    specialties: ['ركنات حرف U ومودرن بانوراما', 'أنتريهات ليزي بوي ميكانيزم مريح', 'تنجيد كابتونيه ويدوي فاخر', 'ضمان 5 سنوات'],
    minimumOrderValue: 20000,
    isVerified: true
  },

  // 3. الأثاث المكتبي والمؤسسي
  {
    id: 'furn-supp-09',
    name: 'دلتا تيك أوفيس للأثاث المكتبي والكراسي الطبية (العاشر من رمضان)',
    phone: '+201023456789',
    leadTimeDays: 2,
    averageDeliveryDays: 1.8,
    deliveryReliability: 99,
    warehouseLocation: 'المنطقة الصناعية للأثاث المكتبي - العاشر من رمضان',
    notes: 'أكبر خط إنتاج كراسي مكتب طبية معتمدة وفق المعايير الأوروبية، قطع غيار متوفرة وخدمة صيانة وضمان سنتين',
    isPreferred: true,
    category: 'office_institutional',
    categoryArabic: 'الأثاث المكتبي والمؤسسي',
    city: 'العاشر من رمضان',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أثاث مكتبي وكراسي طبية',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['كراسي شبك طبية هيدروليك Ergonomic', 'ماكينات سينكرو ومساند 3D', 'قواعد نجمية معدنية كروم', 'كراسي مديرين جلد طبيعي وصناعي'],
    minimumOrderValue: 8000,
    isVerified: true
  },
  {
    id: 'furn-supp-10',
    name: 'الأهرام الدولية للمكاتب الإدارية ووحدات العمل Workstations (6 أكتوبر)',
    phone: '+201134567890',
    leadTimeDays: 3,
    averageDeliveryDays: 3.1,
    deliveryReliability: 97,
    warehouseLocation: 'منطقة مصانع 6 أكتوبر وبدر لصناعات الأخشاب والأنتريهات',
    notes: 'تجهيز مكاتب الشركات والمؤسسات الكبرى وحلول الـ Open Space بأسعار جملة تنافسية وجودة تشطيب فائقة',
    isPreferred: true,
    category: 'office_institutional',
    categoryArabic: 'الأثاث المكتبي والمؤسسي',
    city: 'مدينة 6 أكتوبر',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع تجهيزات مكتبية ومقاولات',
    speedScore: 'fast',
    pricingTier: 'competitive',
    specialties: ['مكاتب إدارية خشب ميلامين مقاوم للخدش', 'خلايا عمل وورك ستيشن كول سنتر', 'ترابيزات اجتماعات مودرن', 'كاونترات استقبال فندقية'],
    minimumOrderValue: 15000,
    isVerified: true
  },
  {
    id: 'furn-supp-11',
    name: 'مصنع النصر للهياكل المعدنية ودواليب حفظ الملفات (مسطرد / القليوبية)',
    phone: '+201245678901',
    leadTimeDays: 2,
    averageDeliveryDays: 2.3,
    deliveryReliability: 95,
    warehouseLocation: 'مستودعات خامات الأخشاب والكونتر - السبتية ووسط البلد',
    notes: 'صاج سمك 0.7 إلى 1.2 مم بدهان فرن إلكتروستاتيكي مقاوم للصدأ والخدش مع كوالين أمان مستوردة',
    isPreferred: false,
    category: 'office_institutional',
    categoryArabic: 'الأثاث المكتبي والمؤسسي',
    city: 'القليوبية (مسطرد)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع هياكل معدنية ولوكرات',
    speedScore: 'fast',
    pricingTier: 'budget',
    specialties: ['دواليب صاج مقوى لحفظ الملفات والخرائط', 'لوكرات نوادي وشركات بأقفال أمان', 'مكاتب معدنية بدهان إلكتروستاتيك', 'أرفف مخازن حمولات ثقيلة'],
    minimumOrderValue: 6000,
    isVerified: true
  },
  {
    id: 'furn-supp-12',
    name: 'سمارت ديزاين للتجهيزات المكتبية والحلول الإدارية (العبور)',
    phone: '+201067891234',
    leadTimeDays: 3,
    averageDeliveryDays: 2.7,
    deliveryReliability: 96,
    warehouseLocation: 'مخزن النزهة والتجمع للأثاث والديكور العصري',
    notes: 'تشكيلة واسعة بضاعة حاضرة بمستودع العبور، شحن وتجميع فوري لجميع محافظات مصر',
    isPreferred: false,
    category: 'office_institutional',
    categoryArabic: 'الأثاث المكتبي والمؤسسي',
    city: 'مدينة العبور',
    factoryType: 'importer_distributor',
    factoryTypeArabic: 'موزع رئيسي ومستورد معتمد',
    speedScore: 'fast',
    pricingTier: 'premium',
    specialties: ['أطقم كنب انتظار جلد للمكاتب', 'ترابيزات شاي وخدمة مكتبية', 'شاشات عزل مكتبية بارتفاعات مخصصة', 'كراسي مؤتمرات قابلة للتكديس'],
    minimumOrderValue: 10000,
    isVerified: true
  },

  // 4. مطابخ وغرف طعام
  {
    id: 'furn-supp-13',
    name: 'النخبة لتصنيع المطابخ الحديثة HPL & PolyLac (العبور)',
    phone: '+201145678901',
    leadTimeDays: 4,
    averageDeliveryDays: 3.9,
    deliveryReliability: 98,
    warehouseLocation: 'المنطقة الصناعية للأثاث المكتبي - العاشر من رمضان',
    notes: 'وحدات مطابخ معيارية جاهزة للتركيب الفوري ومقاسات مخصصة، كبس حراري ومقاومة تامة لبخار الماء والرطوبة',
    isPreferred: true,
    category: 'kitchen_dining',
    categoryArabic: 'مطابخ وغرف طعام',
    city: 'مدينة العبور',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع وحدات مطابخ معتمد',
    speedScore: 'fast',
    pricingTier: 'competitive',
    specialties: ['مطابخ HPL هندي وألماني', 'بولي لاك تركي جلوس ماكس', 'شاسيهات كونتر جودوود مقاوم للماء', 'تقفيل شريط بي في سي ليزر'],
    minimumOrderValue: 18000,
    isVerified: true
  },
  {
    id: 'furn-supp-14',
    name: 'رويال تيبول لمصانع ترابيزات السفرة والكراسي الخشبية (دمياط)',
    phone: '+201256789012',
    leadTimeDays: 3,
    averageDeliveryDays: 2.9,
    deliveryReliability: 97,
    warehouseLocation: 'مجمع مصانع ومدينة دمياط للأثاث (شطا - دمياط الجديدة)',
    notes: 'أكثر من 30 موديل ترابيزات سفرة ذكية مدمجة وقابلة للتمديد مع كراسي تنجيد مريح للأسر العصرية',
    isPreferred: true,
    category: 'kitchen_dining',
    categoryArabic: 'مطابخ وغرف طعام',
    city: 'دمياط (السنانية)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع ترابيزات وكراسي سفرة',
    speedScore: 'fast',
    pricingTier: 'competitive',
    specialties: ['ترابيزات سفرة زان مفرودة ومنزلقة', 'كراسي سفرة منجدة قماش معالج', 'بوفيهات ونيش مودرن ليد', 'خشب زان مجفف بدهانات أستر ودوكو'],
    minimumOrderValue: 12000,
    isVerified: true
  },
  {
    id: 'furn-supp-15',
    name: 'إيجيبت كيتشن هاردوير وإكسسوارات المطابخ (السبتية ومدينة نصر)',
    phone: '+201099887766',
    leadTimeDays: 1,
    averageDeliveryDays: 1.0,
    deliveryReliability: 99,
    warehouseLocation: 'مستودعات خامات الأخشاب والكونتر - السبتية ووسط البلد',
    notes: 'المستورد المباشر لإكسسوارات المطابخ التركية والألمانية، أسعار جملة للمصانع والورش بدون وسطاء',
    isPreferred: false,
    category: 'kitchen_dining',
    categoryArabic: 'مطابخ وغرف طعام',
    city: 'القاهرة (السبتية)',
    factoryType: 'importer_distributor',
    factoryTypeArabic: 'مستورد إكسسوارات وهاردوير',
    speedScore: 'lightning',
    pricingTier: 'budget',
    specialties: ['مفصلات هيدروليك سوفت كلوز', 'مجاري أدراج تلسكوبية رولمان بلي', 'سلال ترام وماجيك كورنر', 'مقابض ومجرى ليد إضاءة مخفية'],
    minimumOrderValue: 4000,
    isVerified: true
  },
  {
    id: 'furn-supp-16',
    name: 'مصنع كوريان وأسطح كوارتز مصر (شق الثعبان والقطامية)',
    phone: '+201177665544',
    leadTimeDays: 2,
    averageDeliveryDays: 2.1,
    deliveryReliability: 97,
    warehouseLocation: 'مخزن النزهة والتجمع للأثاث والديكور العصري',
    notes: 'تشكيل وتركيب أسطح المطابخ الكوريان الصناعي والكوارتز بدون لحامات مرئية وضمان 10 سنوات',
    isPreferred: false,
    category: 'kitchen_dining',
    categoryArabic: 'مطابخ وغرف طعام',
    city: 'القاهرة (القطامية وشق الثعبان)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أسطح بديل رخام وكوريان',
    speedScore: 'lightning',
    pricingTier: 'premium',
    specialties: ['أسطح كوريان سامسونج وهانكس', 'رخام كوارتز صناعي مضاد للبقع', 'أحواض مطابخ صب بدون فواصل', 'مقاوم للبكتيريا والحرارة'],
    minimumOrderValue: 10000,
    isVerified: true
  },

  // 5. أثاث الحدائق والديكور الخشبي
  {
    id: 'furn-supp-17',
    name: 'روتان إيجيبت لأثاث الحدائق والآوت دور (الشيخ زايد وطريق الإسكندرية)',
    phone: '+201288776655',
    leadTimeDays: 2,
    averageDeliveryDays: 1.9,
    deliveryReliability: 98,
    warehouseLocation: 'مجمع ورش الخيزران والروتان - المنصورية والهرم',
    notes: 'الرائد في تصنيع أثاث التراسات والحدائق والنوادي بمصر، خامات بلاستيك بيور غير مدور تتحمل حرارة الصيف',
    isPreferred: true,
    category: 'outdoor_decor',
    categoryArabic: 'أثاث الحدائق والديكور الخشبي',
    city: 'الجيزة (الشيخ زايد والصحراوي)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع أثاث حدائق وروتان',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['أطقم روتان بيور معالج ضد UV', 'شاسيهات ألومنيوم مقاومة للصدأ تماماً', 'وسائد وتربروف مضادة للماء والشمس', 'ترابيزات زجاج سيكوريت مقاوم للصدمات'],
    minimumOrderValue: 8000,
    isVerified: true
  },
  {
    id: 'furn-supp-18',
    name: 'أرتيزان للخيزران والبارافانات والديكورات الطبيعية (حارة الروم والمقطم)',
    phone: '+201011223344',
    leadTimeDays: 3,
    averageDeliveryDays: 2.8,
    deliveryReliability: 95,
    warehouseLocation: 'مستودعات خامات الأخشاب والكونتر - السبتية ووسط البلد',
    notes: 'حرف يدوية وتصميمات تراثية وبوهيمية ممتازة للشاليهات والمطاعم والديكورات المنزلية والمكتبية',
    isPreferred: false,
    category: 'outdoor_decor',
    categoryArabic: 'أثاث الحدائق والديكور الخشبي',
    city: 'القاهرة (حارة الروم والمقطم)',
    factoryType: 'workshop',
    factoryTypeArabic: 'ورشة أثاث وحرف يدوية',
    speedScore: 'fast',
    pricingTier: 'budget',
    specialties: ['كراسي خيزران وبامبو طبيعي يدوي', 'بارافانات خشبية مفرغة CNC وزخارف عربية', 'ستائر خيزران وحبال مكرمية', 'طبالي وترابيزات قهوة بوهيمية'],
    minimumOrderValue: 5000,
    isVerified: true
  },
  {
    id: 'furn-supp-19',
    name: 'خشب وفن للديكورات الخشبية والكونسول (النزهة الجديدة والتجمع)',
    phone: '+201122334455',
    leadTimeDays: 2,
    averageDeliveryDays: 1.8,
    deliveryReliability: 97,
    warehouseLocation: 'مخزن النزهة والتجمع للأثاث والديكور العصري',
    notes: 'ديكورات خشبية عصرية سريعة البيع والتسويق الرقمي، خفيفة الشحن ومطلوبة بقوة على أمازون ونون وهومزمارت',
    isPreferred: true,
    category: 'outdoor_decor',
    categoryArabic: 'أثاث الحدائق والديكور الخشبي',
    city: 'القاهرة (النزهة والتجمع)',
    factoryType: 'factory',
    factoryTypeArabic: 'مصنع ديكورات وموبيليا عصرية',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['أرفف عائمة خشب طبيعي وأركت', 'كونسول مداخل مودرن وبديل رخام', 'مرايا بإطارات خشبية وإضاءة ليد', 'وحدات تلفزيون شاشة جدارية معلقة'],
    minimumOrderValue: 6000,
    isVerified: true
  },
  {
    id: 'furn-supp-20',
    name: 'واحة الروتان للأراجيح وأطقم الكافيهات والحدائق (المنصورية والهرم)',
    phone: '+201233445566',
    leadTimeDays: 1,
    averageDeliveryDays: 1.3,
    deliveryReliability: 98,
    warehouseLocation: 'مجمع ورش الخيزران والروتان - المنصورية والهرم',
    notes: 'أكبر منتج لأراجيح الرينج والحدائق بمصر، حديد معالج وشلت قطيفة ووتربروف بجميع الألوان، تسليم فوري',
    isPreferred: false,
    category: 'outdoor_decor',
    categoryArabic: 'أثاث الحدائق والديكور الخشبي',
    city: 'الجيزة (المنصورية والهرم)',
    factoryType: 'workshop',
    factoryTypeArabic: 'مصنع أراجيح ومستلزمات حدائق',
    speedScore: 'lightning',
    pricingTier: 'competitive',
    specialties: ['أراجيح حدائق معلقة مفردة وزوجية', 'شلت مبطنة فايبر سوفت وتر بروف', 'شماسيات هيدروليك كبيرة للحدائق', 'كراسي كافيهات وريزورت بلاستيك بيور'],
    minimumOrderValue: 5000,
    isVerified: true
  }
];

export const EGYPTIAN_SUPPLIERS = INITIAL_SUPPLIER_PROFILES.map(s => ({
  name: s.name,
  phone: s.phone,
  warehouse: s.warehouseLocation,
  leadTimeDays: s.leadTimeDays,
  averageDeliveryDays: s.averageDeliveryDays || s.leadTimeDays,
  category: s.category,
  categoryArabic: s.categoryArabic,
  city: s.city
}));

/**
 * Checks if a supplier record is an obsolete dummy electronic profile that should be purged.
 * Retains all real or user-created suppliers.
 */
export function isDummyElectronicSupplier(s: Partial<SupplierProfile>): boolean {
  if (!s) return false;
  const dummyIds = ['supp-01', 'supp-02', 'supp-03', 'supp-04', 'supp-05'];
  if (s.id && dummyIds.includes(s.id)) return true;

  const text = `${s.name || ''} ${s.notes || ''} ${s.warehouseLocation || ''}`.toLowerCase();
  const dummyKeywords = [
    'إلكترونيات',
    'الكترونيات',
    'شاشات',
    'أجهزة منزلية',
    'اجهزة منزلية',
    'حواسب',
    'قطع الغيار والحواسب',
    'سنتر البستان للتكنولوجيا',
    'البستان للتكنولوجيا',
    'شارع عبد العزيز المركزي',
    'الأجهزة الذكية',
    'الاجهزة الذكية',
    'headphone',
    'electronics'
  ];
  return dummyKeywords.some(kw => text.includes(kw));
}

/**
 * Loads stored suppliers while preserving genuine custom suppliers
 * and removing legacy dummy electronic profiles.
 */
export function getStoredSuppliers(): SupplierProfile[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out old dummy electronics suppliers
        const cleanSuppliers = parsed.filter(s => !isDummyElectronicSupplier(s));
        
        // Preserve any custom user-added suppliers that aren't in INITIAL_SUPPLIER_PROFILES
        const initialMap = new Map(INITIAL_SUPPLIER_PROFILES.map(s => [s.id, s]));
        const customUserSuppliers: SupplierProfile[] = [];

        cleanSuppliers.forEach(s => {
          if (!initialMap.has(s.id)) {
            // Keep user-added custom supplier
            customUserSuppliers.push({
              ...s,
              averageDeliveryDays: s.averageDeliveryDays ?? s.leadTimeDays ?? 2.5,
              deliveryReliability: s.deliveryReliability ?? 95,
              speedScore: s.speedScore || (s.leadTimeDays <= 1 ? 'lightning' : s.leadTimeDays <= 3 ? 'fast' : 'moderate'),
              pricingTier: s.pricingTier || 'competitive',
              category: s.category || 'office_institutional',
              categoryArabic: s.categoryArabic || 'أثاث متنوع'
            });
          }
        });

        // Merge INITIAL_SUPPLIER_PROFILES with any user custom suppliers
        const finalSuppliers = [...customUserSuppliers, ...INITIAL_SUPPLIER_PROFILES];
        
        // Sync clean data back to storage if any dummy was purged
        if (cleanSuppliers.length !== parsed.length || customUserSuppliers.length > 0) {
          saveStoredSuppliers(finalSuppliers);
        }
        
        return finalSuppliers;
      }
    }
  } catch {
    // safe fallback
  }
  return INITIAL_SUPPLIER_PROFILES;
}

export function saveStoredSuppliers(suppliers: SupplierProfile[]): void {
  try {
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
  } catch {
    // safe fallback
  }
}

/**
 * Retrieves custom supplier quotes mapped by `${productId}_${supplierId}`.
 */
export function getStoredSupplierQuotes(): Record<string, SupplierProductQuote> {
  try {
    const raw = localStorage.getItem(SUPPLIER_QUOTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch {
    // safe fallback
  }
  return {};
}

/**
 * Persists a single supplier quote for a product in localStorage.
 */
export function saveStoredSupplierQuote(quote: SupplierProductQuote): void {
  try {
    const current = getStoredSupplierQuotes();
    const key = `${quote.productId}_${quote.supplierId}`;
    current[key] = {
      ...quote,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(SUPPLIER_QUOTES_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // safe fallback
  }
}

/**
 * Returns the effective price quotation for a supplier on a specific product,
 * falling back to a deterministic realistic Egyptian wholesale market quote.
 */
export function getEffectiveSupplierQuote(
  productId: string,
  supplier: SupplierProfile,
  baseWholesaleCost: number
): { wholesalePrice: number; minOrderQuantity: number; isCustomQuote: boolean; note?: string } {
  const quotes = getStoredSupplierQuotes();
  const key = `${productId}_${supplier.id}`;
  if (quotes[key]?.wholesalePrice) {
    return {
      wholesalePrice: quotes[key].wholesalePrice,
      minOrderQuantity: quotes[key].minOrderQuantity || 10,
      isCustomQuote: true,
      note: quotes[key].note
    };
  }

  // Realistic market differentiation multipliers for Egyptian furniture factories & suppliers:
  // - Raw material & workshop suppliers offer lower unit price on volume
  // - High-speed instant delivery carries a modest premium for instant dispatch
  let multiplier = 1.0;
  let minOrder = 5;
  let defaultNote = 'سعر المصنع المعتمد توريد جملة كاش';

  if (supplier.pricingTier === 'budget') {
    multiplier = 0.94;
    minOrder = 10;
    defaultNote = 'أرخص سعر توريد للمعارض والمصانع (خصم كميات)';
  } else if (supplier.pricingTier === 'competitive') {
    multiplier = 0.98;
    minOrder = 5;
    defaultNote = 'سعر منافس مباشر تسليم أرض المعرض';
  } else if (supplier.pricingTier === 'premium') {
    multiplier = 1.04;
    minOrder = 3;
    defaultNote = 'خامات ممتازة وضمان تشطيب عالي الجودة';
  } else if (supplier.pricingTier === 'luxury') {
    multiplier = 1.09;
    minOrder = 2;
    defaultNote = 'تشطيب ملكي فاخر وخامات مستوردة';
  }

  // Adjust slightly for speed: instant delivery / express stock
  if (supplier.speedScore === 'lightning') {
    defaultNote += ' • تسليم فوري بضاعة حاضرة خلال 24-48 ساعة';
  } else if (supplier.speedScore === 'fast') {
    defaultNote += ' • توريد سريع خلال 2-3 أيام عمل';
  } else if (supplier.speedScore === 'moderate') {
    defaultNote += ' • تصنيع ومطابقة مواصفات خلال 5 أيام';
  }

  const calculated = Math.round(baseWholesaleCost * multiplier);
  return {
    wholesalePrice: Math.max(50, calculated),
    minOrderQuantity: minOrder,
    isCustomQuote: false,
    note: defaultNote
  };
}

/**
 * Calculates stock status based on current stock, min reorder level, and max capacity.
 */
export function calculateStockStatus(
  currentStock: number,
  minReorderLevel: number,
  maxStockLevel: number = 100
): InventoryStockStatus {
  if (currentStock <= 1) {
    return 'critical_stockout';
  }
  if (currentStock <= minReorderLevel) {
    return 'at_reorder_point';
  }
  if (currentStock <= minReorderLevel * 1.5) {
    return 'low_stock';
  }
  if (currentStock > maxStockLevel * 0.9) {
    return 'excess';
  }
  return 'healthy';
}

/**
 * Generates initial inventory profile for products, deliberately setting
 * a couple of items at/below the reorder point to demonstrate immediate alert notifications.
 */
export function generateInitialInventory(products: ProductData[]): ProductInventoryRecord[] {
  const uniqueProductsMap = new Map<string, ProductData>();
  (products || []).forEach(p => {
    if (p && p.id) {
      uniqueProductsMap.set(p.id, p);
    }
  });
  const uniqueProducts = Array.from(uniqueProductsMap.values());

  return uniqueProducts.map((product, idx) => {
    const wholesaleCost = product.estimatedWholesaleCost || 1000;
    const supplier = EGYPTIAN_SUPPLIERS[idx % EGYPTIAN_SUPPLIERS.length];
    const warehouse = supplier.warehouse;

    // Daily estimated sales burn rate (between 1.5 and 5.5 units/day)
    const dailyBurnRate = Number((2.0 + (idx * 0.7) % 3.5).toFixed(1));

    // Preset scenarios:
    // Item 0: below reorder level (Active critical alert!)
    // Item 1: right at reorder level (Active reorder warning!)
    // Item 2: out of stock / critical (1 unit left)
    // Other items: healthy stock
    let currentStock: number;
    let minReorderLevel: number;
    let reorderQuantity: number;
    let maxStockLevel: number;
    const safetyStock: number = 4;

    if (idx === 0) {
      // e.g. Anker Q30: 4 units left, reorder at 10 -> ALERT!
      minReorderLevel = 10;
      currentStock = 4;
      reorderQuantity = 30;
      maxStockLevel = 60;
    } else if (idx === 1) {
      // e.g. Second product: 5 units left, reorder at 8 -> ALERT!
      minReorderLevel = 8;
      currentStock = 5;
      reorderQuantity = 25;
      maxStockLevel = 50;
    } else if (idx === 2) {
      // Third product: 1 unit left -> CRITICAL!
      minReorderLevel = 6;
      currentStock = 1;
      reorderQuantity = 20;
      maxStockLevel = 40;
    } else {
      minReorderLevel = 5 + (idx % 4) * 2;
      currentStock = minReorderLevel + 12 + (idx * 5) % 25;
      reorderQuantity = 20 + (idx % 3) * 10;
      maxStockLevel = 80;
    }

    const stockStatus = calculateStockStatus(currentStock, minReorderLevel, maxStockLevel);
    const daysOfSupplyLeft = dailyBurnRate > 0 ? Number((currentStock / dailyBurnRate).toFixed(1)) : 99;

    return {
      productId: product.id,
      sku: product.sku || `SKU-${product.id.slice(0, 8).toUpperCase()}`,
      barcode: product.barcode || `622${100000000 + idx}`,
      currentStock,
      minReorderLevel,
      reorderQuantity,
      maxStockLevel,
      safetyStock,
      warehouseLocation: warehouse,
      supplierName: supplier.name,
      supplierPhone: supplier.phone,
      leadTimeDays: supplier.leadTimeDays,
      dailyBurnRate,
      daysOfSupplyLeft,
      stockStatus,
      lastRestockedAt: new Date(Date.now() - (idx + 2) * 86400000 * 3).toISOString().split('T')[0],
      costPerUnitEGP: wholesaleCost,
      totalInventoryValuationEGP: currentStock * wholesaleCost,
      reservedStock: Math.min(Math.floor(currentStock * 0.2), 3),
      incomingStock: idx === 0 ? 30 : 0
    };
  });
}

/**
 * Loads inventory from localStorage or initializes defaults.
 */
export function getStoredInventory(products: ProductData[]): ProductInventoryRecord[] {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (raw) {
      const parsed: ProductInventoryRecord[] = JSON.parse(raw);
      // Ensure all current products are accounted for
      const existingMap = new Map(parsed.map(item => [item.productId, item]));
      const defaults = generateInitialInventory(products);
      
      const merged = defaults.map(def => {
        const found = existingMap.get(def.productId);
        if (found) {
          // Re-evaluate stock status and valuation
          const status = calculateStockStatus(found.currentStock, found.minReorderLevel, found.maxStockLevel);
          const daysLeft = found.dailyBurnRate > 0 ? Number((found.currentStock / found.dailyBurnRate).toFixed(1)) : 99;
          return {
            ...found,
            stockStatus: status,
            daysOfSupplyLeft: daysLeft,
            costPerUnitEGP: def.costPerUnitEGP,
            totalInventoryValuationEGP: found.currentStock * def.costPerUnitEGP
          };
        }
        return def;
      });

      return merged;
    }
  } catch {
    // safe fallback
  }

  const initial = generateInitialInventory(products);
  saveStoredInventory(initial);
  return initial;
}

/**
 * Persists inventory records to localStorage.
 */
export function saveStoredInventory(records: ProductInventoryRecord[]): void {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // safe fallback
  }
}

/**
 * Loads and saves Reorder Purchase Orders
 */
export function getStoredReorders(): ReorderPurchaseOrder[] {
  try {
    const raw = localStorage.getItem(REORDER_ORDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return [];
}

export function saveStoredReorders(orders: ReorderPurchaseOrder[]): void {
  try {
    localStorage.setItem(REORDER_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // safe fallback
  }
}

/**
 * Checks which products have reached or dropped below their minimum reorder level
 * and generates actionable alerts.
 */
export const DISMISSED_ALERTS_STORAGE_KEY = 'merchant_radar_dismissed_alerts_v1';

export function getDismissedAlertIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveDismissedAlertIds(ids: string[]): void {
  try {
    localStorage.setItem(DISMISSED_ALERTS_STORAGE_KEY, JSON.stringify(ids.slice(0, 200)));
  } catch {}
}

/**
 * Proactive Inventory Alerts Analyzer:
 * Analyzes both traditional reorder points AND dynamic sales velocity (burn rate)
 * to catch stockout risks before supplier lead time, and calculates optimal reorder quantity (EOQ)
 * to suggest holding cost reduction alerts.
 */
export function checkInventoryReorderAlerts(
  inventory: ProductInventoryRecord[],
  products: ProductData[]
): InventoryAlertNotification[] {
  const prodMap = new Map(products.map(p => [p.id, p]));
  const alerts: InventoryAlertNotification[] = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  inventory.forEach(inv => {
    const prod = prodMap.get(inv.productId);
    const title = prod?.title || inv.sku;
    const analysis = calculateSalesVelocityAndEOQ(inv, prod);

    // 1. Proactive Velocity Alert: High sales velocity will cause stockout before supplier delivery!
    if (analysis.isProactiveUrgent) {
      alerts.push({
        id: `alert-proactive-velocity-${inv.productId}`,
        productId: inv.productId,
        productTitle: title,
        sku: inv.sku,
        currentStock: inv.currentStock,
        minReorderLevel: inv.minReorderLevel,
        reorderQuantity: inv.reorderQuantity,
        severity: 'critical',
        triggeredAt: timeStr,
        isRead: false,
        supplierName: inv.supplierName,
        supplierPhone: inv.supplierPhone,
        warehouseLocation: inv.warehouseLocation,
        alertType: 'proactive_velocity',
        dailyVelocity: analysis.dailyVelocity,
        daysUntilStockout: analysis.daysUntilStockout,
        leadTimeDays: inv.leadTimeDays,
        optimalReorderQty: analysis.optimalReorderQty,
        holdingCostSavingsAnnualEGP: analysis.holdingCostSavingsAnnualEGP,
        message: `🚨 خطر نفاد استباقي عاجل! معدل سرعة البيع (${analysis.dailyVelocity} قطعة/يوم) سيؤدي لنفاد المخزون خلال (${analysis.daysUntilStockout} يوم)، بينما يستغرق المورد (${inv.supplierName}) مدة (${inv.leadTimeDays} أيام) للتوريد. اطلب كمية إعادة الطلب المثالية (${analysis.optimalReorderQty} قطعة) فوراً!`
      });
    } 
    // 2. Critical Stockout (0-1 units)
    else if (inv.currentStock <= 1) {
      alerts.push({
        id: `alert-critical-stockout-${inv.productId}-${inv.currentStock}`,
        productId: inv.productId,
        productTitle: title,
        sku: inv.sku,
        currentStock: inv.currentStock,
        minReorderLevel: inv.minReorderLevel,
        reorderQuantity: inv.reorderQuantity,
        severity: 'critical',
        triggeredAt: timeStr,
        isRead: false,
        supplierName: inv.supplierName,
        supplierPhone: inv.supplierPhone,
        warehouseLocation: inv.warehouseLocation,
        alertType: 'critical_stockout',
        dailyVelocity: analysis.dailyVelocity,
        daysUntilStockout: analysis.daysUntilStockout,
        leadTimeDays: inv.leadTimeDays,
        optimalReorderQty: analysis.optimalReorderQty,
        holdingCostSavingsAnnualEGP: analysis.holdingCostSavingsAnnualEGP,
        message: `🚨 خطر نفاد تام وشيك! المخزون المتبقي (${inv.currentStock} قطعة فقط) بينما حد الطلب الأدنى هو (${inv.minReorderLevel} قطع). كمية التوريد المقترحة: ${analysis.optimalReorderQty || inv.reorderQuantity} قطعة.`
      });
    }
    // 3. Standard Reorder Point reached
    else if (inv.currentStock <= inv.minReorderLevel) {
      alerts.push({
        id: `alert-reorder-point-${inv.productId}-${inv.currentStock}`,
        productId: inv.productId,
        productTitle: title,
        sku: inv.sku,
        currentStock: inv.currentStock,
        minReorderLevel: inv.minReorderLevel,
        reorderQuantity: inv.reorderQuantity,
        severity: 'warning',
        triggeredAt: timeStr,
        isRead: false,
        supplierName: inv.supplierName,
        supplierPhone: inv.supplierPhone,
        warehouseLocation: inv.warehouseLocation,
        alertType: 'reorder_point',
        dailyVelocity: analysis.dailyVelocity,
        daysUntilStockout: analysis.daysUntilStockout,
        leadTimeDays: inv.leadTimeDays,
        optimalReorderQty: analysis.optimalReorderQty,
        holdingCostSavingsAnnualEGP: analysis.holdingCostSavingsAnnualEGP,
        message: `⚠️ تنبيه حد الطلب الأدنى: المخزون وصل إلى (${inv.currentStock} قطعة). كمية التوريد المثالية المقترحة: ${analysis.optimalReorderQty || inv.reorderQuantity} قطعة.`
      });
    }

    // 4. Storage Holding Cost Optimization (EOQ Opportunity) Alert
    if (analysis.holdingCostSavingsAnnualEGP >= 350 && !analysis.isProactiveUrgent && inv.currentStock > inv.minReorderLevel) {
      alerts.push({
        id: `alert-eoq-savings-${inv.productId}`,
        productId: inv.productId,
        productTitle: title,
        sku: inv.sku,
        currentStock: inv.currentStock,
        minReorderLevel: inv.minReorderLevel,
        reorderQuantity: inv.reorderQuantity,
        severity: 'info',
        triggeredAt: timeStr,
        isRead: false,
        supplierName: inv.supplierName,
        supplierPhone: inv.supplierPhone,
        warehouseLocation: inv.warehouseLocation,
        alertType: 'optimal_reorder_savings',
        dailyVelocity: analysis.dailyVelocity,
        daysUntilStockout: analysis.daysUntilStockout,
        leadTimeDays: inv.leadTimeDays,
        optimalReorderQty: analysis.optimalReorderQty,
        holdingCostSavingsAnnualEGP: analysis.holdingCostSavingsAnnualEGP,
        message: `💡 فرصة توفير تكاليف التخزين (EOQ): كمية الطلب الحالية (${inv.reorderQuantity} قطعة) أعلى من المطلوب وتكلفك مساحة تخزين زائدة. خفض الدفعة إلى (${analysis.optimalReorderQty} قطعة) سيوفر ${analysis.holdingCostSavingsAnnualEGP.toLocaleString()} ج.م سنوياً!`
      });
    }
  });

  return alerts;
}

/**
 * Persists and retrieves WhatsApp Supplier Automation configuration.
 */
export function getStoredWhatsAppConfig(): WhatsAppSupplierAutomationConfig {
  try {
    const raw = localStorage.getItem(WHATSAPP_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WHATSAPP_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // safe fallback
  }
  return DEFAULT_WHATSAPP_CONFIG;
}

export function saveStoredWhatsAppConfig(config: WhatsAppSupplierAutomationConfig): void {
  try {
    localStorage.setItem(WHATSAPP_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // safe fallback
  }
}

/**
 * Loads and saves WhatsApp dispatch history logs.
 */
export function getStoredWhatsAppLogs(): WhatsAppDispatchLog[] {
  try {
    const raw = localStorage.getItem(WHATSAPP_LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // safe fallback
  }
  return [];
}

export function saveStoredWhatsAppLogs(logs: WhatsAppDispatchLog[]): void {
  try {
    localStorage.setItem(WHATSAPP_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // keep latest 100
  } catch {
    // safe fallback
  }
}

/**
 * Renders the WhatsApp automated message replacing all dynamic tokens.
 */
export function renderAutomatedWhatsAppMessage(
  record: ProductInventoryRecord,
  product: ProductData,
  quantityToOrder?: number,
  template?: string
): string {
  const tpl = template || DEFAULT_WHATSAPP_TEMPLATE;
  const qty = quantityToOrder || record.reorderQuantity || 20;
  const totalCost = qty * record.costPerUnitEGP;
  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' - ' + new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const supplierFirstName = record.supplierName.split(' ')[0] || 'المورد المحترم';

  return tpl
    .replace(/{اسم_المورد}/g, record.supplierName || 'المورد المحترم')
    .replace(/{اسم_المورد_الأول}/g, supplierFirstName)
    .replace(/{اسم_المنتج}/g, product.title || record.sku)
    .replace(/{الكود}/g, record.sku)
    .replace(/{المخزون_المتبقي}/g, String(record.currentStock))
    .replace(/{حد_الطلب}/g, String(record.minReorderLevel))
    .replace(/{الكمية_المطلوبة}/g, String(qty))
    .replace(/{المستودع}/g, record.warehouseLocation || 'المستودع الرئيسي')
    .replace(/{سعر_الجملة}/g, record.costPerUnitEGP ? record.costPerUnitEGP.toLocaleString() : '0')
    .replace(/{إجمالي_القيمة}/g, totalCost ? totalCost.toLocaleString() : '0')
    .replace(/{تاريخ_الطلب}/g, dateStr);
}

/**
 * Builds direct WhatsApp URL with cleaned phone and encoded text
 */
export function getWhatsAppDeepLink(phone: string, text: string): string {
  // Normalize Egyptian phone or international phone (e.g. +201012345678 -> 201012345678, 01012345678 -> 201012345678)
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '2' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates ready-to-send WhatsApp purchase order message for Egyptian suppliers.
 */
export function createWhatsAppSupplierReorderMessage(
  record: ProductInventoryRecord,
  product: ProductData,
  quantityToOrder?: number,
  template?: string
): string {
  const text = renderAutomatedWhatsAppMessage(record, product, quantityToOrder, template);
  return encodeURIComponent(text);
}

/**
 * Exports current inventory and reorder thresholds to a structured CSV with UTF-8 BOM.
 */
export function exportInventoryToCSV(
  inventory: ProductInventoryRecord[],
  products: ProductData[],
  currency: string = 'EGP'
): void {
  const prodMap = new Map(products.map(p => [p.id, p]));
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG');
  const timeStr = now.toLocaleTimeString('ar-EG');

  let csv = '\uFEFF'; // UTF-8 BOM for Arabic Excel
  csv += `تقرير تتبع مستويات المخزون وحدود الطلب - رادار التاجر الذكي\r\n`;
  csv += `تاريخ التقرير,${dateStr} ${timeStr},العملة,ج.م (EGP)\r\n`;
  csv += `إجمالي الأصناف,${inventory.length},الأصناف عند حد الطلب,${inventory.filter(i => i.currentStock <= i.minReorderLevel).length}\r\n\r\n`;

  // Headers
  csv += [
    'كود الصنف (SKU)',
    'اسم المنتج',
    'التصنيف',
    'المخزون الحالي (قطع)',
    'حد الطلب الأدنى (Reorder Point)',
    'كمية التوريد المقترحة',
    'حالة المخزون',
    'معدل السحب اليومي (قطع/يوم)',
    'أيام التغطية المتبقية',
    'تكلفة الجملة للوحدة (ج.م)',
    'إجمالي قيمة المخزون (ج.م)',
    'المستودع',
    'المورد المعتمد',
    'رقم هاتف المورد'
  ].join(',') + '\r\n';

  inventory.forEach(item => {
    const prod = prodMap.get(item.productId);
    const title = `"${(prod?.title || item.sku).replace(/"/g, '""')}"`;
    const category = `"${(prod?.category || 'عام').replace(/"/g, '""')}"`;
    const statusText = 
      item.stockStatus === 'critical_stockout' ? 'نفاد حرج 🚨' :
      item.stockStatus === 'at_reorder_point' ? 'عند حد الطلب الأدنى ⚠️' :
      item.stockStatus === 'low_stock' ? 'مخزون منخفض ⚡' :
      item.stockStatus === 'excess' ? 'فائض مخزون 📦' : 'مخزون صحي ومستقر ✅';

    csv += [
      item.sku,
      title,
      category,
      item.currentStock,
      item.minReorderLevel,
      item.reorderQuantity,
      `"${statusText}"`,
      item.dailyBurnRate,
      item.daysOfSupplyLeft,
      item.costPerUnitEGP,
      item.totalInventoryValuationEGP,
      `"${item.warehouseLocation}"`,
      `"${item.supplierName}"`,
      `"${item.supplierPhone}"`
    ].join(',') + '\r\n';
  });

  // Strip leading BOM since downloadCSV already prepends UTF-8 BOM
  const cleanedContent = csv.startsWith('\uFEFF') ? csv.slice(1) : csv;
  downloadCSV(cleanedContent, `تقرير_مستويات_المخزون_وحدود_الطلب_${now.toISOString().split('T')[0]}.csv`);
}
