import {
  supabase,
  supabaseClient,
  isDemoOrOrphanProduct,
  recordTraderLastSyncAt,
} from '../lib/supabase';
import { dataCache } from './dataCache';
import { evaluatePulledProductsForPriceAlerts } from './smartPriceAlerts';
import {
  detectImportSourceType,
  ImportErrorBreakdown,
  ImportHistoryItemDetail,
  ImportRowErrorDetail,
  ImportSourceType,
  ImportUpdatedSnapshot,
  recordImportHistoryEntry,
} from './importHistoryService';

export const DEFAULT_TRADER_ID = 'A37JIM7LHQI6IM';

export const NO_TRADER_SELECTED_ERROR = 'لم يتم تحديد التاجر';

export const IMPORT_BUTTON_LABEL = 'استورد ملف أمازون (TXT / Excel / CSV)';
export const ACCEPTED_IMPORT_EXTENSIONS = '.txt,.csv,.tsv,.xlsx,.xls';

export const DIRECT_FETCH_BLOCKED_MESSAGE =
  'لا يمكن السحب المباشر من أمازون من المتصفح - أمازون يمنع ذلك - استخدم استيراد ملف أمازون أو ربط SP-API';

export const FRIENDLY_PULL_FAILURE_MESSAGE =
  'فشل السحب - أمازون يمنع السحب المباشر - استخدم استيراد ملف أمازون';

export const UNSUPPORTED_FILE_ERROR_MESSAGE =
  'الملف غير مدعوم - ارفع ملف TXT من أمازون';

export const EMPTY_FILE_ERROR_MESSAGE =
  'الملف فارغ - اطلب تقرير جديد من Seller Central > Reports > Inventory Reports';

export const REPORT_STILL_PROCESSING_MESSAGE =
  'التقرير لسه مجهزش في أمازون - استنى 5 دقايق واطلب تقرير جديد';

export const UNRECOGNIZED_COLUMNS_PREFIX =
  'لم أستطع قراءة أعمدة الملف - الأعمدة الموجودة: ';

export const MISSING_SKU_COLUMN_PREFIX =
  'لم أجد عمود SKU - الأعمدة الموجودة: ';

export const AMAZON_TXT_GUIDE_TEXT =
  'من Seller Central > التقارير > تقارير المخزون > اطلب All Listings Report > نزل ملف .txt > ارفعه هنا';

export const FOUNDER_AMAZON_WARNING_TEXT =
  'لا تدخل بحسابك على حساب التاجر - اطلب من التاجر الموافقة من حسابه هو';

export const SP_API_SETTINGS_STORAGE_KEY = 'radar_amazon_sp_api_settings_v1';
export const COMPETITOR_PRICES_STORAGE_KEY = 'radar_competitor_prices_v1';
export const RADAR_COMPETITOR_PRICES_UPDATED_EVENT = 'radar_competitor_prices_updated';

export interface AmazonSpApiCredentials {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  sellerId: string;
  marketplaceId?: string;
  region?: string;
  updatedAt?: string;
}

export interface CompetitorPriceRecord {
  product_id?: string | null;
  asin: string;
  competitor_price: number | null;
  buy_box_price: number | null;
  competitors_count: number;
  image_url?: string | null;
  updated_at: string;
}

export interface CompetitorSyncStatus {
  triggered: boolean;
  spApiConfigured: boolean;
  analyzedCount: number;
  pricedCount: number;
  updatedImagesCount: number;
  message: string;
}

export interface SellerCentralImportedRow {
  title: string;
  sku: string;
  asin: string;
  price: number;
  stock: number;
  image_url: string;
  product_url: string;
  condition?: string;
  platform: string;
  trader_id: string;
}

export interface ParsedSellerCentralResult {
  rows: SellerCentralImportedRow[];
  totalRead: number;
  skippedCount: number;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
}

export interface SellerCentralImportPreview {
  fileName: string;
  fileSizeBytes?: number;
  traderId: string;
  traderName?: string;
  platform: string;
  rows: SellerCentralImportedRow[];
  previewRows: SellerCentralImportedRow[];
  totalRead: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
  summaryMessage: string;
  linePreviewMessage?: string;
}

export interface ExcelImportSummary {
  total: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  verifiedDbCount?: number;
  message: string;
  traderId: string;
  rows: SellerCentralImportedRow[];
  importId?: string;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
  competitorSync?: CompetitorSyncStatus;
}

export interface ImportCommitMetadata {
  fileName?: string;
  fileType?: ImportSourceType;
  fileSizeBytes?: number;
  traderName?: string;
  errorBreakdown?: ImportErrorBreakdown;
  rowErrors?: ImportRowErrorDetail[];
}

export interface SpApiSyncOutcome {
  success: boolean;
  blocked?: boolean;
  message: string;
  total?: number;
  newCount?: number;
  updatedCount?: number;
}

/**
 * Constructs Amazon standard ASIN product image URL when image_url is missing in listing reports.
 */
export function buildAmazonAsinImageUrl(asin?: string | null): string {
  const cleanAsin = String(asin || '').trim().toUpperCase();
  if (!cleanAsin || !/^[A-Z0-9]{8,14}$/.test(cleanAsin)) {
    return '';
  }
  return `https://images-na.ssl-images-amazon.com/images/P/${cleanAsin}.01.L.jpg`;
}

/**
 * Normalizes any network / JSON parse / HTML doctype / CORS failure into an actionable Arabic message.
 * Never leaks "Unexpected token '<'" or "<!DOCTYPE is not valid JSON" to the user.
 */
export function sanitizeProductPullError(err: unknown): string {
  const raw =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err
      ? String((err as any).message || '')
      : String(err || '');

  const normalized = raw.trim();
  if (!normalized) {
    return FRIENDLY_PULL_FAILURE_MESSAGE;
  }

  if (
    normalized === DIRECT_FETCH_BLOCKED_MESSAGE ||
    normalized === UNSUPPORTED_FILE_ERROR_MESSAGE ||
    normalized === EMPTY_FILE_ERROR_MESSAGE ||
    normalized === REPORT_STILL_PROCESSING_MESSAGE ||
    normalized.startsWith(UNRECOGNIZED_COLUMNS_PREFIX) ||
    normalized.startsWith(MISSING_SKU_COLUMN_PREFIX)
  ) {
    return normalized;
  }

  const lower = normalized.toLowerCase();
  const isHtmlOrJsonFailure =
    lower.includes("unexpected token '<'") ||
    lower.includes('unexpected token "<"') ||
    lower.includes('unexpected token') ||
    lower.includes('<!doctype') ||
    lower.includes('<html') ||
    lower.includes('is not valid json') ||
    lower.includes('json.parse') ||
    lower.includes('syntaxerror') ||
    lower.includes('sellercentral.amazon') ||
    lower.includes('cors') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('404') ||
    lower.includes('not found');

  if (isHtmlOrJsonFailure) {
    return FRIENDLY_PULL_FAILURE_MESSAGE;
  }

  return normalized;
}

/**
 * Safely parses a Fetch Response ensuring HTML / non-JSON pages never cause raw JSON syntax errors.
 */
export async function parseSafeJsonOrThrow(res: Response): Promise<any> {
  const contentType = (res.headers?.get?.('content-type') || '').toLowerCase();
  const text = await res.text();
  const trimmed = text.trim();

  const looksLikeHtml =
    trimmed.toLowerCase().startsWith('<!doctype') ||
    trimmed.toLowerCase().startsWith('<html') ||
    trimmed.startsWith('<');

  if (
    looksLikeHtml ||
    (!contentType.includes('application/json') &&
      !trimmed.startsWith('{') &&
      !trimmed.startsWith('['))
  ) {
    throw new Error(FRIENDLY_PULL_FAILURE_MESSAGE);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(FRIENDLY_PULL_FAILURE_MESSAGE);
  }
}

export function getAmazonSpApiSettings(): AmazonSpApiCredentials {
  const defaults: AmazonSpApiCredentials = {
    refreshToken: '',
    clientId: '',
    clientSecret: '',
    sellerId: DEFAULT_TRADER_ID,
    marketplaceId: 'ARBP9OOSHTCHU',
    region: 'eu-west-1',
  };

  if (typeof localStorage === 'undefined') {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(SP_API_SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
      sellerId: String(parsed?.sellerId || DEFAULT_TRADER_ID).trim() || DEFAULT_TRADER_ID,
    };
  } catch {
    return defaults;
  }
}

export function saveAmazonSpApiSettings(
  updates: Partial<AmazonSpApiCredentials>
): AmazonSpApiCredentials {
  const current = getAmazonSpApiSettings();
  const next: AmazonSpApiCredentials = {
    refreshToken: (updates.refreshToken ?? current.refreshToken).trim(),
    clientId: (updates.clientId ?? current.clientId).trim(),
    clientSecret: (updates.clientSecret ?? current.clientSecret).trim(),
    sellerId: (updates.sellerId ?? current.sellerId).trim() || DEFAULT_TRADER_ID,
    marketplaceId: (updates.marketplaceId ?? current.marketplaceId ?? 'ARBP9OOSHTCHU').trim(),
    region: (updates.region ?? current.region ?? 'eu-west-1').trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SP_API_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }

  return next;
}

export function isAmazonSpApiConfigured(creds?: AmazonSpApiCredentials): boolean {
  const settings = creds || getAmazonSpApiSettings();
  return Boolean(
    settings.refreshToken.trim() &&
      settings.clientId.trim() &&
      settings.clientSecret.trim() &&
      settings.sellerId.trim()
  );
}

const SUPPORTED_EXTS = ['.txt', '.csv', '.tsv', '.xlsx', '.xls'];

export function validateImportFileExtension(fileName?: string): string {
  const clean = String(fileName || '').trim().toLowerCase();
  if (!clean) return '.xlsx';
  const matched = SUPPORTED_EXTS.find((ext) => clean.endsWith(ext));
  if (!matched) {
    throw new Error(UNSUPPORTED_FILE_ERROR_MESSAGE);
  }
  return matched;
}

/**
 * Normalizes a header column name by:
 * 1. Stripping UTF BOM and Arabic diacritics (tashkeel).
 * 2. Lowercasing everything.
 * 3. Stripping all whitespace, dashes (-), underscores (_), slashes, and punctuation.
 * Examples: "sku-البائع" -> "skuالبائع", "السعر الحالي" -> "السعرالحالي", "seller-sku" -> "sellersku"
 */
export function cleanHeaderKey(key: string): string {
  return String(key || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-–—/\\|:]+/g, '');
}

