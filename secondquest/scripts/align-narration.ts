/**
 * Align a real narration recording to script.json → timings.json.
 *
 *   npm run narration:align -- ep001
 *   npm run narration:align -- ep001 --silence 0.04 --noise -38 --normalize
 *
 * How it works: FFmpeg silencedetect finds the pauses; the speech runs between
 * them are aligned to script lines with a text-aware dynamic program (expected
 * duration ∝ characters): mid-line pauses are merged into their line, and
 * lines spoken without a pause are split proportionally. Lines split that way
 * are approximate to ~0.1-0.2 s — nudge timings.json by hand if a gag needs a
 * frame-exact hit (or use a forced aligner, see README).
 *
 * --normalize  first loudness-normalises the file to -20 LUFS in place
 *              (original kept as *.original.wav) so every episode's voice sits
 *              at the same level against music and SFX.
 *
 * Every scene is anchored to these cues, so after aligning, the whole edit
 * follows the new performance automatically. Always check with `npm run validate`.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EPISODES } from '../src/episodes';
import type { TimingsFile } from '../src/schema/types';
import { ffmpeg, measureLoudness, parseArgs, PUBLIC, ROOT } from './lib';

type Span = { start: number; end: number };

/**
 * Text-aware alignment of speech segments to script lines (dynamic programming).
 *
 * Segments are split at every micro-pause (≈ word gaps), so every plausible
 * line boundary is a candidate. Each line takes a contiguous group of
 * segments; the cost prefers groups whose duration matches the line's
 * character count and heavily penalises long pauses INSIDE a line — so line
 * breaks land on the real pauses. If the narrator gives no pause at all
 * between lines, the group is split proportionally (fallback, penalised).
 */
export const alignRuns = (segs: Span[], texts: string[]): Span[] | null => {
  const chars = texts.map((t) => Math.max(1, t.replace(/[^\p{L}\p{N}]/gu, '').length));
  const totalChars = chars.reduce((a, c) => a + c, 0);
  const R = segs.length;
  const N = texts.length;
  // duration model: per-line overhead + per-character time, fitted to this take
  let speech = segs[R - 1].end - segs[0].start;
  for (let q = 0; q < R - 1; q++) speech -= Math.max(0, segs[q + 1].start - segs[q].end - 0.25);
  const OVERHEAD = 0.3;
  const perChar = Math.max(0.03, (speech - OVERHEAD * N) / totalChars);
  const expected = chars.map((c) => OVERHEAD + c * perChar);
  const err = (dur: number, exp: number) => 4 * Math.pow((dur - exp) / (exp + 0.5), 2);
  const gap = (q: number) => segs[q + 1].start - segs[q].end;
  const INF = Number.POSITIVE_INFINITY;
  const dp = Array.from({ length: R + 1 }, () => new Array<number>(N + 1).fill(INF));
  const back: Array<Array<{ i: number; j: number } | null>> = Array.from({ length: R + 1 }, () => new Array(N + 1).fill(null));
  dp[0][0] = 0;
  for (let i = 0; i < R; i++)
    for (let j = 0; j < N; j++) {
      if (dp[i][j] === INF) continue;
      let inner = 0;
      for (let k = 1; i + k <= R; k++) {
        if (k > 1) {
          const g = gap(i + k - 2);
          inner += Math.max(0, g - 0.15) * 4 + (g > 0.6 ? 3 : 0); // long pauses are almost always line breaks
        }
        const dur = segs[i + k - 1].end - segs[i].start;
        if (dur > expected[j] * 3 + 2) break;
        const c = dp[i][j] + err(dur, expected[j]) + inner;
        if (c < dp[i + k][j + 1]) {
          dp[i + k][j + 1] = c;
          back[i + k][j + 1] = { i, j };
        }
        // fallback: this group holds several lines spoken without any pause
        let exp = expected[j];
        for (let m = 2; m <= 3 && j + m <= N; m++) {
          exp += expected[j + m - 1];
          const c2 = dp[i][j] + err(dur, exp) + inner + 1.5 * (m - 1);
          if (c2 < dp[i + k][j + m]) {
            dp[i + k][j + m] = c2;
            back[i + k][j + m] = { i, j };
          }
        }
      }
    }
  if (dp[R][N] === INF) return null;
  const out: Span[] = new Array(N);
  let i = R;
  let j = N;
  while (i > 0 || j > 0) {
    const b = back[i][j]!;
    const span = { start: segs[b.i].start, end: segs[i - 1].end };
    const total = chars.slice(b.j, j).reduce((a, c) => a + c, 0);
    let t = span.start;
    for (let q = b.j; q < j; q++) {
      const d = ((span.end - span.start) * chars[q]) / total;
      out[q] = { start: t, end: q === j - 1 ? span.end : t + d };
      t += d;
    }
    i = b.i;
    j = b.j;
  }
  return out;
};

