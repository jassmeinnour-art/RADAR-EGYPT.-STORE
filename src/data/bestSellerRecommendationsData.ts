export interface BestSellerRecommendation {
  id: string;
  product: any;
  category: string;
  categoryKey?: string;
  rank?: number;
  bestSellerRank?: number;
  salesVelocity?: string;
  dailySalesEstimate?: number;
  marginPotential?: string;
  expectedProfitMarginPercent?: number;
  trendingScore?: number;
  reason?: string;
  recommendationReason?: string;
  categoryBadge?: string;
  importOriginBadge?: string;
  urgencyBadge?: string;
  netProfitPerUnitEGP?: number;
  supplierStockAlert?: string;
  demandMomentumPercent?: number;
}

export const BEST_SELLER_CATEGORIES = [
  { id: 'all', key: 'all', name: 'جميع الفئات', label: 'جميع الفئات', icon: 'Flame' },
  { id: 'electronics', key: 'electronics', name: 'إلكترونيات', label: 'إلكترونيات', icon: 'Zap' },
  { id: 'fashion', key: 'fashion', name: 'أزياء وموضة', label: 'أزياء وموضة', icon: 'Sparkles' },
  { id: 'home', key: 'home', name: 'مستلزمات منزلية', label: 'مستلزمات منزلية', icon: 'ShoppingBag' }
];

export const PROACTIVE_BEST_SELLER_RECOMMENDATIONS: BestSellerRecommendation[] = [];

export const bestSellerRecommendationsData = [];

