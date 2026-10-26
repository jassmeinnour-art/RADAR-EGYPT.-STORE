export interface MerchantOffer {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  storeType: 'online' | 'physical' | 'hybrid' | 'wholesale';
  platform: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'homzmart_eg' | 'kenzz_eg' | 'btech' | '2b' | 'elarabyelectric' | 'abdelaziz_street' | 'bostan_mall' | 'ataba_market' | 'raneen' | 'other' | string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryCost: string;
  isVerified: boolean;
  isBestDeal?: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  url?: string;
  warranty?: string;
  discountBadge?: string;
  sellerName?: string;
  platformName?: string;
  inStock?: boolean;
  shippingTime?: string;
  fulfillmentType?: 'fba_noon_express' | 'merchant_fulfillment' | 'pickup' | 'fba' | 'fbn' | 'express' | string;
}

export interface WholesaleLocation {
  id: string;
  marketName: string;
  hubType: 'شارع عبد العزيز' | 'مول البستان' | 'سوق العتبة والموسكي' | 'سوق الفجالة' | 'سوق التوفيقية' | 'منافذ التوزيع المركزية' | 'معارض الإسكندرية والمحافظات';
  branchName: string;
  address: string;
  city: 'القاهرة' | 'الجيزة' | 'الإسكندرية' | 'الدقهلية' | 'الغربية' | 'أخرى';
  distanceKm: number;
  inStockCount: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  supplierContact: string;
  phone: string;
  openUntil: string;
  currency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  directionsUrl?: string;
  notes?: string;
}

export interface ProductSpecification {
  category: string;
  items: { label: string; value: string }[];
}

export type KeywordCompetitionLevel = 'low' | 'medium' | 'high' | 'very_high';
export type KeywordIntentType = 'transactional' | 'price_comparison' | 'long_tail' | 'brand_exact' | 'wholesale';

export interface KeywordItem {
  id?: string;
  keyword: string;
  searchVolume: 'فائق (High)' | 'مرتفع (Medium-High)' | 'متوسط (Medium)' | string;
  monthlySearchesEstimate?: number; // e.g. 18500
  competitionLevel: KeywordCompetitionLevel; // 'low' | 'medium' | 'high' | 'very_high'
  competitionScore?: number; // 0 - 100 (e.g. 24 = Low competition = Golden opportunity!)
  opportunityScore?: number; // 0 - 100 (high opportunity = high traffic + low competition)
  buyerIntent?: KeywordIntentType;
  relevanceScore: number; // 0 - 100
  recommendedPlatform: 'أمازون' | 'نون' | 'جوميا' | 'تيك توك' | 'الكل' | string;
  cpcEstimateEGP?: number; // e.g. 2.4 EGP
  suggestedAction?: string; // e.g. "استخدمه في أول العنوان", "ضعه في Backend Search Terms"
}

export interface PlatformSEOListing {
  amazon: {
    title: string;
    bulletPoints: string[];
    backendSearchTerms: string;
    categoryPath: string;
    complianceScore: number;
    characterCount: number;
  };
  noon: {
    title: string;
    keyHighlights: string[];
    description: string;
    arabicBrand: string;
    complianceScore: number;
  };
  jumia: {
    title: string;
    shortDescription: string;
    keyFeatures: string[];
    searchTags: string[];
    complianceScore: number;
  };
  socialStore: {
    marketingPost: string;
    callToAction: string;
    adCopy: string;
    hashtags: string[];
  };
}

export interface PlatformComplianceSpec {
  platformId: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'shopify' | 'social_media';
  platformName: string;
  logo: string;
  bgColorRule: string;
  aspectRatio: string;
  minDimensions: string;
  maxTextOverlayAllowed: boolean;
  rules: string[];
  complianceVerified: boolean;
}

export interface RepriceCalculation {
  lowestCompetitorPrice: number;
  lowestCompetitorMerchant: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 5 for 5% or 50 for 50 EGP
  costPrice: number; // Wholesale or merchant cost
  winningPrice: number; // Calculated price lower than lowest competitor
  priceDifference: number; // How much cheaper
  profitMarginAmount: number;
  profitMarginPercent: number;
  buyBoxWinScore: number; // 0 - 100
}

export interface PricePoint {
  date: string;
  price: number;
  merchant: string;
}

export interface ProductData {
  id: string;
  title: string;
  titleEn?: string;
  brand: string;
  model: string;
  category: string;
  sku?: string;
  barcode?: string;
  imageUrl: string;
  confidenceScore: number;
  description: string;
  estimatedWholesaleCost: number;
  suggestedRetailPrice: number;
  currentLowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  targetPrice?: number;
  currency: string;
  specs: ProductSpecification[];
  merchantOffers: MerchantOffer[];
  wholesaleLocations?: WholesaleLocation[];
  seoListing?: PlatformSEOListing;
  keywords?: KeywordItem[];
  priceHistory?: PricePoint[];
  tags: string[];
  quickHighlights: string[];
  // Archiving & Trash Bin support:
  isArchived?: boolean;
  archivedAt?: string;
  archivedReason?: 'out_of_stock_supplier' | 'discontinued_model' | 'unprofitable_margin' | 'seasonal_ended' | 'low_demand' | 'custom_reason' | string;
  archivedNotes?: string;
  deletedAt?: string;
  isTrashed?: boolean;
  // Platform & live store sync support:
  merchantSynced?: boolean;
  isUserImported?: boolean;
  sellerId?: string;
  syncedAt?: string;
  merchantId?: string;
  merchantStoreName?: string;
}

export interface PlatformCompetitorRecord {
  id: string;
  competitorName: string;
  productTitleOrSku: string;
  matchedProductId?: string;
  price: number;
  originalPrice?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  deliveryCost?: string;
  fulfillmentType?: 'fba_noon_express' | 'merchant_fulfillment' | 'pickup' | 'fba';
  url?: string;
  warranty?: string;
  importedAt: string;
  platformCode: string;
  platformName: string;
}

export interface PlatformSyncHistoryItem {
  id: string;
  timestamp: string;
  statusCode: number;
  statusText: string;
  success: boolean;
  latencyMs?: number;
  message?: string;
}

export interface ConnectedMerchantPlatform {
  id: string;
  name: string;
  code: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'kenzz_eg' | 'homzmart_eg' | 'btech_eg' | 'twob_eg' | 'elaraby_group' | 'raneen_eg' | 'facebook_marketplace' | 'shopify_salla' | 'tiktok_shop' | string;
  category?: 'marketplace' | 'website' | 'retail_chain' | 'social' | string;
  sellerName: string;
  sellerId: string;
  merchantEmail?: string;
  merchantAccountUsername?: string;
  merchantStoreUrl?: string;
  sellerPortalUrl?: string;
  isGmailLinked?: boolean;
  linkedGmail?: string;
  directLaunchSupported?: boolean;
  lastLaunchedAt?: string;
  linkedMerchantClientId?: string;
  apiKey?: string;
  autoSyncOrders?: boolean;
  autoWeeklyReportEmail?: boolean;
  isConnected: boolean;
  autoSyncPrice: boolean;
  status: 'active' | 'syncing' | 'pending' | 'error' | 'disconnected' | 'maintenance';
  isMaintenanceMode?: boolean;
  scheduledMaintenance?: {
    isActive: boolean;
    windowLabel: string; // e.g. "02:00 ص - 05:00 ص (توقيت القاهرة)"
    expectedEndTime?: string; // e.g. "خلال 45 دقيقة"
    reasonAr?: string; // e.g. "تحديث مجدول لبوابة أسعار ومخزون الـ API"
  };
  lastSyncedAt?: string;
  lastSuccessfulSyncAt?: string;
  lastSuccessfulSyncTimestamp?: number;
  latencyMs?: number;
  commissionFeePercent: number;
  syncError?: string;
  hasSyncError?: boolean;
  importedCompetitorsCount?: number;
  lastCompetitorImportAt?: string;
  importedCompetitors?: PlatformCompetitorRecord[];
  syncHistory?: PlatformSyncHistoryItem[];
  // Agency & Marketing Manager Separation fields:
  mwsAuthToken?: string; // رمز MWS Auth Token أو SP-API Refresh Token للتاجر
  spApiRefreshToken?: string;
  sellerLoginId?: string; // معرّف دخول أو اسم مستخدم متجر التاجر
  managerAgencyEmail?: string; // بريد مدير التسويق / الوكالة المشرفة (منفصل عن بريد التاجر)
  credentialsNotes?: string; // ملاحظات الاعتماد والربط الخاصة بالمتجر
}

export interface PlatformCategoryConfig {
  key: string;
  title: string;
  englishTitle?: string;
  iconName: string;
  headerColor?: string;
  badgeBg?: string;
  borderStyle?: string;
  bgStyle?: string;
  tagColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  isCustom?: boolean;
}

export type ProductAngleType = 
  | 'front_hero' 
  | 'isometric_3d' 
  | 'top_down_flatlay' 
  | 'macro_details' 
  | 'side_ports' 
  | 'pedestal_floating';

export type PlatformAspectRatio = '1:1' | '9:16' | '4:5' | '16:9' | '4:3';

