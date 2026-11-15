import React, { useEffect, useState } from 'react';
import { getPriceHistory, PriceHistoryEntry } from '../utils/priceHistoryManager';
import { auth } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { EmergencyLoginButton } from './EmergencyLoginButton';

export const PriceHistoryChart: React.FC<{ productId: string }> = ({ productId }) => {
  const [data, setData] = useState<PriceHistoryEntry[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        if (auth.currentUser) {
          const history = await getPriceHistory(auth.currentUser.uid, productId);
          setData(history);
        }
      } catch {
        setHasError(true);
      }
    }
    loadHistory();
  }, [productId]);

  if (hasError) {
    return (
      <div className="space-y-2 text-right">
        <div>لا توجد بيانات</div>
        <EmergencyLoginButton />
      </div>
    );
  }
  if (data.length === 0) return <div>لا توجد بيانات — لا يوجد سجل أسعار لهذا المنتج بعد.</div>;

  const chartData = data.map(entry => {
    const date = entry.timestamp instanceof Timestamp ? entry.timestamp.toDate() : new Date(entry.timestamp);
    return {
      date: date.toLocaleDateString('ar-EG'),
      price: entry.price
    };
  });

  return (
    <div className="h-64 w-full">
    </div>
  );
};
