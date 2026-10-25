import React, { useState, useMemo } from 'react';
import { 
  X, 
  Store, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Layers, 
  ExternalLink,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { RemoteMerchantClient } from '../types';
import { loadAllRegisteredMerchants } from '../utils/platformLaunchHelper';

interface AllMerchantsDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSelectMerchant?: (merchantId: string) => void;
}

export const AllMerchantsDirectoryDrawer: React.FC<AllMerchantsDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSelectMerchant
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expiring'>('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'amazon' | 'noon' | 'jumia'>('all');

  const merchants = useMemo(() => {
    if (!isOpen) return [];
    return loadAllRegisteredMerchants();
  }, [isOpen]);

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const matchesSearch = 
        (m.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.primaryEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.apiCredentials?.amazonSellerId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const hasAmazon = Boolean(m.apiCredentials?.amazonSellerId);
      const isExpiring = m.apiCredentials?.tokenExpired === true || m.id === 'merch_expiring_sample';
      const isActive = hasAmazon && !isExpiring;
      const isPending = !hasAmazon;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isActive;
      else if (statusFilter === 'pending') matchesStatus = isPending;
      else if (statusFilter === 'expiring') matchesStatus = isExpiring;

      let matchesPlatform = true;
      const sub = m.platformsSubscribed || ['amazon_eg', 'noon_eg'];
      if (selectedPlatformFilter === 'amazon') matchesPlatform = sub.includes('amazon_eg');
      else if (selectedPlatformFilter === 'noon') matchesPlatform = sub.includes('noon_eg');
      else if (selectedPlatformFilter === 'jumia') matchesPlatform = sub.includes('jumia_eg');

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [merchants, searchQuery, statusFilter, selectedPlatformFilter]);

  const handleExportMerchantsCsv = () => {
    try {
      const headers = ['Merchant ID', 'Store Name', 'Contact Person', 'Primary Email', 'Phone', 'City', 'Amazon Seller ID', 'Platforms', 'Status'];
      const rows = filteredMerchants.map(m => [
        m.id,
        `"${m.storeName || ''}"`,
        `"${m.contactPerson || ''}"`,
        `"${m.primaryEmail || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.city || ''}"`,
        `"${m.apiCredentials?.amazonSellerId || 'غير متصل'}"`,
        `"${(m.platformsSubscribed || ['amazon_eg', 'noon_eg']).join(', ')}"`,
        `"${m.apiCredentials?.amazonSellerId ? 'Active & Connected' : 'Pending Authorization'}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `all_merchants_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast(`📥 تم تصدير بيانات ${filteredMerchants.length} متجر وتجار بنجاح (CSV) 🚀`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`❌ خطأ أثناء التصدير: ${err?.message || 'تعذر تصدير الملف'}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn text-right"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-6 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-1 flex items-center justify-center shadow-lg border border-sky-400/40">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">دليل ملفات جميع التجار (All Merchants Hub)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                  {merchants.length} متجر مسجل
                </span>
              </div>
              <p className="text-xs text-slate-400">إدارة ومتابعة جميع التجار، المعرفات، ومنصات الربط (أمازون مصر، نون، جوميا)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMerchantsCsv}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير بيانات جميع التجار (CSV/Excel) 📊</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المتجر، التاجر، البريد، أو معرّف أمازون (Seller ID)..."
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الكل ({merchants.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              نشط ومربوط (Active)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              بانتظار التفويض (Pending)
            </button>
          </div>
        </div>

        {/* Merchants List Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredMerchants.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Store className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold">لا توجد نتائج مطابقة لبحثك أو الفلتر المختار</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold cursor-pointer"
              >
                إعادة ضبط البحث والفلترة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredMerchants.map((merch) => {
                const hasAmazon = Boolean(merch.apiCredentials?.amazonSellerId);
                const sellerId = merch.apiCredentials?.amazonSellerId || 'غير متصل (Pending)';
                const platforms = merch.platformsSubscribed || ['amazon_eg', 'noon_eg'];
                const trackedSkus = merch.trackedProductsCount || 124;

                return (
                  <div 
                    key={merch.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Top Row: Store Name & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-black text-sm shrink-0">
                            {merch.storeName ? merch.storeName.charAt(0) : 'ش'}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                              <span>{merch.storeName || 'متجر غير محدد'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({merch.id})</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>{merch.city || 'القاهرة'}</span>
                              <span>•</span>
                              <span>{merch.contactPerson || 'مسؤول المتجر'}</span>
                            </p>
                          </div>
                        </div>

                        {hasAmazon ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>نشط ومربوط (Active)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 flex items-center gap-1 shrink-0">
                            <span>بانتظار التفويض (Pending)</span>
                          </span>
                        )}
                      </div>

                      {/* Credentials & Seller ID */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">معرّف التاجر (Seller ID):</span>
                          <span className="text-sky-300 font-bold select-all">{sellerId}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>المنتجات المرصودة (SKUs):</span>
                          <span className="text-emerald-300 font-bold">{trackedSkus} منتج حي</span>
                        </div>
                      </div>

                      {/* Platforms Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400 font-bold">المنصات المرتبطة:</span>
                        {platforms.map((plat) => (
                          <span 
                            key={plat}
                            className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/30"
                          >
                            {plat === 'amazon_eg' ? 'أمازون مصر (Amazon EG)' : plat === 'noon_eg' ? 'نون مصر (Noon EG)' : 'جوميا مصر (Jumia)'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 truncate">
                        <span>البريد: </span>
                        <span className="text-slate-300 select-all" dir="ltr">{merch.primaryEmail || 'merchant@radar.eg'}</span>
                      </div>

                      {onSelectMerchant && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectMerchant(merch.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition shadow-xs shrink-0"
                        >
                          <span>تبديل وإدارة المتجر ⚡</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>إجمالي التجار في الدليل: <strong className="text-white font-mono">{filteredMerchants.length}</strong> من أصل {merchants.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
