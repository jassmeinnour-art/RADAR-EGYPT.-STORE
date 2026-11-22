import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../components/Header';
import {
  AppSidebar,
  applyStoredOrder,
  SIDEBAR_CATEGORY_ORDER_STORAGE_KEY,
  SIDEBAR_ITEM_ORDER_STORAGE_KEY,
} from '../components/AppSidebar';
import App, { OWNER_EMAIL } from '../App';

const mockToggleColorMode = vi.fn();
const mockToggleFounderMode = vi.fn();

const mockAuthState: {
  user: any;
  profile: any;
  isOwner: boolean;
  isFounderMode: boolean;
} = {
  user: { uid: 'founder-1', email: OWNER_EMAIL, isAnonymous: false },
  profile: { uid: 'founder-1', email: OWNER_EMAIL, displayName: 'مؤسس النظام' },
  isOwner: true,
  isFounderMode: false,
};

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  FOUNDER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: mockAuthState.user,
    profile: mockAuthState.profile,
    sessionData: null,
    isLoading: false,
    isDbConnected: true,
    isOwner: mockAuthState.isOwner,
    loginError: null,
    authInitError: null,
    isPasswordRecovery: false,
    isFounderMode: mockAuthState.isFounderMode,
    toggleFounderMode: mockToggleFounderMode,
    signInWithEmail: vi.fn(),
    signOut: vi.fn(),
    updateStoreProfile: vi.fn(),
    clearLoginError: vi.fn(),
    clearPasswordRecovery: vi.fn(),
  }),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: { primaryHex: '#F97316', chartPrimary: '#F97316', name: 'RadarDark' },
    resolvedColorMode: 'dark',
    toggleColorMode: mockToggleColorMode,
    setIsThemeModalOpen: vi.fn(),
  }),
}));

vi.mock('../context/VisualCustomizerContext', () => ({
  useVisualCustomizer: () => ({
    isEditMode: false,
    isFounderMode: false,
    positions: {},
    settings: {},
    toggleEditMode: vi.fn(),
    toggleCustomizer: vi.fn(),
    updatePosition: vi.fn(),
    resetAll: vi.fn(),
  }),
}));

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabaseClient: null,
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
  multiTenantDb: {
    getNotifications: vi.fn().mockResolvedValue([
      {
        id: 'notif-1',
        type: 'price_alert',
        message: 'انخفاض سعر منافس على منتج تجريبي',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]),
    markNotificationRead: vi.fn().mockResolvedValue(undefined),
    clearAllNotifications: vi.fn().mockResolvedValue(undefined),
    addNotification: vi.fn().mockResolvedValue({ id: 'n1' }),
  },
  isDemoOrOrphanProduct: vi.fn(() => false),
}));

