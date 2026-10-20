import { SeasonalBackgroundPreset } from '../types';
import ramadanBg from '../assets/images/ramadan_studio_bg_1788435640081.jpg';
import whiteFridayBg from '../assets/images/white_friday_bg_1788435659297.jpg';
import summerDealsBg from '../assets/images/summer_deals_bg_1788435674540.jpg';
import backToSchoolBg from '../assets/images/back_to_school_bg_1788435689913.jpg';

export const SEASONAL_BACKGROUND_PRESETS: SeasonalBackgroundPreset[] = [
  {
    id: 'ramadan_kareem',
    title: 'موسم رمضان المبارك 🌙',
    seasonCategory: 'ramadan',
    imageUrl: ramadanBg,
    tag: 'الأعلى طلباً في موسم الصيام',
    accentColor: 'from-sky-600 to-sky-500',
    lightingDescription: 'إضاءة دافئة مع هلال ذهبي وفانوس مضيء وبوديوم رخامي للمنتج',
    suggestedBadge: '🌙 عروض رمضان الكبرى'
  },
  {
    id: 'white_friday',
    title: 'الجمعة البيضاء / عروض نوفمبر 🖤',
    seasonCategory: 'white_friday',
    imageUrl: whiteFridayBg,
    tag: 'موسم التخفيضات الأكبر بمصر',
    accentColor: 'from-neutral-900 via-sky-700 to-sky-600',
    lightingDescription: 'منصة داكنة فاخرة مع حواف ذهبية ساطعة وجسيمات احتفالية لامعة',
    suggestedBadge: '🔥 أقوى عروض الجمعة البيضاء'
  },
  {
    id: 'summer_deals',
    title: 'عروض الصيف والساحل ☀️',
    seasonCategory: 'summer',
    imageUrl: summerDealsBg,
    tag: 'مبيعات المصايف والإجازات',
    accentColor: 'from-cyan-500 to-sky-400',
    lightingDescription: 'إضاءة شمسية ساطعة مع تموجات مياه فيروزية وظلال نخيل استوائية ناعمة',
    suggestedBadge: '🌴 تخفيضات الصيف الحارة'
  },
  {
    id: 'back_to_school',
    title: 'موسم العودة للمدارس والجامعات 🎓',
    seasonCategory: 'back_to_school',
    imageUrl: backToSchoolBg,
    tag: 'موسم الخريف والأدوات المكتبية',
    accentColor: 'from-indigo-600 to-sky-500',
    lightingDescription: 'مكتب خشبي عصري مع إضاءة صباحية طبيعية ناعمة وعناصر دراسية أنيقة',
    suggestedBadge: '📚 عروض العودة للدراسة'
  },
  {
    id: 'eid_mubarak',
    title: 'عيد الفطر والأضحى المبارك 🎉',
    seasonCategory: 'eid',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
    tag: 'موسم الهدايا والاحتفالات',
    accentColor: 'from-emerald-600 to-teal-500',
    lightingDescription: 'طراز احتفالي مبهج مع زينة رقيقة وإضاءة ستوديو ناصعة ومشرقة',
    suggestedBadge: '🎁 عيدية وتخفيضات العيد'
  },
  {
    id: 'year_end_clearance',
    title: 'تخفيضات نهاية العام ورأس السنة ⚡',
    seasonCategory: 'clearance',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80',
    tag: 'تصفية المخزون السنوي',
    accentColor: 'from-rose-600 to-sky-500',
    lightingDescription: 'أضواء بوكيه ذهبية لامعة ومسرح احتفالي جاذب للانتباه',
    suggestedBadge: '⚡ تصفية سنوية بأسعار الجملة'
  }
];
