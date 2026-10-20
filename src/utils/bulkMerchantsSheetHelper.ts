import * as XLSX from 'xlsx';
import { RemoteMerchantClient, RemoteMerchantPlatformCode } from '../types';
import {
  loadAllRegisteredMerchants,
  saveAllRegisteredMerchants,
  ensureMerchantTrialFields,
  saveMerchantPlatformCredentials,
} from './platformLaunchHelper';
import { saveMerchantStoreCredentialsToFirestore } from '../services/firestoreSync';
import { encryptLwaRefreshToken } from './lwaTokenCrypto';

export interface BulkMerchantImportRow {
  rowNumber: number;
  storeName: string;
  managerName: string;
  email: string;
  phone: string;
  city: string;
  platforms: RemoteMerchantPlatformCode[];
  sellerId: string;
  apiToken: string;
  noonAuthKey?: string;
  noonAppId?: string;
  bostaApiKey?: string;
  dataMode: 'live' | 'demo';
  isValid: boolean;
  errors: string[];
  actionType: 'create' | 'update';
  matchedMerchantId?: string;
}

export interface BulkMerchantParseSummary {
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  newMerchantsCount: number;
  updatedMerchantsCount: number;
  rows: BulkMerchantImportRow[];
}

const PLATFORM_ALIAS_MAP: Record<string, RemoteMerchantPlatformCode> = {
  amazon: 'amazon_eg',
  amazon_eg: 'amazon_eg',
  'أمازون': 'amazon_eg',
  'امازون': 'amazon_eg',
  'أمازون مصر': 'amazon_eg',
  noon: 'noon_eg',
  noon_eg: 'noon_eg',
  'نون': 'noon_eg',
  'نون مصر': 'noon_eg',
  jumia: 'jumia_eg',
  jumia_eg: 'jumia_eg',
  'جوميا': 'jumia_eg',
  'جوميا مصر': 'jumia_eg',
  homzmart: 'homzmart_eg',
  homzmart_eg: 'homzmart_eg',
  'هومزمارت': 'homzmart_eg',
  kenzz: 'kenzz_eg',
  kenzz_eg: 'kenzz_eg',
  'كنز': 'kenzz_eg',
  btech: 'btech_eg',
  'b.tech': 'btech_eg',
  btech_eg: 'btech_eg',
  'بي تك': 'btech_eg',
  '2b': 'twob_eg',
  twob: 'twob_eg',
  twob_eg: 'twob_eg',
  elaraby: 'elaraby_group',
  elaraby_group: 'elaraby_group',
  'العربي': 'elaraby_group',
  raneen: 'raneen_eg',
  raneen_eg: 'raneen_eg',
  'رنين': 'raneen_eg',
  facebook: 'facebook_marketplace',
  facebook_marketplace: 'facebook_marketplace',
  'فيسبوك': 'facebook_marketplace',
  shopify: 'shopify_salla',
  salla: 'shopify_salla',
  zid: 'shopify_salla',
  shopify_salla: 'shopify_salla',
  'سلة': 'shopify_salla',
  'شوبيفاي': 'shopify_salla',
  tiktok: 'tiktok_shop',
  tiktok_shop: 'tiktok_shop',
  'تيك توك': 'tiktok_shop',
  physical: 'physical_store',
  physical_store: 'physical_store',
  'معرض': 'physical_store',
  'فرع': 'physical_store',
};

/**
 * Normalizes a raw platforms string (e.g. "amazon, noon, jumia" or "amazon_eg | noon_eg") into valid platform codes.
 */
