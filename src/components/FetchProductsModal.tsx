import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Trader } from '../lib/supabase';

interface FetchProductsModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export const FetchProductsModal: React.FC<FetchProductsModalProps> = ({ trader, isOpen, onClose, onShowToast }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStats, setFetchStats] = useState<{ total: number; new: number; updated: number } | null>(null);

  if (!isOpen) return null;

  const handleStartFetch = async () => {
    setIsFetching(true);
    try {
      // Mocking the scraping/fetching process as per requirements (placeholder API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulating API response
      const mockResult = { total: 45, new: 40, updated: 5 };
      setFetchStats(mockResult);
      localStorage.setItem('radar_last_sync_stats', JSON.stringify(mockResult));
      if (onShowToast) onShowToast(`✅ تم سحب ${mockResult.total} منتج بنجاح!`);
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل السحب: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">سحب كل منتجات المتجر</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="space-y-4 text-slate-300 text-sm">
          <div className="p-4 bg-slate-800/50 rounded-xl space-y-2">
            <p><span className="font-bold">التاجر:</span> {trader.seller_name}</p>
            <p><span className="font-bold">حساب الجيميل:</span> {trader.email}</p>
            <p><span className="font-bold">Seller ID:</span> {trader.seller_id || 'غير محدد'}</p>
            <p><span className="font-bold">لينك الوجهة:</span> <a href={trader.seller_link} target="_blank" rel="noreferrer" className="text-sky-400 underline">{trader.seller_link || 'لا يوجد'}</a></p>
          </div>
          
          {fetchStats ? (
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-lg font-black text-emerald-400">تم السحب بنجاح</p>
              <p className="text-xs text-emerald-200">إجمالي: {fetchStats.total} - جديد: {fetchStats.new} - محدث: {fetchStats.updated}</p>
            </div>
          ) : (
            <button 
              onClick={handleStartFetch}
              disabled={isFetching}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {isFetching ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري السحب...</> : 'ابدأ السحب الآن'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
