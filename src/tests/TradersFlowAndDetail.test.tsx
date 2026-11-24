import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardHome from '../components/DashboardHome';
import { TradersPage } from '../components/TradersPage';
import { TraderDetailPage } from '../components/TraderDetailPage';
import { IMPORT_BUTTON_LABEL } from '../utils/sellerCentralExcelImporter';
import { dataCache } from '../utils/dataCache';

const {
  tradersListRef,
  tradersErrorRef,
  detailTraderRef,
  detailProductsRef,
  detailInvoicesRef,
  selectColumnsLog,
  navigateMock,
  insertedTradersPayloadsRef,
} = vi.hoisted(() => ({
  tradersListRef: { current: [] as any[] },
  tradersErrorRef: { current: null as any },
  detailTraderRef: { current: null as any },
  detailProductsRef: { current: [] as any[] },
  detailInvoicesRef: { current: [] as any[] },
  insertedTradersPayloadsRef: { current: [] as any[] },
  selectColumnsLog: [] as Array<{ table: string; columns: string }>,
  navigateMock: vi.fn((url: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
    }
  }),
}));

vi.mock('../utils/navigation', async () => {
  const actual = await vi.importActual<typeof import('../utils/navigation')>('../utils/navigation');
  return {
    ...actual,
    navigate: navigateMock,
  };
});

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', isAnonymous: false },
    profile: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', displayName: 'ياسمين نور' },
    isOwner: true,
    isFounderMode: true,
    toggleFounderMode: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('../components/SmartPriceAlertsPanel', () => ({
  SmartPriceAlertsPanel: () => <div />,
}));

vi.mock('../components/MaintenanceModeControl', () => ({
  MaintenanceModeToggleCard: () => <div />,
}));

vi.mock('../components/SponsoredAdsSection', () => ({
  SponsoredAdsSection: () => <div />,
}));

vi.mock('../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/supabase')>();
  const formatSupabaseError = (err: any) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    return [err.message, err.details].filter(Boolean).join(' — ') || 'Supabase Error';
  };

  const makeBuilder = (table: string) => {
    let isSingle = false;
    const eqFilters: Array<{ col: string; val: any }> = [];

    const builder: any = {
      select: (columns = '*') => {
        selectColumnsLog.push({ table, columns });
        return builder;
      },
      eq: (col: string, val: any) => {
        eqFilters.push({ col, val });
        return builder;
      },
      order: () => builder,
      range: () => builder,
      limit: () => builder,
      single: () => {
        isSingle = true;
        return builder;
      },
      insert: (rows: any[]) => {
        insertedTradersPayloadsRef.current.push(...rows);
        for (const row of rows) {
          if ('gmail' in row) {
            const err = { message: "Could not find the 'gmail' column of 'traders'" };
            return {
              select: () => Promise.resolve({ data: null, error: err }),
              then: (onfulfilled: any, onrejected?: any) =>
                Promise.resolve({ data: null, error: err }).then(onfulfilled, onrejected),
            };
          }
        }
        const created = rows.map((r, i) => ({
          id: `trd-new-${Date.now()}-${i}`,
          created_at: new Date().toISOString(),
          ...r,
        }));
        tradersListRef.current.push(...created);
        return {
          select: () => Promise.resolve({ data: created, error: null }),
          then: (onfulfilled: any, onrejected?: any) =>
            Promise.resolve({ data: created, error: null }).then(onfulfilled, onrejected),
        };
      },
      then: (onfulfilled: any, onrejected?: any) => {
        if (table === 'traders') {
          if (tradersErrorRef.current) {
            return Promise.resolve({ data: null, error: tradersErrorRef.current }).then(
              onfulfilled,
              onrejected
            );
          }
          if (isSingle) {
            const idFilter = eqFilters.find((f) => f.col === 'id')?.val;
            const found =
              detailTraderRef.current ||
              tradersListRef.current.find((t) => String(t.id) === String(idFilter)) ||
              null;
            return Promise.resolve({ data: found, error: null }).then(onfulfilled, onrejected);
          }
          return Promise.resolve({ data: tradersListRef.current, error: null }).then(
            onfulfilled,
            onrejected
          );
        }
        if (table === 'products') {
          return Promise.resolve({ data: detailProductsRef.current, error: null }).then(
            onfulfilled,
            onrejected
          );
        }
        if (table === 'invoices') {
          return Promise.resolve({ data: detailInvoicesRef.current, error: null }).then(
            onfulfilled,
            onrejected
          );
        }
        return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected);
      },
    };
    return builder;
  };

  return {
    ...actual,
    supabase: {
      from: (table: string) => makeBuilder(table),
    },
    supabaseClient: {
      auth: {
        getSession: vi.fn(async () => ({
          data: {
            session: {
              access_token: 'test-token',
              user: { email: 'jassmeinnour@gmail.com' },
            },
          },
          error: null,
        })),
      },
    },
    isSupabaseConfigured: true,
    setSupabaseSession: vi.fn(),
    formatSupabaseError,
    getTraderLastSyncAt: () => null,
    isDemoOrOrphanProduct: () => false,
  };
});

