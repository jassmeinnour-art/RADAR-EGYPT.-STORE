import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  title: string;
  sku?: string;
  asin?: string;
  price: number;
  image: string;
  inStock: boolean;
  link: string;
  platform?: string;
}

export function parseAmazonStorefront(html: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $('.s-result-item').each((_, el) => {
    const title = $(el).find('h2 a span, .s-title, span.a-size-base-plus, span.a-size-medium').first().text().trim();
    if (!title) return;

    const priceWhole = $(el).find('.a-price-whole').first().text().replace(/[^0-9]/g, '');
    const priceFraction = $(el).find('.a-price-fraction').first().text().replace(/[^0-9]/g, '');
    let price = 0;
    if (priceWhole) {
      price = parseFloat(`${priceWhole}${priceFraction ? '.' + priceFraction : ''}`) || 0;
    } else {
      const priceText = $(el).find('.a-price .a-offscreen').first().text().trim();
      price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    }

    const image = $(el).find('img.s-image, img').first().attr('src') || '';
    const asin = $(el).attr('data-asin') || '';
    let link = $(el).find('h2 a, a.a-link-normal').first().attr('href') || '';
    if (link && !link.startsWith('http')) {
      link = 'https://www.amazon.eg' + link;
    }

    const outOfStockText = $(el).text();
    const isOut = outOfStockText.includes('غير متوفر حالياً') || outOfStockText.includes('Currently unavailable');

    products.push({
      title,
      asin,
      sku: asin,
      price,
      image,
      inStock: !isOut && price > 0,
      link,
      platform: 'amazon'
    });
  });

  return products;
}

export function parseNoonHtml(html: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $('[data-qa="product-name"], div.productContainer, a[href*="/p/"]').each((_, el) => {
    let title = $(el).find('[data-qa="product-name"]').text().trim();
    if (!title && $(el).is('[data-qa="product-name"]')) {
      title = $(el).text().trim();
    }
    if (!title) {
      title = $(el).find('h2, span[title]').first().text().trim();
    }
    if (!title) return;

    const priceText = $(el).find('.amount, strong, [data-qa="product-price"]').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    const image = $(el).find('img').first().attr('src') || '';
    let link = $(el).attr('href') || $(el).find('a').attr('href') || '';
    if (link && !link.startsWith('http')) {
      link = 'https://www.noon.com' + link;
    }
    const skuMatch = link.match(/\/p\/([a-zA-Z0-9_-]+)/);
    const sku = skuMatch ? skuMatch[1] : `NOON-${Math.random().toString(36).substring(7)}`;

    products.push({
      title,
      sku,
      asin: sku,
      price,
      image,
      inStock: price > 0,
      link,
      platform: 'noon'
    });
  });

  return products;
}

export function parseJumiaHtml(html: string): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $('article.prd, .c-prd').each((_, el) => {
    const title = $(el).find('h3.name, .name').text().trim();
    if (!title) return;

    const priceText = $(el).find('.prc').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    const image = $(el).find('img.img').attr('data-src') || $(el).find('img').attr('src') || '';
    let link = $(el).find('a.core').attr('href') || '';
    if (link && !link.startsWith('http')) {
      link = 'https://www.jumia.com.eg' + link;
    }
    const skuMatch = link.match(/-([a-zA-Z0-9]+)\.html/);
    const sku = skuMatch ? skuMatch[1] : `JUMIA-${Math.random().toString(36).substring(7)}`;

    products.push({
      title,
      sku,
      asin: sku,
      price,
      image,
      inStock: price > 0,
      link,
      platform: 'jumia'
    });
  });

  return products;
}

/**
 * Headless browser scraper with puppeteer-core & @sparticuz/chromium
 * Optimized for serverless (Vercel / Cloud Run) execution with fallbacks
 */
export async function scrapeStorefrontHeadless(url: string, platformHint?: string): Promise<ScrapedProduct[]> {
  const isNoon = url.includes('noon.com') || platformHint === 'noon';
  const isJumia = url.includes('jumia.com') || platformHint === 'jumia';
  const isAmazon = url.includes('amazon') || platformHint === 'amazon';

  let browser: any = null;

  // 1. Try headless Puppeteer browser execution with dynamic import if installed
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
        const chromiumMod = await import('@sparticuz/chromium').catch(() => null);
        if (chromiumMod && chromiumMod.default) {
          chromiumMod.default.setGraphicsMode = false;
          executablePath = await chromiumMod.default.executablePath();
        }
      } catch {
        executablePath = '/usr/bin/google-chrome';
      }
    }

    const puppeteerMod = await import('puppeteer-core').catch(() => null);
    if (executablePath && puppeteerMod && puppeteerMod.default) {
      const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'];

      browser = await puppeteerMod.default.launch({
        args: launchArgs,
        defaultViewport: { width: 1280, height: 800 },
        executablePath,
        headless: true,
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
      });

      // Navigate to store URL with timeout
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Allow client-side hydration for Noon & Jumia SPAs
      if (isNoon) {
        await page.waitForSelector('[data-qa="product-name"], div.productContainer, a[href*="/p/"]', { timeout: 7000 }).catch(() => {});
      } else if (isJumia) {
        await page.waitForSelector('article.prd, .c-prd, .name', { timeout: 7000 }).catch(() => {});
      } else {
        await page.waitForSelector('.s-result-item, [data-asin]', { timeout: 7000 }).catch(() => {});
      }

      const content = await page.content();

      if (isNoon) {
        const parsed = parseNoonHtml(content);
        if (parsed.length > 0) return parsed;
      } else if (isJumia) {
        const parsed = parseJumiaHtml(content);
        if (parsed.length > 0) return parsed;
      } else {
        const parsed = parseAmazonStorefront(content);
        if (parsed.length > 0) return parsed;
      }
    }
  } catch (headlessErr: any) {
    console.warn('[Scraper Headless Notice] Headless browser execution failed, falling back to direct parser:', headlessErr?.message || headlessErr);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
  }

  // 2. Resilient Fallback: direct HTTP fetch with realistic browser headers
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    };
    const res = await fetch(url, { headers });
    if (res.ok) {
      const html = await res.text();
      if (isNoon) {
        const noonProds = parseNoonHtml(html);
        if (noonProds.length > 0) return noonProds;
      } else if (isJumia) {
        const jumiaProds = parseJumiaHtml(html);
        if (jumiaProds.length > 0) return jumiaProds;
      } else {
        const amzProds = parseAmazonStorefront(html);
        if (amzProds.length > 0) return amzProds;
      }
    }
  } catch (fetchErr: any) {
    console.warn('[Scraper Direct Fetch Error]:', fetchErr?.message || fetchErr);
  }

  return [];
}

