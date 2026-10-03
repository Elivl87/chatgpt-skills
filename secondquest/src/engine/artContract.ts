import { coverScale, evaluateCamera, layerCamera, resolveCamera } from '../animations/camera';
import type { EpisodeBundle } from '../episodes';
import type { AssetCatalog, AssetEntry, AssetKind, Layer, SfxCatalog, TimeExpr } from '../schema/types';
import { resolveTime } from '../utils/time';
import { DEFAULT_DEPTH, toPublicPath } from './assets';
import type { ArtPolicy, ProductionConfig } from './production';
import { resolveCut } from './timeline';

/**
 * SecondQuest art contract — FINAL_ART_ONLY (OFFICIAL_ART_SYSTEM_v1 +
 * CREATIVE_DECISIONS_v1_1).
 *
 * The engine only VALIDATES art. It never creates, crops, upscales, repairs,
 * certifies or substitutes an image. Every image a render uses must be
 * delivered by the Creative Pipeline with source=FINAL_ART, status=APPROVED.
 *
 * Two entry points, both pure (the caller supplies file info):
 *  - validateArtManifest(): an incoming art package (art_manifest.json) —
 *    used by `npm run art:intake`.
 *  - validateArtContract(): an episode about to render — the render gate
 *    (used by `npm run validate` / `npm run render`).
 */

export type ArtCode =
  | 'OK'
  | 'ASSET_MISSING'
  | 'NOT_FINAL_ART'
  | 'NOT_APPROVED'
  | 'FORBIDDEN_SOURCE'
  | 'MANIFEST_FIELD'
  | 'BAD_PATH'
  | 'BAD_RESOLUTION'
  | 'BAD_TRANSPARENCY'
  | 'SAFE_ZOOM'
  | 'SWAP_MISMATCH'
  | 'STYLE_VERSION_MISMATCH'
  | 'QUEST_VERSION_MISMATCH'
  | 'MUSIC_POLICY';

export interface ArtIssue {
  level: 'error' | 'warn';
  code: ArtCode;
  key: string;
  where: string;
  message: string;
}

/** What the caller knows about a file on disk (header-parsed, see scripts/lib.ts imageInfo). */
export interface ImageInfo {
  width: number;
  height: number;
  /** Format can carry alpha (RGBA PNG / tRNS / alpha WebP). */
  alpha: boolean;
}
export type FileInfo = (publicPath: string) => ImageInfo | undefined;

/** One entry of art_manifest.json (SecondQuest_Art_Manifest_Schema_v1). */
export interface ArtManifestEntry {
  key: string;
  /** Path relative to the package root / public, e.g. "public/art/core/quest/quest_idle.png". */
  path: string;
  kind: string;
  library_tier: string;
  source: string;
  status: string;
  required: boolean;
  resolution: string;
  transparent: boolean;
  safe_zoom: number;
  style_version: string;
  character_version?: string;
  used_in: string[];
  swap_set?: string;
  anchor?: [number, number];
  label?: string;
  brief?: string;
}
export interface ArtManifest {
  schema_version?: string;
  package?: string;
  assets: ArtManifestEntry[];
}

/** Schema kinds → engine kinds (programmatic_ui is never an image). */
export const ENGINE_KIND: Record<string, AssetKind | undefined> = {
  background: 'background',
  character: 'character',
  object: 'object',
  animal: 'object',
  machine: 'object',
  brand: 'overlay',
  programmatic_ui: undefined,
};

export const parseResolution = (r: string | undefined): [number, number] | undefined => {
  const m = /^\s*(\d+)\s*[x×]\s*(\d+)\s*$/i.exec(r ?? '');
  return m ? [Number(m[1]), Number(m[2])] : undefined;
};

