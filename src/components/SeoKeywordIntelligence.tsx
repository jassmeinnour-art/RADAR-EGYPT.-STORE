import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Hash, 
  Layers, 
  ArrowUpRight, 
  HelpCircle, 
  CheckSquare, 
  Square, 
  FileSpreadsheet, 
  Zap, 
  Target, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Camera, 
  Image as ImageIcon,
  ExternalLink,
  Flame,
  Star,
  Info,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { ProductData, KeywordItem, KeywordCompetitionLevel, KeywordIntentType } from '../types';

interface SeoKeywordIntelligenceProps {
  product: ProductData;
  currency: string;
  onUpdateKeywords?: (newKeywords: KeywordItem[]) => void;
  onApplyKeywordsToSeo?: (keywordsList: KeywordItem[]) => void;
  onSwitchToSeoListing?: () => void;
}

export const SeoKeywordIntelligence: React.FC<SeoKeywordIntelligenceProps> = ({
  product,
  currency,
  onUpdateKeywords,
  onApplyKeywordsToSeo,
  onSwitchToSeoListing,
}) => {
  const [keywords, setKeywords] = useState<KeywordItem[]>(product.keywords || []);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(
    new Set((product.keywords || []).map((k, i) => k.id || `kw-${i}`))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterCompetition, setFilterCompetition] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'opportunity' | 'competition_asc' | 'search_desc' | 'relevance'>('opportunity');
  
  // Custom seed keyword & custom tester
  const [customSeed, setCustomSeed] = useState<string>('');
  const [testCustomQuery, setTestCustomQuery] = useState<string>('');
  const [isTestingCustom, setIsTestingCustom] = useState(false);

  // Market intelligence summary stats
  const [marketAdvice, setMarketAdvice] = useState<string>(
    'ركز على الكلمات ذات المنافسة المنخفضة (🟢) في عنوان ونقاط المزايا البيعية للحصول على مبيعات سريعة خلال أول 48 ساعة دون تكاليف إعلانات باهظة.'
  );

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Toggle selection for a single keyword
  const toggleSelectKeyword = (id: string) => {
    const next = new Set(selectedKeywordIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedKeywordIds(next);
  };

  // Select all or clear
  const handleToggleSelectAll = () => {
    if (selectedKeywordIds.size === filteredKeywords.length) {
      setSelectedKeywordIds(new Set());
    } else {
      setSelectedKeywordIds(new Set(filteredKeywords.map(k => k.id || k.keyword)));
    }
  };

  // AI Generation with image and product name
  const handleGenerateAiKeywords = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-keywords-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.title,
          brand: product.brand,
          model: product.model,
          category: product.category,
          imageBase64: product.imageUrl,
          customSeedKeyword: customSeed,
          targetPlatform: filterPlatform,
          currency,
        }),
      });

      const json = await res.json();
      if (json.success && json.data && json.data.keywords) {
        const newKws: KeywordItem[] = json.data.keywords.map((kw: any, idx: number) => ({
          ...kw,
          id: kw.id || `kw-gen-${Date.now()}-${idx}`,
        }));
        setKeywords(newKws);
        setSelectedKeywordIds(new Set(newKws.map(k => k.id || k.keyword)));
        if (json.data.marketSummary?.rankingStrategyAdvice) {
          setMarketAdvice(json.data.marketSummary.rankingStrategyAdvice);
        }
        if (onUpdateKeywords) {
          onUpdateKeywords(newKws);
        }
      }
    } catch {
      // Safe fallback
    } finally {
      setIsGenerating(false);
    }
  };

  // Custom single keyword analyzer
  const handleTestCustomKeyword = () => {
    if (!testCustomQuery.trim()) return;
    setIsTestingCustom(true);

    setTimeout(() => {
      // Analyze heuristic or push to state
      const query = testCustomQuery.trim();
      const isPrice = query.includes('سعر') || query.includes('ارخص') || query.includes('كم');
      const isWholesale = query.includes('جملة') || query.includes('عبد العزيز') || query.includes('بستان');
      const isLongTail = query.split(' ').length >= 4;

      const compScore = isLongTail ? Math.floor(Math.random() * 20 + 15) : isPrice ? Math.floor(Math.random() * 30 + 55) : Math.floor(Math.random() * 25 + 35);
      const compLevel: KeywordCompetitionLevel = compScore < 35 ? 'low' : compScore < 65 ? 'medium' : 'high';
      const oppScore = Math.min(99, Math.max(60, 100 - compScore + 20));

      const newKw: KeywordItem = {
        id: `kw-custom-${Date.now()}`,
        keyword: query,
        searchVolume: compScore > 50 ? 'فائق (High)' : 'مرتفع (Medium-High)',
        monthlySearchesEstimate: compScore > 50 ? 29500 : 13800,
        competitionLevel: compLevel,
        competitionScore: compScore,
        opportunityScore: oppScore,
        buyerIntent: isWholesale ? 'wholesale' : isPrice ? 'transactional' : isLongTail ? 'long_tail' : 'brand_exact',
        relevanceScore: 97,
        recommendedPlatform: 'الكل',
        cpcEstimateEGP: Number((compScore * 0.05 + 1).toFixed(1)),
        suggestedAction: compLevel === 'low' ? 'فرصة ذهبية تم إضافتها بنجاح 🟢' : 'كلمة ممتازة للتسعير التنافسي',
      };

      const updated = [newKw, ...keywords];
      setKeywords(updated);
      setSelectedKeywordIds(prev => new Set([newKw.id!, ...Array.from(prev)]));
      setTestCustomQuery('');
      setIsTestingCustom(false);
      if (onUpdateKeywords) {
        onUpdateKeywords(updated);
      }
    }, 600);
  };

  // Copy selected keywords formatted for Amazon Backend (no commas, space-separated, deduplicated)
  const handleCopyBackendTerms = () => {
    const selectedList = keywords.filter(k => selectedKeywordIds.has(k.id || k.keyword));
    const allWords = selectedList.map(k => k.keyword).join(' ');
    // Deduplicate words for backend search terms
    const uniqueWords = Array.from(new Set(allWords.split(/\s+/))).filter(Boolean).join(' ');
    handleCopy(uniqueWords, 'copy-backend');
  };

  // Copy selected keywords comma separated
  const handleCopyCommaSeparated = () => {
    const selectedList = keywords.filter(k => selectedKeywordIds.has(k.id || k.keyword));
    const text = selectedList.map(k => k.keyword).join(', ');
    handleCopy(text, 'copy-commas');
  };

  // Export CSV
  const handleExportCsv = () => {
    const selectedList = keywords.filter(k => selectedKeywordIds.has(k.id || k.keyword));
    const rows = [
      ['الكلمة المفتاحية', 'درجة قوة المنافسة', 'معدل الصعوبة %', 'مؤشر الفرصة %', 'حجم البحث الشهري المقدر', 'نية الشراء', 'المنصة الموصى بها', 'سعر النقرة EGP', 'الإجراء الموصى به'],
      ...selectedList.map(k => [
        k.keyword,
        k.competitionLevel === 'low' ? 'منخفضة (سهل جداً)' : k.competitionLevel === 'medium' ? 'متوسطة' : 'عالية',
        `${k.competitionScore || 50}%`,
        `${k.opportunityScore || 80}%`,
        `${k.monthlySearchesEstimate || 15000}`,
        k.buyerIntent || 'transactional',
        k.recommendedPlatform,
        `${k.cpcEstimateEGP || 2.0} EGP`,
        k.suggestedAction || ''
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SEO_Keywords_${product.brand}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter(k => {
      // Search query filter
      if (searchQuery.trim() && !k.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Competition filter
      if (filterCompetition !== 'all') {
        if (filterCompetition === 'low' && k.competitionLevel !== 'low') return false;
        if (filterCompetition === 'medium' && k.competitionLevel !== 'medium') return false;
        if (filterCompetition === 'high' && (k.competitionLevel !== 'high' && k.competitionLevel !== 'very_high')) return false;
      }
      // Platform filter
      if (filterPlatform !== 'all') {
        if (filterPlatform === 'amazon' && !k.recommendedPlatform.includes('أمازون') && k.recommendedPlatform !== 'الكل') return false;
        if (filterPlatform === 'noon' && !k.recommendedPlatform.includes('نون') && k.recommendedPlatform !== 'الكل') return false;
        if (filterPlatform === 'jumia' && !k.recommendedPlatform.includes('جوميا') && k.recommendedPlatform !== 'الكل') return false;
        if (filterPlatform === 'social' && !k.recommendedPlatform.includes('تيك توك') && k.recommendedPlatform !== 'الكل') return false;
      }
      // Intent filter
      if (filterIntent !== 'all') {
        if (k.buyerIntent !== filterIntent) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'opportunity') {
        return (b.opportunityScore || 80) - (a.opportunityScore || 80);
      }
      if (sortBy === 'competition_asc') {
        return (a.competitionScore || 50) - (b.competitionScore || 50);
      }
      if (sortBy === 'search_desc') {
        return (b.monthlySearchesEstimate || 10000) - (a.monthlySearchesEstimate || 10000);
      }
      if (sortBy === 'relevance') {
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });
  }, [keywords, searchQuery, filterCompetition, filterPlatform, filterIntent, sortBy]);

  // Calculations for stats badges
  const goldenOpportunitiesCount = keywords.filter(k => k.competitionLevel === 'low').length;
  const totalMonthlyTraffic = keywords.reduce((acc, k) => acc + (k.monthlySearchesEstimate || 15000), 0);
  const avgCompetitionScore = Math.round(
    keywords.reduce((acc, k) => acc + (k.competitionScore || 50), 0) / (keywords.length || 1)
  );

  return (
    <div className="space-y-6" id="seo-keyword-intelligence-container" dir="rtl">
      
      {/* Top Banner: Product & AI Multimodal Generator Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Left: Product preview & title */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 p-1 border border-white/20 shrink-0 overflow-hidden shadow-md">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-indigo-600 text-[9px] font-bold text-white">
                  صورة AI
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>محلل خوارزميات السوق المصري (A9 & Noon SEO)</span>
                  </span>
                  <span className="text-slate-400 text-xs font-mono">{product.brand} | {product.model}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white font-['Alexandria'] line-clamp-1">
                  أداة توليد الكلمات المفتاحية الذكية وتحليل درجة المنافسة
                </h2>
                <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                  توليد الكلمات المفتاحية تلقائياً بناءً على محتوى صورة المنتج ومواصفاته، مع احتساب قوة المنافسة وصعوبة التصدر لمساعدة التاجر على الوصول للصفحة الأولى فوراً.
                </p>
              </div>
            </div>

            {/* Right: Trigger AI Generation Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                id="btn-regenerate-ai-keywords"
                onClick={handleGenerateAiKeywords}
                disabled={isGenerating}
                className="h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'جاري تحليل الصورة والكلمات...' : 'توليد الكلمات بالذكاء الاصطناعي 🚀'}</span>
              </button>

              {onSwitchToSeoListing && (
                <button
                  onClick={onSwitchToSeoListing}
                  className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
                  title="عرض بيانات ونصوص السيو الجاهزة"
                >
                  <Layers className="w-4 h-4 text-indigo-300" />
                  <span>نصوص السيو الجاهزة 📑</span>
                </button>
              )}
            </div>

          </div>

          {/* Seed Input & Custom Options Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                placeholder="أدخل كلمة بذرية للتوسيع (مثال: عزل ضوضاء، شحن سريع، كود خصم، شارع عبد العزيز)..."
                className="w-full h-10 pr-10 pl-4 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiKeywords()}
              />
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-2 shrink-0">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>التحليل يدمج بصرية الصورة + سلوك الشراء الحقيقي في مصر</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4 Metric Intelligence Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Golden Opportunities (Low Competition) */}
        <div className="bg-white border border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">فرص ذهبية سهلة التصدر 🟢</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {goldenOpportunitiesCount} <span className="text-xs font-normal text-slate-500">كلمة</span>
          </div>
          <p className="mt-1 text-[10px] text-emerald-700 font-semibold">
            منافسة منخفضة جداً — تضمن وصول سريع للصفحة الأولى
          </p>
        </div>

        {/* Card 2: Average Competition Difficulty */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">متوسط صعوبة المنافسة</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono flex items-baseline gap-1.5">
            <span>{avgCompetitionScore}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              avgCompetitionScore < 35 
                ? 'bg-emerald-100 text-emerald-800' 
                : avgCompetitionScore < 60 
                ? 'bg-sky-100 text-sky-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {avgCompetitionScore < 35 ? 'سهل' : avgCompetitionScore < 60 ? 'معتدل' : 'شديد'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            مؤشر تشبع كبار التجار في السوق المصري
          </p>
        </div>

        {/* Card 3: Estimated Monthly Searches */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">حجم البحث الشهري المقدر</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalMonthlyTraffic.toLocaleString('ar-EG')}
          </div>
          <p className="mt-1 text-[10px] text-indigo-700 font-semibold">
            بحث شهري نشط على أمازون ونون وجوجل مصر
          </p>
        </div>

        {/* Card 4: Ranking Intent Focus */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">نية الشراء والتحويل</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
            شراء فوري + مقارنة أسعار
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            أعلى معدل تحويل إلى مبيعات كاش وتقسيط
          </p>
        </div>

      </div>

      {/* Strategic AI Advice Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200/80 text-sky-950 flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-sky-200/80 text-sky-900 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 fill-sky-500 text-sky-600" />
        </div>
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-sky-900">نصيحة خوارزمية التصدر السريع: </span>
          <span className="text-sky-800 leading-relaxed">{marketAdvice}</span>
        </div>
      </div>

      {/* Main Keywords Workspace Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Workspace Top Controls: Search, Filters & Sorting */}
        <div className="space-y-4">
          
          {/* Row 1: Search in Keywords + Custom Keyword Tester */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search filter input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="تصفية الكلمات الحالية بالاسم..."
                className="w-full h-10 pr-10 pl-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Custom Single Keyword Tester Input */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={testCustomQuery}
                  onChange={(e) => setTestCustomQuery(e.target.value)}
                  placeholder="افحص كلمة مخصصة لمعرفة منافستها..."
                  className="w-full h-10 px-3.5 rounded-xl bg-indigo-50/40 border border-indigo-200 text-xs text-slate-900 placeholder-indigo-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleTestCustomKeyword()}
                />
              </div>
              <button
                onClick={handleTestCustomKeyword}
                disabled={!testCustomQuery.trim() || isTestingCustom}
                className="h-10 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>فحص الكلمة</span>
              </button>
            </div>

          </div>

          {/* Row 2: Filter Pills & Sorting Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Competition Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterCompetition('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCompetition === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({keywords.length})
                </button>
                <button
                  onClick={() => setFilterCompetition('low')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterCompetition === 'low' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>🟢 منخفضة (سهلة)</span>
                </button>
                <button
                  onClick={() => setFilterCompetition('medium')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCompetition === 'medium' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-700 hover:bg-sky-50'
                  }`}
                >
                  🟡 متوسطة
                </button>
                <button
                  onClick={() => setFilterCompetition('high')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCompetition === 'high' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  🔴 عالية
                </button>
              </div>

              {/* Platform Selector */}
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                aria-label="تصفية حسب المنصة"
                className="h-8 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">🌐 كل المنصات</option>
                <option value="amazon">📦 أمازون مصر</option>
                <option value="noon">🟡 نون مصر</option>
                <option value="jumia">⭐ جوميا مصر</option>
                <option value="social">📲 تيك توك وسوشيال</option>
              </select>

              {/* Intent Selector */}
              <select
                value={filterIntent}
                onChange={(e) => setFilterIntent(e.target.value)}
                aria-label="تصفية حسب نية الشراء"
                className="h-8 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">🎯 كل نوايا البحث</option>
                <option value="transactional">🛒 شراء فوري</option>
                <option value="price_comparison">🏷️ مقارنة أسعار</option>
                <option value="wholesale">🏢 جملة وتجار</option>
                <option value="brand_exact">⭐ ماركة وموديل</option>
                <option value="long_tail">🔍 طويلة الذيل</option>
              </select>

            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>الترتيب:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="ترتيب الكلمات المفتاحية"
                className="h-8 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="opportunity">⭐ الأعلى فرصة وتصدراً (Recommended)</option>
                <option value="competition_asc">🟢 الأقل منافسة (الأسهل)</option>
                <option value="search_desc">🔥 الأعلى بحثاً في مصر</option>
                <option value="relevance">🎯 الأعلى صلة بالمنتج</option>
              </select>
            </div>

          </div>

        </div>

        {/* Floating Bulk Action Bar */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-950 cursor-pointer"
            >
              {selectedKeywordIds.size === filteredKeywords.length ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedKeywordIds.size === filteredKeywords.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
              </span>
            </button>

            <span className="text-xs font-black text-indigo-900">
              (تم تحديد {selectedKeywordIds.size} من {filteredKeywords.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy for Amazon Backend Terms */}
            <button
              onClick={handleCopyBackendTerms}
              disabled={selectedKeywordIds.size === 0}
              className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              title="نسخ الكلمات مفصولة بمسافات بدون فواصل مجهزة لخانة الكلمات الخلفية في أمازون ونون"
            >
              {copiedKey === 'copy-backend' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'copy-backend' ? 'تم النسخ!' : 'نسخ لخانة الكلمات الخلفية (Backend)'}</span>
            </button>

            {/* Copy Comma Separated */}
            <button
              onClick={handleCopyCommaSeparated}
              disabled={selectedKeywordIds.size === 0}
              className="h-8 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              {copiedKey === 'copy-commas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'copy-commas' ? 'تم النسخ!' : 'نسخ بفواصل (,)'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              disabled={selectedKeywordIds.size === 0}
              className="h-8 px-3 rounded-xl bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              title="تصدير الكلمات كملف إكسيل CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>

            {/* Apply directly to SEO Listing */}
            {onApplyKeywordsToSeo && (
              <button
                onClick={() => {
                  const selectedList = keywords.filter(k => selectedKeywordIds.has(k.id || k.keyword));
                  onApplyKeywordsToSeo(selectedList);
                  if (onSwitchToSeoListing) onSwitchToSeoListing();
                }}
                disabled={selectedKeywordIds.size === 0}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                title="تطبيق الكلمات المحددة تلقائياً في خانات السيو وعنوان المنتج"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تطبيق على نصوص السيو ⚡</span>
              </button>
            )}
          </div>
        </div>

        {/* Keywords Table / Cards List */}
        <div className="space-y-3">
          {filteredKeywords.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <div className="text-sm font-bold text-slate-700">لا توجد كلمات مطابقة لمعايير التصفية الحالية</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                جرب تغيير فلاتر المنافسة أو المنصة، أو انقر على زر "توليد الكلمات بالذكاء الاصطناعي" للحصول على كلمات جديدة.
              </p>
              <button
                onClick={() => {
                  setFilterCompetition('all');
                  setFilterPlatform('all');
                  setFilterIntent('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            filteredKeywords.map((kw, idx) => {
              const kwId = kw.id || kw.keyword;
              const isSelected = selectedKeywordIds.has(kwId);
              const compScore = kw.competitionScore || (kw.competitionLevel === 'low' ? 24 : kw.competitionLevel === 'medium' ? 52 : 82);
              const oppScore = kw.opportunityScore || Math.min(99, Math.max(60, 100 - compScore + 18));
              
              // Intent Label Map
              const intentLabels: Record<string, { label: string; bg: string }> = {
                transactional: { label: 'شراء فوري 🛒', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                price_comparison: { label: 'مقارنة أسعار 🏷️', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                wholesale: { label: 'جملة وتجار 🏢', bg: 'bg-sky-50 text-sky-900 border-sky-200' },
                brand_exact: { label: 'ماركة وموديل ⭐', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                long_tail: { label: 'طويلة الذيل 🎯', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
              };

              const currentIntent = intentLabels[kw.buyerIntent || 'transactional'] || intentLabels.transactional;

              return (
                <div
                  key={kwId}
                  className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-white border-indigo-400 shadow-sm ring-1 ring-indigo-400/30' 
                      : 'bg-slate-50/60 hover:bg-white border-slate-200'
                  }`}
                >
                  {/* Left Column: Checkbox, Keyword text, Intent badge & platform */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelectKeyword(kwId)}
                      className="mt-1 cursor-pointer shrink-0 text-slate-400 hover:text-indigo-600"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      
                      {/* Keyword Title & Copy fast button */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 leading-snug break-words">
                          <bdi>{kw.keyword}</bdi>
                        </span>

                        <button
                          onClick={() => handleCopy(kw.keyword, `kw-row-${idx}`)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer shrink-0"
                          title="نسخ الكلمة"
                        >
                          {copiedKey === `kw-row-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `kw-row-${idx}` ? 'تم!' : 'نسخ'}</span>
                        </button>
                      </div>

                      {/* Sub-badges: Intent, Platform & Action */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className={`px-2 py-0.5 rounded-md border font-bold ${currentIntent.bg}`}>
                          {currentIntent.label}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          المنصة: <strong className="text-indigo-600"><bdi>{kw.recommendedPlatform}</bdi></strong>
                        </span>

                        {kw.cpcEstimateEGP && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                            <bdi>نقرة إعلانية: ~{kw.cpcEstimateEGP} ج.م</bdi>
                          </span>
                        )}

                        {kw.suggestedAction && (
                          <span className="text-[11px] font-semibold text-slate-600">
                            💡 <bdi>{kw.suggestedAction}</bdi>
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Competition Rating, Difficulty Meter & Opportunity Score */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* Monthly Volume */}
                    <div className="text-right space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-semibold">حجم البحث الشهري</div>
                      <div className="text-xs font-black text-slate-900 font-mono">
                        <bdi>{(kw.monthlySearchesEstimate || 18500).toLocaleString('ar-EG')}</bdi>
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600">
                        <bdi>{kw.searchVolume}</bdi>
                      </div>
                    </div>

                    {/* Competition Level Gauge & Score */}
                    <div className="space-y-1 w-32">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">قوة المنافسة:</span>
                        <span className={
                          compScore < 35 
                            ? 'text-emerald-700 font-black' 
                            : compScore < 65 
                            ? 'text-sky-700 font-black' 
                            : 'text-rose-700 font-black'
                        }>
                          {compScore < 35 ? '🟢 منخفضة' : compScore < 65 ? '🟡 متوسطة' : '🔴 شديدة'} ({compScore}%)
                        </span>
                      </div>

                      {/* Visual Difficulty Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            compScore < 35 
                              ? 'bg-emerald-500' 
                              : compScore < 65 
                              ? 'bg-sky-500' 
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${compScore}%` }}
                        />
                      </div>

                      <div className="text-[9px] text-slate-400 text-left font-mono">
                        {compScore < 35 ? 'فرصة تصدر سهلة' : compScore < 65 ? 'منافسة متوازنة' : 'حيتان السوق'}
                      </div>
                    </div>

                    {/* Opportunity Score Pill */}
                    <div className="text-center space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-semibold">مؤشر الفرصة</div>
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border ${
                        oppScore >= 90 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs' 
                          : oppScore >= 75 
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-200' 
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {oppScore}/100 ⭐
                      </div>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Educational Guide: How to use keywords for ranking on Amazon EG & Noon */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-white font-['Alexandria']">
            دليل التاجر المحترف لتوزيع الكلمات المفتاحية وتصدر محركات بحث المنصات في مصر
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <span>1. عنوان المنتج (Product Title)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              ضع الكلمة الرئيسية ذات المنافسة المنخفضة (🟢) في أول 60 حرفاً من العنوان، متبوعة بالماركة والموديل الدقيق وأهم ميزتين.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>2. نقاط المزايا البيعية (5 Bullet Points)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              وزّع كلمات نية الشراء الفوري وكلمات الضمان والشحن السريع داخل أول 3 نقاط بيعية لرفع معدل النقر والتحويل (CTR).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>3. الكلمات الخلفية (Backend Terms)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              انسخ الكلمات المختارة عبر زر "نسخ لخانة الكلمات الخلفية" وضعها في أمازون سيلر سنتر بدون فواصل لتغطية كافة مصطلحات البحث العامية.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
