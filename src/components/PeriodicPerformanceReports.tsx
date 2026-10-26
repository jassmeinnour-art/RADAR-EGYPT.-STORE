import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Award,
  DollarSign,
  ShoppingCart,
  Percent,
  Download,
  Printer,
  Share2,
  Copy,
  Clock,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Send,
  Mail,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Eye,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Store,
  Zap,
  HelpCircle,
  X,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieIcon,
  Bell
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import confetti from 'canvas-confetti';
import { 
  ProductData, 
  WatchlistItem, 
  PeriodicPerformanceReport, 
  PeriodicReportPeriodType,
  WatchlistCompetitorPriceShift
} from '../types';
import { generatePeriodicReport } from '../data/periodicReportsData';
import { safeOpenUrl } from '../utils/safeWindowOpen';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PeriodicPerformanceReportsProps {
  allProducts: ProductData[];
  watchlist: WatchlistItem[];
  currency?: string;
  onSelectProductForRadar?: (productId: string) => void;
  onNavigateToWatchlist?: () => void;
  onShowToast?: (msg: string) => void;
}

export const PeriodicPerformanceReports: React.FC<PeriodicPerformanceReportsProps> = ({
  allProducts,
  watchlist,
  currency = 'EGP',
  onSelectProductForRadar,
  onNavigateToWatchlist,
  onShowToast
}) => {
  // Period Mode State
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodicReportPeriodType>('weekly');
  const [isGeneratingNewReport, setIsGeneratingNewReport] = useState<boolean>(false);

  // Active Report Data State
  const [report, setReport] = useState<PeriodicPerformanceReport>(() =>
    generatePeriodicReport('weekly', allProducts, watchlist)
  );

  // Active Chart View Modes
  const [salesChartView, setSalesChartView] = useState<'sales_volume' | 'net_profit' | 'orders_count'>('sales_volume');
  const [selectedWatchlistProductForChart, setSelectedWatchlistProductForChart] = useState<string>(
    report.watchlistPriceShifts[0]?.productId || 'p1'
  );

  // Scheduling and Automated Settings Modal / Panel State
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState<boolean>(false);
  const [autoScheduleActive, setAutoScheduleActive] = useState<boolean>(report.scheduleConfig.isAutoScheduleActive);
  const [scheduleFrequency, setScheduleFrequency] = useState<'weekly' | 'monthly'>(report.scheduleConfig.frequency);
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailList, setEmailList] = useState<string[]>(report.scheduleConfig.recipientEmails);
  const [whatsappPhone, setWhatsappPhone] = useState<string>(report.scheduleConfig.recipientPhone);

  // PDF Preview & Export Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Printable ref
  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Re-generate report when period changes
  const handlePeriodChange = (newPeriod: PeriodicReportPeriodType) => {
    setSelectedPeriod(newPeriod);
    setIsGeneratingNewReport(true);

    setTimeout(() => {
      const updatedReport = generatePeriodicReport(newPeriod, allProducts, watchlist);
      setReport(updatedReport);
      if (updatedReport.watchlistPriceShifts && updatedReport.watchlistPriceShifts.length > 0) {
        setSelectedWatchlistProductForChart(updatedReport.watchlistPriceShifts[0].productId);
      }
      setIsGeneratingNewReport(false);

      if (onShowToast) {
        onShowToast(`تم توليد ${newPeriod === 'weekly' ? 'التقرير الأسبوعي' : 'التقرير الشهري'} وتحديث كافة الرسوم البيانية 📊`);
      }
    }, 600);
  };

  // Instant AI Regeneration
  const handleInstantRegenerate = () => {
    setIsGeneratingNewReport(true);
    setTimeout(() => {
      const updatedReport = generatePeriodicReport(selectedPeriod, allProducts, watchlist);
      setReport(updatedReport);
      setIsGeneratingNewReport(false);

      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onShowToast) {
        onShowToast('تم تحديث وتحليل بيانات المبيعات وأسعار المنافسين بنجاح ⚡');
      }
    }, 750);
  };

  // Add Email recipient
  const handleAddEmail = () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      if (onShowToast) onShowToast('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (emailList.includes(emailInput.trim())) {
      if (onShowToast) onShowToast('هذا البريد مضاف مسبقاً');
      return;
    }
    setEmailList([...emailList, emailInput.trim()]);
    setEmailInput('');
    if (onShowToast) onShowToast('تمت إضافة البريد الإلكتروني لجدول الإرسال التلقائي');
  };

  // Remove Email
  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter(e => e !== email));
  };

  // Save Schedule Config
  const handleSaveScheduleConfig = () => {
    setReport(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        isAutoScheduleActive: autoScheduleActive,
        frequency: scheduleFrequency,
        recipientEmails: emailList,
        recipientPhone: whatsappPhone,
        nextDispatchDate: scheduleFrequency === 'weekly' ? 'الأحد القادم، 30 أغسطس 2026' : '1 سبتمبر 2026'
      }
    }));
    setIsScheduleDrawerOpen(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });

    if (onShowToast) {
      onShowToast('تم حفظ إعدادات الجدولة الدورية للتقارير بنجاح 📅');
    }
  };

  // Active selected watchlist item for chart
  const activeChartWatchlistItem: WatchlistCompetitorPriceShift | undefined = useMemo(() => {
    return report.watchlistPriceShifts.find(w => w.productId === selectedWatchlistProductForChart) || report.watchlistPriceShifts[0];
  }, [report.watchlistPriceShifts, selectedWatchlistProductForChart]);

  // Color palette for charts
  const PLATFORM_COLORS = {
    amazon: '#FF9900',
    noon: '#FEBE10',
    jumia: '#F68B1E',
    direct: '#10B981'
  };

  // Copy Executive Report Summary
  const handleCopySummary = () => {
    const summary = `📊 ${report.title} - ${report.periodLabel}
--------------------------------------------------
💰 إجمالي المبيعات (GMV): ${report.totalSalesVolumeEGP.toLocaleString()} ${currency} (نمو +${report.totalSalesVolumeGrowth}%)
📈 صافي الأرباح: ${report.totalNetProfitEGP.toLocaleString()} ${currency} (هامش ${report.overallProfitMarginPercent}%)
📦 عدد الطلبات: ${report.totalOrdersCount} طلب (متوسط سلة: ${report.averageOrderValueEGP.toLocaleString()} ${currency})
🏆 معدل الفوز بالـ Buy Box: ${report.overallBuyBoxWinRatePercent}% (+${report.buyBoxWinRateGrowthPercent}%)

تفصيل المنصات:
${report.platformBreakdown.map(p => `• ${p.platformName}: ${p.salesVolumeEGP.toLocaleString()} ${currency} (باي بوكس: ${p.buyBoxWinRatePercent}%)`).join('\n')}

💡 التوصية الاستراتيجية الرئيسية:
${report.aiExecutiveSummary}

تاريخ الإصدار: ${report.generatedAt}
منظومة رادار التاجر الذكي مصر 🇪🇬`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    if (onShowToast) onShowToast('تم نسخ ملخص التقرير لمشاركته مع الإدارة وفريق العمل 📋');
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*تقرير الأداء والمبيعات الدوري (${report.periodLabel})* 📊\n\n• إجمالي المبيعات: *${report.totalSalesVolumeEGP.toLocaleString()} ${currency}* (+${report.totalSalesVolumeGrowth}%)\n• صافي الربح: *${report.totalNetProfitEGP.toLocaleString()} ${currency}* (${report.overallProfitMarginPercent}%)\n• نسبة الفوز بالـ Buy Box: *${report.overallBuyBoxWinRatePercent}%*\n• عدد الطلبات: *${report.totalOrdersCount} طلب*\n\n_تفاصيل المنصات:_\n- أمازون: ${report.platformBreakdown[0]?.salesVolumeEGP.toLocaleString()} ج.م (${report.platformBreakdown[0]?.buyBoxWinRatePercent}% Buy Box)\n- نون: ${report.platformBreakdown[1]?.salesVolumeEGP.toLocaleString()} ج.م (${report.platformBreakdown[1]?.buyBoxWinRatePercent}% Buy Box)\n- جوميا: ${report.platformBreakdown[2]?.salesVolumeEGP.toLocaleString()} ج.م\n\n_تم الاستخراج والاعتماد عبر رادار التاجر الذكي_ ✅`);
    safeOpenUrl(`https://wa.me/?text=${text}`);
  };

  // Export formatted PDF using jsPDF and html2canvas
  const handleExportJsPdf = async () => {
    if (!reportPrintRef.current) {
      if (onShowToast) onShowToast('عذراً، عنصر التقرير غير جاهز للتصدير');
      return;
    }

    if (onShowToast) onShowToast('جاري توليد ملف الـ PDF الاحترافي بتنسيق A4... 📄');

    try {
      const canvas = await html2canvas(reportPrintRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      let pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`periodic_performance_report_${report.periodType}_${Date.now()}.pdf`);

      if (onShowToast) {
        onShowToast('تم تصدير وحفظ التقرير بصيغة PDF الاحترافية بنجاح! 📥');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      if (onShowToast) onShowToast('حدث خطأ أثناء تصدير ملف الـ PDF');
    }
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Download CSV export
  const handleDownloadCsv = () => {
    const headers = ['Platform', 'Sales_EGP', 'Share_Percent', 'Orders_Count', 'BuyBox_WinRate_Percent', 'NetProfit_EGP', 'Top_Competitor'];
    const rows = report.platformBreakdown.map(p => [
      `"${p.platformName}"`,
      p.salesVolumeEGP,
      p.salesSharePercent,
      p.ordersCount,
      p.buyBoxWinRatePercent,
      p.netProfitEGP,
      `"${p.topCompetitorName}"`
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `performance_report_${report.periodType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('تم تنزيل بيانات التقرير بصيغة CSV بنجاح 📥');
  };

  return (
    <div className="space-y-6" id="periodic-performance-reports-container">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO HEADER & PERIOD TIMEFRAME CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>تقارير الأداء الدورية الذكية ورسوم الـ Buy Box</span>
              </span>

              {report.scheduleConfig.isAutoScheduleActive && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-bold border border-indigo-400/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-300" />
                  <span>مجدول تلقائياً: {report.scheduleConfig.frequency === 'weekly' ? 'أسبوعياً' : 'شهرياً'}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Alexandria'] leading-snug">
              {report.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تحليل تلقائي متكامل لحركة المبيعات الإجمالية، تتبع تغيرات أسعار المنافسين في قائمة المتابعة، ومعدلات الفوز بصندوق الشراء الذهبي (Buy Box) عبر المنصات الرئيسية (أمازون، نون، جوميا).
            </p>
          </div>

          {/* Timeframe Selector & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Period Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80">
              <button
                onClick={() => handlePeriodChange('weekly')}
                id="period-weekly-btn"
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedPeriod === 'weekly'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>أسبوعي (Weekly)</span>
              </button>

              <button
                onClick={() => handlePeriodChange('monthly')}
                id="period-monthly-btn"
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>شهري (Monthly)</span>
              </button>
            </div>

            {/* Schedule Settings Button */}
            <button
              onClick={() => setIsScheduleDrawerOpen(true)}
              id="schedule-settings-btn"
              className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="إعدادات الجدولة والإرسال التلقائي للبريد والواتساب"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>الجدولة التلقائية 📅</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              id="export-pdf-report-btn"
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-100" />
              <span>تصدير PDF 📑</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KPI METRIC CARDS (مؤشرات الأداء الرئيسية التنفيذية) */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
          
          {/* Card 1: Total Sales Volume */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">إجمالي المبيعات (GMV)</span>
              <DollarSign className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {report.totalSalesVolumeEGP.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{currency}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{report.totalSalesVolumeGrowth}% مقارنة بالفترة السابقة</span>
            </div>
          </div>

          {/* Card 2: Net Profit & Margin */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">صافي الأرباح المحققة</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono mt-1">
              {report.totalNetProfitEGP.toLocaleString()} <span className="text-xs text-slate-300 font-normal">{currency}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-teal-300">
              <Percent className="w-3 h-3" />
              <span>هامش ربح صافي {report.overallProfitMarginPercent}%</span>
            </div>
          </div>

          {/* Card 3: Total Orders & AOV */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">إجمالي الطلبات المنفذة</span>
              <ShoppingCart className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {report.totalOrdersCount} <span className="text-xs text-slate-400 font-normal">طلب</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-indigo-300">
              <span>متوسط السلة: {report.averageOrderValueEGP.toLocaleString()} {currency}</span>
            </div>
          </div>

          {/* Card 4: Overall Buy Box Win Rate */}
          <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/70 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">نسبة الفوز بـ Buy Box</span>
              <Award className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono mt-1">
              {report.overallBuyBoxWinRatePercent}%
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{report.buyBoxWinRateGrowthPercent}% تفوق على المنافسين</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADVANCED RECHARTS GRAPHICAL SECTION (الرسوم البيانية التفاعلية المتقدمة) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Sales Trends & Net Profit by Platform (Area & Bar Chart - 2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>حركة المبيعات والأرباح عبر المنصات ({report.periodLabel})</span>
              </h3>
              <p className="text-xs text-slate-500">
                توزيع الإيرادات والأرباح اليومية عبر منصات أمازون، نون، جوميا، والمتجر المباشر
              </p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setSalesChartView('sales_volume')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  salesChartView === 'sales_volume' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                المبيعات (GMV)
              </button>
              <button
                onClick={() => setSalesChartView('net_profit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  salesChartView === 'net_profit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                صافي الربح
              </button>
              <button
                onClick={() => setSalesChartView('orders_count')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  salesChartView === 'orders_count' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الطلبات
              </button>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-72 w-full min-w-0 pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250} debounce={50}>
              {salesChartView === 'sales_volume' ? (
                <AreaChart data={report.salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmazon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9900" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF9900" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorNoon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FEBE10" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FEBE10" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorJumia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F68B1E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F68B1E" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined, name: string | number | undefined) => [
                      `${Number(value || 0).toLocaleString()} ${currency}`, 
                      name === 'amazonSales' ? 'أمازون مصر' : name === 'noonSales' ? 'نون مصر' : name === 'jumiaSales' ? 'جوميا مصر' : 'المتجر المباشر'
                    ]}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => val === 'amazonSales' ? 'أمازون مصر' : val === 'noonSales' ? 'نون مصر' : val === 'jumiaSales' ? 'جوميا مصر' : 'المتجر المباشر'}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Area type="monotone" dataKey="amazonSales" stroke="#FF9900" fillOpacity={1} fill="url(#colorAmazon)" name="amazonSales" />
                  <Area type="monotone" dataKey="noonSales" stroke="#FEBE10" fillOpacity={1} fill="url(#colorNoon)" name="noonSales" />
                  <Area type="monotone" dataKey="jumiaSales" stroke="#F68B1E" fillOpacity={1} fill="url(#colorJumia)" name="jumiaSales" />
                </AreaChart>
              ) : salesChartView === 'net_profit' ? (
                <BarChart data={report.salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined) => [`${Number(value || 0).toLocaleString()} ${currency}`, 'صافي الربح']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="netProfit" fill="#10B981" radius={[8, 8, 0, 0]} name="صافي الربح" />
                </BarChart>
              ) : (
                <LineChart data={report.salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined) => [`${value} طلب`, 'عدد الطلبات']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1' }} name="عدد الطلبات" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>أعلى يوم مبيعات: يوم الجمعة (62,500 ج.م - 34 طلب)</span>
            </span>
            <span className="font-mono">تحديث فوري لبيانات الدفعات ⚡</span>
          </div>
        </div>

        {/* Chart 2: Buy Box Win Rate per Platform (Radial / Bar Breakdown - 1 Col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-500" />
              <span>نسبة الفوز بـ Buy Box لكل منصة</span>
            </h3>
            <p className="text-xs text-slate-500">
              معدل الاستحواذ على الصندوق الذهبي مقارنة بأقوى المتاجر
            </p>
          </div>

          {/* Progress Bars Breakdown for Platforms */}
          <div className="space-y-4 my-auto">
            {report.platformBreakdown.map((platform) => (
              <div key={platform.platformId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.platformColor }} 
                    />
                    <span className="text-slate-800">{platform.platformName}</span>
                  </div>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {platform.buyBoxWinRatePercent}%
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.buyBoxWinRatePercent}%`,
                      backgroundColor: platform.platformColor
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>المنافس الرئيسي: {platform.topCompetitorName}</span>
                  <span className="font-bold text-emerald-600">مؤشر التنافسية {platform.priceCompetitivenessScore}/100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200/80 flex items-start gap-2.5 text-xs text-sky-900">
            <Award className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>أمازون مصر</strong> تحقق أعلى نسبة Buy Box بنسبة <strong className="text-sky-700">88.5%</strong> بفضل مطابقة الأسعار التلقائية وسرعة تلبية الطلبات.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. WATCHLIST COMPETITOR PRICE VOLATILITY (تغيرات أسعار المنافسين في قائمة المتابعة) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6" id="watchlist-price-shifts-section">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                تغيرات أسعار المنافسين لمنتجات قائمة المتابعة (Watchlist Price Volatility)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              تتبع زمني دقيق لتحركات أسعار كبار المنافسين وتأثيرها على صدارتك للـ Buy Box
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToWatchlist && (
              <button
                onClick={onNavigateToWatchlist}
                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>إدارة قائمة المتابعة ({report.watchlistPriceShifts?.length || 0})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Watchlist Products Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(report.watchlistPriceShifts || []).map((item) => (
            <div
              key={item.productId}
              onClick={() => setSelectedWatchlistProductForChart(item.productId)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                selectedWatchlistProductForChart === item.productId
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-600/15'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Top info */}
              <div className="flex items-start gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.productTitle}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-500">{item.brand}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      item.buyBoxStatus === 'winning'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {item.buyBoxStatus === 'winning' ? 'متصدر Buy Box 🏆' : 'مهدد بالسعر ⚠️'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 truncate" title={item.productTitle}>
                    {item.productTitle}
                  </h4>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">سعرك المعتمد:</span>
                      <span className="font-black text-indigo-700 font-mono">{item.currentMerchantPrice.toLocaleString()} {currency}</span>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">أقل منافس ({item.lowestCompetitorPlatform}):</span>
                      <span className="font-black text-slate-800 font-mono">{item.lowestCompetitorPrice.toLocaleString()} {currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Shift Indicator */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">حركة سعر المنافس:</span>
                <span className={`font-bold flex items-center gap-1 font-mono text-[11px] ${
                  item.priceShiftAmountEGP < 0 
                    ? 'text-red-600' 
                    : item.priceShiftAmountEGP > 0 
                    ? 'text-emerald-600' 
                    : 'text-slate-600'
                }`}>
                  {item.priceShiftAmountEGP < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  <span>{item.priceShiftAmountEGP > 0 ? `+${item.priceShiftAmountEGP}` : item.priceShiftAmountEGP} {currency} ({item.priceShiftPercent}%)</span>
                </span>
              </div>

              {/* Tactical Recommendation Badge */}
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 leading-snug">
                {item.recommendedTacticalMove}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Watchlist Item Competitor Historical Trend LineChart */}
        {activeChartWatchlistItem && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>تتبع مسار الأسعار التاريخي للمنتج المحدد: {activeChartWatchlistItem.productTitle}</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  مقارنة سعرك بأسعار المنافسين في (أمازون مصر، نون مصر، جوميا) عبر الفترة
                </p>
              </div>

              {onSelectProductForRadar && (
                <button
                  onClick={() => onSelectProductForRadar(activeChartWatchlistItem.productId)}
                  className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح برادار التسعير المباشر</span>
                </button>
              )}
            </div>

            {/* Historical Line Chart */}
            <div className="h-60 w-full min-w-0 pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220} debounce={50}>
                <LineChart data={activeChartWatchlistItem.competitorPriceHistory} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${v.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value: number | string | Array<number | string> | undefined, name: string | number | undefined) => [
                      `${Number(value || 0).toLocaleString()} ${currency}`, 
                      name === 'merchantPrice' ? 'سعرك الحالي' : name === 'amazonLowest' ? 'أمازون مصر' : name === 'noonLowest' ? 'نون مصر' : 'جوميا'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(val) => val === 'merchantPrice' ? 'سعرك المعتمد' : val === 'amazonLowest' ? 'أمازون مصر' : val === 'noonLowest' ? 'نون مصر' : 'جوميا'}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <Line type="monotone" dataKey="merchantPrice" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} name="merchantPrice" />
                  <Line type="monotone" dataKey="amazonLowest" stroke="#FF9900" strokeWidth={2} strokeDasharray="4 4" name="amazonLowest" />
                  <Line type="monotone" dataKey="noonLowest" stroke="#FEBE10" strokeWidth={2} strokeDasharray="4 4" name="noonLowest" />
                  <Line type="monotone" dataKey="jumiaLowest" stroke="#F68B1E" strokeWidth={2} strokeDasharray="4 4" name="jumiaLowest" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. PLATFORM PERFORMANCE SCORECARD TABLE (جدول تقييم المنصات والأرباح) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <span>مصفوفة مقارنة أداء المنصات والرسوم والأرباح الصافية</span>
            </h3>
            <p className="text-xs text-slate-500">
              بيان شامل لصافي الإيرادات بعد خصم عمولات الشحن والتخزين والمنصة
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>تنزيل شيت Excel / CSV 📊</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                <th className="py-3 px-3.5 rounded-r-xl">المنصة</th>
                <th className="py-3 px-3.5">حجم المبيعات (GMV)</th>
                <th className="py-3 px-3.5">حصة المبيعات</th>
                <th className="py-3 px-3.5">عدد الطلبات</th>
                <th className="py-3 px-3.5">نسبة الفوز بـ Buy Box</th>
                <th className="py-3 px-3.5">العمولات والرسوم</th>
                <th className="py-3 px-3.5">صافي الربح</th>
                <th className="py-3 px-3.5 rounded-l-xl">أقوى المنافسين</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {report.platformBreakdown.map((plat) => (
                <tr key={plat.platformId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3.5 font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plat.platformColor }} />
                    <span>{plat.platformName}</span>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono font-bold">{plat.salesVolumeEGP.toLocaleString()} {currency}</td>
                  <td className="py-3.5 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 font-mono">
                      {plat.salesSharePercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono">{plat.ordersCount} طلب</td>
                  <td className="py-3.5 px-3.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${
                      plat.buyBoxWinRatePercent >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {plat.buyBoxWinRatePercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono text-red-600">-{plat.totalFeesAndCommissionsEGP.toLocaleString()} {currency}</td>
                  <td className="py-3.5 px-3.5 font-mono font-black text-emerald-700">+{plat.netProfitEGP.toLocaleString()} {currency}</td>
                  <td className="py-3.5 px-3.5 text-slate-500">{plat.topCompetitorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. AI STRATEGIC EXECUTIVE RECOMMENDATIONS (توصيات الذكاء الاصطناعي التنفيذية) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Sparkles className="w-4 h-4 text-sky-300" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                التقرير التنفيذي الذكي والتوصيات المباشرة (AI Executive Strategy)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              خلاصة تحليل أداء الأسبوع وإجراءات فورية لزيادة هوامش الربح واستعادة الصدارة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="h-9 px-3 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'تم النسخ' : 'نسخ الخلاصة'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة واتساب 📲</span>
            </button>

            <button
              onClick={handleInstantRegenerate}
              disabled={isGeneratingNewReport}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingNewReport ? 'animate-spin' : ''}`} />
              <span>إعادة التحليل ⚡</span>
            </button>
          </div>
        </div>

        {/* AI Summary Box */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-indigo-100 shadow-xs space-y-2">
          <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ملخص الأداء التنفيذي:</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {report.aiExecutiveSummary}
          </p>
        </div>

        {/* Strategic Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {report.strategicActionItems.map((action) => (
            <div key={action.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                  action.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {action.priority === 'high' ? 'أولوية قصوى ⚡' : 'أولوية متوسطة 💡'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {action.category === 'pricing' ? 'تسعير' : action.category === 'platform' ? 'منصات' : 'مخزون'}
                </span>
              </div>

              <h4 className="text-xs font-black text-slate-900 leading-snug">
                {action.title}
              </h4>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {action.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <span>الأثر المتوقع:</span>
                <span>{action.expectedImpact}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. SCHEDULE SETTINGS MODAL / DRAWER (نافذة الجدولة والإرسال التلقائي) */}
      {/* ========================================================================= */}
      {isScheduleDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Alexandria']">
                    إعدادات الجدولة والتوليد التلقائي للتقارير
                  </h3>
                  <p className="text-xs text-slate-500">
                    استلم التقارير والرسوم البيانية أوتوماتيكياً عبر الإيميل والواتساب
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsScheduleDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Auto Schedule */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-indigo-950 block">تفعيل التوليد والإرسال التلقائي</span>
                <span className="text-[11px] text-indigo-700">إنشاء وإرسال التقرير للمسؤولين في الموعد المحدد</span>
              </div>

              <button
                onClick={() => setAutoScheduleActive(!autoScheduleActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  autoScheduleActive ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Frequency options */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800">تكرار الإرسال الدوري:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScheduleFrequency('weekly')}
                  className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                    scheduleFrequency === 'weekly' ? 'border-indigo-600 bg-indigo-50/60 font-black text-indigo-900' : 'border-slate-200 font-bold text-slate-700'
                  }`}
                >
                  <div className="text-xs">تقرير أسبوعي 📅</div>
                  <div className="text-[10px] text-slate-500 mt-1">كل يوم أحد الساعة 9:00 ص</div>
                </button>

                <button
                  onClick={() => setScheduleFrequency('monthly')}
                  className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer ${
                    scheduleFrequency === 'monthly' ? 'border-indigo-600 bg-indigo-50/60 font-black text-indigo-900' : 'border-slate-200 font-bold text-slate-700'
                  }`}
                >
                  <div className="text-xs">تقرير شهري 📊</div>
                  <div className="text-[10px] text-slate-500 mt-1">اليوم الأول من كل شهر ميلادي</div>
                </button>
              </div>
            </div>

            {/* Recipient Emails */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800">قائمة البريد الإلكتروني للمستلمين:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddEmail}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  إضافة
                </button>
              </div>

              {/* Tag list */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {emailList.map((em) => (
                  <span key={em} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{em}</span>
                    <button onClick={() => handleRemoveEmail(em)} className="text-slate-400 hover:text-red-600 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800">رقم الواتساب للتنبيه الفوري:</label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsScheduleDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveScheduleConfig}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-md shadow-indigo-600/30"
              >
                حفظ التفضيلات وتفعيل الجدولة 💾
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. OFFICIAL A4 PDF PREVIEW & EXPORT MODAL (معاينة وطباعة الوثيقة الرسمية) */}
      {/* ========================================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Action Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-black font-['Alexandria']">معاينة التقرير الرسمي المعتمد (A4 Official Document)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJsPdf}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>تصدير PDF احترافي (jsPDF) 📑</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة / حفظ كـ PDF 🖨️</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 bg-white" ref={reportPrintRef}>
              
              {/* Document Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">⚡</span>
                    <h2 className="text-base font-black text-slate-900 font-['Alexandria']">منظومة رادار التاجر الذكي - مصر</h2>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold">تقرير الأداء الدوري وحركة المبيعات وصناديق الشراء (Buy Box)</p>
                </div>

                <div className="text-left text-xs font-mono space-y-0.5">
                  <span className="text-[10px] text-slate-400 block">رقم الوثيقة المرجعي:</span>
                  <span className="font-bold text-slate-900">REP-EG-{Date.now().toString().slice(-6)}</span>
                  <span className="text-[10px] text-slate-500 block">{report.generatedAt}</span>
                </div>
              </div>

              {/* Title & Timeframe */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-['Alexandria']">{report.title}</h3>
                  <span className="text-xs text-indigo-700 font-bold">{report.periodLabel}</span>
                </div>
                <div className="text-left font-mono text-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">معتمد رسمياً ✓</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">إجمالي المبيعات</span>
                  <span className="text-sm font-black font-mono text-slate-900">{report.totalSalesVolumeEGP.toLocaleString()} ج.م</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">صافي الربح</span>
                  <span className="text-sm font-black font-mono text-emerald-700">{report.totalNetProfitEGP.toLocaleString()} ج.م</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">عدد الطلبات</span>
                  <span className="text-sm font-black font-mono text-slate-900">{report.totalOrdersCount} طلب</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">نسبة الـ Buy Box</span>
                  <span className="text-sm font-black font-mono text-sky-600">{report.overallBuyBoxWinRatePercent}%</span>
                </div>
              </div>

              {/* Platform Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900">توزيع المبيعات والرسوم عبر المنصات:</h4>
                <table className="w-full text-right text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 font-black text-slate-700">
                    <tr>
                      <th className="p-2 border-b">المنصة</th>
                      <th className="p-2 border-b">المبيعات</th>
                      <th className="p-2 border-b">الطلبات</th>
                      <th className="p-2 border-b">نسبة Buy Box</th>
                      <th className="p-2 border-b">العمولات</th>
                      <th className="p-2 border-b">صافي الربح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {report.platformBreakdown.map(p => (
                      <tr key={p.platformId}>
                        <td className="p-2 font-black font-sans">{p.platformName}</td>
                        <td className="p-2">{p.salesVolumeEGP.toLocaleString()} ج.م</td>
                        <td className="p-2">{p.ordersCount}</td>
                        <td className="p-2">{p.buyBoxWinRatePercent}%</td>
                        <td className="p-2 text-red-600">-{p.totalFeesAndCommissionsEGP.toLocaleString()} ج.م</td>
                        <td className="p-2 font-bold text-emerald-700">+{p.netProfitEGP.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Strategic Summary */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                <span className="font-black text-indigo-900 block">التوصية الاستراتيجية المعتمدة:</span>
                <p className="text-slate-700 leading-relaxed">{report.aiExecutiveSummary}</p>
              </div>

              {/* Document Footer & Signatures */}
              <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800">إدارة العمليات والتسعير الذكي</span>
                  <span>جمهورية مصر العربية 🇪🇬</span>
                </div>
                <div className="text-left font-mono">
                  <span className="block font-black text-emerald-700">الختم الرقمي: APPROVED-RADAR-EG</span>
                  <span>تم التوليد والتصدير آلياً</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
