import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuickAccessDock } from '../components/QuickAccessDock';
import { PERFORMANCE_MODE_STORAGE_KEY } from '../context/PerformanceModeContext';

describe('QuickAccessDock (شريط الوصول السريع للهواتف)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('renders the 4 key mobile tools (Image Studio, Competitor Radar, Reports, Inventory) inside a mobile-only fixed dock', () => {
    render(
      <QuickAccessDock
        activeTab="home"
        onSelectTab={vi.fn()}
        onPrefetchTab={vi.fn()}
      />
    );

    const dock = screen.getByTestId('quick-access-dock');
    expect(dock).toBeInTheDocument();
    expect(dock.className).toContain('fixed');
    expect(dock.className).toContain('bottom-0');
    expect(dock.className).toContain('lg:hidden');

    expect(screen.getByRole('button', { name: 'استوديو الصور' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'رادار المنافسين' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'التقارير' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'المخزون' })).toBeInTheDocument();
  });

  it('navigates to the matching tab and updates browser URL path when each tool is clicked', () => {
    const onSelectTab = vi.fn();
    render(
      <QuickAccessDock
        activeTab="home"
        onSelectTab={onSelectTab}
        onPrefetchTab={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('quick-dock-item-product_image_studio'));
    expect(onSelectTab).toHaveBeenLastCalledWith('product_image_studio');
    expect(window.location.pathname).toBe('/image-studio');

    fireEvent.click(screen.getByTestId('quick-dock-item-radar'));
    expect(onSelectTab).toHaveBeenLastCalledWith('radar');
    expect(window.location.pathname).toBe('/competitors');

    fireEvent.click(screen.getByTestId('quick-dock-item-reports'));
    expect(onSelectTab).toHaveBeenLastCalledWith('reports');
    expect(window.location.pathname).toBe('/reports');

    fireEvent.click(screen.getByTestId('quick-dock-item-inventory'));
    expect(onSelectTab).toHaveBeenLastCalledWith('inventory');
    expect(window.location.pathname).toBe('/inventory');
  });

  it('marks the currently active tool with aria-current="page" including alias tabs', () => {
    const { rerender } = render(
      <QuickAccessDock activeTab="auto_pricing" onSelectTab={vi.fn()} />
    );

    expect(screen.getByTestId('quick-dock-item-radar')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('quick-dock-item-reports')).not.toHaveAttribute('aria-current');

    rerender(<QuickAccessDock activeTab="trending" onSelectTab={vi.fn()} />);
    expect(screen.getByTestId('quick-dock-item-reports')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('quick-dock-item-radar')).not.toHaveAttribute('aria-current');
  });

  it('respects Performance Mode by skipping speculative prefetching on hover/touch', () => {
    const onPrefetchTab = vi.fn();
    localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, 'true');

    render(
      <QuickAccessDock
        activeTab="home"
        onSelectTab={vi.fn()}
        onPrefetchTab={onPrefetchTab}
      />
    );

    const studioBtn = screen.getByTestId('quick-dock-item-product_image_studio');
    fireEvent.mouseEnter(studioBtn);
    fireEvent.touchStart(studioBtn);

    expect(onPrefetchTab).not.toHaveBeenCalled();

    localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, 'false');
    act(() => {
      window.dispatchEvent(new CustomEvent('radar_performance_mode_changed', { detail: { enabled: false } }));
    });

    fireEvent.mouseEnter(screen.getByTestId('quick-dock-item-inventory'));
    expect(onPrefetchTab).toHaveBeenCalledWith('inventory');
  });
});