export type DecorativeBackgroundId = 
  | 'pure_white' 
  | 'luxury_marble' 
  | 'studio_pedestal' 
  | 'nordic_wood' 
  | 'modern_desk' 
  | 'cyber_neon' 
  | 'pastel_minimal' 
  | 'cozy_home' 
  | 'transparent_grid';

export type SocialMediaFrameId = 
  | 'none'
  | 'modern_dark_social'
  | 'hot_deal_flash_sale'
  | 'verified_merchant_gold'
  | 'clean_minimal_story'
  | 'black_friday_neon'
  | 'egypt_flag_deal';

export interface SocialMediaFrameConfig {
  id: SocialMediaFrameId;
  name: string;
  badge: string;
  description: string;
  defaultBadgeText: string;
  defaultTagline: string;
  themeColor: string;
  accentColor: string;
  borderStyle: string;
  headerBg: string;
  footerBg: string;
  previewBg: string;
  icon: string;
}

export interface ProductFeatureCallout {
  id: string;
  title: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  direction: 'left' | 'right';
}

export interface ImageABTestVariant {
  id: 'variant_a' | 'variant_b';
  label: string;
  name: string;
  imageUrl: string;
  backgroundTheme: string;
  seasonName?: string;
  badge?: string;
  isAiGenerated?: boolean;
  metrics: {
    ctr: number; // Click through rate % (e.g. 4.6% vs 7.9%)
    attractionScore: number; // Visual attraction score 0-100 (e.g. 68 vs 93)
    conversionRate: number; // Conversion to order % (e.g. 1.8% vs 3.2%)
    impressions: number; // e.g. 24,500
    clicks: number; // e.g. 1,127 vs 1,935
    addToCartRate: number; // e.g. 4.2% vs 7.8%
    hoverDurationSec: number; // e.g. 1.4 vs 3.8
    cacEGP: number; // e.g. 42 vs 26
  };
  platformBreakdown: {
    amazonCtr: number;
    noonCtr: number;
    jumiaCtr: number;
    socialAdsCtr: number;
  };
}

export interface SeasonalBackgroundPreset {
  id: string;
  title: string;
  seasonCategory: 'ramadan' | 'white_friday' | 'summer' | 'back_to_school' | 'eid' | 'clearance' | 'custom_ai';
  imageUrl: string;
  tag: string;
  accentColor: string;
  lightingDescription: string;
  suggestedBadge: string;
}

export interface ImageStudioConfig {
  activePlatform: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'shopify_salla' | 'social_media';
  backgroundColor: string;
  aspectRatio: PlatformAspectRatio;
  angleView: ProductAngleType;
  backgroundTheme: DecorativeBackgroundId;
  showDiscountBadge: boolean;
  discountPercent: number;
  showMerchantWatermark: boolean;
  merchantName: string;
  showWinningPrice: boolean;
  sellingPrice: number;
  currency: string;
  brightness: number;
  contrast: number;
  sharpness: boolean;
  frameFillPercent: number;
  complianceChecked: boolean;
  rotationY: number; // -45 to 45
  rotationX: number; // -30 to 30
  rotationZ: number; // -180 to 180
  zoomScale: number; // 0.5 to 2.5
  shadowIntensity: number; // 0 to 100
  showPedestal: boolean;
  showFeatureCallouts: boolean;
}

export interface PublishResult {
  platformId: string;
  platformName: string;
  status: 'success' | 'failed' | 'processing';
  publishedPrice: number;
  currency: string;
  sku: string;
  timestamp: string;
  listingUrl?: string;
  message: string;
}

// Watchlist & Stock Tracker Item
export interface WatchlistItem {
  productId: string;
  product: ProductData;
  addedAt: string;
  lastCheckedPrice: number;
  lastPriceChangedAt?: string; // تاريخ وتوقيت آخر تغيير في سعر المنافسين (مثل: "2026-08-28 14:30" أو "منذ ساعتين")
  lastPriceChangeSource?: string; // المتجر أو المنصة التي غيرت السعر (مثل: "أمازون مصر" أو "نون")
  priceTrend: 'down' | 'up' | 'stable';
  priceChangePercent: number;
  competitorStockStatus: 'normal' | 'low_stock' | 'competitor_stockout_opportunity';
  targetAlertPrice?: number;
  merchantNotes?: string;
  note?: string;
  notes?: string;
  tags?: string[];
  autoTrack: boolean;
}

// Official Document Requirement
export interface DocumentRequirement {
  id: string;
  title: string;
  isRequired: boolean;
  description: string;
  issuerAuthority: string; // e.g. "الغرفة التجارية / وزارة التجارة", "مصلحة الضرائب المصرية"
  estimatedDaysToIssue: string;
  proTip: string;
}

// Platform Guide for Egyptian Merchants
export interface PlatformGuideItem {
  id: string;
  name: string;
  arabicName: string;
  tagline: string;
  logo: string;
  category: 'marketplaces' | 'social_commerce' | 'private_store' | 'b2b_wholesale' | 'electronics_appliances';
  badge: string;
  badgeColor: string;
  popularityRank: number;
  description: string;
  registrationUrl: string;
  requirements: DocumentRequirement[];
  commissionRates: {
    category: string;
    rate: string;
    notes?: string;
  }[];
  payoutCycle: string; // e.g. "أسبوعياً كل خميس إلى حساب بنكي مصري (IBAN)"
  fulfillmentOptions: {
    name: string;
    description: string;
    recommendedFor: string;
  }[];
  pros: string[];
  cons: string[];
  minStartBudget: string;
  activeCustomerBaseEgypt: string;
  officialSupportContact: string;
}

// Price Drop Alert Model
export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  channel: 'whatsapp' | 'in_app' | 'email';
  triggerCondition: 'drop_below' | 'percentage_drop' | 'buybox_change' | 'competitor_stockout';
  targetPrice?: number;
  thresholdPercentage?: number;
  recipientContact: string; // Phone number for WhatsApp or Email address
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

// Alert Notification History Log
export interface AlertNotificationLog {
  id: string;
  alertId: string;
  productId: string;
  productTitle: string;
  alertType?: 'price_drop' | 'stock_alert' | 'special_offer' | 'buybox_opportunity'; // تنبيه سعر | تنبيه مخزون | تنبيه عرض
  channel: 'whatsapp' | 'in_app' | 'email';
  message: string;
  oldPrice: number;
  newPrice: number;
  priceDropAmount: number;
  priceDropPercent: number;
  competitorName: string;
  platformName: string;
  timestamp: string;
  isRead: boolean;
  actionTaken?: boolean;
}

// WhatsApp Alert Custom Template (قوالب تنبيهات ورسائل الواتساب المخصصة للمسوق والتجار)
export type WhatsAppTemplateCategory = 
  | 'price_drop'              // هبوط سعر منافس وتهديد الباي بوكس
  | 'demand_surge'             // ارتفاع مفاجئ في الطلب الموسمي
  | 'competitor_stockout'      // نفاد مخزون المنافس وفرصة رفع السعر
  | 'bulk_reprice'             // اعتماد وموافقة التحديث السعري المجمع
  | 'profit_margin_review'     // مراجعة أرباح وعمولات المنصات
  | 'custom';                  // قالب حر مخصص للمسوق

export interface WhatsAppTemplateVariable {
  key: string;               // e.g. "{product_name}"
  label: string;             // e.g. "اسم المنتج"
  exampleValue: string;      // e.g. "سماعة أنكر لايف كيو 30"
  description: string;
}

export interface WhatsAppAlertTemplate {
  id: string;
  title: string;
  description: string;
  category: WhatsAppTemplateCategory;
  triggerEventLabel: string;
  includeDirectRepriceLink: boolean;
  directLinkDomainPlaceholder?: string;
  templateBody: string;
  sampleMerchantPhone?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RemoteMerchantPlatformCode = 
  | 'amazon_eg' 
  | 'noon_eg' 
  | 'jumia_eg' 
  | 'kenzz_eg'
  | 'homzmart_eg'
  | 'btech_eg'
  | 'twob_eg'
  | 'elaraby_group'
  | 'raneen_eg'
  | 'facebook_marketplace'
  | 'shopify_salla' 
  | 'tiktok_shop' 
  | 'physical_store';

// Merchant API Credentials Model (Multi-Tenant SP-API & Noon)
export interface MerchantApiCredentials {
  // Amazon SP-API (Multi-Tenant: Client ID & Secret come from AMAZON_SP_API_CONFIG, Refresh Token & Seller ID per store)
  amazonClientId?: string;
  amazonClientSecret?: string;
  amazonRefreshToken?: string;
  amazonSellerId?: string; // SELLER_ID / Merchant Token in Amazon Seller Central
  amazonRegion?: string; // 'eu-west-1' | 'us-east-1' | 'us-west-2'
  amazonMarketplaceId?: string; // 'ARBP9OOSHTCHU' for Egypt

  // Noon Partner API
  noonAuthKey?: string;
  noonAppId?: string;
  noonSecretKey?: string;
  noonWarehouseId?: string;

  // Courier API (Bosta, etc.)
  bostaApiKey?: string;

  // Advanced API Settings (Client Secrets, Redirect URIs, Webhooks, Sandbox)
  advancedWebhookSecret?: string;
  redirectUri?: string;
  isSandboxMode?: boolean;
  customApiEndpoint?: string;

