import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RefreshCw, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { supabase, Trader, formatSupabaseError } from '../lib/supabase';
import { dataCache } from '../utils/dataCache';
import { FetchProductsModal } from './FetchProductsModal';
import {
  ACCEPTED_IMPORT_EXTENSIONS,
  DEFAULT_TRADER_ID,
  IMPORT_BUTTON_LABEL,
  SellerCentralImportPreview,
  previewSellerCentralFile,
  sanitizeProductPullError,
} from '../utils/sellerCentralExcelImporter';

interface EditTraderModalProps {
  trader: Trader;
  existingTraders?: Trader[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Trader) => void;
  onShowToast?: (message: string) => void;
  onFetchProducts?: (trader: Trader) => void;
}

export const EditTraderModal: React.FC<EditTraderModalProps> = ({
  trader,
  existingTraders,
  isOpen,
  onClose,
  onUpdate,
  onShowToast,
  onFetchProducts,
}) => {
  const [form, setForm] = useState<Trader>(trader);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<SellerCentralImportPreview | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({
      ...trader,
      seller_name: trader.seller_name || '',
      gmail: trader.gmail || trader.email || '',
      email: trader.email || trader.gmail || '',
      seller_id: trader.seller_id || '',
      phone: trader.phone || '',
      destination_url: trader.destination_url || trader.seller_link || '',
      seller_link: trader.seller_link || trader.destination_url || '',
      store_url: trader.store_url || trader.storefront_link || '',
      storefront_link: trader.storefront_link || trader.store_url || '',
    });
    setErrorMessage(null);
  }, [trader, isOpen]);

  if (!isOpen) return null;

  const gmailValue = form.gmail ?? form.email ?? '';
  const destinationValue = form.destination_url ?? form.seller_link ?? '';
  const storeValue = form.store_url ?? form.storefront_link ?? '';

  const reportError = (err: any) => {
    console.error(err);
    const realMsg = formatSupabaseError(err);
    setErrorMessage(realMsg);
    onShowToast?.(`❌ ${realMsg}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const traderId = String(trader?.id || '').trim();
    if (!traderId) {
      reportError(new Error('معرف التاجر (id) فارغ — لا يمكن التعديل'));
      return;
    }

    const cleanName = String(form.seller_name || '').trim();
    if (!cleanName) {
      reportError(new Error('اسم التاجر (seller_name) مطلوب ولا يمكن تركه فارغاً'));
      return;
    }

    const cleanEmail = String(gmailValue || '').trim().toLowerCase();
    const cleanSellerId = String(form.seller_id || '').trim();
    const cleanPhone = String(form.phone || '').trim();
    const cleanDestination = String(destinationValue || '').trim();
    const cleanStore = String(storeValue || '').trim();

    // Duplicate email check against OTHER traders only (allow same trader to keep their email)
    if (cleanEmail && Array.isArray(existingTraders) && existingTraders.length > 0) {
      const duplicateOther = existingTraders.find((other) => {
        if (!other || String(other.id) === traderId) return false;
        const otherEmail = String(other.email || '').trim().toLowerCase();
        const otherGmail = String(other.gmail || '').trim().toLowerCase();
        return otherEmail === cleanEmail || otherGmail === cleanEmail;
      });
      if (duplicateOther) {
        reportError(new Error('هذا الإيميل موجود لتاجر آخر'));
        return;
      }
    }

    setIsSaving(true);
    try {
      // Never send `id` inside the update payload; optional fields use null when blank
      const updatePayload: Record<string, any> = {
        seller_name: cleanName,
        email: cleanEmail || null,
        gmail: cleanEmail || null,
        phone: cleanPhone || null,
        platform: form.platform || trader.platform || 'amazon',
        seller_id: cleanSellerId || null,
        destination_url: cleanDestination || null,
        seller_link: cleanDestination || null,
        store_url: cleanStore || null,
        storefront_link: cleanStore || null,
        status: form.status || 'active',
      };

      let { data, error } = await supabase
        .from('traders')
        .update(updatePayload)
        .eq('id', traderId)
        .select()
        .single();

      // Legacy fallback if table columns have NOT NULL constraint
      if (
        error &&
        (error.code === '23502' || /violates not-null constraint/i.test(String(error.message || '')))
      ) {
        const nonNullPayload: Record<string, any> = { ...updatePayload };
        for (const k of Object.keys(nonNullPayload)) {
          if (nonNullPayload[k] === null) nonNullPayload[k] = '';
        }
        const retryRes = await supabase
          .from('traders')
          .update(nonNullPayload)
          .eq('id', traderId)
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        reportError(error);
        return;
      }

      const mergedUpdated: Trader = {
        ...trader,
        ...updatePayload,
        ...(data && typeof data === 'object' ? data : {}),
        id: (data && typeof data === 'object' && data.id) ? data.id : traderId,
      } as Trader;

      dataCache.invalidate('traders');
      onUpdate(mergedUpdated);
      onShowToast?.('✅ تم تعديل بيانات التاجر بنجاح');
      onClose();
    } catch (err: any) {
      reportError(err);
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
      const targetId = trader.id || DEFAULT_TRADER_ID;
      const preview = await previewSellerCentralFile(
        file,
        targetId,
        form.platform || trader.platform || 'amazon'
      );
      setPendingPreview(preview);
      setIsFetchModalOpen(true);
    } catch (err: any) {
      onShowToast?.(sanitizeProductPullError(err));
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
            <button type="button" onClick={onClose} aria-label="إغلاق" className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              data-testid="edit-trader-error"
              className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2 text-right"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} noValidate className="space-y-3 text-right">
            <div>
              <label htmlFor="edit-trader-seller-name" className="block text-xs font-bold text-slate-300 mb-1">
                اسم التاجر (seller_name) *
              </label>
              <input
                id="edit-trader-seller-name"
                type="text"
                required
                value={form.seller_name}
                onChange={(e) => {
                  setErrorMessage(null);
                  setForm({ ...form, seller_name: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="اسم التاجر"
              />
            </div>

            <div>
              <label htmlFor="edit-trader-email" className="block text-xs font-bold text-slate-300 mb-1">
                إيميل التاجر على المنصة (اختياري — للعرض فقط)
              </label>
              <input
                id="edit-trader-email"
                type="email"
                dir="ltr"
                value={gmailValue}
                onChange={(e) => {
                  setErrorMessage(null);
                  setForm({ ...form, email: e.target.value, gmail: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="mahmeudsaid4@gmail.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-trader-seller-id" className="block text-xs font-bold text-slate-300 mb-1">
                  رمز التاجر التعريفي (seller_id) (اختياري)
                </label>
                <input
                  id="edit-trader-seller-id"
                  type="text"
                  dir="ltr"
                  value={form.seller_id || ''}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setForm({ ...form, seller_id: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500 text-left"
                  placeholder="A37JIM7LHQI6IM"
                />
              </div>
              <div>
                <label htmlFor="edit-trader-phone" className="block text-xs font-bold text-slate-300 mb-1">
                  رقم هاتف التاجر (phone) (اختياري)
                </label>
                <input
                  id="edit-trader-phone"
                  type="text"
                  dir="ltr"
                  value={form.phone || ''}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setForm({ ...form, phone: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                  placeholder="+20 100 000 0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-trader-destination-url" className="block text-xs font-bold text-slate-300 mb-1">
                رابط الوجهة (destination_url) (اختياري)
              </label>
              <input
                id="edit-trader-destination-url"
                type="url"
                dir="ltr"
                value={destinationValue}
                onChange={(e) => {
                  setErrorMessage(null);
                  setForm({ ...form, destination_url: e.target.value, seller_link: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="https://www.amazon.eg/s?me=..."
              />
            </div>

            <div>
              <label htmlFor="edit-trader-store-url" className="block text-xs font-bold text-slate-300 mb-1">
                رابط المتجر (store_url) (اختياري)
              </label>
              <input
                id="edit-trader-store-url"
                type="url"
                dir="ltr"
                value={storeValue}
                onChange={(e) => {
                  setErrorMessage(null);
                  setForm({ ...form, store_url: e.target.value, storefront_link: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 text-left"
                placeholder="https://www.amazon.eg/sp?seller=..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-trader-platform" className="block text-xs font-bold text-slate-300 mb-1">المنصة</label>
                <select
                  id="edit-trader-platform"
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
                <label htmlFor="edit-trader-status" className="block text-xs font-bold text-slate-300 mb-1">الحالة</label>
                <select
                  id="edit-trader-status"
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
                <span>{isImportingExcel ? 'جاري قراءة الملف...' : IMPORT_BUTTON_LABEL}</span>
              </button>
              <input
                ref={excelInputRef}
                type="file"
                accept={ACCEPTED_IMPORT_EXTENSIONS}
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
          initialPreview={pendingPreview}
          onClose={() => {
            setIsFetchModalOpen(false);
            setPendingPreview(null);
          }}
          onShowToast={onShowToast}
          onSyncCompleted={() => {
            const nowIso = new Date().toISOString();
            onUpdate({ ...trader, last_sync_at: nowIso, last_sync_timestamp: nowIso });
            setPendingPreview(null);
          }}
        />
      )}
    </>
  );
};
