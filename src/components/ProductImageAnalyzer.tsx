import React, { useState } from 'react';
import { Upload, Sparkles, X, Check } from 'lucide-react';

export const ProductImageAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error || 'فشل في التحليل');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-[#0F2A4A] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">تحليل المنتج بالذكاء الاصطناعي</h2>
      {!image ? (
        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
          <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center text-gray-500 dark:text-gray-400">
            <Upload size={48} className="mb-2" />
            <span>اختر صورة المنتج للتحليل</span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={image} alt="Product" className="max-h-64 mx-auto rounded-lg" />
            <button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={16} /></button>
          </div>
          <button 
            onClick={analyzeImage} 
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
          >
            {analyzing ? 'جاري التحليل...' : <><Sparkles size={18} /> بدء التحليل</>}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
          <h3 className="font-bold text-lg mb-2">{result.title}</h3>
          <p><strong>التصنيف:</strong> {result.category}</p>
          <div className="mt-2">
            <strong>الكلمات المفتاحية:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.tags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
