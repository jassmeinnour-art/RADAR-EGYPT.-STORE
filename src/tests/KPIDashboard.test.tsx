/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import React from 'react';
import * as AsyncOps from '../context/AsyncOperationsContext';

// Mock Contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', uid: '123' },
    profile: { storeName: 'Test Store' },
    isLoading: false,
    isAuthenticated: true,
    isOwner: false,
    sessionData: { lastLoginAt: '12:00' },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: { primaryHex: '#FF6B00', chartPrimary: '#FF6B00', name: 'Default' },
    toggleColorMode: vi.fn(),
    resolvedColorMode: 'dark',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'ar',
    t: (key: string) => key,
    toggleLanguage: vi.fn(),
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../context/AudioNotificationContext', () => ({
  useAudioNotifications: () => ({
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playTick: vi.fn(),
  }),
  AudioNotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../context/AsyncOperationsContext', () => ({
  useAsyncOperations: vi.fn(() => ({
    activeOperations: [],
    recentCompleted: null,
    isPlatformSyncing: false,
    isCsvExporting: false,
    isDatabaseBusy: false,
    isAnyBusy: false,
    startOperation: vi.fn(),
    runWithLoading: vi.fn(),
    clearCompleted: vi.fn(),
  })),
  triggerGlobalAsyncStart: vi.fn(() => 'op-mock-123'),
  triggerGlobalAsyncEnd: vi.fn(),
  AsyncOperationsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ASYNC_OP_START_EVENT: 'ais_async_op_start',
  ASYNC_OP_END_EVENT: 'ais_async_op_end',
}));

// Mock Firebase
vi.mock('../firebase', () => {
  return {
    auth: { currentUser: { email: 'test@example.com', uid: '123' } },
    db: {},
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback({ email: 'test@example.com', uid: '123' });
      return vi.fn();
    }),
    signInWithEmailAndPassword: vi.fn(),
    firebaseSignOut: vi.fn(),
    googleProvider: {},
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    getRedirectResult: vi.fn(() => Promise.resolve({ user: { email: 'test@example.com', uid: '123' } })),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => true, data: () => ({ hasSeenOnboarding: true }) })),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  collection: vi.fn(),
}));

// Mock Lucide React
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
  };
});

// Mock lazy components
vi.mock('./components/OnboardingTour', () => ({ OnboardingTour: () => null }));
vi.mock('./components/PaymentModal', () => () => null);
vi.mock('./components/OwnerDashboard', () => () => null);
vi.mock('./components/HelpPage', () => () => null);
vi.mock('./components/ShippingOrdersTable', () => () => null);
vi.mock('./components/ProfitCalculator', () => () => null);
vi.mock('./components/ShippingManagementDashboard', () => () => null);
vi.mock('./components/PlatformsGuideManager', () => () => null);
vi.mock('./components/AutoPricingEngine', () => () => null);
vi.mock('./components/PriceComparisonEngine', () => ({ PriceComparisonEngine: () => null }));
vi.mock('./components/AIProductStudio', () => ({ AIProductStudio: () => null }));

describe('KPI Dashboard Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders all KPI overview cards correctly', async () => {
    render(<App />);
    
    // Wait for the app to finish loading and authentication
    await waitFor(() => {
      expect(screen.queryByText('جاري تحميل التطبيق...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Check for KPI cards
    expect(await screen.findByText('المنتجات النشطة', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('المنافسون المراقبون')).toBeInTheDocument();
    expect(screen.getByText('حالة التزامن الأخيرة')).toBeInTheDocument();
    expect(screen.getByText('مهلة التجربة/الاشتراك')).toBeInTheDocument();
  }, 10000);

  it('shows loading state in StatsMonitor when a KPI operation is active', async () => {
    vi.mocked(AsyncOps.useAsyncOperations).mockReturnValue({
      activeOperations: [
        { id: '1', category: 'platform_sync', title: 'تحديث KPI', startedAt: Date.now() }
      ],
      recentCompleted: null,
      isPlatformSyncing: true,
      isCsvExporting: false,
      isDatabaseBusy: false,
      isAnyBusy: true,
      startOperation: vi.fn(),
      runWithLoading: vi.fn(),
      clearCompleted: vi.fn(),
    });

    render(<App />);
    
    expect(await screen.findByText(/جاري تحديث تحديث KPI/, {}, { timeout: 5000 })).toBeInTheDocument();
  }, 10000);

  it('shows success message when KPI operation completes', async () => {
    vi.mocked(AsyncOps.useAsyncOperations).mockReturnValue({
      activeOperations: [],
      recentCompleted: { id: '1', category: 'platform_sync', title: 'تحديث KPI', success: true, completedAt: Date.now() },
      isPlatformSyncing: false,
      isCsvExporting: false,
      isDatabaseBusy: false,
      isAnyBusy: false,
      startOperation: vi.fn(),
      runWithLoading: vi.fn(),
      clearCompleted: vi.fn(),
    });

    render(<App />);
    
    expect(await screen.findByText('تزامن ناجح', {}, { timeout: 5000 })).toBeInTheDocument();
  }, 10000);

  it('shows error alert when KPI operation fails', async () => {
    vi.mocked(AsyncOps.useAsyncOperations).mockReturnValue({
      activeOperations: [],
      recentCompleted: { id: '1', category: 'platform_sync', title: 'تحديث KPI', success: false, completedAt: Date.now() },
      isPlatformSyncing: false,
      isCsvExporting: false,
      isDatabaseBusy: false,
      isAnyBusy: false,
      startOperation: vi.fn(),
      runWithLoading: vi.fn(),
      clearCompleted: vi.fn(),
    });

    render(<App />);
    
    expect(await screen.findByText('فشل في التزامن', {}, { timeout: 5000 })).toBeInTheDocument();
    // Using a more flexible matcher for the alert text
    expect(screen.getByText(/تعطل التزامن التلقائي للبيانات/)).toBeInTheDocument();
  }, 10000);

  it('triggers email notification alert when sync fails 3 consecutive times', async () => {
    localStorage.setItem('radar_kpi_sync_failures', '3');
    vi.mocked(AsyncOps.useAsyncOperations).mockReturnValue({
      activeOperations: [],
      recentCompleted: { id: '3', category: 'platform_sync', title: 'تحديث KPI', success: false, completedAt: Date.now() },
      isPlatformSyncing: false,
      isCsvExporting: false,
      isDatabaseBusy: false,
      isAnyBusy: false,
      startOperation: vi.fn(),
      runWithLoading: vi.fn(),
      clearCompleted: vi.fn(),
    });

    render(<App />);

    expect(await screen.findByText(/إرسال تنبيه بالبريد الإلكتروني/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getAllByText(/test@example.com/)[0]).toBeInTheDocument();
  }, 10000);
});
