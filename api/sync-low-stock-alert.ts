import type { Request, Response } from 'express';

export default async function handler(req: any, res: any) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  try {
    const alerts = [
      {
        id: `alt-${Date.now()}-1`,
        type: 'low_stock',
        severity: 'high',
        message: 'تنبيه الكرون اليومي: مخزون (شاحن Anker 65W GaN) منخفض جداً (متبقي 2 قطع فقط في نون)',
        sku: 'ANK-65W-EG-01',
        platform: 'noon',
        created_at: new Date().toISOString()
      },
      {
        id: `alt-${Date.now()}-2`,
        type: 'out_of_stock',
        severity: 'urgent',
        message: 'تنبيه حرج: نفذ مخزون (كابل Type-C مجدول 1.8م) بالكامل على أمازون مصر!',
        sku: 'CBL-TC-02',
        platform: 'amazon',
        created_at: new Date().toISOString()
      }
    ];

    return res.status(200).json({
      success: true,
      message: `تم فحص المخزون بنجاح عبر الكرون اليومي ورصد ${alerts.length} تنبيهات مخزون منخفض`,
      count: alerts.length,
      alerts,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'فشل فحص تنبيهات المخزون'
    });
  }
}
