import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PriceComparisonEngine, {
  buildMonthlyPriceTrendSeries,
  buildPriceTrendProjection,
  buildDirectComparisonChartData,
} from '../components/PriceComparisonEngine';
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

  it('computes statistical linear regression trend projections anchored at the latest actual price', () => {
    const mockHistory = [
      { dateKey: '2026-11-15', dateLabel: '15/11', fullDate: '15 نوف 2026', merchantPrice: 100, competitorPrice: 110, costPrice: 70, priceGap: -10 },
      { dateKey: '2026-11-16', dateLabel: '16/11', fullDate: '16 نوف 2026', merchantPrice: 110, competitorPrice: 112, costPrice: 70, priceGap: -2 },
      { dateKey: '2026-11-17', dateLabel: '17/11', fullDate: '17 نوف 2026', merchantPrice: 120, competitorPrice: 114, costPrice: 70, priceGap: 6 },
      { dateKey: '2026-11-18', dateLabel: '18/11', fullDate: '18 نوف 2026', merchantPrice: 130, competitorPrice: 116, costPrice: 70, priceGap: 14 },
    ];

    const projection = buildPriceTrendProjection(mockHistory, 7, 70);
    expect(projection.series).toHaveLength(11);
    expect(projection.slopePerDay).toBe(10);
    expect(projection.trendDirection).toBe('up');
    expect(projection.projectedEndMerchantPrice).toBe(200);
    expect(projection.rSquared).toBe(1);

    // Anchor point (today) connects both actual and projected series seamlessly
    const anchor = projection.series[3];
    expect(anchor.isProjected).toBe(false);
    expect(anchor.merchantPrice).toBe(130);
    expect(anchor.projectedMerchantPrice).toBe(130);

    // Future points have null actual prices and defined projected prices
    const futureFirst = projection.series[4];
    expect(futureFirst.isProjected).toBe(true);
    expect(futureFirst.merchantPrice).toBeNull();
    expect(futureFirst.projectedMerchantPrice).toBe(140);
    expect(futureFirst.dateKey).toBe('2026-11-19');
  });

  it('merges two or more products into unified Recharts direct comparison series', () => {
    const refDate = new Date('2026-11-21T12:00:00Z');
    const items = INITIAL_AUTO_PRICING_PRODUCTS.slice(0, 3).map((p) => ({
      id: p.productId,
      sku: p.sku,
      title: p.title,
      merchantPrice: p.currentPrice,
      competitorPrice: p.lowestCompetitorPrice,
      costPrice: p.costPrice,
    }));

    const merchantResult = buildDirectComparisonChartData(items, 14, 'merchant', {}, refDate);
    expect(merchantResult.chartData).toHaveLength(14);
    expect(merchantResult.seriesMeta).toHaveLength(3);

    const lastMerchantPoint = merchantResult.chartData[merchantResult.chartData.length - 1];
    expect(lastMerchantPoint[items[0].sku]).toBe(Math.round(items[0].merchantPrice));
    expect(lastMerchantPoint[items[1].sku]).toBe(Math.round(items[1].merchantPrice));
    expect(lastMerchantPoint[items[2].sku]).toBe(Math.round(items[2].merchantPrice));

    const competitorResult = buildDirectComparisonChartData(items, 7, 'competitor', {}, refDate);
    expect(competitorResult.chartData).toHaveLength(7);
    const lastCompPoint = competitorResult.chartData[competitorResult.chartData.length - 1];
    expect(lastCompPoint[items[0].sku]).toBe(Math.round(items[0].competitorPrice));
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

  it('supports interactive timeframe buttons, trend projection toggle, and series visibility toggles', () => {
    render(<PriceComparisonEngine />);

    const chartRegion = screen.getByRole('region', {
      name: 'مخطط اتجاهات تغير السعر خلال الشهر الماضي',
    });

    expect(screen.getByTestId('trend-projection-summary')).toBeTruthy();
    const projectionToggle = screen.getByRole('button', { name: /التوقع المستقبلي/ });
    expect(projectionToggle.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '+14 يوم' }));
    expect(screen.getByTestId('trend-projection-summary').textContent).toContain('14 أيام');

    fireEvent.click(projectionToggle);
    expect(projectionToggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByTestId('trend-projection-summary')).toBeNull();

    fireEvent.click(projectionToggle);
    expect(screen.getByTestId('trend-projection-summary')).toBeTruthy();

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

  it('supports Direct Comparison mode for selecting 2+ products and merging them in one Recharts chart', () => {
    render(<PriceComparisonEngine />);

    const directBtn = screen.getByRole('button', { name: /المقارنة المباشرة/ });
    fireEvent.click(directBtn);

    expect(directBtn.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('direct-comparison-panel')).toBeTruthy();
    expect(screen.getByTestId('direct-comparison-chart')).toBeTruthy();
    expect(screen.getByTestId('direct-comparison-summary')).toBeTruthy();

    const selectorGroup = screen.getByTestId('direct-comparison-selector');
    const productButtons = Array.from(selectorGroup.querySelectorAll('button'));
    expect(productButtons.length).toBe(INITIAL_AUTO_PRICING_PRODUCTS.length);

    // Initially first 2 products are selected
    expect(productButtons[0].getAttribute('aria-pressed')).toBe('true');
    expect(productButtons[1].getAttribute('aria-pressed')).toBe('true');
    expect(productButtons[2].getAttribute('aria-pressed')).toBe('false');

    // Select a 3rd product
    fireEvent.click(productButtons[2]);
    expect(productButtons[2].getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('direct-comparison-summary').children.length).toBe(3);

    // Toggle metric from merchant price to competitor price
    const competitorMetricBtn = screen.getByRole('button', { name: 'مقارنة المنافس' });
    fireEvent.click(competitorMetricBtn);
    expect(competitorMetricBtn.getAttribute('aria-pressed')).toBe('true');

    // Deselect down to 1 product -> shows guidance prompt
    fireEvent.click(productButtons[0]);
    fireEvent.click(productButtons[1]);
    expect(screen.getByTestId('direct-comparison-empty')).toBeTruthy();

    // Auto-select first 2 restores chart
    fireEvent.click(screen.getByRole('button', { name: 'اختيار أول منتجين تلقائياً' }));
    expect(screen.getByTestId('direct-comparison-chart')).toBeTruthy();
  });
});
