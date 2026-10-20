import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
  RefreshCw,
  Plus,
  ArrowRight,
  Database
} from 'lucide-react';
import { ProductData } from '../types';
import {
  parseProductsCSV,
  buildFullProductsFromParsed,
  downloadProductImportTemplate,
  CSVParseResult,
  ParsedCSVRow
} from '../utils/csvProductManager';

interface ProductCSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedProducts: ProductData[], mode: 'merge' | 'append' | 'replace') => void;
  onOpenAiEnricher?: () => void;
  existingProductCount?: number;
  currency?: string;
  onShowToast?: (message: string) => void;
}

export const ProductCSVImportModal: React.FC<ProductCSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onOpenAiEnricher,
  existingProductCount = 0,
  currency = 'EGP',
  onShowToast
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvRawContent, setCsvRawContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'append' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (file.size === 0) {
      if (onShowToast) onShowToast('⚠️ الملف المرفوع فارغ (0 بايت). يرجى اختيار ملف CSV صالح.');
      return;
    }
    setSelectedFileName(file.name);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = (e.target?.result as string) || '';
          if (!text.trim()) {
            if (onShowToast) onShowToast('⚠️ محتوى الملف فارغ. يرجى التأكد من البيانات داخل ملف CSV.');
            return;
          }
          setCsvRawContent(text);
          processCSVContent(text);
        } catch (err: any) {
          console.error('Error processing CSV text:', err);
          if (onShowToast) onShowToast('حدث خطأ أثناء معالجة نصوص ملف الـ CSV.');
        }
      };
      reader.onerror = () => {
        if (onShowToast) onShowToast('فشل في قراءة الملف من الجهاز.');
      };
      reader.readAsText(file, 'UTF-8');
    } catch (err: any) {
      console.error('FileReader initialization error:', err);
      if (onShowToast) onShowToast('تعذر فتح قارئ الملفات في المتصفح.');
    }
  };

  const processCSVContent = (text: string) => {
    const result = parseProductsCSV(text);
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

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const builtProducts = buildFullProductsFromParsed(parseResult.validRows);
      onImportSuccess(builtProducts, importMode);
      setIsProcessing(false);
      onClose();
      
      if (onShowToast) {
        const modeLabel = 
          importMode === 'merge' ? 'دمج وتحديث' :
          importMode === 'append' ? 'إضافة' : 'استبدال كامل لـ';
        onShowToast(`تم ${modeLabel} ${builtProducts.length} منتج في كتالوج المخزون بنجاح! 📦✨`);
      }
    }, 450);
  };

  const handleReset = () => {
    setSelectedFileName(null);
    setCsvRawContent('');
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const rowsToDisplay = parseResult
    ? (previewFilter === 'valid'
        ? parseResult.validRows
        : previewFilter === 'invalid'
        ? parseResult.invalidRows
        : [...parseResult.validRows, ...parseResult.invalidRows])
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Cairo'] animate-fadeIn" dir="rtl">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                استيراد قائمة المنتجات عبر ملف CSV / Excel
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                  متوافق مع إكسل العربي
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ارفع ملف المخزون أو حمل القالب النموذجي لتحديث الأسعار وتكاليف الجملة مجمعة
              </p>
            </div>
          </div>

          <button
            id="btn-close-import-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Download Template Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  هل تحتاج إلى نموذج جاهز لتعبئة منتجاتك؟
                </h4>
                <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
                  حمل قالب CSV بالعناوين العربية المتطابقة، جاهز للفتح في Microsoft Excel والتعديل عليه مباشرة.
                </p>
              </div>
            </div>

            <button
              id="btn-download-csv-template"
              type="button"
              onClick={downloadProductImportTemplate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل القالب النموذجي (Excel/CSV)</span>
            </button>
          </div>

          {/* AI Excel Sheet Upload & Enrichment Callout Banner */}
          {onOpenAiEnricher && (
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-4 border border-indigo-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-indigo-950">
                      جديد: رفع شيت إكسيل بالاسم والأبعاد مع إثراء الذكاء الاصطناعي (AI)
                    </h4>
                    <span className="text-[9px] bg-indigo-200 text-indigo-800 font-black px-1.5 py-0.5 rounded-full">
                      Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 mt-0.5 leading-relaxed">
                    لديك فقط أسماء المنتجات وأبعادها؟ يقوم الذكاء الاصطناعي بإضافة كافة المواصفات، لينكات الصور، وأقل سعر منافس بالسوق المصري تلقائياً.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiEnricher();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>تجربة إثراء الشيت بالذكاء الاصطناعي ✨</span>
              </button>
            </div>
          )}

          {/* Upload Area / Text Paste Switcher */}
          {!parseResult ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع ملف CSV / TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'paste' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>لصق بيانات CSV مباشرة</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                /* Drag and Drop Zone */
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-2xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h5 className="font-bold text-slate-800 text-sm">
                    اسحب وأفلت ملف الـ CSV هنا أو اضغط للاختيار من جهازك
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    يدعم ملفات .csv الصادرة من Excel أو Google Sheets أو أي نظام إدارة مخزون
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>ترميز UTF-8 مدعوم بالكامل</span>
                    <span>•</span>
                    <span>يدعم الفواصل العادية والمنقوطة</span>
                  </div>
                </div>
              ) : (
                /* Paste Text Direct Zone */
                <div className="space-y-2">
                  <textarea
                    rows={7}
                    value={csvRawContent}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="الصق نص الـ CSV هنا (مثلاً: اسم المنتج,العلامة التجارية,التصنيف,تكلفة الجملة,سعر البيع)..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                    dir="auto"
                  />
                  <p className="text-[11px] text-slate-400 text-right">
                    💡 يمكنك نسخ صفوف الأعمدة مباشرة من Excel ولصقها هنا وسيتم تحليلها فوراً.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Parsed File Preview & Summary */
            <div className="space-y-4">
              
              {/* File Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {selectedFileName || 'بيانات CSV تم لصقها'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      إجمالي الصفوف المكتشفة: {parseResult.totalRows} صف
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>اختيار ملف آخر</span>
                  </button>
                </div>
              </div>

              {/* Validation Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">منتجات صالحة للاستيراد</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{parseResult.validRows.length}</span>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-sky-900">صفوف غير مكتملة / أخطاء</span>
                  </div>
                  <span className="text-sm font-black text-sky-700">{parseResult.invalidRows.length}</span>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900">مخزونك الحالي المسجل</span>
                  </div>
                  <span className="text-sm font-black text-indigo-700">{existingProductCount} منتج</span>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  طريقة دمج المنتجات المستوردة مع المخزون الحالي:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === 'merge' ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">دمج وتحديث (موصى به)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">تحديث أسعار الأصناف المتطابقة بالـ SKU وإضافة المنتجات الجديدة.</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === 'append' ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">إضافة كأصناف جديدة</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">إضافة كافة الصفوف كأصناف جديدة بأكواد مميزة دون مساس بالموجود.</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    importMode === 'replace' ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">استبدال كامل الكتالوج</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">مسح القائمة الحالية واعتماد محتويات هذا الملف فقط ككتالوج رئيسي.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table Header & Filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">معاينة الصفوف المستوردة:</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      الكل ({parseResult.totalRows})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('valid')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        previewFilter === 'valid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      الصالحة ({parseResult.validRows.length})
                    </button>
                    {parseResult.invalidRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('invalid')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          previewFilter === 'invalid' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        بها ملاحظات ({parseResult.invalidRows.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Container */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-56 overflow-y-auto custom-scrollbar">
                  <table className="w-full min-w-[650px] text-right text-xs">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">اسم المنتج</th>
                        <th className="p-2.5">الماركة</th>
                        <th className="p-2.5">التصنيف</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">التكلفة</th>
                        <th className="p-2.5">سعر البيع</th>
                        <th className="p-2.5">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rowsToDisplay.map((row) => {
                        const p = row.product;
                        return (
                          <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 hover:bg-rose-50'}>
                            <td className="p-2.5 text-slate-400 font-mono text-[11px]"><bdi>{row.rowNumber}</bdi></td>
                            <td className="p-2.5 font-bold text-slate-800 max-w-[220px] truncate" title={p?.title}>
                              <bdi>{p?.title || <span className="text-rose-500 italic">مفقود</span>}</bdi>
                            </td>
                            <td className="p-2.5 text-slate-600"><bdi>{p?.brand || '-'}</bdi></td>
                            <td className="p-2.5 text-slate-600"><bdi>{p?.category || '-'}</bdi></td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-500"><bdi>{p?.sku || '-'}</bdi></td>
                            <td className="p-2.5 font-bold text-slate-700 font-mono"><bdi>{p?.estimatedWholesaleCost ? `${p.estimatedWholesaleCost.toLocaleString()} ${currency}` : '-'}</bdi></td>
                            <td className="p-2.5 font-bold text-emerald-600 font-mono"><bdi>{p?.suggestedRetailPrice ? `${p.suggestedRetailPrice.toLocaleString()} ${currency}` : '-'}</bdi></td>
                            <td className="p-2.5">
                              {row.isValid ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  جاهز
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 inline-flex items-center gap-1" title={row.errors.join(' • ')}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {row.errors[0] || 'غير مكتمل'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parseResult ? (
              <span>
                سيتم استيراد <strong className="text-emerald-600 font-bold">{parseResult.validRows.length}</strong> من أصل {parseResult.totalRows} منتج
              </span>
            ) : (
              <span>يدعم ملفات حتى 5,000 منتج دفعة واحدة</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-import"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            {parseResult && parseResult.validRows.length > 0 && (
              <button
                id="btn-submit-confirm-import"
                type="button"
                onClick={handleConfirmImport}
                disabled={isProcessing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاستيراد والتحديث...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>تأكيد واستيراد ({parseResult.validRows.length}) منتج إلى الكتالوج</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
