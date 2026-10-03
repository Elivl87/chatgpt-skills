/**
 * Placeholder audio generator (deterministic, no samples, no copyright).
 *
 *   npm run audio:placeholders                 # shared SFX + every episode's music
 *   npm run audio:placeholders -- ep002        # shared SFX + one episode's music
 *   npm run audio:placeholders -- --force      # overwrite existing files
 *
 * Driven entirely by configuration:
 *   SFX   → every entry in shared/sfx.json that has a synth below, written to its `src`
 *   music → every track cue in each episode.json, written to public/<assetRoot>/<src>
 *           using the generator named by the cue's `placeholder` field ("bed" | "sunset")
 * so the mix, ducking and timing can be judged before real sound design exists.
 * Replace any file in place (same name) with a licensed / produced version —
 * nothing else needs to change. Existing files are never overwritten unless --force.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EPISODES, SFX } from '../src/episodes';
import type { MusicTrackCue } from '../src/schema/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 48000;
const FORCE = process.argv.includes('--force');

// ------------------------------------------------------------------ DSP kit

type Buf = Float32Array;
const buf = (sec: number): Buf => new Float32Array(Math.ceil(sec * SR));

let seed = 1234567;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const TAU = Math.PI * 2;
const osc = {
  sine: (ph: number) => Math.sin(TAU * ph),
  tri: (ph: number) => 1 - 4 * Math.abs(((ph + 0.25) % 1) - 0.5),
  square: (ph: number) => (ph % 1 < 0.5 ? 1 : -1),
  saw: (ph: number) => 2 * (ph % 1) - 1,
};

/** Add a tone with frequency function f(t) and envelope env(t) at offset. */
const tone = (out: Buf, at: number, dur: number, f: (t: number) => number, env: (t: number) => number, wave: (ph: number) => number = osc.sine, amp = 1) => {
  let ph = 0;
  const start = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n && start + i < out.length; i++) {
    const t = i / SR;
    ph += f(t) / SR;
    out[start + i] += wave(ph) * env(t) * amp;
  }
};

const expDecay = (d: number, attack = 0.004) => (t: number) => (t < attack ? t / attack : Math.exp(-(t - attack) / d));

/** One-pole lowpass (in place) with optional time-varying cutoff. */
const lowpass = (b: Buf, cutoff: number | ((t: number) => number)) => {
  let y = 0;
  for (let i = 0; i < b.length; i++) {
    const fc = typeof cutoff === 'number' ? cutoff : cutoff(i / SR);
    const a = 1 - Math.exp((-TAU * fc) / SR);
    y += a * (b[i] - y);
    b[i] = y;
  }
  return b;
};
const highpass = (b: Buf, cutoff: number) => {
  const lp = lowpass(Float32Array.from(b), cutoff);
  for (let i = 0; i < b.length; i++) b[i] -= lp[i];
  return b;
};

/** RBJ biquad band-pass with time-varying centre. */
const bandpass = (b: Buf, fc: (t: number) => number, q = 1.2) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < b.length; i++) {
    const w = (TAU * Math.min(fc(i / SR), SR * 0.45)) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    const x = b[i];
    // b0 = α, b1 = 0, b2 = −α, a1 = −2cos(w), a2 = 1 − α
    const y = (alpha * x - alpha * x2 + 2 * Math.cos(w) * y1 - (1 - alpha) * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    b[i] = y;
  }
  return b;
};

const noiseBurst = (out: Buf, at: number, dur: number, env: (t: number) => number, amp = 1) => {
  const start = Math.floor(at * SR);
  for (let i = 0; i < dur * SR && start + i < out.length; i++) out[start + i] += noise() * env(i / SR) * amp;
};

/** Karplus-Strong plucked string (pizzicato-ish). */
const pluck = (out: Buf, at: number, freq: number, dur: number, amp = 1, bright = 0.5) => {
  const period = Math.max(2, Math.round(SR / freq));
  const line = new Float32Array(period).map(() => noise());
  lowpass(line, 1500 + bright * 6000);
  const start = Math.floor(at * SR);
  let idx = 0;
  const decay = 0.996;
  for (let i = 0; i < dur * SR && start + i < out.length; i++) {
    const cur = line[idx];
    const next = line[(idx + 1) % period];
    line[idx] = decay * 0.5 * (cur + next);
    const fade = Math.min(1, (dur - i / SR) / 0.05);
    out[start + i] += cur * amp * fade;
    idx = (idx + 1) % period;
  }
};

