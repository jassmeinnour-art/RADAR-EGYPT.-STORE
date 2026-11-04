import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, RefreshCw } from 'lucide-react';

export const AIMultiDesign: React.FC<{ onShowToast?: (msg: string) => void }> = ({ onShowToast }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern_kitchen');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onShowToast?.('تم توليد التصاميم الذكية بنجاح!');
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">مولد التصاميم المتعددة بالذكاء الاصطناعي (AI Multi-Design)</h3>
            <p className="text-xs text-slate-400">إنشاء خلفيات متعددة لمنتجاتك بضغطة واحدة مع تحسين جودة الصورة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'modern_kitchen', name: 'مطبخ عصري أنيق', desc: 'مناسب لمنتجات أدوات المطبخ والطهي' },
          { id: 'luxury_office', name: 'مكتب فخم مع إضاءة خافتة', desc: 'مناسب للأجهزة واللابتوب والإلكترونيات' },
          { id: 'nature_forest', name: 'غابة طبيعية وخضرة', desc: 'مناسب لمستحضرات التجميل والعناية' },
        ].map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setSelectedTemplate(tpl.id)}
            className={`p-4 rounded-2xl border text-right transition cursor-pointer ${
              selectedTemplate === tpl.id
                ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm mb-1">{tpl.name}</div>
            <div className="text-xs text-slate-400">{tpl.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري توليد التصميم...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>توليد تصميم مخصص بالذكاء الاصطناعي</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIMultiDesign;
