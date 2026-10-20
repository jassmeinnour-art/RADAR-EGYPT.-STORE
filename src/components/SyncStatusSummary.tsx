import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Filter,
  Activity,
  Zap,
  Info,
  Layers,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PlatformSyncHistoryItem } from '../types';

export interface SyncStatusSummaryProps {
  attempts: PlatformSyncHistoryItem[];
  selectedStatusCode?: number | 'all' | null;
  onSelectStatusCode?: (statusCode: number | 'all' | null) => void;
  platformName?: string;
  platformCode?: string;
}

interface StatusCodeGroup {
  statusCode: number;
  statusText: string;
  category: 'success' | 'client_error' | 'server_error' | 'info';
  count: number;
  percentage: number;
  attempts: PlatformSyncHistoryItem[];
  avgLatencyMs: number;
  badgeLabelAr: string;
  descriptionAr: string;
  debugHintAr: string;
}

export const SyncStatusSummary: React.FC<SyncStatusSummaryProps> = ({
  attempts,
  selectedStatusCode = null,
  onSelectStatusCode,
  platformName = 'قناة البيع',
  platformCode
}) => {
  const [copiedDebug, setCopiedDebug] = useState(false);

  // Take exactly the last 5 attempts
  const last5 = attempts.slice(0, 5);
  const totalCount = last5.length;

  if (totalCount === 0) {
    return null;
  }

  // Calculate high-level stats
  const successfulCount = last5.filter((item) => item.statusCode >= 200 && item.statusCode < 300).length;
  const rateLimitedCount = last5.filter((item) => item.statusCode === 429).length;
  const serverErrorCount = last5.filter((item) => item.statusCode >= 500).length;
  const clientErrorCount = last5.filter((item) => item.statusCode >= 400 && item.statusCode < 500 && item.statusCode !== 429).length;

  const successRate = Math.round((successfulCount / totalCount) * 100);

  // Calculate average latency
  const validLatencies = last5.filter((i) => typeof i.latencyMs === 'number' && i.latencyMs > 0);
  const avgLatency = validLatencies.length > 0
    ? Math.round(validLatencies.reduce((sum, item) => sum + (item.latencyMs || 0), 0) / validLatencies.length)
    : 0;

  // Determine overall health status
  const overallHealth =
    successRate === 100
      ? { label: 'مستقر بالكامل (100%)', color: 'emerald', icon: CheckCircle2 }
      : successRate >= 60
      ? { label: 'استقرار نسبي (تحذير)', color: 'amber', icon: AlertTriangle }
      : { label: 'حرج / تعثر متكرر', color: 'rose', icon: XCircle };

  // Group by unique status codes
  const groupsMap = new Map<number, PlatformSyncHistoryItem[]>();
  last5.forEach((item) => {
    const list = groupsMap.get(item.statusCode) || [];
    list.push(item);
    groupsMap.set(item.statusCode, list);
  });

  const statusCodeGroups: StatusCodeGroup[] = Array.from(groupsMap.entries()).map(([code, items]) => {
    const count = items.length;
    const percentage = Math.round((count / totalCount) * 100);
    const validL = items.filter((i) => typeof i.latencyMs === 'number' && i.latencyMs > 0);
    const avgL = validL.length > 0
      ? Math.round(validL.reduce((sum, i) => sum + (i.latencyMs || 0), 0) / validL.length)
      : 0;

    let category: 'success' | 'client_error' | 'server_error' | 'info' = 'info';
    let badgeLabelAr = 'استجابة قياسية';
    let descriptionAr = 'حالة غير محددة';
    let debugHintAr = 'فحص استجابة الاتصال والتحقق من التقرير';

    if (code >= 200 && code < 300) {
      category = 'success';
      badgeLabelAr = 'مزامنة ناجحة ومكتملة';
      descriptionAr = 'تم جلب الأسعار والمخزون بنجاح دون أي عوائق في اتصال API.';
      debugHintAr = 'الاتصال سليم تماماً ولا يحتاج لأي إجراء تصحيحي.';
    } else if (code === 429) {
      category = 'client_error';
      badgeLabelAr = 'تجاوز حد الاستعلامات (Rate Limit)';
      descriptionAr = 'تجاوز عدد الطلبات المتزامنة المسموح بها في الدقيقة من المنصة.';
      debugHintAr = 'قم بزيادة الفاصل الزمني للمزامنة التلقائية أو تجنب تكرار التحديث اليدوي السريع.';
    } else if (code === 401 || code === 403) {
      category = 'client_error';
      badgeLabelAr = 'خطأ في صلاحيات الاعتماد (Auth)';
      descriptionAr = 'مفتاح الربط (API Key أو Refresh Token) منتهي الصلاحية أو غير معتمد.';
      debugHintAr = 'أعد تسجيل الدخول أو حدّث رمز التفويض (MWS/SP-API Token) في إعدادات المنصة.';
    } else if (code === 504) {
      category = 'server_error';
      badgeLabelAr = 'انقطاع مهلة البوابة (Gateway Timeout)';
      descriptionAr = 'استغرقت خوادم المنصة وقتاً طويلاً للرد ولم يصل الرد خلال المهلة المحددة.';
      debugHintAr = 'عادةً ما تكون المشكلة مؤقتة في خوادم القناة أثناء أوقات الذروة، أعد المحاولة بعد دقائق.';
    } else if (code === 502 || code === 503) {
      category = 'server_error';
      badgeLabelAr = 'الخدمة غير متوفرة (Service Unavailable)';
      descriptionAr = 'بوابة القناة تخضع لصيانة دورية أو تواجه ضغطاً كبيراً على الخوادم.';
      debugHintAr = 'تحقق من لوحة حالة خدمة الشركاء (Developer Portal Status) للمنصة.';
    } else if (code >= 500) {
      category = 'server_error';
      badgeLabelAr = 'خطأ داخلي في خادم القناة (Internal Error)';
      descriptionAr = 'فشل خادم القناة الخارجي في معالجة طلب المزامنة للبيانات.';
      debugHintAr = 'راجع سجل الأخطاء للتأكد من تنسيق البيانات المرسلة أو تواصل مع الدعم التقني للقناة.';
    } else {
      category = 'client_error';
      badgeLabelAr = 'طلب غير متوافق (Client Error)';
      descriptionAr = 'رمز استجابة من الفئة 4xx يشير إلى معرّف أو معامل غير صحيح.';
      debugHintAr = 'تأكد من معرّف المتجر أو المنتجات المحددة للمزامنة.';
    }

    return {
      statusCode: code,
      statusText: items[0]?.statusText || 'Unknown',
      category,
      count,
      percentage,
      attempts: items,
      avgLatencyMs: avgL,
      badgeLabelAr,
      descriptionAr,
      debugHintAr
    };
  });

  // Sort groups: errors first (5xx, then 4xx), then success 2xx for faster debugging
  statusCodeGroups.sort((a, b) => {
    if (a.statusCode >= 500 && b.statusCode < 500) return -1;
    if (b.statusCode >= 500 && a.statusCode < 500) return 1;
    if (a.statusCode >= 400 && b.statusCode < 400) return -1;
    if (b.statusCode >= 400 && a.statusCode < 400) return 1;
    return a.statusCode - b.statusCode;
  });

  // Copy debug report to clipboard
  const handleCopyDebug = () => {
    const lines = [
      `=== تقرير فحص مزامنة المنصة (آخر 5 محاولات) ===`,
      `المنصة: ${platformName} (${platformCode || 'N/A'})`,
      `التاريخ: ${new Date().toLocaleString('ar-EG')}`,
      `نسبة النجاح: ${successRate}% (${successfulCount}/${totalCount})`,
      `متوسط زمن الاستجابة: ${avgLatency}ms`,
      `الحالة الإجمالية: ${overallHealth.label}`,
      `--- تفاصيل المحاولات الـ 5 بالترتيب الزمني (من الأحدث للأقدم) ---`,
      ...last5.map((item, idx) => {
        return `#${idx + 1} | HTTP ${item.statusCode} (${item.statusText}) | وقت: ${item.timestamp} | تأخير: ${item.latencyMs || 0}ms | رسالة: ${item.message || 'N/A'}`;
      }),
      `--- تصنيف أكواد الاستجابة ---`,
      ...statusCodeGroups.map(
        (g) => `• كود HTTP ${g.statusCode} (${g.statusText}): ${g.count} من ${totalCount} (${g.percentage}%) - ${g.badgeLabelAr} - نصيحة: ${g.debugHintAr}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedDebug(true);
    setTimeout(() => setCopiedDebug(false), 2500);
  };

  return (
    <div
      id="sync-status-summary-container"
      className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3.5 text-right transition-all"
    >
      {/* Header bar of the summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">
                ملخص حالات المزامنة (Sync Status Summary)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                آخر 5 محاولات
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              تصنيف بصري لأكواد الاستجابة لتسريع فحص وتشخيص أخطاء الربط (Faster Debugging)
            </p>
          </div>
        </div>

        {/* Diagnostic Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Debug Data button */}
          <button
            type="button"
            id="btn-copy-sync-debug"
            onClick={handleCopyDebug}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="نسخ تقرير الفحص والتشخيص السريع للحافظة"
          >
            {copiedDebug ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">تم نسخ التقرير ✅</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>نسخ بيانات الفحص 📋</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Micro-Badges: Success Rate, Overall State, Avg Latency */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Success Rate */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">نسبة نجاح المزامنة</span>
          <div className="flex items-center justify-center gap-1">
            <span
              className={`text-sm font-black font-mono ${
                successRate >= 80 ? 'text-emerald-700' : successRate >= 50 ? 'text-sky-700' : 'text-rose-700'
              }`}
            >
              {successRate}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              ({successfulCount}/{totalCount})
            </span>
          </div>
        </div>

        {/* Overall Health */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">الحالة التشخيصية</span>
          <span
            className={`text-[11px] font-black inline-flex items-center gap-1 ${
              overallHealth.color === 'emerald'
                ? 'text-emerald-700'
                : overallHealth.color === 'amber'
                ? 'text-sky-700'
                : 'text-rose-700'
            }`}
          >
            <overallHealth.icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{overallHealth.label}</span>
          </span>
        </div>

        {/* Average Latency */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">متوسط زمن الاستجابة</span>
          <span className="text-sm font-black font-mono text-slate-800">
            {avgLatency > 0 ? `${avgLatency}ms` : 'لحظي'}
          </span>
        </div>
      </div>

      {/* Visual Sequence of Last 5 Attempts (Timeline Segments) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>تسلسل المحاولات الـ 5 (مرتبة من الأحدث للأقدم):</span>
          </span>
          <span className="text-[10px] text-slate-400">اضغط على أي محاولة لعزلها</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5" id="sync-status-attempts-strip">
          {last5.map((attempt, index) => {
            const is2xx = attempt.statusCode >= 200 && attempt.statusCode < 300;
            const is429 = attempt.statusCode === 429;
            const is5xx = attempt.statusCode >= 500;
            const isSelected = selectedStatusCode === attempt.statusCode;

            const bgClass = is2xx
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
              : is429
              ? 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100'
              : 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100';

            const activeRing = isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 scale-[1.03]' : '';

            return (
              <button
                type="button"
                key={attempt.id || index}
                id={`sync-attempt-pill-${index}`}
                onClick={() => {
                  if (onSelectStatusCode) {
                    onSelectStatusCode(selectedStatusCode === attempt.statusCode ? null : attempt.statusCode);
                  }
                }}
                className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer relative ${bgClass} ${activeRing}`}
                title={`المحاولة #${index + 1}: كود ${attempt.statusCode} (${attempt.statusText}) - اضغط للتصفية`}
              >
                {/* Index tag */}
                <span className="text-[9px] font-bold text-slate-400 block font-mono">
                  #{index + 1} {index === 0 ? '⚡' : ''}
                </span>

                {/* HTTP Code */}
                <span className="text-xs font-black font-mono block leading-tight">
                  {attempt.statusCode}
                </span>

                {/* Status text or latency */}
                <span className="text-[9px] opacity-80 block truncate font-mono">
                  {attempt.latencyMs ? `${attempt.latencyMs}ms` : attempt.statusText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Status Code Categorization Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>تصنيف المحاولات حسب كود الحالة (Status Code Groups):</span>
          </span>

          {selectedStatusCode && selectedStatusCode !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectStatusCode && onSelectStatusCode(null)}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
            >
              <span>إلغاء التصفية ({selectedStatusCode})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="sync-status-code-categories">
          {statusCodeGroups.map((group) => {
            const isSelected = selectedStatusCode === group.statusCode;
            const is2xx = group.category === 'success';
            const is429 = group.statusCode === 429;
            const is5xx = group.category === 'server_error';

            const cardBorder = isSelected
              ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/40'
              : is2xx
              ? 'border-emerald-200 bg-white hover:border-emerald-300'
              : is429
              ? 'border-sky-200 bg-white hover:border-sky-300'
              : 'border-rose-200 bg-white hover:border-rose-300';

            const badgeBg = is2xx
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : is429
              ? 'bg-sky-100 text-sky-800 border-sky-300'
              : 'bg-rose-100 text-rose-800 border-rose-300';

            const barColor = is2xx ? 'bg-emerald-500' : is429 ? 'bg-sky-500' : 'bg-rose-500';

            return (
              <div
                key={group.statusCode}
                id={`status-code-group-${group.statusCode}`}
                onClick={() => {
                  if (onSelectStatusCode) {
                    onSelectStatusCode(isSelected ? null : group.statusCode);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs relative ${cardBorder}`}
              >
                {/* Top: Status Code + Count Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${badgeBg}`}
                    >
                      {is2xx ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : is429 ? (
                        <AlertTriangle className="w-3 h-3 text-sky-700" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-700" />
                      )}
                      <span>HTTP {group.statusCode}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 truncate">
                      {group.badgeLabelAr}
                    </span>
                  </div>

                  {/* Ratio badge */}
                  <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    {group.count}/5 ({group.percentage}%)
                  </span>
                </div>

                {/* Progress bar showing proportion out of 5 */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>

                {/* Explanation text */}
                <p className="text-[10px] text-slate-500 leading-relaxed mb-1">
                  {group.descriptionAr}
                </p>

                {/* Debugging Hint */}
                <div className="text-[10px] font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200/70 flex items-start gap-1">
                  <span className="text-indigo-600 shrink-0 mt-0.5">💡</span>
                  <span className="leading-tight">{group.debugHintAr}</span>
                </div>

                {/* Clickable indicator */}
                <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-indigo-700 font-bold">
                  <span>{isSelected ? '✓ يتم عرض هذه المحاولات الآن' : 'انقر لعزل هذه المحاولات'}</span>
                  <span className="font-mono text-slate-400">متوسط: {group.avgLatencyMs}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
