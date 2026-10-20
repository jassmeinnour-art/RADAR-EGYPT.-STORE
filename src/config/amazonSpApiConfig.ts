/**
 * Amazon Selling Partner API (SP-API) Multi-Tenant Configuration
 * Complies with official Amazon LWA & SP-API Security Standards:
 * - Client Secrets and Refresh Tokens are NEVER hardcoded in client-side code or exposed in URLs.
 * - Token exchange (`grant_type=refresh_token` -> `https://api.amazon.com/auth/o2/token`) is executed strictly on the server.
 * - Merchant Refresh Tokens are stored encrypted (`ENC_LWA_V1:...`) in Firestore / LocalStorage vault.
 */
export const AMAZON_SP_API_CONFIG = {
  // 1. Official Login with Amazon (LWA) Token Exchange Endpoint
  LWA_TOKEN_ENDPOINT: 'https://api.amazon.com/auth/o2/token',
  LWA_GRANT_TYPE: 'refresh_token',

  // 2. Non-sensitive Regional & Marketplace Identifiers (Egypt Marketplace)
  DEFAULT_REGION: 'eu-west-1',
  DEFAULT_MARKETPLACE_ID: 'ARBP9OOSHTCHU',
  DEFAULT_SELLER_ID: 'A2EUQ1WTGCTBG2',

  // 3. Server-side managed indicators (Secrets & Refresh Tokens are resolved and decrypted server-side only)
  DEFAULT_CLIENT_ID: '',
  DEFAULT_CLIENT_SECRET: '',
  DEFAULT_REFRESH_TOKEN: '',
  DEFAULT_NOON_AUTH_KEY: ''
} as const;