const mahmoudTrader = {
  id: 'trd-mahmoud-001',
  user_id: 'founder-uid-1',
  seller_name: 'محمود سعيد',
  email: 'mahmeudsaid4@gmail.com',
  gmail: 'mahmeudsaid4@gmail.com',
  seller_id: 'A37JIM7LHQI6IM',
  phone: '+20 100 123 4567',
  platform: 'amazon',
  status: 'active',
  store_url: 'https://www.amazon.eg/sp?seller=A37JIM7LHQI6IM',
  destination_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
};

describe('Problem 5 — Clickable Trader Cards, /traders Page & /traders/{id} Detail View', () => {
  beforeEach(() => {
    dataCache.invalidate();
    tradersListRef.current = [mahmoudTrader];
    tradersErrorRef.current = null;
    detailTraderRef.current = null;
    detailProductsRef.current = [];
    detailInvoicesRef.current = [];
    selectColumnsLog.length = 0;
    insertedTradersPayloadsRef.current = [];
    navigateMock.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('DashboardHome renders Mahmoud Saeed inside a clickable <button> card that navigates to /traders/{id}', async () => {
    render(<DashboardHome onShowToast={vi.fn()} />);

    const cardBtn = await screen.findByTestId('home-trader-card-trd-mahmoud-001');
    expect(cardBtn.tagName.toLowerCase()).toBe('button');
    expect(cardBtn).toHaveTextContent('محمود سعيد');

    fireEvent.click(cardBtn);
    expect(navigateMock).toHaveBeenCalledWith('/traders/trd-mahmoud-001');
  });

  it('TradersPage queries supabase.from("traders").select("*") and renders Mahmoud Saeed (never "فشل الاتصال")', async () => {
    render(<TradersPage onShowToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('محمود سعيد')).toBeInTheDocument();
    });

    expect(selectColumnsLog.some((c) => c.table === 'traders' && c.columns === '*')).toBe(true);
    expect(screen.queryByText(/فشل الاتصال/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /عرض ملف التاجر/ }));
    expect(navigateMock).toHaveBeenCalledWith('/traders/trd-mahmoud-001');
  });

  it('TradersPage shows real Supabase error message in console & UI instead of bare "فشل الاتصال"', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    tradersListRef.current = [];
    tradersErrorRef.current = {
      code: '42501',
      message: 'permission denied for relation traders',
    };

    render(<TradersPage onShowToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText(/permission denied for relation traders/).length).toBeGreaterThan(0);
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it('TradersPage renders attractive empty state with feature icons and "ابدأ بإضافة أول تاجر" button that opens the add-trader modal', async () => {
    tradersListRef.current = [];
    tradersErrorRef.current = null;

    render(<TradersPage onShowToast={vi.fn()} />);

    const emptySection = await screen.findByTestId('traders-empty-state');
    expect(emptySection).toBeInTheDocument();
    expect(screen.getByTestId('traders-empty-icon')).toBeInTheDocument();
    expect(screen.getByTestId('traders-empty-features')).toBeInTheDocument();
    expect(screen.getByText('ربط واستيراد المنتجات')).toBeInTheDocument();
    expect(screen.getByText('مراقبة الأسعار والمنافسين')).toBeInTheDocument();
    expect(screen.getByText('تقارير المبيعات والأرباح')).toBeInTheDocument();
    expect(screen.queryByText('لا يوجد تجار - أضف تاجر جديد')).not.toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: 'ابدأ بإضافة أول تاجر' });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('إضافة سجل تاجر جديد')).toBeInTheDocument();
  });

  it('TraderDetailPage (/traders/{id}) displays name, email, Seller ID, phone, store link, products count, sales total, edit button, and Amazon TXT import button', async () => {
    detailTraderRef.current = mahmoudTrader;
    detailProductsRef.current = [
      {
        id: 'p1',
        trader_id: 'trd-mahmoud-001',
        title: 'منتج أمازون 1',
        sku: 'AMZ-1',
        price: 250,
        sold_quantity: 2,
        stock: 10,
        platform: 'amazon',
      },
    ];
    detailInvoicesRef.current = [
      {
        id: 'inv-1',
        trader_id: 'trd-mahmoud-001',
        total_amount: 500,
      },
    ];

    render(<TraderDetailPage traderId="trd-mahmoud-001" onShowToast={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'محمود سعيد' })).toBeInTheDocument();
    });

    expect(screen.getByText('mahmeudsaid4@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('A37JIM7LHQI6IM')).toBeInTheDocument();
    expect(screen.getByText('+20 100 123 4567')).toBeInTheDocument();
    expect(screen.getByText('https://www.amazon.eg/sp?seller=A37JIM7LHQI6IM')).toBeInTheDocument();

    expect(screen.getByTestId('trader-detail-products-count')).toHaveTextContent('1');
    expect(screen.getByTestId('trader-detail-total-sales')).toHaveTextContent('1,000 ج.م');

    expect(screen.getByRole('button', { name: /تعديل بيانات التاجر/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(IMPORT_BUTTON_LABEL.replace(/[()]/g, '\\$&')) })).toBeInTheDocument();
  });

  it('saves new trader (Mahmoud Saeed) sending ONLY whitelisted columns without gmail, name, seller, trader_name, id, created_at, or updated_at', async () => {
    tradersListRef.current = [];
    const onShowToast = vi.fn();
    render(<TradersPage onShowToast={onShowToast} />);

    const openAddBtn = await screen.findByRole('button', { name: 'ابدأ بإضافة أول تاجر' });
    fireEvent.click(openAddBtn);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('مثال: محمود سعيد');
    const emailInput = screen.getByPlaceholderText('mahmeudsaid4@gmail.com');
    const sellerIdInput = screen.getByPlaceholderText('A37JIM7LHQI6IM');
    const phoneInput = screen.getByPlaceholderText('+20 100 123 4567');

    fireEvent.change(nameInput, { target: { value: 'محمود سعيد' } });
    fireEvent.change(emailInput, { target: { value: 'mahmeudsaid4@gmail.com' } });
    fireEvent.change(sellerIdInput, { target: { value: 'A37JIM7LHQI6IM' } });
    fireEvent.change(phoneInput, { target: { value: '+201012345678' } });

    const dialogEl = await screen.findByRole('dialog');
    const formEl = dialogEl.querySelector('form')!;
    fireEvent.submit(formEl);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم حفظ سجل التاجر بنجاح'));
    });

    expect(insertedTradersPayloadsRef.current.length).toBeGreaterThan(0);
    const sentPayload = insertedTradersPayloadsRef.current[0];

    const ALLOWED = new Set([
      'seller_name',
      'email',
      'phone',
      'seller_id',
      'platform',
      'destination_url',
      'store_url',
      'refresh_token',
    ]);

    for (const key of Object.keys(sentPayload)) {
      expect(ALLOWED.has(key)).toBe(true);
    }

    // Must NOT contain gmail, name, seller, trader_name, id, created_at, updated_at
    expect(sentPayload).not.toHaveProperty('gmail');
    expect(sentPayload).not.toHaveProperty('name');
    expect(sentPayload).not.toHaveProperty('seller');
    expect(sentPayload).not.toHaveProperty('trader_name');
    expect(sentPayload).not.toHaveProperty('id');
    expect(sentPayload).not.toHaveProperty('created_at');
    expect(sentPayload).not.toHaveProperty('updated_at');

    expect(sentPayload.seller_name).toBe('محمود سعيد');
    expect(sentPayload.email).toBe('mahmeudsaid4@gmail.com');
    expect(sentPayload.seller_id).toBe('A37JIM7LHQI6IM');
  });

  it('TradersPage TraderCard and TraderDetailPage render editable/clearable authorize URL with the new /ap/oa format and Edit/Clear buttons', async () => {
    const expectedUrl = `https://www.amazon.com/ap/oa?client_id=amzn1.application-oa2-client.2815cbc0c68e46c78ea15893462ef5d1&scope=profile&response_type=code&redirect_uri=https://radaregypt.store/auth/amazon-callback&state=${encodeURIComponent(
      'محمود سعيد_A37JIM7LHQI6IM'
    )}`;

    render(<TradersPage onShowToast={vi.fn()} />);

    const cardInput = (await screen.findByTestId(
      'trader-card-authorize-url-trd-mahmoud-001'
    )) as HTMLInputElement;
    expect(cardInput.value).toBe(expectedUrl);
    expect(cardInput.value).not.toContain('sellercentral.amazon.eg/apps/authorize');
    expect(cardInput.readOnly).toBe(false);

    const editBtn = screen.getByTestId('trader-card-edit-authorize-url-trd-mahmoud-001');
    const clearBtn = screen.getByTestId('trader-card-clear-authorize-url-trd-mahmoud-001');
    expect(editBtn).toHaveTextContent('تعديل');
    expect(clearBtn).toHaveTextContent('مسح');

    // Clear button empties the input
    fireEvent.click(clearBtn);
    expect(cardInput.value).toBe('');

    // Edit/typing updates the input
    fireEvent.click(editBtn);
    fireEvent.change(cardInput, { target: { value: 'https://custom-auth.example.com' } });
    expect(cardInput.value).toBe('https://custom-auth.example.com');

    // TraderDetailPage also shows the new URL and supports Edit & Clear
    detailTraderRef.current = mahmoudTrader;
    render(<TraderDetailPage traderId="trd-mahmoud-001" onShowToast={vi.fn()} />);

    const detailInput = (await screen.findByTestId(
      'trader-detail-authorize-url-input'
    )) as HTMLInputElement;
    await waitFor(() => {
      expect(detailInput.value).toBe(expectedUrl);
    });
    expect(detailInput.readOnly).toBe(false);

    fireEvent.click(screen.getByTestId('trader-detail-clear-authorize-url'));
    expect(detailInput.value).toBe('');

    fireEvent.change(detailInput, { target: { value: expectedUrl } });
    expect(detailInput.value).toBe(expectedUrl);
  });
});
