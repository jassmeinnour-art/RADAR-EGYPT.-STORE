import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  TrendingDown, 
  Users, 
  LineChart, 
  Archive, 
  Calculator, 
  Calendar, 
  Compass, 
  Truck, 
  ShieldCheck, 
  Key, 
  TrendingUp, 
  BarChart3, 
  SlidersHorizontal, 
  Bookmark, 
  Hash, 
  Layers, 
  Image as ImageIcon, 
  Package, 
  Building2, 
  Bell, 
  FileText, 
  Camera, 
  Sparkles, 
  FileSpreadsheet, 
  Smartphone, 
  CornerDownLeft,
  DollarSign
} from 'lucide-react';
import { ProductData } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  allProducts: ProductData[];
  onSelectProduct: (product: ProductData) => void;
  onOpenScanner: () => void;
  onOpenAiExcelModal: () => void;
  onOpenExportModal: () => void;
  onOpenFxCalculator: () => void;
  onTriggerPwaInstall?: () => void;
  currency?: string;
}

interface CommandItem {
  id: string;
  type: 'navigation' | 'product' | 'action';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  allProducts,
  onSelectProduct,
  onOpenScanner,
  onOpenAiExcelModal,
  onOpenExportModal,
  onOpenFxCalculator,
  onTriggerPwaInstall,
  currency = 'EGP'
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build All Commands List
  const allCommands = useMemo<CommandItem[]>(() => {
    const commands: CommandItem[] = [];

    // 1. Quick Actions
    commands.push({
      id: 'act-scanner',
      type: 'action',
      title: 'مسح منتج جديد بالكاميرا أو الباركود',
      subtitle: 'التقاط صورة للسلعة واستخراج الأسعار المنافسة فوراً',
      badge: 'إدخال فوري 📸',
      icon: Camera,
      action: () => { onClose(); onOpenScanner(); }
    });

    commands.push({
      id: 'act-excel-ai',
      type: 'action',
      title: 'رفع وإثراء شيت إكسيل بالذكاء الاصطناعي',
      subtitle: 'ملء المواصفات ولينكات الصور وأقل سعر للمنافسين تلقائياً',
      badge: 'AI إكسيل ✨',
      icon: Sparkles,
      action: () => { onClose(); onOpenAiExcelModal(); }
    });

    commands.push({
      id: 'act-export',
      type: 'action',
      title: 'تصدير الكتالوج والأسعار Excel / CSV / PDF',
      subtitle: 'تنزيل تقارير دورية متكاملة لبيانات المتجر والأسعار',
      badge: 'تقارير 📊',
      icon: FileSpreadsheet,
      action: () => { onClose(); onOpenExportModal(); }
    });

    commands.push({
      id: 'act-fx-calc',
      type: 'action',
      title: 'حاسبة تكاليف الاستيراد والدولار الجمركي (Landed Cost)',
      subtitle: 'احتساب سعر التكلفة النهائي الواصل للمخزن بعد الشحن والجمارك والضريبة',
      badge: 'عملات وتكاليف 💵',
      icon: DollarSign,
      action: () => { onClose(); onOpenFxCalculator(); }
    });

    if (onTriggerPwaInstall) {
      commands.push({
        id: 'act-install-pwa',
        type: 'action',
        title: 'تثبيت تطبيق رادار التاجر الذكي على الهاتف (PWA)',
        subtitle: 'تثبيت سريع للوصول من الشاشة الرئيسية بدون متجر وبكفاءة كاملة',
        badge: 'تطبيق هاتف 📱',
        icon: Smartphone,
        action: () => { onClose(); onTriggerPwaInstall(); }
      });
    }

    // 2. Navigation Screens
    const navScreens = [
      { id: 'radar', title: 'رادار المنافسين والتسعير', subtitle: 'الرصد الفوري لأسعار المنافسين وسعر البيع الرابح', icon: TrendingDown, badge: 'رئيسي ⚡' },
      { id: 'direct_competitors', title: 'المنافسون المباشرون', subtitle: 'جدول مقارنة أسعار التاجر والمنافسين لحظة بلحظة مع حصة Buy Box لكل منصة', icon: Users, badge: 'Buy Box 🏆' },
      { id: 'smart_market_analytics', title: 'تحليلات السوق الذكية', subtitle: 'الرسوم البيانية لاتجاهات أسعار المنافسين على مدار 30 يوماً (Recharts)', icon: LineChart, badge: '30 يوم 📊' },
      { id: 'remote_merchants', title: 'متابعة التجار وتقاريرهم وإيميلاتهم', subtitle: 'إدارة حسابات التجار المتعددة وتقاريرهم الدورية', icon: Users, badge: 'تجار 👥' },
      { id: 'sales_dashboard', title: 'لوحة أداء المبيعات والتسعير', subtitle: 'تحليلات Buy Box ونسب الربحية وحجم المبيعات', icon: LineChart, badge: 'مبيعات 📈' },
      { id: 'archived_products', title: 'أرشيف المنتجات غير النشطة والموقوفة', subtitle: 'استرجاع وحفظ المنتجات المؤقتة والمخفية', icon: Archive, badge: 'أرشيف 🗄️' },
      { id: 'platform_commissions', title: 'حاسبة عمولات المنصات وصافي الربح', subtitle: 'أمازون، نون، جوميا، كنز مع الضريبة 14%', icon: Calculator, badge: 'عمولات 🧮' },
      { id: 'seasonal_forecast', title: 'توقع الطلب الموسمي والذروة', subtitle: 'مواسم رمضان والأعياد والجمعة البيضاء', icon: Calendar, badge: 'تنبؤ 📦' },
      { id: 'market_trends', title: 'رادار اتجاهات السوق والطلب', subtitle: 'السلع الأكثر رواجاً ومعدلات النمو في مصر', icon: Compass, badge: 'رائج 📈' },
      { id: 'order_scheduling', title: 'جدولة الطلبات وبوالص الشحن', subtitle: 'إدارة مواعيد التسليم وتوليد بوالص منفصلة', icon: Truck, badge: 'شحن 🚚' },
      { id: 'pricing_guardrails', title: 'حدود حماية التسعير والمنصات', subtitle: 'تعيين الحدود الدنيا لمنع حرق الأسعار', icon: ShieldCheck, badge: 'أمان 🛡️' },
      { id: 'marketer_hub', title: 'صلاحيات المسوق والرقابة', subtitle: 'أدوار الفريق وسجل تدقيق التسعير', icon: Key, badge: 'رقابة 👑' },
      { id: 'profit_simulator', title: 'محاكي الربح المستقبلي', subtitle: 'نمذجة رياضية تنبؤية لهوامش الربح', icon: TrendingUp, badge: 'محاكاة 💎' },
      { id: 'periodic_reports', title: 'تقارير الأداء والرسوم البيانية', subtitle: 'مخططات دورية لأداء المتاجر والمنتجات', icon: BarChart3, badge: 'تقارير 📊' },
      { id: 'bulk_repricing', title: 'التحديث الجماعي للأسعار وCSV', subtitle: 'تطبيق قواعد التسعير لجميع المنتجات دفعة واحدة', icon: SlidersHorizontal, badge: 'جماعي 🚀' },
      { id: 'watchlist', title: 'قائمة المتابعة والرصد المستمر', subtitle: 'تتبع هبوط أسعار المنتجات المحفوظة', icon: Bookmark, badge: 'متابعة ⭐' },
      { id: 'seo_keywords', title: 'توليد الكلمات المفتاحية بالذكاء الاصطناعي', subtitle: 'تحسين ترتيب ظهور المنتج في بحث المنصات', icon: Hash, badge: 'سيو AI' },
      { id: 'seo_listing', title: 'نصوص السيو الجاهزة للمنصات', subtitle: 'عناوين وأوصاف مطابقة لمواصفات أمازون ونون', icon: Layers, badge: 'نصوص SEO' },
      { id: 'image_studio', title: 'استوديو تصوير وزوايا المنتج', subtitle: 'خلفيات متوافقة مع اشتراطات المنصات الرسمية', icon: ImageIcon, badge: 'استوديو 📸' },
      { id: 'inventory', title: 'تتبع مستويات المخزون ونقاط الطلب', subtitle: 'إدارة مستودعات ونقاط إعادة الطلب التلقائية', icon: Package, badge: 'مخزون 📦' },
      { id: 'supplier_offers', title: 'عروض الموردين وأسعار الجملة اليومية', subtitle: 'قائمة محدثة بأسعار الجملة اليومية من شبكة الموردين المعتمدين في مصر مع تنبيهات الخصومات الحصرية', icon: Building2, badge: 'عروض جملة 👑' },
      { id: 'wholesale', title: 'أسواق الجملة ومنافذ مصر', subtitle: 'العتبة وباب الشعرية وشارع عبد العزيز', icon: Building2, badge: 'جملة 🏢' },
      { id: 'price_alerts', title: 'تنبيهات هبوط الأسعار وواتساب', subtitle: 'إشعارات لحظية عند خفض المنافس لأسعاره', icon: Bell, badge: 'تنبيهات 📲' },
      { id: 'platforms_guide', title: 'دليل المنصات والاشتراك والأوراق', subtitle: 'شروط التسجيل والعمولات والضريبة للمنصات', icon: FileText, badge: 'دليل 📑' },
    ];

    navScreens.forEach(screen => {
      commands.push({
        id: `nav-${screen.id}`,
        type: 'navigation',
        title: screen.title,
        subtitle: screen.subtitle,
        badge: screen.badge,
        icon: screen.icon,
        action: () => {
          onClose();
          onSelectTab(screen.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // 3. Products
    allProducts.forEach(product => {
      commands.push({
        id: `prod-${product.id}`,
        type: 'product',
        title: product.title,
        subtitle: `أقل منافس: ${product.currentLowestPrice.toLocaleString()} ${currency} • التكلفة: ${product.estimatedWholesaleCost.toLocaleString()} ${currency}`,
        badge: product.brand || 'منتج',
        icon: Package,
        action: () => {
          onClose();
          onSelectProduct(product);
          onSelectTab('radar');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    return commands;
  }, [allProducts, onSelectTab, onSelectProduct, onClose, onOpenScanner, onOpenAiExcelModal, onOpenExportModal, onOpenFxCalculator, onTriggerPwaInstall, currency]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return allCommands;
    }
    return allCommands.filter(cmd => 
      cmd.title.toLowerCase().includes(cleanQuery) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(cleanQuery)) ||
      (cmd.badge && cmd.badge.toLowerCase().includes(cleanQuery))
    );
  }, [allCommands, query]);

  // Handle arrow keys
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 animate-fadeIn font-['Cairo']"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[85vh] animate-scaleIn text-right"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن شاشة، منتج، إجراء سريع، بوالص، عمولات، أو أسعار (Ctrl + K)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden font-bold"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC للإغلاق
          </kbd>
        </div>

        {/* Categories / Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 flex-1 max-h-[60vh]">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">لا توجد نتائج تطابق "{query}"</p>
              <p className="text-[11px] text-slate-500">جرب البحث بكلمات أخرى مثل "مخزون"، "أمازون"، "سماعة"، أو "تصدير"</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'hover:bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        {cmd.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}>
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-md">
                        <span>تنفيذ</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">↓</kbd>
              <span>للتنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Enter</kbd>
              <span>للاختيار</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-400">
            <span>رادار التاجر الذكي مصر</span>
            <span className="text-[10px] px-1 rounded bg-indigo-500/20">21 شاشة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
