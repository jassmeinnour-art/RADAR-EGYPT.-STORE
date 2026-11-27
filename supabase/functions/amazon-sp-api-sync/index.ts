// Supabase Edge Function: amazon-sp-api-sync
// Server-side Amazon Selling Partner API (SP-API) integration so the browser never calls Amazon directly.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-api-version, x-requested-with, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const FUNCTION_MAX_DURATION_MS = 38_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
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

function pickFirstNonEmpty(...values: Array<unknown>): string {
  for (const val of values) {
    if (val !== undefined && val !== null) {
      const str = String(val).trim();
      if (str.length > 0 && str !== 'undefined' && str !== 'null') {
        return str;
      }
    }
  }
  return '';
}

function mergeSettingsRows(rows: any[]): Record<string, any> {
  const merged: Record<string, any> = {};
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    // Support key/value pair tables as well as column-based settings rows
    if (typeof row.key === 'string' && row.value !== undefined && row.value !== null && String(row.value).trim() !== '') {
      merged[row.key.trim()] = row.value;
    }
    if (typeof row.name === 'string' && row.value !== undefined && row.value !== null && String(row.value).trim() !== '') {
      merged[row.name.trim()] = row.value;
    }
    for (const [k, v] of Object.entries(row)) {
      if (v !== undefined && v !== null && String(v).trim() !== '' && merged[k] === undefined) {
        merged[k] = v;
      }
    }
  }
  return merged;
}

// --- AWS SigV4 Signing Helpers (Web Crypto API for Deno Edge Runtime) ---
const textEncoder = new TextEncoder();

function toHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(message));
  return toHex(digest);
}

async function hmacSha256(key: ArrayBuffer | Uint8Array | string, message: string): Promise<ArrayBuffer> {
  const keyBytes = typeof key === 'string' ? textEncoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(message));
}

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function formatAmzDate(date: Date = new Date()): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return {
    amzDate: iso, // YYYYMMDDTHHMMSSZ
    dateStamp: iso.slice(0, 8), // YYYYMMDD
  };
}

