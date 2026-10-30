import React from 'react';
import { AllMerchantsDirectoryDrawer, AllMerchantsDirectoryDrawerProps } from './AllMerchantsDirectoryDrawer';

export interface MerchantDirectoryProps extends AllMerchantsDirectoryDrawerProps {}

export const MerchantDirectory: React.FC<MerchantDirectoryProps> = (props) => {
  return <AllMerchantsDirectoryDrawer {...props} />;
};

export default MerchantDirectory;
