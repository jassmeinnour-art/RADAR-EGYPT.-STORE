export default function handler(_req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(200).json({
    success: true,
    version: '2.5.0',
    bootTime: 1760000000000,
    environment: 'production',
  });
}
