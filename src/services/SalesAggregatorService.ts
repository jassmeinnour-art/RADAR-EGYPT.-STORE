import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export type SupportedSalesPlatform = 'amazon' | 'noon' | 'jumia' | 'unknown';

export interface AmazonSpApiConfig {
  region?: string;
  merchantId?: string;
  sellerId?: string;
  baseUrl?: string;
}

export interface NoonSellerApiConfig {
  baseUrl?: string;
  sellerId?: string;
  storeName?: string;
}

export interface JumiaSellerCenterConfig {
  baseUrl?: string;
  sellerId?: string;
  storeName?: string;
}

export interface SalesRecord {
  sku: string;
  productName: string;
  quantity: number;
  platform: SupportedSalesPlatform;
  merchantName: string;
  sourceFile: string;
}

export interface TopSellerProduct {
  sku: string;
  productName: string;
  totalQuantitySold: number;
  merchantNames: string[];
  platformBreakdown: Array<{
    platform: SupportedSalesPlatform;
    totalQuantitySold: number;
    merchantName: string;
  }>;
}

export interface SalesAggregationResult {
  success: boolean;
  message: string;
  total: number;
  data: TopSellerProduct[];
  generatedAt: string;
}

const SALES_REPORTS_DIRECTORY = path.resolve(process.cwd(), 'data', 'sales_reports');
const SUPPORTED_EXTENSIONS = new Set(['.csv', '.xlsx', '.xls']);

const normalizeHeader = (value: string) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const parseQuantityValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[,\s]/g, '').replace(/[^0-9.-]/g, '');
    if (!normalized) return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }

  return 0;
};

const inferPlatform = (value: unknown): SupportedSalesPlatform => {
  const platformText = String(value ?? '').trim().toLowerCase();
  if (!platformText) return 'unknown';
  if (platformText.includes('amazon')) return 'amazon';
  if (platformText.includes('noon')) return 'noon';
  if (platformText.includes('jumia')) return 'jumia';
  return 'unknown';
};

const pickCell = (row: Record<string, unknown>, aliases: string[]): string => {
  for (const alias of aliases) {
    const candidate = row[alias];
    if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
      return String(candidate).trim();
    }
  }

  const normalizedKeys = Object.keys(row);
  for (const key of normalizedKeys) {
    const normalized = normalizeHeader(key);
    if (aliases.includes(normalized)) {
      const candidate = row[key];
      if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
        return String(candidate).trim();
      }
    }
  }

  return '';
};

const extractSalesRowsFromSheet = (sheet: unknown, sourceFile: string): SalesRecord[] => {
  if (!sheet || typeof sheet !== 'object') return [];

  const rows = Array.isArray((sheet as any).data)
    ? (sheet as any).data
    : Array.isArray((sheet as any).rows)
      ? (sheet as any).rows
      : [];

  if (!Array.isArray(rows) || rows.length === 0) return [];

  const normalizedRows: Record<string, unknown>[] = rows.map((row: any) => {
    if (!row || typeof row !== 'object') return {} as Record<string, unknown>;
    if (Array.isArray(row)) {
      const result: Record<string, unknown> = {};
      row.forEach((cell, index) => {
        result[String(index)] = cell;
      });
      return result;
    }
    return row as Record<string, unknown>;
  });

  const aliasMap = {
    sku: ['sku', 'asin', 'item_sku', 'product_sku', 'seller_sku'],
    productName: ['product_name', 'productname', 'product', 'item_name', 'title', 'name'],
    quantity: ['quantity', 'qty', 'ordered_quantity', 'units_sold', 'total_quantity', 'sales_qty'],
    merchantName: ['merchant_name', 'merchant', 'seller_name', 'seller', 'store_name', 'account_name'],
    platform: ['platform', 'marketplace', 'channel', 'sales_channel']
  };

  const salesRows: SalesRecord[] = [];

  for (const row of normalizedRows) {
    const sku = pickCell(row, aliasMap.sku);
    const productName = pickCell(row, aliasMap.productName);
    const merchantName = pickCell(row, aliasMap.merchantName) || 'غير محدد';
    const quantity = parseQuantityValue(pickCell(row, aliasMap.quantity));
    const platform = inferPlatform(pickCell(row, aliasMap.platform));

    if (!sku || !productName || quantity <= 0) continue;

    salesRows.push({
      sku: sku.trim(),
      productName: productName.trim(),
      quantity,
      platform,
      merchantName: merchantName.trim() || 'غير محدد',
      sourceFile,
    });
  }

  return salesRows;
};

const parseWorkbookFile = (filePath: string): SalesRecord[] => {
  const rawBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(rawBuffer, { type: 'array' });
  const collected: SalesRecord[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    }) as Record<string, unknown>[];

    rows.forEach((row) => {
      const sku = pickCell(row, ['sku', 'asin', 'item_sku', 'product_sku', 'seller_sku']);
      const productName = pickCell(row, ['product_name', 'productname', 'product', 'item_name', 'title', 'name']);
      const merchantName = pickCell(row, ['merchant_name', 'merchant', 'seller_name', 'seller', 'store_name', 'account_name']) || 'غير محدد';
      const quantity = parseQuantityValue(pickCell(row, ['quantity', 'qty', 'ordered_quantity', 'units_sold', 'total_quantity', 'sales_qty']));
      const platform = inferPlatform(pickCell(row, ['platform', 'marketplace', 'channel', 'sales_channel']));

      if (!sku || !productName || quantity <= 0) return;

      collected.push({
        sku: sku.trim(),
        productName: productName.trim(),
        quantity,
        platform,
        merchantName: merchantName.trim() || 'غير محدد',
        sourceFile: filePath,
      });
    });
  });

  return collected;
};

