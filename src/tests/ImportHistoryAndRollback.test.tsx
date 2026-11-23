import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import {
  DEFAULT_TRADER_ID,
  importSellerCentralFile,
  parseSellerCentralWorkbookDetailed,
} from '../utils/sellerCentralExcelImporter';
import {
  buildImportErrorsCsv,
  computeImportSuccessRatio,
  getImportHistoryEntries,
  rollbackImportOperation,
} from '../utils/importHistoryService';
import { ImportHistoryPage } from '../components/ImportHistoryPage';
import { ImportErrorLog } from '../components/ImportErrorLog';
import { FetchProductsModal } from '../components/FetchProductsModal';

const {
  mockInsert,
  mockDeleteInEq,
  mockDeleteIn,
  mockDelete,
  mockUpdateEq,
  mockUpdate,
  existingProductRowsRef,
  insertedRowsRef,
  deletedIdsRef,
  restoredUpdatesRef,
} = vi.hoisted(() => {
  const existingProductRowsRef: { current: any[] } = { current: [] };
  const insertedRowsRef: { current: any[] } = { current: [] };
  const deletedIdsRef: { current: string[] } = { current: [] };
  const restoredUpdatesRef: { current: Array<{ id: string; payload: any }> } = { current: [] };

  const mockInsert = vi.fn(async (rows: any[]) => {
    const dbRows = rows.map((r, idx) => ({
      ...r,
      id:
        r.id ||
        `99999999-9999-4999-8999-${String(insertedRowsRef.current.length + idx + 1).padStart(12, '0')}`,
    }));
    insertedRowsRef.current.push(...dbRows);
    existingProductRowsRef.current = [...existingProductRowsRef.current, ...dbRows];
    return { data: dbRows, error: null };
  });

  const mockDeleteInEq = vi.fn(async (_col: string, _val: any) => ({
    data: [],
    error: null,
  }));

  const mockDeleteIn = vi.fn((_col: string, ids: string[]) => {
    deletedIdsRef.current.push(...ids);
    return {
      eq: mockDeleteInEq,
      then: (onFulfilled: any) => Promise.resolve({ data: [], error: null }).then(onFulfilled),
    };
  });

  const mockDelete = vi.fn(() => ({
    in: mockDeleteIn,
    eq: mockDeleteInEq,
  }));

  const mockUpdateEq = vi.fn(async (_col: string, _id: string) => ({
    data: [],
    error: null,
  }));

  const mockUpdate = vi.fn((payload: any) => ({
    eq: vi.fn(async (col: string, id: string) => {
      restoredUpdatesRef.current.push({ id, payload });
      return mockUpdateEq(col, id);
    }),
  }));

  return {
    mockInsert,
    mockDeleteInEq,
    mockDeleteIn,
    mockDelete,
    mockUpdateEq,
    mockUpdate,
    existingProductRowsRef,
    insertedRowsRef,
    deletedIdsRef,
    restoredUpdatesRef,
  };
});

vi.mock('../lib/supabase', () => {
  const buildChain = (tableName: string) => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn((col: string, _val: any) => {
        if (tableName === 'products' && col === 'trader_id') {
          return {
            data: existingProductRowsRef.current,
            error: null,
            order: vi.fn(() => chain),
            then: (onFulfilled: any) =>
              Promise.resolve({ data: existingProductRowsRef.current, error: null }).then(
                onFulfilled
              ),
          };
        }
        return chain;
      }),
      order: vi.fn(() => chain),
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      then: (onFulfilled: any) =>
        Promise.resolve({
          data:
            tableName === 'traders'
              ? [
                  {
                    id: DEFAULT_TRADER_ID,
                    seller_name: 'محمود سعيد',
                    seller_id: DEFAULT_TRADER_ID,
                    platform: 'amazon',
                  },
                ]
              : existingProductRowsRef.current,
          error: null,
        }).then(onFulfilled),
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((tableName: string) => buildChain(tableName)),
    },
    supabaseClient: null,
    isDemoOrOrphanProduct: vi.fn(() => false),
    recordTraderLastSyncAt: vi.fn(async () => new Date().toISOString()),
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
    },
  }),
}));