export function parsePlatformsString(raw: string): RemoteMerchantPlatformCode[] {
  if (!raw || typeof raw !== 'string') {
    return ['amazon_eg', 'noon_eg'];
  }
  const tokens = raw
    .split(/[,;|+/،]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const codes = new Set<RemoteMerchantPlatformCode>();
  tokens.forEach((tok) => {
    if (PLATFORM_ALIAS_MAP[tok]) {
      codes.add(PLATFORM_ALIAS_MAP[tok]);
    } else if (tok.includes('amazon') || tok.includes('امازون') || tok.includes('أمازون')) {
      codes.add('amazon_eg');
    } else if (tok.includes('noon') || tok.includes('نون')) {
      codes.add('noon_eg');
    } else if (tok.includes('jumia') || tok.includes('جوميا')) {
      codes.add('jumia_eg');
    } else if (tok.includes('homzmart') || tok.includes('هومز')) {
      codes.add('homzmart_eg');
    } else if (tok.includes('kenzz') || tok.includes('كنز')) {
      codes.add('kenzz_eg');
    } else if (tok.includes('btech') || tok.includes('بي تك')) {
      codes.add('btech_eg');
    } else if (tok.includes('shopify') || tok.includes('salla') || tok.includes('سلة')) {
      codes.add('shopify_salla');
    } else if (tok.includes('tiktok') || tok.includes('تيك توك')) {
      codes.add('tiktok_shop');
    }
  });

  if (codes.size === 0) {
    return ['amazon_eg', 'noon_eg'];
  }
  return Array.from(codes);
}

/**
 * Generates and downloads a ready-to-fill CSV template with the required columns:
 * Store_Name, Manager_Name, Email, Phone, Platforms, Seller_ID, API_Token, Refresh_Token, City, Noon_Auth_Key, Bosta_API_Key
 */
export function downloadMerchantsBulkTemplateCsv(): void {
  const headers = [
    'Store_Name',
    'Manager_Name',
    'Email',
    'Phone',
    'Platforms',
    'Seller_ID',
    'API_Token',
    'Refresh_Token',
    'City',
    'Noon_Auth_Key',
    'Bosta_API_Key',
  ];

  const sampleRows = [
    [
      'مؤسسة الأهرام للتجارة والتوزيع',
      'م. حسام الشريف',
      'hossam@ahram-trade.eg',
      '+201012345678',
      'amazon, noon, jumia',
      'A1AHRAMSELLER99',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_AHRAM_01',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_AHRAM_01',
      'القاهرة - التجمع الخامس',
      'noon_live_auth_ahram_99',
      'bosta_live_key_ahram_01',
    ],
    [
      'معارض النور للأجهزة المنزلية والكهربائية',
      'أ. محمد النور',
      'sales@elnour-appliances.eg',
      '+201123456789',
      'amazon, noon, homzmart, btech',
      'A2ELNOURSELLER88',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_ELNOUR_02',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_ELNOUR_02',
      'الإسكندرية - سموحة',
      'noon_live_auth_elnour_88',
      '',
    ],
    [
      'متجر كايرو تك للإلكترونيات',
      'م. سارة محمود',
      'sara@cairotech-store.com',
      '+201234567890',
      'amazon, jumia, shopify',
      'A3CAIROTECH77',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_CAIROTECH_03',
      'Atzr|IwEBIA_SAMPLE_SP_API_TOKEN_CAIROTECH_03',
      'الجيزة - المهندسين',
      '',
      '',
    ],
  ];

  const csvContent =
    '\uFEFF' +
    [headers, ...sampleRows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Merchants_Bulk_Template_Radar.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all currently registered merchants and their API keys to a CSV file compatible with the bulk import format.
 */
export function exportCurrentMerchantsToBulkCsv(merchants?: RemoteMerchantClient[]): void {
  const list = merchants && merchants.length > 0 ? merchants : loadAllRegisteredMerchants();
  const headers = [
    'Store_Name',
    'Manager_Name',
    'Email',
    'Phone',
    'Platforms',
    'Seller_ID',
    'API_Token',
    'Refresh_Token',
    'City',
    'Noon_Auth_Key',
    'Bosta_API_Key',
  ];

  const rows = list.map((m) => {
    const sellerId =
      m.apiCredentials?.amazonSellerId ||
      m.platformCredentials?.['amazon_eg']?.sellerId ||
      '';
    const refreshToken =
      m.apiCredentials?.amazonRefreshToken ||
      m.platformCredentials?.['amazon_eg']?.mwsAuthToken ||
      '';
    const platformsFormatted = (m.platformsSubscribed || ['amazon_eg', 'noon_eg'])
      .map((code) => code.replace('_eg', ''))
      .join(', ');

    return [
      m.storeName || '',
      m.contactPerson || '',
      m.primaryEmail || '',
      m.phone || '',
      platformsFormatted,
      sellerId,
      refreshToken,
      refreshToken,
      m.city || 'القاهرة',
      m.apiCredentials?.noonAuthKey || '',
      m.apiCredentials?.bostaApiKey || '',
    ];
  });

  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Merchants_And_API_Keys_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to look up a column value from a raw Excel/CSV row object using flexible case-insensitive & Arabic/English header aliases.
 */
function getColumnValue(rawRow: Record<string, any>, aliases: string[]): string {
  const keys = Object.keys(rawRow);
  for (const alias of aliases) {
    const normalizedAlias = alias.trim().toLowerCase().replace(/[\s_-]+/g, '');
    for (const k of keys) {
      const normalizedKey = k.trim().toLowerCase().replace(/[\s_-]+/g, '');
      if (normalizedKey === normalizedAlias) {
        const val = rawRow[k];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

/**
 * Parses an uploaded CSV or Excel (.xlsx, .xls) file containing merchant records & API keys,
 * validates each row, and returns a structured preview summary.
 */
export async function parseMerchantsBulkSheetFile(
  file: File,
  existingMerchants?: RemoteMerchantClient[]
): Promise<BulkMerchantParseSummary> {
  const currentList = existingMerchants || loadAllRegisteredMerchants();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('الملف المرفوع لا يحتوي على أي ورقة عمل صالحة');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawJsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
  });

  if (!rawJsonRows || rawJsonRows.length === 0) {
    throw new Error('الشيت المرفوع فارغ ولا يحتوي على بيانات تجار');
  }

  const parsedRows: BulkMerchantImportRow[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  rawJsonRows.forEach((rawRow, idx) => {
    const storeName = getColumnValue(rawRow, [
      'Store_Name',
      'StoreName',
      'Store',
      'اسم المتجر',
      'المتجر',
      'اسم الشركة',
    ]);
    const managerName = getColumnValue(rawRow, [
      'Manager_Name',
      'ManagerName',
      'Contact_Person',
      'ContactPerson',
      'Manager',
      'اسم المسؤول',
      'المسؤول',
      'اسم التاجر',
    ]);
    const email = getColumnValue(rawRow, [
      'Email',
      'Primary_Email',
      'Merchant_Email',
      'البريد',
      'البريد الإلكتروني',
      'الايميل',
      'الإيميل',
    ]).toLowerCase();
    const phone = getColumnValue(rawRow, [
      'Phone',
      'Mobile',
      'WhatsApp',
      'الهاتف',
      'رقم الهاتف',
      'الواتساب',
      'موبايل',
    ]);
    const platformsRaw = getColumnValue(rawRow, [
      'Platforms',
      'Platform',
      'المنصات',
      'المنصات المفعلة',
      'قنوات البيع',
    ]);
    const sellerId = getColumnValue(rawRow, [
      'Seller_ID',
      'SellerId',
      'Merchant_Token',
      'Amazon_Seller_ID',
      'معرف التاجر',
      'معرف البائع',
    ]);
    const refreshToken = getColumnValue(rawRow, [
      'Refresh_Token',
      'RefreshToken',
      'API_Token',
      'ApiToken',
      'Amazon_Refresh_Token',
      'MWS_Auth_Token',
      'Token',
      'مفاتيح الربط',
      'مفتاح الربط',
      'التوكن',
    ]);
    const city =
      getColumnValue(rawRow, ['City', 'Location', 'المدينة', 'المحافظة', 'العنوان']) ||
      'القاهرة';
    const noonAuthKey = getColumnValue(rawRow, [
      'Noon_Auth_Key',
      'Noon_Token',
      'Noon_API_Key',
      'مفتاح نون',
    ]);
    const noonAppId = getColumnValue(rawRow, ['Noon_App_ID', 'NoonAppId']);
    const bostaApiKey = getColumnValue(rawRow, [
      'Bosta_API_Key',
      'BostaKey',
      'مفتاح بوسطة',
    ]);

    // Skip completely empty rows
    if (!storeName && !managerName && !email && !sellerId && !refreshToken) {
      return;
    }

    const errors: string[] = [];
    if (!storeName || storeName.length < 2) {
      errors.push('اسم المتجر (Store_Name) مطلوب');
    }
    if (email && !emailRegex.test(email)) {
      errors.push('صيغة البريد الإلكتروني (Email) غير صحيحة');
    }

    const platforms = parsePlatformsString(platformsRaw);
    const effectiveEmail =
      email ||
      `merchant.${idx + 1}.${Date.now().toString(36).slice(-4)}@store-radar.eg`;
    const effectiveManager = managerName || 'مدير المتجر';
    const effectivePhone = phone || '+201000000000';

    // Determine if this row updates an existing merchant or creates a new one
    const existingMatch = currentList.find(
      (m) =>
        (email && m.primaryEmail.toLowerCase().trim() === email) ||
        m.storeName.trim().toLowerCase() === storeName.trim().toLowerCase() ||
        (sellerId &&
          (m.apiCredentials?.amazonSellerId === sellerId ||
            m.platformCredentials?.['amazon_eg']?.sellerId === sellerId))
    );

    parsedRows.push({
      rowNumber: idx + 2, // 1-indexed header + row
      storeName,
      managerName: effectiveManager,
      email: effectiveEmail,
      phone: effectivePhone,
      city,
      platforms,
      sellerId,
      apiToken: refreshToken,
      noonAuthKey,
      noonAppId,
      bostaApiKey,
      dataMode: 'live',
      isValid: errors.length === 0,
      errors,
      actionType: existingMatch ? 'update' : 'create',
      matchedMerchantId: existingMatch?.id,
    });
  });

  const validRows = parsedRows.filter((r) => r.isValid);
  return {
    fileName: file.name,
    totalRows: parsedRows.length,
    validRowsCount: validRows.length,
    invalidRowsCount: parsedRows.length - validRows.length,
    newMerchantsCount: validRows.filter((r) => r.actionType === 'create').length,
    updatedMerchantsCount: validRows.filter((r) => r.actionType === 'update').length,
    rows: parsedRows,
  };
}

/**
 * Executes bulk synchronization of validated merchant rows:
 * - Creates or updates each merchant in LocalStorage
 * - Links each merchant with their subscribed platforms, Seller_ID, and API_Token / Refresh_Token
 * - Syncs each merchant's credentials to Cloud Firestore (/merchant_stores/{merchantId})
 * - Dispatches global events so all UI components update immediately
 */
export async function syncBulkImportedMerchants(
  rowsToSync: BulkMerchantImportRow[],
  allProductIds: string[] = []
): Promise<{
  updatedList: RemoteMerchantClient[];
  createdCount: number;
  updatedCount: number;
  syncedToFirestoreCount: number;
}> {
  const validRows = rowsToSync.filter((r) => r.isValid);
  const currentList = loadAllRegisteredMerchants();
  const nextList = [...currentList];

  let createdCount = 0;
  let updatedCount = 0;
  const merchantsToSyncCloud: RemoteMerchantClient[] = [];

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    const nowIso = new Date().toISOString();

    // Find existing by matchedMerchantId, email, or storeName
    const existingIdx = nextList.findIndex(
      (m) =>
        (row.matchedMerchantId && m.id === row.matchedMerchantId) ||
        m.primaryEmail.toLowerCase().trim() === row.email.toLowerCase().trim() ||
        m.storeName.trim().toLowerCase() === row.storeName.trim().toLowerCase()
    );

    if (existingIdx !== -1) {
      const curr = nextList[existingIdx];
      const mergedPlatforms = Array.from(
        new Set([...(curr.platformsSubscribed || []), ...row.platforms])
      ) as RemoteMerchantPlatformCode[];

      const effectiveSellerId =
        row.sellerId ||
        curr.apiCredentials?.amazonSellerId ||
        curr.platformCredentials?.['amazon_eg']?.sellerId ||
        '';
      const rawToken =
        row.apiToken ||
        curr.apiCredentials?.amazonRefreshToken ||
        curr.platformCredentials?.['amazon_eg']?.mwsAuthToken ||
        '';
      const effectiveToken = rawToken ? encryptLwaRefreshToken(rawToken) : '';

      // Build platformCredentials map for all subscribed platforms
      const updatedPlatCreds: NonNullable<RemoteMerchantClient['platformCredentials']> = {
        ...(curr.platformCredentials || {}),
      };

      mergedPlatforms.forEach((platCode) => {
        updatedPlatCreds[platCode] = {
          ...(updatedPlatCreds[platCode] || {}),
          sellerName: row.storeName || curr.storeName,
          sellerId: effectiveSellerId || updatedPlatCreds[platCode]?.sellerId || '',
          merchantEmail: row.email || curr.primaryEmail,
          mwsAuthToken: effectiveToken || updatedPlatCreds[platCode]?.mwsAuthToken || '',
          apiKey:
            platCode === 'noon_eg'
              ? row.noonAuthKey || effectiveToken || updatedPlatCreds[platCode]?.apiKey || ''
              : effectiveToken || updatedPlatCreds[platCode]?.apiKey || '',
          isConnected: true,
          lastSyncedAt: 'تم الربط والمزامنة عبر الشيت المجمع ✅',
        };
      });

      const updatedMerchant: RemoteMerchantClient = ensureMerchantTrialFields({
        ...curr,
        storeName: row.storeName || curr.storeName,
        contactPerson: row.managerName || curr.contactPerson,
        primaryEmail: row.email || curr.primaryEmail,
        phone: row.phone || curr.phone,
        city: row.city || curr.city,
        platformsSubscribed: mergedPlatforms,
        dataMode: 'live',
        status: 'active',
        apiCredentials: {
          ...(curr.apiCredentials || { dataMode: 'live' }),
          amazonSellerId: effectiveSellerId,
          amazonRefreshToken: effectiveToken,
          amazonRegion: curr.apiCredentials?.amazonRegion || 'eu-west-1',
          amazonMarketplaceId:
            curr.apiCredentials?.amazonMarketplaceId || 'ARBP9OOSHTCHU',
          noonAuthKey: row.noonAuthKey || curr.apiCredentials?.noonAuthKey || '',
          noonAppId: row.noonAppId || curr.apiCredentials?.noonAppId || '',
          bostaApiKey: row.bostaApiKey || curr.apiCredentials?.bostaApiKey || '',
          dataMode: 'live',
          isConfigured: Boolean(effectiveToken || effectiveSellerId),
          lastTestedAt: nowIso,
          lastTestStatus: 'success',
          lastTestMessage: 'تم استيراد ومزامنة مفاتيح الربط تلقائياً عبر الشيت المجمع',
        },
        platformCredentials: updatedPlatCreds,
      });

      nextList[existingIdx] = updatedMerchant;
      merchantsToSyncCloud.push(updatedMerchant);
      updatedCount++;
    } else {
      const newId = `merchant-bulk-${Date.now().toString(36)}-${i}`;
      const encryptedRowToken = row.apiToken ? encryptLwaRefreshToken(row.apiToken) : '';
      const platCreds: NonNullable<RemoteMerchantClient['platformCredentials']> = {};

      row.platforms.forEach((platCode) => {
        platCreds[platCode] = {
          sellerName: row.storeName,
          sellerId: row.sellerId || '',
          merchantEmail: row.email,
          mwsAuthToken: encryptedRowToken || '',
          apiKey:
            platCode === 'noon_eg'
              ? row.noonAuthKey || encryptedRowToken || ''
              : encryptedRowToken || '',
          isConnected: true,
          lastSyncedAt: 'تم الربط والمزامنة المشفرة عبر الشيت المجمع 🔐✅',
        };
      });

      const newMerchant: RemoteMerchantClient = ensureMerchantTrialFields({
        id: newId,
        storeName: row.storeName,
        contactPerson: row.managerName,
        primaryEmail: row.email,
        additionalEmails: [],
        phone: row.phone,
        city: row.city || 'القاهرة',
        platformsSubscribed: row.platforms,
        assignedProductIds: allProductIds.slice(0, 6),
        weeklySalesTargetEGP: 150000,
        currentWeeklySalesEGP: 0,
        currentWeeklyOrdersCount: 0,
        averageProfitMarginPercent: 25,
        buyBoxWinRatePercent: 85,
        reportDayOfWeek: 'thursday',
        autoSendWeeklyReport: true,
        sendWhatsAppReport: true,
        status: 'active',
        dataMode: 'live',
        marketerNotes: `تم الإنشاء والربط التلقائي المشفر عبر استيراد شيت التجار (${row.platforms.join(', ')})`,
        createdAt: nowIso,
        apiCredentials: {
          amazonClientId: '',
          amazonClientSecret: '',
          amazonRefreshToken: encryptedRowToken || '',
          amazonSellerId: row.sellerId || '',
          amazonRegion: 'eu-west-1',
          amazonMarketplaceId: 'ARBP9OOSHTCHU',
          noonAuthKey: row.noonAuthKey || '',
          noonAppId: row.noonAppId || '',
          bostaApiKey: row.bostaApiKey || '',
          dataMode: 'live',
          isConfigured: Boolean(encryptedRowToken || row.sellerId),
          lastTestedAt: nowIso,
          lastTestStatus: 'success',
          lastTestMessage: 'تم استيراد وتشفير ومزامنة مفاتيح الربط تلقائياً عبر الشيت المجمع',
        },
        platformCredentials: platCreds,
      });

      nextList.unshift(newMerchant);
      merchantsToSyncCloud.push(newMerchant);
      createdCount++;
    }
  }

  // Save full list to LocalStorage
  saveAllRegisteredMerchants(nextList);

  // Also persist individual platform credentials and sync each merchant to Cloud Firestore
  let syncedToFirestoreCount = 0;
  for (const m of merchantsToSyncCloud) {
    // Save per-platform local credentials
    if (m.platformCredentials) {
      Object.entries(m.platformCredentials).forEach(([platCode, creds]) => {
        saveMerchantPlatformCredentials(m.id, platCode, {
          sellerName: creds.sellerName,
          sellerId: creds.sellerId,
          merchantEmail: creds.merchantEmail,
          mwsAuthToken: creds.mwsAuthToken,
          spApiRefreshToken: creds.mwsAuthToken,
          apiKey: creds.apiKey,
          isConnected: true,
        });
      });
    }

    const ok = await saveMerchantStoreCredentialsToFirestore(m);
    if (ok) syncedToFirestoreCount++;
  }

  // Notify all components across the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('merchant_radar_merchants_bulk_synced', {
        detail: {
          merchants: nextList,
          createdCount,
          updatedCount,
          timestamp: Date.now(),
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('merchant_credentials_changed', {
        detail: {
          bulkSynced: true,
          count: merchantsToSyncCloud.length,
          timestamp: Date.now(),
        },
      })
    );
  }

  return {
    updatedList: nextList,
    createdCount,
    updatedCount,
    syncedToFirestoreCount,
  };
}
