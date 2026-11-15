import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoginPage from '../components/LoginPage';
import { VirtualProductGrid } from '../components/VirtualProductGrid';
import App, { OWNER_EMAIL } from '../App';

// Shared mocks for AuthContext state
const mockSignInWithEmail = vi.fn();
const mockClearLoginError = vi.fn();
const mockSignOut = vi.fn();

const mockAuthState: {
  user: any;
  profile: any;
  isOwner: boolean;
  isLoading: boolean;
  authInitError: string | null;
} = {
  user: null,
  profile: null,
  isOwner: false,
  isLoading: false,
  authInitError: null,
};

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  FOUNDER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: mockAuthState.user,
    profile: mockAuthState.profile,
    sessionData: mockAuthState.user ? { lastLoginAt: '12:00', isOnline: true } : null,
    isLoading: mockAuthState.isLoading,
    isDbConnected: true,
    isOwner: mockAuthState.isOwner,
    loginError: null,
    authInitError: mockAuthState.authInitError,
    authErrorCode: null,
    isUnauthorizedDomain: false,
    currentDomain: 'localhost',
    domainInfo: { currentHost: 'localhost', isPreviewDomain: false },
    signInWithEmail: mockSignInWithEmail,
    sendPasswordReset: vi.fn(),
    signOut: mockSignOut,
    isFounderMode: false,
    toggleFounderMode: vi.fn(),
    updateStoreProfile: vi.fn(),
    refreshProfile: vi.fn(),
    clearLoginError: mockClearLoginError,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: { primaryHex: '#F97316', chartPrimary: '#F97316', name: 'RadarDark' },
    toggleColorMode: vi.fn(),
    resolvedColorMode: 'dark',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'ar',
    t: (key: string) => key,
    toggleLanguage: vi.fn(),
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/AudioNotificationContext', () => ({
  useAudioNotifications: () => ({
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playTick: vi.fn(),
  }),
  AudioNotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/AsyncOperationsContext', () => ({
  useAsyncOperations: () => ({
    activeOperations: [],
    recentCompleted: null,
    isPlatformSyncing: false,
    isCsvExporting: false,
    isDatabaseBusy: false,
    isAnyBusy: false,
    startOperation: vi.fn(),
    runWithLoading: vi.fn(),
    clearCompleted: vi.fn(),
  }),
  AsyncOperationsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../context/VisualCustomizerContext', () => ({
  useVisualCustomizer: () => ({
    isEditMode: false,
    toggleEditMode: vi.fn(),
    positions: {},
    updatePosition: vi.fn(),
    resetAll: vi.fn(),
  }),
  VisualCustomizerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabaseClient: null,
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
  getActiveSupabaseSession: vi.fn(() => Promise.resolve(null)),
  getActiveSupabaseAccessToken: vi.fn(() => Promise.resolve(null)),
  setSupabaseActiveEmail: vi.fn(),
  setSupabaseSession: vi.fn(),
  signInWithSupabasePassword: vi.fn(),
  signOutSupabase: vi.fn(() => Promise.resolve()),
  isDemoOrOrphanProduct: vi.fn(() => false),
}));

// Helper component that conditionally throws an error for ErrorBoundary testing
const ThrowOnCommand: React.FC<{ shouldThrow: boolean; label: string }> = ({
  shouldThrow,
  label,
}) => {
  if (shouldThrow) {
    throw new Error(`Simulated failure in ${label}`);
  }
  return <div data-testid="healthy-child">{label}</div>;
};

