/**
 * Review stills: renders frames at the key moments of every scene so an edit
 * can be checked without scrubbing video.
 *
 *   npm run stills -- ep001 hook                 # 3 frames per scene
 *   npm run stills -- ep001 hook --at 12.5,30    # specific seconds
 *   npm run stills -- ep001 hook --locale es     # another language
 *
 * Output: renders/review/<episode>_<cut>/NN_<scene>_<t>.jpg
 */
import { renderStill } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveCut } from '../src/engine/timeline';
import { compositionId, localeSuffix, localizeBundle } from '../src/engine/locale';
import { EPISODES, SFX } from '../src/episodes';
import { hasPublicFile, parseArgs, ROOT } from './lib';
import { prepare } from './remotion';

const main = async () => {
  const { positional, flags } = parseArgs();
  const episodeId = positional[0] ?? 'ep001';
  const cutId = positional[1] ?? 'hook';
  const locale = typeof flags.locale === 'string' ? flags.locale : undefined;
  const bundle = localizeBundle(EPISODES[episodeId], locale);
  const cut = resolveCut(bundle, cutId, SFX, hasPublicFile);
  const scale = Number(flags.scale ?? 0.5);

  let frames: Array<{ frame: number; label: string }>;
  if (typeof flags.at === 'string') {
    frames = flags.at.split(',').map((s) => ({ frame: Math.round(Number(s) * cut.fps), label: `t${s}` }));
  } else {
    frames = cut.scenes.flatMap((rs, i) =>
      [0.2, 0.55, 0.92].map((f) => ({
        frame: Math.min(cut.durationInFrames - 1, rs.from + Math.round(rs.duration * f)),
        label: `${String(i + 1).padStart(2, '0')}_${rs.scene.id}_${Math.round(f * 100)}`,
      })),
    );
  }

  const outDir = join(ROOT, 'renders/review', `${episodeId}_${cutId}${localeSuffix(EPISODES[episodeId], locale)}`);
  mkdirSync(outDir, { recursive: true });
  const inputProps = { episodeId, cutId, locale: locale ?? bundle.episode.locale };
  const { serveUrl, composition, browserExecutable } = await prepare(compositionId(episodeId, cutId, locale, bundle.episode.locale), inputProps);
  for (const f of frames) {
    const output = join(outDir, `${f.label}.jpg`);
    await renderStill({ serveUrl, composition, inputProps, frame: f.frame, output, imageFormat: 'jpeg', jpegQuality: 85, scale, browserExecutable });
    console.log(`  ${(f.frame / cut.fps).toFixed(2)}s → ${output.replace(ROOT + '/', '')}`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
