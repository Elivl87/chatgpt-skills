/**
 * Engine tests (no video rendering).
 *
 *   npm test
 *
 * Covers the production policy (English default, Spanish only on request), the
 * Spanish architecture (without producing a Spanish MP4), pronunciation
 * overrides, ducking maths, timings, clipping of audio sources and the new
 * episode scaffolder. The Kokoro dry-run checks need Python + kokoro-onnx and
 * the model files: set KOKORO_MODEL and KOKORO_VOICES, otherwise they are skipped.
 * Checks on media files (narration/SFX WAVs) are skipped when the files are
 * absent (e.g. source-only packages); configuration checks never depend on them.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { duckGain } from '../src/audio/ducking';
import { localize } from '../src/components/SceneContext';
import { compositionId, episodeLocales, localizeBundle } from '../src/engine/locale';
import { parseVoiceSpec, validateNarrationVoice, validateProduction, validatePronunciation } from '../src/engine/production';
import { resolveCut } from '../src/engine/timeline';
import { validateAllLocales, validateEpisode, validateLocales } from '../src/engine/validate';
import { EPISODES, PRODUCTION, PRONUNCIATION, SFX, SHARED_ASSETS, type EpisodeBundle } from '../src/episodes';
import type { AssetCatalog, EpisodeConfig, ScenesFile, ScriptFile, TimingsFile } from '../src/schema/types';
import { hasPublicFile, PUBLIC, ROOT } from './lib';
import { resolveRenderTarget } from './render-target';
import { episodeFiles, registerEpisodeSource } from './scaffold';

let passed = 0;
let failed = 0;
let skipped = 0;
const test = (name: string, fn: () => void | 'skip') => {
  try {
    if (fn() === 'skip') {
      skipped++;
      console.log(`  - skip  ${name}`);
    } else {
      passed++;
      console.log(`  ✔ ${name}`);
    }
  } catch (e) {
    failed++;
    console.log(`  ✖ ${name}\n      ${(e as Error).message.split('\n').join('\n      ')}`);
  }
};
const group = (title: string) => console.log(`\n${title}`);
const noErrors = (issues: Array<{ level: string; where: string; message: string }>) =>
  assert.deepEqual(issues.filter((i) => i.level === 'error'), [], issues.filter((i) => i.level === 'error').map((i) => `${i.where}: ${i.message}`).join('; '));

/** Minimal PCM WAV reader (16/24-bit) → peak (0..1), clipped-sample count, duration. */
const wavStats = (file: string) => {
  const b = readFileSync(file);
  let off = 12;
  let ch = 1;
  let sr = 48000;
  let bits = 16;
  while (off < b.length) {
    const id = b.toString('ascii', off, off + 4);
    const size = b.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      ch = b.readUInt16LE(off + 10);
      sr = b.readUInt32LE(off + 12);
      bits = b.readUInt16LE(off + 22);
    } else if (id === 'data') {
      const bytes = bits / 8;
      const full = bits === 24 ? 8388607 : 32767;
      let peak = 0;
      let clipped = 0;
      for (let p = off + 8; p + bytes <= off + 8 + size; p += bytes) {
        const v = Math.abs(bits === 24 ? b.readIntLE(p, 3) : b.readInt16LE(p));
        if (v > peak) peak = v;
        if (v >= full) clipped++;
      }
      return { peak: peak / full, clipped, duration: size / (bytes * ch) / sr };
    }
    off += 8 + size + (size % 2);
  }
  throw new Error(`no data chunk in ${file}`);
};

const ep001 = EPISODES.ep001;
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> };

