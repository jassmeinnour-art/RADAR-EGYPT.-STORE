import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { resolvePathToTab } from '../utils/navigation';
import {
  AmazonCallbackPage,
  AMAZON_CALLBACK_SUCCESS_MESSAGE,
} from '../components/AmazonCallbackPage';
import App from '../App';

const {
  authStateRef,
  updateCallsRef,
  clipboardWriteMock,
} = vi.hoisted(() => ({
  authStateRef: {
    current: {
      user: null as any,
      profile: null as any,
      isOwner: false,
      isFounderMode: false,
      authInitError: null,
      isPasswordRecovery: false,
      toggleFounderMode: vi.fn(),
      signOut: vi.fn(),
    },
  },
  updateCallsRef: {
    current: [] as Array<{ table: string; payload: Record<string, any>; filters: Array<{ col: string; val: any }> }>,
  },
  clipboardWriteMock: vi.fn(async (_text: string) => {}),
}));

vi.mock('../context/AuthContext', () => ({
  OWNER_EMAIL: 'jassmeinnour@gmail.com',
  useAuth: () => authStateRef.current,
}));

vi.mock('../context/PerformanceModeContext', () => ({
  usePerformanceMode: () => ({ isPerformanceMode: true, togglePerformanceMode: vi.fn() }),
}));

vi.mock('../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/supabase')>();
  return {
    ...actual,
    invokeUpdateTraderEdgeFunction: vi.fn(async () => ({ data: { id: 'trd-1' }, error: null })),
    supabase: {
      from: (table: string) => {
        const filters: Array<{ col: string; val: any }> = [];
        let updatePayload: Record<string, any> | null = null;

        const builder: any = {
          select: () => builder,
          eq: (col: string, val: any) => {
            filters.push({ col, val });
            return builder;
          },
          order: () => builder,
          limit: () => builder,
          single: () => builder,
          update: (payload: Record<string, any>) => {
            updatePayload = payload;
            return builder;
          },
          then: (onfulfilled: any, onrejected?: any) => {
            if (updatePayload) {
              updateCallsRef.current.push({
                table,
                payload: updatePayload,
                filters: [...filters],
              });
              return Promise.resolve({
                data: [{ id: 'trd-mahmoud', seller_id: 'A37JIM7LHQI6IM', ...updatePayload }],
                error: null,
              }).then(onfulfilled, onrejected);
            }
            return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected);
          },
        };
        return builder;
      },
    },
  };
});

describe('/auth/amazon-callback route & AmazonCallbackPage', () => {
  beforeEach(() => {
    updateCallsRef.current = [];
    clipboardWriteMock.mockClear();
    localStorage.clear();
    sessionStorage.clear();

    authStateRef.current = {
      user: null,
      profile: null,
      isOwner: false,
      isFounderMode: false,
      authInitError: null,
      isPasswordRecovery: false,
      toggleFounderMode: vi.fn(),
      signOut: vi.fn(),
    };

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteMock,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolvePathToTab resolves /auth/amazon-callback properly', () => {
    expect(resolvePathToTab('/auth/amazon-callback')).toBe('amazon_callback');
    expect(resolvePathToTab('/auth/amazon-callback/?code=123&state=A37JIM7LHQI6IM')).toBe(
      'amazon_callback'
    );
  });

  it('App renders AmazonCallbackPage without redirecting /auth/amazon-callback to /login when unauthenticated', async () => {
    window.history.pushState({}, '', '/auth/amazon-callback?code=AN_OAUTH_CODE_777&state=A37JIM7LHQI6IM');

    render(<App />);

    expect(window.location.pathname).toBe('/auth/amazon-callback');
    const page = await screen.findByTestId('amazon-callback-page');
    expect(page.className).toContain('bg-white');
    expect(screen.getByTestId('amazon-callback-code')).toHaveTextContent('AN_OAUTH_CODE_777');
    expect(screen.getByTestId('amazon-callback-state')).toHaveTextContent('A37JIM7LHQI6IM');
  });

  it('auto-copies code, saves refresh_token to traders by seller_id=state, shows toast message, and navigates to /traders', async () => {
    window.history.pushState(
      {},
      '',
      '/auth/amazon-callback?code=AN_LIVE_AUTH_999&state=A37JIM7LHQI6IM'
    );
    const onShowToast = vi.fn();
    const onNavigateToTraders = vi.fn(() => {
      window.history.pushState({}, '', '/traders');
    });

    render(
      <AmazonCallbackPage
        onShowToast={onShowToast}
        onNavigateToTraders={onNavigateToTraders}
        redirectDelayMs={50}
      />
    );

    await waitFor(() => {
      expect(clipboardWriteMock).toHaveBeenCalledWith('AN_LIVE_AUTH_999');
    });

    await waitFor(() => {
      expect(updateCallsRef.current.length).toBeGreaterThan(0);
    });

    const call = updateCallsRef.current[0];
    expect(call.table).toBe('traders');
    expect(call.payload).toEqual({ refresh_token: 'AN_LIVE_AUTH_999' });
    expect(call.filters).toContainEqual({ col: 'seller_id', val: 'A37JIM7LHQI6IM' });

    await waitFor(() => {
      expect(screen.getByTestId('amazon-callback-success')).toHaveTextContent(
        AMAZON_CALLBACK_SUCCESS_MESSAGE
      );
      expect(onShowToast).toHaveBeenCalledWith(AMAZON_CALLBACK_SUCCESS_MESSAGE);
    });

    await waitFor(() => {
      expect(onNavigateToTraders).toHaveBeenCalledTimes(1);
      expect(window.location.pathname).toBe('/traders');
    });
  });
});
