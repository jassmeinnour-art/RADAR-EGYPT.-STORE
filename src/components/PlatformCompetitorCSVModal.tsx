import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Store,
  Check,
  ChevronLeft,
  ArrowRight,
  HelpCircle,
  Eye,
  Trash2,
  Zap,
  Tag,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { ConnectedMerchantPlatform, ProductData, PlatformCompetitorRecord } from '../types';
import {
  parseCompetitorsCSV,
  downloadCompetitorCSVTemplate,
  mergeCompetitorsIntoProducts,
  CompetitorCSVParseResult,
  ParsedCompetitorRow
} from '../utils/competitorCSVManager';

interface PlatformCompetitorCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: ConnectedMerchantPlatform;
  allProducts: ProductData[];
  currentProduct: ProductData;
  onImportComplete: (
    updatedProducts: ProductData[],
    updatedActiveProduct: ProductData,
    newRecords: PlatformCompetitorRecord[],
    platformId: string,
    mode: 'merge' | 'replace'
  ) => void;
  onNavigateToRadar?: () => void;
  onShowToast?: (message: string) => void;
}

export const PlatformCompetitorCSVModal: React.FC<PlatformCompetitorCSVModalProps> = ({
  isOpen,
  onClose,
  platform,
  allProducts,
  currentProduct,
  onImportComplete,
  onNavigateToRadar,
  onShowToast
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvRawContent, setCsvRawContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CompetitorCSVParseResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isSuccess, setIsSuccess] = useState(false);
  const [importedSummary, setImportedSummary] = useState<{ count: number; minPrice: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const platformDisplayName = platform.name.split('(')[0].trim();

  const handleFileChange = (file: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvRawContent(text);
      processCSVContent(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCSVContent = (text: string) => {
    const result = parseCompetitorsCSV(text, platform, allProducts);
    setParseResult(result);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handlePasteChange = (text: string) => {
    setCsvRawContent(text);
    if (text.trim()) {
      processCSVContent(text);
    } else {
      setParseResult(null);
    }
  };

  const handleClear = () => {
    setSelectedFileName(null);
    setCsvRawContent('');
    setParseResult(null);
    setIsSuccess(false);
    setImportedSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    const {
      updatedProducts,
      updatedActiveProduct,
      newCompetitorsRecords,
      mergedCount
    } = mergeCompetitorsIntoProducts(
      parseResult.validRows,
      platform,
      allProducts,
      currentProduct,
      importMode
    );

    const minPrice = Math.min(...parseResult.validRows.map(r => r.price));

    onImportComplete(
      updatedProducts,
      updatedActiveProduct,
      newCompetitorsRecords,
      platform.id,
      importMode
    );

    setImportedSummary({ count: mergedCount, minPrice });
    setIsSuccess(true);

    if (onShowToast) {
      onShowToast(`تم استيراد ${mergedCount} منافس بنجاح لقناة ${platformDisplayName} ودمجهم بالرادار التلقائي! 🎯`);
    }
  };

  const displayedRows = (parseResult?.validRows || []).concat(parseResult?.invalidRows || []).filter(row => {
    if (previewFilter === 'valid') return row.isValid;
    if (previewFilter === 'invalid') return !row.isValid;
    return true;
  });

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn text-right font-['Cairo']"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                  استيراد قائمة منافسين عبر CSV
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  قناة بيع محددة
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                قناة البيع المستهدفة: <strong className="text-indigo-900 font-bold">{platform.name}</strong>
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 no-scrollbar text-xs">
          
          {/* Success Banner */}
          {isSuccess && importedSummary && (
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>تم دمج المنافسين بنجاح في رادار المنافسين التلقائي!</span>
                </div>
                <p className="text-xs text-emerald-100">
                  تمت إضافة <strong>{importedSummary.count}</strong> عروض منافسين لقناة <strong>{platformDisplayName}</strong>. أقل سعر منافس تم رصده: <strong>{importedSummary.minPrice.toLocaleString()} {currentProduct?.currency || 'EGP'}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onNavigateToRadar && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToRadar();
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <span>عرض بالرادار 🎯</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  استيراد ملف آخر
                </button>
              </div>
            </div>
          )}

          {/* Platform & Radar Integration Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-slate-700">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">
                تكامل رادار المنافسين التلقائي مع {platformDisplayName}:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                عند استيراد ملف CSV، سيتم ربط كل منافس بمنتجات متجرك تلقائياً وتحديث أسعار السوق وأقل سعر واحتساب خصم الفوز بصندوق الشراء (Buy Box) فوراً داخل رادار المنافسين.
              </p>
            </div>
          </div>

          {/* Action Row: Download Template & Sample Egyptian Data */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-950 font-bold">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>قالب CSV المعتمد لقناة {platformDisplayName}:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-download-competitor-csv-template"
                onClick={() => downloadCompetitorCSVTemplate(platform.name, platform.code, currentProduct)}
                className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل نموذج CSV 📥</span>
              </button>

              <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200 flex items-center gap-1">
                <span>🛋️</span>
                <span>مطابقة مقتصرة على الأثاث وASIN</span>
              </span>
            </div>
          </div>

          {/* Mode Tabs: File Upload vs Direct Paste */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع ملف CSV من جهازك</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>لصق نص CSV مباشرة</span>
            </button>
          </div>

          {/* Upload Area */}
          {activeTab === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                  : selectedFileName
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>

              {selectedFileName ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>الملف المختار: {selectedFileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    انقر لاختيار ملف آخر أو اسحب ملفاً جديداً إلى هنا
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-sm block">
                    اسحب وأفلت ملف CSV لمنافسي {platformDisplayName} هنا
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    أو انقر لتصفح واختيار الملف من جهازك (ترميز UTF-8)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                الصق محتوى CSV هنا (يشمل صف العناوين بالأعلى):
              </label>
              <textarea
                rows={5}
                value={csvRawContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="اسم المتجر أو المنافس,اسم المنتج أو SKU,سعر المنافس,حالة التوفر,التقييم..."
                dir="ltr"
                className="w-full p-3 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs text-left outline-none"
              />
            </div>
          )}

          {/* Parse Results & Preview Section */}
          {parseResult && (
            <div className="space-y-3 pt-2">
              
              {/* Parse Stats Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-100/80 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">
                    إجمالي المنافسين المقروءين: <strong className="text-indigo-600 font-black">{parseResult.totalRows}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> {parseResult.validRows.length} صالح للرادار
                  </span>
                  {parseResult.invalidRows.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-100/80 px-2 py-0.5 rounded-md text-[10px]">
                      <AlertTriangle className="w-3 h-3" /> {parseResult.invalidRows.length} به ملاحظات
                    </span>
                  )}
                </div>

                {/* Filter Preview */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      previewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    الكل ({parseResult.validRows.length + parseResult.invalidRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      previewFilter === 'valid' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    الصالح فقط ({parseResult.validRows.length})
                  </button>
                  {parseResult.invalidRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('invalid')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        previewFilter === 'invalid' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      به ملاحظات ({parseResult.invalidRows.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">#</th>
                      <th className="py-2.5 px-3">اسم المنافس / المتجر</th>
                      <th className="py-2.5 px-3">المنتج المرتبط</th>
                      <th className="py-2.5 px-3">سعر المنافس</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3">التوصيل</th>
                      <th className="py-2.5 px-3">حالة الصف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayedRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/60'}>
                        <td className="py-2 px-3 font-mono text-slate-400">{row.rowNumber}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{row.competitorName || '—'}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-[150px] truncate" title={row.matchedProductTitle || row.productTitleOrSku}>
                          {row.matchedProductTitle ? (
                            <span className="text-indigo-700 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {row.matchedProductTitle}
                            </span>
                          ) : (
                            <span className="text-slate-500">{row.productTitleOrSku || currentProduct?.title}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {row.price > 0 ? `${row.price.toLocaleString()} ${currentProduct?.currency || 'EGP'}` : '—'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                            row.stockStatus === 'in_stock' ? 'bg-emerald-50 text-emerald-700' :
                            row.stockStatus === 'low_stock' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {row.stockStatus === 'in_stock' ? 'متوفر' : row.stockStatus === 'low_stock' ? 'مخزون قليل' : 'غير متوفر'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{row.deliveryTime}</td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> صالح
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold" title={row.errors.join(' • ')}>
                              {row.errors[0] || 'خطأ'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">خيارات الدمج مع رادار المنافسين:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    importMode === 'merge' ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="compImportMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="block text-xs">دمج مع المنافسين الحاليين (Merge)</span>
                      <span className="text-[10px] text-slate-500 font-normal">إضافة العروض الجديدة دون مسح المنافسين السابقين</span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    importMode === 'replace' ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="compImportMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600"
                    />
                    <div>
                      <span className="block text-xs">استبدال منافسي هذه القناة (Replace)</span>
                      <span className="text-[10px] text-slate-500 font-normal">استبدال عروض {platformDisplayName} القديمة بالقائمة الجديدة</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedFileName && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
            >
              إغلاق
            </button>

            <button
              type="button"
              id="btn-confirm-import-competitors"
              onClick={handleExecuteImport}
              disabled={!parseResult || parseResult.validRows.length === 0}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                parseResult && parseResult.validRows.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-sky-300 fill-sky-300" />
              <span>
                تأكيد واستيراد {parseResult?.validRows.length || 0} منافس إلى الرادار ⚡
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
