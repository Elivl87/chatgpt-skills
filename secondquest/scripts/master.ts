/**
 * Final audio mastering for YouTube delivery.
 *
 * Remotion's bundled FFmpeg is a minimal build (no compressor/limiter), and
 * loudnorm's linear mode can't reach -14 LUFS when peaks are high (it silently
 * falls back to "dynamic" pumping). So mastering is done here, deterministically:
 *
 *   1. extract the mix (24-bit WAV)
 *   2. measure integrated loudness (EBU R128 via ffmpeg loudnorm analysis)
 *   3. apply make-up gain + a lookahead peak limiter (JS)
 *   4. re-measure, correct, repeat (≤ 4 passes) until within ±0.3 LU and
 *      true peak ≤ target
 *   5. mux back with the untouched video stream
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { ffmpeg, measureLoudness } from './lib';

interface Pcm {
  sr: number;
  channels: Float32Array[];
}

const readWav24 = (path: string): Pcm => {
  const b = readFileSync(path);
  let off = 12;
  let sr = 48000;
  let ch = 2;
  let bits = 24;
  while (off < b.length) {
    const id = b.toString('ascii', off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      ch = b.readUInt16LE(off + 10);
      sr = b.readUInt32LE(off + 12);
      bits = b.readUInt16LE(off + 22);
    } else if (id === 'data') {
      const bytes = bits / 8;
      const frames = Math.floor(size / (bytes * ch));
      const channels = Array.from({ length: ch }, () => new Float32Array(frames));
      let p = off + 8;
      for (let i = 0; i < frames; i++)
        for (let c = 0; c < ch; c++, p += bytes) channels[c][i] = bits === 24 ? b.readIntLE(p, 3) / 8388608 : b.readInt16LE(p) / 32768;
      return { sr, channels };
    }
    off += 8 + size + (size % 2);
  }
  throw new Error(`No data chunk in ${path}`);
};

const writeWav24 = (path: string, pcm: Pcm) => {
  const ch = pcm.channels.length;
  const frames = pcm.channels[0].length;
  const data = Buffer.alloc(frames * ch * 3);
  let p = 0;
  for (let i = 0; i < frames; i++)
    for (let c = 0; c < ch; c++, p += 3) data.writeIntLE(Math.max(-8388608, Math.min(8388607, Math.round(pcm.channels[c][i] * 8388607))), p, 3);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(pcm.sr, 24);
  h.writeUInt32LE(pcm.sr * ch * 3, 28);
  h.writeUInt16LE(ch * 3, 32);
  h.writeUInt16LE(24, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
};

/** Make-up gain + lookahead brick-wall limiter (linked stereo). */
const limit = (src: Pcm, gainDb: number, ceilingDb: number): Pcm => {
  const g = Math.pow(10, gainDb / 20);
  const ceiling = Math.pow(10, ceilingDb / 20);
  const n = src.channels[0].length;
  const look = Math.round(src.sr * 0.005); // 5 ms lookahead
  const release = Math.exp(-1 / (src.sr * 0.12)); // 120 ms release

  // required gain per sample
  const req = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let peak = 0;
    for (const c of src.channels) peak = Math.max(peak, Math.abs(c[i] * g));
    req[i] = peak > ceiling ? ceiling / peak : 1;
  }
  // forward-looking moving minimum over 2*look (monotonic deque)
  const win = look * 2;
  const minFwd = new Float32Array(n);
  const dq: number[] = [];
  let head = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (dq.length > head && req[dq[dq.length - 1]] >= req[i]) dq.pop();
    dq.push(i);
    while (dq[head] > i + win) head++;
    minFwd[i] = req[dq[head]];
  }
  // smooth attack with a moving average (still ≤ req at the peak), then release
  const out: Float32Array[] = src.channels.map(() => new Float32Array(n));
  let acc = look; // window starts full of unity gain
  let env = 1;
  for (let i = 0; i < n; i++) {
    acc += minFwd[i] - (i >= look ? minFwd[i - look] : 1);
    const avg = acc / look;
    const target = Math.min(avg, minFwd[i]);
    env = target < env ? target : target + (env - target) * release;
    const gi = g * Math.min(env, 1);
    for (let c = 0; c < out.length; c++) out[c][i] = src.channels[c][i] * gi;
  }
  return { sr: src.sr, channels: out };
};

export interface MasterResult {
  integrated: number;
  truePeak: number;
  gainDb: number;
  passes: number;
}

export const masterAudio = (inputMp4: string, outputMp4: string, tmpBase: string, targetI = -14, targetTp = -1.5): MasterResult => {
  const rawWav = `${tmpBase}.mix.wav`;
  const masteredWav = `${tmpBase}.master.wav`;
  ffmpeg(['-y', '-i', inputMp4, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s24le', rawWav]);
  const src = readWav24(rawWav);
  const before = measureLoudness(rawWav);
  let gainDb = targetI - Number(before.input_i);
  let ceilingDb = targetTp - 0.5;
  let result: MasterResult = { integrated: Number(before.input_i), truePeak: Number(before.input_tp), gainDb: 0, passes: 0 };

  for (let pass = 1; pass <= 4; pass++) {
    writeWav24(masteredWav, limit(src, gainDb, ceilingDb));
    const m = measureLoudness(masteredWav);
    const i = Number(m.input_i);
    const tp = Number(m.input_tp);
    result = { integrated: i, truePeak: tp, gainDb, passes: pass };
    const okI = Math.abs(i - targetI) <= 0.3;
    const okTp = tp <= targetTp + 0.05;
    if (okI && okTp) break;
    if (!okTp) ceilingDb -= tp - targetTp + 0.1;
    if (!okI) gainDb += targetI - i;
  }

  ffmpeg(['-y', '-i', inputMp4, '-i', masteredWav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', outputMp4]);
  rmSync(rawWav, { force: true });
  rmSync(masteredWav, { force: true });
  return result;
};
