/**
 * Single-command render: validate → render → loudness-normalise → final MP4.
 *
 *   npm run render:hook                              # ep001 hook, 1080p
 *   npm run render -- ep001 hook --version v2        # any episode / cut
 *   npm run render -- ep001 hook --scale 2           # 3840x2160
 *   npm run render -- ep001 hook --frames 0-299      # partial (fast checks)
 *
 * Output: renders/<cut.output>_<version>[_4k].mp4
 * Audio is mastered to YouTube's reference loudness (-14 LUFS integrated,
 * ≤ -1.5 dBTP) by scripts/master.ts; the video stream is copied untouched.
 */
import { renderMedia } from '@remotion/renderer';
import { mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { EPISODES } from '../src/episodes';
import { parseArgs, ROOT } from './lib';
import { masterAudio } from './master';
import { prepare } from './remotion';
import { runValidation } from './validate';

const TARGET_I = -14;
const TARGET_TP = -1.5;

const main = async () => {
  const { positional, flags } = parseArgs();
  const episodeId = positional[0] ?? 'ep001';
  const cutId = positional[1] ?? 'hook';
  const version = String(flags.version ?? 'v1');
  const scale = Number(flags.scale ?? 1);
  const bundle = EPISODES[episodeId];
  if (!bundle) throw new Error(`Unknown episode "${episodeId}"`);
  const cut = bundle.episode.cuts[cutId];
  if (!cut) throw new Error(`Unknown cut "${cutId}" for ${episodeId}`);

  if (!runValidation(episodeId, true)) {
    console.error('\nValidation failed — fix the errors above (npm run validate).');
    process.exit(1);
  }

  const suffix = scale === 2 ? '_4k' : scale !== 1 ? `_x${scale}` : '';
  const finalPath = join(ROOT, 'renders', `${cut.output}_${version}${suffix}.mp4`);
  const tmpDir = join(ROOT, 'renders/tmp');
  mkdirSync(tmpDir, { recursive: true });
  const rawPath = join(tmpDir, `${cut.output}_${version}${suffix}.raw.mp4`);

  const { serveUrl, composition, browserExecutable } = await prepare(`${episodeId}-${cutId}`);
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
  const normPath = join(tmpDir, `${cut.output}_${version}${suffix}.norm.mp4`);
  const r = masterAudio(rawPath, normPath, join(tmpDir, `${cut.output}_${version}${suffix}`), TARGET_I, TARGET_TP);
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