/**
 * Secondary normalization with single spaces for backwards compatibility
 * Examples: "sku-البائع" -> "sku البائع", "seller-sku" -> "seller sku"
 */
export function normalizeHeaderKey(key: string): string {
  return String(key || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-–—/\\|:]+/g, ' ');
}

export const SKU_COLUMN_ALIASES = [
  'seller-sku',
  'sellersku',
  'sku',
  'skuالبائع',
  'رمزالبائع',
  'رمزالمنتج',
  'كودالمنتج',
  'كود المنتج',
  'رمز البائع',
  'رمز المنتج',
  'sku البائع',
  'merchantsku',
  'merchant sku',
  'كود',
  'الكود',
  'رمز sku',
  'رمزsku',
];

export const ASIN_COLUMN_ALIASES = [
  'asin',
  'asin1',
  'رقمasin',
  'رقم asin',
  'amazon asin',
  'amazonasin',
  'asin code',
  'asincode',
  'product id',
  'productid',
  'معرفالمنتج',
  'معرف المنتج',
];

export const TITLE_COLUMN_ALIASES = [
  'item-name',
  'itemname',
  'title',
  'productname',
  'product name',
  'item name',
  'اسمالمنتج',
  'اسم المنتج',
  'اسم',
  'العنوان',
  'عنوان',
  'المنتج',
  'producttitle',
  'product title',
  'listing title',
  'listingtitle',
  'name',
];

export const PRICE_COLUMN_ALIASES = [
  'السعر الحالي',
  'السعرالحالي',
  'السعر الحالي (egp)',
  'السعر الحالي (ج.م)',
  'current price',
  'currentprice',
  'price',
  'your price',
  'yourprice',
  'standard price',
  'standardprice',
  'listing price',
  'listingprice',
  'sale price',
  'saleprice',
  'السعر',
  'السعر (ج.م)',
  'سعر البيع',
  'سعرالبيع',
  'سعر العرض',
  'سعرالعرض',
  'سعر القائمة',
  'سعرالقائمة',
  'سعر',
];

export const STOCK_COLUMN_ALIASES = [
  'الكمية',
  'المتاح',
  'quantity',
  'stock',
  'qty',
  'الكمية المتاحة',
  'الكميةالمتاحة',
  'الكمية المتوفرة',
  'الكميةالمتوفرة',
  'المخزون',
  'المخزون المتاح',
  'fulfillment channel quantity',
  'fulfillable quantity',
  'fulfillable-quantity',
  'available quantity',
  'availablequantity',
  'available',
  'كمية',
  'العدد',
];

export const IMAGE_COLUMN_ALIASES = [
  'image-url',
  'imageurl',
  'image url',
  'صورة',
  'رابطالصورة',
  'رابط الصورة',
  'صورةالمنتج',
  'صورة المنتج',
  'main image url',
  'mainimageurl',
  'image',
  'img',
  'picture url',
  'pictureurl',
  'الصورة',
];

export const CONDITION_COLUMN_ALIASES = [
  'condition',
  'itemcondition',
  'item condition',
  'الحالة',
  'حالةالمنتج',
  'حالة المنتج',
];

export const SKU_CANONICAL_SET = new Set(
  SKU_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const ASIN_CANONICAL_SET = new Set(
  ASIN_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const TITLE_CANONICAL_SET = new Set(
  TITLE_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const PRICE_CANONICAL_SET = new Set(
  PRICE_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const STOCK_CANONICAL_SET = new Set(
  STOCK_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const IMAGE_CANONICAL_SET = new Set(
  IMAGE_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);
export const CONDITION_CANONICAL_SET = new Set(
  CONDITION_COLUMN_ALIASES.flatMap((a) => [cleanHeaderKey(a), normalizeHeaderKey(a)])
);

export const ALL_SIGNATURE_CANONICAL_KEYS = new Set([
  ...Array.from(SKU_CANONICAL_SET),
  ...Array.from(ASIN_CANONICAL_SET),
  ...Array.from(TITLE_CANONICAL_SET),
  ...Array.from(PRICE_CANONICAL_SET),
  ...Array.from(STOCK_CANONICAL_SET),
  ...Array.from(IMAGE_CANONICAL_SET),
  ...Array.from(CONDITION_CANONICAL_SET),
]);

export const HEADER_SIGNATURE_KEYS = ALL_SIGNATURE_CANONICAL_KEYS;
export const PRIMARY_HEADER_ANCHORS = new Set([
  ...Array.from(SKU_CANONICAL_SET),
  ...Array.from(ASIN_CANONICAL_SET),
  ...Array.from(TITLE_CANONICAL_SET),
]);

function normalizeFuzzyArabicHeader(key: string): string {
  return String(key || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-–—/\\|:]+/g, ' ')
    .trim();
}

function pickField(normRow: Record<string, any>, aliases: string[]): string {
  for (const alias of aliases) {
    const cleanA = cleanHeaderKey(alias);
    const normA = normalizeHeaderKey(alias);
    const val = normRow[cleanA] ?? normRow[normA] ?? normRow[alias];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function parseNumericValue(raw: string | number, integer = false): number {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return integer ? Math.round(raw) : Math.round(raw * 100) / 100;
  }
  if (!raw) return 0;
  // Convert Arabic-Indic & Extended Arabic-Indic numerals, Arabic decimal/thousands separators
  let text = String(raw)
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');

  // Remove currency tokens BEFORE extracting numeric pattern so "ج.م." dot does not break decimals
  text = text
    .replace(/(ج\.?\s*م\.?|جنيه(?:\s+مصري)?|ر\.?\s*س\.?|د\.?\s*إ\.?|egp|sar|usd|aed|eur)/gi, ' ')
    .trim();

  // Handle thousands commas (e.g. "1,899.50" or "1,899") vs European/Arabic comma decimal ("1899,50")
  if (text.includes(',') && !text.includes('.')) {
    if (/^\s*-?\d+,\d{1,2}\s*$/.test(text)) {
      text = text.replace(',', '.');
    } else {
      text = text.replace(/,/g, '');
    }
  } else {
    text = text.replace(/,/g, '');
  }

  // Strip spaces between thousands digits e.g. "1 899.50"
  text = text.replace(/(?<=\d)\s+(?=\d)/g, '');

  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return 0;
  const num = integer ? parseInt(match[0], 10) : parseFloat(match[0]);
  if (!Number.isFinite(num) || num < 0) return 0;
  return integer ? num : Math.round(num * 100) / 100;
}

function pickBestNumericField(
  normRow: Record<string, any>,
  rawRow: Record<string, any>,
  aliases: string[],
  fuzzyMatcher: (fuzzyHeader: string) => boolean,
  integer: boolean
): string {
  const candidates: string[] = [];

  for (const alias of aliases) {
    const cleanA = cleanHeaderKey(alias);
    const normA = normalizeHeaderKey(alias);
    const val = normRow[cleanA] ?? normRow[normA] ?? normRow[alias];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      candidates.push(String(val).trim());
    }
  }

  for (const rawKey of Object.keys(rawRow || {})) {
    const val = rawRow[rawKey];
    if (val === undefined || val === null || String(val).trim() === '') continue;
    const fuzzyKey = normalizeFuzzyArabicHeader(rawKey);
    if (fuzzyKey && fuzzyMatcher(fuzzyKey)) {
      candidates.push(String(val).trim());
    }
  }

  if (candidates.length === 0) return '';
  const positiveCandidate = candidates.find((c) => parseNumericValue(c, integer) > 0);
  return positiveCandidate || candidates[0];
}

function isFuzzyPriceHeader(fuzzyKey: string): boolean {
  const isExcluded =
    fuzzyKey.includes('competitor') ||
    fuzzyKey.includes('buybox') ||
    fuzzyKey.includes('buy box') ||
    fuzzyKey.includes('min') ||
    fuzzyKey.includes('max') ||
    fuzzyKey.includes('shipping') ||
    fuzzyKey.includes('ship') ||
    fuzzyKey.includes('discount') ||
    fuzzyKey.includes('tax') ||
    fuzzyKey.includes('fee') ||
    fuzzyKey.includes('منافس') ||
    fuzzyKey.includes('ادني') ||
    fuzzyKey.includes('اقصي') ||
    fuzzyKey.includes('شحن') ||
    fuzzyKey.includes('خصم') ||
    fuzzyKey.includes('ضريب') ||
    fuzzyKey.includes('عمول');
  if (isExcluded) return false;
  return (
    fuzzyKey.includes('السعر الحالي') ||
    fuzzyKey.includes('current price') ||
    fuzzyKey.includes('your price') ||
    fuzzyKey.includes('standard price') ||
    fuzzyKey.includes('listing price') ||
    fuzzyKey.includes('سعر البيع') ||
    fuzzyKey.includes('سعر') ||
    fuzzyKey === 'price' ||
    fuzzyKey.endsWith(' price') ||
    fuzzyKey.startsWith('price ')
  );
}

function isFuzzyStockHeader(fuzzyKey: string): boolean {
  return (
    fuzzyKey.includes('كمي') ||
    fuzzyKey.includes('متاح') ||
    fuzzyKey.includes('مخزون') ||
    fuzzyKey.includes('quantity') ||
    fuzzyKey.includes('stock') ||
    fuzzyKey.includes('fulfillable') ||
    fuzzyKey === 'qty' ||
    fuzzyKey.includes(' qty') ||
    fuzzyKey === 'available'
  );
}

function decodeUtf16LeFallback(bytes: Uint8Array, startOffset = 0): string {
  let out = '';
  for (let i = startOffset; i + 1 < bytes.length; i += 2) {
    const codeUnit = bytes[i] | (bytes[i + 1] << 8);
    out += String.fromCharCode(codeUnit);
  }
  return out;
}

function decodeUtf16BeFallback(bytes: Uint8Array, startOffset = 0): string {
  let out = '';
  for (let i = startOffset; i + 1 < bytes.length; i += 2) {
    const codeUnit = (bytes[i] << 8) | bytes[i + 1];
    out += String.fromCharCode(codeUnit);
  }
  return out;
}

/**
 * Decodes raw file bytes supporting UTF-16LE, UTF-16BE, UTF-8 (with or without BOM),
 * and strips any leading BOM character (\uFEFF) before parsing.
 */
export function decodeDelimitedBytesToUtf8Text(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0) return '';

  // 1. UTF-16LE BOM: 0xFF 0xFE
  if (bytes.byteLength >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    let text = '';
    try {
      text = new TextDecoder('utf-16le').decode(bytes);
    } catch {
      text = decodeUtf16LeFallback(bytes, 2);
    }
    return text.replace(/^\uFEFF/, '');
  }

  // 2. UTF-16BE BOM: 0xFE 0xFF
  if (bytes.byteLength >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = '';
    try {
      text = new TextDecoder('utf-16be').decode(bytes);
    } catch {
      text = decodeUtf16BeFallback(bytes, 2);
    }
    return text.replace(/^\uFEFF/, '');
  }

  // 3. UTF-8 BOM: 0xEF 0xBB 0xBF
  if (bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3)).replace(/^\uFEFF/, '');
  }

  // 4. Heuristic UTF-16 detection without BOM (e.g., stripped BOM files)
  if (bytes.byteLength >= 4 && bytes.byteLength % 2 === 0) {
    const sampleLen = Math.min(bytes.byteLength, 240);
    let oddNulls = 0;
    let evenNulls = 0;
    const pairs = Math.floor(sampleLen / 2);
    for (let i = 0; i + 1 < sampleLen; i += 2) {
      if (bytes[i] === 0 && bytes[i + 1] !== 0) evenNulls++;
      if (bytes[i + 1] === 0 && bytes[i] !== 0) oddNulls++;
    }
    if (oddNulls >= Math.max(2, Math.floor(pairs * 0.25)) && evenNulls === 0) {
      try {
        return new TextDecoder('utf-16le').decode(bytes).replace(/^\uFEFF/, '');
      } catch {
        return decodeUtf16LeFallback(bytes, 0).replace(/^\uFEFF/, '');
      }
    }
    if (evenNulls >= Math.max(2, Math.floor(pairs * 0.25)) && oddNulls === 0) {
      try {
        return new TextDecoder('utf-16be').decode(bytes).replace(/^\uFEFF/, '');
      } catch {
        return decodeUtf16BeFallback(bytes, 0).replace(/^\uFEFF/, '');
      }
    }
  }

  // 5. Default UTF-8
  return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '');
}

