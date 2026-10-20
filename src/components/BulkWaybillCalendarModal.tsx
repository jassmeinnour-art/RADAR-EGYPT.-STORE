import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarPlus, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Download, 
  Package, 
  Truck, 
  X, 
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CustomerOrder, OrderItem } from '../types';
import { 
  generateWaybillGoogleCalendarUrl, 
  generateOrderGoogleCalendarUrl,
  generateIcsContent,
  downloadWaybillIcsFile,
  getEventDateRange
} from '../utils/googleCalendarExport';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface BulkWaybillCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  onShowToast?: (msg: string) => void;
}

export const BulkWaybillCalendarModal: React.FC<BulkWaybillCalendarModalProps> = ({
  isOpen,
  onClose,
  orders,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Flatten all waybill items across orders
  const allWaybillItems: { order: CustomerOrder; item: OrderItem }[] = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      allWaybillItems.push({ order, item });
    });
  });

  const filteredItems = allWaybillItems.filter(({ order, item }) => {
    const matchesSearch = 
      item.waybillNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.governorate.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCourier !== 'all' && item.courierId !== selectedCourier) return false;
    return true;
  });

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      if (onShowToast) onShowToast('تم نسخ رابط تقويم جوجل للحدث بنجاح! 📋⚡');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      if (onShowToast) onShowToast('تعذر النسخ التلقائي');
    }
  };

  const handleOpenGoogleCal = (url: string) => {
    if (onShowToast) onShowToast('جاري فتح صفحة الحدث في تقويم جوجل... 📅');
    safeOpenUrl(url);
  };

  // Download a single multi-event ICS file containing all filtered waybills
  const handleDownloadCombinedIcs = () => {
    if (filteredItems.length === 0) {
      if (onShowToast) onShowToast('لا توجد بوالص مطابقة لتصديرها');
      return;
    }

    const eventsIcsBlocks: string[] = [];
    filteredItems.forEach(({ order, item }) => {
      const { startDate, endDate } = getEventDateRange(order.scheduledDispatchDate, item.dispatchScheduledTime);
      const title = `تسليم شحنة ${item.waybillNumber} - ${item.productTitle}`;
      const location = `${order.governorate} - ${order.fullAddress}`;
      const desc = `بوليصة: ${item.waybillNumber} | شركة: ${item.courierName} | عميل: ${order.customerName} (${order.customerPhone}) | تحصيل: ${order.isPaid ? 'خالص' : `${item.totalPrice} ج.م`}`;
      
      const singleIcs = generateIcsContent(title, startDate, endDate, desc, location);
      // Extract the VEVENT block
      const vEventMatch = singleIcs.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
      if (vEventMatch) {
        eventsIcsBlocks.push(vEventMatch[0]);
      }
    });

    const combinedIcs = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MerchantRadar Egypt//Multi-Waybills Logistics//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...eventsIcsBlocks,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([combinedIcs], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `all-waybills-calendar-${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) onShowToast(`تم تصدير ملف التقويم المجمع (${filteredItems.length} بوليصة) بنجاح! 📁📅`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      id="modal-bulk-waybill-calendar"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative my-6 text-right max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 font-['Alexandria'] flex items-center gap-2">
              جدول مواعيد شحن البوالص وتقويم جوجل المجمع
            </h3>
            <p className="text-xs text-slate-500 font-['Alexandria']">
              روابط Google Calendar الفورية لكافة البوالص المنفصلة لتنسيق مواعيد مندوبي الشحن والاستلام
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Filter & Bulk Export */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shrink-0 font-['Alexandria']">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم البوليصة أو المنتج أو العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
            >
              <option value="all">كل شركات الشحن</option>
              <option value="bosta_eg">بوسطة للشحن</option>
              <option value="aramex_eg">أرامكس مصر</option>
              <option value="noon_express_ship">نون إكسبريس</option>
              <option value="egypt_post_express">البريد السريع</option>
              <option value="oto_delivery">أوتو سمارت</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleDownloadCombinedIcs}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
            title="تنزيل ملف .ics يحتوي على جميع مواعيد البوالص لإضافتها دفعة واحدة"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل ملف تقويم مجمع (.ics)</span>
          </button>
        </div>

        {/* Waybills List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-['Alexandria']">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">لا توجد بوالص شحن مطابقة لخيارات الفرز</p>
            </div>
          ) : (
            filteredItems.map(({ order, item }) => {
              const url = generateWaybillGoogleCalendarUrl(order, item);
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  {/* Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {item.waybillNumber}
                      </span>
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {item.productTitle}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        {item.courierName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span>العميل: <strong className="text-slate-800">{order.customerName}</strong> ({order.governorate})</span>
                      <span>•</span>
                      <span>موعد التسليم: <strong className="text-indigo-700">{order.scheduledDispatchDate}</strong></span>
                      <span>•</span>
                      <span>الوقت: <strong>{item.dispatchScheduledTime || '10:00 ص - 01:00 م'}</strong></span>
                      <span>•</span>
                      <span>تحصيل: <strong>{order.isPaid ? 'خالص' : `${item.totalPrice} ج.م`}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        downloadWaybillIcsFile(order, item);
                        if (onShowToast) onShowToast(`تم تنزيل ملف التقويم (.ics) لشحنة ${item.waybillNumber} 📅`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs select-none"
                      title="Add to Calendar - تنزيل ملف .ics لهذه الشحنة"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Add to Calendar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenGoogleCal(url)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-2xs"
                      title="فتح رابط إضافة الحدث في تقويم جوجل"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>تقويم جوجل</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, url)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95 cursor-pointer"
                      title="نسخ رابط حدث التقويم"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-['Alexandria'] shrink-0">
          <span>إجمالي البوالص المتاحة: <strong>{filteredItems.length}</strong> بوليصة</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
