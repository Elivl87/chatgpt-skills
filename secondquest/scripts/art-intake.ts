/**
 * FINAL_ART intake — the only way production art enters the engine.
 *
 *   npm run art:intake -- <part1.zip> [part2.zip …]      # ZIP parts and/or unpacked folders
 *   npm run art:intake -- <package-dir> --dry-run          # validate only, copy nothing
 *
 * Contract (SecondQuest Creative Decisions v1.1 / OFFICIAL_ART_SYSTEM_v1):
 *  - every part carries the SAME art_manifest.json (byte-for-byte after JSON normalisation);
 *  - ZIP parts are ≤ 29.5 MB;
 *  - manifest paths are exact final paths (public/art/<core|genres|episodes>/…);
 *  - partial deliveries are allowed: entries whose file is in none of the parts are PENDING.
 *
 * Each key is validated with validateArtManifest(). Only keys with no error are
 * copied verbatim to public/<path> and registered in shared/art_catalog.json.
 * The intake never edits, crops, resizes or converts a file.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, normalize, resolve } from 'node:path';
import { catalogEntryFromManifest, manifestPublicPath, validateArtManifest, type ArtIssue, type ArtManifest, type ImageInfo } from '../src/engine/artContract';
import { PRODUCTION } from '../src/episodes';
import type { AssetEntry } from '../src/schema/types';
import { imageInfoAt, parseArgs, PUBLIC, ROOT } from './lib';

export const MAX_PART_BYTES = 29.5 * 1024 * 1024;
const CATALOG = join(ROOT, 'shared/art_catalog.json');

/** Locate art_manifest.json inside an unpacked part (root or one folder down). */
const findManifest = (dir: string): string | undefined => {
  if (existsSync(join(dir, 'art_manifest.json'))) return dir;
  for (const d of readdirSync(dir)) {
    const sub = join(dir, d);
    if (statSync(sub).isDirectory() && existsSync(join(sub, 'art_manifest.json'))) return sub;
  }
  return undefined;
};

const canonical = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(v);

export interface IntakeResult {
  package: string;
  parts: string[];
  blockers: string[];
  keys: Record<string, { status: 'OK' | 'PENDING' | 'REJECTED'; codes: string[]; messages: string[]; path: string }>;
}

/** Validate a set of unpacked part roots (each holding art_manifest.json). Pure apart from reading files. */
export const intakeParts = (roots: string[], partSizes: Array<number | undefined> = []): IntakeResult & { manifest?: ArtManifest; fileRoot: (pub: string) => string | undefined } => {
  const blockers: string[] = [];
  const policy = PRODUCTION.art;
  if (!policy) throw new Error('shared/production.json has no "art" policy');
  partSizes.forEach((s, i) => s !== undefined && s > MAX_PART_BYTES && blockers.push(`PART_TOO_LARGE: part ${i + 1} is ${(s / 1048576).toFixed(1)} MB (max 29.5 MB)`));
  const manifests = roots.map((r) => JSON.parse(readFileSync(join(r, 'art_manifest.json'), 'utf8')) as ArtManifest);
  if (new Set(manifests.map(canonical)).size > 1) blockers.push('MANIFEST_MISMATCH: every part must carry the same art_manifest.json');
  const manifest = manifests[0];
  if (!manifest || !Array.isArray(manifest.assets)) blockers.push('MANIFEST_FIELD: art_manifest.json has no "assets" array');
  // A manifest path ("public/art/…") is looked up in every part.
  const fileRoot = (pub: string) => roots.find((r) => existsSync(join(r, 'public', pub)) || existsSync(join(r, pub)));
  const abs = (pub: string) => {
    const r = fileRoot(pub);
    return r ? (existsSync(join(r, 'public', pub)) ? join(r, 'public', pub) : join(r, pub)) : undefined;
  };
  const info = (pub: string): ImageInfo | undefined => {
    const a = abs(pub);
    return a ? imageInfoAt(a) : undefined;
  };
  const issues: ArtIssue[] = manifest?.assets ? validateArtManifest(manifest, policy, info) : [];
  const keys: IntakeResult['keys'] = {};
  for (const e of manifest?.assets ?? []) {
    const mine = issues.filter((i) => i.key === e.key || i.key === '*');
    const errs = mine.filter((i) => i.level === 'error');
    const pending = !abs(manifestPublicPath(e.path ?? '')) && errs.every((i) => i.code === 'ASSET_MISSING');
    keys[e.key] = {
      status: pending ? 'PENDING' : errs.length ? 'REJECTED' : 'OK',
      codes: [...new Set(pending ? ['ASSET_MISSING'] : errs.length ? errs.map((i) => i.code) : ['OK'])],
      messages: mine.map((i) => `${i.level === 'warn' ? '(warn) ' : ''}${i.message}`),
      path: e.path,
    };
  }
  return { package: manifest?.package ?? 'unnamed', parts: roots, blockers, keys, manifest, fileRoot: (pub) => abs(pub) };
};

