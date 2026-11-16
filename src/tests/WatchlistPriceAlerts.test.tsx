import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WatchlistManager } from '../components/WatchlistManager';
import {
  addToWatchlist,
  getStoredWatchlist,
  toggleWatchlistPriceAlert,
  updateWatchlistProductPriceAlertConfig,
  evaluateCompetitorPriceAgainstPricingEngine,
  triggerCompetitorPriceCheckForWatchlistItem,
  getWatchlistNotificationLogs,
} from '../services/watchlistNotificationService';
import {
  saveAutoPricingRules,
  AUTO_PRICING_RULES_STORAGE_KEY,
} from '../data/autoPricingEngineData';
import { ProductData } from '../types';
import { AutoPricingRule } from '../types/autoPricing';

const { mockAddNotification, mockGetNotifications } = vi.hoisted(() => {
  const storedNotifs: any[] = [];
  return {
    mockAddNotification: vi.fn(async (notif: any) => {
      const entry = {
        id: `notif-${Date.now()}`,
        traderId: 'trader-1',
        type: notif.type || 'price_alert',
        severity: notif.severity || 'urgent',
        message: notif.message,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      storedNotifs.unshift(entry);
      return entry;
    }),
    mockGetNotifications: vi.fn(async () => storedNotifs),
  };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
  multiTenantDb: {
    addNotification: mockAddNotification,
    getNotifications: mockGetNotifications,
    markNotificationAsRead: vi.fn().mockResolvedValue(undefined),
  },
}));

function buildSampleProduct(overrides: Partial<ProductData> = {}): ProductData {
  return {
    id: 'prod-watch-1',
    title: 'سماعة رأس أنكر Soundcore Life Q30',
    brand: 'أنكر (Anker)',
    model: 'Q30',
    category: 'إلكترونيات',
    sku: 'ANK-Q30',
    barcode: '6224001928371',
    imageUrl: 'https://example.com/q30.jpg',
    confidenceScore: 95,
    description: 'سماعة عزل ضوضاء احترافية',
    estimatedWholesaleCost: 2200,
    suggestedRetailPrice: 3100,
    currentLowestPrice: 3000,
    highestPrice: 3400,
    averagePrice: 3150,
    currency: 'ج.م',
    specs: [],
    merchantOffers: [
      {
        id: 'offer-amz',
        merchantName: 'أمازون مصر (Amazon.eg)',
        platformName: 'Amazon.eg',
        platform: 'amazon_eg',
        storeType: 'online',
        currency: 'ج.م',
        price: 3000,
        rating: 4.8,
        reviewCount: 120,
        deliveryTime: 'غداً',
        deliveryCost: 'مجاني',
        isVerified: true,
        stockStatus: 'in_stock',
        fulfillmentType: 'fba',
        url: 'https://amazon.eg',
      },
      {
        id: 'offer-noon',
        merchantName: 'نون مصر (Noon Express)',
        platformName: 'Noon.com',
        platform: 'noon_eg',
        storeType: 'online',
        currency: 'ج.م',
        price: 3120,
        rating: 4.6,
        reviewCount: 85,
        deliveryTime: 'يومان',
        deliveryCost: '25 ج.م',
        isVerified: true,
        stockStatus: 'in_stock',
        fulfillmentType: 'fbf',
        url: 'https://noon.com',
      },
    ],
    tags: ['سماعات', 'أنكر'],
    quickHighlights: [],
    ...overrides,
  };
}

