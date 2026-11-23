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
  REPORT_STILL_PROCESSING_MESSAGE,
  SP_API_SETTINGS_STORAGE_KEY,
  UNRECOGNIZED_COLUMNS_PREFIX,
  UNSUPPORTED_FILE_ERROR_MESSAGE,
  cleanHeaderKey,
  sanitizeProductPullError,
  parseSellerCentralWorkbook,
  parseSellerCentralWorkbookDetailed,
  importSellerCentralFile,
  invokeAmazonSpApiSyncEdgeFunction,
  saveAmazonSpApiSettings,
} from '../utils/sellerCentralExcelImporter';
import { FetchProductsModal } from '../components/FetchProductsModal';
import { ProductsPage } from '../components/ProductsPage';
import { TradersPage } from '../components/TradersPage';
import { AccountSettingsPage } from '../components/AccountSettingsPage';

const {
  mockInsert,
  mockUpdateEq,
  mockUpdate,
  mockFunctionsInvoke,
  existingProductRowsRef,
  insertedBatchesRef,
  updatedPayloadsRef,
} = vi.hoisted(() => {
  const existingProductRowsRef: { current: any[] } = { current: [] };
  const insertedBatchesRef: { current: any[][] } = { current: [] };
  const updatedPayloadsRef: { current: Array<{ id: string; payload: any }> } = { current: [] };

  const mockInsert = vi.fn(async (rows: any[]) => {
    insertedBatchesRef.current.push(rows);
    return { data: rows, error: null };
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
    const chain: any = {
      select: vi.fn((_fields?: string, _opts?: any) => chain),
      eq: vi.fn((col: string, _val: any) => {
        if (tableName === 'products' && col === 'trader_id') {
          return {
            data: existingProductRowsRef.current,
            error: null,
            order: vi.fn(() => chain),
            range: vi.fn(async () => ({
              data: existingProductRowsRef.current,
              error: null,
              count: existingProductRowsRef.current.length,
            })),
            then: (onFulfilled: any) =>
              Promise.resolve({ data: existingProductRowsRef.current, error: null }).then(onFulfilled),
          };
        }
        return chain;
      }),
      order: vi.fn(() => chain),
      range: vi.fn(async () => ({
        data: tableName === 'traders' ? mahmoudTraderFixture : existingProductRowsRef.current,
        error: null,
        count: tableName === 'traders' ? 1 : existingProductRowsRef.current.length,
      })),
      insert: mockInsert,
      update: mockUpdate,
      delete: vi.fn(() => chain),
      single: vi.fn(async () => ({ data: null, error: null })),
      then: (onFulfilled: any) =>
        Promise.resolve({
          data: tableName === 'traders' ? mahmoudTraderFixture : existingProductRowsRef.current,
          error: null,
          count: tableName === 'traders' ? 1 : existingProductRowsRef.current.length,
        }).then(onFulfilled),
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((tableName: string) => buildChain(tableName)),
    },
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
    existingProductRowsRef.current = [];
    insertedBatchesRef.current = [];
    updatedPayloadsRef.current = [];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
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

  it('sanitizes HTML DOCTYPE and Unexpected token "<" errors cleanly', () => {
    expect(
      sanitizeProductPullError(new SyntaxError("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"))
    ).toBe(FRIENDLY_PULL_FAILURE_MESSAGE);
    expect(sanitizeProductPullError('<!DOCTYPE html><html>404</html>')).toBe(FRIENDLY_PULL_FAILURE_MESSAGE);
    expect(sanitizeProductPullError('Failed to fetch https://sellercentral.amazon.eg')).toBe(
      FRIENDLY_PULL_FAILURE_MESSAGE
    );
    expect(FRIENDLY_PULL_FAILURE_MESSAGE).not.toContain('Unexpected token');
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

    // Populate existing Supabase rows from Upload 1 so Upload 2 sees all 103 SKUs
    existingProductRowsRef.current = insertedBatchesRef.current.flat().map((r) => ({
      id: r.id,
      sku: r.sku,
      asin: r.asin,
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

  it('shows founder/merchant separation warning and syncs via Edge Function in AccountSettingsPage', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as any;

    mockFunctionsInvoke.mockResolvedValue({
      data: {
        success: true,
        products: [
          {
            title: 'منتج من SP-API',
            sku: 'SPAPI-SKU-1',
            asin: 'B0SPAPI001',
            price: 1999,
            stock: 15,
            image_url: 'https://img.ex/sp.jpg',
            product_url: 'https://www.amazon.eg/dp/B0SPAPI001',
          },
        ],
      },
      error: null,
    });

    const onShowToast = vi.fn();
    render(<AccountSettingsPage onShowToast={onShowToast} />);

    expect(screen.getByTestId('founder-amazon-warning')).toHaveTextContent(FOUNDER_AMAZON_WARNING_TEXT);

    fireEvent.change(screen.getByLabelText('Refresh Token'), {
      target: { value: 'Atzr|TestRefreshToken123' },
    });
    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: 'amzn1.application-oa2-client.test' },
    });
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: 'secret-xyz' },
    });
    fireEvent.change(screen.getByLabelText('Seller ID'), {
      target: { value: 'A37JIM7LHQI6IM' },
    });

    fireEvent.click(screen.getByRole('button', { name: /حفظ إعدادات SP-API/i }));
    expect(localStorage.getItem(SP_API_SETTINGS_STORAGE_KEY)).toContain('Atzr|TestRefreshToken123');

    fireEvent.click(screen.getByRole('button', { name: /سحب عبر SP-API/i }));

    await waitFor(() => {
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('amazon-sp-api-sync', {
        body: expect.objectContaining({
          refreshToken: 'Atzr|TestRefreshToken123',
          clientId: 'amzn1.application-oa2-client.test',
          clientSecret: 'secret-xyz',
          sellerId: 'A37JIM7LHQI6IM',
          traderId: 'A37JIM7LHQI6IM',
        }),
      });
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(
        'تم قراءة 1 منتج من الملف - جديد 1 - محدّث 0 - متخطى 0'
      );
    });

    saveAmazonSpApiSettings({
      refreshToken: 'r',
      clientId: 'c',
      clientSecret: 's',
      sellerId: 'A37JIM7LHQI6IM',
    });
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: null,
      error: new Error("Unexpected token '<', \"<!DOCTYPE html>\" is not valid JSON"),
    });
    const failedOutcome = await invokeAmazonSpApiSyncEdgeFunction('A37JIM7LHQI6IM');
    expect(failedOutcome.success).toBe(false);
    expect(failedOutcome.message).toBe(FRIENDLY_PULL_FAILURE_MESSAGE);
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
    const utf16File = new File([utf16LeBytes], 'All+Listings+Report.txt', { type: 'text/plain' });
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
    expect(banner).toHaveTextContent(/تم قراءة 103 منتج - مثال: أول منتج: \[EG-SKU-1\] - \[منتج B09EG0001\] - \[251 ج\.م\]/);

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
});