export type SupportedDelimiter = '\t' | ',' | ';';

function splitDelimitedLines(text: string, delimiter: SupportedDelimiter): string[][] {
  const parsedLines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else if (ch === '"' && currentCell === '') {
      inQuotes = true;
    } else if (ch === delimiter) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if (ch === '\n') {
      currentRow.push(currentCell);
      parsedLines.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += ch;
    }
  }
  currentRow.push(currentCell);
  parsedLines.push(currentRow);
  return parsedLines;
}

function findAmazonHeaderRowIndex(parsedLines: string[][]): {
  headerIdx: number;
  hasRecognizedHeader: boolean;
  hasSkuColumn: boolean;
} {
  let fallbackHeaderIdx = -1;
  let bestCandidateIdx = -1;
  let bestCandidateHasSku = false;

  for (let i = 0; i < parsedLines.length; i++) {
    const cells = parsedLines[i];
    const hasContent = cells.some((c) => String(c || '').trim() !== '');
    if (!hasContent) continue;

    if (fallbackHeaderIdx === -1) {
      fallbackHeaderIdx = i;
    }

    const cleanedCells = cells.map(cleanHeaderKey).filter(Boolean);
    const normCells = cells.map(normalizeHeaderKey).filter(Boolean);

    const hasSku =
      cleanedCells.some((k) => SKU_CANONICAL_SET.has(k)) ||
      normCells.some((k) => SKU_CANONICAL_SET.has(k));
    const hasAsin =
      cleanedCells.some((k) => ASIN_CANONICAL_SET.has(k)) ||
      normCells.some((k) => ASIN_CANONICAL_SET.has(k));
    const hasTitle =
      cleanedCells.some((k) => TITLE_CANONICAL_SET.has(k)) ||
      normCells.some((k) => TITLE_CANONICAL_SET.has(k));
    const hasPrice =
      cleanedCells.some((k) => PRICE_CANONICAL_SET.has(k)) ||
      normCells.some((k) => PRICE_CANONICAL_SET.has(k));
    const hasStock =
      cleanedCells.some((k) => STOCK_CANONICAL_SET.has(k)) ||
      normCells.some((k) => STOCK_CANONICAL_SET.has(k));

    // 1. SKU + any of (Title, ASIN, Price, Stock): DEFINITE valid Amazon header
    if (hasSku && (hasTitle || hasAsin || hasPrice || hasStock)) {
      return { headerIdx: i, hasRecognizedHeader: true, hasSkuColumn: true };
    }

    // 2. SKU alone with at least 2 non-empty columns
    if (hasSku && cells.filter((c) => String(c || '').trim() !== '').length >= 2) {
      return { headerIdx: i, hasRecognizedHeader: true, hasSkuColumn: true };
    }

    // 3. Header row with recognized Amazon attributes (e.g. ASIN + Price or Title + Price), but missing SKU
    const otherSigCount = [hasAsin, hasTitle, hasPrice, hasStock].filter(Boolean).length;
    if (otherSigCount >= 2 && bestCandidateIdx === -1) {
      bestCandidateIdx = i;
      bestCandidateHasSku = false;
    }
  }

  if (bestCandidateIdx !== -1) {
    return {
      headerIdx: bestCandidateIdx,
      hasRecognizedHeader: true,
      hasSkuColumn: bestCandidateHasSku,
    };
  }

  return {
    headerIdx: fallbackHeaderIdx,
    hasRecognizedHeader: false,
    hasSkuColumn: false,
  };
}

/**
 * Tests Tab (\t) first, then Comma (,), then Semicolon (;) and selects
 * the delimiter producing the highest column count in the header / first data line.
 */
export function detectBestDelimiter(rawText: string): SupportedDelimiter {
  const candidates: SupportedDelimiter[] = ['\t', ',', ';'];
  const withoutBom = String(rawText || '').replace(/^\uFEFF/, '');
  const normalized = withoutBom.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Inspect only a generous leading slice for fast detection
  const sampleLines = normalized
    .split('\n')
    .filter((line) => line.trim() !== '')
    .slice(0, 20)
    .join('\n');

  if (!sampleLines) return '\t';

  let bestDelimiter: SupportedDelimiter = '\t';
  let bestScore = -1;

  for (const delim of candidates) {
    const rows = splitDelimitedLines(sampleLines, delim).filter((r) =>
      r.some((c) => c.trim() !== '')
    );
    if (rows.length === 0) continue;

    const { headerIdx, hasRecognizedHeader, hasSkuColumn } = findAmazonHeaderRowIndex(rows);
    const headerRow = headerIdx >= 0 ? rows[headerIdx] : rows[0];
    const firstDataRow =
      headerIdx >= 0 && rows[headerIdx + 1] ? rows[headerIdx + 1] : headerRow;

    const firstDataCols = firstDataRow.length;
    const headerCols = headerRow.length;
    const colCount = Math.max(firstDataCols, headerCols);
    // Boost recognized Amazon headers so metadata lines with commas don't fool Tab-separated files
    const score =
      colCount +
      (hasRecognizedHeader ? 1000 : 0) +
      (hasSkuColumn ? 500 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delim;
    }
  }

  return bestDelimiter;
}

/**
 * Parses Tab (\t), Comma (,), or Semicolon (;) delimited text (supporting UTF-8 / UTF-16 decoded text),
 * stripping BOM, skipping preamble/blank lines before Amazon's header row (seller-sku/asin/item-name),
 * detecting Amazon "Report is still processing", and separating header row from data rows.
 */
export function parseDelimitedRecordsToObjects(
  rawText: string,
  _preferredDelimiter?: SupportedDelimiter
): {
  rawObjects: Array<Record<string, string>>;
  skippedBlankLines: number;
  hasRecognizedHeader: boolean;
  hasSkuColumn: boolean;
  firstNonEmptyLine: string;
  headerLineText: string;
} {
  // Strip any stray BOM and normalize line endings
  const withoutBom = String(rawText || '')
    .replace(/\uFEFF/g, '')
    .replace(/\0/g, '');
  const normalized = withoutBom.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Strip single trailing EOF newline so normal trailing newline isn't counted as a skipped blank row
  const trimmedEnd = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;

  if (!trimmedEnd.trim()) {
    return {
      rawObjects: [],
      skippedBlankLines: 0,
      hasRecognizedHeader: false,
      hasSkuColumn: false,
      firstNonEmptyLine: '',
      headerLineText: '',
    };
  }

  if (trimmedEnd.toLowerCase().includes('report is still processing')) {
    throw new Error(REPORT_STILL_PROCESSING_MESSAGE);
  }

  const physicalLines = trimmedEnd.split('\n');
  const firstNonEmptyLine = (physicalLines.find((l) => l.trim() !== '') || '').trim();

  const effectiveDelimiter = detectBestDelimiter(trimmedEnd);
  const parsedLines = splitDelimitedLines(trimmedEnd, effectiveDelimiter);

  const { headerIdx, hasRecognizedHeader, hasSkuColumn } = findAmazonHeaderRowIndex(parsedLines);
  if (headerIdx === -1) {
    return {
      rawObjects: [],
      skippedBlankLines: 0,
      hasRecognizedHeader: false,
      hasSkuColumn: false,
      firstNonEmptyLine,
      headerLineText: '',
    };
  }

  const headers = parsedLines[headerIdx].map((h, colIdx) => {
    const cleaned = String(h || '').replace(/\uFEFF/g, '').trim();
    return cleaned || `col_${colIdx}`;
  });
  const headerLineText = headers.join(effectiveDelimiter === '\t' ? ' | ' : ` ${effectiveDelimiter} `);

  const rawObjects: Array<Record<string, string>> = [];
  let skippedBlankLines = 0;

  for (let r = headerIdx + 1; r < parsedLines.length; r++) {
    const cells = parsedLines[r];
    const isBlank = cells.every((c) => String(c || '').trim() === '');
    if (isBlank) {
      skippedBlankLines++;
      continue;
    }
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = String(cells[c] ?? '').trim();
    }
    rawObjects.push(obj);
  }

  return {
    rawObjects,
    skippedBlankLines,
    hasRecognizedHeader,
    hasSkuColumn,
    firstNonEmptyLine,
    headerLineText,
  };
}

