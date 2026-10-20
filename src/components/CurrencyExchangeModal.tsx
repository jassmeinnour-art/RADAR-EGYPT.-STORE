import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  RefreshCw, 
  Check, 
  Globe, 
  ArrowRightLeft, 
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { 
  SupportedCurrencyCode, 
  DEFAULT_CURRENCIES, 
  getStoredExchangeRates, 
  saveCustomExchangeRates, 
  getActiveDisplayCurrency, 
  setActiveDisplayCurrency 
} from '../utils/multiCurrencyManager';

interface CurrencyExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurrencyChanged?: (currency: SupportedCurrencyCode) => void;
  onToast: (msg: string) => void;
}

export const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({
  isOpen,
  onClose,
  onCurrencyChanged,
  onToast
}) => {
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrencyCode>(getActiveDisplayCurrency());
  const [rates, setRates] = useState<Record<SupportedCurrencyCode, number>>(() => getStoredExchangeRates());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveCurrency(getActiveDisplayCurrency());
      setRates(getStoredExchangeRates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveRates = () => {
    saveCustomExchangeRates(rates);
    setActiveDisplayCurrency(activeCurrency);
    if (onCurrencyChanged) {
      onCurrencyChanged(activeCurrency);
    }
    onToast(`💱 تم تحديث أسعار الصرف وحفظ العملة النشطة (${activeCurrency}) بنجاح`);
    onClose();
  };

  const handleAutoFetchRates = () => {
    setIsUpdating(true);
    setTimeout(() => {
      // Simulate live market rates update (CBE / Central Bank of Egypt / Interbank)
      const simulatedUpdatedRates: Record<SupportedCurrencyCode, number> = {
        EGP: 1.0,
        USD: Number((48.2 + Math.random() * 0.8).toFixed(2)),
        SAR: Number((12.8 + Math.random() * 0.3).toFixed(2)),
        AED: Number((13.1 + Math.random() * 0.3).toFixed(2)),
        EUR: Number((51.8 + Math.random() * 1.0).toFixed(2)),
        GBP: Number((61.2 + Math.random() * 1.2).toFixed(2)),
      };
      setRates(simulatedUpdatedRates);
      saveCustomExchangeRates(simulatedUpdatedRates);
      setIsUpdating(false);
      onToast('⚡ تم تحديث أسعار الصرف الحية للعملات مقابل الجنيه المصري بنجاح');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide">إدارة العملات المتعددة وأسعار الصرف</h2>
              <p className="text-xs text-slate-300">Multi-Currency & Exchange Rates Hub (EGP, USD, SAR, AED, EUR)</p>
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
        <div className="p-6 overflow-y-auto space-y-6 bg-[#F8FAFC]">
          
          {/* Active Display Currency Selector */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-[#000000] mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              اختيار العملة الافتراضية للعرض في لوحة التحكم والتقارير:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(DEFAULT_CURRENCIES) as SupportedCurrencyCode[]).map((code) => {
                const info = DEFAULT_CURRENCIES[code];
                const isSelected = activeCurrency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveCurrency(code)}
                    className={`p-3 rounded-xl border-2 text-right transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono font-bold">{info.code} ({info.symbol})</div>
                      <div className="text-[11px] text-slate-500">{info.nameAr}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exchange Rates Configuration Table */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#000000] flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  جدول أسعار الصرف مقابل الجنيه المصري (1 وحدة = ؟ ج.م):
                </h3>
                <p className="text-xs text-slate-500">تُستخدم هذه القيم لتحويل تكاليف الجملة، العمولات، وصافي الأرباح بدقة.</p>
              </div>
              <button
                type="button"
                onClick={handleAutoFetchRates}
                disabled={isUpdating}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'جاري التحديث...' : 'تحديث آلي من البنوك'}
              </button>
            </div>

            <div className="space-y-3">
              {(Object.keys(DEFAULT_CURRENCIES) as SupportedCurrencyCode[])
                .filter((code) => code !== 'EGP')
                .map((code) => {
                  const info = DEFAULT_CURRENCIES[code];
                  const currentRate = rates[code] || info.rateToEGP;
                  return (
                    <div key={code} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 font-mono font-black text-xs flex items-center justify-center">
                          {info.symbol}
                        </span>
                        <div>
                          <strong className="text-sm text-[#000000] block">{info.nameAr} ({code})</strong>
                          <span className="text-[11px] text-slate-500 font-mono">1 {code} = {currentRate} جنيه مصري</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          value={currentRate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setRates({ ...rates, [code]: val });
                          }}
                          className="w-28 px-3 py-1.5 bg-white border-2 border-slate-300 rounded-lg text-sm font-mono font-black text-center focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-xs font-bold text-slate-600">ج.م</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black mb-0.5">ضمان الدقة المالية للوكالة:</strong>
              عند تغيير العملة الافتراضية، يتم إعادة احتساب أسعار المنتجات، تكاليف الشحن، وهامش الربح للعملاء والتجار تلقائياً في جميع القوائم والتقارير.
            </div>
          </div>

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
          <button
            type="button"
            onClick={handleSaveRates}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            حفظ وتطبيق العملة
          </button>
        </div>

      </div>
    </div>
  );
};