  // Mode: Live API Data vs Demo Data
  dataMode: 'live' | 'demo';
  isConfigured?: boolean;
  tokenExpired?: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed';
  lastTestMessage?: string;
}

// Remote Marketer Client / Merchant Model
export interface MerchantPaymentHistoryItem {
  id: string;
  merchantId: string;
  merchantName: string;
  planId: 'plan_1_month' | 'plan_6_months' | 'plan_12_months' | 'trial_3_days' | 'admin_lifetime';
  planName: string;
  amountEGP: number;
  paymentMethod: string;
  referenceNumber: string;
  transactionId?: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  walletNumberUsed?: string;
  activatedAt: string;
  expiresAt: string;
  status: 'paid' | 'pending_verification' | 'promo' | 'admin';
}

export interface PendingVodafonePaymentRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  planId: 'plan_1_month' | 'plan_6_months' | 'plan_12_months';
  planName: string;
  durationMonths: number;
  amountEGP: number;
  paymentMethod: 'vodafone_cash' | 'credit_card' | 'instapay' | 'fawry';
  transactionId: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  walletNumberUsed: string;
  submittedAt: string;
  status: 'pending_verification' | 'approved' | 'rejected';
}

export interface RemoteMerchantClient {
  id: string;
  storeName: string; // e.g. "مؤسسة الأهرام للتجارة والتوزيع"
  contactPerson: string; // e.g. "م. حسام الشريف"
  primaryEmail: string; // e.g. "hossam.elsharkawy@ahram-trade.com"
  additionalEmails: string[]; // e.g. ["sales@ahram-trade.com", "finance@ahram-trade.com"]
  phone: string; // WhatsApp number: "01012345678"
  city: string; // e.g. "القاهرة - التجمع"
  platformsSubscribed: RemoteMerchantPlatformCode[];
  assignedProductIds: string[]; // Product IDs tracked for this merchant
  trackedProductsCount?: number;
  weeklySalesTargetEGP: number; // e.g. 150000 EGP
  currentWeeklySalesEGP: number; // e.g. 168400 EGP
  currentWeeklyOrdersCount: number; // e.g. 112 orders
  averageProfitMarginPercent: number; // e.g. 24.5%
  buyBoxWinRatePercent: number; // e.g. 84%
  reportDayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'; // default 'thursday'
  autoSendWeeklyReport: boolean;
  sendWhatsAppReport: boolean;
  lastReportSentAt?: string;
  lastReportStatus?: 'sent' | 'pending' | 'failed';
  marketerNotes?: string;
  status: 'active' | 'paused' | 'onboarding';
  managerAgencyEmail?: string; // بريد مدير التسويق / الوكالة المشرف على هذا المتجر
  dataMode?: 'live' | 'demo'; // وضع البيانات: حقيقي أو تجريبي
  apiCredentials?: MerchantApiCredentials; // مفاتيح الربط الخاصة بالتاجر
  // 3-Day Free Trial & Subscription Management per Merchant
  createdAt?: string; // تاريخ التسجيل / إضافة التاجر
  trialStartDate?: string; // بداية التجربة المجانية
  trialEndDate?: string; // نهاية الـ 3 أيام التجريبية (72 ساعة)
  subscriptionStatus?: 'trialing' | 'active' | 'expired' | 'pending_verification'; // حالة اشتراك التاجر
  subscriptionPlanId?: 'trial_3_days' | 'plan_1_month' | 'plan_6_months' | 'plan_12_months' | 'admin_lifetime';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentHistory?: MerchantPaymentHistoryItem[];
  pendingPaymentRequest?: PendingVodafonePaymentRequest;
  platformCredentials?: Record<string, {
    sellerName?: string;
    sellerId?: string;
    merchantEmail?: string;
    mwsAuthToken?: string;
    apiKey?: string;
    sellerLoginId?: string;
    sellerPortalUrl?: string;
    merchantStoreUrl?: string;
    isConnected?: boolean;
    lastSyncedAt?: string;
  }>;
}

// Weekly Sales & Competitor Intelligence Report Payload
export interface MerchantWeeklyReport {
  id: string;
  merchantId: string;
  merchantName: string;
  reportPeriod: string; // e.g. "الأسبوع الثالث (18 - 25 أغسطس 2026)"
  generatedAt: string;
  recipients: string[];
  executiveAiSummary: string;
  salesSummary: {
    totalRevenueEGP: number;
    revenueGrowthPercent: number;
    totalOrders: number;
    ordersGrowthPercent: number;
    totalProfitEGP: number;
    avgProfitMargin: number;
    buyBoxWinRate: number;
    platformBreakdown: {
      platformId: string;
      platformName: string;
      salesEGP: number;
      ordersCount: number;
      sharePercent: number;
    }[];
  };
  productCompetitorInsights: {
    productId: string;
    productTitle: string;
    productImageUrl: string;
    brand: string;
    model: string;
    merchantPrice: number;
    lowestCompetitorPrice: number;
    lowestCompetitorName: string;
    lowestCompetitorPlatform: string;
    highestCompetitorPrice: number;
    averageMarketPrice: number;
    wholesaleCostEGP: number;
    profitMarginAmount: number;
    profitMarginPercent: number;
    buyBoxStatus: 'winning' | 'at_risk' | 'losing';
    activePlatforms: string[];
    priceGapEGP: number;
    recommendedAction: string;
    platformOffers: {
      platformName: string;
      platformCode: string;
      sellerName: string;
      price: number;
      isMerchantLower: boolean;
      stockStatus: string;
    }[];
  }[];
  strategicRecommendations: string[];
}

// Per-Merchant Product Catalog & Competitor Pricing Intelligence Types
export type MerchantCatalogPricingStatus = 
  | 'winning_buybox'        // التاجر مستحوذ على الـ Buy Box بأفضل سعر
  | 'competitive'           // سعر منافس مقارب جداً لأدنى سعر
  | 'higher_than_buybox'    // سعر التاجر أعلى من سعر الـ Buy Box
  | 'needs_repricing';      // سعر مرتفع بفارق كبير ويحتاج لتعديل عاجل

export interface CompetitorOfferDetail {
  id: string;
  sellerName: string;
  sellerId?: string;
  platform: 'amazon_eg' | 'noon_eg';
  price: number;
  originalPrice?: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  fulfillmentType?: 'fba' | 'fbn_express' | 'merchant_fulfillment' | 'direct_ship';
  isBuyBoxWinner: boolean;
  productUrl?: string;
}

export interface MerchantRepricingRule {
  enabled: boolean;               // تفعيل / إيقاف التسعير التلقائي لهذا المنتج
  minPrice: number;               // الحد الأدنى للسعر (Floor Price) لحماية التاجر من الخسارة
  maxPrice: number;               // الحد الأقصى للسعر (Ceiling Price)
  beatCompetitorBy: number;       // مقدار التغلب على المنافس (مثلاً خفض 1 ج.م أو 5 ج.م عن الـ Buy Box)
  targetBenchmark: 'buybox' | 'lowest_competitor'; // المقارنة مع سعر الـ Buy Box أو أدنى منافس
  floorPriceReached?: boolean;    // هل وصل المنتج للحد الأدنى للسعر ولم يعد بالإمكان خفضه أكثر
  lastAutoRepricedAt?: string;
}

export interface RepricingAuditLogEntry {
  id: string;
  merchantId: string;
  merchantStoreName: string;
  productId: string;
  sku: string;
  asin?: string;
  productTitle: string;
  platform: 'amazon_eg' | 'noon_eg';
  platformName: string;
  previousPrice: number;
  newPrice: number;
  competitorPrice: number;
  competitorName: string;
  minPrice: number;
  maxPrice: number;
  beatAmount: number;
  floorPriceReached: boolean;
  apiSyncStatus: 'synced_live' | 'synced_sandbox' | 'floor_blocked';
  apiEndpointUsed: string; // e.g. "Amazon Listings Items API PATCH" or "Noon Partner Pricing API"
  timestamp: string;
  notes: string;
}

export interface MerchantCatalogProduct {
  id: string; // SKU or unique ID
  merchantId: string;
  merchantStoreName?: string;
  asin?: string;
  sku: string;
  barcode?: string;
  title: string;
  titleEn?: string;
  brand: string;
  category: string;
  model?: string;
  imageUrl: string;
  platform: 'amazon_eg' | 'noon_eg';
  platformName: string;
  // Merchant's Own Offering
  merchantPrice: number;
  estimatedCostEGP?: number;
  stockQuantity: number;
  shippingStatus: 'active' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'handling';
  fulfillmentType: 'fba' | 'fbn_express' | 'merchant_fulfillment' | 'direct_ship';
  shippingTime: string;
  // Competitor Pricing Intelligence (Amazon SP-API & Noon)
  lowestCompetitorPrice: number;
  lowestCompetitorName: string;
  buyBoxPrice: number;
  buyBoxWinner: string;
  isBuyBoxWinner: boolean;
  competitorsCount: number;
  competitors: CompetitorOfferDetail[];
  // Price Gap Calculations
  priceGapAmount: number;    // merchantPrice - lowestCompetitorPrice (موجب يعني التاجر أغلى)
  priceGapPercent: number;   // ((merchantPrice - lowestCompetitorPrice) / lowestCompetitorPrice) * 100
  pricingStatus: MerchantCatalogPricingStatus;
  suggestedAction: string;
  // Automated Repricer Rules per Product
  repricingRule?: MerchantRepricingRule;
  // Operational Details
  dataMode?: 'live' | 'demo';
  productUrl?: string;
  lowStockThreshold?: number; // حد المخزون المنخفض المخصص
  isCriticalStock?: boolean; // علامة تمييز المخزون الحرج
  lastRefreshedAt: string;
  lastUpdated?: string;
  tags?: string[];
  autoTags?: any[];
}

