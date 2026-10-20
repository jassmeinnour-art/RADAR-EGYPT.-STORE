import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  Unlock, 
  FileText, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Sparkles, 
  Zap, 
  Layers, 
  UserCheck, 
  Briefcase, 
  Phone, 
  Mail, 
  Printer, 
  Save, 
  Clock, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { MerchantPermissionConfig, MarketerAuditLog } from '../types';
import { INITIAL_MERCHANTS_PERMISSIONS, INITIAL_MARKETER_AUDIT_LOGS } from '../data/marketerManagerData';

interface MarketerRbacAndAuditHubProps {
  onShowToast?: (msg: string) => void;
}

export const MarketerRbacAndAuditHub: React.FC<MarketerRbacAndAuditHubProps> = ({
  onShowToast
}) => {
  const [permissions, setPermissions] = useState<MerchantPermissionConfig[]>(INITIAL_MERCHANTS_PERMISSIONS);
  const [auditLogs, setAuditLogs] = useState<MarketerAuditLog[]>(INITIAL_MARKETER_AUDIT_LOGS);
  const [activeSubTab, setActiveSubTab] = useState<'permissions_matrix' | 'audit_timeline'>('permissions_matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Handle Toggle Permission
  const handleTogglePermission = (
    merchantId: string, 
    field: keyof MerchantPermissionConfig
  ) => {
    setPermissions(prev => prev.map(p => {
      if (p.merchantId === merchantId) {
        const updated = { ...p, [field]: !p[field] };
        
        // If isViewOnly turned ON, auto turn off editing
        if (field === 'isViewOnly' && updated.isViewOnly) {
          updated.canEditPrices = false;
          updated.canApplyAutoRepricing = false;
          updated.canModifyInventoryCost = false;
          updated.canManageIntegrations = false;
          updated.accessTier = 'client_view_only';
        } else if (field === 'canEditPrices' && updated.canEditPrices) {
          updated.isViewOnly = false;
        }

        // Add audit log for this permission modification
        const targetMerch = p.merchantName;
        const newLog: MarketerAuditLog = {
          id: `log-${Date.now()}`,
          timestamp: 'اليوم (الآن)',
          actorName: 'أ/ سامح الشناوي (المسوق المسؤول)',
          actorRole: 'مسوق مسؤول عن بُعد',
          merchantName: targetMerch,
          actionCategory: 'permissions',
          actionTitle: `تعديل صلاحية (${String(field)}) للتاجر`,
          actionDetails: `تم تغيير حالة الصلاحية ${String(field)} إلى ${updated[field] ? 'مفعلة' : 'معطلة'}`,
          previousValue: p[field] ? 'مفعلة' : 'معطلة',
          newValue: updated[field] ? 'مفعلة' : 'معطلة',
          severity: 'info'
        };

        setAuditLogs(prevLogs => [newLog, ...prevLogs]);

        if (onShowToast) {
          onShowToast(`تم تحديث صلاحية (${String(field)}) لمتجر "${targetMerch}" وتسجيلها في سجل النشاط`);
        }

        return updated;
      }
      return p;
    }));
  };

  // Quick preset application
  const handleApplyPreset = (merchantId: string, tier: 'vip_full_managed' | 'hybrid_collaborative' | 'client_view_only') => {
    setPermissions(prev => prev.map(p => {
      if (p.merchantId === merchantId) {
        let updated: MerchantPermissionConfig;
        if (tier === 'client_view_only') {
          updated = {
            ...p,
            accessTier: 'client_view_only',
            canEditPrices: false,
            canApplyAutoRepricing: false,
            canGenerateWaybills: true,
            canModifyInventoryCost: false,
            canExportReports: true,
            canManageIntegrations: false,
            isViewOnly: true
          };
        } else if (tier === 'hybrid_collaborative') {
          updated = {
            ...p,
            accessTier: 'hybrid_collaborative',
            canEditPrices: true,
            canApplyAutoRepricing: true,
            canGenerateWaybills: true,
            canModifyInventoryCost: false,
            canExportReports: true,
            canManageIntegrations: true,
            isViewOnly: false
          };
        } else {
          updated = {
            ...p,
            accessTier: 'vip_full_managed',
            canEditPrices: true,
            canApplyAutoRepricing: true,
            canGenerateWaybills: true,
            canModifyInventoryCost: true,
            canExportReports: true,
            canManageIntegrations: true,
            isViewOnly: false
          };
        }

        if (onShowToast) {
          onShowToast(`تم تطبيق نموذج صلاحيات "${tier === 'client_view_only' ? 'الاطلاع والتقارير فقط' : tier === 'hybrid_collaborative' ? 'التعاون المشترك' : 'الإدارة الكاملة VIP'}" بنجاح`);
        }
        return updated;
      }
      return p;
    }));
  };

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionDetails.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && log.actionCategory !== categoryFilter) return false;
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6" id="marketer-rbac-audit-hub">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              مركز التحكم والقيادة للمسوق المسؤول عن بُعد (RBAC & Audit Engine)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-['Alexandria'] text-white">
              إدارة صلاحيات التجار وسجل الأنشطة والعمليات الرقابية
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              تحكم كامل في مستوى وصول كل تاجر (حظر تعديل الأسعار، الاكتفاء بالاطلاع على التقارير، السماح بطباعة البوالص)، مع <strong>سجل تدقيق وتتبع زمني غير قابل للتعديل</strong> يوثق أي تغيير سعري أو تشغيلي.
            </p>
          </div>

          {/* Sub Navigation Pills */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveSubTab('permissions_matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'permissions_matrix'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Key className="w-4 h-4" />
              مصفوفة الصلاحيات (RBAC)
            </button>
            <button
              onClick={() => setActiveSubTab('audit_timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'audit_timeline'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              سجل التدقيق والعمليات ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Marketer Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/50">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">التجار تحت الإدارة</span>
            <div className="text-xl font-bold text-white font-mono">{permissions.length} متاجر</div>
            <span className="text-[10px] text-indigo-300">عقود تسويق ومتابعة حية</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">تجار بوضع الاطلاع فقط (View Only)</span>
            <div className="text-xl font-bold text-sky-300 font-mono">
              {permissions.filter(p => p.isViewOnly).length} متاجر
            </div>
            <span className="text-[10px] text-sky-300">المسوق يتحكم بقرارات التسعير</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">حماية رأس المال من الحرق</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">100% نشط</div>
            <span className="text-[10px] text-emerald-300">حدود حماية مفعلة</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">إجمالي العمليات المسجلة</span>
            <div className="text-xl font-bold text-indigo-300 font-mono">{auditLogs.length} حركة</div>
            <span className="text-[10px] text-indigo-200">سجل تدقيق كامل</span>
          </div>
        </div>
      </div>

      {/* Subtab 1: Permissions Matrix (نظام الصلاحيات المتقدم) */}
      {activeSubTab === 'permissions_matrix' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                تخصيص صلاحيات التجار بواسطة المسوق المسؤول
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                حدد بدقة ما يمكن لكل تاجر القيام به: تعديل الأسعار، تشغيل التسعير الآلي، طباعة البوالص، أو الاكتفاء بالاطلاع على التقارير لمنع التخبط السعري
              </p>
            </div>
          </div>

          {/* Permissions Table / Cards */}
          <div className="space-y-4">
            {permissions.map((perm) => (
              <div
                key={perm.merchantId}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-4"
              >
                {/* Merchant Header & Tier Preset */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-sm font-['Alexandria']">
                        {perm.merchantName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        perm.isViewOnly
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : perm.accessTier === 'vip_full_managed'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {perm.isViewOnly ? '👁️ وضع الاطلاع والتقارير فقط' : perm.accessTier === 'vip_full_managed' ? '👑 إدارة كاملة VIP' : '🤝 تعاون مشترك'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      المسوق المعين: <strong className="text-indigo-700">{perm.assignedMarketerName}</strong>
                    </span>
                  </div>

                  {/* Preset Fast Actions */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">نماذج سريعة:</span>
                    <button
                      onClick={() => handleApplyPreset(perm.merchantId, 'client_view_only')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 transition cursor-pointer"
                    >
                      اطلاع فقط 🔒
                    </button>
                    <button
                      onClick={() => handleApplyPreset(perm.merchantId, 'hybrid_collaborative')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      مشترك ⚖️
                    </button>
                    <button
                      onClick={() => handleApplyPreset(perm.merchantId, 'vip_full_managed')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition cursor-pointer"
                    >
                      كامل 🚀
                    </button>
                  </div>
                </div>

                {/* Granular Permission Toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {/* Toggle 1: View Only */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'isViewOnly')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.isViewOnly
                        ? 'bg-sky-50/80 border-sky-300 text-sky-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      وضع الاطلاع فقط
                      {perm.isViewOnly ? <Lock className="w-3.5 h-3.5 text-sky-700" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2">
                      {perm.isViewOnly ? '✓ مقفل على الرؤية' : 'تعديل مسموح'}
                    </span>
                  </div>

                  {/* Toggle 2: Edit Prices */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'canEditPrices')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.canEditPrices
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      تعديل الأسعار
                      {perm.canEditPrices ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] mt-2">
                      {perm.canEditPrices ? 'مسموح للتاجر' : 'حظر (المسوق فقط)'}
                    </span>
                  </div>

                  {/* Toggle 3: Auto Repricing */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'canApplyAutoRepricing')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.canApplyAutoRepricing
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      التسعير الآلي الذكي
                      {perm.canApplyAutoRepricing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] mt-2">
                      {perm.canApplyAutoRepricing ? 'متاح التشغيل' : 'محظور'}
                    </span>
                  </div>

                  {/* Toggle 4: Generate Waybills */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'canGenerateWaybills')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.canGenerateWaybills
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      طباعة بوالص الشحن
                      {perm.canGenerateWaybills ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] mt-2">
                      {perm.canGenerateWaybills ? 'متاح للطلب والتسليم' : 'معطل'}
                    </span>
                  </div>

                  {/* Toggle 5: Modify Cost */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'canModifyInventoryCost')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.canModifyInventoryCost
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      تعديل سعر الجملة
                      {perm.canModifyInventoryCost ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] mt-2">
                      {perm.canModifyInventoryCost ? 'مسموح' : 'محظور (المسوق فقط)'}
                    </span>
                  </div>

                  {/* Toggle 6: Export Reports */}
                  <div 
                    onClick={() => handleTogglePermission(perm.merchantId, 'canExportReports')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      perm.canExportReports
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      تصدير التقارير
                      {perm.canExportReports ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    </span>
                    <span className="text-[10px] mt-2">
                      {perm.canExportReports ? 'متاح PDF/Excel' : 'معطل'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Audit Timeline & Logs (سجل النشاط المفصل) */}
      {activeSubTab === 'audit_timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                سجل النشاط والعمليات الرقابية المفصل (Detailed Audit Trail)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                توثيق كامل لكل عملية قام بها التاجر أو المسوق المسؤول أو النظام التلقائي مع القيمة السابقة والجديدة والطابع الزمني
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في السجل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">كل التصنيفات</option>
                <option value="pricing">تسعير وحماية</option>
                <option value="permissions">صلاحيات</option>
                <option value="waybills">بوالص وشحن</option>
                <option value="reports">تقارير دورية</option>
              </select>
            </div>
          </div>

          {/* Timeline list */}
          <div className="space-y-3">
            {filteredAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/40 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.severity === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      log.severity === 'warning' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      log.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {log.actionCategory === 'pricing' ? '💰 تسعير' : log.actionCategory === 'permissions' ? '🛡️ صلاحيات' : log.actionCategory === 'waybill_shipping' ? '🚚 بوليصة' : '📊 تقرير'}
                    </span>

                    <h4 className="text-xs font-bold text-slate-900 font-['Alexandria']">
                      {log.actionTitle}
                    </h4>

                    <span className="text-xs text-slate-500 font-medium">
                      • متجر: <strong className="text-slate-800">{log.merchantName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {log.actionDetails}
                </p>

                {/* Actor & Value Change Badges */}
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">المنفذ:</span>
                    <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-[11px]">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </div>

                  {log.previousValue && log.newValue && (
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-400 line-through">{log.previousValue}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {log.newValue}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
