import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Printer, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Package, 
  MapPin, 
  X, 
  Building2, 
  Globe, 
  Zap, 
  QrCode,
  Flame,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Phone
} from 'lucide-react';

export interface ShippingOrder {
  id: string;
  orderNo: string;
  waybillNo: string;
  customerName: string;
  customerPhone: string;
  city: string;
  marketplace: 'أمازون مصر' | 'نون مصر' | 'جوميا مصر';
  amount: number;
  courier: 'بوسطة (Bosta)' | 'أرامكس (Aramex)' | 'أمازون لوجستيك' | 'نون إكسبريس';
  status: 'delivered' | 'in_transit' | 'processing' | 'returned';
  date: string; // YYYY-MM-DD HH:mm
  itemsCount: number;
}

type StatusFilter = 'all' | 'in_transit' | 'delivered' | 'returned' | 'processing';
type DatePreset = 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';
type SortField = 'date' | 'amount' | 'orderNo' | 'status' | 'customer';
type SortDirection = 'asc' | 'desc';

export default function ShippingOrdersTable() {
  const [orders] = useState<ShippingOrder[]>([
    {
      id: 'ord_101',
      orderNo: '#EG-90811',
      waybillNo: 'BST-8910234-EG',
      customerName: 'محمود عبد الفتاح',
      customerPhone: '01012345678',
      city: 'القاهرة (مدينة نصر)',
      marketplace: 'أمازون مصر',
      amount: 1450,
      courier: 'أمازون لوجستيك',
      status: 'delivered',
      date: '2026-10-23 09:30',
      itemsCount: 2
    },
    {
      id: 'ord_102',
      orderNo: '#EG-90812',
      waybillNo: 'BST-8910235-EG',
      customerName: 'سارة إبراهيم',
      customerPhone: '01123456789',
      city: 'الجيزة (الدقي)',
      marketplace: 'نون مصر',
      amount: 890,
      courier: 'نون إكسبريس',
      status: 'in_transit',
      date: '2026-10-23 08:15',
      itemsCount: 1
    },
    {
      id: 'ord_103',
      orderNo: '#EG-90813',
      waybillNo: 'ARX-551092-EG',
      customerName: 'أحمد شريف',
      customerPhone: '01234567890',
      city: 'الإسكندرية (سموحة)',
      marketplace: 'أمازون مصر',
      amount: 3200,
      courier: 'أرامكس (Aramex)',
      status: 'delivered',
      date: '2026-10-22 18:20',
      itemsCount: 3
    },
    {
      id: 'ord_104',
      orderNo: '#EG-90814',
      waybillNo: 'BST-8910237-EG',
      customerName: 'طارق العوضي',
      customerPhone: '01098765432',
      city: 'المنصورة',
      marketplace: 'جوميا مصر',
      amount: 620,
      courier: 'بوسطة (Bosta)',
      status: 'in_transit',
      date: '2026-10-22 15:45',
      itemsCount: 1
    },
    {
      id: 'ord_105',
      orderNo: '#EG-90815',
      waybillNo: 'BST-8910238-EG',
      customerName: 'هدى مصطفى',
      customerPhone: '01187654321',
      city: 'القاهرة (التجمع الخامس)',
      marketplace: 'نون مصر',
      amount: 2100,
      courier: 'نون إكسبريس',
      status: 'processing',
      date: '2026-10-22 12:10',
      itemsCount: 2
    },
    {
      id: 'ord_106',
      orderNo: '#EG-90816',
      waybillNo: 'ARX-551099-EG',
      customerName: 'عمر المعتز',
      customerPhone: '01287654321',
      city: 'طنطا',
      marketplace: 'أمازون مصر',
      amount: 1780,
      courier: 'أرامكس (Aramex)',
      status: 'delivered',
      date: '2026-10-21 17:00',
      itemsCount: 1
    },
    {
      id: 'ord_107',
      orderNo: '#EG-90817',
      waybillNo: 'BST-8910240-EG',
      customerName: 'منى عبد السلام',
      customerPhone: '01055554433',
      city: 'أسيوط',
      marketplace: 'أمازون مصر',
      amount: 450,
      courier: 'بوسطة (Bosta)',
      status: 'returned',
      date: '2026-10-21 14:30',
      itemsCount: 1
    },
    {
      id: 'ord_108',
      orderNo: '#EG-90818',
      waybillNo: 'BST-8910241-EG',
      customerName: 'ياسر كمال',
      customerPhone: '01144443322',
      city: 'الإسماعيلية',
      marketplace: 'جوميا مصر',
      amount: 1120,
      courier: 'بوسطة (Bosta)',
      status: 'delivered',
      date: '2026-10-21 11:20',
      itemsCount: 2
    },
    {
      id: 'ord_109',
      orderNo: '#EG-90819',
      waybillNo: 'ARX-551105-EG',
      customerName: 'شرين خالد',
      customerPhone: '01233332211',
      city: 'القاهرة (المعادي)',
      marketplace: 'نون مصر',
      amount: 2950,
      courier: 'أرامكس (Aramex)',
      status: 'delivered',
      date: '2026-10-20 16:40',
      itemsCount: 4
    },
    {
      id: 'ord_110',
      orderNo: '#EG-90820',
      waybillNo: 'BST-8910245-EG',
      customerName: 'كريم عثمان',
      customerPhone: '01022221100',
      city: 'بورسعيد',
      marketplace: 'أمازون مصر',
      amount: 980,
      courier: 'أمازون لوجستيك',
      status: 'delivered',
      date: '2026-10-20 10:15',
      itemsCount: 1
    },
    {
      id: 'ord_111',
      orderNo: '#EG-90821',
      waybillNo: 'BST-8910250-EG',
      customerName: 'رانيا نبيل',
      customerPhone: '01099887766',
      city: 'الجيزة (أكتوبر)',
      marketplace: 'نون مصر',
      amount: 1350,
      courier: 'نون إكسبريس',
      status: 'in_transit',
      date: '2026-10-23 11:00',
      itemsCount: 2
    },
    {
      id: 'ord_112',
      orderNo: '#EG-90822',
      waybillNo: 'ARX-551120-EG',
      customerName: 'خالد عبد الوهاب',
      customerPhone: '01211223344',
      city: 'الزقازيق',
      marketplace: 'أمازون مصر',
      amount: 780,
      courier: 'أرامكس (Aramex)',
      status: 'returned',
      date: '2026-10-19 14:10',
      itemsCount: 1
    }
  ]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal & Print States
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<ShippingOrder | null>(null);
  const [isThermalMode, setIsThermalMode] = useState<boolean>(true);

  // Status Counts for Pill Badges
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      in_transit: orders.filter(o => o.status === 'in_transit').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      returned: orders.filter(o => o.status === 'returned').length,
      processing: orders.filter(o => o.status === 'processing').length,
    };
  }, [orders]);

  // Handle Sort Toggle
  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Default to descending for dates and amount, ascending for text
      setSortDirection(field === 'date' || field === 'amount' ? 'desc' : 'asc');
    }
  };

  // Reset Filters Function
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setCourierFilter('all');
    setSortField('date');
    setSortDirection('desc');
  };

  const isFilterActive = 
    searchQuery.trim() !== '' || 
    statusFilter !== 'all' || 
    datePreset !== 'all' || 
    customStartDate !== '' || 
    customEndDate !== '' || 
    courierFilter !== 'all' ||
    sortField !== 'date' ||
    sortDirection !== 'desc';

  // Filter & Sort Logic
  const processedOrders = useMemo(() => {
    // Reference date for simulation: 2026-10-23
    const refDate = new Date('2026-10-23T23:59:59');

    let result = orders.filter(order => {
      // 1. Text Search Filter
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesQuery = 
          order.orderNo.toLowerCase().includes(query) ||
          order.waybillNo.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.city.toLowerCase().includes(query) ||
          order.customerPhone.includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Status Filter (قيد الشحن / تم التسليم / مرتجع)
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 3. Courier Filter
      if (courierFilter !== 'all' && !order.courier.includes(courierFilter)) {
        return false;
      }

      // 4. Date Filter (تاريخ الإصدار)
      const orderDateObj = new Date(order.date.replace(' ', 'T'));
      const orderDateStr = order.date.split(' ')[0]; // YYYY-MM-DD

      if (datePreset === 'today') {
        if (orderDateStr !== '2026-10-23') return false;
      } else if (datePreset === 'yesterday') {
        if (orderDateStr !== '2026-10-22') return false;
      } else if (datePreset === 'last7days') {
        const diffDays = (refDate.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (datePreset === 'last30days') {
        const diffDays = (refDate.getTime() - orderDateObj.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 30 || diffDays < 0) return false;
      } else if (datePreset === 'custom') {
        if (customStartDate && orderDateStr < customStartDate) return false;
        if (customEndDate && orderDateStr > customEndDate) return false;
      }

      return true;
    });

    // Sort Result
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date.replace(' ', 'T')).getTime() - new Date(b.date.replace(' ', 'T')).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'orderNo') {
        comparison = a.orderNo.localeCompare(b.orderNo);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'customer') {
        comparison = a.customerName.localeCompare(b.customerName, 'ar');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [orders, searchQuery, statusFilter, datePreset, customStartDate, customEndDate, courierFilter, sortField, sortDirection]);

  const handleQuickThermalPrint = (order: ShippingOrder) => {
    setSelectedWaybillOrder(order);
    setIsThermalMode(true);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleStandardPrint = (order: ShippingOrder) => {
    setSelectedWaybillOrder(order);
    setIsThermalMode(false);
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 font-['Cairo',sans-serif] text-slate-100 backdrop-blur-xl">
      
      {/* Thermal Print Inject CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-area, #printable-thermal-area * {
            visibility: visible !important;
          }
          #printable-thermal-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            height: 150mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 99999 !important;
          }
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>إدارة بوالص الشحن وتتبع الطلبات</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {processedOrders.length} من {orders.length} بوليصة
                </span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                تصفية وفرز متقدم للبوالص حسب حالة الشحن وتاريخ الإصدار مع طباعة حرارية فورية (4x6).
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب، البوليصة، العميل، الهاتف..."
              className="w-full py-2 pr-10 pl-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              title="إعادة ضبط جميع معايير التصفية والفرز"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        
        {/* Row 1: Status Filter Tabs (تصنيف حسب الحالة: قيد الشحن، تم التسليم، مرتجع) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>تصنيف حسب حالة البوليصة:</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>الكل</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusFilter === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {statusCounts.all}
              </span>
            </button>

            {/* In Transit - قيد الشحن */}
            <button
              onClick={() => setStatusFilter('in_transit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                statusFilter === 'in_transit'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-sky-300 hover:bg-sky-950/40 border border-sky-500/30'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>قيد الشحن والتوصيل</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusFilter === 'in_transit' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-sky-500/20 text-sky-300'
              }`}>
                {statusCounts.in_transit}
              </span>
            </button>

            {/* Delivered - تم التسليم */}
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                statusFilter === 'delivered'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم التسليم بنجاح</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusFilter === 'delivered' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {statusCounts.delivered}
              </span>
            </button>

            {/* Returned - مرتجع */}
            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                statusFilter === 'returned'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'bg-slate-900 text-red-300 hover:bg-red-950/40 border border-red-500/30'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>مرتجع / ملغي</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusFilter === 'returned' ? 'bg-slate-950/30 text-white font-black' : 'bg-red-500/20 text-red-300'
              }`}>
                {statusCounts.returned}
              </span>
            </button>

            {/* Processing - قيد المعالجة */}
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                statusFilter === 'processing'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-amber-300 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>قيد المعالجة والتجهيز</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusFilter === 'processing' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {statusCounts.processing}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Date Filtering (تصفية تاريخ الإصدار) & Courier Filter & Sort Select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          
          {/* Date Filter Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>تصفية تاريخ إصدار البوليصة:</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none transition"
              >
                <option value="all">كل تواريخ الإصدار</option>
                <option value="today">اليوم (23 أكتوبر)</option>
                <option value="yesterday">أمس (22 أكتوبر)</option>
                <option value="last7days">آخر 7 أيام</option>
                <option value="last30days">آخر 30 يوماً</option>
                <option value="custom">نطاق تاريخ مخصص...</option>
              </select>
            </div>

            {/* Custom Date Range Picker */}
            {datePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">من تاريخ:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">إلى تاريخ:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Courier Company Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>شركة الشحن:</span>
            </label>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none transition"
            >
              <option value="all">جميع شركات الشحن</option>
              <option value="بوسطة">بوسطة (Bosta)</option>
              <option value="أرامكس">أرامكس (Aramex)</option>
              <option value="أمازون">أمازون لوجستيك</option>
              <option value="نون">نون إكسبريس</option>
            </select>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>الترتيب والفرز:</span>
            </label>
            <div className="flex gap-2">
              <select
                value={`${sortField}_${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('_') as [SortField, SortDirection];
                  setSortField(field);
                  setSortDirection(dir);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none transition"
              >
                <option value="date_desc">تاريخ الإصدار (الأحدث أولاً)</option>
                <option value="date_asc">تاريخ الإصدار (الأقدم أولاً)</option>
                <option value="amount_desc">إجمالي المبلغ (من الأعلى)</option>
                <option value="amount_asc">إجمالي المبلغ (من الأقل)</option>
                <option value="orderNo_asc">رقم الطلب (تصاعدي)</option>
                <option value="orderNo_desc">رقم الطلب (تنازلي)</option>
                <option value="status_asc">حالة التوصيل</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 select-none">
              
              {/* Order & Waybill No - Clickable Sort */}
              <th 
                onClick={() => handleSortToggle('orderNo')}
                className="p-3.5 font-bold cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5">
                  <span>رقم الشحنة والطلب</span>
                  {sortField === 'orderNo' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                  )}
                </div>
              </th>

              {/* Customer & City - Clickable Sort */}
              <th 
                onClick={() => handleSortToggle('customer')}
                className="p-3.5 font-bold cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5">
                  <span>العميل والمدينة</span>
                  {sortField === 'customer' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                  )}
                </div>
              </th>

              {/* Issue Date (تاريخ الإصدار) - Clickable Sort */}
              <th 
                onClick={() => handleSortToggle('date')}
                className="p-3.5 font-bold cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>تاريخ الإصدار</span>
                  {sortField === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                  )}
                </div>
              </th>

              <th className="p-3.5 font-bold">المنصة</th>

              {/* Amount - Clickable Sort */}
              <th 
                onClick={() => handleSortToggle('amount')}
                className="p-3.5 font-bold cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5">
                  <span>إجمالي المبلغ</span>
                  {sortField === 'amount' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                  )}
                </div>
              </th>

              <th className="p-3.5 font-bold">شركة الشحن</th>

              {/* Status - Clickable Sort */}
              <th 
                onClick={() => handleSortToggle('status')}
                className="p-3.5 font-bold cursor-pointer hover:text-white transition group"
              >
                <div className="flex items-center gap-1.5">
                  <span>حالة التوصيل</span>
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-400" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                  )}
                </div>
              </th>

              <th className="p-3.5 font-bold text-center">إجراءات الطباعة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {processedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-slate-500">
                      <Filter className="w-8 h-8" />
                    </div>
                    <div className="font-bold text-base text-slate-300">لا توجد بوالص شحن مطابقة لمعايير البحث والتصفية</div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      جرّب تغيير فئة الحالة، أو تعديل نطاق تاريخ الإصدار، أو مسح نص البحث.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition"
                    >
                      إلغاء التصفية وعرض جميع البوالص
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              processedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition">
                  
                  {/* Order & Waybill No */}
                  <td className="p-3.5 space-y-1">
                    <div className="font-mono font-bold text-white text-sm">{order.orderNo}</div>
                    <div className="font-mono text-[10px] text-amber-300">{order.waybillNo}</div>
                  </td>

                  {/* Customer & City */}
                  <td className="p-3.5 space-y-1">
                    <div className="font-bold text-slate-200">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{order.city}</span>
                    </div>
                  </td>

                  {/* Issue Date (تاريخ الإصدار) */}
                  <td className="p-3.5">
                    <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400/80" />
                      <span>{order.date}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {order.date.startsWith('2026-10-23') 
                        ? 'اليوم' 
                        : order.date.startsWith('2026-10-22') 
                        ? 'أمس' 
                        : 'إصدار سابق'}
                    </div>
                  </td>

                  {/* Marketplace */}
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                      order.marketplace.includes('أمازون') 
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                        : order.marketplace.includes('نون') 
                        ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' 
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}>
                      {order.marketplace.includes('أمازون') ? <Building2 className="w-3 h-3" /> : order.marketplace.includes('نون') ? <Globe className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      <span>{order.marketplace}</span>
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                    {order.amount.toLocaleString()} ج.م
                  </td>

                  {/* Courier */}
                  <td className="p-3.5 font-bold text-slate-300">
                    {order.courier}
                  </td>

                  {/* Status (قيد الشحن / تم التسليم / مرتجع) */}
                  <td className="p-3.5">
                    {order.status === 'delivered' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>تم التسليم</span>
                      </span>
                    ) : order.status === 'in_transit' ? (
                      <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                        <Truck className="w-3 h-3 text-sky-400" />
                        <span>قيد الشحن والتوصيل</span>
                      </span>
                    ) : order.status === 'processing' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>قيد المعالجة</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span>مرتجع</span>
                      </span>
                    )}
                  </td>

                  {/* Print Action Buttons */}
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Quick Thermal Print Button */}
                      <button
                        onClick={() => handleQuickThermalPrint(order)}
                        title="طباعة سريعة متوافقة مع الطابعات الحرارية (4x6 بوصة)"
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                        <span>طباعة سريعة</span>
                      </button>

                      {/* Standard Preview Button */}
                      <button
                        onClick={() => handleStandardPrint(order)}
                        title="معاينة البوليصة العادية"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition border border-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
        <div className="flex items-center gap-2">
          <span>إجمالي البوالص المعروضة: <strong className="text-white font-mono">{processedOrders.length}</strong></span>
          <span>•</span>
          <span>إجمالي مبالغ التحصيل (COD): <strong className="text-emerald-400 font-mono">{processedOrders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()} ج.م</strong></span>
        </div>
        <div className="text-[11px] text-slate-500">
          انقر على رؤوس الأعمدة لفرز البيانات تصاعدياً أو تنازلياً.
        </div>
      </div>

      {/* Printable Waybill Modal */}
      {selectedWaybillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative text-white">
            
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsThermalMode(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isThermalMode 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>حراري (4x6 بوصة)</span>
                </button>
                <button
                  onClick={() => setIsThermalMode(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    !isThermalMode 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>قياسي A4</span>
                </button>
              </div>

              <button 
                onClick={() => setSelectedWaybillOrder(null)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Content Area */}
            <div id="printable-thermal-area" className="mx-auto">
              {isThermalMode ? (
                /* Thermal Label Format (100mm x 150mm / High Contrast B&W) */
                <div className="bg-white text-black p-4 border-4 border-black font-sans rounded-none space-y-3 w-full max-w-[380px] mx-auto shadow-xl select-none">
                  
                  {/* Top Courier Header */}
                  <div className="border-b-4 border-black pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight uppercase leading-none">{selectedWaybillOrder.courier}</h2>
                      <span className="text-[11px] font-bold block mt-0.5">{selectedWaybillOrder.marketplace}</span>
                    </div>
                    <div className="border-2 border-black p-1 text-center font-bold text-[10px] uppercase">
                      EXPRESS
                    </div>
                  </div>

                  {/* Waybill Barcode Simulation */}
                  <div className="text-center space-y-1 py-1 bg-slate-50 border-y-2 border-black">
                    <div className="flex justify-center items-center gap-[2px] h-12 py-1 px-2">
                      {[3,1,2,4,1,3,1,2,1,4,2,1,3,2,1,4,1,2,3,1,2,4,1,3,2,1,3,2,1,4,2].map((w, idx) => (
                        <div key={idx} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
                      ))}
                    </div>
                    <div className="font-mono text-sm font-black tracking-widest">{selectedWaybillOrder.waybillNo}</div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-b-2 border-black pb-2">
                    <div className="border-r border-black pr-2">
                      <span className="font-black block text-[10px] uppercase underline">المرسل (SHIPPER):</span>
                      <span className="font-bold block text-[11px]">متجر رادار مصر</span>
                      <span className="text-[10px] block text-slate-700">القاهرة - المنطقة الصناعية</span>
                    </div>
                    <div className="pl-1">
                      <span className="font-black block text-[10px] uppercase underline">المرسل إليه (DESTINATION):</span>
                      <span className="font-bold block text-[12px]">{selectedWaybillOrder.customerName}</span>
                      <span className="font-mono font-bold block text-[11px] dir-ltr">{selectedWaybillOrder.customerPhone}</span>
                      <span className="font-bold text-[11px] block mt-0.5">{selectedWaybillOrder.city}</span>
                    </div>
                  </div>

                  {/* COD & Order Information */}
                  <div className="border-2 border-black p-2 bg-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-black text-[10px] block">المبلغ المطلوب تحصيله (COD):</span>
                      <span className="text-xl font-black font-mono leading-none">{selectedWaybillOrder.amount.toLocaleString()} EGP</span>
                    </div>
                    <div className="text-left font-mono text-[10px] font-bold">
                      <div>ORDER: {selectedWaybillOrder.orderNo}</div>
                      <div>ITEMS: {selectedWaybillOrder.itemsCount} PC</div>
                    </div>
                  </div>

                  {/* Footer Notes & QR Code */}
                  <div className="pt-1 flex items-center justify-between text-[9px] font-mono border-t border-black">
                    <div>
                      <div>DATE: {selectedWaybillOrder.date}</div>
                      <div>PRINTED BY RADAR EL-TAJER</div>
                    </div>
                    <div className="border border-black p-1">
                      <QrCode className="w-8 h-8 text-black" />
                    </div>
                  </div>

                </div>
              ) : (
                /* Standard Preview View */
                <div className="bg-white text-slate-900 border-2 border-amber-500 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                    <div className="flex justify-between items-center text-xs text-slate-600 font-bold mb-2">
                      <span>رادار التاجر الذكي - بوليصة شحن</span>
                      <span>{selectedWaybillOrder.marketplace}</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedWaybillOrder.courier}</h2>
                    <div className="font-mono text-xl font-bold tracking-widest text-slate-800 bg-slate-100 py-2 rounded">
                      ||||||||||||||||||||||||||||||||||||
                    </div>
                    <p className="font-mono text-sm font-bold text-amber-700">{selectedWaybillOrder.waybillNo}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-bold block">اسم العميل:</span>
                      <span className="font-bold text-sm text-slate-900">{selectedWaybillOrder.customerName}</span>
                      <span className="block font-mono text-slate-700">{selectedWaybillOrder.customerPhone}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-bold block">عنوان التسليم:</span>
                      <span className="font-bold text-sm text-slate-900">{selectedWaybillOrder.city}</span>
                      <span className="block text-slate-600">جمهورية مصر العربية</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-500 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-amber-900 text-xs font-bold block">المبلغ المطلوب تحصيله (COD):</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">{selectedWaybillOrder.amount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="text-left font-mono text-xs text-slate-700 font-bold">
                      <div>رقم الطلب: {selectedWaybillOrder.orderNo}</div>
                      <div>القطع: {selectedWaybillOrder.itemsCount} عنصر</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Print Action Controls */}
            <div className="flex gap-3 pt-2 print:hidden">
              <button
                onClick={executePrint}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Printer className="w-5 h-5" />
                <span>إرسال للطابعة ({isThermalMode ? '4x6 حراري' : 'A4 عادي'})</span>
              </button>
              <button
                onClick={() => setSelectedWaybillOrder(null)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