// ---------------------------------------------------------------------------
group('1. Production policy — English is the default output');
test('production.json: default locale en, render default en, config valid', () => {
  assert.equal(PRODUCTION.defaultLocale, 'en');
  assert.equal(PRODUCTION.render.defaultLocale, 'en');
  noErrors(validateProduction(PRODUCTION));
});
test('official English voice is am_michael @ 1.00 (en-us)', () => {
  const v = PRODUCTION.voices.en;
  assert.equal(v.voice, 'am_michael');
  assert.equal(v.speed, 1.0);
  assert.equal(v.lang, 'en-us');
  assert.match(v.status, /official/);
});
test('render target without --locale resolves to English (not explicit)', () => {
  const t = resolveRenderTarget(['ep001', 'hook'], {});
  assert.equal(t.locale, 'en');
  assert.equal(t.explicitLocale, false);
  assert.equal(compositionId(t.episodeId, t.cutId, t.locale, ep001.episode.locale), 'ep001-hook');
});
test('render target with only an episode id picks its cut and English', () => {
  const t = resolveRenderTarget(['ep001'], {});
  assert.deepEqual([t.cutId, t.locale], ['hook', 'en']);
});
test('--locale es is honoured only when explicit; bad values are rejected', () => {
  const t = resolveRenderTarget(['ep001', 'hook'], { locale: 'es' });
  assert.deepEqual([t.locale, t.explicitLocale], ['es', true]);
  assert.throws(() => resolveRenderTarget(['ep001', 'hook'], { locale: true }), /needs a value/);
  assert.throws(() => resolveRenderTarget(['ep001', 'hook'], { locale: 'fr' }), /not available/);
});
test('npm render commands default to English; only render:hook:es asks for Spanish', () => {
  for (const name of ['render', 'render:hook', 'render:hook:4k', 'render:episode']) assert.ok(!pkg.scripts[name].includes('--locale'), `${name} must not pass --locale`);
  assert.ok(pkg.scripts['render:hook:es'].includes('--locale es'));
  assert.ok(!Object.values(pkg.scripts).some((s) => /render/.test(s) && /&&.*--locale/.test(s)), 'no command chains a Spanish render after the default one');
});
test('EP001 master locale is English and its English narration uses the official voice', () => {
  assert.equal(ep001.episode.locale, 'en');
  assert.deepEqual(validateNarrationVoice(PRODUCTION, ep001, 'en', ep001.timings.generatedBy, ep001.timings.tts), []);
});

// ---------------------------------------------------------------------------
group('2. Spanish architecture (validated without rendering a Spanish MP4)');
const es = localizeBundle(ep001, 'es');
test('es is declared, registered and resolves its own narration file', () => {
  assert.ok(episodeLocales(ep001).includes('es'));
  assert.equal(es.episode.narration.audio, 'audio/es/narration.wav');
  assert.ok(ep001.episode.locales?.es, 'declared in episode.json');
  assert.ok(ep001.localized?.es, 'registered in src/episodes/index.ts');
});
test('es script/timings mirror the master cue ids', () => {
  const ids = ep001.script.lines.map((l) => l.id);
  assert.deepEqual(es.script.lines.map((l) => l.id), ids);
  assert.deepEqual(Object.keys(es.timings.cues), ids);
});
test('es scenes are re-timed by the Spanish timings (same scenes, different cadence)', () => {
  const en = resolveCut(ep001, 'hook', SFX, hasPublicFile);
  const esCut = resolveCut(es, 'hook', SFX, hasPublicFile);
  assert.equal(esCut.scenes.length, en.scenes.length);
  const s04 = esCut.scenes.find((s) => s.scene.id === 's04_tractor')!;
  assert.ok(Math.abs(s04.startSec - (es.timings.cues.l04.start - 0.12)) < 1e-9);
  assert.notEqual(esCut.durationInFrames, en.durationInFrames);
  assert.ok(Math.abs(esCut.durationSec - (es.timings.cues.l19.end + 1.25)) < 0.02);
});
test('es validates with no errors (per-locale + localisation checks)', () => {
  for (const { issues } of validateAllLocales(ep001, SHARED_ASSETS, SFX, hasPublicFile)) noErrors(issues);
  noErrors(validateLocales(ep001));
});
test('es narration was generated with the configured Spanish voice, es-419 and overrides', () => {
  const t = es.timings;
  assert.equal(t.tts?.voice, PRODUCTION.voices.es.voice);
  assert.equal(t.tts?.lang, 'es-419');
  assert.ok((t.tts?.overrides ?? 0) >= 1, 'expected at least one pronunciation override applied');
  assert.deepEqual(validateNarrationVoice(PRODUCTION, ep001, 'es', t.generatedBy, t.tts), []);
});
test('on-screen text switches language via LocalText', () => {
  const s11 = ep001.scenes.scenes.find((s) => s.id === 's11_field')!;
  const marker = s11.layers.find((l) => l.type === 'text') as { text: Record<string, string> };
  assert.equal(localize(marker.text, 'en'), 'YOU ARE HERE');
  assert.equal(localize(marker.text, 'es'), 'ESTÁS AQUÍ');
});
test('Spanish voice config parses (id or native blend)', () => {
  parseVoiceSpec(PRODUCTION.voices.es.voice);
  for (const c of PRODUCTION.voices.es.candidates ?? []) parseVoiceSpec(c);
  assert.throws(() => parseVoiceSpec('am_michael:0.4,em_alex:0.5'), /sum to/);
});

