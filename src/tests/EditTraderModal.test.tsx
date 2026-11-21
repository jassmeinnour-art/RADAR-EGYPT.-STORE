import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditTraderModal } from '../components/EditTraderModal';
import { TradersPage } from '../components/TradersPage';
import { Trader } from '../lib/supabase';

const mockUpdateCalls: Array<{
  table: string;
  payload: Record<string, any>;
  filters: Array<{ col: string; val: any }>;
}> = [];

let nextUpdateResult: { data: any; error: any } = { data: null, error: null };
let initialTradersRows: Trader[] = [];

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  FOUNDER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', isAnonymous: false },
    profile: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', displayName: 'ياسمين نور' },
    isOwner: true,
    isFounderMode: true,
  }),
}));

vi.mock('../lib/supabase', () => {
  const formatSupabaseError = (err: any): string => {
    if (!err) return 'حدث خطأ غير معروف';
    if (typeof err === 'string') return err;
    const msg = String(err.message || err.error || '').trim();
    const details = String(err.details || '').trim();
    const code = String(err.code || '').trim();
    const lower = `${msg} ${details}`.toLowerCase();
    const isDupEmail =
      (code === '23505' || lower.includes('duplicate key')) &&
      (lower.includes('email') || lower.includes('gmail') || lower.includes('موجود لتاجر آخر'));
    const raw = [msg, details].filter(Boolean).join(' — ');
    if (isDupEmail && !raw.includes('هذا الإيميل موجود لتاجر آخر')) {
      return `هذا الإيميل موجود لتاجر آخر (${raw})`;
    }
    return raw || 'Supabase Error';
  };

  const makeBuilder = (table: string) => {
    let updatePayload: Record<string, any> | null = null;
    const filters: Array<{ col: string; val: any }> = [];

    const builder: any = {
      select: () => builder,
      order: () => builder,
      range: () => builder,
      limit: () => builder,
      single: () => builder,
      update: (payload: Record<string, any>) => {
        updatePayload = payload;
        return builder;
      },
      eq: (col: string, val: any) => {
        filters.push({ col, val });
        return builder;
      },
      neq: () => builder,
      then: (onfulfilled: any, onrejected?: any) => {
        if (updatePayload !== null) {
          mockUpdateCalls.push({ table, payload: updatePayload, filters: [...filters] });
          return Promise.resolve(nextUpdateResult).then(onfulfilled, onrejected);
        }
        return Promise.resolve({
          data: table === 'traders' ? initialTradersRows : [],
          error: null,
        }).then(onfulfilled, onrejected);
      },
    };
    return builder;
  };

  return {
    supabase: {
      from: (table: string) => makeBuilder(table),
    },
    formatSupabaseError,
    getTraderLastSyncAt: () => null,
  };
});

const mahmoudTrader: Trader = {
  id: 'trd-mahmoud-uuid-001',
  user_id: 'founder-uid-1',
  seller_name: 'محمود سعيد',
  email: 'mahmeudsaid4@gmail.com',
  gmail: 'mahmeudsaid4@gmail.com',
  phone: '+20 100 000 0000',
  platform: 'amazon',
  status: 'active',
  seller_id: 'A37JIM7LHQI6IM',
  destination_url: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
  seller_link: 'https://www.amazon.eg/s?me=A37JIM7LHQI6IM',
  store_url: 'https://www.amazon.eg/sp?seller=A37JIM7LHQI6IM',
  storefront_link: 'https://www.amazon.eg/sp?seller=A37JIM7LHQI6IM',
};

const secondTrader: Trader = {
  id: 'trd-ahmed-uuid-002',
  user_id: 'founder-uid-1',
  seller_name: 'أحمد حسن',
  email: 'ahmed.hassan@example.com',
  gmail: 'ahmed.hassan@example.com',
  phone: '+20 101 111 2222',
  platform: 'noon',
  status: 'active',
  seller_id: 'NOON-9988',
};

