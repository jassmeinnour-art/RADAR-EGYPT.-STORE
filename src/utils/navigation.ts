/**
 * Client-Side SPA Navigation Helper
 * Safely updates URL history and triggers popstate for custom route handlers
 */
export function navigate(url: string): void {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
