/**
 * Monetization-safety report M1–M9 (docs/MONETIZATION_SAFETY_STANDARD.md).
 *
 *   npm run originality              # every group in shared/originality.json
 *   npm run originality -- EP002     # one group (compared with the groups published before it)
 *
 * Exit code 1 on errors (M2 near-identical recipe sequence, M8 third-party IP in a
 * thumbnail, M9 "made for kids"). Warnings never block. Scripts are only reported (M6).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkOriginality, fingerprintEpisode, type GroupInput, type OriginalityConfig, type OriginalityIssue } from '../src/engine/originality';
import { SHARED_ASSETS } from '../src/episodes';
import type { AssetCatalog, ScenesFile, ScriptFile, TimingsFile } from '../src/schema/types';
import { parseArgs, ROOT } from './lib';

interface GroupSpec { group: string; cuts: string[]; script?: string; metadata?: string }
const SPEC = JSON.parse(readFileSync(join(ROOT, 'shared/originality.json'), 'utf8')) as { config: OriginalityConfig; groups: GroupSpec[] };
const read = <T>(p: string): T | undefined => (existsSync(join(ROOT, p)) ? (JSON.parse(readFileSync(join(ROOT, p), 'utf8')) as T) : undefined);
const questLog = read<Record<string, unknown>>('docs/originality/quest_log.json') ?? {};

const loadGroup = (g: GroupSpec): GroupInput => ({
  group: g.group,
  episodes: g.cuts.flatMap((id) => {
    const scenes = read<ScenesFile>(`episodes/${id}/scenes.json`);
    const timings = read<TimingsFile>(`episodes/${id}/timings.json`);
    if (!scenes || !timings) return [];
    const local = read<AssetCatalog>(`episodes/${id}/assets.json`);
    const kindOf = (a: string) => (local?.assets[a] ?? SHARED_ASSETS.assets[a])?.kind;
    return [fingerprintEpisode(id, scenes, timings, kindOf)];
  }),
  script: g.script ? read<ScriptFile>(g.script) : undefined,
  questSituations: questLog[g.group] as GroupInput['questSituations'],
  metadata: g.metadata ? read(g.metadata) : undefined,
});

/** Group of a cut id (e.g. ep001short → EP001), or undefined if it is not tracked. */
export const groupOfCut = (id: string) => SPEC.groups.find((g) => g.cuts.includes(id))?.group;

export const runOriginality = (only?: string): { ok: boolean; issues: OriginalityIssue[] } => {
  const groups = SPEC.groups.map(loadGroup);
  const issues: OriginalityIssue[] = [];
  groups.forEach((g, i) => {
    if (only && g.group !== only) return;
    issues.push(...checkOriginality(g, groups.slice(0, i), SPEC.config));
  });
  return { ok: !issues.some((i) => i.level === 'error'), issues };
};

const isMain = process.argv[1]?.endsWith('originality.ts');
if (isMain) {
  const { positional } = parseArgs();
  const { ok, issues } = runOriginality(positional[0]);
  let current = '';
  for (const i of issues) {
    if (i.group !== current) console.log(`\n■ ${(current = i.group)}`);
    console.log(`  ${i.level === 'error' ? '✖ ERROR' : i.level === 'warn' ? '⚠ warn ' : '· info '}  ${i.check}  ${i.message}`);
  }
  if (!ok) process.exit(1);
}
