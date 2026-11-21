import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT_DIR = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SW_PATH = path.join(PUBLIC_DIR, 'sw.js');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');

function extractStringArray(source: string, constName: string): string[] {
  const regex = new RegExp(`const\\s+${constName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`);
  const match = source.match(regex);
  if (!match) return [];
  return vm.runInNewContext(match[1]) as string[];
}

function createSwHarness() {
  const source = fs.readFileSync(SW_PATH, 'utf-8');
  const listeners: Record<string, Array<(event: any) => void>> = {};
  const cacheStore = new Map<string, Map<string, Response>>();

  const getCacheMap = (name: string) => {
    if (!cacheStore.has(name)) cacheStore.set(name, new Map());
    return cacheStore.get(name)!;
  };

  const mockCaches = {
    open: vi.fn(async (name: string) => {
      const map = getCacheMap(name);
      return {
        add: vi.fn(async (url: string) => {
          map.set(url, new Response(`cached:${url}`, { status: 200 }));
        }),
        put: vi.fn(async (req: any, res: Response) => {
          const key = typeof req === 'string' ? req : req.url;
          map.set(key, res);
        }),
        match: vi.fn(async (req: any) => {
          const key = typeof req === 'string' ? req : req.url;
          if (map.has(key)) return map.get(key);
          try {
            const pathname = new URL(key, 'https://radaregypt.store').pathname;
            return map.get(pathname);
          } catch {
            return undefined;
          }
        }),
      };
    }),
    match: vi.fn(async (req: any) => {
      const key = typeof req === 'string' ? req : req.url;
      for (const map of cacheStore.values()) {
        if (map.has(key)) return map.get(key);
        try {
          const pathname = new URL(key, 'https://radaregypt.store').pathname;
          if (map.has(pathname)) return map.get(pathname);
        } catch {
          // ignore
        }
      }
      return undefined;
    }),
    keys: vi.fn(async () => Array.from(cacheStore.keys())),
    delete: vi.fn(async (name: string) => cacheStore.delete(name)),
  };

  const mockFetch = vi.fn(async () => new Response('ok', { status: 200 }));

  const sandbox: any = {
    URL,
    Response,
    Request,
    Headers,
    caches: mockCaches,
    fetch: mockFetch,
    console,
    Date,
    Promise,
    navigator: { onLine: true },
    self: {
      location: { origin: 'https://radaregypt.store', hostname: 'radaregypt.store' },
      skipWaiting: vi.fn(async () => {}),
      clients: {
        claim: vi.fn(async () => {}),
        matchAll: vi.fn(async () => []),
      },
      registration: {
        sync: { register: vi.fn(async () => {}) },
      },
      addEventListener: (type: string, cb: (event: any) => void) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(cb);
      },
    },
  };

  vm.runInNewContext(source, sandbox, { filename: 'public/sw.js' });

  return { source, listeners, mockCaches, mockFetch, cacheStore, sandbox };
}

