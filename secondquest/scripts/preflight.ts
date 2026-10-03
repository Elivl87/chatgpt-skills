/**
 * Render preflight (phase 0.5): catch, in seconds, what used to crash or stall a 35-minute render.
 *
 *  - cleanTmpBundles  delete stale Remotion webpack bundles in the temp dir (they filled the disk: ENOSPC)
 *  - checkDisk        enough free space for the raw render + mastering
 *  - checkImageSizes  images too large for Chromium to decode in parallel (EP001: 7680x4320 failed at 50%)
 *  - smokeRender      one low-res still per scene + the last frame, before the full render
 */
import { renderStill } from '@remotion/renderer';
import type { VideoConfig } from 'remotion';
import { mkdtempSync, readdirSync, rmSync, statfsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ResolvedCut } from '../src/engine/timeline';
import type { AssetCatalog, Layer } from '../src/schema/types';
import { publicImageInfo, ROOT } from './lib';

export const MAX_IMAGE_SIDE = 6400;

export const cleanTmpBundles = (): number => {
  let n = 0;
  for (const d of readdirSync(tmpdir())) {
    if (d.startsWith('remotion-webpack-bundle-') || d.startsWith('react-motion-render')) {
      rmSync(join(tmpdir(), d), { recursive: true, force: true });
      n++;
    }
  }
  return n;
};

/** Free bytes needed: ~3 MB per second of video (raw + mastered copies), at least 3 GB. */
export const checkDisk = (seconds: number): string | undefined => {
  const st = statfsSync(ROOT);
  const free = st.bavail * st.bsize;
  const need = Math.max(3 * 1024 ** 3, seconds * 3 * 1024 ** 2);
  if (free < need) return `only ${(free / 1024 ** 3).toFixed(1)} GB free, ${(need / 1024 ** 3).toFixed(1)} GB needed — delete old renders/tmp files first`;
  return undefined;
};

export const checkImageSizes = (cut: ResolvedCut, resolve: (key: string) => { path: string } | undefined, assetRoot: string): string[] => {
  const keys = new Set<string>();
  const walk = (ls: Layer[]) =>
    ls.forEach((l) => {
      const a = (l as { asset?: string }).asset;
      if (a) keys.add(a);
      for (const s of (l as { swaps?: Array<{ asset: string }> }).swaps ?? []) keys.add(s.asset);
      if (l.type === 'group') walk(l.layers);
    });
  cut.scenes.forEach((rs) => walk(rs.scene.layers));
  const out: string[] = [];
  for (const k of keys) {
    const e = resolve(k);
    if (!e) continue;
    const p = e.path.startsWith('/') ? e.path.slice(1) : `${assetRoot}/${e.path}`;
    const info = publicImageInfo(p);
    if (info && Math.max(info.width, info.height) > MAX_IMAGE_SIDE)
      out.push(`${k} is ${info.width}x${info.height}: larger than ${MAX_IMAGE_SIDE}px can fail to decode mid-render — downscale it`);
  }
  return out;
};

export const smokeRender = async (
  opts: { serveUrl: string; composition: VideoConfig; inputProps: Record<string, unknown>; browserExecutable: string | null },
  cut: ResolvedCut,
): Promise<string[]> => {
  const dir = mkdtempSync(join(tmpdir(), 'sq-smoke-'));
  const frames = [...cut.scenes.map((rs) => ({ frame: rs.from, label: rs.scene.id })), { frame: cut.durationInFrames - 1, label: 'last frame' }];
  const failed: string[] = [];
  try {
    for (const f of frames) {
      try {
        await renderStill({ ...opts, frame: f.frame, output: join(dir, 'f.jpg'), imageFormat: 'jpeg', jpegQuality: 50, scale: 0.25 });
      } catch (e) {
        failed.push(`${f.label} (frame ${f.frame}): ${(e as Error).message.split('\n')[0]}`);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return failed;
};

export type { AssetCatalog };
