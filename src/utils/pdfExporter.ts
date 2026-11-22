import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfProductRow {
  sku?: string;
  title: string;
  category?: string;
  price: number;
  costPrice?: number;
  competitorPrice?: number;
  stock?: number;
  platform?: string;
}

export interface PdfFinancialDayRow {
  dateStr: string;
  revenueEGP: number;
  netProfitEGP: number;
  profitMarginPercent: number;
  ordersCount: number;
  buyBoxWinRatePercent?: number;
}

export interface PdfFinancialReportInput {
  title?: string;
  periodLabel: string;
  currency?: string;
  totalRevenue: number;
  totalNetProfit: number;
  avgMarginPercent: number;
  totalOrders: number;
  avgOrderValue?: number;
  salesGrowthPercent?: number;
  productsCount?: number;
  avgBuyBoxWinPercent?: number | null;
  rows: PdfFinancialDayRow[];
}

interface CanvasPageContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

const A4_WIDTH_PX = 1240;
const A4_HEIGHT_PX = 1754;

function createA4Canvas(): CanvasPageContext | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH_PX;
    canvas.height = A4_HEIGHT_PX;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.fillText !== 'function') return null;
    return { canvas, ctx };
  } catch {
    return null;
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const safe = String(text ?? '');
  if (ctx.measureText(safe).width <= maxWidth) return safe;
  let out = safe;
  while (out.length > 1 && ctx.measureText(`${out}...`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}...`;
}

function renderA4HeaderAndKpis(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  kpis: Array<{ label: string; value: string; accent: string }>
): number {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

  // Header band
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, A4_WIDTH_PX, 175);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 171, A4_WIDTH_PX, 4);

  // Brand & Title (RTL right-aligned)
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px "Cairo", "Arial", sans-serif';
  ctx.fillText('رادار التاجر مصر — التقرير الرسمي', A4_WIDTH_PX - 56, 56);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px "Cairo", "Arial", sans-serif';
  ctx.fillText(title, A4_WIDTH_PX - 56, 108);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'normal 20px "Cairo", "Arial", sans-serif';
  ctx.fillText(subtitle, A4_WIDTH_PX - 56, 146);

  // Date stamp (left)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 18px "Cairo", "Arial", sans-serif';
  const dateLabel = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  ctx.fillText(`تاريخ الإصدار: ${dateLabel}`, 56, 60);

  if (kpis.length === 0) return 210;

  // KPI strip
  const startY = 205;
  const gap = 20;
  const cardWidth = (A4_WIDTH_PX - 112 - gap * (kpis.length - 1)) / kpis.length;
  kpis.forEach((kpi, idx) => {
    const x = A4_WIDTH_PX - 56 - cardWidth - idx * (cardWidth + gap);
    drawRoundedRect(ctx, x, startY, cardWidth, 110, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px "Cairo", "Arial", sans-serif';
    ctx.fillText(kpi.label, x + cardWidth - 18, startY + 38);

    ctx.fillStyle = kpi.accent;
    ctx.font = 'bold 26px "Cairo", "Arial", sans-serif';
    ctx.fillText(truncateText(ctx, kpi.value, cardWidth - 36), x + cardWidth - 18, startY + 82);
  });

  return startY + 145;
}

function renderFooter(ctx: CanvasRenderingContext2D, pageNum: number, totalPages: number) {
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, A4_HEIGHT_PX - 76);
  ctx.lineTo(A4_WIDTH_PX - 56, A4_HEIGHT_PX - 76);
  ctx.stroke();

  ctx.direction = 'rtl';
  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 17px "Cairo", "Arial", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('منظومة رادار التاجر الذكي — مستند مالي وتجاري صادر آلياً', A4_WIDTH_PX - 56, A4_HEIGHT_PX - 38);

  ctx.textAlign = 'left';
  ctx.fillText(`صفحة ${pageNum} من ${totalPages}`, 56, A4_HEIGHT_PX - 38);
}

interface TableColumnSpec {
  header: string;
  width: number;
  align?: 'right' | 'center' | 'left';
}

function renderPaginatedCanvasPdf(
  pdf: jsPDF,
  title: string,
  subtitle: string,
  kpis: Array<{ label: string; value: string; accent: string }>,
  columns: TableColumnSpec[],
  rows: string[][],
  options?: {
    renderExtraFirstPageContent?: (ctx: CanvasRenderingContext2D, startY: number) => number;
  }
): boolean {
  const firstCanvas = createA4Canvas();
  if (!firstCanvas) return false;

  // Render Page 1 header + KPIs + optional summary/charts first to determine exact table start Y
  let firstPageStartY = renderA4HeaderAndKpis(firstCanvas.ctx, title, subtitle, kpis);
  if (options?.renderExtraFirstPageContent) {
    firstPageStartY = options.renderExtraFirstPageContent(firstCanvas.ctx, firstPageStartY);
  }

  const rowHeight = 46;
  const headerHeight = 50;
  const nextPageStartY = 120;
  const bottomLimit = A4_HEIGHT_PX - 105;

  const firstPageCapacity = Math.max(1, Math.floor((bottomLimit - firstPageStartY - headerHeight) / rowHeight));
  const nextPageCapacity = Math.max(1, Math.floor((bottomLimit - nextPageStartY - headerHeight) / rowHeight));

  const chunks: string[][][] = [];
  if (rows.length === 0) {
    chunks.push([]);
  } else {
    chunks.push(rows.slice(0, firstPageCapacity));
    let cursor = firstPageCapacity;
    while (cursor < rows.length) {
      chunks.push(rows.slice(cursor, cursor + nextPageCapacity));
      cursor += nextPageCapacity;
    }
  }

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const totalPages = chunks.length;

  chunks.forEach((chunk, pageIdx) => {
    const surface = pageIdx === 0 ? firstCanvas : createA4Canvas();
    if (!surface) return;
    const { canvas, ctx } = surface;

    let tableY: number;
    if (pageIdx === 0) {
      tableY = firstPageStartY;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px "Cairo", "Arial", sans-serif';
      ctx.fillText(`${title} (تابع)`, A4_WIDTH_PX - 56, 72);
      tableY = nextPageStartY;
    }

    // Table header bar
    const tableWidth = A4_WIDTH_PX - 112;
    const tableLeft = 56;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tableLeft, tableY, tableWidth, headerHeight);

    ctx.direction = 'rtl';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 19px "Cairo", "Arial", sans-serif';

    let rightCursor = tableLeft + tableWidth;
    columns.forEach((col) => {
      const colLeft = rightCursor - col.width;
      const align = col.align || 'right';
      ctx.textAlign = align;
      const textX =
        align === 'right' ? rightCursor - 14 : align === 'left' ? colLeft + 14 : colLeft + col.width / 2;
      ctx.fillText(truncateText(ctx, col.header, col.width - 20), textX, tableY + 32);
      rightCursor = colLeft;
    });

    if (chunk.length === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tableLeft, tableY + headerHeight, tableWidth, 72);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 20px "Cairo", "Arial", sans-serif';
      ctx.fillText('لا توجد صفوف بيانات متاحة في هذا النطاق.', tableLeft + tableWidth / 2, tableY + headerHeight + 44);
    } else {
      chunk.forEach((rowValues, rIdx) => {
        const ry = tableY + headerHeight + rIdx * rowHeight;
        ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(tableLeft, ry, tableWidth, rowHeight);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tableLeft, ry + rowHeight);
        ctx.lineTo(tableLeft + tableWidth, ry + rowHeight);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'normal 18px "Cairo", "Arial", sans-serif';

        let colRight = tableLeft + tableWidth;
        columns.forEach((col, cIdx) => {
          const colLeft = colRight - col.width;
          const align = col.align || 'right';
          ctx.textAlign = align;
          const textX =
            align === 'right' ? colRight - 14 : align === 'left' ? colLeft + 14 : colLeft + col.width / 2;
          ctx.fillText(truncateText(ctx, rowValues[cIdx] ?? '-', col.width - 20), textX, ry + 30);
          colRight = colLeft;
        });
      });
    }

    renderFooter(ctx, pageIdx + 1, totalPages);

    if (pageIdx > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm);
  });

  return true;
}

function drawFinancialSummaryAndCharts(
  ctx: CanvasRenderingContext2D,
  startY: number,
  report: PdfFinancialReportInput,
  currency: string
): number {
  const leftMargin = 56;
  const contentWidth = A4_WIDTH_PX - 112; // 1128

  // 1. Secondary Financial Performance Summary Bar
  const summaryY = startY - 12;
  const avgOrderVal =
    report.avgOrderValue !== undefined
      ? report.avgOrderValue
      : report.totalOrders > 0
      ? Math.round(report.totalRevenue / report.totalOrders)
      : 0;
  const growthStr =
    report.salesGrowthPercent !== undefined
      ? `${report.salesGrowthPercent > 0 ? '+' : ''}${report.salesGrowthPercent}%`
      : '-';
  const productsStr =
    report.productsCount !== undefined ? `${report.productsCount} منتج` : `${report.rows.length} يوم`;

  drawRoundedRect(ctx, leftMargin, summaryY, contentWidth, 56, 10);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "Cairo", "Arial", sans-serif';
  const summaryLine = `ملخص الأداء المالي:  متوسط الهامش الصافي ${report.avgMarginPercent}%  ·  متوسط قيمة الطلب ${Math.round(avgOrderVal).toLocaleString()} ${currency}  ·  نمو الفترة ${growthStr}  ·  النطاق: ${productsStr}`;
  ctx.fillText(truncateText(ctx, summaryLine, contentWidth - 40), leftMargin + contentWidth / 2, summaryY + 35);

  // 2. Charts Section Header
  const chartsHeaderY = summaryY + 84;
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "Cairo", "Arial", sans-serif';
  ctx.fillText('الرسوم البيانية للأداء المالي', A4_WIDTH_PX - 56, chartsHeaderY);

  const panelTop = chartsHeaderY + 18;
  const panelGap = 24;
  const panelWidth = (contentWidth - panelGap) / 2; // 552
  const panelHeight = 290;
  const rightPanelX = leftMargin + panelWidth + panelGap;
  const leftPanelX = leftMargin;

  // Draw two crisp light-theme chart panels
  [rightPanelX, leftPanelX].forEach((px) => {
    drawRoundedRect(ctx, px, panelTop, panelWidth, panelHeight, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const rows = (report.rows || []).slice(-10);

  // Right Panel: Revenue vs Net Profit Bar Chart
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Cairo", "Arial", sans-serif';
  ctx.fillText('الإيرادات مقابل صافي الربح', rightPanelX + panelWidth - 20, panelTop + 32);

  // Legend (left side of Right Panel)
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Cairo", "Arial", sans-serif';
  ctx.fillStyle = '#d97706';
  ctx.fillRect(rightPanelX + 20, panelTop + 20, 12, 12);
  ctx.fillStyle = '#334155';
  ctx.fillText('المبيعات', rightPanelX + 38, panelTop + 31);

  ctx.fillStyle = '#059669';
  ctx.fillRect(rightPanelX + 108, panelTop + 20, 12, 12);
  ctx.fillStyle = '#334155';
  ctx.fillText('الربح', rightPanelX + 126, panelTop + 31);

  // Left Panel: Orders & Profit Margin % Trend Chart
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Cairo", "Arial", sans-serif';
  ctx.fillText('حركة الطلبات وهامش الربح %', leftPanelX + panelWidth - 20, panelTop + 32);

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Cairo", "Arial", sans-serif';
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(leftPanelX + 20, panelTop + 20, 12, 12);
  ctx.fillStyle = '#334155';
  ctx.fillText('الطلبات', leftPanelX + 38, panelTop + 31);

  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(leftPanelX + 102, panelTop + 20, 12, 12);
  ctx.fillStyle = '#334155';
  ctx.fillText('الهامش %', leftPanelX + 120, panelTop + 31);

  if (rows.length === 0) {
    [rightPanelX, leftPanelX].forEach((px) => {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 17px "Cairo", "Arial", sans-serif';
      ctx.fillText(
        'لا توجد فواتير مسجلة لعرض الرسم البياني في هذه الفترة',
        px + panelWidth / 2,
        panelTop + panelHeight / 2 + 10
      );
    });
  } else {
    // Draw Right Panel Plot Area
    const plotPadLeft = 68;
    const plotPadRight = 24;
    const plotTop = panelTop + 56;
    const plotBottom = panelTop + panelHeight - 44;
    const plotHeight = plotBottom - plotTop;
    const rPlotWidth = panelWidth - plotPadLeft - plotPadRight;
    const maxVal = Math.max(
      10,
      ...rows.map((r) => Math.max(Number(r.revenueEGP) || 0, Number(r.netProfitEGP) || 0))
    );

    for (let step = 0; step <= 3; step++) {
      const gy = plotBottom - (plotHeight * step) / 3;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightPanelX + plotPadLeft, gy);
      ctx.lineTo(rightPanelX + panelWidth - plotPadRight, gy);
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 12px "Cairo", "Arial", sans-serif';
      ctx.fillText(Math.round((maxVal * step) / 3).toLocaleString(), rightPanelX + plotPadLeft - 8, gy + 4);
    }

    const slotW = rPlotWidth / rows.length;
    const barW = Math.min(20, Math.max(6, (slotW - 10) / 2));
    rows.forEach((r, idx) => {
      const cx = rightPanelX + plotPadLeft + idx * slotW + slotW / 2;
      const revH = Math.max(2, ((Number(r.revenueEGP) || 0) / maxVal) * plotHeight);
      const profH = Math.max(2, ((Number(r.netProfitEGP) || 0) / maxVal) * plotHeight);

      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - barW - 1, plotBottom - revH, barW, revH);

      ctx.fillStyle = '#059669';
      ctx.fillRect(cx + 1, plotBottom - profH, barW, profH);

      if (rows.length <= 7 || idx % 2 === 0 || idx === rows.length - 1) {
        ctx.direction = 'ltr';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#475569';
        ctx.font = 'normal 11px "Cairo", "Arial", sans-serif';
        ctx.fillText(String(r.dateStr).slice(5), cx, plotBottom + 18);
      }
    });

    // Draw Left Panel Plot Area (Orders Bars + Margin Line)
    const maxOrders = Math.max(1, ...rows.map((r) => Number(r.ordersCount) || 0));
    for (let step = 0; step <= 3; step++) {
      const gy = plotBottom - (plotHeight * step) / 3;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftPanelX + plotPadLeft, gy);
      ctx.lineTo(leftPanelX + panelWidth - plotPadRight, gy);
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 12px "Cairo", "Arial", sans-serif';
      ctx.fillText(String(Math.round((maxOrders * step) / 3)), leftPanelX + plotPadLeft - 8, gy + 4);
    }

    const linePts: Array<{ x: number; y: number }> = [];
    const orderBarW = Math.min(26, Math.max(8, slotW * 0.48));
    rows.forEach((r, idx) => {
      const cx = leftPanelX + plotPadLeft + idx * slotW + slotW / 2;
      const ordH = Math.max(2, ((Number(r.ordersCount) || 0) / maxOrders) * plotHeight);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - orderBarW / 2, plotBottom - ordH, orderBarW, ordH);

      const clampedMargin = Math.max(0, Math.min(100, Number(r.profitMarginPercent) || 0));
      linePts.push({ x: cx, y: plotBottom - (clampedMargin / 100) * plotHeight });

      if (rows.length <= 7 || idx % 2 === 0 || idx === rows.length - 1) {
        ctx.direction = 'ltr';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#475569';
        ctx.font = 'normal 11px "Cairo", "Arial", sans-serif';
        ctx.fillText(String(r.dateStr).slice(5), cx, plotBottom + 18);
      }
    });

    if (linePts.length > 0) {
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.beginPath();
      linePts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      linePts.forEach((pt) => {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  }

  // 3. Table Section Title
  const tableHeadingY = panelTop + panelHeight + 42;
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 21px "Cairo", "Arial", sans-serif';
  ctx.fillText('تفاصيل الأداء المالي اليومي', A4_WIDTH_PX - 56, tableHeadingY);

  return tableHeadingY + 18;
}

export function exportProductsListToPDF(
  products: PdfProductRow[],
  options: { currency?: string; title?: string; filename?: string } = {}
): jsPDF {
  const currency = options.currency || 'EGP';
  const reportTitle = options.title || 'تقرير قائمة المنتجات والتسعير';
  const filename =
    options.filename || `radar_products_list_${new Date().toISOString().slice(0, 10)}.pdf`;

  const safeProducts = Array.isArray(products) ? products : [];
  const totalValue = safeProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const totalCost = safeProducts.reduce((sum, p) => sum + (Number(p.costPrice) || 0), 0);
  const avgPrice = safeProducts.length > 0 ? Math.round(totalValue / safeProducts.length) : 0;
  const estMarginPercent =
    totalValue > 0 && totalCost > 0
      ? Number((((totalValue - totalCost) / totalValue) * 100).toFixed(1))
      : 0;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.setProperties({
    title: reportTitle,
    subject: 'قائمة المنتجات والأسعار — رادار التاجر',
    creator: 'Radar Egypt Merchant',
  });

  const kpis = [
    { label: 'عدد المنتجات', value: `${safeProducts.length} منتج`, accent: '#0f172a' },
    { label: 'متوسط سعر البيع', value: `${avgPrice.toLocaleString()} ${currency}`, accent: '#d97706' },
    { label: 'إجمالي قيمة القائمة', value: `${Math.round(totalValue).toLocaleString()} ${currency}`, accent: '#0284c7' },
    { label: 'متوسط هامش الربح', value: `${estMarginPercent}%`, accent: '#059669' },
  ];

  // Total table width = 1240 - 112 = 1128
  const columns: TableColumnSpec[] = [
    { header: 'SKU', width: 170, align: 'left' },
    { header: 'اسم المنتج', width: 398, align: 'right' },
    { header: 'السعر الحالي', width: 145, align: 'center' },
    { header: 'التكلفة', width: 135, align: 'center' },
    { header: 'سعر المنافس', width: 145, align: 'center' },
    { header: 'الربح / الهامش', width: 135, align: 'center' },
  ];

  const rows = safeProducts.map((item) => {
    const price = Number(item.price) || 0;
    const cost = Number(item.costPrice) || 0;
    const comp = Number(item.competitorPrice) || 0;
    const profit = cost > 0 ? Math.round(price - cost) : 0;
    const margin = price > 0 && cost > 0 ? `${Math.round(((price - cost) / price) * 100)}%` : '-';
    return [
      item.sku || '-',
      item.title || 'منتج بدون اسم',
      `${price.toLocaleString()} ${currency}`,
      cost > 0 ? `${cost.toLocaleString()} ${currency}` : '-',
      comp > 0 ? `${comp.toLocaleString()} ${currency}` : '-',
      cost > 0 ? `${profit} (${margin})` : '-',
    ];
  });

  const renderedCanvas = renderPaginatedCanvasPdf(
    pdf,
    reportTitle,
    `قائمة شاملة بالمنتجات والأسعار التنافسية (${safeProducts.length} صنف)`,
    kpis,
    columns,
    rows
  );

  if (!renderedCanvas) {
    pdf.setFontSize(14);
    pdf.text('Radar Egypt Merchant - Products List Report', 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Total Products: ${safeProducts.length} | Avg Price: ${avgPrice} ${currency}`, 14, 26);
    autoTable(pdf, {
      startY: 32,
      head: [['SKU', 'Product Title', `Price (${currency})`, `Cost (${currency})`, `Competitor (${currency})`, 'Margin']],
      body: rows,
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  pdf.save(filename);
  return pdf;
}

export function exportFinancialReportToPDF(
  report: PdfFinancialReportInput,
  options: { filename?: string } = {}
): jsPDF {
  const currency = report.currency || 'EGP';
  const title = report.title || 'التقرير المالي وأداء المبيعات';
  const filename =
    options.filename || `radar_financial_report_${new Date().toISOString().slice(0, 10)}.pdf`;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.setProperties({
    title,
    subject: `التقرير المالي (${report.periodLabel}) — رادار التاجر`,
    creator: 'Radar Egypt Merchant',
  });

  const buyBoxDisplay =
    typeof report.avgBuyBoxWinPercent === 'number' && Number.isFinite(report.avgBuyBoxWinPercent)
      ? `${report.avgBuyBoxWinPercent}%`
      : '-';

  const kpis = [
    { label: 'إجمالي المبيعات', value: `${Math.round(report.totalRevenue).toLocaleString()} ${currency}`, accent: '#0f172a' },
    { label: 'صافي الأرباح', value: `${Math.round(report.totalNetProfit).toLocaleString()} ${currency}`, accent: '#059669' },
    { label: 'إجمالي الطلبات', value: `${report.totalOrders.toLocaleString()} طلب`, accent: '#0284c7' },
    { label: 'معدل Buy Box', value: buyBoxDisplay, accent: '#7c3aed' },
  ];

  // Total table width = 1128
  const columns: TableColumnSpec[] = [
    { header: 'التاريخ', width: 208, align: 'center' },
    { header: 'إجمالي الإيرادات', width: 240, align: 'center' },
    { header: 'صافي الربح', width: 230, align: 'center' },
    { header: 'هامش الربح %', width: 150, align: 'center' },
    { header: 'عدد الطلبات', width: 150, align: 'center' },
    { header: 'نسبة Buy Box', width: 150, align: 'center' },
  ];

  const rows = (report.rows || []).map((r) => [
    r.dateStr,
    `${Math.round(r.revenueEGP).toLocaleString()} ${currency}`,
    `${Math.round(r.netProfitEGP).toLocaleString()} ${currency}`,
    `${r.profitMarginPercent}%`,
    `${r.ordersCount}`,
    typeof r.buyBoxWinRatePercent === 'number' ? `${r.buyBoxWinRatePercent}%` : '-',
  ]);

  const renderedCanvas = renderPaginatedCanvasPdf(
    pdf,
    title,
    `ملخص الأداء المالي والرسوم البيانية — الفترة: ${report.periodLabel}`,
    kpis,
    columns,
    rows,
    {
      renderExtraFirstPageContent: (ctx, startY) =>
        drawFinancialSummaryAndCharts(ctx, startY, report, currency),
    }
  );

  if (!renderedCanvas) {
    pdf.setFontSize(14);
    pdf.text('Radar Egypt Merchant - Financial Performance Report', 14, 18);
    pdf.setFontSize(10);
    pdf.text(
      `Period: ${report.periodLabel} | Revenue: ${Math.round(report.totalRevenue)} ${currency} | Net Profit: ${Math.round(report.totalNetProfit)} ${currency}`,
      14,
      26
    );
    pdf.text(
      `Margin: ${report.avgMarginPercent}% | Orders: ${report.totalOrders} | Buy Box: ${buyBoxDisplay}`,
      14,
      32
    );

    // Vector mini-chart inside jsPDF fallback
    const chartRows = (report.rows || []).slice(-10);
    let tableStartY = 40;
    if (chartRows.length > 0) {
      pdf.setFontSize(9);
      pdf.text('Financial Performance Chart (Revenue vs Net Profit)', 14, 40);
      const chartX = 14;
      const chartY = 44;
      const chartW = 182;
      const chartH = 34;
      pdf.setDrawColor(203, 213, 225);
      pdf.rect(chartX, chartY, chartW, chartH);

      const maxVal = Math.max(
        10,
        ...chartRows.map((r) => Math.max(Number(r.revenueEGP) || 0, Number(r.netProfitEGP) || 0))
      );
      const slotW = (chartW - 8) / chartRows.length;
      const barW = Math.min(7, Math.max(2, (slotW - 3) / 2));

      chartRows.forEach((r, idx) => {
        const cx = chartX + 4 + idx * slotW + slotW / 2;
        const revH = Math.max(1, ((Number(r.revenueEGP) || 0) / maxVal) * (chartH - 6));
        const profH = Math.max(1, ((Number(r.netProfitEGP) || 0) / maxVal) * (chartH - 6));

        pdf.setFillColor(217, 119, 6);
        pdf.rect(cx - barW - 0.5, chartY + chartH - 2 - revH, barW, revH, 'F');
        pdf.setFillColor(5, 150, 105);
        pdf.rect(cx + 0.5, chartY + chartH - 2 - profH, barW, profH, 'F');
      });
      tableStartY = chartY + chartH + 8;
    }

    autoTable(pdf, {
      startY: tableStartY,
      head: [['Date', `Revenue (${currency})`, `Net Profit (${currency})`, 'Margin %', 'Orders', 'Buy Box %']],
      body: rows,
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  pdf.save(filename);
  return pdf;
}
