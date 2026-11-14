import React from 'react';
import { Home, ArrowRight, Compass, Users, Package, LayoutDashboard } from 'lucide-react';
import { navigate } from '../utils/navigation';

interface NotFoundPageProps {
  requestedPath?: string;
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  requestedPath,
  onGoHome,
}) => {
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
    <div
      className="w-full min-h-[70vh] flex items-center justify-center p-6 font-['Cairo']"
      dir="rtl"
    >
      <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 sm:p-10 text-center shadow-2xl space-y-6">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-amber-400 font-mono select-none">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-slate-400 font-bold leading-relaxed">
            عذراً، المسار الذي تحاول الوصول إليه غير متاح أو تم نقله.
          </p>
          {currentPath && currentPath !== '/' && (
            <div className="pt-1">
              <span
                dir="ltr"
                className="inline-block px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300"
              >
                {currentPath}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            id="btn-404-go-home"
            onClick={handleGoHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          <button
            type="button"
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للخلف</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-500 mb-3">
            أو انتقل مباشرة إلى أحد الأقسام الرئيسية:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة التحكم</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/traders')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>التجار</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>المنتجات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
