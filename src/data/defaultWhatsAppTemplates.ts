import { WhatsAppAlertTemplate, WhatsAppTemplateVariable } from '../types';

export const WHATSAPP_TEMPLATE_VARIABLES: WhatsAppTemplateVariable[] = [
  {
    key: '{merchant_name}',
    label: 'اسم التاجر / المتجر',
    exampleValue: 'متجر الصفوة للتجارة',
    description: 'اسم التاجر أو اسم متجر الشريك المستهدف'
  },
  {
    key: '{product_name}',
    label: 'اسم المنتج',
    exampleValue: 'سماعة أنكر لايف كيو 30 اللاسلكية',
    description: 'عنوان المنتج الكامل في السوق'
  },
  {
    key: '{old_price}',
    label: 'سعرك السابق',
    exampleValue: '2,890',
    description: 'سعر بيع التاجر قبل التغيير'
  },
  {
    key: '{new_price}',
    label: 'سعر المنافس الجديد',
    exampleValue: '2,699',
    description: 'أقل سعر رصده الرادار لدى المنافس'
  },
  {
    key: '{drop_amount}',
    label: 'مقدار الانخفاض',
    exampleValue: '191',
    description: 'فارق الهبوط بالجنيه المصري'
  },
  {
    key: '{drop_percent}',
    label: 'نسبة التغير %',
    exampleValue: '7',
    description: 'النسبة المئوية لهبوط السعر'
  },
  {
    key: '{competitor_name}',
    label: 'اسم المنافس والمنصة',
    exampleValue: 'بي تك (B.TECH) على أمازون مصر',
    description: 'المتجر أو المنصة التي خفضت السعر'
  },
  {
    key: '{recommended_price}',
    label: 'السعر الفائز المقترح',
    exampleValue: '2,645',
    description: 'سعر الفوز بالباي بوكس المقترح من الرادار'
  },
  {
    key: '{profit_margin}',
    label: 'هامش الربح %',
    exampleValue: '21',
    description: 'نسبة صافي الربح المحققة'
  },
  {
    key: '{stock_status}',
    label: 'حالة المخزون',
    exampleValue: 'متبقي 18 قطعة فقط (منخفض)',
    description: 'مستوى المخزون الحالي للتاجر'
  },
  {
    key: '{demand_level}',
    label: 'مستوى الطلب الموسمي',
    exampleValue: 'مرتفع جداً (+45% هذا الأسبوع)',
    description: 'مؤشر الطلب في السوق المصري'
  },
  {
    key: '{currency}',
    label: 'العملة',
    exampleValue: 'ج.م',
    description: 'العملة المحلية (ج.م)'
  },
  {
    key: '{reprice_direct_url}',
    label: 'رابط تعديل المنتج المباشر',
    exampleValue: 'https://merchant-radar.eg/reprice?id=B09FURNCHR1&target=3450',
    description: 'رابط ذكي ومباشر لصفحة تعديل وتطبيق السعر داخل التطبيق'
  },
];

