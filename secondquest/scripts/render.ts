/**
 * Single-command render: validate → render → loudness-normalise → final MP4.
 *
 * POLICY: English (shared/production.json → defaultLocale) is the production and
 * default output language. Other locales render ONLY with an explicit --locale.
 *
 *   npm run render:hook                              # ep001 hook, English, 1080p
 *   npm run render:episode -- ep002                  # an episode's "full" cut, English
 *   npm run render -- ep001 hook --version v2        # any episode / cut
 *   npm run render -- ep001 hook --scale 2           # 3840x2160 (blocked while art.maxOutput is 1080p)
 *   npm run render -- ep001 hook --frames 0-299      # partial (fast checks)
 *   npm run render -- ep001 hook --locale es         # Spanish — explicit request only
 *
 * Output: renders/<cut.output>[_<locale>]_<version>[_4k].mp4  (no locale suffix for the master language)
 *
 * Audio is mastered to YouTube's reference loudness (-14 LUFS integrated,
 * ≤ -1.5 dBTP) by scripts/master.ts; the video stream is copied untouched.
 */
import { renderMedia } from '@remotion/renderer';
import { mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { compositionId, localeSuffix, localizeBundle } from '../src/engine/locale';
import { withinMaxOutput } from '../src/engine/production';
import { EPISODES, PRODUCTION } from '../src/episodes';
import { parseArgs, ROOT } from './lib';
import { masterAudio } from './master';
import { prepare } from './remotion';
import { describeTarget, resolveRenderTarget } from './render-target';
import { runValidation } from './validate';

const TARGET_I = PRODUCTION.mastering.integratedLufs; // -14 LUFS (YouTube reference)
const TARGET_TP = PRODUCTION.mastering.truePeakDbtp; // -1.5 dBTP

const main = async () => {
  const { positional, flags } = parseArgs();
  const target = resolveRenderTarget(positional, flags); // English unless --locale is explicit
  const { episodeId, cutId } = target;
  const version = String(flags.version ?? 'v1');
  const scale = Number(flags.scale ?? 1);
  const base = EPISODES[episodeId];
  const locale = target.locale === base.episode.locale ? undefined : target.locale;
  const bundle = localizeBundle(base, locale);
  const cut = bundle.episode.cuts[cutId];
  console.log(`Target: ${describeTarget(target)}`);

  if (!runValidation(episodeId, true)) {
    console.error('\nValidation failed — fix the errors above (npm run validate).');
    process.exit(1);
  }

  const maxOut = PRODUCTION.art?.maxOutput;
  const outW = base.episode.width * scale;
  const outH = base.episode.height * scale;
  if (maxOut && !withinMaxOutput(outW, outH, maxOut)) {
    console.error(`\nOutput ${outW}x${outH} exceeds the channel maximum ${maxOut[0]}x${maxOut[1]} in either orientation (shared/production.json art.maxOutput): the art is only certified up to that size.`);
    process.exit(1);
  }

  const suffix = scale === 2 ? '_4k' : scale !== 1 ? `_x${scale}` : '';
  const name = `${cut.output}${localeSuffix(base, locale)}_${version}${suffix}`;
  const finalPath = join(ROOT, 'renders', `${name}.mp4`);
  const tmpDir = join(ROOT, 'renders/tmp');
  mkdirSync(tmpDir, { recursive: true });
  const rawPath = join(tmpDir, `${name}.raw.mp4`);

  const inputProps = { episodeId, cutId, locale: target.locale };
  const { serveUrl, composition, browserExecutable } = await prepare(compositionId(episodeId, cutId, locale, base.episode.locale), inputProps);
  const frameRange = typeof flags.frames === 'string' ? (flags.frames.split('-').map(Number) as [number, number]) : null;
  console.log(
    `Rendering ${composition.id}: ${composition.width * scale}x${composition.height * scale} @ ${composition.fps}fps, ` +
      `${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(2)}s)`,
  );

  const started = Date.now();
  let lastPct = -10;
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: 'h264',
    crf: 18,
    pixelFormat: 'yuv420p',
    colorSpace: 'bt709',
    imageFormat: 'jpeg',
    jpegQuality: 92,
    audioCodec: 'aac',
    audioBitrate: '320k',
    scale,
    frameRange,
    outputLocation: rawPath,
    browserExecutable,
    concurrency: flags.concurrency ? Number(flags.concurrency) : null,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= lastPct + 10) {
        lastPct = pct;
        process.stdout.write(`  ${pct}%\n`);
      }
    },
  });
  console.log(`Rendered in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  // ---- mastering: loudness to YouTube reference + true-peak limiting
  const normPath = join(tmpDir, `${name}.norm.mp4`);
  const r = masterAudio(rawPath, normPath, join(tmpDir, name), TARGET_I, TARGET_TP);
  renameSync(normPath, finalPath);
  if (!flags['keep-raw']) rmSync(rawPath, { force: true });
  console.log(`Mastered: ${r.integrated.toFixed(1)} LUFS integrated, ${r.truePeak.toFixed(1)} dBTP (gain ${r.gainDb >= 0 ? '+' : ''}${r.gainDb.toFixed(1)} dB, ${r.passes} pass(es))`);
  const mb = (statSync(finalPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n✔ ${finalPath.replace(ROOT + '/', '')}  (${mb} MB)`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
