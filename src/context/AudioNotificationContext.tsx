import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  SoundToneId, 
  AVAILABLE_SOUND_TONES, 
  playSynthesizedTone,
  PlaySoundOptions 
} from '../utils/audioSynthesizer';

export type PitchOption = 'low' | 'normal' | 'high';

export interface AudioNotificationSettings {
  isMasterEnabled: boolean;           // التفعيل العام للصوت
  volume: number;                    // 0.0 to 1.0 (افتراضي: 0.75)
  repeatAlerts: boolean;             // تكرار التنبيه مرتين للإنذار العاجل
  
  // Price Drop & Repricing Alerts
  priceAlertsEnabled: boolean;       // تفعيل صوت تنبيهات الأسعار
  priceAlertTone: SoundToneId;       // النغمة المختارة لهبوط وتغير الأسعار
  priceAlertPitch: PitchOption;      // طبقة صوت تنبيهات الأسعار

  // Competitor Status Changes (Stockout, Buy Box, Availability)
  competitorStatusEnabled: boolean;  // تفعيل صوت تغيرات حالة المنافسين
  competitorStatusTone: SoundToneId; // النغمة المختارة للمنافسين
  competitorStatusPitch: PitchOption;// طبقة صوت المنافسين
}

const DEFAULT_AUDIO_SETTINGS: AudioNotificationSettings = {
  isMasterEnabled: true,
  volume: 0.75,
  repeatAlerts: false,

  priceAlertsEnabled: true,
  priceAlertTone: 'price_alert_urgent',
  priceAlertPitch: 'normal',

  competitorStatusEnabled: true,
  competitorStatusTone: 'competitor_stockout_alert',
  competitorStatusPitch: 'normal',
};

const AUDIO_STORAGE_KEY = 'merchant_radar_audio_settings_v2';

interface AudioNotificationContextType {
  settings: AudioNotificationSettings;
  updateSettings: (updates: Partial<AudioNotificationSettings>) => void;
  resetSettings: () => void;
  
  // High-level Sound Trigger Functions
  playPriceAlertSound: (customOptions?: PlaySoundOptions) => void;
  playCompetitorStatusSound: (customOptions?: PlaySoundOptions) => void;
  playTonePreview: (toneId: SoundToneId, pitch?: PitchOption) => void;
  
  // Modal & Tab routing
  isAudioModalOpen: boolean;
  setIsAudioModalOpen: (open: boolean) => void;
  activeGlobalSettingsTab: 'theme' | 'audio';
  setActiveGlobalSettingsTab: (tab: 'theme' | 'audio') => void;
}

const AudioNotificationContext = createContext<AudioNotificationContextType | undefined>(undefined);

function getPitchMultiplier(pitch: PitchOption): number {
  switch (pitch) {
    case 'low': return 0.82;
    case 'high': return 1.22;
    case 'normal':
    default: return 1.0;
  }
}

export const AudioNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // safe fallback
    }
    return DEFAULT_AUDIO_SETTINGS;
  });

  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [activeGlobalSettingsTab, setActiveGlobalSettingsTab] = useState<'theme' | 'audio'>('audio');

  // Persist to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // safe fallback
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AudioNotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AUDIO_SETTINGS);
  }, []);

  // Trigger sound specifically for Price Alert events
  const playPriceAlertSound = useCallback((customOptions?: PlaySoundOptions) => {
    if (!settings.isMasterEnabled || !settings.priceAlertsEnabled) {
      return;
    }

    const pitchMultiplier = customOptions?.pitchMultiplier ?? getPitchMultiplier(settings.priceAlertPitch);
    const volume = customOptions?.volume ?? settings.volume;
    const repeat = customOptions?.repeat ?? (settings.repeatAlerts ? 2 : 1);

    playSynthesizedTone(settings.priceAlertTone, {
      volume,
      pitchMultiplier,
      repeat
    });
  }, [settings]);

  // Trigger sound specifically for Competitor Status change events
  const playCompetitorStatusSound = useCallback((customOptions?: PlaySoundOptions) => {
    if (!settings.isMasterEnabled || !settings.competitorStatusEnabled) {
      return;
    }

    const pitchMultiplier = customOptions?.pitchMultiplier ?? getPitchMultiplier(settings.competitorStatusPitch);
    const volume = customOptions?.volume ?? settings.volume;
    const repeat = customOptions?.repeat ?? (settings.repeatAlerts ? 2 : 1);

    playSynthesizedTone(settings.competitorStatusTone, {
      volume,
      pitchMultiplier,
      repeat
    });
  }, [settings]);

  // Preview an individual tone for settings configuration
  const playTonePreview = useCallback((toneId: SoundToneId, pitch: PitchOption = 'normal') => {
    const pitchMultiplier = getPitchMultiplier(pitch);
    const volume = Math.max(0.2, settings.volume || 0.75);

    playSynthesizedTone(toneId, {
      volume,
      pitchMultiplier,
      repeat: 1
    });
  }, [settings.volume]);

  return (
    <AudioNotificationContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        playPriceAlertSound,
        playCompetitorStatusSound,
        playTonePreview,
        isAudioModalOpen,
        setIsAudioModalOpen,
        activeGlobalSettingsTab,
        setActiveGlobalSettingsTab
      }}
    >
      {children}
    </AudioNotificationContext.Provider>
  );
};

export function useAudioNotifications() {
  const context = useContext(AudioNotificationContext);
  if (!context) {
    throw new Error('useAudioNotifications must be used within an AudioNotificationProvider');
  }
  return context;
}
