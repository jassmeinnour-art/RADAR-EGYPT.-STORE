import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  Package, 
  Boxes, 
  DollarSign, 
  ExternalLink,
  SlidersHorizontal,
  Compass,
  AlertCircle
} from 'lucide-react';
import { ProductData, WholesaleLocation } from '../types';
import { safeOpenUrl } from '../utils/safeWindowOpen';

interface EgyptWholesaleLocationsProps {
  product: ProductData;
  currency: string;
  onNavigateToSuppliersHub?: () => void;
}

export const EgyptWholesaleLocations: React.FC<EgyptWholesaleLocationsProps> = ({
  product,
  currency,
  onNavigateToSuppliersHub,
}) => {
  const wholesaleLocations = product?.wholesaleLocations || [];

  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [activeLocationId, setActiveLocationId] = useState<string | null>(
    wholesaleLocations[0]?.id || null
  );

  const hubs = [
    'مدينة دمياط للأثاث وشطا',
    'السبتية ووسط البلد للأخشاب',
    'المنطقة الصناعية 6 أكتوبر وبدر',
    'العاشر من رمضان للأثاث المكتبي',
    'المنصورة وسندوب للأطفال',
  ];

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Alexandria']">دليل أسواق الجملة المصرية</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          يرجى اختيار أو إضافة منتج من القائمة للتعرف على أسواق الجملة والمستوردين ومنافذ التوريد الخاصة به.
        </p>
      </div>
    );
  }

  const filteredLocations = wholesaleLocations.filter((loc) => {
    if (selectedHub !== 'all' && loc.hubType !== selectedHub) {
      return false;
    }
    return true;
  });

  const activeLocation = wholesaleLocations.find((l) => l.id === activeLocationId) || wholesaleLocations[0];

  const handleOpenGoogleMaps = (loc: WholesaleLocation) => {
    const lat = loc.coordinates?.lat || 30.0488;
    const lng = loc.coordinates?.lng || 31.2464;
    const url = loc.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    safeOpenUrl(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Spotlight Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700">دليل أسواق الجملة ومنافذ أثاث مصر 🇪🇬</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria']">
              أماكن ومراكز توزيع وخامات {product.title} في السوق المصري
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              تصفح مستوردي وموزعي الأخشاب وخامات الأثاث ومصانع دمياط والسبتية وأكتوبر والعاشر، أسعار الجملة كاش، وأرقام مسؤولي المبيعات.
            </p>
            {onNavigateToSuppliersHub && (
              <button
                type="button"
                onClick={onNavigateToSuppliersHub}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
              >
                <span>الانتقال إلى دليل وشبكة مصانع الأثاث (Suppliers Hub) 🏭</span>
              </button>
            )}
          </div>

          {/* Hub Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedHub('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedHub === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              جميع الأسواق ({wholesaleLocations.length})
            </button>
            {hubs.map((hub) => (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedHub === hub
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Simulated Cairo/Egypt Map & Wholesale Suppliers List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Map Simulation */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900 text-sm font-['Alexandria']">
                خريطة مراكز الجملة والتوزيع (القاهرة والإسكندرية)
              </span>
            </div>
            {activeLocation && (
              <span className="text-xs text-slate-500">
                الموقع النشط: <strong className="text-indigo-700">{activeLocation.marketName}</strong>
              </span>
            )}
          </div>

          {/* Interactive Map Frame with Pin Hotspots */}
          <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center p-4">
            
            {/* Map Background Grid Visual */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:18px_18px]" />

            {/* Simulated Nile River and Cairo Ring Road Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-indigo-500/40 opacity-70" fill="none">
              {/* River Nile line */}
              <path d="M 220 0 Q 240 150 200 280 T 180 500" strokeWidth="10" stroke="#38bdf8" />
              {/* Ring Road line */}
              <circle cx="50%" cy="50%" r="140" strokeWidth="2" strokeDasharray="6 6" stroke="#818cf8" />
              <path d="M0 240 Q 200 200 600 260" strokeWidth="4" />
              <path d="M120 40 Q 300 220 500 400" strokeWidth="3" />
            </svg>

            {/* Map Area Labels */}
            <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-400 bg-black/40 px-2.5 py-1 rounded-lg">
              خريطة أسواق القاهرة الكبرى
            </div>
            <div className="absolute bottom-4 left-4 text-[10px] text-sky-400 bg-black/40 px-2 py-0.5 rounded-md">
              نهر النيل ~ وسط البلد
            </div>

            {/* Map Pins */}
            {filteredLocations.map((loc, idx) => {
              const isSelected = loc.id === activeLocationId;
              const positions = [
                { top: '48%', left: '46%' }, // Abdel Aziz Street (Central Cairo)
                { top: '42%', left: '40%' }, // Bostan Mall (Tahrir)
                { top: '36%', left: '52%' }, // Ataba / Mosky
                { top: '18%', left: '22%' }, // Alexandria Hub
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={loc.id}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setActiveLocationId(loc.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform hover:scale-110"
                >
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-xl font-bold text-xs transition-all ${
                    isSelected 
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 scale-110' 
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}>
                    <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-indigo-600'}`} />
                    <span>{loc.hubType}</span>
                    <span className="text-[10px] opacity-90">({loc.wholesalePrice} ج.م)</span>
                  </div>
                </div>
              );
            })}

            {/* Floating Active Hub Details Card on Map */}
            {activeLocation && (
              <div className="absolute bottom-3 inset-x-3 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white font-['Alexandria']">
                      {activeLocation.marketName}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      سعر الجملة: {activeLocation.wholesalePrice.toLocaleString()} {currency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{activeLocation.address}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>متاح حتى {activeLocation.openUntil} • المسؤول: {activeLocation.supplierContact}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${activeLocation.phone}`}
                    className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeLocation.phone}</span>
                  </a>

                  <button
                    onClick={() => handleOpenGoogleMaps(activeLocation)}
                    className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all flex-1 sm:flex-none cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>فتح اللوكيشن عبر خرائط جوجل</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Wholesale Hubs List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">قائمة منافذ الجملة والمستوردين ({filteredLocations.length})</span>
            <span className="text-[11px] text-slate-500">أسعار كاش للتاجر</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const isSelected = loc.id === activeLocationId;

              return (
                <div
                  key={loc.id}
                  onClick={() => setActiveLocationId(loc.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-indigo-50/60 border-2 border-indigo-600 shadow-md'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {loc.city}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{loc.marketName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{loc.branchName}</p>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-sm font-black text-emerald-600">
                        {loc.wholesalePrice.toLocaleString()} {currency}
                      </div>
                      <span className="text-[10px] text-slate-400">سعر القطعة جملة</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl mb-2.5 border border-slate-100">
                    💡 {loc.notes || 'تسليم فوري بضمان الوكيل المعتمد'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-indigo-600" />
                      <span>أقل كمية: <strong>{loc.minOrderQuantity} قطع</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${loc.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>اتصال</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenGoogleMaps(loc);
                        }}
                        className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                        title="فتح الملاحة"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
