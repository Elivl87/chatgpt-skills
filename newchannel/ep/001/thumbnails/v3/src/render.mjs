// EP001 thumbnails v3 · headless renderer (same contract as art/render/render.mjs, but opens this folder's
// thumbs.html). Serves newchannel/ on a local port, one Chromium (pre-installed under /opt/pw-browsers), time fixed.
//   node render.mjs --jobs v3_A:/tmp/a.png,v3_B:/tmp/b.png [--t 1.0]
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
const ROOT = path.resolve(here, '../../../../..');            // newchannel/
const PAGE = path.relative(ROOT, path.join(here, 'thumbs.html')).split(path.sep).join('/');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
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
const t = Number(args.t ?? 1.0);
for (const job of String(args.jobs).split(',')) {
  const [scene, out] = job.split(':');
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/${PAGE}?scene=${scene}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 300000 });
  const err = await page.evaluate(() => window.__error);
  if (err) { console.error(err); process.exit(2); }
  await page.evaluate(([t, f]) => window.__frame(t, f), [t, Math.round(t * 30)]);
  const url = await page.evaluate(() => window.__grab('image/png'));
  fs.writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log('rendered', scene, out, (Date.now() - t0) + 'ms');
}
await browser.close(); server.close();
