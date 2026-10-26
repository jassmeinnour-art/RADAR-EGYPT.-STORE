import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Printer,
  Sparkles,
  Layers,
  Palette,
  Store,
  Tag,
  Barcode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ProductData } from '../types';

interface ProductQRCodeModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
  onShowToast?: (msg: string) => void;
}

export const ProductQRCodeModal: React.FC<ProductQRCodeModalProps> = ({
  product,
  isOpen,
  onClose,
  currency = 'EGP',
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState<'black' | 'indigo' | 'emerald' | 'dark'>('black');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrSize, setQrSize] = useState<number>(220);
  const [linkType, setLinkType] = useState<'app_product' | 'amazon_eg' | 'noon_eg' | 'custom'>('app_product');
  const [customUrl, setCustomUrl] = useState('');
  const qrContainerRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  // Determine target link based on linkType
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://radaregypt.store';
  
  const appProductUrl = `${origin}?product=${encodeURIComponent(product.id)}&title=${encodeURIComponent(product.title.slice(0, 40))}`;
  
  const amazonOffer = product.merchantOffers?.find(o => o.platform === 'amazon_eg' || o.url?.includes('amazon'));
  const amazonUrl = amazonOffer?.url || `https://www.amazon.eg/dp/${product.id}`;

  const noonOffer = product.merchantOffers?.find(o => o.platform === 'noon_eg' || o.url?.includes('noon'));
  const noonUrl = noonOffer?.url || `https://www.noon.com/egypt-ar/search?q=${encodeURIComponent(product.title)}`;

  let activeTargetUrl = appProductUrl;
  if (linkType === 'amazon_eg') activeTargetUrl = amazonUrl;
  if (linkType === 'noon_eg') activeTargetUrl = noonUrl;
  if (linkType === 'custom' && customUrl.trim()) activeTargetUrl = customUrl.trim();

  // Color Mapping
  const colorMap = {
    black: { fg: '#000000', bg: '#ffffff', label: 'أسود كلاسيكي' },
    indigo: { fg: '#4f46e5', bg: '#ffffff', label: 'إينديغو مميز' },
    emerald: { fg: '#059669', bg: '#ffffff', label: 'زمردي ناصع' },
    dark: { fg: '#f8fafc', bg: '#0f172a', label: 'داكن شاشة' }
  };

  const currentColor = colorMap[qrColor];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeTargetUrl);
    setCopied(true);
    if (onShowToast) {
      onShowToast(`تم نسخ رابط المنتج للموبايل (${activeTargetUrl.slice(0, 35)}...) 📋`);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `رابط التاجر والمنتج برادار مصر: ${product.title}`,
          url: activeTargetUrl
        });
        if (onShowToast) onShowToast('تمت مشاركة رابط المنتج بنجاح 🚀');
      } catch {
        // Share cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadSVG = () => {
    if (!qrContainerRef.current) return;
    const svgElement = qrContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `QR-Code-${product.sku || product.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`تم تحميل رمز QR بدقة أصلية SVG لـ ${product.title.slice(0, 25)} 📥`);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrContainerRef.current) return;
    const svgElement = qrContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = currentColor.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR-Code-${product.sku || product.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        if (onShowToast) {
          onShowToast(`تم تحويل وتحميل ملصق QR بنجاح PNG 🖼️`);
        }
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>ملصق QR التاجر - ${product.title}</title>
        <style>
          body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
            padding: 20px;
            background: #ffffff;
            color: #000000;
          }
          .label-card {
            border: 2px solid #000000;
            border-radius: 12px;
            padding: 20px;
            max-width: 360px;
            margin: 0 auto;
            text-align: center;
          }
          .title {
            font-size: 14px;
            font-weight: 800;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .price {
            font-size: 18px;
            font-weight: 900;
            color: #059669;
            margin-bottom: 12px;
          }
          .sku {
            font-size: 11px;
            font-family: monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 12px;
          }
          .qr-box {
            display: flex;
            justify-content: center;
            margin-bottom: 12px;
          }
          .footer {
            font-size: 10px;
            color: #64748b;
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="label-card">
          <div class="title">${product.title}</div>
          <div class="price">${product.currentLowestPrice.toLocaleString()} ${currency}</div>
          <div class="sku">SKU: ${product.sku || product.id} | ASIN: ${product.id}</div>
          <div class="qr-box">
            ${qrContainerRef.current?.innerHTML || ''}
          </div>
          <div class="footer">
            رادار التاجر مصر • امسح الرمز للوصول المباشر من الموبايل
          </div>
        </div>
        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="qr-modal-backdrop"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={onClose}
          dir="rtl"
        >
          <motion.div
            id="qr-modal-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white font-['Alexandria'] truncate">
                    مولد رمز QR المباشر للموبايل
                  </h3>
                  <p className="text-[11px] text-slate-400 font-['Cairo'] truncate">
                    مسح ضوئي فوري للوصول السريع لصفحة المنتج والتاجر على الجوال
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all cursor-pointer shrink-0"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 max-h-[80vh] custom-scrollbar">
              {/* Product Info Compact Header */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center gap-3">
                <img
                  src={product.imageUrl || '/icon.svg'}
                  alt={product.title}
                  className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white font-['Alexandria'] truncate">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                    <span className="font-mono text-emerald-400 font-bold">
                      {product.currentLowestPrice.toLocaleString()} {currency}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-sky-300">
                      SKU: {product.sku || product.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Link Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>وجهة الرابط للـ QR Code (Target Mobile Destination)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkType('app_product')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      linkType === 'app_product'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span className="text-[11px] truncate">صفحة رادار التاجر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkType('amazon_eg')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      linkType === 'amazon_eg'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-[11px] truncate">أمازون مصر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkType('noon_eg')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      linkType === 'noon_eg'
                        ? 'bg-yellow-600 text-white border-yellow-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-[11px] truncate">نون مصر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkType('custom')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      linkType === 'custom'
                        ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span className="text-[11px] truncate">رابط مخصص</span>
                  </button>
                </div>

                {linkType === 'custom' && (
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/mobile-catalog"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono mt-1 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Main Interactive QR Display Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                {/* QR Code Canvas/SVG Output */}
                <div
                  ref={qrContainerRef}
                  className="p-4 rounded-2xl border flex items-center justify-center shadow-2xl relative transition-all"
                  style={{ backgroundColor: currentColor.bg, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <QRCodeSVG
                    value={activeTargetUrl}
                    size={qrSize}
                    fgColor={currentColor.fg}
                    bgColor={currentColor.bg}
                    level="H"
                    includeMargin={true}
                    imageSettings={
                      includeLogo
                        ? {
                            src: '/icon.svg',
                            x: undefined,
                            y: undefined,
                            height: Math.round(qrSize * 0.18),
                            width: Math.round(qrSize * 0.18),
                            excavate: true
                          }
                        : undefined
                    }
                  />
                </div>

                {/* Styling & Customization Controls */}
                <div className="space-y-4 w-full sm:w-auto min-w-[200px]">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      <span>لون وتصميم الرمز:</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(colorMap) as Array<keyof typeof colorMap>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setQrColor(key)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                            qrColor === key
                              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {colorMap[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>حجم البكسل:</span>
                      <span className="font-mono text-indigo-300">{qrSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="160"
                      max="300"
                      step="10"
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={includeLogo}
                      onChange={(e) => setIncludeLogo(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>إدراج شعار رادار التاجر بمنتصف QR</span>
                  </label>
                </div>
              </div>

              {/* Active Target URL Bar with Copy Button */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400">الرابط المباشر للرمز:</div>
                  <div className="text-xs font-mono text-indigo-300 truncate font-semibold" dir="ltr">
                    {activeTargetUrl}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تحميل PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>طباعة ملصق رفوف</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
