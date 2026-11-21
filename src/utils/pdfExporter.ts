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
  avgBuyBoxWinPercent?: number;
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
  rows: string[][]
): boolean {
  const firstCanvas = createA4Canvas();
  if (!firstCanvas) return false;

  const rowHeight = 46;
  const headerHeight = 50;
  const firstPageStartY = 350;
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
      tableY = renderA4HeaderAndKpis(ctx, title, subtitle, kpis);
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

  const kpis = [
    { label: 'إجمالي المبيعات', value: `${Math.round(report.totalRevenue).toLocaleString()} ${currency}`, accent: '#0f172a' },
    { label: 'صافي الأرباح', value: `${Math.round(report.totalNetProfit).toLocaleString()} ${currency}`, accent: '#059669' },
    { label: 'متوسط هامش الربح', value: `${report.avgMarginPercent}%`, accent: '#d97706' },
    { label: 'إجمالي الطلبات', value: `${report.totalOrders.toLocaleString()} طلب`, accent: '#0284c7' },
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
    r.buyBoxWinRatePercent !== undefined ? `${r.buyBoxWinRatePercent}%` : '-',
  ]);

  const renderedCanvas = renderPaginatedCanvasPdf(
    pdf,
    title,
    `ملخص الإيرادات وصافي الأرباح — الفترة: ${report.periodLabel}`,
    kpis,
    columns,
    rows
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
    autoTable(pdf, {
      startY: 32,
      head: [['Date', `Revenue (${currency})`, `Net Profit (${currency})`, 'Margin %', 'Orders', 'Buy Box %']],
      body: rows,
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [15, 23, 42] },
    });
  }

  pdf.save(filename);
  return pdf;
}
