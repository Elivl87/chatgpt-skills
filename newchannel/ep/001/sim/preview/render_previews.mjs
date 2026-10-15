// Renders preview/<STATE>.png for every state with the pre-installed headless Chromium, then a small contact sheet.
//   node newchannel/ep/001/sim/preview/render_previews.mjs [S1,S2,...]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium; for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(p)); break; } catch (e) { /* next */ } }
const here = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(here, '../../../../..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = await chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, args: ['--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
page.on('pageerror', e => console.log('[pageerror]', e.message)); page.on('console', m => { if (m.type() === 'error') console.log('[page]', m.text()); });
const ids = process.argv[2] ? process.argv[2].split(',') : ['S1', 'S2', 'S3', 'S3B_ELI', 'S3B_MILA', 'S4', 'S5_25', 'S5_28', 'S5_40', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'TOLL'];
for (const id of ids) {
  await page.goto(`http://127.0.0.1:${server.address().port}/newchannel/ep/001/sim/preview/preview.html?state=${id}`);
  await page.waitForFunction(() => window.__done || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error); if (err) { console.error(id, err); continue; }
  await (await page.$('#cv')).screenshot({ path: path.join(here, `${id}.png`) }); console.log('wrote', id);
}
await browser.close(); server.close();
execFileSync('python3', [path.join(here, 'sheet.py'), here, ...ids], { stdio: 'inherit' });
