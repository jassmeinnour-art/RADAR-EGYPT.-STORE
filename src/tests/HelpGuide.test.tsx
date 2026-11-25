import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HelpPage, { HelpGuide, HELP_GUIDE_COMMON_QUERIES } from '../components/HelpPage';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  },
}));

describe('HelpGuide & /api/help-guide Gemini integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders HelpGuide inside HelpPage with all curated common queries', () => {
    render(<HelpPage />);
    expect(screen.getByRole('region', { name: 'دليل المساعدة الفوري عبر Gemini' })).toBeTruthy();

    for (const item of HELP_GUIDE_COMMON_QUERIES) {
      expect(screen.getByText(item.label)).toBeTruthy();
    }
    expect(screen.getByLabelText('اسأل مساعد رادار التاجر')).toBeTruthy();
  });

  it('calls POST /api/help-guide when clicking a common query and displays the Gemini answer', async () => {
    let resolveFetch!: (value: any) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    global.fetch = fetchMock as any;

    render(<HelpGuide />);

    const targetQuery = HELP_GUIDE_COMMON_QUERIES[0];
    fireEvent.click(screen.getByText(targetQuery.label));

    expect(screen.getByRole('status').textContent).toContain('جاري تجهيز الإجابة السريعة عبر Gemini');

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        answer: '1. صدّر تقرير المخزون من أمازون بصيغة TXT.\n2. ارفعه من زر استورد ملف أمازون في كارت التاجر.',
        model: 'gemini-4-hydrogen',
        timestamp: '2026-11-21T10:00:00.000Z',
      }),
    });

    await waitFor(() => {
      expect(screen.getByText(/صدّر تقرير المخزون من أمازون بصيغة TXT/)).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/help-guide');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toMatchObject({
      query: targetQuery.query,
      topic: targetQuery.topic,
    });
    expect(screen.getByText('gemini-4-hydrogen')).toBeTruthy();
  });

  it('submits a custom user query and sends follow-up conversation history', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          answer: 'يمكنك تعديل بيانات التاجر من صفحة /traders بالضغط على تعديل.',
          model: 'gemini-4-hydrogen',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          answer: 'حقل Seller ID اختياري ويمكن تركه فارغاً.',
          model: 'gemini-4-hydrogen',
        }),
      });
    global.fetch = fetchMock as any;

    render(<HelpGuide />);

    const input = screen.getByLabelText('اسأل مساعد رادار التاجر') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'كيف أعدل بيانات التاجر؟' } });
    fireEvent.click(screen.getByRole('button', { name: /اسأل المساعد/ }));

    await waitFor(() => {
      expect(screen.getByText(/يمكنك تعديل بيانات التاجر/)).toBeTruthy();
    });

    fireEvent.change(input, { target: { value: 'هل Seller ID إجباري؟' } });
    fireEvent.click(screen.getByRole('button', { name: /اسأل المساعد/ }));

    await waitFor(() => {
      expect(screen.getByText(/حقل Seller ID اختياري/)).toBeTruthy();
    });

    const secondBody = JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body));
    expect(secondBody.query).toBe('هل Seller ID إجباري؟');
    expect(secondBody.history).toEqual([
      { role: 'user', content: 'كيف أعدل بيانات التاجر؟' },
      { role: 'model', content: 'يمكنك تعديل بيانات التاجر من صفحة /traders بالضغط على تعديل.' },
    ]);
  });

  it('validates empty query without issuing a network request', () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as any;

    render(<HelpGuide />);
    fireEvent.click(screen.getByRole('button', { name: /اسأل المساعد/ }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('يرجى كتابة سؤالك');
  });

  it('surfaces real server error messages and allows retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: 'خدمة Gemini غير مهيأة حالياً: متغير GEMINI_API_KEY غير مضبوط على الخادم',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          answer: 'تمت الإجابة بعد إعادة المحاولة.',
          model: 'gemini-4-hydrogen',
        }),
      });
    global.fetch = fetchMock as any;

    render(<HelpGuide />);
    fireEvent.click(screen.getByText(HELP_GUIDE_COMMON_QUERIES[1].label));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('GEMINI_API_KEY غير مضبوط');
    });

    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));

    await waitFor(() => {
      expect(screen.getByText('تمت الإجابة بعد إعادة المحاولة.')).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('keeps @google/genai server-side only and configures gemini-4-hydrogen with required User-Agent header', () => {
    const helpPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/HelpPage.tsx'), 'utf8');
    const serverCode = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf8');

    expect(helpPageCode).not.toContain('@google/genai');
    expect(helpPageCode).not.toContain('GEMINI_API_KEY');
    expect(serverCode).toContain("app.post('/api/help-guide'");
    expect(serverCode).toContain("model: 'gemini-4-hydrogen'");
    expect(serverCode).toContain("'User-Agent': 'aistudio-build'");
  });
});
