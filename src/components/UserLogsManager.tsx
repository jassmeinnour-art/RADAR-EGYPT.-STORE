import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  User,
  Shield,
  Laptop,
  Globe,
  Tag,
  Eye,
  PlusCircle,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserActivityLog, UserActionType, UserActionSeverity } from '../types';
import {
  subscribeToUserLogs,
  clearUserLogs,
  exportUserLogsToCSV,
  logUserActivity,
  getLocalCachedUserLogs
} from '../services/userLogsService';
import { useAuth } from '../context/AuthContext';

interface UserLogsManagerProps {
  onShowToast?: (msg: string) => void;
}

export const UserLogsManager: React.FC<UserLogsManagerProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<UserActivityLog[]>(() => getLocalCachedUserLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<UserActivityLog | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isGeneratingTestLog, setIsGeneratingTestLog] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUserLogs(user?.uid, (updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsub();
  }, [user?.uid]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const todayCount = logs.filter(l => {
      const d = new Date(l.createdAt);
      const today = new Date();
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    }).length;
    const warnings = logs.filter(l => l.status === 'warning').length;
    const errors = logs.filter(l => l.status === 'error').length;
    const successes = logs.filter(l => l.status === 'success').length;
    return { total, todayCount, warnings, errors, successes };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (log.actionTitle || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q);
        const matchUser = (log.userName || '').toLowerCase().includes(q) || (log.userEmail || '').toLowerCase().includes(q);
        const matchPlatform = (log.platform || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchUser && !matchPlatform) {
          return false;
        }
      }

      // Action Type filter
      if (selectedActionType !== 'all') {
        if (selectedActionType === 'wishlist' && !log.actionType.startsWith('wishlist')) return false;
        if (selectedActionType === 'login' && log.actionType !== 'login' && log.actionType !== 'logout') return false;
        if (selectedActionType === 'price' && log.actionType !== 'price_update' && log.actionType !== 'price_alert') return false;
        if (selectedActionType === 'sync' && log.actionType !== 'platform_sync') return false;
        if (selectedActionType === 'export' && log.actionType !== 'csv_export' && log.actionType !== 'csv_import') return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && log.status !== selectedSeverity) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedActionType, selectedSeverity]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      onShowToast?.('لا توجد سجلات مطابقة للتصدير');
      return;
    }
    exportUserLogsToCSV(filteredLogs);
    onShowToast?.('تم تصدير سجل نشاط المستخدمين بنجاح 📥');
  };

  const handleClearLogs = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع سجلات نشاط المستخدمين؟ لا يمكن التراجع عن هذه الخطوة.')) {
      setIsClearing(true);
      await clearUserLogs(user?.uid);
      setLogs([]);
      setIsClearing(false);
      onShowToast?.('تم مسح سجل النشاط بنجاح');
    }
  };

  const handleTriggerTestLog = async () => {
    setIsGeneratingTestLog(true);
    await logUserActivity({
      actionType: 'system',
      actionTitle: 'فحص فوري وتدقيق لسجل المستخدمين',
      details: 'تم إجراء اختبار تدقيق أمني لنظام السجلات السحابية وتأكيد جاهزية المزامنة مع Firestore',
      platform: 'web_portal',
      status: 'success',
      metadata: { testId: Date.now(), triggeredBy: user?.email || 'admin' },
      userId: user?.uid,
      userName: user?.displayName || 'التاجر المسؤول',
      userEmail: user?.email || 'merchant@radar.eg',
    });
    setIsGeneratingTestLog(false);
    onShowToast?.('تم تسجيل نشاط تدقيق جديد بنجاح 📜');
  };

  const getStatusBadge = (status: UserActionSeverity) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            نجاح
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
            <AlertTriangle className="w-3 h-3 text-sky-600" />
            تحذير
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            خطأ
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            معلومات
          </span>
        );
    }
  };

  const getActionTypeLabel = (type: UserActionType) => {
    switch (type) {
      case 'login': return 'تسجيل دخول';
      case 'logout': return 'تسجيل خروج';
      case 'wishlist_add': return 'إضافة للأمنيات ❤️';
      case 'wishlist_remove': return 'حذف من الأمنيات';
      case 'wishlist_update': return 'تعديل بالأمنيات';
      case 'watchlist_add': return 'مراقبة سعر ⭐';
      case 'watchlist_remove': return 'إلغاء مراقبة';
      case 'price_update': return 'تعديل أسعار ⚡';
      case 'price_alert': return 'تنبيه هبوط سعر 🔔';
      case 'platform_sync': return 'مزامنة منصة 🔄';
      case 'csv_export': return 'تصدير CSV 📊';
      case 'csv_import': return 'استيراد CSV 📥';
      case 'inventory_update': return 'تحديث مخزون 📦';
      case 'product_scan': return 'مسح باركود 📷';
      case 'settings_change': return 'تعديل إعدادات ⚙️';
      case 'system': return 'نظام وتدقيق 🛡️';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-xs">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  سجل نشاط وحركات المستخدمين
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-200">
                    تدقيق فوري (Audit Trail)
                  </span>
                </h1>
                <p className="text-sm text-slate-500">
                  تتبع دقيق لكافة عمليات التجار والمستخدمين: تسجيل الدخول، تعديل الأسعار، قوائم الأمنيات، والمزامنة السحابية
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerTestLog}
              disabled={isGeneratingTestLog}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {isGeneratingTestLog ? 'جاري التسجيل...' : 'تسجيل حركة تجريبية'}
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              تصدير السجل CSV
            </button>
            <button
              onClick={handleClearLogs}
              disabled={isClearing || logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              مسح السجل
            </button>
          </div>
        </div>

        {/* Micro KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="text-xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500 font-medium">إجمالي الحركات</div>
          </div>
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-center">
            <div className="text-xl font-bold text-indigo-700">{stats.todayCount}</div>
            <div className="text-xs text-indigo-600 font-medium">حركات اليوم</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <div className="text-xl font-bold text-emerald-700">{stats.successes}</div>
            <div className="text-xs text-emerald-600 font-medium">عمليات ناجحة</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-center">
            <div className="text-xl font-bold text-sky-700">{stats.warnings}</div>
            <div className="text-xs text-sky-600 font-medium">تنبيهات وتحذيرات</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
            <div className="text-xl font-bold text-rose-700">{stats.errors}</div>
            <div className="text-xs text-rose-600 font-medium">أخطاء مسجلة</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في سجل المستخدمين (اسم المستخدم، عنوان العملية، التفاصيل، المنصة)..."
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>

          {/* Action Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">نوع النشاط:</span>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة العمليات ({logs.length})</option>
              <option value="login">تسجيل الدخول والخروج</option>
              <option value="wishlist">قوائم الأمنيات ❤️</option>
              <option value="price">تعديلات الأسعار والتنبيهات ⚡</option>
              <option value="sync">مزامنة المنصات 🔄</option>
              <option value="export">تصدير واستيراد البيانات 📊</option>
            </select>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">الحالة:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كافة الحالات</option>
              <option value="success">نجاح فقط</option>
              <option value="warning">تحذير فقط</option>
              <option value="error">أخطاء فقط</option>
              <option value="info">معلومات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">لا توجد سجلات نشاط مطابقة</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              لم نتمكن من العثور على أي حركات مسجلة تطابق شروط التصفية أو البحث الحالي.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedActionType('all'); setSelectedSeverity('all'); }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              إعادة تعيين خيارات التصفية
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log, logIdx) => (
              <div
                key={`${log.id || 'act'}-${logIdx}`}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {log.actionTitle}
                      </span>
                      {getStatusBadge(log.status)}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {getActionTypeLabel(log.actionType)}
                      </span>
                      {log.platform && log.platform !== 'web' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          {log.platform}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {log.details}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        {log.userName || log.userEmail || 'مستخدم غير معروف'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(log.createdAt).toLocaleString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      {log.ipAddress && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <Globe className="w-3 h-3" />
                            {log.ipAddress}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setSelectedLogForDetails(log)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                تفاصيل السجل الفني #{selectedLogForDetails.id}
              </h3>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">عنوان العملية:</span>
                  <span className="font-bold text-slate-800">{selectedLogForDetails.actionTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع الحدث:</span>
                  <span className="font-mono text-indigo-600 font-semibold">{selectedLogForDetails.actionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الحالة:</span>
                  <span>{getStatusBadge(selectedLogForDetails.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">التاريخ والوقت:</span>
                  <span className="font-medium text-slate-700">{new Date(selectedLogForDetails.createdAt).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">المستخدم:</span>
                  <span className="font-medium text-slate-800">{selectedLogForDetails.userName || 'تاجر رادار'} ({selectedLogForDetails.userEmail})</span>
                </div>
                {selectedLogForDetails.deviceInfo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">معلومات الجهاز:</span>
                    <span className="text-slate-600 truncate max-w-[220px]">{selectedLogForDetails.deviceInfo}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وصف وتفاصيل العملية:</label>
                <div className="p-3 bg-slate-100 rounded-xl text-slate-800 leading-relaxed font-sans">
                  {selectedLogForDetails.details}
                </div>
              </div>

              {selectedLogForDetails.metadata && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">البيانات الإضافية (Metadata JSON):</label>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto text-left" dir="ltr">
                    {JSON.stringify(selectedLogForDetails.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
