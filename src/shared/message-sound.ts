import type { MessageSound } from "~/shared/user-preferences";

type SoundProfile = {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
};

const SOUND_PROFILES: Record<Exclude<MessageSound, "none">, SoundProfile> = {
  soft: { frequency: 520, duration: 0.12, volume: 0.08, type: "sine" },
  default: { frequency: 660, duration: 0.18, volume: 0.14, type: "triangle" },
  alert: { frequency: 880, duration: 0.28, volume: 0.22, type: "square" },
};

/**
 * Reproduz som de notificação de mensagem conforme preferência do usuário.
 */
export function playMessageSound(sound: MessageSound): void {
  if (sound === "none") return;
  if (typeof window === "undefined") return;

  const profile = SOUND_PROFILES[sound];
  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = profile.type;
  oscillator.frequency.setValueAtTime(profile.frequency, context.currentTime);
  gain.gain.setValueAtTime(profile.volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    context.currentTime + profile.duration,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + profile.duration);

  window.setTimeout(() => {
    void context.close();
  }, profile.duration * 1000 + 100);
}