export interface MerchantCatalogSummary {
  totalProducts: number;
  amazonProductsCount: number;
  noonProductsCount: number;
  winningBuyBoxCount: number;
  buyBoxWinRatePercent: number;
  higherThanBuyBoxCount: number;
  needsRepricingCount: number;
  totalInventoryQuantity: number;
  totalCatalogValueEGP: number;
  averagePriceGapPercent: number;
  autoRepricerEnabledCount?: number;
  floorPriceReachedCount?: number;
  lowStockCount: number;
}

// Bulk Price Update & Strategy Engine Types
export type BulkPricingStrategyType = 
  | 'lowest_minus_percent'  // سعر المنافس الأقل ناقص نسبة مئوية (مثل -2%)
  | 'lowest_minus_fixed'    // سعر المنافس الأقل ناقص مبلغ ثابت (مثل -25 ج.م)
  | 'match_lowest'          // مطابقة أقل سعر في السوق تماماً (Buy Box Match)
  | 'cost_plus_margin'      // تكلفة الجملة + هامش ربح مستهدف %
  | 'average_minus_percent' // متوسط أسعار السوق ناقص نسبة %
  | 'fixed_custom_price';   // تطبيق قيمة تسعير ثابتة

export interface BulkPriceItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  sku: string;
  imageUrl: string;
  wholesaleCost: number;
  currentPrice: number;
  lowestCompetitorPrice: number;
  lowestCompetitorMerchant: string;
  averageMarketPrice: number;
  highestPrice: number;
  newCalculatedPrice: number;
  isManuallyEdited: boolean;
  selected: boolean;
  buyBoxStatus: 'winning' | 'matching' | 'higher' | 'below_cost_warning';
  expectedNetProfit: number;
  expectedProfitMarginPercent: number;
  roiPercent: number;
  isValidPrice: boolean;
  validationError?: string;
  activePlatforms: string[];
}

export interface BulkRepriceAuditLog {
  id: string;
  timestamp: string;
  strategyApplied: string;
  strategyLabel: string;
  productsUpdatedCount: number;
  platformsSynced: string[];
  totalRevenueImpactEGP: number;
  status: 'success' | 'failed';
}

// ==========================================
// Automated Periodic Performance Reports Types (تقارير الأداء الدورية التلقائية والرسوم البيانية)
// ==========================================
export type PeriodicReportPeriodType = 'weekly' | 'monthly' | 'quarterly';

export interface PlatformSalesBreakdown {
  platformId: string;
  platformName: string;
  platformCode: 'amazon' | 'noon' | 'jumia' | 'direct';
  platformColor: string;
  salesVolumeEGP: number;
  salesSharePercent: number;
  ordersCount: number;
  buyBoxWinRatePercent: number;
  averageSellingPriceEGP: number;
  totalFeesAndCommissionsEGP: number;
  netProfitEGP: number;
  topCompetitorName: string;
  priceCompetitivenessScore: number;
}

export interface SalesTrendDataPoint {
  dateLabel: string;
  amazonSales: number;
  noonSales: number;
  jumiaSales: number;
  directSales: number;
  totalSales: number;
  buyBoxWinRate: number;
  orders: number;
  netProfit: number;
}

export interface WatchlistCompetitorPriceShift {
  productId: string;
  productTitle: string;
  brand: string;
  category: string;
  imageUrl: string;
  currentMerchantPrice: number;
  previousMerchantPrice: number;
  lowestCompetitorPrice: number;
  lowestCompetitorName: string;
  lowestCompetitorPlatform: string;
  priceShiftAmountEGP: number;
  priceShiftPercent: number;
  shiftDirection: 'dropped' | 'increased' | 'stable';
  buyBoxStatus: 'winning' | 'at_risk' | 'losing';
  competitorPriceHistory: {
    period: string;
    merchantPrice: number;
    amazonLowest: number;
    noonLowest: number;
    jumiaLowest: number;
  }[];
  alertTriggered: boolean;
  recommendedTacticalMove: string;
}

