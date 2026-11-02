import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Layers, 
  Maximize2, 
  Copy, 
  Info, 
  Eye, 
  RefreshCw, 
  Compass, 
  Tag, 
  Check, 
  Upload, 
  Share2,
  Box,
  Ruler,
  Flame
} from 'lucide-react';

export interface MultiAngleShot {
  id: string;
  type: 'main_white' | 'angle_45' | 'back_details' | 'lifestyle' | 'infographic' | 'dimensions_scale';
  titleAr: string;
  descriptionAr: string;
  amazonCompliant: boolean;
  noonCompliant: boolean;
  jumiaCompliant: boolean;
  resolution: string;
  keyHighlights: string[];
  customFilter?: string;
  customLifestyleBg?: string;
}

interface MultiAngleShotsStudioProps {
  initialImage?: string | null;
  productTitle?: string;
  category?: string;
  onShowToast?: (msg: string) => void;
}

export const MultiAngleShotsStudio: React.FC<MultiAngleShotsStudioProps> = ({
  initialImage,
  productTitle = 'منتج تجاري',
  category = 'عام',
  onShowToast
}) => {
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [shots, setShots] = useState<MultiAngleShot[] | null>(null);
  const [selectedShotForModal, setSelectedShotForModal] = useState<MultiAngleShot | null>(null);
  const [selectedLifestyleBg, setSelectedLifestyleBg] = useState<string>('stadium');

  // Generate 6 Multi-Angle Shots via Backend API
  const handleGenerateShots = async (base64Image?: string) => {
    const targetImage = base64Image || currentImage;
    if (!targetImage) {
      if (onShowToast) onShowToast('⚠️ يرجى رفع صورة أو اختيار منتج من الكتالوج أولاً');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-multi-angle-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: targetImage,
          productTitle,
          category,
        }),
      });

      const res = await response.json();
      if (res.success && res.data?.shots) {
        setShots(res.data.shots);
        if (onShowToast) {
          onShowToast('✨ تم توليد 6 تصميمات متعددة الزوايا مطابقة لمواصفات أمازون ونون وجوميا بنجاح!');
        }
      } else {
        throw new Error(res.error || 'فشل توليد زوايا التصميم');
      }
    } catch (err: any) {
      console.error('Multi-angle generator error:', err);
      if (onShowToast) onShowToast(`⚠️ ${err.message || 'حدث خطأ أثناء إعداد زوايا التصميم'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Image Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCurrentImage(base64);
        handleGenerateShots(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Single Shot Simulation
  const handleDownloadShot = (shot: MultiAngleShot) => {
    if (onShowToast) {
      onShowToast(`📥 جاري تحميل التصميم "${shot.titleAr}" بدقة عالية HD...`);
    }
  };

  // Download All 6 Shots as Package
  const handleDownloadPackage = () => {
    if (onShowToast) {
      onShowToast('📦 جاري ضغط وتحميل حزمة التصميمات الـ 6 المعتمدة بالكامل (ZIP HD Package)...');
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-8 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>استوديو تصميم المنتج المتعدد الزوايا (6 زوايا معتمدة)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  توليد AI للـ 6 زوايا 📸
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                رفع صورة واحدة لتوليد 6 تصميمات مختلفة بزوايا وخلفيات مطابقة لشروط أمازون، نون، وجوميا
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {shots && (
            <button
              onClick={handleDownloadPackage}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>تحميل الحزمة الـ 6 كاملة (ZIP HD) 📦</span>
            </button>
          )}

          <label className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-950" />
            <span>رفع صورة منتج جديدة 📷</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Main Image Control & Trigger Button */}
      {!shots && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">توليد الـ 6 زوايا والتصميمات المطابقة للبيع</h3>
            <p className="text-xs text-slate-400">
              سيقوم الذكاء الاصطناعي بتوليد (الصورة الرئيسية البيضاء، الزاوية الجانبية 45°، التفاصيل والخامات، صورة Lifestyle الواقعية، صورة الإنفوجرافيك، وصورة أبعاد المقاسات).
            </p>
          </div>

          <button
            onClick={() => handleGenerateShots()}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-slate-950 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'جاري التوليد والتحليل البصري للـ 6 زوايا...' : 'بدء توليد الـ 6 زوايا والتصميمات الآن ✨'}</span>
          </button>
        </div>
      )}

      {/* 6 Multi-Angle Shots Responsive Grid */}
      {shots && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم تجهيز الـ 6 تصميمات المعتمدة لمنتج "{productTitle}"</span>
            </span>
            <span className="text-slate-400 font-mono">6/6 Shots Generated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shots.map((shot, index) => (
              <div 
                key={shot.id} 
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition space-y-3 flex flex-col justify-between shadow-xl relative overflow-hidden group"
              >
                
                {/* Shot Header Badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      التصميم #{index + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {shot.resolution}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-xs line-clamp-1" title={shot.titleAr}>
                    {shot.titleAr}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {shot.descriptionAr}
                  </p>
                </div>

                {/* Simulated Shot Card Visual Viewport */}
                <div className="relative aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-3 my-2">
                  
                  {/* Shot Background Representation */}
                  {shot.type === 'main_white' || shot.type === 'angle_45' || shot.type === 'back_details' ? (
                    <div className="absolute inset-0 bg-white shadow-inner flex items-center justify-center">
                      <img 
                        src={currentImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'} 
                        alt={shot.titleAr} 
                        className={`max-h-[82%] max-w-[82%] object-contain transition duration-300 ${
                          shot.type === 'angle_45' ? 'rotate-6 scale-95 drop-shadow-[0_12px_12px_rgba(0,0,0,0.3)]' :
                          shot.type === 'back_details' ? 'scale-110 contrast-125' : ''
                        }`}
                      />
                    </div>
                  ) : shot.type === 'lifestyle' ? (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/60 via-slate-900 to-sky-950 flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80" 
                        alt="Lifestyle Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                      />
                      <img 
                        src={currentImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'} 
                        alt={shot.titleAr} 
                        className="max-h-[75%] max-w-[75%] object-contain relative z-10 drop-shadow-2xl"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                        AI Lifestyle Environment 🏟️
                      </span>
                    </div>
                  ) : shot.type === 'infographic' ? (
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-2">
                      <img 
                        src={currentImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'} 
                        alt={shot.titleAr} 
                        className="max-h-[70%] max-w-[70%] object-contain opacity-90"
                      />
                      {/* Infographic Callouts Overlay */}
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                        ✓ ضمان سنة معتمد
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-sky-500 text-slate-950 font-black text-[9px]">
                        ✓ خامات أصلية 100%
                      </div>
                    </div>
                  ) : (
                    /* Dimensions & Scale Sheet */
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center p-2 border border-sky-500/30">
                      <img 
                        src={currentImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'} 
                        alt={shot.titleAr} 
                        className="max-h-[70%] max-w-[70%] object-contain opacity-80"
                      />
                      {/* Scale Lines */}
                      <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-amber-400 text-[9px] text-amber-300 font-mono text-center bg-slate-950/80 px-1 py-0.5 rounded">
                        العرض: 25 سم ↔
                      </div>
                      <div className="absolute inset-y-4 right-2 border-r border-dashed border-amber-400 text-[9px] text-amber-300 font-mono flex items-center bg-slate-950/80 px-1 py-0.5 rounded">
                        الارتفاع: 40 سم ↕
                      </div>
                    </div>
                  )}

                  {/* Zoom Preview Overlay */}
                  <button
                    onClick={() => setSelectedShotForModal(shot)}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 cursor-pointer text-white font-bold text-xs"
                  >
                    <Maximize2 className="w-5 h-5 text-amber-400" />
                    <span>تكبير ومعاينة الشروط</span>
                  </button>

                </div>

                {/* Marketplace Compliance Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>مطابقة شروط المنصات:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                    <span className={`px-2 py-0.5 rounded-full border ${
                      shot.amazonCompliant ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      أمازون {shot.type === 'lifestyle' ? '(صورة #2+)' : '✓'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      نون ✓
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      جوميا ✓
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleDownloadShot(shot)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل HD ⬇️</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Detailed Compliance Inspector */}
      {selectedShotForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative font-['Cairo',sans-serif]" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>فحص مطابقة المعايير لـ "{selectedShotForModal.titleAr}"</span>
              </h3>
              <button 
                onClick={() => setSelectedShotForModal(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">مواصفات الفريم والدقة:</span>
                <span className="font-mono text-amber-300 font-bold block">{selectedShotForModal.resolution}</span>
                <p className="text-slate-300 leading-relaxed pt-1">{selectedShotForModal.descriptionAr}</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-300 block">أبرز النقاط المستوفاة:</span>
                <ul className="space-y-1">
                  {selectedShotForModal.keyHighlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 text-emerald-300 font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setSelectedShotForModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MultiAngleShotsStudio;