describe('Integration Tests: Login Flow, Core App Components & ErrorBoundary Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    mockAuthState.user = null;
    mockAuthState.profile = null;
    mockAuthState.isOwner = false;
    mockAuthState.isLoading = false;
    mockAuthState.authInitError = null;
  });

  describe('1. Login Flow Integration (LoginPage inside ErrorBoundary)', () => {
    it('renders LoginPage inside ErrorBoundary cleanly with all 4 feature cards and radar effects', () => {
      render(
        <ErrorBoundary sectionName="login-test" sectionTitle="صفحة تسجيل الدخول">
          <LoginPage />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('radar-background-effect')).toBeInTheDocument();
      expect(screen.getByText('تتبع الأسعار')).toBeInTheDocument();
      expect(screen.getByText('إدارة كل التجار')).toBeInTheDocument();
      expect(screen.getByText('سحب كامل للمخزون')).toBeInTheDocument();
      expect(screen.getByText('تنبيهات فورية')).toBeInTheDocument();
      expect(screen.getAllByText(/RADAR EGYPT/).length).toBeGreaterThan(0);
      expect(screen.getByText(/صُنع في مصر/)).toBeInTheDocument();
      expect(screen.queryByText(/تعذر تحميل/)).not.toBeInTheDocument();
    });

    it('blocks non-founder email and does not call signInWithEmail', async () => {
      render(
        <ErrorBoundary sectionName="login-test" sectionTitle="صفحة تسجيل الدخول">
          <LoginPage />
        </ErrorBoundary>
      );

      const emailInput = screen.getByLabelText('البريد الإلكتروني للمؤسس');
      const passwordInput = screen.getByLabelText('كلمة المرور');
      const submitBtn = screen.getByRole('button', { name: /دخول/ });

      fireEvent.change(emailInput, { target: { value: 'trader@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'secret123' } });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/الدخول مقتصر على حساب المؤسس فقط/)).toBeInTheDocument();
      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('validates minimum password length before calling signInWithEmail', async () => {
      render(
        <ErrorBoundary sectionName="login-test" sectionTitle="صفحة تسجيل الدخول">
          <LoginPage />
        </ErrorBoundary>
      );

      const emailInput = screen.getByLabelText('البريد الإلكتروني للمؤسس');
      const passwordInput = screen.getByLabelText('كلمة المرور');
      const submitBtn = screen.getByRole('button', { name: /دخول/ });

      fireEvent.change(emailInput, { target: { value: OWNER_EMAIL } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل')
      ).toBeInTheDocument();
      expect(mockSignInWithEmail).not.toHaveBeenCalled();
    });

    it('executes founder login flow and triggers onLoginSuccess upon valid credentials', async () => {
      mockSignInWithEmail.mockResolvedValueOnce(undefined);
      const onLoginSuccess = vi.fn();

      render(
        <ErrorBoundary sectionName="login-test" sectionTitle="صفحة تسجيل الدخول">
          <LoginPage onLoginSuccess={onLoginSuccess} />
        </ErrorBoundary>
      );

      const emailInput = screen.getByLabelText('البريد الإلكتروني للمؤسس');
      const passwordInput = screen.getByLabelText('كلمة المرور');
      const submitBtn = screen.getByRole('button', { name: /دخول/ });

      fireEvent.change(emailInput, { target: { value: OWNER_EMAIL } });
      fireEvent.change(passwordInput, { target: { value: 'FounderPass2026!' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith(OWNER_EMAIL, 'FounderPass2026!');
        expect(onLoginSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('displays error message smoothly inside LoginPage if authentication rejects', async () => {
      mockSignInWithEmail.mockRejectedValueOnce(new Error('الإيميل أو كلمة المرور غلط'));

      render(
        <ErrorBoundary sectionName="login-test" sectionTitle="صفحة تسجيل الدخول">
          <LoginPage />
        </ErrorBoundary>
      );

      const passwordInput = screen.getByLabelText('كلمة المرور');
      const submitBtn = screen.getByRole('button', { name: /دخول/ });

      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('الإيميل أو كلمة المرور غلط')).toBeInTheDocument();
    });
  });

  describe('2. App Core Components Loading Inside ErrorBoundary', () => {
    it('routes unauthenticated users to /login and mounts LoginPage without errors', () => {
      window.history.replaceState({}, '', '/');

      render(
        <ErrorBoundary sectionName="root-app" sectionTitle="تطبيق رادار مصر">
          <App />
        </ErrorBoundary>
      );

      expect(window.location.pathname).toBe('/login');
      expect(screen.getByLabelText('البريد الإلكتروني للمؤسس')).toBeInTheDocument();
      expect(screen.queryByText(/تعذر تحميل شاشة تسجيل دخول المؤسس/)).not.toBeInTheDocument();
    });

    it('mounts authenticated founder home workspace (DashboardHome + Shell) cleanly with zero ErrorBoundary fallbacks', async () => {
      mockAuthState.user = { uid: 'founder-1', email: OWNER_EMAIL, isAnonymous: false };
      mockAuthState.profile = { uid: 'founder-1', email: OWNER_EMAIL, role: 'super_admin' };
      mockAuthState.isOwner = true;
      window.history.replaceState({}, '', '/');

      render(
        <ErrorBoundary sectionName="root-app" sectionTitle="تطبيق رادار مصر">
          <App />
        </ErrorBoundary>
      );

      // DashboardHome renders static hero & sections immediately without awaiting network
      expect(await screen.findByText(/لماذا رادار/)).toBeInTheDocument();
      expect(screen.getByText(/كيفية الاستخدام/)).toBeInTheDocument();
      // Ensure NO ErrorBoundary fallback UI appeared
      expect(screen.queryByText(/قسم آمن معزول/)).not.toBeInTheDocument();
    });
  });

  describe('3. Section ErrorBoundary Fallback & Recovery Isolation', () => {
    it('isolates crashes to the failing section and keeps sibling sections completely intact', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <div>
          <ErrorBoundary
            sectionName="products-price-heatmap"
            sectionTitle="خريطة النطاقات السعرية"
            sectionDescription="تعذر رسم الخريطة الحرارية مؤقتاً."
          >
            <ThrowOnCommand shouldThrow={true} label="Heatmap" />
          </ErrorBoundary>

          <ErrorBoundary sectionName="products-grid" sectionTitle="كتالوج المنتجات">
            <ThrowOnCommand shouldThrow={false} label="كتالوج المنتجات سليم" />
          </ErrorBoundary>
        </div>
      );

      // Failing section shows tailored Arabic fallback
      expect(screen.getByText('تعذر تحميل خريطة النطاقات السعرية')).toBeInTheDocument();
      expect(screen.getByText('تعذر رسم الخريطة الحرارية مؤقتاً.')).toBeInTheDocument();
      expect(screen.getByText('قسم آمن معزول')).toBeInTheDocument();

      // Sibling section remains completely operational
      expect(screen.getByText('كتالوج المنتجات سليم')).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('recovers and re-renders section content when clicking the retry button', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let shouldFail = true;
      const FlakyComponent = () => {
        if (shouldFail) throw new Error('Transient network parse error');
        return <div>تمت استعادة القسم بنجاح</div>;
      };

      const onRetry = vi.fn(() => {
        shouldFail = false;
      });

      render(
        <ErrorBoundary
          sectionName="drawer-sync-history"
          sectionTitle="سجل المزامنة"
          compact
          onRetry={onRetry}
        >
          <FlakyComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('تعذر عرض سجل المزامنة')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /إعادة المحاولة/ }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(screen.getByText('تمت استعادة القسم بنجاح')).toBeInTheDocument();

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('4. Virtual Scrolling Grid (VirtualProductGrid) Performance Windowing', () => {
    it('renders only visible + overscan products when given 500 items', () => {
      const mockProducts = Array.from({ length: 500 }, (_, i) => ({
        id: `prod-${i}`,
        title: `منتج رقم ${i}`,
      }));

      render(
        <ErrorBoundary sectionName="products-grid" sectionTitle="شبكة المنتجات">
          <VirtualProductGrid
            items={mockProducts}
            keyExtractor={(item) => item.id}
            estimatedRowHeight={200}
            rowGap={20}
            overscanRows={1}
            maxViewportHeight={440}
            renderItem={(item) => <div data-testid="virtual-card">{item.title}</div>}
          />
        </ErrorBoundary>
      );

      const grid = screen.getByTestId('virtual-product-grid');
      const renderedCards = screen.getAllByTestId('virtual-card');

      expect(grid).toHaveAttribute('data-total-items', '500');
      // With viewportHeight=440, rowStride=220 (2 visible rows + 1 overscan * columns), far fewer than 500 render in DOM
      expect(renderedCards.length).toBeGreaterThan(0);
      expect(renderedCards.length).toBeLessThan(30);
    });
  });
});