/** Manifest path ("public/art/…") → public-relative path ("art/…"). */
export const manifestPublicPath = (p: string) => p.replace(/^\/?public\//, '').replace(/^\//, '');

/** Quest artwork = a character asset that is Quest (backgrounds like "quest_bedroom" are not). */
const isQuest = (key: string, e: { character?: string; path?: string; kind?: string }) =>
  e.character === 'quest' ||
  (e.kind === 'character' && (key.startsWith('quest.') || /(^|\.)quest[._]/.test(key) || /\/quest\//.test(e.path ?? '')));

const safeZoomOf = (e: AssetEntry | ArtManifestEntry, kind: AssetKind | undefined, p: ArtPolicy) =>
  e.safe_zoom ?? (kind === 'background' ? p.safeZoomDefaults.background : kind === 'character' ? p.safeZoomDefaults.character : p.safeZoomDefaults.object);

/** Loose view of either a manifest entry or a catalog entry (kind differs: schema kind vs engine kind). */
type ContractFields = Partial<Omit<ArtManifestEntry, 'kind'>> & { kind?: string; character?: string; generator?: string };

/** Field/enum/source/status/path checks shared by manifests and catalog entries. */
const checkContractFields = (key: string, e: ContractFields, p: ArtPolicy, where: string, isManifest: boolean): ArtIssue[] => {
  const out: ArtIssue[] = [];
  const err = (code: ArtCode, message: string) => out.push({ level: 'error', code, key, where, message });
  const src = (e.source ?? '').toUpperCase();
  if (!e.source) err('NOT_FINAL_ART', 'no art-contract source (legacy/unknown art) — needs a FINAL_ART delivery');
  else if (p.forbiddenSources.includes(src)) err('FORBIDDEN_SOURCE', `source ${e.source} is forbidden in production`);
  else if (src === 'PROCEDURAL') {
    // engine-made art (3D props, composited layers): free, reproducible, must name the script that rebuilds it
    if (!(e as { generator?: string }).generator) err('MANIFEST_FIELD', 'PROCEDURAL art must name its generator (the script that rebuilds it)');
  } else if (src !== 'FINAL_ART') err('NOT_FINAL_ART', `source is "${e.source}", expected FINAL_ART or PROCEDURAL`);
  if (e.source && e.status !== 'APPROVED') err('NOT_APPROVED', `status is "${e.status ?? '—'}", expected APPROVED`);
  if (isManifest) {
    for (const f of p.requiredFields) if ((e as Record<string, unknown>)[f] === undefined) err('MANIFEST_FIELD', `missing required field "${f}"`);
    if (e.kind && !p.kinds.includes(e.kind)) err('MANIFEST_FIELD', `unknown kind "${e.kind}"`);
    if (e.library_tier && !['CORE', 'GENRE', 'EPISODE'].includes(e.library_tier)) err('MANIFEST_FIELD', `unknown library_tier "${e.library_tier}"`);
    if (e.kind === 'programmatic_ui') err('MANIFEST_FIELD', 'programmatic_ui is built in Remotion — do not deliver it as an image');
  }
  if (e.source && !parseResolution(e.resolution)) err('MANIFEST_FIELD', `resolution "${e.resolution ?? '—'}" is not WIDTHxHEIGHT`);
  if (e.source && e.style_version !== undefined && e.style_version !== p.styleVersion)
    err('STYLE_VERSION_MISMATCH', `style_version ${e.style_version} ≠ ${p.styleVersion}`);
  if (e.source && isQuest(key, e) && e.character_version !== p.characterVersion)
    err('QUEST_VERSION_MISMATCH', `Quest asset must declare character_version ${p.characterVersion} (got ${e.character_version ?? '—'})`);
  return out;
};

/** Smallest background that covers the largest render with the default background camera zoom. */
export const minBackground = (p: ArtPolicy): [number, number] => [
  Math.ceil(p.maxOutput[0] * p.safeZoomDefaults.background),
  Math.ceil(p.maxOutput[1] * p.safeZoomDefaults.background),
];

/** Real file vs declared resolution / transparency / minimum background size. */
const checkFile = (key: string, e: ContractFields, kind: AssetKind | undefined, info: ImageInfo | undefined, p: ArtPolicy, where: string): ArtIssue[] => {
  const out: ArtIssue[] = [];
  const err = (code: ArtCode, message: string) => out.push({ level: 'error', code, key, where, message });
  if (!info) return [{ level: 'error', code: 'ASSET_MISSING', key, where, message: 'file not found' }];
  const decl = parseResolution(e.resolution);
  if (decl && (info.width !== decl[0] || info.height !== decl[1]))
    err('BAD_RESOLUTION', `file is ${info.width}×${info.height}, manifest declares ${decl[0]}×${decl[1]}`);
  const minBg = minBackground(p);
  if (kind === 'background' && (info.width < minBg[0] || info.height < minBg[1]))
    err('BAD_RESOLUTION', `background ${info.width}×${info.height} below minimum ${minBg[0]}×${minBg[1]} (${p.maxOutput[1]}p × ${p.safeZoomDefaults.background} zoom)`);
  if (e.transparent === true && !info.alpha) err('BAD_TRANSPARENCY', 'declared transparent but the file has no alpha channel');
  if (e.transparent === false && kind !== 'background' && info.alpha) out.push({ level: 'warn', code: 'BAD_TRANSPARENCY', key, where, message: 'declared opaque but the file carries alpha' });
  return out;
};

/**
 * Validate an incoming art package. `fileInfo` resolves manifest paths inside
 * the package. Returns per-key issues; a key with no error is OK.
 */
export const validateArtManifest = (m: ArtManifest, p: ArtPolicy, fileInfo: FileInfo): ArtIssue[] => {
  const out: ArtIssue[] = [];
  const seen = new Set<string>();
  const swaps = new Map<string, Array<{ key: string; info?: ImageInfo }>>();
  const questVersions = new Set<string>();
  for (const e of m.assets ?? []) {
    const key = e.key ?? '(no key)';
    const where = `art_manifest.${key}`;
    if (seen.has(key)) out.push({ level: 'error', code: 'MANIFEST_FIELD', key, where, message: 'duplicate key' });
    seen.add(key);
    out.push(...checkContractFields(key, e, p, where, true));
    const pub = manifestPublicPath(e.path ?? '');
    if (!pub.startsWith(p.pathRoot)) out.push({ level: 'error', code: 'BAD_PATH', key, where, message: `path must live under public/${p.pathRoot} (approved convention), got "${e.path}"` });
    const kind = ENGINE_KIND[e.kind];
    const info = fileInfo(pub);
    out.push(...checkFile(key, e, kind, info, p, where));
    if (e.swap_set) swaps.set(e.swap_set, [...(swaps.get(e.swap_set) ?? []), { key, info }]);
    if (isQuest(key, e) && e.character_version) questVersions.add(e.character_version);
  }
  for (const [set, items] of swaps) {
    const sizes = new Set(items.filter((i) => i.info).map((i) => `${i.info!.width}×${i.info!.height}`));
    if (sizes.size > 1)
      for (const i of items) out.push({ level: 'error', code: 'SWAP_MISMATCH', key: i.key, where: `swap_set.${set}`, message: `swap set canvases differ (${[...sizes].join(' vs ')})` });
  }
  if (questVersions.size > 1)
    out.push({ level: 'error', code: 'QUEST_VERSION_MISMATCH', key: '*', where: 'art_manifest', message: `mixed Quest versions in one package: ${[...questVersions].join(', ')}` });
  return out;
};

/** art_manifest entry → engine catalog entry (keeps every contract field). */
export const catalogEntryFromManifest = (e: ArtManifestEntry): AssetEntry | undefined => {
  const kind = ENGINE_KIND[e.kind];
  const res = parseResolution(e.resolution);
  if (!kind || !res) return undefined;
  const { key: _k, path, kind: _kind, ...contract } = e;
  return {
    ...contract,
    path: '/' + manifestPublicPath(path),
    kind,
    aspect: Math.round((res[0] / res[1]) * 10000) / 10000,
    label: e.label ?? e.key,
    character: isQuest(e.key, e) ? 'quest' : undefined,
  } as AssetEntry;
};

// ---------------------------------------------------------------- render gate

interface Use {
  key: string;
  scene: string;
  zoom: number;
  /** On-screen pixel height the art is drawn at (max over the scene). */
  screenH: number;
  swapWith: string[];
}

/** Max effective zoom + on-screen size per (asset, scene), sampled from the real camera path. */
export const measureAssetUse = (b: EpisodeBundle, shared: AssetCatalog, sfx: SfxCatalog, cutId: string): Use[] => {
  const cut = resolveCut(b, cutId, sfx, () => true);
  const W = cut.width;
  const H = cut.height;
  const entry = (k: string) => b.assets.assets[k] ?? shared.assets[k];
  const uses: Use[] = [];
  for (const rs of cut.scenes) {
    const ctx = { cues: cut.cues, sceneStart: rs.startSec, sceneEnd: rs.endSec, relative: true, end: rs.endSec };
    const toSec = (e: TimeExpr) => resolveTime(e, ctx) - rs.startSec;
    const dur = rs.endSec - rs.startSec;
    const walk = (layers: Layer[], camCfg: typeof rs.scene.camera, seed: string) => {
      const cam = resolveCamera(camCfg, toSec, dur, seed);
      for (const l of layers) {
        if (l.type === 'group') {
          walk(l.layers, (l as { camera?: typeof rs.scene.camera }).camera ?? camCfg, `${seed}/${l.id ?? 'g'}`);
          continue;
        }
        const key = (l as { asset?: string }).asset;
        if (!key || (l.type && l.type !== 'image' && l.type !== 'swarm' && l.type !== 'wordmark')) continue;
        const e = entry(key);
        if (!e) continue;
        const swaps = ((l as { swaps?: Array<{ asset: string }> }).swaps ?? []).map((s) => s.asset);
        const depth = l.depth === 'screen' ? 'screen' : (l.depth ?? DEFAULT_DEPTH[e.kind]);
        let zoom = 0;
        let screenH = 0;
        const steps = Math.max(2, Math.ceil(dur * 10));
        for (let i = 0; i <= steps; i++) {
          const t = (dur * i) / steps;
          const frame = evaluateCamera(cam, t);
          const lc = depth === 'screen' ? { ...frame, zoom: 1, x: 0.5, y: 0.5, rotation: 0, shakeX: 0, shakeY: 0 } : layerCamera(frame, depth, cam.parallax);
          const z = e.kind === 'background' ? lc.zoom * coverScale(lc, W, H, 1.02) : lc.zoom;
          zoom = Math.max(zoom, z);
          const lh =
            e.kind === 'background'
              ? H
              : l.type === 'wordmark'
                ? 180
                : (l as { width?: number }).width !== undefined
                  ? ((l as { width: number }).width * W) / e.aspect
                  : ((l as { height?: number }).height ?? 0.5) * H;
          screenH = Math.max(screenH, lh * (e.kind === 'background' ? z : lc.zoom));
        }
        for (const k of [key, ...swaps]) uses.push({ key: k, scene: rs.scene.id, zoom, screenH, swapWith: [key, ...swaps].filter((x) => x !== k) });
      }
    }
    walk(rs.scene.layers, rs.scene.camera, rs.scene.id);
  }
  return uses;
};

/**
 * The render gate. Every image the cut uses must satisfy the contract;
 * any error blocks the render.
 */
export const validateArtContract = (
  b: EpisodeBundle,
  shared: AssetCatalog,
  sfx: SfxCatalog,
  production: ProductionConfig,
  fileInfo: FileInfo,
): ArtIssue[] => {
  const out: ArtIssue[] = [];
  const p = production.art;
  // --- audio policy
  if (production.audio?.music === 'off' && (b.episode.music?.cues ?? []).length && !b.episode.music?.producerApproved)
    out.push({
      level: 'error',
      code: 'MUSIC_POLICY',
      key: '*',
      where: 'episode.music',
      message: `${b.episode.music!.cues.length} music cue(s) present but SecondQuest music is OFF by default (Narration > SFX > Ambience > Silence) — remove them or set music.producerApproved`,
    });
  if (!p || p.contract !== 'FINAL_ART_ONLY') return out;

  const entry = (k: string) => b.assets.assets[k] ?? shared.assets[k];
  const done = new Set<string>();
  const questVersions = new Map<string, string>();
  for (const cutId of Object.keys(b.episode.cuts)) {
    const uses = measureAssetUse(b, shared, sfx, cutId);
    const byKey = new Map<string, Use[]>();
    for (const u of uses) byKey.set(u.key, [...(byKey.get(u.key) ?? []), u]);
    for (const [key, us] of byKey) {
      const e = entry(key);
      if (!e) continue; // unknown ids are reported by validateEpisode
      const where = `${cutId}:${[...new Set(us.map((u) => u.scene))].slice(0, 4).join(',')}${us.length > 4 ? '…' : ''}`;
      const pub = toPublicPath(e.path, e.path.startsWith('/') ? '' : b.episode.assetRoot);
      const info = fileInfo(pub);
      if (!done.has(key)) {
        done.add(key);
        const fileIssues = checkFile(key, e, e.kind, info, p, where);
        if (!info) {
          out.push({ level: 'error', code: 'ASSET_MISSING', key, where, message: `ASSET_MISSING: ${key} (public/${pub})` });
        } else {
          out.push(...checkContractFields(key, e, p, where, false));
          if (e.source) out.push(...fileIssues); // legacy art is simply NOT_FINAL_ART — no point measuring it
        }
        if (e.character_version && isQuest(key, e)) questVersions.set(key, e.character_version);
      }
      if (!info || !e.source) continue;
      // a background file larger than the output can be zoomed until it would be upscaled (measured zoom includes the cover scale)
      const resSafe = e.kind === 'background' ? Math.min(info.width / p.maxOutput[0], info.height / p.maxOutput[1]) : 0;
      const safe = Math.max(safeZoomOf(e, e.kind, p), resSafe);
      const worst = us.reduce((a, u) => (u.zoom > a.zoom ? u : a));
      if (worst.zoom > safe + 1e-3)
        out.push({ level: 'error', code: 'SAFE_ZOOM', key, where: `${cutId}:${worst.scene}`, message: `scene zooms ${worst.zoom.toFixed(2)}× > safe_zoom ${safe.toFixed(2)}×` });
      const tallest = us.reduce((a, u) => (u.screenH > a.screenH ? u : a));
      if (tallest.screenH > info.height + 1)
        out.push({ level: 'error', code: 'BAD_RESOLUTION', key, where: `${cutId}:${tallest.scene}`, message: `drawn ${Math.round(tallest.screenH)} px tall on screen but the file is only ${info.height} px (would be upscaled)` });
      for (const u of us)
        for (const other of u.swapWith) {
          const oe = entry(other);
          const oi = oe ? fileInfo(toPublicPath(oe.path, oe.path.startsWith('/') ? '' : b.episode.assetRoot)) : undefined;
          if (!oe || !oi) continue;
          if (!e.swap_set || e.swap_set !== oe.swap_set)
            out.push({ level: 'error', code: 'SWAP_MISMATCH', key, where: `${cutId}:${u.scene}`, message: `swaps with ${other} but they do not share a swap_set` });
          else if (oi.width !== info.width || oi.height !== info.height)
            out.push({ level: 'error', code: 'SWAP_MISMATCH', key, where: `${cutId}:${u.scene}`, message: `canvas ${info.width}×${info.height} ≠ ${other} ${oi.width}×${oi.height}` });
        }
    }
  }
  const versions = new Set(questVersions.values());
  if (versions.size > 1)
    out.push({ level: 'error', code: 'QUEST_VERSION_MISMATCH', key: '*', where: 'episode', message: `episode mixes Quest versions: ${[...versions].join(', ')}` });
  // de-duplicate identical messages (e.g. swap pairs reported from both sides of one layer)
  const uniq = new Map<string, ArtIssue>();
  for (const i of out) uniq.set(`${i.code}|${i.key}|${i.message}`, i);
  return [...uniq.values()];
};
