const SOUNDS_ENABLED_KEY = 'mag-sounds';

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUNDS_ENABLED_KEY) !== 'false';
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  localStorage.setItem(SOUNDS_ENABLED_KEY, String(next));
  return next;
}

export function playClick() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch { /* ignore */ }
}

export function playSuccess() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getContext();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 + i * 0.1);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 0.15 + i * 0.1);
    });
  } catch { /* ignore */ }
}
