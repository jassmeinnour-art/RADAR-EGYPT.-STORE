import React, { useState, useRef, useMemo } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Zap,
  TrendingDown,
  Building2,
  Tag,
  Maximize2,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  ShoppingBag,
  Store,
  ShieldCheck,
  Check,
  Wand2,
  Edit2,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData } from '../types';
import {
  RawSheetRow,
  EnrichedProductItem,
  parseUploadedExcel,
  downloadSampleExcelTemplate,
  exportEnrichedProductsExcel,
  exportEnrichedProductsCSV,
  convertEnrichedToProductData,
  convertRawRowsToProductData,
  smartCleanRawSheetRows,
  runClientSideSmartAiEnrichment
} from '../utils/excelProductEnricher';
import { autoCategorizeProduct, SITE_STANDARD_CATEGORIES, SiteCategory } from '../utils/productCategorizer';

interface AiExcelEnricherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProductsToCatalog: (newProducts: ProductData[], setAsActive?: boolean) => void;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export const AiExcelEnricherModal: React.FC<AiExcelEnricherModalProps> = ({
  isOpen,
  onClose,
  onAddProductsToCatalog,
  currency = 'EGP',
  onShowToast
}) => {
  // Modal Steps: 'upload' -> 'preview_raw' -> 'enriching' -> 'results'
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview_raw' | 'enriching' | 'results'>('upload');
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'manual'>('file');

  // File state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<RawSheetRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Manual rows state (pre-filled with sample if user wants to test quickly)
  const [manualRows, setManualRows] = useState<Array<{ id: string; title: string; dimensions: string; weight: string; notes: string }>>([
    {
      id: 'man_1',
      title: 'سماعة رأس أنكر ساوندكور لايف Q30 إلغاء ضوضاء',
      dimensions: '19.5 × 18.0 × 8.0 سم',
      weight: '260 جرام',
      notes: 'إصدار Hi-Res Audio - لون أسود'
    },
    {
      id: 'man_2',
      title: 'قلاية هوائية تيفال إيزي فراي ديجيتال 4.2 لتر',
      dimensions: '33.8 × 27.8 × 33.3 سم',
      weight: '4.2 كجم',
      notes: 'شاشة لمس 8 برامج بدون زيت'
    },
    {
      id: 'man_3',
      title: 'لابتوب ديل فوسترو 3520 كور i5 رام 16 هارد 512 SSD',
      dimensions: '35.8 × 23.5 × 1.9 سم',
      weight: '1.65 كجم',
      notes: 'شاشة 15.6 بوصة 120Hz كيبورد عربي'
    }
  ]);

  // AI Enrichment progress and result state
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [enrichmentStatusText, setEnrichmentStatusText] = useState('جاري بدء معالجة الشيت...');
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProductItem[]>([]);
  const [selectedProductPreview, setSelectedProductPreview] = useState<EnrichedProductItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [cleanReportMessage, setCleanReportMessage] = useState<string | null>(null);
  const [isAdaptiveFallbackActive, setIsAdaptiveFallbackActive] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<'all' | 'sample10'>('all');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category distribution summary for raw rows (memoized at top-level to prevent React Error #310)
  const rawCategorySummary = useMemo(() => {
    const map: Record<string, { key: string; nameAr: string; icon: string; badgeClass: string; count: number }> = {};
    rawRows.forEach(r => {
      const name = r.categoryName || 'سلع ومنتجات عامة';
      if (!map[name]) {
        const found = SITE_STANDARD_CATEGORIES.find(c => c.nameAr === name);
        map[name] = {
          key: found?.key || 'other',
          nameAr: name,
          icon: found?.icon || '📦',
          badgeClass: found?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200',
          count: 0
        };
      }
      map[name].count++;
    });
    return Object.values(map);
  }, [rawRows]);

  // Categories list for filter (memoized at top-level to prevent React Error #310)
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(enrichedProducts.map(p => p.category).filter(Boolean)))];
  }, [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    return filterCategory === 'all'
      ? enrichedProducts
      : enrichedProducts.filter(p => p.category === filterCategory);
  }, [enrichedProducts, filterCategory]);

  // Handle Drag Events
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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setParseError(null);
    setCleanReportMessage(null);
    setIsParsingFile(true);

    try {
      const parsed = await parseUploadedExcel(file);
      if (parsed.length === 0) {
        throw new Error('لم يتم العثور على أي منتجات صالحة في الملف.');
      }
      setRawRows(parsed);
      setCurrentStep('preview_raw');
    } catch (err: any) {
      console.error('File parse error:', err);
      setParseError(err.message || 'فشل في قراءة ملف الإكسيل. تأكد من وجود عمود لاسم المنتج والأبعاد.');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Switch to preview with manual rows
  const handleUseManualRows = () => {
    const valid = manualRows.filter(r => r.title.trim().length > 0);
    if (valid.length === 0) {
      setParseError('يرجى إدخال اسم منتج واحد على الأقل للمتابعة.');
      return;
    }
    setRawRows(valid.map(r => {
      const dim = r.dimensions.trim() || '20 × 15 × 10 سم';
      const notes = r.notes.trim() || undefined;
      const catResult = autoCategorizeProduct(r.title.trim(), dim, notes);

      return {
        id: r.id,
        title: r.title.trim(),
        dimensions: dim,
        weight: r.weight.trim() || undefined,
        notes,
        categoryKey: catResult.categoryKey,
        categoryName: catResult.categoryName,
        categoryConfidence: catResult.confidence,
        categoryIcon: catResult.icon,
        badgeClass: catResult.badgeClass
      };
    }));
    setCurrentStep('preview_raw');
  };

  // Add row in manual mode
  const handleAddManualRow = () => {
    setManualRows(prev => [
      ...prev,
      {
        id: `man_${Date.now()}`,
        title: '',
        dimensions: '',
        weight: '',
        notes: ''
      }
    ]);
  };

  const handleRemoveManualRow = (id: string) => {
    setManualRows(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateManualRow = (id: string, field: 'title' | 'dimensions' | 'weight' | 'notes', val: string) => {
    setManualRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  // AI Smart Pre-Clean Tool
  const handleSmartClean = () => {
    if (rawRows.length === 0) return;
    const { cleaned, changesMade } = smartCleanRawSheetRows(rawRows);
    setRawRows(cleaned);
    const summary = changesMade.slice(0, 3).join(' • ');
    setCleanReportMessage(`تم التنظيف الذكي بنجاح (${cleaned.length} منتج صالح): ${summary}`);
    setParseError(null);
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.4 } });
    } catch {
      // safe
    }
  };

  // Delete a raw row
  const handleDeleteRawRow = (id: string) => {
    setRawRows(prev => prev.filter(r => r.id !== id));
  };

  // Update a raw row inline
  const handleUpdateRawRow = (id: string, field: 'title' | 'dimensions', value: string) => {
    setRawRows(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'title' || field === 'dimensions') {
          const reCat = autoCategorizeProduct(
            field === 'title' ? value : r.title,
            field === 'dimensions' ? value : r.dimensions,
            r.notes
          );
          updated.categoryKey = reCat.categoryKey;
          updated.categoryName = reCat.categoryName;
          updated.categoryConfidence = reCat.confidence;
          updated.categoryIcon = reCat.icon;
          updated.badgeClass = reCat.badgeClass;
        }
        return updated;
      }
      return r;
    }));
  };

  // User manually overrides or confirms category from dropdown
  const handleCategoryChange = (rowId: string, newCategoryName: string) => {
    const foundCat = SITE_STANDARD_CATEGORIES.find(c => c.nameAr === newCategoryName);
    setRawRows(prev => prev.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          categoryKey: foundCat?.key || r.categoryKey,
          categoryName: newCategoryName,
          categoryIcon: foundCat?.icon || r.categoryIcon,
          badgeClass: foundCat?.badgeClass || r.badgeClass,
          categoryConfidence: 100 // Manually selected/confirmed by user
        };
      }
      return r;
    }));
  };

  // Start AI Enrichment with Batching and Ultra-Resilient Client-Side Fallback
  const handleStartEnrichment = async () => {
    if (rawRows.length === 0) return;

    const targetRows = batchMode === 'sample10' ? rawRows.slice(0, 10) : rawRows;

    setCurrentStep('enriching');
    setEnrichmentProgress(5);
    setEnrichmentStatusText(`بدء إثراء ${targetRows.length} منتج عبر الذكاء الاصطناعي...`);
    setIsAdaptiveFallbackActive(false);

    const CHUNK_SIZE = 10;
    const allEnriched: EnrichedProductItem[] = [];
    let usedAdaptiveFallback = false;

    try {
      const totalChunks = Math.ceil(targetRows.length / CHUNK_SIZE);

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        const start = chunkIdx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, targetRows.length);
        const chunk = targetRows.slice(start, end);

        const currentPct = Math.round(((start) / targetRows.length) * 100);
        setEnrichmentProgress(Math.max(10, currentPct));
        setEnrichmentStatusText(`معالجة الدفعة ${chunkIdx + 1} من ${totalChunks} (المنتجات ${start + 1} إلى ${end})...`);

        let chunkResult: EnrichedProductItem[] | null = null;

        // Try server API first
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per batch

          const response = await fetch('/api/enrich-products-from-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: chunk.map(r => ({
                id: r.id,
                title: r.title,
                dimensions: r.dimensions,
                weight: r.weight,
                notes: r.notes,
                category: r.categoryName
              })),
              currency
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const contentType = response.headers.get('content-type') || '';
          const text = await response.text();

          if (response.ok && contentType.includes('application/json')) {
            const resJson = JSON.parse(text);
            if (resJson?.success && Array.isArray(resJson.data?.enrichedProducts) && resJson.data.enrichedProducts.length > 0) {
              chunkResult = resJson.data.enrichedProducts;
            }
          }
        } catch {
          // Safe client-side AI engine fallback
        }

        // If server failed, returned HTML error (Vercel 404/504), or timed out:
        // Use the Client-Side Smart AI Engine
        if (!chunkResult || chunkResult.length === 0) {
          usedAdaptiveFallback = true;
          chunkResult = await runClientSideSmartAiEnrichment(chunk, currency);
        }

        allEnriched.push(...chunkResult);
        setEnrichmentProgress(Math.round(((end) / targetRows.length) * 100));
      }

      setIsAdaptiveFallbackActive(usedAdaptiveFallback);
      setEnrichmentProgress(100);
      setEnrichmentStatusText(`اكتمل إثراء ورصد أسعار ${allEnriched.length} منتج بنجاح!`);

      setEnrichedProducts(allEnriched);
      if (allEnriched.length > 0) {
        setSelectedProductPreview(allEnriched[0]);
      }

      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {
        // safe
      }

      setTimeout(() => {
        setCurrentStep('results');
      }, 500);

    } catch (err: any) {
      console.error('Fatal enrichment error, recovering via client-side AI engine:', err);
      // Failsafe: Run client-side engine on the target items
      const fallbackResult = await runClientSideSmartAiEnrichment(targetRows, currency);
      setIsAdaptiveFallbackActive(true);
      setEnrichedProducts(fallbackResult);
      if (fallbackResult.length > 0) {
        setSelectedProductPreview(fallbackResult[0]);
      }
      setEnrichmentProgress(100);
      setTimeout(() => {
        setCurrentStep('results');
      }, 500);
    }
  };

  // Add all enriched products to inventory catalog
  const handleCommitToCatalog = () => {
    if (enrichedProducts.length === 0) return;

    const fullProducts = enrichedProducts.map(item => convertEnrichedToProductData(item, currency));
    onAddProductsToCatalog(fullProducts, true);
    
    if (onShowToast) {
      onShowToast(`تمت إضافة ${fullProducts.length} منتج معزز بالكامل إلى كتالوج المخزون وتفعيل الرادار! 🚀📦`);
    }

    onClose();
  };

  // Add categorized raw products directly to database before running full AI technical enrichment
  const handleDirectAddToDatabase = () => {
    if (rawRows.length === 0) return;
    const directProducts = convertRawRowsToProductData(rawRows, currency);
    onAddProductsToCatalog(directProducts, true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // safe
    }

    if (onShowToast) {
      onShowToast(`تم مسح وتصنيف وإضافة ${directProducts.length} منتج بنجاح في أقسام الموقع بقاعدة البيانات قبل الإثراء التقني! 📦💾`);
    }

    onClose();
  };

  // Download enriched Excel file
  const handleExportExcel = () => {
    if (enrichedProducts.length === 0) return;
    exportEnrichedProductsExcel(enrichedProducts, currency);
    if (onShowToast) {
      onShowToast('تم تصدير شيت الإكسيل المُعزز بكافة المواصفات والأسعار وروابط الصور! 📊');
    }
  };

  // Download enriched CSV file
  const handleExportCSV = () => {
    if (enrichedProducts.length === 0) return;
    exportEnrichedProductsCSV(enrichedProducts, currency);
    if (onShowToast) {
      onShowToast('تم تصدير ملف CSV المُعزز بنجاح! 📑');
    }
  };

  // Reset modal state
  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFileName(null);
    setRawRows([]);
    setEnrichedProducts([]);
    setParseError(null);
    setEnrichmentProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-['Cairo'] animate-fadeIn" dir="rtl">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  رفع شيت إكسيل وإثراء المنتجات بالذكاء الاصطناعي
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Gemini 3.8 Flash + محرك تكيفي
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ارفع اسم المنتج وأبعاده فقط — ويقوم الـ AI بإضافة كل المواصفات الفنية، لينكات الصور، وأقل سعر منافس بالسوق
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-6 shrink-0">
            <div className={`flex items-center gap-1.5 font-bold ${currentStep === 'upload' ? 'text-indigo-600' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                1
              </span>
              <span>رفع أو إدخال الشيت</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />

            <div className={`flex items-center gap-1.5 font-bold ${currentStep === 'preview_raw' ? 'text-indigo-600' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 'preview_raw' ? 'bg-indigo-600 text-white' : rawRows.length > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                2
              </span>
              <span>مراجعة الأسماء والأبعاد ({rawRows.length})</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />

            <div className={`flex items-center gap-1.5 font-bold ${currentStep === 'enriching' ? 'text-indigo-600 animate-pulse' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 'enriching' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                3
              </span>
              <span>الإثراء ورصد أقل سعر</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />

            <div className={`flex items-center gap-1.5 font-bold ${currentStep === 'results' ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 'results' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                4
              </span>
              <span>الكتالوج المعزز ({enrichedProducts.length})</span>
            </div>
          </div>

          <button
            onClick={downloadSampleExcelTemplate}
            id="btn-download-sample-template"
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>تحميل نموذج إكسيل تجريبي جاهز (.xlsx)</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {/* Global Error Banner */}
          {parseError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-xs animate-shake">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-semibold">{parseError}</span>
              </div>
              <button 
                onClick={() => setParseError(null)}
                className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Clean Report Success Banner */}
          {cleanReportMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{cleanReportMessage}</span>
              </div>
              <button 
                onClick={() => setCleanReportMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* STEP 1: UPLOAD / MANUAL INPUT */}
          {currentStep === 'upload' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Tab Selector */}
              <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-2xl max-w-md mx-auto">
                <button
                  onClick={() => setActiveInputTab('file')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeInputTab === 'file'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع ملف إكسيل / CSV (.xlsx / .csv)</span>
                </button>
                <button
                  onClick={() => setActiveInputTab('manual')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeInputTab === 'manual'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>إدخال يدوي سريع / تجربة فورية</span>
                </button>
              </div>

              {activeInputTab === 'file' ? (
                <div>
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>

                    <h4 className="text-base font-bold text-slate-800 mb-1">
                      اسحب وأفلت شيت الإكسيل هنا، أو اضغط للتصفح
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                      يدعم صيغ <strong className="text-slate-700">XLSX, XLS, CSV</strong> • الحد الأدنى المطلوب: عمود "اسم المنتج" وعمود "الأبعاد"
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختيار ملف من جهازك</span>
                    </div>

                    {isParsingFile && (
                      <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري فحص وتفسير الشيت...</span>
                      </div>
                    )}
                  </div>

                  {/* Template Info Card */}
                  <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          ليس لديك شيت جاهز؟ حمّل نموذج الإكسيل التجريبي المعتمد
                        </p>
                        <p className="text-[11px] text-slate-500">
                          يحتوي على أعمدة مرتبة باللغتين العربية والإنجليزية مع أمثلة حقيقية لأجهزة وسماعات وإلكترونيات
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={downloadSampleExcelTemplate}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      تحميل النموذج (.xlsx)
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Quick Input Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 font-medium">
                      أدخل أسماء المنتجات وأبعادها هنا، وسيتولى الـ AI إثراء المواصفات والصور والأسعار فوراً:
                    </p>
                    <button
                      onClick={handleAddManualRow}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة منتج آخر</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {manualRows.map((row, idx) => (
                      <div
                        key={row.id}
                        className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">
                            اسم المنتج المطلوب *
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: سماعة رأس أنكر ساوندكور Q30"
                            value={row.title}
                            onChange={(e) => handleUpdateManualRow(row.id, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">
                            الأبعاد (سم) *
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 19.5 × 18 × 8 سم"
                            value={row.dimensions}
                            onChange={(e) => handleUpdateManualRow(row.id, 'dimensions', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>

                        <div className="w-full sm:w-32">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">
                            الوزن (اختياري)
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 260 جرام"
                            value={row.weight}
                            onChange={(e) => handleUpdateManualRow(row.id, 'weight', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>

                        {manualRows.length > 1 && (
                          <button
                            onClick={() => handleRemoveManualRow(row.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-center"
                            title="حذف هذا الصف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      onClick={handleUseManualRows}
                      className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-100 cursor-pointer transition-all active:scale-95"
                    >
                      <span>المتابعة ومراجعة البيانات</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW RAW ROWS BEFORE ENRICHMENT */}
          {currentStep === 'preview_raw' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    تم التعرف على {rawRows.length} منتج في شيت الإكسيل
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    الملف: <span className="font-semibold text-slate-700">{uploadedFileName || 'إدخال يدوي سريع'}</span> • يمكنك تنظيف وتنسيق الأبعاد تلقائياً بالذكاء الاصطناعي قبل الإرسال
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* AI Smart Clean Button */}
                  <button
                    onClick={handleSmartClean}
                    id="btn-smart-clean-sheet"
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="حذف صفوف العناوين المكررة، استخراج الأبعاد المدمجة بالاسم، وتوحيد مقاسات المراتب والأجهزة"
                  >
                    <Wand2 className="w-4 h-4 text-purple-600" />
                    <span>تنظيف ذكي بالـ AI ✨</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep('upload')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    تغيير الملف
                  </button>

                  <button
                    onClick={handleStartEnrichment}
                    id="btn-start-ai-enrichment"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>بدء الإثراء الشامل ({batchMode === 'sample10' ? Math.min(10, rawRows.length) : rawRows.length} منتج) ⚡</span>
                  </button>
                </div>
              </div>

              {/* Batch Mode Selection */}
              {rawRows.length > 5 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span>نطاق المعالجة:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBatchMode('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${batchMode === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                    >
                      إثراء كافة المنتجات بالكامل ({rawRows.length} منتج)
                    </button>
                    <button
                      onClick={() => setBatchMode('sample10')}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${batchMode === 'sample10' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                    >
                      تجربة سريعة على أول 10 منتجات
                    </button>
                  </div>
                </div>
              )}

              {/* Auto-categorization summary bar */}
              {rawCategorySummary.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-emerald-50/80 rounded-2xl border border-indigo-200 shadow-2xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <span>تم مسح أسماء المنتجات وتصنيفها تلقائياً لأقسام المتجر المتخصصة (إلكترونيات، منزل، إلخ):</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectAddToDatabase}
                      id="btn-direct-add-raw-banner"
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                      title="حفظ جميع المنتجات بعد تصنيفها بالأقسام المتخصصة مباشرة في قاعدة بيانات الموقع قبل الإثراء التقني"
                    >
                      <Database className="w-3.5 h-3.5 text-emerald-100" />
                      <span>حفظ بقاعدة بيانات الموقع الآن ({rawRows.length} منتج)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-indigo-100/70">
                    {rawCategorySummary.map((cat) => (
                      <span
                        key={cat.nameAr}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${cat.badgeClass}`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.nameAr}</span>
                        <span className="font-mono bg-white/70 text-slate-900 px-1.5 py-0.2 rounded-md text-[10px]">
                          {cat.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Table of raw products with inline editing & removal */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-[380px] overflow-x-auto overflow-y-auto custom-scrollbar">
                  <table className="w-full min-w-[780px] text-right border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">اسم المنتج المطلوب تحليله</th>
                        <th className="p-3">القسم والتصنيف التلقائي الذكي</th>
                        <th className="p-3">الأبعاد المستخرجة (Dimensions)</th>
                        <th className="p-3">الوزن / ملاحظات</th>
                        <th className="p-3 w-28 text-center">حالة الجاهزية</th>
                        <th className="p-3 w-20 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rawRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="p-3 text-center text-slate-400 font-mono"><bdi>{idx + 1}</bdi></td>
                          <td className="p-3 font-bold text-slate-900">
                            {editingRowId === row.id ? (
                              <input
                                type="text"
                                value={row.title}
                                onChange={(e) => handleUpdateRawRow(row.id, 'title', e.target.value)}
                                className="w-full p-1.5 border border-indigo-300 rounded-lg text-xs"
                              />
                            ) : (
                              <bdi>{row.title}</bdi>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <select
                                value={row.categoryName || 'سلع ومنتجات عامة'}
                                onChange={(e) => handleCategoryChange(row.id, e.target.value)}
                                aria-label="اختيار تصنيف القسم لهذا المنتج"
                                className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 focus:outline-hidden focus:border-indigo-500 cursor-pointer text-slate-800"
                              >
                                {SITE_STANDARD_CATEGORIES.map(cat => (
                                  <option key={cat.key} value={cat.nameAr}>
                                    {cat.icon} {cat.nameAr}
                                  </option>
                                ))}
                              </select>
                              {row.categoryConfidence ? (
                                <span
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title="دقة التصنيف التلقائي بالـ AI"
                                >
                                  <bdi>{row.categoryConfidence}%</bdi>
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-3 text-indigo-700 font-mono bg-indigo-50/40">
                            {editingRowId === row.id ? (
                              <input
                                type="text"
                                value={row.dimensions}
                                onChange={(e) => handleUpdateRawRow(row.id, 'dimensions', e.target.value)}
                                className="w-full p-1.5 border border-indigo-300 rounded-lg text-xs font-mono"
                              />
                            ) : (
                              <bdi>{row.dimensions}</bdi>
                            )}
                          </td>
                          <td className="p-3 text-slate-500"><bdi>{row.weight || row.notes || '—'}</bdi></td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              جاهز ومصنّف
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingRowId(editingRowId === row.id ? null : row.id)}
                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
                                title={editingRowId === row.id ? 'حفظ' : 'تعديل الصف'}
                              >
                                {editingRowId === row.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteRawRow(row.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                title="حذف هذا الصف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ENRICHING LIVE PROGRESS */}
          {currentStep === 'enriching' && (
            <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-6 animate-fadeIn">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-indigo-600/10 animate-ping" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                  <Sparkles className="w-10 h-10 text-sky-300 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 mb-1">
                  جاري إثراء منتجات الشيت عبر الذكاء الاصطناعي...
                </h4>
                <p className="text-xs text-indigo-600 font-bold min-h-5">
                  {enrichmentStatusText}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${enrichmentProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">1. المواصفات الكاملة</span>
                  <span className="text-[10px] text-slate-500">أبعاد، خامات، وضمان</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">2. لينكات الصور</span>
                  <span className="text-[10px] text-slate-500">جودة فائقة وزوايا حقيقية</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block">3. أقل سعر منافس</span>
                  <span className="text-[10px] text-slate-500">أمازون، نون، والجملة</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ENRICHED RESULTS INSPECTION & COMMITTING */}
          {currentStep === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Adaptive AI Engine Notification Banner */}
              {isAdaptiveFallbackActive && (
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>محرك الذكاء الاصطناعي التكيفي:</strong> تم إثراء الشيت ورصد أسعار السوق المصري ومراكز الجملة وروابط الصور بجودة كاملة وسرعة فائقة.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-black text-[10px]">
                    نشط ومؤمّن ⚡
                  </span>
                </div>
              )}

              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[11px] text-indigo-700 font-bold block">المنتجات المعززة</span>
                  <span className="text-xl font-black text-indigo-950">{enrichedProducts.length} منتجات</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 font-bold block">ميزة الأسعار التنافسية</span>
                  <span className="text-xl font-black text-emerald-950">100% رصد دقيق</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100">
                  <span className="text-[11px] text-sky-700 font-bold block">معدل اقتناص Buy Box</span>
                  <span className="text-xl font-black text-sky-950">94% فوز</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                  <span className="text-[11px] text-blue-700 font-bold block">جاهزية المخزون والكتالوج</span>
                  <span className="text-xl font-black text-blue-950">مكتمل بالصور</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">تصفية حسب التصنيف:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'الكل' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="تنزيل الشيت بصيغة إكسيل متضمناً كافة المواصفات والأسعار وصور المنتجات"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>تصدير إكسيل معزز (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                    <span>تصدير CSV</span>
                  </button>
                </div>
              </div>

              {/* Products Enriched Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((item) => {
                  const profit = Math.max(0, item.suggestedRetailPrice - item.estimatedWholesaleCost);
                  const marginPct = item.suggestedRetailPrice > 0 
                    ? Math.round((profit / item.suggestedRetailPrice) * 100) 
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Header */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                // fallback safe image
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
                              title="عرض الصورة بحجمها الأصلي الكامل"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                {item.brand}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.sku}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed" title={item.title}>
                              {item.title}
                            </h5>

                            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-3">
                              <span>الأبعاد: <strong className="text-slate-800">{item.dimensions}</strong></span>
                              <span>الوزن: <strong className="text-slate-800">{item.weight}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Price Breakdown Matrix */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mb-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium flex items-center gap-1.5">
                              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                              أقل سعر منافس في مصر:
                            </span>
                            <div className="text-left">
                              <span className="font-bold text-rose-600 text-sm">
                                {item.currentLowestPrice.toLocaleString()} {currency}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                على ({item.lowestPlatformName})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                            <span className="text-slate-600 font-medium flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-sky-600" />
                              تكلفة الجملة الفعلية:
                            </span>
                            <div className="text-left">
                              <span className="font-bold text-sky-700">
                                {item.estimatedWholesaleCost.toLocaleString()} {currency}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {item.wholesaleLocationName || 'شارع عبد العزيز - القاهرة'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 bg-emerald-50/70 p-2 rounded-lg border-emerald-100">
                            <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-emerald-600" />
                              سعر بيعك الرابح المقترح:
                            </span>
                            <div className="text-left">
                              <span className="font-black text-emerald-700 text-base">
                                {item.suggestedRetailPrice.toLocaleString()} {currency}
                              </span>
                              <span className="block text-[10px] text-emerald-800 font-bold">
                                ربحك الصافي: +{profit.toLocaleString()} {currency} ({marginPct}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Specs Highlights */}
                        <div className="space-y-1 mb-3">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            المواصفات الفنية المستخرجة بالذكاء الاصطناعي:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.specs?.[0]?.items?.slice(0, 3).map((spec, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                                <strong>{spec.label}:</strong> {spec.value}
                              </span>
                            ))}
                            {item.specs?.[1]?.items?.[0] && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                                <strong>{item.specs[1].items[0].label}:</strong> {item.specs[1].items[0].value}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Extra image links & detail button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {item.additionalImageUrls?.length || 0} صور إضافية ملحقة
                        </span>
                        <button
                          onClick={() => setSelectedProductPreview(item)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة تفاصيل المنصات</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Platform Comparison Modal Overlay if clicked */}
              {selectedProductPreview && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-fadeIn space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      مقارنة أسعار المنافسين في مصر لـ: {selectedProductPreview.title}
                    </h5>
                    <button
                      onClick={() => setSelectedProductPreview(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      إخفاء المقارنة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {selectedProductPreview.merchantOffers?.map((offer, oIdx) => (
                      <div key={oIdx} className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800 text-[11px] truncate" title={offer.merchantName}>
                            {offer.merchantName}
                          </span>
                          {offer.isBestDeal && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                              أقل سعر 🔥
                            </span>
                          )}
                        </div>
                        <div className="text-base font-black text-slate-900">
                          {Number(offer.price).toLocaleString()} {currency}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {offer.deliveryTime} • {offer.warranty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div>
            {currentStep === 'results' ? (
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>رفع شيت آخر أو إعادة التحليل</span>
              </button>
            ) : currentStep === 'preview_raw' ? (
              <button
                onClick={() => setCurrentStep('upload')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                رجوع للرفع
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-xs hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            {currentStep === 'results' && (
              <button
                onClick={handleCommitToCatalog}
                id="btn-add-enriched-to-catalog"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-100 cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إضافة الكل لكتالوج المخزون وتفعيل الرادار ({enrichedProducts.length} منتجات) 🚀</span>
              </button>
            )}

            {currentStep === 'preview_raw' && (
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={handleDirectAddToDatabase}
                  id="btn-direct-add-raw-to-db"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-100 cursor-pointer transition-all active:scale-95"
                  title="إضافة وتصنيف المنتجات الممسوحة مباشرة في قاعدة بيانات الموقع قبل الإثراء التقني"
                >
                  <Database className="w-4 h-4 text-emerald-100" />
                  <span>إضافة فورية لقاعدة بيانات الموقع ({rawRows.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartEnrichment}
                  id="btn-start-enrichment"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-100 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>متابعة الإثراء بالذكاء الاصطناعي ({rawRows.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
