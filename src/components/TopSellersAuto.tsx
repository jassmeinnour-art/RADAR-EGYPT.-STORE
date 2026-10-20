// ميزة الترشيح التلقائي للمنتجات الأكثر مبيعاً - تعمل تلقائياً On Launch
import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Bell } from 'lucide-react';

export interface TopSellerProduct {
  id: string;
  title: string;
  category: string;
  platform: string;
  salesRank: number;
  trendingScore: number;
  price: number;
  imageUrl?: string;
  lastUpdated: string;
}

export default function TopSellersAuto() {
  const [topSellers, setTopSellers] = useState<TopSellerProduct[]>([]);
  const [isAutoFiltering, setIsAutoFiltering] = useState(true);
  const [lastAutoUpdate, setLastAutoUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const fetchTopSellersAutomatically = async () => {
      setIsAutoFiltering(true);
      try {
        // بيانات تجريبية - استبدليها ب API الحقيقي لنون وامازون وزون
        const mockData: TopSellerProduct[] = [
          { id: '1', title: 'سماعة بلوتوث الأكثر مبيعاً - إلكترونيات', category: 'electronics', platform: 'noon', salesRank: 1, trendingScore: 98, price: 1200, lastUpdated: new Date().toISOString() },
          { id: '2', title: 'تيشيرت ترند 2026 - أزياء', category: 'fashion', platform: 'amazon', salesRank: 2, trendingScore: 95, price: 450, lastUpdated: new Date().toISOString() },
          { id: '3', title: 'خلاط كهربائي - أدوات منزلية', category: 'home', platform: 'jumia', salesRank: 3, trendingScore: 92, price: 850, lastUpdated: new Date().toISOString() },
          { id: '4', title: 'منتج تجميل ترند', category: 'beauty', platform: 'noon', salesRank: 4, trendingScore: 90, price: 250, lastUpdated: new Date().toISOString() },
        ];
        // محاكاة تحميل
        await new Promise(r => setTimeout(r, 1000));
        setTopSellers(mockData);
        setLastAutoUpdate(new Date().toISOString());
      } catch (e) {
        console.error('Auto filter failed', e);
      } finally {
        setIsAutoFiltering(false);
      }
    };

    fetchTopSellersAutomatically();
    // تحديث تلقائي في الخلفية كل 5 دقائق
    const interval = setInterval(fetchTopSellersAutomatically, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isAutoFiltering) {
    return (
      <div className="flex items-center gap-3 p-5 bg-blue-50 rounded-xl border border-blue-200">
        <Loader2 className="animate-spin text-blue-600" />
        <span className="font-medium">جاري الترشيح التلقائي للمنتجات الأكثر مبيعاً من كل المنصات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-sm border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-red-500" /> الأكثر مبيعاً - تحديث تلقائي
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Bell size={14} />
          <span>آخر تحديث: {new Date(lastAutoUpdate).toLocaleTimeString('ar-EG')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topSellers.map(p => (
          <div key={p.id} className="border p-4 rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">#{p.salesRank} ترند</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.platform}</span>
            </div>
            <p className="font-semibold text-sm mb-1">{p.title}</p>
            <p className="text-xs text-gray-500 mb-2">{p.category}</p>
            <p className="text-green-600 font-bold">{p.price} ج.م</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${p.trendingScore}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">نسبة الرواج {p.trendingScore}%</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400">يتم التحديث تلقائياً في الخلفية كل 5 دقائق بدون تدخل التاجر ✅</p>
    </div>
  );
}
