import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  ArrowLeft,
  Mail,
  Globe,
  X,
  Package,
  Trash2,
  Pencil,
  Phone,
  ExternalLink,
  Store,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  History,
  UserPlus,
  BarChart3,
  Copy,
  Key,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  IMPORT_BUTTON_LABEL,
  buildMerchantAmazonAuthorizeUrl,
  fetchProductionAmazonOAuthClientId,
  getResolvedAmazonOAuthClientId,
  getTraderAmazonConnection,
  saveTraderAmazonConnection,
} from '../utils/sellerCentralExcelImporter';
import { supabase, Trader, getTraderLastSyncAt, cleanTraderPayloadForInsert } from '../lib/supabase';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { navigate } from '../utils/navigation';
import { GlobalEmptyState } from './GlobalEmptyState';
import { FetchProductsModal } from './FetchProductsModal';
import { EditTraderModal } from './EditTraderModal';
import { dataCache } from '../utils/dataCache';
import { DraggableHandle } from './DraggableHandle';
import { EmergencyErrorBanner } from './EmergencyLoginButton';
import { RADAR_PULL_TO_REFRESH_EVENT } from './PullToRefresh';
import { isMaintenanceModeActive, MAINTENANCE_MODE_BLOCK_MESSAGE } from '../utils/maintenanceMode';
import { ErrorBoundary } from './ErrorBoundary';
import { CompetingStoresManagerModal } from './CompetingStoresManagerModal';
import {
  getTraderCompetingStoresSummary,
  RADAR_COMPETING_STORES_UPDATED_EVENT,
} from '../utils/competingStoresManager';

interface TradersPageProps {
  onShowToast?: (message: string) => void;
  onSelectTrader?: (traderId: string) => void;
}