async function buildSpApiHeaders(params: {
  method: 'GET' | 'POST';
  url: string;
  accessToken: string;
  region: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  applicationId?: string;
  body?: string;
}): Promise<Record<string, string>> {
  const parsedUrl = new URL(params.url);
  const { amzDate, dateStamp } = formatAmzDate();

  const baseHeaders: Record<string, string> = {
    'x-amz-access-token': params.accessToken,
    'x-amz-date': amzDate,
    'Accept': 'application/json',
    'User-Agent': params.applicationId
      ? `MerchantRadarEgypt/2.5.0 (AppId=${params.applicationId}; Language=Deno)`
      : 'MerchantRadarEgypt/2.5.0 (Language=Deno)',
  };

  if (params.awsSessionToken) {
    baseHeaders['x-amz-security-token'] = params.awsSessionToken;
  }

  // If AWS IAM credentials are provided, attach full AWS SigV4 Authorization header
  if (params.awsAccessKeyId && params.awsSecretAccessKey) {
    const signHeadersMap: Record<string, string> = {
      host: parsedUrl.host,
      'x-amz-access-token': params.accessToken,
      'x-amz-date': amzDate,
    };
    if (params.awsSessionToken) {
      signHeadersMap['x-amz-security-token'] = params.awsSessionToken;
    }

    const sortedHeaderKeys = Object.keys(signHeadersMap).sort();
    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k}:${signHeadersMap[k].trim().replace(/\s+/g, ' ')}\n`)
      .join('');
    const signedHeaders = sortedHeaderKeys.join(';');

    const canonicalUri = parsedUrl.pathname
      .split('/')
      .map((seg) => encodeRfc3986(decodeURIComponent(seg)))
      .join('/') || '/';

    const queryPairs: Array<[string, string]> = [];
    parsedUrl.searchParams.forEach((value, key) => {
      queryPairs.push([encodeRfc3986(key), encodeRfc3986(value)]);
    });
    queryPairs.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
    const canonicalQueryString = queryPairs.map(([k, v]) => `${k}=${v}`).join('&');

    const payloadHash = await sha256Hex(params.body || '');
    const canonicalRequest = [
      params.method.toUpperCase(),
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const service = 'execute-api';
    const credentialScope = `${dateStamp}/${params.region}/${service}/aws4_request`;
    const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      hashedCanonicalRequest,
    ].join('\n');

    const kDate = await hmacSha256(`AWS4${params.awsSecretAccessKey}`, dateStamp);
    const kRegion = await hmacSha256(kDate, params.region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');
    const signature = toHex(await hmacSha256(kSigning, stringToSign));

    baseHeaders['Authorization'] =
      `AWS4-HMAC-SHA256 Credential=${params.awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  return baseHeaders;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  const functionStartMs = Date.now();
  const functionDeadlineMs = functionStartMs + FUNCTION_MAX_DURATION_MS;

  // Extract client identifier for rate limiting (Cloudflare/Deno headers or IP)
  const clientIp =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous-client';

  try {
    const reqUrl = new URL(req.url);
    const queryParams: Record<string, string> = {};
    reqUrl.searchParams.forEach((v, k) => {
      queryParams[k] = v;
    });

    const rawBody = req.method === 'GET' || req.method === 'HEAD' ? '' : await req.text();
    if (rawBody.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'payload_too_large',
          message: 'حجم الطلب يتجاوز الحد الأقصى المسموح به (5 ميجابايت).',
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let parsedBody: Record<string, any> = {};
    if (rawBody && rawBody.trim()) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = {};
      }
    }

    const b: Record<string, any> = { ...queryParams, ...parsedBody };
    const action = String(b.action || '').trim();
    const traderId = String(b.traderId || b.sellerId || b.merchantId || '').trim();

    if (action === 'ping' || action === 'health' || (req.method === 'GET' && !traderId && !b.refreshToken && !b.code)) {
      return new Response(
        JSON.stringify({
          success: true,
          function: 'amazon-sp-api-sync',
          status: 'ready',
          cors: true,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          error: 'rate_limit_exceeded',
          message: 'تم تجاوز الحد المسموح به لطلبات الاستيراد والمزامنة (حماية ضد الإغراق). يرجى الانتظار دقيقة واحدة قبل المحاولة مجدداً.',
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

    // Read settings table from Supabase FIRST, then fallback to request params and Environment Secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin =
      supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

    let s: Record<string, any> = {};
    let dbTrader: Record<string, any> | null = null;
    if (supabaseAdmin) {
      try {
        const { data: primaryRow } = await supabaseAdmin
          .from('settings')
          .select('*')
          .eq('id', 'amazon_sp_api_settings')
          .maybeSingle();
        const { data: allRows } = await supabaseAdmin.from('settings').select('*').limit(25);
        const orderedRows = [
          ...(primaryRow ? [primaryRow] : []),
          ...(Array.isArray(allRows) ? allRows : []),
        ];
        s = mergeSettingsRows(orderedRows);
      } catch {
        // non-fatal
      }

      if (traderId) {
        try {
          const { data: byId } = await supabaseAdmin
            .from('traders')
            .select('*')
            .eq('id', traderId)
            .maybeSingle();
          if (byId) {
            dbTrader = byId;
          } else {
            const { data: bySellerId } = await supabaseAdmin
              .from('traders')
              .select('*')
              .eq('seller_id', traderId)
              .maybeSingle();
            if (bySellerId) dbTrader = bySellerId;
          }
        } catch {
          // non-fatal
        }
      }
    }

    const clientId = pickFirstNonEmpty(
      s.client_id,
      s.clientId,
      s.CLIENT_ID,
      s.amazon_client_id,
      s.AMAZON_CLIENT_ID,
      s.sp_api_client_id,
      s.SP_API_CLIENT_ID,
      s.lwa_client_id,
      s.LWA_CLIENT_ID,
      b.clientId,
      b.client_id,
      Deno.env.get('AMAZON_CLIENT_ID'),
      Deno.env.get('CLIENT_ID'),
      Deno.env.get('SP_API_CLIENT_ID'),
      Deno.env.get('LWA_CLIENT_ID')
    );

    const clientSecret = pickFirstNonEmpty(
      s.client_secret,
      s.clientSecret,
      s.CLIENT_SECRET,
      s.amazon_client_secret,
      s.AMAZON_CLIENT_SECRET,
      s.sp_api_client_secret,
      s.SP_API_CLIENT_SECRET,
      s.lwa_client_secret,
      s.LWA_CLIENT_SECRET,
      b.clientSecret,
      b.client_secret,
      Deno.env.get('AMAZON_CLIENT_SECRET'),
      Deno.env.get('CLIENT_SECRET'),
      Deno.env.get('SP_API_CLIENT_SECRET'),
      Deno.env.get('LWA_CLIENT_SECRET')
    );

    const applicationId = pickFirstNonEmpty(
      s.application_id,
      s.applicationId,
      s.app_id,
      s.appId,
      s.AMAZON_APP_ID,
      s.APP_ID,
      s.APPLICATION_ID,
      b.applicationId,
      b.appId,
      Deno.env.get('AMAZON_APP_ID'),
      Deno.env.get('AMAZON_APPLICATION_ID'),
      Deno.env.get('APP_ID'),
      Deno.env.get('APPLICATION_ID'),
      Deno.env.get('SP_API_APP_ID')
    );

    const marketplaceId =
      pickFirstNonEmpty(
        s.marketplace_id,
        s.marketplaceId,
        s.MARKETPLACE_ID,
        s.amazon_marketplace_id,
        s.AMAZON_MARKETPLACE_ID,
        b.marketplaceId,
        b.MarketplaceId,
        b.marketplace_id,
        Deno.env.get('AMAZON_MARKETPLACE_ID'),
        Deno.env.get('MARKETPLACE_ID'),
        Deno.env.get('SP_API_MARKETPLACE_ID')
      ) || 'A2VIGQ35RCS4UG';

    const sellerId =
      pickFirstNonEmpty(
        b.sellerId,
        b.merchantId,
        dbTrader?.seller_id,
        dbTrader?.seller_ids?.amazon,
        s.seller_id,
        s.sellerId,
        s.merchant_id,
        s.merchantId,
        s.SELLER_ID,
        Deno.env.get('AMAZON_SELLER_ID'),
        Deno.env.get('SELLER_ID')
      ) || 'A37JIM7LHQI6IM';

    const refreshToken = pickFirstNonEmpty(
      b.refreshToken,
      b.refresh_token,
      dbTrader?.api_keys?.amazon?.refreshToken,
      dbTrader?.api_keys?.amazon?.refresh_token,
      dbTrader?.refresh_token,
      dbTrader?.amazon_refresh_token,
      s.refresh_token,
      s.refreshToken,
      s.amazon_refresh_token,
      s.AMAZON_REFRESH_TOKEN,
      Deno.env.get('AMAZON_REFRESH_TOKEN'),
      Deno.env.get('SP_API_REFRESH_TOKEN'),
      Deno.env.get('REFRESH_TOKEN')
    );

    const awsAccessKeyId = pickFirstNonEmpty(
      s.aws_access_key_id,
      s.awsAccessKeyId,
      s.AWS_ACCESS_KEY_ID,
      s.sp_api_aws_access_key_id,
      b.awsAccessKeyId,
      Deno.env.get('SP_API_AWS_ACCESS_KEY_ID'),
      Deno.env.get('AWS_ACCESS_KEY_ID'),
      Deno.env.get('AMAZON_AWS_ACCESS_KEY_ID')
    );

    const awsSecretAccessKey = pickFirstNonEmpty(
      s.aws_secret_access_key,
      s.awsSecretAccessKey,
      s.AWS_SECRET_ACCESS_KEY,
      s.sp_api_aws_secret_key,
      b.awsSecretAccessKey,
      Deno.env.get('SP_API_AWS_SECRET_ACCESS_KEY'),
      Deno.env.get('SP_API_AWS_SECRET_KEY'),
      Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      Deno.env.get('AMAZON_AWS_SECRET_ACCESS_KEY')
    );

    const awsSessionToken = pickFirstNonEmpty(
      s.aws_session_token,
      s.awsSessionToken,
      s.AWS_SESSION_TOKEN,
      b.awsSessionToken,
      Deno.env.get('AWS_SESSION_TOKEN'),
      Deno.env.get('SP_API_AWS_SESSION_TOKEN')
    );

    // Handle OAuth authorization code exchange if requested
    if (action === 'exchange_oauth_code') {
      const code = pickFirstNonEmpty(b.code, b.spapi_oauth_code);

      if (!code) {
        return new Response(
          JSON.stringify({
            success: false,
            stage: 'oauth_exchange',
            error: 'missing_code',
            message: 'يرجى توفير كود التفويض (spapi_oauth_code).',
          }),
          { status: 400, headers: rateLimitHeaders }
        );
      }

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({
            success: false,
            stage: 'oauth_exchange',
            error: 'missing_client_credentials',
            message: 'بيانات التطبيق (Client ID / Client Secret) غير موجودة في جدول الإعدادات أو Secrets.',
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

      let exchangeRes: Response;
      try {
        exchangeRes = await fetchWithTimeout(
          'https://api.amazon.com/auth/o2/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              'Accept': 'application/json',
            },
            body: tokenParams.toString(),
          },
          12_000
        );
      } catch (fetchErr: any) {
        const isTimeout = fetchErr?.name === 'AbortError';
        return new Response(
          JSON.stringify({
            success: false,
            stage: 'oauth_exchange',
            error: isTimeout ? 'upstream_timeout' : 'network_error',
            message: isTimeout
              ? 'انتهت مهلة الاتصال بخادم Amazon LWA أثناء تحويل كود التفويض (12 ثانية).'
              : `تعذر الاتصال بخادم Amazon LWA: ${fetchErr?.message || 'Network Error'}`,
          }),
          { status: isTimeout ? 504 : 502, headers: rateLimitHeaders }
        );
      }

      const errOrOkText = await exchangeRes.text();
      let tokenJson: any = null;
      try {
        tokenJson = errOrOkText ? JSON.parse(errOrOkText) : null;
      } catch {
        tokenJson = null;
      }

      if (!exchangeRes.ok) {
        const errCode = String(tokenJson?.error || `http_${exchangeRes.status}`);
        const errDesc = String(tokenJson?.error_description || tokenJson?.message || errOrOkText).trim();
        return new Response(
          JSON.stringify({
            success: false,
            stage: 'oauth_exchange',
            httpStatus: exchangeRes.status,
            error: errCode,
            error_description: errDesc,
            amazonResponse: tokenJson || errOrOkText,
            message: `خطأ من أمازون LWA (${exchangeRes.status} - ${errCode}): ${errDesc}`,
          }),
          { status: exchangeRes.status >= 400 ? exchangeRes.status : 502, headers: rateLimitHeaders }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          refresh_token: tokenJson?.refresh_token || '',
          seller_id: sellerId,
        }),
        { status: 200, headers: rateLimitHeaders }
      );
    }

    if (!refreshToken) {
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'credentials',
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
          stage: 'credentials',
          error: 'missing_client_credentials',
          message: 'بيانات التطبيق (Client ID / Client Secret) غير موجودة في جدول settings أو Secrets.',
        }),
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 1. Access Token request: STRICTLY POST https://api.amazon.com/auth/o2/token
    const lwaParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    let lwaRes: Response;
    try {
      lwaRes = await fetchWithTimeout(
        'https://api.amazon.com/auth/o2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Accept': 'application/json',
          },
          body: lwaParams.toString(),
        },
        12_000
      );
    } catch (lwaErr: any) {
      const isTimeout = lwaErr?.name === 'AbortError';
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'lwa_token_exchange',
          method: 'POST',
          endpoint: 'https://api.amazon.com/auth/o2/token',
          error: isTimeout ? 'upstream_timeout' : 'network_error',
          message: isTimeout
            ? 'انتهت مهلة الاتصال بخادم Amazon LWA (12 ثانية) — حاول مرة أخرى.'
            : `تعذر الاتصال بخادم Amazon LWA: ${lwaErr?.message || 'Network Error'}`,
        }),
        { status: isTimeout ? 504 : 502, headers: rateLimitHeaders }
      );
    }

    const lwaRawText = await lwaRes.text();
    let lwaParsed: any = null;
    try {
      lwaParsed = lwaRawText ? JSON.parse(lwaRawText) : null;
    } catch {
      lwaParsed = null;
    }

    if (!lwaRes.ok) {
      const errCode = String(lwaParsed?.error || `http_${lwaRes.status}`);
      const errDesc = String(lwaParsed?.error_description || lwaParsed?.message || lwaRawText).trim();
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'lwa_token_exchange',
          method: 'POST',
          endpoint: 'https://api.amazon.com/auth/o2/token',
          httpStatus: lwaRes.status,
          error: errCode,
          error_description: errDesc,
          amazonResponse: lwaParsed || lwaRawText,
          message: `خطأ من أمازون LWA (${lwaRes.status} - ${errCode}): ${errDesc}`,
        }),
        { status: lwaRes.status >= 400 ? lwaRes.status : 502, headers: rateLimitHeaders }
      );
    }

    const accessToken = String(lwaParsed?.access_token || '');
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          stage: 'lwa_token_exchange',
          error: 'empty_access_token',
          amazonResponse: lwaParsed || lwaRawText,
          message: 'لم يرجع خادم Amazon LWA رمز access_token صالح',
        }),
        { status: 502, headers: rateLimitHeaders }
      );
    }

    // Determine SP-API regional endpoint & signing region
    const mktUpper = marketplaceId.toUpperCase();
    const regionRaw = pickFirstNonEmpty(
      b.region,
      s.region,
      s.REGION,
      s.aws_region,
      Deno.env.get('AMAZON_REGION'),
      Deno.env.get('AWS_REGION'),
      'eu-west-1'
    ).toLowerCase();

    let awsRegion = 'eu-west-1';
    let spHost = 'https://sellingpartnerapi-eu.amazon.com';

    if (regionRaw === 'us-east-1' || regionRaw === 'na' || mktUpper === 'ATVPDKIKX0DER' || mktUpper === 'A2EUQ1WTGCTBG2') {
      awsRegion = 'us-east-1';
      spHost = 'https://sellingpartnerapi-na.amazon.com';
    } else if (regionRaw === 'us-west-2' || regionRaw === 'fe' || mktUpper === 'A1VC38T7YXB528' || mktUpper === 'A39IBJ37TRP1C6') {
      awsRegion = 'us-west-2';
      spHost = 'https://sellingpartnerapi-fe.amazon.com';
    }

    // 2. Query SP-API Listings Items using STRICTLY GET /listings/2021-08-01/items/{sellerId}
    const items: any[] = [];
    let pageToken: string | null = null;
    let pages = 0;
    let stoppedForDeadline = false;

    do {
      if (Date.now() > functionDeadlineMs - 10_000 && pages > 0) {
        stoppedForDeadline = true;
        break;
      }

      const qs = new URLSearchParams({
        marketplaceIds: marketplaceId,
        includedData: 'summaries,offers,fulfillmentAvailability,attributes',
        pageSize: '20',
      });
      if (pageToken) qs.set('pageToken', pageToken);

      const spApiUrl = `${spHost}/listings/2021-08-01/items/${encodeURIComponent(sellerId)}?${qs.toString()}`;
      const spHeaders = await buildSpApiHeaders({
        method: 'GET',
        url: spApiUrl,
        accessToken,
        region: awsRegion,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsSessionToken,
        applicationId,
      });

      let listingsRes: Response;
      try {
        listingsRes = await fetchWithTimeout(
          spApiUrl,
          {
            method: 'GET',
            headers: spHeaders,
          },
          14_000
        );
      } catch (spErr: any) {
        if (items.length > 0) {
          stoppedForDeadline = true;
          break;
        }
        const isTimeout = spErr?.name === 'AbortError';
        return new Response(
          JSON.stringify({
            success: false,
            stage: 'sp_api_listings',
            method: 'GET',
            endpoint: spApiUrl,
            error: isTimeout ? 'upstream_timeout' : 'network_error',
            message: isTimeout
              ? 'انتهت مهلة الاتصال بـ Amazon SP-API /listings/2021-08-01 (14 ثانية).'
              : `تعذر الاتصال بـ Amazon SP-API /listings/2021-08-01: ${spErr?.message || 'Network Error'}`,
          }),
          { status: isTimeout ? 504 : 502, headers: rateLimitHeaders }
        );
      }

      const spErrOrBodyText = await listingsRes.text();
      let listingsData: any = null;
      try {
        listingsData = spErrOrBodyText ? JSON.parse(spErrOrBodyText) : null;
      } catch {
        listingsData = null;
      }

      if (!listingsRes.ok) {
        const firstErr = Array.isArray(listingsData?.errors) ? listingsData.errors[0] : null;
        const errCode = String(firstErr?.code || listingsData?.error || `http_${listingsRes.status}`);
        const errMsg = String(
          firstErr?.message ||
            listingsData?.message ||
            listingsData?.error_description ||
            spErrOrBodyText ||
            listingsRes.statusText
        ).trim();
        const errDetails = String(firstErr?.details || '').trim();

        return new Response(
          JSON.stringify({
            success: false,
            stage: 'sp_api_listings',
            method: 'GET',
            endpoint: spApiUrl,
            httpStatus: listingsRes.status,
            marketplaceId,
            sigV4Signed: Boolean(awsAccessKeyId && awsSecretAccessKey),
            error: errCode,
            details: errDetails,
            amazonResponse: listingsData || spErrOrBodyText,
            message: `خطأ من Amazon SP-API (${listingsRes.status} - ${errCode}): ${errMsg}${errDetails ? ` — ${errDetails}` : ''}`,
          }),
          { status: listingsRes.status >= 400 ? listingsRes.status : 502, headers: rateLimitHeaders }
        );
      }

      if (Array.isArray(listingsData?.items)) {
        items.push(...listingsData.items);
      }
      pageToken = listingsData?.pagination?.nextToken ? String(listingsData.pagination.nextToken) : null;
      pages++;
    } while (pageToken && pages < 25);

    // 3. Enrich from STRICTLY GET /catalog/2022-04-01/items
    const catalogByAsin = new Map<string, any>();
    const uniqueAsins = Array.from(
      new Set(
        items
          .map((it: any) => {
            const summary = Array.isArray(it?.summaries)
              ? it.summaries.find((sm: any) => sm?.marketplaceId === marketplaceId) || it.summaries[0]
              : null;
            return String(summary?.asin || '').trim().toUpperCase();
          })
          .filter((a: string) => /^[A-Z0-9]{8,14}$/.test(a))
      )
    );

    const catalogErrors: any[] = [];
    for (let i = 0; i < uniqueAsins.length; i += 20) {
      if (Date.now() > functionDeadlineMs - 4_000) {
        stoppedForDeadline = true;
        break;
      }
      const chunk = uniqueAsins.slice(i, i + 20);
      try {
        const catQs = new URLSearchParams({
          marketplaceIds: marketplaceId,
          identifiers: chunk.join(','),
          identifiersType: 'ASIN',
          includedData: 'images,summaries,attributes',
        });
        const catUrl = `${spHost}/catalog/2022-04-01/items?${catQs.toString()}`;
        const catHeaders = await buildSpApiHeaders({
          method: 'GET',
          url: catUrl,
          accessToken,
          region: awsRegion,
          awsAccessKeyId,
          awsSecretAccessKey,
          awsSessionToken,
          applicationId,
        });

        const catRes = await fetchWithTimeout(
          catUrl,
          {
            method: 'GET',
            headers: catHeaders,
          },
          9_000
        );
        const catText = await catRes.text();
        let catJson: any = null;
        try {
          catJson = catText ? JSON.parse(catText) : null;
        } catch {
          catJson = null;
        }

        if (catRes.ok) {
          for (const c of catJson?.items || []) {
            if (c?.asin) catalogByAsin.set(String(c.asin).trim().toUpperCase(), c);
          }
        } else {
          catalogErrors.push({
            httpStatus: catRes.status,
            endpoint: catUrl,
            amazonResponse: catJson || catText,
          });
        }
      } catch (catErr: any) {
        catalogErrors.push({ message: catErr?.message || 'Catalog request failed' });
      }
    }

    const amazonDomain =
      mktUpper === 'A2VIGQ35RCS4UG'
        ? 'amazon.ae'
        : mktUpper === 'A17E79C6D8DWNP'
        ? 'amazon.sa'
        : mktUpper === 'ATVPDKIKX0DER'
        ? 'amazon.com'
        : mktUpper === 'A1F83G8C2ARO7P'
        ? 'amazon.co.uk'
        : 'amazon.eg';

    const nowIso = new Date().toISOString();
    const mappedProducts = items.map((item: any) => {
      const summary = Array.isArray(item.summaries)
        ? item.summaries.find((sm: any) => sm?.marketplaceId === marketplaceId) || item.summaries[0] || {}
        : {};
      const offer = Array.isArray(item.offers)
        ? item.offers.find((o: any) => o?.marketplaceId === marketplaceId && o?.offerType === 'B2C') ||
          item.offers.find((o: any) => o?.offerType === 'B2C') ||
          item.offers[0] ||
          {}
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
      const catSummary = Array.isArray(catItem?.summaries)
        ? catItem.summaries.find((sm: any) => sm?.marketplaceId === marketplaceId) || catItem.summaries[0] || {}
        : {};
      const catImage = catItem?.images?.[0]?.images?.[0]?.link || '';
      const imageUrl = String(summary.mainImage?.link || catImage || '');

      return {
        trader_id: traderId || sellerId,
        title: String(summary.itemName || catSummary.itemName || item?.attributes?.item_name?.[0]?.value || sku),
        sku,
        asin,
        price: Number.isFinite(rawPrice) ? Math.round(rawPrice * 100) / 100 : 0,
        stock: hasQty ? totalQty : null,
        platform: 'amazon',
        image: imageUrl,
        image_url: imageUrl,
        product_url: asin ? `https://www.${amazonDomain}/dp/${asin}` : '',
        updated_at: nowIso,
      };
    });

    // 4. Persist into Supabase products table if service key is available
    if (supabaseAdmin && mappedProducts.length > 0) {
      await supabaseAdmin.from('products').upsert(mappedProducts, { onConflict: 'trader_id,sku' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: 'sp_api_live',
        marketplaceId,
        sellerId,
        sigV4Signed: Boolean(awsAccessKeyId && awsSecretAccessKey),
        total: mappedProducts.length,
        partial: stoppedForDeadline,
        durationMs: Date.now() - functionStartMs,
        products: mappedProducts,
        ...(catalogErrors.length > 0 ? { catalogWarnings: catalogErrors } : {}),
      }),
      { status: 200, headers: rateLimitHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        stage: 'edge_function_runtime',
        error: err?.name || 'edge_function_error',
        message: err?.message || 'حدث خطأ أثناء تنفيذ مزامنة Amazon SP-API',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
