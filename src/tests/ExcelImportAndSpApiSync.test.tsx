import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import * as XLSX from 'xlsx';
import {
  AMAZON_TXT_GUIDE_TEXT,
  DEFAULT_TRADER_ID,
  DIRECT_FETCH_BLOCKED_MESSAGE,
  EMPTY_FILE_ERROR_MESSAGE,
  FOUNDER_AMAZON_WARNING_TEXT,
  FRIENDLY_PULL_FAILURE_MESSAGE,
  IMPORT_BUTTON_LABEL,
  MISSING_SKU_COLUMN_PREFIX,
  NO_TRADER_SELECTED_ERROR,
  REPORT_STILL_PROCESSING_MESSAGE,
  SP_API_SETTINGS_STORAGE_KEY,
  UNRECOGNIZED_COLUMNS_PREFIX,
  UNSUPPORTED_FILE_ERROR_MESSAGE,
  buildAmazonAsinImageUrl,
  cleanHeaderKey,
  sanitizeProductPullError,
  parseSellerCentralWorkbook,
  parseSellerCentralWorkbookDetailed,
  importSellerCentralFile,
  invokeAmazonSpApiSyncEdgeFunction,
  resolveValidTraderUuid,
  saveAmazonSpApiSettings,
  saveTraderAmazonConnection,
} from '../utils/sellerCentralExcelImporter';
import { FetchProductsModal } from '../components/FetchProductsModal';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductsPage } from '../components/ProductsPage';
import { TradersPage } from '../components/TradersPage';
import { AccountSettingsPage } from '../components/AccountSettingsPage';
import { dataCache } from '../utils/dataCache';

const {
  mockInsert,
  mockUpdateEq,
  mockUpdate,
  mockFunctionsInvoke,
  existingProductRowsRef,
  insertedBatchesRef,
  updatedPayloadsRef,
  productsEqCallsRef,
} = vi.hoisted(() => {
  const existingProductRowsRef: { current: any[] } = { current: [] };
  const insertedBatchesRef: { current: any[][] } = { current: [] };
  const updatedPayloadsRef: { current: Array<{ id: string; payload: any }> } = { current: [] };
  const productsEqCallsRef: { current: Array<{ col: string; val: any }> } = { current: [] };

  const mockInsert = vi.fn(async (rows: any[]) => {
    insertedBatchesRef.current.push(rows);
    const dbRows = rows.map((r, idx) => ({
      ...r,
      id:
        r.id ||
        `11111111-1111-4111-8111-${String(insertedBatchesRef.current.length * 1000 + idx + 1).padStart(12, '0')}`,
    }));
    existingProductRowsRef.current = [...existingProductRowsRef.current, ...dbRows];
    return { data: dbRows, error: null };
  });

  const mockUpdateEq = vi.fn(async (_col: string, id: string) => {
    const last = updatedPayloadsRef.current.find((u) => !u.id);
    if (last) last.id = id;
    return { data: [], error: null };
  });

  const mockUpdate = vi.fn((payload: any) => {
    const entry = { id: '', payload };
    updatedPayloadsRef.current.push(entry);
    return {
      eq: vi.fn(async (_col: string, id: string) => {
        entry.id = id;
        return { data: [], error: null };
      }),
    };
  });

  const mockFunctionsInvoke = vi.fn();

  return {
    mockInsert,
    mockUpdateEq,
    mockUpdate,
    mockFunctionsInvoke,
    existingProductRowsRef,
    insertedBatchesRef,
    updatedPayloadsRef,
    productsEqCallsRef,
  };
});

vi.mock('../lib/supabase', () => {
  const mahmoudTraderFixture = [
    {
      id: 'A37JIM7LHQI6IM',
      user_id: 'founder',
      seller_name: 'محمود سعيد',
      email: 'mahmeudsaid4@gmail.com',
      phone: '',
      platform: 'amazon',
      status: 'active',
      seller_id: 'A37JIM7LHQI6IM',
    },
  ];

  const buildChain = (tableName: string) => {
    let activeTraderFilter: string | null = null;
    let isDeleteQuery = false;
    const getFilteredProducts = () =>
      activeTraderFilter
        ? existingProductRowsRef.current.filter(
            (r) => !r.trader_id || r.trader_id === activeTraderFilter
          )
        : existingProductRowsRef.current;

    const chain: any = {
      select: vi.fn((_fields?: string, _opts?: any) => chain),
      eq: vi.fn((col: string, val: any) => {
        if (tableName === 'products') {
          productsEqCallsRef.current.push({ col, val });
          if (col === 'trader_id') {
            activeTraderFilter = String(val);
          }
        }
        return chain;
      }),
      order: vi.fn(() => chain),
      range: vi.fn(async () => {
        const data =
          tableName === 'traders' ? mahmoudTraderFixture : getFilteredProducts();
        return {
          data,
          error: null,
          count: data.length,
        };
      }),
      insert: mockInsert,
      update: mockUpdate,
      delete: vi.fn(() => {
        isDeleteQuery = true;
        return chain;
      }),
      single: vi.fn(async () => ({ data: null, error: null })),
      then: (onFulfilled: any) => {
        if (isDeleteQuery && tableName === 'products') {
          if (activeTraderFilter) {
            existingProductRowsRef.current = existingProductRowsRef.current.filter(
              (r) => r.trader_id !== activeTraderFilter
            );
          } else {
            existingProductRowsRef.current = [];
          }
          return Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled);
        }
        const data =
          tableName === 'traders' ? mahmoudTraderFixture : getFilteredProducts();
        return Promise.resolve({
          data,
          error: null,
          count: data.length,
        }).then(onFulfilled);
      },
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((tableName: string) => buildChain(tableName)),
    },
    formatSupabaseError: vi.fn((err: any) =>
      typeof err === 'string' ? err : err?.message || 'Supabase Error'
    ),
    supabaseClient: {
      functions: {
        invoke: mockFunctionsInvoke,
      },
    },
    getTraderLastSyncAt: vi.fn(() => null),
    isDemoOrOrphanProduct: vi.fn(() => false),
    recordTraderLastSyncAt: vi.fn(async () => new Date().toISOString()),
    multiTenantDb: {
      addNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
      getNotifications: vi.fn().mockResolvedValue([]),
      markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
    },
  };
});

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: { uid: 'founder-uid', email: 'jassmeinnour@gmail.com', isAnonymous: false },
    isOwner: true,
    profile: {
      uid: 'founder-uid',
      displayName: 'مؤسس النظام',
      email: 'jassmeinnour@gmail.com',
      storeName: 'رادار التاجر',
      contactPhone: '201012345678',
      city: 'القاهرة',
      preferredCurrency: 'EGP',
    },
    updateStoreProfile: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../db', () => ({
  auth: { currentUser: null },
  db: null,
  usersCollection: null,
  handleFirestoreError: vi.fn(),
  OperationType: { GET: 'get', WRITE: 'write', UPDATE: 'update' },
  isFirestoreQuotaExhausted: () => false,
}));

function buildXlsxBytes(rows: Array<Record<string, any>>): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SellerCentral');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  if (out instanceof ArrayBuffer) return out;
  const u8 = new Uint8Array(out);
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

function makeMockTextFile(name: string, content: string): File {
  const bytes = new TextEncoder().encode(content);
  const file = new File([bytes], name, { type: 'text/plain;charset=utf-8' });
  (file as any).arrayBuffer = async () =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return file;
}