describe('EditTraderModal & TradersPage Edit Flow', () => {
  beforeEach(() => {
    mockUpdateCalls.length = 0;
    nextUpdateResult = { data: null, error: null };
    initialTradersRows = [mahmoudTrader, secondTrader];
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('edits محمود سعيد name and phone number, omits id from payload, uses eq("id", trader.id), and closes with success message', async () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    nextUpdateResult = {
      data: {
        ...mahmoudTrader,
        seller_name: 'محمود سعيد المعدل',
        phone: '+20 109 876 5432',
      },
      error: null,
    };

    render(
      <EditTraderModal
        trader={mahmoudTrader}
        existingTraders={[mahmoudTrader, secondTrader]}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    const nameInput = screen.getByLabelText(/اسم التاجر/);
    const phoneInput = screen.getByLabelText(/رقم هاتف التاجر/);

    fireEvent.change(nameInput, { target: { value: 'محمود سعيد المعدل' } });
    fireEvent.change(phoneInput, { target: { value: '+20 109 876 5432' } });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(mockUpdateCalls).toHaveLength(1);
    });

    const call = mockUpdateCalls[0];
    expect(call.table).toBe('traders');
    expect(call.filters).toEqual([{ col: 'id', val: 'trd-mahmoud-uuid-001' }]);
    expect(call.filters.some((f) => f.col === 'seller_id')).toBe(false);
    expect(call.payload).not.toHaveProperty('id');
    expect(call.payload.seller_name).toBe('محمود سعيد المعدل');
    expect(call.payload.phone).toBe('+20 109 876 5432');

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'trd-mahmoud-uuid-001',
        seller_name: 'محمود سعيد المعدل',
        phone: '+20 109 876 5432',
      })
    );
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم تعديل بيانات التاجر بنجاح'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('edits Seller ID to A37JIM7LHQI6IM and saves successfully', async () => {
    const traderWithoutSellerId: Trader = {
      ...mahmoudTrader,
      seller_id: '',
    };
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    nextUpdateResult = {
      data: { ...traderWithoutSellerId, seller_id: 'A37JIM7LHQI6IM' },
      error: null,
    };

    render(
      <EditTraderModal
        trader={traderWithoutSellerId}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    const sellerIdInput = screen.getByLabelText(/رمز التاجر التعريفي/);
    fireEvent.change(sellerIdInput, { target: { value: 'A37JIM7LHQI6IM' } });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(mockUpdateCalls).toHaveLength(1);
    });

    expect(mockUpdateCalls[0].payload.seller_id).toBe('A37JIM7LHQI6IM');
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ seller_id: 'A37JIM7LHQI6IM' }));
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم تعديل بيانات التاجر بنجاح'));
    expect(onClose).toHaveBeenCalled();
  });

  it('allows saving when Email, Seller ID, Phone, and URLs are all left blank (only seller_name is required)', async () => {
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    nextUpdateResult = {
      data: {
        ...mahmoudTrader,
        email: null,
        gmail: null,
        seller_id: null,
        phone: null,
        destination_url: null,
        store_url: null,
      },
      error: null,
    };

    render(
      <EditTraderModal
        trader={mahmoudTrader}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    fireEvent.change(screen.getByLabelText(/إيميل التاجر/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/رمز التاجر التعريفي/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/رقم هاتف التاجر/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/رابط الوجهة/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/رابط المتجر/), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(mockUpdateCalls).toHaveLength(1);
    });

    expect(mockUpdateCalls[0].payload).toMatchObject({
      seller_name: 'محمود سعيد',
      email: null,
      gmail: null,
      seller_id: null,
      phone: null,
      destination_url: null,
      store_url: null,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects saving only when seller_name is empty', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    render(
      <EditTraderModal
        trader={mahmoudTrader}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    fireEvent.change(screen.getByLabelText(/اسم التاجر/), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('اسم التاجر (seller_name) مطلوب');
    });

    expect(mockUpdateCalls).toHaveLength(0);
    expect(errorSpy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows "هذا الإيميل موجود لتاجر آخر" when email duplicates a different trader, while allowing the same trader to keep its email', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    render(
      <EditTraderModal
        trader={mahmoudTrader}
        existingTraders={[mahmoudTrader, secondTrader]}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    // Try setting Mahmoud's email to Ahmed's email
    fireEvent.change(screen.getByLabelText(/إيميل التاجر/), {
      target: { value: 'ahmed.hassan@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('هذا الإيميل موجود لتاجر آخر');
    });
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('هذا الإيميل موجود لتاجر آخر'));
    expect(errorSpy).toHaveBeenCalled();
    expect(mockUpdateCalls).toHaveLength(0);

    // Restore Mahmoud's own email and save -> must succeed!
    nextUpdateResult = { data: mahmoudTrader, error: null };
    fireEvent.change(screen.getByLabelText(/إيميل التاجر/), {
      target: { value: 'mahmeudsaid4@gmail.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(mockUpdateCalls).toHaveLength(1);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('logs full Supabase error to console and displays real RLS error message instead of vague failure text', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpdate = vi.fn();
    const onClose = vi.fn();
    const onShowToast = vi.fn();

    const rlsError = {
      code: '42501',
      message: 'new row violates row-level security policy for table "traders"',
      details: 'Policy "founder can update traders" rejected row',
    };
    nextUpdateResult = { data: null, error: rlsError };

    render(
      <EditTraderModal
        trader={mahmoudTrader}
        existingTraders={[mahmoudTrader]}
        isOpen={true}
        onClose={onClose}
        onUpdate={onUpdate}
        onShowToast={onShowToast}
      />
    );

    fireEvent.change(screen.getByLabelText(/اسم التاجر/), { target: { value: 'محمود الجديد' } });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'new row violates row-level security policy for table "traders"'
      );
    });

    expect(errorSpy).toHaveBeenCalledWith(rlsError);
    expect(onShowToast).toHaveBeenCalledWith(
      expect.stringContaining('new row violates row-level security policy for table "traders"')
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates TradersPage list immediately after editing without page reload', async () => {
    const onShowToast = vi.fn();
    nextUpdateResult = {
      data: {
        ...mahmoudTrader,
        seller_name: 'محمود سعيد — محدث',
        phone: '+20 155 555 5555',
      },
      error: null,
    };

    render(<TradersPage onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(screen.getByText('محمود سعيد')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /تعديل بيانات التاجر/ });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText(/اسم التاجر/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/اسم التاجر/), { target: { value: 'محمود سعيد — محدث' } });
    fireEvent.change(screen.getByLabelText(/رقم هاتف التاجر/), { target: { value: '+20 155 555 5555' } });
    fireEvent.click(screen.getByRole('button', { name: /حفظ التعديلات/ }));

    await waitFor(() => {
      expect(screen.getByText('محمود سعيد — محدث')).toBeInTheDocument();
      expect(screen.getByText('+20 155 555 5555')).toBeInTheDocument();
    });

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم تعديل بيانات التاجر بنجاح'));
  });
});
