import React, { useState } from 'react';
import {
  Home,
  ArrowRight,
  Compass,
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  GitCompareArrows,
  Truck,
  ArrowUpLeft,
} from 'lucide-react';
import { navigate } from '../utils/navigation';
import notFoundIllustration from '../assets/images/not_found_compass_1795626024401.jpg';

interface NotFoundPageProps {
  requestedPath?: string;
  onGoHome?: () => void;
}

interface QuickSectionLink {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const QUICK_SECTIONS: QuickSectionLink[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    description: 'الملخص التنفيذي والمؤشرات',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />,
  },
  {
    id: 'traders',
    label: 'التجار',
    description: 'حسابات المتاجر والربط',
    path: '/traders',
    icon: <Users className="w-4 h-4 text-sky-400 shrink-0" />,
  },
  {
    id: 'products',
    label: 'المنتجات',
    description: 'الكتالوج والأسعار الحالية',
    path: '/products',
    icon: <Package className="w-4 h-4 text-emerald-400 shrink-0" />,
  },
  {
    id: 'inventory',
    label: 'إدارة المخزون',
    description: 'الأرصدة وحالة التوفر',
    path: '/inventory',
    icon: <Boxes className="w-4 h-4 text-indigo-400 shrink-0" />,
  },
  {
    id: 'competitors',
    label: 'المنافسين والأسعار',
    description: 'فجوات السوق ومتاجر المنافسين',
    path: '/competitors',
    icon: <GitCompareArrows className="w-4 h-4 text-orange-400 shrink-0" />,
  },
  {
    id: 'invoices',
    label: 'الشحن والفواتير',
    description: 'الطلبات وبوالص الشحن',
    path: '/invoices',
    icon: <Truck className="w-4 h-4 text-rose-400 shrink-0" />,
  },
];

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  requestedPath,
  onGoHome,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const currentPath =
    requestedPath ??
    (typeof window !== 'undefined' ? window.location.pathname : '');

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <main
      dir="rtl"
      data-testid="not-found-page"
      className="w-full min-h-[78vh] flex items-center justify-center px-4 py-8 sm:px-8 font-['Cairo']"
    >
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
        {/* Top Hero Split: Text & Primary Navigation + Editorial 4:3 Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Right Column (RTL Primary): Message & Actions */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {/* Quiet unboxed metadata line */}
              <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-slate-400">
                <span className="font-mono tabular-nums text-amber-400">خطأ 404</span>
                <span aria-hidden="true">·</span>
                <span>مسار غير موجود</span>
                {currentPath && currentPath !== '/' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span dir="ltr" className="font-mono text-slate-300 truncate max-w-[260px]">
                      {currentPath}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight [text-wrap:balance]">
                الصفحة التي تبحث عنها غير موجودة
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                قد يكون الرابط غير مكتمل أو تم نقل هذا القسم إلى مسار آخر. يمكنك العودة إلى الصفحة الرئيسية أو الانتقال مباشرة إلى أي من الأقسام التالية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-404-go-home"
                onClick={handleGoHome}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>العودة للرئيسية</span>
              </button>

              <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700 transition-colors duration-150 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>الرجوع للخلف</span>
              </button>
            </div>
          </div>

          {/* Left Column (RTL Secondary): 4:3 Illustration with Resilient Fallback */}
          <div className="lg:col-span-5 bg-slate-950/70 border-t lg:border-t-0 lg:border-r border-slate-800 flex items-center justify-center p-4 sm:p-6">
            {!imageFailed ? (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950">
                <img
                  src={notFoundIllustration}
                  alt="صورة توضيحية لصفحة غير موجودة 404"
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                aria-label="رسم توضيحي لصفحة غير موجودة"
                className="w-full aspect-[4/3] rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center gap-3 p-6 text-center"
              >
                <Compass className="w-12 h-12 text-amber-400" aria-hidden="true" />
                <div className="font-mono tabular-nums text-4xl font-black text-amber-400">404</div>
                <div className="text-xs font-bold text-slate-400">المسار غير متوفر</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Quick Navigation Menu for Key Sections */}
        <div className="border-t border-slate-800 bg-slate-950/40 p-6 sm:px-10 sm:py-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-slate-200">
              قائمة سريعة لأهم الأقسام
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              اختر الوجهة للانتقال الفوري
            </span>
          </div>

          <nav
            aria-label="قائمة سريعة لأهم الأقسام"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {QUICK_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => navigate(section.path)}
                className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-right transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                      {section.label}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {section.description}
                    </div>
                  </div>
                </div>
                <ArrowUpLeft
                  className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0"
                  aria-hidden="true"
                />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