export interface PeriodicPerformanceReport {
  id: string;
  title: string;
  periodType: PeriodicReportPeriodType;
  periodLabel: string;
  generatedAt: string;
  totalSalesVolumeEGP: number;
  totalSalesVolumeGrowth: number;
  totalOrdersCount: number;
  totalOrdersGrowth: number;
  averageOrderValueEGP: number;
  totalNetProfitEGP: number;
  overallProfitMarginPercent: number;
  overallBuyBoxWinRatePercent: number;
  buyBoxWinRateGrowthPercent: number;
  platformBreakdown: PlatformSalesBreakdown[];
  salesTrendData: SalesTrendDataPoint[];
  watchlistPriceShifts: WatchlistCompetitorPriceShift[];
  topProducts: {
    productId: string;
    title: string;
    brand: string;
    category: string;
    salesCount: number;
    revenueEGP: number;
    profitEGP: number;
    buyBoxWinRatePercent: number;
    dominantPlatform: string;
  }[];
  aiExecutiveSummary: string;
  strategicActionItems: {
    id: string;
    category: 'pricing' | 'inventory' | 'marketing' | 'platform';
    title: string;
    description: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  scheduleConfig: {
    isAutoScheduleActive: boolean;
    frequency: 'weekly' | 'monthly';
    targetDay: string;
    recipientEmails: string[];
    recipientPhone: string;
    lastDispatchedAt?: string;
    nextDispatchDate: string;
  };
}

// ==========================================
// Profit Projection Simulator Types (محاكي الربح المستقبلي والنمذجة التنبؤية)
// ==========================================
export type StrategyPresetId = 
  | 'premium_quality_boost'
  | 'aggressive_undercut'
  | 'balanced_growth'
  | 'bundle_aov_boost'
  | 'margin_fortress'
  | 'custom';

export type MarketScenarioId = 
  | 'normal_growth'
  | 'ramadan_peak'
  | 'white_friday_surge'
  | 'summer_dip'
  | 'competitor_price_war'
  | 'inflation_cost_surge';

export interface StrategyPreset {
  id: StrategyPresetId;
  label: string;
  badge: string;
  description: string;
  priceAdjustmentPercent: number; // e.g. +12% or -5%
  imageQualityScore: number; // 1 to 5 (Studio AI enhanced quality rating)
  conversionRateBoostPercent: number; // e.g. +35% conversion lift from studio images & trust
  marketingSpendMonthlyEGP: number; // PPC / Sponsored products spend
  bundleAovIncreasePercent: number; // Cross-sell / Bundling uplift
  estimatedBuyBoxSharePercent: number;
  color: string;
}

export interface MarketScenario {
  id: MarketScenarioId;
  label: string;
  description: string;
  seasonalMultipliers: number[]; // 12-month demand factors (e.g. [1.0, 1.1, 1.45, ...])
  cogsInflationRatePercent: number; // expected wholesale cost inflation
  competitorPriceDropPercent: number; // expected competitors price reduction
  icon: string;
}

export interface MonthlyProjectionPoint {
  monthIndex: number;
  monthLabel: string;
  unitSales: number;
  revenueEGP: number;
  cogsEGP: number;
  platformFeesEGP: number;
  marketingCostEGP: number;
  netProfitEGP: number;
  cumulativeNetProfitEGP: number;
  profitMarginPercent: number;
  buyBoxSharePercent: number;
  // Strategy comparison cumulative profits for multi-line charts
  premiumCumulativeProfit?: number;
  undercutCumulativeProfit?: number;
  balancedCumulativeProfit?: number;
  baselineCumulativeProfit?: number;
}

export interface SimulationResult {
  timelineMonths: number; // 6 or 12 months
  activeStrategy: StrategyPreset;
  activeScenario: MarketScenario;
  selectedProductId: string;
  baseWholesaleCost: number;
  baseSellingPrice: number;
  baseMonthlySalesVolume: number;
  platformCommissionPercent: number;
  shippingAndPackagingCostPerUnit: number;
  monthlyProjections: MonthlyProjectionPoint[];
  summary: {
    totalRevenueEGP: number;
    totalNetProfitEGP: number;
    totalUnitsSold: number;
    averageProfitMarginPercent: number;
    annualizedRoiPercent: number;
    profitGainVsBaselineEGP: number;
    profitGainPercent: number;
    breakEvenMonth: number;
    peakProfitMonth: string;
  };
  strategyComparisons: {
    strategyId: StrategyPresetId;
    strategyLabel: string;
    color: string;
    totalRevenueEGP: number;
    totalNetProfitEGP: number;
    roiPercent: number;
    unitSalesTotal: number;
    cumulativeProfitEnd: number;
  }[];
  sensitivityMatrix: {
    priceDelta: number; // e.g. -10%, -5%, 0%, +5%, +10%, +15%
    volumeExpected: number;
    projectedNetProfitEGP: number;
    marginPercent: number;
    isOptimal: boolean;
  }[];
  aiInsights: {
    executiveVerdict: string;
    strategicAdvantage: string;
    keyRiskFactor: string;
    actionableStep: string;
  };
}

// ==========================================
// Market Trends Radar Types (رادار اتجاهات السوق والطلب في مصر)
// ==========================================
export type DemandTrendDirection = 'surging' | 'growing' | 'steady' | 'declining' | 'stagnant';

export type ProcurementAction = 
  | 'urgent_bulk_buy'     // شراء كمية فورية لتأمين السعر وتفادي النفاد
  | 'regular_reorder'     // توريد منتظم دوري
  | 'cautious_low_stock'  // شراء بحذر بكميات صغيرة
  | 'liquidate_discount'  // تصفية وتخفيض السعر
  | 'pause_purchasing';   // إيقاف التوريد مؤقتاً

export type QuadrantClassification = 
  | 'star'       // نجم: طلب عالي + ربحية عالية 🌟
  | 'cash_cow'   // بقرة نقدية: طلب مستقر + تدفق نقدي سريع 🐮
  | 'opportunity'// فرصة صاعدة: نمو سريع + يحتاج تسعير ذكي 🚀
  | 'drain';     // فخ سيولة: طلب هابط + مخاطرة عالية ⚠️

export interface ProductDemandHistoricalPoint {
  date: string;
  weekLabel: string;
  demandScore: number; // 0 - 100
  marketPriceAvg: number;
  searchInterestIndex: number; // 0 - 100
  estimatedSalesUnits: number;
  competitorsStockLevel: 'high' | 'medium' | 'low' | 'out_of_stock';
}

export interface ProductMarketTrendAnalysis {
  productId: string;
  productTitle: string;
  productCategory: string;
  productImage: string;
  brand: string;
  currentLowestPrice: number;
  estimatedWholesaleCost: number;
  profitMarginPercent: number;
  demandScore: number; // 0 - 100 (Overall current demand rating)
  demandGrowthRatePercent: number; // e.g. +38.5% or -12.4% over past 30-90 days
  trendDirection: DemandTrendDirection;
  trendBadge: string;
  trendDescription: string;
  searchVolumeGrowthPercent: number;
  competitorPriceVelocityPercent: number; // Are competitors dropping prices or raising prices
  stockoutRiskPercent: number; // % chance market runs out of stock in next 30 days
  daysOfInventoryLeftMarketWide: number;
  procurementAction: ProcurementAction;
  procurementActionLabel: string;
  recommendedOrderQuantity: number;
  recommendedOrderWindow: string; // e.g. "خلال الـ 48 ساعة القادمة" or "انتظر انخفاض الأسعار"
  wholesalePriceForecast: {
    expectedChangePercent: number; // e.g. +6.5% expected increase in El-Mosky
    forecastDirection: 'up' | 'down' | 'stable';
    reason: string;
  };
  quadrant: QuadrantClassification;
  quadrantLabel: string;
  historicalPoints: ProductDemandHistoricalPoint[];
  aiProcurementVerdict: string;
}

export interface MarketTrendsSummary {
  totalAnalyzedProducts: number;
  surgingProductsCount: number;
  growingProductsCount: number;
  decliningProductsCount: number;
  topSurgingCategory: string;
  averageMarketDemandScore: number;
  urgentBuyCount: number;
  potentialProfitFromSurgingEGP: number;
  marketWideStockoutAlertsCount: number;
  topTrendAlert: {
    title: string;
    description: string;
    impact: 'positive' | 'warning' | 'neutral';
  };
}

// ==========================================
// Order Scheduling & Multi-Product Waybill Types (جدولة الطلبات والبوالص المنفصلة)
// ==========================================
export type OrderStatus = 'pending' | 'processing' | 'scheduled' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'credit_card' | 'vodafone_cash' | 'instapay' | 'valU_installments';
export type EgyptianGovernorate = 
  | 'القاهرة' 
  | 'الجيزة' 
  | 'الإسكندرية' 
  | 'القليوبية' 
  | 'الدقهلية' 
  | 'الشرقية' 
  | 'المنوفية' 
  | 'الغربية' 
  | 'البحيرة' 
  | 'كفر الشيخ' 
  | 'دمياط' 
  | 'بورسعيد' 
  | 'الإسماعيلية' 
  | 'السويس' 
  | 'بني سويف' 
  | 'الفيوم' 
  | 'المنيا' 
  | 'أسيوط' 
  | 'سوهاج' 
  | 'قنا' 
  | 'الأقصر' 
  | 'أسوان' 
  | 'البحر الأحمر' 
  | 'مطروح';

export interface CourierCompany {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  trackingPrefix: string;
  averageDeliveryDays: string;
  baseDeliveryFeeEGP: number;
  codFeePercent: number;
  contactNumber: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  asin?: string;
  productTitle: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  itemStatus: 'packed' | 'waybill_generated' | 'ready_for_pickup' | 'in_transit' | 'delivered';
  waybillNumber: string; // Distinct Waybill number for EACH individual product
  courierId: string;
  courierName: string;
  weightKg: number;
  shippingFeeEGP: number;
  warehouseLocation: string; // e.g. "مخزن القاهرة الرئيسي - رف A4"
  barcode: string;
  generatedAt: string;
  dispatchScheduledTime?: string;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-EG-2026-8841"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  governorate: EgyptianGovernorate;
  fullAddress: string;
  platformSource: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'kenzz_eg' | 'homzmart_eg' | 'tiktok_shop' | 'direct_whatsapp' | 'social_media';
  platformSourceName: string;
  createdAt: string;
  scheduledDispatchDate: string;
  items: OrderItem[];
  subtotalEGP: number;
  totalShippingFeeEGP: number;
  discountEGP: number;
  grandTotalEGP: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  orderStatus: OrderStatus;
  notes?: string;
  merchantId?: string;
  merchantName?: string;
  isDemo?: boolean; // وضع المعاينة التجريبية
  dataMode?: 'live' | 'demo'; // وضع البيانات للطلب
}

// ==========================================
// Product Pricing Guardrails & Smart Dynamic Pricing (الحد الأدنى والأقصى والتسعير الديناميكي الذكي)
// ==========================================
export type SmartDynamicPricingRuleType =
  | 'undercut_lowest_competitor' // خفض بمبلغ ثابت أو نسبة تحت أرخص منافس لاقتناص الـ Buy Box
  | 'match_lowest_competitor'    // مطابقة سعر أرخص منافس تماماً مع حماية الحد الأدنى
  | 'target_margin_percentage'   // الحفاظ على هامش ربح صافي مستهدف بعد العمولات
  | 'match_market_median';       // موازنة السعر مع متوسط السوق وعروض المنافسين

export type GuardrailEnforcementStatus =
  | 'optimal_within_bounds' // السعر المحسوب يقع بأمان بين الحد الأدنى والأقصى
  | 'floor_protected'       // تدخل صمام الأمان (Floor Lock): سعر المنافس منخفض جداً وتم تثبيت سعرك عند الحد الأدنى لمنع الخسارة
  | 'ceiling_capped'        // تدخل السقف الأعلى (Ceiling Cap): تم رفع السعر للحد الأقصى لاقتناص أعلى هامش ربح
  | 'manual_hold';          // التسعير التلقائي متوقف يدوياً لهذا المنتج

export interface FloorProximityEvaluation {
  isApproachingFloor: boolean;     // True if within proximity buffer (e.g. <= 8% or <= 150 EGP above floor)
  isBreached: boolean;             // True if strictly below the minimum allowed floor price
  isSafe: boolean;                 // True if comfortably above the floor
  currentPrice: number;            // Evaluated price
  effectiveFloorPrice: number;     // Floor threshold price for the product/platform
  costPrice: number;               // Wholesale cost
  distanceToFloorEGP: number;      // currentPrice - effectiveFloorPrice
  proximityPercent: number;        // Margin above floor: ((currentPrice - floor) / floor) * 100
  bufferThresholdPercent: number;  // Proximity buffer (default 8%)
  statusHeadlineAr: string;        // Headline message in Arabic
  statusExplanationAr: string;     // Detailed explanation in Arabic
  urgencyLevel: 'safe' | 'warning' | 'danger';
  platformName: string;
  isFloorLocked: boolean;
}

export interface PlatformPriceGuardrail {
  platformId: string;
  platformName: string;
  platformCode: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'kenzz_eg' | 'homzmart_eg' | 'tiktok_shop' | 'btech_eg';
  minAllowedPrice: number; // Floor Price (الحد الأدنى الحرج لحماية هامش الربح)
  maxAllowedPrice: number; // Ceiling Price (الحد الأقصى للتسعير في أوقات ذروة الطلب)
  actualSellingPrice: number; // السعر الفعلي المعتمد للمنصة
  platformCommissionPercent: number; // عمولة المنصة
  platformFixedFeeEGP: number; // الرسوم الثابتة لكل طلب
  netProfitEGP: number;
  netMarginPercent: number;
  isFloorPriceLocked: boolean; // قفل منع التخفيض تحت الحد الأدنى
  lastAutoAdjustedAt?: string;
  lastGuardrailStatus?: GuardrailEnforcementStatus;
}

export interface ProductPricingPlan {
  productId: string;
  productTitle: string;
  costPrice: number; // تكلفة الجملة الفعلية
  globalMinPrice: number; // الحد الأدنى العام (Global Floor)
  globalMaxPrice: number; // الحد الأقصى العام (Global Ceiling)
  suggestedOptimalPrice: number;
  platformGuardrails: PlatformPriceGuardrail[];
  autoRepriceWithinBounds: boolean;
  repriceRuleType: SmartDynamicPricingRuleType;
  undercutMode?: 'fixed_egp' | 'percentage'; // طريقة التفوق السعري: مبلغ ثابت بالجنيه أو نسبة مئوية
  undercutValue?: number; // مثلاً 20 ج.م أو 2% تحت أرخص منافس
  targetNetMarginPercent?: number; // هامش الربح الصافي المستهدف (مثلاً 15%)
  autoRaiseOnStockoutOrSurge?: boolean; // رفع السعر تلقائياً نحو السقف عند نفاد مخزون المنافس أو ارتفاع أسعاره
  lastModifiedAt: string;
  modifiedBy: string;
}

export interface SmartDynamicPriceEvaluation {
  productId: string;
  productTitle: string;
  competitorLowestPrice: number;
  competitorMerchantName: string;
  competitorPlatformName: string;
  previousSellingPrice: number;
  rawCalculatedPrice: number; // السعر قبل تطبيق قواعد الحماية (Floor/Ceiling)
  finalApprovedPrice: number; // السعر النهائي المعتمد بعد تطبيق قواعد حماية الأرباح
  effectiveFloorPrice: number;
  effectiveCeilingPrice: number;
  costPrice: number;
  estimatedCommissionEGP: number;
  estimatedFixedFeeEGP: number;
  netProfitEGP: number;
  netMarginPercent: number;
  guardrailStatus: GuardrailEnforcementStatus;
  statusHeadlineAr: string;
  statusExplanationAr: string;
  priceDeltaFromPrevious: number;
  priceDeltaFromCompetitor: number;
  buyBoxProbabilityPercent: number;
}

export interface SmartDynamicPricingEventLog {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  triggerReasonAr: string;
  competitorName: string;
  competitorPlatform: string;
  previousCompetitorPrice: number;
  newCompetitorPrice: number;
  previousMerchantPrice: number;
  rawTargetPrice: number;
  newMerchantPrice: number;
  floorPriceGuardrail: number;
  ceilingPriceGuardrail: number;
  netProfitEGP: number;
  netMarginPercent: number;
  guardrailStatus: GuardrailEnforcementStatus;
  ruleAppliedLabel: string;
  platformsUpdatedCount: number;
}

// ==========================================
// Remote Marketing Manager & RBAC Permissions (صلاحيات المسوق المسؤول عن بُعد وسجل النشاط)
// ==========================================
export type MarketerAccessRole = 'master_marketer' | 'senior_account_manager' | 'merchant_owner' | 'merchant_staff' | 'auditor_view_only';

export interface MerchantPermissionConfig {
  merchantId: string;
  merchantName: string;
  canEditPrices: boolean; // صلاحية تعديل الأسعار
  canApplyAutoRepricing: boolean; // صلاحية تفعيل التسعير الآلي
  canGenerateWaybills: boolean; // صلاحية توليد وطباعة بوالص الشحن
  canModifyInventoryCost: boolean; // تعديل تكلفة الجملة
  canExportReports: boolean; // تصدير وطباعة التقارير
  canManageIntegrations: boolean; // ربط المنصات الجديدة (كنز، هومزمارت، إلخ)
  isViewOnly: boolean; // الاكتفاء بالاطلاع فقط
  assignedMarketerName: string;
  assignedMarketerEmail: string;
  accessTier: 'vip_full_managed' | 'hybrid_collaborative' | 'client_view_only';
}

export interface MarketerAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'مسوق مسؤول عن بُعد' | 'التاجر' | 'النظام التلقائي';
  merchantName: string;
  actionCategory: 'pricing' | 'permissions' | 'waybill_shipping' | 'platform_link' | 'inventory' | 'report_generated';
  actionTitle: string;
  actionDetails: string;
  previousValue?: string;
  newValue?: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
}

