import React, { useState } from 'react';
import { X, Upload, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [refNumber, setRefNumber] = useState('');

  const handleUpload = () => {
    alert('تم رفع الإيصال بنجاح. سيتم تفعيل الاشتراك بعد المراجعة.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-amber-500" /> اشتراك المحفظة النقدية
          </h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
        </div>
        <div className="space-y-4">
          <p className="text-slate-300">قم بتحويل الاشتراك لرقم: 01097751352</p>
          <input 
            type="text" 
            placeholder="رقم مرجع العملية" 
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800"
          />
          <label className="block w-full p-4 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-amber-500">
            <Upload className="mx-auto mb-2 text-slate-500" />
            <span>{receipt ? receipt.name : 'رفع صورة الإيصال'}</span>
            <input type="file" className="hidden" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
          </label>
          <button onClick={handleUpload} className="w-full py-3 rounded-xl bg-amber-600 font-bold text-white">تأكيد الدفع</button>
        </div>
      </div>
    </div>
  );
}
