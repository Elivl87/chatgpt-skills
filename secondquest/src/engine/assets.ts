import type { AssetCatalog, AssetEntry, AssetKind } from '../schema/types';

/**
 * Asset registry. Scenes reference assets by id ("quest.bed_sleeping"); the
 * catalog maps ids to files + metadata. If the file is not present in public/
 * the renderer shows a labelled placeholder with the same aspect/anchor, so
 * dropping the real PNG in place is the whole replacement workflow.
 */

export interface ResolvedAsset {
  id: string;
  entry: AssetEntry;
  /** Path relative to public/ (no leading slash). */
  publicPath: string;
  exists: boolean;
  /** Placeholder tint. */
  color: string | [string, string];
  characterName?: string;
}

export const DEFAULT_ANCHOR: Record<AssetKind, [number, number]> = {
  background: [0.5, 0.5],
  character: [0.5, 1],
  object: [0.5, 1],
  overlay: [0.5, 0.5],
  foreground: [0.5, 1],
};

export const DEFAULT_DEPTH: Record<AssetKind, number> = {
  background: 0,
  character: 0.6,
  object: 0.55,
  overlay: 0.7,
  foreground: 1,
};

const DEFAULT_COLOR: Record<AssetKind, string> = {
  background: '#3a4256',
  character: '#8a7fb8',
  object: '#5d8f86',
  overlay: '#c7a24a',
  foreground: '#2e3a2f',
};

export const toPublicPath = (path: string, assetRoot: string): string =>
  path.startsWith('/') ? path.slice(1) : `${assetRoot.replace(/\/$/, '')}/${path}`;

export type AssetResolver = (id: string) => ResolvedAsset;

export class UnknownAssetError extends Error {}

export const createAssetResolver = (
  catalogs: AssetCatalog[],
  assetRoots: string[],
  hasFile: (publicPath: string) => boolean,
): AssetResolver => {
  const table = new Map<string, { entry: AssetEntry; root: string; catalog: AssetCatalog }>();
  catalogs.forEach((c, i) => {
    for (const [id, entry] of Object.entries(c.assets)) table.set(id, { entry, root: assetRoots[i], catalog: c });
  });
  const characters = Object.assign({}, ...catalogs.map((c) => c.characters ?? {}));
  const cache = new Map<string, ResolvedAsset>();

  return (id: string) => {
    const hit = cache.get(id);
    if (hit) return hit;
    const row = table.get(id);
    if (!row) throw new UnknownAssetError(`Unknown asset id "${id}"`);
    const publicPath = toPublicPath(row.entry.path, row.root);
    const ch = row.entry.character ? characters[row.entry.character] : undefined;
    const resolved: ResolvedAsset = {
      id,
      entry: row.entry,
      publicPath,
      exists: hasFile(publicPath),
      color: row.entry.color ?? ch?.color ?? DEFAULT_COLOR[row.entry.kind],
      characterName: ch?.name,
    };
    cache.set(id, resolved);
    return resolved;
  };
};

export const listAssetIds = (catalogs: AssetCatalog[]): Set<string> =>
  new Set(catalogs.flatMap((c) => Object.keys(c.assets)));
