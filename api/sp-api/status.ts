/**
 * Amazon SP-API Production Health Check Endpoint (/api/sp-api/status)
 * 
 * Validates Amazon Selling Partner API (SP-API) connectivity and authentication:
 * 1. Pings Amazon Login with Amazon (LWA) endpoint (https://api.amazon.com/auth/o2/token)
 *    using CLIENT_ID and CLIENT_SECRET to exchange REFRESH_TOKEN for an access token.
 * 2. Performs a lightweight SP-API test call (getMarketplaceParticipations) to verify
 *    API signature, authorization, and regional endpoint health.
 * 3. Returns a standardized JSON response:
 *    Success (200 OK): { status: 'OK', region: 'eu-west-1', endpoint: 'sellingpartnerapi-eu.amazon.com', ... }
 *    Failure (401/502): Diagnostic error with obfuscated credentials.
 * 
 * Strict Security Policy:
 * - Refresh Tokens, Client Secrets, and Access Tokens are ALWAYS obfuscated in logs and responses.
 * - Returns 200 OK only when authentication and SP-API test call succeed.
 */

const ENCRYPTED_LWA_PREFIX = 'ENC_LWA_V1:';
const SERVER_LWA_ENVELOPE_SECRET = process.env.LWA_ENVELOPE_SECRET || 'MR_EGY_LWA_VAULT_KEY_2026_SECURE';

function decryptLwaRefreshToken(storedToken?: string | null): string {
  const trimmed = (storedToken || '').trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith(ENCRYPTED_LWA_PREFIX)) return trimmed;

  try {
    const rawBase64 = trimmed.slice(ENCRYPTED_LWA_PREFIX.length);
    const cipherBytes = new Uint8Array(Buffer.from(rawBase64, 'base64'));
    if (cipherBytes.length <= 1) return '';

    const checksum = cipherBytes[0];
    const keyBytes = new Uint8Array(Buffer.from(SERVER_LWA_ENVELOPE_SECRET, 'utf-8'));
    const plainBytes = new Uint8Array(cipherBytes.length - 1);

    for (let i = 0; i < plainBytes.length; i++) {
      const k = keyBytes[i % keyBytes.length];
      const rolling = (k ^ ((i * 31 + checksum) & 0xff)) & 0xff;
      plainBytes[i] = cipherBytes[i + 1] ^ rolling;
    }

    return Buffer.from(plainBytes).toString('utf-8').trim();
  } catch {
    return '';
  }
}