export function mapRawSheetRowsToProductsDetailed(
  rows: Array<Record<string, any>>,
  options?: { traderId?: string; platform?: string; initialSkippedCount?: number }
): ParsedSellerCentralResult {
  const rawOptTrader = String(options?.traderId || '').trim();
  const targetTraderId =
    rawOptTrader && !['all', 'null', 'undefined'].includes(rawOptTrader.toLowerCase())
      ? rawOptTrader
      : '';
  const defaultPlatform = (options?.platform || 'amazon').toLowerCase();

  const dedupedBySku = new Map<string, SellerCentralImportedRow>();
  const initialBlankLines = options?.initialSkippedCount || 0;
  let skippedCount = initialBlankLines;
  const errorBreakdown: ImportErrorBreakdown = {
    missingSku: 0,
    blankOrInvalidRows: initialBlankLines,
    orphanOrBlocked: 0,
  };
  const rowErrors: ImportRowErrorDetail[] = [];

  rows.forEach((rawRow, rowIndex) => {
    const rowNumber = rowIndex + 2;
    if (!rawRow || typeof rawRow !== 'object') {
      skippedCount++;
      errorBreakdown.blankOrInvalidRows++;
      if (rowErrors.length < 300) {
        rowErrors.push({
          rowNumber,
          errorCategory: 'blank_or_invalid',
          reason: 'صف غير صالح أو تالف',
        });
      }
      return;
    }

    const normRow: Record<string, any> = {};
    let hasAnyValue = false;
    Object.keys(rawRow).forEach((k) => {
      const cleanK = cleanHeaderKey(k);
      const normK = normalizeHeaderKey(k);
      const lowerK = String(k || '').trim().toLowerCase();
      const val = rawRow[k];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        hasAnyValue = true;
      }
      if (cleanK && (normRow[cleanK] === undefined || normRow[cleanK] === '')) {
        normRow[cleanK] = val;
      }
      if (normK && (normRow[normK] === undefined || normRow[normK] === '')) {
        normRow[normK] = val;
      }
      if (lowerK && (normRow[lowerK] === undefined || normRow[lowerK] === '')) {
        normRow[lowerK] = val;
      }
    });

    // Skip empty rows
    if (!hasAnyValue) {
      skippedCount++;
      errorBreakdown.blankOrInvalidRows++;
      if (rowErrors.length < 300) {
        rowErrors.push({
          rowNumber,
          errorCategory: 'blank_or_invalid',
          reason: 'صف فارغ بدون بيانات',
        });
      }
      return;
    }

    // SKU is required (seller-sku or sku or sku-البائع, etc.) - skip rows missing SKU
    const rawSku = pickField(normRow, SKU_COLUMN_ALIASES).toUpperCase();

    if (!rawSku) {
      skippedCount++;
      errorBreakdown.missingSku++;
      if (rowErrors.length < 300) {
        const partialTitle = pickField(normRow, TITLE_COLUMN_ALIASES);
        const partialAsin = pickField(normRow, ASIN_COLUMN_ALIASES).toUpperCase();
        const partialPrice = pickField(normRow, PRICE_COLUMN_ALIASES);
        const partialStock = pickField(normRow, STOCK_COLUMN_ALIASES);
        rowErrors.push({
          rowNumber,
          ...(partialTitle ? { title: partialTitle } : {}),
          ...(partialAsin ? { asin: partialAsin } : {}),
          ...(partialPrice ? { price: parseNumericValue(partialPrice, false) } : {}),
          ...(partialStock ? { stock: parseNumericValue(partialStock, true) } : {}),
          errorCategory: 'missing_sku',
          reason: 'رمز SKU مفقود',
        });
      }
      return;
    }

    const rawTitle = pickField(normRow, TITLE_COLUMN_ALIASES);

    // asin -> asin (asin / asin1), fallback to product-id when asin is empty
    const explicitAsin = pickField(normRow, ASIN_COLUMN_ALIASES).toUpperCase();

    const productIdFallback = pickField(normRow, [
      'product id',
      'productid',
      'معرف المنتج',
      'معرفالمنتج',
    ]).toUpperCase();

    const effectiveAsin = explicitAsin || productIdFallback || '';
    const effectiveTitle = rawTitle || (effectiveAsin ? `منتج ${effectiveAsin}` : rawSku);

    const priceRaw = pickBestNumericField(
      normRow,
      rawRow,
      PRICE_COLUMN_ALIASES,
      isFuzzyPriceHeader,
      false
    );
    const stockRaw = pickBestNumericField(
      normRow,
      rawRow,
      STOCK_COLUMN_ALIASES,
      isFuzzyStockHeader,
      true
    );
    const condition = pickField(normRow, CONDITION_COLUMN_ALIASES);
    const explicitImageUrl = pickField(normRow, IMAGE_COLUMN_ALIASES);
    const imageUrl = explicitImageUrl || buildAmazonAsinImageUrl(effectiveAsin);

    const rawProductUrl = pickField(normRow, [
      'product url',
      'item url',
      'url',
      'listing url',
      'link',
      'رابط المنتج',
      'رابطالمنتج',
      'الرابط',
    ]);

    const productUrl =
      rawProductUrl || (effectiveAsin ? `https://www.amazon.eg/dp/${effectiveAsin}` : '');

    const platform = (
      pickField(normRow, ['platform', 'channel', 'المنصة']) || defaultPlatform
    ).toLowerCase();

    const candidate: SellerCentralImportedRow = {
      title: effectiveTitle,
      sku: rawSku,
      asin: effectiveAsin,
      price: parseNumericValue(priceRaw, false),
      stock: parseNumericValue(stockRaw, true),
      image_url: imageUrl,
      product_url: productUrl,
      ...(condition ? { condition } : {}),
      platform,
      trader_id: targetTraderId,
    };

    if (isDemoOrOrphanProduct(candidate)) {
      skippedCount++;
      errorBreakdown.orphanOrBlocked++;
      if (rowErrors.length < 300) {
        rowErrors.push({
          rowNumber,
          sku: candidate.sku,
          title: candidate.title,
          ...(candidate.asin ? { asin: candidate.asin } : {}),
          price: candidate.price,
          stock: candidate.stock,
          errorCategory: 'orphan_or_blocked',
          reason: 'بيانات منتج تجريبية أو غير صالحة للاستيراد',
        });
      }
      return;
    }

    // Intra-file duplicate SKU: keep last/latest without duplicating product
    dedupedBySku.set(rawSku, candidate);
  });

  const parsedRows = Array.from(dedupedBySku.values());
  if (parsedRows.length === 0 && rows.length > 0) {
    const rawKeys = Object.keys(rows[0] || {});
    const hasAnySignature = rawKeys.some(
      (k) =>
        ALL_SIGNATURE_CANONICAL_KEYS.has(cleanHeaderKey(k)) ||
        ALL_SIGNATURE_CANONICAL_KEYS.has(normalizeHeaderKey(k))
    );
    const hasAnySku = rawKeys.some(
      (k) =>
        SKU_CANONICAL_SET.has(cleanHeaderKey(k)) ||
        SKU_CANONICAL_SET.has(normalizeHeaderKey(k))
    );
    if (hasAnySignature && !hasAnySku) {
      const sample = rawKeys.join(' | ');
      throw new Error(`${MISSING_SKU_COLUMN_PREFIX}[${sample || 'غير معروف'}]`);
    }
  }

  return {
    rows: parsedRows,
    totalRead: parsedRows.length,
    skippedCount,
    errorBreakdown,
    rowErrors,
  };
}

export function mapRawSheetRowsToProducts(
  rows: Array<Record<string, any>>,
  options?: { traderId?: string; platform?: string }
): SellerCentralImportedRow[] {
  return mapRawSheetRowsToProductsDetailed(rows, options).rows;
}

function buildDelimitedParseFailureError(
  rawText: string,
  parsed: ReturnType<typeof parseDelimitedRecordsToObjects>
): Error {
  if (!rawText.trim()) {
    return new Error(EMPTY_FILE_ERROR_MESSAGE);
  }
  const sample = (parsed.headerLineText || parsed.firstNonEmptyLine || rawText.trim())
    .slice(0, 180)
    .trim();

  // If Amazon header was recognized but SKU column is missing
  if (parsed.hasRecognizedHeader && !parsed.hasSkuColumn) {
    return new Error(`${MISSING_SKU_COLUMN_PREFIX}[${sample}]`);
  }

  if (!parsed.hasRecognizedHeader) {
    return new Error(`${UNRECOGNIZED_COLUMNS_PREFIX}[${sample}]`);
  }
  if (parsed.rawObjects.length === 0) {
    // Recognized Amazon header with zero data rows
    return new Error(EMPTY_FILE_ERROR_MESSAGE);
  }
  return new Error(`${UNRECOGNIZED_COLUMNS_PREFIX}[${sample}]`);
}

/**
 * Detailed parser supporting Amazon .txt / .tsv / .csv (UTF-16LE, UTF-16BE, UTF-8 + BOM removal,
 * Tab / Comma / Semicolon auto-detection, preamble title skipping) and .xlsx / .xls Excel files.
 */
export async function parseSellerCentralWorkbookDetailed(
  data: ArrayBuffer | Uint8Array | string,
  options?: { fileName?: string; traderId?: string; platform?: string }
): Promise<ParsedSellerCentralResult> {
  const ext = validateImportFileExtension(options?.fileName);

  if (typeof data === 'string') {
    const isTabText = ext === '.txt' || ext === '.tsv';
    const preferredDelimiter: SupportedDelimiter = isTabText ? '\t' : ',';
    const parsedDelim = parseDelimitedRecordsToObjects(data, preferredDelimiter);
    if (parsedDelim.rawObjects.length === 0) {
      throw buildDelimitedParseFailureError(data, parsedDelim);
    }
    const result = mapRawSheetRowsToProductsDetailed(parsedDelim.rawObjects, {
      ...options,
      initialSkippedCount: parsedDelim.skippedBlankLines,
    });
    if (result.rows.length === 0) {
      throw buildDelimitedParseFailureError(data, parsedDelim);
    }
    return result;
  }

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.byteLength === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  if (ext === '.txt' || ext === '.tsv' || ext === '.csv') {
    const text = decodeDelimitedBytesToUtf8Text(bytes);
    const preferredDelimiter: SupportedDelimiter = ext === '.csv' ? ',' : '\t';
    const parsedDelim = parseDelimitedRecordsToObjects(text, preferredDelimiter);
    if (parsedDelim.rawObjects.length === 0) {
      throw buildDelimitedParseFailureError(text, parsedDelim);
    }
    const result = mapRawSheetRowsToProductsDetailed(parsedDelim.rawObjects, {
      ...options,
      initialSkippedCount: parsedDelim.skippedBlankLines,
    });
    if (result.rows.length === 0) {
      throw buildDelimitedParseFailureError(text, parsedDelim);
    }
    return result;
  }

  // Binary Excel (.xlsx / .xls)
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(bytes, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet], {
    defval: '',
  });
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  const result = mapRawSheetRowsToProductsDetailed(rawRows, options);
  if (result.rows.length === 0) {
    const rawKeys = Object.keys(rawRows[0] || {});
    const headerKeys = rawKeys.join(' | ');
    const hasSku = rawKeys.some(
      (k) =>
        SKU_CANONICAL_SET.has(cleanHeaderKey(k)) ||
        SKU_CANONICAL_SET.has(normalizeHeaderKey(k))
    );
    if (!hasSku) {
      throw new Error(`${MISSING_SKU_COLUMN_PREFIX}[${headerKeys || 'غير معروف'}]`);
    }
    throw new Error(`${UNRECOGNIZED_COLUMNS_PREFIX}[${headerKeys || 'غير معروف'}]`);
  }
  return result;
}

