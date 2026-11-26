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

  const code = pickFirstNonEmpty(b.code, b.spapi_oauth_code);
  const sellerId = pickFirstNonEmpty(b.sellerId, b.selling_partner_id, s.seller_id, s.sellerId);
  const clientId = pickFirstNonEmpty(
    b.clientId,
    b.client_id,
    s.client_id,
    s.clientId,
    s.CLIENT_ID,
    s.amazon_client_id,
    s.AMAZON_CLIENT_ID,
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
    process.env.AMAZON_CLIENT_SECRET,
    process.env.CLIENT_SECRET,
    process.env.SP_API_CLIENT_SECRET,
    process.env.LWA_CLIENT_SECRET
  );

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'missing_code',
      message: 'يرجى توفير كود التفويض (spapi_oauth_code).',
    });
  }

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      error: 'missing_client_credentials',
      message: 'بيانات التطبيق (Client ID / Client Secret) غير موجودة في الإعدادات أو متغيرات البيئة.',
    });
  }

  try {
    const lwaParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
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

    const rawText = await lwaRes.text();
    let parsed: any = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = null;
    }

    if (!lwaRes.ok || !parsed?.refresh_token) {
      const codeErr = String(parsed?.error || `http_${lwaRes.status}`);
      const descErr = String(parsed?.error_description || parsed?.message || rawText).trim();
      return res.status(lwaRes.status >= 400 ? lwaRes.status : 400).json({
        success: false,
        error: codeErr,
        error_description: descErr,
        amazonResponse: parsed || rawText,
        message: `خطأ من أمازون LWA (${lwaRes.status} - ${codeErr}): ${descErr}`,
      });
    }

    return res.status(200).json({
      success: true,
      refresh_token: parsed.refresh_token,
      refreshToken: parsed.refresh_token,
      seller_id: sellerId,
      expires_in: parsed.expires_in,
    });
  } catch (err: any) {
    return res.status(502).json({
      success: false,
      error: 'network_error',
      message: err?.message || 'تعذر الاتصال بخادم Amazon LWA',
    });
  }
}
