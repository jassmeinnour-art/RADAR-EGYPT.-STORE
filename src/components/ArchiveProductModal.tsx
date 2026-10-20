import React, { useState, useEffect } from 'react';
import {
  Archive,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { ProductData } from '../types';
import { ARCHIVE_REASONS } from './ArchivedProductsVault';

interface ArchiveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProducts: ProductData[];
  preselectedProductId?: string;
  onConfirmArchive: (productId: string, reason: string, notes: string) => void;
  currency?: string;
}

export const ArchiveProductModal: React.FC<ArchiveProductModalProps> = ({
  isOpen,
  onClose,
  activeProducts,
  preselectedProductId,
  onConfirmArchive,
  currency = 'EGP'
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    preselectedProductId || (activeProducts[0]?.id || '')
  );
  const [selectedReason, setSelectedReason] = useState<string>('discontinued_model');
  const [merchantNotes, setMerchantNotes] = useState<string>('');

  useEffect(() => {
    if (preselectedProductId) {
      setSelectedId(preselectedProductId);
    } else if (activeProducts.length > 0 && !activeProducts.some(p => p.id === selectedId)) {
      setSelectedId(activeProducts[0].id);
    }
  }, [preselectedProductId, activeProducts]);

  if (!isOpen) return null;

  const currentProduct = activeProducts.find(p => p.id === selectedId);

  const handleArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    onConfirmArchive(selectedId, selectedReason, merchantNotes);
    onClose();
  };

  const selectableReasons = ARCHIVE_REASONS.filter(r => r.id !== 'all');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-['Cairo'] text-right">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-sky-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">نقل المنتج إلى مجلد الأرشيف</h3>
              <p className="text-xs text-sky-100 mt-0.5">
                عزل المنتج غير النشط مع الاحتفاظ الكامل بسجل الأسعار والمنافسين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sky-700/60 hover:bg-sky-700 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleArchive} className="p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Active Product Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              اختر المنتج المراد أرشفته:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
            >
              {activeProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} — (أقل سعر: {p.currentLowestPrice.toLocaleString()} {currency})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Card Preview */}
          {currentProduct && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.title}
                className="w-13 h-13 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block text-xs truncate">
                  {currentProduct.title}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                  <span>سعر الجملة: {currentProduct.estimatedWholesaleCost.toLocaleString()} {currency}</span>
                  <span>•</span>
                  <span>البيع المسجل: {currentProduct.suggestedRetailPrice.toLocaleString()} {currency}</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-medium">{currentProduct.priceHistory?.length || 0} نقاط أسعار مسجلة</span>
                </div>
              </div>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              سبب نقل المنتج إلى الأرشيف:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectableReasons.map(reason => {
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 ring-1 ring-sky-500/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="archive_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 block text-xs">{reason.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{reason.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Merchant Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ملاحظات التاجر الإضافية (اختياري):
            </label>
            <textarea
              rows={2}
              value={merchantNotes}
              onChange={(e) => setMerchantNotes(e.target.value)}
              placeholder="مثال: توقف المورد في الموسكي عن التوريد، وتم استبدال الصنف بموديل 2026..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Safety & Preservation Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-900 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">حفظ تاريخ التسعير بنسبة 100%:</strong>
              سيتم إخفاء المنتج فقط من الشاشات النشطة (لوحة المبيعات، الرادار، قائمة المتابعة) لتنظيف بيئة العمل، مع حفظ جميع نقاط السعر التاريخية وعروض المنافسين في مجلد الأرشيف للاسترجاع الفوري.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>تأكيد النقل إلى الأرشيف</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
