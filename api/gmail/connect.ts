import { google } from 'googleapis';

export default async function handler(req: any, res: any) {
  const trader_id = (req.query?.trader_id as string) || (req.body?.trader_id as string);
  if (!trader_id) {
    return res.status(400).json({ error: 'Trader ID is required' });
  }

  const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || 'localhost:3000';
  const proto = (req.headers && req.headers['x-forwarded-proto']) || 'https';
  const redirectUri = `${proto}://${host}/api/gmail/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state: trader_id,
    prompt: 'consent'
  });

  if (typeof res.redirect === 'function') {
    return res.redirect(authUrl);
  } else {
    return res.status(200).json({ success: true, authUrl });
  }
}
