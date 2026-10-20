import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  TrendingDown, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Volume1, 
  BellRing, 
  Play, 
  Radio, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Trophy, 
  SlidersHorizontal,
  Info,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme, PrimaryThemeConfig } from '../context/ThemeContext';
import { useAudioNotifications, PitchOption } from '../context/AudioNotificationContext';
import { AVAILABLE_SOUND_TONES, SoundToneId } from '../utils/audioSynthesizer';
import { useAppUpdate, AppUpdateState } from '../hooks/useAppUpdate';
import { LiveUpdateNotification } from './LiveUpdateNotification';
import { PWAInstallButton } from './PWAInstallButton';

interface ThemeSettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onShowToast?: (message: string) => void;
  initialTab?: 'theme' | 'audio' | 'updates';
  updateState?: AppUpdateState;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  initialTab,
  updateState
}) => {
  const { 
    currentThemeId, 
    currentTheme, 
    allThemes, 
    setPrimaryTheme, 
    resetToDefaultTheme,
    isThemeModalOpen,
    setIsThemeModalOpen,
    colorMode,
    resolvedColorMode,
    systemColorScheme,
    setColorMode
  } = useTheme();

  const {
    settings: audioSettings,
    updateSettings: updateAudioSettings,
    resetSettings: resetAudioSettings,
    playPriceAlertSound,
    playCompetitorStatusSound,
    playTonePreview,
    activeGlobalSettingsTab,
    setActiveGlobalSettingsTab
  } = useAudioNotifications();

  // Tab State: 'audio', 'theme' or 'updates'
  const [activeTab, setActiveTab] = useState<'theme' | 'audio' | 'updates'>(() => {
    if (initialTab) return initialTab;
    return activeGlobalSettingsTab || 'audio';
  });

  const [justSavedThemeName, setJustSavedThemeName] = useState<string | null>(null);
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);
  const [simulatingSoundType, setSimulatingSoundType] = useState<'price' | 'competitor' | null>(null);

  const showModal = isOpen !== undefined ? isOpen : isThemeModalOpen;
  const handleClose = onClose || (() => setIsThemeModalOpen(false));

  if (!showModal) return null;

  const effectiveUpdateState = updateState;

  const handleSelectTheme = (theme: PrimaryThemeConfig) => {
    setPrimaryTheme(theme.id);
    setJustSavedThemeName(theme.name);
    if (onShowToast) {
      onShowToast(`تم تفعيل وحفظ نسق ${theme.name} كـ Primary Color في localStorage 🎨✨`);
    }
    setTimeout(() => {
      setJustSavedThemeName(null);
    }, 2800);
  };

  const handleResetTheme = () => {
    resetToDefaultTheme();
    if (onShowToast) {
      onShowToast('تمت استعادة اللون النيلي الكلاسيكي الافتراضي 🔄');
    }
  };

  const handlePreviewTone = (toneId: SoundToneId, pitch: PitchOption = 'normal') => {
    setPlayingToneId(toneId);
    playTonePreview(toneId, pitch);
    setTimeout(() => {
      setPlayingToneId(null);
    }, 600);
  };

  const handleSimulatePriceAlert = () => {
    setSimulatingSoundType('price');
    playPriceAlertSound();
    if (onShowToast) {
      onShowToast('🔊 تجربة صوتية: تم رصد انخفاض سعر المنافس بنجاح!');
    }
    setTimeout(() => setSimulatingSoundType(null), 800);
  };

  const handleSimulateCompetitorStatus = () => {
    setSimulatingSoundType('competitor');
    playCompetitorStatusSound();
    if (onShowToast) {
      onShowToast('📦 تجربة صوتية: تم رصد نفاد مخزون المنافس وتغير الـ Buy Box!');
    }
    setTimeout(() => setSimulatingSoundType(null), 800);
  };

  const handleResetAudio = () => {
    resetAudioSettings();
    if (onShowToast) {
      onShowToast('تمت استعادة إعدادات الإشعارات الصوتية الافتراضية 🔊');
    }
    playTonePreview('price_alert_ping', 'normal');
  };

  const priceTones = AVAILABLE_SOUND_TONES.filter(t => t.category === 'price' || t.category === 'both');
  const competitorTones = AVAILABLE_SOUND_TONES.filter(t => t.category === 'competitor' || t.category === 'both');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-settings-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl p-2.5 flex items-center justify-center text-white shadow-sm transition-colors"
              style={{ backgroundColor: currentTheme.primaryHex }}
            >
              {activeTab === 'audio' ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <Palette className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="global-settings-modal-title" className="text-base sm:text-lg font-black text-slate-900 font-['Alexandria']">
                  الإعدادات العامة وتفضيلات المنظومة
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  حفظ دائم
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                تخصيص الإشعارات الصوتية اللحظية لأسعار المنافسين وحالات التوفر، والسمات البصرية لمنظومتك.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
            id="btn-close-global-settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-0 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('audio');
              setActiveGlobalSettingsTab('audio');
            }}
            id="tab-global-audio-settings"
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-['Alexandria'] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Volume2 className={`w-4 h-4 ${activeTab === 'audio' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>الإشعارات الصوتية المخصصة (Audio Alerts)</span>
            </div>
            {audioSettings.isMasterEnabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="الصوت مفعل" />
            ) : (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                مكتوم
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('theme');
              setActiveGlobalSettingsTab('theme');
            }}
            id="tab-global-theme-settings"
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-['Alexandria'] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Palette className={`w-4 h-4 ${activeTab === 'theme' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>ألوان وسمات اللوحة (Primary Colors)</span>
            </div>
            <span 
              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: currentTheme.primaryHex }}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            id="tab-global-updates-settings"
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-['Alexandria'] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'updates'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 ${activeTab === 'updates' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>التحديثات الذكية وتثبيت التطبيق (PWA)</span>
            </div>
            {effectiveUpdateState.hasUpdate ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="يوجد تحديث متاح" />
            ) : null}
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          {/* ======================= TAB 1: AUDIO NOTIFICATIONS ======================= */}
          {activeTab === 'audio' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Master Audio Controller Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateAudioSettings({ isMasterEnabled: !audioSettings.isMasterEnabled })}
                      id="btn-toggle-master-audio"
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        audioSettings.isMasterEnabled
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                      title={audioSettings.isMasterEnabled ? "تعطيل الصوت العام" : "تفعيل الصوت العام"}
                    >
                      {audioSettings.isMasterEnabled ? (
                        <Volume2 className="w-6 h-6" />
                      ) : (
                        <VolumeX className="w-6 h-6" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black font-['Alexandria'] text-white">
                          المفتاح العام للتنبيهات الصوتية (Master Audio)
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          audioSettings.isMasterEnabled 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {audioSettings.isMasterEnabled ? 'مفعل وجاهز 🔊' : 'معطل ومكتوم 🔇'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        تشغيل أصوات مخصصة عند حدوث هبوط سعري لمنافس، أو تغير حالة التوفر والباي بوكس.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none self-end sm:self-auto">
                    <input 
                      type="checkbox" 
                      id="input-toggle-master-sound"
                      checked={audioSettings.isMasterEnabled}
                      onChange={(e) => updateAudioSettings({ isMasterEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Volume & Repeat Controls */}
                <div className="pt-3 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Volume1 className="w-4 h-4 text-slate-400" />
                        <span>مستوى الصوت العام:</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-black">
                        {Math.round(audioSettings.volume * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input 
                        type="range"
                        id="input-master-volume-slider"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioSettings.volume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateAudioSettings({ volume: val });
                          if (val > 0 && !audioSettings.isMasterEnabled) {
                            updateAudioSettings({ isMasterEnabled: true });
                          }
                        }}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        aria-label="مستوى الصوت"
                      />
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  </div>

                  {/* Repeat Alerts Option */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">تكرار النغمة مرتين (Double Chime)</span>
                      <span className="text-[10px] text-slate-400">نغمة مزدوجة لضمان لفت الانتباه في البيئات المزدحمة</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        id="input-repeat-alerts"
                        checked={audioSettings.repeatAlerts}
                        onChange={(e) => updateAudioSettings({ repeatAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 1: Price Alerts Audio Configuration */}
              <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 font-['Alexandria']">
                          تنبيهات هبوط وتغير الأسعار (Price Drop Alerts)
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          حماية الهوامش
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يتم تشغيل هذا الصوت عند رصد كسر سعر منافس أو هبوط دون الحد المستهدف.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      id="input-toggle-price-alerts-sound"
                      checked={audioSettings.priceAlertsEnabled}
                      onChange={(e) => updateAudioSettings({ priceAlertsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* Price Tone Selector Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">اختر نغمة إنذار الأسعار:</span>
                    <span className="text-[11px] text-slate-400 font-medium">اضغط على زر الاستماع لتجربة النغمة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {priceTones.map((tone) => {
                      const isSelected = audioSettings.priceAlertTone === tone.id;
                      const isPlaying = playingToneId === tone.id;

                      return (
                        <div
                          key={tone.id}
                          onClick={() => {
                            updateAudioSettings({ priceAlertTone: tone.id });
                            handlePreviewTone(tone.id, audioSettings.priceAlertPitch);
                          }}
                          id={`tone-option-price-${tone.id}`}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-right group ${
                            isSelected
                              ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-400/40 shadow-xs'
                              : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {tone.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {tone.badge}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTone(tone.id, audioSettings.priceAlertPitch);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                              isPlaying 
                                ? 'bg-sky-500 text-white scale-95 animate-pulse' 
                                : 'bg-white hover:bg-sky-100/70 text-slate-700 border border-slate-200'
                            }`}
                            title="استماع فوري للنغمة"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isPlaying ? 'جاري الرنين...' : 'استماع'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price Pitch Selector */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>طبقة صوت تنبيهات الأسعار (Pitch):</span>
                    </span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                      {(['low', 'normal', 'high'] as PitchOption[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            updateAudioSettings({ priceAlertPitch: p });
                            handlePreviewTone(audioSettings.priceAlertTone, p);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            audioSettings.priceAlertPitch === p
                              ? 'bg-sky-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {p === 'low' ? 'منخفضة (رخيمة)' : p === 'normal' ? 'قياسية (متوازنة)' : 'مرتفعة (حادة)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Competitor Status Audio Configuration */}
              <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 font-['Alexandria']">
                          تغيرات حالة المنافسين والـ Buy Box (Competitor Status Changes)
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          اقتناص الفرص
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        يتم إطلاق هذا الصوت عند نفاد مخزون أي منافس، أو تغير بائع صندوق الشراء، أو عودة منتج للتداول.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      id="input-toggle-competitor-sound"
                      checked={audioSettings.competitorStatusEnabled}
                      onChange={(e) => updateAudioSettings({ competitorStatusEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Competitor Tone Selector Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">اختر نغمة تغيرات المنافسين:</span>
                    <span className="text-[11px] text-slate-400 font-medium">نغمات مميزة للتفريق الفوري عن هبوط الأسعار</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {competitorTones.map((tone) => {
                      const isSelected = audioSettings.competitorStatusTone === tone.id;
                      const isPlaying = playingToneId === tone.id;

                      return (
                        <div
                          key={tone.id}
                          onClick={() => {
                            updateAudioSettings({ competitorStatusTone: tone.id });
                            handlePreviewTone(tone.id, audioSettings.competitorStatusPitch);
                          }}
                          id={`tone-option-competitor-${tone.id}`}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-right group ${
                            isSelected
                              ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/40 shadow-xs'
                              : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {tone.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {tone.badge}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTone(tone.id, audioSettings.competitorStatusPitch);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                              isPlaying 
                                ? 'bg-purple-600 text-white scale-95 animate-pulse' 
                                : 'bg-white hover:bg-purple-100/70 text-slate-700 border border-slate-200'
                            }`}
                            title="استماع فوري للنغمة"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isPlaying ? 'جاري الرنين...' : 'استماع'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Competitor Pitch Selector */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>طبقة صوت المنافسين (Pitch):</span>
                    </span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                      {(['low', 'normal', 'high'] as PitchOption[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            updateAudioSettings({ competitorStatusPitch: p });
                            handlePreviewTone(audioSettings.competitorStatusTone, p);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            audioSettings.competitorStatusPitch === p
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {p === 'low' ? 'منخفضة (عميقة)' : p === 'normal' ? 'قياسية (طبيعية)' : 'مرتفعة (حادة)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Interactive Audio Simulation Station */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                      محطة الاختبار الصوتي الفوري (Live Audio Simulator)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAudio}
                    id="btn-reset-audio-settings"
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                    title="استعادة الإعدادات الأصلية"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>استعادة الافتراضي</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  جرّب إطلاق التنبيهات المخصصة الآن للتأكد من ملاءمة مستوى الصوت وطبقة الترددات لسماعات جهازك:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulatePriceAlert}
                    id="btn-simulate-price-alert-sound"
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                      simulatingSoundType === 'price'
                        ? 'bg-sky-500 text-slate-950 border-sky-600 scale-95 ring-2 ring-sky-400'
                        : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200 hover:border-sky-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-sky-600" />
                    <span>تجربة صوت: هبوط سعر المنافس 🔔</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateCompetitorStatus}
                    id="btn-simulate-competitor-sound"
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                      simulatingSoundType === 'competitor'
                        ? 'bg-purple-600 text-white border-purple-700 scale-95 ring-2 ring-purple-400'
                        : 'bg-white hover:bg-purple-50 text-slate-800 border-purple-200 hover:border-purple-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <span>تجربة صوت: نفاد مخزون / Buy Box 🏆</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB 2: THEME COLORS ======================= */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-fadeIn">

              {/* OS Color Scheme Auto-Detection & Manual Mode Switcher Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 font-['Alexandria']">
                      مظهر الواجهة والكشف التلقائي لنظام التشغيل (Theme Mode)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    إعداد النظام المكتشف: {systemColorScheme === 'dark' ? 'وضع ليلي 🌙' : 'وضع نهاري ☀️'}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  يتعرف التطبيق تلقائياً على إعدادات نظام تشغيل جهازك لتفعيل الوضع الليلي أو النهاري، كما يمكنك التبديل يدوياً في أي وقت من هنا أو من شريط الأدوات العلوي:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    id="btn-modal-color-mode-system"
                    onClick={() => {
                      setColorMode('system');
                      onShowToast?.(
                        `🖥️ تم تفعيل الكشف التلقائي حسب نظام التشغيل (${
                          systemColorScheme === 'dark' ? 'ليلي 🌙' : 'نهاري ☀️'
                        })`
                      );
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      colorMode === 'system'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 font-black'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <Monitor className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>تلقائي (حسب النظام)</span>
                    </span>
                    {colorMode === 'system' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    id="btn-modal-color-mode-dark"
                    onClick={() => {
                      setColorMode('dark');
                      onShowToast?.('🌙 تم تفعيل الوضع الليلي (Dark Mode) يدوياً');
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      colorMode === 'dark'
                        ? 'bg-slate-900 border-slate-800 text-white ring-2 ring-indigo-500/30 font-black'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>الوضع الليلي (Dark)</span>
                    </span>
                    {colorMode === 'dark' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    id="btn-modal-color-mode-light"
                    onClick={() => {
                      setColorMode('light');
                      onShowToast?.('☀️ تم تفعيل الوضع النهاري (Light Mode) يدوياً');
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      colorMode === 'light'
                        ? 'bg-sky-50 border-sky-400 text-slate-950 ring-2 ring-sky-400/30 font-black'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      <Sun className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>الوضع النهاري (Light)</span>
                    </span>
                    {colorMode === 'light' && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                  </button>
                </div>
              </div>
              
              {/* Active Toast / Saved Notification */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: currentTheme.primaryHex }}
                    />
                    <span 
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: currentTheme.primaryHex }}
                    />
                  </span>
                  <span className="text-slate-600 font-medium">
                    اللون الرئيسي النشط حالياً:
                  </span>
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: currentTheme.primaryHex }}
                    />
                    {currentTheme.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">({currentTheme.primaryHex})</span>
                </div>

                <div className="flex items-center gap-2">
                  {justSavedThemeName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold animate-fadeIn">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      تم الحفظ في localStorage!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    id="btn-theme-reset-default"
                    className="px-2.5 py-1 rounded-lg hover:bg-slate-200/70 text-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    title="استعادة النيلي الكلاسيكي"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>استعادة الافتراضي</span>
                  </button>
                </div>
              </div>

              {/* Color Palettes Selection Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>اختر اللون المفضل للوحة التحكم:</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">8 ألوان تجارية مصممة للسوق المصري</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {allThemes.map((theme) => {
                    const isSelected = currentThemeId === theme.id;
                    return (
                      <div
                        key={theme.id}
                        id={`btn-select-theme-${theme.id}`}
                        onClick={() => handleSelectTheme(theme)}
                        className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between text-right group ${
                          isSelected
                            ? 'bg-white shadow-md ring-2'
                            : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.primaryHex : undefined,
                          boxShadow: isSelected ? `0 8px 20px -4px ${theme.borderHex}` : undefined
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div 
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-2xs"
                            style={{ backgroundColor: theme.primaryHex }}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-black text-white flex items-center gap-1"
                              style={{ backgroundColor: theme.primaryHex }}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              مفعّل
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-slate-950 font-['Alexandria']">
                            {theme.name}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {theme.description}
                          </div>
                        </div>

                        {/* Color Swatch Bars */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                          <span 
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0" 
                            style={{ backgroundColor: theme.primaryHex }}
                            title="اللون الأساسي"
                          />
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" 
                            style={{ backgroundColor: theme.lightHex }}
                            title="خلفيات التظليل"
                          />
                          <span 
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0" 
                            style={{ backgroundColor: theme.borderHex }}
                            title="حدود التمييز"
                          />
                          <span className="text-[9px] font-mono text-slate-400 mr-auto">
                            {theme.primaryHex}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Interactive Theme Mockup */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>معاينة حية لتأثير نسق الألوان على رادار الأسعار وأزرار العمليات:</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: currentTheme.primaryHex }}
                    >
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">سعر الفوز المقترح لصندوق الشراء</div>
                      <div className="text-[10px] text-slate-400">1,377 ج.م (خصم 5% عن المنافس الأقل)</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs"
                    style={{ backgroundColor: currentTheme.primaryHex }}
                  >
                    تطبيق وتحديث الأسعار ⚡
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB 3: SMART LIVE & PWA UPDATES ======================= */}
          {activeTab === 'updates' && (
            <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
              {/* Live Update Mechanism Controller */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-500" />
                  <span>نظام التحديثات الفورية الذكية وتفريغ الكاش (Live Update Engine)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يتعرف هذا النظام فورياً على أي ميزات جديدة أو تعديلات برمجية يتم نشرها من خلال استوديو جوجل، مع إمكانية تفريغ الكاش القديم وتحميل النسخة المُحدثة فوراً وبكل سلاسة بدون تعقيد.
                </p>
              </div>

              {effectiveUpdateState && (
                <LiveUpdateNotification 
                  variant="settings-card" 
                  updateState={effectiveUpdateState} 
                  onShowToast={onShowToast} 
                />
              )}

              {/* PWA App Installation Status & Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>تثبيت رادار التاجر كتطبيق أصلي مستقل (PWA)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  قم بتثبيت التطبيق على هاتفك أو حاسوبك للعمل كبرنامج مستقل بدون شريط المتصفح، مع إمكانية الوصول السريع وحفظ البيانات دون اتصال بالإنترنت.
                </p>

                <PWAInstallButton variant="settings" onShowToast={onShowToast} />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>يتم حفظ جميع التفضيلات الصوتية والبصرية فورياً في المتصفح (<code className="text-indigo-600 font-mono text-[10px]">localStorage</code>).</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              id="btn-close-theme-modal"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: currentTheme.primaryHex }}
            >
              تم الحفظ والإغلاق ✓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
