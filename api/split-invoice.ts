import type { Request, Response } from 'express';

export default async function handler(req: any, res: any) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const invoice_id = body.invoice_id || req.query.invoice_id;

    if (!invoice_id) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم معرف الفاتورة invoice_id للتقسيم'
      });
    }

    // Default sample items if invoice items are nested or passed directly
    const items = body.items || [
      { title: 'شاحن سريع Anker 65W GaN ثلاثي المنافذ', sku: 'ANK-65W-EG-01', asin: 'B0CHX3W9XX', quantity: 1, price: 1250 },
      { title: 'كابل شحن سريع Type-C مجدول ضد القطع 1.8 متر', sku: 'CBL-TC-02', asin: 'B089DXY77K', quantity: 2, price: 299 },
      { title: 'حامل هاتف ذكي مغناطيسي للسيارة مع شاحن لاسلكي', sku: 'MAG-CAR-03', asin: 'B09JKLMNO1', quantity: 1, price: 650 },
      { title: 'سماعة أذن بلوتوث عازلة للضوضاء برو', sku: 'EAR-BT-PRO-04', asin: 'B07VXYZ99P', quantity: 1, price: 1890 },
      { title: 'باور بانك 20,000 مللي أمبير شحن فائق 22.5W', sku: 'PWR-20K-EGY-05', asin: 'B0BNM7788Q', quantity: 1, price: 1150 }
    ];

    const invoiceNumber = body.invoice_number || `INV-${Date.now().toString().slice(-6)}`;
    const traderId = body.trader_id || 'TRD-DEFAULT';

    const splitInvoices = items.map((item: any, idx: number) => {
      const splitNum = `${invoiceNumber}-${idx + 1}`;
      const sku = item.sku || item.asin || `SKU-${idx + 1}`;
      return {
        id: `split-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        original_invoice_id: invoice_id,
        trader_id: traderId,
        split_number: splitNum,
        product_title: item.title,
        product_sku: sku,
        product_asin: item.asin || sku,
        quantity: item.quantity || 1,
        price: item.price || 0,
        barcode_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(sku)}`,
        created_at: new Date().toISOString()
      };
    });

    return res.status(200).json({
      success: true,
      message: `تم تقسيم الفاتورة (${invoiceNumber}) بنجاح إلى ${splitInvoices.length} بوليصة شحن فردية`,
      original_invoice_id: invoice_id,
      count: splitInvoices.length,
      splits: splitInvoices
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'فشل في تقسيم الفاتورة'
    });
  }
}
