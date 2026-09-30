import { execFileSync, spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readdirSync, readSync } from 'node:fs';
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

/**
 * Read width/height/alpha from a PNG, WebP or JPEG header (no decoding, no deps).
 * `path` is absolute or relative to public/. Returns undefined if missing/unknown.
 */
export const imageInfoAt = (abs: string): { width: number; height: number; alpha: boolean } | undefined => {
  if (!existsSync(abs)) return undefined;
  const fd = openSync(abs, 'r');
  const buf = Buffer.alloc(65536);
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const b = buf.subarray(0, n);
  // PNG
  if (b.length > 29 && b.readUInt32BE(0) === 0x89504e47) {
    const width = b.readUInt32BE(16);
    const height = b.readUInt32BE(20);
    const colorType = b[25];
    const alpha = colorType === 4 || colorType === 6 || b.includes(Buffer.from('tRNS'));
    return { width, height, alpha };
  }
  // WebP
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3), alpha: (b[20] & 0x10) !== 0 };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, alpha: ((bits >> 28) & 1) === 1 };
    }
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, alpha: false };
  }
  // JPEG (never has alpha)
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return undefined;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5), alpha: false };
      i += 2 + len;
    }
  }
  return undefined;
};

/** imageInfoAt() for a path relative to public/. */
export const publicImageInfo = (publicPath: string) => imageInfoAt(join(PUBLIC, publicPath));
