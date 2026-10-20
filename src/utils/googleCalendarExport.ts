import { CustomerOrder, OrderItem } from '../types';

export interface CalendarEventDetails {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  details: string;
  url?: string;
}

/**
 * Helper to zero-pad numbers to 2 digits.
 */
function pad2(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Formats a JavaScript Date object into Google Calendar UTC format: YYYYMMDDTHHmmssZ
 */
export function formatToGoogleCalendarUtc(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`;
}

/**
 * Robust date parser that extracts year, month, and day from various string formats
 * such as "2026-08-27 (غداً)", "2026-09-18", "اليوم", or ISO strings.
 */
export function parseDispatchDate(dateStr: string): { year: number; month: number; day: number } {
  const now = new Date();
  
  if (!dateStr || typeof dateStr !== 'string') {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  // Check for ISO or YYYY-MM-DD pattern
  const match = dateStr.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    return { year, month, day };
  }

  // Check for keywords like "غداً" (tomorrow)
  if (dateStr.includes('غداً') || dateStr.includes('غدا')) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return { year: tomorrow.getFullYear(), month: tomorrow.getMonth() + 1, day: tomorrow.getDate() };
  }

  // Default to today
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/**
 * Extracts start and end hours/minutes from time string or window
 * Examples: "10:00 - 13:00", "صباحاً (10:00 ص - 01:00 م)", etc.
 */
export function parseDispatchTimeWindow(timeStr?: string): { startHour: number; startMinute: number; endHour: number; endMinute: number } {
  if (!timeStr) {
    return { startHour: 10, startMinute: 0, endHour: 13, endMinute: 0 };
  }

  // If contains morning / evening labels
  if (timeStr.includes('مساءً') || timeStr.includes('04:00 م') || timeStr.includes('16:00')) {
    return { startHour: 16, startMinute: 0, endHour: 19, endMinute: 0 };
  }
  if (timeStr.includes('ظهراً') || timeStr.includes('01:00 م') || timeStr.includes('13:00')) {
    return { startHour: 13, startMinute: 0, endHour: 16, endMinute: 0 };
  }
  if (timeStr.includes('طوال اليوم') || timeStr.includes('09:00 - 18:00')) {
    return { startHour: 9, startMinute: 0, endHour: 18, endMinute: 0 };
  }

  // Match 24h or simple HH:MM
  const matches = timeStr.match(/(\d{1,2}):(\d{2})/g);
  if (matches && matches.length >= 2) {
    const [h1, m1] = matches[0].split(':').map(Number);
    const [h2, m2] = matches[1].split(':').map(Number);
    return { startHour: h1, startMinute: m1, endHour: h2, endMinute: m2 };
  }

  // Default to 10:00 - 13:00
  return { startHour: 10, startMinute: 0, endHour: 13, endMinute: 0 };
}

/**
 * Creates JavaScript Date objects from order scheduled date and item/order time window
 */
export function getEventDateRange(dateStr: string, timeStr?: string): { startDate: Date; endDate: Date } {
  const { year, month, day } = parseDispatchDate(dateStr);
  const { startHour, startMinute, endHour, endMinute } = parseDispatchTimeWindow(timeStr);

  const startDate = new Date(year, month - 1, day, startHour, startMinute, 0);
  const endDate = new Date(year, month - 1, day, endHour, endMinute, 0);

  // Safety fallback if end is before start
  if (endDate.getTime() <= startDate.getTime()) {
    endDate.setHours(startDate.getHours() + 2);
  }

  return { startDate, endDate };
}

/**
 * Builds Google Calendar event creation URL for a single Waybill Item
 */
export function generateWaybillGoogleCalendarUrl(order: CustomerOrder, item: OrderItem): string {
  const { startDate, endDate } = getEventDateRange(
    order.scheduledDispatchDate, 
    item.dispatchScheduledTime
  );

  const title = `تسليم شحنة: ${item.waybillNumber} • ${item.productTitle} (${item.courierName})`;

  const datesParam = `${formatToGoogleCalendarUtc(startDate)}/${formatToGoogleCalendarUtc(endDate)}`;

  const codText = order.isPaid 
    ? '0 ج.م (خالص الدفع مسبقاً)' 
    : `${item.totalPrice.toLocaleString('ar-EG')} ج.م`;

  const details = [
    `📦 بوليصة شحن مجدولة للمنتج (Waybill Dispatch Appointment)`,
    `═════════════════════════════════════`,
    `• رقم البوليصة المستقلة: ${item.waybillNumber}`,
    `• الباركود: ${item.barcode}`,
    `• شركة الشحن: ${item.courierName}`,
    `• كود الطلب الرئيسي: ${order.orderNumber}`,
    `• منصة البيع المصدر: ${order.platformSourceName}`,
    ``,
    `👤 بيانات العميل والمستلم:`,
    `• الاسم: ${order.customerName}`,
    `• الهاتف: ${order.customerPhone}`,
    `• المحافظة والعنوان: محافظة ${order.governorate} - ${order.fullAddress}`,
    ``,
    `🏷️ تفاصيل الصنف المشحون:`,
    `• اسم المنتج: ${item.productTitle}`,
    `• كود SKU: ${item.sku}`,
    `• الكمية المطلوبة: ${item.quantity} قطعة`,
    `• الوزن التقديري: ${item.weightKg} كجم`,
    `• موقع المستودع: ${item.warehouseLocation}`,
    ``,
    `💰 التحصيل المالي (COD):`,
    `• القيمة المطلوب تحصيلها للصنف: ${codText}`,
    `• طريقة الدفع: ${order.paymentMethod === 'cod' ? 'دفع عند الاستلام' : order.paymentMethod}`,
    ``,
    `⏰ موعد التسليم: ${order.scheduledDispatchDate} | ${item.dispatchScheduledTime || 'صباحاً (10:00 ص - 01:00 م)'}`,
    `ملاحظات: ${item.notes || order.notes || 'لا توجد ملاحظات إضافية'}`,
    ``,
    `تم التوليد تلقائياً عبر نظام رادار التجار وإدارة بوالص الشحن ⚡`
  ].join('\n');

  const location = `${order.governorate}، ${order.fullAddress} (هاتف العميل: ${order.customerPhone})`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details: details,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Builds Google Calendar event creation URL for an Entire Order (all waybills together)
 */
export function generateOrderGoogleCalendarUrl(order: CustomerOrder): string {
  const { startDate, endDate } = getEventDateRange(order.scheduledDispatchDate);

  const title = `تسليم طلب كامل: ${order.orderNumber} • ${order.customerName} (${order.governorate})`;
  const datesParam = `${formatToGoogleCalendarUtc(startDate)}/${formatToGoogleCalendarUtc(endDate)}`;

  const itemsSummary = order.items.map((item, idx) => 
    `  ${idx + 1}. ${item.productTitle} (بوليصة: ${item.waybillNumber} - ${item.courierName}) - ${item.totalPrice.toLocaleString('ar-EG')} ج.م`
  ).join('\n');

  const details = [
    `📋 تفاصيل تسليم الطلب المجدول (Multi-Item Order Dispatch)`,
    `═════════════════════════════════════`,
    `• رقم الطلب: ${order.orderNumber}`,
    `• عدد البوالص المنفصلة: ${order.items.length} بوليصة مستقلة`,
    `• منصة البيع: ${order.platformSourceName}`,
    `• إجمالي قيمة الطلب: ${order.grandTotalEGP.toLocaleString('ar-EG')} ج.م`,
    `• حالة الدفع: ${order.isPaid ? 'خالص الدفع مسبقاً' : 'دفع عند الاستلام (COD)'}`,
    ``,
    `👤 بيانات العميل:`,
    `• الاسم: ${order.customerName}`,
    `• الهاتف: ${order.customerPhone}`,
    `• العنوان: محافظة ${order.governorate} - ${order.fullAddress}`,
    ``,
    `📦 بوالص الشحن والأصناف المضمنة:`,
    itemsSummary,
    ``,
    `⏰ موعد التسليم: ${order.scheduledDispatchDate}`,
    `ملاحظات: ${order.notes || 'لا توجد ملاحظات'}`,
    ``,
    `تم التوليد تلقائياً عبر نظام رادار التجار وإدارة بوالص الشحن ⚡`
  ].join('\n');

  const location = `${order.governorate}، ${order.fullAddress} (هاتف العميل: ${order.customerPhone})`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details: details,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Formats a Date to iCalendar UTC string: YYYYMMDDTHHmmssZ
 */
function toIcsUtc(date: Date): string {
  return formatToGoogleCalendarUtc(date);
}

/**
 * Builds comprehensive textual shipping and order details for .ics description
 */
export function buildShipmentIcsDetails(order: CustomerOrder, item: OrderItem): string {
  const codText = order.isPaid 
    ? '0 ج.م (خالص الدفع مسبقاً)' 
    : `${item.totalPrice.toLocaleString('ar-EG')} ج.م`;

  return [
    `📦 تفاصيل شحنة وبوليصة التسليم (Shipment Waybill Delivery):`,
    `----------------------------------------`,
    `• رقم البوليصة المستقلة: ${item.waybillNumber}`,
    `• الباركود: ${item.barcode}`,
    `• شركة الشحن: ${item.courierName}`,
    `• كود الطلب المرجعي: ${order.orderNumber}`,
    `• منصة البيع: ${order.platformSourceName}`,
    ``,
    `👤 بيانات المستلم والعميل:`,
    `• اسم العميل: ${order.customerName}`,
    `• رقم الهاتف: ${order.customerPhone}`,
    `• العنوان بالتفصيل: محافظة ${order.governorate} - ${order.fullAddress}`,
    ``,
    `🏷️ تفاصيل الصنف المشحون:`,
    `• المنتج: ${item.productTitle}`,
    `• كود SKU: ${item.sku}`,
    `• الكمية: ${item.quantity} قطعة`,
    `• الوزن التقديري: ${item.weightKg} كجم`,
    `• موقع المستودع: ${item.warehouseLocation}`,
    ``,
    `💰 التحصيل المالي والدفع:`,
    `• قيمة التحصيل المطلوب (COD): ${codText}`,
    `• طريقة الدفع: ${order.paymentMethod === 'cod' ? 'دفع عند الاستلام' : order.paymentMethod}`,
    ``,
    `⏰ موعد التسليم المجدول: ${order.scheduledDispatchDate}`,
    `• فترة وقت التسليم: ${item.dispatchScheduledTime || 'صباحاً (10:00 ص - 01:00 م)'}`,
    `• ملاحظات الشحن: ${item.notes || order.notes || 'لا توجد ملاحظات إضافية'}`,
    ``,
    `تم التوليد تلقائياً عبر نظام رادار التجار وإدارة بوالص الشحن ⚡`
  ].join('\n');
}

/**
 * Generates an iCalendar (.ics) file string for offline or multi-calendar import (Apple, Outlook, Google)
 */
export function generateIcsContent(
  title: string,
  startDate: Date,
  endDate: Date,
  description: string,
  location: string
): string {
  const uid = `waybill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@merchantradar.eg`;
  // Escape for iCalendar format: newlines as \n, commas and semicolons as \, and \;
  const cleanDesc = description
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
  const cleanTitle = title.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const cleanLocation = location.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MerchantRadar Egypt//Waybill Logistics Hub//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(startDate)}`,
    `DTEND:${toIcsUtc(endDate)}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLocation}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:تذكير بموعد تسليم بوليصة الشحن',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers a browser download for the .ics calendar file configured with date, time, and shipping details
 */
export function downloadWaybillIcsFile(order: CustomerOrder, item: OrderItem): void {
  const { startDate, endDate } = getEventDateRange(
    order.scheduledDispatchDate, 
    item.dispatchScheduledTime
  );

  const title = `تسليم شحنة ${item.waybillNumber} - ${item.productTitle} (${item.courierName})`;
  const location = `محافظة ${order.governorate}، ${order.fullAddress} - هاتف: ${order.customerPhone}`;
  const description = buildShipmentIcsDetails(order, item);

  const icsText = generateIcsContent(title, startDate, endDate, description, location);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `shipment-${item.waybillNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser download for all shipments in an order as a single .ics file
 */
export function downloadOrderIcsFile(order: CustomerOrder): void {
  const { startDate, endDate } = getEventDateRange(order.scheduledDispatchDate);
  const title = `تسليم طلب كامل: ${order.orderNumber} - ${order.customerName} (${order.items.length} شحنات)`;
  const location = `محافظة ${order.governorate}، ${order.fullAddress} - هاتف: ${order.customerPhone}`;
  
  const itemsText = order.items.map((it, idx) => 
    `  ${idx + 1}. [بوليصة: ${it.waybillNumber}] ${it.productTitle} (${it.courierName}) - ${it.quantity}x`
  ).join('\n');

  const description = [
    `📋 تفاصيل تسليم الطلب المجدول (Multi-Shipment Order):`,
    `• كود الطلب: ${order.orderNumber}`,
    `• عدد الشحنات والبوالص: ${order.items.length} شحنات`,
    `• العميل: ${order.customerName} (${order.customerPhone})`,
    `• العنوان: ${order.governorate} - ${order.fullAddress}`,
    `• إجمالي التحصيل: ${order.isPaid ? 'خالص مسبقاً' : `${order.grandTotalEGP} ج.م`}`,
    `• موعد التسليم: ${order.scheduledDispatchDate}`,
    ``,
    `📦 الشحنات المضمنة:`,
    itemsText
  ].join('\n');

  const icsText = generateIcsContent(title, startDate, endDate, description, location);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `order-${order.orderNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
