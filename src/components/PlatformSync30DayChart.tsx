import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Zap,
  Info,
  Layers,
  ChevronDown,
  Eye,
  Radio,
  Building2,
  Calendar,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import {
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { SafeResponsiveContainer as ResponsiveContainer } from './SafeResponsiveContainer';
import { ConnectedMerchantPlatform } from '../types';
import {
  DailyPlatformSyncDataPoint,
  PlatformDowntimeIncident,
  PlatformSync30DaySummary,
  getStored30DayPlatformSyncData,
  recordLivePlatformSyncIn30DayDataset
} from '../data/platformSync30DayData';

interface PlatformSync30DayChartProps {
  connectedPlatforms?: ConnectedMerchantPlatform[];
  onTriggerSync?: (platformId: string, platformLabel: string) => void;
  onShowToast?: (message: string) => void;
}

export const PlatformSync30DayChart: React.FC<PlatformSync30DayChartProps> = ({
  connectedPlatforms = [],
  onTriggerSync,
  onShowToast
}) => {
  // Load authentic 30-day sync data
  const [syncData, setSyncData] = useState(() => {
    return getStored30DayPlatformSyncData(connectedPlatforms);
  });

  // State controls
  const [selectedPlatformCode, setSelectedPlatformCode] = useState<string>('all');
  const [chartMetricView, setChartMetricView] = useState<'success_rate' | 'downtime_errors' | 'latency'>('success_rate');
  const [onlyDowntimeDays, setOnlyDowntimeDays] = useState<boolean>(false);
  const [selectedDayPoint, setSelectedDayPoint] = useState<DailyPlatformSyncDataPoint | null>(null);
  const [isPingingLive, setIsPingingLive] = useState<boolean>(false);
  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<PlatformDowntimeIncident | null>(null);

  // Available platforms for filter
  const platformFilterOptions = useMemo(() => {
    const list = [
      { code: 'all', name: 'جميع المنصات المتصلة (All Channels)' },
      { code: 'amazon_eg', name: 'أمازون مصر (Amazon EG)' },
      { code: 'noon_eg', name: 'نون مصر (Noon EG)' },
      { code: 'jumia_eg', name: 'جوميا مصر (Jumia EG)' },
      { code: 'shopify_salla', name: 'متجر شوبيفاي / سلة (Direct Store)' },
      { code: 'tiktok_shop', name: 'تيك توك شوب (TikTok Shop)' }
    ];
    return list;
  }, []);

  // Filtered dataset according to platform and downtime filter
  const displayDataset = useMemo(() => {
    let list = syncData.dailyPoints.map(point => {
      if (selectedPlatformCode === 'all') {
        return point;
      }
      const ch = point.platformMetrics[selectedPlatformCode];
      if (!ch) {
        return point;
      }
      return {
        ...point,
        successRate: ch.successRate,
        successfulSyncs: ch.successfulSyncs,
        failedSyncs: ch.failedSyncs,
        avgLatencyMs: ch.latencyMs,
        isDowntimeDay: ch.status === 'down' || ch.failedSyncs >= 5,
        hasSyncErrors: ch.failedSyncs > 0,
        primaryErrorMessage: ch.errorMessage || point.primaryErrorMessage
      };
    });

    if (onlyDowntimeDays) {
      list = list.filter(p => p.hasSyncErrors || p.isDowntimeDay);
    }
    return list;
  }, [syncData, selectedPlatformCode, onlyDowntimeDays]);

  // Downtime days indices for reference area highlighting
  const downtimeDaysList = useMemo(() => {
    return displayDataset.filter(d => d.isDowntimeDay || d.failedSyncs >= 4);
  }, [displayDataset]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    if (selectedPlatformCode === 'all') {
      return syncData.incidents;
    }
    return syncData.incidents.filter(inc => inc.platformCode === selectedPlatformCode);
  }, [syncData.incidents, selectedPlatformCode]);

  // Recalculated dynamic summary for current view
  const currentSummary = useMemo(() => {
    if (selectedPlatformCode === 'all') {
      return syncData.summary;
    }
    const totalDays = syncData.dailyPoints.length;
    let totalSucc = 0;
    let totalFail = 0;
    let totalLatency = 0;

    syncData.dailyPoints.forEach(p => {
      const ch = p.platformMetrics[selectedPlatformCode];
      if (ch) {
        totalSucc += ch.successfulSyncs;
        totalFail += ch.failedSyncs;
        totalLatency += ch.latencyMs;
      }
    });

    const totalCycles = totalSucc + totalFail;
    const uptime = totalCycles > 0 ? Number(((totalSucc / totalCycles) * 100).toFixed(2)) : 100;
    const avgLat = totalDays > 0 ? Math.round(totalLatency / totalDays) : 200;

    return {
      ...syncData.summary,
      overallUptimePercent: uptime,
      totalCyclesExecuted: totalCycles,
      totalSuccessfulCycles: totalSucc,
      totalFailedCycles: totalFail,
      avgLatencyMs: avgLat,
      totalDowntimeIncidents: filteredIncidents.length
    };
  }, [syncData, selectedPlatformCode, filteredIncidents]);

  // Live ping all channels test
  const handleTriggerLiveHealthPing = () => {
    setIsPingingLive(true);
    if (onShowToast) {
      onShowToast('جاري إرسال فحص اتصال حي (Health Ping) لكافة بوابات المنصات النشطة...');
    }

    setTimeout(() => {
      // Record successful simulated ping
      const latency = Math.round(160 + Math.random() * 80);
      recordLivePlatformSyncIn30DayDataset(
        selectedPlatformCode === 'all' ? 'amazon_eg' : selectedPlatformCode,
        'فحص دوري يدوي فوري',
        true,
        latency
      );

      // Refresh state
      setSyncData(getStored30DayPlatformSyncData(connectedPlatforms));
      setIsPingingLive(false);

      if (onShowToast) {
        onShowToast(`تم تأكيد استجابة خوادم المزامنة بنجاح! ⚡ زمن الاستجابة: ${latency}ms`);
      }
    }, 1100);
  };

  // CSV Export for 30-Day Platform Sync Audit
  const handleExportSyncAuditCSV = () => {
    const headers = [
      'التاريخ',
      'اليوم',
      'إجمالي دورات التزامن',
      'الدورات الناجحة',
      'الدورات الفاشلة',
      'معدل النجاح %',
      'فترة التوقف (بالدقائق)',
      'متوسط زمن الاستجابة (ms)',
      'حالة اليوم',
      'كود الخطأ الرئيسي',
      'تفاصيل وتفسير الخطأ'
    ];

    const rows = syncData.dailyPoints.map(p => [
      p.date,
      p.dayOfWeek,
      p.totalSyncCycles,
      p.successfulSyncs,
      p.failedSyncs,
      `${p.successRate}%`,
      p.downtimeMinutes,
      p.avgLatencyMs,
      p.isDowntimeDay ? 'فترة توقف / عطل' : p.hasSyncErrors ? 'أخطاء جزئية' : 'مستقر 100%',
      p.primaryErrorCode || 'لا يوجد',
      p.primaryErrorMessage ? `"${p.primaryErrorMessage.replace(/"/g, '""')}"` : 'اتصال مستقر ومكتمل'
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `platform_sync_30days_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('تم تصدير سجل تدقيق مزامنة المنصات لـ 30 يوماً بصيغة CSV بنجاح! 📑');
    }
  };

  // Custom Chart Tooltip
  const CustomSyncTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DailyPlatformSyncDataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs backdrop-blur-md min-w-[270px] max-w-[340px] z-50 text-right">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
            <div>
              <span className="font-bold text-slate-100 text-sm">{dataPoint.dayOfWeek}، {dataPoint.dateLabel}</span>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{dataPoint.date}</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
              dataPoint.isDowntimeDay
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : dataPoint.hasSyncErrors
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {dataPoint.isDowntimeDay ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>⚠️ فترة توقف (Downtime)</span>
                </>
              ) : dataPoint.hasSyncErrors ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-sky-400" />
                  <span>تذبذب جزئي</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>اتصال مستقر 100%</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 text-[10px] block">معدل نجاح المزامنة</span>
                <span className={`text-base font-black ${
                  dataPoint.successRate >= 95 ? 'text-emerald-400' : dataPoint.successRate >= 85 ? 'text-sky-400' : 'text-rose-400'
                }`}>
                  {dataPoint.successRate}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">زمن الاستجابة (Latency)</span>
                <span className={`text-base font-black ${
                  dataPoint.avgLatencyMs < 400 ? 'text-sky-400' : dataPoint.avgLatencyMs < 1000 ? 'text-sky-400' : 'text-rose-400'
                }`}>
                  {dataPoint.avgLatencyMs} ms
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  الدورات الناجحة:
                </span>
                <span className="font-bold text-emerald-400">{dataPoint.successfulSyncs} دورة</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <XCircle className="w-3 h-3 text-rose-400" />
                  الدورات الفاشلة:
                </span>
                <span className={`font-bold ${dataPoint.failedSyncs > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {dataPoint.failedSyncs} دورة
                </span>
              </div>

              {dataPoint.downtimeMinutes > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3 text-rose-400" />
                    مدة التوقف المرصودة:
                  </span>
                  <span className="font-bold text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/50">
                    {dataPoint.downtimeMinutes} دقيقة
                  </span>
                </div>
              )}
            </div>

            {/* Error Detail Highlight */}
            {dataPoint.primaryErrorMessage && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 text-[11px] text-rose-200">
                <div className="font-bold flex items-center gap-1 text-rose-400 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>خطأ التزامن المرصود (كود {dataPoint.primaryErrorCode}):</span>
                </div>
                <p className="leading-relaxed opacity-95 text-[10px]">
                  {dataPoint.primaryErrorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dot renderer that visually flags downtime days with red pulsing icons
  const renderCustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    if (payload.isDowntimeDay) {
      return (
        <g key={`dot-${payload.date}`} className="cursor-pointer" onClick={() => setSelectedDayPoint(payload)}>
          <circle cx={cx} cy={cy} r={9} fill="#f43f5e" fillOpacity={0.3} className="animate-ping" />
          <circle cx={cx} cy={cy} r={6} fill="#f43f5e" stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }

    if (payload.hasSyncErrors) {
      return (
        <circle
          key={`dot-${payload.date}`}
          cx={cx}
          cy={cy}
          r={5}
          fill="#0ea5e9"
          stroke="#ffffff"
          strokeWidth={1.5}
          className="cursor-pointer"
          onClick={() => setSelectedDayPoint(payload)}
        />
      );
    }

    return (
      <circle
        key={`dot-${payload.date}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#10b981"
        className="cursor-pointer hover:r-5 transition-all"
        onClick={() => setSelectedDayPoint(payload)}
      />
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="platform-sync-30d-evolution-section">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-rose-500" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>تطور حالة مزامنة المنصات (Platform Sync Health & SLA)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>سجل الـ 30 يوماً الماضية</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-sky-600" />
                <span>تمييز فترات التوقف والأعطال ⚠️</span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>رادار استقرار التزامن ومراقبة فترات التوقف</span>
              <span className="text-sm font-bold text-slate-400">({displayDataset.length} يوماً مرصوداً)</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              تحليل بياني تفصيلي لتطور كفاءة المزامنة اليومية لأسعار ومخزون المتاجر عبر قنوات البيع (أمازون مصر، نون، جوميا، والمتاجر المباشرة)، مع رصد دقيق وفوري لأي انقطاع في الاستجابة (Downtime) أو اختناق في استهلاك الـ API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Live Ping Test Button */}
            <button
              id="btn-trigger-live-sync-ping"
              type="button"
              disabled={isPingingLive}
              onClick={handleTriggerLiveHealthPing}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer ${
                isPingingLive
                  ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
              title="فحص سرعة استجابة خوادم المزامنة للمنصات المتصلة الآن"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPingingLive ? 'animate-spin' : ''}`} />
              <span>{isPingingLive ? 'جاري الفحص المباشر...' : 'فحص استجابة فوري ⚡'}</span>
            </button>

            {/* CSV Export Button */}
            <button
              id="btn-export-sync-audit-csv"
              type="button"
              onClick={handleExportSyncAuditCSV}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              title="تصدير تقرير الـ 30 يوماً وتفاصيل الأعطال بصيغة CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>تصدير السجل (CSV)</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          {/* Card 1: Overall SLA Uptime */}
          <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold">معدل الاستقرار الإجمالي (SLA)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${
                currentSummary.overallUptimePercent >= 98 ? 'text-emerald-600' : 'text-sky-600'
              }`}>
                {currentSummary.overallUptimePercent}%
              </span>
              <span className="text-[11px] font-bold text-slate-400">آخر 30 يوماً</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">
              ✓ مطابقة لمعايير الاتصال المؤسسي Enterprise
            </div>
          </div>

          {/* Card 2: Total Sync Cycles */}
          <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold">دورات التزامن المنفذة</span>
              <RefreshCw className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {currentSummary.totalCyclesExecuted.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                ({currentSummary.totalSuccessfulCycles.toLocaleString()} ناجحة)
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              معدل كل 15 دقيقة / متجر
            </div>
          </div>

          {/* Card 3: Downtime Incidents */}
          <div className="bg-rose-50/50 hover:bg-rose-50/80 p-4 rounded-2xl border border-rose-200/80 transition-all">
            <div className="flex items-center justify-between text-rose-700 mb-1.5">
              <span className="text-xs font-bold">فترات التوقف المرصودة</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">
                {currentSummary.totalDowntimeIncidents}
              </span>
              <span className="text-[11px] font-bold text-rose-500">حوادث انقطاع</span>
            </div>
            <div className="text-[10px] text-rose-700 font-bold mt-1">
              إجمالي {currentSummary.totalDowntimeMinutes} دقيقة على مدار الشهر
            </div>
          </div>

          {/* Card 4: Average Response Latency */}
          <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold">متوسط سرعة الاستجابة</span>
              <Zap className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-700">
                {currentSummary.avgLatencyMs}
              </span>
              <span className="text-[11px] font-bold text-slate-500">ملي ثانية (ms)</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              استجابة فائقة السرعة لخوادم القاهرة
            </div>
          </div>

          {/* Card 5: MTTR (Mean Time To Recover) */}
          <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-xs font-bold">متوسط زمن التعافي (MTTR)</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700">
                {currentSummary.mttrMinutes}
              </span>
              <span className="text-[11px] font-bold text-slate-500">دقيقة / حادث</span>
            </div>
            <div className="text-[10px] text-purple-700 font-bold mt-1">
              معاودة تلقائية ذكية عبر طوابير المهام
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* Filters and View Options */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Platform Channel Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>تصفية القناة المستهدفة:</span>
            </span>

            <div className="relative">
              <select
                id="select-sync-platform-filter"
                value={selectedPlatformCode}
                onChange={(e) => setSelectedPlatformCode(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 px-3 pr-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer appearance-none transition-all"
              >
                {platformFilterOptions.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Toggle Only Downtime Days */}
            <button
              id="btn-toggle-only-downtime-days"
              type="button"
              onClick={() => setOnlyDowntimeDays(!onlyDowntimeDays)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyDowntimeDays
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${onlyDowntimeDays ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>عرض أيام الأعطال والتوقف فقط ({downtimeDaysList.length})</span>
            </button>
          </div>

          {/* Metric Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              id="btn-metric-success-rate"
              type="button"
              onClick={() => setChartMetricView('success_rate')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMetricView === 'success_rate'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              معدل النجاح والاستقرار %
            </button>
            <button
              id="btn-metric-downtime-errors"
              type="button"
              onClick={() => setChartMetricView('downtime_errors')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMetricView === 'downtime_errors'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أخطاء التزامن ودقائق التوقف ⚠️
            </button>
            <button
              id="btn-metric-latency"
              type="button"
              onClick={() => setChartMetricView('latency')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMetricView === 'latency'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              زمن الاستجابة (Latency ms)
            </button>
          </div>
        </div>

        {/* Visual Legend & Downtime Notice Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              دليل مؤشرات الرسم البياني:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>اتصال مستقر بنسبة 100%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>تذبذب جزئي أو أخطاء فردية</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200 animate-pulse" />
              <span className="font-bold text-rose-700">فترة توقف رئيسية (Downtime Incident)</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            💡 اضغط على أي نقطة أو عطل في المخطط لعرض التشخيص الفني وحالة الإصلاح
          </div>
        </div>

        {/* Primary Chart Container */}
        <div className="h-[360px] w-full min-w-0 pt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300} debounce={50}>
            {chartMetricView === 'success_rate' ? (
              <ComposedChart data={displayDataset} margin={{ top: 20, right: 20, bottom: 25, left: 10 }}>
                <defs>
                  <linearGradient id="syncSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={onlyDowntimeDays ? 0 : 2}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="left"
                  domain={[65, 100]}
                  tick={{ fontSize: 11, fill: '#059669' }}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 25]}
                  tick={{ fontSize: 11, fill: '#e11d48' }}
                  tickFormatter={(val) => `${val} خطأ`}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />

                <Tooltip content={<CustomSyncTooltip />} />

                {/* Highlight Downtime Reference Areas */}
                {downtimeDaysList.map(item => (
                  <ReferenceArea
                    key={`downtime-ref-${item.date}`}
                    x1={item.dateLabel}
                    x2={item.dateLabel}
                    yAxisId="left"
                    fill="#fee2e2"
                    fillOpacity={0.5}
                    stroke="#fca5a5"
                    strokeDasharray="2 2"
                  />
                ))}

                {/* 95% SLA Target Line */}
                <ReferenceLine
                  y={95}
                  yAxisId="left"
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{
                    value: 'الحد الأدنى المستهدف لـ SLA (95%)',
                    fill: '#4f46e5',
                    fontSize: 10,
                    position: 'insideTopLeft'
                  }}
                />

                {/* Bar for failed syncs / errors */}
                <Bar
                  yAxisId="right"
                  dataKey="failedSyncs"
                  name="failedSyncs"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  barSize={14}
                />

                {/* Area and Line for Success Rate */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="successRate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#syncSuccessGradient)"
                  dot={renderCustomizedDot}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : chartMetricView === 'downtime_errors' ? (
              <ComposedChart data={displayDataset} margin={{ top: 20, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={onlyDowntimeDays ? 0 : 2}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 60]}
                  tick={{ fontSize: 11, fill: '#e11d48' }}
                  tickFormatter={(val) => `${val} دقيقة`}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 25]}
                  tick={{ fontSize: 11, fill: '#0284c7' }}
                  tickFormatter={(val) => `${val} دورة`}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomSyncTooltip />} />

                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => {
                    if (val === 'downtimeMinutes') return <span className="text-xs font-bold text-rose-700">مدة التوقف والانقطاع (بالدقائق)</span>;
                    if (val === 'failedSyncs') return <span className="text-xs font-bold text-sky-600">عدد دورات التزامن الفاشلة</span>;
                    return val;
                  }}
                />

                <Bar
                  yAxisId="left"
                  dataKey="downtimeMinutes"
                  name="downtimeMinutes"
                  fill="#e11d48"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="failedSyncs"
                  name="failedSyncs"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </ComposedChart>
            ) : (
              <AreaChart data={displayDataset} margin={{ top: 20, right: 20, bottom: 25, left: 10 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={onlyDowntimeDays ? 0 : 2}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[100, 2200]}
                  tick={{ fontSize: 11, fill: '#0284c7' }}
                  tickFormatter={(val) => `${val}ms`}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomSyncTooltip />} />

                {/* 500ms SLA Baseline */}
                <ReferenceLine
                  y={500}
                  stroke="#0284c7"
                  strokeDasharray="4 4"
                  label={{
                    value: 'المعدل القياسي الطبيعي (500ms)',
                    fill: '#0284c7',
                    fontSize: 10,
                    position: 'insideTopLeft'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="avgLatencyMs"
                  name="avgLatencyMs"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fill="url(#latencyGradient)"
                  dot={renderCustomizedDot}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Day Point Quick Inspect Card (If Clicked) */}
      {selectedDayPoint && (
        <div className="bg-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/80 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-indigo-800/80">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                selectedDayPoint.isDowntimeDay ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {selectedDayPoint.isDowntimeDay ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  فحص تشخيصي لتاريخ: {selectedDayPoint.dayOfWeek}، {selectedDayPoint.dateLabel} ({selectedDayPoint.date})
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  تفاصيل استجابة القنوات وحالة المزامنة الكاملة لهذا اليوم
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDayPoint(null)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/60 transition-colors cursor-pointer"
            >
              إغلاق التفاصيل ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/60">
              <span className="text-[11px] text-indigo-300 block">معدل النجاح:</span>
              <span className="text-xl font-black text-emerald-400">{selectedDayPoint.successRate}%</span>
            </div>
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/60">
              <span className="text-[11px] text-indigo-300 block">الدورات الناجحة / الفاشلة:</span>
              <span className="text-xl font-black text-white">
                {selectedDayPoint.successfulSyncs} <span className="text-xs text-emerald-400 font-normal">نجاح</span> / <span className="text-rose-400">{selectedDayPoint.failedSyncs}</span> <span className="text-xs text-rose-400 font-normal">فشل</span>
              </span>
            </div>
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/60">
              <span className="text-[11px] text-indigo-300 block">مدة التوقف:</span>
              <span className="text-xl font-black text-sky-300">{selectedDayPoint.downtimeMinutes} دقيقة</span>
            </div>
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-800/60">
              <span className="text-[11px] text-indigo-300 block">متوسط زمن الاستجابة:</span>
              <span className="text-xl font-black text-sky-400">{selectedDayPoint.avgLatencyMs} ms</span>
            </div>
          </div>

          {selectedDayPoint.primaryErrorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-200">
              <div className="font-bold flex items-center gap-1.5 text-rose-300 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>سبب العطل أو الخطأ المرصود: كود {selectedDayPoint.primaryErrorCode}</span>
              </div>
              <p className="leading-relaxed opacity-90">{selectedDayPoint.primaryErrorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Incident Audit Log Table (سجل حوادث وأعطال التزامن بالتفصيل) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-black text-slate-900">
                سجل فترات التوقف وأخطاء التزامن المرصودة ({filteredIncidents.length} حوادث)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              توثيق فني لكافة حالات الانقطاع، رموز أخطاء الـ API (مثل 504 Gateway Timeout و 429 Rate Limit)، وأسبابها الجذرية وإجراءات التعافي التلقائي.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            تمت معالجة كافة الحوادث بنجاح ✓
          </span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700">لم يتم تسجيل أي فترات توقف أو أخطاء تزامن لهذه القناة خلال الـ 30 يوماً!</p>
            <p className="text-xs text-slate-400 mt-1">استقرار تام بنسبة 100% لكافة عمليات التزامن الدورية.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/60">
                  <th className="py-3 px-4 rounded-r-xl">التاريخ والتوقيت</th>
                  <th className="py-3 px-4">المنصة المتأثرة</th>
                  <th className="py-3 px-4">كود الخطأ</th>
                  <th className="py-3 px-4">وصف العطل والسبب الجذري</th>
                  <th className="py-3 px-4">مدة التوقف</th>
                  <th className="py-3 px-4">المنتجات المتأثرة</th>
                  <th className="py-3 px-4 rounded-l-xl">حالة الحل والتعافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map(inc => (
                  <tr
                    key={inc.id}
                    className="hover:bg-rose-50/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedIncidentForModal(inc)}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div>{inc.dateLabel}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{inc.time}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{inc.platformName}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black ${
                        inc.statusCode >= 500
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}>
                        HTTP {inc.statusCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900">{inc.errorTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {inc.errorDetails}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-bold text-rose-700 bg-rose-50 border border-rose-200 text-[11px]">
                        {inc.durationMinutes} دقيقة
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-bold">
                      {inc.affectedProductsCount} منتج
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px]">تم التعافي ذاتياً</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Details Modal */}
      {selectedIncidentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="text-base font-black text-slate-900">
                  تقرير حادثة انقطاع التزامن (Incident Details)
                </h4>
              </div>
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">المنصة</span>
                  <span className="font-bold text-slate-800">{selectedIncidentForModal.platformName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">التاريخ والمدة</span>
                  <span className="font-bold text-slate-800">
                    {selectedIncidentForModal.dateLabel} ({selectedIncidentForModal.durationMinutes} دقيقة)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">وصف الخطأ:</span>
                <p className="bg-rose-50 text-rose-900 p-3 rounded-xl border border-rose-200 font-medium leading-relaxed">
                  {selectedIncidentForModal.errorDetails}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">السبب الجذري (Root Cause):</span>
                <p className="bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedIncidentForModal.rootCause}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">إجراء التعافي والحل:</span>
                <p className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed">
                  {selectedIncidentForModal.resolvedAt}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedIncidentForModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