// ---------------------------------------------------------------------------
group('3. Pronunciation overrides');
test('shared lexicon is valid for EP001 (en + es)', () => noErrors(validatePronunciation(PRONUNCIATION, ep001, episodeLocales(ep001), 'shared')));
test('malformed override entries are rejected', () => {
  const bad = { es: [{ match: 'x', say: 'a', lang: 'en-us' }, { match: '', phonemes: 'a' }] };
  const errs = validatePronunciation(bad, ep001, ['es'], 't').filter((i) => i.level === 'error');
  assert.equal(errs.length, 2);
});
const model = process.env.KOKORO_MODEL;
const voices = process.env.KOKORO_VOICES;
const dryRun = (extra: string[]) => {
  const r = spawnSync('python3', [join(ROOT, 'tools/tts/placeholder_narration.py'), 'ep001', '--model', model!, '--voices', voices!, '--dry-run', '--json', ...extra], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr.slice(-500));
  return JSON.parse(r.stdout.trim().split('\n').pop()!) as { locale: string; voice: string; lang: string; lines: Array<{ id: string; phonemes: string; overrides: string[] }> };
};
test('TTS dry-run (no --locale) uses English + official voice, no overrides', () => {
  if (!model || !voices || !existsSync(model)) return 'skip';
  const out = dryRun([]);
  assert.deepEqual([out.locale, out.voice, out.lang], ['en', 'am_michael', 'en-us']);
  assert.ok(out.lines.every((l) => l.overrides.length === 0));
});
test('TTS dry-run --locale es applies "Farming Simulator" with English phonemes inside es-419', () => {
  if (!model || !voices || !existsSync(model)) return 'skip';
  const out = dryRun(['--locale', 'es']);
  assert.equal(out.lang, 'es-419');
  const l01 = out.lines.find((l) => l.id === 'l01')!;
  assert.deepEqual(l01.overrides, ['Farming Simulator']);
  assert.ok(l01.phonemes.startsWith('fˈɑːɹmɪŋ'), l01.phonemes); // English vowel/r
  assert.ok(/xwˈeɣo/.test(l01.phonemes), 'rest of the line stays Spanish ("juego")');
});

// ---------------------------------------------------------------------------
group('4. Ducking (narration > SFX > music)');
const cut = resolveCut(ep001, 'hook', SFX, hasPublicFile);
const { duck, speech } = cut.audio;
const mid = (speech[6].start + speech[6].end) / 2; // inside l07
const quiet = speech[5].end + 0.68; // l06→l07 gap 1.0 s: release ends at +0.6, next attack starts at +0.75
test('official duck values applied (music 0.27, SFX 0.62)', () => {
  assert.equal(duck.to, 0.27);
  assert.equal(duck.sfxTo, 0.62);
  assert.equal(duck.to, PRODUCTION.episodeDefaults.music.duck.to);
});
test('music gain = 0.27 under speech, 1.0 after release', () => {
  assert.ok(Math.abs(duckGain(mid, speech, duck) - 0.27) < 1e-9);
  assert.ok(Math.abs(duckGain(quiet, speech, duck) - 1) < 1e-9);
});
test('SFX gain = 0.62 under speech; punchline override duckTo wins', () => {
  assert.ok(Math.abs(duckGain(mid, speech, duck, duck.sfxTo) - 0.62) < 1e-9);
  const punch = ep001.scenes.scenes.flatMap((sc) => sc.sfx ?? []).filter((e) => e.duckTo !== undefined); // data-level: works without audio files
  assert.ok(punch.length >= 5, 'punchline SFX carry duckTo');
  assert.ok(Math.abs(duckGain(mid, speech, duck, 0.9) - 0.9) < 1e-9);
});
test('attack ramps smoothly (no step) before a line', () => {
  const s = speech[6].start - (duck.lookahead ?? 0) - duck.attack / 2;
  const g = duckGain(s, speech, duck);
  assert.ok(g < 1 && g > duck.to, `mid-attack gain ${g}`);
});
test('hierarchy: music volume × duck < SFX duck gain < narration', () => {
  const bed = ep001.episode.music!.cues.find((m) => m.id === 'bed') as { volume: number }; // config-level: works without audio files
  assert.equal(bed.volume, 0.35);
  assert.ok(bed.volume * duck.to < (duck.sfxTo ?? 1) && (duck.sfxTo ?? 1) < 1);
});

