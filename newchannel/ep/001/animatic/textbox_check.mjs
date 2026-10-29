// Text-box coverage + placement check (2026-10-16, silent characters). For every Eli / Mila line in the word timings:
//  * the box is FULLY visible (alpha >= 0.98, every frame) for >= max(1.6 s, 0.5 s + 0.08 s/char) and the whole voice slot
//    (director 2026-10-29, binding); it never crosses a cut; it never covers the study citation;
//  * it never overlaps a head zone (any Eli / Mila head drawn in that frame), the bottom 12 % band or the frame edge;
//  * at the slot's mid frame a PNG is kept for the by-eye pass (<dir>/tb_<line>.png).
//   node textbox_check.mjs --dir <scratch>/tbcheck [--out 854x480]   -> <dir>/textbox_check.json + summary on stdout
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(p)); break; } catch (e) { /* next */ } }
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = await chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, args: ['--force-color-profile=srgb', '--disable-gpu', '--disable-lcd-text'] });
const DIR = args.dir; fs.mkdirSync(DIR, { recursive: true });
const OUT = args.out || '854x480';
const BLOCKS = args.blocks ? String(args.blocks).split(',') : ['A', 'B', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2'];   // --blocks D2,E1 to re-check a few
const report = []; let fails = 0;
function segHit([x0, y0, x1, y1], a) { let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - a[0]], [dx, a[2] - x0], [-dy, y0 - a[1]], [dy, a[3] - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; } const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 < t1; }
for (const B of BLOCKS) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/ep/001/animatic/index.html?scene=ep001_${B}&out=${OUT}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 180000 });
  const lines = await page.evaluate(() => { const d = K.anim.current.def; return K.anim.lineList().filter(L => L.start >= d.t0 && L.start < d.t1).map(L => ({ id: L.id, speaker: L.speaker, text: L.text, kind: L.kind || 'speech', start: L.start, end: L.end, show0: L.show0, show1: L.show1, t0: d.t0, read: K.tbox.readTime(L.text) })); });
  for (const L of lines) {
    const ts = []; for (let t = L.start + 0.02; t < L.show1 - 0.17; t += 0.1) ts.push(+t.toFixed(3)); ts.push(+(L.show1 - 0.18).toFixed(3));
    const probs = []; let seen = 0, mid = null;
    for (const t of ts) {
      const r = await page.evaluate(([tv]) => { window.__ovLog = []; window.__frame(tv, Math.round(tv * 30)); const O = window.__ovLog; window.__ovLog = null;
        const H = K.anim._heads || {}, S = K.OUTSCALE || 1; return { boxes: O.filter(o => o.kind.startsWith('textbox:')), heads: Object.entries(H).map(([k, v]) => [k, v.head.map(x => x * S)]), src: K.anim._srcZone ? K.anim._srcZone.map(x => x * S) : null, size: [K.OUT[0], K.OUT[1]] }; }, [t - L.t0]);
      const mine = r.boxes.filter(b => b.kind.slice(8) === L.text.slice(0, 20) || b.kind.slice(8).toLowerCase() === L.text.slice(0, 20).toLocaleUpperCase('es').toLowerCase());
      if (!mine.length) { probs.push(`t ${t.toFixed(2)}: box missing`); continue; }
      seen++;
      const [W, H] = r.size, bx = mine[0].r;
      for (const [who, h] of r.heads) { const z = [h[0] - h[2] * 1.1, h[1] - h[2] * 1.6, h[0] + h[2] * 1.1, h[1] + h[2] * 1.1];
        if (bx[0] < z[2] && z[0] < bx[2] && bx[1] < z[3] && z[1] < bx[3]) probs.push(`t ${t.toFixed(2)}: box over ${who}'s head`);
        // Guardian v3: the tail never crosses the OTHER character's head (it reads as their line)
        const tl = mine[0].tail; if (tl && who !== L.speaker && segHit(tl, [z[0], z[1], z[2], h[1] + h[2] * 2.2])) probs.push(`t ${t.toFixed(2)}: tail crosses ${who}'s head`); }
      if (r.src && bx[0] < r.src[2] && r.src[0] < bx[2] && bx[1] < r.src[3] && r.src[1] < bx[3]) probs.push(`t ${t.toFixed(2)}: box over the study citation`);
      if (bx[3] > H * 0.88 + 2 || bx[0] < 2 || bx[1] < 2 || bx[2] > W - 2) probs.push(`t ${t.toFixed(2)}: box outside the safe area ${bx.map(v => Math.round(v))}`);
      if (!mid && t >= (L.start + Math.max(L.end, L.start + L.read)) / 2) { mid = t;
        const url = await page.evaluate(() => window.__grab('image/png')); fs.writeFileSync(path.join(DIR, `tb_${L.id}.png`), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); }
    }
    // director 2026-10-29 (binding): FULLY visible (pop-in / pop-out excluded) for >= max(1.6, 0.5 + 0.08/char) s, never
    // shorter than the voice slot; measured on the frames: first and last frame where the box is drawn at full alpha
    const need = +L.read.toFixed(2);
    const fullT = []; for (let t = L.show0; t <= L.show1 + 0.001; t += 1 / 30) fullT.push(+t.toFixed(4));
    let f0 = null, f1 = null;
    for (const t of fullT) { const a = await page.evaluate(([tv, txt]) => { window.__ovLog = []; window.__frame(tv, Math.round(tv * 30)); const O = window.__ovLog; window.__ovLog = null;
        const b = O.filter(o => o.kind.startsWith('textbox:') && (o.kind.slice(8) === txt || o.kind.slice(8).toLowerCase() === txt.toLocaleUpperCase('es').toLowerCase())); return b.length && b[0].full ? 1 : 0; }, [t - L.t0, L.text.slice(0, 20)]);
      if (a && f0 === null) f0 = t; if (a) f1 = t; }   // full = popped in (scale settled), not popping out, alpha >= 0.98
    const shown = f0 === null ? 0 : +(f1 - f0 + 1 / 30).toFixed(2);
    if (shown + 0.01 < need) probs.push(`fully visible ${shown} s < needed ${need} s`);
    if (f1 === null || f1 < L.end - 0.04) probs.push(`not fully visible until the end of the voice slot (${L.end.toFixed(2)})`);
    fails += probs.length;
    report.push({ block: B, ...L, shown, need, samples: ts.length, seen, problems: [...new Set(probs)] });
    console.log(`${B} ${L.id.padEnd(12)} ${L.kind.padEnd(7)} slot ${(L.end - L.start).toFixed(2)} s need ${need} s fully visible ${shown} s  ${seen}/${ts.length} frames  ${probs.length ? 'FAIL ' + [...new Set(probs)].slice(0, 3).join('; ') : 'ok'}  «${L.text}»`);
  }
  await page.close();
}
fs.writeFileSync(path.join(DIR, 'textbox_check.json'), JSON.stringify({ lines: report.length, fail: fails, report }, null, 1));
console.log(`text boxes: ${report.length} lines, ${fails} failures`);
await browser.close(); server.close();
