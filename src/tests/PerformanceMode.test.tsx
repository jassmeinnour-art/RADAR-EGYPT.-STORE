import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  PerformanceModeProvider,
  PERFORMANCE_MODE_STORAGE_KEY,
  usePerformanceMode,
} from '../context/PerformanceModeContext';
import { DeferredViewportMount } from '../components/DeferredViewportMount';
import { TabTransitionContainer } from '../components/TabTransitionContainer';
import { Header } from '../components/Header';
import { OWNER_EMAIL } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  FOUNDER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => ({
    user: { uid: 'founder-1', email: OWNER_EMAIL, isAnonymous: false },
    profile: { uid: 'founder-1', email: OWNER_EMAIL, displayName: 'مؤسس النظام' },
    isOwner: true,
    isFounderMode: false,
    toggleFounderMode: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('Performance Mode (وضع الأداء)', () => {
  const OriginalIntersectionObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('performance-mode');
    document.documentElement.removeAttribute('data-performance-mode');
  });

  afterEach(() => {
    globalThis.IntersectionObserver = OriginalIntersectionObserver;
    vi.restoreAllMocks();
  });

  it('toggles Performance Mode in Header, persists in localStorage, syncs <html> attributes, and triggers toast', () => {
    const onShowToast = vi.fn();
    render(
      <PerformanceModeProvider>
        <Header
          activeTab="home"
          setActiveTab={vi.fn()}
          onToggleSidebar={vi.fn()}
          onShowToast={onShowToast}
        />
      </PerformanceModeProvider>
    );

    const toggleBtn = screen.getByTestId('btn-header-performance-mode');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.getAttribute('data-performance-mode')).toBe('false');
    expect(document.documentElement.classList.contains('performance-mode')).toBe(false);

    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY)).toBe('true');
    expect(document.documentElement.getAttribute('data-performance-mode')).toBe('true');
    expect(document.documentElement.classList.contains('performance-mode')).toBe(true);
    expect(onShowToast).toHaveBeenCalledWith(
      expect.stringContaining('تم تفعيل وضع الأداء')
    );

    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY)).toBe('false');
    expect(document.documentElement.getAttribute('data-performance-mode')).toBe('false');
    expect(document.documentElement.classList.contains('performance-mode')).toBe(false);
  });

  it('disables Framer Motion tab transitions in TabTransitionContainer when Performance Mode is enabled', () => {
    localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, 'true');

    const { rerender } = render(
      <PerformanceModeProvider>
        <TabTransitionContainer tabKey="reports">
          <div>محتوى التقارير</div>
        </TabTransitionContainer>
      </PerformanceModeProvider>
    );

    expect(screen.getByTestId('tab-transition-static')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-transition-animated')).not.toBeInTheDocument();
    expect(screen.getByText('محتوى التقارير')).toBeInTheDocument();

    localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, 'false');
    rerender(
      <TabTransitionContainer tabKey="products">
        <div>محتوى المنتجات</div>
      </TabTransitionContainer>
    );

    expect(screen.getByTestId('tab-transition-animated')).toBeInTheDocument();
  });

  it('strictly defers invisible components via IntersectionObserver until visible in Performance Mode', () => {
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null = null;
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    globalThis.IntersectionObserver = class MockIntersectionObserver {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerCallback = cb;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
      takeRecords = vi.fn(() => []);
      readonly root = null;
      readonly rootMargin = '0px';
      readonly thresholds = [0.01];
    } as unknown as typeof IntersectionObserver;

    localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, 'true');
    const onChildMount = vi.fn();

    const HeavyOffscreenWidget: React.FC = () => {
      React.useEffect(() => {
        onChildMount();
      }, []);
      return <div data-testid="heavy-offscreen-child">تم تحميل المكون الثقيل</div>;
    };

    render(
      <PerformanceModeProvider>
        <DeferredViewportMount sectionId="test-offscreen" minHeight={200} label="قسم التجار">
          <HeavyOffscreenWidget />
        </DeferredViewportMount>
      </PerformanceModeProvider>
    );

    // Must NOT mount child or fire child effect while offscreen in Performance Mode
    expect(screen.queryByTestId('heavy-offscreen-child')).not.toBeInTheDocument();
    expect(onChildMount).not.toHaveBeenCalled();
    expect(observeMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/سيتم تحميل «قسم التجار» عند التمرير/)).toBeInTheDocument();

    // Simulate scrolling into view
    act(() => {
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(screen.getByTestId('heavy-offscreen-child')).toBeInTheDocument();
    expect(onChildMount).toHaveBeenCalledTimes(1);
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('automatically enables Performance Mode when navigator.connection.saveData is true and no saved preference exists', () => {
    const nav = navigator as Navigator & { connection?: any };
    const prevConnection = nav.connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '2g' },
    });

    const Probe: React.FC = () => {
      const { isPerformanceMode, isSlowNetworkDetected } = usePerformanceMode();
      return (
        <div
          data-testid="network-probe"
          data-perf={String(isPerformanceMode)}
          data-slow={String(isSlowNetworkDetected)}
        />
      );
    };

    render(
      <PerformanceModeProvider>
        <Probe />
      </PerformanceModeProvider>
    );

    const probe = screen.getByTestId('network-probe');
    expect(probe.getAttribute('data-perf')).toBe('true');
    expect(probe.getAttribute('data-slow')).toBe('true');

    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: prevConnection,
    });
  });
});
