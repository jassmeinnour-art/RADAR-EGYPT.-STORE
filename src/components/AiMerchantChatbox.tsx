import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  Percent,
  CheckCircle2,
  ChevronDown,
  Info,
  HelpCircle,
  Zap,
  Tag,
  Store,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ProductData, WatchlistItem, ConnectedMerchantPlatform, ChatMessage, PricingRecommendationAction } from '../types';
import confetti from 'canvas-confetti';

interface AiMerchantChatboxProps {
  allProducts: ProductData[];
  activeProducts: ProductData[];
  archivedProducts: ProductData[];
  currentProduct?: ProductData;
  watchlist: WatchlistItem[];
  connectedPlatforms: ConnectedMerchantPlatform[];
  currency?: string;
  onApplyReprice?: (productId: string, newPrice: number) => void;
  onSelectProduct?: (product: ProductData) => void;
  onShowToast?: (message: string) => void;
}

const QUICK_PROMPTS = [
  {
    id: 'qp-profit',
    label: 'ما هي أكثر المنتجات ربحية في متجري؟',
    icon: DollarSign,
    prompt: 'حلل منتجات متجري واذكر لي المنتجات الأعلى من حيث هامش الربح وصافي الأرباح المتوقعة، مع نصائح للحفاظ على أرباحها.'
  },
  {
    id: 'qp-buybox',
    label: 'استراتيجية اكتساح الباي بوكس (Buy Box)',
    icon: Zap,
    prompt: 'اقترح استراتيجية تسعير تنافسية لاكتساح صندوق الشراء (Buy Box) في أمازون ونون للمنتجات النشطة، مع الحفاظ على هامش ربح لا يقل عن 12%.'
  },
  {
    id: 'qp-threatened',
    label: 'المنتجات المهددة بخسارة المنافسة',
    icon: AlertTriangle,
    prompt: 'افحص عروض المنافسين في المتجر، وحدد الأصناف التي يبيع فيها المنافسون بأسعار أقل من سعري، واقترح حلاً تسعيرياً سريعاً.'
  },
  {
    id: 'qp-commissions',
    label: 'مقارنة عمولات نون وأمازون وجوميا',
    icon: Percent,
    prompt: 'قارن صافي ربحي بين منصات نون وأمازون وجوميا للمنتجات النشطة بعد خصم العمولات (Referral + Closing) وضريبة القيمة المضافة 14%.'
  },
  {
    id: 'qp-archive',
    label: 'تحليل منتجات الأرشيف وفرص استعادتها',
    icon: ShoppingBag,
    prompt: 'راجع المنتجات المؤرشفة في متجري، وهل هناك أي صنف يمكن إعادة تفعيله وتسعيره بشكل مربح في الوقت الحالي؟'
  },
  {
    id: 'qp-wholesale',
    label: 'أفضل أسواق الجملة وتخفيض التكلفة',
    icon: Store,
    prompt: 'ما هي أفضل أسواق الجملة الفعلية (شارع عبد العزيز، مول البستان، العتبة) لتوريد منتجاتي بأرخص تكلفة كاش؟'
  }
];

