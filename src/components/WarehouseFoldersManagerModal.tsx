import React, { useState } from 'react';
import {
  Building2,
  FolderPlus,
  MapPin,
  Phone,
  User,
  Package,
  Layers,
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { WarehouseSubFolder, ProductInventoryRecord } from '../types';

interface WarehouseFoldersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseFolders: WarehouseSubFolder[];
  onSaveWarehouseFolders: (folders: WarehouseSubFolder[]) => void;
  inventory: ProductInventoryRecord[];
  onShowToast?: (message: string) => void;
}

export const WarehouseFoldersManagerModal: React.FC<WarehouseFoldersManagerModalProps> = ({
  isOpen,
  onClose,
  warehouseFolders,
  onSaveWarehouseFolders,
  inventory,
  onShowToast
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('دمياط');
  const [newShortCode, setNewShortCode] = useState<string>('');
  const [newLocationDetails, setNewLocationDetails] = useState<string>('');
  const [newManagerName, setNewManagerName] = useState<string>('');
  const [newManagerPhone, setNewManagerPhone] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<number>(1500);
  const [newColorTheme, setNewColorTheme] = useState<WarehouseSubFolder['colorTheme']>('amber');
  const [newSubZonesInput, setNewSubZonesInput] = useState<string>('قطاع التخزين العام, قطاع التغليف والتجهيز');

  if (!isOpen) return null;

  // Calculate total units in each warehouse folder
  const warehouseStockStats = warehouseFolders.map(folder => {
    let units = 0;
    inventory.forEach(item => {
      if (item.warehouseAllocations && item.warehouseAllocations[folder.id] !== undefined) {
        units += item.warehouseAllocations[folder.id];
      } else if (
        item.warehouseLocation.includes(folder.name) ||
        item.warehouseLocation.includes(folder.city)
      ) {
        units += item.currentStock;
      }
    });
    const fillPercent = Math.min(100, Math.round((units / Math.max(1, folder.capacityUnits)) * 100));
    return {
      folder,
      units,
      fillPercent
    };
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      if (onShowToast) onShowToast('⚠️ يرجى إدخال اسم المخزن أو المجلد الفرعي');
      return;
    }

    const generatedCode = newShortCode.trim() || `WH-${(warehouseFolders.length + 1).toString().padStart(2, '0')}`;
    const subZones = newSubZonesInput
      .split(',')
      .map(z => z.trim())
      .filter(Boolean);

    const newFolder: WarehouseSubFolder = {
      id: `wh-custom-${Date.now()}`,
      name: newName.trim(),
      shortCode: generatedCode,
      city: newCity.trim(),
      locationDetails: newLocationDetails.trim() || 'مستودع فرعي قيد التهيئة اللوجستية',
      managerName: newManagerName.trim() || 'غير محدد',
      managerPhone: newManagerPhone.trim() || '+201000000000',
      capacityUnits: Math.max(100, Number(newCapacity) || 1000),
      colorTheme: newColorTheme,
      subZones: subZones.length > 0 ? subZones : ['القطاع الرئيسي للتخزين'],
      isPrimary: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...warehouseFolders, newFolder];
    onSaveWarehouseFolders(updated);

    // Reset form
    setNewName('');
    setNewShortCode('');
    setNewLocationDetails('');
    setNewManagerName('');
    setNewManagerPhone('');
    setIsAddingNew(false);

    if (onShowToast) {
      onShowToast(`🏢 تم إنشاء مجلد مخزن جديد بنجاح: "${newFolder.name}" (${newFolder.city})`);
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (warehouseFolders.length <= 1) {
      if (onShowToast) onShowToast('⚠️ لا يمكن حذف المخزن الوحيد المتبقي في النظام');
      return;
    }
    const updated = warehouseFolders.filter(f => f.id !== folderId);
    onSaveWarehouseFolders(updated);
    if (onShowToast) {
      onShowToast(`🗑️ تم حذف مجلد المخزن: "${folderName}"`);
    }
  };

  const handleSetPrimary = (folderId: string) => {
    const updated = warehouseFolders.map(f => ({
      ...f,
      isPrimary: f.id === folderId
    }));
    onSaveWarehouseFolders(updated);
    if (onShowToast) {
      onShowToast('⭐ تم تعيين المخزن كمخزن رئيسي افتراضي');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div
        id="modal-warehouse-folders-manager"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">إدارة مجلدات وفروع المخازن (Warehouse Folders)</h3>
              <p className="text-xs text-indigo-200">
                تقسيم المخزون على فروع ومستودعات جغرافية (دمياط، 6 أكتوبر، إلخ) وتتبع مستوياتها وسعتها
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top Info Banner */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-black text-indigo-900">
                ميزة تعدد المخازن والمجلدات الفرعية:
              </strong>
              <span>
                تتيح لك إدارة بضائعك بدقة عبر عدة مواقع جغرافية، معرفة الرصيد الفعلي في كل مخزن على حدة، ونقل الكميات بين الفروع بسهولة لتلبية طلبيات المنصات المختلفة.
              </span>
            </div>
          </div>

          {/* Existing Warehouses Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">
                المخازن والمجلدات المسجلة حالياً ({warehouseFolders.length})
              </span>
              {!isAddingNew && (
                <button
                  id="btn-add-warehouse-folder-toggle"
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مجلد مخزن جديد +</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {warehouseStockStats.map(({ folder, units, fillPercent }) => (
                <div
                  key={folder.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    folder.isPrimary
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/40 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black bg-slate-900 text-white">
                        {folder.shortCode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {folder.name}
                      </h4>
                    </div>
                    {folder.isPrimary ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                        الرئيسي ⭐
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimary(folder.id)}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 underline font-bold cursor-pointer"
                      >
                        تعيين كرئيسي
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{folder.city} — {folder.locationDetails}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>أمين المخزن: {folder.managerName} ({folder.managerPhone})</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-2 border-t border-slate-200/70 text-[10px]">
                    <div className="flex items-center justify-between text-slate-600 font-bold">
                      <span>إشغال المخزن: {units.toLocaleString()} / {folder.capacityUnits.toLocaleString()} قطعة</span>
                      <span className={fillPercent > 85 ? 'text-rose-600 font-black' : 'text-slate-700'}>
                        {fillPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${fillPercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          fillPercent > 85 ? 'bg-rose-500' : fillPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Sub-zones tags */}
                  {folder.subZones && folder.subZones.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-2.5">
                      {folder.subZones.map((zone, zIdx) => (
                        <span key={zIdx} className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 text-[9px] font-medium">
                          {zone}
                        </span>
                      ))}
                    </div>
                  )}

                  {!folder.isPrimary && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="text-[10px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>حذف المجلد</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Warehouse Form (Collapsible) */}
          {isAddingNew && (
            <form onSubmit={handleCreateFolder} className="p-4 rounded-2xl bg-slate-50 border border-indigo-200 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-600" />
                  بيانات المخزن أو المجلد الفرعي الجديد
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المخزن *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: مخزن دمياط 2، مخزن العبور، مخزن بدر..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">المدينة / المنطقة الصناعية *</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="دمياط، 6 أكتوبر، العاشر من رمضان، القاهرة..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">كود المخزن المختصر (SKU Code)</label>
                  <input
                    type="text"
                    value={newShortCode}
                    onChange={(e) => setNewShortCode(e.target.value.toUpperCase())}
                    placeholder="DMT-02, OCT-03, CAI-05..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">السعة الاستيعابية القصوى (قطع)</label>
                  <input
                    type="number"
                    min="100"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">العنوان التفصيلي وموقع المستودع</label>
                  <input
                    type="text"
                    value={newLocationDetails}
                    onChange={(e) => setNewLocationDetails(e.target.value)}
                    placeholder="القطاع، رقم الهنجر، اسم الشارع، معالم الوصول..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم أمين / مدير المخزن</label>
                  <input
                    type="text"
                    value={newManagerName}
                    onChange={(e) => setNewManagerName(e.target.value)}
                    placeholder="م/ أحمد فؤاد"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">هاتف أمين المخزن (واتساب)</label>
                  <input
                    type="text"
                    value={newManagerPhone}
                    onChange={(e) => setNewManagerPhone(e.target.value)}
                    placeholder="+201012345678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    الأقسام والقطاعات الداخلية (مفصولة بفاصلة ,)
                  </label>
                  <input
                    type="text"
                    value={newSubZonesInput}
                    onChange={(e) => setNewSubZonesInput(e.target.value)}
                    placeholder="قطاع غرف النوم, قطاع المكاتب والكراسي, رفوف التغليف..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  حفظ وتأكيد المخزن 💾
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500 font-medium">
            يتم حفظ المجلدات الفرعية تلقائياً ومشاركتها مع كافة تقارير المخزون
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