// ==========================================
// Sales Performance Dashboard Types (لوحة تحكم أداء المبيعات والتسعير السريع)
// ==========================================
export type SalesTimeframeType = '7days' | '14days' | '30days';

export interface DailySalesDataPoint {
  date: string;
  dateLabel: string;
  dayOfWeek: string;
  unitsSold: number;
  revenueEGP: number;
  merchantAvgPrice: number;
  lowestCompetitorAvgPrice: number;
  competitorName: string;
  priceDifferenceEGP: number;
  buyBoxWon: boolean;
  amazonSalesUnits: number;
  noonSalesUnits: number;
  jumiaSalesUnits: number;
  directSalesUnits: number;
  grossMarginPercent: number;
  netProfitEGP: number;
  significantEvent?: string;
  pricingDecisionMade?: string;
  wholesaleCostEGP?: number;
  profitMarginEGP?: number;
  costEvent?: string;
}

export interface ProductSalesPerformance {
  productId: string;
  productTitle: string;
  productImage: string;
  productBrand: string;
  sku: string;
  category: string;
  isWatchlisted: boolean;
  currentPrice: number;
  costPrice: number;
  lowestCompetitorPrice: number;
  lowestCompetitorName: string;
  competitorPriceChange24h: number; // e.g. -150 or +80
  priceDifference: number; // currentPrice - lowestCompetitorPrice
  buyBoxStatus: 'won' | 'lost' | 'threatened' | 'exclusive';
  todayUnitsSold: number;
  yesterdayUnitsSold: number;
  weeklyUnitsSold: number;
  weeklyRevenueEGP: number;
  salesGrowthPercent: number; // e.g. +34.5
  priceElasticity: 'very_high' | 'high' | 'moderate' | 'low';
  recommendedActionPrice: number;
  recommendedActionReason: string;
  estimatedSalesLiftWithRecPrice: number; // e.g. 42 (%)
  dailyHistory: DailySalesDataPoint[];
}

export interface SalesDashboardSummary {
  timeframe: SalesTimeframeType;
  totalUnitsSold: number;
  totalRevenueEGP: number;
  totalNetProfitEGP: number;
  overallMarginPercent: number;
  buyBoxDominancePercent: number;
  avgPriceAdvantageEGP: number;
  salesGrowthRatePercent: number;
  topPerformingProduct: string;
  topOpportunityProduct: string;
  dailyAggregatedData: DailySalesDataPoint[];
}

// ==========================================
// Seasonal Demand Forecasting Types (توقع حجم الطلب الموسمي وتنبيهات الذروة)
// ==========================================
export interface SeasonalPeakEvent {
  id: string;
  name: string; // e.g. "موسم الجمعة البيضاء 2026 (White Friday)"
  shortName: string;
  dateRangeLabel: string;
  startDate: string; // "2026-11-20"
  endDate: string; // "2026-11-30"
  daysUntilPeak: number; // e.g. 85 days
  historicalDemandMultiplier: number; // e.g. 3.6x
  description: string;
  keyCategories: string[];
  recommendedLeadTimeDays: number; // days needed before event for wholesale procurement & FBA/FBN inbound
  discountDepthAverage: number; // e.g. 18%
  urgencyLevel: 'urgent' | 'upcoming' | 'planned';
}

export interface SeasonalForecastDataPoint {
  date: string;
  dateLabel: string;
  dayIndex: number;
  baselineDemandUnits: number;
  projectedPeakDemandUnits: number;
  remainingStockUnits: number;
  stockoutThreshold: number;
  isStockoutOccurred: boolean;
  reorderArrivalBoost?: number;
}

export interface ProductSeasonalDemandForecast {
  productId: string;
  productTitle: string;
  productImage: string;
  sku: string;
  category: string;
  currentStockUnits: number;
  dailySalesVelocity: number; // current average units/day
  peakEventId: string;
  peakEventName: string;
  historicalMultiplier: number; // e.g. 3.4x
  projectedPeakDailyVelocity: number; // velocity * multiplier
  expectedTotalPeakDemandUnits: number;
  daysOfInventoryAtCurrentRate: number;
  daysOfInventoryAtPeakRate: number;
  expectedStockoutDate: string;
  stockoutAlertSeverity: 'critical' | 'high_risk' | 'moderate' | 'safe';
  daysUntilStockout: number;
  recommendedReorderUnits: number;
  safetyBufferPercent: number; // e.g. 25%
  wholesaleUnitCostEGP: number;
  totalReorderInvestmentEGP: number;
  projectedPeakRevenueEGP: number;
  projectedPeakNetProfitEGP: number;
  estimatedLostRevenueIfStockoutEGP: number;
  reorderDeadlineDate: string; // date by which PO must be placed
  supplierLeadTimeDays: number; // e.g. 10 days
  preferredWholesaleMarket: string; // e.g. "شارع عبد العزيز - القاهرة"
  actionPlanSummary: string;
  forecastDailyTimeline: SeasonalForecastDataPoint[];
}

// ==========================================
// Platform Commission Calculator Types (حاسبة عمولات المنصات وصافي الربح)
// ==========================================
export type PlatformKey = 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'kenzz' | 'homzmart';