const main = () => {
  const { positional, flags } = parseArgs();
  const episodeId = positional[0] ?? 'ep001';
  const bundle = EPISODES[episodeId];
  if (!bundle) throw new Error(`Unknown episode ${episodeId}`);
  const rel = bundle.episode.narration.audio;
  const wav = join(PUBLIC, bundle.episode.assetRoot, rel);
  if (!existsSync(wav)) throw new Error(`Narration not found: ${wav}`);
  const minSilence = Number(flags.silence ?? 0.04);
  const noise = Number(flags.noise ?? -35);

  if (flags.normalize) {
    const original = wav.replace(/\.wav$/, '.original.wav');
    if (!existsSync(original)) copyFileSync(wav, original);
    const m = measureLoudness(original);
    const gain = -20 - Number(m.input_i);
    ffmpeg(['-y', '-i', original, '-af', `volume=${gain.toFixed(2)}dB`, '-ar', '48000', '-c:a', 'pcm_s24le', wav]);
    console.log(`Normalised narration ${m.input_i} → -20 LUFS (gain ${gain.toFixed(1)} dB)`);
  }

  const log = ffmpeg(['-i', wav, '-af', `silencedetect=noise=${noise}dB:d=${minSilence}`, '-f', 'null', '-'], { capture: true });
  const duration = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(log)?.slice(1).reduce((acc, v, i) => acc + Number(v) * [3600, 60, 1][i], 0) ?? 0);
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));

  // speech runs = complement of silences
  const runs: Span[] = [];
  let cursor = 0;
  starts.forEach((s, i) => {
    if (s - cursor > 0.05) runs.push({ start: cursor, end: s });
    cursor = ends[i] ?? duration;
  });
  if (duration - cursor > 0.05) runs.push({ start: cursor, end: duration });

  const lines = bundle.script.lines;
  const cues = alignRuns(runs, lines.map((l) => (typeof l.text === 'string' ? l.text : Object.values(l.text)[0])));
  if (!cues) {
    console.error(`Could not align ${runs.length} speech segments to ${lines.length} lines. Try --noise -30 (noisy room) or --noise -45 (quiet).`);
    process.exit(1);
  }

  const previous = JSON.parse(readFileSync(join(ROOT, 'episodes', episodeId, 'timings.json'), 'utf8')) as TimingsFile;
  const timings: TimingsFile = {
    source: rel,
    generatedBy: `silence-align (d=${minSilence}s, noise=${noise}dB)`,
    duration: Number(duration.toFixed(3)),
    cues: Object.fromEntries(
      lines.map((l, i) => [l.id, { start: Number(cues[i].start.toFixed(3)), end: Number(cues[i].end.toFixed(3)), text: typeof l.text === 'string' ? l.text : Object.values(l.text)[0] }]),
    ),
  };
  writeFileSync(join(ROOT, 'episodes', episodeId, 'timings.json'), JSON.stringify(timings, null, 2) + '\n');

  console.log(`Aligned ${lines.length} lines (${duration.toFixed(2)}s). Δ vs previous timings:`);
  for (const l of lines) {
    const a = previous.cues[l.id];
    const b = timings.cues[l.id];
    console.log(`  ${l.id}  ${b.start.toFixed(2)}–${b.end.toFixed(2)}s${a ? `  (${b.start - a.start >= 0 ? '+' : ''}${(b.start - a.start).toFixed(2)}s)` : ''}`);
  }
  console.log('\nNext: npm run validate && npm run stills');
};

main();
