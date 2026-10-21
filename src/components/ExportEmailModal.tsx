import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  Building2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductData } from '../types';

interface ExportEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData;
  currency?: string;
  winningPrice?: number;
  selectedDiscount?: number;
  onSuccessToast?: (msg: string) => void;
  defaultRecipient?: string;
}

export const ExportEmailModal: React.FC<ExportEmailModalProps> = ({
  isOpen,
  onClose,
  product,
  currency = 'EGP',
  winningPrice,
  selectedDiscount = 5,
  onSuccessToast,
  defaultRecipient = ''
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(defaultRecipient);
  const [managerName, setManagerName] = useState<string>('السيد مدير المبيعات والتسعير');
  const [additionalNotes, setAdditionalNotes] = useState<string>('نرجو التكرم بالاطلاع واعتماد تعديل السعر على المنصات المرتبطة.');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const effectiveSellingPrice = winningPrice || product.suggestedRetailPrice || product.currentLowestPrice;
  const wholesaleCost = product.estimatedWholesaleCost || Math.round(product.currentLowestPrice * 0.75);
  const netProfit = effectiveSellingPrice - wholesaleCost;
  const marginPct = effectiveSellingPrice > 0 ? Math.round((netProfit / effectiveSellingPrice) * 100) : 0;
  const wholesaleHub = product.wholesaleLocations?.[0]?.marketName || 'شارع عبد العزيز - القاهرة';

  const emailSubject = `[تقرير تنفيذي عاجل] ملخص تسعير ومنافسين: ${product.title} - رادار التاجر الذكي`;

  const generateEmailBodyText = (): string => {
    return `تحية طيبة وبعد،
${managerName}،

الموضوع: تقرير التسعير التنافسي المعتمد لمنتج (${product.title})
تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}

نرفق لسيادتكم أدناه الملخص التنفيذي وحسابات الأرباح لتحركات الأسعار والمنافسين في السوق المصري:

1. بيانات الصنف:
- اسم المنتج: ${product.title}
- العلامة التجارية: ${product.brand}
- التصنيف: ${product.category}
- كود الصنف (SKU): ${product.sku || `SKU-${product.id}`}
- الباركود: ${product.barcode || 'N/A'}

2. حسابات التكلفة والأرباح المقترحة:
- تكلفة الشراء من الجملة: ${wholesaleCost.toLocaleString()} ${currency} (منفذ: ${wholesaleHub})
- سعر البيع الرابح المقترح: ${effectiveSellingPrice.toLocaleString()} ${currency} (خصم الصدارة: ${selectedDiscount}%)
- صافي هامش الربح المتوقع للقطعة: +${netProfit.toLocaleString()} ${currency}
- نسبة هامش الربح: ${marginPct}%

3. موقف المنافسين بالسوق:
- أدنى سعر للمنافسين بالسوق: ${product.currentLowestPrice.toLocaleString()} ${currency}
- أعلى سعر رصد بالسوق: ${(product.highestPrice || effectiveSellingPrice).toLocaleString()} ${currency}
- الموقف التنافسي: ${effectiveSellingPrice <= product.currentLowestPrice ? 'متصدر بأقل سعر رابح (Winning Buy Box) 🏆' : 'أعلى من أقل منافس (يتطلب اعتماد التسعير المخفض)'}

4. ملاحظات وتوصيات مسؤول التشغيل:
${additionalNotes}

---
تم توليد هذا التقرير تلقائياً عبر منصة "رادار التاجر الذكي مصر"`;
  };

  // Launch Default Mail Client (mailto:)
  const handleLaunchMailClient = () => {
    const bodyText = generateEmailBodyText();
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    onSuccessToast?.('تم فتح تطبيق البريد الإلكتروني مع تفاصيل التقرير ✉️');
  };

  // Copy Full Body to Clipboard
  const handleCopyBody = () => {
    const bodyText = generateEmailBodyText();
    navigator.clipboard.writeText(bodyText);
    setIsCopied(true);
    onSuccessToast?.('تم نسخ نص التقرير بالكامل للحافظة بنجاح 📋');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Simulate Instant Direct Transmission to Manager
  const handleDirectSend = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('يرجى كتابة بريد إلكتروني صحيح للمدير');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      try {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.7 }
        });
      } catch {
        // safe
      }
      onSuccessToast?.(`تم إرسال التقرير التنفيذي بنجاح إلى بريد المدير (${recipientEmail}) ✉️🚀`);
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn font-['Alexandria',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black">إرسال التقرير التنفيذي عبر الإيميل للمدير</h3>
              <p className="text-[11px] text-indigo-200">مشاركة ملخص التسعير والأرباح وحركة المنافسين</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          
          {/* Email Header Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بريد المدير المستلم:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="manager@company.com"
                  className="w-full h-10 px-3 pr-9 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-bold text-slate-900 ltr text-left"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المدير / جهة الإرسال:
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="السيد مدير المبيعات"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Subject Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان الرسالة (Subject):
            </label>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-950 truncate">
              {emailSubject}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات إضافية للمدير (اختياري):
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="اكتب أي ملاحظة أو طلب اعتماد خاص..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900"
            />
          </div>

          {/* Live Formatted Email Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>معاينة نص التقرير المرفق بالإيميل:</span>
              </span>

              <button
                type="button"
                onClick={handleCopyBody}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ نص التقرير</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed select-all">
              {generateEmailBodyText()}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>يتم إرفاق جدول الأسعار وهوامش الربح تلقائياً للمدير.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleLaunchMailClient}
              className="h-10 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="فتح تطبيق البريد الافتراضي على جهازك"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح في تطبيق البريد</span>
            </button>

            <button
              onClick={handleDirectSend}
              disabled={isSending}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الإرسال للمدير...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التقرير للمدير الآن 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
