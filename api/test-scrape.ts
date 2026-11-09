import { scrapeStorefrontHeadless } from '../src/utils/scraper';

export default async function handler(req: any, res: any) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  try {
    const seller_link = (req.query?.seller_link as string) || (req.query?.url as string) || (req.body?.seller_link as string);
    if (!seller_link) {
      return res.status(400).json({ success: false, error: 'يرجى تقديم رابط المتجر عبر معامل seller_link' });
    }

    const products = await scrapeStorefrontHeadless(seller_link);
    return res.status(200).json({
      success: true,
      url: seller_link,
      count: products.length,
      products
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Error scraping storefront' });
  }
}