export const DEFAULT_WHATSAPP_ALERT_TEMPLATES: WhatsAppAlertTemplate[] = [
  {
    id: 'tpl-price-drop-urgent',
    title: '🚨 تنبيه هبوط سعر منافس وتهديد الباي بوكس',
    description: 'إشعار فوري للتاجر عند قيام منافس بتخفيض سعره لاقتناص الباي بوكس، مع حثه على التعديل السريع.',
    category: 'price_drop',
    triggerEventLabel: 'انخفاض سعر منافس بنسبة > 2%',
    includeDirectRepriceLink: true,
    directLinkDomainPlaceholder: 'https://merchant-radar.eg/reprice',
    sampleMerchantPhone: '+201012345678',
    isDefault: true,
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
    templateBody: `🚨 *تنبيه تسعير عاجل من رادار التاجر الذكي* 🚨

عزيزي التاجر *{merchant_name}*،
تم رصد انخفاض فوري في سعر المنافس للمنتج التالي في السوق المصري:

📦 *المنتج:* {product_name}
📉 *سعر المنافس الجديد:* {new_price} {currency} ({competitor_name})
💰 *سعرك الحالي في المتجر:* {old_price} {currency}
🔻 *فارق السعر الحالي:* {drop_amount} {currency} ({drop_percent}%)

🎯 *السعر الفائز المقترح لاستعادة الصدارة:* *{recommended_price} {currency}*
📊 *هامش ربحك الصافي المحمي:* {profit_margin}%

🔗 *لتعديل السعر فوراً ومزامنة المنصات بنقرة واحدة:*
{reprice_direct_url}

_رادار التاجر الذكي - نظام الرصد الآلي للأسواق المصرية_`
  },
  {
    id: 'tpl-demand-surge-stock',
    title: '🔥 تنبيه ارتفاع الطلب الموسمي ومخاطر نفاد المخزون',
    description: 'إشعار للتاجر عند وجود موجة شراء وبحث قوية على منتج معين مع توصية لطلب كميات وتثبيت السعر المربح.',
    category: 'demand_surge',
    triggerEventLabel: 'ارتفاع مؤشر البحث والطلب الموسمي > 30%',
    includeDirectRepriceLink: true,
    directLinkDomainPlaceholder: 'https://merchant-radar.eg/reprice',
    sampleMerchantPhone: '+201123456789',
    isDefault: false,
    createdAt: '2026-08-21T11:15:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
    templateBody: `🔥 *تنبيه ارتفاع الطلب والفرص الموسمية الكبرى* 🔥

مرحباً *{merchant_name}*،
ترصد محركات الرادار ارتفاعاً حاداً في مؤشر البحث والشراء على المنتج:

📦 *المنتج:* {product_name}
📈 *مستوى الطلب في مصر:* {demand_level}
⚠️ *حالة المخزون المتوفر:* {stock_status}

💡 *توصية التسعير وإدارة المخزون:*
نوصي بالبيع بسعر *{recommended_price} {currency}* لتعظيم هامش الربح ({profit_margin}%)، وننصحك بطلب دفعة توريد إضافية من سوق الجملة قبل انتهاء الذروة.

🔗 *رابط مراجعة المنتج وتفاصيل الطلب والمخزون:*
{reprice_direct_url}

_رادار التاجر الذكي - تحليلات الطلب الموسمي_`
  },
  {
    id: 'tpl-competitor-stockout-gold',
    title: '🏆 فرصة ذهبية: نفاد مخزون المنافسين ورفع السعر',
    description: 'تنبيه باقتناص الفرصة عندما ينفد مخزون المنافسين الأرخص، مما يتيح رفع السعر وزيادة هامش الربح.',
    category: 'competitor_stockout',
    triggerEventLabel: 'نفاد مخزون المنافس (Out of Stock)',
    includeDirectRepriceLink: true,
    directLinkDomainPlaceholder: 'https://merchant-radar.eg/reprice',
    sampleMerchantPhone: '+201223456780',
    isDefault: false,
    createdAt: '2026-08-22T09:00:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
    templateBody: `🏆 *فرصة ذهبية لزيادة هوامش الربح الفوري* 🏆

عزيزي الشريك *{merchant_name}*،
نفد مخزون المنافس الرئيسي *{competitor_name}* على منصات البيع المصرية لمنتج:

📦 *المنتج:* {product_name}
💰 *سعرك القديم:* {old_price} {currency}
🚀 *السعر الجديد الموصى به:* *{recommended_price} {currency}*
💎 *عائد إضافي لصافي الربح:* +{profit_margin}%

أنت الآن صاحب العرض الأسرع تسليماً والأكثر طلباً على المنصة!

🔗 *تطبيق السعر الجديد المرتفع بنقرة واحدة:*
{reprice_direct_url}

_رادار التاجر الذكي - تعظيم العوائد التجارية_`
  },
  {
    id: 'tpl-bulk-reprice-auth',
    title: '📋 إشعار مراجعة واعتماد التحديث السعري المجمع',
    description: 'رسالة إقرار واعتماد تُرسل للتاجر للموافقة على خطة تسعير جماعية أعدها المسوق.',
    category: 'bulk_reprice',
    triggerEventLabel: 'إعداد خطة تعديل أسعار مجمعة',
    includeDirectRepriceLink: true,
    directLinkDomainPlaceholder: 'https://merchant-radar.eg/bulk-reprice',
    sampleMerchantPhone: '+201555555555',
    isDefault: false,
    createdAt: '2026-08-23T14:20:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
    templateBody: `📋 *إشعار خطة التحديث السعري المجمع (Bulk Reprice)* 📋

السيد / *{merchant_name}* المحترم،
قام خبير التسويق بإعداد استراتيجية تسعيرية جديدة لمنتجات متجرك لتحسين المبيعات:

🛒 *المنتج الرئيسي المستهدف:* {product_name}
🏷️ *السعر الجديد المقترح:* {recommended_price} {currency}
🛡️ *هامش الربح الصافي المحمي:* {profit_margin}%

يرجى الضغط على الرابط أدناه لمراجعة جدول الأسعار واعتماد النشر التلقائي على أمازون ونون وجوميا وكنز وهومزمارت:

🔗 *رابط مراجعة واعتماد الأسعار:*
{reprice_direct_url}

_فريق إدارة الحسابات ورادار التسعير_`
  },
  {
    id: 'tpl-profit-margin-audit',
    title: '📊 تدقيق عمولات المنصات (أمازون - نون - كنز - هومزمارت)',
    description: 'تقرير دوري للتاجر يوضح صافي الربح بعد خصم العمولات والشحن والضريبة 14% على كل منصة.',
    category: 'profit_margin_review',
    triggerEventLabel: 'تحديث رسوم المنصات أو المراجعة الأسبوعية',
    includeDirectRepriceLink: true,
    directLinkDomainPlaceholder: 'https://merchant-radar.eg/commissions',
    sampleMerchantPhone: '+201000000001',
    isDefault: false,
    createdAt: '2026-08-24T16:00:00.000Z',
    updatedAt: '2026-08-27T14:30:00.000Z',
    templateBody: `📊 *تقرير تدقيق العمولات وصافي الربح للمنصات* 📊

عزيزي التاجر *{merchant_name}*،
تم فحص هوامش الربح بعد خصم عمولات المنصات وضريبة 14%:

📦 *المنتج:* {product_name}
🏆 *المنصة الأعلى في صافي الربح:* {competitor_name}
💰 *سعر البيع الموصى به:* {recommended_price} {currency}
📈 *هامش الربح الصافي المتوقع:* {profit_margin}%

🔗 *لعرض جدول مقارنة العمولات وتعديل السعر:*
{reprice_direct_url}

_رادار التاجر الذكي_`
  }
];

