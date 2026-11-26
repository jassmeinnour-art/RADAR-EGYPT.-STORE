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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    let dbSettings: any = null;
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const admin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: setRow } = await admin.from('settings').select('*').eq('id', 'amazon_sp_api_settings').maybeSingle();
        if (setRow) {
          dbSettings = setRow;
        } else {
          const { data: anySet } = await admin.from('settings').select('*').limit(1).maybeSingle();
          if (anySet) dbSettings = anySet;
        }
      } catch {
        // non-fatal
      }
    }

    const s = dbSettings || {};
    const b = body || {};

    const refreshToken = String(b.refreshToken || s.refresh_token || s.refreshToken || Deno.env.get('AMAZON_REFRESH_TOKEN') || '').trim();
    const clientId = String(
      b.clientId ||
      s.client_id ||
      s.clientId ||
      s.CLIENT_ID ||
      s.amazon_client_id ||
      s.AMAZON_CLIENT_ID ||
      s.sp_api_client_id ||
      s.SP_API_CLIENT_ID ||
      s.lwa_client_id ||
      s.LWA_CLIENT_ID ||
      Deno.env.get('AMAZON_CLIENT_ID') ||
      Deno.env.get('CLIENT_ID') ||
      Deno.env.get('SP_API_CLIENT_ID') ||
      Deno.env.get('LWA_CLIENT_ID') ||
      ''
    ).trim();
    const clientSecret = String(
      b.clientSecret ||
      s.client_secret ||
      s.clientSecret ||
      s.CLIENT_SECRET ||
      s.amazon_client_secret ||
      s.AMAZON_CLIENT_SECRET ||
      s.sp_api_client_secret ||
      s.SP_API_CLIENT_SECRET ||
      s.lwa_client_secret ||
      s.LWA_CLIENT_SECRET ||
      Deno.env.get('AMAZON_CLIENT_SECRET') ||
      Deno.env.get('CLIENT_SECRET') ||
      Deno.env.get('SP_API_CLIENT_SECRET') ||
      Deno.env.get('LWA_CLIENT_SECRET') ||
      ''
    ).trim();
    const applicationId = String(
      b.applicationId ||
      b.appId ||
      s.application_id ||
      s.applicationId ||
      s.app_id ||
      s.appId ||
      s.AMAZON_APP_ID ||
      s.APP_ID ||
      Deno.env.get('AMAZON_APP_ID') ||
      Deno.env.get('APP_ID') ||
      Deno.env.get('APPLICATION_ID') ||
      Deno.env.get('SP_API_APP_ID') ||
      ''
    ).trim();
    const sellerId = String(
      b.sellerId ||
      b.merchantId ||
      s.seller_id ||
      s.sellerId ||
      s.merchant_id ||
      s.merchantId ||
      s.SELLER_ID ||
      Deno.env.get('AMAZON_SELLER_ID') ||
      Deno.env.get('SELLER_ID') ||
      ''
    ).trim() || 'A37JIM7LHQI6IM';
    const marketplaceId = String(
      b.marketplaceId ||
      s.marketplace_id ||
      s.marketplaceId ||
      s.MARKETPLACE_ID ||
      s.amazon_marketplace_id ||
      s.AMAZON_MARKETPLACE_ID ||
      Deno.env.get('AMAZON_MARKETPLACE_ID') ||
      Deno.env.get('MARKETPLACE_ID') ||
      'ARBP9OOSHTCHU'
    ).trim();

    if (!refreshToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'missing_refresh_token',
          message: 'يرجى إدخال Refresh Token في كارت التاجر.',
        }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'missing_client_credentials',
          message: 'يرجى إدخال Client ID و Client Secret في إعدادات الحساب أو جدول الإعدادات.',
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
      },
      body: lwaParams.toString(),
    });

    if (!lwaRes.ok) {
      const lwaErrText = await lwaRes.text();
      let errCode = `http_${lwaRes.status}`;
      let errDesc = lwaErrText;
      try {
        const parsed = JSON.parse(lwaErrText);
        errCode = parsed?.error || errCode;
        errDesc = parsed?.error_description || parsed?.message || lwaErrText;
      } catch {
        // keep raw text
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: errCode,
          error_description: errDesc,
          message: `خطأ من أمازون LWA (${lwaRes.status} - ${errCode}): ${errDesc}`,
        }),
        { status: lwaRes.status >= 400 ? lwaRes.status : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lwaJson = await lwaRes.json();
    const accessToken = String(lwaJson.access_token || '');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'empty_access_token', message: 'لم يرجع خادم Amazon LWA رمز access_token صالح' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const regionStr = String(body.region || 'eu-west-1').toLowerCase();
    const spHost =
      regionStr === 'us-east-1' || regionStr === 'na'
        ? 'https://sellingpartnerapi-na.amazon.com'
        : regionStr === 'us-west-2' || regionStr === 'fe'
        ? 'https://sellingpartnerapi-fe.amazon.com'
        : 'https://sellingpartnerapi-eu.amazon.com';

    // 2. Query SP-API Listings Items for this Seller (GET /listings/2021-08-01/items/{sellerId})
    const items: any[] = [];
    let pageToken: string | null = null;
    let pages = 0;

    do {
      const qs = new URLSearchParams({
        marketplaceIds: marketplaceId,
        includedData: 'summaries,offers,fulfillmentAvailability,attributes',
        pageSize: '20',
      });
      if (pageToken) qs.set('pageToken', pageToken);

      const spApiUrl = `${spHost}/listings/2021-08-01/items/${encodeURIComponent(sellerId)}?${qs.toString()}`;
      const listingsRes = await fetch(spApiUrl, {
        method: 'GET',
        headers: {
          'x-amz-access-token': accessToken,
          'Accept': 'application/json',
        },
      });

      const spErrOrBodyText = await listingsRes.text();
      let listingsData: any = null;
      try {
        listingsData = JSON.parse(spErrOrBodyText);
      } catch {
        listingsData = null;
      }

      if (!listingsRes.ok) {
        const firstErr = Array.isArray(listingsData?.errors) ? listingsData.errors[0] : null;
        const errCode = String(firstErr?.code || listingsData?.error || `http_${listingsRes.status}`);
        const errMsg = String(firstErr?.message || listingsData?.message || spErrOrBodyText).trim();
        return new Response(
          JSON.stringify({
            success: false,
            error: errCode,
            message: `خطأ من Amazon SP-API /listings/2021-08-01 (${listingsRes.status} - ${errCode}): ${errMsg}`,
          }),
          { status: listingsRes.status >= 400 ? listingsRes.status : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (Array.isArray(listingsData?.items)) {
        items.push(...listingsData.items);
      }
      pageToken = listingsData?.pagination?.nextToken ? String(listingsData.pagination.nextToken) : null;
      pages++;
    } while (pageToken && pages < 25);

    // 3. Enrich from GET /catalog/2022-04-01/items
    const catalogByAsin = new Map<string, any>();
    const uniqueAsins = Array.from(
      new Set(
        items
          .map((it: any) => String(it?.summaries?.[0]?.asin || '').trim().toUpperCase())
          .filter((a: string) => /^[A-Z0-9]{8,14}$/.test(a))
      )
    );
    for (let i = 0; i < uniqueAsins.length; i += 20) {
      const chunk = uniqueAsins.slice(i, i + 20);
      try {
        const catRes = await fetch(
          `${spHost}/catalog/2022-04-01/items?marketplaceIds=${encodeURIComponent(marketplaceId)}&identifiers=${encodeURIComponent(
            chunk.join(',')
          )}&identifiersType=ASIN&includedData=images,summaries,attributes`,
          {
            method: 'GET',
            headers: {
              'x-amz-access-token': accessToken,
              'Accept': 'application/json',
            },
          }
        );
        if (catRes.ok) {
          const catJson = await catRes.json();
          for (const c of catJson?.items || []) {
            if (c?.asin) catalogByAsin.set(String(c.asin).trim().toUpperCase(), c);
          }
        }
      } catch {
        // non-fatal
      }
    }

    const nowIso = new Date().toISOString();
    const mappedProducts = items.map((item: any) => {
      const summary = Array.isArray(item.summaries) ? item.summaries[0] || {} : {};
      const offer = Array.isArray(item.offers)
        ? item.offers.find((o: any) => o?.offerType === 'B2C') || item.offers[0] || {}
        : {};
      const attrOffer = item?.attributes?.purchasable_offer?.[0];
      const fallbackPrice =
        attrOffer?.our_price?.[0]?.schedule?.[0]?.value_with_tax ??
        attrOffer?.discounted_price?.[0]?.schedule?.[0]?.value_with_tax ??
        item?.attributes?.list_price?.[0]?.value ??
        0;
      const rawPrice = Number(offer.price?.amount ?? fallbackPrice ?? 0);

      const availList = Array.isArray(item.fulfillmentAvailability)
        ? item.fulfillmentAvailability
        : Array.isArray(item?.attributes?.fulfillment_availability)
        ? item.attributes.fulfillment_availability
        : [];
      let totalQty = 0;
      let hasQty = false;
      for (const av of availList) {
        if (av && av.quantity !== undefined && av.quantity !== null) {
          const q = Number(av.quantity);
          if (Number.isFinite(q) && q >= 0) {
            totalQty += Math.round(q);
            hasQty = true;
          }
        }
      }

      const asin = String(summary.asin || '').trim().toUpperCase();
      const sku = String(item.sku || asin || '').trim();
      const catItem = asin ? catalogByAsin.get(asin) : undefined;
      const catSummary = Array.isArray(catItem?.summaries) ? catItem.summaries[0] || {} : {};
      const catImage = catItem?.images?.[0]?.images?.[0]?.link || '';
      const imageUrl = String(summary.mainImage?.link || catImage || '');

      return {
        trader_id: traderId,
        title: String(summary.itemName || catSummary.itemName || item?.attributes?.item_name?.[0]?.value || sku),
        sku,
        asin,
        price: Number.isFinite(rawPrice) ? Math.round(rawPrice * 100) / 100 : 0,
        stock: hasQty ? totalQty : null,
        platform: 'amazon',
        image: imageUrl,
        image_url: imageUrl,
        product_url: asin ? `https://www.amazon.eg/dp/${asin}` : '',
        updated_at: nowIso,
      };
    });

    // 4. Persist into Supabase products table if service key is available
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseUrl && supabaseServiceKey && mappedProducts.length > 0) {
      const admin = createClient(supabaseUrl, supabaseServiceKey);
      await admin.from('products').upsert(mappedProducts, { onConflict: 'trader_id,sku' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: 'sp_api_live',
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
