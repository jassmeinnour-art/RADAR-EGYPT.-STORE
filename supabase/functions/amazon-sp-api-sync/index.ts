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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as SpApiSyncPayload;
    const refreshToken = String(body.refreshToken || '').trim();
    const clientId = String(body.clientId || '').trim();
    const clientSecret = String(body.clientSecret || '').trim();
    const sellerId = String(body.sellerId || '').trim() || 'A37JIM7LHQI6IM';
    const marketplaceId = String(body.marketplaceId || 'ARBP9OOSHTCHU').trim();
    const traderId = String(body.traderId || sellerId).trim();

    if (!refreshToken || !clientId || !clientSecret || !sellerId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'بيانات ربط Amazon SP-API غير مكتملة (Refresh Token / Client ID / Client Secret / Seller ID)',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
