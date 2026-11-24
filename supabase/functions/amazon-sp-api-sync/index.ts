// Supabase Edge Function: amazon-sp-api-sync
// Server-side Amazon Selling Partner API (SP-API) integration so the browser never calls Amazon directly.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SpApiSyncPayload {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  sellerId: string;
  marketplaceId?: string;
  region?: string;
  traderId?: string;
}

// In-memory sliding window rate limiting cache per IP / trader
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute limit
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

  // Extract client identifier for rate limiting (Cloudflare/Deno headers or IP)
  const clientIp =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous-client';

  try {
    const rawBody = await req.text();
    if (rawBody.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'حجم ملف الاستيراد يتجاوز الحد الأقصى المسموح به (5 ميجابايت). يرجى تقليل حجم الملف أو تقسيمه.',
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = (rawBody ? JSON.parse(rawBody) : {}) as any;
    const action = String(body.action || '').trim();
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
          error: 'تم تجاوز الحد المسموح به لطلبات الاستيراد والمزامنة (حماية ضد الإغراق). يرجى الانتظار دقيقة واحدة قبل المحاولة مجدداً.',
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

    // Handle OAuth authorization code exchange if requested
    if (action === 'exchange_oauth_code') {
      const code = String(body.code || '').trim();
      const clientId = String(body.clientId || '').trim();
      const clientSecret = String(body.clientSecret || '').trim();

      if (!code || !clientId || !clientSecret) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'يرجى توفير كود التفويض (code) و Client ID و Client Secret لإتمام الربط',
          }),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const exchangeRes = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: tokenParams.toString(),
      });

      if (!exchangeRes.ok) {
        const errText = await exchangeRes.text();
        return new Response(
          JSON.stringify({
            success: false,
            error: `تعذر استبدال كود الموافقة مع أمازون (${exchangeRes.status})`,
            details: errText.slice(0, 300),
          }),
          { status: 502, headers: rateLimitHeaders }
        );
      }

      const tokenJson = await exchangeRes.json();
      return new Response(
        JSON.stringify({
          success: true,
          refresh_token: tokenJson.refresh_token,
          seller_id: body.sellerId || '',
        }),
        { status: 200, headers: rateLimitHeaders }
      );
    }

    const refreshToken = String(body.refreshToken || '').trim();
    const clientId = String(body.clientId || '').trim();
    const clientSecret = String(body.clientSecret || '').trim();
    const sellerId = String(body.sellerId || '').trim() || 'A37JIM7LHQI6IM';
    const marketplaceId = String(body.marketplaceId || 'ARBP9OOSHTCHU').trim();

    if (!refreshToken || !clientId || !clientSecret || !sellerId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'بيانات ربط Amazon SP-API غير مكتملة (Refresh Token / Client ID / Client Secret / Seller ID)',
        }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 1. Exchange LWA Refresh Token for short-lived Access Token
    const lwaParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const lwaRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: lwaParams.toString(),
    });

    if (!lwaRes.ok) {
      const lwaErrText = await lwaRes.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `تعذر المصادقة مع Amazon LWA (${lwaRes.status})`,
          details: lwaErrText.slice(0, 300),
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lwaJson = await lwaRes.json();
    const accessToken = String(lwaJson.access_token || '');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'لم يرجع خادم Amazon LWA رمز access_token صالح' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Query SP-API EU Listings Items for this Seller
    const spApiUrl = `https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/${encodeURIComponent(
      sellerId
    )}?marketplaceIds=${encodeURIComponent(marketplaceId)}&includedData=summaries,offers,fulfillmentAvailability`;

    const listingsRes = await fetch(spApiUrl, {
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!listingsRes.ok) {
      const spErrText = await listingsRes.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `تعذر جلب المنتجات من Amazon SP-API (${listingsRes.status})`,
          details: spErrText.slice(0, 300),
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const listingsData = await listingsRes.json();
    const items = Array.isArray(listingsData?.items) ? listingsData.items : [];
    const nowIso = new Date().toISOString();

    const mappedProducts = items.map((item: any) => {
      const summary = Array.isArray(item.summaries) ? item.summaries[0] || {} : {};
      const offer = Array.isArray(item.offers) ? item.offers[0] || {} : {};
      const availability = Array.isArray(item.fulfillmentAvailability)
        ? item.fulfillmentAvailability[0] || {}
        : {};
      const asin = String(summary.asin || '').trim();
      const sku = String(item.sku || asin || '').trim();
      const imageUrl = String(summary.mainImage?.link || '');

      return {
        trader_id: traderId,
        title: String(summary.itemName || sku),
        sku,
        asin,
        price: Number(offer.price?.amount || 0),
        stock: Number(availability.quantity || 0),
        platform: 'amazon',
        image: imageUrl,
        image_url: imageUrl,
        product_url: asin ? `https://www.amazon.eg/dp/${asin}` : '',
        updated_at: nowIso,
      };
    });

    // 3. Persist into Supabase products table if service key is available
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && supabaseServiceKey && mappedProducts.length > 0) {
      const admin = createClient(supabaseUrl, supabaseServiceKey);
      await admin.from('products').upsert(mappedProducts, { onConflict: 'trader_id,sku' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: mappedProducts.length,
        products: mappedProducts,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'حدث خطأ أثناء تنفيذ مزامنة Amazon SP-API',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