export const AiMerchantChatbox: React.FC<AiMerchantChatboxProps> = ({
  allProducts,
  activeProducts,
  archivedProducts,
  currentProduct,
  watchlist,
  connectedPlatforms,
  currency = 'EGP',
  onApplyReprice,
  onSelectProduct,
  onShowToast
}) => {
  // Widget state: 'collapsed' | 'expanded' | 'fullscreen'
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedScopeProductId, setSelectedScopeProductId] = useState<string>('all');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [appliedPriceIds, setAppliedPriceIds] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const initialGreeting: ChatMessage = useMemo(() => {
    return {
      id: 'msg-welcome',
      role: 'assistant',
      content: `مرحباً بك! أنا **المستشار الذكي للمسوق والتاجر المصري** 🤖🇪🇬 مدعوم بنموذج **Gemini 3.7 Flash**.\n\nلقد قمت بربط وتحليل بيانات متجرك:\n- **${activeProducts.length} منتجات نشطة** متاحة للبيع والتسعير.\n- **${archivedProducts.length} منتجات بالأرشيف** محفوظة بتاريخ أسعارها.\n- **${watchlist.length} أصناف** تحت مراقبة تحركات أسعار المنافسين.\n- **${connectedPlatforms.filter(p => p.isConnected).length} منصات** بيع مرتبطة (أمازون، نون، جوميا، وغيرها).\n\nيمكنك سؤالي عن: **تحليل هوامش الربح**، **اقتراح أسعار الفوز بالباي بوكس**، **حساب صافي العمولات**، أو **استشارات أسواق الجملة** (شارع عبد العزيز ومول البستان).`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'ما هي المنتجات الأكثر ربحية في متجري؟',
        'اقترح تسعير لاكتساح الباي بوكس في نون وأمازون',
        'ما الأصناف المهددة بخسارة المنافسة؟'
      ]
    };
  }, [activeProducts.length, archivedProducts.length, watchlist.length, connectedPlatforms]);

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  // Keep selected product in sync with parent when changed
  useEffect(() => {
    if (currentProduct && selectedScopeProductId === 'all') {
      // Optional auto-sync if desired, but keep 'all' as default for flexibility
    }
  }, [currentProduct]);

  // Scroll to bottom of chat whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Send message to Gemini backend
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      selectedProductId: selectedScopeProductId !== 'all' ? selectedScopeProductId : undefined
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Find selected product if specific
      const targetProduct = selectedScopeProductId !== 'all' 
        ? allProducts.find(p => p.id === selectedScopeProductId) || currentProduct
        : (currentProduct || null);

      const response = await fetch('/api/merchant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          selectedProduct: selectedScopeProductId !== 'all' ? targetProduct : null,
          currency,
          contextData: {
            products: allProducts,
            activeCount: activeProducts.length,
            archivedCount: archivedProducts.length,
            watchlist,
            connectedPlatforms,
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `msg-gemini-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          suggestedPriceAction: data.suggestedPriceAction || null,
          suggestedActions: [
            'هل هناك بدائل تسعيرية أخرى؟',
            'ما تأثير هذا السعر على عمولة المنصة؟',
            'كيف أروج لهذا المنتج في تيك توك وسوشيال ميديا؟'
          ]
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: data.fallbackReply || data.error || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'تعذر الاتصال بخادم الذكاء الاصطناعي حالياً. تأكد من اتصال الإنترنت ثم أعد المحاولة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick apply recommended price from AI
  const handleApplyRecommendedPrice = (action: PricingRecommendationAction) => {
    if (!onApplyReprice) return;

    onApplyReprice(action.productId, action.recommendedPrice);
    setAppliedPriceIds(prev => ({ ...prev, [action.productId]: action.recommendedPrice }));

    if (onShowToast) {
      onShowToast(`تم بنجاح تطبيق السعر المقترح من الذكاء الاصطناعي: ${action.recommendedPrice} ${currency} 🚀`);
    }

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Copy message to clipboard
  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
    if (onShowToast) {
      onShowToast('تم نسخ التحليل إلى الحافظة بنجاح 📋');
    }
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([initialGreeting]);
    if (onShowToast) {
      onShowToast('تمت إعادة ضبط جلسة المحادثة');
    }
  };

  // Render markdown-like simple formatting (bold, headers, bullets, pricing highlights)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Clean up markdown markers
      let trimmed = line.trim();

      // Heading 3 or 2
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        const headingText = trimmed.replace(/^#{2,3}\s*/, '');
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1.5 flex items-center gap-1.5 border-r-2 border-indigo-500 pr-2">
            <span>{headingText}</span>
          </h4>
        );
      }

      // Bullet item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const bulletText = trimmed.replace(/^[-*•]\s*/, '');
        return (
          <li key={idx} className="text-xs text-slate-700 leading-relaxed mr-3 list-disc my-0.5">
            {renderInlineMarkdown(bulletText)}
          </li>
        );
      }

      // Numbered item
      if (/^\d+\.\s/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s*/, '');
        return (
          <div key={idx} className="text-xs text-slate-700 leading-relaxed my-1 flex items-start gap-1.5">
            <span className="font-bold text-indigo-600 text-[11px] bg-indigo-50 px-1.5 py-0.5 rounded-sm">
              {trimmed.match(/^\d+/)?.[0]}.
            </span>
            <div className="flex-1">{renderInlineMarkdown(itemText)}</div>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for inline bolding & numbers
  const renderInlineMarkdown = (text: string) => {
    // Match bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldContent = part.slice(2, -2);
        return (
          <strong key={pIdx} className="font-bold text-slate-900 bg-slate-100/80 px-1 py-0.5 rounded-sm">
            {boldContent}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Always visible at bottom-left of viewport, coordinated with Owner Debugger & Daily Report) */}
      {!isOpen && (
        <div className="fixed bottom-20 left-3.5 sm:bottom-5 sm:left-6 z-40 max-w-[calc(50vw-1rem)] sm:max-w-none">
          <button
            id="btn-open-ai-merchant-chat"
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 sm:gap-2.5 h-11 px-3 sm:px-4 bg-[#08090D]/95 hover:bg-slate-900 text-white rounded-xl shadow-xl shadow-black/60 transition-all duration-200 active:scale-95 cursor-pointer border border-sky-500/35 hover:border-sky-400/60 backdrop-blur-md select-none w-full sm:w-auto"
            title="المستشار الذكي للمسوق - استشارات تسعير وتحليل أداء السوق"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full" />
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[11px] sm:text-xs font-black tracking-tight text-white whitespace-nowrap truncate">
                  المستشار الذكي
                </span>
                <span className="hidden xs:inline-flex text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold px-1.5 py-0.5 rounded-md">
                  Gemini
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium truncate mt-0.5">
                استشارات التسعير وتحليل السوق
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Main AI Chatbox Window */}
      {isOpen && (
        <div
          id="ai-merchant-chatbox-window"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden font-['Cairo']
            ${isExpanded 
              ? 'bottom-4 left-4 right-4 md:right-auto md:w-[720px] h-[85vh] max-h-[800px]' 
              : 'bottom-4 left-4 right-4 sm:right-auto sm:w-[440px] h-[600px] max-h-[90vh]'
            }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-indigo-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight">المستشار الذكي للتسعير والسوق</h3>
                  <span className="text-[9px] bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.2 rounded-full font-mono">
                    Gemini 3.7
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متصل ببيانات المتجر والمنصات المصرية</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                id="btn-chat-clear"
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="إعادة بدء المحادثة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-chat-toggle-expand"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'تصغير الحجم' : 'تكبير العرض'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                id="btn-chat-close"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                title="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Focus & Scope Selector Ribbon */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium shrink-0">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px]">نطاق التحليل:</span>
            </div>

            <select
              id="select-chat-product-scope"
              value={selectedScopeProductId}
              onChange={(e) => setSelectedScopeProductId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-[11px] font-semibold rounded-lg px-2 py-1 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1 truncate cursor-pointer"
            >
              <option value="all">🏪 المتجر بالكامل (كافة المنتجات النشطة والمؤرشفة)</option>
              <optgroup label="المنتجات النشطة">
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    📦 {p.title} ({p.currentLowestPrice} {currency})
                  </option>
                ))}
              </optgroup>
              {archivedProducts.length > 0 && (
                <optgroup label="المنتجات المؤرشفة">
                  {archivedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      🗄️ {p.title} (مؤرشف - {p.estimatedWholesaleCost} {currency})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold
                      ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-sky-300 border border-slate-700'}`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs text-xs transition-all relative group
                      ${isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-xs' 
                        : msg.isError 
                          ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                  >
                    {/* Message Content */}
                    <div className="space-y-1">
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        renderFormattedContent(msg.content)
                      )}
                    </div>

                    {/* Actionable Pricing Recommendation Box (If generated) */}
                    {msg.suggestedPriceAction && !isUser && (
                      <div className="mt-3 p-3 bg-gradient-to-br from-sky-50/80 to-indigo-50/80 border border-sky-200/80 rounded-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-sky-700" />
                            <span className="font-bold text-[11px] text-sky-900">توصية تسعير فورية مقترحة:</span>
                          </div>
                          <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-1.5 py-0.2 rounded-md">
                            اكتساح الباي بوكس ⚡
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs my-2 pb-2 border-b border-sky-200/60">
                          <div>
                            <span className="text-slate-500 text-[10px] block">السعر المقترح:</span>
                            <span className="font-black text-indigo-700 text-base">
                              {msg.suggestedPriceAction.recommendedPrice} {currency}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-slate-500 text-[10px] block">السعر الحالي:</span>
                            <span className="font-medium text-slate-600 line-through text-xs">
                              {msg.suggestedPriceAction.currentPrice} {currency}
                            </span>
                          </div>
                        </div>

                        {msg.suggestedPriceAction.reason && (
                          <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                            💡 {msg.suggestedPriceAction.reason}
                          </p>
                        )}

                        {/* Apply Price CTA Button */}
                        {onApplyReprice && (
                          <button
                            id={`btn-apply-rec-price-${msg.id}`}
                            onClick={() => msg.suggestedPriceAction && handleApplyRecommendedPrice(msg.suggestedPriceAction)}
                            disabled={appliedPriceIds[msg.suggestedPriceAction.productId] === msg.suggestedPriceAction.recommendedPrice}
                            className={`w-full py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs
                              ${appliedPriceIds[msg.suggestedPriceAction.productId] === msg.suggestedPriceAction.recommendedPrice
                                ? 'bg-emerald-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                          >
                            {appliedPriceIds[msg.suggestedPriceAction.productId] === msg.suggestedPriceAction.recommendedPrice ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تم تطبيق السعر بنجاح في متجرك ✅</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 text-sky-300" />
                                <span>تطبيق هذا السعر الآن ({msg.suggestedPriceAction.recommendedPrice} {currency})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Message Footer: Timestamp & Copy */}
                    <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>

                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                          title="نسخ النص"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator when Gemini is thinking */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-sky-300 border border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري تحليل بيانات المتجر واحتساب الأسعار...</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="mr-1.5">مقارنة عروض نون، أمازون وأسواق الجملة</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips Carousel */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>أسئلة تحليلية مقترحة بنقرة واحدة:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_PROMPTS.map((qp) => {
                const IconComponent = qp.icon;
                return (
                  <button
                    key={qp.id}
                    id={`btn-chip-${qp.id}`}
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    <IconComponent className="w-3 h-3 text-slate-500" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Control Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="input-ai-chat-query"
                ref={textareaRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="اكتب استفسارك التحليلي أو اطلب اقتراح تسعير..."
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 disabled:opacity-60"
              />

              <button
                id="btn-send-ai-chat"
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="h-10 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0"
                title="إرسال السؤال"
              >
                <Send className="w-4 h-4 rtl:-scale-x-100" />
                <span className="hidden sm:inline">إرسال</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
