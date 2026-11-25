// DAPUR KILAT — suara: semua bunyi dibuat dari osilator WebAudio,
// tanpa satu pun berkas audio. Bunyi mulai hanya sesudah pemain
// menekan tombol atau mengklik, sesuai aturan autoplay browser.

let audioContext = null;
let muted = false;

function ensureContext() {
  if (audioContext === null) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

// Satu nada pendek: frekuensi, durasi, jenis gelombang, volume.
function blip(freq, seconds, type, volume, when = 0) {
  const ctx = ensureContext();
  if (ctx === null || muted) return;
  const start = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.02);
}

export const sounds = {
  // Dipanggil sekali dari gestur pertama pemain supaya konteks
  // audio browser terbuka.
  unlock() {
    ensureContext();
  },
  toggleMute() {
    muted = !muted;
    return muted;
  },
  isMuted() {
    return muted;
  },
  pickup() {
    blip(520, 0.09, 'sine', 0.12);
  },
  place() {
    blip(340, 0.08, 'triangle', 0.12);
  },
  chop() {
    blip(190, 0.06, 'square', 0.08);
    blip(150, 0.06, 'square', 0.06, 0.07);
  },
  chopDone() {
    blip(660, 0.08, 'sine', 0.12);
    blip(880, 0.1, 'sine', 0.12, 0.08);
  },
  sizzle() {
    blip(1200, 0.15, 'sawtooth', 0.03);
  },
  cooked() {
    blip(740, 0.1, 'sine', 0.12);
    blip(990, 0.12, 'sine', 0.12, 0.09);
  },
  burnt() {
    blip(140, 0.3, 'sawtooth', 0.1);
  },
  serve() {
    blip(523, 0.1, 'sine', 0.14);
    blip(659, 0.1, 'sine', 0.14, 0.09);
    blip(784, 0.16, 'sine', 0.14, 0.18);
  },
  wrong() {
    blip(220, 0.18, 'square', 0.08);
    blip(180, 0.22, 'square', 0.08, 0.12);
  },
  expired() {
    blip(300, 0.2, 'triangle', 0.1);
    blip(240, 0.25, 'triangle', 0.1, 0.15);
  },
  tick() {
    blip(980, 0.05, 'sine', 0.06);
  },
  dayEnd() {
    blip(523, 0.12, 'sine', 0.14);
    blip(659, 0.12, 'sine', 0.14, 0.12);
    blip(784, 0.12, 'sine', 0.14, 0.24);
    blip(1047, 0.3, 'sine', 0.14, 0.36);
  },
};
