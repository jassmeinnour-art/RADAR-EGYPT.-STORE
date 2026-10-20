import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarPlus, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Download, 
  Package, 
  Truck, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';
import { CustomerOrder, OrderItem } from '../types';
import { 
  generateWaybillGoogleCalendarUrl, 
  generateOrderGoogleCalendarUrl, 
  downloadWaybillIcsFile,
  downloadOrderIcsFile,
  getEventDateRange
} from '../utils/googleCalendarExport';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface WaybillCalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CustomerOrder | null;
  item?: OrderItem | null;
  onShowToast?: (msg: string) => void;
}

export const WaybillCalendarExportModal: React.FC<WaybillCalendarExportModalProps> = ({
  isOpen,
  onClose,
  order,
  item,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<'waybill' | 'order'>(item ? 'waybill' : 'order');
  
  // Customizable dispatch date and time for fine-tuning before generating link
  const [customDate, setCustomDate] = useState<string>(() => {
    if (!order) return new Date().toISOString().split('T')[0];
    const match = order.scheduledDispatchDate.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });

  const [customTimeWindow, setCustomTimeWindow] = useState<string>(() => {
    return item?.dispatchScheduledTime || 'صباحاً (10:00 ص - 01:00 م)';
  });

  if (!isOpen || !order) return null;

  // Build temporary order/item with customized schedule if merchant tweaked them
  const activeOrder: CustomerOrder = {
    ...order,
    scheduledDispatchDate: customDate
  };

  const activeItem: OrderItem | undefined = item ? {
    ...item,
    dispatchScheduledTime: customTimeWindow
  } : order.items[0];

  const calendarUrl = (exportMode === 'waybill' && activeItem)
    ? generateWaybillGoogleCalendarUrl(activeOrder, activeItem)
    : generateOrderGoogleCalendarUrl(activeOrder);

  const { startDate, endDate } = getEventDateRange(customDate, customTimeWindow);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(calendarUrl);
      setCopied(true);
      if (onShowToast) onShowToast('تم نسخ رابط تقويم جوجل بنجاح إلى الحافظة! 📋⚡');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (onShowToast) onShowToast('تعذر النسخ التلقائي، يمكنك فتح الرابط مباشرة');
    }
  };

  const handleOpenGoogleCalendar = () => {
    if (onShowToast) onShowToast('جاري فتح صفحة إضافة الحدث في تقويم جوجل... 📅');
    safeOpenUrl(calendarUrl);
  };

  const handleDownloadIcs = () => {
    if (exportMode === 'order' || !activeItem) {
      downloadOrderIcsFile(activeOrder);
      if (onShowToast) onShowToast('تم تنزيل ملف التقويم (.ics) للطلب كاملاً بنجاح 📅');
    } else {
      downloadWaybillIcsFile(activeOrder, activeItem);
      if (onShowToast) onShowToast(`تم تنزيل ملف التقويم (.ics) لشحنة ${activeItem.waybillNumber} بنجاح 📅`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `موعد شحن وتسليم الشحنة:\n• البوليصة: ${activeItem?.waybillNumber || activeOrder.orderNumber}\n• شركة الشحن: ${activeItem?.courierName || 'شركة الشحن'}\n• العميل: ${activeOrder.customerName}\n• العنوان: ${activeOrder.governorate} - ${activeOrder.fullAddress}\n• الموعد المجدول: ${customDate} (${customTimeWindow})\n\nرابط إضافة الحدث لتقويم جوجل:\n${calendarUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    safeOpenUrl(waUrl);
    if (onShowToast) onShowToast('تم فتح واتساب لمشاركة تفاصيل الموعد ورابط التقويم 💬');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      id="modal-google-calendar-export"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6 text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              تصدير الموعد إلى تقويم جوجل (Google Calendar)
            </h3>
            <p className="text-xs text-slate-500 font-['Alexandria']">
              توليد رابط مباشر لحفظ وتذكير مواعيد بوالص الشحن والتسليم لشركات النقل والعملاء
            </p>
          </div>
        </div>

        {/* Mode Selector (Single Waybill vs Full Order) */}
        {order.items.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold font-['Alexandria']">
            <button
              type="button"
              onClick={() => setExportMode('waybill')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exportMode === 'waybill'
                  ? 'bg-white text-indigo-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>بوليصة الصنف الفردية ({activeItem?.waybillNumber})</span>
            </button>
            <button
              type="button"
              onClick={() => setExportMode('order')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exportMode === 'order'
                  ? 'bg-white text-indigo-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>الطلب كاملاً ({order.orderNumber} - {order.items.length} بوالص)</span>
            </button>
          </div>
        )}

        {/* Event Details Summary Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 mb-4 font-['Alexandria'] text-xs">
          <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-2.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">عنوان الحدث بـ Google Calendar:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {exportMode === 'waybill' && activeItem ? (
                  <>تسليم شحنة: {activeItem.waybillNumber} • {activeItem.productTitle}</>
                ) : (
                  <>تسليم طلب كامل: {activeOrder.orderNumber} • {activeOrder.customerName}</>
                )}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold shrink-0">
              {activeItem?.courierName || 'شحن سريع'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>تاريخ الموعد: <strong className="text-slate-900">{customDate}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>نافذة الوقت: <strong className="text-slate-900">{customTimeWindow}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="line-clamp-1">الموقع: <strong>{activeOrder.governorate}</strong> - {activeOrder.fullAddress}</span>
            </div>
          </div>

          {/* Quick Date and Time editor */}
          <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">
                تعديل تاريخ الحدث بالتقويم:
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">
                تعديل فترة التسليم بالتقويم:
              </label>
              <select
                value={customTimeWindow}
                onChange={(e) => setCustomTimeWindow(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-['Alexandria'] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="صباحاً (10:00 ص - 01:00 م)">صباحاً (10:00 ص - 01:00 م) - استلام باكر</option>
                <option value="ظهراً (01:00 م - 04:00 م)">ظهراً (01:00 م - 04:00 م) - تسليم معتاد</option>
                <option value="مساءً (04:00 م - 07:00 م)">مساءً (04:00 م - 07:00 م) - تسليم مسائي</option>
                <option value="طوال اليوم (09:00 ص - 06:00 م)">طوال يوم العمل (09:00 ص - 06:00 م)</option>
              </select>
            </div>
          </div>
        </div>

        {/* URL Preview Box */}
        <div className="space-y-1.5 mb-5 font-['Alexandria']">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              رابط تقويم جوجل المولد تلقائياً:
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
              جاهز للإضافة بنقرة واحدة
            </span>
          </div>
          
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-left font-mono text-[11px] text-slate-600 truncate dir-ltr select-all">
            {calendarUrl}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          {/* Main Direct Google Calendar Link */}
          <button
            type="button"
            onClick={handleOpenGoogleCalendar}
            id="btn-open-google-calendar-direct"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold font-['Alexandria'] text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>فتح في تقويم جوجل مباشرة (Open in Google Calendar)</span>
            <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-['Alexandria'] text-xs font-bold">
            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              id="btn-copy-calendar-link"
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>

            {/* Share WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              id="btn-share-whatsapp-calendar"
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>واتساب السائق/العميل</span>
            </button>

            {/* Download .ICS */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              id="btn-download-ics-calendar"
              className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>تنزيل ملف .ICS</span>
            </button>
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="mt-4 p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center gap-2 text-[11px] text-sky-800 font-['Alexandria']">
          <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>
            عند الضغط على فتح الرابط، سيتم توجيهك إلى Google Calendar ببيانات البوليصة والعميل والعنوان وقيمة التحصيل مسبقة التعبئة.
          </span>
        </div>
      </div>
    </div>
  );
};
