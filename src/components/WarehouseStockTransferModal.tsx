import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Building2,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import {
  ProductData,
  ProductInventoryRecord,
  WarehouseSubFolder,
  WarehouseTransferSlip
} from '../types';

interface WarehouseStockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductData[];
  inventory: ProductInventoryRecord[];
  warehouseFolders: WarehouseSubFolder[];
  preSelectedProductId?: string;
  onExecuteTransfer: (slip: WarehouseTransferSlip, updatedInventory: ProductInventoryRecord[]) => void;
  onShowToast?: (message: string) => void;
}

export const WarehouseStockTransferModal: React.FC<WarehouseStockTransferModalProps> = ({
  isOpen,
  onClose,
  products,
  inventory,
  warehouseFolders,
  preSelectedProductId,
  onExecuteTransfer,
  onShowToast
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preSelectedProductId || (inventory[0]?.productId ?? '')
  );
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(
    warehouseFolders[0]?.id ?? ''
  );
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>(
    warehouseFolders[1]?.id ?? warehouseFolders[0]?.id ?? ''
  );
  const [transferQty, setTransferQty] = useState<number>(5);
  const [driverName, setDriverName] = useState<string>('سيارة شحن ونقل البضائع (كابتن حسام)');
  const [transferNotes, setTransferNotes] = useState<string>('تحويل مخزني لتجهيز طلبيات منصات الشحن السريع');

  if (!isOpen) return null;

  const currentRecord = inventory.find(i => i.productId === selectedProductId);
  const currentProduct = products.find(p => p.id === selectedProductId);

  // Available stock in source warehouse
  const sourceStock = currentRecord?.warehouseAllocations?.[sourceWarehouseId] ?? 0;
  const maxAvailable = Math.max(0, sourceStock);

  const sourceFolder = warehouseFolders.find(f => f.id === sourceWarehouseId);
  const destFolder = warehouseFolders.find(f => f.id === destinationWarehouseId);

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord || !currentProduct || !sourceFolder || !destFolder) return;

    if (sourceWarehouseId === destinationWarehouseId) {
      if (onShowToast) onShowToast('⚠️ يجب اختيار مخزن وجهة مختلف عن مخزن المصدر');
      return;
    }

    const qty = Math.max(1, Math.floor(transferQty));
    if (qty > maxAvailable) {
      if (onShowToast) onShowToast(`⚠️ الكمية المطلوبة (${qty}) تتجاوز الرصيد المتاح بمخزن ${sourceFolder.name} (${maxAvailable} قطعة)`);
      return;
    }

    // Execute transfer by debiting source and crediting destination
    const updatedAllocations: Record<string, number> = {
      ...(currentRecord.warehouseAllocations || {})
    };
    updatedAllocations[sourceWarehouseId] = (updatedAllocations[sourceWarehouseId] || 0) - qty;
    updatedAllocations[destinationWarehouseId] = (updatedAllocations[destinationWarehouseId] || 0) + qty;

    const updatedRecord: ProductInventoryRecord = {
      ...currentRecord,
      warehouseAllocations: updatedAllocations
    };

    const updatedInventory = inventory.map(item =>
      item.productId === selectedProductId ? updatedRecord : item
    );

    const slip: WarehouseTransferSlip = {
      id: `trf-${Date.now()}`,
      productId: selectedProductId,
      productTitle: currentProduct.title,
      sku: currentRecord.sku,
      sourceWarehouseId,
      sourceWarehouseName: sourceFolder.name,
      destinationWarehouseId,
      destinationWarehouseName: destFolder.name,
      quantity: qty,
      transferredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      driverOrCourier: driverName,
      notes: transferNotes,
      status: 'completed'
    };

    onExecuteTransfer(slip, updatedInventory);
    onClose();

    if (onShowToast) {
      onShowToast(`🚚 تم إصدار إذن تحويل مخزني بنجاح: تم نقل ${qty} قطعة من "${sourceFolder.name}" إلى "${destFolder.name}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div
        id="modal-warehouse-stock-transfer"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">إذن تحويل ونقل مخزني بين الفروع</h3>
              <p className="text-xs text-indigo-200">
                إصدار أمر مناقلة رسمي لنقل بضائع من مخزن لآخر وضبط الأرصدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleConfirmTransfer} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              الصنف المراد نقله (Product) *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {inventory.map(item => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <option key={item.productId} value={item.productId}>
                    {prod?.title || item.sku} (الإجمالي: {item.currentStock} ق)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Source and Destination Warehouses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>المخزن المصدر (المحول منه)</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {warehouseFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder.city})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] font-bold text-slate-600">
                الرصيد المتاح بالمصدر: <strong className="text-indigo-600">{maxAvailable} قطعة</strong>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>المخزن الوجهة (المحول إليه)</span>
                <span className="text-emerald-500">*</span>
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                {warehouseFolders.map(folder => (
                  <option key={folder.id} value={folder.id} disabled={folder.id === sourceWarehouseId}>
                    {folder.name} ({folder.city}) {folder.id === sourceWarehouseId ? '(المصدر الحالي)' : ''}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] font-bold text-slate-600">
                الرصيد الحالي بالوجهة: <strong className="text-emerald-600">
                  {currentRecord?.warehouseAllocations?.[destinationWarehouseId] ?? 0} قطعة
                </strong>
              </div>
            </div>
          </div>

          {/* Transfer Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                الكمية المراد نقلها (قطع) *
              </label>
              <span className="text-[11px] text-slate-500">
                الحد الأقصى المتاح: {maxAvailable} قطعة
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={Math.max(1, maxAvailable)}
                value={transferQty}
                onChange={(e) => setTransferQty(parseInt(e.target.value))}
                className="w-32 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-black text-center text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-1.5">
                {[5, 10, 20].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTransferQty(Math.min(val, maxAvailable))}
                    className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
                {maxAvailable > 0 && (
                  <button
                    type="button"
                    onClick={() => setTransferQty(maxAvailable)}
                    className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    كل المتاح ({maxAvailable})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Courier and Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                مسؤول النقل / السائق / شركة الشحن
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="اسم السائق أو رقم سيارة النقل..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ملاحظات التحويل وإذن الصرف
              </label>
              <input
                type="text"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="سبب النقل، أمر التجهيز، أو كود البوليصة..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1.5 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>معاينة إذن التحويل المخزني:</span>
            </div>
            <div className="text-[11px] leading-relaxed text-emerald-800">
              سيتم خصم <strong>{transferQty} قطعة</strong> من <strong>{sourceFolder?.name}</strong> وإضافتها فوراً إلى رصيد <strong>{destFolder?.name}</strong> مع توثيق إذن التحويل في سجلات الحركة.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={maxAvailable < 1 || sourceWarehouseId === destinationWarehouseId}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>تأكيد إذن التحويل والنقل 🚚</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