export function fillTemplateVariables(
  templateText: string,
  params: {
    merchantName?: string;
    productTitle?: string;
    productId?: string;
    oldPrice?: number;
    newPrice?: number;
    dropAmount?: number;
    dropPercent?: number;
    competitorName?: string;
    recommendedPrice?: number;
    profitMarginPercent?: number;
    stockStatus?: string;
    demandLevel?: string;
    currency?: string;
    includeRepriceUrl?: boolean;
    customRepriceUrl?: string;
  }
): string {
  const currency = params.currency || 'ج.م';
  const merchantName = params.merchantName || 'متجر الصفوة للتجارة';
  const productTitle = params.productTitle || 'كرسي مكتب طبي هيدروليك مريح داعم للفقرات القطنية';
  const productId = params.productId || 'B09FURNCHR1';
  const oldPrice = params.oldPrice !== undefined ? params.oldPrice.toLocaleString() : '3,650';
  const newPrice = params.newPrice !== undefined ? params.newPrice.toLocaleString() : '3,450';
  const dropAmount = params.dropAmount !== undefined 
    ? params.dropAmount.toLocaleString() 
    : (params.oldPrice && params.newPrice ? Math.abs(params.oldPrice - params.newPrice).toLocaleString() : '200');
  const dropPercent = params.dropPercent !== undefined ? params.dropPercent.toString() : '6';
  const competitorName = params.competitorName || 'هومزمارت مصر على أمازون';
  const recommendedPrice = params.recommendedPrice !== undefined ? params.recommendedPrice.toLocaleString() : '3,390';
  const profitMargin = params.profitMarginPercent !== undefined ? params.profitMarginPercent.toString() : '21';
  const stockStatus = params.stockStatus || 'متبقي 24 قطعة في المخزن';
  const demandLevel = params.demandLevel || 'مرتفع جداً (+35% هذا الأسبوع)';
  
  // Build direct reprice URL
  const targetPriceParam = params.recommendedPrice || 2645;
  const directRepriceUrl = params.customRepriceUrl 
    || `https://merchant-radar.eg/reprice?id=${productId}&target=${targetPriceParam}&ref=wa_alert`;

  let result = templateText;
  result = result.replace(/{merchant_name}/g, merchantName);
  result = result.replace(/{product_name}/g, productTitle);
  result = result.replace(/{old_price}/g, oldPrice);
  result = result.replace(/{new_price}/g, newPrice);
  result = result.replace(/{drop_amount}/g, dropAmount);
  result = result.replace(/{drop_percent}/g, dropPercent);
  result = result.replace(/{competitor_name}/g, competitorName);
  result = result.replace(/{recommended_price}/g, recommendedPrice);
  result = result.replace(/{profit_margin}/g, profitMargin);
  result = result.replace(/{stock_status}/g, stockStatus);
  result = result.replace(/{demand_level}/g, demandLevel);
  result = result.replace(/{currency}/g, currency);

  if (params.includeRepriceUrl === false) {
    result = result.replace(/{reprice_direct_url}/g, '');
  } else {
    result = result.replace(/{reprice_direct_url}/g, directRepriceUrl);
  }

  return result.trim();
}
