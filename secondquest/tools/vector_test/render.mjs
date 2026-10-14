// Deterministic frame renderer for scene.html (CPU only): loads the page in Chromium headless shell, calls draw(t)
// for every frame and pipes PNGs straight into ffmpeg (no frames on disk).
//   node render.mjs video  <out.mp4> [width=960] [fps=30]
//   node render.mjs stills <outdir>  [width=960] t1,t2,...
//   node render.mjs events <out.json>
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const puppeteer = require(path.join(HERE, '../hyperframes_ep003/node_modules/puppeteer-core'));
const BROWSER = process.env.HYPERFRAMES_BROWSER_PATH ||
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const FF = process.env.FFMPEG || 'ffmpeg';

const [mode, out, wArg, extra] = process.argv.slice(2);
const w = +(wArg || 960), h = Math.round(w * 9 / 16);
const browser = await puppeteer.launch({ executablePath: BROWSER, headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGE ERROR', e.message)); page.on('console', m => console.log('console', m.text()));
await page.goto('file://' + path.join(HERE, 'scene.html') + '?w=' + w);
const grab = async t => Buffer.from((await page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/png'); }, t)).split(',')[1], 'base64');

if (mode === 'events') {
  fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => window.EVENTS)));
} else if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  for (const t of extra.split(',').map(Number)) fs.writeFileSync(path.join(out, `t${t.toFixed(2)}.png`), await grab(t));
} else {
  const fps = +(extra || 30), dur = await page.evaluate(() => window.DUR), n = Math.round(dur * fps);
  const ff = spawn(FF, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await grab(i / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`rendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${out}`);
}
await browser.close();
