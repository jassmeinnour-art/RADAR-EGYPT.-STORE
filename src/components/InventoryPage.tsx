import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Layers, 
  ExternalLink, 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  TrendingUp, 
  Boxes,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { supabase, Trader } from '../lib/supabase';
import { navigate } from '../utils/navigation';

interface InventoryItem {
  id: string;
  trader_id: string;
  platform: string;
  sku: string;
  asin?: string;
  title?: string;
  stock_quantity: number;
  price: number;
  last_sync?: string;
  created_at?: string;
  traders?: {
    seller_name: string;
  } | null;
}

interface InventoryPageProps {
  onShowToast?: (message: string) => void;
}

const PLATFORMS_CONFIG: Record<string, { label: string; color: string; logo: string }> = {
  amazon: { 
    label: 'أمازون (Amazon)', 
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', 
    logo: 'https://cdn.simpleicons.org/amazon/FF9900' 
  },
  noon: { 
    label: 'نون (Noon)', 
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' 
  },
  jumia: { 
    label: 'جوميا (Jumia)', 
    color: 'border-orange-500/40 bg-orange-500/10 text-orange-300', 
    logo: 'https://cdn.simpleicons.org/jumia/FF9900' 
  }
};

export const InventoryPage: React.FC<InventoryPageProps> = ({ onShowToast }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTraders, setActiveTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTraderId, setSelectedTraderId] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  const fetchInventoryData = async () => {
    try {
      // 1. Fetch current active traders to verify valid trader_id
      const { data: tradersData } = await supabase
        .from('traders')
        .select('*')
        .order('created_at', { ascending: false });

      const validTraders: Trader[] = Array.isArray(tradersData) ? (tradersData as Trader[]) : [];
      setActiveTraders(validTraders);

      const validTraderIds = validTraders.map(t => t.id);

      if (validTraderIds.length === 0) {
        setInventory([]);
        return;
      }

      // 2. Fetch products / inventory strictly from Supabase
      const { data: prodsData } = await supabase
        .from('products')
        .select('*, traders(seller_name)')
        .not('trader_id', 'is', null)
        .in('trader_id', validTraderIds);

      let items: InventoryItem[] = [];
      if (Array.isArray(prodsData) && prodsData.length > 0) {
        items = prodsData.map((p: any) => ({
          id: p.id,
          trader_id: p.trader_id,
          platform: p.platform || 'amazon',
          sku: p.sku || 'SKU-001',
          asin: p.asin || p.sku,
          title: p.title || p.name,
          stock_quantity: p.stock || p.stock_quantity || 0,
          price: p.price || 0,
          last_sync: p.updated_at || p.created_at,
          traders: p.traders
        }));
      } else {
        // Fallback query from inventory_sync if products table has 0 rows
        const { data: invData } = await supabase
          .from('inventory_sync')
          .select('*, traders(seller_name)')
          .not('traders', 'is', null)
          .in('trader_id', validTraderIds);

        if (Array.isArray(invData)) {
          items = invData as InventoryItem[];
        }
      }

      // Filter out any orphaned items without an active trader
      const safeItems = items.filter(item => item.trader_id && validTraderIds.includes(item.trader_id));
      setInventory(safeItems);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setInventory([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchInventoryData();
    if (onShowToast) {
      onShowToast('✅ تم تحديث بيانات المخزون والتزامن المباشر بنجاح');
    }
  };

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Trader filter
      if (selectedTraderId !== 'all' && item.trader_id !== selectedTraderId) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all' && item.platform?.toLowerCase() !== selectedPlatform.toLowerCase()) {
        return false;
      }

      // Stock status filter
      if (stockStatusFilter === 'in_stock' && item.stock_quantity <= 10) return false;
      if (stockStatusFilter === 'low_stock' && (item.stock_quantity <= 0 || item.stock_quantity > 10)) return false;
      if (stockStatusFilter === 'out_of_stock' && item.stock_quantity > 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const skuMatch = item.sku?.toLowerCase().includes(q);
        const asinMatch = item.asin?.toLowerCase().includes(q);
        const titleMatch = item.title?.toLowerCase().includes(q);
        const traderMatch = item.traders?.seller_name?.toLowerCase().includes(q);
        if (!skuMatch && !asinMatch && !titleMatch && !traderMatch) return false;
      }

      return true;
    });
  }, [inventory, selectedTraderId, selectedPlatform, stockStatusFilter, searchQuery]);

  // Aggregate Metrics
  const totalStockUnits = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (Number(item.stock_quantity) || 0), 0);
  }, [inventory]);

  const totalValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.stock_quantity) || 0)), 0);
  }, [inventory]);

  const activeTradersWithStock = useMemo(() => {
    const ids = new Set(inventory.map(i => i.trader_id));
    return ids.size;
  }, [inventory]);

  if (isLoading) {
    return (
      <div className="w-full py-28 text-center space-y-4 font-['Cairo']" dir="rtl">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-bold">جاري تحميل سجلات وتزامن المخزون...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">إدارة وتزامن المخزون 📦</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>مفلتر ومحمي من المخزون اليتيم</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              متابعة كميات المخزون المتزامنة من منصات التجارة للتجار المسجلين والنشطين فقط.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'جاري التحديث...' : 'تحديث المخزون'}</span>
          </button>

          <button
            onClick={() => navigate('/traders')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>دليل التجار</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">الأصناف المتزامنة</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{inventory.length}</div>
          <span className="text-[10px] text-emerald-400 font-bold">صنف نشط في المنظومة</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي القطع المتوفرة</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {totalStockUnits.toLocaleString('ar-EG')}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">وحدة بالمستودعات والمتاجر</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">التجار المرتبطون</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{activeTradersWithStock}</div>
          <span className="text-[10px] text-slate-400 font-bold">من أصل {activeTraders.length} تاجر مسجل</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي القيمة التقديرية</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {Math.round(totalValue).toLocaleString('ar-EG')}
          </div>
          <span className="text-[10px] text-purple-400 font-bold">جنيه مصري (EGP)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالرمز (SKU) أو كود ASIN أو اسم الصنف أو التاجر..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-11 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Trader Dropdown */}
          <div className="w-full md:w-64">
            <select
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">كل التجار ({activeTraders.length})</option>
              {activeTraders.map(trader => (
                <option key={trader.id} value={trader.id}>
                  {trader.seller_name}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto shrink-0">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedPlatform === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedPlatform('amazon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedPlatform === 'amazon' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              أمازون
            </button>
            <button
              onClick={() => setSelectedPlatform('noon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedPlatform === 'noon' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              نون
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold shrink-0">حالة المخزون:</span>
          <button
            onClick={() => setStockStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              stockStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            الكل ({inventory.length})
          </button>
          <button
            onClick={() => setStockStatusFilter('in_stock')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              stockStatusFilter === 'in_stock' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            متوفر ومستقر
          </button>
          <button
            onClick={() => setStockStatusFilter('low_stock')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              stockStatusFilter === 'low_stock' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            مخزون منخفض (≤ 10)
          </button>
          <button
            onClick={() => setStockStatusFilter('out_of_stock')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              stockStatusFilter === 'out_of_stock' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            نفد المخزون (0)
          </button>
        </div>
      </div>

      {/* Inventory Items List / Table */}
      {filteredInventory.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Boxes className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">📦 لا يوجد مخزون - 0 منتج</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              لا توجد منتجات مسجلة في المخزون حالياً من قاعدة البيانات. يمكنك سحب المنتجات والمخزون مباشرة من رابط متجر التاجر.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/traders')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              🔄 سحب المخزون من رابط المتجر
            </button>

            {(searchQuery || selectedTraderId !== 'all' || selectedPlatform !== 'all' || stockStatusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTraderId('all');
                  setSelectedPlatform('all');
                  setStockStatusFilter('all');
                }}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء جميع الفلاتر
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">المنتج / الصنف</th>
                  <th className="px-5 py-3.5">المنصة</th>
                  <th className="px-5 py-3.5">التاجر المالك</th>
                  <th className="px-5 py-3.5">الكمية المتوفرة</th>
                  <th className="px-5 py-3.5">سعر الوحدة</th>
                  <th className="px-5 py-3.5">آخر مزامنة</th>
                  <th className="px-5 py-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInventory.map((item) => {
                  const plat = PLATFORMS_CONFIG[item.platform?.toLowerCase() || 'amazon'] || {
                    label: item.platform || 'أمازون',
                    color: 'border-slate-700 bg-slate-800 text-slate-300',
                    logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
                  };

                  const isLow = item.stock_quantity > 0 && item.stock_quantity <= 10;
                  const isOut = item.stock_quantity <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition group">
                      {/* Product / SKU */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs line-clamp-1">
                            {item.title || `صنف كود ${item.sku}`}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              SKU: {item.sku}
                            </span>
                            {item.asin && (
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500">
                                ASIN: {item.asin}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${plat.color}`}>
                          <img src={plat.logo} alt={plat.label} className="w-3.5 h-3.5 object-contain" />
                          <span>{plat.label}</span>
                        </span>
                      </td>

                      {/* Trader Name */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/traders/${item.trader_id}`)}
                          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition text-xs cursor-pointer group-hover:underline"
                        >
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.traders?.seller_name || 'تاجر مسجل'}</span>
                        </button>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-sm ${
                            isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.stock_quantity}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            isOut 
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                              : isLow
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {isOut ? 'نفد' : isLow ? 'منخفض' : 'متوفر'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-200 font-bold">
                        {item.price ? `${item.price} ج.م` : 'غير محدد'}
                      </td>

                      {/* Last Sync */}
                      <td className="px-5 py-4 whitespace-nowrap text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {item.last_sync ? new Date(item.last_sync).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'مزامنة نشطة'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => navigate(`/products?trader_id=${item.trader_id}&platform=${item.platform}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-[11px] border border-slate-800 hover:border-sky-500/40 transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>عرض في الكتالوج</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
