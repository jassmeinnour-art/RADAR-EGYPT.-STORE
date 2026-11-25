import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as pdfExporter from '../utils/pdfExporter';
import { PerformanceDashboard } from '../components/PerformanceDashboard';
import { ExportCenterModal } from '../components/ExportCenterModal';

vi.mock('../components/MarketTrendsAnalysis', () => ({
  MarketTrendsAnalysis: () => <div data-testid="market-trends-mock" />,
}));

describe('PDF Export (jsPDF) in Reports & ExportCenterModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exportProductsListToPDF generates a real jsPDF A4 document with PDF output', () => {
    const pdf = pdfExporter.exportProductsListToPDF(
      [
        {
          sku: 'SKU-101',
          title: 'سماعات بلوتوث لاسلكية',
          price: 650,
          costPrice: 400,
          competitorPrice: 620,
        },
        {
          sku: 'SKU-102',
          title: 'شاحن سريع 65 واط',
          price: 380,
          costPrice: 220,
          competitorPrice: 390,
        },
      ],
      { currency: 'ج.م', filename: 'test_products.pdf' }
    );

    expect(typeof pdf.save).toBe('function');
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const rawPdf = pdf.output();
    expect(rawPdf.startsWith('%PDF-')).toBe(true);
    expect(rawPdf).toContain('SKU-101');
    expect(rawPdf).toContain('SKU-102');
    const dataUri = pdf.output('datauristring');
    expect(dataUri).toContain('application/pdf');
  });

  it('exportFinancialReportToPDF generates a real jsPDF financial report with PDF output', () => {
    const pdf = pdfExporter.exportFinancialReportToPDF(
      {
        title: 'التقرير المالي الشهري',
        periodLabel: 'آخر 30 يوماً',
        currency: 'ج.م',
        totalRevenue: 450000,
        totalNetProfit: 112500,
        avgMarginPercent: 25,
        totalOrders: 920,
        rows: [
          {
            dateStr: '2026-11-20',
            revenueEGP: 18500,
            netProfitEGP: 4625,
            profitMarginPercent: 25,
            ordersCount: 38,
            buyBoxWinRatePercent: 86,
          },
        ],
      },
      { filename: 'test_financial.pdf' }
    );

    expect(typeof pdf.save).toBe('function');
    expect(pdf.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    const rawPdf = pdf.output();
    expect(rawPdf.startsWith('%PDF-')).toBe(true);
    expect(rawPdf).toContain('2026-11-20');
    expect(rawPdf).toContain('Financial Performance Chart');
    const dataUri = pdf.output('datauristring');
    expect(dataUri).toContain('application/pdf');
  });

  it('renders "تصدير التقرير" button in PerformanceDashboard and exports financial & products PDFs via jsPDF', () => {
    const financialSpy = vi.spyOn(pdfExporter, 'exportFinancialReportToPDF');
    const productsSpy = vi.spyOn(pdfExporter, 'exportProductsListToPDF');
    const onShowToast = vi.fn();

    render(
      <PerformanceDashboard
        currency="ج.م"
        products={[
          {
            sku: 'RADAR-01',
            title: 'منتج اختبار رادار',
            price: 990,
            costPrice: 650,
            competitorPrice: 960,
          },
        ]}
        onShowToast={onShowToast}
      />
    );

    const exportReportBtn = screen.getByRole('button', { name: 'تصدير التقرير' });
    expect(exportReportBtn).toBeTruthy();

    fireEvent.click(exportReportBtn);
    expect(financialSpy).toHaveBeenCalledTimes(1);
    expect(financialSpy.mock.calls[0][0].periodLabel).toBe('آخر 30 يوماً');
    expect(financialSpy.mock.calls[0][0].productsCount).toBe(1);
    expect(onShowToast).toHaveBeenCalledWith('تم تصدير التقرير المالي بصيغة PDF بنجاح');

    // Open additional PDF options menu and export products list PDF
    const extraMenuBtn = screen.getByRole('button', { name: 'خيارات التصدير الإضافية' });
    fireEvent.click(extraMenuBtn);
    expect(screen.getByRole('menuitem', { name: 'تصدير التقرير المالي (PDF)' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'تصدير قائمة المنتجات (PDF)' }));
    expect(productsSpy).toHaveBeenCalledTimes(1);
    expect(productsSpy.mock.calls[0][0][0].sku).toBe('RADAR-01');
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم تصدير قائمة المنتجات'));
  });

  it('renders PDF export actions inside ExportCenterModal standard reports tab', () => {
    const productsSpy = vi.spyOn(pdfExporter, 'exportProductsListToPDF');
    const financialSpy = vi.spyOn(pdfExporter, 'exportFinancialReportToPDF');
    const onSuccessToast = vi.fn();

    render(
      <ExportCenterModal
        isOpen={true}
        onClose={() => {}}
        allProducts={[
          {
            id: 'p1',
            sku: 'EXP-01',
            title: 'منتج للتصدير',
            brand: 'Radar',
            category: 'إلكترونيات',
            image: '',
            suggestedRetailPrice: 500,
            estimatedWholesaleCost: 300,
            currentLowestPrice: 480,
            averagePrice: 495,
            highestPrice: 520,
            merchantOffers: [],
            priceHistory: [],
            wholesaleLocations: [],
          } as any,
        ]}
        watchlist={[]}
        onSuccessToast={onSuccessToast}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /التقارير الشاملة والأرشفة/ }));
    const pdfButtons = screen.getAllByRole('button', { name: 'تصدير PDF' });
    expect(pdfButtons.length).toBe(2);

    fireEvent.click(pdfButtons[0]);
    expect(productsSpy).toHaveBeenCalledTimes(1);
    expect(onSuccessToast).toHaveBeenCalledWith(expect.stringContaining('PDF'));

    fireEvent.click(pdfButtons[1]);
    expect(financialSpy).toHaveBeenCalledTimes(1);
  });
});
