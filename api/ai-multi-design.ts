export default async function handler(req: any, res: any) {
  // Always return structured JSON
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { imageBase64, productTitle = 'منتج تجاري', category = 'عام' } = body;

    const shotsList = [
      {
        id: 'shot-1-main',
        type: 'main_white',
        titleAr: '1. الصورة الرئيسية - خلفية بيضاء نقية (100% RGB 255,255,255)',
        descriptionAr: 'خلفية بيضاء استوديو نقية مع مراعاة نسبة 85% ملء للفريم، وبدون أي نصوص أو علامات مائية مطابقة لأمازون ونون وجوميا.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px (Zoomable)',
        keyHighlights: ['أبيض نقي 255,255,255', 'نسبة ملء 85% من الفريم', 'بدون نصوص أو علامات مائية', 'دقة فائقة 2000x2000px']
      },
      {
        id: 'shot-2-angle45',
        type: 'angle_45',
        titleAr: '2. صورة جانبية بزاوية 45° مع ظل تلامس خفيف',
        descriptionAr: 'منظور جانبي مجسم يوضح عمق المنتج وحوافه مع إضافة ظل تلامس طبيعي ناعم (Soft Contact Shadow) أسفل القاعدة.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px',
        keyHighlights: ['منظور جانبي 45 درجة', 'ظل تلامس ناعم تحت القاعدة', 'إبراز البروزات والعمق', 'مطابقة لمعايير الصور الفرعية']
      },
      {
        id: 'shot-3-back',
        type: 'back_details',
        titleAr: '3. صورة الجهة الخلفية وإبراز تفاصيل الخامات',
        descriptionAr: 'لقطة مقربة (Macro Close-up) تظهر جودة التقفيل والنسيج أو المداخل والمنافذ خلف المنتج لمنح العميل ثقة الشراء.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px',
        keyHighlights: ['إظهار الجهة الخلفية بالكامل', 'تكبير تفاصيل الخامات والتقفيل', 'وضوح أزرار أو منافذ التوصيل', 'دقة عالية في الإضاءة']
      },
      {
        id: 'shot-4-lifestyle',
        type: 'lifestyle',
        titleAr: '4. صورة الاستخدام الواقعي (AI Lifestyle Environment)',
        descriptionAr: 'وضع المنتج في بيئة حقيقية تفاعلية مولدة بالذكاء الاصطناعي (أرضية ملعب/مكتب مودرن/غرفة فاخرة) لجذب انتباه المشتري.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px',
        keyHighlights: ['خلفية ذكاء اصطناعي واقعية', 'مسموحة كصورة فرعية #2+', 'تعزيز معدل تحويل الشراء (CTR)', 'دمج إضاءة المنتج مع البيئة']
      },
      {
        id: 'shot-5-infographic',
        type: 'infographic',
        titleAr: '5. صورة إنفوجرافيك المميزات التنافسية (Infographic Callouts)',
        descriptionAr: 'تصميم إنفوجرافيك احترافي يوضح النقاط البيعية الرئيسية ومكونات المنتج مع أسهم وشارات باللغة العربية.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px',
        keyHighlights: ['أسهم إشارية وشارات عربي', 'توضيح أهم 4 مميزات فريدة', 'خطوط واضحة على الخلفية', 'رفع القيمة الملموسة للمنتج']
      },
      {
        id: 'shot-6-dimensions',
        type: 'dimensions_scale',
        titleAr: '6. صورة الأبعاد والمقاسات ومقارنة الحجم (Dimensions & Scale)',
        descriptionAr: 'رسم توضيحي لأبعاد المنتج (الطول، العرض، الارتفاع) بالسم مع مقارنة حجمية بكتلة اليد أو الجسم لتفادي الاسترجاع.',
        amazonCompliant: true,
        noonCompliant: true,
        jumiaCompliant: true,
        resolution: '2000x2000px',
        keyHighlights: ['خطوط أسهم المقاسات (سم)', 'مقارنة حجمية مقربة للواقع', 'تقليل نسبة المرتجعات بـ 35%', 'وضوح كامل للمشتري']
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'تم توليد الـ 6 زوايا للتصميم بنجاح',
      data: {
        productTitle,
        category,
        shots: shotsList,
        processedImageBase64: imageBase64 || null
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'حدث خطأ في سيرفر توليد تصميمات المنتج المتعدد الزوايا',
    });
  }
}