/**
 * Parses an Amazon TXT / TSV / CSV or Excel (.xlsx / .xls) buffer into normalized rows.
 */
export async function parseSellerCentralWorkbook(
  data: ArrayBuffer | Uint8Array | string,
  options?: { fileName?: string; traderId?: string; platform?: string }
): Promise<SellerCentralImportedRow[]> {
  const result = await parseSellerCentralWorkbookDetailed(data, options);
  return result.rows;
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('تعذر قراءة الملف المحدد'));
    reader.readAsArrayBuffer(file);
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value?: string | null): boolean {
  return Boolean(value && UUID_REGEX.test(String(value).trim()));
}

function sanitizeTraderCandidate(value?: string | null): string {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const lower = clean.toLowerCase();
  if (lower === 'all' || lower === 'null' || lower === 'undefined') return '';
  return clean;
}

function extractTraderIdFromCurrentUrl(): string {
  if (typeof window === 'undefined' || !window.location) return '';

  // 1. Check query string (?trader_id=...)
  if (window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryTraderId = sanitizeTraderCandidate(params.get('trader_id'));
      if (queryTraderId) {
        return queryTraderId;
      }
    } catch {
      // ignore malformed query string
    }
  }

  // 2. Check pathname (/traders/<id>)
  if (window.location.pathname) {
    const match = window.location.pathname.match(/\/traders\/([^/?#]+)/);
    if (match && match[1]) {
      try {
        const pathId = sanitizeTraderCandidate(decodeURIComponent(match[1]));
        if (pathId) {
          return pathId;
        }
      } catch {
        // ignore malformed URI component
      }
    }
  }

  return '';
}

export function formatSupabaseImportError(err: any): string {
  if (!err) return 'خطأ غير معروف في Supabase';
  if (typeof err === 'string') return err;
  const parts: string[] = [];
  if (err.code) parts.push(`[${err.code}]`);
  if (err.message) parts.push(String(err.message));
  if (err.details) parts.push(String(err.details));
  if (err.hint) parts.push(`(${err.hint})`);
  return parts.join(' — ') || 'خطأ في قاعدة البيانات (Supabase)';
}

/**
 * Resolves `trader_id` strictly from explicit selection / active page URL.
 * Never reads trader_id from the uploaded file, never passes null/empty,
 * and never falls back silently to the first trader in the table.
 */
export async function resolveValidTraderUuid(candidateId?: string): Promise<string> {
  const explicitCandidate = sanitizeTraderCandidate(candidateId);
  const urlCandidate = extractTraderIdFromCurrentUrl();
  const effectiveCandidate = explicitCandidate || urlCandidate;

  if (!effectiveCandidate) {
    throw new Error(NO_TRADER_SELECTED_ERROR);
  }

  if (isValidUuid(effectiveCandidate)) {
    return effectiveCandidate;
  }

  const lowerClean = effectiveCandidate.toLowerCase();
  try {
    const { data: tradersData } = await supabase
      .from('traders')
      .select('id, seller_id, seller_name, email, gmail');

    if (Array.isArray(tradersData) && tradersData.length > 0) {
      const uuidTraders = tradersData.filter((t: any) => isValidUuid(t?.id));
      if (uuidTraders.length > 0) {
        const matchedUuidTrader = uuidTraders.find(
          (t: any) =>
            String(t.id || '').trim() === effectiveCandidate ||
            String(t.seller_id || '').trim().toLowerCase() === lowerClean ||
            String(t.seller_name || '').trim().toLowerCase() === lowerClean ||
            String(t.email || '').trim().toLowerCase() === lowerClean ||
            String(t.gmail || '').trim().toLowerCase() === lowerClean
        );
        if (matchedUuidTrader?.id) {
          return String(matchedUuidTrader.id).trim();
        }
        throw new Error(NO_TRADER_SELECTED_ERROR);
      }

      // Allow unit-test mock fixtures whose mock trader id is non-UUID when no real Supabase client is active
      if (!supabaseClient || typeof (supabaseClient as any).from !== 'function') {
        const matchedMock = tradersData.find(
          (t: any) =>
            String(t.id || '').trim() === effectiveCandidate ||
            String(t.seller_id || '').trim().toLowerCase() === lowerClean ||
            String(t.seller_name || '').trim().toLowerCase() === lowerClean ||
            String(t.email || '').trim().toLowerCase() === lowerClean ||
            String(t.gmail || '').trim().toLowerCase() === lowerClean
        );
        if (matchedMock?.id) {
          return String(matchedMock.id).trim();
        }
        throw new Error(NO_TRADER_SELECTED_ERROR);
      }
    }
  } catch (err: any) {
    if (err instanceof Error && err.message === NO_TRADER_SELECTED_ERROR) {
      throw err;
    }
    // non-fatal lookup fallback handled below
  }

  if (supabaseClient && typeof (supabaseClient as any).from === 'function') {
    throw new Error(
      `${NO_TRADER_SELECTED_ERROR} — تعذر مطابقة التاجر مع سجل تاجر صالح (UUID)`
    );
  }

  return effectiveCandidate;
}

const PRODUCT_INSERT_ALLOWED_KEYS = [
  'title',
  'sku',
  'asin',
  'price',
  'stock',
  'image_url',
  'product_url',
  'trader_id',
  'status',
  'condition',
] as const;

/**
 * Builds a strictly sanitized product insert payload for Supabase `products`:
 * - Only allows: title, sku, asin, price, stock, image_url, product_url, trader_id, status, condition
 * - Never includes: id, created_at, updated_at, image, name, product_name, quantity, qty, description
 */
export function buildCleanProductInsertRecord(
  row: SellerCentralImportedRow,
  traderUuid: string
): Record<string, any> {
  const rawCandidate: Record<string, any> = {
    title: row.title,
    sku: row.sku,
    asin: row.asin || null,
    price: row.price,
    stock: row.stock,
    image_url: row.image_url ? row.image_url : null,
    product_url: row.product_url ? row.product_url : null,
    trader_id: traderUuid,
    status: 'active',
  };
  if (row.condition && String(row.condition).trim()) {
    rawCandidate.condition = String(row.condition).trim();
  }

  const clean: Record<string, any> = {};
  for (const key of PRODUCT_INSERT_ALLOWED_KEYS) {
    if (key in rawCandidate && rawCandidate[key] !== undefined) {
      clean[key] = rawCandidate[key];
    }
  }
  return clean;
}

function isMissingColumnSchemaError(err: any): boolean {
  const msg = String(err?.message || err?.details || err?.hint || '').toLowerCase();
  return (
    msg.includes('column') ||
    msg.includes('schema cache') ||
    msg.includes('asin') ||
    msg.includes('image_url') ||
    msg.includes('product_url') ||
    msg.includes('condition') ||
    msg.includes('status') ||
    msg.includes('updated_at')
  );
}

function omitColumnsFromChunk(
  chunk: Array<Record<string, any>>,
  colsToOmit: string[]
): Array<Record<string, any>> {
  const omitSet = new Set(colsToOmit);
  return chunk.map((row) => {
    const next: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      if (!omitSet.has(key)) {
        next[key] = row[key];
      }
    }
    return next;
  });
}

interface ExistingSkuSnapshot {
  id: string;
  title: string;
  price: number;
  stock: number;
  image_url?: string | null;
  hasImageUrlField?: boolean;
  updated_at?: string;
}

async function fetchExistingTraderSkuMap(
  targetTraderId: string
): Promise<Map<string, ExistingSkuSnapshot>> {
  const existingBySku = new Map<string, ExistingSkuSnapshot>();
  try {
    let { data: existingRows, error } = await supabase
      .from('products')
      .select('id, sku, title, price, stock, image_url, asin, updated_at')
      .eq('trader_id', targetTraderId);

    if (error && isMissingColumnSchemaError(error)) {
      const fallback = await supabase
        .from('products')
        .select('id, sku, price, stock')
        .eq('trader_id', targetTraderId);
      existingRows = fallback.data;
    }

    if (Array.isArray(existingRows)) {
      existingRows.forEach((r: any) => {
        if (r?.id && r?.sku) {
          existingBySku.set(String(r.sku).trim().toUpperCase(), {
            id: String(r.id),
            title: String(r.title || r.sku || ''),
            price: Number(r.price ?? 0) || 0,
            stock: Number(r.stock ?? 0) || 0,
            image_url: r.image_url,
            hasImageUrlField: 'image_url' in r,
            updated_at: r.updated_at ? String(r.updated_at) : undefined,
          });
        }
      });
    }
  } catch {
    // Non-blocking fallback
  }
  return existingBySku;
}

export function formatImportSummaryMessage(
  total: number,
  newCount: number,
  updatedCount: number,
  skippedCount: number
): string {
  return `تم قراءة ${total} منتج من الملف - جديد ${newCount} - محدّث ${updatedCount} - متخطى ${skippedCount}`;
}

/**
 * Reads and parses the uploaded file + inspects existing Supabase SKUs to produce a
 * 5-product preview & exact counts BEFORE committing to Supabase.
 */
export async function previewSellerCentralFile(
  file: File,
  traderId?: string,
  platform = 'amazon'
): Promise<SellerCentralImportPreview> {
  validateImportFileExtension(file.name);
  if (typeof file.size === 'number' && file.size === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  const targetTraderId = await resolveValidTraderUuid(traderId);

  const buffer = await readFileAsArrayBuffer(file);
  const parsed = await parseSellerCentralWorkbookDetailed(buffer, {
    fileName: file.name,
    traderId: targetTraderId,
    platform,
  });

  const existingBySku = await fetchExistingTraderSkuMap(targetTraderId);
  let newCount = 0;
  let updatedCount = 0;
  parsed.rows.forEach((row) => {
    const skuKey = row.sku.trim().toUpperCase();
    if (existingBySku.has(skuKey)) {
      updatedCount++;
    } else {
      newCount++;
    }
  });

  const firstRow = parsed.rows[0];
  const sampleSku = firstRow?.sku || '—';
  const sampleTitle = firstRow?.title || '—';
  const samplePrice = firstRow ? `${firstRow.price} ج.م` : '0 ج.م';

  return {
    fileName: file.name,
    ...(typeof file.size === 'number' ? { fileSizeBytes: file.size } : {}),
    traderId: targetTraderId,
    platform,
    rows: parsed.rows,
    previewRows: parsed.rows.slice(0, 5),
    totalRead: parsed.totalRead,
    newCount,
    updatedCount,
    skippedCount: parsed.skippedCount,
    ...(parsed.errorBreakdown ? { errorBreakdown: parsed.errorBreakdown } : {}),
    ...(parsed.rowErrors ? { rowErrors: parsed.rowErrors } : {}),
    summaryMessage: formatImportSummaryMessage(
      parsed.totalRead,
      newCount,
      updatedCount,
      parsed.skippedCount
    ),
    linePreviewMessage: firstRow
      ? `تم قراءة ${parsed.totalRead} منتج - مثال: أول منتج: [${sampleSku}] - [${sampleTitle}] - [${samplePrice}]`
      : 'تم قراءة 0 منتج',
  };
}

/**
 * Upserts parsed products into Supabase `products` table:
 * - Existing SKU for trader: updates price & stock ONLY (never duplicates!)
 * - New SKU: inserts without manual `id` so Supabase gen_random_uuid() generates UUIDs automatically
 * - Enforces valid trader UUID and strictly allowed column whitelist
 */
export async function upsertImportedProductsToSupabase(
  rows: SellerCentralImportedRow[],
  traderId?: string,
  skippedCount = 0,
  importMeta?: ImportCommitMetadata
): Promise<ExcelImportSummary> {
  const targetTraderId = await resolveValidTraderUuid(traderId);
  if (!targetTraderId) {
    throw new Error(NO_TRADER_SELECTED_ERROR);
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  const nowIso = new Date().toISOString();
  const existingBySku = await fetchExistingTraderSkuMap(targetTraderId);

  const toInsertFull: Array<Record<string, any>> = [];
  const toUpdatePairs: Array<{
    id: string;
    skuKey: string;
    payload: { price: number; stock: number; updated_at: string; image_url?: string };
  }> = [];
  const insertedProductIds: string[] = [];
  const productIdsBySku = new Map<string, string>();
  const updatedSnapshots: ImportUpdatedSnapshot[] = [];
  const itemsPreview: ImportHistoryItemDetail[] = [];

  rows.forEach((row) => {
    const skuKey = row.sku.trim().toUpperCase();
    const matched = existingBySku.get(skuKey);

    if (matched) {
      productIdsBySku.set(skuKey, matched.id);
      const updatePayload: { price: number; stock: number; updated_at: string; image_url?: string } = {
        price: row.price,
        stock: row.stock,
        updated_at: nowIso,
      };
      if (matched.hasImageUrlField && !matched.image_url && row.image_url) {
        updatePayload.image_url = row.image_url;
      }
      // Existing SKU: update price & stock (and backfill missing image_url if absent in DB) — do not duplicate!
      toUpdatePairs.push({
        id: matched.id,
        skuKey,
        payload: updatePayload,
      });
      updatedSnapshots.push({
        id: matched.id,
        sku: row.sku,
        title: row.title || matched.title,
        previousPrice: matched.price,
        previousStock: matched.stock,
        previousUpdatedAt: matched.updated_at,
      });
      if (itemsPreview.length < 200) {
        itemsPreview.push({
          sku: row.sku,
          title: row.title || matched.title,
          asin: row.asin,
          price: row.price,
          stock: row.stock,
          previousPrice: matched.price,
          previousStock: matched.stock,
          action: 'updated',
          product_url: row.product_url,
          condition: row.condition,
          image_url: row.image_url,
        });
      }
    } else {
      toInsertFull.push(buildCleanProductInsertRecord(row, targetTraderId));
      if (itemsPreview.length < 200) {
        itemsPreview.push({
          sku: row.sku,
          title: row.title,
          asin: row.asin,
          price: row.price,
          stock: row.stock,
          action: 'inserted',
          product_url: row.product_url,
          condition: row.condition,
          image_url: row.image_url,
        });
      }
    }
  });

  // Insert in chunks of 100 rows cleanly — never pass manual `id` so Supabase gen_random_uuid() generates UUID
  const INSERT_CHUNK_SIZE = 100;
  const OPTIONAL_PRODUCT_COLUMNS = ['condition', 'status', 'asin', 'image_url', 'product_url'];
  for (let i = 0; i < toInsertFull.length; i += INSERT_CHUNK_SIZE) {
    let chunk = toInsertFull.slice(i, i + INSERT_CHUNK_SIZE);
    let insertedChunkRows: any[] | null = null;
    const omittedCols = new Set<string>();

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: resData, error: insertErr } = await supabase.from('products').insert(chunk);
      if (!insertErr) {
        insertedChunkRows = Array.isArray(resData) ? resData : null;
        break;
      }

      if (!isMissingColumnSchemaError(insertErr)) {
        throw new Error(formatSupabaseImportError(insertErr));
      }

      const errMsg = String(insertErr?.message || insertErr?.details || insertErr?.hint || '').toLowerCase();
      const matchedCols = OPTIONAL_PRODUCT_COLUMNS.filter(
        (col) => !omittedCols.has(col) && errMsg.includes(col)
      );

      let colsToDrop: string[] = [];
      if (matchedCols.length > 0) {
        colsToDrop = matchedCols;
      } else if (!omittedCols.has('condition') || !omittedCols.has('status')) {
        colsToDrop = ['condition', 'status'].filter((col) => !omittedCols.has(col));
      } else {
        colsToDrop = OPTIONAL_PRODUCT_COLUMNS.filter((col) => !omittedCols.has(col));
      }

      if (colsToDrop.length === 0) {
        throw insertErr;
      }

      colsToDrop.forEach((col) => omittedCols.add(col));
      chunk = omitColumnsFromChunk(chunk, Array.from(omittedCols));
    }

    if (Array.isArray(insertedChunkRows)) {
      insertedChunkRows.forEach((insertedRow: any) => {
        if (insertedRow?.id) {
          const idStr = String(insertedRow.id);
          insertedProductIds.push(idStr);
          if (insertedRow?.sku) {
            productIdsBySku.set(String(insertedRow.sku).trim().toUpperCase(), idStr);
          }
        }
      });
    }
  }

  // Update existing products in concurrent batches of 15
  const UPDATE_BATCH_SIZE = 15;
  for (let i = 0; i < toUpdatePairs.length; i += UPDATE_BATCH_SIZE) {
    const batch = toUpdatePairs.slice(i, i + UPDATE_BATCH_SIZE);
    await Promise.all(
      batch.map(async (pair) => {
        const { error: updErr } = await supabase
          .from('products')
          .update(pair.payload)
          .eq('id', pair.id);
        if (updErr) {
          if (isMissingColumnSchemaError(updErr)) {
            const { updated_at: _u, image_url: _img, ...corePayload } = pair.payload;
            const { error: retryUpdErr } = await supabase
              .from('products')
              .update(corePayload)
              .eq('id', pair.id);
            if (retryUpdErr) throw retryUpdErr;
          } else {
            throw updErr;
          }
        }
      })
    );
  }

  const normalizedRows = rows.map((r) => ({ ...r, trader_id: targetTraderId }));

  // Trigger automatic competitor price analysis & catalog image enrichment after saving products
  let competitorSync: CompetitorSyncStatus | undefined;
  try {
    const syncCandidates = normalizedRows
      .filter((r) => Boolean(r.asin && r.asin.trim()))
      .map((r) => ({
        productId: productIdsBySku.get(r.sku.trim().toUpperCase()),
        sku: r.sku,
        asin: r.asin.trim().toUpperCase(),
        price: r.price,
        image_url: r.image_url,
      }));
    competitorSync = await syncCompetitorPricesAfterImport(syncCandidates, targetTraderId);
  } catch {
    competitorSync = {
      triggered: false,
      spApiConfigured: isAmazonSpApiConfigured(),
      analyzedCount: 0,
      pricedCount: 0,
      updatedImagesCount: 0,
      message: isAmazonSpApiConfigured()
        ? 'تم حفظ المنتجات — تعذر إكمال تحليل أسعار المنافسين حالياً'
        : 'اربط SP-API لجلب أسعار المنافسين تلقائياً',
    };
  }

  // Evaluate price alerts cleanly
  try {
    evaluatePulledProductsForPriceAlerts(
      targetTraderId,
      normalizedRows.map((r) => ({
        title: r.title,
        sku: r.sku,
        price: r.price,
        stock: r.stock,
        platform: r.platform,
        image: r.image_url,
      }))
    );
  } catch {
    // Non-blocking alert evaluation
  }

  // Mandatory Post-Import Re-Fetch from Supabase to verify actual persisted product count
  const {
    data: verifiedRows,
    error: verifyErr,
    count: verifyCount,
  } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('trader_id', targetTraderId);

  if (verifyErr) {
    try {
      localStorage.removeItem('radar_last_sync_stats');
    } catch {}
    throw new Error(formatSupabaseImportError(verifyErr));
  }

  const verifiedDbCount =
    typeof verifyCount === 'number'
      ? verifyCount
      : Array.isArray(verifiedRows)
      ? verifiedRows.length
      : 0;

  if (verifiedDbCount === 0) {
    try {
      localStorage.removeItem('radar_last_sync_stats');
    } catch {}
    throw new Error(
      'فشل التحقق بعد الاستيراد: عدد المنتجات الفعلية في قاعدة البيانات لهذا التاجر = 0. تحقق من سياسات RLS أو معرّف التاجر (trader_id).'
    );
  }

  try {
    const stats = {
      total: verifiedDbCount,
      dbTotal: verifiedDbCount,
      traderId: targetTraderId,
      new: toInsertFull.length,
      updated: toUpdatePairs.length,
      skipped: skippedCount,
    };
    localStorage.setItem('radar_last_sync_stats', JSON.stringify(stats));
  } catch {
    // ignore
  }

  await recordTraderLastSyncAt(targetTraderId, nowIso);
  dataCache.invalidate('products_');

  const newCount = toInsertFull.length;
  const updatedCount = toUpdatePairs.length;
  const total = normalizedRows.length;
  const message = formatImportSummaryMessage(total, newCount, updatedCount, skippedCount);

  let recordedImportId: string | undefined;
  try {
    const resolvedFileName =
      importMeta?.fileName || `amazon-listings-${nowIso.slice(0, 10)}.txt`;
    const historyEntry = recordImportHistoryEntry({
      fileName: resolvedFileName,
      fileType: importMeta?.fileType || detectImportSourceType(resolvedFileName),
      fileSizeBytes: importMeta?.fileSizeBytes,
      traderId: targetTraderId,
      traderName: importMeta?.traderName,
      platform: normalizedRows[0]?.platform || 'amazon',
      totalRead: total,
      newCount,
      updatedCount,
      skippedCount,
      failedCount: skippedCount,
      errorBreakdown: importMeta?.errorBreakdown,
      rowErrors: importMeta?.rowErrors,
      summaryMessage: message,
      insertedProductIds,
      updatedSnapshots,
      itemsPreview,
      createdAt: nowIso,
    });
    recordedImportId = historyEntry.id;
  } catch {
    // Non-blocking history recording
  }

  return {
    total,
    newCount,
    updatedCount,
    skippedCount,
    verifiedDbCount,
    message,
    traderId: targetTraderId,
    rows: normalizedRows,
    importId: recordedImportId,
    ...(importMeta?.errorBreakdown ? { errorBreakdown: importMeta.errorBreakdown } : {}),
    ...(importMeta?.rowErrors ? { rowErrors: importMeta.rowErrors } : {}),
    ...(competitorSync ? { competitorSync } : {}),
  };
}

/**
 * Commits a previously previewed Seller Central file import to Supabase.
 */
export async function confirmSellerCentralImport(
  preview: SellerCentralImportPreview
): Promise<ExcelImportSummary> {
  const effectiveTraderId = preview.traderId || extractTraderIdFromCurrentUrl();
  if (!effectiveTraderId) {
    throw new Error(NO_TRADER_SELECTED_ERROR);
  }
  return upsertImportedProductsToSupabase(
    preview.rows,
    effectiveTraderId,
    preview.skippedCount,
    {
      fileName: preview.fileName,
      fileType: detectImportSourceType(preview.fileName),
      fileSizeBytes: preview.fileSizeBytes,
      traderName: preview.traderName,
      errorBreakdown: preview.errorBreakdown,
      rowErrors: preview.rowErrors,
    }
  );
}

/**
 * Direct high-level handler for Amazon .txt / .csv / .tsv / .xlsx file imports.
 */
export async function importSellerCentralFile(
  file: File,
  traderId?: string,
  platform = 'amazon'
): Promise<ExcelImportSummary> {
  validateImportFileExtension(file.name);
  if (typeof file.size === 'number' && file.size === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  const targetTraderId = await resolveValidTraderUuid(traderId);

  const buffer = await readFileAsArrayBuffer(file);
  const parsed = await parseSellerCentralWorkbookDetailed(buffer, {
    fileName: file.name,
    traderId: targetTraderId,
    platform,
  });

  if (parsed.rows.length === 0) {
    throw new Error(EMPTY_FILE_ERROR_MESSAGE);
  }

  return upsertImportedProductsToSupabase(
    parsed.rows,
    targetTraderId,
    parsed.skippedCount,
    {
      fileName: file.name,
      fileType: detectImportSourceType(file.name),
      fileSizeBytes: typeof file.size === 'number' ? file.size : undefined,
      errorBreakdown: parsed.errorBreakdown,
      rowErrors: parsed.rowErrors,
    }
  );
}

/**
 * Triggers SP-API product pull strictly via Supabase Edge Function (`amazon-sp-api-sync`).
 * Never issues browser fetch() to Amazon Seller Central, destination_url, or store_url.
 */
export async function invokeAmazonSpApiSyncEdgeFunction(
  traderId?: string
): Promise<SpApiSyncOutcome> {
  const settings = getAmazonSpApiSettings();
  if (!isAmazonSpApiConfigured(settings)) {
    return {
      success: false,
      blocked: true,
      message: DIRECT_FETCH_BLOCKED_MESSAGE,
    };
  }

  if (!supabaseClient || !supabaseClient.functions) {
    return {
      success: false,
      message: FRIENDLY_PULL_FAILURE_MESSAGE,
    };
  }

  const targetTraderId = await resolveValidTraderUuid(
    traderId && traderId !== 'all' ? traderId : undefined
  );

  try {
    const { data, error } = await supabaseClient.functions.invoke('amazon-sp-api-sync', {
      body: {
        refreshToken: settings.refreshToken,
        clientId: settings.clientId,
        clientSecret: settings.clientSecret,
        sellerId: settings.sellerId || DEFAULT_TRADER_ID,
        marketplaceId: settings.marketplaceId || 'ARBP9OOSHTCHU',
        region: settings.region || 'eu-west-1',
        traderId: targetTraderId,
      },
    });

    if (error) {
      return {
        success: false,
        message: sanitizeProductPullError(error),
      };
    }

    if (data && typeof data === 'object' && data.success === false) {
      return {
        success: false,
        message: sanitizeProductPullError(data.error || data.message),
      };
    }

    const edgeProducts = Array.isArray(data?.products) ? data.products : [];
    if (edgeProducts.length > 0) {
      const normalized = mapRawSheetRowsToProducts(edgeProducts, {
        traderId: targetTraderId,
        platform: 'amazon',
      });
      if (normalized.length > 0) {
        const summary = await upsertImportedProductsToSupabase(normalized, targetTraderId, 0, {
          fileName: 'amazon-sp-api-sync',
          fileType: 'sp_api',
        });
        return {
          success: true,
          message: summary.message,
          total: summary.total,
          newCount: summary.newCount,
          updatedCount: summary.updatedCount,
        };
      }
    }

    return {
      success: true,
      message: data?.message || 'تم الاتصال بـ SP-API عبر Supabase Edge Function بنجاح',
      total: Number(data?.total || 0),
      newCount: Number(data?.newCount || 0),
      updatedCount: Number(data?.updatedCount || 0),
    };
  } catch (err) {
    return {
      success: false,
      message: sanitizeProductPullError(err),
    };
  }
}

export interface CompetitorSyncCandidate {
  productId?: string;
  sku: string;
  asin: string;
  price?: number;
  image_url?: string;
}

export function getLocalCompetitorPricesMap(): Record<string, CompetitorPriceRecord> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(COMPETITOR_PRICES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCompetitorPricesLocally(records: CompetitorPriceRecord[]): void {
  if (typeof localStorage === 'undefined' || !Array.isArray(records) || records.length === 0) return;
  try {
    const map = getLocalCompetitorPricesMap();
    for (const rec of records) {
      if (!rec) continue;
      const cleanAsin = String(rec.asin || '').trim().toUpperCase();
      const pid = rec.product_id ? String(rec.product_id).trim() : '';
      const normalized: CompetitorPriceRecord = {
        product_id: pid || null,
        asin: cleanAsin,
        competitor_price:
          typeof rec.competitor_price === 'number' && rec.competitor_price > 0
            ? Math.round(rec.competitor_price * 100) / 100
            : null,
        buy_box_price:
          typeof rec.buy_box_price === 'number' && rec.buy_box_price > 0
            ? Math.round(rec.buy_box_price * 100) / 100
            : null,
        competitors_count: Math.max(0, Math.round(Number(rec.competitors_count || 0))),
        ...(rec.image_url ? { image_url: rec.image_url } : {}),
        updated_at: rec.updated_at || new Date().toISOString(),
      };
      if (pid) map[pid] = normalized;
      if (cleanAsin) map[cleanAsin] = normalized;
    }
    localStorage.setItem(COMPETITOR_PRICES_STORAGE_KEY, JSON.stringify(map));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RADAR_COMPETITOR_PRICES_UPDATED_EVENT));
    }
  } catch {
    // non-fatal local cache failure
  }
}

