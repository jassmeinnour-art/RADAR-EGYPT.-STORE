import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SalesAggregatorService } from '../services/SalesAggregatorService';
import { BarChart3 } from 'lucide-react';

export const SalesTrendsWidget: React.FC = () => {
  const salesData = useMemo(() => {
    const result = SalesAggregatorService.aggregateTopSellers(7);
    if (!result.success) return [];
    
    // Transform to weekly trend (mocking timeline for now since SalesAggregatorService doesn't provide time-series)
    return result.data.map(item => ({
      name: item.productName,
      sales: item.totalQuantitySold,
    }));
  }, []);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">اتجاهات المبيعات الأسبوعية</h2>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} />
            <YAxis stroke="#94a3b8" tick={{fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
            />
            <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
