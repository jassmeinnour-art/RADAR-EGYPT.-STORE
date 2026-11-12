import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase, Trader } from '../lib/supabase';

interface EditTraderModalProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Trader) => void;
  onShowToast?: (message: string) => void;
}

export const EditTraderModal: React.FC<EditTraderModalProps> = ({ trader, isOpen, onClose, onUpdate, onShowToast }) => {
  const [form, setForm] = useState<Trader>(trader);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('traders')
        .update({
          seller_name: form.seller_name,
          email: form.email,
          phone: form.phone,
          platform: form.platform,
          seller_id: form.seller_id,
          seller_link: form.seller_link,
          storefront_link: form.storefront_link,
          status: form.status
        })
        .eq('id', trader.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(data as Trader);
      if (onShowToast) onShowToast('✅ تم تحديث بيانات التاجر بنجاح!');
      onClose();
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل تحديث البيانات: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">تعديل بيانات التاجر</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <input type="text" value={form.seller_name} onChange={e => setForm({...form, seller_name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="اسم التاجر" />
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="حساب الجيميل" />
          <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="الهاتف" />
          <input type="text" value={form.seller_id || ''} onChange={e => setForm({...form, seller_id: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="Seller ID" />
          <input type="text" value={form.seller_link || ''} onChange={e => setForm({...form, seller_link: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="لينك الوجهة (Destination URL)" />
          <input type="text" value={form.storefront_link || ''} onChange={e => setForm({...form, storefront_link: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" placeholder="لينك المتجر (Store URL)" />
          <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="amazon">أمازون</option>
            <option value="noon">نون</option>
            <option value="jumia">جوميا</option>
            <option value="raneen">رنين</option>
          </select>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'active' | 'inactive'})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="active">نشط (Active)</option>
            <option value="inactive">غير نشط (Inactive)</option>
          </select>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl mt-4 flex items-center justify-center gap-2">
            {isSaving ? 'جاري الحفظ...' : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
          </button>
        </form>
      </div>
    </div>
  );
};
