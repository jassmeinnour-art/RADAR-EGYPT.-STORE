import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WatchlistManager } from '../components/WatchlistManager';
import { AccountSettingsPage } from '../components/AccountSettingsPage';
import {
  addToWatchlist,
  toggleWatchlistPriceAlert,
  evaluateCompetitorPriceAgainstPricingEngine,
  notifyWatchlistPriceChange,
  getStoredWatchlist,
} from '../services/watchlistNotificationService';
import {
  getAccountNotificationChannelPrefs,
  saveAccountNotificationChannelPrefs,
  requestBrowserPermissionOnFirstAlertActivation,
} from '../services/notificationChannelPreferences';
import { ProductData } from '../types';

const { mockAddNotification, mockUpdateStoreProfile } = vi.hoisted(() => ({
  mockAddNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
  mockUpdateStoreProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
  multiTenantDb: {
    addNotification: mockAddNotification,
    getNotifications: vi.fn().mockResolvedValue([]),
    markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'founder-uid', email: 'jassmeinnour@gmail.com' },
    profile: {
      uid: 'founder-uid',
      displayName: 'مؤسس النظام',
      email: 'jassmeinnour@gmail.com',
      storeName: 'رادار التاجر',
      contactPhone: '201012345678',
      city: 'القاهرة',
      preferredCurrency: 'EGP',
    },
    updateStoreProfile: mockUpdateStoreProfile,
  }),
}));

vi.mock('../db', () => ({
  auth: { currentUser: null },
  db: null,
  usersCollection: null,
  handleFirestoreError: vi.fn(),
  OperationType: { GET: 'get', WRITE: 'write', UPDATE: 'update' },
  isFirestoreQuotaExhausted: () => false,
}));

function buildProduct(id = 'prod-notif-1'): ProductData {
  return {
    id,
    title: 'هاتف سامسونج جالكسي A55',
    brand: 'Samsung',
    model: 'A55',
    category: 'هواتف',
    sku: 'SAM-A55',
    barcode: '8806095123456',
    imageUrl: 'https://example.com/a55.jpg',
    confidenceScore: 96,
    description: 'هاتف ذكي',
    estimatedWholesaleCost: 14000,
    suggestedRetailPrice: 17500,
    currentLowestPrice: 17000,
    highestPrice: 18500,
    averagePrice: 17400,
    currency: 'ج.م',
    specs: [],
    merchantOffers: [
      {
        id: 'off-amz',
        merchantName: 'أمازون مصر (Amazon.eg)',
        platformName: 'Amazon.eg',
        platform: 'amazon_eg',
        storeType: 'online',
        currency: 'ج.م',
        price: 17000,
        rating: 4.8,
        reviewCount: 50,
        deliveryTime: 'غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        fulfillmentType: 'fba',
        url: 'https://amazon.eg',
      },
    ],
    tags: ['هواتف'],
    quickHighlights: [],
  };
}

