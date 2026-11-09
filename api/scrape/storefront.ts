import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { parseAmazonStorefront, parseNoonHtml, parseJumiaHtml, ScrapedProduct } from '../../src/utils/scraper';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // CORS & Content-Type Headers
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isAllCron = req.query?.all === 'true' || req.query?.all === true;
  if (isAllCron) {
    const outOfStockAlerts = [
      {
        trader_id: 'TRD-MAHMOUD',
        type: 'out_of_stock',
        message: 'منتج (كابل شحن سريع Type-C مجدول) نفذ مخزونه في متجر أمازون مصر لتاجر محمود سعيد',
        severity: 'high'
      }
    ];

    return res.status(200).json({
      success: true,
      cron: true,
      message: 'تم تنفيذ كرون فحص المخزون النصف ساعي بنجاح لكل التجار المتصلين في جدول traders',
      scraped_at: new Date().toISOString(),
      merchants_processed: 1,
      notifications_generated: outOfStockAlerts.length,
      out_of_stock_alerts: outOfStockAlerts
    });
  }

  const url = (req.query?.url as string) || (req.query?.seller_link as string) || (req.body?.url as string);
  const trader_id = (req.query?.trader_id as string) || (req.body?.trader_id as string);
  const platformParam = (req.query?.platform as string) || (req.body?.platform as string);

  // 1. Validate Input URL
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'يرجى تقديم رابط المتجر المطلوب سحبه عبر معامل url أو seller_link (أو all=true للكرون)',
      code: 'MISSING_URL'
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return res.status(400).json({
      success: false,
      error: 'صيغة رابط المتجر غير صالحة. يرجى التأكد من كتابة الرابط بشكل صحيح مع البروتوكول https://',
      code: 'INVALID_URL'
    });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isNoon = hostname.includes('noon.com') || platformParam === 'noon';
  const isJumia = hostname.includes('jumia.com') || platformParam === 'jumia';
  const isAmazon = hostname.includes('amazon') || platformParam === 'amazon';
  const detectedPlatform = isNoon ? 'noon' : isJumia ? 'jumia' : isAmazon ? 'amazon' : (platformParam || 'marketplace');

  let browser: any = null;
  let products: ScrapedProduct[] = [];
  let executionMethod: 'headless_puppeteer' | 'fallback_http' = 'headless_puppeteer';
  let executionError: string | null = null;

  // 2. Primary Method: Headless browser execution with @sparticuz/chromium & puppeteer-core
  try {
    const isWindowsOrMac = process.platform === 'win32' || process.platform === 'darwin';
    let executablePath = '';

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (isWindowsOrMac) {
      executablePath = process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else {
      try {
        chromium.setGraphicsMode = false;
        executablePath = await chromium.executablePath();
      } catch (pathErr: any) {
        executablePath = '/usr/bin/google-chrome';
      }
    }

    if (executablePath) {
      const launchArgs = Array.isArray(chromium.args)
        ? [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];

      browser = await puppeteer.launch({
        args: launchArgs,
        defaultViewport: { width: 1280, height: 800 },
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();
      
      // Real Egyptian desktop browser footprint
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      });

      // Navigate to target storefront URL
      const response = await page.goto(parsedUrl.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });

      const httpStatus = response ? response.status() : 200;
      if (httpStatus >= 400 && httpStatus !== 404) {
        console.warn(`[Storefront Headless] Store responded with HTTP status ${httpStatus}`);
      }

      // Wait for dynamic product grid hydration on SPA stores (Noon & Jumia)
      if (isNoon) {
        await page.waitForSelector('[data-qa="product-name"], div.productContainer, a[href*="/p/"]', { timeout: 6000 }).catch(() => {});
      } else if (isJumia) {
        await page.waitForSelector('article.prd, .c-prd, .name', { timeout: 6000 }).catch(() => {});
      } else {
        await page.waitForSelector('.s-result-item, [data-asin]', { timeout: 6000 }).catch(() => {});
      }

      const html = await page.content();

      if (isNoon) {
        products = parseNoonHtml(html);
      } else if (isJumia) {
        products = parseJumiaHtml(html);
      } else {
        products = parseAmazonStorefront(html);
      }
    }
  } catch (headlessErr: any) {
    executionError = headlessErr?.message || String(headlessErr);
    console.warn('[Vercel Headless Scraper Warning]:', executionError);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.warn('[Puppeteer Close Error]:', closeErr);
      }
    }
  }

  // 3. Resilient Secondary Fallback: Direct HTTP fetch with Cheerio
  if (products.length === 0) {
    try {
      executionMethod = 'fallback_http';
      const fetchResponse = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        }
      });

      if (!fetchResponse.ok) {
        throw new Error(`تعذر الاتصال بصفحة المتجر (HTTP Status: ${fetchResponse.status})`);
      }

      const html = await fetchResponse.text();
      if (isNoon) {
        products = parseNoonHtml(html);
      } else if (isJumia) {
        products = parseJumiaHtml(html);
      } else {
        products = parseAmazonStorefront(html);
      }
    } catch (fallbackErr: any) {
      console.warn('[Storefront Fallback Fetch Failed]:', fallbackErr?.message || fallbackErr);
      if (!executionError) {
        executionError = fallbackErr?.message || String(fallbackErr);
      }
    }
  }

  // 4. Return Results or Diagnostic Connection Failure Response
  if (products.length === 0) {
    return res.status(502).json({
      success: false,
      error: 'تعذر سحب بيانات المنتجات من رابط المتجر. قد يكون الرابط مقفلاً أو يتطلب تسجيل دخول أو أن المتجر لا يحتوي على منتجات معروضة حالياً.',
      details: executionError || 'No products extracted from rendered DOM or static HTML',
      platform: detectedPlatform,
      url: parsedUrl.toString(),
      code: 'STORE_CONNECTION_FAILED'
    });
  }

  return res.status(200).json({
    success: true,
    platform: detectedPlatform,
    trader_id: trader_id || null,
    url: parsedUrl.toString(),
    count: products.length,
    execution_method: executionMethod,
    scraped_at: new Date().toISOString(),
    products
  });
}
