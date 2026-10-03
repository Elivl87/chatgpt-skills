/**
 * Review sheets (phase 0.6): one numbered still per scene, tiled into sheets the Producer can
 * comment on by number ("lámina 81"), with what changed since the last review marked.
 *
 *   npm run review -- ep001short short            # mid-point still of every scene
 *   npm run review -- ep002 full --points 0.2,0.55,0.92
 *
 * Output: renders/review/<ep>_<cut>/
 *   sheet_01.jpg …      4 x 4 tiles (480x270): number, scene id, time, the narration line at that moment;
 *                       a yellow "CHANGED" frame marks scenes whose data or image changed since the last run
 *   phone.jpg           every scene at phone-thumbnail size (192x108), to judge readability on a phone
 *   review.json         manifest (scene data hash + image hash) used for the next "changed" comparison
 */
import { renderStill } from '@remotion/renderer';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { compositionId, localeSuffix, localizeBundle } from '../src/engine/locale';
import { resolveCut } from '../src/engine/timeline';
import { EPISODES, SFX } from '../src/episodes';
import { cleanTmpBundles } from './preflight';
import { hasPublicFile, parseArgs, ROOT } from './lib';
import { prepare } from './remotion';
import { resolveRenderTarget } from './render-target';

const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex').slice(0, 16);

const main = async () => {
  const { positional, flags } = parseArgs();
  const target = resolveRenderTarget(positional, flags);
  const { episodeId, cutId } = target;
  const locale = target.locale === EPISODES[episodeId].episode.locale ? undefined : target.locale;
  const bundle = localizeBundle(EPISODES[episodeId], locale);
  const cut = resolveCut(bundle, cutId, SFX, hasPublicFile);
  const points = String(flags.points ?? '0.5').split(',').map(Number);
  const dir = join(ROOT, 'renders/review', `${episodeId}_${cutId}${localeSuffix(EPISODES[episodeId], locale)}`);
  const stills = join(dir, 'stills');
  mkdirSync(stills, { recursive: true });
  const manifestPath = join(dir, 'review.json');
  const previous = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as { tiles: Array<{ key: string; sceneHash: string; imageHash: string }> }) : { tiles: [] };
  const prev = new Map(previous.tiles.map((t) => [t.key, t]));

  cleanTmpBundles();
  const inputProps = { episodeId, cutId, locale: target.locale };
  const opts = await prepare(compositionId(episodeId, cutId, locale, bundle.episode.locale), inputProps);
  const cues = Object.entries(cut.cues);
  const tiles: Array<Record<string, unknown>> = [];
  let n = 0;
  for (const rs of cut.scenes) {
    for (const p of points) {
      n++;
      const frame = Math.min(cut.durationInFrames - 1, rs.from + Math.round(rs.duration * p));
      const file = join(stills, `${String(n).padStart(3, '0')}_${rs.scene.id}.jpg`);
      await renderStill({ ...opts, inputProps, frame, output: file, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.25 });
      const t = rs.startSec + (frame - rs.from) / cut.fps;
      const line = cues.find(([, c]) => c.start - 0.1 <= t && t <= c.end + 0.3)?.[1].text ?? '';
      const key = `${rs.scene.id}@${p}`;
      const sceneHash = sha(JSON.stringify(rs.scene));
      const imageHash = sha(readFileSync(file));
      const old = prev.get(key);
      tiles.push({ n, key, scene: rs.scene.id, time: t, line, file, sceneHash, imageHash, changed: !!old && (old.sceneHash !== sceneHash || old.imageHash !== imageHash), isNew: previous.tiles.length > 0 && !old });
      process.stdout.write(`\r  ${n} stills`);
    }
  }
  console.log('');
  writeFileSync(manifestPath, JSON.stringify({ episodeId, cutId, created: new Date().toISOString(), tiles }, null, 1));
  const r = spawnSync('python3', [join(ROOT, 'tools/review/sheets.py'), manifestPath], { stdio: 'inherit' });
  cleanTmpBundles();
  if (r.status) process.exit(r.status);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
