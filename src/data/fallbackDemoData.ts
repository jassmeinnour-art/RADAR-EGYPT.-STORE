export const fallbackDemoData = [];
export const FALLBACK_DEMO_ORDERS: any[] = [];
export const FALLBACK_DEMO_PRODUCTS: any[] = [];

export function getFallbackDemoOrders(): any[] {
  return FALLBACK_DEMO_ORDERS;
}

export function getFallbackDemoProducts(): any[] {
  return FALLBACK_DEMO_PRODUCTS;
}

export function exportFallbackManifestCsv(orders: any[] = []): void {
  const headers = ['Order ID', 'Customer', 'Status', 'Total'];
  const rows = (orders || []).map(o => [o.id || '', o.customerName || '', o.status || '', o.total || 0]);
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `manifest_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFallbackCatalogCsv(products: any[] = []): void {
  const headers = ['Product ID', 'Title', 'Price'];
  const rows = (products || []).map(p => [p.id || '', p.title || '', p.price || 0]);
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `catalog_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

