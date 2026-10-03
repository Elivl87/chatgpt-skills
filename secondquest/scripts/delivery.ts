/**
 * Delivery copies (phase 0.8): size-targeted encodes for the channels the master cannot go through.
 *
 *   npm run deliver -- renders/secondquest_ep002_v1.mp4            # makes the copies that are needed
 *
 * Limits seen in production: chat downloads 30 MiB, file sends 500 MB, GitHub 100 MB per file.
 * Each copy is a 2-pass libx264 encode at the bitrate that fits the target (audio copied untouched,
 * so the mastered loudness is preserved). Output: renders/delivery/<name>_<target>.mp4
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { ffmpeg, parseArgs, ROOT } from './lib';

export const TARGETS = [
  { label: '30MB', bytes: 29 * 1024 * 1024 },
  { label: '500MB', bytes: 480 * 1000 * 1000 },
];

/** ffmpeg -i with no output exits 1 by design: read the stream info from stderr regardless. */
const probe = (file: string) => spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-i', file], { cwd: ROOT, encoding: 'utf8' }).stderr ?? '';

const durationOf = (file: string): number => {
  const out = probe(file);
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(out);
  if (!m) throw new Error(`cannot read duration of ${file}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
};

const audioKbps = (file: string): number => {
  const out = probe(file);
  const m = /Audio:.*?(\d+) kb\/s/.exec(out);
  return m ? Number(m[1]) : 320;
};

export const makeDeliveryCopies = (master: string): string[] => {
  const size = statSync(master).size;
  const seconds = durationOf(master);
  const aKbps = audioKbps(master);
  const dir = join(ROOT, 'renders/delivery');
  mkdirSync(dir, { recursive: true });
  const made: string[] = [];
  for (const t of TARGETS) {
    if (size <= t.bytes) continue; // the master already fits
    const vKbps = Math.floor(((t.bytes * 8) / 1000 / seconds) * 0.97 - aKbps);
    if (vKbps < 150) {
      console.log(`  ${t.label}: skipped — ${seconds.toFixed(0)} s cannot fit with acceptable quality (${vKbps} kb/s)`);
      continue;
    }
    const out = join(dir, `${basename(master, '.mp4')}_${t.label}.mp4`);
    const log = join(dir, `.pass_${t.label}`);
    const common = ['-y', '-i', master, '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${vKbps}k`, '-pix_fmt', 'yuv420p', '-passlogfile', log];
    ffmpeg([...common, '-pass', '1', '-an', '-f', 'mp4', '/dev/null']);
    ffmpeg([...common, '-pass', '2', '-c:a', 'copy', '-movflags', '+faststart', out]);
    for (const f of [`${log}-0.log`, `${log}-0.log.mbtree`]) rmSync(f, { force: true });
    const got = statSync(out).size;
    console.log(`  ${t.label}: ${out.replace(ROOT + '/', '')} (${(got / 1024 / 1024).toFixed(1)} MiB, video ${vKbps} kb/s)${got > t.bytes ? '  ⚠ over the target' : ''}`);
    made.push(out);
  }
  return made;
};

if (process.argv[1]?.endsWith('delivery.ts')) {
  const { positional } = parseArgs();
  if (!positional[0]) throw new Error('usage: npm run deliver -- <master.mp4>');
  makeDeliveryCopies(positional[0]);
}
