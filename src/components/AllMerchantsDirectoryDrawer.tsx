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
  FileSpreadsheet,
  UserPlus,
  Plus,
  Building2,
  Check
} from 'lucide-react';
import { RemoteMerchantClient } from '../types';
import { loadAllRegisteredMerchants, addNewRegisteredMerchant } from '../utils/platformLaunchHelper';

interface AllMerchantsDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string) => void;
  onSelectMerchant?: (merchantId: string) => void;
  initialShowAddForm?: boolean;
}

export const AllMerchantsDirectoryDrawer: React.FC<AllMerchantsDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSelectMerchant,
  initialShowAddForm = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expiring'>('all');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'amazon' | 'noon' | 'jumia'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Quick Merchant Addition Form State
  const [showAddForm, setShowAddForm] = useState(initialShowAddForm);
  const [newStoreName, setNewStoreName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPrimaryEmail, setNewPrimaryEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('القاهرة');
  const [newSellerId, setNewSellerId] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['amazon_eg', 'noon_eg']);
  const [formError, setFormError] = useState('');

  const merchants = useMemo(() => {
    if (!isOpen) return [];
    return loadAllRegisteredMerchants();
  }, [isOpen, refreshTrigger]);

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

  const handleCreateNewMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newStoreName.trim()) {
      setFormError('يرجى إدخال اسم المتجر بشكل صحيح');
      return;
    }
    if (!newPrimaryEmail.trim()) {
      setFormError('يرجى إدخال البريد الإلكتروني للتاجر');
      return;
    }

    try {
      const created = addNewRegisteredMerchant({
        storeName: newStoreName,
        contactPerson: newContactPerson || 'مسؤول المتجر',
        primaryEmail: newPrimaryEmail,
        phone: newPhone,
        city: newCity,
        sellerId: newSellerId,
        platforms: selectedPlatforms
      });

      setRefreshTrigger(prev => prev + 1);
      setShowAddForm(false);
      setNewStoreName('');
      setNewContactPerson('');
      setNewPrimaryEmail('');
      setNewPhone('');
      setNewSellerId('');

      if (onShowToast) {
        onShowToast(`🎉 تم إضافة المتجر الجديد "${created.storeName}" بنجاح في دليل التجار!`);
      }

      if (onSelectMerchant) {
        onSelectMerchant(created.id);
      }
    } catch (err: any) {
      setFormError(`فشل حفظ التاجر: ${err?.message || 'خطأ أثناء الحفظ'}`);
    }
  };

  const togglePlatform = (code: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn text-right"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-6 bg-slate-950/90 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-teal-800 p-1 flex items-center justify-center shadow-lg border border-indigo-400/40">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">المركز الشامل لإدارة بيانات التجار وإضافة تاجر جديد</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                  {merchants.length} متجر مسجل
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">استعراض، تعديل، سحب الكتالوجات، وإضافة متاجر وتجار جدد مباشرة لربط الأسواق</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Master Add Merchant Toggle Button - Deep Indigo/Teal, NO YELLOW */}
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs sm:text-sm shadow-lg border border-indigo-400/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>{showAddForm ? 'العودة لقائمة التجار' : '➕ إضافة تاجر جديد (نموذج سريع)'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMerchantsCsv}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all border border-teal-500/30"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-200" />
              <span>تصدير CSV 📊</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Merchant Input Form (نموذج إدخال سريع) */}
        {showAddForm && (
          <div className="p-4 sm:p-6 bg-slate-950/90 border-b border-indigo-500/30 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-black text-white">نموذج الإدخال السريع لإضافة تاجر جديد إلى النظام</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-white underline font-bold"
              >
                إغلاق النموذج
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewMerchant} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المتجر / العلامة التجارية *</label>
                <input 
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="مثال: متجر النور للأثاث / القاهرة ستور"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم التاجر / مسؤول المتجر *</label>
                <input 
                  type="text"
                  required
                  value={newContactPerson}
                  onChange={(e) => setNewContactPerson(e.target.value)}
                  placeholder="مثال: أ. محمد أحمد"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني الأساسي *</label>
                <input 
                  type="email"
                  required
                  value={newPrimaryEmail}
                  onChange={(e) => setNewPrimaryEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رقم الهاتف / الواتساب</label>
                <input 
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+20 10 1234 5678"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">معرّف أمازون Seller ID (اختياري)</label>
                <input 
                  type="text"
                  value={newSellerId}
                  onChange={(e) => setNewSellerId(e.target.value)}
                  placeholder="A1SELLERIDEGY"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">المدينة / المحافظة</label>
                <input 
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="القاهرة - المعادي"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-slate-300 font-bold mb-1.5">المنصات المراد ربطها بالتاجر:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'amazon_eg', label: 'أمازون مصر (Amazon EG)' },
                    { id: 'noon_eg', label: 'نون مصر (Noon EG)' },
                    { id: 'jumia_eg', label: 'جوميا مصر (Jumia EG)' },
                    { id: 'tiktok_shop', label: 'تيك توك شوب (TikTok)' }
                  ].map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        selectedPlatforms.includes(p.id)
                          ? 'bg-indigo-700 text-white border-indigo-500 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {selectedPlatforms.includes(p.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black shadow-lg border border-indigo-400/30 flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Building2 className="w-4 h-4 text-indigo-200" />
                  <span>حفظ وإضافة التاجر الآن 🚀</span>
                </button>
              </div>
            </form>
          </div>
        )}

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
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-indigo-700 text-white shadow-md'
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
                  ? 'bg-emerald-700 text-white shadow-md'
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
                  ? 'bg-teal-700 text-white shadow-md'
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
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  إعادة ضبط البحث والفلترة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة تاجر جديد الآن</span>
                </button>
              </div>
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
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 shadow-md flex flex-col justify-between"
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
                              <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
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
                          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black border border-teal-500/40 flex items-center gap-1 shrink-0">
                            <span>بانتظار التفويض (Pending)</span>
                          </span>
                        )}
                      </div>

                      {/* Credentials & Seller ID */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 text-[11px]">معرّف التاجر (Seller ID):</span>
                          <span className="text-indigo-300 font-bold select-all">{sellerId}</span>
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
                          className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition shadow-xs shrink-0"
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
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <span>إجمالي التجار في الدليل: <strong className="text-white font-mono">{filteredMerchants.length}</strong> من أصل {merchants.length}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تاجر جديد</span>
            </button>
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
    </div>
  );
};
