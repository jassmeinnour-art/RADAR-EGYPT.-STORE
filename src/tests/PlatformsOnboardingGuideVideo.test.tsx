import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlatformsOnboardingGuide } from '../components/PlatformsOnboardingGuide';

describe('PlatformsOnboardingGuide — AI Explanatory Video Support', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders AI video guide section for Amazon Egypt, sends focus & duration to /api/platforms/onboarding-video, and plays generated video', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        platformId: 'amazon-eg',
        duration: '10s',
        focusMode: 'integration',
        model: 'gemini-omni-1.2-flash',
        videoUrl: 'data:video/mp4;base64,AAAAIGZ0eXBtcDQy',
      }),
    } as Response);

    render(<PlatformsOnboardingGuide />);

    const videoSection = screen.getByTestId('platform-video-section-amazon-eg');
    expect(videoSection).toBeInTheDocument();
    expect(screen.getByText('01. تجهيز الأوراق الرسمية')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'الشحن والمزامنة' }));
    fireEvent.click(screen.getByRole('button', { name: '10s' }));
    fireEvent.click(screen.getByRole('button', { name: 'توليد فيديو توضيحي بالذكاء الاصطناعي' }));

    await waitFor(() => {
      expect(screen.getByTestId('platform-video-player-amazon-eg')).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/platforms/onboarding-video');
    const body = JSON.parse(String(init?.body));
    expect(body.platformId).toBe('amazon-eg');
    expect(body.focusMode).toBe('integration');
    expect(body.duration).toBe('10s');

    const player = screen.getByTestId('platform-video-player-amazon-eg') as HTMLVideoElement;
    expect(player.getAttribute('src')).toBe('data:video/mp4;base64,AAAAIGZ0eXBtcDQy');
    expect(screen.getByRole('link', { name: 'تحميل الفيديو (MP4)' })).toBeInTheDocument();
  });

  it('supports switching to Noon Egypt and displays real server error if AI video generation fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'خدمة توليد الفيديو بالذكاء الاصطناعي غير مهيأة حالياً: يرجى ضبط GEMINI_API_KEY في Settings > Secrets',
      }),
    } as Response);

    render(<PlatformsOnboardingGuide />);

    // Jump to Noon Egypt
    fireEvent.click(screen.getByRole('button', { name: /نون مصر \(Partner\)/ }));

    const noonSection = await screen.findByTestId('platform-video-section-noon-eg');
    expect(noonSection).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'توليد فيديو توضيحي بالذكاء الاصطناعي' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('GEMINI_API_KEY');
    expect(screen.queryByTestId('platform-video-player-noon-eg')).not.toBeInTheDocument();
  });
});
