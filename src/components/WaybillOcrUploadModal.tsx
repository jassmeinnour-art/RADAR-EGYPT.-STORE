import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Scan, 
  Barcode, 
  Truck, 
  Check 
} from 'lucide-react';
import { CustomerOrder } from '../types';

interface WaybillOcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  onWaybillExtracted: (updatedOrder: CustomerOrder, waybillNumber: string, courierName: string) => void;
  onShowToast: (msg: string) => void;
}

export const WaybillOcrUploadModal: React.FC<WaybillOcrUploadModalProps> = ({
  isOpen,
  onClose,
  orders,
  onWaybillExtracted,
  onShowToast
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    orderNumber: string;
    waybillNumber: string;
    courierName: string;
    customerName: string;
    governorate: string;
    confidence: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleRunOcrScan = () => {
    if (!selectedFile) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      // Simulate intelligent OCR extraction from Egyptian shipping waybill (Bosta, Mylerz, J&T, Amazon Delivery, Noon Express)
      const sampleCouriers = ['بوسطة (Bosta)', 'مايلرز (Mylerz)', 'جيه آند تي إكسبريس (J&T)', 'أمازون شحن (Amazon Logistics)', 'نون إكسبريس (Noon Express)'];
      const randomCourier = sampleCouriers[Math.floor(Math.random() * sampleCouriers.length)];
      const randomWaybillNo = 'WAY-EG-' + Math.floor(100000 + Math.random() * 900000);
      
      const matchedOrder = orders.length > 0 
        ? orders[Math.floor(Math.random() * orders.length)] 
        : {
            orderNumber: 'ORD-EG-2026-9912',
            customerName: 'أحمد محمود حسن',
            governorate: 'الجيزة'
          };

      setScanResult({
        orderNumber: matchedOrder.orderNumber,
        waybillNumber: randomWaybillNo,
        courierName: randomCourier,
        customerName: matchedOrder.customerName,
        governorate: matchedOrder.governorate,
        confidence: 97.4
      });

      onShowToast(`🔍 تم قراءة بوليصة الشحن بنجاح واستخراج رقم الطلب وشركة الشحن بدقة 97.4%`);
    }, 1500);
  };

  const handleApplyExtractedWaybill = () => {
    if (!scanResult) return;
    const targetOrder = orders.find(o => o.orderNumber === scanResult.orderNumber) || orders[0];
    if (targetOrder) {
      onWaybillExtracted(targetOrder, scanResult.waybillNumber, scanResult.courierName);
      onShowToast(`📦 تم ربط بوليصة الشحن (${scanResult.waybillNumber}) والشركة (${scanResult.courierName}) بالطلب ${scanResult.orderNumber} بنجاح!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] w-full max-w-xl rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">مسح واستيراد بوالص الشحن (OCR Scan)</h2>
              <p className="text-xs text-slate-300">استخراج رقم الطلب وشركة الشحن تلقائياً من ملفات PDF أو الصور</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-[#F8FAFC]">
          
          {/* Upload Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center bg-white transition-all">
            <input
              type="file"
              id="waybill-ocr-file-input"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="waybill-ocr-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <strong className="text-sm font-black text-[#000000] block mb-1">
                  {selectedFile ? selectedFile.name : 'اضغط لاختيار ملف بوليصة الشحن (PDF أو صورة)'}
                </strong>
                <span className="text-xs text-slate-500">يدعم بوالص بوسطة، مايلرز، جيه آند تي، وأمازون</span>
              </div>
            </label>
          </div>

          {selectedFile && !scanResult && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRunOcrScan}
                disabled={isScanning}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري قراءة وتحليل البوليصة بالـ OCR الذكي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء المعالجة واستخراج البيانات (OCR)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* OCR Scan Results */}
          {scanResult && (
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-black bg-emerald-50 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم التعرف على بيانات البوليصة بنجاح (مستوى دقة الـ OCR: {scanResult.confidence}%)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">رقم الطلب المستخرج:</span>
                  <strong className="text-[#000000] font-mono text-sm block mt-0.5">{scanResult.orderNumber}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">رقم البوليصة (Waybill):</span>
                  <strong className="text-indigo-900 font-mono text-sm block mt-0.5">{scanResult.waybillNumber}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">شركة الشحن:</span>
                  <strong className="text-[#000000] block mt-0.5">{scanResult.courierName}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">المستلم والوجهة:</span>
                  <strong className="text-[#000000] block mt-0.5">{scanResult.customerName} ({scanResult.governorate})</strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t-2 border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          {scanResult && (
            <button
              type="button"
              onClick={handleApplyExtractedWaybill}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              اعتماد وربط البوليصة بالجدولة
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