vi.mock('../db', () => ({
  auth: { currentUser: null },
  db: null,
  handleFirestoreError: vi.fn(),
  OperationType: { GET: 'get', WRITE: 'write', UPDATE: 'update', DELETE: 'delete' },
  isFirestoreQuotaExhausted: () => false,
  isFirestoreQuotaError: () => false,
  FIVE_MINUTES_MS: 300000,
  isFirestoreCacheFresh: () => false,
  markFirestoreCacheFetched: vi.fn(),
  registerFirestoreListener: vi.fn((u: any) => u),
}));

function makeMockTextFile(name: string, content: string): File {
  const bytes = new TextEncoder().encode(content);
  const file = new File([bytes], name, { type: 'text/plain;charset=utf-8' });
  (file as any).arrayBuffer = async () =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return file;
}

describe('Import History Screen & Rollback Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    existingProductRowsRef.current = [];
    insertedRowsRef.current = [];
    deletedIdsRef.current = [];
    restoredUpdatesRef.current = [];
  });

  it('records full import metadata, inserted IDs, and pre-import snapshots for updated SKUs', async () => {
    existingProductRowsRef.current = [
      {
        id: 'existing-prd-1',
        sku: 'SKU-UPD-001',
        title: 'منتج قديم للتحديث',
        price: 450,
        stock: 9,
        updated_at: '2026-10-01T10:00:00.000Z',
      },
    ];

    const txtContent = [
      'item-name\tseller-sku\tasin\tprice\tquantity',
      'منتج محدث السعر\tSKU-UPD-001\tB00UPD001\t520\t22',
      'منتج جديد مضاف\tSKU-NEW-002\tB00NEW002\t890\t14',
    ].join('\n');

    const file = makeMockTextFile('amazon-all-listings-2026-11.txt', txtContent);
    const summary = await importSellerCentralFile(file, DEFAULT_TRADER_ID, 'amazon');

    expect(summary.total).toBe(2);
    expect(summary.newCount).toBe(1);
    expect(summary.updatedCount).toBe(1);
    expect(summary.importId).toBeTruthy();

    const history = getImportHistoryEntries();
    expect(history).toHaveLength(1);
    const entry = history[0];

    expect(entry.id).toBe(summary.importId);
    expect(entry.fileName).toBe('amazon-all-listings-2026-11.txt');
    expect(entry.fileType).toBe('txt');
    expect(entry.status).toBe('completed');
    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsert.mock.calls[0][0][0]).not.toHaveProperty('id');
    expect(entry.insertedProductIds).toHaveLength(1);
    expect(entry.insertedProductIds[0]).toBe(insertedRowsRef.current[0].id);

    expect(entry.updatedSnapshots).toEqual([
      {
        id: 'existing-prd-1',
        sku: 'SKU-UPD-001',
        title: 'منتج محدث السعر',
        previousPrice: 450,
        previousStock: 9,
        previousUpdatedAt: '2026-10-01T10:00:00.000Z',
      },
    ]);

    expect(entry.itemsPreview).toHaveLength(2);
    const updatedDetail = entry.itemsPreview.find((i) => i.sku === 'SKU-UPD-001');
    expect(updatedDetail?.action).toBe('updated');
    expect(updatedDetail?.previousPrice).toBe(450);
    expect(updatedDetail?.price).toBe(520);
    expect(updatedDetail?.previousStock).toBe(9);
    expect(updatedDetail?.stock).toBe(22);
  });

  it('displays import operations in ImportHistoryPage, inspects file items, and rolls back accidental imports', async () => {
    existingProductRowsRef.current = [
      {
        id: 'existing-prd-77',
        sku: 'SKU-EXIST-77',
        title: 'مكبر صوت لاسلكي',
        price: 1200,
        stock: 5,
        updated_at: '2026-10-12T08:00:00.000Z',
      },
    ];

    const txtContent = [
      'item-name\tseller-sku\tasin\tprice\tquantity',
      'مكبر صوت لاسلكي\tSKU-EXIST-77\tB00AUDIO77\t1450\t12',
      'ساعة ذكية مستوردة بالخطأ\tSKU-ACCIDENT-88\tB00WATCH88\t2100\t30',
    ].join('\n');

    const file = makeMockTextFile('accidental-upload.txt', txtContent);
    const summary = await importSellerCentralFile(file, DEFAULT_TRADER_ID, 'amazon');
    const insertedId = insertedRowsRef.current[0].id;

    // Seed localStorage multi-tenant products mirror to verify local rollback sync
    localStorage.setItem(
      `radar_multi_tenant_products_${DEFAULT_TRADER_ID}`,
      JSON.stringify([
        {
          id: 'existing-prd-77',
          trader_id: DEFAULT_TRADER_ID,
          sku: 'SKU-EXIST-77',
          title: 'مكبر صوت لاسلكي',
          price: 1450,
          stock: 12,
        },
        {
          id: insertedId,
          trader_id: DEFAULT_TRADER_ID,
          sku: 'SKU-ACCIDENT-88',
          title: 'ساعة ذكية مستوردة بالخطأ',
          price: 2100,
          stock: 30,
        },
      ])
    );

    restoredUpdatesRef.current = [];
    const onShowToast = vi.fn();
    render(<ImportHistoryPage onShowToast={onShowToast} />);

    // Verify row rendered
    const row = screen.getByTestId(`import-history-row-${summary.importId}`);
    expect(within(row).getByText('accidental-upload.txt')).toBeInTheDocument();
    expect(within(row).getByText('مكتمل')).toBeInTheDocument();

    // Open details modal and inspect items
    fireEvent.click(within(row).getByRole('button', { name: /عرض التفاصيل/i }));
    const detailsDialog = await screen.findByRole('dialog', {
      name: /تفاصيل عملية الاستيراد accidental-upload\.txt/i,
    });
    expect(within(detailsDialog).getByText('SKU-EXIST-77')).toBeInTheDocument();
    expect(within(detailsDialog).getByText('SKU-ACCIDENT-88')).toBeInTheDocument();

    // Close details modal
    fireEvent.click(within(detailsDialog).getByRole('button', { name: 'إغلاق' }));

    // Trigger rollback confirmation modal
    fireEvent.click(within(row).getByRole('button', { name: /التراجع عن الاستيراد/i }));
    const confirmDialog = await screen.findByRole('dialog', {
      name: /تأكيد التراجع عن عملية الاستيراد/i,
    });
    expect(confirmDialog).toHaveTextContent('سيتم حذف 1 منتج جديد');
    expect(confirmDialog).toHaveTextContent('استعادة السعر والمخزون السابق لـ 1 منتج محدّث');

    // Confirm rollback
    fireEvent.click(within(confirmDialog).getByRole('button', { name: /تأكيد التراجع/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'تم التراجع عن استيراد "accidental-upload.txt"'
      );
    });

    // Verify new product was deleted and updated product's previous price/stock were restored
    expect(deletedIdsRef.current).toEqual([insertedId]);
    expect(mockDeleteInEq).toHaveBeenCalledWith('trader_id', DEFAULT_TRADER_ID);
    expect(restoredUpdatesRef.current).toEqual([
      {
        id: 'existing-prd-77',
        payload: {
          price: 1200,
          stock: 5,
          updated_at: '2026-10-12T08:00:00.000Z',
        },
      },
    ]);

    // Verify localStorage fallback mirror also rolled back
    const savedMirror = JSON.parse(
      localStorage.getItem(`radar_multi_tenant_products_${DEFAULT_TRADER_ID}`) || '[]'
    );
    expect(savedMirror).toHaveLength(1);
    expect(savedMirror[0]).toMatchObject({
      id: 'existing-prd-77',
      price: 1200,
      stock: 5,
    });

    // Verify entry marked rolled_back and button disabled to prevent double rollback
    expect(within(row).getByText('تم التراجع عنه')).toBeInTheDocument();
    const undoBtnAfter = within(row).getByRole('button', { name: /تم التراجع/i });
    expect(undoBtnAfter).toBeDisabled();

    // Direct double rollback guard check
    const secondAttempt = await rollbackImportOperation(summary.importId!);
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.deletedCount).toBe(0);
    expect(secondAttempt.restoredCount).toBe(0);
  });

  it('renders visual chart comparing successfully imported products vs data-error failures with error breakdown', async () => {
    // File 1: 3 valid products + 1 missing SKU -> 75% success / 25% failed
    const file1Txt = [
      'item-name\tseller-sku\tasin\tprice\tquantity',
      'كيبورد ميكانيكي\tSKU-OK-1\tB00OK1\t950\t10',
      'ماوس لاسلكي\tSKU-OK-2\tB00OK2\t420\t25',
      'منتج بدون رمز\t\tB00ERR1\t300\t5', // missing SKU
      'سماعة رأس احترافية\tSKU-OK-3\tB00OK3\t1350\t7',
    ].join('\n');

    await importSellerCentralFile(
      makeMockTextFile('batch-alpha.txt', file1Txt),
      DEFAULT_TRADER_ID,
      'amazon'
    );

    // File 2: 3 valid products + 1 blank line -> combined 6 valid, 2 failed => 75% success / 25% error
    const file2Txt = [
      'item-name\tseller-sku\tasin\tprice\tquantity',
      'شاشة 24 بوصة\tSKU-OK-4\tB00OK4\t5200\t4',
      '', // blank row
      'حامل لابتوب\tSKU-OK-5\tB00OK5\t380\t15',
      'كابل شحن سريع\tSKU-OK-6\tB00OK6\t190\t40',
    ].join('\n');

    await importSellerCentralFile(
      makeMockTextFile('batch-beta.txt', file2Txt),
      DEFAULT_TRADER_ID,
      'amazon'
    );

    const history = getImportHistoryEntries();
    const metrics = computeImportSuccessRatio(history);
    expect(metrics.successCount).toBe(6);
    expect(metrics.failedCount).toBe(2);
    expect(metrics.successRate).toBe(75);
    expect(metrics.failureRate).toBe(25);
    expect(metrics.breakdown.missingSku).toBe(1);
    expect(metrics.breakdown.blankOrInvalidRows).toBe(1);

    render(<ImportHistoryPage onShowToast={vi.fn()} />);

    const chartSection = screen.getByTestId('import-success-ratio-chart');
    expect(chartSection).toBeInTheDocument();
    expect(screen.getByTestId('import-success-rate-value')).toHaveTextContent('75%');
    expect(within(chartSection).getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('75%')
    );
    expect(within(chartSection).getByText(/نقص SKU: 1/)).toBeInTheDocument();
    expect(within(chartSection).getByText(/صفوف فارغة أو تالفة: 1/)).toBeInTheDocument();
    expect(within(chartSection).getByText('batch-alpha.txt')).toBeInTheDocument();
    expect(within(chartSection).getByText('batch-beta.txt')).toBeInTheDocument();

    // Clicking a bar inside the chart opens that file's details modal with its failure breakdown
    fireEvent.click(within(chartSection).getByRole('button', { name: /batch-alpha\.txt/i }));
    const detailsDialog = await screen.findByRole('dialog', {
      name: /تفاصيل عملية الاستيراد batch-alpha\.txt/i,
    });
    expect(within(detailsDialog).getByText(/أسباب الفشل: نقص SKU: 1/)).toBeInTheDocument();
    expect(within(detailsDialog).getByText(/رمز SKU مفقود/)).toBeInTheDocument();
  });

  it('displays ImportErrorLog when products fail during import and exports retry-ready CSV', async () => {
    const createObjectUrlSpy = vi.fn(() => 'blob:mock-errors-csv');
    const revokeObjectUrlSpy = vi.fn();
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = createObjectUrlSpy as any;
    URL.revokeObjectURL = revokeObjectUrlSpy as any;

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    try {
      const mixedFileTxt = [
        'item-name\tseller-sku\tasin\tprice\tquantity',
        'شاحن جداري 65 وات\tSKU-VALID-1\tB00VAL001\t799\t12',
        'كابل بيانات مفقود الكود\t\tB00MISS01\t199\t8',
        'سماعة رأس بدون كود\t\tB00MISS02\t450\t4',
      ].join('\n');

      const file = makeMockTextFile('mixed-listings.txt', mixedFileTxt);

      // 1. Render FetchProductsModal and upload mixed file -> preview shows ImportErrorLog automatically
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

      const modalInput = screen.getByTestId('modal-excel-file-input') as HTMLInputElement;
      fireEvent.change(modalInput, { target: { files: [file] } });

      const errorLog = await screen.findByTestId('import-error-log');
      expect(errorLog).toBeInTheDocument();
      expect(within(errorLog).getByText('كابل بيانات مفقود الكود')).toBeInTheDocument();
      expect(within(errorLog).getByText('B00MISS01')).toBeInTheDocument();
      expect(within(errorLog).getByText('سماعة رأس بدون كود')).toBeInTheDocument();
      expect(within(errorLog).getByText('B00MISS02')).toBeInTheDocument();

      // Export CSV directly from ImportErrorLog inside modal
      const exportBtn = within(errorLog).getByTestId('export-import-errors-csv-btn');
      expect(exportBtn).toHaveTextContent(/تصدير الأخطاء CSV لإعادة المحاولة \(2\)/);
      fireEvent.click(exportBtn);

      expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم تصدير 2 صف فاشل'));

      // 2. Confirm import and inspect ImportHistoryPage's "سجل أخطاء الاستيراد" tab
      fireEvent.click(screen.getByRole('button', { name: /تأكيد الاستيراد/i }));
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('تم قراءة 1 منتج من الملف');
      });

      render(<ImportHistoryPage onShowToast={vi.fn()} />);
      const errorsTab = screen.getByTestId('tab-import-errors-log');
      expect(errorsTab).toHaveTextContent('سجل أخطاء الاستيراد (2)');
      fireEvent.click(errorsTab);

      const historyErrorLogs = await screen.findAllByTestId('import-error-log');
      const activeHistoryErrorLog = historyErrorLogs[historyErrorLogs.length - 1];
      expect(within(activeHistoryErrorLog).getByText('كابل بيانات مفقود الكود')).toBeInTheDocument();
      expect(within(activeHistoryErrorLog).getByText('سماعة رأس بدون كود')).toBeInTheDocument();

      // Filter by search input inside ImportErrorLog
      const searchInput = within(activeHistoryErrorLog).getByPlaceholderText(
        /بحث برقم الصف أو SKU أو اسم المنتج أو السبب/
      );
      fireEvent.change(searchInput, { target: { value: 'B00MISS01' } });
      expect(within(activeHistoryErrorLog).getByText('كابل بيانات مفقود الكود')).toBeInTheDocument();
      expect(within(activeHistoryErrorLog).queryByText('سماعة رأس بدون كود')).not.toBeInTheDocument();

      // 3. Verify generated CSV has UTF-8 BOM, headers, and can be re-parsed after fixing missing SKU
      const csvOutput = buildImportErrorsCsv([
        {
          rowNumber: 3,
          sku: '',
          title: 'كابل بيانات مفقود الكود',
          asin: 'B00MISS01',
          price: 199,
          stock: 8,
          reason: 'رمز SKU مفقود',
          fileName: 'mixed-listings.txt',
          recordedAt: '2026-11-23T04:00:00.000Z',
        },
      ]);
      expect(csvOutput.startsWith('\uFEFFseller-sku,item-name,asin,price,quantity,error-reason')).toBe(true);
      const fixedCsv = csvOutput.replace('\r\n,', '\r\nFIXED-RETRY-SKU,');
      const reParsed = await parseSellerCentralWorkbookDetailed(new TextEncoder().encode(fixedCsv), {
        fileName: 'import-errors-retry.csv',
        traderId: DEFAULT_TRADER_ID,
      });
      expect(reParsed.rows).toHaveLength(1);
      expect(reParsed.rows[0].sku).toBe('FIXED-RETRY-SKU');
      expect(reParsed.rows[0].title).toBe('كابل بيانات مفقود الكود');
      expect(reParsed.rows[0].asin).toBe('B00MISS01');
      expect(reParsed.rows[0].price).toBe(199);
      expect(reParsed.rows[0].stock).toBe(8);

      // 4. Verify standalone ImportErrorLog hides cleanly when hideWhenEmpty is set and shows empty state otherwise
      const { rerender } = render(<ImportErrorLog errors={[]} hideWhenEmpty />);
      expect(screen.queryByTestId('import-error-log-empty')).not.toBeInTheDocument();
      rerender(<ImportErrorLog errors={[]} />);
      expect(screen.getByTestId('import-error-log-empty')).toBeInTheDocument();
    } finally {
      clickSpy.mockRestore();
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
    }
  });
});