const normalize = (b: Buf, peak = 0.89) => {
  let m = 0;
  for (const v of b) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < b.length; i++) b[i] *= peak / m;
  return b;
};

/** Loudness-ish normalisation: target RMS (dBFS) with a peak ceiling. */
const normalizeRms = (b: Buf, targetDb = -20, peak = 0.89) => {
  let sum = 0, m = 0;
  for (const v of b) { sum += v * v; m = Math.max(m, Math.abs(v)); }
  const rms = Math.sqrt(sum / b.length);
  if (rms === 0) return b;
  const g = Math.min(Math.pow(10, targetDb / 20) / rms, peak / m);
  for (let i = 0; i < b.length; i++) b[i] *= g;
  return b;
};

const fadeEdges = (b: Buf, fin = 0.003, fout = 0.02) => {
  const ni = fin * SR, no = fout * SR;
  for (let i = 0; i < ni && i < b.length; i++) b[i] *= i / ni;
  for (let i = 0; i < no && i < b.length; i++) b[b.length - 1 - i] *= i / no;
  return b;
};

const writeWav = (path: string, b: Buf) => {
  const data = Buffer.alloc(b.length * 2);
  for (let i = 0; i < b.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(b[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.concat([h, data]));
};

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// ------------------------------------------------------------------ SFX

const SFX_SYNTHS: Record<string, () => Buf> = {
  alarm: () => {
    const b = buf(2.6);
    for (let g = 0; g < 3; g++)
      for (let k = 0; k < 4; k++) {
        const at = g * 0.85 + k * 0.13;
        tone(b, at, 0.085, () => 2050, (t) => (t < 0.005 ? t / 0.005 : t > 0.075 ? (0.085 - t) / 0.01 : 1), osc.square, 0.5);
      }
    return lowpass(b, 5000);
  },
  notify: () => {
    const b = buf(0.5);
    tone(b, 0, 0.35, () => 1318.5, expDecay(0.09), osc.sine, 0.7);
    tone(b, 0.08, 0.4, () => 1760, expDecay(0.12), osc.sine, 0.7);
    tone(b, 0.08, 0.4, () => 3520, expDecay(0.05), osc.sine, 0.12);
    return b;
  },
  keyboard: () => {
    const b = buf(1.8);
    let t = 0.02;
    while (t < 1.75) {
      const a = 0.4 + rnd() * 0.6;
      noiseBurst(b, t, 0.012, expDecay(0.003, 0.0005), a);
      tone(b, t, 0.03, () => 180 + rnd() * 60, expDecay(0.008), osc.sine, a * 0.4);
      t += 0.055 + rnd() * 0.08;
    }
    return highpass(b, 700);
  },
  money: () => {
    const b = buf(1.1);
    const k = buf(0.05);
    noiseBurst(k, 0, 0.04, expDecay(0.01, 0.001));
    bandpass(k, () => 2500, 2);
    b.set(k.map((v) => v * 1.5), 0);
    for (const [at, base] of [[0.06, 2093], [0.14, 2637]] as const)
      for (const [mult, a, d] of [[1, 0.6, 0.35], [2.76, 0.25, 0.18], [5.4, 0.12, 0.08]] as const)
        tone(b, at, 0.9, () => base * mult, expDecay(d), osc.sine, a);
    return b;
  },
  drain: () => {
    const b = buf(1.0);
    tone(b, 0, 0.95, (t) => 900 * Math.pow(0.2, t / 0.95) * (1 + 0.03 * Math.sin(TAU * 7 * t)), (t) => Math.min(1, t / 0.02) * (1 - t / 0.95), osc.tri, 0.8);
    return lowpass(b, 3000);
  },
  impact: () => {
    const b = buf(0.7);
    tone(b, 0, 0.65, (t) => 40 + 70 * Math.exp(-t / 0.05), expDecay(0.18, 0.002), osc.sine, 1);
    const c = buf(0.7);
    noiseBurst(c, 0, 0.05, expDecay(0.012, 0.001), 0.8);
    lowpass(c, 1800);
    for (let i = 0; i < b.length; i++) b[i] += c[i];
    return b;
  },
  whoosh: () => {
    const d = 0.6;
    const b = buf(d);
    noiseBurst(b, 0, d, (t) => Math.pow(Math.sin((Math.PI * t) / d), 2));
    return bandpass(b, (t) => 300 + 2600 * Math.sin((Math.PI * t) / d), 1.4);
  },
  whip: () => {
    const d = 0.28;
    const b = buf(d);
    noiseBurst(b, 0, d, (t) => Math.pow(Math.sin((Math.PI * t) / d), 3));
    return bandpass(b, (t) => 800 + 4200 * (t / d), 1.8);
  },
  pop: () => {
    const b = buf(0.15);
    tone(b, 0, 0.14, (t) => 350 + 900 * Math.min(1, t / 0.04), expDecay(0.04, 0.002), osc.sine, 1);
    return b;
  },
  poof: () => {
    const b = buf(0.6);
    noiseBurst(b, 0, 0.55, expDecay(0.14, 0.01));
    lowpass(b, (t) => 2200 * Math.exp(-t / 0.2) + 300);
    tone(b, 0, 0.3, (t) => 90 - 40 * t, expDecay(0.08), osc.sine, 0.6);
    return b;
  },
  ui_select: () => {
    const b = buf(0.3);
    tone(b, 0, 0.12, () => 880, expDecay(0.05), osc.tri, 0.6);
    tone(b, 0.06, 0.2, () => 1318.5, expDecay(0.08), osc.tri, 0.6);
    return b;
  },
  ui_complete: () => {
    const b = buf(1.1);
    [72, 76, 79, 84].forEach((n, i) => {
      const last = i === 3;
      tone(b, i * 0.075, last ? 1.0 : 0.3, () => midi(n), expDecay(last ? 0.35 : 0.09), osc.tri, 0.5);
      tone(b, i * 0.075, last ? 1.0 : 0.3, () => midi(n + 12), expDecay(last ? 0.25 : 0.06), osc.sine, 0.2);
    });
    return b;
  },
  buzzer: () => {
    const b = buf(0.6);
    const env = (t: number) => (t < 0.01 ? t / 0.01 : t > 0.5 ? Math.max(0, (0.55 - t) / 0.05) : 1);
    tone(b, 0, 0.55, () => 110, env, osc.square, 0.4);
    tone(b, 0, 0.55, () => 116.5, env, osc.square, 0.4);
    return lowpass(b, 1400);
  },
  stamp: () => {
    const b = buf(0.35);
    tone(b, 0, 0.3, (t) => 60 + 90 * Math.exp(-t / 0.03), expDecay(0.07, 0.001), osc.sine, 1);
    const c = buf(0.35);
    noiseBurst(c, 0, 0.06, expDecay(0.015, 0.001), 0.9);
    bandpass(c, () => 1200, 1);
    for (let i = 0; i < b.length; i++) b[i] += c[i];
    return b;
  },
  rumble: () => {
    const b = buf(1.8);
    noiseBurst(b, 0, 1.8, (t) => (t < 0.25 ? t / 0.25 : Math.exp(-(t - 0.25) / 0.5)));
    lowpass(b, 140);
    lowpass(b, 140);
    tone(b, 0, 1.6, () => 42, (t) => (t < 0.2 ? t / 0.2 : Math.exp(-(t - 0.2) / 0.5)), osc.sine, 0.25);
    return b;
  },
  tension: () => {
    const b = buf(3.0);
    const env = (t: number) => Math.min(1, t / 2.2) * Math.min(1, (3 - t) / 0.3);
    tone(b, 0, 3, () => 55, env, osc.saw, 0.5);
    tone(b, 0, 3, () => 58.3, env, osc.saw, 0.5);
    lowpass(b, (t) => 180 + 260 * (t / 3));
    tone(b, 0, 3, () => 880, (t) => env(t) * (0.5 + 0.5 * Math.sin(TAU * 5 * t)), osc.sine, 0.05);
    return b;
  },
  crickets: () => {
    const b = buf(1.6);
    for (const [off, f] of [[0, 4400], [0.23, 4700]] as const)
      for (let t = off; t < 1.5; t += 0.5)
        for (let k = 0; k < 3; k++)
          tone(b, t + k * 0.045, 0.035, () => f, (x) => Math.sin((Math.PI * x) / 0.035), osc.sine, 0.4);
    return b;
  },
  sparkle: () => {
    const b = buf(1.0);
    for (let i = 0; i < 14; i++) {
      const at = rnd() * 0.75;
      tone(b, at, 0.25, () => 2200 + rnd() * 3200, expDecay(0.06), osc.sine, 0.35);
    }
    return b;
  },
  tractor: () => {
    const b = buf(4.0);
    for (let t = 0; t < 3.95; t += 1 / 13) tone(b, t, 0.07, () => 70, expDecay(0.02, 0.001), osc.saw, 0.8);
    const r = buf(4.0);
    noiseBurst(r, 0, 4.0, () => 0.25);
    lowpass(r, 250);
    for (let i = 0; i < b.length; i++) b[i] += r[i];
    return lowpass(b, 900);
  },
  chime: () => {
    const b = buf(2.4);
    for (const [at, base] of [[0, 523.25], [0.13, 783.99]] as const)
      for (const [mult, a, d] of [[1, 0.5, 0.9], [2.0, 0.2, 0.6], [2.76, 0.12, 0.35], [5.4, 0.05, 0.15]] as const)
        tone(b, at, 2.2, () => base * mult, expDecay(d, 0.003), osc.sine, a);
    return b;
  },
  // EP002 cartridge sequence (engine synths, no samples, no copyright)
  cart_slide: () => {
    // plastic on plastic: band-limited friction that rises in pitch as the cartridge goes in
    const d = 0.55;
    const b = buf(d);
    noiseBurst(b, 0, d, (t) => Math.min(1, t / 0.05) * Math.min(1, (d - t) / 0.08) * (0.7 + 0.3 * Math.sin(TAU * 31 * t)));
    bandpass(b, (t) => 900 + 1600 * (t / d), 2.2);
    return b;
  },
  cart_click: () => {
    // the seat: a sharp latch click, then the hollow body thunk of the console
    const b = buf(0.5);
    const c = buf(0.5);
    noiseBurst(c, 0, 0.012, expDecay(0.002, 0.0003), 1);
    bandpass(c, () => 3800, 3);
    noiseBurst(c, 0.018, 0.01, expDecay(0.002, 0.0003), 0.6);
    bandpass(c, () => 2600, 3);
    tone(b, 0.004, 0.3, (t) => 140 + 120 * Math.exp(-t / 0.02), expDecay(0.05, 0.001), osc.sine, 0.8);
    tone(b, 0.004, 0.25, () => 410, expDecay(0.03, 0.001), osc.tri, 0.18);
    for (let i = 0; i < b.length; i++) b[i] += c[i] * 1.4;
    return b;
  },
  tv_on: () => {
    // tube TV power-up: low thunk, static rush that settles, faint high whine
    const d = 1.6;
    const b = buf(d);
    tone(b, 0, 0.4, (t) => 55 + 40 * Math.exp(-t / 0.05), expDecay(0.12, 0.002), osc.sine, 0.9);
    const n = buf(d);
    noiseBurst(n, 0.02, d - 0.02, (t) => 0.5 * Math.exp(-t / 0.35) + 0.05 * Math.min(1, (d - 0.02 - t) / 0.3));
    bandpass(n, (t) => 2500 + 2000 * Math.exp(-t / 0.3), 0.8);
    tone(b, 0.05, d - 0.05, () => 7800, (t) => Math.min(1, t / 0.2) * Math.min(1, (d - 0.05 - t) / 0.3), osc.sine, 0.025);
    for (let i = 0; i < b.length; i++) b[i] += n[i];
    return b;
  },
  fairy_shimmer: () => {
    // the fairy appears: a soft rising bell run with tremolo and a sparkle tail (own sound, not a game's)
    const b = buf(1.8);
    [79, 83, 86, 91, 95].forEach((m, i) =>
      tone(b, i * 0.07, 1.3, () => midi(m), (t) => expDecay(0.35, 0.004)(t) * (0.75 + 0.25 * Math.sin(TAU * 9 * t)), osc.sine, 0.32),
    );
    for (let i = 0; i < 18; i++) tone(b, 0.25 + rnd() * 1.1, 0.2, () => 3000 + rnd() * 4000, expDecay(0.05), osc.sine, 0.12);
    return b;
  },
  fairy_flutter: () => {
    // wing buzz while the fairy flies: fast amplitude-modulated airy noise, loopable
    const d = 2.0;
    const b = buf(d);
    noiseBurst(b, 0, d, (t) => (0.55 + 0.45 * Math.sin(TAU * 38 * t)) * Math.min(1, t / 0.15, (d - t) / 0.15));
    bandpass(b, () => 2400, 1.6);
    tone(b, 0, d, () => 1520, (t) => 0.05 * Math.min(1, t / 0.15, (d - t) / 0.15) * (0.5 + 0.5 * Math.sin(TAU * 38 * t)), osc.sine, 1);
    return b;
  },
  wind: () => {
    const d = 5.5;
    const b = buf(d);
    noiseBurst(b, 0, d, (t) => Math.min(1, t / 0.8) * Math.min(1, (d - t) / 1.2) * (0.6 + 0.4 * Math.sin(TAU * 0.3 * t)));
    return lowpass(b, (t) => 450 + 350 * Math.sin(TAU * 0.17 * t));
  },
};

// ------------------------------------------------------------------ music

/** Light, quirky pizzicato bed: I–vi–IV–V in C at 100 BPM. */
const hookBed = (): Buf => {
  const bpm = 100;
  const beat = 60 / bpm;
  const bars = 20;
  const b = buf(bars * 4 * beat + 2);
  const prog = [
    [48, [60, 64, 67, 72]],
    [45, [57, 60, 64, 69]],
    [41, [53, 57, 60, 65]],
    [43, [55, 59, 62, 67]],
  ] as const;
  const arp = [0, 2, 1, 3, 2, 1, 3, 2];
  const melody = [76, 74, 72, 74, 76, 79, 77, 74]; // gentle top line every other bar
  for (let bar = 0; bar < bars; bar++) {
    const [root, chord] = prog[bar % 4];
    const t0 = bar * 4 * beat;
    // bass
    for (const [pos, len] of [[0, 1.4], [2, 1.0], [3.5, 0.4]] as const)
      tone(b, t0 + pos * beat, len * beat, () => midi(root - 12 + (pos === 3.5 ? 7 : 0)), expDecay(0.28, 0.006), osc.tri, 0.5);
    // pizzicato arpeggio in 8ths
    arp.forEach((ci, k) => pluck(b, t0 + (k * beat) / 2, midi(chord[ci]), 0.5, k % 2 ? 0.28 : 0.38, 0.4));
    // top line on odd bars
    if (bar % 2 === 1 && bar > 2) pluck(b, t0 + beat * 2.5, midi(melody[(bar >> 1) % melody.length]), 0.8, 0.3, 0.7);
    // shaker
    for (let k = 0; k < 8; k++) noiseBurst(b, t0 + (k * beat) / 2, 0.05, expDecay(0.012, 0.004), k % 2 ? 0.1 : 0.05);
    // soft kick on 1 and 3 from bar 2
    if (bar >= 2) for (const pos of [0, 2]) tone(b, t0 + pos * beat, 0.25, (t) => 50 + 60 * Math.exp(-t / 0.03), expDecay(0.08, 0.002), osc.sine, 0.35);
  }
  // pad for body (very low)
  const pad = buf(b.length / SR);
  for (let bar = 0; bar < bars; bar++) {
    const [, chord] = prog[bar % 4];
    const t0 = bar * 4 * beat;
    for (const n of chord.slice(0, 3))
      for (const det of [-0.08, 0.08])
        tone(pad, t0, 4 * beat + 0.05, () => midi(n + det), (t) => Math.min(1, t / 0.4) * Math.min(1, (4 * beat + 0.05 - t) / 0.3), osc.saw, 0.03);
  }
  lowpass(pad, 900);
  for (let i = 0; i < b.length; i++) b[i] += pad[i];
  highpass(b, 30);
  return normalize(fadeEdges(b, 0.01, 1.5), 0.7);
};

/** Warm, still sunset pad with a music-box line. */
const sunset = (): Buf => {
  const d = 9;
  const b = buf(d);
  const chords = [
    [0, [53, 57, 60, 64]],
    [4, [48, 55, 62, 64]],
  ] as const;
  for (const [at, notes] of chords)
    for (const n of notes)
      for (const det of [-0.06, 0.06])
        tone(b, at, 5, () => midi(n + det), (t) => Math.min(1, t / 1.2) * Math.min(1, (5 - t) / 1.2), osc.saw, 0.05);
  lowpass(b, 1100);
  for (const [at, n] of [[0.6, 76], [1.8, 79], [3.0, 81], [4.6, 79], [6.0, 84]] as const) {
    tone(b, at, 2.5, () => midi(n), expDecay(0.7, 0.004), osc.sine, 0.16);
    tone(b, at, 2.5, () => midi(n) * 3, expDecay(0.25, 0.004), osc.sine, 0.03);
  }
  return normalize(fadeEdges(b, 0.05, 2), 0.6);
};

// ------------------------------------------------------------------ write

/** Music generators, keyed by the `placeholder` field of a music cue. Fixed seeds → identical output every run. */
const MUSIC_SYNTHS: Record<string, { seed: number; make: () => Buf }> = {
  bed: { seed: 42, make: hookBed },
  sunset: { seed: 43, make: sunset },
};

const PUBLIC = join(ROOT, 'public');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const onlyEpisode = args[0];
if (onlyEpisode && !EPISODES[onlyEpisode]) {
  console.error(`Unknown episode "${onlyEpisode}". Known: ${Object.keys(EPISODES).join(', ')}`);
  process.exit(1);
}
let wrote = 0;
const skipped: string[] = [];

// --- SFX (shared library)
for (const [id, entry] of Object.entries(SFX.sfx)) {
  const make = SFX_SYNTHS[id];
  const path = join(PUBLIC, entry.src.replace(/^\//, ''));
  if (existsSync(path) && !FORCE) continue;
  if (!make) {
    skipped.push(`sfx "${id}" (no placeholder synth; supply ${entry.src})`);
    continue;
  }
  if (extname(path).toLowerCase() !== '.wav') {
    skipped.push(`sfx "${id}" (placeholder synth writes .wav; catalog expects ${extname(path)})`);
    continue;
  }
  seed = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  writeWav(path, normalizeRms(fadeEdges(make())));
  wrote++;
}

// --- music (per episode, from episode.json)
const rendered = new Map<string, Buf>();
const writeAudio = (path: string, b: Buf) => {
  const ext = extname(path).toLowerCase();
  if (ext === '.wav') return writeWav(path, b);
  const tmp = `${path}.tmp.wav`;
  writeWav(tmp, b);
  const codec = ext === '.mp3' ? ['-codec:a', 'libmp3lame', '-b:a', '192k'] : ['-codec:a', 'aac', '-b:a', '192k'];
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, ...codec, path], { cwd: ROOT, stdio: 'inherit' });
  unlinkSync(tmp);
};

for (const [epId, bundle] of Object.entries(EPISODES)) {
  if (onlyEpisode && epId !== onlyEpisode) continue;
  const root = bundle.episode.assetRoot.replace(/\/$/, '');
  const cues = (bundle.episode.music?.cues ?? []).filter((c): c is MusicTrackCue => c.type !== 'automation');
  for (const cue of cues) {
    const path = cue.src.startsWith('/') ? join(PUBLIC, cue.src.slice(1)) : join(PUBLIC, root, cue.src);
    if (existsSync(path) && !FORCE) continue;
    const gen = cue.placeholder ?? 'bed';
    const synth = MUSIC_SYNTHS[gen];
    if (!synth) {
      skipped.push(`${epId} music "${cue.id}" (unknown placeholder generator "${gen}"; use ${Object.keys(MUSIC_SYNTHS).join(' | ')})`);
      continue;
    }
    if (!['.mp3', '.wav', '.m4a', '.aac'].includes(extname(path).toLowerCase())) {
      skipped.push(`${epId} music "${cue.id}" (unsupported extension ${extname(path)})`);
      continue;
    }
    if (!rendered.has(gen)) {
      seed = synth.seed;
      rendered.set(gen, synth.make());
    }
    mkdirSync(dirname(path), { recursive: true });
    writeAudio(path, rendered.get(gen)!);
    wrote++;
  }
}

console.log(`placeholder audio: ${wrote} file(s) written${FORCE ? ' (forced)' : ''}.`);
for (const s of skipped) console.log(`  skipped ${s}`);