// ---------------------------------------------------------------------------
group('5. Timings');
for (const [loc, b] of [['en', ep001], ['es', es]] as const) {
  test(`${loc}: cues ordered, non-overlapping, inside the narration`, () => {
    const cues = b.script.lines.map((l) => b.timings.cues[l.id]);
    cues.forEach((c, i) => {
      assert.ok(c.end > c.start, `cue ${i} has non-positive length`);
      if (i) assert.ok(c.start >= cues[i - 1].end - 1e-6, `cue ${i} overlaps the previous one`);
    });
    assert.ok(cues[cues.length - 1].end <= b.timings.duration + 1e-6);
  });
  test(`${loc}: narration WAV length matches timings.json`, () => {
    const wav = join(PUBLIC, b.episode.assetRoot, b.episode.narration.audio);
    if (!existsSync(wav)) return 'skip'; // source-only packages ship without audio
    const w = wavStats(wav);
    assert.ok(Math.abs(w.duration - b.timings.duration) < 0.05, `wav ${w.duration.toFixed(2)}s vs timings ${b.timings.duration}s`);
  });
}
test('EP001 hook: scenes contiguous, identity beat ends the cut at l19.end + 1.25 s', () => {
  cut.scenes.forEach((s, i) => i && assert.equal(s.from, cut.scenes[i - 1].from + cut.scenes[i - 1].duration));
  assert.ok(Math.abs(cut.durationSec - (ep001.timings.cues.l19.end + 1.25)) < 0.02);
});

// ---------------------------------------------------------------------------
group('6. Clipping (audio sources)');
test('narration WAVs (en, es) peak below 0 dBFS with no clipped samples', () => {
  const present = [ep001, es].filter((b) => existsSync(join(PUBLIC, b.episode.assetRoot, b.episode.narration.audio)));
  if (!present.length) return 'skip'; // source-only packages ship without audio
  for (const b of present) {
    const w = wavStats(join(PUBLIC, b.episode.assetRoot, b.episode.narration.audio));
    assert.ok(w.peak < 0.999 && w.clipped === 0, `${b.episode.narration.audio}: peak ${w.peak}, clipped ${w.clipped}`);
  }
});
test('SFX library WAVs peak below 0 dBFS with no clipped samples', () => {
  const dir = join(PUBLIC, 'shared/sfx');
  const wavs = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.wav')) : [];
  if (!wavs.length) return 'skip';
  for (const f of wavs) {
    const w = wavStats(join(dir, f));
    assert.ok(w.peak < 0.999 && w.clipped === 0, `${f}: peak ${w.peak}, clipped ${w.clipped}`);
  }
});
test('mastering targets: -14 LUFS / -1.5 dBTP', () => assert.deepEqual(PRODUCTION.mastering, { integratedLufs: -14, truePeakDbtp: -1.5 }));

// ---------------------------------------------------------------------------
group('7. New episode scaffolder (official defaults)');
const files = episodeFiles({ id: 'ep998', slug: 'test', title: 'Test' }, PRODUCTION);
const scaffolded: EpisodeBundle = {
  episode: files['episode.json'] as unknown as EpisodeConfig,
  script: files['script.json'] as unknown as ScriptFile,
  timings: files['timings.json'] as unknown as TimingsFile,
  scenes: files['scenes.json'] as unknown as ScenesFile,
  assets: files['assets.json'] as unknown as AssetCatalog,
};
test('new episode is born English, 1080p30, cut "full"', () => {
  const e = scaffolded.episode;
  assert.deepEqual([e.locale, e.fps, e.width, e.height], ['en', 30, 1920, 1080]);
  assert.ok(e.cuts.full);
  assert.equal(e.locales, undefined, 'Spanish is opt-in (npm run add:locale)');
});
test('new episode gets the official mix: duck 0.27 / SFX 0.62, bed 0.35 with placeholder generator', () => {
  const m = scaffolded.episode.music!;
  assert.deepEqual(m.duck, PRODUCTION.episodeDefaults.music.duck);
  const bed = m.cues[0] as { volume: number; placeholder: string; loop: boolean };
  assert.deepEqual([bed.volume, bed.placeholder, bed.loop], [0.35, 'bed', true]);
});
test('new episode takes its voice from production.json (no voice pinned in the script)', () => {
  assert.equal((scaffolded.script as unknown as { placeholderTts: Record<string, unknown> }).placeholderTts.voice, undefined);
  assert.equal(PRODUCTION.voices[scaffolded.episode.locale].voice, 'am_michael');
});
test('new episode validates and resolves; asking for Spanish before add:locale fails loudly', () => {
  noErrors(validateEpisode(scaffolded, SHARED_ASSETS, SFX, () => false));
  const c = resolveCut(scaffolded, 'full', SFX, () => false);
  assert.equal(c.scenes.length, 1);
  assert.throws(() => localizeBundle(scaffolded, 'es'), /not configured/);
});
test('registry insertion is correct and idempotency-guarded', () => {
  const src = readFileSync(join(ROOT, 'src/episodes/index.ts'), 'utf8');
  const out = registerEpisodeSource(src, 'ep998');
  assert.ok(out.includes("import ep998Episode from '../../episodes/ep998/episode.json';"));
  assert.ok(out.includes('  ep998: {') && out.includes('// @locales:ep998'));
  assert.throws(() => registerEpisodeSource(out, 'ep998'), /already registered/);
});

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed ? 1 : 0);
