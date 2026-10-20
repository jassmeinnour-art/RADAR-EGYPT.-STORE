import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Share2,
  Download,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  TrendingDown,
  AlertCircle,
  Folder,
  Layers,
  ArrowRight,
  Filter,
  Search,
  Smartphone,
  Zap,
  Home,
  Flame,
  MessageCircle,
  BellRing
} from 'lucide-react';
import { WishlistItem, WishlistPriority, WishlistFolder } from '../types';
import {
  subscribeToWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  exportWishlistToCSV,
  shareWishlistWhatsApp,
  getLocalWishlistFolders,
  saveLocalWishlistFolders,
  getLocalCachedWishlist
} from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';

interface WishlistManagerProps {
  onShowToast?: (msg: string) => void;
  onNavigateToAlerts?: (productId?: string) => void;
  onNavigateToRadar?: (search?: string) => void;
}

export const WishlistManager: React.FC<WishlistManagerProps> = ({
  onShowToast,
  onNavigateToAlerts,
  onNavigateToRadar,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>(() => getLocalCachedWishlist());
  const [folders, setFolders] = useState<WishlistFolder[]>(() => getLocalWishlistFolders());
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  // New Item Form state
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCurrentPrice, setNewCurrentPrice] = useState<number | ''>('');
  const [newTargetPrice, setNewTargetPrice] = useState<number | ''>('');
  const [newPriority, setNewPriority] = useState<WishlistPriority>('high');
  const [newFolder, setNewFolder] = useState<string>('electronics');
  const [newNotes, setNewNotes] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('أمازون مصر');

  useEffect(() => {
    const unsub = subscribeToWishlist(user?.uid, (updatedItems) => {
      setItems(updatedItems);
    });
    return () => unsub();
  }, [user?.uid]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeFolder !== 'all' && item.folder !== activeFolder) {
        return false;
      }
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.productTitle || '').toLowerCase().includes(q);
        const matchBrand = (item.brand || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchNotes) return false;
      }
      return true;
    });
  }, [items, activeFolder, selectedPriority, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const targetReached = items.filter(i => (i.currentPrice || 0) <= (i.targetPrice || 0) || i.isTargetPriceReached).length;
    const highPriority = items.filter(i => i.priority === 'high').length;
    const totalPotentialSavings = items.reduce((acc, curr) => {
      const diff = Math.max(0, curr.currentPrice - curr.targetPrice);
      return acc + diff;
    }, 0);
    return { total, targetReached, highPriority, totalPotentialSavings };
  }, [items]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetPrice) {
      onShowToast?.('يرجى كتابة اسم المنتج وتحديد السعر المستهدف');
      return;
    }

    const cur = typeof newCurrentPrice === 'number' ? newCurrentPrice : Number(newTargetPrice) * 1.1;
    const target = Number(newTargetPrice);

    await addToWishlist(user?.uid || 'guest-merchant', {
      userId: user?.uid || 'guest-merchant',
      productId: `PROD-${Date.now()}`,
      productTitle: newTitle.trim(),
      brand: newBrand.trim() || 'متنوع',
      category: newCategory.trim() || 'عام',
      currentPrice: cur,
      targetPrice: target,
      priority: newPriority,
      folder: newFolder,
      notes: newNotes.trim(),
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      targetPlatforms: ['amazon_eg', 'noon_eg'],
      competitorSource: newCompetitor,
      notifyWhenAvailable: true,
      priceDropEGP: Math.max(0, cur - target),
    });

    onShowToast?.('تمت إضافة المنتج لقائمة أمنيات التاجر بنجاح ❤️');
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await updateWishlistItem(user?.uid || 'guest-merchant', editingItem.id, {
      productTitle: editingItem.productTitle,
      targetPrice: editingItem.targetPrice,
      currentPrice: editingItem.currentPrice,
      priority: editingItem.priority,
      folder: editingItem.folder,
      notes: editingItem.notes,
    });

    onShowToast?.('تم حفظ التعديلات بنجاح ✨');
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('هل تريد إزالة هذا الصنف من قائمة أمنياتك؟')) {
      await removeFromWishlist(user?.uid || 'guest-merchant', itemId);
      onShowToast?.('تم حذف الصنف من قائمة الأمنيات');
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewBrand('');
    setNewCategory('');
    setNewCurrentPrice('');
    setNewTargetPrice('');
    setNewPriority('high');
    setNewFolder('electronics');
    setNewNotes('');
    setNewImageUrl('');
    setNewCompetitor('أمازون مصر');
  };

  const getPriorityBadge = (priority: WishlistPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            أولوية قصوى 🔥
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            أولوية متوسطة
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            عادية
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-xs">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  قائمة أمنيات التاجر والصفقات المرتقبة
                  <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-semibold border border-rose-200">
                    رصد الصفقات 🎯
                  </span>
                </h1>
                <p className="text-sm text-slate-500">
                  خزينة الصفقات والسلع المستهدفة: حدد السعر الرابح لكل صنف وتلقَّ إشعاراً فور تحققه للشراء وإعادة البيع
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              إضافة أمنية جديدة
            </button>
            <button
              onClick={() => shareWishlistWhatsApp(filteredItems)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              مشاركة واتساب
            </button>
            <button
              onClick={() => exportWishlistToCSV(filteredItems)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
            >
              <Download className="w-4 h-4" />
              تصدير CSV
            </button>
          </div>
        </div>

        {/* Micro KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="text-xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500 font-medium">إجمالي السلع بالأمنيات</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <div className="text-xl font-bold text-emerald-700 flex items-center justify-center gap-1">
              <span>{stats.targetReached}</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-700 font-medium">وصلت للسعر المستهدف 🎯</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
            <div className="text-xl font-bold text-rose-700">{stats.highPriority}</div>
            <div className="text-xs text-rose-600 font-medium">أولوية قصوى واقتناص</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
            <div className="text-xl font-bold text-indigo-700">
              {stats.totalPotentialSavings.toLocaleString()} ج.م
            </div>
            <div className="text-xs text-indigo-600 font-medium">وفر أرباح متوقع</div>
          </div>
        </div>
      </div>

      {/* Folders and Search Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Folders / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFolder === f.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{f.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFolder === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {f.id === 'all' ? items.length : items.filter(i => i.folder === f.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Priority Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في قائمة الأمنيات..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">تصفية بالأولوية:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-1.5 px-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">كافة الأولويات</option>
              <option value="high">أولوية قصوى 🔥</option>
              <option value="medium">متوسطة</option>
              <option value="low">عادية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Price Reached Alert Banner if any */}
      {stats.targetReached > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <CheckCircle2 className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-sm">
                تهانينا! وصل {stats.targetReached} من منتجات قائمة أمنياتك إلى السعر المستهدف للشراء 🎯
              </div>
              <div className="text-xs text-emerald-100">
                الأسعار الحالية مطابقة أو أقل من أهدافك للربح. استغل الفرصة واشترِ الآن لإعادة البيع بالمنصات.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFolder('all');
              setSelectedPriority('all');
            }}
            className="px-3.5 py-1.5 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
          >
            عرض المنتجات
          </button>
        </div>
      )}

      {/* Wishlist Items Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">قائمة أمنياتك فارغة في هذا المجلد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            قم بإضافة السلع التي تتمنى شراءها بسعر مخفض، لتتبع هبوطها وتلقي تنبيهات عند وصولها للسعر المناسب.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            إضافة أمنية جديدة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => {
            const isReached = (item.currentPrice || 0) <= (item.targetPrice || 0) || item.isTargetPriceReached;
            const diffPrice = (item.currentPrice || 0) - (item.targetPrice || 0);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isReached ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                {/* Card Top: Image and Badges */}
                <div className="relative p-4 pb-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getPriorityBadge(item.priority)}
                      {isReached ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          تحقق الهدف 🎯
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          في انتظار الهبوط
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="حذف من الأمنيات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <span>{item.brand || 'ماركة مسجلة'}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.competitorSource || 'سوق محلي'}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                        {item.productTitle}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Card Middle: Price Comparison Matrix */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block">السعر الحالي بالمنصة</span>
                      <span className="text-sm font-bold text-slate-800">
                        {item.currentPrice.toLocaleString()} ج.م
                      </span>
                    </div>

                    <div className="border-r border-slate-200 pr-2">
                      <span className="text-[10px] text-rose-600 font-semibold block">السعر المستهدف</span>
                      <span className="text-sm font-black text-rose-700">
                        {item.targetPrice.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>

                  {diffPrice > 0 ? (
                    <div className="flex items-center justify-between text-xs px-2 text-sky-700 font-medium">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 text-sky-600" />
                        متبقي للهبوط:
                      </span>
                      <span className="font-bold font-mono">
                        {diffPrice.toLocaleString()} ج.م ({Math.round((diffPrice / item.currentPrice) * 100)}%)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs px-2 text-emerald-700 font-bold bg-emerald-50/80 py-1 rounded-lg border border-emerald-200">
                      <span>🎯 السعر الحالي ممتاز ومربح!</span>
                      <span>جاهز للشراء</span>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                      💡 {item.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      if (onNavigateToAlerts) {
                        onNavigateToAlerts(item.productId);
                      } else {
                        onShowToast?.(`تم تفعيل تنبيه سعر على واتساب للمنتج: ${item.productTitle}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
                    title="تفعيل تنبيه واتساب"
                  >
                    <BellRing className="w-3.5 h-3.5 text-indigo-600" />
                    تنبيه واتساب
                  </button>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
                    title="تعديل السعر والملاحظات"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    تعديل
                  </button>

                  <button
                    onClick={() => shareWishlistWhatsApp([item])}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                    title="إرسال عبر واتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    واتساب
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Wishlist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                إضافة صنف جديد لقائمة أمنيات التاجر
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المنتج أو السلعة المستهدفة *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: غلاية مياه تورنيدو 1.7 لتر استانلس ستيل"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">العلامة التجارية</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="مثال: Samsung, Philips, دمياط"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مجلد الأمنيات</label>
                  <select
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                  >
                    <option value="electronics">إلكترونيات وهواتف</option>
                    <option value="appliances">أجهزة منزلية</option>
                    <option value="furniture">أثاث وخامات دمياط</option>
                    <option value="flash_deals">صفقات الجمعة البيضاء</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر الحالي بالتقريب (ج.م)</label>
                  <input
                    type="number"
                    value={newCurrentPrice}
                    onChange={(e) => setNewCurrentPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 5500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-700 block mb-1">السعر المستهدف للشراء (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={newTargetPrice}
                    onChange={(e) => setNewTargetPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 4800"
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-rose-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الأولوية</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as WishlistPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                  >
                    <option value="high">أولوية قصوى 🔥 (اقتناص عاجل)</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">عادية</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المنافس أو المصدر المفضل</label>
                  <input
                    type="text"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    placeholder="أمازون مصر، نون، بي تك، سوق دمياط"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رابط صورة المنتج (اختياري)</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات التاجر واستراتيجية البيع</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ملاحظات حول الكمية المطلوبة، هامش الربح المستهدف، شروط المورد..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  حفظ في قائمة الأمنيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                تعديل بيانات الصنف في قائمة الأمنيات
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={editingItem.productTitle}
                  onChange={(e) => setEditingItem({ ...editingItem, productTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر الحالي (ج.م)</label>
                  <input
                    type="number"
                    value={editingItem.currentPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, currentPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-700 block mb-1">السعر المستهدف (ج.م)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.targetPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, targetPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الأولوية</label>
                  <select
                    value={editingItem.priority}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as WishlistPriority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="high">أولوية قصوى 🔥</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">عادية</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المجلد</label>
                  <select
                    value={editingItem.folder}
                    onChange={(e) => setEditingItem({ ...editingItem, folder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="electronics">إلكترونيات وهواتف</option>
                    <option value="appliances">أجهزة منزلية</option>
                    <option value="furniture">أثاث وخامات دمياط</option>
                    <option value="flash_deals">صفقات الجمعة البيضاء</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الملاحظات</label>
                <textarea
                  rows={3}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