describe('Amazon TXT / Excel / CSV Import, Direct Fetch Blocking, and Anti-Linked-Account Guard', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    dataCache.invalidate('');
    existingProductRowsRef.current = [];
    insertedBatchesRef.current = [];
    updatedPayloadsRef.current = [];
    productsEqCallsRef.current = [];
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    window.history.replaceState({}, '', '/');
  });

  it('blocks direct browser fetch on pull click and shows Seller Central TXT instructions and security warning', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as any;

    const onShowToast = vi.fn();
    render(
      <FetchProductsModal
        isOpen={true}
        onClose={vi.fn()}
        onShowToast={onShowToast}
        trader={{
          id: DEFAULT_TRADER_ID,
          user_id: 'founder',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '',
          platform: 'amazon',
          status: 'active',
          seller_id: DEFAULT_TRADER_ID,
          destination_url: 'https://sellercentral.amazon.eg/inventory',
          store_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
        }}
      />
    );

    expect(screen.getByText(AMAZON_TXT_GUIDE_TEXT)).toBeInTheDocument();
    expect(screen.getByText(FOUNDER_AMAZON_WARNING_TEXT)).toBeInTheDocument();

    const pullBtn = screen.getByRole('button', { name: /سحب المنتجات/i });
    fireEvent.click(pullBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(DIRECT_FETCH_BLOCKED_MESSAGE);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onShowToast).toHaveBeenCalledWith(DIRECT_FETCH_BLOCKED_MESSAGE);
  });

  it('sanitizes HTML DOCTYPE and Unexpected token "<" errors cleanly while preserving real Amazon/network errors verbatim', () => {
    expect(
      sanitizeProductPullError(new SyntaxError("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"))
    ).toBe(FRIENDLY_PULL_FAILURE_MESSAGE);
    expect(sanitizeProductPullError('<!DOCTYPE html><html>404</html>')).toBe(FRIENDLY_PULL_FAILURE_MESSAGE);
    expect(
      sanitizeProductPullError('invalid_grant: The authorization grant is invalid or expired')
    ).toBe('invalid_grant: The authorization grant is invalid or expired');
    expect(FRIENDLY_PULL_FAILURE_MESSAGE).not.toContain('Unexpected token');
    expect(FRIENDLY_PULL_FAILURE_MESSAGE).not.toContain('يمنع السحب المباشر');
    expect(DIRECT_FETCH_BLOCKED_MESSAGE).not.toContain('يمنع السحب المباشر');
  });

  it('parses Amazon All Listings Report TXT (Tab-separated UTF-8 + BOM) with product-id fallback, condition, constructed product_url, and skips blank/no-SKU lines', async () => {
    const tsvWithBom =
      '\uFEFF' +
      [
        'item-name\tseller-sku\tasin\tproduct-id\tprice\tquantity\titem-condition\timage-url',
        'مكنسة كهربائية عربية\tAMZ-SKU-01\tB09ARAB001\t\t3299.50\t8\tNew\thttps://img.ex/vac.jpg',
        'غلاية مياه ستانلس\tAMZ-SKU-02\t\tB08PRODID2\t499\t14\tNew\t',
        '\t\tB0MISSING1\t\t100\t2\tNew\t', // missing SKU -> skipped
        '', // blank line -> skipped
        'خلاط يدوي 600 وات\tAMZ-SKU-03\tB07MIXER03\t\t1150\t3\tUsedLikeNew\thttps://img.ex/mix.jpg',
      ].join('\n');

    const parsed = await parseSellerCentralWorkbookDetailed(new TextEncoder().encode(tsvWithBom), {
      fileName: 'all-listings-report.txt',
      traderId: DEFAULT_TRADER_ID,
    });

    // Header must NOT be imported; blank + missing-SKU lines must be counted in skippedCount
    expect(parsed.totalRead).toBe(3);
    expect(parsed.skippedCount).toBe(2);
    expect(parsed.rows).toHaveLength(3);

    expect(parsed.rows[0]).toEqual({
      title: 'مكنسة كهربائية عربية',
      sku: 'AMZ-SKU-01',
      asin: 'B09ARAB001',
      price: 3299.5,
      stock: 8,
      status: 'active',
      condition: 'New',
      image_url: 'https://img.ex/vac.jpg',
      product_url: 'https://www.amazon.eg/dp/B09ARAB001',
      platform: 'amazon',
      trader_id: 'A37JIM7LHQI6IM',
    });

    // product-id -> asin when asin is empty, and product_url constructed from that ASIN
    expect(parsed.rows[1].asin).toBe('B08PRODID2');
    expect(parsed.rows[1].product_url).toBe('https://www.amazon.eg/dp/B08PRODID2');
    expect(parsed.rows[2].condition).toBe('UsedLikeNew');
  });

  it('parses XLSX and CSV Seller Central files accurately', async () => {
    const xlsxBytes = buildXlsxBytes([
      {
        'item-name': 'مكنسة كهربائية تورنيدو 2000 وات',
        'seller-sku': 'TRN-VAC-2000',
        asin1: 'B09TRN1234',
        price: '3499.50',
        quantity: '12',
        'image-url': 'https://images.example.com/vacuum.jpg',
        'product-url': 'https://www.amazon.eg/dp/B09TRN1234',
      },
      {
        title: 'خلاط مطبخ كينوود',
        sku: 'KNW-BLD-500',
        asin: 'B08KNW9876',
        price: 2100,
        stock: 5,
        image_url: 'https://images.example.com/blender.jpg',
      },
    ]);

    const parsedXlsx = await parseSellerCentralWorkbook(xlsxBytes, {
      fileName: 'inventory.xlsx',
      traderId: DEFAULT_TRADER_ID,
    });

    expect(parsedXlsx).toHaveLength(2);
    expect(parsedXlsx[0]).toEqual({
      title: 'مكنسة كهربائية تورنيدو 2000 وات',
      sku: 'TRN-VAC-2000',
      asin: 'B09TRN1234',
      price: 3499.5,
      stock: 12,
      status: 'active',
      image_url: 'https://images.example.com/vacuum.jpg',
      product_url: 'https://www.amazon.eg/dp/B09TRN1234',
      platform: 'amazon',
      trader_id: 'A37JIM7LHQI6IM',
    });
    expect(parsedXlsx[1].product_url).toBe('https://www.amazon.eg/dp/B08KNW9876');

    const csvText =
      'item-name,seller-sku,asin1,price,quantity,image-url,product-url\nغسالة ملابس اوتوماتيك,WSH-AUTO-1,B07WSH1111,14500,3,https://img.ex/w.jpg,https://www.amazon.eg/dp/B07WSH1111';
    const parsedCsv = await parseSellerCentralWorkbook(new TextEncoder().encode(csvText), {
      fileName: 'report.csv',
      traderId: DEFAULT_TRADER_ID,
    });
    expect(parsedCsv).toHaveLength(1);
    expect(parsedCsv[0].sku).toBe('WSH-AUTO-1');
    expect(parsedCsv[0].trader_id).toBe('A37JIM7LHQI6IM');
  });

  it('imports 103 real-format Amazon TXT products cleanly and prevents duplicates on second upload (updates price & stock only)', async () => {
    const header = 'item-name\tseller-sku\tasin\tproduct-id\tprice\tquantity\titem-condition\timage-url';
    const dataLines = Array.from({ length: 103 }, (_, i) => {
      const idx = i + 1;
      const asin = `B09TEST${String(idx).padStart(3, '0')}`;
      return `منتج أمازون رقم ${idx}\tAMZ-TXT-${String(idx).padStart(3, '0')}\t${asin}\t\t${100 + idx}\t${idx % 25}\tNew\thttps://img.ex/${idx}.jpg`;
    });
    const txtContent = [header, ...dataLines].join('\n');

    // Upload 1: all 103 products are new
    const file1 = makeMockTextFile('All+Listings+Report.txt', txtContent);
    const summary1 = await importSellerCentralFile(file1, DEFAULT_TRADER_ID);

    expect(summary1.traderId).toBe('A37JIM7LHQI6IM');
    expect(summary1.total).toBe(103);
    expect(summary1.newCount).toBe(103);
    expect(summary1.updatedCount).toBe(0);
    expect(summary1.skippedCount).toBe(0);
    expect(summary1.message).toBe('تم قراءة 103 منتج من الملف - جديد 103 - محدّث 0 - متخطى 0');

    const totalInserted1 = insertedBatchesRef.current.reduce((acc, batch) => acc + batch.length, 0);
    expect(totalInserted1).toBe(103);
    expect(updatedPayloadsRef.current).toHaveLength(0);

    // Populate existing Supabase rows (with DB-generated UUIDs) from Upload 1 so Upload 2 sees all 103 SKUs
    existingProductRowsRef.current = insertedBatchesRef.current.flat().map((r, idx) => ({
      id: `22222222-2222-4222-8222-${String(idx + 1).padStart(12, '0')}`,
      sku: r.sku,
      asin: r.asin,
      image_url: r.image_url,
    }));
    insertedBatchesRef.current = [];
    updatedPayloadsRef.current = [];

    // Upload 2: same 103-product file with updated prices/quantities
    const dataLinesUpdated = Array.from({ length: 103 }, (_, i) => {
      const idx = i + 1;
      const asin = `B09TEST${String(idx).padStart(3, '0')}`;
      return `منتج أمازون رقم ${idx}\tAMZ-TXT-${String(idx).padStart(3, '0')}\t${asin}\t\t${250 + idx}\t${(idx % 10) + 5}\tNew\t`;
    });
    const file2 = makeMockTextFile('All+Listings+Report.txt', [header, ...dataLinesUpdated].join('\n'));
    const summary2 = await importSellerCentralFile(file2, DEFAULT_TRADER_ID);

    expect(summary2.total).toBe(103);
    expect(summary2.newCount).toBe(0);
    expect(summary2.updatedCount).toBe(103);
    expect(summary2.skippedCount).toBe(0);
    expect(summary2.message).toBe('تم قراءة 103 منتج من الملف - جديد 0 - محدّث 103 - متخطى 0');

    // Zero duplicate inserts! All 103 updated price & stock only!
    expect(insertedBatchesRef.current).toHaveLength(0);
    expect(updatedPayloadsRef.current).toHaveLength(103);
    expect(Object.keys(updatedPayloadsRef.current[0].payload)).toEqual([
      'price',
      'stock',
      'updated_at',
    ]);
  });

  it('rejects unsupported file types and empty files with explicit Arabic error messages', async () => {
    const pdfFile = makeMockTextFile('invoice.pdf', '%PDF-1.4 fake content');
    await expect(importSellerCentralFile(pdfFile, DEFAULT_TRADER_ID)).rejects.toThrow(
      UNSUPPORTED_FILE_ERROR_MESSAGE
    );

    const emptyTxt = makeMockTextFile('empty-report.txt', '');
    await expect(importSellerCentralFile(emptyTxt, DEFAULT_TRADER_ID)).rejects.toThrow(
      EMPTY_FILE_ERROR_MESSAGE
    );

    const headerOnlyTxt = makeMockTextFile(
      'header-only.txt',
      'item-name\tseller-sku\tasin\tprice\tquantity\n'
    );
    await expect(importSellerCentralFile(headerOnlyTxt, DEFAULT_TRADER_ID)).rejects.toThrow(
      EMPTY_FILE_ERROR_MESSAGE
    );
  });

  it('renders 5-product preview before confirming upload from ProductsPage button with updated label', async () => {
    const onShowToast = vi.fn();
    render(<ProductsPage onShowToast={onShowToast} />);

    const importBtn = screen.getByRole('button', { name: IMPORT_BUTTON_LABEL });
    expect(importBtn).toBeInTheDocument();

    const fileInput = screen.getByTestId('products-excel-file-input') as HTMLInputElement;
    expect(fileInput.getAttribute('accept')).toContain('.txt');
    expect(fileInput.getAttribute('accept')).toContain('.tsv');
    expect(fileInput.getAttribute('accept')).toContain('.csv');
    expect(fileInput.getAttribute('accept')).toContain('.xlsx');

    const tsvContent = [
      'item-name\tseller-sku\tasin\tprice\tquantity\titem-condition',
      'منتج أول\tSKU-P1\tB000000001\t100\t5\tNew',
      'منتج ثاني\tSKU-P2\tB000000002\t200\t10\tNew',
      'منتج ثالث\tSKU-P3\tB000000003\t300\t15\tNew',
      'منتج رابع\tSKU-P4\tB000000004\t400\t20\tNew',
      'منتج خامس\tSKU-P5\tB000000005\t500\t25\tNew',
      'منتج سادس لا يظهر بالمعاينة\tSKU-P6\tB000000006\t600\t30\tNew',
    ].join('\n');

    const txtFile = makeMockTextFile('amazon-inventory.txt', tsvContent);
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    const previewPanel = await screen.findByTestId('import-preview-panel');
    expect(previewPanel).toBeInTheDocument();
    expect(within(previewPanel).getByText(/معاينة أول 5 منتجات قبل التأكيد/)).toBeInTheDocument();
    expect(
      within(previewPanel).getByText('تم قراءة 6 منتج من الملف - جديد 6 - محدّث 0 - متخطى 0')
    ).toBeInTheDocument();

    // Verify first 5 rows rendered, 6th omitted from preview table
    expect(within(previewPanel).getByText('SKU-P1')).toBeInTheDocument();
    expect(within(previewPanel).getByText('SKU-P5')).toBeInTheDocument();
    expect(within(previewPanel).queryByText('SKU-P6')).not.toBeInTheDocument();

    // Must not have inserted before confirmation
    expect(insertedBatchesRef.current).toHaveLength(0);

    fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد.*الاستيراد/i }));

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(
        'تم قراءة 6 منتج من الملف - جديد 6 - محدّث 0 - متخطى 0'
      );
    });
    expect(insertedBatchesRef.current[0]).toHaveLength(6);
  });

  it('displays updated import button on TraderCard without any merchant Amazon login, password field, or Seller Central iframe', async () => {
    const { container } = render(<TradersPage onShowToast={vi.fn()} />);

    const cardImportBtn = await screen.findByRole('button', { name: IMPORT_BUTTON_LABEL });
    expect(cardImportBtn).toBeInTheDocument();

    expect(container.querySelectorAll('iframe')).toHaveLength(0);
    expect(screen.queryByText(/سجل دخول بحساب التاجر على أمازون/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/كلمة مرور أمازون/i)).not.toBeInTheDocument();
  });

  it('shows global Radar keys banner and saves Client ID & Client Secret without Refresh Token in AccountSettingsPage', async () => {
    const onShowToast = vi.fn();
    render(<AccountSettingsPage onShowToast={onShowToast} />);

    expect(screen.getByTestId('founder-amazon-warning')).toHaveTextContent(FOUNDER_AMAZON_WARNING_TEXT);
    expect(screen.getByText('مفاتيح رادار - نفس المفاتيح لكل التجار - لا تتغير بإضافة تاجر جديد')).toBeInTheDocument();
    expect(screen.queryByLabelText('Refresh Token')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Seller ID')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: 'amzn1.application-oa2-client.test' },
    });
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: 'secret-xyz' },
    });

    fireEvent.click(screen.getByRole('button', { name: /حفظ إعدادات SP-API/i }));
    const savedSettings = JSON.parse(localStorage.getItem(SP_API_SETTINGS_STORAGE_KEY) || '{}');
    expect(savedSettings.clientId).toBe('amzn1.application-oa2-client.test');
    expect(savedSettings.clientSecret).toBe('secret-xyz');
  });

  it('decodes UTF-16LE (with BOM) Tab-separated 103-product Amazon TXT report and skips preamble title/blank lines', async () => {
    const encodeUtf16 = (str: string, littleEndian: boolean): Uint8Array => {
      const withBom = '\uFEFF' + str;
      const out = new Uint8Array(withBom.length * 2);
      for (let i = 0; i < withBom.length; i++) {
        const code = withBom.charCodeAt(i);
        if (littleEndian) {
          out[i * 2] = code & 0xff;
          out[i * 2 + 1] = (code >> 8) & 0xff;
        } else {
          out[i * 2] = (code >> 8) & 0xff;
          out[i * 2 + 1] = code & 0xff;
        }
      }
      return out;
    };

    const header = 'item-name\tseller-sku\tasin\tprice\tquantity';
    const dataLines = Array.from({ length: 103 }, (_, i) => {
      const idx = i + 1;
      return `منتج أمازون حقيقي ${idx}\tAMZ-U16-${idx}\tB09U16${String(idx).padStart(4, '0')}\t${200 + idx}\t${idx % 20}`;
    });

    // Include blank lines and report title lines BEFORE header
    const fullText = [
      '',
      'Amazon Seller Central - All Listings Report',
      'Generated Date: 2026-11-22',
      '',
      header,
      ...dataLines,
    ].join('\r\n');

    const utf16LeBytes = encodeUtf16(fullText, true);
    const parsedLe = await parseSellerCentralWorkbookDetailed(utf16LeBytes, {
      fileName: 'AllListings-utf16le.txt',
      traderId: DEFAULT_TRADER_ID,
    });
    expect(parsedLe.totalRead).toBe(103);
    expect(parsedLe.rows[0].title).toBe('منتج أمازون حقيقي 1');
    expect(parsedLe.rows[0].sku).toBe('AMZ-U16-1');

    // Also verify UTF-16BE + BOM works seamlessly
    const utf16BeBytes = encodeUtf16(fullText, false);
    const parsedBe = await parseSellerCentralWorkbookDetailed(utf16BeBytes, {
      fileName: 'AllListings-utf16be.txt',
      traderId: DEFAULT_TRADER_ID,
    });
    expect(parsedBe.totalRead).toBe(103);

    // Verify FetchProductsModal displays preview with line count & first product name for UTF-16LE file
    const utf16File = new File([utf16LeBytes.slice().buffer], 'All+Listings+Report.txt', { type: 'text/plain' });
    (utf16File as any).arrayBuffer = async () =>
      utf16LeBytes.buffer.slice(utf16LeBytes.byteOffset, utf16LeBytes.byteOffset + utf16LeBytes.byteLength);

    render(
      <FetchProductsModal
        isOpen={true}
        onClose={vi.fn()}
        onShowToast={vi.fn()}
        trader={{
          id: DEFAULT_TRADER_ID,
          user_id: 'founder',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '',
          platform: 'amazon',
          status: 'active',
          seller_id: DEFAULT_TRADER_ID,
        }}
      />
    );

    const fileInput = screen.getByTestId('modal-excel-file-input') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [utf16File] } });

    const banner = await screen.findByTestId('import-line-preview-banner');
    expect(banner).toHaveTextContent(/تم قراءة 103 منتج - مثال: أول منتج: \[AMZ-U16-1\] - \[منتج أمازون حقيقي 1\] - \[201 ج\.م\]/);
  });

  it('normalizes Arabic and English column names cleanly via cleanHeaderKey', () => {
    expect(cleanHeaderKey('sku-البائع')).toBe('skuالبائع');
    expect(cleanHeaderKey('السعر الحالي')).toBe('السعرالحالي');
    expect(cleanHeaderKey('  item-name  ')).toBe('itemname');
    expect(cleanHeaderKey('seller-sku')).toBe('sellersku');
    expect(cleanHeaderKey('رقم_asin')).toBe('رقمasin');
    expect(cleanHeaderKey('صورة المنتج')).toBe('صورةالمنتج');
    expect(cleanHeaderKey('\uFEFFكود-المنتج')).toBe('كودالمنتج');
  });

  it('imports Amazon Egypt All Listings Report with Arabic headers: sku-البائع | asin | السعر الحالي', async () => {
    // Generate 103 real products with Amazon Egypt Arabic columns
    const header = 'sku-البائع\tasin\tالسعر الحالي';
    const lines = Array.from({ length: 103 }, (_, i) => {
      const idx = i + 1;
      return `EG-SKU-${idx}\tB09EG${String(idx).padStart(4, '0')}\t${250 + idx}`;
    });

    const fileContent = ['', 'Amazon Egypt Seller Central - All Listings Report', '', header, ...lines].join('\r\n');
    const egFile = makeMockTextFile('amazon-eg-listings.txt', fileContent);

    // 1. Must parse all 103 items without throwing "لم أستطع قراءة أعمدة الملف"
    const parsed = await parseSellerCentralWorkbookDetailed(fileContent, {
      fileName: 'amazon-eg-listings.txt',
      traderId: DEFAULT_TRADER_ID,
    });
    expect(parsed.totalRead).toBe(103);
    expect(parsed.rows).toHaveLength(103);
    expect(parsed.rows[0].sku).toBe('EG-SKU-1');
    expect(parsed.rows[0].asin).toBe('B09EG0001');
    expect(parsed.rows[0].price).toBe(251);

    // 2. FetchProductsModal renders preview with [SKU] - [Title] - [Price] and "تأكيد الاستيراد"
    const onShowToast = vi.fn();
    render(
      <FetchProductsModal
        isOpen={true}
        onClose={vi.fn()}
        onShowToast={onShowToast}
        trader={{
          id: DEFAULT_TRADER_ID,
          user_id: 'founder',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '',
          platform: 'amazon',
          status: 'active',
          seller_id: DEFAULT_TRADER_ID,
        }}
      />
    );

    const fileInput = screen.getByTestId('modal-excel-file-input') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [egFile] } });

    const banner = await screen.findByTestId('import-line-preview-banner');
    expect(banner).toHaveTextContent(/تم قراءة 103 منتج - مثال: أول منتج: \[EG-SKU-1\] - \[B09EG0001\] - \[251 ج\.م\]/);

    const confirmBtn = screen.getByRole('button', { name: /تأكيد الاستيراد/i });
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(
        expect.stringContaining('تم قراءة 103 منتج من الملف')
      );
    });
  });

  it('rejects files missing SKU with explicit Arabic error showing present columns', async () => {
    const noSkuContent = [
      'asin\tالسعر الحالي\tالكمية',
      'B09TEST001\t199\t10',
      'B09TEST002\t299\t5',
    ].join('\n');
    const noSkuFile = makeMockTextFile('no-sku.txt', noSkuContent);

    await expect(importSellerCentralFile(noSkuFile, DEFAULT_TRADER_ID)).rejects.toThrow(
      `${MISSING_SKU_COLUMN_PREFIX}[asin | السعر الحالي | الكمية]`
    );
  });

  it('auto-detects semicolon (;) and comma (,) delimiters, handles "Report is still processing", and reports unrecognized columns', async () => {
    // 1. Semicolon-delimited report with flexible Capitalized headers
    const semiCsv = [
      'Seller SKU;ASIN;Item Name;Price;Quantity',
      'SEMI-001;B08SEMI001;سماعة بلوتوث احترافية;1299.5;7',
      'SEMI-002;B08SEMI002;شاحن سريع 65 وات;650;12',
    ].join('\n');

    const semiRows = await parseSellerCentralWorkbook(new TextEncoder().encode(semiCsv), {
      fileName: 'listings-semi.txt',
      traderId: DEFAULT_TRADER_ID,
    });
    expect(semiRows).toHaveLength(2);
    expect(semiRows[0].sku).toBe('SEMI-001');
    expect(semiRows[0].title).toBe('سماعة بلوتوث احترافية');
    expect(semiRows[0].price).toBe(1299.5);
    expect(semiRows[0].stock).toBe(7);

    // 2. "Report is still processing" message
    const processingFile = makeMockTextFile(
      'pending.txt',
      'Report is still processing. Please wait and request again.'
    );
    await expect(importSellerCentralFile(processingFile, DEFAULT_TRADER_ID)).rejects.toThrow(
      REPORT_STILL_PROCESSING_MESSAGE
    );

    // 3. Unrecognized columns must NOT show "الملف فارغ", must include actual first line
    const weirdFile = makeMockTextFile('weird.txt', 'col_alpha|col_beta|col_gamma\n1|2|3');
    await expect(importSellerCentralFile(weirdFile, DEFAULT_TRADER_ID)).rejects.toThrow(
      `${UNRECOGNIZED_COLUMNS_PREFIX}[col_alpha|col_beta|col_gamma]`
    );
  });

  it('never sends manual prd- id, created_at, updated_at, or image on insert, resolves valid trader UUID, and renders all 106 imported products in ProductsPage', async () => {
    const ALLOWED_KEYS = new Set([
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
    ]);
    const FORBIDDEN_KEYS = [
      'id',
      'created_at',
      'updated_at',
      'image',
      'name',
      'product_name',
      'quantity',
      'qty',
      'description',
      'platform',
    ];

    const VALID_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';

    // Temporarily override traders query via supabase.from mock to return UUID trader
    const { supabase } = await import('../lib/supabase');
    const origFrom = supabase.from as any;
    const baseImpl = origFrom.getMockImplementation();
    origFrom.mockImplementation((tableName: string) => {
      const chain = baseImpl(tableName);
      if (tableName === 'traders') {
        const uuidTraderList = [
          {
            id: VALID_TRADER_UUID,
            user_id: 'founder',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            platform: 'amazon',
            status: 'active',
            seller_id: 'A37JIM7LHQI6IM',
          },
        ];
        chain.then = (onFulfilled: any) =>
          Promise.resolve({ data: uuidTraderList, error: null, count: 1 }).then(onFulfilled);
        chain.range = vi.fn(async () => ({ data: uuidTraderList, error: null, count: 1 }));
      }
      return chain;
    });

    try {
      // Passing seller_id ('A37JIM7LHQI6IM') or trader name must resolve to real UUID
      expect(await resolveValidTraderUuid('A37JIM7LHQI6IM')).toBe(VALID_TRADER_UUID);
      expect(await resolveValidTraderUuid('محمود سعيد')).toBe(VALID_TRADER_UUID);

      // Build 106-product TXT file (Arabic Amazon Egypt format)
      const header = 'sku-البائع\tasin\tالسعر الحالي\tالكمية';
      const lines = Array.from({ length: 106 }, (_, i) => {
        const idx = i + 1;
        return `EG106-SKU-${idx}\tB09EG106${String(idx).padStart(2, '0')}\t${300 + idx}\t${(idx % 15) + 1}`;
      });
      const txtFile = makeMockTextFile('all-listings-106.txt', [header, ...lines].join('\n'));

      const summary = await importSellerCentralFile(txtFile, 'A37JIM7LHQI6IM');
      expect(summary.total).toBe(106);
      expect(summary.newCount).toBe(106);
      expect(summary.traderId).toBe(VALID_TRADER_UUID);

      const allInserted = insertedBatchesRef.current.flat();
      expect(allInserted).toHaveLength(106);

      for (const row of allInserted) {
        for (const forbidden of FORBIDDEN_KEYS) {
          expect(row).not.toHaveProperty(forbidden);
        }
        for (const key of Object.keys(row)) {
          expect(ALLOWED_KEYS.has(key)).toBe(true);
        }
        expect(row.trader_id).toBe(VALID_TRADER_UUID);
        expect(row.status).toBe('active');
      }

      // Populate DB rows with Supabase-generated UUIDs and verify ProductsPage renders all 106
      existingProductRowsRef.current = allInserted.map((r, i) => ({
        ...r,
        id: `33333333-3333-4333-8333-${String(i + 1).padStart(12, '0')}`,
      }));

      render(<ProductsPage onShowToast={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('virtual-product-grid')).toHaveAttribute('data-total-items', '106');
        expect(screen.getByText(/SKU: EG106-SKU-1\b/)).toBeInTheDocument();
      });
    } finally {
      if (baseImpl) origFrom.mockImplementation(baseImpl);
    }
  });

  it('parses Arabic Amazon Egypt prices with currency/commas (not 0), extracts stock from المتاح/الكمية, and auto-builds ASIN image_url', async () => {
    const tsv = [
      'item-name\tseller-sku\tasin\tالسعر الحالي (EGP)\tالمتاح',
      'راوتر هوائي 5G منزلي\tEG-RTR-01\tB09ROUTER1\t1,899.50 ج.م\t14',
      'كاميرا مراقبة ذكية\tEG-CAM-02\tB08CAM2026\tج.م 2,450\t7',
    ].join('\n');

    const parsed = await parseSellerCentralWorkbookDetailed(new TextEncoder().encode(tsv), {
      fileName: 'amazon-egypt-formatted.txt',
      traderId: DEFAULT_TRADER_ID,
    });

    expect(parsed.totalRead).toBe(2);
    expect(parsed.rows[0].price).toBe(1899.5);
    expect(parsed.rows[0].stock).toBe(14);
    expect(parsed.rows[0].image_url).toBe(
      'https://images-na.ssl-images-amazon.com/images/P/B09ROUTER1.01.L.jpg'
    );

    expect(parsed.rows[1].price).toBe(2450);
    expect(parsed.rows[1].stock).toBe(7);
    expect(parsed.rows[1].image_url).toBe(
      buildAmazonAsinImageUrl('B08CAM2026')
    );
  });

  it('renders ASIN placeholder when OptimizedImage source fails or is absent', () => {
    const { container } = render(
      <OptimizedImage
        src="https://images-na.ssl-images-amazon.com/images/P/B09FAIL999.01.L.jpg"
        alt="منتج تجريبي"
        asin="B09FAIL999"
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    fireEvent.error(img);

    expect(screen.getByTestId('asin-placeholder-B09FAIL999')).toBeInTheDocument();
    expect(screen.getByText('ASIN: B09FAIL999')).toBeInTheDocument();
  });

  it('automatically triggers competitor price Edge Function on import confirm when SP-API is configured, stores competitor_prices, and displays price difference + 30-day chart', async () => {
    saveAmazonSpApiSettings({
      refreshToken: 'Atzr|ValidToken',
      clientId: 'amzn1.client.id',
      clientSecret: 'amzn1.client.secret',
      sellerId: 'A37JIM7LHQI6IM',
    });

    const competitorPriceInserts: any[] = [];
    const competitorRowsStored: any[] = [];
    const { supabase } = await import('../lib/supabase');
    const origFrom = supabase.from as any;
    const baseImpl = origFrom.getMockImplementation();

    origFrom.mockImplementation((tableName: string) => {
      const chain = baseImpl(tableName);
      if (tableName === 'competitor_prices') {
        chain.insert = vi.fn(async (rows: any[]) => {
          competitorPriceInserts.push(...rows);
          competitorRowsStored.push(...rows);
          return { data: rows, error: null };
        });
        chain.then = (onFulfilled: any) =>
          Promise.resolve({ data: competitorRowsStored, error: null }).then(onFulfilled);
      }
      return chain;
    });

    mockFunctionsInvoke.mockImplementation(async (fnName: string) => {
      if (fnName === 'amazon-competitor-prices') {
        return {
          data: {
            success: true,
            results: [
              {
                asin: 'B09HIGH001',
                competitor_price: 1750,
                buy_box_price: 1790,
                competitors_count: 5,
                image_url: 'https://m.media-amazon.com/images/I/high001.jpg',
              },
              {
                asin: 'B09LOW0002',
                competitor_price: 900,
                buy_box_price: 920,
                competitors_count: 3,
              },
            ],
          },
          error: null,
        };
      }
      return { data: { success: true }, error: null };
    });

    try {
      const txtContent = [
        'item-name\tseller-sku\tasin\tالسعر الحالي\tالكمية',
        'شاشة كمبيوتر 27 بوصة\tSKU-COMP-1\tB09HIGH001\t1899\t6',
        'كيبورد ميكانيكي ألعاب\tSKU-COMP-2\tB09LOW0002\t800\t12',
      ].join('\n');
      const file = makeMockTextFile('listings-with-competitors.txt', txtContent);

      render(
        <FetchProductsModal
          isOpen={true}
          onClose={vi.fn()}
          onShowToast={vi.fn()}
          trader={{
            id: DEFAULT_TRADER_ID,
            user_id: 'founder',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            phone: '',
            platform: 'amazon',
            status: 'active',
            seller_id: DEFAULT_TRADER_ID,
          }}
        />
      );

      fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
        target: { files: [file] },
      });

      const previewPanel = await screen.findByTestId('import-preview-panel');
      fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد الاستيراد/i }));

      await waitFor(() => {
        expect(mockFunctionsInvoke).toHaveBeenCalledWith(
          'amazon-competitor-prices',
          expect.objectContaining({
            body: expect.objectContaining({
              asins: ['B09HIGH001', 'B09LOW0002'],
              includeCatalogImages: true,
            }),
          })
        );
      });

      expect(competitorPriceInserts).toHaveLength(2);
      expect(competitorPriceInserts[0]).toEqual(
        expect.objectContaining({
          asin: 'B09HIGH001',
          competitor_price: 1750,
          buy_box_price: 1790,
          competitors_count: 5,
        })
      );

      // Populate DB products as returned after import & verify ProductsPage renders comparison
      const allInserted = insertedBatchesRef.current.flat();
      existingProductRowsRef.current = allInserted.map((r, i) => ({
        ...r,
        id: `44444444-4444-4444-8444-${String(i + 1).padStart(12, '0')}`,
      }));

      render(<ProductsPage onShowToast={vi.fn()} />);

      await waitFor(() => {
        const grid = screen.getByTestId('virtual-product-grid');
        expect(within(grid).getByText(/1,899 ج\.م/)).toBeInTheDocument();
        expect(within(grid).getByText(/1,750 ج\.م/)).toBeInTheDocument();
        expect(within(grid).getByText(/أغلى بـ 149 ج\.م/)).toBeInTheDocument();
        expect(within(grid).getByText(/أرخص بـ 100 ج\.م/)).toBeInTheDocument();
      });

      // Open 30-day price analysis modal and confirm competitor comparison renders cleanly
      const analyzeButtons = screen.getAllByRole('button', { name: /تحليل السعر \(30 يوم\)/i });
      fireEvent.click(analyzeButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/تحليل السعر ومقارنة المنافسين/i)).toBeInTheDocument();
        expect(screen.getByText(/سعر Buy Box/i)).toBeInTheDocument();
      });
    } finally {
      if (baseImpl) origFrom.mockImplementation(baseImpl);
    }
  });

  it('shows "-" (never 0) and connect SP-API CTA on ProductCard when SP-API is not configured', async () => {
    localStorage.removeItem(SP_API_SETTINGS_STORAGE_KEY);
    existingProductRowsRef.current = [
      {
        id: '55555555-5555-4555-8555-000000000001',
        trader_id: 'fbb0e12e-16f5-42d9-924a-c2b39a87541a',
        title: 'منتج بدون ربط SP-API',
        sku: 'NO-SPAPI-1',
        asin: 'B09NOSPAPI',
        price: 1250,
        stock: 9,
        platform: 'amazon',
      },
    ];

    render(<ProductsPage onShowToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('سعر المنافسين: غير متوفر - اربط SP-API')).toBeInTheDocument();
      expect(screen.getByText('سعر المنافس الأقل:')).toBeInTheDocument();
    });

    // Competitor price shows '-' and NOT '0 ج.م'
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByText(/^0 ج\.م$/)).not.toBeInTheDocument();
  });

  it('rejects import with "لم يتم تحديد التاجر" when trader_id is empty/null/all and never picks first trader blindly', async () => {
    await expect(resolveValidTraderUuid('')).rejects.toThrow(NO_TRADER_SELECTED_ERROR);
    await expect(resolveValidTraderUuid('all')).rejects.toThrow(NO_TRADER_SELECTED_ERROR);
    await expect(resolveValidTraderUuid('null')).rejects.toThrow(NO_TRADER_SELECTED_ERROR);

    const file = makeMockTextFile(
      'listings-no-trader.txt',
      'item-name\tseller-sku\tasin\tprice\tquantity\ttrader_id\nمنتج بدون تاجر\tSKU-NT-1\tB09NT0001\t500\t10\tFAKE-FILE-TRADER'
    );

    // Even if file itself contains a trader_id column, import must still throw when page/selected trader_id is empty
    await expect(importSellerCentralFile(file, '')).rejects.toThrow(NO_TRADER_SELECTED_ERROR);
    expect(insertedBatchesRef.current).toHaveLength(0);
  });

  it('uses the selected trader card trader_id (ignoring file trader_id & ignoring first trader) and filters ProductsPage by trader_id ONLY without platform', async () => {
    const FIRST_TRADER_UUID = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';

    const { supabase } = await import('../lib/supabase');
    const origFrom = supabase.from as any;
    const baseImpl = origFrom.getMockImplementation();

    const twoTraders = [
      {
        id: FIRST_TRADER_UUID,
        user_id: 'founder',
        seller_name: 'تاجر أول مختلف',
        email: 'first@example.com',
        platform: 'amazon',
        status: 'active',
        seller_id: 'A111111111',
      },
      {
        id: TARGET_TRADER_UUID,
        user_id: 'founder',
        seller_name: 'محمود سعيد',
        email: 'mahmeudsaid4@gmail.com',
        platform: 'amazon',
        status: 'active',
        seller_id: 'A37JIM7LHQI6IM',
      },
    ];

    origFrom.mockImplementation((tableName: string) => {
      const chain = baseImpl(tableName);
      if (tableName === 'traders') {
        chain.then = (onFulfilled: any) =>
          Promise.resolve({ data: twoTraders, error: null, count: 2 }).then(onFulfilled);
        chain.range = vi.fn(async () => ({ data: twoTraders, error: null, count: 2 }));
      }
      return chain;
    });

    try {
      const header = 'sku-البائع\tasin\tالسعر الحالي\tالكمية\ttrader_id';
      const lines = Array.from({ length: 106 }, (_, i) => {
        const idx = i + 1;
        return `MS106-SKU-${idx}\tB09MS${String(idx).padStart(5, '0')}\t${400 + idx}\t${(idx % 12) + 1}\tWRONG-FILE-TRADER-ID`;
      });
      const txtFile = makeMockTextFile('mahmoud-106.txt', [header, ...lines].join('\n'));

      render(
        <FetchProductsModal
          isOpen={true}
          onClose={vi.fn()}
          onShowToast={vi.fn()}
          trader={twoTraders[1] as any}
        />
      );

      fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
        target: { files: [txtFile] },
      });

      const previewPanel = await screen.findByTestId('import-preview-panel');
      fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد الاستيراد/i }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('في قاعدة البيانات: 106');
      });

      const inserted = insertedBatchesRef.current.flat();
      expect(inserted).toHaveLength(106);
      expect(inserted[0].trader_id).toBe(TARGET_TRADER_UUID);
      expect(inserted[105].trader_id).toBe(TARGET_TRADER_UUID);

      // Simulate navigating to /products?trader_id=fbb0e12e-...&platform=amazon
      productsEqCallsRef.current = [];
      window.history.replaceState(
        {},
        '',
        `/products?trader_id=${TARGET_TRADER_UUID}&platform=amazon`
      );

      render(<ProductsPage onShowToast={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('virtual-product-grid')).toHaveAttribute(
          'data-total-items',
          '106'
        );
      });

      // Verify Supabase products query ONLY filtered by trader_id and NEVER passed eq('platform', ...)
      expect(
        productsEqCallsRef.current.some(
          (c) => c.col === 'trader_id' && c.val === TARGET_TRADER_UUID
        )
      ).toBe(true);
      expect(productsEqCallsRef.current.some((c) => c.col === 'platform')).toBe(false);
    } finally {
      if (baseImpl) origFrom.mockImplementation(baseImpl);
    }
  });

  it('throws real Supabase error and suppresses fake "106 imported" count when post-import Supabase re-fetch returns 0 rows or RLS error', async () => {
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    const { supabase } = await import('../lib/supabase');
    const origFrom = supabase.from as any;
    const baseImpl = origFrom.getMockImplementation();

    // Case 1: Supabase re-fetch after insert returns 0 rows
    origFrom.mockImplementation((tableName: string) => {
      const chain = baseImpl(tableName);
      if (tableName === 'products') {
        chain.then = (onFulfilled: any) =>
          Promise.resolve({ data: [], error: null, count: 0 }).then(onFulfilled);
      }
      return chain;
    });

    try {
      const file = makeMockTextFile(
        'rls-blocked.txt',
        'item-name\tseller-sku\tasin\tprice\tquantity\nمنتج محظور\tSKU-RLS-1\tB09RLS001\t200\t3'
      );

      await expect(importSellerCentralFile(file, TARGET_TRADER_UUID)).rejects.toThrow(
        /عدد المنتجات الفعلية في قاعدة البيانات لهذا التاجر = 0/
      );
      expect(localStorage.getItem('radar_last_sync_stats')).toBeNull();

      // Case 2: Supabase re-fetch returns real RLS error
      origFrom.mockImplementation((tableName: string) => {
        const chain = baseImpl(tableName);
        if (tableName === 'products') {
          chain.then = (onFulfilled: any) =>
            Promise.resolve({
              data: null,
              error: { code: '42501', message: 'permission denied for table products' },
              count: 0,
            }).then(onFulfilled);
        }
        return chain;
      });

      await expect(importSellerCentralFile(file, TARGET_TRADER_UUID)).rejects.toThrow(
        /permission denied for table products/
      );
      expect(localStorage.getItem('radar_last_sync_stats')).toBeNull();
    } finally {
      if (baseImpl) origFrom.mockImplementation(baseImpl);
    }
  });

  it('logs headers & first row to console, shows "الأعمدة الموجودة" in preview, parses Arabic headers with EGP/commas/spaces, assigns ASIN images, and shows verified DB price after import', async () => {
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      const txtContent = [
        'اسم_المنتج\tsku-البائع\tASIN\tالسعر الحالي\tالمخزون_المتوفر',
        'غلاية كهربائية ستانلس 2 لتر\tAR-SKU-01\tB09ALLOFR1\t1,450 ج.م\t18 قطعة',
        'شواية كهربائية بدون دخان\tAR-SKU-02\tB09ALLOFR2\t2,990 EGP\t7',
      ].join('\n');
      const file = makeMockTextFile('all-offers-report.txt', txtContent);

      render(
        <FetchProductsModal
          isOpen={true}
          onClose={vi.fn()}
          onShowToast={vi.fn()}
          trader={{
            id: TARGET_TRADER_UUID,
            user_id: 'founder',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            phone: '',
            platform: 'amazon',
            status: 'active',
            seller_id: 'A37JIM7LHQI6IM',
          }}
        />
      );

      fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
        target: { files: [file] },
      });

      const previewPanel = await screen.findByTestId('import-preview-panel');
      expect(within(previewPanel).getByTestId('detected-headers-banner')).toHaveTextContent(
        'الأعمدة الموجودة:'
      );
      expect(within(previewPanel).getByTestId('detected-headers-banner')).toHaveTextContent(
        'السعر الحالي'
      );
      expect(within(previewPanel).getByText('1,450 ج.م')).toBeInTheDocument();
      expect(within(previewPanel).getByText('2,990 ج.م')).toBeInTheDocument();

      // Console diagnostics printed headers & first row
      expect(logSpy).toHaveBeenCalledWith(
        '[Amazon Import Debug] الهيدر كاملاً:',
        expect.arrayContaining(['اسم_المنتج', 'sku-البائع', 'ASIN', 'السعر الحالي', 'المخزون_المتوفر'])
      );
      expect(logSpy).toHaveBeenCalledWith(
        '[Amazon Import Debug] أول صف كاملاً:',
        expect.objectContaining({ 'sku-البائع': 'AR-SKU-01', 'السعر الحالي': '1,450 ج.م' })
      );

      fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد الاستيراد/i }));

      await waitFor(() => {
        expect(screen.getByTestId('db-verified-price-summary')).toHaveTextContent(
          'السعر الحقيقي في قاعدة البيانات: 1,450 ج.م'
        );
      });

      const inserted = insertedBatchesRef.current.flat();
      expect(inserted).toHaveLength(2);
      expect(inserted[0]).toEqual(
        expect.objectContaining({
          title: 'غلاية كهربائية ستانلس 2 لتر',
          sku: 'AR-SKU-01',
          asin: 'B09ALLOFR1',
          price: 1450,
          stock: 18,
          image_url: 'https://images-na.ssl-images-amazon.com/images/P/B09ALLOFR1.01.L.jpg',
          trader_id: TARGET_TRADER_UUID,
        })
      );
      expect(inserted[1].price).toBe(2990);
      expect(inserted[1].stock).toBe(7);
      expect(inserted[1].image_url).toBe(
        'https://images-na.ssl-images-amazon.com/images/P/B09ALLOFR2.01.L.jpg'
      );
    } finally {
      logSpy.mockRestore();
    }
  });

  it('shows exact warning for missing price column vs zero/empty price values in file without silent zero save', async () => {
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      // Case 1: Price column completely missing
      const noPriceFile = makeMockTextFile(
        'no-price-col.txt',
        'اسم المنتج\tsku-البائع\tasin\tالكمية\nمنتج بلا سعر\tNP-SKU-1\tB09NOPR01\t5'
      );
      const { unmount } = render(
        <FetchProductsModal
          isOpen={true}
          onClose={vi.fn()}
          onShowToast={vi.fn()}
          trader={{
            id: TARGET_TRADER_UUID,
            user_id: 'founder',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            phone: '',
            platform: 'amazon',
            status: 'active',
            seller_id: TARGET_TRADER_UUID,
          }}
        />
      );

      fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
        target: { files: [noPriceFile] },
      });

      const missingWarning = await screen.findByTestId('missing-price-column-warning');
      expect(missingWarning).toHaveTextContent('عمود السعر غير موجود - الأعمدة الموجودة:');
      unmount();

      // Case 2: Price column EXISTS ("السعر الحالي") but its value is 0 / empty in the file
      const zeroPriceFile = makeMockTextFile(
        'zero-price-col.txt',
        'اسم المنتج\tsku-البائع\tasin\tالسعر الحالي\tالكمية\nمنتج بسعر صفر\tZP-SKU-1\tB09ZERO01\t0\t9'
      );
      render(
        <FetchProductsModal
          isOpen={true}
          onClose={vi.fn()}
          onShowToast={vi.fn()}
          trader={{
            id: TARGET_TRADER_UUID,
            user_id: 'founder',
            seller_name: 'محمود سعيد',
            email: 'mahmeudsaid4@gmail.com',
            phone: '',
            platform: 'amazon',
            status: 'active',
            seller_id: TARGET_TRADER_UUID,
          }}
        />
      );

      fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
        target: { files: [zeroPriceFile] },
      });

      const zeroWarning = await screen.findByTestId('missing-price-column-warning');
      expect(zeroWarning).toHaveTextContent('السعر في الملف نفسه 0 - تحقق من تقرير أمازون');

      const previewPanel = screen.getByTestId('import-preview-panel');
      fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد الاستيراد/i }));

      await waitFor(() => {
        expect(screen.getByTestId('post-import-price-warning')).toHaveTextContent(
          'السعر في الملف نفسه 0 - تحقق من تقرير أمازون'
        );
      });
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('deletes all products for current trader via "حذف كل منتجات هذا التاجر" confirmation dialog before re-import', async () => {
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    const OTHER_TRADER_UUID = '99999999-9999-4999-8999-999999999999';
    window.history.replaceState({}, '', `/products?trader_id=${TARGET_TRADER_UUID}`);

    existingProductRowsRef.current = [
      {
        id: '77777777-7777-4777-8777-000000000001',
        trader_id: TARGET_TRADER_UUID,
        title: 'منتج قديم بسعر 0',
        sku: 'OLD-ZERO-1',
        asin: 'B09OLD001',
        price: 0,
        stock: 0,
        platform: 'amazon',
      },
      {
        id: '77777777-7777-4777-8777-000000000002',
        trader_id: OTHER_TRADER_UUID,
        title: 'منتج تاجر آخر لا يحذف',
        sku: 'OTHER-1',
        asin: 'B09OTHER1',
        price: 555,
        stock: 3,
        platform: 'amazon',
      },
    ];

    const onShowToast = vi.fn();
    render(<ProductsPage onShowToast={onShowToast} />);

    const deleteAllBtn = await screen.findByTestId('delete-all-trader-products-btn');
    expect(deleteAllBtn).toHaveTextContent('حذف كل منتجات هذا التاجر');

    fireEvent.click(deleteAllBtn);

    const dialog = await screen.findByRole('dialog', { name: 'تأكيد حذف كل منتجات التاجر' });
    fireEvent.click(within(dialog).getByTestId('confirm-delete-all-products-btn'));

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(
        expect.stringContaining('تم حذف كل منتجات هذا التاجر بنجاح')
      );
    });

    // Current trader's products deleted, other trader's product untouched
    expect(
      existingProductRowsRef.current.filter((r) => r.trader_id === TARGET_TRADER_UUID)
    ).toHaveLength(0);
    expect(
      existingProductRowsRef.current.filter((r) => r.trader_id === OTHER_TRADER_UUID)
    ).toHaveLength(1);
  });

  it('AccountSettingsPage "ربط وجلب أسعار المنافسين" saves SP-API credentials and triggers competitor sync for existing ASIN products', async () => {
    localStorage.removeItem(SP_API_SETTINGS_STORAGE_KEY);
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    existingProductRowsRef.current = [
      {
        id: '88888888-8888-4888-8888-000000000001',
        trader_id: TARGET_TRADER_UUID,
        title: 'منتج للتحليل التنافسي',
        sku: 'SET-COMP-1',
        asin: 'B09SETCOMP1',
        price: 1200,
        stock: 5,
      },
    ];

    mockFunctionsInvoke.mockImplementation(async (fnName: string) => {
      if (fnName === 'amazon-competitor-prices') {
        return {
          data: {
            items: [
              {
                asin: 'B09SETCOMP1',
                competitor_price: 1120,
                buy_box_price: 1150,
                competitors_count: 4,
                image_url: 'https://images-na.ssl-images-amazon.com/images/P/B09SETCOMP1.01.L.jpg',
              },
            ],
          },
          error: null,
        };
      }
      return { data: null, error: null };
    });

    const onShowToast = vi.fn();
    await saveTraderAmazonConnection({
      traderId: TARGET_TRADER_UUID,
      sellerId: 'A37JIM7LHQI6IM',
      refreshToken: 'Atzr|TestRefreshToken999',
    });
    render(<AccountSettingsPage onShowToast={onShowToast} />);

    fireEvent.change(screen.getByLabelText(/Client ID/i), {
      target: { value: 'amzn1.application-oa2-client.test999' },
    });
    fireEvent.change(screen.getByLabelText(/Client Secret/i), {
      target: { value: 'amzn1.oa2-cs.v1.secret999' },
    });

    fireEvent.click(screen.getByTestId('connect-and-fetch-competitors-btn'));

    await waitFor(() => {
      expect(mockFunctionsInvoke).toHaveBeenCalledWith(
        'amazon-competitor-prices',
        expect.objectContaining({
          body: expect.objectContaining({
            asins: ['B09SETCOMP1'],
          }),
        })
      );
    });

    const savedSettings = JSON.parse(localStorage.getItem(SP_API_SETTINGS_STORAGE_KEY) || '{}');
    expect(savedSettings.clientId).toBe('amzn1.application-oa2-client.test999');
  });

  it('imports 4-column report (sku-البائع | asin1 | السعر الحالي | الحالة) with real price=1899, stock=null, title=ASIN, status=active, exact preview notices, and honest ProductCard UI', async () => {
    localStorage.removeItem(SP_API_SETTINGS_STORAGE_KEY);
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    window.history.replaceState({}, '', `/products?trader_id=${TARGET_TRADER_UUID}`);

    const txtContent = [
      'sku-البائع\tasin1\tالسعر الحالي\tالحالة',
      'BU4Z-UNTJ-05\tB0HBWL1V1J\t1899\tActive',
    ].join('\n');
    const file = makeMockTextFile('all-offers-4-cols.txt', txtContent);

    const { unmount } = render(
      <FetchProductsModal
        isOpen={true}
        onClose={vi.fn()}
        onShowToast={vi.fn()}
        trader={{
          id: TARGET_TRADER_UUID,
          user_id: 'founder',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '',
          platform: 'amazon',
          status: 'active',
          seller_id: 'A37JIM7LHQI6IM',
        }}
      />
    );

    fireEvent.change(screen.getByTestId('modal-excel-file-input'), {
      target: { files: [file] },
    });

    const previewPanel = await screen.findByTestId('import-preview-panel');
    expect(within(previewPanel).getByTestId('detected-headers-banner')).toHaveTextContent(
      'تم قراءة 1 منتج - الأعمدة الموجودة: sku-البائع - asin1 - السعر الحالي - الحالة'
    );
    expect(within(previewPanel).getByTestId('missing-catalog-columns-warning')).toHaveTextContent(
      'تنبيه: الملف لا يحتوي على كمية أو اسم أو صورة - سيتم جلبها من SP-API بعد الربط'
    );
    expect(within(previewPanel).getByText('1,899 ج.م')).toBeInTheDocument();
    expect(within(previewPanel).getByText('غير متوفر')).toBeInTheDocument();
    expect(within(previewPanel).getByText('نشط')).toBeInTheDocument();

    fireEvent.click(within(previewPanel).getByRole('button', { name: /تأكيد الاستيراد/i }));

    await waitFor(() => {
      expect(screen.getByTestId('db-verified-price-summary')).toHaveTextContent('1,899 ج.م');
    });

    const inserted = insertedBatchesRef.current.flat();
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toEqual(
      expect.objectContaining({
        sku: 'BU4Z-UNTJ-05',
        asin: 'B0HBWL1V1J',
        price: 1899,
        stock: null,
        title: 'B0HBWL1V1J',
        status: 'active',
        image_url: 'https://images-na.ssl-images-amazon.com/images/P/B0HBWL1V1J.01.L.jpg',
        trader_id: TARGET_TRADER_UUID,
      })
    );

    unmount();

    // Verify ProductsPage displays real price 1899, ASIN, status, and SP-API missing catalog prompts
    render(<ProductsPage onShowToast={vi.fn()} />);

    const grid = await screen.findByTestId('virtual-product-grid');
    await waitFor(() => {
      expect(within(grid).getByText(/1,899 ج\.م/)).toBeInTheDocument();
      expect(within(grid).getByText(/ASIN: B0HBWL1V1J/)).toBeInTheDocument();
      expect(within(grid).getByText(/SKU: BU4Z-UNTJ-05/)).toBeInTheDocument();
      expect(within(grid).getByText('الاسم: يجلب من SP-API')).toBeInTheDocument();
      expect(
        within(grid).getByText('المخزون: غير متوفر في الملف - اجلبه من SP-API')
      ).toBeInTheDocument();
      expect(
        within(grid).getByText('اربط SP-API لجلب الاسم والصورة والمخزون')
      ).toBeInTheDocument();
      expect(within(grid).getByText('نشط ✓')).toBeInTheDocument();
    });
  });

  it('automatically enriches missing title, stock, and image_url from SP-API Catalog Edge Function after import when SP-API is configured', async () => {
    const TARGET_TRADER_UUID = 'fbb0e12e-16f5-42d9-924a-c2b39a87541a';
    saveAmazonSpApiSettings({
      refreshToken: 'Atzr|EnrichToken',
      clientId: 'amzn1.client.enrich',
      clientSecret: 'amzn1.secret.enrich',
      sellerId: TARGET_TRADER_UUID,
    });

    mockFunctionsInvoke.mockImplementation(async (fnName: string) => {
      if (fnName === 'amazon-competitor-prices') {
        return {
          data: {
            results: [
              {
                asin: 'B0HBWL1V1J',
                title: 'ماكينة قهوة إسبريسو احترافية',
                quantity: 14,
                image_url: 'https://m.media-amazon.com/images/I/real-coffee.jpg',
                competitor_price: 1750,
                buy_box_price: 1790,
                competitors_count: 3,
              },
            ],
          },
          error: null,
        };
      }
      return { data: null, error: null };
    });

    const txtContent = [
      'sku-البائع\tasin1\tالسعر الحالي\tالحالة',
      'BU4Z-UNTJ-05\tB0HBWL1V1J\t1899\tActive',
    ].join('\n');
    const file = makeMockTextFile('all-offers-spapi-enrich.txt', txtContent);

    await importSellerCentralFile(file, TARGET_TRADER_UUID);

    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      'amazon-competitor-prices',
      expect.objectContaining({
        body: expect.objectContaining({
          asins: ['B0HBWL1V1J'],
          includeCatalogImages: true,
          includeCatalogDetails: true,
        }),
      })
    );

    expect(
      updatedPayloadsRef.current.some(
        (u) =>
          u.payload.title === 'ماكينة قهوة إسبريسو احترافية' &&
          u.payload.stock === 14 &&
          u.payload.image_url === 'https://m.media-amazon.com/images/I/real-coffee.jpg'
      )
    ).toBe(true);
  });

  it('AccountSettingsPage allows founder to wipe entire app database and storage after typing "حذف"', async () => {
    localStorage.setItem(SP_API_SETTINGS_STORAGE_KEY, JSON.stringify({ clientId: 'amzn1.global.client', clientSecret: 'secret' }));
    const onShowToast = vi.fn();
    render(<AccountSettingsPage onShowToast={onShowToast} />);

    const wipeBtn = screen.getByTestId('wipe-app-btn');
    expect(wipeBtn).toBeInTheDocument();

    fireEvent.click(wipeBtn);

    const dialog = await screen.findByRole('dialog', { name: 'تأكيد تفريغ التطبيق بالكامل' });
    expect(dialog).toBeInTheDocument();

    const confirmInput = within(dialog).getByTestId('wipe-confirm-input');
    const confirmBtn = within(dialog).getByTestId('confirm-wipe-btn');

    expect(confirmBtn).toBeDisabled();

    fireEvent.change(confirmInput, { target: { value: 'حذف' } });
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(
        expect.stringContaining('تم تفريغ التطبيق بالكامل')
      );
    });

    const savedSettings = JSON.parse(localStorage.getItem(SP_API_SETTINGS_STORAGE_KEY) || '{}');
    expect(savedSettings.clientId).toBe('amzn1.global.client');
  });

  it('saves Refresh Token inside TraderCard, hides file import nagging, pulls real Amazon SP-API products (SKU, ASIN, Price, Stock), and displays them', async () => {
    saveAmazonSpApiSettings({
      clientId: 'amzn1.application-oa2-client.prod',
      clientSecret: 'amzn1.oa2-cs.v1.prodsecret',
      applicationId: 'amzn1.sp.solution.prodapp',
      marketplaceId: 'ARBP9OOSHTCHU',
    });

    const pullPayloads: any[] = [];
    globalThis.fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.includes('/api/amazon/sp-api/pull-products')) {
        pullPayloads.push(JSON.parse(String(init?.body || '{}')));
        return new Response(
          JSON.stringify({
            success: true,
            source: 'sp_api_live',
            products: [
              {
                sku: 'REAL-AMZ-SKU-1',
                asin: 'B09REALAMZ1',
                title: 'ماكينة قهوة أصلية من أمازون',
                price: 4250,
                stock: 19,
                status: 'active',
                image_url: 'https://images-na.ssl-images-amazon.com/images/P/B09REALAMZ1.01.L.jpg',
                product_url: 'https://www.amazon.eg/dp/B09REALAMZ1',
              },
              {
                sku: 'REAL-AMZ-SKU-2',
                asin: 'B09REALAMZ2',
                title: 'شواية كهربائية أصلية',
                price: 1890,
                stock: 6,
                status: 'active',
                image_url: 'https://images-na.ssl-images-amazon.com/images/P/B09REALAMZ2.01.L.jpg',
                product_url: 'https://www.amazon.eg/dp/B09REALAMZ2',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    const onShowToast = vi.fn();
    render(<TradersPage onShowToast={onShowToast} />);

    // Enter & save Refresh Token directly on TraderCard
    const tokenInput = await screen.findByTestId('trader-card-refresh-token-A37JIM7LHQI6IM');
    fireEvent.change(tokenInput, { target: { value: 'Atzr|IwEBRealTraderToken123' } });
    fireEvent.click(screen.getByTestId('trader-card-save-refresh-token-A37JIM7LHQI6IM'));

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('Refresh Token'));
    });

    // File-import button must NOT be shown on TraderCard once Refresh Token is connected
    expect(screen.queryByRole('button', { name: IMPORT_BUTTON_LABEL })).not.toBeInTheDocument();

    // Click "سحب كل المنتجات (SP-API)" -> opens FetchProductsModal and pulls automatically
    fireEvent.click(screen.getByTestId('trader-card-pull-sp-api-A37JIM7LHQI6IM'));

    await waitFor(() => {
      expect(pullPayloads).toHaveLength(1);
    });

    expect(pullPayloads[0]).toEqual(
      expect.objectContaining({
        sellerId: 'A37JIM7LHQI6IM',
        refreshToken: 'Atzr|IwEBRealTraderToken123',
        clientId: 'amzn1.application-oa2-client.prod',
        clientSecret: 'amzn1.oa2-cs.v1.prodsecret',
        applicationId: 'amzn1.sp.solution.prodapp',
        marketplaceId: 'ARBP9OOSHTCHU',
      })
    );

    // Must NOT ask the founder to import a file when Refresh Token exists
    expect(screen.queryByText(AMAZON_TXT_GUIDE_TEXT)).not.toBeInTheDocument();

    const table = await screen.findByTestId('sp-api-pulled-products-table');
    expect(within(table).getByText('REAL-AMZ-SKU-1')).toBeInTheDocument();
    expect(within(table).getByText('B09REALAMZ1')).toBeInTheDocument();
    expect(within(table).getByText('4,250 ج.م')).toBeInTheDocument();
    expect(within(table).getByText('19')).toBeInTheDocument();
    expect(within(table).getByText('REAL-AMZ-SKU-2')).toBeInTheDocument();
    expect(within(table).getByText('B09REALAMZ2')).toBeInTheDocument();
  });

  it('displays Amazon real LWA/SP-API error verbatim when Refresh Token is invalid (never fake direct-fetch-blocked text)', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'invalid_grant',
          error_description: 'The authorization grant is invalid, expired, or revoked',
          message:
            'فشل التوثيق من أمازون (LWA HTTP 400): invalid_grant — The authorization grant is invalid, expired, or revoked',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }) as any;

    render(
      <FetchProductsModal
        isOpen={true}
        autoStartSpApi={true}
        onClose={vi.fn()}
        onShowToast={vi.fn()}
        trader={{
          id: DEFAULT_TRADER_ID,
          user_id: 'founder',
          seller_name: 'محمود سعيد',
          email: 'mahmeudsaid4@gmail.com',
          phone: '',
          platform: 'amazon',
          status: 'active',
          seller_id: DEFAULT_TRADER_ID,
          refresh_token: 'Atzr|InvalidBadToken',
        }}
      />
    );

    const alertBox = await screen.findByTestId('sp-api-error-alert');
    expect(alertBox).toHaveTextContent('invalid_grant');
    expect(alertBox).toHaveTextContent('The authorization grant is invalid, expired, or revoked');
    expect(alertBox.textContent).not.toContain('يمنع السحب المباشر');
    expect(screen.queryByText(AMAZON_TXT_GUIDE_TEXT)).not.toBeInTheDocument();
  });
});