const unpack = (input: string): { root: string; size?: number } => {
  const p = resolve(input);
  if (statSync(p).isDirectory()) {
    const root = findManifest(p);
    if (!root) throw new Error(`${input}: no art_manifest.json`);
    return { root };
  }
  const dir = mkdtempSync(join(tmpdir(), 'art-intake-'));
  const r = spawnSync('unzip', ['-q', '-o', p, '-d', dir], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${input}: unzip failed`);
  const root = findManifest(dir);
  if (!root) throw new Error(`${input}: no art_manifest.json in the ZIP`);
  return { root, size: statSync(p).size };
};

const main = () => {
  const { positional, flags } = parseArgs();
  if (!positional.length) {
    console.error('usage: npm run art:intake -- <part.zip|dir> [more parts…] [--dry-run]');
    process.exit(2);
  }
  const dry = Boolean(flags['dry-run']);
  const parts = positional.map(unpack);
  const res = intakeParts(parts.map((p) => p.root), parts.map((p) => p.size));
  console.log(`\n■ art intake — ${res.package}  (${parts.length} part(s))${dry ? '  [dry-run]' : ''}`);
  for (const b of res.blockers) console.log(`  ✖ ${b}`);
  const rows = Object.entries(res.keys);
  for (const [key, k] of rows) {
    console.log(`  ${k.status === 'OK' ? '✔' : k.status === 'PENDING' ? '…' : '✖'} ${k.codes.join(',').padEnd(22)} ${key}`);
    if (k.status === 'REJECTED') for (const m of k.messages) console.log(`        ${m}`);
  }
  // Art QC v2 (tools/qc/art_qc.py): a file with a QC error is never installed; warnings are shown for review
  const passed = res.blockers.length ? [] : rows.filter(([, k]) => k.status === 'OK');
  const qcFailed = new Set<string>();
  for (const [key] of passed) {
    const e = res.manifest!.assets.find((a) => a.key === key)!;
    const kind = catalogEntryFromManifest(e)?.kind ?? 'object';
    const file = res.fileRoot(manifestPublicPath(e.path));
    if (!file) continue;
    const r = spawnSync('python3', [join(ROOT, 'tools/qc/art_qc.py'), file, '--kind', kind, '--no-report'], { encoding: 'utf8' });
    for (const line of (r.stdout ?? '').split('\n').filter((l) => /^[✖⚠]/.test(l))) console.log(`  QC ${key}: ${line.slice(2).trim()}`);
    if (r.status === 1) qcFailed.add(key);
  }
  const ok = passed.filter(([key]) => !qcFailed.has(key));
  if (qcFailed.size) console.log(`  ✖ ${qcFailed.size} file(s) failed art QC and were not installed: ${[...qcFailed].join(', ')}`);
  if (!dry && ok.length) {
    const catalog = JSON.parse(readFileSync(CATALOG, 'utf8')) as { notes?: string; assets: Record<string, AssetEntry> };
    for (const [key] of ok) {
      const e = res.manifest!.assets.find((a) => a.key === key)!;
      const pub = manifestPublicPath(e.path);
      const dest = normalize(join(PUBLIC, pub));
      if (!dest.startsWith(join(PUBLIC, 'art') + '/')) throw new Error(`${key}: refusing to write outside public/art (${e.path})`);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(res.fileRoot(pub)!, dest);
      catalog.assets[key] = catalogEntryFromManifest(e)!;
    }
    writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
  }
  const reportDir = join(ROOT, 'reports/art-intake');
  mkdirSync(reportDir, { recursive: true });
  const report = join(reportDir, `${basename(res.package).replace(/[^\w.-]+/g, '_')}.json`);
  const { manifest: _m, fileRoot: _f, ...plain } = res;
  writeFileSync(report, JSON.stringify({ ...plain, dryRun: dry, installed: dry ? [] : ok.map(([k]) => k) }, null, 2) + '\n');
  const count = (s: string) => rows.filter(([, k]) => k.status === s).length;
  console.log(`\n  OK ${count('OK')} · PENDING ${count('PENDING')} · REJECTED ${count('REJECTED')}${res.blockers.length ? ` · PACKAGE BLOCKED (${res.blockers.length})` : ''}`);
  console.log(`  ${dry ? 'nothing copied (dry-run)' : `${ok.length} file(s) installed under public/art and registered in shared/art_catalog.json`}`);
  console.log(`  report: ${report.replace(ROOT + '/', '')}`);
  process.exit(res.blockers.length || count('REJECTED') ? 1 : 0);
};

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '');
if (isMain) main();
