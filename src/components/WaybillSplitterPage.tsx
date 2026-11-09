import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Package,
  FileText,
  Download,
  Archive,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Store,
  Mail,
  QrCode,
  DollarSign,
  AlertCircle,
  Truck,
  Layers,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { multiTenantDb, Trader, SplitInvoice } from '../lib/supabase';

interface WaybillSplitterPageProps {
  onBack?: () => void;
  initialInvoiceId?: string;
  initialTraderId?: string;
  onShowToast?: (msg: string) => void;
}

export const WaybillSplitterPage: React.FC<WaybillSplitterPageProps> = ({
  onBack,
  initialInvoiceId,
  initialTraderId,
  onShowToast
}) => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState<string>(initialTraderId || '');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [splitResults, setSplitResults] = useState<SplitInvoice[]>([]);
  const [isLoadingTraders, setIsLoadingTraders] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // 1. Load traders
  useEffect(() => {
    const loadTraders = async () => {
      setIsLoadingTraders(true);
      try {
        const list = await multiTenantDb.getTradersByUser('current-user');
        setTraders(list);
        if (list.length > 0 && !selectedTraderId) {
          const defaultTrader = initialTraderId 
            ? list.find(t => t.id === initialTraderId) || list[0]
            : list[0];
          setSelectedTraderId(defaultTrader.id);
        }
      } catch (err) {
        console.error('Error loading traders for splitter:', err);
      } finally {
        setIsLoadingTraders(false);
      }
    };
    loadTraders();
  }, [initialTraderId]);

  // 2. Load invoices for selected trader
  useEffect(() => {
    if (!selectedTraderId) return;
    const loadInvoices = async () => {
      setIsLoadingInvoices(true);
      try {
        const invs = await multiTenantDb.getInvoicesByTrader(selectedTraderId);
        // If empty, generate standard platform demo invoices for realistic splitting
        let effectiveInvoices = invs;
        if (!invs || invs.length === 0) {
          effectiveInvoices = [
            {
              id: `inv-${selectedTraderId}-101`,
              invoice_number: 'INV-AMZ-2026-9041',
              order_id: '403-1892014-9921045',
              platform: 'amazon',
              invoice_date: new Date().toISOString(),
              total_amount: 5238,
              items: [
                { title: 'شاحن سريع Anker 65W GaN ثلاثي المنافذ', sku: 'ANK-65W-EG-01', asin: 'B0CHX3W9XX', quantity: 1, price: 1250 },
                { title: 'كابل شحن سريع Type-C مجدول ضد القطع 1.8 متر', sku: 'CBL-TC-02', asin: 'B089DXY77K', quantity: 2, price: 299 },
                { title: 'حامل هاتف ذكي مغناطيسي للسيارة مع شاحن لاسلكي', sku: 'MAG-CAR-03', asin: 'B09JKLMNO1', quantity: 1, price: 650 },
                { title: 'سماعة أذن بلوتوث عازلة للضوضاء برو', sku: 'EAR-BT-PRO-04', asin: 'B07VXYZ99P', quantity: 1, price: 1890 },
                { title: 'باور بانك 20,000 مللي أمبير شحن فائق 22.5W', sku: 'PWR-20K-EGY-05', asin: 'B0BNM7788Q', quantity: 1, price: 1150 }
              ]
            },
            {
              id: `inv-${selectedTraderId}-102`,
              invoice_number: 'INV-NOON-2026-4412',
              order_id: 'NA-99881122',
              platform: 'noon',
              invoice_date: new Date(Date.now() - 86400000).toISOString(),
              total_amount: 3740,
              items: [
                { title: 'طقم ملحقات مكتبية مريح ومقاوم للانزلاق', sku: 'NOON-DESK-01', asin: 'N70019280A', quantity: 2, price: 420 },
                { title: 'ماوس لاسلكي مريح قابل لإعادة الشحن', sku: 'NOON-MSE-02', asin: 'N88201944B', quantity: 1, price: 890 },
                { title: 'حامل لابتوب ألومنيوم متعدد الزوايا قابل للطي', sku: 'NOON-STND-03', asin: 'N99104822C', quantity: 2, price: 1005 }
              ]
            }
          ];
        }
        setInvoices(effectiveInvoices);

        if (initialInvoiceId) {
          const match = effectiveInvoices.find(i => i.id === initialInvoiceId || i.invoice_number === initialInvoiceId);
          if (match) setSelectedInvoice(match);
          else if (effectiveInvoices.length > 0) setSelectedInvoice(effectiveInvoices[0]);
        } else if (effectiveInvoices.length > 0) {
          setSelectedInvoice(effectiveInvoices[0]);
        }
      } catch (err) {
        console.error('Error loading invoices for splitter:', err);
      } finally {
        setIsLoadingInvoices(false);
      }
    };
    loadInvoices();
  }, [selectedTraderId, initialInvoiceId]);

  // Load existing split invoices if any for the selected invoice
  useEffect(() => {
    if (!selectedInvoice) {
      setSplitResults([]);
      return;
    }
    const loadSplits = async () => {
      const splits = await multiTenantDb.getSplitInvoices(selectedInvoice.id, selectedTraderId);
      setSplitResults(splits);
    };
    loadSplits();
  }, [selectedInvoice, selectedTraderId]);

  const currentTrader = traders.find(t => t.id === selectedTraderId);

  // 3. Handle splitting
  const handleSplitInvoice = async () => {
    if (!selectedInvoice) return;
    setIsSplitting(true);
    if (onShowToast) onShowToast('✂️ جاري تقسيم الفاتورة المجمعة إلى بوالص شحن فردية...');

    try {
      const payload = {
        invoice_id: selectedInvoice.id,
        invoice_number: selectedInvoice.invoice_number,
        trader_id: selectedTraderId,
        items: selectedInvoice.items || []
      };

      const res = await fetch('/api/split-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.splits)) {
        await multiTenantDb.createSplitInvoices(data.splits);
        setSplitResults(data.splits);
        if (onShowToast) onShowToast(`✅ تم تقسيم الفاتورة بنجاح إلى ${data.splits.length} بوليصة شحن فردية!`);
      } else {
        throw new Error(data.error || 'فشل تقسيم الفاتورة');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ خطأ في التقسيم: ${err.message}`);
    } finally {
      setIsSplitting(false);
    }
  };

  // 4. Generate Single PDF
  const generateWaybillPdf = (split: SplitInvoice): jsPDF => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150] // Standard 4x6 inch waybill shipping label format
    });

    // Dark header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 100, 24, 'F');

    // Title & Branding
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RADAR MERCHANT WAYBILL', 50, 10, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Store: ${currentTrader?.seller_name || 'Egyptian Merchant'}`, 50, 16, { align: 'center' });
    doc.text(`Seller ID: ${currentTrader?.seller_id || currentTrader?.id || 'EG-SELLER'}`, 50, 20, { align: 'center' });

    // Waybill info block
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Split Waybill #: ${split.split_number}`, 10, 32);
    doc.setFontSize(8);
    doc.text(`Original Order: ${selectedInvoice?.order_id || selectedInvoice?.invoice_number}`, 10, 37);
    doc.text(`Platform: ${(selectedInvoice?.platform || 'Amazon').toUpperCase()}`, 10, 42);
    doc.text(`Date: ${new Date(split.created_at || Date.now()).toLocaleDateString('ar-EG')}`, 10, 47);

    // Separator line
    doc.setDrawColor(203, 213, 225);
    doc.line(10, 50, 90, 50);

    // Product section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description:', 10, 56);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitTitle = doc.splitTextToSize(split.product_title, 80);
    doc.text(splitTitle, 10, 61);

    const titleHeight = splitTitle.length * 4;
    const yAfterTitle = 63 + titleHeight;

    doc.setFont('helvetica', 'bold');
    doc.text(`SKU / Code: ${split.product_sku}`, 10, yAfterTitle);
    doc.text(`Qty: ${split.quantity} unit(s)`, 10, yAfterTitle + 5);
    doc.text(`Declared Value: ${split.price ? Number(split.price).toLocaleString() : 0} EGP`, 10, yAfterTitle + 10);

    // Barcode / QR placeholder box
    doc.setDrawColor(15, 23, 42);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yAfterTitle + 16, 60, 32, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.text(`*${split.product_sku}*`, 50, yAfterTitle + 24, { align: 'center' });
    doc.setFontSize(8);
    doc.text('SCAN QR FOR TRACKING', 50, yAfterTitle + 32, { align: 'center' });
    doc.setFontSize(6);
    doc.text('Merchant Radar Egypt - Verified Shipment', 50, yAfterTitle + 40, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Trader: ${currentTrader?.email || currentTrader?.gmail || 'merchant@gmail.com'}`, 50, 142, { align: 'center' });
    doc.text('Printed automatically via Merchant Radar Core System', 50, 146, { align: 'center' });

    return doc;
  };

  const handleDownloadPdf = (split: SplitInvoice) => {
    try {
      const doc = generateWaybillPdf(split);
      doc.save(`Waybill-${split.split_number}.pdf`);
      if (onShowToast) onShowToast(`📥 تم تحميل البوليصة ${split.split_number}.pdf`);
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل تحميل الـ PDF: ${err.message}`);
    }
  };

  // 5. Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (splitResults.length === 0) return;
    setIsExportingZip(true);
    if (onShowToast) onShowToast('📦 جاري تجميع كافة البوالص المقسمة في ملف مضغوط ZIP...');

    try {
      const zip = new JSZip();
      for (const split of splitResults) {
        const doc = generateWaybillPdf(split);
        const pdfBlob = doc.output('blob');
        zip.file(`Waybill-${split.split_number}.pdf`, pdfBlob);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Waybills-Split-${selectedInvoice?.invoice_number || 'Package'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      if (onShowToast) onShowToast(`✅ تم تحميل ${splitResults.length} بوليصة شحن في ملف ZIP بنجاح!`);
    } catch (err: any) {
      if (onShowToast) onShowToast(`❌ فشل إنشاء ملف الـ ZIP: ${err.message}`);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full space-y-6 font-['Cairo'] pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              ✂️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>مقسم البوالص - قسم فاتورتك المجمعة لشركات الشحن</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                تحويل الفواتير المتعددة المنتجات من أمازون ونون إلى بوالص شحن فردية بباركودات مستقلة لكل شركة شحن
              </p>
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 & 2: Select Trader & Choose Invoice */}
        <div className="lg:col-span-1 space-y-6">
          {/* Step 1: Select Trader */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-white font-black text-sm border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
              <span>اختر التاجر</span>
            </div>

            {isLoadingTraders ? (
              <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>جاري تحميل التجار...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400">التاجر المسجل في RADAR:</label>
                <select
                  value={selectedTraderId}
                  onChange={e => setSelectedTraderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  {traders.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.seller_name} ({t.gmail || t.email}) - {t.seller_id || t.platform}
                    </option>
                  ))}
                </select>

                {currentTrader && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-[11px] space-y-1 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">معرف البائع:</span>
                      <span className="font-mono text-amber-400 font-bold">{currentTrader.seller_id || currentTrader.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">الجيميل:</span>
                      <span className="text-slate-200">{currentTrader.gmail || currentTrader.email}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Choose Invoice */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-black text-sm">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                <span>اختر الفاتورة المجمعة</span>
              </div>
              <span className="text-slate-400 text-[10px] font-bold">({invoices.length} فواتير)</span>
            </div>

            {isLoadingInvoices ? (
              <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>جاري تحميل فواتير التاجر...</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <div>لا توجد فواتير مسجلة لهذا التاجر بعد.</div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {invoices.map(inv => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  const itemsCount = Array.isArray(inv.items) ? inv.items.length : 1;
                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-950 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-white">{inv.invoice_number}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          inv.platform === 'amazon' ? 'bg-amber-500/20 text-amber-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {inv.platform || 'Marketplace'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                          {Number(inv.total_amount || 0).toLocaleString()} ج.م
                        </span>
                        <span>{itemsCount} منتجات</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        طلب: {inv.order_id || inv.amazon_order_id || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3 & 4: Selected Invoice Details & Split Waybills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 3: Selected Invoice Details & Split Button */}
          {selectedInvoice && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                    <h3 className="text-base font-black text-white">تفاصيل الفاتورة المختارة</h3>
                    <span className="font-mono text-amber-400 text-xs font-bold mr-2">({selectedInvoice.invoice_number})</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    رقم طلب المنصة: <span className="font-mono font-bold text-slate-200">{selectedInvoice.order_id || '—'}</span>
                  </p>
                </div>

                <button
                  onClick={handleSplitInvoice}
                  disabled={isSplitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 disabled:opacity-50"
                >
                  <Scissors className={`w-4 h-4 ${isSplitting ? 'animate-spin' : ''}`} />
                  <span>{isSplitting ? 'جاري التقسيم...' : '✂️ قسم البوليصة الآن'}</span>
                </button>
              </div>

              {/* Items in the original invoice */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300">المنتجات الموجودة بالفاتورة ({selectedInvoice.items?.length || 0}):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedInvoice.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-200 line-clamp-1">{it.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">SKU: {it.sku}</div>
                      </div>
                      <div className="text-right shrink-0 mr-3">
                        <div className="text-xs font-bold text-amber-400 font-mono">{Number(it.price || 0).toLocaleString()} ج.م</div>
                        <div className="text-[10px] text-slate-500 font-mono">الكمية: {it.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Split Waybills Preview & Download */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                  <h3 className="text-base font-black text-white">البوالص الفردية المقسمة ({splitResults.length})</h3>
                </div>
                <p className="text-xs text-slate-400">جاهزة للطباعة مع باركود QR مستقل لكل منتج وشركة شحن</p>
              </div>

              {splitResults.length > 0 && (
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isExportingZip}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Archive className={`w-4 h-4 ${isExportingZip ? 'animate-spin' : ''}`} />
                  <span>{isExportingZip ? 'جاري تجهيز الـ ZIP...' : 'تحميل الكل كـ ZIP (ملف مضغوط)'}</span>
                </button>
              )}
            </div>

            {splitResults.length === 0 ? (
              <div className="py-16 text-center bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
                <Scissors className="w-12 h-12 text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-sm">لم يتم تقسيم هذه الفاتورة بعد</h4>
                  <p className="text-slate-500 text-xs">اضغط على زر "✂️ قسم البوليصة الآن" لتوليد بوالص الشحن الفردية مع الباركود</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {splitResults.map((split, idx) => (
                  <div
                    key={split.id || idx}
                    className="bg-slate-950 p-4 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-inner"
                  >
                    <div>
                      {/* Split header */}
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                        <span className="font-mono font-black text-amber-400 text-xs">
                          بوليصة: {split.split_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          بوليصة مستقلة
                        </span>
                      </div>

                      {/* Product & QR Code */}
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-md">
                          <QRCodeSVG
                            value={split.product_sku || split.split_number}
                            size={72}
                            level="M"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-relaxed">
                            {split.product_title}
                          </h4>
                          <div className="text-[11px] font-mono text-slate-400">
                            SKU: <span className="text-amber-400 font-bold">{split.product_sku}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span className="text-slate-400">الكمية: {split.quantity}</span>
                            <span className="text-emerald-400 font-bold">{Number(split.price || 0).toLocaleString()} ج.م</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {currentTrader?.seller_name} ({currentTrader?.seller_id || 'ID'})
                      </span>
                      <button
                        onClick={() => handleDownloadPdf(split)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[11px] transition flex items-center gap-1.5 border border-amber-500/30"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>تحميل PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaybillSplitterPage;