function safeFormatSupabaseError(err: any): string {
  if (!err) return 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات';
  if (typeof err === 'string') return err;
  const msg = String(err.message || err.error_description || err.error || '').trim();
  const details = String(err.details || '').trim();
  const hint = String(err.hint || '').trim();
  const code = String(err.code || '').trim();
  const parts = [msg, details && !msg.includes(details) ? details : '', hint && !msg.includes(hint) ? `(${hint})` : ''].filter(Boolean);
  return parts.join(' — ') || (code ? `Supabase Error Code: ${code}` : 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات');
}

const PLATFORM_DETAILS: Record<string, { name: string; color: string; logo: string }> = {
  amazon: { name: 'أمازون (Amazon)', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', logo: 'https://cdn.simpleicons.org/amazon/FF9900' },
  noon: { name: 'نون (Noon)', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Noon.com_Logo.svg' },
  jumia: { name: 'جوميا (Jumia)', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300', logo: 'https://cdn.simpleicons.org/jumia/FF9900' },
  bayyaa: { name: 'بياع (Bayyaa)', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  raneen: { name: 'رنين (Raneen)', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', logo: 'https://www.raneen.com.eg/favicon.ico' },
  kanz: { name: 'كنز (Kanz)', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  homesmart: { name: 'هوم سمارت (HomeSmart)', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300', logo: 'https://www.homesmart.com.eg/favicon.ico' }
};

const TraderCard: React.FC<{
  trader: Trader;
  isSyncing: boolean;
  onSelect: (t: Trader) => void;
  onEdit: (t: Trader) => void;
  onDelete: (e: React.MouseEvent, t: Trader) => void;
  onFetch: (t: Trader) => void;
  onOpenCompetingStores: (t: Trader) => void;
  onTraderUpdated?: (updated: Trader) => void;
  storesTick?: number;
  onShowToast?: (message: string) => void;
}> = React.memo(({ trader, isSyncing, onSelect, onEdit, onDelete, onFetch, onOpenCompetingStores, onTraderUpdated, storesTick, onShowToast }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const plat = PLATFORM_DETAILS[trader.platform] || {
    name: trader.platform || 'منصة عامة',
    color: 'border-slate-700 bg-slate-800 text-slate-300',
    logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
  };
  const rawSellerId = (trader.seller_id || trader.seller_ids?.[trader.platform] || '').trim();
  const sellerId = rawSellerId || 'غير محدد';
  const [productionClientId, setProductionClientId] = useState<string>(() =>
    getResolvedAmazonOAuthClientId()
  );
  const defaultAuthorizeUrl = buildMerchantAmazonAuthorizeUrl(
    rawSellerId,
    trader.seller_name,
    productionClientId
  );
  const [authorizeUrlValue, setAuthorizeUrlValue] = useState(defaultAuthorizeUrl);
  const [isEditingAuthorizeUrl, setIsEditingAuthorizeUrl] = useState(false);
  const hasEditedAuthorizeUrlRef = useRef(false);
  const authorizeUrlInputRef = useRef<HTMLInputElement>(null);

  const savedConnection = getTraderAmazonConnection(trader);
  const hasRefreshToken = Boolean(savedConnection.refreshToken);
  const [refreshTokenInput, setRefreshTokenInput] = useState(savedConnection.refreshToken);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProductionAmazonOAuthClientId().then((resolvedId) => {
      if (active && resolvedId) {
        setProductionClientId(resolvedId);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasEditedAuthorizeUrlRef.current) {
      setAuthorizeUrlValue(defaultAuthorizeUrl);
    }
  }, [defaultAuthorizeUrl]);

  useEffect(() => {
    setRefreshTokenInput(getTraderAmazonConnection(trader).refreshToken);
  }, [trader]);

  const handleSaveRefreshTokenFromCard = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanToken = refreshTokenInput.trim();
    setIsSavingToken(true);
    try {
      await saveTraderAmazonConnection({
        traderId: trader.id,
        sellerId: rawSellerId,
        refreshToken: cleanToken,
        existingTrader: trader,
      });
      onTraderUpdated?.({
        ...trader,
        refresh_token: cleanToken || undefined,
      });
      onShowToast?.(
        cleanToken
          ? '✅ تم حفظ Refresh Token الخاص بالتاجر بنجاح — جاهز للسحب المباشر من SP-API'
          : 'تم مسح Refresh Token من كارت التاجر'
      );
    } catch (err: any) {
      onShowToast?.(`❌ تعذر حفظ Refresh Token: ${err?.message || err}`);
    } finally {
      setIsSavingToken(false);
    }
  };

  const destinationUrl = (trader.destination_url || trader.seller_link || '').trim();
  const storeUrl = (trader.store_url || trader.storefront_link || '').trim();
  const displayEmail = (trader.gmail || trader.email || '').trim();
  const phone = (trader.phone || '').trim();
  const competingSummary = React.useMemo(
    () => getTraderCompetingStoresSummary(trader),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trader, storesTick]
  );

  const lastSyncTimestamp = getTraderLastSyncAt(
    trader.id,
    trader.last_sync_at,
    trader.last_sync_timestamp
  );
  const lastSyncMs = lastSyncTimestamp ? Date.parse(lastSyncTimestamp) : NaN;
  const hasValidSync = Number.isFinite(lastSyncMs);
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const isOverdue24h = !hasValidSync || Date.now() - lastSyncMs > TWENTY_FOUR_HOURS_MS;
  const formattedSyncDate = hasValidSync
    ? new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(lastSyncMs))
    : 'لم يتم السحب بعد';

  return (
    <div
      ref={cardRef}
      data-testid={`trader-card-${trader.id}`}
      onClick={() => onSelect(trader)}
      className="card border relative overflow-hidden flex flex-col justify-between p-5 bg-slate-900/90 border-slate-800 hover:border-amber-500/50 rounded-3xl shadow-xl transition-colors cursor-pointer"
    >
      <DraggableHandle elementId={`trader_card_${trader.id}`} targetRef={cardRef} position="bottom-right" />

      <div className="space-y-4">
        {/* Header: Seller Name, Platform Badge, Seller ID, Delete */}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(trader);
            }}
            className="flex items-center gap-3 min-w-0 text-right cursor-pointer group flex-1"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 p-2 flex items-center justify-center shrink-0">
              <img
                src={plat.logo}
                alt={plat.name}
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors truncate">
                {trader.seller_name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${plat.color}`}>
                  {plat.name}
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-flex items-center gap-1">
                  <Hash className="w-3 h-3 text-amber-400" />
                  <span>{sellerId}</span>
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => onDelete(e, trader)}
            title="حذف التاجر"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors duration-200 cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Founder Management Fields */}
        <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/70">
          <div className="flex items-center justify-between gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate font-mono text-[11px]" dir="ltr">
                {displayEmail || 'غير محدد'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold shrink-0">
              للعرض فقط
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-mono text-[11px]" dir="ltr">
                {phone || 'لا يوجد رقم هاتف'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold shrink-0">الهاتف</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-500 shrink-0">الوجهة:</span>
              <span className="truncate font-mono text-slate-300" dir="ltr">
                {destinationUrl || 'غير مضاف'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-slate-500 shrink-0">المتجر:</span>
              <span className="truncate font-mono text-slate-300" dir="ltr">
                {storeUrl || 'غير مضاف'}
              </span>
            </div>
          </div>

          {/* Sync Status & last_sync_timestamp Indicator */}
          <div
            data-testid={`sync-status-${trader.id}`}
            data-field="last_sync_timestamp"
            data-value={lastSyncTimestamp || ''}
            className={`px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 ${
              isOverdue24h
                ? 'bg-red-500/10 border-red-500/45 text-red-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isOverdue24h ? (
                <AlertTriangle
                  data-testid={`sync-warning-icon-${trader.id}`}
                  className="w-4 h-4 text-red-500 shrink-0"
                  aria-label="تحذير: تجاوزت آخر عملية سحب 24 ساعة"
                />
              ) : (
                <CheckCircle2
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  aria-label="المزامنة محدثة"
                />
              )}
              <div className="min-w-0">
                <div className="text-[11px] font-black flex items-center gap-1.5">
                  <span>حالة المزامنة (Sync Status)</span>
                </div>
                <div className="text-[10px] font-semibold flex items-center gap-1 text-slate-300 truncate">
                  <Clock className="w-3 h-3 shrink-0 opacity-80" />
                  <span>آخر سحب (last_sync_timestamp):</span>
                  <span className="tabular-nums truncate">{formattedSyncDate}</span>
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-black shrink-0 ${
                isOverdue24h ? 'text-red-400' : 'text-emerald-300'
              }`}
            >
              {isOverdue24h
                ? hasValidSync
                  ? 'تجاوز 24 ساعة'
                  : 'يحتاج سحب'
                : 'محدث'}
            </span>
          </div>

          {/* Per-trader Editable & Clearable Amazon OAuth Authorize Link */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950/75 px-3 py-2.5 rounded-xl border border-slate-800 space-y-2"
          >
            <label className="block text-[10px] font-bold text-amber-300">
              رابط الموافقة للتاجر (SP-API OAuth)
            </label>
            <input
              ref={authorizeUrlInputRef}
              type="text"
              dir="ltr"
              data-testid={`trader-card-authorize-url-${trader.id}`}
              value={authorizeUrlValue}
              placeholder="https://www.amazon.com/ap/oa?client_id=...&state=..."
              onChange={(e) => {
                hasEditedAuthorizeUrlRef.current = true;
                setAuthorizeUrlValue(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setIsEditingAuthorizeUrl(true)}
              onBlur={() => setIsEditingAuthorizeUrl(false)}
              className={`w-full h-8 px-2.5 rounded-lg bg-slate-900 border text-[10px] font-mono text-amber-200 text-left focus:outline-none ${
                isEditingAuthorizeUrl
                  ? 'border-amber-400 ring-1 ring-amber-400/40'
                  : 'border-slate-700'
              }`}
            />
            {!productionClientId && !authorizeUrlValue && (
              <p className="text-[10px] text-amber-300/90 leading-relaxed">
                أضف <span className="font-mono" dir="ltr">AMAZON_CLIENT_ID</span> في Environment Variables لتوليد رابط موافقة Production تلقائياً.
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                data-testid={`trader-card-copy-authorize-url-${trader.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!authorizeUrlValue.trim()) {
                    onShowToast?.('⚠️ الخانة فارغة — أدخل رابطاً أو اضغط تعديل أولاً.');
                    return;
                  }
                  navigator.clipboard?.writeText?.(authorizeUrlValue);
                  onShowToast?.('📋 تم نسخ رابط الموافقة الخاص بهذا التاجر بنجاح!');
                }}
                className="flex-1 min-w-[90px] px-2.5 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>نسخ الرابط</span>
              </button>
              <button
                type="button"
                data-testid={`trader-card-edit-authorize-url-${trader.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  hasEditedAuthorizeUrlRef.current = true;
                  setIsEditingAuthorizeUrl(true);
                  authorizeUrlInputRef.current?.focus();
                  authorizeUrlInputRef.current?.select();
                }}
                className="px-2.5 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                data-testid={`trader-card-clear-authorize-url-${trader.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  hasEditedAuthorizeUrlRef.current = true;
                  setAuthorizeUrlValue('');
                  setIsEditingAuthorizeUrl(true);
                  authorizeUrlInputRef.current?.focus();
                }}
                className="px-2.5 h-8 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>مسح</span>
              </button>
            </div>
          </div>

          {/* Direct Refresh Token Input inside Trader Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950/75 px-3 py-2.5 rounded-xl border border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={`trader-card-refresh-token-${trader.id}`}
                className="text-[10px] font-bold text-emerald-300 flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                <span>Refresh Token (SP-API)</span>
              </label>
              <span
                className={`text-[10px] font-black ${
                  hasRefreshToken ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {hasRefreshToken ? 'مربوط ✓' : 'غير مضاف'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <input
                  id={`trader-card-refresh-token-${trader.id}`}
                  type={showRefreshToken ? 'text' : 'password'}
                  dir="ltr"
                  data-testid={`trader-card-refresh-token-${trader.id}`}
                  value={refreshTokenInput}
                  placeholder="Atzr|IwEBIA..."
                  onChange={(e) => setRefreshTokenInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-200 text-left focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  aria-label="إظهار أو إخفاء Refresh Token"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRefreshToken((prev) => !prev);
                  }}
                  className="absolute left-2 top-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showRefreshToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                data-testid={`trader-card-save-refresh-token-${trader.id}`}
                disabled={isSavingToken}
                onClick={handleSaveRefreshTokenFromCard}
                className="px-2.5 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] inline-flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>{isSavingToken ? 'حفظ...' : 'حفظ'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Founder Action Buttons (Open Profile + 5 Actions) */}
        <div className="pt-3 border-t border-slate-800/70 space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(trader);
            }}
            className="w-full px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-black text-xs border border-amber-500/40 transition-colors duration-200 flex items-center justify-between cursor-pointer"
          >
            <span>عرض ملف التاجر</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* 1. Edit Trader Data */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trader);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 hover:border-amber-500/40 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-400" />
            <span>تعديل بيانات التاجر</span>
          </button>

          {/* 2 & 3. Open Destination URL & Open Store URL */}
          <div className="grid grid-cols-2 gap-2">
            {destinationUrl ? (
              <a
                href={destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>فتح رابط الوجهة</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowToast?.('⚠️ لم يتم إضافة رابط الوجهة بعد — اضغط "تعديل بيانات التاجر" لإضافته.');
                }}
                className="py-2 px-2.5 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>فتح رابط الوجهة</span>
              </button>
            )}

            {storeUrl ? (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="py-2 px-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span>فتح المتجر</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowToast?.('⚠️ لم يتم إضافة رابط المتجر بعد — اضغط "تعديل بيانات التاجر" لإضافته.');
                }}
                className="py-2 px-2.5 rounded-xl bg-slate-950 text-slate-500 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span>فتح المتجر</span>
              </button>
            )}
          </div>

          {/* 4. Pull Products (Primary when Refresh Token exists) & Import File fallback only when no Refresh Token */}
          {!hasRefreshToken && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFetch(trader);
              }}
              className="w-full px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 font-black text-xs border border-emerald-500/40 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{IMPORT_BUTTON_LABEL}</span>
            </button>
          )}

          <button
            type="button"
            data-testid={`trader-card-pull-sp-api-${trader.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onFetch(trader);
            }}
            disabled={isSyncing}
            className={`w-full px-3 py-2.5 rounded-xl font-black text-xs border transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              hasRefreshToken
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border-amber-500/40'
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>يتم المزامنة...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{hasRefreshToken ? 'سحب كل المنتجات (SP-API)' : 'سحب كل المنتجات'}</span>
              </>
            )}
          </button>

          {/* 5. Competing Stores Summary & Manager Button */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="font-black text-indigo-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-indigo-400" />
                <span>متاجر المنافسين ({competingSummary.storesCount})</span>
              </span>
              {competingSummary.cheaperAlertsCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300">
                  {competingSummary.cheaperAlertsCount} أرخص منك!
                </span>
              )}
            </div>

            {competingSummary.storesCount > 0 ? (
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className="bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">محصود</div>
                  <div className="font-mono font-black text-white">{competingSummary.totalHarvested}</div>
                </div>
                <div className="bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">شبيهة</div>
                  <div className="font-mono font-black text-sky-300">{competingSummary.totalMatched}</div>
                </div>
                <div className="bg-slate-900 px-1.5 py-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">متوسط الفرق</div>
                  <div
                    className={`font-black ${
                      competingSummary.pricePosition === 'cheaper'
                        ? 'text-rose-400'
                        : competingSummary.pricePosition === 'expensive'
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {competingSummary.pricePosition === 'cheaper'
                      ? `أرخص ${Math.abs(competingSummary.avgPriceDiffAmount)}`
                      : competingSummary.pricePosition === 'expensive'
                      ? `أغلى ${Math.abs(competingSummary.avgPriceDiffAmount)}`
                      : competingSummary.pricePosition === 'equal'
                      ? 'متساوي'
                      : '-'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">
                أضف رابط متجر منافس (amazon.eg/s?me=... أو نون/جوميا) للمقارنة والمراقبة اليومية.
              </p>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCompetingStores(trader);
              }}
              className="w-full py-2 px-3 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>إدارة وحصد متاجر المنافسين 🕵️</span>
            </button>
          </div>

          {/* 6. View Products (/products?trader_id=...) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products?trader_id=${encodeURIComponent(trader.id)}`);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-black text-xs border border-slate-800 hover:border-sky-500/40 transition-colors duration-200 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              <span>عرض المنتجات</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
});
TraderCard.displayName = 'TraderCard';

