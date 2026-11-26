/**
 * Client-Side SPA Navigation & Path Resolvers
 * Safely resolves routes, updates URL history, and triggers popstate for route handlers
 */

export type WorkspaceTab =
  | 'home'
  | 'dashboard'
  | 'traders'
  | 'products'
  | 'inventory'
  | 'product_image_studio'
  | 'import_history'
  | 'merchants'
  | 'radar'
  | 'watchlist'
  | 'ai_studio'
  | 'shipping'
  | 'trending'
  | 'reports'
  | 'auto_pricing'
  | 'price_comparison'
  | 'platforms_guide'
  | 'traders_sync'
  | 'split_invoices'
  | 'help'
  | 'analytics'
  | 'layout_settings'
  | 'dark_palette_settings'
  | 'account_settings'
  | 'amazon_callback'
  | 'not_found';

export const TAB_TO_PATH_MAP: Partial<Record<WorkspaceTab, string>> = {
  home: '/',
  dashboard: '/dashboard',
  traders: '/traders',
  products: '/products',
  merchants: '/products',
  inventory: '/inventory',
  product_image_studio: '/image-studio',
  import_history: '/import-history',
  shipping: '/invoices',
  split_invoices: '/invoices/split',
  reports: '/reports',
  trending: '/trending',
  radar: '/competitors',
  auto_pricing: '/auto-pricing',
  price_comparison: '/price-comparison',
  watchlist: '/watchlist',
  analytics: '/analytics',
  platforms_guide: '/connections',
  traders_sync: '/gmail-sync',
  layout_settings: '/settings/layout',
  dark_palette_settings: '/settings/dark-theme',
  account_settings: '/settings',
  amazon_callback: '/auth/amazon-callback',
  help: '/help',
};

export function resolvePathToTab(rawPath: string): WorkspaceTab {
  const pathWithoutQuery = (rawPath || '/').split('?')[0].split('#')[0];
  const normalized = pathWithoutQuery.replace(/\/+$/, '') || '/';

  if (normalized === '/auth/amazon-callback') return 'amazon_callback';
  if (normalized === '/' || normalized === '/index.html' || normalized === '/login') return 'home';
  if (normalized === '/dashboard') return 'dashboard';
  if (normalized === '/traders' || normalized.startsWith('/traders/')) return 'traders';
  if (normalized === '/products') return 'products';
  if (normalized === '/inventory') return 'inventory';
  if (normalized === '/image-studio' || normalized === '/studio') return 'product_image_studio';
  if (normalized === '/import-history') return 'import_history';
  if (normalized === '/invoices') return 'shipping';
  if (normalized === '/invoices/split') return 'split_invoices';
  if (normalized === '/reports') return 'reports';
  if (normalized === '/trending') return 'trending';
  if (normalized === '/competitors') return 'radar';
  if (normalized === '/auto-pricing') return 'auto_pricing';
  if (normalized === '/price-comparison') return 'price_comparison';
  if (normalized === '/watchlist') return 'watchlist';
  if (normalized === '/analytics') return 'analytics';
  if (normalized === '/connections') return 'platforms_guide';
  if (normalized === '/gmail-sync') return 'traders_sync';
  if (normalized === '/settings/layout') return 'layout_settings';
  if (normalized === '/settings/dark-theme' || normalized === '/settings/dark-mode') return 'dark_palette_settings';
  if (normalized === '/settings' || normalized === '/account-settings') return 'account_settings';
  if (normalized === '/help') return 'help';
  return 'not_found';
}

export function resolveTabToPath(tab: WorkspaceTab): string {
  return TAB_TO_PATH_MAP[tab] || '/';
}

export function navigate(url: string): void {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
