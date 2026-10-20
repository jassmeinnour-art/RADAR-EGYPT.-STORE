import React, { useState } from 'react';
import { 
  Layers, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Hash, 
  ShieldCheck, 
  Tag,
  Share2,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ProductData, PlatformSEOListing } from '../types';

interface PlatformListingGeneratorProps {
  product: ProductData;
  currency: string;
  winningPrice: number;
  selectedDiscount: number;
  onUpdateSeoListing?: (updated: PlatformSEOListing) => void;
  onOpenKeywordStudio?: () => void;
}

export const PlatformListingGenerator: React.FC<PlatformListingGeneratorProps> = ({
  product,
  currency,
  winningPrice,
  selectedDiscount,
  onUpdateSeoListing,
  onOpenKeywordStudio,
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<'amazon' | 'noon' | 'jumia' | 'social'>('amazon');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Alexandria']">مولد عناوين وبيانات المنصات (SEO)</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          يرجى اختيار أو إضافة منتج من القائمة لتوليد الكلمات المفتاحية والعناوين التسويقية المجهزة لمنصات أمازون ونون وجوميا.
        </p>
      </div>
    );
  }

  const defaultSeo: PlatformSEOListing = {
    amazon: {
      title: product.title || 'منتج عام',
      bulletPoints: ['جودة ممتازة وسعر منافس', 'ضمان معتمد', 'شحن سريع لجميع المحافظات'],
      backendSearchTerms: 'مصر تسوق عروض تخفيضات',
      categoryPath: product.category || 'عام',
      complianceScore: 95,
      characterCount: 65,
    },
    noon: {
      title: product.title || 'منتج عام',
      keyHighlights: ['تصميم عالي الجودة', 'أفضل قيمة مقابل السعر'],
      description: product.title || 'وصف المنتج',
      arabicBrand: product.brand || 'عام',
      complianceScore: 94,
    },
    jumia: {
      title: product.title || 'منتج عام',
      shortDescription: product.title || 'وصف مختصر',
      keyFeatures: ['منتج أصلي 100%', 'توصيل لباب البيت'],
      searchTags: ['عروض', 'مصر', 'تسوق'],
      complianceScore: 92,
    },
    socialStore: {
      marketingPost: `🔥 أقوى عرض على ${product.title || 'المنتج'} بخصم حصري لفترة محدودة!`,
      callToAction: 'اطلب الآن',
      adCopy: 'شحن سريع لجميع محافظات مصر والدفع عند الاستلام',
      hashtags: ['#عروض_مصر', '#تسوق_أونلاين', '#تخفيضات'],
    },
  };

  const seo = product.seoListing || defaultSeo;
  const keywords = product.keywords || [];

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleCopyAllKeywords = () => {
    const text = keywords.map(k => k.keyword).join(', ');
    handleCopy(text, 'all-keywords');
  };

  const handleRegenerateSeo = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/generate-listing-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.title,
          brand: product.brand,
          model: product.model,
          sellingPrice: winningPrice,
          lowestCompetitorPrice: product.currentLowestPrice,
          currency,
          discountPercent: selectedDiscount,
        }),
      });

      const res = await response.json();
      if (res.success && res.data && onUpdateSeoListing) {
        onUpdateSeoListing({
          ...product.seoListing,
          amazon: {
            ...product.seoListing.amazon,
            title: res.data.amazon?.title || product.seoListing.amazon.title,
            bulletPoints: res.data.amazon?.bulletPoints || product.seoListing.amazon.bulletPoints,
            backendSearchTerms: res.data.amazon?.backendSearchTerms || product.seoListing.amazon.backendSearchTerms,
          },
          noon: {
            ...product.seoListing.noon,
            title: res.data.noon?.title || product.seoListing.noon.title,
            keyHighlights: res.data.noon?.keyHighlights || product.seoListing.noon.keyHighlights,
            description: res.data.noon?.description || product.seoListing.noon.description,
          },
          jumia: {
            ...product.seoListing.jumia,
            title: res.data.jumia?.title || product.seoListing.jumia.title,
            keyFeatures: res.data.jumia?.keyFeatures || product.seoListing.jumia.keyFeatures,
          }
        });
      }
    } catch {
      // Safe fallback
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Spotlight Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700">مولد بيانات السيو والكلمات الدلالية المعتمدة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria']">
              بيانات ومواصفات المنتج المطابقة لخوارزميات المنصات
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              عناوين تسويقية مهيأة لمحركات بحث أمازون ونون وجوميا، نقاط المزايا البيعية، ومصطلحات البحث الأكثر رواجاً في مصر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenKeywordStudio && (
              <button
                onClick={onOpenKeywordStudio}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>أداة الكلمات المفتاحية وقوة المنافسة 🚀</span>
              </button>
            )}

            <button
              onClick={handleRegenerateSeo}
              disabled={isRegenerating}
              className="h-10 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 border border-indigo-200 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>إعادة توليد السيو</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActivePlatformTab('amazon')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activePlatformTab === 'amazon'
              ? 'bg-sky-500/10 border-sky-500 text-sky-950 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg shrink-0">
            📦
          </div>
          <div>
            <div className="text-xs font-bold">أمازون مصر (Amazon EG)</div>
            <div className="text-[10px] text-slate-500">مطابقة معايير A9 بنسبة 100%</div>
          </div>
        </button>

        <button
          onClick={() => setActivePlatformTab('noon')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activePlatformTab === 'noon'
              ? 'bg-sky-500/10 border-sky-500 text-sky-950 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center text-lg shrink-0">
            🟡
          </div>
          <div>
            <div className="text-xs font-bold">نون مصر (Noon Egypt)</div>
            <div className="text-[10px] text-slate-500">جاهز لكتالوج نون بارتنر</div>
          </div>
        </button>

        <button
          onClick={() => setActivePlatformTab('jumia')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activePlatformTab === 'jumia'
              ? 'bg-orange-500/10 border-orange-500 text-orange-950 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-xs font-bold">جوميا مصر (Jumia Egypt)</div>
            <div className="text-[10px] text-slate-500">مطابق لـ Seller Center</div>
          </div>
        </button>

        <button
          onClick={() => setActivePlatformTab('social')}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
            activePlatformTab === 'social'
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-950 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0">
            📲
          </div>
          <div>
            <div className="text-xs font-bold">سوشيال وشوبيفاي</div>
            <div className="text-[10px] text-slate-500">تيك توك، فيسبوك، وواتساب</div>
          </div>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols): Listing Details */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TAB 1: AMAZON EGYPT LISTING */}
          {activePlatformTab === 'amazon' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              
              {/* Amazon Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      عنوان المنتج على أمازون مصر (Amazon Title SEO)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({seo.amazon.title?.length || 0} حرف / الحد الأقصى 200)
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(seo.amazon.title, 'amz-title')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'amz-title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'amz-title' ? 'تم النسخ!' : 'نسخ العنوان'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 leading-relaxed select-all">
                  {seo.amazon.title}
                </div>
              </div>

              {/* Amazon 5 Bullet Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    نقاط المزايا البيعية الخمس (Amazon 5 Bullet Points)
                  </span>

                  <button
                    onClick={() => handleCopy(seo.amazon.bulletPoints.join('\n'), 'amz-bullets')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'amz-bullets' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'amz-bullets' ? 'تم النسخ!' : 'نسخ جميع النقاط'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {seo.amazon.bulletPoints.map((bp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{bp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend Search Terms */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      الكلمات المفتاحية الخلفية (Backend Search Terms)
                    </span>
                    <p className="text-[10px] text-slate-500">توضع في خانة Generic Keywords داخل Amazon Seller Central لتصدر البحث دون فواصل</p>
                  </div>

                  <button
                    onClick={() => handleCopy(seo.amazon.backendSearchTerms, 'amz-backend')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedKey === 'amz-backend' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'amz-backend' ? 'تم النسخ!' : 'نسخ الكلمات'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs font-mono text-sky-900 select-all">
                  {seo.amazon.backendSearchTerms}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: NOON EGYPT LISTING */}
          {activePlatformTab === 'noon' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              
              {/* Noon Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    عنوان المنتج لكتالوج نون مصر (Noon Partner Title)
                  </span>
                  <button
                    onClick={() => handleCopy(seo.noon.title, 'noon-title')}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                  >
                    {copiedKey === 'noon-title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'noon-title' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 text-xs font-semibold text-slate-900">
                  {seo.noon.title}
                </div>
              </div>

              {/* Noon Key Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    أبرز المزايا (Key Highlights)
                  </span>
                  <button
                    onClick={() => handleCopy(seo.noon.keyHighlights.join('\n'), 'noon-highlights')}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                  >
                    {copiedKey === 'noon-highlights' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'noon-highlights' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {seo.noon.keyHighlights.map((hl, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Noon Description */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900">
                  الوصف التسويقي الشامل (Noon Product Description)
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {seo.noon.description}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: JUMIA EGYPT LISTING */}
          {activePlatformTab === 'jumia' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    عنوان المنتج لجوميا مصر (Jumia Title)
                  </span>
                  <button
                    onClick={() => handleCopy(seo.jumia.title, 'jumia-title')}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                  >
                    {copiedKey === 'jumia-title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'jumia-title' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200 text-xs font-semibold text-slate-900">
                  {seo.jumia.title}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900">
                  الميزات الأساسية (Key Features)
                </span>
                <div className="space-y-1.5">
                  {seo.jumia.keyFeatures.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL MEDIA & TIKTOK SHOP LISTING */}
          {activePlatformTab === 'social' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    نص المنشور الإعلاني الفيروسي (Social & TikTok Copy)
                  </span>
                  <button
                    onClick={() => handleCopy(seo.socialStore.marketingPost, 'social-post')}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                  >
                    {copiedKey === 'social-post' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'social-post' ? 'تم النسخ!' : 'نسخ المنشور'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  {seo.socialStore.marketingPost}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900">
                  الهاشتاجات الرائجة في مصر (Trending Egyptian Hashtags)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {seo.socialStore.hashtags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 text-indigo-700 text-xs font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (4 Cols): High-Traffic Egyptian Keywords Radar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 font-['Alexandria']">
                  الكلمات المفتاحية الأكثر بحثاً بمصر
                </h4>
              </div>
              <button
                onClick={handleCopyAllKeywords}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {copiedKey === 'all-keywords' ? 'تم النسخ!' : 'نسخ الكل'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              مرتبة حسب أعلى معدل بحث شهري على نون وأمازون وجوجل مصر:
            </p>

            <div className="space-y-2">
              {product.keywords.map((kw, idx) => {
                const isLow = kw.competitionLevel === 'low';
                const isMed = kw.competitionLevel === 'medium';
                return (
                  <div
                    key={idx}
                    onClick={() => handleCopy(kw.keyword, `kw-${idx}`)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {kw.keyword}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>المنصة: <strong className="text-indigo-600">{kw.recommendedPlatform}</strong></span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          isLow 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isMed 
                            ? 'bg-sky-100 text-sky-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isLow ? '🟢 منافسة سهلة' : isMed ? '🟡 متوسطة' : '🔴 شديدة'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {kw.searchVolume}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {onOpenKeywordStudio && (
              <button
                onClick={onOpenKeywordStudio}
                className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>فتح المحلل الكامل لجميع الكلمات والفرص الذهبية 🚀</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
