import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import {
  ThemeProvider,
  useTheme,
  LOCAL_STORAGE_THEME_VARIANT_KEY,
  LOCAL_STORAGE_HIGH_CONTRAST_KEY,
  LOCAL_STORAGE_DARK_PALETTE_KEY,
  LOCAL_STORAGE_DARK_TOKENS_KEY,
  DARK_PALETTE_PRESETS,
} from '../context/ThemeContext';
import { VisualCustomizerProvider } from '../context/VisualCustomizerContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ThemeSettingsModal } from '../components/ThemeSettingsModal';
import { AccountSettingsPage } from '../components/AccountSettingsPage';
import { LayoutSettingsPage } from '../components/LayoutSettingsPage';
import { DarkPaletteSettingsPage } from '../components/DarkPaletteSettingsPage';

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
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-dark-palette');
    document.documentElement.removeAttribute('style');
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

  it('toggles High Contrast mode independently from normal Dark Mode in LayoutSettingsPage and AccountSettingsPage with persistence', () => {
    const varsCss = fs.readFileSync(path.resolve(process.cwd(), 'src/variables.css'), 'utf8');
    const indexCss = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(varsCss).toContain('html[data-high-contrast="true"].light');
    expect(varsCss).toContain('html[data-high-contrast="true"].dark');
    expect(indexCss).toContain('html[data-high-contrast="true"]');

    const onToast = vi.fn();
    render(
      <ThemeProvider>
        <VisualCustomizerProvider>
          <ThemeProbe />
          <LayoutSettingsPage onShowToast={onToast} />
          <AccountSettingsPage onShowToast={onToast} />
        </VisualCustomizerProvider>
      </ThemeProvider>
    );

    const layoutHcSwitch = screen.getByTestId('layout-high-contrast-switch');
    const layoutDarkSwitch = screen.getByTestId('layout-dark-mode-switch');
    const accountHcSwitch = screen.getByTestId('account-high-contrast-switch');

    // Initially off in light mode
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'false');
    expect(accountHcSwitch).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('light');

    // Enable High Contrast in LayoutSettingsPage while staying in Light Mode
    fireEvent.click(layoutHcSwitch);
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'true');
    expect(accountHcSwitch).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(localStorage.getItem(LOCAL_STORAGE_HIGH_CONTRAST_KEY)).toBe('true');
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('light');
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('تفعيل وضع التباين العالي'));
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('وضوح القراءة'));

    // Toggle normal Dark Mode on & off independently — High Contrast stays enabled
    fireEvent.click(layoutDarkSwitch);
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('dark');
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');

    fireEvent.click(layoutDarkSwitch);
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('light');
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'true');

    // Disable High Contrast from AccountSettingsPage switch
    fireEvent.click(accountHcSwitch);
    expect(accountHcSwitch).toHaveAttribute('aria-checked', 'false');
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');
    expect(localStorage.getItem(LOCAL_STORAGE_HIGH_CONTRAST_KEY)).toBe('false');
  });

  it('LayoutSettingsPage updates html data-high-contrast and displays Toast notification on enable and disable even when rendered standalone', () => {
    render(
      <VisualCustomizerProvider>
        <LayoutSettingsPage />
      </VisualCustomizerProvider>
    );

    const layoutHcSwitch = screen.getByTestId('layout-high-contrast-switch');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');

    fireEvent.click(layoutHcSwitch);
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    const enableToast = screen.getByTestId('layout-settings-toast');
    expect(enableToast).toHaveTextContent('تفعيل وضع التباين العالي');
    expect(enableToast).toHaveTextContent('وضوح القراءة');

    fireEvent.click(layoutHcSwitch);
    expect(layoutHcSwitch).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');
    const disableToast = screen.getByTestId('layout-settings-toast');
    expect(disableToast).toHaveTextContent('تعطيل وضع التباين العالي');
  });

  it('applies Deep Blue, Charcoal Black, and Dark Gray palettes via CSS variables in DarkPaletteSettingsPage and clears dark inline overrides when switching to Light Mode', () => {
    const onToast = vi.fn();
    render(
      <ThemeProvider>
        <VisualCustomizerProvider>
          <ThemeProbe />
          <DarkPaletteSettingsPage onShowToast={onToast} />
        </VisualCustomizerProvider>
      </ThemeProvider>
    );

    // Select Deep Blue preset — automatically activates dark mode & applies CSS variables
    fireEvent.click(screen.getByTestId('dark-palette-preset-deep-blue'));
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('deep-blue');
    expect(localStorage.getItem(LOCAL_STORAGE_DARK_PALETTE_KEY)).toBe('deep-blue');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe(
      DARK_PALETTE_PRESETS['deep-blue'].tokens.appBg
    );
    expect(document.documentElement.style.getPropertyValue('--card-bg')).toBe(
      DARK_PALETTE_PRESETS['deep-blue'].tokens.cardBg
    );
    expect(document.documentElement.style.getPropertyValue('--sidebar-bg')).toBe(
      DARK_PALETTE_PRESETS['deep-blue'].tokens.sidebarBg
    );

    // Select Charcoal Black preset
    fireEvent.click(screen.getByTestId('dark-palette-preset-charcoal'));
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('charcoal');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe(
      DARK_PALETTE_PRESETS.charcoal.tokens.appBg
    );

    // Select Dark Gray preset
    fireEvent.click(screen.getByTestId('dark-palette-preset-dark-gray'));
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('dark-gray');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe(
      DARK_PALETTE_PRESETS['dark-gray'].tokens.appBg
    );

    // Switching back to Light Mode clears dark inline CSS variables cleanly
    fireEvent.click(screen.getByTestId('dark-palette-mode-toggle'));
    expect(screen.getByTestId('probe-mode')).toHaveTextContent('light');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--card-bg')).toBe('');
  });

  it('supports fine-grained custom CSS variable editing, WCAG contrast readout, persistence, and reset in DarkPaletteSettingsPage', () => {
    const onToast = vi.fn();
    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
        <DarkPaletteSettingsPage onShowToast={onToast} />
      </ThemeProvider>
    );

    // Edit --app-bg hex input directly -> switches palette to custom & enables dark mode
    const appBgHexInput = screen.getByTestId('token-hex-appBg') as HTMLInputElement;
    fireEvent.change(appBgHexInput, { target: { value: '#102030' } });

    expect(screen.getByTestId('probe-mode')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('custom');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe('#102030');
    expect(screen.getByTestId('dark-palette-custom-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('dark-palette-css-output')).toHaveTextContent('--app-bg: #102030;');
    expect(screen.getByTestId('contrast-check-primary-text')).toHaveTextContent(':1');

    const storedTokens = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DARK_TOKENS_KEY) || '{}');
    expect(storedTokens.appBg).toBe('#102030');

    // Remount and verify persistence
    unmount();
    render(
      <ThemeProvider>
        <ThemeProbe />
        <DarkPaletteSettingsPage onShowToast={onToast} />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('custom');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe('#102030');

    // Reset back to Obsidian Default
    fireEvent.click(screen.getByTestId('dark-palette-reset-btn'));
    expect(document.documentElement.getAttribute('data-dark-palette')).toBe('default');
    expect(document.documentElement.style.getPropertyValue('--app-bg')).toBe(
      DARK_PALETTE_PRESETS.default.tokens.appBg
    );
  });
});