async function saveCompetitorPricesToSupabase(records: CompetitorPriceRecord[]): Promise<void> {
  if (!records.length) return;
  saveCompetitorPricesLocally(records);

  // Build strict Supabase `competitor_prices` rows:
  // product_id - asin - competitor_price - buy_box_price - competitors_count - updated_at
  const dbRows = records
    .filter((r) => Boolean(r.asin))
    .map((r) => ({
      product_id: r.product_id || null,
      asin: String(r.asin).trim().toUpperCase(),
      competitor_price:
        typeof r.competitor_price === 'number' && r.competitor_price > 0
          ? r.competitor_price
          : null,
      buy_box_price:
        typeof r.buy_box_price === 'number' && r.buy_box_price > 0
          ? r.buy_box_price
          : null,
      competitors_count: Math.max(0, Math.round(Number(r.competitors_count || 0))),
      updated_at: r.updated_at || new Date().toISOString(),
    }));

  if (dbRows.length === 0) return;

  try {
    // Fetch existing competitor_prices rows for trader ASINs so we update instead of duplicating
    const existingByAsin = new Map<string, string>();
    try {
      const { data: existingData } = await supabase
        .from('competitor_prices')
        .select('id, product_id, asin');
      if (Array.isArray(existingData)) {
        existingData.forEach((row: any) => {
          const k = row?.product_id
            ? String(row.product_id)
            : row?.asin
            ? String(row.asin).trim().toUpperCase()
            : '';
          if (row?.id && k) existingByAsin.set(k, String(row.id));
          if (row?.id && row?.asin) existingByAsin.set(String(row.asin).trim().toUpperCase(), String(row.id));
        });
      }
    } catch {
      // ignore if table/columns not yet queried cleanly
    }

    const toInsert: any[] = [];
    const toUpdate: Array<{ id: string; payload: any }> = [];

    for (const row of dbRows) {
      const existingId =
        (row.product_id && existingByAsin.get(String(row.product_id))) ||
        existingByAsin.get(row.asin);
      if (existingId) {
        toUpdate.push({ id: existingId, payload: row });
      } else {
        toInsert.push(row);
      }
    }

    if (toInsert.length > 0) {
      await supabase.from('competitor_prices').insert(toInsert);
    }

    if (toUpdate.length > 0) {
      const BATCH = 15;
      for (let i = 0; i < toUpdate.length; i += BATCH) {
        await Promise.all(
          toUpdate.slice(i, i + BATCH).map(async (u) => {
            await supabase.from('competitor_prices').update(u.payload).eq('id', u.id);
          })
        );
      }
    }
  } catch {
    // Graceful fallback: local competitor cache already saved
  }
}

