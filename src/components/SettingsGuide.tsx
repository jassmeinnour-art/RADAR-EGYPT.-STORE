import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Globe, 
  Smartphone,
  Lock
} from 'lucide-react';

interface SettingsGuideProps {
  onShowToast?: (msg: string) => void;
  onOpenConnectionModal?: (platform: 'amazon' | 'noon') => void;
}

export const SettingsGuide: React.FC<SettingsGuideProps> = ({
  onShowToast,
  onOpenConnectionModal,
}) => {
  const [activeTab, setActiveTab] = useState<'amazon' | 'noon' | 'troubleshooting'>('amazon');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onShowToast?.(`تم نسخ ${label} إلى الحافظة بنجاح! 📋`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-900/95 text-slate-100 rounded-3xl border border-sky-500/30 shadow-2xl backdrop-blur-xl font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-500/20 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              دليل الربط التقني والتوثيق (SettingsGuide)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-200 via-sky-400 to-sky-500 bg-clip-text text-transparent">
            دليل ربط حسابات Amazon SP-API و Noon API بدقة واحترافية
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            خطوات تفصيلية ورسوم توضيحية لربط متجرك، توليد مفاتيح التوثيق (LWA / API Credentials)، وتجنب أخطاء المزامنة وانقطاع الـ Buy Box.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('amazon')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'amazon'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>أمازون SP-API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('noon')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'noon'
                ? 'bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/25 border border-yellow-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>نون API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('troubleshooting')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'troubleshooting'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 border border-rose-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>استكشاف الأخطاء وإصلاحها</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Amazon SP-API Guide */}
      {activeTab === 'amazon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Step 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10">لوحة بائع أمازون</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">تسجيل الدخول لـ Seller Central</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  توجه إلى بوابة بائعين أمازون مصر (Amazon.eg Seller Central) أو الحساب العالمي، ثم افتح قائمة التطبيقات والخدمات (Partner Network).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">الرابط المعتمد:</span>
                <a
                  href="https://sellercentral.amazon.eg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Seller Central</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10">توليد مفاتيح LWA</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">استخراج Client ID & Secret</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  أنشئ تفويض تطبيق جديد (Authorize new developer) واحصل على معرّف العميل (Client ID)، مفتاح السر (Client Secret)، ورمز التحديث (Refresh Token).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مطلوب لفتح قناة التزامن الآلي
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10">الربط برادار التاجر</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">إدخال البيانات في رادار التاجر</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  قم بلصق المفاتيح في نافذة ربط منصات البيع أو إعدادات المتجر السحابي لتفعيل فحص الأسعار لحظياً واقتناص الـ Buy Box.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                {onOpenConnectionModal && (
                  <button
                    type="button"
                    onClick={() => onOpenConnectionModal('amazon')}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    فتح نافذة ربط أمازون ⚡
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Visual Diagram Mockup for Amazon SP-API Architecture */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-sky-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>مخطط تدفق البيانات الآمن لربط أمازون مصر (Amazon SP-API Architecture)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <div className="text-xs font-bold text-amber-400">1. بائع أمازون مصر</div>
                <div className="text-[11px] text-slate-400">Seller Central Account & Inventory Catalogs</div>
              </div>
              <div className="flex items-center justify-center text-amber-400 font-bold rotate-90 md:rotate-0">➔</div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <div className="text-xs font-bold text-sky-400">2. OAuth / LWA Token</div>
                <div className="text-[11px] text-slate-400">Secure Token Exchange & Refresh Credentials</div>
              </div>
              <div className="flex items-center justify-center text-amber-400 font-bold rotate-90 md:rotate-0">➔</div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1 md:col-span-4 bg-sky-950/40 border-sky-500/40">
                <div className="text-xs font-black text-sky-200">3. رادار التاجر الذكي (Merchant Radar Egypt Cloud Core)</div>
                <div className="text-[11px] text-sky-300">مزامنة أسعار Buy Box كل 60 ثانية + تحديث آلي لهامش الربح وطلبات الجملة</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Noon API Guide */}
      {activeTab === 'noon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Step 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-sm flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[11px] text-yellow-300 font-bold px-2 py-0.5 rounded bg-yellow-400/10">بوابة شركاء نون</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">تسجيل الدخول لـ Noon Partner Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  سجل دخولك إلى لوحة تحكم بائعين نون في مصر أو الإمارات (Partner ID)، ثم توجه إلى قسم إعدادات التكامل (API Integrations).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">الرابط المعتمد:</span>
                <a
                  href="https://partners.noon.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-yellow-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Noon Partners</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-sm flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[11px] text-yellow-300 font-bold px-2 py-0.5 rounded bg-yellow-400/10">توليد مفتاح API Key</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">استخراج مفتاح الوصول (Auth Key)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  انقر على (Generate New API Key) وحدد الصلاحيات اللازمة (Inventory & Catalog & Pricing)، ثم انسخ المفتاح السري للاستخدام.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  صلاحية كاملة لربط نون إكسبرس
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-sky-500/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-sm flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[11px] text-yellow-300 font-bold px-2 py-0.5 rounded bg-yellow-400/10">التفعيل الفوري</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-100 mb-1">إدخال مفتاح نون في رادار التاجر</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  الصق مفتاح نون في نظام الربط السحابي للاستفادة من مزامنة طلبات نون وعروض البلاك فرايدي وبيع المخزون المشترك.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                {onOpenConnectionModal && (
                  <button
                    type="button"
                    onClick={() => onOpenConnectionModal('noon')}
                    className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    فتح نافذة ربط نون ⚡
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Visual Diagram Mockup for Noon API Architecture */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-sky-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>مخطط تدفق البيانات لربط نون مصر (Noon API Architecture)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <div className="text-xs font-bold text-yellow-400">1. شريك نون (Noon Partner)</div>
                <div className="text-[11px] text-slate-400">Inventory Sync & SKU Fulfillment</div>
              </div>
              <div className="flex items-center justify-center text-yellow-400 font-bold rotate-90 md:rotate-0">➔</div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <div className="text-xs font-bold text-sky-400">2. Noon Auth Key & Signature</div>
                <div className="text-[11px] text-slate-400">Encrypted API Bearer Token</div>
              </div>
              <div className="flex items-center justify-center text-yellow-400 font-bold rotate-90 md:rotate-0">➔</div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1 md:col-span-4 bg-sky-950/40 border-sky-500/40">
                <div className="text-xs font-black text-sky-200">3. رادار التاجر الذكي (Merchant Radar Egypt Cloud Core)</div>
                <div className="text-[11px] text-sky-300">مراقبة أسعار نون إكسبرس الفورية + تنبيهات هبوط السعر</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Troubleshooting Guide */}
      {activeTab === 'troubleshooting' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Error 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  خطأ 401 / Unauthorized (انتهاء صلاحية التوكن)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">شائع</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يحدث هذا الخطأ عندما تنتهي صلاحية مفتاح Refresh Token أو يتم تغيير كلمة مرور حساب البائع في أمازون أو نون.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-400">💡 الحل السريع:</div>
                <div>توجه إلى إعدادات المنصة، انقر على "إعادة توليد الرمز وتحديث الاتصال"، ثم ألصق المفتاح الجديد.</div>
              </div>
            </div>

            {/* Error 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  خطأ 429 / Rate Limit Exceeded (تجاوز حد الطلبات)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">حماية الاتصال</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يقوم رادار التاجر بإرسال عدد كبير من طلبات الاستعلام في ثوانٍ معدودة لتحديث الأسعار، مما يتسبب في حظر مؤقت من واجهة البرمجة (API).
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-400">💡 الحل السريع:</div>
                <div>يقوم النظام تلقائياً بتفعيل (Backoff Algorithm) لتنظيم الدفعات، ولا يتطلب أي تدخل يدوي.</div>
              </div>
            </div>

            {/* Error 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  خطأ عدم مطابقة الـ SKU (SKU Mismatch)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">الكتالوج</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                فشل النظام في مطابقة أسعار المنتجات لعدم توفر نفس كود الباركود الدولي (EAN / UPC) أو رمز الـ SKU في الكتالوج المسجل.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-400">💡 الحل السريع:</div>
                <div>استخدم أداة "مدرب الكتالوج الذكي" في رادار التاجر لتحديث الأكواد الباركودية آلياً بنقرة واحدة.</div>
              </div>
            </div>

            {/* Error 4 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  انقطاع مهلة الاتصال بالخادم (Timeout 504)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">شبكة</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                بطء مؤقت في استجابة خوادم منصات البيع أو الاتصال السحابي بفرع مصر.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-400">💡 الحل السريع:</div>
                <div>يعمل النظام بوضع الاحتياط (Fallback Mode) لعرض آخر سعر مسجل مؤقتاً لحين استعادة خط الاتصال.</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>جميع مفاتيح الربط ومفاتيح API مشفرة بالكامل بمعايير الأمان المصرفية داخل قاعدة بيانات Firebase المشفرة.</span>
        </div>
        <div className="text-sky-300 font-bold">
          رادار التاجر الذكي · دعم فني متواصل 24/7
        </div>
      </div>

    </div>
  );
};

export default SettingsGuide;
