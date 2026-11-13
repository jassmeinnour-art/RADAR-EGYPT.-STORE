import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { supabase, Trader, isDemoOrOrphanProduct } from '../lib/supabase';
import { dataCache } from '../utils/dataCache';
import { FetchProductsModal } from './FetchProductsModal';

interface EditTraderModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Trader) => void;
  onShowToast?: (message: string) => void;
  onFetchProducts?: (trader: Trader) => void;
}

export const EditTraderModal: React.FC<EditTraderModalProps> = ({
  trader,
  isOpen,
  onClose,
  onUpdate,
  onShowToast,
  onFetchProducts,
}) => {
  const [form, setForm] = useState<Trader>(trader);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({
      ...trader,
      gmail: trader.gmail || trader.email || '',
      email: trader.email || trader.gmail || '',
      destination_url: trader.destination_url || trader.seller_link || '',
      seller_link: trader.seller_link || trader.destination_url || '',
      store_url: trader.store_url || trader.storefront_link || '',
      storefront_link: trader.storefront_link || trader.store_url || '',
    });
  }, [trader, isOpen]);

  if (!isOpen) return null;

  const gmailValue = form.gmail ?? form.email ?? '';
  const destinationValue = form.destination_url ?? form.seller_link ?? '';
  const storeValue = form.store_url ?? form.storefront_link ?? '';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanEmail = gmailValue.trim().toLowerCase();
      const cleanDestination = destinationValue.trim();
      const cleanStore = storeValue.trim();

      const updatePayload = {
        seller_name: form.seller_name.trim(),
        email: cleanEmail,
        gmail: cleanEmail,
        phone: (form.phone || '').trim(),
        platform: form.platform,
        seller_id: (form.seller_id || '').trim(),
        destination_url: cleanDestination,
        seller_link: cleanDestination,
        store_url: cleanStore,
        storefront_link: cleanStore,
        status: form.status || 'active',
      };

      const { data, error } = await supabase
        .from('traders')
        .update(updatePayload)
        .eq('id', trader.id)
        .select()
        .single();

      if (error) throw error;

      dataCache.invalidate('traders');
      onUpdate((data || { ...trader, ...updatePayload }) as Trader);
      onShowToast?.('✅ تم تحديث بيانات التاجر بنجاح!');
      onClose();
    } catch (err: any) {
      onShowToast?.(`❌ فشل تحديث البيانات: ${err.message || 'خطأ غير متوقع'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerFetch = () => {
    const mergedTrader: Trader = {
      ...trader,
      ...form,
      email: gmailValue.trim(),
      gmail: gmailValue.trim(),
      destination_url: destinationValue.trim(),
      seller_link: destinationValue.trim(),
      store_url: storeValue.trim(),
      storefront_link: storeValue.trim(),
    };
    if (onFetchProducts) {
      onFetchProducts(mergedTrader);
    } else {
      setIsFetchModalOpen(true);
    }
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingExcel(true);
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error('الملف لا يحتوي على صفحات بيانات');
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet], { defval: '' });

      const mappedProducts = rows
        .map((row, index) => {
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalized[k.trim().toLowerCase()] = row[k];
          });

          const title = String(
            normalized['title'] ||
              normalized['product_name'] ||
              normalized['product name'] ||
              normalized['item-name'] ||
              normalized['name'] ||
              normalized['اسم المنتج'] ||
              normalized['المنتج'] ||
              ''
          ).trim();

          const sku = String(
            normalized['sku'] ||
              normalized['seller-sku'] ||
              normalized['seller sku'] ||
              normalized['asin'] ||
              normalized['asin1'] ||
              normalized['كود'] ||
              ''
          )
            .trim()
            .toUpperCase();

          const asin = String(normalized['asin'] || normalized['asin1'] || sku || '').trim();
          const priceRaw =
            normalized['price'] ?? normalized['standard price'] ?? normalized['السعر'] ?? 0;
          const stockRaw =
            normalized['stock'] ?? normalized['quantity'] ?? normalized['qty'] ?? normalized['الكمية'] ?? 0;
          const imageRaw = String(
            normalized['image_url'] || normalized['image'] || normalized['img'] || normalized['الصورة'] || ''
          ).trim();

          return {
            id: `prd-${Date.now().toString(36)}-${index}-${Math.random().toString(36).substring(2, 6)}`,
            trader_id: trader.id,
            title: title || sku,
            sku,
            asin,
            price: parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0,
            stock: parseInt(String(stockRaw).replace(/[^0-9]/g, ''), 10) || 0,
            platform: String(normalized['platform'] || form.platform || trader.platform || 'amazon').toLowerCase(),
            image: imageRaw,
            image_url: imageRaw,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        })
        .filter((p) => p.sku && p.title && !isDemoOrOrphanProduct(p));

      if (mappedProducts.length === 0) {
        onShowToast?.('⚠️ لم يتم العثور على صفوف منتجات صالحة في ملف Excel/CSV');
        return;
      }

      const { error } = await supabase.from('products').insert(mappedProducts);
      if (error) throw error;

      dataCache.invalidate('products_');
      const syncStats = { total: mappedProducts.length, new: mappedProducts.length, updated: 0 };
      try {
        localStorage.setItem('radar_last_sync_stats', JSON.stringify(syncStats));
      } catch {}

      onShowToast?.(`✅ تم استيراد ${mappedProducts.length} منتج من ملف Excel للتاجر ${form.seller_name}!`);
    } catch (err: any) {
      onShowToast?.(`❌ فشل استيراد ملف Excel: ${err?.message || 'خطأ في قراءة الملف'}`);
    } finally {
      setIsImportingExcel(false);
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-['Cairo']" dir="rtl">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-black text-white">تعديل بيانات التاجر</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم التاجر</label>
              <input
                type="text"
                required
                value={form.seller_name}
                onChange={(e) => setForm({ ...form, seller_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="اسم التاجر"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">حساب الجيميل (gmail)</label>
              <input
                type="email"
                required
                dir="ltr"
                value={gmailValue}
                onChange={(e) => setForm({ ...form, email: e.target.value, gmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="example@gmail.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز التاجر (seller_id)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.seller_id || ''}
                  onChange={(e) => setForm({ ...form, seller_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 text-left"
                  placeholder="A37JIM7LHQI6IM"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الهاتف</label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                  placeholder="+20 100 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">لينك الوجهة (destination_url)</label>
              <input
                type="url"
                dir="ltr"
                value={destinationValue}
                onChange={(e) => setForm({ ...form, destination_url: e.target.value, seller_link: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="https://www.amazon.eg/s?me=..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">لينك المتجر (store_url)</label>
              <input
                type="url"
                dir="ltr"
                value={storeValue}
                onChange={(e) => setForm({ ...form, store_url: e.target.value, storefront_link: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="https://www.amazon.eg/sp?seller=..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المنصة</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="amazon">أمازون (Amazon)</option>
                  <option value="noon">نون (Noon)</option>
                  <option value="jumia">جوميا (Jumia)</option>
                  <option value="bayyaa">بياع (Bayyaa)</option>
                  <option value="raneen">رنين (Raneen)</option>
                  <option value="kanz">كنز (Kanz)</option>
                  <option value="homesmart">هوم سمارت (HomeSmart)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">نشط (Active)</option>
                  <option value="inactive">غير نشط (Inactive)</option>
                </select>
              </div>
            </div>

            {/* Direct Inventory Import & Sync Actions inside Edit Modal */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleTriggerFetch}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>سحب كل المنتجات</span>
              </button>

              <button
                type="button"
                disabled={isImportingExcel}
                onClick={() => excelInputRef.current?.click()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isImportingExcel ? 'جاري الاستيراد...' : 'استيراد من Excel'}</span>
              </button>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelFileChange}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'جاري الحفظ...' : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {isFetchModalOpen && (
        <FetchProductsModal
          trader={{
            ...trader,
            ...form,
            email: gmailValue.trim(),
            gmail: gmailValue.trim(),
            destination_url: destinationValue.trim(),
            seller_link: destinationValue.trim(),
            store_url: storeValue.trim(),
            storefront_link: storeValue.trim(),
          }}
          isOpen={isFetchModalOpen}
          onClose={() => setIsFetchModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}
    </>
  );
};
