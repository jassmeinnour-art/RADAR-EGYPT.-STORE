// Web Audio API Synthesizer for Custom Alerts & Notifications
// Zero external dependencies, pure browser synthesis, works offline and in iframes

export type SoundToneId = 
  | 'price_alert_ping'
  | 'price_alert_urgent'
  | 'price_alert_chime'
  | 'price_alert_cash'
  | 'competitor_radar_ping'
  | 'competitor_stockout_alert'
  | 'competitor_buybox_fanfare'
  | 'subtle_pop';

export interface SoundToneMetadata {
  id: SoundToneId;
  name: string;
  nameEn: string;
  category: 'price' | 'competitor' | 'both';
  description: string;
  badge: string;
}

export const AVAILABLE_SOUND_TONES: SoundToneMetadata[] = [
  {
    id: 'price_alert_ping',
    name: 'رنين الرادار الصاعد (Radar Chime)',
    nameEn: 'Radar Chime',
    category: 'price',
    description: 'نغمة تصاعدية مزدوجة ناصعة (587Hz -> 880Hz) لتمييز الهبوط السعري فوراً.',
    badge: 'موصى به للأسعار ⚡'
  },
  {
    id: 'price_alert_urgent',
    name: 'إنذار هبوط حاد وسريع (Urgent Siren Chime)',
    nameEn: 'Urgent Drop Siren',
    category: 'price',
    description: 'نغمة إنذار ترددية ثنائية سريعة (660Hz / 880Hz) للتنبيه بكسر حاجز السعر.',
    badge: 'هبوط عاجل 🚨'
  },
  {
    id: 'price_alert_cash',
    name: 'رنين الكاشير الرقمي (Digital Cash Register)',
    nameEn: 'Cash Register Ding',
    category: 'price',
    description: 'نقرة ميكانيكية مع رنين معدني للقطع النقدية (987Hz -> 1318Hz).',
    badge: 'أرباح ومبيعات 💰'
  },
  {
    id: 'price_alert_chime',
    name: 'رنين الماريمبا الهادئ (Harmonic Bell)',
    nameEn: 'Harmonic Bell',
    category: 'both',
    description: 'نغمة هادئة رقيقة ثلاثية الأوتار مناسبة للعمل المكتبي الطويل دون إزعاج.',
    badge: 'ناعم وخافت 🎵'
  },
  {
    id: 'competitor_stockout_alert',
    name: 'إنذار نفاد مخزون المنافس (Stockout Alert)',
    nameEn: 'Stockout Caution',
    category: 'competitor',
    description: 'نغمة اهتزازية تحذيرية مزدوجة منخفضة لمرتفعة (440Hz -> 659Hz) لتنبهك بفرصة رفع السعر.',
    badge: 'موصى به للمنافسين 📦'
  },
  {
    id: 'competitor_buybox_fanfare',
    name: 'لحن اقتناص الباي بوكس (Buy Box Fanfare)',
    nameEn: 'Buy Box Fanfare',
    category: 'competitor',
    description: 'نغمة احتفالية متصاعدة من 3 طبقات هارمونية (C5 -> E5 -> G5 -> C6) لاقتناص صندوق الشراء.',
    badge: 'فوز Buy Box 🏆'
  },
  {
    id: 'competitor_radar_ping',
    name: 'نبض السونار الاستخباري (Sonar Pulse)',
    nameEn: 'Sonar Pulse',
    category: 'competitor',
    description: 'نبضة رادار استكشافية حادة وذيل ارتدادي نقي لتبدلات حالة ومواقع المنافسين.',
    badge: 'رادار حي 📡'
  },
  {
    id: 'subtle_pop',
    name: 'نقرة ناعمة رقيقة (Subtle Tactile Pop)',
    nameEn: 'Tactile Pop',
    category: 'both',
    description: 'نقرة ملموسة قصيرة جداً (خافتة وسريعة 400Hz -> 750Hz) لإشعارات التغير الطفيفة.',
    badge: 'صامت تقريباً 🫧'
  }
];

// Lazy Singleton AudioContext to satisfy autoplay policies
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioContext = new AudioCtx();
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

export interface PlaySoundOptions {
  volume?: number; // 0.0 to 1.0
  pitchMultiplier?: number; // e.g. 0.8 (low), 1.0 (normal), 1.25 (high)
  repeat?: number; // 1 or 2
}

/**
 * Play a synthesized notification sound via Web Audio API.
 */
export function playSynthesizedTone(toneId: SoundToneId, options: PlaySoundOptions = {}): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  const rawVol = options.volume !== undefined ? options.volume : 0.75;
  const masterVolume = Math.max(0, Math.min(1, rawVol));
  if (masterVolume <= 0.001) return true;

  const pitch = options.pitchMultiplier || 1.0;
  const repeatCount = options.repeat || 1;

  for (let r = 0; r < repeatCount; r++) {
    const delayOffset = r * 0.28; // delay between repeats in seconds
    scheduleTone(ctx, toneId, masterVolume, pitch, ctx.currentTime + delayOffset);
  }

  return true;
}