export interface PlatformMetadata {
  id: PlatformKey;
  name: string;
  nameAr: string;
  logoEmoji: string;
  colorTheme: string;
  badge: string;
  defaultFulfillmentType: string;
  payoutSchedule: string;
  vatRatePercent: number; // 14% Egyptian VAT
  officialCommissionUrl?: string;
}

export interface CategoryCommissionRule {
  categoryKey: string;
  categoryNameAr: string;
  rates: {
    [key in PlatformKey]: {
      referralPercent: number; // Commission %
      fixedClosingFeeEGP: number; // Closing fee per unit
      fulfillmentEstimatedEGP: number; // Average FBA/FBN/Shipping fee
      paymentProcessingPercent: number; // Gateway or COD fee %
      notesAr: string;
    };
  };
}

export interface PlatformFeeCalculationResult {
  platformId: PlatformKey;
  platformName: string;
  platformNameAr: string;
  logoEmoji: string;
  sellingPriceEGP: number;
  wholesaleCostEGP: number;
  referralFeePercent: number;
  referralFeeAmountEGP: number;
  fixedClosingFeeEGP: number;
  fulfillmentFeeEGP: number;
  paymentGatewayPercent: number;
  paymentGatewayAmountEGP: number;
  subtotalFeesBeforeVATEGP: number;
  vatOnFeesEGP: number; // 14% on platform fees
  totalPlatformDeductionsEGP: number;
  netPayoutToMerchantEGP: number; // Selling price - platform deductions
  netProfitEGP: number; // Net payout - wholesale cost
  profitMarginPercent: number; // (netProfit / sellingPrice) * 100
  roiPercent: number; // (netProfit / wholesaleCost) * 100
  breakEvenSellingPriceEGP: number; // minimum price to have 0 profit
  recommendedMinimumPriceEGP: number; // price for 15% net margin
  isMostProfitable: boolean;
  profitabilityRank: number;
}

export interface MultiPlatformCommissionSummary {
  productId?: string;
  productTitle: string;
  categoryKey: string;
  categoryNameAr: string;
  sellingPriceEGP: number;
  wholesaleCostEGP: number;
  platformResults: PlatformFeeCalculationResult[];
  mostProfitablePlatform: PlatformFeeCalculationResult;
  averageProfitEGP: number;
  profitSpreadEGP: number; // diff between highest and lowest platform profit
}

// ==========================================
// AI Merchant Intelligence Chatbox Types (دردشة الذكاء الاصطناعي واستشارات التسعير)
// ==========================================
export interface PricingRecommendationAction {
  productId: string;
  productTitle: string;
  currentPrice: number;
  recommendedPrice: number;
  currency: string;
  reason?: string;
  expectedMarginPercent?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  suggestedPriceAction?: PricingRecommendationAction | null;
  selectedProductId?: string;
  isError?: boolean;
}

// ==========================================
// Inventory Tracker & Stock Reorder Alerts (وحدة تتبع المخزون وتنبيهات حد الطلب الأدنى)
// ==========================================
export type InventoryStockStatus = 
  | 'critical_stockout' // نفاد تام أو شبه تام (0 أو 1 قطعة)
  | 'at_reorder_point'  // وصل إلى أو أقل من حد الطلب الأدنى (بحاجة لتوريد فوري)
  | 'low_stock'         // مخزون يقترب من حد الطلب
  | 'healthy'           // مخزون كافي ومستقر
  | 'excess';           // مخزون فائض عن الطاقة الاستيعابية

export interface ProductInventoryRecord {
  productId: string;
  sku: string;
  barcode?: string;
  currentStock: number; // المخزون الحالي بالقطع
  minReorderLevel: number; // حد الطلب الأدنى (نقطة إعادة الطلب Reorder Point)
  reorderQuantity: number; // كمية التوريد المقترحة
  maxStockLevel: number; // السعة القصوى للمخزن
  safetyStock: number; // مخزون الأمان
  warehouseLocation: string; // موقع المستودع (مخزن العتبة، البستان، شارع عبد العزيز، 6 أكتوبر...)
  supplierName: string; // اسم المورد المعتمد
  supplierPhone: string; // رقم هاتف المورد / واتساب
  leadTimeDays: number; // فترة التوريد المتوقعة بالأيام
  dailyBurnRate: number; // معدل المبيعات والاستهلاك اليومي
  daysOfSupplyLeft: number; // الأيام المتبقية قبل نفاد المخزون
  stockStatus: InventoryStockStatus;
  lastRestockedAt?: string; // تاريخ آخر استلام
  costPerUnitEGP: number; // تكلفة الجملة للقطعة
  totalInventoryValuationEGP: number; // القيمة الإجمالية للمخزون
  reservedStock?: number; // قطع محجوزة لطلبيات قيد التجهيز
  incomingStock?: number; // قطع قيد الشحن من المورد
  alertDismissed?: boolean;
  warehouseAllocations?: Record<string, number>; // توزيع المخزون الفعلي حسب معرف كل مخزن فرعي
  salesVelocityDaily?: number; // متوسط معدل سرعة البيع اليومي
  optimalReorderQuantity?: number; // كمية إعادة الطلب المثالية (EOQ)
  holdingCostSavedEGP?: number; // التوفير السنوي في تكاليف التخزين
}

export interface WarehouseSubFolder {
  id: string; // معرف فريد للمخزن الفرعي (e.g. wh-damietta, wh-october)
  name: string; // اسم المخزن أو المجلد الفرعي (مثال: مخزن دمياط، مخزن أكتوبر)
  shortCode: string; // كود مختصر (DMT-01, OCT-02)
  city: string; // المدينة / المحافظة
  locationDetails: string; // العنوان التفصيلي / المنطقة الصناعية
  managerName: string; // اسم أمين / مدير المخزن
  managerPhone: string; // هاتف أمين المخزن
  capacityUnits: number; // السعة الاستيعابية القصوى بالقطع
  colorTheme: 'amber' | 'indigo' | 'emerald' | 'sky' | 'rose' | 'purple';
  subZones: string[]; // أرفف / أقسام فرعية داخل المخزن (مثلاً: قطاع غرف النوم، قطاع المكاتب)
  isPrimary?: boolean; // المخزن الرئيسي الافتراضي
  createdAt?: string;
  notes?: string;
}

export interface WarehouseTransferSlip {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  quantity: number;
  transferredAt: string;
  driverOrCourier?: string;
  notes?: string;
  status: 'completed' | 'in_transit';
}

export interface VelocityAnalysisResult {
  dailyVelocity: number;
  weeklyVelocity: number;
  monthlyVelocity: number;
  velocityTrend: 'accelerating' | 'stable' | 'slowing';
  velocityTrendLabel: string;
  daysUntilStockout: number;
  daysUntilReorderPoint: number;
  isProactiveUrgent: boolean; // stockout <= leadTimeDays
  optimalReorderQty: number; // EOQ
  currentReorderQty: number;
  holdingCostCurrentAnnualEGP: number;
  holdingCostOptimalAnnualEGP: number;
  holdingCostSavingsAnnualEGP: number;
  cycleDaysOptimal: number;
  reorderRecommendation: string;
  stockoutRiskDate: string;
}

export interface InventoryAlertNotification {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  currentStock: number;
  minReorderLevel: number;
  reorderQuantity: number;
  severity: 'critical' | 'warning' | 'info';
  triggeredAt: string;
  isRead: boolean;
  supplierName: string;
  supplierPhone: string;
  warehouseLocation: string;
  message: string;
  alertType?: 'reorder_point' | 'critical_stockout' | 'proactive_velocity' | 'optimal_reorder_savings';
  dailyVelocity?: number;
  daysUntilStockout?: number;
  leadTimeDays?: number;
  optimalReorderQty?: number;
  holdingCostSavingsAnnualEGP?: number;
}

export interface AIPricingTimingAdvisorResult {
  productId: string;
  productTitle: string;
  currentPrice: number;
  recommendedPrice: number;
  lowestCompetitorPrice: number;
  wholesaleCost: number;
  expectedMarginPercent: number;
  marginDifferencePercent: number;
  expectedRevenueImpactPercent: number;
  timingStrategy: 'reprice_now' | 'schedule_delay' | 'hold_and_wait' | 'increase_price';
  timingStrategyLabel: string;
  optimalTimingWindow: string; // e.g. "الخميس القادم 2:00 ظهراً"
  scheduledExecutionTimestamp: string; // ISO string
  confidenceScore: number; // 0-100
  supplyDemandAnalysis: {
    demandTrend: 'rising' | 'peak' | 'steady' | 'dropping';
    demandTrendLabel: string;
    demandExplanation: string;
    supplyTrend: 'abundant' | 'tight' | 'competitor_stockout_expected';
    supplyTrendLabel: string;
    supplyExplanation: string;
    peakShoppingWindow: string;
  };
  priceHistoryKeyFinding: string;
  strategicReasoning: string;
  riskAssessment: string;
  suggestedActionType: 'apply_now' | 'schedule_auto' | 'hold_price';
  analyzedAt: string;
}

export interface ScheduledRepriceEntry {
  id: string;
  productId: string;
  productTitle: string;
  targetPrice: number;
  scheduledTime: string; // ISO string
  scheduledLabel: string;
  strategyLabel: string;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: string;
}

