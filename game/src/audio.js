// Every sound in Twin Vista is synthesized live with the WebAudio API: a find chimes, a miss
// buzzes, a hint whispers. There are no audio files, so the game loads nothing and works
// offline. The context is created lazily on the first user gesture, as browsers require.

let context = null;
let muted = false;

function audioContext() {
  if (context === null) {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    context = new AudioCtor();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** One oscillator note: frequency, start offset in seconds, length, shape and loudness. */
function tone(frequency, delay, duration, type = 'sine', volume = 0.12, slideTo = null) {
  const ac = audioContext();
  if (ac === null || muted) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0008, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** A find lands: two bright notes, the second a fifth above the first. */
export function playFind() {
  tone(784, 0, 0.16, 'sine', 0.14);
  tone(1175, 0.07, 0.24, 'sine', 0.12);
}

/** A miss: a short low buzz that says "not there" without punishing the ears. */
export function playMiss() {
  tone(138, 0, 0.16, 'square', 0.05, 110);
}

/** A hint: one soft, high blip. */
export function playHint() {
  tone(1568, 0, 0.12, 'sine', 0.06);
}

/** A scene cleared: a quick rising arpeggio. */
export function playClear() {
  tone(523, 0, 0.14, 'triangle', 0.12);
  tone(659, 0.08, 0.14, 'triangle', 0.12);
  tone(784, 0.16, 0.14, 'triangle', 0.12);
  tone(1047, 0.24, 0.3, 'triangle', 0.13);
}

/** A plain button press. */
export function playClick() {
  tone(620, 0, 0.06, 'sine', 0.07);
}

/** The last seconds of a scene ticking away. */
export function playTick() {
  tone(990, 0, 0.04, 'sine', 0.045);
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
