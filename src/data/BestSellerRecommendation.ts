import { ProductData } from '@/types';
import { ReactNode } from 'react';


export interface BestSellerRecommendation {
  importOriginBadge?: ReactNode;
  product: ProductData;
  categoryKey: string;
  categoryTitle: string;
  categoryBadge: string;
  bestSellerRank: number;
  dailySalesEstimate: number;
  monthlyRevenueEstimateEGP: number;
  demandMomentumPercent: number;
  expectedProfitMarginPercent: number;
  netProfitPerUnitEGP: number;
  topSellingPlatform: string;
  topSellingPlatformBadge: string;
  recommendationReason: string;
  urgencyBadge: string;
  supplierStockAlert: string;
}
