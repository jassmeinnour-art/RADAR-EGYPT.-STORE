import React from 'react';
import { PriceHistoryChart } from './PriceHistoryChart';
import { X } from 'lucide-react';

interface Props {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<Props> = ({ productId, productTitle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-black text-slate-900 mb-4">سجل أسعار: {productTitle}</h2>
        <PriceHistoryChart productId={productId} />
      </div>
    </div>
  );
};
