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
import { resolveTime } from '../src/utils/time';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { duckGain } from '../src/audio/ducking';
import { localize } from '../src/components/SceneContext';
import { compositionId, episodeLocales, localizeBundle } from '../src/engine/locale';
import { parseVoiceSpec, validateNarrationVoice, validateProduction, validatePronunciation, withinMaxOutput } from '../src/engine/production';
import { resolveCut } from '../src/engine/timeline';
import { validateAllLocales, validateEpisode, validateLocales } from '../src/engine/validate';
import { EPISODES, PRODUCTION, PRONUNCIATION, SFX, SHARED_ASSETS, type EpisodeBundle } from '../src/episodes';
import type { AssetCatalog, EpisodeConfig, Layer, Scene, ScenesFile, ScriptFile, TimingsFile } from '../src/schema/types';
import { hasPublicFile, PUBLIC, ROOT } from './lib';
import { resolveRenderTarget } from './render-target';
import { episodeFiles, registerEpisodeSource } from './scaffold';
import { minBackground, validateArtContract, validateArtManifest, type ArtManifest, type ArtManifestEntry, type ImageInfo } from '../src/engine/artContract';
import { intakeParts, MAX_PART_BYTES } from './art-intake';
import { fairyAt, fairyFlap, fairyPath } from '../src/fx/fairy';
import { checkCameraContinuity, resolveContinueStarts, type PlateShot } from '../src/engine/cameraContinuity';
import { checkOriginality, type EpisodeFingerprint, type GroupInput, type OriginalityConfig } from '../src/engine/originality';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { publicImageInfo } from './lib';

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
test('production.json: default locale en, render default en, config valid, every voice official', () => {
  assert.equal(PRODUCTION.defaultLocale, 'en');
  assert.equal(PRODUCTION.render.defaultLocale, 'en');
  assert.deepEqual(validateProduction(PRODUCTION), [], 'no errors and no warnings (all voices official)');
});
test('official English voice is SecondQuest English Voice v1: am_michael @ 1.00 (en-us)', () => {
  const v = PRODUCTION.voices.en;
  assert.equal(v.name, 'SecondQuest English Voice v1');
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
test('official Spanish voice is SecondQuest Spanish Voice v1: am_michael:0.4,em_alex:0.6 @ 1.00 (es-419)', () => {
  const v = PRODUCTION.voices.es;
  assert.deepEqual([v.name, v.status, v.voice, v.speed, v.lang], ['SecondQuest Spanish Voice v1', 'official', 'am_michael:0.4,em_alex:0.6', 1.0, 'es-419']);
  assert.deepEqual(parseVoiceSpec(v.voice), { kind: 'blend', parts: [{ id: 'am_michael', weight: 0.4 }, { id: 'em_alex', weight: 0.6 }] });
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
test('new episode gets the official mix (duck 0.27 / SFX 0.62) and NO music bed — music is off by default', () => {
  const m = scaffolded.episode.music!;
  assert.deepEqual(m.duck, PRODUCTION.episodeDefaults.music.duck);
  assert.equal(PRODUCTION.audio?.music, 'off');
  assert.deepEqual(m.cues, [], 'Narration > SFX > Ambience > Silence: no continuous music unless the Producer asks');
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
group('8. FINAL_ART_ONLY contract (Creative Decisions v1.1)');
const policy = PRODUCTION.art!;
/** Minimal PNG header (signature + IHDR) — enough for the header reader; colorType 6 = RGBA, 2 = RGB. */
const png = (w: number, h: number, colorType = 6) => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  b[24] = 8;
  b[25] = colorType;
  return b;
};
const fin = (over: Partial<ArtManifestEntry> & { key: string; path: string }): ArtManifestEntry => ({
  kind: 'object', library_tier: 'CORE', source: 'FINAL_ART', status: 'APPROVED', required: true, resolution: '2000x2000',
  transparent: true, safe_zoom: 1.35, style_version: 'SecondQuest_2D_v1', used_in: ['EP001'], ...over,
});
/** Writes a package part: art_manifest.json + files (path → PNG buffer). */
const part = (manifest: ArtManifest, files: Record<string, Buffer>) => {
  const dir = mkdtempSync(join(tmpdir(), 'sq-art-'));
  writeFileSync(join(dir, 'art_manifest.json'), JSON.stringify(manifest));
  for (const [p, buf] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), buf);
  }
  return dir;
};
const codes = (m: ArtManifest, files: Record<string, Buffer>, key: string) => {
  const r = intakeParts([part(m, files)]);
  return r.keys[key];
};
const P = (s: string) => `public/art/core/${s}`;

test('policy: FINAL_ART_ONLY, SecondQuest_2D_v1, Quest_v1, root public/art, music off', () => {
  assert.deepEqual([policy.contract, policy.styleVersion, policy.characterVersion, policy.pathRoot], ['FINAL_ART_ONLY', 'SecondQuest_2D_v1', 'Quest_v1', 'art/']);
  assert.deepEqual(policy.safeZoomDefaults, { background: 1.2, character: 1.45, object: 1.35 });
  assert.deepEqual(PRODUCTION.audio?.hierarchy, ['narration', 'sfx', 'ambience', 'silence']);
});
test('intake: a correct FINAL_ART / APPROVED entry is OK', () => {
  const k = codes({ assets: [fin({ key: 'obj.tractor', path: P('objects/tractor.png') })] }, { [P('objects/tractor.png')]: png(2000, 2000) }, 'obj.tractor');
  assert.deepEqual([k.status, k.codes], ['OK', ['OK']]);
});
for (const src of ['STORYBOARD', 'RECOVERED', 'REFERENCE', 'TEMP', 'UPSCALED_STORYBOARD', 'COLLAGE'])
  test(`intake: source ${src} is FORBIDDEN_SOURCE`, () => {
    const k = codes({ assets: [fin({ key: 'x', path: P('x.png'), source: src })] }, { [P('x.png')]: png(2000, 2000) }, 'x');
    assert.equal(k.status, 'REJECTED');
    assert.ok(k.codes.includes('FORBIDDEN_SOURCE'));
  });
test('intake: status other than APPROVED is rejected (NOT_APPROVED)', () => {
  const k = codes({ assets: [fin({ key: 'x', path: P('x.png'), status: 'PENDING_ART' })] }, { [P('x.png')]: png(2000, 2000) }, 'x');
  assert.ok(k.codes.includes('NOT_APPROVED'));
});
test('intake: partial delivery — a manifest entry with no file is PENDING (ASSET_MISSING), others still install', () => {
  const r = intakeParts([part({ assets: [fin({ key: 'a', path: P('a.png') }), fin({ key: 'b', path: P('b.png') })] }, { [P('a.png')]: png(2000, 2000) })]);
  assert.deepEqual([r.keys.a.status, r.keys.b.status, r.keys.b.codes], ['OK', 'PENDING', ['ASSET_MISSING']]);
});
test('intake: file size ≠ declared resolution → BAD_RESOLUTION; background below 2304×1296 → BAD_RESOLUTION', () => {
  assert.ok(codes({ assets: [fin({ key: 'x', path: P('x.png') })] }, { [P('x.png')]: png(1000, 1000) }, 'x').codes.includes('BAD_RESOLUTION'));
  const bg = fin({ key: 'bg', path: P('bg/farm.png'), kind: 'background', resolution: '1920x1080', transparent: false, safe_zoom: 1.2 });
  assert.ok(codes({ assets: [bg] }, { [P('bg/farm.png')]: png(1920, 1080, 2) }, 'bg').codes.includes('BAD_RESOLUTION'));
});
test('intake: declared transparent but no alpha → BAD_TRANSPARENCY', () => {
  assert.ok(codes({ assets: [fin({ key: 'x', path: P('x.png') })] }, { [P('x.png')]: png(2000, 2000, 2) }, 'x').codes.includes('BAD_TRANSPARENCY'));
});
test('intake: swap_set members with different canvases → SWAP_MISMATCH', () => {
  const m = { assets: [fin({ key: 'q1', path: P('s/1.png'), swap_set: 'wake' }), fin({ key: 'q2', path: P('s/2.png'), swap_set: 'wake', resolution: '2000x1800' })] };
  const r = intakeParts([part(m, { [P('s/1.png')]: png(2000, 2000), [P('s/2.png')]: png(2000, 1800) })]);
  assert.ok(r.keys.q1.codes.includes('SWAP_MISMATCH') && r.keys.q2.codes.includes('SWAP_MISMATCH'));
});
test('intake: Quest art must be Quest_v1 → QUEST_VERSION_MISMATCH', () => {
  const q = (v: string) => fin({ key: 'quest.idle', path: 'public/art/core/quest/idle.png', kind: 'character', safe_zoom: 1.45, character_version: v });
  const files = { 'public/art/core/quest/idle.png': png(2000, 2000) };
  assert.ok(codes({ assets: [q('Quest_v0')] }, files, 'quest.idle').codes.includes('QUEST_VERSION_MISMATCH'));
  assert.equal(codes({ assets: [q('Quest_v1')] }, files, 'quest.idle').status, 'OK');
});
test('intake: a background named after Quest (quest_bedroom) is not Quest art — no character_version needed', () => {
  const bg = fin({ key: 'core.bg.quest_bedroom_morning', path: P('backgrounds/quest_bedroom_morning.png'), kind: 'background', resolution: '3840x2160', transparent: false, safe_zoom: 1.2 });
  assert.equal(codes({ assets: [bg] }, { [P('backgrounds/quest_bedroom_morning.png')]: png(3840, 2160, 2) }, bg.key).status, 'OK');
});
test('intake: style_version must be SecondQuest_2D_v1 → STYLE_VERSION_MISMATCH', () => {
  assert.ok(codes({ assets: [fin({ key: 'x', path: P('x.png'), style_version: 'Old' })] }, { [P('x.png')]: png(2000, 2000) }, 'x').codes.includes('STYLE_VERSION_MISMATCH'));
});
test('intake: legacy kit paths (public/episodes/…/kit) fail BAD_PATH; missing fields fail MANIFEST_FIELD', () => {
  const legacy = 'public/episodes/ep001_farming/kit/x.png';
  assert.ok(codes({ assets: [fin({ key: 'x', path: legacy })] }, { [legacy]: png(2000, 2000) }, 'x').codes.includes('BAD_PATH'));
  const { used_in: _u, ...noUsedIn } = fin({ key: 'y', path: P('y.png') });
  assert.ok(codes({ assets: [noUsedIn as ArtManifestEntry] }, { [P('y.png')]: png(2000, 2000) }, 'y').codes.includes('MANIFEST_FIELD'));
});
test('intake: every ZIP part must carry the same manifest; parts > 29.5 MB block the package', () => {
  const a = part({ assets: [fin({ key: 'a', path: P('a.png') })] }, { [P('a.png')]: png(2000, 2000) });
  const b = part({ assets: [fin({ key: 'b', path: P('b.png') })] }, { [P('b.png')]: png(2000, 2000) });
  assert.ok(intakeParts([a, b]).blockers.some((x) => x.startsWith('MANIFEST_MISMATCH')));
  const m = { assets: [fin({ key: 'a', path: P('a.png') }), fin({ key: 'b', path: P('b.png') })] };
  const r = intakeParts([part(m, { [P('a.png')]: png(2000, 2000) }), part(m, { [P('b.png')]: png(2000, 2000) })]);
  assert.deepEqual([r.blockers, r.keys.a.status, r.keys.b.status], [[], 'OK', 'OK'], 'files are resolved across parts');
  assert.ok(intakeParts([a], [MAX_PART_BYTES + 1]).blockers.some((x) => x.startsWith('PART_TOO_LARGE')));
});
test('intake: validateArtManifest is pure (no file → ASSET_MISSING)', () => {
  const issues = validateArtManifest({ assets: [fin({ key: 'x', path: P('x.png') })] }, policy, () => undefined);
  assert.deepEqual(issues.map((i) => i.code), ['ASSET_MISSING']);
});

// render gate on a synthetic episode (no files on disk: fileInfo is stubbed)
const gateBundle = (zoomAmount: number, questFileH = 2000): [EpisodeBundle, (p: string) => ImageInfo | undefined] => {
  const b = structuredClone(scaffolded);
  b.scenes.scenes[0].camera = { moves: [{ type: 'push_in', amount: zoomAmount }] } as typeof b.scenes.scenes[0]['camera'];
  const c = { source: 'FINAL_ART', status: 'APPROVED', library_tier: 'EPISODE', required: true, style_version: 'SecondQuest_2D_v1', used_in: ['EP998'] };
  b.assets = { assets: {
    'ep998.bg_intro': { ...c, path: '/art/episodes/ep998/bg.png', kind: 'background', aspect: 1.7778, resolution: '3840x2160', transparent: false, safe_zoom: 1.2, label: 'bg' },
    'quest.excited': { ...c, path: '/art/core/quest/excited.png', kind: 'character', aspect: 1, resolution: `${questFileH}x${questFileH}`, transparent: true, safe_zoom: 1.45, character_version: 'Quest_v1', character: 'quest', label: 'q' },
  } } as unknown as AssetCatalog;
  const files: Record<string, ImageInfo> = { 'art/episodes/ep998/bg.png': { width: 3840, height: 2160, alpha: false }, 'art/core/quest/excited.png': { width: questFileH, height: questFileH, alpha: true } };
  return [b, (p) => files[p]];
};
const gate = (b: EpisodeBundle, fi: (p: string) => ImageInfo | undefined) => validateArtContract(b, SHARED_ASSETS, SFX, PRODUCTION, fi);
test('render gate: FINAL_ART episode within safe_zoom passes (OK)', () => {
  const [b, fi] = gateBundle(0.06);
  assert.deepEqual(gate(b, fi).filter((i) => i.level === 'error'), []);
});
test('render gate: a camera push beyond safe_zoom → SAFE_ZOOM (no upscaling workaround)', () => {
  const [b, fi] = gateBundle(1.0);
  const keys = gate(b, fi).filter((i) => i.code === 'SAFE_ZOOM').map((i) => i.key).sort();
  assert.deepEqual(keys, ['ep998.bg_intro', 'quest.excited']);
});
test('render gate: art drawn taller than the file → BAD_RESOLUTION', () => {
  const [b, fi] = gateBundle(0.06, 400);
  assert.ok(gate(b, fi).some((i) => i.code === 'BAD_RESOLUTION' && i.key === 'quest.excited'));
});
test('render gate: backgrounds are sized for 1080p — 2k (2688x1520) passes, below 2304x1296 → BAD_RESOLUTION', () => {
  const [b] = gateBundle(0.06);
  const bg = b.assets.assets['ep998.bg_intro'] as unknown as Record<string, unknown>;
  const run = (w: number, h: number) => {
    bg.resolution = `${w}x${h}`;
    const files: Record<string, ImageInfo> = { 'art/episodes/ep998/bg.png': { width: w, height: h, alpha: false }, 'art/core/quest/excited.png': { width: 2000, height: 2000, alpha: true } };
    return gate(b, (p) => files[p]).filter((i) => i.level === 'error' && i.code === 'BAD_RESOLUTION' && i.key === 'ep998.bg_intro');
  };
  assert.deepEqual(minBackground(PRODUCTION.art!), [2304, 1296]);
  assert.deepEqual(run(2688, 1520), []);
  assert.equal(run(2048, 1152).length, 1);
});
test('max output is 1080p in either orientation — 1920x1080 and 1080x1920 (Shorts) pass, 4K does not', () => {
  const max = PRODUCTION.art!.maxOutput;
  assert.ok(withinMaxOutput(1920, 1080, max));
  assert.ok(withinMaxOutput(1080, 1920, max));
  assert.ok(!withinMaxOutput(3840, 2160, max));
  assert.ok(!withinMaxOutput(2160, 3840, max));
});
test('camera continuity: back-to-back scenes on the same plate never snap back (Producer rule)', () => {
  const cam = (zoom: number, x = 0.5, y = 0.5) => ({ zoom, x, y, rotation: 0 });
  const shot = (sceneId: string, plate: string, start: ReturnType<typeof cam>, end: ReturnType<typeof cam>): PlateShot => ({ sceneId, plate, start, end });
  const codes = (shots: PlateShot[]) => checkCameraContinuity(shots).map((i) => `${i.sceneId}:${i.code}`);
  // consecutive: continuing the camera passes, a clearly new shot passes, a small snap back fails
  assert.deepEqual(codes([shot('a', 'p', cam(1), cam(1.08)), shot('b', 'p', cam(1.08), cam(1.15))]), []);
  assert.deepEqual(codes([shot('a', 'p', cam(1), cam(1.08)), shot('b', 'p', cam(1.4, 0.4), cam(1.4, 0.6))]), []);
  assert.deepEqual(codes([shot('a', 'p', cam(1), cam(1.08)), shot('b', 'p', cam(1), cam(1.08))]), ['b:CAMERA_JUMP']);
  // a plate that returns later (not back to back) is free
  assert.deepEqual(codes([shot('a', 'p', cam(1), cam(1.08)), shot('x', 'q', cam(1), cam(1.08)), shot('c', 'p', cam(1), cam(1.08))]), []);
});
test('originality M1–M9: repeated art/recipes/situations warn; IP in thumbnails and made-for-kids block', () => {
  const cfg = JSON.parse(readFileSync(join(ROOT, 'shared/originality.json'), 'utf8')).config as OriginalityConfig;
  const scene = (id: string, art: string[], recipe: string) => ({ id, seconds: 10, art, recipe, cameraMove: 'push_in', isStatic: false, isSlideshow: true });
  const ep = (id: string, art: string): EpisodeFingerprint => ({ id, seconds: 40, scenes: ['a', 'b', 'c', 'd'].map((k, i) => scene(`${id}${k}`, [art], `cut|push_in|image,${i}`)) });
  const meta = { game: 'Game One', title: 'Game One: Why Millions Play It', description: 'one two three four five six seven', madeForKids: false, thumbnails: [{ file: 't.jpg', thirdParty: 'none' as const, logos: false, officialArt: false }] };
  const prev: GroupInput = { group: 'EP001', episodes: [ep('e1', 'bg.farm')], questSituations: [{ situation: 'buys a tractor', outcome: 'amazed' }], metadata: meta };
  const codes = (g: GroupInput) => checkOriginality(g, [prev], cfg).filter((i) => i.level !== 'info').map((i) => `${i.check}:${i.level}`);
  // a copy of the previous episode: reused art, same recipes, same Quest situation
  const copy: GroupInput = { group: 'EP002', episodes: [ep('e2', 'bg.farm')], questSituations: [{ situation: 'Buys a tractor', outcome: 'amazed' }] };
  const c = codes(copy);
  for (const want of ['M1:warn', 'M2:error', 'M3:warn', 'M4:warn', 'M5:warn']) assert.ok(c.includes(want), `missing ${want} in ${c}`);
  // IP in the thumbnail and made-for-kids are blockers
  const bad: GroupInput = { group: 'EP002', episodes: [], questSituations: [{ situation: 'x', outcome: 'y' }], metadata: { ...meta, game: 'Game Two', title: 'Game Two: Why Millions Play It', description: 'a completely different description of another game', madeForKids: true, thumbnails: [{ file: 't.jpg', thirdParty: 'replica', logos: true, officialArt: false }] } };
  const b = codes(bad);
  assert.ok(b.includes('M8:error') && b.includes('M9:error'), `${b}`);
  assert.ok(!b.includes('M7:warn'), 'two episodes with the same title formula are still allowed');
});
test('camera "continue" starts exactly where the previous scene ended', () => {
  const sc = (id: string, camera: Scene['camera']): Scene => ({ id, start: 0, camera, layers: [] });
  const out = resolveContinueStarts(
    [sc('a', { start: { zoom: 1 }, moves: [{ type: 'push_in', amount: 0.1 }] }), sc('b', { start: 'continue', moves: [{ type: 'push_in', amount: 0.1 }] }), sc('c', { start: 'continue' })],
    () => ({ toSec: (e) => (typeof e === 'number' ? e : 0), dur: 4 }),
  );
  const zb = (out[1].camera!.start as { zoom: number }).zoom;
  const zc = (out[2].camera!.start as { zoom: number }).zoom;
  assert.ok(Math.abs(zb - 1.1) < 1e-6, `b starts at ${zb}`);
  assert.ok(Math.abs(zc - 1.21) < 1e-6, `c starts at ${zc}`);
});
test('word anchors: "l12.w2" / "l12.w2.end+0.1" resolve to the word timings; bad index throws', () => {
  const cues = { l12: { start: 1, end: 3, words: [{ w: 'Because', start: 1, end: 1.4 }, { w: 'smaller.', start: 1.5, end: 2.2 }] } };
  assert.equal(resolveTime('l12.w2', { cues }), 1.5);
  assert.ok(Math.abs(resolveTime('l12.w2.end+0.1', { cues }) - 2.3) < 1e-9);
  assert.equal(resolveTime('l12.end', { cues }), 3);
  assert.throws(() => resolveTime('l12.w3', { cues }));
  assert.throws(() => resolveTime('scene.w1', { cues, sceneStart: 0 }));
});
test('art QC v2 (recommendations only): flags a painted checkerboard and a baked light background; a clean cut-out has none', () => {
  const py = `
import numpy as np, sys, tempfile, os
from PIL import Image
sys.path.insert(0, 'tools/qc'); import art_qc
d = tempfile.mkdtemp()
def save(name, a): p = os.path.join(d, name); Image.fromarray(a).save(p); return p
yy, xx = np.mgrid[0:400, 0:400]
clean = np.zeros((400, 400, 4), np.uint8); clean[80:320, 80:320] = [200, 40, 40, 255]
clean[78:80, 80:320, 3] = 128; clean[320:322, 80:320, 3] = 128; clean[80:320, 78:80, 3] = 128; clean[80:320, 320:322, 3] = 128
chk = clean.copy(); m = (yy >= 120) & (yy < 280) & (xx >= 120) & (xx < 280)
chk[m] = np.where((((yy // 16) + (xx // 16)) % 2 == 0)[m][:, None], [255, 255, 255, 255], [204, 204, 204, 255])
baked = clean.copy(); baked[:, :, :3] = np.where(baked[:, :, 3:] == 0, 250, baked[:, :, :3]); baked[:, :40, 3] = 255; baked[:, 360:, 3] = 255; baked[:40, :, 3] = 255
codes = lambda a, n: sorted({i['code'] for i in art_qc.check(save(n, a), 'object') if i['level'] == 'error'})
print(codes(clean, 'c.png'), codes(chk, 'k.png'), codes(baked, 'b.png'))
`;
  const r = spawnSync('python3', ['-c', py], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "[] ['CHECKERBOARD'] ['BAKED_BACKGROUND']");
});
test('layer schema: missing required keys, typos and a counter without steps are caught', () => {
  const b = structuredClone(EPISODES.ep001full) as EpisodeBundle;
  const sc = b.scenes.scenes[0];
  sc.layers = [
    ...sc.layers,
    { type: 'counter', initial: 0 } as unknown as Layer,
    { type: 'rect', w: 0.2, h: 0.1, colour: '#fff' } as unknown as Layer,
    { type: 'counter', initial: 5, steps: [] } as unknown as Layer,
  ];
  const msgs = validateEpisode(b, SHARED_ASSETS, SFX, () => true).map((i) => `${i.level}:${i.message}`);
  assert.ok(msgs.some((m) => m === 'error:counter layer is missing required "steps"'), msgs.join('\n'));
  assert.ok(msgs.some((m) => m === 'error:rect layer is missing required "color"'));
  assert.ok(msgs.some((m) => m.startsWith('warn:unknown key "colour"')));
  assert.ok(!msgs.some((m) => m.includes('must be a list')), 'an empty steps list is a valid static counter');
});
test('credit preflight: prompt lint blocks third-party characters, missing Quest identity and opaque cut-outs', () => {
  const py = `
import sys; sys.path.insert(0, 'tools/credits'); import credits
q = 'The SAME cartoon character as in the reference images (Quest_v1): young man, dark brown curly hair, light freckles. Outfit: plain red hoodie; blue denim jeans; RED canvas sneakers. Bold ink outlines. Upper body.'
print(len(credits.lint(q, 'character', 1, 'default', True)[0]), len(credits.lint(q, 'character', 0, 'default', False)[0]), len(credits.lint('Link and Navi in a field', 'background')[0]), len(credits.lint('a grassy field near a temple of time', 'background')[0]))
`;
  const r = spawnSync('python3', ['-c', py], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), '0 2 2 0');
});
test('render gate: missing file → ASSET_MISSING with exact path', () => {
  const [b] = gateBundle(0.06);
  const miss = gate(b, () => undefined).filter((i) => i.code === 'ASSET_MISSING');
  assert.ok(miss.some((i) => i.message === 'ASSET_MISSING: quest.excited (public/art/core/quest/excited.png)'));
});
test('render gate: music cues without producerApproved → MUSIC_POLICY', () => {
  const [b, fi] = gateBundle(0.06);
  b.episode.music = { ...b.episode.music!, cues: [{ id: 'bed', src: 'x.wav', start: 0, end: 'l01.end', volume: 0.35 }] } as typeof b.episode.music;
  assert.ok(gate(b, fi).some((i) => i.code === 'MUSIC_POLICY'));
  b.episode.music!.producerApproved = true;
  assert.ok(!gate(b, fi).some((i) => i.code === 'MUSIC_POLICY'));
});
test('render gate: legacy art is never auto-certified — the legacy ep001 hook stays BLOCKED (NOT_FINAL_ART)', () => {
  const issues = gate(EPISODES.ep001, publicImageInfo).filter((i) => i.level === 'error');
  assert.ok(issues.some((i) => i.code === 'NOT_FINAL_ART'), 'legacy art must be reported as NOT_FINAL_ART');
});
test('render gate: EP001 (ep001full) rewired to V3 CLEAN FINAL_ART passes — every image FINAL_ART, within safe_zoom, no music', () => {
  if (!existsSync(join(PUBLIC, 'art'))) return 'skip'; // FINAL_ART binaries are installed by art:intake, not versioned
  const issues = gate(EPISODES.ep001full, publicImageInfo).filter((i) => i.level === 'error');
  assert.deepEqual(issues.map((i) => `${i.code} ${i.key} ${i.where}`), []);
});

test('fairy actor: path holds at the ends, passes through keys, wings stay open', () => {
  const keys = [{ t: 1, x: 0.8, y: 0.3 }, { t: 2, x: 0.5, y: 0.5 }, { t: 3, x: 0.2, y: 0.4 }];
  assert.deepEqual(fairyPath(keys, 0), { x: 0.8, y: 0.3 });
  assert.deepEqual(fairyPath(keys, 9), { x: 0.2, y: 0.4 });
  const mid = fairyPath(keys, 2);
  assert.ok(Math.abs(mid.x - 0.5) < 1e-9 && Math.abs(mid.y - 0.5) < 1e-9);
  for (let t = 0; t < 2; t += 0.01) assert.ok(fairyFlap(t) >= 0.2 - 1e-9 && fairyFlap(t) <= 1 + 1e-9);
  assert.ok(Math.abs(fairyAt(keys, 2).y - 0.5) <= 0.0121);
});

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed ? 1 : 0);
