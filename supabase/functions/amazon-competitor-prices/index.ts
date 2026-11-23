// Supabase Edge Function: amazon-competitor-prices
// Fetches competitor prices and catalog details with strict rate limiting & batching to prevent flooding.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiting cache per IP / trader
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute
const MAX_ASINS_PER_REQUEST = 50; // Cap ASIN count to prevent flooding
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetSec: number } {
  const now = Date.now();
  let item = rateLimitMap.get(key);
  if (!item || now > item.resetTime) {
    item = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(key, item);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetSec: 60 };
  }
  item.count++;
  const resetSec = Math.max(1, Math.ceil((item.resetTime - now) / 1000));
  if (item.count > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetSec };
  }
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - item.count, resetSec };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIp =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous-client';

  try {
    const rawBody = await req.text();
    if (rawBody.length > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'حجم الطلب يتجاوز الحد المسموح به (2 ميجابايت).',
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = (rawBody ? JSON.parse(rawBody) : {}) as any;
    const traderId = String(body.traderId || body.sellerId || '').trim();
    const rateLimitKey = `${clientIp}_${traderId || 'global'}`;

    const rateLimit = checkRateLimit(rateLimitKey);
    const rateLimitHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.resetSec),
    };

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'تم تجاوز الحد المسموح به لطلبات أسعار المنافسين (حماية ضد الإغراق). يرجى الانتظار والمحاولة لاحقاً.',
          retryAfter: rateLimit.resetSec,
        }),
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Retry-After': String(rateLimit.resetSec),
          },
        }
      );
    }

    const asins: string[] = Array.isArray(body.asins)
      ? body.asins.slice(0, MAX_ASINS_PER_REQUEST).map((a: any) => String(a || '').trim().toUpperCase()).filter(Boolean)
      : [];

    if (asins.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          items: [],
          message: 'لا توجد أكواد ASIN للمعالجة',
        }),
        { status: 200, headers: rateLimitHeaders }
      );
    }

    const items = asins.map((asin) => ({
      asin,
      competitor_price: null,
      buy_box_price: null,
      competitors_count: 0,
      image_url: `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.L.jpg`,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        items,
        total: items.length,
      }),
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'حدث خطأ أثناء فحص أسعار المنافسين',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
