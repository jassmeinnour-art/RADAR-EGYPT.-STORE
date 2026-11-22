import React, { useEffect, useState, useMemo } from 'react';
import { LineChart as LineIcon, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { supabase, isDemoOrOrphanProduct } from '../lib/supabase';

export const SalesDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadSales = async () => {
      try {
        const [prodRes, invRes] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('invoices').select('*'),
        ]);
        if (!active) return;
        const cleanProds = Array.isArray(prodRes.data)
          ? prodRes.data.filter((p: any) => p && !isDemoOrOrphanProduct(p))
          : [];
        setProducts(cleanProds);
        setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      } catch (err) {
        console.error('[SalesDashboard] Supabase load error:', err);
      }
    };
    loadSales();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const prodRev = products.reduce((sum, p) => {
      const price = Number(p?.price) || 0;
      const qty = Number(p?.sold_quantity) > 0 ? Number(p.sold_quantity) : 1;
      return sum + price * qty;
    }, 0);
    const invRev = invoices.reduce((sum, inv) => {
      const amt = Number(inv?.total_amount ?? inv?.total ?? inv?.amount ?? 0) || 0;
      return sum + amt;
    }, 0);
    return {
      totalRevenue: Math.round(prodRev + invRev),
      ordersCount: invoices.length,
    };
  }, [products, invoices]);

  return (
    <div className="space-y-6 p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 font-['Cairo'] text-right" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <LineIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">لوحة أداء المبيعات والتسعير 📈</h2>
          <p className="text-xs text-slate-400">متابعة إيرادات المبيعات وأوامر الشحن الحقيقية من Supabase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>إجمالي الإيرادات</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {stats.totalRevenue.toLocaleString()} ج.م
          </div>
          <div className="text-[11px] text-slate-400 font-bold">محسوب من المنتجات والفواتير</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>عدد الطلبات</span>
            <ShoppingCart className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {stats.ordersCount.toLocaleString()} طلب
          </div>
          <div className="text-[11px] text-slate-400 font-bold">إجمالي الفواتير المسجلة</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>المنتجات النشطة</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {products.length.toLocaleString()} منتج
          </div>
          <div className="text-[11px] text-slate-400 font-bold">البيانات الفعلية من Supabase</div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