/**
 * Automatically fetches competitor prices (lowest competitor price, Buy Box, competitors count)
 * and SP-API catalog item images (/catalog/2022-04-01/items/{asin}) via Supabase Edge Function
 * immediately after import confirmation. Never throws or blocks import completion.
 */
export async function syncCompetitorPricesAfterImport(
  candidates: CompetitorSyncCandidate[],
  traderId?: string
): Promise<CompetitorSyncStatus> {
  const uniqueByAsin = new Map<string, CompetitorSyncCandidate>();
  for (const c of candidates || []) {
    const cleanAsin = String(c?.asin || '').trim().toUpperCase();
    if (cleanAsin && !uniqueByAsin.has(cleanAsin)) {
      uniqueByAsin.set(cleanAsin, { ...c, asin: cleanAsin });
    }
  }
  const uniqueItems = Array.from(uniqueByAsin.values());
  const settings = getAmazonSpApiSettings();
  const spApiConfigured = isAmazonSpApiConfigured(settings);

  if (uniqueItems.length === 0) {
    return {
      triggered: false,
      spApiConfigured,
      analyzedCount: 0,
      pricedCount: 0,
      updatedImagesCount: 0,
      message: spApiConfigured
        ? 'لا توجد أكواد ASIN لتحليل أسعار المنافسين'
        : 'اربط SP-API لجلب أسعار المنافسين تلقائياً',
    };
  }

  if (!spApiConfigured) {
    return {
      triggered: false,
      spApiConfigured: false,
      analyzedCount: uniqueItems.length,
      pricedCount: 0,
      updatedImagesCount: 0,
      message: 'اربط SP-API لجلب أسعار المنافسين تلقائياً',
    };
  }

  if (!supabaseClient || !supabaseClient.functions) {
    return {
      triggered: false,
      spApiConfigured: true,
      analyzedCount: uniqueItems.length,
      pricedCount: 0,
      updatedImagesCount: 0,
      message: 'تعذر الاتصال بخدمة SP-API Edge Function حالياً',
    };
  }

  const nowIso = new Date().toISOString();
  const collectedRecords: CompetitorPriceRecord[] = [];
  const catalogImageUpdates: Array<{ productId?: string; asin: string; imageUrl: string }> = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < uniqueItems.length; i += BATCH_SIZE) {
    const batch = uniqueItems.slice(i, i + BATCH_SIZE);
    try {
      const { data, error } = await supabaseClient.functions.invoke('amazon-competitor-prices', {
        body: {
          action: 'analyze_competitor_prices_and_catalog',
          refreshToken: settings.refreshToken,
          clientId: settings.clientId,
          clientSecret: settings.clientSecret,
          sellerId: settings.sellerId || DEFAULT_TRADER_ID,
          marketplaceId: settings.marketplaceId || 'ARBP9OOSHTCHU',
          region: settings.region || 'eu-west-1',
          traderId,
          includeCatalogImages: true,
          catalogEndpointTemplate: '/catalog/2022-04-01/items/{asin}',
          asins: batch.map((b) => b.asin),
          items: batch.map((b) => ({
            product_id: b.productId || null,
            asin: b.asin,
            sku: b.sku,
            current_price: b.price || 0,
          })),
        },
      });

      if (error || !data || data.success === false) {
        continue;
      }

      const rawResults: any[] =
        (Array.isArray(data.results) && data.results) ||
        (Array.isArray(data.competitorPrices) && data.competitorPrices) ||
        (Array.isArray(data.prices) && data.prices) ||
        (Array.isArray(data.items) && data.items) ||
        (Array.isArray(data.data) && data.data) ||
        [];

      for (const item of rawResults) {
        if (!item || typeof item !== 'object') continue;
        const asin = String(item.asin || '').trim().toUpperCase();
        if (!asin) continue;

        const candidate = uniqueByAsin.get(asin);
        const rawCompetitorPrice = Number(
          item.competitor_price ??
            item.lowest_competitor_price ??
            item.lowestCompetitorPrice ??
            item.lowest_price ??
            item.competitorPrice ??
            0
        );
        const rawBuyBox = Number(
          item.buy_box_price ?? item.buybox_price ?? item.buyBoxPrice ?? 0
        );
        const competitorsCount = Math.max(
          0,
          Math.round(
            Number(
              item.competitors_count ??
                item.competitorsCount ??
                item.offer_count ??
                item.offersCount ??
                0
            )
          )
        );
        const catalogImg = String(
          item.image_url ?? item.catalog_image_url ?? item.mainImageUrl ?? ''
        ).trim();

        const validCompetitorPrice =
          Number.isFinite(rawCompetitorPrice) && rawCompetitorPrice > 0
            ? Math.round(rawCompetitorPrice * 100) / 100
            : null;
        const validBuyBoxPrice =
          Number.isFinite(rawBuyBox) && rawBuyBox > 0
            ? Math.round(rawBuyBox * 100) / 100
            : null;

        if (validCompetitorPrice !== null || validBuyBoxPrice !== null || competitorsCount > 0) {
          collectedRecords.push({
            product_id: item.product_id || candidate?.productId || null,
            asin,
            competitor_price: validCompetitorPrice,
            buy_box_price: validBuyBoxPrice,
            competitors_count: competitorsCount,
            ...(catalogImg ? { image_url: catalogImg } : {}),
            updated_at: item.updated_at || nowIso,
          });
        }

        if (catalogImg && /^https?:\/\//i.test(catalogImg)) {
          catalogImageUpdates.push({
            productId: item.product_id || candidate?.productId,
            asin,
            imageUrl: catalogImg,
          });
        }
      }
    } catch {
      // Non-blocking: keep product import intact even if Edge Function fails
    }
  }

  if (collectedRecords.length > 0) {
    await saveCompetitorPricesToSupabase(collectedRecords);
  }

  let updatedImagesCount = 0;
  for (const imgUpd of catalogImageUpdates) {
    try {
      if (imgUpd.productId) {
        const { error: imgErr } = await supabase
          .from('products')
          .update({ image_url: imgUpd.imageUrl, updated_at: nowIso })
          .eq('id', imgUpd.productId);
        if (!imgErr) updatedImagesCount++;
      }
    } catch {
      // ignore non-fatal image update failure
    }
  }

  const pricedCount = collectedRecords.filter(
    (r) => (r.competitor_price && r.competitor_price > 0) || (r.buy_box_price && r.buy_box_price > 0)
  ).length;

  return {
    triggered: true,
    spApiConfigured: true,
    analyzedCount: uniqueItems.length,
    pricedCount,
    updatedImagesCount,
    message:
      pricedCount > 0
        ? `تم تحليل أسعار المنافسين لـ ${pricedCount} منتج تلقائياً`
        : 'تم تشغيل تحليل أسعار المنافسين عبر SP-API',
  };
}

