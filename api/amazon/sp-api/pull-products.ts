import crypto from 'node:crypto';

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

function encodeRfc3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function buildSpApiHeaders(params: {
  method: 'GET' | 'POST';
  url: string;
  accessToken: string;
  region: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  applicationId?: string;
  body?: string;
}): Record<string, string> {
  const parsedUrl = new URL(params.url);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    'x-amz-access-token': params.accessToken,
    'x-amz-date': amzDate,
    'Accept': 'application/json',
    'User-Agent': params.applicationId
      ? `MerchantRadarEgypt/2.5.0 (AppId=${params.applicationId}; Language=Node.js)`
      : 'MerchantRadarEgypt/2.5.0 (Language=Node.js)',
  };

  if (params.awsSessionToken) {
    headers['x-amz-security-token'] = params.awsSessionToken;
  }

  if (params.awsAccessKeyId && params.awsSecretAccessKey) {
    const signHeadersMap: Record<string, string> = {
      host: parsedUrl.host,
      'x-amz-access-token': params.accessToken,
      'x-amz-date': amzDate,
    };
    if (params.awsSessionToken) {
      signHeadersMap['x-amz-security-token'] = params.awsSessionToken;
    }

    const sortedKeys = Object.keys(signHeadersMap).sort();
    const canonicalHeaders = sortedKeys
      .map((k) => `${k}:${signHeadersMap[k].trim().replace(/\s+/g, ' ')}\n`)
      .join('');
    const signedHeaders = sortedKeys.join(';');

    const canonicalUri =
      parsedUrl.pathname
        .split('/')
        .map((seg) => encodeRfc3986(decodeURIComponent(seg)))
        .join('/') || '/';

    const queryPairs: Array<[string, string]> = [];
    parsedUrl.searchParams.forEach((value, key) => {
      queryPairs.push([encodeRfc3986(key), encodeRfc3986(value)]);
    });
    queryPairs.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
    const canonicalQueryString = queryPairs.map(([k, v]) => `${k}=${v}`).join('&');

    const payloadHash = sha256Hex(params.body || '');
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
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join('\n');

    const kDate = hmacSha256(`AWS4${params.awsSecretAccessKey}`, dateStamp);
    const kRegion = hmacSha256(kDate, params.region);
    const kService = hmacSha256(kRegion, service);
    const kSigning = hmacSha256(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

    headers['Authorization'] =
      `AWS4-HMAC-SHA256 Credential=${params.awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  return headers;
}

async function fetchSupabaseSettingsRow(): Promise<Record<string, any>> {
  const supabaseUrl = pickFirstNonEmpty(process.env.SUPABASE_URL, process.env.VITE_SUPABASE_URL);
  const serviceKey = pickFirstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  if (!supabaseUrl || !serviceKey) return {};
  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/settings?select=*&limit=25`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!res.ok) return {};
    const rows = await res.json();
    if (!Array.isArray(rows)) return {};
    const merged: Record<string, any> = {};
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      if (typeof row.key === 'string' && row.value) merged[row.key.trim()] = row.value;
      for (const [k, v] of Object.entries(row)) {
        if (v !== undefined && v !== null && String(v).trim() !== '' && merged[k] === undefined) {
          merged[k] = v;
        }
      }
    }
    return merged;
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end('ok');
  }

  let body: Record<string, any> = {};
  if (req.body) {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    } catch {
      body = {};
    }
  }
  const query = req.query || {};
  const b: Record<string, any> = { ...query, ...body };
  const s = await fetchSupabaseSettingsRow();

  const clientId = pickFirstNonEmpty(
    b.clientId,
    b.client_id,
    s.client_id,
    s.clientId,
    s.CLIENT_ID,
    s.amazon_client_id,
    s.AMAZON_CLIENT_ID,
    s.sp_api_client_id,
    s.SP_API_CLIENT_ID,
    process.env.AMAZON_CLIENT_ID,
    process.env.CLIENT_ID,
    process.env.SP_API_CLIENT_ID,
    process.env.LWA_CLIENT_ID
  );

  const clientSecret = pickFirstNonEmpty(
    b.clientSecret,
    b.client_secret,
    s.client_secret,
    s.clientSecret,
    s.CLIENT_SECRET,
    s.amazon_client_secret,
    s.AMAZON_CLIENT_SECRET,
    s.sp_api_client_secret,
    s.SP_API_CLIENT_SECRET,
    process.env.AMAZON_CLIENT_SECRET,
    process.env.CLIENT_SECRET,
    process.env.SP_API_CLIENT_SECRET,
    process.env.LWA_CLIENT_SECRET
  );

  const applicationId = pickFirstNonEmpty(
    b.applicationId,
    b.appId,
    s.application_id,
    s.applicationId,
    s.app_id,
    s.appId,
    process.env.AMAZON_APP_ID,
    process.env.AMAZON_APPLICATION_ID,
    process.env.APP_ID,
    process.env.SP_API_APP_ID
  );

  const refreshToken = pickFirstNonEmpty(
    b.refreshToken,
    b.refresh_token,
    s.refresh_token,
    s.refreshToken,
    process.env.AMAZON_REFRESH_TOKEN,
    process.env.SP_API_REFRESH_TOKEN
  );

  const sellerId =
    pickFirstNonEmpty(
      b.sellerId,
      b.merchantId,
      s.seller_id,
      s.sellerId,
      process.env.AMAZON_SELLER_ID,
      process.env.SELLER_ID
    ) || 'A37JIM7LHQI6IM';

  const marketplaceId =
    pickFirstNonEmpty(
      b.marketplaceId,
      b.MarketplaceId,
      s.marketplace_id,
      s.marketplaceId,
      s.MARKETPLACE_ID,
      process.env.AMAZON_MARKETPLACE_ID,
      process.env.MARKETPLACE_ID
    ) || 'A2VIGQ35RCS4UG';

  const traderId = pickFirstNonEmpty(b.traderId, b.merchantId, sellerId);

  const awsAccessKeyId = pickFirstNonEmpty(
    b.awsAccessKeyId,
    s.aws_access_key_id,
    s.AWS_ACCESS_KEY_ID,
    process.env.SP_API_AWS_ACCESS_KEY_ID,
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AMAZON_AWS_ACCESS_KEY_ID
  );

  const awsSecretAccessKey = pickFirstNonEmpty(
    b.awsSecretAccessKey,
    s.aws_secret_access_key,
    s.AWS_SECRET_ACCESS_KEY,
    process.env.SP_API_AWS_SECRET_ACCESS_KEY,
    process.env.SP_API_AWS_SECRET_KEY,
    process.env.AWS_SECRET_ACCESS_KEY,
    process.env.AMAZON_AWS_SECRET_ACCESS_KEY
  );

  const awsSessionToken = pickFirstNonEmpty(
    b.awsSessionToken,
    s.aws_session_token,
    process.env.AWS_SESSION_TOKEN
  );

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      stage: 'credentials',
      error: 'missing_refresh_token',
      message: 'لم يتم إدخال Refresh Token في كارت التاجر.',
    });
  }

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      stage: 'credentials',
      error: 'missing_client_credentials',
      message: 'بيانات التطبيق (Client ID / Client Secret) غير موجودة في الإعدادات أو متغيرات البيئة.',
    });
  }

  // 1. Exchange Refresh Token via POST https://api.amazon.com/auth/o2/token
  let accessToken = '';
  try {
    const lwaParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    const lwaRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
      },
      body: lwaParams.toString(),
    });

    const lwaText = await lwaRes.text();
    let lwaJson: any = null;
    try {
      lwaJson = lwaText ? JSON.parse(lwaText) : null;
    } catch {
      lwaJson = null;
    }

    if (!lwaRes.ok) {
      const errCode = String(lwaJson?.error || `http_${lwaRes.status}`);
      const errDesc = String(lwaJson?.error_description || lwaJson?.message || lwaText).trim();
      return res.status(lwaRes.status >= 400 ? lwaRes.status : 502).json({
        success: false,
        stage: 'lwa_token_exchange',
        method: 'POST',
        endpoint: 'https://api.amazon.com/auth/o2/token',
        httpStatus: lwaRes.status,
        error: errCode,
        error_description: errDesc,
        amazonResponse: lwaJson || lwaText,
        message: `خطأ من أمازون LWA (${lwaRes.status} - ${errCode}): ${errDesc}`,
      });
    }

    accessToken = String(lwaJson?.access_token || '');
    if (!accessToken) {
      return res.status(502).json({
        success: false,
        stage: 'lwa_token_exchange',
        error: 'empty_access_token',
        amazonResponse: lwaJson || lwaText,
        message: 'لم يرجع خادم Amazon LWA رمز access_token صالح',
      });
    }
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      stage: 'lwa_token_exchange',
      error: 'network_error',
      message: `تعذر الاتصال بخادم Amazon LWA: ${err?.message || 'Network Error'}`,
    });
  }

  // Regional SP-API host & AWS SigV4 region
  const mktUpper = marketplaceId.toUpperCase();
  const regionRaw = pickFirstNonEmpty(b.region, s.region, process.env.AMAZON_REGION, 'eu-west-1').toLowerCase();
  let awsRegion = 'eu-west-1';
  let spHost = 'https://sellingpartnerapi-eu.amazon.com';

  if (regionRaw === 'us-east-1' || regionRaw === 'na' || mktUpper === 'ATVPDKIKX0DER' || mktUpper === 'A2EUQ1WTGCTBG2') {
    awsRegion = 'us-east-1';
    spHost = 'https://sellingpartnerapi-na.amazon.com';
  } else if (regionRaw === 'us-west-2' || regionRaw === 'fe' || mktUpper === 'A1VC38T7YXB528' || mktUpper === 'A39IBJ37TRP1C6') {
    awsRegion = 'us-west-2';
    spHost = 'https://sellingpartnerapi-fe.amazon.com';
  }

  // 2. Fetch Listings via STRICTLY GET /listings/2021-08-01/items/{sellerId}
  const items: any[] = [];
  let pageToken: string | null = null;
  let pages = 0;

  try {
    do {
      const qs = new URLSearchParams({
        marketplaceIds: marketplaceId,
        includedData: 'summaries,offers,fulfillmentAvailability,attributes',
        pageSize: '20',
      });
      if (pageToken) qs.set('pageToken', pageToken);

      const spApiUrl = `${spHost}/listings/2021-08-01/items/${encodeURIComponent(sellerId)}?${qs.toString()}`;
      const spHeaders = buildSpApiHeaders({
        method: 'GET',
        url: spApiUrl,
        accessToken,
        region: awsRegion,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsSessionToken,
        applicationId,
      });

      const listingsRes = await fetch(spApiUrl, {
        method: 'GET',
        headers: spHeaders,
      });

      const rawText = await listingsRes.text();
      let listingsData: any = null;
      try {
        listingsData = rawText ? JSON.parse(rawText) : null;
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
            rawText ||
            listingsRes.statusText
        ).trim();
        const errDetails = String(firstErr?.details || '').trim();

        return res.status(listingsRes.status >= 400 && listingsRes.status < 600 ? listingsRes.status : 502).json({
          success: false,
          stage: 'sp_api_listings',
          method: 'GET',
          endpoint: spApiUrl,
          httpStatus: listingsRes.status,
          marketplaceId,
          sigV4Signed: Boolean(awsAccessKeyId && awsSecretAccessKey),
          error: errCode,
          details: errDetails,
          amazonResponse: listingsData || rawText,
          amazonError: {
            code: errCode,
            message: errMsg,
            details: errDetails,
            httpStatus: listingsRes.status,
          },
          message: `خطأ من Amazon SP-API (${listingsRes.status} - ${errCode}): ${errMsg}${errDetails ? ` — ${errDetails}` : ''}`,
        });
      }

      if (Array.isArray(listingsData?.items)) {
        items.push(...listingsData.items);
      }
      pageToken = listingsData?.pagination?.nextToken ? String(listingsData.pagination.nextToken) : null;
      pages++;
    } while (pageToken && pages < 25);
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      stage: 'sp_api_listings',
      error: 'network_error',
      message: `تعذر الاتصال بـ Amazon SP-API: ${err?.message || 'Network Error'}`,
    });
  }

  // 3. Enrich Catalog metadata via STRICTLY GET /catalog/2022-04-01/items
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

  for (let i = 0; i < uniqueAsins.length; i += 20) {
    const chunk = uniqueAsins.slice(i, i + 20);
    try {
      const catQs = new URLSearchParams({
        marketplaceIds: marketplaceId,
        identifiers: chunk.join(','),
        identifiersType: 'ASIN',
        includedData: 'images,summaries,attributes',
      });
      const catUrl = `${spHost}/catalog/2022-04-01/items?${catQs.toString()}`;
      const catHeaders = buildSpApiHeaders({
        method: 'GET',
        url: catUrl,
        accessToken,
        region: awsRegion,
        awsAccessKeyId,
        awsSecretAccessKey,
        awsSessionToken,
        applicationId,
      });

      const catRes = await fetch(catUrl, { method: 'GET', headers: catHeaders });
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
  const formattedProducts = items.map((item: any) => {
    const summary = Array.isArray(item?.summaries)
      ? item.summaries.find((sm: any) => sm?.marketplaceId === marketplaceId) || item.summaries[0] || {}
      : {};
    const offer = Array.isArray(item?.offers)
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

    const availList = Array.isArray(item?.fulfillmentAvailability)
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
      id: `sp-${sku || asin}`,
      trader_id: traderId,
      sellerId,
      sku,
      asin,
      title: String(summary.itemName || catSummary.itemName || item?.attributes?.item_name?.[0]?.value || sku || asin),
      price: Number.isFinite(rawPrice) ? Math.round(rawPrice * 100) / 100 : 0,
      stock: hasQty ? totalQty : null,
      platform: 'amazon',
      image: imageUrl,
      image_url: imageUrl,
      product_url: asin ? `https://www.${amazonDomain}/dp/${asin}` : '',
      updated_at: nowIso,
    };
  });

  return res.status(200).json({
    success: true,
    source: 'sp_api_live',
    marketplaceId,
    sellerId,
    total: formattedProducts.length,
    products: formattedProducts,
    message:
      formattedProducts.length > 0
        ? `تم سحب ${formattedProducts.length} منتج حقيقي مباشرة من Amazon SP-API`
        : 'تم الاتصال بـ Amazon SP-API بنجاح ولكن لا توجد منتجات مدرجة على هذا الحساب حالياً (0 منتجات).',
  });
}
