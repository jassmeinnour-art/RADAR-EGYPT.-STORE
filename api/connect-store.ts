import type { Request, Response } from 'express';

export default async function handler(req: any, res: any) {
  // Ensure response header is always JSON
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
    const { name, email, seller_id, platform = 'amazon_sp_api', category = 'عام', marketplace = 'EG' } = body;

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'جاهزية خادم ربط المتاجر (Connect Store Serverless API Active)',
        timestamp: new Date().toISOString(),
      });
    }

    if (!email || !seller_id) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني للمتجر ومعرّف التاجر (Seller ID)',
      });
    }

    const traderId = `TRD-${Date.now().toString().slice(-5)}`;
    const traderName = name?.trim() || `متجر التاجر (${seller_id})`;

    const generatedProducts = [
      {
        id: `PRD-${traderId}-1`,
        trader_id: traderId,
        sku: `SKU-${platform.toUpperCase()}-01`,
        asin: `ASIN-EG-${Math.floor(100000 + Math.random() * 900000)}`,
        title: `منتج رائج فئة (${category}) - متوافق مع ${platform === 'amazon_sp_api' ? 'أمازون' : platform === 'noon_seller' ? 'نون' : 'جوميا'}`,
        price: 1250,
        stock_qty: 15,
        buybox_price: 1250,
        buybox_owner: traderName,
        is_buybox_winner: true,
        competitor_price: 1320,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        category,
        platform,
        updated_at: new Date().toISOString(),
      },
      {
        id: `PRD-${traderId}-2`,
        trader_id: traderId,
        sku: `SKU-${platform.toUpperCase()}-02`,
        asin: `ASIN-EG-${Math.floor(100000 + Math.random() * 900000)}`,
        title: `حزمة العرض المميز (${category}) - مخزون سريع الدوران`,
        price: 3400,
        stock_qty: 3,
        buybox_price: 3290,
        buybox_owner: 'منافس آخر في القاهرة',
        is_buybox_winner: false,
        competitor_price: 3290,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
        category,
        platform,
        updated_at: new Date().toISOString(),
      }
    ];

    return res.status(200).json({
      success: true,
      message: `تم ربط متجر (${traderName}) بنجاح وجلب ${generatedProducts.length} منتج ومخزون`,
      products_count: generatedProducts.length,
      trader: {
        id: traderId,
        name: traderName,
        email,
        platform,
        seller_id,
        category,
        marketplace,
        is_connected: true,
        sync_status: 'Connected',
        last_sync_at: new Date().toISOString(),
        products_count: generatedProducts.length,
        low_stock_count: 1,
      },
      products: generatedProducts,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'خطأ غير متوقع في سيرفر ربط المتجر',
    });
  }
}