function scheduleTone(
  ctx: AudioContext, 
  toneId: SoundToneId, 
  volume: number, 
  pitch: number, 
  startTime: number
) {
  switch (toneId) {
    case 'price_alert_urgent': {
      // Fast alternating two-tone alarm
      playDualBeep(ctx, 660 * pitch, 880 * pitch, 0.09, 0.08, volume * 0.6, startTime);
      break;
    }

    case 'price_alert_ping': {
      // Crisp ascending dual chime
      playChimeNote(ctx, 587.33 * pitch, 0.14, volume * 0.5, startTime);
      playChimeNote(ctx, 880 * pitch, 0.22, volume * 0.65, startTime + 0.09);
      break;
    }

    case 'price_alert_cash': {
      // Cash register click + high bell
      playClickTransient(ctx, volume * 0.4, startTime);
      playChimeNote(ctx, 987.77 * pitch, 0.12, volume * 0.55, startTime + 0.03);
      playChimeNote(ctx, 1318.51 * pitch, 0.28, volume * 0.7, startTime + 0.08);
      break;
    }

    case 'price_alert_chime': {
      // Soft gentle 3-note harmonic bell
      playChimeNote(ctx, 523.25 * pitch, 0.18, volume * 0.4, startTime);
      playChimeNote(ctx, 659.25 * pitch, 0.18, volume * 0.45, startTime + 0.07);
      playChimeNote(ctx, 783.99 * pitch, 0.32, volume * 0.55, startTime + 0.14);
      break;
    }

    case 'competitor_stockout_alert': {
      // Caution double warble
      playWarbleTone(ctx, 440 * pitch, 659.25 * pitch, 0.22, volume * 0.6, startTime);
      break;
    }

    case 'competitor_buybox_fanfare': {
      // Upbeat 4-note ascending fanfare (C5, E5, G5, C6)
      playChimeNote(ctx, 523.25 * pitch, 0.12, volume * 0.45, startTime);
      playChimeNote(ctx, 659.25 * pitch, 0.12, volume * 0.5, startTime + 0.07);
      playChimeNote(ctx, 783.99 * pitch, 0.14, volume * 0.55, startTime + 0.14);
      playChimeNote(ctx, 1046.50 * pitch, 0.35, volume * 0.7, startTime + 0.21);
      break;
    }

    case 'competitor_radar_ping': {
      // Deep sonar sweep + ping
      playSonarPulse(ctx, 784 * pitch, 1046.5 * pitch, 0.35, volume * 0.65, startTime);
      break;
    }

    case 'subtle_pop':
    default: {
      // Soft bubble pop
      playBubblePop(ctx, 420 * pitch, 780 * pitch, 0.08, volume * 0.5, startTime);
      break;
    }
  }
}

// ----------------- Audio Synthesis Helpers -----------------

function playChimeNote(
  ctx: AudioContext, 
  freq: number, 
  duration: number, 
  gainLevel: number, 
  when: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);

  // Add subtle second harmonic for warmth
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainLevel, when + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + duration);
}

function playDualBeep(
  ctx: AudioContext, 
  f1: number, 
  f2: number, 
  d1: number, 
  d2: number, 
  gainLevel: number, 
  when: number
) {
  playChimeNote(ctx, f1, d1, gainLevel, when);
  playChimeNote(ctx, f2, d2, gainLevel * 1.1, when + d1 + 0.02);
}

function playWarbleTone(
  ctx: AudioContext, 
  fromFreq: number, 
  toFreq: number, 
  duration: number, 
  gainLevel: number, 
  when: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(fromFreq, when);
  osc.frequency.exponentialRampToValueAtTime(toFreq, when + duration * 0.7);

  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainLevel, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + duration);
}

function playSonarPulse(
  ctx: AudioContext, 
  freq: number, 
  tailFreq: number, 
  duration: number, 
  gainLevel: number, 
  when: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);
  osc.frequency.linearRampToValueAtTime(tailFreq, when + 0.06);

  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainLevel, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + duration);
}

function playBubblePop(
  ctx: AudioContext, 
  startFreq: number, 
  endFreq: number, 
  duration: number, 
  gainLevel: number, 
  when: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, when);
  osc.frequency.exponentialRampToValueAtTime(endFreq, when + duration * 0.6);

  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainLevel, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + duration);
}

function playClickTransient(ctx: AudioContext, gainLevel: number, when: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1400, when);

  gain.gain.setValueAtTime(gainLevel, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + 0.015);
}
