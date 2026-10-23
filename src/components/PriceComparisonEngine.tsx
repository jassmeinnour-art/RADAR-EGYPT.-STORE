import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowRight,
  HelpCircle,
  Tag,
  FileText
} from 'lucide-react';
import { INITIAL_AUTO_PRICING_PRODUCTS, AUTO_PRICING_PRODUCTS_STORAGE_KEY } from '../data/autoPricingEngineData';
import { AutoPricingProductItem } from '../types/autoPricing';

interface ComparisonItem {
  id: string;
  sku: string;
  title: string;
  merchantPrice: number;
  costPrice: number;
  competitorPrice: number;
  competitorName: string;
  competitorPlatform: string;
  priceGapAmount: number;
  priceGapPercent: number;
  status: 'higher' | 'lower' | 'optimal';
  recommendedPrice: number;
  recommendationReason: string;
}

interface PriceComparisonEngineProps {
  currency?: string;
  onApplyPrice?: (sku: string, newPrice: number) => void;
  onShowToast?: (msg: string) => void;
}

export function PriceComparisonEngine({
  currency = 'ج.م',
  onApplyPrice,
  onShowToast
}: PriceComparisonEngineProps) {
  const [products, setProducts] = useState<AutoPricingProductItem[]>([]);
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'higher' | 'lower' | 'optimal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_PRICING_PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          generateComparison(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load stored auto pricing products:', e);
    }
    setProducts(INITIAL_AUTO_PRICING_PRODUCTS);
    generateComparison(INITIAL_AUTO_PRICING_PRODUCTS);
  }, []);

  const generateComparison = (items: AutoPricingProductItem[]) => {
    const comparisons: ComparisonItem[] = items.map((item) => {
      const merchantPrice = item.currentPrice;
      const competitorPrice = item.lowestCompetitorPrice || merchantPrice;
      const priceGapAmount = merchantPrice - competitorPrice;
      const priceGapPercent = competitorPrice > 0 ? Number(((priceGapAmount / competitorPrice) * 100).toFixed(1)) : 0;

      let status: 'higher' | 'lower' | 'optimal' = 'optimal';
      let recommendedPrice = merchantPrice;
      let recommendationReason = 'السعر الحالي مطابق ومنافس في السوق';

      if (priceGapAmount > 15) {
        status = 'higher';
        recommendedPrice = competitorPrice - 5;
        recommendationReason = `سعرك أعلى من المنافس بـ ${priceGapAmount} ج.م (خطر فقدان المبيعات). يفضل تخفيض السعر إلى ${recommendedPrice} ج.م.`;
      } else if (priceGapAmount < -20 && item.competitorInStock) {
        status = 'lower';
        recommendedPrice = competitorPrice - 2;
        recommendationReason = `سعرك أقل من المنافس. فرصة لرفع السعر قليلاً لزيادة هامش الربح وصافي الأرباح.`;
      } else {
        status = 'optimal';
        recommendedPrice = merchantPrice;
        recommendationReason = 'سعر مثالي يحقق صدارة اليد العليا (Buy Box) وهامش ربح آمن.';
      }

      return {
        id: item.productId,
        sku: item.sku,
        title: item.title,
        merchantPrice,
        costPrice: item.costPrice,
        competitorPrice,
        competitorName: item.lowestCompetitorName || 'منافس رئيسي في السوق',
        competitorPlatform: item.lowestCompetitorPlatform || 'أمازون/نون',
        priceGapAmount,
        priceGapPercent,
        status,
        recommendedPrice,
        recommendationReason
      };
    });

    setComparisonItems(comparisons);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingCsv(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          alert('ملف CSV فارغ أو لا يحتوي على صفوف بيانات صحيحة.');
          setIsProcessingCsv(false);
          return;
        }

        const newParsedItems: AutoPricingProductItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
          if (row.length >= 3) {
            const sku = row[0] || `SKU-UPLOAD-${i}`;
            const title = row[1] || `منتج مسجل مسبقاً رقم ${i}`;
            const merchantPrice = parseFloat(row[2]) || 2500;
            const costPrice = row[3] ? parseFloat(row[3]) : merchantPrice * 0.75;
            
            const baseComp = INITIAL_AUTO_PRICING_PRODUCTS[(i - 1) % INITIAL_AUTO_PRICING_PRODUCTS.length];
            
            newParsedItems.push({
              productId: `upload_prd_${i}_${Date.now()}`,
              sku,
              title,
              category: 'منتجات عامة مستوردة',
              imageUrl: baseComp.imageUrl,
              costPrice,
              currentPrice: merchantPrice,
              lowestCompetitorPrice: baseComp.lowestCompetitorPrice + (Math.floor(Math.random() * 60) - 30),
              lowestCompetitorName: baseComp.lowestCompetitorName,
              lowestCompetitorPlatform: baseComp.lowestCompetitorPlatform,
              competitorInStock: true,
              assignedRuleId: 'rule-buybox-sniper',
              autoPricingEnabled: true,
              customFloorPrice: costPrice * 1.1,
              customCeilingPrice: merchantPrice * 1.3,
              lastRepricedAt: new Date().toISOString(),
              lastRepriceStatus: 'optimal',
              todayRepriceCount: 0
            });
          }
        }

        if (newParsedItems.length > 0) {
          setProducts(newParsedItems);
          generateComparison(newParsedItems);
          if (onShowToast) onShowToast(`تم استيراد ومقارنة ${newParsedItems.length} منتج بنجاح من ملف CSV!`);
        }
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        alert('حدث خطأ أثناء قراءة ملف CSV. تأكد من صحة التنسيق.');
      } finally {
        setIsProcessingCsv(false);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const downloadCsvTemplate = () => {
    const csvContent = "sku,title,merchant_price,cost_price\nFURN-CHR-001,كرسي مكتب هيدروليك أسود,3450,2650\nANK-Q30-BLK,سماعة أنكر ساوند كور,2890,2200\nDSK-HYD-120,مكتب عمل هيدروليك 120سم,2650,1450\nPHL-AIR-41L,قلاية فيليبس هوائية 4.1 لتر,4690,3800";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price_comparison_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('تم تحميل نموذج ملف CSV بنجاح.');
  };

  const applyRecommended = (sku: string, recPrice: number) => {
    setProducts(products.map(p => p.sku === sku ? { ...p, currentPrice: recPrice, lastRepricedAt: new Date().toISOString() } : p));
    setComparisonItems(comparisonItems.map(c => c.sku === sku ? { ...c, merchantPrice: recPrice, priceGapAmount: recPrice - c.competitorPrice, status: 'optimal' } : c));
    if (onApplyPrice) onApplyPrice(sku, recPrice);
    if (onShowToast) onShowToast(`تم تطبيق السعر المقترح بنجاح للمنتج SKU: ${sku}`);
  };

  const filteredItems = comparisonItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.competitorName.toLowerCase().includes(q);
    }
    return true;
  });

  const higherCount = comparisonItems.filter(i => i.status === 'higher').length;
  const lowerCount = comparisonItems.filter(i => i.status === 'lower').length;
  const optimalCount = comparisonItems.filter(i => i.status === 'optimal').length;

  return (
    <section 
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-6" 
      dir="rtl"
      role="region"
      aria-label="محرك مقارنة الأسعار والفجوات السعرية"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400" aria-hidden="true">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white" id="price-comparison-title">محرك مقارنة الأسعار والفجوات (CSV Price Comparison)</h2>
            <p className="text-xs text-slate-400">استيراد منتجاتك عبر CSV ومقارنتها فوراً بأسعار المنافسين المستخرجة من محرك التسعير الآلي</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap" role="toolbar" aria-label="أدوات تصدير واستيراد بيانات المقارنة">
          <button
            onClick={downloadCsvTemplate}
            aria-label="تحميل نموذج ملف CSV فارغ"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-2 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <Download className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>تحميل نموذج CSV</span>
          </button>

          <label 
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 focus-within:ring-2 focus-within:ring-slate-950"
            aria-label="رفع ملف منتجات بصيغة CSV للمقارنة"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>{uploadedFileName ? 'تغيير ملف CSV' : 'رفع ملف منتجات CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" aria-hidden="true" />
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="مؤشرات إحصاءات الفجوات السعرية">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="إجمالي المنتجات المقارنة:">
          <div>
            <p className="text-xs text-slate-400 font-bold">إجمالي المنتجات المقارنة</p>
            <h3 className="text-2xl font-black text-white mt-1" aria-live="polite">{comparisonItems.length}</h3>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-400" aria-hidden="true">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات الأعلى من المنافس (خطر):">
          <div>
            <p className="text-xs text-red-300 font-bold">أعلى من المنافس (خطر)</p>
            <h3 className="text-2xl font-black text-red-400 mt-1" aria-live="polite">{higherCount}</h3>
          </div>
          <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400" aria-hidden="true">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات الأقل من المنافس (فرصة):">
          <div>
            <p className="text-xs text-sky-300 font-bold">أقل من المنافس (فرصة)</p>
            <h3 className="text-2xl font-black text-sky-400 mt-1" aria-live="polite">{lowerCount}</h3>
          </div>
          <div className="p-3 bg-sky-500/20 rounded-xl border border-sky-500/30 text-sky-400" aria-hidden="true">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 shadow-lg flex items-center justify-between" tabIndex={0} role="group" aria-label="المنتجات المطابقة والمنافسة (مثالي):">
          <div>
            <p className="text-xs text-emerald-300 font-bold">مطابق ومنافس (مثالي)</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1" aria-live="polite">{optimalCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400" aria-hidden="true">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800" role="region" aria-label="أدوات البحث والفلترة">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0" role="tablist" aria-label="فلتر حالة التنافسية">
          <button
            role="tab"
            aria-selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-amber-500 outline-none ${
              filterStatus === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            الكل ({comparisonItems.length})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'higher'}
            onClick={() => setFilterStatus('higher')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-red-500 outline-none ${
              filterStatus === 'higher' ? 'bg-red-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            أعلى من المنافس ({higherCount})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'lower'}
            onClick={() => setFilterStatus('lower')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-sky-500 outline-none ${
              filterStatus === 'lower' ? 'bg-sky-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            أقل من المنافس ({lowerCount})
          </button>
          <button
            role="tab"
            aria-selected={filterStatus === 'optimal'}
            onClick={() => setFilterStatus('optimal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 focus:ring-2 focus:ring-emerald-500 outline-none ${
              filterStatus === 'optimal' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            مثالي ({optimalCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72" role="search">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" aria-hidden="true" />
          <input
            type="text"
            aria-label="بحث برمز SKU أو اسم المنتج أو المنافس"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برمز SKU أو اسم المنتج أو المنافس..."
            className="w-full pl-4 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40" tabIndex={0} role="region" aria-label="جدول مقارنة الأسعار والفجوات للمنتجات">
        <table className="w-full text-right text-xs" role="table" aria-labelledby="price-comparison-title">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 font-mono" role="rowgroup">
            <tr role="row">
              <th className="p-3.5" scope="col">المنتج ورمز SKU</th>
              <th className="p-3.5" scope="col">سعرك الحالي</th>
              <th className="p-3.5" scope="col">أرخص سعر للمنافس</th>
              <th className="p-3.5" scope="col">الفجوة السعرية</th>
              <th className="p-3.5" scope="col">حالة التنافسية</th>
              <th className="p-3.5" scope="col">الإجراء والتوصية</th>
              <th className="p-3.5 text-center" scope="col">إجراءات سريعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60" role="rowgroup">
            {filteredItems.length === 0 ? (
              <tr role="row">
                <td colSpan={7} className="text-center py-12 text-slate-500" role="cell">
                  لا توجد منتجات مطابقة لنتائج البحث أو الفلتر الحالي.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const statusBadge = 
                  item.status === 'higher' ? (
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> أعلى من السوق
                    </span>
                  ) : item.status === 'lower' ? (
                    <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" /> أقل من السوق
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-[11px] flex items-center gap-1 w-fit" role="status">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> تنافسي مثالي
                    </span>
                  );

                return (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition" role="row">
                    <td className="p-3.5" role="cell">
                      <p className="font-bold text-white line-clamp-1">{item.title}</p>
                      <span className="text-[10px] text-amber-400 font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white" role="cell">
                      {item.merchantPrice.toLocaleString()} {currency}
                    </td>
                    <td className="p-3.5 font-mono" role="cell">
                      <div className="font-bold text-emerald-400">{item.competitorPrice.toLocaleString()} {currency}</div>
                      <div className="text-[10px] text-slate-400">{item.competitorName}</div>
                    </td>
                    <td className="p-3.5 font-mono" role="cell">
                      <span className={`font-bold ${item.priceGapAmount > 0 ? 'text-red-400' : item.priceGapAmount < 0 ? 'text-sky-400' : 'text-slate-300'}`}>
                        {item.priceGapAmount > 0 ? `+${item.priceGapAmount}` : item.priceGapAmount} {currency} ({item.priceGapPercent}%)
                      </span>
                    </td>
                    <td className="p-3.5" role="cell">
                      {statusBadge}
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs leading-relaxed text-[11px]" role="cell">
                      {item.recommendationReason}
                    </td>
                    <td className="p-3.5 text-center" role="cell">
                      <button
                        onClick={() => applyRecommended(item.sku, item.recommendedPrice)}
                        aria-label={`تطبيق السعر المقترح ${item.recommendedPrice} ${currency} للمنتج ${item.sku}`}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[11px] shadow transition flex items-center gap-1 mx-auto active:scale-95 focus:ring-2 focus:ring-slate-950 outline-none"
                      >
                        <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>تطبيق السعر ({item.recommendedPrice})</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