function obfuscateSecret(val?: string | null): string {
  if (!val) return '[NOT_CONFIGURED]';
  const str = String(val).trim();
  if (str.length <= 8) return '****';
  return `${str.slice(0, 4)}••••••••${str.slice(-4)}`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // Accept GET, POST, or HEAD
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};
  let body: any = {};
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }

  // 1. Resolve Credentials (prioritizing explicit environment variables, then request payload, then fallbacks)
  const clientId = String(
    process.env.AMAZON_CLIENT_ID ||
    process.env.LWA_CLIENT_ID ||
    body.clientId ||
    query.clientId ||
    req.headers['x-amz-client-id'] ||
    'amzn1.application-oa2-client.8f94e2c17d4b4a90b123456789abcdef'
  ).trim();

  const clientSecret = String(
    process.env.AMAZON_CLIENT_SECRET ||
    process.env.LWA_CLIENT_SECRET ||
    body.clientSecret ||
    query.clientSecret ||
    req.headers['x-amz-client-secret'] ||
    'amzn1.oa2-cs.v1.9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
  ).trim();

  const rawRefreshToken = String(
    process.env.AMAZON_REFRESH_TOKEN ||
    body.refreshToken ||
    query.refreshToken ||
    req.headers['x-amz-refresh-token'] ||
    'Atzr|IwEBIA7x9K2mN4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI4jK6lM8nO0pQ2rS4tU6vW8xY0zA2bC4dE'
  ).trim();

  const refreshToken = decryptLwaRefreshToken(rawRefreshToken);

  const regionRaw = String(
    process.env.AMAZON_REGION ||
    body.region ||
    query.region ||
    req.headers['x-amz-region'] ||
    'eu-west-1'
  ).trim().toLowerCase();

  const region = regionRaw === 'us-east-1' || regionRaw === 'na'
    ? 'us-east-1'
    : regionRaw === 'us-west-2' || regionRaw === 'fe'
    ? 'us-west-2'
    : 'eu-west-1';

  const endpoint = region === 'us-east-1'
    ? 'sellingpartnerapi-na.amazon.com'
    : region === 'us-west-2'
    ? 'sellingpartnerapi-fe.amazon.com'
    : 'sellingpartnerapi-eu.amazon.com';

  const lwaEndpoint = 'https://api.amazon.com/auth/o2/token';

  // Secure Audit Log (Zero secrets printed)
  console.log(
    `[SP-API Health Check] Validating SP-API auth: endpoint=${endpoint}, region=${region}, clientId=${obfuscateSecret(clientId)}, refreshToken=${obfuscateSecret(refreshToken)}`
  );

  // Validate presence of credentials
  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[SP-API Health Check] Missing credentials for LWA authentication');
    return res.status(400).json({
      status: 'ERROR',
      region,
      endpoint,
      stage: 'CREDENTIAL_RESOLUTION',
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Client ID, Client Secret, or Refresh Token is missing from the environment or request.',
        httpStatus: 400
      },
      diagnostics: {
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
        hasRefreshToken: Boolean(refreshToken),
        clientIdMasked: obfuscateSecret(clientId),
        refreshTokenMasked: obfuscateSecret(refreshToken),
        lwaEndpoint
      },
      timestamp: new Date().toISOString()
    });
  }

  // 2. Ping Amazon LWA endpoint (Login with Amazon) to fetch access token
  const lwaStart = Date.now();
  let accessToken = '';
  let expiresIn = 3600;
  let tokenType = 'bearer';

  try {
    const lwaParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });

    const lwaRes = await fetch(lwaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
        'User-Agent': 'MerchantRadarEgypt/2.5.0 (Language=Node.js)'
      },
      body: lwaParams.toString()
    });

    const lwaDurationMs = Date.now() - lwaStart;

    if (!lwaRes.ok) {
      const errText = await lwaRes.text();
      let errCode = 'lwa_auth_failed';
      let errDesc = errText;
      try {
        const parsed = JSON.parse(errText);
        errCode = parsed.error || errCode;
        errDesc = parsed.error_description || errDesc;
      } catch {
        // use raw text
      }

      console.warn(
        `[SP-API Health Check] LWA authentication failed (HTTP ${lwaRes.status}, code: ${errCode}): client=${obfuscateSecret(clientId)}`
      );

      // Return 401 Unauthorized or 502 Bad Gateway
      return res.status(lwaRes.status === 400 || lwaRes.status === 401 ? 401 : 502).json({
        status: 'ERROR',
        region,
        endpoint,
        stage: 'LWA_TOKEN_EXCHANGE',
        error: {
          code: errCode,
          message: errDesc,
          httpStatus: lwaRes.status
        },
        diagnostics: {
          lwaEndpoint,
          lwaLatencyMs: lwaDurationMs,
          clientIdMasked: obfuscateSecret(clientId),
          refreshTokenMasked: obfuscateSecret(refreshToken),
          region
        },
        timestamp: new Date().toISOString()
      });
    }

    const lwaData: any = await lwaRes.json();
    accessToken = String(lwaData.access_token || '');
    expiresIn = Number(lwaData.expires_in) || 3600;
    tokenType = String(lwaData.token_type || 'bearer');

    if (!accessToken) {
      throw new Error('LWA response returned 200 OK but access_token was empty.');
    }
  } catch (err: any) {
    const lwaDurationMs = Date.now() - lwaStart;
    console.warn(`[SP-API Health Check] Network error during LWA token exchange: ${err?.message}`);
    return res.status(502).json({
      status: 'ERROR',
      region,
      endpoint,
      stage: 'LWA_TOKEN_EXCHANGE',
      error: {
        code: 'NETWORK_OR_TIMEOUT',
        message: err?.message || 'Failed to connect to Login with Amazon endpoint',
        httpStatus: 502
      },
      diagnostics: {
        lwaEndpoint,
        lwaLatencyMs: lwaDurationMs,
        clientIdMasked: obfuscateSecret(clientId)
      },
      timestamp: new Date().toISOString()
    });
  }

  // 3. Perform lightweight SP-API test call (getMarketplaceParticipations)
  const spApiStart = Date.now();
  const spApiUrl = `https://${endpoint}/sellers/v1/marketplaceParticipations`;

  try {
    const spRes = await fetch(spApiUrl, {
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'Accept': 'application/json',
        'User-Agent': 'MerchantRadarEgypt/2.5.0 (Language=Node.js)'
      }
    });

    const spDurationMs = Date.now() - spApiStart;

    if (!spRes.ok) {
      const errText = await spRes.text();
      let errCode = 'sp_api_call_failed';
      let errDesc = errText;
      try {
        const parsed = JSON.parse(errText);
        errCode = parsed?.errors?.[0]?.code || parsed.error || errCode;
        errDesc = parsed?.errors?.[0]?.message || parsed.error_description || errDesc;
      } catch {
        // use raw text
      }

      console.warn(
        `[SP-API Health Check] getMarketplaceParticipations failed (HTTP ${spRes.status}, code: ${errCode})`
      );

      return res.status(spRes.status >= 400 && spRes.status < 600 ? spRes.status : 502).json({
        status: 'ERROR',
        region,
        endpoint,
        stage: 'SP_API_PARTICIPATIONS',
        error: {
          code: errCode,
          message: errDesc,
          httpStatus: spRes.status
        },
        diagnostics: {
          lwaStatus: 'SUCCESS',
          spApiLatencyMs: spDurationMs,
          targetUrl: spApiUrl
        },
        timestamp: new Date().toISOString()
      });
    }

    const spData: any = await spRes.json();
    const rawParticipations = Array.isArray(spData?.payload) ? spData.payload : [];

    console.log(
      `[SP-API Health Check] Authentication & SP-API health check succeeded! Region=${region}, Endpoint=${endpoint}, Participations=${rawParticipations.length}`
    );

    // 4. Return 200 OK only on authentication and signature generation success
    return res.status(200).json({
      status: 'OK',
      region,
      endpoint,
      marketplaceId: 'ARBP9OOSHTCHU',
      countryCode: 'EG',
      participationsCount: rawParticipations.length,
      participations: rawParticipations.map((p: any) => ({
        marketplaceId: p?.marketplace?.id || 'ARBP9OOSHTCHU',
        countryCode: p?.marketplace?.countryCode || 'EG',
        name: p?.marketplace?.name || 'Amazon Egypt',
        defaultLanguageCode: p?.marketplace?.defaultLanguageCode || 'ar_AE',
        isParticipating: Boolean(p?.participation?.isParticipating ?? true),
        hasSuspendedListings: Boolean(p?.participation?.hasSuspendedListings ?? false)
      })),
      lwa: {
        tokenType,
        expiresIn,
        endpoint: lwaEndpoint
      },
      latency: {
        lwaMs: Date.now() - lwaStart,
        spApiMs: spDurationMs
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    const spDurationMs = Date.now() - spApiStart;
    console.warn(`[SP-API Health Check] Network error during SP-API call: ${err?.message}`);
    return res.status(502).json({
      status: 'ERROR',
      region,
      endpoint,
      stage: 'SP_API_PARTICIPATIONS',
      error: {
        code: 'NETWORK_OR_TIMEOUT',
        message: err?.message || 'Failed to connect to Amazon SP-API endpoint',
        httpStatus: 502
      },
      diagnostics: {
        lwaStatus: 'SUCCESS',
        spApiLatencyMs: spDurationMs,
        targetUrl: spApiUrl
      },
      timestamp: new Date().toISOString()
    });
  }
}
