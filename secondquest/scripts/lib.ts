import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC = join(ROOT, 'public');

/** hasFile() for Node scripts — mirrors getStaticFiles() inside Remotion. */
export const hasPublicFile = (publicPath: string): boolean => existsSync(join(PUBLIC, publicPath));

export const parseArgs = (argv = process.argv.slice(2)) => {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[k] = argv[++i];
      else flags[k] = true;
    } else positional.push(a);
  }
  return { positional, flags };
};

/** Run Remotion's bundled FFmpeg (no system install required). */
export const ffmpeg = (args: string[], opts: { capture?: boolean } = {}): string => {
  if (opts.capture) {
    const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) throw new Error(`ffmpeg failed:\n${r.stderr}`);
    return `${r.stdout}\n${r.stderr}`;
  }
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', ...args], { cwd: ROOT, stdio: 'inherit' });
  return '';
};

/** Measure integrated loudness / true peak with loudnorm (analysis pass). */
export const measureLoudness = (file: string) => {
  const out = ffmpeg(['-i', file, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { capture: true });
  const json = out.slice(out.lastIndexOf('{'), out.lastIndexOf('}') + 1);
  return JSON.parse(json) as { input_i: string; input_tp: string; input_lra: string; input_thresh: string; target_offset: string };
};

/**
 * Chrome for rendering: $REMOTION_BROWSER_EXECUTABLE, else a pre-installed
 * Playwright headless shell, else undefined (Remotion downloads its own).
 */
export const findBrowser = (): string | undefined => {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  for (const dir of readdirSync(base).filter((d) => d.startsWith('chromium_headless_shell')).sort().reverse()) {
    for (const sub of readdirSync(join(base, dir))) {
      const candidate = join(base, dir, sub, 'headless_shell');
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined;
};

export const fmt = (s: number) => `${s.toFixed(2).padStart(6)}s`;