export const TradersPage: React.FC<TradersPageProps> = ({ onShowToast, onSelectTrader }) => {
  const { user, profile, isOwner } = useAuth();
  const userEmail = (user?.email || profile?.email || '').trim().toLowerCase();
  const isFounder = Boolean(user && !user.isAnonymous && isOwner && userEmail === OWNER_EMAIL);

  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 20;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState<boolean>(false);
  const [syncingTraderId, setSyncingTraderId] = useState<string | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [selectedTraderForFetch, setSelectedTraderForFetch] = useState<Trader | null>(null);
  const [selectedTraderForCompetingStores, setSelectedTraderForCompetingStores] = useState<Trader | null>(null);
  const [competingStoresTick, setCompetingStoresTick] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state for Add Trader modal (all founder-managed fields)
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<string>('amazon');
  const [formSellerId, setFormSellerId] = useState<string>('');
  const [formDestinationUrl, setFormDestinationUrl] = useState<string>('');
  const [formStoreUrl, setFormStoreUrl] = useState<string>('');

  const handleOpenTraderDetail = (trader: Trader) => {
    if (onSelectTrader) {
      onSelectTrader(trader.id);
    } else {
      navigate(`/traders/${encodeURIComponent(trader.id)}`);
    }
  };

  const fetchTraders = async (targetPage = 1, forceFresh = false) => {
    if (!isFounder) {
      setTraders([]);
      setIsLoading(false);
      return;
    }

    const cacheKey = `traders_${userEmail}_all`;
    const dropdownCacheKey = `traders_dropdown_options_${userEmail}_v2`;
    const cached = !forceFresh ? dataCache.getStale<Trader[]>(cacheKey) : null;

    if (cached) {
      setTraders(cached.data);
      setHasMore(false);
      setIsLoading(false);
      if (cached.isFresh) return;
    } else if (targetPage === 1) {
      setIsLoading(true);
    }

    try {
      // Exact same source as DashboardHome: supabase.from('traders').select('*')
      const { data, error } = await supabase.from('traders').select('*');

      if (error) {
        console.error('[TradersPage] Error fetching traders from Supabase:', error);
        const realErrMsg = safeFormatSupabaseError(error);
        setFetchError(true);
        setFetchErrorMessage(realErrMsg);
        if (!cached) {
          setTraders([]);
        }
        return;
      }

      setFetchError(false);
      setFetchErrorMessage(null);

      let list = Array.isArray(data) ? (data as Trader[]) : [];

      list = list
        .map((t) => {
          const syncedTs = getTraderLastSyncAt(t.id, t.last_sync_at, t.last_sync_timestamp) || undefined;
          return {
            ...t,
            last_sync_at: syncedTs,
            last_sync_timestamp: syncedTs,
            platform: (t.platform || '').includes('amazon')
              ? 'amazon'
              : (t.platform || '').includes('noon')
              ? 'noon'
              : t.platform,
          };
        })
        .sort((a, b) => {
          const tA = a.created_at ? Date.parse(a.created_at) : 0;
          const tB = b.created_at ? Date.parse(b.created_at) : 0;
          return (Number.isFinite(tB) ? tB : 0) - (Number.isFinite(tA) ? tA : 0);
        });

      setHasMore(false);
      setTraders(list);
      dataCache.set(
        dropdownCacheKey,
        list.map((t) => ({ id: t.id, seller_name: t.seller_name, platform: t.platform }))
      );
      dataCache.set(cacheKey, list);
      setPage(targetPage);
    } catch (err: any) {
      console.error('[TradersPage] Exception fetching traders:', err);
      const realErrMsg = safeFormatSupabaseError(err);
      setFetchError(true);
      setFetchErrorMessage(realErrMsg);
      if (!cached && targetPage === 1) setTraders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders(1);
    const handleRefresh = () => {
      if (isMaintenanceModeActive()) return;
      fetchTraders(1, true);
    };
    const handleSyncUpdated = (ev: Event) => {
      const detail = (
        ev as CustomEvent<{ traderId?: string; last_sync_at?: string; last_sync_timestamp?: string }>
      )?.detail;
      const syncedIso = detail?.last_sync_timestamp || detail?.last_sync_at;
      if (!detail?.traderId || !syncedIso) return;
      setTraders((prev) =>
        prev.map((t) =>
          t.id === detail.traderId
            ? { ...t, last_sync_at: syncedIso, last_sync_timestamp: syncedIso }
            : t
        )
      );
      dataCache.invalidate('traders');
    };
    const handleCompetingStoresUpdated = () => {
      setCompetingStoresTick((n) => n + 1);
    };
    window.addEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
    window.addEventListener('radar_trader_sync_updated', handleSyncUpdated);
    window.addEventListener(RADAR_COMPETING_STORES_UPDATED_EVENT, handleCompetingStoresUpdated);
    return () => {
      window.removeEventListener(RADAR_PULL_TO_REFRESH_EVENT, handleRefresh);
      window.removeEventListener('radar_trader_sync_updated', handleSyncUpdated);
      window.removeEventListener(RADAR_COMPETING_STORES_UPDATED_EVENT, handleCompetingStoresUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, isFounder]);

  const handleEditTrader = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsEditModalOpen(true);
  };

  const handleFetchProducts = (trader: Trader) => {
    if (isMaintenanceModeActive()) {
      onShowToast?.(`⚠️ ${MAINTENANCE_MODE_BLOCK_MESSAGE}`);
      return;
    }
    setSyncingTraderId(trader.id);
    setSelectedTraderForFetch(trader);
    setIsFetchModalOpen(true);
    setSyncingTraderId(null);
  };

  const handleUpdateTrader = (updated: Trader) => {
    setTraders((prev) =>
      prev.map((t) => (String(t.id) === String(updated.id) ? { ...t, ...updated } : t))
    );
    dataCache.invalidate('traders');
  };

  const handleSaveTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formEmail.trim().toLowerCase();
    if (!formName.trim() || !formPlatform || !formSellerId.trim() || !cleanEmail) {
      onShowToast?.('⚠️ يرجى إدخال اسم التاجر وإيميل المنصة والمنصة ومعرف البائع');
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanDest = formDestinationUrl.trim();
      const cleanStore = formStoreUrl.trim();

      // Clean and whitelist trader payload strictly
      // Allowed columns only: seller_name - email - phone - seller_id - platform - destination_url - store_url - refresh_token
      // Never send: gmail, name, seller, trader_name, id, created_at, updated_at, user_id
      const newTraderPayload = cleanTraderPayloadForInsert({
        seller_name: formName.trim(),
        email: cleanEmail,
        phone: formPhone.trim(),
        platform: formPlatform,
        seller_id: formSellerId.trim(),
        destination_url: cleanDest,
        store_url: cleanStore,
      });

      const { data, error } = await supabase
        .from('traders')
        .insert([newTraderPayload])
        .select();

      if (error) {
        onShowToast?.(`❌ فشل الحفظ: ${error.message}`);
        return;
      }

      dataCache.invalidate('traders');
      const insertedList = Array.isArray(data) ? data : data ? [data] : [];
      if (insertedList.length > 0) {
        const insertedTrader = insertedList[0] as Trader;
        setTraders((prev) => [insertedTrader, ...prev.filter((t) => t.id !== insertedTrader.id)]);
      }
      onShowToast?.('✅ تم حفظ سجل التاجر بنجاح');
      setIsAddModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPlatform('amazon');
      setFormSellerId('');
      setFormDestinationUrl('');
      setFormStoreUrl('');
      fetchTraders(1, true);
    } catch (err: any) {
      onShowToast?.(`❌ فشل الحفظ: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrader = async (e: React.MouseEvent, trader: Trader) => {
    e.stopPropagation();
    if (!isFounder) return;
    if (!window.confirm(`هل أنت متأكد من حذف التاجر "${trader.seller_name}" نهائياً مع كافة منتجاته ومخزونه وفواتيره؟`)) {
      return;
    }
    try {
      const id = trader.id;
      await supabase.from('inventory_sync').delete().eq('trader_id', id);
      await supabase.from('products').delete().eq('trader_id', id);
      await supabase.from('invoices').delete().eq('trader_id', id);
      await supabase.from('traders').delete().eq('id', id);

      dataCache.invalidate('traders');
      dataCache.invalidate('products_');
      onShowToast?.(`🗑️ تم حذف التاجر "${trader.seller_name}" وتفريغ كافة السجلات`);
      fetchTraders(1, true);
    } catch (err: any) {
      onShowToast?.(`❌ فشل حذف التاجر: ${err.message || 'حدث خطأ'}`);
    }
  };

  const filteredTraders = traders.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.seller_name && t.seller_name.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.gmail && t.gmail.toLowerCase().includes(q)) ||
      (t.seller_id && t.seller_id.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.platform && t.platform.toLowerCase().includes(q))
    );
  });

  const renderAddTraderModal = () =>
    isAddModalOpen && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-trader-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-['Cairo']"
        dir="rtl"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 id="add-trader-modal-title" className="text-base font-black text-white">إضافة سجل تاجر جديد</h3>
            <button type="button" onClick={() => setIsAddModalOpen(false)} aria-label="إغلاق نافذة إضافة التاجر" className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveTrader} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم التاجر (seller_name) *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: محمود سعيد"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">إيميل التاجر على المنصة (للعرض فقط — ليس للدخول) *</label>
              <input
                type="email"
                required
                dir="ltr"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="mahmeudsaid4@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رمز التاجر التعريفي (seller_id) *</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={formSellerId}
                  onChange={(e) => setFormSellerId(e.target.value)}
                  placeholder="A37JIM7LHQI6IM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم هاتف التاجر (phone)</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+20 100 123 4567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">المنصة (platform) *</label>
              <select
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="amazon">أمازون (Amazon)</option>
                <option value="noon">نون (Noon)</option>
                <option value="jumia">جوميا (Jumia)</option>
                <option value="bayyaa">بياع (Bayyaa)</option>
                <option value="raneen">رنين (Raneen)</option>
                <option value="kanz">كنز (Kanz)</option>
                <option value="homesmart">هوم سمارت (HomeSmart)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رابط الوجهة (destination_url)</label>
              <input
                type="url"
                dir="ltr"
                value={formDestinationUrl}
                onChange={(e) => setFormDestinationUrl(e.target.value)}
                placeholder="https://www.amazon.eg/s?me=A37JIM7LHQI6IM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">رابط المتجر (store_url)</label>
              <input
                type="url"
                dir="ltr"
                value={formStoreUrl}
                onChange={(e) => setFormStoreUrl(e.target.value)}
                placeholder="https://www.amazon.eg/sp?seller=A37JIM7LHQI6IM"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التاجر'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  if (traders.length === 0) {
    const detailedErrorText = fetchErrorMessage || 'حدث خطأ أثناء الاتصال بقاعدة البيانات';
    return (
      <div className="w-full font-['Cairo'] space-y-4" dir="rtl">
        {fetchError ? (
          <>
            <div className="space-y-2">
              <EmergencyErrorBanner message={`فشل جلب التجار من Supabase: ${detailedErrorText}`} />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchTraders(1, true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            </div>
            <GlobalEmptyState
              icon={<Users className="w-10 h-10 text-amber-400" />}
              message={`خطأ Supabase: ${detailedErrorText}`}
              description="راجع رسالة الخطأ الظاهرة أعلاه وتفاصيل Console ثم أعد المحاولة."
              actionLabel="إضافة تاجر"
              onActionClick={() => setIsAddModalOpen(true)}
            />
          </>
        ) : (
          <section
            data-testid="traders-empty-state"
            aria-label="لا يوجد تجار مسجلون"
            className="max-w-3xl mx-auto my-8 px-6 py-10 sm:px-12 sm:py-14 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-8"
          >
            {/* Expressive Storefront + UserPlus Icon */}
            <div
              data-testid="traders-empty-icon"
              aria-hidden="true"
              className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center relative"
            >
              <Store className="w-9 h-9 text-amber-400" />
              <span className="w-8 h-8 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-amber-300 absolute -bottom-2 -left-2">
                <UserPlus className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {isLoading ? 'جاري تحميل قائمة التجار...' : 'أضف تاجرك الأول لتفعيل مزايا المنصة'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {isLoading
                  ? 'يتم الآن جلب سجلات التجار من قاعدة البيانات.'
                  : 'إضافة تاجر هي الخطوة الأساسية لربط متاجرك على المنصات المختلفة، واستيراد المنتجات، وتشغيل أدوات مراقبة الأسعار وتقارير المبيعات الفعلية.'}
              </p>
            </div>

            {/* Unboxed feature benefits grid separated by hairline dividers */}
            <div
              data-testid="traders-empty-features"
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-right border-y border-slate-800/80 py-6"
            >
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">ربط واستيراد المنتجات</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    استورد قوائم منتجات التاجر عبر ملفات أمازون أو زامن المخزون مباشرة.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">مراقبة الأسعار والمنافسين</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تتبع تحركات الأسعار وحالة الـ Buy Box لاكتشاف أفضل فرص التسعير.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">تقارير المبيعات والأرباح</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    اعرض إجمالي المبيعات وصافي الربح والفواتير الفعلية لكل تاجر بوضوح.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="min-h-[44px] px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>ابدأ بإضافة أول تاجر</span>
              </button>
            </div>
          </section>
        )}
        {renderAddTraderModal()}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-['Cairo']" dir="rtl">
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--card-text)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">إدارة التجار الموحدة (لوحة المؤسس) 📚</h2>
            <p className="text-xs text-slate-400">
              التجار سجلات بيانات يديرها المؤسس فقط — إجمالي السجلات: {traders.length} تاجر
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate('/import-history')}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer justify-center whitespace-nowrap"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>سجل عمليات الاستيراد</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex-1 md:flex-initial justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>➕ إضافة تاجر جديد</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في التجار بالاسم أو الإيميل أو Seller ID أو المنصة..."
          className="w-full border rounded-2xl pr-11 pl-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--input-text)'
          }}
        />
      </div>

      <ErrorBoundary
        sectionName="traders-grid"
        sectionTitle="قائمة وشبكة كروت التجار"
        sectionDescription="تعذر معالجة وعرض كروت التجار في الوقت الحالي. يمكنك إضافة تاجر جديد أو إعادة المحاولة."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTraders.map((trader) => (
            <TraderCard
              key={trader.id}
              trader={trader}
              isSyncing={syncingTraderId === trader.id}
              storesTick={competingStoresTick}
              onSelect={handleOpenTraderDetail}
              onEdit={handleEditTrader}
              onDelete={handleDeleteTrader}
              onFetch={handleFetchProducts}
              onOpenCompetingStores={(t) => setSelectedTraderForCompetingStores(t)}
              onTraderUpdated={handleUpdateTrader}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      </ErrorBoundary>

      {isFetchModalOpen && selectedTraderForFetch && (
        <FetchProductsModal
          trader={selectedTraderForFetch}
          isOpen={isFetchModalOpen}
          autoStartSpApi={Boolean(getTraderAmazonConnection(selectedTraderForFetch).refreshToken)}
          onClose={() => setIsFetchModalOpen(false)}
          onShowToast={onShowToast}
          onSyncCompleted={(stats) => {
            const nowIso = new Date().toISOString();
            const updatedCount =
              typeof stats?.dbTotal === 'number'
                ? stats.dbTotal
                : typeof stats?.total === 'number'
                ? stats.total
                : undefined;
            setTraders((prev) =>
              prev.map((t) =>
                t.id === selectedTraderForFetch.id
                  ? {
                      ...t,
                      last_sync_at: nowIso,
                      last_sync_timestamp: nowIso,
                      ...(updatedCount !== undefined ? { products_count: updatedCount } : {}),
                    }
                  : t
              )
            );
            dataCache.invalidate('traders');
            void fetchTraders(1, true);
          }}
        />
      )}

      {isEditModalOpen && selectedTrader && (
        <EditTraderModal
          trader={selectedTrader}
          existingTraders={traders}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTrader(null);
          }}
          onUpdate={handleUpdateTrader}
          onShowToast={onShowToast}
          onFetchProducts={handleFetchProducts}
        />
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => fetchTraders(page + 1)}
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs border border-amber-500/30 transition-colors duration-200 shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>عرض المزيد (20 تاجر التاليين) ➕</span>
          </button>
        </div>
      )}

      {selectedTraderForCompetingStores && (
        <CompetingStoresManagerModal
          trader={selectedTraderForCompetingStores}
          isOpen={Boolean(selectedTraderForCompetingStores)}
          onClose={() => setSelectedTraderForCompetingStores(null)}
          onShowToast={onShowToast}
          onStoresUpdated={() => setCompetingStoresTick((n) => n + 1)}
        />
      )}

      {renderAddTraderModal()}
    </div>
  );
};

export default TradersPage;