describe('First-Time Notification API Permission & Account Settings WhatsApp vs Browser Controls', () => {
  const OriginalNotification = (window as any).Notification;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    if (OriginalNotification !== undefined) {
      (window as any).Notification = OriginalNotification;
    } else {
      delete (window as any).Notification;
    }
  });

  it('requests browser Notification permission once when enabling Watchlist alerts for the first time', async () => {
    const requestPermissionMock = vi.fn().mockImplementation(async () => {
      (MockNotif as any).permission = 'granted';
      return 'granted';
    });
    const MockNotif: any = vi.fn();
    MockNotif.permission = 'default';
    MockNotif.requestPermission = requestPermissionMock;
    (window as any).Notification = MockNotif;

    const p1 = buildProduct('prod-1');
    const p2 = buildProduct('prod-2');
    addToWatchlist(p1, 16500);
    addToWatchlist(p2, 16500);

    const toastSpy = vi.fn();
    render(<WatchlistManager onShowToast={toastSpy} />);

    const switches = screen.getAllByRole('switch', { name: /تنبيهات السعر لـ/ });
    expect(switches).toHaveLength(2);

    // First-time activation triggers Notification.requestPermission()
    fireEvent.click(switches[0]);

    await waitFor(() => {
      expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    });

    // Second product toggle should NOT re-prompt because permission is granted and already prompted
    fireEvent.click(switches[1]);
    await waitFor(() => {
      expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    });

    const prefs = getAccountNotificationChannelPrefs();
    expect(prefs.hasPromptedBrowserPermission).toBe(true);
    expect(prefs.browserNotificationsEnabled).toBe(true);
  });

  it('handles denied and unsupported Notification API states gracefully without crashing', async () => {
    // 1. Denied state via requestPermission
    const requestPermDenied = vi.fn().mockResolvedValue('denied');
    const MockDeniedNotif: any = vi.fn();
    MockDeniedNotif.permission = 'default';
    MockDeniedNotif.requestPermission = requestPermDenied;
    (window as any).Notification = MockDeniedNotif;

    const deniedRes = await requestBrowserPermissionOnFirstAlertActivation();
    expect(deniedRes.prompted).toBe(true);
    expect(deniedRes.granted).toBe(false);
    expect(deniedRes.permission).toBe('denied');
    expect(getAccountNotificationChannelPrefs().browserNotificationsEnabled).toBe(false);

    // Subsequent default check when already prompted does NOT re-prompt automatically
    const secondRes = await requestBrowserPermissionOnFirstAlertActivation();
    expect(secondRes.prompted).toBe(false);

    // 2. Unsupported browser
    delete (window as any).Notification;
    const unsupportedRes = await requestBrowserPermissionOnFirstAlertActivation();
    expect(unsupportedRes.permission).toBe('unsupported');
    expect(unsupportedRes.granted).toBe(false);
  });

  it('renders AccountSettingsPage and lets users switch between WhatsApp-only, Browser-only, Both, and Muted', async () => {
    const MockNotif: any = vi.fn();
    MockNotif.permission = 'granted';
    MockNotif.requestPermission = vi.fn().mockResolvedValue('granted');
    (window as any).Notification = MockNotif;

    const toastSpy = vi.fn();
    render(<AccountSettingsPage onShowToast={toastSpy} />);

    const waOnlyBtn = screen.getByTestId('channel-mode-whatsapp_only');
    const browserOnlyBtn = screen.getByTestId('channel-mode-browser_only');
    const bothBtn = screen.getByTestId('channel-mode-both');
    const mutedBtn = screen.getByTestId('channel-mode-muted');

    expect(bothBtn.getAttribute('aria-checked')).toBe('true');

    // Switch to WhatsApp only
    fireEvent.click(waOnlyBtn);
    await waitFor(() => {
      expect(waOnlyBtn.getAttribute('aria-checked')).toBe('true');
    });
    expect(getAccountNotificationChannelPrefs().channelMode).toBe('whatsapp_only');
    expect(getAccountNotificationChannelPrefs().whatsappEnabled).toBe(true);
    expect(getAccountNotificationChannelPrefs().browserNotificationsEnabled).toBe(false);

    // Switch to Browser only
    fireEvent.click(browserOnlyBtn);
    await waitFor(() => {
      expect(browserOnlyBtn.getAttribute('aria-checked')).toBe('true');
    });
    expect(getAccountNotificationChannelPrefs().channelMode).toBe('browser_only');
    expect(getAccountNotificationChannelPrefs().whatsappEnabled).toBe(false);
    expect(getAccountNotificationChannelPrefs().browserNotificationsEnabled).toBe(true);

    // Switch to Muted
    fireEvent.click(mutedBtn);
    await waitFor(() => {
      expect(mutedBtn.getAttribute('aria-checked')).toBe('true');
    });
    expect(getAccountNotificationChannelPrefs().channelMode).toBe('muted');
    expect(getAccountNotificationChannelPrefs().whatsappEnabled).toBe(false);
    expect(getAccountNotificationChannelPrefs().browserNotificationsEnabled).toBe(false);
  });

  it('enforces WhatsApp vs Browser channel preference when dispatching Watchlist price alerts', async () => {
    const MockNotif: any = vi.fn();
    MockNotif.permission = 'granted';
    (window as any).Notification = MockNotif;

    const prod = buildProduct('prod-channel-check');
    addToWatchlist(prod, 16500);
    toggleWatchlistPriceAlert(prod.id, true, {
      targetCompetitorName: 'أمازون مصر (Amazon.eg)',
      linkedRuleId: 'rule-buybox-undercut',
      notifyChannels: { inApp: true, browserPush: true, sound: true },
    });

    // Mode 1: WhatsApp ONLY -> browser Notification constructor MUST NOT be called, WhatsApp dispatched = true
    saveAccountNotificationChannelPrefs({ channelMode: 'whatsapp_only' });
    const item1 = getStoredWatchlist()[0];
    const waOnlyRes = await evaluateCompetitorPriceAgainstPricingEngine({
      item: item1,
      newPrice: 15500,
      competitorName: 'أمازون مصر (Amazon.eg)',
      platformName: 'Amazon.eg',
    });

    expect(waOnlyRes.triggered).toBe(true);
    expect(waOnlyRes.channelsDispatched?.whatsapp).toBe(true);
    expect(waOnlyRes.channelsDispatched?.browserPush).toBe(false);
    expect(MockNotif).not.toHaveBeenCalled();

    // Mode 2: Browser ONLY -> browser Notification constructor MUST be called, WhatsApp dispatched = false
    saveAccountNotificationChannelPrefs({ channelMode: 'browser_only' });
    const item2 = getStoredWatchlist()[0];
    const browserOnlyRes = await evaluateCompetitorPriceAgainstPricingEngine({
      item: item2,
      newPrice: 14900,
      competitorName: 'أمازون مصر (Amazon.eg)',
      platformName: 'Amazon.eg',
    });

    expect(browserOnlyRes.triggered).toBe(true);
    expect(browserOnlyRes.channelsDispatched?.whatsapp).toBe(false);
    expect(browserOnlyRes.channelsDispatched?.browserPush).toBe(true);
    expect(MockNotif).toHaveBeenCalledTimes(1);

    // Mode 3: notifyWatchlistPriceChange on non-rule product with muted channel suppresses both
    saveAccountNotificationChannelPrefs({ channelMode: 'muted' });
    const prodPlain = buildProduct('prod-plain-muted');
    addToWatchlist(prodPlain, 16000);
    const plainItem = getStoredWatchlist().find((w) => w.productId === 'prod-plain-muted')!;
    const mutedDispatched = await notifyWatchlistPriceChange({
      item: plainItem,
      newPrice: 15000,
      competitorName: 'أمازون مصر (Amazon.eg)',
      platformName: 'Amazon.eg',
    });

    expect(mutedDispatched).toBe(false);
    expect(MockNotif).toHaveBeenCalledTimes(1);
  });
});