/**
 * Fetches competitor_prices from Supabase + local cache and merges competitor_price,
 * buybox_price, competitors_count, and ASIN image fallbacks cleanly onto products.
 */
export async function mergeCompetitorPricesOntoProducts<T extends Record<string, any>>(
  products: T[]
): Promise<T[]> {
  if (!Array.isArray(products) || products.length === 0) return products;

  const byProductId = new Map<string, CompetitorPriceRecord>();
  const byAsin = new Map<string, CompetitorPriceRecord>();

  const localMap = getLocalCompetitorPricesMap();
  Object.values(localMap).forEach((rec) => {
    if (!rec || typeof rec !== 'object') return;
    if (rec.product_id) byProductId.set(String(rec.product_id), rec);
    if (rec.asin) byAsin.set(String(rec.asin).trim().toUpperCase(), rec);
  });

  try {
    const { data: remoteRows, error } = await supabase
      .from('competitor_prices')
      .select('product_id, asin, competitor_price, buy_box_price, competitors_count, updated_at');

    if (!error && Array.isArray(remoteRows)) {
      remoteRows.forEach((row: any) => {
        if (!row) return;
        const cleanAsin = row.asin ? String(row.asin).trim().toUpperCase() : '';
        const rec: CompetitorPriceRecord = {
          product_id: row.product_id ? String(row.product_id) : null,
          asin: cleanAsin,
          competitor_price:
            Number(row.competitor_price) > 0 ? Number(row.competitor_price) : null,
          buy_box_price:
            Number(row.buy_box_price ?? row.buybox_price) > 0
              ? Number(row.buy_box_price ?? row.buybox_price)
              : null,
          competitors_count: Math.max(0, Number(row.competitors_count || 0)),
          updated_at: row.updated_at || new Date().toISOString(),
        };
        if (rec.product_id) byProductId.set(rec.product_id, rec);
        if (cleanAsin) byAsin.set(cleanAsin, rec);
      });
    }
  } catch {
    // Graceful fallback if competitor_prices table isn't created yet
  }

  return products.map((p) => {
    const pid = p?.id ? String(p.id) : '';
    const asinKey = p?.asin ? String(p.asin).trim().toUpperCase() : '';
    const match = (pid && byProductId.get(pid)) || (asinKey && byAsin.get(asinKey));

    const existingComp = Number(p?.competitor_price || 0);
    const existingBuyBox = Number(p?.buybox_price || p?.buy_box_price || 0);

    const competitorPrice =
      match?.competitor_price && match.competitor_price > 0
        ? match.competitor_price
        : existingComp > 0
        ? existingComp
        : undefined;

    const buyBoxPrice =
      match?.buy_box_price && match.buy_box_price > 0
        ? match.buy_box_price
        : existingBuyBox > 0
        ? existingBuyBox
        : undefined;

    const competitorsCount =
      match && typeof match.competitors_count === 'number'
        ? match.competitors_count
        : typeof p?.competitors_count === 'number'
        ? p.competitors_count
        : undefined;

    const fallbackImageUrl = p?.image_url || p?.image || buildAmazonAsinImageUrl(asinKey);

    return {
      ...p,
      ...(fallbackImageUrl && !p?.image_url ? { image_url: fallbackImageUrl } : {}),
      ...(competitorPrice !== undefined ? { competitor_price: competitorPrice } : {}),
      ...(buyBoxPrice !== undefined ? { buybox_price: buyBoxPrice, buy_box_price: buyBoxPrice } : {}),
      ...(competitorsCount !== undefined ? { competitors_count: competitorsCount } : {}),
    };
  });
}