const parseCsvFile = (filePath: string): SalesRecord[] => {
  const csvText = fs.readFileSync(filePath, 'utf-8');
  const rows = XLSX.utils.sheet_to_json(XLSX.read(csvText, { type: 'string' }).Sheets[Object.keys(XLSX.read(csvText, { type: 'string' }).Sheets)[0] || 'Sheet1'] ?? [], {
    defval: '',
    raw: false,
  }) as Record<string, unknown>[];

  return rows.reduce<SalesRecord[]>((acc, row) => {
    const sku = pickCell(row, ['sku', 'asin', 'item_sku', 'product_sku', 'seller_sku']);
    const productName = pickCell(row, ['product_name', 'productname', 'product', 'item_name', 'title', 'name']);
    const merchantName = pickCell(row, ['merchant_name', 'merchant', 'seller_name', 'seller', 'store_name', 'account_name']) || 'غير محدد';
    const quantity = parseQuantityValue(pickCell(row, ['quantity', 'qty', 'ordered_quantity', 'units_sold', 'total_quantity', 'sales_qty']));
    const platform = inferPlatform(pickCell(row, ['platform', 'marketplace', 'channel', 'sales_channel']));

    if (!sku || !productName || quantity <= 0) return acc;

    acc.push({
      sku: sku.trim(),
      productName: productName.trim(),
      quantity,
      platform,
      merchantName: merchantName.trim() || 'غير محدد',
      sourceFile: filePath,
    });

    return acc;
  }, []);
};

export class SalesAggregatorService {
  static getSalesReportsDirectory(): string {
    return SALES_REPORTS_DIRECTORY;
  }

  static getReportFiles(): string[] {
    if (!fs.existsSync(SALES_REPORTS_DIRECTORY)) return [];

    return fs
      .readdirSync(SALES_REPORTS_DIRECTORY, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(SALES_REPORTS_DIRECTORY, entry.name))
      .filter((filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        return SUPPORTED_EXTENSIONS.has(ext);
      })
      .sort((a, b) => a.localeCompare(b));
  }

  static readAllSalesReports(): SalesRecord[] {
    const files = this.getReportFiles();
    if (files.length === 0) return [];

    const records: SalesRecord[] = [];

    for (const filePath of files) {
      try {
        const ext = path.extname(filePath).toLowerCase();
        const result = ext === '.csv' ? parseCsvFile(filePath) : parseWorkbookFile(filePath);
        records.push(...result);
      } catch (error) {
        console.warn(`Unable to parse sales report file: ${filePath}`, error);
      }
    }

    return records;
  }

  static aggregateTopSellers(limit = 10): SalesAggregationResult {
    const allRecords = this.readAllSalesReports();

    if (allRecords.length === 0) {
      return {
        success: false,
        message: 'لا توجد تقارير مبيعات حقيقية في /data/sales_reports - برجاء رفع تقارير Amazon/Noon/Jumia',
        total: 0,
        data: [],
        generatedAt: new Date().toISOString(),
      };
    }

    const map = new Map<string, TopSellerProduct>();

    for (const record of allRecords) {
      const key = record.sku.toLowerCase();
      const existing = map.get(key) ?? {
        sku: record.sku,
        productName: record.productName,
        totalQuantitySold: 0,
        merchantNames: [],
        platformBreakdown: [],
      };

      existing.totalQuantitySold += record.quantity;
      if (!existing.merchantNames.includes(record.merchantName)) {
        existing.merchantNames.push(record.merchantName);
      }

      const platformKey = `${record.platform}:${record.merchantName}`;
      const platformEntry = existing.platformBreakdown.find((p) => p.platform === record.platform && p.merchantName === record.merchantName);
      if (platformEntry) {
        platformEntry.totalQuantitySold += record.quantity;
      } else {
        existing.platformBreakdown.push({
          platform: record.platform,
          totalQuantitySold: record.quantity,
          merchantName: record.merchantName,
        });
      }

      map.set(key, existing);
    }

    const data = Array.from(map.values())
      .map((item) => ({
        ...item,
        platformBreakdown: item.platformBreakdown.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold),
      }))
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, Math.max(1, Number(limit) || 10));

    return {
      success: true,
      message: 'تم تجميع تقارير المبيعات الحقيقية بنجاح.',
      total: data.length,
      data,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const amazonSpApiInterface: AmazonSpApiConfig = {
  region: 'EG',
  merchantId: '',
  sellerId: '',
  baseUrl: 'https://sellingpartnerapi-na.amazon.com',
};

export const noonSellerApiInterface: NoonSellerApiConfig = {
  baseUrl: 'https://api.noon.com',
  sellerId: '',
  storeName: '',
};

export const jumiaSellerCenterInterface: JumiaSellerCenterConfig = {
  baseUrl: 'https://sellercenter.jumia.com.eg',
  sellerId: '',
  storeName: '',
};
