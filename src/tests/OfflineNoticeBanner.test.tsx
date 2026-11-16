import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OfflineNoticeBanner } from '../components/OfflineNoticeBanner';
import {
  cacheProductsLocally,
  queueOfflineAction,
  getOfflineActionQueue,
  syncPendingOfflineActions,
  OFFLINE_ACTION_QUEUE_STORAGE_KEY,
  OFFLINE_PRODUCTS_CACHE_STORAGE_KEY,
  OFFLINE_SYNC_TAG,
} from '../utils/offlineActionQueue';

const mockInsert = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
}));

function setNavigatorOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => online,
  });
}

describe('OfflineNoticeBanner & Offline Action Queue Integration', () => {
  const originalSyncManager = (window as any).SyncManager;
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setNavigatorOnline(true);
    mockInsert.mockResolvedValue({ error: null });

    // Clean SyncManager/SW mocks by default
    delete (window as any).SyncManager;
  });

  afterEach(() => {
    if (originalSyncManager !== undefined) {
      (window as any).SyncManager = originalSyncManager;
    } else {
      delete (window as any).SyncManager;
    }
    if (originalServiceWorker !== undefined) {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: originalServiceWorker,
      });
    }
    setNavigatorOnline(true);
  });

  it('renders offline banner with "عرض المنتجات المحفوظة محلياً" button when offline', async () => {
    setNavigatorOnline(false);

    await cacheProductsLocally([
      {
        id: 'prod-1',
        trader_id: 'tr-1',
        title: 'هاتف ذكي سامسونج A55',
        sku: 'SAM-A55-EG',
        price: 18500,
        stock: 12,
        platform: 'amazon',
      },
    ]);

    render(<OfflineNoticeBanner />);

    expect(
      await screen.findByText(/وضع عدم الاتصال بالإنترنت/i)
    ).toBeInTheDocument();

    const viewLocalBtn = screen.getByRole('button', {
      name: /عرض المنتجات المحفوظة محلياً/i,
    });
    expect(viewLocalBtn).toBeInTheDocument();
  });

  it('opens locally saved products modal and shows cached & pending offline products with search', async () => {
    setNavigatorOnline(false);

    await cacheProductsLocally([
      {
        id: 'prod-cached-1',
        trader_id: 'tr-1',
        title: 'شاشة إل جي 55 بوصة',
        sku: 'LG-55-OLED',
        price: 29900,
        stock: 4,
        platform: 'noon',
      },
    ]);

    await queueOfflineAction({
      type: 'add_product',
      label: 'إضافة منتج: سماعة بلوتوث احترافية',
      payload: {
        title: 'سماعة بلوتوث احترافية',
        sku: 'BT-PRO-99',
        price: 1450,
        stock: 25,
        platform: 'amazon',
        trader_id: 'tr-1',
      },
    });

    render(<OfflineNoticeBanner />);

    const viewLocalBtn = await screen.findByRole('button', {
      name: /عرض المنتجات المحفوظة محلياً/i,
    });
    fireEvent.click(viewLocalBtn);

    expect(await screen.findByText('شاشة إل جي 55 بوصة')).toBeInTheDocument();
    expect(await screen.findByText('سماعة بلوتوث احترافية')).toBeInTheDocument();
    expect(screen.getByText('محفوظ محلياً 📦')).toBeInTheDocument();
    expect(screen.getByText('بانتظار المزامنة ⏳')).toBeInTheDocument();

    // Search filters saved products cleanly
    const searchInput = screen.getByPlaceholderText(/ابحث بالاسم أو SKU/i);
    fireEvent.change(searchInput, { target: { value: 'BT-PRO-99' } });

    expect(screen.getByText('سماعة بلوتوث احترافية')).toBeInTheDocument();
    expect(screen.queryByText('شاشة إل جي 55 بوصة')).not.toBeInTheDocument();
  });

  it('allows queuing a new product while offline directly from OfflineNoticeBanner modal', async () => {
    setNavigatorOnline(false);
    const toastSpy = vi.fn();

    render(<OfflineNoticeBanner onShowToast={toastSpy} />);

    fireEvent.click(
      await screen.findByRole('button', { name: /عرض المنتجات المحفوظة محلياً/i })
    );

    fireEvent.click(screen.getByRole('button', { name: /إضافة منتج \(أوفلاين\)/i }));

    fireEvent.change(screen.getByPlaceholderText('اسم المنتج...'), {
      target: { value: 'كاميرا مراقبة لاسلكية' },
    });
    fireEvent.change(screen.getByPlaceholderText('SKU...'), {
      target: { value: 'cam-wifi-01' },
    });
    fireEvent.change(screen.getByPlaceholderText('السعر (ج.م)'), {
      target: { value: '2200' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'حفظ' }));

    await waitFor(async () => {
      const queue = await getOfflineActionQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('add_product');
      expect(queue[0].payload.title).toBe('كاميرا مراقبة لاسلكية');
      expect(queue[0].payload.sku).toBe('CAM-WIFI-01');
      expect(queue[0].payload.price).toBe(2200);
    });

    const rawStored = localStorage.getItem(OFFLINE_ACTION_QUEUE_STORAGE_KEY);
    expect(rawStored).toContain('CAM-WIFI-01');
  });

  it('registers Background Sync API when SyncManager is supported and falls back safely when unsupported', async () => {
    setNavigatorOnline(false);

    const mockRegisterSync = vi.fn().mockResolvedValue(undefined);
    const mockGetTags = vi.fn().mockResolvedValue([OFFLINE_SYNC_TAG]);
    (window as any).SyncManager = function SyncManager() {};

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          sync: {
            register: mockRegisterSync,
            getTags: mockGetTags,
          },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    await queueOfflineAction({
      type: 'add_product',
      label: 'إضافة منتج: ماوس ألعاب RGB',
      payload: {
        title: 'ماوس ألعاب RGB',
        sku: 'MOUSE-RGB-1',
        price: 750,
        stock: 15,
        platform: 'amazon',
        trader_id: 'tr-1',
      },
    });

    expect(mockRegisterSync).toHaveBeenCalledWith(OFFLINE_SYNC_TAG);

    render(<OfflineNoticeBanner />);
    expect(
      await screen.findByText(/المزامنة الخلفية \(Background Sync API\) مفعّلة ✓/i)
    ).toBeInTheDocument();
  });

  it('automatically syncs queued offline products to Supabase when online event fires', async () => {
    setNavigatorOnline(false);

    await queueOfflineAction({
      type: 'add_product',
      label: 'إضافة منتج: لوحة مفاتيح ميكانيكية',
      payload: {
        title: 'لوحة مفاتيح ميكانيكية',
        sku: 'KB-MECH-77',
        price: 3100,
        stock: 8,
        platform: 'noon',
        trader_id: 'tr-1',
      },
    });

    render(<OfflineNoticeBanner />);

    // Ensure product is still queued before reconnecting
    expect(await getOfflineActionQueue()).toHaveLength(1);
    expect(mockInsert).not.toHaveBeenCalled();

    // Simulate reconnection
    setNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(async () => {
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'لوحة مفاتيح ميكانيكية',
          sku: 'KB-MECH-77',
          price: 3100,
          platform: 'noon',
        }),
      ]);
      const remainingQueue = await getOfflineActionQueue();
      expect(remainingQueue).toHaveLength(0);
    });

    expect(
      await screen.findByText(/تمت مزامنة 1 منتج\/إجراء تلقائياً ✅/i)
    ).toBeInTheDocument();
  });

  it('syncPendingOfflineActions keeps item marked failed if Supabase insert errors', async () => {
    setNavigatorOnline(false);
    await queueOfflineAction({
      type: 'add_product',
      label: 'إضافة منتج: منتج اختباري',
      payload: {
        title: 'منتج اختباري',
        sku: 'ERR-SKU-1',
        price: 500,
        stock: 2,
        platform: 'amazon',
        trader_id: 'tr-1',
      },
    });

    mockInsert.mockResolvedValueOnce({ error: { message: 'network timeout' } });
    setNavigatorOnline(true);

    const summary = await syncPendingOfflineActions();
    expect(summary.synced).toBe(0);
    expect(summary.failed).toBe(1);
    expect(summary.remaining).toBe(1);

    const remaining = await getOfflineActionQueue();
    expect(remaining[0].status).toBe('failed');
    expect(remaining[0].errorMessage).toBe('network timeout');
    expect(localStorage.getItem(OFFLINE_PRODUCTS_CACHE_STORAGE_KEY)).toBeNull();
  });

  it('displays live syncing, error retry, and SW BACKGROUND_SYNC_TRIGGERED status in OfflineNoticeBanner', async () => {
    setNavigatorOnline(false);

    let swMessageListener: ((event: any) => void) | null = null;
    (window as any).SyncManager = function SyncManager() {};
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: { postMessage: vi.fn() },
        ready: Promise.resolve({
          sync: {
            register: vi.fn().mockResolvedValue(undefined),
            getTags: vi.fn().mockResolvedValue([OFFLINE_SYNC_TAG]),
          },
        }),
        addEventListener: vi.fn((type: string, cb: any) => {
          if (type === 'message') swMessageListener = cb;
        }),
        removeEventListener: vi.fn(),
      },
    });

    await queueOfflineAction({
      type: 'add_product',
      label: 'إضافة منتج: شاحن أنكر 65W',
      payload: {
        title: 'شاحن أنكر 65W',
        sku: 'ANK-65-TEST',
        price: 1200,
        stock: 6,
        platform: 'amazon',
        trader_id: 'tr-1',
      },
    });

    render(<OfflineNoticeBanner />);

    const statusBadge = await screen.findByTestId('sync-status-badge');
    expect(statusBadge.textContent).toContain('في انتظار عودة الشبكة (1 عملية)');

    // Trigger SW BACKGROUND_SYNC_STARTED -> immediate live syncing state
    await act(async () => {
      swMessageListener?.({ data: { type: 'BACKGROUND_SYNC_STARTED', tag: OFFLINE_SYNC_TAG } });
    });
    expect(screen.getByTestId('sync-status-badge').textContent).toContain(
      'جاري مزامنة العمليات المؤجلة...'
    );

    // First sync attempt fails -> banner transitions to error state with retry CTA
    mockInsert.mockResolvedValueOnce({ error: { message: 'temporary 503' } });
    setNavigatorOnline(true);
    await act(async () => {
      swMessageListener?.({
        data: { type: 'BACKGROUND_SYNC_TRIGGERED', tag: OFFLINE_SYNC_TAG, isOnline: true },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('sync-status-badge').textContent).toContain(
        'تعذر مزامنة 1 عملية ⚠️'
      );
    });

    // Retry succeeds -> banner shows synced state
    mockInsert.mockResolvedValueOnce({ error: null });
    fireEvent.click(screen.getByRole('button', { name: /إعادة المحاولة الآن ⚡/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('sync-status-badge').textContent).toContain('تمت المزامنة بنجاح');
    });
  });
});
