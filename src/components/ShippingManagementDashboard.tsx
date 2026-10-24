import React, { useState, useMemo, useRef } from 'react';
import { 
  Truck, 
  Package, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Building2, 
  QrCode, 
  FileText, 
  Settings, 
  Key, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Sparkles,
  Download,
  Copy,
  Check
} from 'lucide-react';

export interface CourierCompany {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  apiKey?: string;
  accountNumber?: string;
  trackingPrefix: string;
  baseDeliveryFee: number;
  codFeePercent: number;
  averageDeliveryDays: string;
  contactPhone: string;
  isActive: boolean;
}

export interface ShippingWaybill {
  id: string;
  waybillNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  courierId: string;
  courierName: string;
  itemCount: number;
  itemsSummary: string;
  codAmount: number;
  weightKg: number;
  status: 'pending_issue' | 'waybill_issued' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'returned';
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate: string;
  merchantStoreName: string;
  merchantPhone: string;
}

const DEFAULT_COURIERS: CourierCompany[] = [];

const DEFAULT_WAYBILLS: ShippingWaybill[] = [];

export const ShippingManagementDashboard: React.FC<{ onShowToast?: (msg: string) => void }> = ({ onShowToast }) => {
  const [couriers, setCouriers] = useState<CourierCompany[]>(DEFAULT_COURIERS);
  const [waybills, setWaybills] = useState<ShippingWaybill[]>(DEFAULT_WAYBILLS);
  
  // Filters & Controls
  const [activeTab, setActiveTab] = useState<'waybills' | 'couriers' | 'new_waybill'>('waybills');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');
  
  // Selected Waybill for Thermal Print Modal
  const [selectedWaybillForPrint, setSelectedWaybillForPrint] = useState<ShippingWaybill | null>(null);
  
  // New Courier Form State
  const [showAddCourierModal, setShowAddCourierModal] = useState(false);
  const [newCourierName, setNewCourierName] = useState('');
  const [newCourierApiKey, setNewCourierApiKey] = useState('');
  const [newCourierAccount, setNewCourierAccount] = useState('');
  const [newCourierFee, setNewCourierFee] = useState<number>(45);

  // New Waybill Form State
  const [newOrderNum, setNewOrderNum] = useState(`ORD-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newGov, setNewGov] = useState('القاهرة');
  const [newAddress, setNewAddress] = useState('');
  const [newCourierId, setNewCourierId] = useState('bosta');
  const [newItemsSummary, setNewItemsSummary] = useState('');
  const [newCodAmount, setNewCodAmount] = useState<number>(1000);
  const [newWeight, setNewWeight] = useState<number>(1.0);

  // Filtered Waybills
  const filteredWaybills = useMemo(() => {
    return waybills.filter((wb) => {
      const matchesSearch = wb.customerName.includes(searchQuery) ||
                            wb.waybillNumber.includes(searchQuery) ||
                            wb.orderNumber.includes(searchQuery) ||
                            wb.customerPhone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || wb.status === statusFilter;
      const matchesCourier = courierFilter === 'all' || wb.courierId === courierFilter;
      return matchesSearch && matchesStatus && matchesCourier;
    });
  }, [waybills, searchQuery, statusFilter, courierFilter]);

  // Issue New Waybill Handler
  const handleIssueNewWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone || !newAddress) {
      alert('يرجى ملء كافة بيانات العميل والعنوان لإصدار البوليصة.');
      return;
    }

    const selectedCourierObj = couriers.find(c => c.id === newCourierId) || couriers[0];
    const generatedNum = `${selectedCourierObj.trackingPrefix}-EG-${Math.floor(Math.random() * 900000 + 100000)}`;

    const createdWb: ShippingWaybill = {
      id: `WB-${Date.now().toString().slice(-4)}`,
      waybillNumber: generatedNum,
      orderNumber: newOrderNum,
      customerName: newCustName,
      customerPhone: newCustPhone,
      governorate: newGov,
      address: newAddress,
      courierId: selectedCourierObj.id,
      courierName: selectedCourierObj.nameAr,
      itemCount: 1,
      itemsSummary: newItemsSummary || 'منتجات متجر رادار التاجر',
      codAmount: newCodAmount,
      weightKg: newWeight,
      status: 'waybill_issued',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      estimatedDeliveryDate: 'خلال 24-48 ساعة',
      merchantStoreName: 'رادار التاجر مصر',
      merchantPhone: '01099887766'
    };

    setWaybills([createdWb, ...waybills]);
    setSelectedWaybillForPrint(createdWb);
    setActiveTab('waybills');
    
    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewAddress('');
    setNewItemsSummary('');
    setNewOrderNum(`ORD-${Math.floor(Math.random() * 9000 + 1000)}`);

    if (onShowToast) onShowToast('تمت إضافة الطلب وإصدار البوليصة الحرارية بنجاح! ⚡');
  };

  // Add New Courier Company
  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName) return;

    const newCompany: CourierCompany = {
      id: `courier_${Date.now()}`,
      name: newCourierName,
      nameAr: newCourierName,
      logo: '🚚',
      apiKey: newCourierApiKey || 'api_key_demo_123',
      accountNumber: newCourierAccount || 'ACC-9901',
      trackingPrefix: newCourierName.slice(0, 3).toUpperCase(),
      baseDeliveryFee: newCourierFee,
      codFeePercent: 1.5,
      averageDeliveryDays: '24-48 ساعة',
      contactPhone: '19000',
      isActive: true,
    };

    setCouriers([...couriers, newCompany]);
    setShowAddCourierModal(false);
    setNewCourierName('');
    setNewCourierApiKey('');
    setNewCourierAccount('');
    if (onShowToast) onShowToast(`تمت إضافة شركة الشحن (${newCourierName}) بنجاح`);
  };

  // Direct Thermal Print Function
  const handlePrintThermalLabel = () => {
    if (onShowToast) onShowToast('جاري فتح نافذة الطباعة الحرارية المباشرة (4x6)... 🖨️');
    window.print();
  };

  // API Simulation to Update Waybill Status & Automatically Refresh updatedAt Timestamp
  const handleUpdateWaybillStatusViaApi = (waybillId: string, nextStatus: ShippingWaybill['status']) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    setWaybills(prev => prev.map(wb => {
      if (wb.id === waybillId) {
        return {
          ...wb,
          status: nextStatus,
          updatedAt: nowStr
        };
      }
      return wb;
    }));

    if (onShowToast) {
      const statusLabels: Record<ShippingWaybill['status'], string> = {
        pending_issue: 'قيد المعالجة',
        waybill_issued: 'تم إصدار البوليصة',
        picked_up: 'تم الاستلام لشركة الشحن',
        out_for_delivery: 'في الطريق للعميل',
        delivered: 'تم التسليم والتحصيل',
        returned: 'مرتجع'
      };
      onShowToast(`🔄 تم تحديث حالة البوليصة وعكس وقت التحديث (${nowStr}) عبر API الشحن بنجاح إلى: [${statusLabels[nextStatus]}]`);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: ShippingWaybill['status']) => {
    switch (status) {
      case 'waybill_issued':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">تم إصدار البوليصة 📋</span>;
      case 'picked_up':
        return <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[10px]">تم التسليم لشركة الشحن 🚚</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[10px]">في الطريق للعميل 🛵</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">تم التسليم والتحصيل ✓</span>;
      case 'returned':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">مرتجع ⚠️</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px]">قيد المعالجة</span>;
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-8 font-['Cairo',sans-serif]" dir="rtl" id="shipping-management-dashboard">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة وإصدار بوالص الشحن (ShippingManagementDashboard)</h2>
              <p className="text-xs text-slate-400">
                ربط شركات الشحن المصرية (بوسطة، أرامكس، مايلرز، حالاً) وإصدار بوالص الشحن الحرارية وتتبع حالات التسليم الحية
              </p>
            </div>
          </div>
        </div>

        {/* Top Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('waybills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'waybills' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>بوالص الشحن والتتبع</span>
          </button>

          <button
            onClick={() => setActiveTab('new_waybill')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'new_waybill' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>إصدار بوليصة جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('couriers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'couriers' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>شركات الشحن والـ API</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WAYBILLS TRACKING TABLE */}
      {activeTab === 'waybills' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم البوليصة، رقم الطلب، أو اسم العميل..."
                className="w-full py-2.5 pr-10 pl-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-amber-500 transition"
              >
                <option value="all">جميع الحالات الحية</option>
                <option value="waybill_issued">تم إصدار البوليصة</option>
                <option value="picked_up">تم التسليم للشحن</option>
                <option value="out_for_delivery">في الطريق للعميل</option>
                <option value="delivered">تم التسليم والتحصيل</option>
                <option value="returned">مرتجع</option>
              </select>

              {/* Courier Filter */}
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-amber-500 transition"
              >
                <option value="all">جميع شركات الشحن</option>
                {couriers.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Waybills Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-4">رقم البوليصة والطلب</th>
                  <th className="p-4">بيانات العميل والمحافظة</th>
                  <th className="p-4">شركة الشحن</th>
                  <th className="p-4">مبلغ التحصيل (COD)</th>
                  <th className="p-4">الحالة الحية للتسليم</th>
                  <th className="p-4">تاريخ التحديث الأخير (API Sync)</th>
                  <th className="p-4 text-center">الإجراءات والطباعة الحرارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredWaybills.map((wb) => (
                  <tr key={wb.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Waybill & Order ID */}
                    <td className="p-4">
                      <div className="font-mono font-black text-amber-400 text-sm">{wb.waybillNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono">الطلب: {wb.orderNumber} • أُنشئت: {wb.createdAt}</div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{wb.customerName}</div>
                      <div className="text-[11px] text-slate-400">{wb.governorate} • <span className="font-mono">{wb.customerPhone}</span></div>
                    </td>

                    {/* Courier Company */}
                    <td className="p-4">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>{wb.courierName}</span>
                      </span>
                    </td>

                    {/* COD Amount */}
                    <td className="p-4 font-mono font-black text-emerald-400 text-sm">
                      {wb.codAmount.toLocaleString()} ج.م
                    </td>

                    {/* Status Badge & Quick Status Switcher */}
                    <td className="p-4 space-y-1.5">
                      <div>{getStatusBadge(wb.status)}</div>
                      <select
                        value={wb.status}
                        onChange={(e) => handleUpdateWaybillStatusViaApi(wb.id, e.target.value as any)}
                        className="h-7 px-2 rounded-lg bg-slate-950 border border-slate-700 text-[10px] text-amber-300 font-bold outline-none cursor-pointer"
                        title="تغيير الحالة عبر API الشحن وتحديث وقت التحديث الأخير تلقائياً"
                      >
                        <option value="waybill_issued">📋 تم إصدار البوليصة</option>
                        <option value="picked_up">🚚 تم الاستلام للشحن</option>
                        <option value="out_for_delivery">🛵 في الطريق للتسليم</option>
                        <option value="delivered">✓ تم التسليم والتحصيل</option>
                        <option value="returned">⚠️ مرتجع</option>
                      </select>
                    </td>

                    {/* Last Updated Timestamp (Auto-Updated via API) */}
                    <td className="p-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{wb.updatedAt}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">محدث تلقائياً عبر API</span>
                    </td>

                    {/* Action Button: Issue / Print Thermal Label */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedWaybillForPrint(wb)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer mx-auto"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-950" />
                        <span>طباعة البوليصة (4x6)</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: ISSUE NEW WAYBILL FORM */}
      {activeTab === 'new_waybill' && (
        <form onSubmit={handleIssueNewWaybill} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>إصدار بوليصة شحن جديدة لطلب</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">رقم الطلب التلقائي: {newOrderNum}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">اسم العميل بالكامل *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="مثال: م. محمود حسن"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">رقم الهاتف (الواتساب) *</label>
              <input
                type="text"
                required
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono outline-none focus:border-amber-500"
              />
            </div>

            {/* Governorate */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">المحافظة *</label>
              <select
                value={newGov}
                onChange={(e) => setNewGov(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="القليوبية">القليوبية</option>
                <option value="الدقهلية">الدقهلية</option>
                <option value="الشرقية">الشرقية</option>
                <option value="الغربية">الغربية</option>
                <option value="المنوفية">المنوفية</option>
                <option value="البحيرة">البحيرة</option>
                <option value="الفيوم">الفيوم</option>
                <option value="بني سويف">بني سويف</option>
                <option value="المنيا">المنيا</option>
                <option value="أسيوط">أسيوط</option>
                <option value="سوهاج">سوهاج</option>
              </select>
            </div>

            {/* Detailed Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">العنوان التفصيلي للتسليم *</label>
              <input
                type="text"
                required
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="المنطقة - الشارع - رقم العمارة والطابق والشقّة"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              />
            </div>

            {/* Courier Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">شركة الشحن المسند إليها *</label>
              <select
                value={newCourierId}
                onChange={(e) => setNewCourierId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              >
                {couriers.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr} ({c.baseDeliveryFee} ج.م)</option>
                ))}
              </select>
            </div>

            {/* COD Amount */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">مبلغ التحصيل عند الاستلام (COD) *</label>
              <input
                type="number"
                required
                min={0}
                value={newCodAmount}
                onChange={(e) => setNewCodAmount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold outline-none focus:border-amber-500"
              />
            </div>

            {/* Items Summary */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">محتويات الطرد والمنتجات</label>
              <input
                type="text"
                value={newItemsSummary}
                onChange={(e) => setNewItemsSummary(e.target.value)}
                placeholder="مثال: سماعة أنكر + شاحن سريع"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>إصدار البوليصة الحرارية وعرضها للطباعة الفورية ⚡</span>
          </button>
        </form>
      )}

      {/* TAB 3: COURIERS CONFIGURATION */}
      {activeTab === 'couriers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>إعدادات ومفاتيح ربط شركات الشحن (Courier APIs)</span>
              </h3>
              <p className="text-xs text-slate-400">إدخال مفاتيح الحسابات والربط المباشر مع شركات بوسطة وأرامكس ومايلرز</p>
            </div>

            <button
              onClick={() => setShowAddCourierModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شركة شحن جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {couriers.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.logo}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.nameAr}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{c.name}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    نشط ومتصل ✓
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between text-slate-300">
                    <span>API Key:</span>
                    <span className="text-amber-300">{c.apiKey || 'لم يحدد'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between text-slate-300">
                    <span>رقم الحساب التجاري:</span>
                    <span className="text-sky-300">{c.accountNumber || 'لم يحدد'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>تعريفة الشحن: <strong className="text-white font-mono">{c.baseDeliveryFee} ج.م</strong></span>
                  <span>متوسط التسليم: <strong className="text-slate-200">{c.averageDeliveryDays}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THERMAL 4x6 WAYBILL PRINT MODAL */}
      {selectedWaybillForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Printer className="w-5 h-5" />
                <span>معاينة بوليصة الشحن الحرارية (4x6 Inches)</span>
              </div>
              <button
                onClick={() => setSelectedWaybillForPrint(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Standardized 4x6 Thermal Label Container (Optimized for Media Print) */}
            <div 
              id="thermal-label-print-area"
              className="bg-white text-black p-5 rounded-2xl border-2 border-slate-900 space-y-4 font-mono text-xs shadow-inner"
              style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}
            >
              {/* Courier Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div>
                  <h3 className="font-black text-lg text-black">{selectedWaybillForPrint.courierName}</h3>
                  <span className="text-[10px] font-bold block">بوليصة شحن وتوصيل طلبات</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black border-2 border-black px-2 py-0.5 rounded">
                    {selectedWaybillForPrint.waybillNumber}
                  </div>
                </div>
              </div>

              {/* Barcode / QR Mockup */}
              <div className="text-center py-2 bg-slate-100 rounded border border-slate-300 space-y-1">
                <div className="tracking-widest font-black text-lg">||| | |||| | |||||| || |</div>
                <span className="text-[10px] font-bold block">{selectedWaybillForPrint.waybillNumber}</span>
              </div>

              {/* COD Big Badge */}
              <div className="p-3 bg-black text-white text-center rounded space-y-0.5">
                <span className="text-[10px] font-bold block">مبلغ التحصيل عند الاستلام (COD):</span>
                <div className="text-xl font-black">{selectedWaybillForPrint.codAmount.toLocaleString()} EGP</div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-1 border-b border-black pb-3 text-right">
                <span className="text-[10px] font-bold text-slate-600 block">إلى (المرسل إليه):</span>
                <div className="font-black text-sm text-black">{selectedWaybillForPrint.customerName}</div>
                <div className="font-bold text-xs text-black">المحافظة: {selectedWaybillForPrint.governorate}</div>
                <div className="text-[11px] font-semibold text-black leading-tight">{selectedWaybillForPrint.address}</div>
                <div className="font-black text-xs text-black pt-1">هاتف: {selectedWaybillForPrint.customerPhone}</div>
              </div>

              {/* Sender Details */}
              <div className="space-y-0.5 border-b border-black pb-2 text-right text-[10px]">
                <span className="font-bold text-slate-600 block">من (المتجر):</span>
                <div className="font-bold text-black">{selectedWaybillForPrint.merchantStoreName} ({selectedWaybillForPrint.merchantPhone})</div>
                <div>رقم الطلب: {selectedWaybillForPrint.orderNumber} • الوزن: {selectedWaybillForPrint.weightKg} كجم</div>
              </div>

              {/* Items Summary */}
              <div className="text-[10px] text-right">
                <span className="font-bold block">المحتويات:</span>
                <div className="font-semibold text-black">{selectedWaybillForPrint.itemsSummary}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={handlePrintThermalLabel}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>طباعة حرارية الآن (Print Label)</span>
              </button>

              <button
                onClick={() => setSelectedWaybillForPrint(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD COURIER MODAL */}
      {showAddCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleAddCourier} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-sm">إضافة شركة شحن جديدة</h3>
              <button type="button" onClick={() => setShowAddCourierModal(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم شركة الشحن *</label>
                <input
                  type="text"
                  required
                  value={newCourierName}
                  onChange={(e) => setNewCourierName(e.target.value)}
                  placeholder="مثال: بيبول / أرامكس / إكسبريس"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">مفتاح الـ API (API Key)</label>
                <input
                  type="text"
                  value={newCourierApiKey}
                  onChange={(e) => setNewCourierApiKey(e.target.value)}
                  placeholder="api_key_..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تعريفة التوصيل الأساسية (ج.م)</label>
                <input
                  type="number"
                  value={newCourierFee}
                  onChange={(e) => setNewCourierFee(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
            >
              حفظ وتفعيل شركة الشحن
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default ShippingManagementDashboard;