describe('Compact 48px Header, Unified AppSidebar, and Zero-Duplicate Cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    mockAuthState.user = { uid: 'founder-1', email: OWNER_EMAIL, isAnonymous: false };
    mockAuthState.profile = { uid: 'founder-1', email: OWNER_EMAIL, displayName: 'مؤسس النظام' };
    mockAuthState.isOwner = true;
    mockAuthState.isFounderMode = false;
  });

  it('renders Header at 48px (h-12) with ONLY RADAR logo, quick search input, sidebar toggle, and founder mode button', () => {
    const onToggleSidebar = vi.fn();
    const setActiveTab = vi.fn();
    const onShowToast = vi.fn();
    const searchListener = vi.fn();
    window.addEventListener('merchant_global_search', searchListener);

    render(
      <Header
        activeTab="home"
        setActiveTab={setActiveTab}
        onToggleSidebar={onToggleSidebar}
        onShowToast={onShowToast}
      />
    );

    const headerEl = screen.getByTestId('compact-top-header');
    expect(headerEl.className).toContain('h-12');
    expect(headerEl.className).toContain('min-h-[48px]');
    expect(headerEl.className).toContain('max-h-[48px]');

    // 1. Small RADAR logo
    expect(screen.getByText('RADAR')).toBeInTheDocument();

    // 2. Quick search input
    const searchInput = screen.getByPlaceholderText('بحث سريع في المنتجات أو الاسم أو الكود...');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'B09TEST001' } });
    expect(searchListener).toHaveBeenCalledTimes(1);
    expect((searchListener.mock.calls[0][0] as CustomEvent).detail).toEqual({ query: 'B09TEST001' });

    // 3. Sidebar toggle (☰) & Founder Mode button only
    const sidebarBtn = screen.getByRole('button', { name: 'فتح القائمة الجانبية' });
    fireEvent.click(sidebarBtn);
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);

    const founderBtn = screen.getByRole('button', { name: /وضع المؤسس/ });
    fireEvent.click(founderBtn);
    expect(mockToggleFounderMode).toHaveBeenCalledTimes(1);

    // Ensure removed header buttons/text are completely gone
    expect(screen.queryByText(/تثبيت التطبيق/)).not.toBeInTheDocument();
    expect(screen.queryByText(/سحب الطلبات/)).not.toBeInTheDocument();
    expect(screen.queryByText(/مسح منتج جديد/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تنسيق الأزرار والواجهة/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تخطي والذهاب لتسجيل الدخول/)).not.toBeInTheDocument();
    expect(screen.queryByText(/جميع الأقسام والشاشات/)).not.toBeInTheDocument();
    expect(screen.queryByText(/وضع ليلي/)).not.toBeInTheDocument();
    expect(screen.queryByText(/التنبيهات/)).not.toBeInTheDocument();
    expect(screen.queryByText(/متصل/)).not.toBeInTheDocument();

    window.removeEventListener('merchant_global_search', searchListener);
  });

  it('renders AppSidebar with all moved buttons appearing strictly once in organized sections', async () => {
    const onSelectTab = vi.fn();
    const onOpenOwnerDashboard = vi.fn();
    const onOpenScanner = vi.fn();
    const onOpenAmazonImport = vi.fn();
    const onOpenNotifications = vi.fn();
    const onShowToast = vi.fn();

    render(
      <AppSidebar
        isOpen={true}
        onClose={vi.fn()}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        activeTab="home"
        onSelectTab={onSelectTab}
        onOpenOwnerDashboard={onOpenOwnerDashboard}
        onOpenScanner={onOpenScanner}
        onOpenAmazonImport={onOpenAmazonImport}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={2}
        onShowToast={onShowToast}
        isOwner={true}
      />
    );

    // Verify all requested categories
    expect(screen.getByText('المخزون')).toBeInTheDocument();
    expect(screen.getByText('المبيعات')).toBeInTheDocument();
    expect(screen.getByText('المنافسة')).toBeInTheDocument();
    expect(screen.getByText('الربط')).toBeInTheDocument();
    expect(screen.getByText('الإعدادات')).toBeInTheDocument();
    expect(screen.getByText('التطبيق')).toBeInTheDocument();

    // Verify every single action appears strictly once
    const expectedSingleLabels = [
      'عرض المنتجات',
      'مسح منتج جديد',
      'الفواتير',
      'التقارير',
      'أسعار المنافسين',
      'تحليل الأسعار',
      'قائمة المتابعة',
      'ربط المنصات',
      'استورد ملف أمازون (TXT)',
      'سحب من الجيميل',
      'إعدادات الحساب',
      'لوحة Super Admin',
      'الوضع النهاري',
      'التنبيهات',
      'تثبيت التطبيق',
    ];

    for (const label of expectedSingleLabels) {
      expect(screen.getAllByText(label)).toHaveLength(1);
    }

    // Verify removed clutter is not in sidebar
    expect(screen.queryByText(/تنسيق الأزرار/)).not.toBeInTheDocument();
    expect(screen.queryByText(/التحكم في الشكل والتنسيق/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تخصيص المظهر/)).not.toBeInTheDocument();

    // Test interactive moved handlers
    fireEvent.click(screen.getByRole('button', { name: /مسح منتج جديد/ }));
    expect(onOpenScanner).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /استورد ملف أمازون \(TXT\)/ }));
    expect(onOpenAmazonImport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /سحب من الجيميل/ }));
    expect(onSelectTab).toHaveBeenCalledWith('traders_sync');

    fireEvent.click(screen.getByRole('button', { name: /الوضع النهاري/ }));
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /التنبيهات/ }));
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);

    // Click single PWA install button -> opens clean instructions modal
    fireEvent.click(screen.getByRole('button', { name: 'تثبيت التطبيق' }));
    expect(await screen.findByText('تثبيت تطبيق RADAR')).toBeInTheDocument();
  });

  it('mounts authenticated App with zero floating DownloadFAB, zero floating PWA prompt, and zero skip-login buttons', async () => {
    render(<App />);

    expect(await screen.findByTestId('compact-top-header')).toBeInTheDocument();
    expect(await screen.findByTestId('app-sidebar')).toBeInTheDocument();

    // Single install button strictly inside sidebar
    await waitFor(() => {
      expect(screen.getAllByText('تثبيت التطبيق')).toHaveLength(1);
    });

    // Zero floating bottom buttons or clutter
    expect(screen.queryByText(/تحميل التطبيق الآن/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تخطي والذهاب لتسجيل الدخول/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تنسيق الأزرار والواجهة/)).not.toBeInTheDocument();
    expect(screen.queryByText(/جميع الأقسام والشاشات/)).not.toBeInTheDocument();
    expect(screen.queryByText(/سحب الطلبات/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ابدأ السحب/)).not.toBeInTheDocument();
  });

  it('persists custom sidebar category and item order from localStorage and supports resetting to default', () => {
    // 1. Test pure ordering helper
    const base = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(applyStoredOrder(base, ['c', 'a']).map((x) => x.id)).toEqual(['c', 'a', 'b']);

    // 2. Seed custom order in localStorage before mount
    localStorage.setItem(
      SIDEBAR_CATEGORY_ORDER_STORAGE_KEY,
      JSON.stringify(['sales', 'home', 'inventory'])
    );
    localStorage.setItem(
      SIDEBAR_ITEM_ORDER_STORAGE_KEY,
      JSON.stringify({ sales: ['reports_tab', 'shipping_tab', 'split_invoices_tab'] })
    );

    const onShowToast = vi.fn();
    render(
      <AppSidebar
        isOpen={true}
        onClose={vi.fn()}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        activeTab="home"
        onSelectTab={vi.fn()}
        onOpenOwnerDashboard={vi.fn()}
        onShowToast={onShowToast}
        isOwner={true}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'القائمة الجانبية الرئيسية' });
    const categoryCards = nav.querySelectorAll('[data-testid^="sidebar-category-card-"]');
    expect(categoryCards[0].getAttribute('data-testid')).toBe('sidebar-category-card-sales');
    expect(categoryCards[1].getAttribute('data-testid')).toBe('sidebar-category-card-home');
    expect(categoryCards[2].getAttribute('data-testid')).toBe('sidebar-category-card-inventory');

    const salesCard = categoryCards[0];
    const salesItems = salesCard.querySelectorAll('[data-testid^="sidebar-item-row-"]');
    expect(salesItems[0].getAttribute('data-testid')).toBe('sidebar-item-row-reports_tab');
    expect(salesItems[1].getAttribute('data-testid')).toBe('sidebar-item-row-shipping_tab');
    expect(salesItems[2].getAttribute('data-testid')).toBe('sidebar-item-row-split_invoices_tab');

    // Drag handles exist for categories and items
    expect(screen.getByTestId('drag-handle-category-sales')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle-item-reports_tab')).toBeInTheDocument();

    // Reset restores default order and clears localStorage
    const resetBtn = screen.getByTestId('btn-reset-sidebar-order');
    fireEvent.click(resetBtn);

    expect(localStorage.getItem(SIDEBAR_CATEGORY_ORDER_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(SIDEBAR_ITEM_ORDER_STORAGE_KEY)).toBeNull();
    expect(onShowToast).toHaveBeenCalledWith('تمت استعادة الترتيب الافتراضي للقائمة الجانبية.');

    const resetCards = nav.querySelectorAll('[data-testid^="sidebar-category-card-"]');
    expect(resetCards[0].getAttribute('data-testid')).toBe('sidebar-category-card-home');
    expect(resetCards[1].getAttribute('data-testid')).toBe('sidebar-category-card-inventory');
  });
});