describe('Watchlist Per-Product Price Alerts & Auto-Pricing Engine Integration', () => {
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

  it('toggles per-product price alerts in WatchlistManager and persists competitor + Auto-Pricing rule', () => {
    const prod = buildSampleProduct();
    addToWatchlist(prod, 2850, 'منتج مهم للمراقبة');

    const toastSpy = vi.fn();
    render(<WatchlistManager onShowToast={toastSpy} />);

    // Toggle switch for the product starts disabled
    const alertSwitch = screen.getByRole('switch', {
      name: /تنبيهات السعر لـ سماعة رأس أنكر/,
    });
    expect(alertSwitch.getAttribute('aria-checked')).toBe('false');

    // Enable per-product price alerts
    fireEvent.click(alertSwitch);

    expect(alertSwitch.getAttribute('aria-checked')).toBe('true');
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('تم تفعيل تنبيهات السعر')
    );

    // Select specific competitor and rule
    const competitorSelect = screen.getByLabelText('المنافس المحدد للمراقبة:') as HTMLSelectElement;
    fireEvent.change(competitorSelect, { target: { value: 'أمازون مصر (Amazon.eg)' } });

    const ruleSelect = screen.getByLabelText('قاعدة محرك التسعير المطبقة:') as HTMLSelectElement;
    fireEvent.change(ruleSelect, { target: { value: 'rule-buybox-undercut' } });

    const saved = getStoredWatchlist();
    expect(saved[0].priceAlertEnabled).toBe(true);
    expect(saved[0].priceAlertConfig?.targetCompetitorName).toBe('أمازون مصر (Amazon.eg)');
    expect(saved[0].priceAlertConfig?.linkedRuleId).toBe('rule-buybox-undercut');
  });

  it('sends an instant in-app & browser notification when the selected competitor price changes matching the pricing engine rule', async () => {
    // Mock browser Notification API
    const mockNotificationConstructor = vi.fn();
    (mockNotificationConstructor as any).permission = 'granted';
    (window as any).Notification = mockNotificationConstructor;

    const prod = buildSampleProduct();
    addToWatchlist(prod, 2900);
    toggleWatchlistPriceAlert(prod.id, true, {
      targetCompetitorName: 'أمازون مصر (Amazon.eg)',
      linkedRuleId: 'rule-competitor-percent-change-plus-offset', // >=5% change => competitor + 10 EGP
      notifyChannels: { inApp: true, browserPush: true, sound: true },
    });

    const eventListener = vi.fn();
    window.addEventListener('merchant_watchlist_price_changed', eventListener);

    // 10% drop on the selected competitor (3000 -> 2700)
    const result = await triggerCompetitorPriceCheckForWatchlistItem(
      prod.id,
      2700,
      'أمازون مصر (Amazon.eg)',
      'Amazon.eg'
    );

    window.removeEventListener('merchant_watchlist_price_changed', eventListener);

    expect(result.triggered).toBe(true);
    expect(result.notified).toBe(true);
    expect(result.recommendedPrice).toBe(2710); // competitor 2700 + 10 offset from rule

    // Persisted in-app notification created
    expect(mockAddNotification).toHaveBeenCalledTimes(1);
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'price_alert',
        severity: 'urgent',
        message: expect.stringContaining('أمازون مصر (Amazon.eg)'),
      })
    );

    // Instant window event fired with recommended price
    expect(eventListener).toHaveBeenCalledTimes(1);
    const customEventDetail = (eventListener.mock.calls[0][0] as CustomEvent).detail;
    expect(customEventDetail.recommendedPrice).toBe(2710);
    expect(customEventDetail.newPrice).toBe(2700);

    // Native Web Notification dispatched
    expect(mockNotificationConstructor).toHaveBeenCalledTimes(1);

    // Price log recorded & WatchlistItem updated
    const logs = getWatchlistNotificationLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].newPrice).toBe(2700);
    expect(logs[0].competitorName).toBe('أمازون مصر (Amazon.eg)');

    const updatedItem = getStoredWatchlist()[0];
    expect(updatedItem.lastCheckedPrice).toBe(2700);
    expect(updatedItem.priceTrend).toBe('down');
    expect(updatedItem.priceAlertConfig?.lastRecommendedPrice).toBe(2710);
  });

  it('ignores price changes from a different competitor or when per-product alert is disabled', async () => {
    const prod = buildSampleProduct();
    addToWatchlist(prod, 2900);
    toggleWatchlistPriceAlert(prod.id, true, {
      targetCompetitorName: 'أمازون مصر (Amazon.eg)',
      linkedRuleId: 'rule-buybox-undercut',
    });

    const item = getStoredWatchlist()[0];

    // Different competitor changes price -> should NOT trigger
    const wrongCompetitorRes = await evaluateCompetitorPriceAgainstPricingEngine({
      item,
      newPrice: 2600,
      competitorName: 'نون مصر (Noon Express)',
      platformName: 'Noon.com',
    });

    expect(wrongCompetitorRes.triggered).toBe(false);
    expect(wrongCompetitorRes.notified).toBe(false);
    expect(mockAddNotification).not.toHaveBeenCalled();

    // Disable alert on product -> even matching competitor should NOT trigger
    toggleWatchlistPriceAlert(prod.id, false);
    const disabledItem = getStoredWatchlist()[0];
    const disabledRes = await evaluateCompetitorPriceAgainstPricingEngine({
      item: disabledItem,
      newPrice: 2600,
      competitorName: 'أمازون مصر (Amazon.eg)',
      platformName: 'Amazon.eg',
    });

    expect(disabledRes.triggered).toBe(false);
    expect(disabledRes.notified).toBe(false);
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('reflects newly saved Auto-Pricing Engine rules inside WatchlistManager and evaluates them from UI trigger', async () => {
    const customRule: AutoPricingRule = {
      id: 'rule-custom-undercut-5',
      name: 'دائماً أقل من أمازون بـ 5 جنيهات',
      title: 'دائماً أقل من أمازون بـ 5 جنيهات',
      isActive: true,
      priority: 1,
      conditionType: 'competitor_price_changed_by_percent',
      conditionValue: 2,
      actionType: 'undercut_fixed',
      actionValue: 5,
      guardrails: {
        minFloorPriceEGP: 100,
        maxDiscountPercentFromBaseline: 30,
        minNetMarginPercent: 5,
      },
      updatedAt: new Date().toISOString(),
    };
    saveAutoPricingRules([customRule]);
    expect(localStorage.getItem(AUTO_PRICING_RULES_STORAGE_KEY)).toBeTruthy();

    const prod = buildSampleProduct();
    addToWatchlist(prod, 2800);
    updateWatchlistProductPriceAlertConfig(prod.id, {
      enabled: true,
      targetCompetitorName: 'أمازون مصر (Amazon.eg)',
      linkedRuleId: customRule.id,
    });

    const toastSpy = vi.fn();
    render(<WatchlistManager onShowToast={toastSpy} />);

    // Open alert settings panel for product
    fireEvent.click(screen.getByText('إعدادات التنبيه والمحرك'));

    // Custom rule option must be present and selected
    const ruleSelect = screen.getByLabelText('قاعدة محرك التسعير المطبقة:') as HTMLSelectElement;
    expect(ruleSelect.value).toBe(customRule.id);

    // Enter a new competitor price drop (3000 -> 2800) and trigger instant check
    const testPriceInput = screen.getByLabelText(/رصد سعر منافس جديد/);
    fireEvent.change(testPriceInput, { target: { value: '2800' } });

    fireEvent.click(screen.getByRole('button', { name: /فحص وإرسال إشعار فوري/ }));

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/تقترح تسعيرك عند 2,795 ج.م/)).toBeTruthy();
  });
});
