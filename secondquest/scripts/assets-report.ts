/**
 * Art status + brief.
 *
 *   npm run assets              # all episodes
 *   npm run assets -- ep001
 *
 * For every asset referenced by an episode's scenes, prints delivered / placeholder,
 * the exact file path to drop art into, the recommended pixel size (from its
 * largest on-screen size × camera zoom, 4K-ready) and warns about delivered
 * files with the wrong aspect ratio or needlessly huge dimensions.
 * Also writes episodes/<ep>/ART_STATUS.md for the illustrator.
 */
import { openSync, readSync, closeSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateCamera, resolveCamera } from '../src/animations/camera';
import { toPublicPath } from '../src/engine/assets';
import { resolveCut } from '../src/engine/timeline';
import { EPISODES, SFX, SHARED_ASSETS } from '../src/episodes';
import type { AssetEntry, Layer } from '../src/schema/types';
import { resolveTime } from '../src/utils/time';
import { hasPublicFile, parseArgs, PUBLIC, ROOT } from './lib';

const TARGET_H = 2160; // deliver 4K-ready art

/** Read pixel dimensions from PNG / JPEG / WebP headers (no dependencies). */
const imageSize = (file: string): { w: number; h: number } | null => {
  const fd = openSync(file, 'r');
  const b = Buffer.alloc(65536);
  const n = readSync(fd, b, 0, b.length, 0);
  closeSync(fd);
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < n) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return null;
};

interface Usage {
  scenes: Set<string>;
  maxScreenH: number; // fraction of frame height × camera zoom
}

const main = () => {
  const { positional } = parseArgs();
  for (const [epId, bundle] of Object.entries(EPISODES)) {
    if (positional[0] && positional[0] !== epId) continue;
    const cues = bundle.timings.cues;
    const usage = new Map<string, Usage>();
    const lookup = (id: string): AssetEntry | undefined => bundle.assets.assets[id] ?? SHARED_ASSETS.assets[id];

    const scenes = bundle.scenes.scenes;
    scenes.forEach((scene, i) => {
      const start = resolveTime(scene.start, { cues });
      const next = scenes[i + 1];
      const end = scene.end !== undefined ? resolveTime(scene.end, { cues }) : next ? resolveTime(next.start, { cues }) : bundle.timings.duration;
      const toSec = (e: string | number) => resolveTime(e, { cues, sceneStart: start, sceneEnd: end, relative: true }) - start;
      const cam = resolveCamera(scene.camera, toSec, end - start, scene.id);
      let maxZoom = 1;
      for (let t = 0; t <= end - start; t += 0.1) maxZoom = Math.max(maxZoom, evaluateCamera(cam, t).zoom);

      const visit = (layers: Layer[], zoom: number) =>
        layers.forEach((l) => {
          if (l.type === 'group') return visit(l.layers, zoom * 1.2);
          const ids: string[] = [];
          const a = (l as { asset?: string }).asset;
          if (a) ids.push(a);
          for (const s of (l as { swaps?: Array<{ asset: string }> }).swaps ?? []) ids.push(s.asset);
          for (const id of ids) {
            const e = lookup(id);
            if (!e) continue;
            let h = 1;
            if (l.type === 'wordmark') h = 0.17;
            else if (e.kind !== 'background') {
              const il = l as { height?: number; width?: number };
              h = il.width !== undefined ? (il.width * 16) / 9 / e.aspect : (il.height ?? (l.type === 'swarm' ? (l as { height: number }).height : 0.5));
            }
            const u = usage.get(id) ?? { scenes: new Set(), maxScreenH: 0 };
            u.scenes.add(scene.id);
            u.maxScreenH = Math.max(u.maxScreenH, h * (e.kind === 'background' ? Math.max(1.1, zoom) : zoom));
            usage.set(id, u);
          }
        });
      visit(scene.layers, maxZoom);
    });

    const rows = [...usage.entries()].map(([id, u]) => {
      const e = lookup(id)!;
      const root = e.path.startsWith('/') ? '' : bundle.episode.assetRoot;
      const pub = toPublicPath(e.path, root);
      const exists = hasPublicFile(pub);
      const recH = Math.ceil((Math.min(u.maxScreenH, 4) * TARGET_H) / 10) * 10;
      const recW = Math.ceil((recH * e.aspect) / 10) * 10;
      const notes: string[] = [];
      if (u.maxScreenH > 4) notes.push(`camera zooms ${u.maxScreenH.toFixed(1)}x — supply a detail plate`);
      if (exists) {
        const size = imageSize(join(PUBLIC, pub));
        if (size) {
          const aspect = size.w / size.h;
          if (Math.abs(aspect - e.aspect) / e.aspect > 0.03) notes.push(`aspect ${aspect.toFixed(2)} ≠ catalog ${e.aspect} — update assets.json`);
          if (size.h > recH * 1.8) notes.push(`${size.w}x${size.h} is larger than needed — downscale to ~${recW}x${recH}`);
          if (size.h < recH * 0.5) notes.push(`${size.w}x${size.h} will look soft at 4K`);
        }
      }
      return { id, e, pub, exists, recW, recH, u, notes };
    });
    rows.sort((a, b) => Number(a.exists) - Number(b.exists) || a.pub.localeCompare(b.pub));

    const done = rows.filter((r) => r.exists).length;
    console.log(`\n■ ${epId}: ${done}/${rows.length} referenced assets delivered\n`);
    for (const r of rows) {
      console.log(`  ${r.exists ? '✔' : '·'} ${r.id.padEnd(28)} public/${r.pub}  (${r.recW}x${r.recH})`);
      for (const n of r.notes) console.log(`      ⚠ ${n}`);
    }

    // Markdown brief for the illustrator
    const md = [
      `# ${epId} — art status`,
      '',
      `_Generated by \`npm run assets\`. ${done}/${rows.length} delivered._`,
      '',
      'Drop each file at the exact path below (PNG or WebP; transparent unless it is a background). Placeholders disappear automatically.',
      '',
      '| ✓ | Asset | File | Size (px) | Used in | Brief |',
      '|---|---|---|---|---|---|',
      ...rows.map(
        (r) =>
          `| ${r.exists ? '✅' : '⬜'} | \`${r.id}\` | \`public/${r.pub}\` | ${r.recW}×${r.recH} | ${[...r.u.scenes].join(', ')} | ${(r.e.brief ?? r.e.label).replace(/\|/g, '/')}${r.notes.length ? ` **⚠ ${r.notes.join('; ')}**` : ''} |`,
      ),
      '',
    ].join('\n');
    writeFileSync(join(ROOT, 'episodes', epId, 'ART_STATUS.md'), md);
    console.log(`\n  → episodes/${epId}/ART_STATUS.md`);

    // Sound status
    for (const cutId of Object.keys(bundle.episode.cuts)) {
      const cut = resolveCut(bundle, cutId, SFX, hasPublicFile);
      const ids = new Set(cut.audio.sfx.map((s) => s.id));
      const placeholders = [...ids].filter((id) => SFX.sfx[id]?.label?.startsWith('PLACEHOLDER'));
      console.log(`  sound (${cutId}): ${ids.size} SFX used, ${placeholders.length} still placeholder; music cues: ${cut.audio.music.map((m) => m.id).join(', ') || 'none'}`);
    }
  }
};

main();