describe('public/sw.js Offline Caching & index.html CSP Domain Alignment', () => {
  let indexHtml: string;
  let cspContent: string;

  beforeEach(() => {
    indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
    const cspMatch = indexHtml.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
    cspContent = cspMatch ? cspMatch[1] : '';
  });

  it('verifies public/sw.js exists, executes cleanly, and precaches existing assets', () => {
    expect(fs.existsSync(SW_PATH)).toBe(true);
    const { source, listeners } = createSwHarness();

    expect(listeners.install).toBeDefined();
    expect(listeners.activate).toBeDefined();
    expect(listeners.fetch).toBeDefined();
    expect(listeners.sync).toBeDefined();
    expect(listeners.message).toBeDefined();

    const precacheAssets = extractStringArray(source, 'PRECACHE_ASSETS');
    expect(precacheAssets).toContain('/');
    expect(precacheAssets).toContain('/index.html');
    expect(precacheAssets).toContain('/manifest.json');
    expect(precacheAssets).toContain('/pwa-192x192.png');
    expect(precacheAssets).toContain('/pwa-512x512.png');

    for (const asset of precacheAssets) {
      if (asset === '/') continue;
      const candidate =
        asset === '/index.html'
          ? INDEX_HTML_PATH
          : path.join(PUBLIC_DIR, asset.replace(/^\//, ''));
      expect(fs.existsSync(candidate)).toBe(true);
    }
  });

  it('aligns every allowed Service Worker cache host with index.html Content-Security-Policy', () => {
    const { source } = createSwHarness();
    const fontHosts = extractStringArray(source, 'ALLOWED_FONT_HOSTS');
    const cdnHosts = extractStringArray(source, 'ALLOWED_IMAGE_CDN_HOSTS');
    const appHosts = extractStringArray(source, 'ALLOWED_APP_HOSTS');

    expect(cspContent).toContain("worker-src 'self' blob:");
    expect(cspContent).toContain("manifest-src 'self'");

    for (const host of [...fontHosts, ...cdnHosts, ...appHosts]) {
      expect(cspContent).toContain(host);
    }
  });

  it('bypasses Supabase, Firebase, Analytics, and unlisted cross-origin domains on fetch', () => {
    const { listeners } = createSwHarness();
    const fetchHandler = listeners.fetch[0];

    const bypassedUrls = [
      'https://xyz.supabase.co/rest/v1/traders',
      'https://firestore.googleapis.com/v1/projects/demo',
      'https://generativelanguage.googleapis.com/v1beta/models',
      'https://static.cloudflareinsights.com/beacon.min.js',
      'https://va.vercel-scripts.com/v1/script.js',
      'https://vitals.vercel-insights.com/v1/vitals',
      'https://sellercentral.amazon.eg/inventory',
      'https://radaregypt.store/sw.js',
    ];

    for (const url of bypassedUrls) {
      const respondWith = vi.fn();
      fetchHandler({
        request: { method: 'GET', url, destination: 'empty', mode: 'cors' },
        respondWith,
      });
      expect(respondWith).not.toHaveBeenCalled();
    }
  });

  it('caches allowed same-origin assets, Google Fonts, and provides offline HTML fallback when uncached', async () => {
    const { listeners, mockFetch } = createSwHarness();
    const fetchHandler = listeners.fetch[0];

    // 1. Google Fonts CSS -> handled by SW
    const fontRespond = vi.fn();
    fetchHandler({
      request: {
        method: 'GET',
        url: 'https://fonts.googleapis.com/css2?family=Cairo',
        destination: 'style',
        mode: 'cors',
      },
      respondWith: fontRespond,
    });
    expect(fontRespond).toHaveBeenCalledTimes(1);
    await fontRespond.mock.calls[0][0];

    // 2. Navigation request offline -> falls back cleanly to Arabic Offline HTML
    mockFetch.mockRejectedValueOnce(new Error('Network offline'));
    const navRespond = vi.fn();
    fetchHandler({
      request: {
        method: 'GET',
        url: 'https://radaregypt.store/traders',
        destination: 'document',
        mode: 'navigate',
      },
      respondWith: navRespond,
    });
    expect(navRespond).toHaveBeenCalledTimes(1);
    const offlineResponse: Response = await navRespond.mock.calls[0][0];
    const html = await offlineResponse.text();
    expect(offlineResponse.status).toBe(200);
    expect(html).toContain('وضع دون اتصال');
  });

  it('validates public/manifest.json PWA installability fields and standard 192x192 & 512x512 PNG icons', () => {
    const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.id).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.name).toBe('رادار التاجر الذكي');
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);

    const icons: Array<{ src: string; sizes: string; type: string; purpose?: string }> = manifest.icons || [];
    const icon192 = icons.find((i) => i.sizes === '192x192' && i.purpose === 'any');
    const icon512 = icons.find((i) => i.sizes === '512x512' && i.purpose === 'any');
    const maskable512 = icons.find((i) => i.sizes === '512x512' && i.purpose === 'maskable');

    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
    expect(maskable512).toBeDefined();
    // Never mix "any maskable" in the same icon entry
    expect(icons.every((i) => i.purpose !== 'any maskable')).toBe(true);

    // Verify actual PNG files and pixel dimensions on disk
    for (const icon of [icon192!, icon512!, maskable512!]) {
      const filePath = path.join(PUBLIC_DIR, icon.src.replace(/^\//, ''));
      expect(fs.existsSync(filePath)).toBe(true);
      const buf = fs.readFileSync(filePath);
      expect(buf.slice(1, 4).toString()).toBe('PNG');
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      const [expectedW, expectedH] = icon.sizes.split('x').map(Number);
      expect(width).toBe(expectedW);
      expect(height).toBe(expectedH);
    }

    // Verify index.html links manifest, apple-touch-icon.png, 192x192 & 512x512 icons
    expect(indexHtml).toContain('<link rel="manifest" href="/manifest.json"');
    expect(indexHtml).toContain('href="/apple-touch-icon.png"');
    expect(indexHtml).toContain('sizes="192x192" href="/pwa-192x192.png"');
    expect(indexHtml).toContain('sizes="512x512" href="/pwa-512x512.png"');
  });
});

