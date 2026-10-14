// Diez Mil Puntos art · headless renderer. Serves newchannel/ over a local HTTP port, opens art/scenes/index.html in the
// pre-installed Chromium (Playwright from the global node install; never `playwright install`), steps time frame by
// frame (t = frame / fps, no wall clock) and writes PNGs. Usage:
//   node render.mjs --scene highway_golden --still 4.2 --png out.png
//   node render.mjs --scene style_test --fps 30 --start 0 --dur 17.7 --out /tmp/frames [--from 0 --to 530] [--events ev.json]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(p)); break; } catch (e) { /* next */ } }
if (!chromium) throw new Error('playwright not found');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../..');           // newchannel/
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = await chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, args: ['--force-color-profile=srgb', '--disable-gpu', '--disable-lcd-text'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || args.verbose) console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
const extra = args.query ? '&' + args.query : '';
await page.goto(`http://127.0.0.1:${port}/art/scenes/index.html?scene=${args.scene}${extra}`);
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 180000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error(err); process.exit(2); }

async function grab(t, frame, file) {
  await page.evaluate(([t, f]) => window.__frame(t, f), [t, frame]);
  const url = await page.evaluate(() => window.__grab('image/png'));
  fs.writeFileSync(file, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
}

if (args.events) fs.writeFileSync(args.events, JSON.stringify(await page.evaluate(() => window.__events()), null, 1));
if (args.still !== undefined) {
  const ts = String(args.still).split(',').map(Number);
  const fps = Number(args.fps || 30);
  for (const [k, t] of ts.entries()) {
    const out = ts.length > 1 ? args.png.replace(/\.png$/, `_${String(k).padStart(2, '0')}.png`) : args.png;
    const t0 = Date.now(); await grab(t, Math.round(t * fps), out); console.log('still', t, out, (Date.now() - t0) + 'ms');
  }
} else if (args.out) {
  const fps = Number(args.fps || 30), start = Number(args.start || 0), dur = Number(args.dur);
  const n = Math.round(dur * fps), from = Number(args.from || 0), to = Math.min(n, Number(args.to ?? n));
  fs.mkdirSync(args.out, { recursive: true });
  const t0 = Date.now();
  for (let k = from; k < to; k++) {
    const t = start + k / fps;
    await grab(t, Math.round(t * fps), path.join(args.out, `f_${String(k).padStart(5, '0')}.png`));
    if ((k - from) % 30 === 0) console.log(`frame ${k}/${to}  ${((Date.now() - t0) / (k - from + 1)).toFixed(0)} ms/frame`);
  }
  console.log(`done ${to - from} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s = ${((Date.now() - t0) / Math.max(1, to - from)).toFixed(0)} ms/frame`);
}
await browser.close(); server.close();
