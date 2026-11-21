import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PriceComparisonEngine, { buildMonthlyPriceTrendSeries } from '../components/PriceComparisonEngine';
import { INITIAL_AUTO_PRICING_PRODUCTS } from '../data/autoPricingEngineData';

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
      <div data-testid="recharts-responsive-wrapper" style={{ width: 800, height: 300 }}>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, { width: 800, height: 300 })
          : children}
      </div>
    ),
  };
});

describe('PriceComparisonEngine interactive Recharts monthly trend chart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds a 30-day deterministic series anchored to live prices and saved history overrides', () => {
    const refDate = new Date('2026-11-21T12:00:00Z');
    const savedHistory = {
      'rec-1': {
        key: 'rec-1',
        traderId: 't1',
        productId: 'prod-001',
        sku: 'EAR-PRO-01',
        title: 'سماعات',
        platform: 'noon_eg',
        lastPrice: 550,
        minHistoricalPrice: 510,
        maxHistoricalPrice: 590,
        updatedAt: '2026-11-20T10:00:00Z',
        history: [{ price: 525, recordedAt: '2026-11-19T09:00:00Z' }],
      },
    };

    const series30 = buildMonthlyPriceTrendSeries(
      {
        id: 'prod-001',
        sku: 'EAR-PRO-01',
        merchantPrice: 550,
        competitorPrice: 500,
        costPrice: 320,
      },
      30,
      savedHistory,
      refDate
    );

    expect(series30).toHaveLength(30);
    const lastPoint = series30[series30.length - 1];
    expect(lastPoint.dateKey).toBe('2026-11-21');
    expect(lastPoint.merchantPrice).toBe(550);
    expect(lastPoint.competitorPrice).toBe(500);
    expect(lastPoint.priceGap).toBe(50);

    const overridePoint = series30.find((p) => p.dateKey === '2026-11-19');
    expect(overridePoint?.merchantPrice).toBe(525);

    const series7 = buildMonthlyPriceTrendSeries(
      {
        id: 'prod-001',
        sku: 'EAR-PRO-01',
        merchantPrice: 550,
        competitorPrice: 500,
        costPrice: 320,
      },
      7,
      savedHistory,
      refDate
    );
    expect(series7).toHaveLength(7);
  });

  it('renders the Recharts monthly trend chart and switches product on dropdown or table row click', () => {
    render(<PriceComparisonEngine />);

    const chartRegion = screen.getByRole('region', {
      name: 'مخطط اتجاهات تغير السعر خلال الشهر الماضي',
    });
    expect(chartRegion).toBeTruthy();
    expect(screen.getByTestId('recharts-responsive-wrapper')).toBeTruthy();
    expect(chartRegion.querySelector('.recharts-wrapper')).toBeTruthy();

    const first = INITIAL_AUTO_PRICING_PRODUCTS[0];
    const second = INITIAL_AUTO_PRICING_PRODUCTS[1];

    const selector = screen.getByLabelText('اختر المنتج لعرض اتجاه السعر') as HTMLSelectElement;
    expect(selector.value).toBe(first.sku);

    // Switch via table row click
    fireEvent.click(screen.getByText(second.title));
    expect(selector.value).toBe(second.sku);
    expect(chartRegion.textContent).toContain(`SKU: ${second.sku}`);

    // Switch back via dropdown
    fireEvent.change(selector, { target: { value: first.sku } });
    expect(selector.value).toBe(first.sku);
    expect(chartRegion.textContent).toContain(`SKU: ${first.sku}`);
  });

  it('supports interactive timeframe buttons and series visibility toggles', () => {
    render(<PriceComparisonEngine />);

    const chartRegion = screen.getByRole('region', {
      name: 'مخطط اتجاهات تغير السعر خلال الشهر الماضي',
    });

    fireEvent.click(screen.getByRole('button', { name: '14 يوم' }));
    expect(screen.getByRole('button', { name: '14 يوم' }).className).toContain('bg-amber-500');

    fireEvent.click(screen.getByRole('button', { name: '7 أيام' }));
    expect(screen.getByRole('button', { name: '7 أيام' }).className).toContain('bg-amber-500');

    const merchantToggle = screen.getByRole('button', { name: 'سعرك' });
    const competitorToggle = screen.getByRole('button', { name: 'أرخص منافس' });

    expect(merchantToggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(merchantToggle);
    expect(merchantToggle.getAttribute('aria-pressed')).toBe('false');

    expect(competitorToggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(competitorToggle);
    expect(competitorToggle.getAttribute('aria-pressed')).toBe('false');

    expect(chartRegion).toBeTruthy();
  });
});
