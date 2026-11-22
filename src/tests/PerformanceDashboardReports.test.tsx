import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PerformanceDashboard } from '../components/PerformanceDashboard';

const {
  productsRef,
  invoicesRef,
  productsErrorRef,
  invoicesErrorRef,
} = vi.hoisted(() => ({
  productsRef: { current: [] as any[] },
  invoicesRef: { current: [] as any[] },
  productsErrorRef: { current: null as any },
  invoicesErrorRef: { current: null as any },
}));

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', isAnonymous: false },
    profile: { uid: 'founder-uid-1', email: 'jassmeinnour@gmail.com', displayName: 'ياسمين نور' },
    isOwner: true,
    isFounderMode: true,
  }),
}));

vi.mock('../components/MarketTrendsAnalysis', () => ({
  MarketTrendsAnalysis: () => <div data-testid="market-trends-mock" />,
}));

vi.mock('../lib/supabase', () => {
  const formatSupabaseError = (err: any) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    return [err.message, err.details].filter(Boolean).join(' — ') || 'Supabase Error';
  };

  return {
    supabase: {
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          const promise =
            table === 'products'
              ? Promise.resolve({
                  data: productsErrorRef.current ? null : productsRef.current,
                  error: productsErrorRef.current,
                })
              : table === 'invoices'
              ? Promise.resolve({
                  data: invoicesErrorRef.current ? null : invoicesRef.current,
                  error: invoicesErrorRef.current,
                })
              : Promise.resolve({ data: [], error: null });
          return promise;
        }),
      })),
    },
    formatSupabaseError,
    isDemoOrOrphanProduct: (p: any) => !p || !p.trader_id || p.sku === 'OFFICE-CHAIR-BLK-01',
  };
});

describe('PerformanceDashboard (/reports) — Real Supabase Calculations', () => {
  beforeEach(() => {
    productsRef.current = [];
    invoicesRef.current = [];
    productsErrorRef.current = null;
    invoicesErrorRef.current = null;
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays 0 in all KPI cards, "-" for Buy Box, and empty chart message when Supabase has no products or invoices', async () => {
    const { container } = render(<PerformanceDashboard currency="ج.م" />);

    await waitFor(() => {
      expect(screen.getByTestId('reports-chart-empty')).toBeInTheDocument();
    });

    expect(screen.getByTestId('reports-kpi-sales')).toHaveTextContent('0 ج.م');
    expect(screen.getByTestId('reports-kpi-profit')).toHaveTextContent('0 ج.م');
    expect(screen.getByTestId('reports-kpi-orders')).toHaveTextContent('0 طلب');
    expect(screen.getByTestId('reports-kpi-buybox')).toHaveTextContent('-');

    expect(screen.getByTestId('reports-chart-empty')).toHaveTextContent('لا توجد بيانات بعد');
    expect(screen.getByTestId('reports-chart-empty')).toHaveTextContent(
      'لا توجد مبيعات بعد - أضف منتجات وابدأ البيع'
    );

    const text = container.textContent || '';
    expect(text).not.toContain('747,869');
    expect(text).not.toContain('747869');
    expect(text).not.toContain('169,784');
    expect(text).not.toContain('1,558');
    expect(text).not.toContain('87%');
  });

  it('computes 100 total sales when 1 product with price 100 is added in Supabase', async () => {
    productsRef.current = [
      {
        id: 'prod-1',
        trader_id: 'trd-mahmoud-uuid-001',
        title: 'منتج اختبار',
        sku: 'REAL-SKU-100',
        price: 100,
        cost_price: 60,
        stock: 5,
      },
    ];
    invoicesRef.current = [];

    render(<PerformanceDashboard currency="ج.م" />);

    await waitFor(() => {
      expect(screen.getByTestId('reports-kpi-sales')).toHaveTextContent('100 ج.م');
    });

    expect(screen.getByTestId('reports-kpi-profit')).toHaveTextContent('40 ج.م');
    expect(screen.getByTestId('reports-kpi-orders')).toHaveTextContent('0 طلب');
    expect(screen.getByTestId('reports-kpi-buybox')).toHaveTextContent('-');
    expect(screen.getByTestId('reports-chart-empty')).toBeInTheDocument();
  });

  it('plots Recharts area chart from real chronologically sorted invoices in Supabase', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    productsRef.current = [];
    invoicesRef.current = [
      {
        id: 'inv-2',
        trader_id: 'trd-mahmoud-uuid-001',
        total_amount: 350,
        net_profit: 90,
        created_at: today.toISOString(),
      },
      {
        id: 'inv-1',
        trader_id: 'trd-mahmoud-uuid-001',
        total_amount: 150,
        net_profit: 40,
        created_at: yesterday.toISOString(),
      },
    ];

    render(<PerformanceDashboard currency="ج.م" />);

    await waitFor(() => {
      expect(screen.getByTestId('reports-invoices-chart')).toBeInTheDocument();
    });

    expect(screen.getByTestId('reports-kpi-sales')).toHaveTextContent('500 ج.م');
    expect(screen.getByTestId('reports-kpi-profit')).toHaveTextContent('130 ج.م');
    expect(screen.getByTestId('reports-kpi-orders')).toHaveTextContent('2 طلب');
    expect(screen.queryByTestId('reports-chart-empty')).not.toBeInTheDocument();
  });

  it('displays real Supabase error message if querying reports tables fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    productsErrorRef.current = {
      code: '42501',
      message: 'permission denied for table products',
    };

    render(<PerformanceDashboard currency="ج.م" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('permission denied for table products');
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
