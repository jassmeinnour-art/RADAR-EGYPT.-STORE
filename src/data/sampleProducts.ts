export const sampleProducts = [];

export const INITIAL_CONNECTED_PLATFORMS: any[] = [
  {
    id: 'p-amazon',
    name: 'أمازون مصر (Amazon.eg)',
    code: 'amazon_eg',
    sellerName: 'متجر التاجر',
    sellerId: 'SEL-AMZ-EG-101',
    isConnected: true,
    autoSyncPrice: true,
    status: 'active' as const,
    commissionFeePercent: 12
  },
  {
    id: 'p-noon',
    name: 'نون مصر (Noon.com)',
    code: 'noon_eg',
    sellerName: 'متجر التاجر',
    sellerId: 'SEL-NOON-EG-202',
    isConnected: true,
    autoSyncPrice: true,
    status: 'active' as const,
    commissionFeePercent: 10
  },
  {
    id: 'p-jumia',
    name: 'جوميا مصر (Jumia.com.eg)',
    code: 'jumia_eg',
    sellerName: 'متجر التاجر',
    sellerId: 'SEL-JUMIA-EG-303',
    isConnected: false,
    autoSyncPrice: false,
    status: 'disconnected' as const,
    commissionFeePercent: 14
  }
];

