import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles, 
  HelpCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Printer, 
  Download, 
  Search,
  Filter,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  Store,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { ProductData } from '../types';
import { ExportReportsButton } from './ExportReportsButton';
import { exportProfitCalculatorProductsToSpreadsheet } from '../utils/competitorPriceExport';
import { MonthlyProfitTrendsChart } from './MonthlyProfitTrendsChart';

export interface ProductProfitItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl?: string;
  platform: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'direct_store';
  sellingPrice: number;
  wholesaleCost: number;
  commissionPercent: number;
  shippingFee: number;
  packagingFee: number;
}

const DEFAULT_SAMPLE_PRODUCTS: ProductProfitItem[] = [];

interface ProfitCalculatorProps {
  initialProducts?: ProductData[];
  currency?: string;
  onShowToast?: (message: string) => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  initialProducts,
  currency = 'ج.م',
  onShowToast,
}) => {
  // Calculator Form State
  const [sellingPrice, setSellingPrice] = useState<number>(3200);
  const [wholesaleCost, setWholesaleCost] = useState<number>(2100);
  const [platform, setPlatform] = useState<'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'direct_store' | 'custom'>('amazon_eg');
  const [commissionPercent, setCommissionPercent] = useState<number>(12);
  const [shippingFee, setShippingFee] = useState<number>(35);
  const [packagingFee, setPackagingFee] = useState<number>(15);
  const [returnBufferPercent, setReturnBufferPercent] = useState<number>(2);

  // Merchant Table State
  const [merchantProducts, setMerchantProducts] = useState<ProductProfitItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: p.id || `PRD-${idx + 1}`,
        title: p.title,
        brand: p.brand || 'عام',
        category: p.category || 'عام',
        imageUrl: p.imageUrl,
        platform: (p.merchantOffers?.[0]?.platform as any) || 'amazon_eg',
        sellingPrice: p.suggestedRetailPrice || p.currentLowestPrice || 2500,
        wholesaleCost: p.estimatedWholesaleCost || 1800,
        commissionPercent: 12,
        shippingFee: 35,
        packagingFee: 15,
      }));
    }
    return DEFAULT_SAMPLE_PRODUCTS;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);

  // Platform Profiles Presets
  const platformPresets = {
    amazon_eg: { name: 'أمازون مصر (FBA)', commission: 12.0, shipping: 35, packaging: 15 },
    noon_eg: { name: 'نون مصر (Express)', commission: 13.5, shipping: 40, packaging: 15 },
    jumia_eg: { name: 'جوميا مصر (Express)', commission: 10.0, shipping: 30, packaging: 10 },
    direct_store: { name: 'متجر خاص / سوشيال ميديا', commission: 3.0, shipping: 55, packaging: 20 },
    custom: { name: 'تخصيص يدوي حر', commission: commissionPercent, shipping: shippingFee, packaging: packagingFee },
  };

  const handlePlatformChange = (p: 'amazon_eg' | 'noon_eg' | 'jumia_eg' | 'direct_store' | 'custom') => {
    setPlatform(p);
    if (p !== 'custom') {
      const preset = platformPresets[p];
      setCommissionPercent(preset.commission);
      setShippingFee(preset.shipping);
      setPackagingFee(preset.packaging);
    }
  };

  // Standalone Single-Product Calculations
  const calculations = useMemo(() => {
    const commAmount = Math.round((sellingPrice * commissionPercent) / 100);
    const returnRisk = Math.round((sellingPrice * returnBufferPercent) / 100);
    const totalDeductions = commAmount + shippingFee + packagingFee + returnRisk;
    const netProfit = sellingPrice - wholesaleCost - totalDeductions;
    const marginPercent = sellingPrice > 0 ? Math.round((netProfit / sellingPrice) * 1000) / 10 : 0;
    const roiPercent = wholesaleCost > 0 ? Math.round((netProfit / wholesaleCost) * 1000) / 10 : 0;

    // Break Even Price
    const varDec = (commissionPercent + returnBufferPercent) / 100;
    const fixedCosts = wholesaleCost + shippingFee + packagingFee;
    const breakEven = varDec < 1 ? Math.ceil(fixedCosts / (1 - varDec)) : fixedCosts;

    return {
      commAmount,
      returnRisk,
      totalDeductions,
      netProfit,
      marginPercent,
      roiPercent,
      breakEven,
    };
  }, [sellingPrice, wholesaleCost, commissionPercent, shippingFee, packagingFee, returnBufferPercent]);

  // Merchant Table Product Profit Calculation Helper
  const calculateItemProfit = (item: ProductProfitItem) => {
    const comm = Math.round((item.sellingPrice * item.commissionPercent) / 100);
    const deductions = comm + item.shippingFee + item.packagingFee;
    const netProfit = item.sellingPrice - item.wholesaleCost - deductions;
    const marginPercent = item.sellingPrice > 0 ? Math.round((netProfit / item.sellingPrice) * 1000) / 10 : 0;
    const roiPercent = item.wholesaleCost > 0 ? Math.round((netProfit / item.wholesaleCost) * 1000) / 10 : 0;
    return { comm, deductions, netProfit, marginPercent, roiPercent };
  };

  // Filtered Table Products
  const filteredProducts = useMemo(() => {
    return merchantProducts.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [merchantProducts, searchTerm, platformFilter]);

  // Total Portfolio Metrics
  const portfolioSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalDeductions = 0;
    let totalNetProfit = 0;

    merchantProducts.forEach((p) => {
      const { deductions, netProfit } = calculateItemProfit(p);
      totalRevenue += p.sellingPrice;
      totalCost += p.wholesaleCost;
      totalDeductions += deductions;
      totalNetProfit += netProfit;
    });

    const avgMargin = totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 1000) / 10 : 0;

    return { totalRevenue, totalCost, totalDeductions, totalNetProfit, avgMargin };
  }, [merchantProducts]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportReports = (format: 'xlsx' | 'csv') => {
    setIsExporting(true);
    try {
      const result = exportProfitCalculatorProductsToSpreadsheet(filteredProducts, format, currency);
      if (onShowToast) {
        onShowToast(`📊 تم تصدير تقرير أسعار المنتجات بنجاح (${result.rowCount} منتج) بصيغة ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Start Inline Editing for Table Product
  const handleStartEdit = (p: ProductProfitItem) => {
    setEditingId(p.id);
    setEditPrice(p.sellingPrice);
    setEditCost(p.wholesaleCost);
  };

  const handleSaveEdit = (id: string) => {
    setMerchantProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, sellingPrice: editPrice, wholesaleCost: editCost } : item
      )
    );
    setEditingId(null);
    if (onShowToast) onShowToast('تم تحديث أرقام المنتج وحساب الأرباح بنجاح');
  };

  const handleAddCalculatedProductToTable = () => {
    const newItem: ProductProfitItem = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      title: `منتج مخصص جديدة (${platformPresets[platform].name})`,
      brand: 'العلامة الفردية',
      category: 'عام',
      platform: platform === 'custom' ? 'amazon_eg' : platform,
      sellingPrice,
      wholesaleCost,
      commissionPercent,
      shippingFee,
      packagingFee,
    };
    setMerchantProducts([newItem, ...merchantProducts]);
    if (onShowToast) onShowToast('تمت إضافة حسابات المنتج إلى جدول بيانات التاجر');
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-8 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">حاسبة صافي الربح والرسوم التشغيلية (ProfitCalculator)</h2>
              <p className="text-xs text-slate-400">
                حساب دقيق لصافي الربح، رسوم العمولة والشحن، وهامش الربح الفعلي لكل منتج في جدول التاجر
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>طباعة تقرير الأرباح</span>
        </button>
      </div>

      {/* Main Grid: Calculator Inputs vs Real-time Metrics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Main Column: Calculator Inputs */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 backdrop-blur-xl">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
            <SlidersHorizontal className="w-4 h-4" />
            <span>مدخلات حساب أرباح المنتج التقديرية</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>سعر البيع المقترح للزبون</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full h-11 pr-4 pl-12 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-base focus:border-amber-500 outline-none transition font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">{currency}</span>
              </div>
            </div>

            {/* Wholesale Cost */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-sky-400" />
                <span>تكلفة الشراء (سعر الجملة)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={wholesaleCost}
                  onChange={(e) => setWholesaleCost(Math.max(0, Number(e.target.value)))}
                  className="w-full h-11 pr-4 pl-12 rounded-xl bg-slate-950 border border-slate-800 text-white font-black text-base focus:border-amber-500 outline-none transition font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">{currency}</span>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>منصة البيع المستهدفة (العمولة ورسوم الشحن)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'amazon_eg', label: 'أمازون مصر', badge: '12% + 35 ج' },
                  { key: 'noon_eg', label: 'نون مصر', badge: '13.5% + 40 ج' },
                  { key: 'jumia_eg', label: 'جوميا مصر', badge: '10% + 30 ج' },
                  { key: 'direct_store', label: 'متجر خاص', badge: '3% + 55 ج' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePlatformChange(item.key as any)}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                      platform === item.key
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block">{item.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Fees Inputs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">نسبة عمولة المنصة (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={commissionPercent}
                  onChange={(e) => {
                    setPlatform('custom');
                    setCommissionPercent(Math.max(0, Number(e.target.value)));
                  }}
                  className="w-full h-10 pr-3 pl-8 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm outline-none font-mono"
                />
                <Percent className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">تكلفة الشحن والتوصيل ({currency})</label>
              <input
                type="number"
                min={0}
                value={shippingFee}
                onChange={(e) => {
                  setPlatform('custom');
                  setShippingFee(Math.max(0, Number(e.target.value)));
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm outline-none font-mono"
              />
            </div>

          </div>

          <button
            type="button"
            onClick={handleAddCalculatedProductToTable}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>حفظ الحسبة وإضافتها إلى جدول بيانات التاجر</span>
          </button>
        </div>

        {/* Right Column: Computed Net Profit Master Cards */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>النتائج المالية للقطعة الواحدة</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                {platformPresets[platform].name}
              </span>
            </div>

            {/* Net Profit Big Banner */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400">صافي الربح المتبقي للتاجر</span>
              <div className={`text-3xl sm:text-4xl font-black font-mono ${calculations.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calculations.netProfit >= 0 ? `+${calculations.netProfit.toLocaleString()}` : calculations.netProfit.toLocaleString()} <span className="text-sm font-bold">{currency}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-3 pt-1">
                <span>هامش الربح: <strong className="text-amber-400 font-mono">{calculations.marginPercent}%</strong></span>
                <span>•</span>
                <span>العائد ROI: <strong className="text-sky-400 font-mono">{calculations.roiPercent}%</strong></span>
              </div>
            </div>

            {/* Fee Deductions Breakdown */}
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                <span>رسوم عمولة المنصة ({commissionPercent}%):</span>
                <span className="font-mono text-amber-400">-{calculations.commAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                <span>تكلفة الشحن والتغليف:</span>
                <span className="font-mono text-sky-400">-{(shippingFee + packagingFee).toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                <span>مخصص مخاطر المرتجعات ({returnBufferPercent}%):</span>
                <span className="font-mono text-purple-400">-{calculations.returnRisk.toLocaleString()} {currency}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-black">
                <span>نقطة التعادل الأدنى لتفادي الخسارة:</span>
                <span className="font-mono text-emerald-400 text-sm">{calculations.breakEven.toLocaleString()} {currency}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            تأخذ هذه الحاسبة في الحسبان خصومات عمولات العرض، بوالص الشحن، والتغليف وفقاً للتعريفة الرسمية للمنصات في مصر.
          </p>
        </div>

      </div>

      {/* Monthly Profit Trends Chart (Recharts Integration) */}
      <MonthlyProfitTrendsChart
        currency={currency}
        catalogNetProfitTotal={portfolioSummary.totalNetProfit}
      />

      {/* Merchant Data Table Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" />
              <span>جدول بيانات أرباح منتجات التاجر</span>
            </h3>
            <p className="text-xs text-slate-400">
              إجمالي المنتجات: {filteredProducts.length} منتج • أرباح الكتالوج الكلية: <strong className="text-emerald-400 font-mono">+{portfolioSummary.totalNetProfit.toLocaleString()} {currency}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-1.5 pr-8 pl-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500 transition w-40 sm:w-48"
              />
            </div>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-amber-500 transition"
            >
              <option value="all">جميع المنصات</option>
              <option value="amazon_eg">أمازون مصر</option>
              <option value="noon_eg">نون مصر</option>
              <option value="jumia_eg">جوميا مصر</option>
              <option value="direct_store">متجر خاص</option>
            </select>

            {/* Export Reports Button (Excel / CSV via xlsx) */}
            <ExportReportsButton
              onExport={handleExportReports}
              isLoading={isExporting}
              count={filteredProducts.length}
              variant="amber"
              buttonLabel="تصدير التقارير"
              tooltip="تصدير قائمة أسعار وأرباح المنتجات الحالية بصيغة Excel أو CSV"
            />
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3.5">المنتج والماركة</th>
                <th className="p-3.5">المنصة</th>
                <th className="p-3.5">سعر البيع</th>
                <th className="p-3.5">تكلفة الشراء</th>
                <th className="p-3.5">عمولة المنصة</th>
                <th className="p-3.5">رسوم الشحن والتغليف</th>
                <th className="p-3.5">صافي الربح</th>
                <th className="p-3.5">هامش الربح %</th>
                <th className="p-3.5 text-center">تعديل سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProducts.map((p) => {
                const { comm, deductions, netProfit, marginPercent } = calculateItemProfit(p);
                const isEditing = editingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Product Name & Brand */}
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-white text-xs truncate" title={p.title}>{p.title}</div>
                      <div className="text-[10px] text-amber-400/80 font-semibold">{p.brand} • {p.category}</div>
                    </td>

                    {/* Platform Badge */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.platform === 'amazon_eg' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        p.platform === 'noon_eg' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        p.platform === 'jumia_eg' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {p.platform === 'amazon_eg' ? 'أمازون مصر' :
                         p.platform === 'noon_eg' ? 'نون مصر' :
                         p.platform === 'jumia_eg' ? 'جوميا مصر' : 'متجر خاص'}
                      </span>
                    </td>

                    {/* Selling Price */}
                    <td className="p-3.5 font-mono font-black text-amber-300 text-sm">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 p-1 rounded bg-slate-950 border border-amber-500 text-white font-mono text-xs"
                        />
                      ) : (
                        `${p.sellingPrice.toLocaleString()} ${currency}`
                      )}
                    </td>

                    {/* Wholesale Cost */}
                    <td className="p-3.5 font-mono text-slate-300">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCost}
                          onChange={(e) => setEditCost(Number(e.target.value))}
                          className="w-20 p-1 rounded bg-slate-950 border border-amber-500 text-white font-mono text-xs"
                        />
                      ) : (
                        `${p.wholesaleCost.toLocaleString()} ${currency}`
                      )}
                    </td>

                    {/* Platform Commission */}
                    <td className="p-3.5 font-mono text-slate-400">
                      {comm.toLocaleString()} {currency} ({p.commissionPercent}%)
                    </td>

                    {/* Shipping Fee */}
                    <td className="p-3.5 font-mono text-slate-400">
                      {(p.shippingFee + p.packagingFee).toLocaleString()} {currency}
                    </td>

                    {/* Net Profit */}
                    <td className="p-3.5 font-mono font-black text-sm">
                      <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {netProfit >= 0 ? `+${netProfit.toLocaleString()}` : netProfit.toLocaleString()} {currency}
                      </span>
                    </td>

                    {/* Profit Margin % Badge */}
                    <td className="p-3.5 font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        marginPercent >= 20 ? 'bg-emerald-500/20 text-emerald-300' :
                        marginPercent >= 10 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {marginPercent}%
                      </span>
                    </td>

                    {/* Inline Edit Action */}
                    <td className="p-3.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(p.id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="حفظ"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                            title="إلغاء"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="تعديل السعر أو التكلفة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
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
  );
};

export default ProfitCalculator;
