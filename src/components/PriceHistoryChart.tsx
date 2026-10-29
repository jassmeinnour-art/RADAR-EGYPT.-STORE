import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPriceHistory, PriceHistoryEntry } from '../utils/priceHistoryManager';
import { auth } from '../firebase';
import { Timestamp } from 'firebase/firestore';

export const PriceHistoryChart: React.FC<{ productId: string }> = ({ productId }) => {
  const [data, setData] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (auth.currentUser) {
        const history = await getPriceHistory(auth.currentUser.uid, productId);
        setData(history);
      }
      setLoading(false);
    }
    loadHistory();
  }, [productId]);

  if (loading) return <div>جاري تحميل البيانات...</div>;
  if (data.length === 0) return <div>لا يوجد سجل أسعار لهذا المنتج بعد.</div>;

  const chartData = data.map(entry => {
    const date = entry.timestamp instanceof Timestamp ? entry.timestamp.toDate() : new Date(entry.timestamp);
    return {
      date: date.toLocaleDateString('ar-EG'),
      price: entry.price
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
