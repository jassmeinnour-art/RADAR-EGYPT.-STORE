import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  X, 
  Store, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Link2, 
  Lock, 
  Layers, 
  Truck, 
  ArrowRight,
  LayoutGrid,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Globe,
  Radio
} from 'lucide-react';

export interface PlatformApiGuide {
  id: string;
  name: string;
  nameAr: string;
  category: 'marketplace' | 'storefront' | 'shipping' | 'payment';
  categoryLabelAr: string;
  icon: string;
  badge: string;
  shortDescription: string;
  apiKeyDashboardUrl: string;
  apiKeyDashboardLabel: string;
  sellerCenterUrl: string;
  apiDocsUrl: string;
  requiredCredentials: {
    key: string;
    labelAr: string;
    placeholder: string;
    description: string;
  }[];
  steps: {
    stepNumber: number;
    title: string;
    detail: string;
    tip?: string;
  }[];
  syncMethod: string;
  avgSetupTime: string;
  proSecurityTip: string;
}

export const PLATFORM_API_GUIDES: PlatformApiGuide[] = [
  {
    id: 'amazon-eg',
    name: 'Amazon Egypt (SP-API)',
    nameAr: 'أمازون مصر (Amazon Seller Central)',
    category: 'marketplace',
    categoryLabelAr: 'سوق إلكتروني معتمد',
    icon: '📦',
    badge: 'المرتبة #1 في المبيعات بمصر',
    shortDescription: 'أكبر سوق إلكتروني في مصر؛ يتيح رادار التاجر مزامنة حية لأسعار الكتالوج وحماية صندوق الشراء (Buy Box) لحظياً مع مطابقة أدنى سعر للمنافسين.',
    apiKeyDashboardUrl: 'https://sellercentral.amazon.eg/apps/manage',
    apiKeyDashboardLabel: 'بوابة تطبيقات أمازون مصر (SP-API Console)',
    sellerCenterUrl: 'https://sellercentral.amazon.eg/',
    apiDocsUrl: 'https://developer-docs.amazon.com/sp-api/',
    requiredCredentials: [
      { key: 'seller_id', labelAr: 'معرف البائع (Merchant / Seller ID)', placeholder: 'A1B2C3D4E5F6G7', description: 'تستخرجه من معلومات الحساب الشخصي في Seller Central.' },
      { key: 'client_id', labelAr: 'معرف العميل (LWA Client ID)', placeholder: 'amzn1.application-oa2-client.xxx', description: 'من شاشة Develop Apps بعد اعتماد تطبيق الرادار.' },
      { key: 'client_secret', labelAr: 'المفتاح السري (LWA Client Secret)', placeholder: 'amzn1.oa2-cs.v1.xxx', description: 'المفتاح الأمني المشفر لمصادقة بروتوكول OAuth 2.0.' },
      { key: 'refresh_token', labelAr: 'رمز التحديث التلقائي (Refresh Token)', placeholder: 'Atzr|IwEBIxxx', description: 'يسمح للرادار بتحديث الأسعار وحماية الباي بوكس دون انقطاع.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى مركز بائعي أمازون مصر',
        detail: 'سجل الدخول بحسابك في Amazon Seller Central Egypt وتأكد من أن حالة الحساب "نشط" ومكتمل البيانات الضريبية والبنكية.'
      },
      {
        stepNumber: 2,
        title: 'الانتقال إلى لوحة إدارة تطبيقات SP-API',
        detail: 'من القائمة العلوية اضغط على Partner Network ثم اختر Develop Apps (أو اضغط على زر الرابط المباشر أعلاه).',
        tip: 'اختر Add new app client إذا كنت تنشئ مفتاحاً برمجياً مخصصاً لمؤسستك.'
      },
      {
        stepNumber: 3,
        title: 'تحديد صلاحيات تسعير المنتجات والمخزون',
        detail: 'حدد صلاحيات Pricing و Product Listing و Inventory Management للسماح للرادار بمطابقة المنافسين آلياً.'
      },
      {
        stepNumber: 4,
        title: 'توليد الـ LWA Credentials ونسخ المفاتيح',
        detail: 'انسخ كلاً من Client ID و Client Secret وقم بإجراء تفويض Authorize App للحصول على Refresh Token ثم الصقها في الرادار.'
      }
    ],
    syncMethod: 'Amazon SP-API REST + SQS Webhooks',
    avgSetupTime: '3 - 5 دقائق',
    proSecurityTip: 'لا تشارك مفتاح LWA Client Secret عبر البريد غير المشفر؛ يقوم رادار التاجر بتخزينه محلياً مشفراً بمعيار AES-256.'
  },
  {
    id: 'noon-eg',
    name: 'Noon Egypt (Core API)',
    nameAr: 'نون مصر (Noon Partners Core)',
    category: 'marketplace',
    categoryLabelAr: 'سوق إلكتروني خليجي ومصري',
    icon: '🟡',
    badge: 'سريعة النمو مع شحن نون إكسبريس',
    shortDescription: 'منصة التسوق الأسرع نمواً؛ تدعم مزامنة المخزون والأسعار المتوافقة مع شحن نون إكسبريس (FBN) ونون المباشر لحماية أرباحك لحظياً.',
    apiKeyDashboardUrl: 'https://core.noon.partners/en-eg/',
    apiKeyDashboardLabel: 'بوابة شركاء نون مصر (Noon Core Portal)',
    sellerCenterUrl: 'https://login.noon.partners/',
    apiDocsUrl: 'https://core.noon.partners/',
    requiredCredentials: [
      { key: 'auth_key', labelAr: 'مفتاح التوثيق (Auth Key / API Key)', placeholder: 'noon_live_sec_xxx', description: 'المفتاح الرئيسي للوصول إلى واجهة Noon Seller Core API.' },
      { key: 'client_id', labelAr: 'معرف المتجر (Client Identifier)', placeholder: 'noon_merchant_xxx', description: 'المعرف المعتمد لحسابك على منصة نون مصر.' },
      { key: 'warehouse_code', labelAr: 'كود المستودع (Warehouse Code)', placeholder: 'WH-CAI-01', description: 'كود مخزنك لدى نون أو مخزنك الذاتي للربط المباشر.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'فتح منصة شركاء نون مصر (Noon Partners Core)',
        detail: 'سجل الدخول عبر login.noon.partners بحساب المسؤول (Owner أو Tech Admin).'
      },
      {
        stepNumber: 2,
        title: 'التوجه إلى إعدادات التكامل (Integrations)',
        detail: 'افتح القائمة الجانبية واختر Settings ثم Integration Settings أو API Access.'
      },
      {
        stepNumber: 3,
        title: 'توليد مفتاح API Key جديد بصلاحية كاملة',
        detail: 'اضغط على زر Generate API Key وحدد صلاحيات Price Updates و Stock Sync.'
      },
      {
        stepNumber: 4,
        title: 'نسخ المفتاح وتعيين كود المستودع',
        detail: 'انسخ الـ Auth Key واكتب كود المستودع المعتمد لبدء مزامنة أسعار منتجاتك في السوق المصري.'
      }
    ],
    syncMethod: 'Noon Core API (JSON REST)',
    avgSetupTime: '2 - 4 دقائق',
    proSecurityTip: 'تأكد من ربط مفتاح نون مع مراعاة نسبة عمولة نون لحساب صافي ربحك الحقيقي بعد خصم التوصيل ونسبة المنصة.'
  },
  {
    id: 'jumia-eg',
    name: 'Jumia Egypt',
    nameAr: 'جوميا مصر (Jumia Seller Center)',
    category: 'marketplace',
    categoryLabelAr: 'سوق إلكتروني أفريقي ومصري',
    icon: '🟠',
    badge: 'أكثر المنصات انتشاراً في المحافظات',
    shortDescription: 'المنصة الأكثر تغطية للمحافظات المصرية؛ يتيح الربط البرمجي مراقبة أرخص بائع بالمليم وتعديل الخصومات والعروض بضغطة زر.',
    apiKeyDashboardUrl: 'https://sellercenter.jumia.com.eg/user/index',
    apiKeyDashboardLabel: 'إدارة مستخدمي جوميا (Seller Center Users)',
    sellerCenterUrl: 'https://sellercenter.jumia.com.eg/',
    apiDocsUrl: 'https://sellercenter.jumia.com.eg/',
    requiredCredentials: [
      { key: 'user_email', labelAr: 'البريد الإلكتروني للـ API (User ID)', placeholder: 'merchant@company.com', description: 'البريد المسجل به المستخدم المخصص للربط البرمجي.' },
      { key: 'api_key', labelAr: 'مفتاح الـ API (Rest API Key)', placeholder: '8f7d9a12c3e4b567890abcdef...', description: 'مفتاح الـ API المشفر المستخرج من شاشة إدارة المستخدمين.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى Jumia Seller Center مصر',
        detail: 'ادخل لحسابك عبر sellercenter.jumia.com.eg باستخدام بريد التاجر المعتمد.'
      },
      {
        stepNumber: 2,
        title: 'الانتقال إلى إدارة المستخدمين (Manage Users)',
        detail: 'من القائمة العلوية اضغط على Settings ثم اختر Manage Users من القائمة المنسدلة.'
      },
      {
        stepNumber: 3,
        title: 'نسخ الـ API Key الخاص بمستخدمك',
        detail: 'ستجد في الجدول خانة بعنوان "API Key" بجانب بريدك الإلكتروني، اضغط على إظهار وانسخ المفتاح.'
      },
      {
        stepNumber: 4,
        title: 'إدخال البيانات في رادار التاجر',
        detail: 'الصق البريد والـ API Key ليقوم النظام بفحص المنتجات ومقارنة أسعارك مع أرخص بائع فورياً.'
      }
    ],
    syncMethod: 'Jumia Vendor REST API v1/v2',
    avgSetupTime: 'دقيقتان فقط',
    proSecurityTip: 'في جوميا يمكنك إنشاء مستخدم فرعي بصلاحيات "API Manager" فقط لحماية صلاحيات الحساب المالي الرئيسي.'
  },
  {
    id: 'tiktok-shop',
    name: 'TikTok Shop (Partner)',
    nameAr: 'تيك توك شوب (TikTok Shop Partner)',
    category: 'marketplace',
    categoryLabelAr: 'التجارة الاجتماعية وتريندات الفيديو',
    icon: '🎵',
    badge: 'أعلى سرعة مبيعات وتريندات في مصر',
    shortDescription: 'قوة الفيديوهات القصيرة والبث المباشر؛ تتيح مزامنة الأسعار الحية مع حملات المؤثرين والخصومات الفلاشية لحظياً.',
    apiKeyDashboardUrl: 'https://partner.tiktokshop.com/',
    apiKeyDashboardLabel: 'مركز مطوري وشركاء TikTok Shop',
    sellerCenterUrl: 'https://seller.tiktok.com/',
    apiDocsUrl: 'https://partner.tiktokshop.com/docv2',
    requiredCredentials: [
      { key: 'app_key', labelAr: 'مفتاح التطبيق (App Key)', placeholder: '6abcdef123456789', description: 'المعرف المعتمد لتطبيق الربط على منصة تيك توك شوب.' },
      { key: 'app_secret', labelAr: 'المفتاح السري (App Secret)', placeholder: 'sec_890abcdef1234567890abcdef', description: 'الرمز السري لتشفير الطلبات وتوقيع الترويسات (HMAC-SHA256).' },
      { key: 'access_token', labelAr: 'رمز الدخول (Shop Access Token)', placeholder: 'act_shop_token_xxx', description: 'رمز التوثيق الممنوح بعد موافقة صاحب المتجر على التفويض.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'فتح TikTok Shop Partner Center',
        detail: 'ادخل إلى partner.tiktokshop.com وسجل دخولك بحساب المطور أو الشريك التجاري.'
      },
      {
        stepNumber: 2,
        title: 'إنشاء تطبيق مخصص (Custom App)',
        detail: 'اضغط على Create App وحدد الفئة "ERP / Price Optimization" وحدد سوق الشرق الأوسط ومصر.'
      },
      {
        stepNumber: 3,
        title: 'طلب صلاحيات تحديث المنتجات والأسعار',
        detail: 'فعّل نطاقات الصلاحية: product.price.write و product.stock.write و order.list.read.'
      },
      {
        stepNumber: 4,
        title: 'تفويض متجرك واستخراج الـ Tokens',
        detail: 'اضغط على Authorize Test Store واختر متجر تيك توك شوب الخاص بك لإنشاء Access Token فوري.'
      }
    ],
    syncMethod: 'TikTok Open API v2024',
    avgSetupTime: '5 دقائق',
    proSecurityTip: 'رموز تيك توك تنتهي صلاحيتها دورياً؛ يتيح لك الرادار تجديد التوكن تلقائياً دون الحاجة لإعادة الإدخال.'
  },
  {
    id: 'shopify',
    name: 'Shopify Store (Admin API)',
    nameAr: 'شوبيفاي (Shopify Egypt & Global)',
    category: 'storefront',
    categoryLabelAr: 'متجرك الإلكتروني المستقل',
    icon: '🛍️',
    badge: 'الخيار الأقوى للتجارة المستقلة والبراند',
    shortDescription: 'المنصة العالمية الرائدة للبراندات المستقلة؛ ربط مباشر عبر Admin API لتحديث كافة منتجات وفروع متجرك في ثوانٍ معدودة.',
    apiKeyDashboardUrl: 'https://admin.shopify.com/',
    apiKeyDashboardLabel: 'لوحة تحكم شوبيفاي (Develop Apps)',
    sellerCenterUrl: 'https://accounts.shopify.com/',
    apiDocsUrl: 'https://shopify.dev/docs/api/admin-rest',
    requiredCredentials: [
      { key: 'shop_domain', labelAr: 'نطاق المتجر (Shopify Domain)', placeholder: 'my-brand-eg.myshopify.com', description: 'الرابط الأساسي لمتجرك على شوبيفاي (بدون https://).' },
      { key: 'access_token', labelAr: 'رمز دخول المشرف (Admin API Access Token)', placeholder: 'shpat_a1b2c3d4e5f6g7h8i9j0...', description: 'المفتاح الخاص بالتطبيقات المخصصة يبدأ دائماً بـ shpat_.' },
      { key: 'api_secret', labelAr: 'مفتاح API السري (API Secret Key)', placeholder: 'shpss_1234567890abcdef...', description: 'للتحقق من صحة Webhooks عند تغير المخزون على متجرك.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'الدخول إلى لوحة تحكم شوبيفاي (Shopify Admin)',
        detail: 'توجه إلى الإعدادات Settings أسفل يسار الشاشة، ثم اختر Apps and sales channels.'
      },
      {
        stepNumber: 2,
        title: 'تفعيل خيار Develop Apps وإنشاء تطبيق',
        detail: 'اضغط على "Develop apps" في الأعلى ثم اضغط على زر "Create an app" وقم بتسميته "Merchant Radar".'
      },
      {
        stepNumber: 3,
        title: 'تحديد صلاحيات المشرف (Admin API Scopes)',
        detail: 'اضغط Configure Admin API Scopes وفعّل: write_products و read_products و read_inventory و write_inventory.'
      },
      {
        stepNumber: 4,
        title: 'تثبيت التطبيق ونسخ الـ Token',
        detail: 'اضغط "Install app" في الزاوية العلوية، ثم اضغط على "Reveal token once" وانسخ الـ Access Token فوراً.'
      }
    ],
    syncMethod: 'Shopify GraphQL & REST Admin API 2025-01',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'رمز شوبيفاي يظهر لمرة واحدة فقط؛ احرص على نسخه وحفظه فوراً في نظام الرادار قبل إغلاق الصفحة.'
  },
  {
    id: 'salla',
    name: 'Salla (سلة)',
    nameAr: 'منصة سلة (Salla Partners)',
    category: 'storefront',
    categoryLabelAr: 'متاجر التجزئة والتجارة السريعة',
    icon: '🟢',
    badge: 'المنصة الرائدة للمتاجر العربية',
    shortDescription: 'المنصة المفضلة لرواد التجارة في الشرق الأوسط؛ تحديث جماعي سريع للأسعار وإدارة خصومات الكوبونات والمخزون الحي.',
    apiKeyDashboardUrl: 'https://salla.partners/',
    apiKeyDashboardLabel: 'بوابة شركاء سلة (Salla Partners Portal)',
    sellerCenterUrl: 'https://s.salla.sa/',
    apiDocsUrl: 'https://docs.salla.dev/',
    requiredCredentials: [
      { key: 'access_token', labelAr: 'رمز الدخول الشخصي (Access Token)', placeholder: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJ...', description: 'توكن JWT طويل يوفر وصولاً موثوقاً لمتجرك على سلة.' },
      { key: 'store_id', labelAr: 'معرف المتجر في سلة (Store ID)', placeholder: '12345678', description: 'رقم المعرف الرقمي لمتجرك لدى سلة.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'الدخول إلى بوابة شركاء سلة (Salla Partners)',
        detail: 'افتح salla.partners وسجل دخولك بنفس بيانات حساب تاجر سلة المعتمد.'
      },
      {
        stepNumber: 2,
        title: 'إنشاء تطبيق خاص لمتجرك (Custom App)',
        detail: 'من قائمة "تطبيقاتي" اختر "إنشاء تطبيق جديد" واختر النوع "تطبيق خاص لمتجري".'
      },
      {
        stepNumber: 3,
        title: 'تحديد صلاحيات المنتجات والمخزون',
        detail: 'اختر صلاحيات "قراءة وكتابة المنتجات" و"تعديل الأسعار والمخزون" لتمكين المزامنة الحية.'
      },
      {
        stepNumber: 4,
        title: 'توليد الـ Access Token وربطه',
        detail: 'من تبويب "المفاتيح"، استخرج التوكن الدائم والصقه في رادار التاجر لتفعيل تحديث الأسعار التلقائي.'
      }
    ],
    syncMethod: 'Salla OAuth 2.0 / REST v2',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'تسمح سلة بتحديث أسعار آلاف المنتجات بنقرة واحدة عبر الـ Bulk API المدعوم في رادار التاجر.'
  },
  {
    id: 'zid',
    name: 'Zid (زد)',
    nameAr: 'منصة زد للمتاجر المتكاملة',
    category: 'storefront',
    categoryLabelAr: 'حلول التجارة المتكاملة',
    icon: '🟣',
    badge: 'قوة الربط مع نقاط البيع والمدفوعات',
    shortDescription: 'حلول التجارة الشاملة مع نقاط البيع؛ مزامنة متزامنة لمخزون الفروع وأسعار المنتجات المتوافقة مع السوق المصري والخليجي.',
    apiKeyDashboardUrl: 'https://developer.zid.sa/',
    apiKeyDashboardLabel: 'بوابة مطوري زد (Zid Developers Portal)',
    sellerCenterUrl: 'https://web.zid.sa/',
    apiDocsUrl: 'https://docs.zid.sa/',
    requiredCredentials: [
      { key: 'x_manager_token', labelAr: 'رمز المدير (X-Manager-Token)', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5c...', description: 'رمز المصادقة الرئيسي للتواصل مع خوادم زد.' },
      { key: 'authorization_token', labelAr: 'توكن التاجر (Authorization Bearer)', placeholder: 'Bearer eyJ0eXAiOiJKV1...', description: 'رمز التوثيق الخاص بالمتجر والعمليات المالية.' },
      { key: 'store_id', labelAr: 'معرف المتجر (Store ID)', placeholder: '987654', description: 'رقم المتجر الخاص بك في لوحة زد.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى بوابة مطوري زد',
        detail: 'ادخل عبر developer.zid.sa بحساب مدير المتجر المعتمد.'
      },
      {
        stepNumber: 2,
        title: 'إنشاء تطبيق جديد وتحديد نطاق العمليات',
        detail: 'اضغط على "تطبيق جديد" وحدد اسم التطبيق "Merchant Radar Auto Price".'
      },
      {
        stepNumber: 3,
        title: 'منح صلاحيات الكتالوج والأسعار',
        detail: 'اختر الصلاحيات: products.read و products.write و inventory.update.'
      },
      {
        stepNumber: 4,
        title: 'استخراج الـ Tokens وتفعيل المزامنة',
        detail: 'انسخ كلاً من X-Manager-Token وتوكن التاجر وضعها في حقول الربط بالرادار.'
      }
    ],
    syncMethod: 'Zid Open API v1/v2',
    avgSetupTime: '4 دقائق',
    proSecurityTip: 'يتم تشفير كافة التوكنات محلياً مع دعم كامل للتحقق من هوية المتجر (Store Identity Verification).'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce (WordPress)',
    nameAr: 'ووكومرس (WooCommerce / WordPress)',
    category: 'storefront',
    categoryLabelAr: 'المتاجر المفتوحة والمستقلة',
    icon: '🔵',
    badge: 'مرونة غير محدودة بدون قيود عمولات',
    shortDescription: 'نظام التجارة المفتوح على ووردبريس؛ حرية تامة بدون اقتطاع عمولات مبيعات وتحكم برمجي كامل في أسعار وتخفيضات المنتجات.',
    apiKeyDashboardUrl: 'https://woocommerce.com/document/woocommerce-rest-api/',
    apiKeyDashboardLabel: 'إعدادات WooCommerce REST API Keys',
    sellerCenterUrl: '',
    apiDocsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    requiredCredentials: [
      { key: 'site_url', labelAr: 'رابط موقع المتجر (Site URL)', placeholder: 'https://my-egypt-store.com', description: 'الرابط الكامل لمتجر ووكومرس الخاص بك شاملاً https://.' },
      { key: 'consumer_key', labelAr: 'مفتاح العميل (Consumer Key)', placeholder: 'ck_1234567890abcdef1234567890abcdef...', description: 'مفتاح المستهلك المولد من إعدادات WooCommerce REST API.' },
      { key: 'consumer_secret', labelAr: 'المفتاح السري (Consumer Secret)', placeholder: 'cs_1234567890abcdef1234567890abcdef...', description: 'المفتاح السري للتحقق والتوقيع البرمجي المباشر.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى لوحة إدارة وردبريس (WP Admin)',
        detail: 'ادخل للوحة التحكم واضغط على WooCommerce ثم اختر Settings.'
      },
      {
        stepNumber: 2,
        title: 'فتح تبويب متقدم (Advanced) ثم REST API',
        detail: 'اضغط على خيار REST API في الشريط الفرعي، ثم اضغط على زر "Add Key".'
      },
      {
        stepNumber: 3,
        title: 'إنشاء مفتاح بصلاحيات القراءة والكتابة',
        detail: 'اكتب الوصف "Merchant Radar Price Sync" واختر Permissions: Read/Write.'
      },
      {
        stepNumber: 4,
        title: 'نسخ Consumer Key و Consumer Secret فوراً',
        detail: 'اضغط Generate API Key ثم انسخ كلاً من المفتاحين قبل مغادرة الصفحة والصقها في الرادار.'
      }
    ],
    syncMethod: 'WooCommerce REST API v3',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'تأكد من تفعيل شهادة SSL (https://) والروابط الدائمة (Pretty Permalinks) في وردبريس لعمل الـ API بنجاح.'
  },
  {
    id: 'expandcart',
    name: 'ExpandCart Egypt',
    nameAr: 'إكسباند كارت (ExpandCart)',
    category: 'storefront',
    categoryLabelAr: 'حلول التجارة العربية والمصرية',
    icon: '🛒',
    badge: 'دعم قوي للشحن والدفع المحلي بمصر',
    shortDescription: 'منصة التجارة المحلية الأكثر تكاملاً مع بوابات الدفع وشركات الشحن المصرية؛ تزامن آلي للمخزون والأسعار عبر API.',
    apiKeyDashboardUrl: 'https://www.expandcart.com/ar/',
    apiKeyDashboardLabel: 'لوحة مطوري إكسباند كارت (API Integration)',
    sellerCenterUrl: 'https://www.expandcart.com/',
    apiDocsUrl: 'https://www.expandcart.com/',
    requiredCredentials: [
      { key: 'client_id', labelAr: 'معرف العميل (Client ID)', placeholder: 'exp_client_987654', description: 'معرف تطبيق متجرك على إكسباند كارت.' },
      { key: 'secret_key', labelAr: 'المفتاح السري (Secret Key)', placeholder: 'exp_sec_xxxxxxxxxxxx', description: 'مفتاح المصادقة المشفر لتحديث الأسعار والطلبات.' },
      { key: 'store_url', labelAr: 'رابط المتجر (Store URL)', placeholder: 'https://store.expandcart.com', description: 'نطاق متجرك المعتمد على المنصة.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول للوحة تحكم إكسباند كارت',
        detail: 'افتح لوحة الإدارة لمتجرك وسجل دخولك بحساب المالك (Owner).'
      },
      {
        stepNumber: 2,
        title: 'الانتقال إلى التطبيقات والخدمات (Apps & Services)',
        detail: 'من القائمة الجانبية ادخل إلى التطبيقات والخدمات ثم اختر Custom Apps أو Integrations.'
      },
      {
        stepNumber: 3,
        title: 'توليد بيانات اعتماد الربط البرمجي (API Credentials)',
        detail: 'أنشئ مفتاحاً جديداً باسم Merchant Radar مع منح صلاحية تعديل المنتجات والمخزون.'
      },
      {
        stepNumber: 4,
        title: 'نسخ المفاتيح وربطها بالرادار',
        detail: 'انسخ كلاً من Client ID و Secret Key لتفعيل المقارنة الحية وتحديث أسعار المنتجات.'
      }
    ],
    syncMethod: 'ExpandCart REST API v2',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'تدعم إكسباند كارت التزامن اللحظي للطلبات عند انخفاض المخزون لتجنب تعليق الطلبات بدون توفر منتج.'
  },
  {
    id: 'bosta',
    name: 'Bosta Logistics Egypt',
    nameAr: 'بوسطة للشحن السريع (Bosta EG)',
    category: 'shipping',
    categoryLabelAr: 'شركات الشحن واللوجستيات بمصر',
    icon: '🚚',
    badge: 'خدمة التوصيل الأسرع في محافظات مصر',
    shortDescription: 'الناقل اللوجستي الأسرع والأكثر اعتماداً للمتاجر في مصر؛ احتساب دقيق لمصاريف التوصيل ودمجها تلقائياً في حساب صافي الربح.',
    apiKeyDashboardUrl: 'https://business.bosta.co/settings/api-keys',
    apiKeyDashboardLabel: 'مفاتيح API بوسطة مصر (Bosta Settings)',
    sellerCenterUrl: 'https://business.bosta.co/',
    apiDocsUrl: 'https://docs.bosta.co/',
    requiredCredentials: [
      { key: 'api_key', labelAr: 'مفتاح الـ API (Production API Key)', placeholder: 'bosta_live_api_key_xxxxxxxx', description: 'مفتاح الربط الحي لإنشاء وتتبع شحنات وبوالص بوسطة.' },
      { key: 'business_id', labelAr: 'معرف النشاط التجاري (Business ID)', placeholder: 'bosta_biz_123456', description: 'معرف حساب شركتك على لوحة أعمال بوسطة مصر.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى Bosta Business Dashboard',
        detail: 'افتح business.bosta.co وسجل دخولك بالحساب المعتمد لمتجرك.'
      },
      {
        stepNumber: 2,
        title: 'الانتقال إلى الإعدادات ومفاتيح الـ API',
        detail: 'من القائمة الجانبية اختر Settings ثم اضغط على تبويب API Keys.'
      },
      {
        stepNumber: 3,
        title: 'توليد مفتاح إنتاج جديد (Production Key)',
        detail: 'اضغط "Generate New Key" واختر بيئة الإنتاج الحية (Production Environment).'
      },
      {
        stepNumber: 4,
        title: 'حساب مصاريف الشحن وتسعير المنتجات',
        detail: 'انسخ المفتاح إلى رادار التاجر ليقوم النظام باحتساب تكلفة الشحن لكل محافظة ودمجها في هامش ربحك.'
      }
    ],
    syncMethod: 'Bosta REST API v2 + Webhooks',
    avgSetupTime: 'دقيقتان',
    proSecurityTip: 'يتيح لك ربط بوسطة تحديث أسعار المنتجات شاملة مصاريف الشحن لضمان ربحية كل طلب حسب وجهة الشحن.'
  },
  {
    id: 'mylerz',
    name: 'Mylerz Logistics Egypt',
    nameAr: 'مايلرز إكسبريس (Mylerz EG)',
    category: 'shipping',
    categoryLabelAr: 'الشحن السريع والتحصيل في مصر',
    icon: '⚡',
    badge: 'توصيل في نفس اليوم وخدمات التحصيل السريع',
    shortDescription: 'توصيل متطور في نفس اليوم واليوم التالي في القاهرة والإسكندرية والمحافظات؛ تتبع الشحنات وتحديث تكلفة الشحن الحقيقية.',
    apiKeyDashboardUrl: 'https://mylerz.com/',
    apiKeyDashboardLabel: 'بوابة بائعين مايلرز مصر (Mylerz Portal)',
    sellerCenterUrl: 'https://mylerz.com/',
    apiDocsUrl: 'https://mylerz.com/',
    requiredCredentials: [
      { key: 'api_username', labelAr: 'اسم مستخدم الـ API', placeholder: 'merchant_mylerz_user', description: 'المستخدم المخصص للربط الممنوح من إدارة مايلرز.' },
      { key: 'api_password', labelAr: 'كلمة مرور الـ API', placeholder: 'Mylerz_Sec_Pass#2025', description: 'الرمز السري لتوثيق وإنشاء بوالص الشحن التلقائية.' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول لبوابة تجار مايلرز',
        detail: 'ادخل لحسابك التجاري عبر mylerz.com وتأكد من تفعيل حساب التحصيل عند الاستلام.'
      },
      {
        stepNumber: 2,
        title: 'طلب تفعيل صلاحية الـ API للربط الذاتي',
        detail: 'تواصل مع مدير حسابك لدى مايلرز أو افتح تبويب التكامل Integration لطلب مفاتيح الربط.'
      },
      {
        stepNumber: 3,
        title: 'اختبار الاتصال في البيئة الحية',
        detail: 'قم بإدخال بيانات الربط لاحتساب أوقات التوصيل وتكاليف الشحن لكل منطقة.'
      },
      {
        stepNumber: 4,
        title: 'اعتماد الرابط لحساب هوامش الأرباح الصافية',
        detail: 'يقوم الرادار بخصم مصاريف شحن مايلرز من سعر البيع لإظهار صافي الربح الحقيقي لكل قطعة.'
      }
    ],
    syncMethod: 'Mylerz Web API v1',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'تساعد خدمات التحصيل النقدي من مايلرز على تسوية مستحقاتك سريعاً مع إشعار الرادار فور استلام العميل للطلب.'
  },
  {
    id: 'fawry-pay',
    name: 'FawryPay Gateway (Egypt)',
    nameAr: 'فوري باي (Fawry Pay API)',
    category: 'payment',
    categoryLabelAr: 'بوابات الدفع الإلكتروني بمصر',
    icon: '💳',
    badge: 'شبكة الدفع الرقمي رقم #1 في مصر',
    shortDescription: 'شبكة الدفع الأكثر ثقة في مصر؛ ربط بوابة التحصيل لمتابعة عمولات الدفع الإلكتروني ومطابقة صافي العائد من كل عملية شراء.',
    apiKeyDashboardUrl: 'https://developer.fawry.com/',
    apiKeyDashboardLabel: 'بوابة مطوري فوري (Fawry Developers Portal)',
    sellerCenterUrl: 'https://fawry.com/',
    apiDocsUrl: 'https://developer.fawry.com/docs',
    requiredCredentials: [
      { key: 'merchant_code', labelAr: 'كود التاجر (Merchant Code)', placeholder: '1000000000', description: 'رقم كود التاجر المعتمد لدى شبكة فوري.' },
      { key: 'security_key', labelAr: 'المفتاح الأمني المشفر (Security Key)', placeholder: '9a8b7c6d-5e4f-3a2b-1c0d-...', description: 'المفتاح الخاص بتوقيع المعاملات (Signature Verification).' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'تسجيل الدخول إلى بوابة مطوري فوري',
        detail: 'ادخل عبر developer.fawry.com بحساب التاجر المعتمد.'
      },
      {
        stepNumber: 2,
        title: 'الانتقال إلى الإعدادات واستخراج Merchant Code',
        detail: 'من شاشة الحساب التجاري انسخ كود التاجر ورقم التعاقد.'
      },
      {
        stepNumber: 3,
        title: 'توليد المفتاح الأمني (Fawry Security Key)',
        detail: 'اضغط على Security Settings لتوليد الرمز المشفر لحماية المعاملات ومطابقة الإشعارات.'
      },
      {
        stepNumber: 4,
        title: 'ربط بيانات الدفع لاحتساب العمولات',
        detail: 'ضع كود التاجر والمفتاح بالرادار لمراقبة عمولات الدفع المخصومة وحساب أرباحك الدقيقة.'
      }
    ],
    syncMethod: 'FawryPay REST API + Webhooks',
    avgSetupTime: '3 دقائق',
    proSecurityTip: 'استخدم مفتاح الإنتاج الحي (Live Key) فقط في الخوادم الآمنة؛ يقوم الرادار بتخزينه محلياً داخل متصفحك المشفر.'
  }
];

interface AddPlatformQuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddPlatformModal: (preselectedPlatformId?: string) => void;
  onNavigateToPlatformsGuide?: () => void;
}

export const AddPlatformQuickHelpModal: React.FC<AddPlatformQuickHelpModalProps> = ({
  isOpen,
  onClose,
  onOpenAddPlatformModal,
  onNavigateToPlatformsGuide
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('amazon-eg');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'marketplace' | 'storefront' | 'shipping' | 'payment'>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [expandedStepsMap, setExpandedStepsMap] = useState<Record<string, boolean>>({});

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

  const filteredGuides = PLATFORM_API_GUIDES.filter(p => {
    const matchesCategory = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabelAr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentPlatform = PLATFORM_API_GUIDES.find(p => p.id === selectedPlatformId) || PLATFORM_API_GUIDES[0];

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleExpandSteps = (platformId: string) => {
    setExpandedStepsMap(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  return (
    <div 
      id="add-platform-quick-help-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-platform-help-title"
    >
      <div 
        id="add-platform-quick-help-card"
        className="w-full max-w-6xl bg-[#F8FAFC] border-3 border-[#000000] rounded-2xl shadow-2xl text-right animate-scaleUp flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-3 border-[#000000] bg-[#F8FAFC]">
          <button
            type="button"
            id="btn-close-platform-quick-help"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#F8FAFC] border-2 border-[#000000] text-[#000000] flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
            aria-label="إغلاق نافذة التعليمات"
          >
            <X className="w-5 h-5 text-[#000000]" />
          </button>

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#000000] text-amber-300">
                  دليل الربط التقني السريع
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-400">
                  تنسيق مجدول (Grid Layout)
                </span>
                <h3 id="quick-platform-help-title" className="text-base sm:text-lg font-black text-[#000000]">
                  خطوات ربط المنصات واستخراج مفاتيح الـ API
                </h3>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                تصفح المنصات عبر التنسيق المجدول للاطلاع على خطوات الربط والضغط على "الرابط المباشر" لاستخراج مفاتيح الـ API فورياً
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#000000] text-amber-400 flex items-center justify-center shrink-0 border-2 border-[#000000] shadow-xs">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Search, Category Filter & Layout Switcher Toolbar */}
        <div className="px-5 py-3 border-b-2 border-[#000000] bg-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="inline-flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
              }`}
            >
              جميع المنصات ({PLATFORM_API_GUIDES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('marketplace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'marketplace'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5 inline ml-1" />
              الأسواق والمتاجر العامة
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('storefront')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'storefront'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline ml-1" />
              منصات المتاجر المستقلة
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('shipping')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'shipping'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5 inline ml-1" />
              الشحن واللوجستيات
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('payment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'payment'
                  ? 'bg-[#000000] text-white border-[#000000]'
                  : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 inline ml-1" />
              بوابات الدفع
            </button>
          </div>

          {/* Quick Search & Layout Mode Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* View Mode Toggle: Grid vs Detail */}
            <div className="inline-flex items-center bg-white border-2 border-[#000000] rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#000000] text-white'
                    : 'text-[#000000] hover:bg-slate-100'
                }`}
                title="عرض مجدول (Grid Layout)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مجدول</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detail')}
                className={`px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'detail'
                    ? 'bg-[#000000] text-white'
                    : 'text-[#000000] hover:bg-slate-100'
                }`}
                title="عرض تفصيلي جانبي (Split View)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تفصيلي</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative flex-1 md:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منصة أو خدمة..."
                className="w-full h-9 pr-9 pl-3 bg-[#F8FAFC] border-2 border-[#000000] rounded-lg text-xs font-bold text-[#000000] focus:outline-none placeholder:text-slate-500"
              />
              <Search className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        {viewMode === 'grid' ? (
          /* ========================================================================= */
          /* GRID LAYOUT VIEW (التنسيق المجدول لعرض المنصات مع وصف وخطوات وزر بارز)     */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F8FAFC]">
            {filteredGuides.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-slate-600 bg-white border-2 border-dashed border-[#000000] rounded-2xl max-w-md mx-auto my-12">
                لا توجد منصة تطابق بحثك "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGuides.map((platform) => {
                  const isExpanded = Boolean(expandedStepsMap[platform.id]);
                  return (
                    <div
                      key={platform.id}
                      className="bg-white border-3 border-[#000000] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-0.5 transition-all text-right group"
                    >
                      <div className="space-y-3.5">
                        {/* Top Card Header: Logo, Badges & Name */}
                        <div className="flex items-start justify-between gap-2 border-b-2 border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-[#000000] flex items-center justify-center text-2xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                              {platform.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#000000] leading-tight">
                                {platform.nameAr}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-600 mt-0.5" dir="ltr">
                                {platform.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                                  {platform.categoryLabelAr}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                                  ⏱ {platform.avgSetupTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Short Description (الوصف القصير للمنصة) */}
                        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                            {platform.shortDescription}
                          </p>
                        </div>

                        {/* PROMINENT DIRECT API LINK BUTTON (إبراز 'الرابط المباشر' للـ API بصيغة زر بارز) */}
                        <div className="pt-1 pb-1">
                          <a
                            href={platform.apiKeyDashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            id={`btn-direct-api-link-${platform.id}`}
                            className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-[#000000] border-2 border-[#000000] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer group/link"
                            title={`فتح الرابط المباشر الرسمي: ${platform.apiKeyDashboardLabel}`}
                          >
                            <Key className="w-4 h-4 text-[#000000] shrink-0" />
                            <span className="truncate">الرابط المباشر للـ API: {platform.apiKeyDashboardLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#000000] shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
                          </a>
                        </div>

                        {/* Connection Steps (خطوات الربط) */}
                        <div className="space-y-2 border-t-2 border-slate-200 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#000000] flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                              <span>خطوات الربط ({platform.steps.length} خطوات):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleExpandSteps(platform.id)}
                              className="text-[11px] font-bold text-indigo-800 hover:text-black flex items-center gap-0.5 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <span>طي الخطوات</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span>تفاصيل كاملة</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Steps List */}
                          <div className="space-y-2">
                            {platform.steps.slice(0, isExpanded ? platform.steps.length : 2).map((st) => (
                              <div
                                key={st.stepNumber}
                                className="p-2 bg-slate-50 border border-slate-300 rounded-lg flex items-start gap-2.5 text-right"
                              >
                                <span className="w-5 h-5 rounded-md bg-[#000000] text-amber-300 font-mono font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                  {st.stepNumber}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-black text-[#000000]">
                                    {st.title}
                                  </div>
                                  <div className="text-[10px] text-slate-700 font-medium leading-normal mt-0.5">
                                    {st.detail}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {!isExpanded && platform.steps.length > 2 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandSteps(platform.id)}
                              className="w-full py-1 text-[10px] font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 text-center cursor-pointer transition-colors"
                            >
                              + عرض باقي الخطوات ({platform.steps.length - 2} خطوات إضافية)
                            </button>
                          )}
                        </div>

                        {/* Required Credentials Badges */}
                        <div className="pt-2 border-t border-slate-200">
                          <div className="text-[10px] font-black text-slate-700 mb-1 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-800" />
                            <span>المفاتيح المطلوبة:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {platform.requiredCredentials.map((c) => (
                              <button
                                key={c.key}
                                type="button"
                                onClick={() => handleCopyText(c.placeholder, `${platform.id}-${c.key}`)}
                                className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-800 flex items-center gap-1 cursor-pointer"
                                title={`اضغط لنسخ صيغة نموذج ${c.labelAr}`}
                              >
                                <span>{c.labelAr.split('(')[0].trim()}</span>
                                {copiedField === `${platform.id}-${c.key}` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-slate-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t-2 border-slate-200 mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAddPlatformModal(platform.id);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#000000] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>بدء ربط هذه المنصة 🚀</span>
                        </button>

                        {platform.apiDocsUrl && (
                          <a
                            href={platform.apiDocsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white border-2 border-[#000000] text-[#000000] hover:bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                            title="التوثيق البرمجي الكامل (Official Docs)"
                          >
                            <BookOpen className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* SPLIT / DETAIL VIEW (العرض الجانبي المقسم لمزيد من التفاصيل والتركيز)       */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
            {/* Left Column (RTL Right side): Platform Selector Tabs */}
            <div className="md:col-span-4 border-b-2 md:border-b-0 md:border-l-2 border-[#000000] p-3 space-y-2 overflow-y-auto bg-slate-50 max-h-[300px] md:max-h-full">
              <div className="text-[11px] font-black text-slate-700 px-1 mb-1">
                اختر المنصة لعرض تعليمات الربط ({filteredGuides.length}):
              </div>
              
              {filteredGuides.map((platform) => {
                const isSelected = platform.id === currentPlatform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatformId(platform.id)}
                    className={`w-full p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between text-right ${
                      isSelected
                        ? 'bg-[#000000] text-white border-[#000000] shadow-sm transform scale-[1.01]'
                        : 'bg-[#F8FAFC] text-[#000000] border-[#000000] hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">{platform.icon}</span>
                      <div>
                        <h4 className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#000000]'}`}>
                          {platform.nameAr}
                        </h4>
                        <p className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-600'}`}>
                          {platform.categoryLabelAr}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {platform.avgSetupTime}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column (RTL Left side): Selected Platform Details */}
            <div className="md:col-span-8 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#F8FAFC]">
              {/* Selected Platform Header */}
              <div className="p-4 bg-white border-3 border-[#000000] rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-100 rounded-xl border-2 border-[#000000]">
                      {currentPlatform.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#000000]">
                          {currentPlatform.nameAr}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-500">
                          {currentPlatform.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-mono mt-0.5" dir="ltr">
                        {currentPlatform.name} · {currentPlatform.syncMethod}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddPlatformModal(currentPlatform.id);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#000000] text-white font-black text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>بدء ربط هذه المنصة 🚀</span>
                  </button>
                </div>

                {/* Short Description */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                  <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                    {currentPlatform.shortDescription}
                  </p>
                </div>

                {/* Prominent Direct API Link Box */}
                <div className="p-3.5 bg-amber-50 border-3 border-[#000000] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#000000] text-amber-300 flex items-center justify-center shrink-0">
                      <Key className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#000000] block">
                        الرابط المباشر للـ API لاستخراج المفاتيح:
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 block">
                        انقر للتوجه فوراً لشاشة المطورين واستخراج رموز التوثيق المعتمدة
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentPlatform.apiKeyDashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`btn-detail-direct-api-link-${currentPlatform.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#000000] font-black text-xs border-2 border-[#000000] shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
                    >
                      <span>{currentPlatform.apiKeyDashboardLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {currentPlatform.apiDocsUrl && (
                      <a
                        href={currentPlatform.apiDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white border-2 border-[#000000] text-[#000000] font-bold text-xs hover:bg-slate-100 transition-colors"
                        title="التوثيق البرمجي للمطورين"
                      >
                        <span>Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-[#000000] flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>خطوات الربط بالتفصيل:</span>
                </h4>

                <div className="space-y-2">
                  {currentPlatform.steps.map((st) => (
                    <div 
                      key={st.stepNumber}
                      className="p-3 bg-white border-2 border-[#000000] rounded-xl flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#000000] text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {st.stepNumber}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h5 className="font-extrabold text-xs sm:text-sm text-[#000000]">
                          {st.title}
                        </h5>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {st.detail}
                        </p>
                        {st.tip && (
                          <p className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            <Zap className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{st.tip}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Credentials Checklist & Placeholders */}
              <div className="p-3.5 bg-white border-2 border-[#000000] rounded-xl space-y-2.5">
                <h4 className="text-xs font-black text-[#000000] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-900" />
                  <span>المفاتيح والرموز المطلوبة للربط ({currentPlatform.requiredCredentials.length}):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPlatform.requiredCredentials.map((cred) => (
                    <div key={cred.key} className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#000000]">
                          {cred.labelAr}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(cred.placeholder, cred.key)}
                          className="text-[10px] font-bold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
                          title="نسخ صيغة المفتاح النموذجية"
                        >
                          {copiedField === cred.key ? (
                            <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                              <Check className="w-3 h-3" /> تم النسخ
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="w-3 h-3" /> نموذج
                            </span>
                          )}
                        </button>
                      </div>
                      <code className="text-[10px] font-mono block bg-white px-2 py-1 rounded border border-slate-200 text-slate-800 break-all select-all" dir="ltr">
                        {cred.placeholder}
                      </code>
                      <p className="text-[10px] text-slate-600 leading-tight">
                        {cred.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Guarantee Box */}
              <div className="p-3 bg-emerald-50 border-2 border-emerald-700 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 font-medium leading-relaxed">
                  <strong className="font-extrabold text-emerald-900 ml-1">أمان وتشفير البيانات:</strong>
                  {currentPlatform.proSecurityTip}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t-3 border-[#000000] bg-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToPlatformsGuide && (
              <button
                type="button"
                id="btn-help-open-full-guide"
                onClick={() => {
                  onClose();
                  onNavigateToPlatformsGuide();
                }}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-white text-[#000000] border-2 border-[#000000] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#000000]" />
                <span>دليل المنصات والعمولات الشامل (20+ منصة)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl bg-white text-[#000000] border-2 border-[#000000] font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors active:scale-95"
            >
              إغلاق
            </button>

            <button
              type="button"
              id="btn-help-proceed-add-platform"
              onClick={() => {
                onClose();
                onOpenAddPlatformModal(currentPlatform.id);
              }}
              className="px-5 h-9 rounded-xl bg-[#000000] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة قناة بيع جديدة الآن 🚀</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