export interface ReorderPurchaseOrder {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  supplierName: string;
  supplierPhone: string;
  warehouseLocation: string;
  unitCostEGP: number;
  totalCostEGP: number;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'pending' | 'dispatched' | 'received' | 'cancelled';
  notes?: string;
}

export type FurnitureSupplierCategory = 
  | 'bedroom_kids'         // غرف النوم والأطفال
  | 'living_sofas'          // الصالونات والأنتريهات والركنات
  | 'office_institutional'  // الأثاث المكتبي والمؤسسي
  | 'kitchen_dining'        // مطابخ وغرف طعام
  | 'outdoor_decor';        // أثاث الحدائق والديكور الخشبي

export interface SupplierProfile {
  id: string;
  name: string;
  phone: string; // رقم الواتساب المعتمد
  leadTimeDays: number; // وقت التوريد المعتاد بالأيام
  averageDeliveryDays?: number; // معدل التوريد (متوسط عدد الأيام التي يستغرقها المورد للتوصيل)
  deliveryReliability?: number; // نسبة الالتزام بموعد التوريد (مثال: 98%)
  warehouseLocation: string; // موقع التوريد / المستودع
  notes?: string;
  isPreferred?: boolean;
  category?: FurnitureSupplierCategory; // تصنيف الأثاث المتخصص
  categoryArabic?: string; // اسم الفئة بالعربية
  city?: string; // دمياط، المنصورة، العاشر من رمضان، 6 أكتوبر، العبور، القاهرة، إلخ
  factoryType?: 'factory' | 'workshop' | 'raw_materials' | 'importer_distributor'; // نوع المنشأة
  factoryTypeArabic?: string;
  speedScore?: 'lightning' | 'fast' | 'moderate' | 'custom_order'; // مؤشر سرعة التوريد
  pricingTier?: 'budget' | 'competitive' | 'premium' | 'luxury'; // مؤشر تنافسية السعر
  specialties?: string[]; // الخامات والتخصصات المميزة
  minimumOrderValue?: number; // الحد الأدنى للطلب بالجنيه
  isVerified?: boolean; // مورد ومصنع موثق
}

export interface SupplierProductQuote {
  supplierId: string;
  productId: string;
  wholesalePrice: number; // سعر توريد الجملة للوحدة بالجنيه
  minOrderQuantity?: number; // الحد الأدنى للطلب
  note?: string; // ملاحظات عرض السعر
  updatedAt?: string;
}

export interface WhatsAppSupplierAutomationConfig {
  autoTriggerEnabled: boolean; // تفعيل التنبيه التلقائي للمورد عند وصول حد الطلب
  customMessageTemplate: string; // قالب الرسالة التلقائية
  autoRecordPurchaseOrder: boolean; // قيد أمر التوريد تلقائياً في المخزن
  includeWarehouseLocation: boolean; // تضمين موقع المستودع في الرسالة
  includeEstimatedCost: boolean; // تضمين سعر الجملة وإجمالي القيمة
  webhookUrl?: string; // رابط الـ Webhook الخارجي (Meta Cloud API / UltraMsg / WPPConnect)
  apiProvider: 'whatsapp_direct' | 'meta_cloud_api' | 'ultramsg' | 'generic_webhook';
}

export interface WhatsAppDispatchLog {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  supplierName: string;
  supplierPhone: string;
  quantityOrdered: number;
  currentStock: number;
  minReorderLevel: number;
  warehouseLocation: string;
  totalCostEGP: number;
  dispatchedAt: string;
  messageText: string;
  status: 'sent_direct' | 'webhook_delivered' | 'api_logged';
}

// API Sync Error Logging & Monitoring System for Admin Control
export type ApiPlatformId = 
  | 'amazon_eg' 
  | 'noon_eg' 
  | 'jumia_eg' 
  | 'seller_central' 
  | 'asin_sync' 
  | 'price_scraper' 
  | 'custom_api';

export type ApiErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ApiErrorStatus = 'unresolved' | 'investigating' | 'resolved' | 'ignored';

export interface ApiSyncErrorItem {
  id: string;
  platform: ApiPlatformId;
  platformName: string;
  endpoint: string;
  errorCode: string;
  errorMessage: string;
  errorDetails?: string;
  severity: ApiErrorSeverity;
  status: ApiErrorStatus;
  userId?: string;
  userEmail?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface LogSyncFailureInput {
  platform: ApiPlatformId;
  platformName?: string;
  endpoint?: string;
  errorCode: string;
  errorMessage: string;
  errorDetails?: string | Record<string, unknown>;
  severity?: ApiErrorSeverity;
  userId?: string;
  userEmail?: string;
}

// User Activity Logs (سجل عمليات وحركات المستخدمين)
export type UserActionType = 
  | 'login' 
  | 'logout' 
  | 'price_update' 
  | 'wishlist_add' 
  | 'wishlist_remove' 
  | 'wishlist_update'
  | 'watchlist_add' 
  | 'watchlist_remove' 
  | 'csv_export' 
  | 'csv_import'
  | 'platform_sync' 
  | 'price_alert' 
  | 'inventory_update' 
  | 'product_scan' 
  | 'settings_change' 
  | 'search'
  | 'system';

export type UserActionSeverity = 'info' | 'success' | 'warning' | 'error';

export interface UserActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  actionType: UserActionType;
  actionTitle: string; // e.g. "إضافة إلى قائمة الأمنيات", "تسجيل دخول التاجر"
  details: string;
  platform?: string; // e.g. 'amazon_eg', 'noon_eg'
  ipAddress?: string;
  deviceInfo?: string;
  status: UserActionSeverity;
  metadata?: Record<string, any>;
  createdAt: string; // ISO string
}

// Wishlist Items & Folders (قائمة أمنيات التاجر والصفقات المرتقبة)
export type WishlistPriority = 'high' | 'medium' | 'low';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  currentPrice: number;
  targetPrice: number; // السعر المستهدف المرغوب
  discountWantedPercent?: number;
  priority: WishlistPriority;
  folder: string; // e.g. 'الرئيسية', 'أجهزة إلكترونية', 'أثاث دمياط', 'مفروشات'
  notes?: string;
  targetPlatforms: string[];
  notifyWhenAvailable?: boolean;
  isTargetPriceReached?: boolean;
  priceDropEGP?: number;
  marketLowestPrice?: number;
  competitorSource?: string;
  addedAt: string;
  updatedAt?: string;
}

export interface WishlistFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  itemCount?: number;
}

// Market Share & Competitor Analysis based on Firestore
export interface CompetitorMarketShareItem {
  name: string;
  sharePercent: number; // e.g. 28.5
  estimatedVolumeEGP: number;
  unitsSold: number;
  averagePrice: number;
  isMerchant: boolean;
  color: string;
  fill?: string;
  platformDistribution: {
    amazon_eg: number;
    noon_eg: number;
    jumia_eg: number;
    direct: number;
  };
}

export interface MarketShareRecord {
  id: string;
  timeframe: string;
  category: string;
  merchantStoreName: string;
  merchantSharePercent: number;
  competitorsSharePercent: number;
  totalMarketVolumeEGP: number;
  totalMarketUnits: number;
  breakdown: CompetitorMarketShareItem[];
  historicalTrend: {
    periodLabel: string;
    merchantShare: number;
    competitorA: number;
    competitorB: number;
    competitorC: number;
    others: number;
  }[];
  dataSource: 'firestore_live' | 'firestore_cached';
  syncedAt?: string;
  lastUpdated?: string;
}

// AI Competitor Price History & Supply/Demand Timing Advisor Types
export type TimingStrategyType = 'schedule_delay' | 'reprice_now' | 'hold_and_wait' | 'increase_price' | 'flash_sale';

export interface AIPricingSchedulePhase {
  phase: string;
  timing: string;
  suggestedPrice: number;
  action: string;
  demandLevel: string;
}

export interface AIPricingTimingPrediction {
  productId: string;
  productTitle: string;
  currentPrice: number;
  wholesaleCost: number;
  lowestCompetitorPrice: number;
  timingStrategy: TimingStrategyType;
  timingStrategyLabel: string;
  optimalTimingWindow: string;
  scheduledExecutionTimestamp: string;
  recommendedPrice: number;
  expectedMarginPercent: number;
  marginDifferencePercent: number;
  expectedRevenueImpactPercent: number;
  confidenceScore: number;
  supplyDemandAnalysis: {
    demandTrend: 'rising' | 'peak' | 'steady' | 'dropping';
    demandTrendLabel: string;
    demandExplanation: string;
    supplyTrend: 'abundant' | 'tight' | 'competitor_stockout_expected';
    supplyTrendLabel: string;
    supplyExplanation: string;
    peakShoppingWindow: string;
    keyDrivers?: string[];
  };
  priceHistoryKeyFinding: string;
  strategicReasoning: string;
  riskAssessment: string;
  suggestedActionType: 'apply_now' | 'schedule_auto' | 'hold_price';
  upcomingActionSchedule?: AIPricingSchedulePhase[];
  comparison?: {
    immediateAction: {
      price: number;
      marginPercent: number;
      outcomeDescription: string;
    };
    optimalAction: {
      price: number;
      marginPercent: number;
      outcomeDescription: string;
      profitAdvantageEGP: number;
    };
  };
  analyzedAt: string;
}

// Auto-Pricing Engine Types
export * from './types/autoPricing';

