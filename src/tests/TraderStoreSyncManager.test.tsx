import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TraderStoreSyncManager } from '../components/TraderStoreSyncManager';
import { SpApiDiagnosticTool } from '../components/SpApiDiagnosticTool';

// Mock Supabase
const mockFunctionsInvoke = vi.fn();
vi.mock('../lib/supabase', () => ({
  supabaseClient: {
    functions: {
      invoke: (...args: any[]) => mockFunctionsInvoke(...args),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'khaled-id-001',
            seller_name: 'خالد محمد',
            seller_id: 'A23IW2QPEITPWT',
            email: 'khaled@store.com',
            refresh_token: 'Atzr|KhaledStoredToken',
            platform: 'amazon',
          },
          {
            id: 'mahmoud-id-002',
            seller_name: 'محمود سعيد',
            seller_id: 'A37JIM7LHQI6IM',
            email: 'mahmoud@store.com',
            refresh_token: 'Atzr|MahmoudStoredToken',
            platform: 'amazon',
          },
        ],
        error: null,
      }),
    })),
  },
  isSupabaseConfigured: true,
  getSupabaseSyncConfig: () => ({
    url: 'https://test-project.supabase.co',
    anonKey: 'anon-key-test',
    accessToken: null,
  }),
}));

describe('TraderStoreSyncManager & SpApiDiagnosticTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock global fetch
    globalThis.fetch = vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/traders')) {
        return new Response(
          JSON.stringify({
            success: true,
            traders: [
              {
                id: 'trd-khaled',
                seller_name: 'خالد محمد',
                seller_id: 'A23IW2QPEITPWT',
                email: 'khaled@store.com',
                platform: 'amazon_sp_api',
                marketplace: 'EG',
                category: 'إلكترونيات',
                is_connected: true,
                sync_status: 'Connected',
                last_sync_at: new Date().toISOString(),
                products_count: 14,
                low_stock_count: 2,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders TraderStoreSyncManager with header diagnostic button and the SpApiDiagnosticTool component', async () => {
    render(<TraderStoreSyncManager />);

    expect(
      await screen.findByRole('heading', { name: /ربط متاجر التجار ومزامنة الكتالوج/i })
    ).toBeInTheDocument();

    const jumpButton = screen.getByTestId('header-jump-to-diagnostic-button');
    expect(jumpButton).toBeInTheDocument();
    expect(jumpButton).toHaveTextContent(/تشخيص SP-API \(405\)/i);

    expect(screen.getByTestId('sp-api-diagnostic-tool-container')).toBeInTheDocument();
    expect(
      screen.getByText(/أداة تشخيص فحص اتصال Amazon SP-API & Edge Function/i)
    ).toBeInTheDocument();
  });

  it('executes diagnostic test on trader Khaled and displays Amazon response, error codes, and headers on HTTP 405', async () => {
    const onShowToast = vi.fn();

    // Mock Edge Function returning HTTP 405 Method Not Allowed with real Amazon details
    mockFunctionsInvoke.mockResolvedValueOnce({
      data: null,
      error: {
        name: 'FunctionsHttpError',
        message: 'Edge Function returned a non-2xx status code',
        context: {
          status: 405,
          statusText: 'Method Not Allowed',
          headers: new Map([
            ['allow', 'GET, HEAD, OPTIONS'],
            ['content-type', 'application/json'],
            ['x-amzn-requestid', 'amzn-req-405-test-uuid'],
            ['date', 'Thu, 26 Nov 2026 16:30:00 GMT'],
          ]),
          text: async () =>
            JSON.stringify({
              success: false,
              stage: 'sp_api_listings',
              method: 'GET',
              endpoint: 'https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/A23IW2QPEITPWT',
              httpStatus: 405,
              error: '405',
              details: 'Method Not Allowed for target resource',
              amazonResponse: {
                errors: [
                  {
                    code: 'MethodNotAllowed',
                    message: 'The HTTP method specified in the request is not allowed for the specified resource.',
                    details: 'Ensure GET is used for listings API with AWS SigV4',
                  },
                ],
              },
              message:
                'خطأ من Amazon SP-API (405 - MethodNotAllowed): The HTTP method specified in the request is not allowed.',
            }),
        },
      },
    });

    render(<SpApiDiagnosticTool onShowToast={onShowToast} />);

    // Click the instant Khaled diagnostic test button
    const khaledBtn = screen.getByTestId('sp-api-diagnose-khaled-button');
    fireEvent.click(khaledBtn);

    await waitFor(() => {
      expect(mockFunctionsInvoke).toHaveBeenCalledWith(
        'amazon-sp-api-sync',
        expect.objectContaining({
          body: expect.objectContaining({
            sellerId: 'A23IW2QPEITPWT',
          }),
        })
      );
    });

    // Check status badge
    const statusBadge = await screen.findByTestId('sp-api-status-badge');
    expect(statusBadge).toHaveTextContent('HTTP 405 Method Not Allowed');

    // Check special 405 troubleshooter box
    const troubleshooterBox = await screen.findByTestId('sp-api-405-troubleshooter-box');
    expect(troubleshooterBox).toHaveTextContent(/تحليل استجابة 405 Method Not Allowed/i);
    expect(troubleshooterBox).toHaveTextContent(/POST https:\/\/api\.amazon\.com\/auth\/o2\/token/i);
    expect(troubleshooterBox).toHaveTextContent(/GET https:\/\/sellingpartnerapi-eu\.amazon\.com\/listings\/2021-08-01/i);
    expect(troubleshooterBox).toHaveTextContent(/GET, HEAD, OPTIONS/i);

    // Check raw JSON viewer
    const jsonViewer = screen.getByTestId('sp-api-raw-json-viewer');
    expect(jsonViewer).toHaveTextContent('MethodNotAllowed');
    expect(jsonViewer).toHaveTextContent('The HTTP method specified in the request is not allowed');
    expect(jsonViewer).toHaveTextContent('A23IW2QPEITPWT');

    // Check headers table
    const headersTable = screen.getByTestId('sp-api-headers-table');
    expect(within(headersTable).getByText('allow')).toBeInTheDocument();
    expect(within(headersTable).getByText('GET, HEAD, OPTIONS')).toBeInTheDocument();
    expect(within(headersTable).getByText('x-amzn-requestid')).toBeInTheDocument();

    // Test copy buttons
    const copyJsonBtn = screen.getByTestId('sp-api-copy-json-button');
    fireEvent.click(copyJsonBtn);
    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم نسخ الـ JSON'));
    });

    const copyReportBtn = screen.getByTestId('sp-api-copy-report-button');
    fireEvent.click(copyReportBtn);
    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('تم نسخ تقرير التشخيص'));
    });
  });

  it('handles healthy 200 response cleanly when testing health ping', async () => {
    const onShowToast = vi.fn();

    mockFunctionsInvoke.mockResolvedValueOnce({
      data: {
        success: true,
        function: 'amazon-sp-api-sync',
        status: 'ready',
        cors: true,
        timestamp: '2026-11-26T16:35:00.000Z',
      },
      error: null,
    });

    render(<SpApiDiagnosticTool onShowToast={onShowToast} />);

    // Select health ping
    const pingBtn = screen.getByRole('button', { name: /فحص نبض الـ Edge Function فقط/i });
    fireEvent.click(pingBtn);

    await waitFor(() => {
      expect(mockFunctionsInvoke).toHaveBeenCalledWith(
        'amazon-sp-api-sync',
        expect.objectContaining({
          body: { action: 'ping' },
        })
      );
    });

    const statusBadge = await screen.findByTestId('sp-api-status-badge');
    expect(statusBadge).toHaveTextContent('HTTP 200 OK');

    const jsonViewer = screen.getByTestId('sp-api-raw-json-viewer');
    expect(jsonViewer).toHaveTextContent('amazon-sp-api-sync');
    expect(jsonViewer).toHaveTextContent('ready');
    expect(screen.queryByTestId('sp-api-405-troubleshooter-box')).not.toBeInTheDocument();
  });
});
