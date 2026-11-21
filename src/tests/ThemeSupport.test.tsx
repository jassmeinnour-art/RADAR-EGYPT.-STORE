import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import {
  ThemeProvider,
  useTheme,
  LOCAL_STORAGE_THEME_VARIANT_KEY,
} from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeSettingsModal } from '../components/ThemeSettingsModal';
import { AccountSettingsPage } from '../components/AccountSettingsPage';

vi.mock('../context/AudioNotificationContext', () => ({
  useAudioNotifications: () => ({
    settings: {
      isMasterEnabled: true,
      volume: 0.7,
      repeatAlerts: false,
      priceAlertsEnabled: true,
      priceAlertTone: 'price_alert_ping',
      priceAlertPitch: 'normal',
      competitorStatusEnabled: true,
      competitorStatusTone: 'competitor_radar_beep',
      competitorStatusPitch: 'normal',
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    playPriceAlertSound: vi.fn(),
    playCompetitorStatusSound: vi.fn(),
    playTonePreview: vi.fn(),
    activeGlobalSettingsTab: 'theme',
    setActiveGlobalSettingsTab: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'founder-1', email: 'jassmeinnour@gmail.com', isAnonymous: false },
    profile: {
      uid: 'founder-1',
      email: 'jassmeinnour@gmail.com',
      displayName: 'مؤسس النظام',
      storeName: 'رادار التاجر المصري',
      preferredCurrency: 'EGP',
    },
    updateStoreProfile: vi.fn().mockResolvedValue(undefined),
  }),
}));

const ThemeProbe: React.FC = () => {
  const { themeVariant, resolvedColorMode } = useTheme();
  return (
    <div>
      <span data-testid="probe-variant">{themeVariant}</span>
      <span data-testid="probe-mode">{resolvedColorMode}</span>
    </div>
  );
};

describe('Dual Theme Support: Dark High Contrast & Clean Light', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-mode');
    document.documentElement.className = '';
  });

  it('defines complete semantic color variables for both Dark High Contrast and Clean Light in src/variables.css and configures index.css', () => {
    const varsCss = fs.readFileSync(path.resolve(process.cwd(), 'src/variables.css'), 'utf8');
    const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');

    expect(varsCss).toContain('[data-theme="clean-light"]');
    expect(varsCss).toContain('[data-theme="dark-high-contrast"]');

    const requiredVariables = [
      '--app-bg',
      '--surface-bg',
      '--surface-elevated',
      '--card-bg',
      '--card-border',
      '--card-text',
      '--card-text-secondary',
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--header-bg',
      '--header-border',
      '--sidebar-bg',
      '--sidebar-border',
      '--input-bg',
      '--input-border',
      '--input-text',
      '--primary-color',
      '--primary-hover',
      '--accent-color',
      '--success-color',
      '--warning-color',
      '--danger-color',
      '--info-color',
      '--table-header-bg',
      '--table-row-hover',
      '--chart-grid',
      '--chart-tooltip-bg',
      '--shadow-md',
    ];

    for (const token of requiredVariables) {
      expect(varsCss).toContain(token);
    }

    expect(indexCss).toContain('@custom-variant dark');
    expect(indexCss).toContain('@import "./variables.css"');
  });

  it('renders the تبديل الثيم button and switches between Clean Light and Dark High Contrast with DOM & localStorage persistence', () => {
    const onNotify = vi.fn();

    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeToggle variant="pill" showLabel onToggleNotification={onNotify} />
      </ThemeProvider>
    );

    // Defaults to Clean Light
    expect(screen.getByTestId('probe-variant')).toHaveTextContent('clean-light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean-light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(screen.getByText('تبديل الثيم')).toBeInTheDocument();
    expect(screen.getByText('Clean Light')).toBeInTheDocument();

    // Switch to Dark High Contrast
    const toggleBtn = screen.getByTestId('theme-toggle-button');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('probe-variant')).toHaveTextContent('dark-high-contrast');
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-high-contrast');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_VARIANT_KEY)).toBe('dark-high-contrast');
    expect(screen.getByText('Dark High Contrast')).toBeInTheDocument();
    expect(onNotify).toHaveBeenCalledWith(expect.stringContaining('Dark High Contrast'));

    // Switch back to Clean Light
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('probe-variant')).toHaveTextContent('clean-light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean-light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem(LOCAL_STORAGE_THEME_VARIANT_KEY)).toBe('clean-light');
    expect(onNotify).toHaveBeenCalledWith(expect.stringContaining('Clean Light'));
  });

  it('restores Dark High Contrast from localStorage on initial mount', () => {
    localStorage.setItem(LOCAL_STORAGE_THEME_VARIANT_KEY, 'dark-high-contrast');

    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeToggle variant="compact" />
      </ThemeProvider>
    );

    expect(screen.getByTestId('probe-variant')).toHaveTextContent('dark-high-contrast');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-high-contrast');
    expect(screen.getByText('Dark High Contrast')).toBeInTheDocument();
  });

  it('renders تبديل الثيم and direct Dark High Contrast / Clean Light selectors inside AccountSettingsPage and ThemeSettingsModal', () => {
    const onToast = vi.fn();

    render(
      <ThemeProvider>
        <ThemeProbe />
        <AccountSettingsPage onShowToast={onToast} />
        <ThemeSettingsModal isOpen={true} initialTab="theme" onShowToast={onToast} onClose={vi.fn()} />
      </ThemeProvider>
    );

    expect(screen.getAllByText('تبديل الثيم').length).toBeGreaterThanOrEqual(2);

    // Select Dark High Contrast in AccountSettingsPage
    fireEvent.click(screen.getByTestId('select-theme-dark-high-contrast'));
    expect(screen.getByTestId('probe-variant')).toHaveTextContent('dark-high-contrast');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark-high-contrast');

    // Select Clean Light in AccountSettingsPage
    fireEvent.click(screen.getByTestId('select-theme-clean-light'));
    expect(screen.getByTestId('probe-variant')).toHaveTextContent('clean-light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean-light');
  });
});
