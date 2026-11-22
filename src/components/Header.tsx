import React, { useMemo } from 'react';
import { Menu, Search, Pencil, Ruler, Crown } from 'lucide-react';
import { ConnectedMerchantPlatform } from '../types';
import { useAuth } from '../context/AuthContext';
import { AppUpdateState } from '../hooks/useAppUpdate';

export interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner?: () => void;
  onOpenPublishModal?: () => void;
  onOpenExportModal?: () => void;
  onOpenAiExcelModal?: () => void;
  onOpenBestSellersModal?: () => void;
  onOpenInvestorDeck?: () => void;
  onShowToast?: (message: string) => void;
  connectedPlatforms?: ConnectedMerchantPlatform[];
  productCount?: number;
  watchlistCount?: number;
  activeAlertsCount?: number;
  remoteMerchantsCount?: number;
  archivedCount?: number;
  reorderAlertsCount?: number;
  updateState?: AppUpdateState;
  onOpenSmartGmailModal?: () => void;
  language?: 'ar' | 'en';
  onToggleLanguage?: () => void;
  onOpenPushNotificationModal?: () => void;
  onOpenAndroidModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenWindowsInstallModal?: () => void;
  onOpenMobileInstallModal?: () => void;
  onOpenManageApisModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  subscriptionBadgeLabel?: string;
  trialCountdownText?: string;
  isPaywallLocked?: boolean;
  onOpenWeeklySundaySchedulerModal?: () => void;
  activeMerchantId?: string;
  remoteMerchantsList?: Array<{
    id: string;
    storeName: string;
    contactPerson?: string;
    city?: string;
    platformsSubscribed?: string[];
  }>;
  onSwitchActiveMerchant?: (merchantId: string) => void;
  onOpenAllMerchantsHub?: () => void;
  isReadOnlyClientView?: boolean;
  onExitReadOnlyClientView?: () => void;
  onPullOrders?: () => void;
  onNavigateToSplit?: (invoiceId?: string) => void;
  onNavigateToTrader?: (traderId: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  onShowToast,
  onToggleSidebar,
}) => {
  const { user, profile, isOwner, isFounderMode, toggleFounderMode, signOut } = useAuth();

  const isFounderUserStrict = useMemo(() => {
    if (!user || user.isAnonymous || !isOwner) return false;
    const uEmail = user.email?.trim().toLowerCase() || '';
    const pEmail = profile?.email?.trim().toLowerCase() || '';
    return uEmail === 'jassmeinnour@gmail.com' || pEmail === 'jassmeinnour@gmail.com';
  }, [user, profile?.email, isOwner]);

  const handleToggleFounder = () => {
    toggleFounderMode();
    const nextState = !isFounderMode;
    try {
      localStorage.setItem('isFounderMode', String(nextState));
      localStorage.setItem('radar_founder_mode', String(nextState));
      localStorage.setItem('founder_mode_active', String(nextState));
      window.dispatchEvent(new CustomEvent('founder_mode_changed', { detail: { active: nextState } }));
    } catch {
      // safe fallback
    }
    onShowToast?.(
      nextState
        ? 'تم تفعيل وضع المؤسس! ظهرت مقابض السحب على الكروت.'
        : 'تم إيقاف وضع المؤسس وإخفاء مقابض السحب.'
    );
  };

  return (
    <header
      dir="rtl"
      data-testid="compact-top-header"
      className="sticky top-0 z-40 h-12 min-h-[48px] max-h-[48px] bg-[var(--header-bg)] border-b border-[var(--header-border)] text-[var(--header-text)] px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 transition-colors duration-200"
    >
      {/* 1. Right (RTL start): Small RADAR logo */}
      <button
        type="button"
        onClick={() => {
          setActiveTab('home');
          if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
        }}
        className="flex items-center gap-2 shrink-0 cursor-pointer group focus:outline-none"
        title="RADAR"
      >
        <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center border border-amber-500 overflow-hidden shrink-0">
          <img
            src="/pwa-512x512.png"
            alt="RADAR"
            width={28}
            height={28}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-black tracking-wide text-[var(--header-text)] whitespace-nowrap" dir="ltr">
          RADAR
        </span>
      </button>

      {/* 2. Center: Compact Quick Search */}
      <div className="flex-1 max-w-md mx-auto h-8 relative">
        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          aria-label="بحث سريع في المنتجات"
          placeholder="بحث سريع في المنتجات أو الاسم أو الكود..."
          onChange={(e) => {
            window.dispatchEvent(
              new CustomEvent('merchant_global_search', { detail: { query: e.target.value } })
            );
          }}
          className="w-full h-full pr-8 pl-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--input-border-focus)] focus:outline-none text-xs font-bold text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] transition-colors"
        />
      </div>

      {/* 3. Left (RTL end): Login/Logout + Sidebar toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {user ? (
          <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--card-border)] px-2.5 py-1 rounded-lg shrink-0">
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-black text-[var(--header-text)] whitespace-nowrap">جاسمين</span>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                if (typeof window !== 'undefined') window.location.href = '/login';
              }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-500/10 cursor-pointer whitespace-nowrap"
              title="خروج"
            >
              خروج
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/login');
            }}
            className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            تسجيل الدخول
          </button>
        )}

        {isFounderUserStrict && (
          <button
            type="button"
            id="btn-header-founder-mode-fixed"
            onClick={handleToggleFounder}
            className={`h-8 px-2.5 flex items-center justify-center gap-1.5 font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 select-none ${
              isFounderMode
                ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-500'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-black'
            }`}
            title={isFounderMode ? 'إيقاف وضع المؤسس' : 'وضع المؤسس'}
          >
            <Pencil className="w-3.5 h-3.5 shrink-0" />
            <Ruler className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            <span className="whitespace-nowrap">
              {isFounderMode ? 'إيقاف وضع المؤسس' : 'وضع المؤسس'}
            </span>
          </button>
        )}

        <button
          type="button"
          id="btn-open-main-sidebar"
          onClick={onToggleSidebar}
          aria-label="فتح القائمة الجانبية"
          title="فتح القائمة الجانبية"
          className="h-8 w-8 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] text-[var(--header-text)] border border-[var(--card-border)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </header>
  );
};
