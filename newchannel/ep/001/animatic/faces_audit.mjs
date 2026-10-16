// Ep 001 animatic · faces audit, step 1 (render). Walks every shot of a block, picks the key acting moments (shot
// start / middle / end, every word Eli or Mila says, every sound cue = gag hit), renders those frames with the kit's
// face log on (window.__faceLog: every eye of Eli / Mila in canvas px, emotion, blink, talk) and writes
//   <out>/s_<nnn>.png  +  <out>/faces.json  [{ i, t, shot, png, faces: [{ id, expr, view, blink, talk, head, eyes }] }]
// Step 2 (check + contact sheet) is faces_check.py. Driven by faces_audit.sh.
//   node faces_audit.mjs --block A [--out 854x480] --dir /scratch/faces_A [--page ep/001/animatic/index.html --scene ep001_A]
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
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('[pageerror]', e.message));
const B = args.block, OUT = args.out || '854x480', DIR = args.dir, FPS = 30;
const pageUrl = args.page || 'ep/001/animatic/index.html', scene = args.scene || `ep001_${B}`;
fs.mkdirSync(DIR, { recursive: true });
await page.goto(`http://127.0.0.1:${server.address().port}/${pageUrl}?scene=${scene}&out=${OUT}`);
await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 180000 });
const err = await page.evaluate(() => window.__error); if (err) { console.error(err); process.exit(2); }

// overlay log (Guardian body audit): every label / pill / badge / balloon / source line drawn on the visible canvas is
// recorded as a screen rect (canvas px) while its function runs, so body_check.py can test overlaps with Eli / Mila
await page.evaluate(() => {
  window.__ovLog = null; let depth = 0;
  const rec = (ctx, x0, y0, x1, y1, kind) => {
    if (!window.__ovLog || !depth || !ctx.canvas.isConnected || ctx.globalAlpha < 0.05) return;
    const m = ctx.getTransform(), P = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    window.__ovLog.push({ kind, a: +ctx.globalAlpha.toFixed(2), r: [Math.min(...P.map(p => p[0])), Math.min(...P.map(p => p[1])), Math.max(...P.map(p => p[0])), Math.max(...P.map(p => p[1]))] });
  };
  const CP = CanvasRenderingContext2D.prototype;
  for (const fn of ['fillText', 'strokeText']) { const o = CP[fn]; CP[fn] = function (text, x, y, ...r) {
    if (window.__ovLog && depth) { const mt = this.measureText(text), al = this.textAlign, w = mt.width;
      const xl = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x;
      rec(this, xl, y - (mt.actualBoundingBoxAscent || 0), xl + w, y + (mt.actualBoundingBoxDescent || 0), 'text:' + String(text).slice(0, 24)); }
    return o.call(this, text, x, y, ...r); }; }
  const rr = K.rrect; K.rrect = function (ctx, x, y, w, h, ...r) { rec(ctx, x, y, x + w, y + h, 'box'); return rr.call(this, ctx, x, y, w, h, ...r); };
  const wrap = (obj, name) => { const f = obj && obj[name]; if (typeof f !== 'function' || f.__ov) return; const g = function (...a) { depth++; try { return f.apply(this, a); } finally { depth--; } }; g.__ov = 1; obj[name] = g; };
  wrap(K.anim, 'label'); wrap(K.light, 'speedLabel'); wrap(K.cast, 'bubble');
  for (const n of ['pill', 'clock', 'source', 'badge', 'dial', 'callout', 'plate', 'num', 'card']) wrap(K.props, n);
  const cur = K.anim.current; if (cur) for (const s of cur.shots) wrap(s, 'over');
});

// key acting moments (block-local video seconds) + the shot each one is in
const samples = await page.evaluate(() => {
  const A = K.anim, cur = A.current;
  if (!cur) return [{ t: 0.5, shot: 'still', why: 'still' }];
  const { shots, cues, def } = cur, t0 = def.t0, t1 = def.t1, out = [];
  const add = (t, why) => { if (t >= t0 && t < t1 - 0.02) out.push({ t: t - t0, why }); };
  // never sample inside a dissolve (two shots blended at partial alpha): faces there are transitional by design
  const inXf = te => shots.some(s => s.xf && te >= s.start && te < s.start + s.xf + 0.03);
  for (const s of shots) { const d = s.end - s.start; add(s.start + Math.max(Math.min(0.25, d * 0.2), (s.xf || 0) + 0.06), 'start'); add((s.start + s.end) / 2, 'mid'); add(s.end - Math.min(0.15, d * 0.12), 'end'); }
  for (const w of A.words) if ((w.speaker === 'eli' || w.speaker === 'mila') && w.start >= t0 && w.start < t1) add(w.start + Math.min(0.12, (w.end - w.start) / 2), 'line:' + w.speaker + ':' + w.word);
  for (const c of cues) add(c.t + 0.12, 'cue:' + c.kind);
  for (let k = out.length - 1; k >= 0; k--) if (inXf(out[k].t + t0)) out.splice(k, 1);
  out.sort((a, b) => a.t - b.t);
  const ded = []; for (const s of out) { const p = ded[ded.length - 1]; if (p && s.t - p.t < 0.22) { if (s.why.startsWith('line') && !p.why.startsWith('line')) p.why = s.why; continue; } ded.push(s); }
  for (const s of ded) { const te = s.t + t0; const sh = shots.find(x => te >= x.start && te < x.end) || shots[shots.length - 1]; s.shot = sh.id; }
  return ded;
});
const res = [];
let i = 0;
for (const s of samples) {
  const [faces, over, size] = await page.evaluate(([t, f]) => { window.__faceLog = []; window.__ovLog = []; window.__frame(t, f); const L = window.__faceLog, O = window.__ovLog; window.__faceLog = null; window.__ovLog = null;
    const c = document.querySelector('canvas'); return [L, O, [c.width, c.height]]; }, [s.t, Math.round(s.t * FPS)]);
  const mine = faces.filter(r => (r.id === 'eli1' || r.id === 'mila1'));
  s.extras = faces.filter(r => r.id === 'extra').map(r => ({ box: r.box.map(v => +v.toFixed(1)), R: +r.R.toFixed(1), expr: r.expr, view: r.view, alpha: r.alpha }));
  s.over = over; s.size = size;
  if (!mine.length) continue;
  const png = `s_${String(i).padStart(3, '0')}.png`;
  const url = await page.evaluate(() => window.__grab('image/png'));
  fs.writeFileSync(path.join(DIR, png), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  // clothing audit (2026-10-16): the frame 1/30 s later, stats only (garment colour shares, silhouette size) -> popping
  if (process.env.CLOTHES !== '0') {
    const t2 = s.t + 1 / FPS;
    const [f2, sh2] = await page.evaluate(([t, f, t0]) => { window.__faceLog = []; window.__frame(t, f); const L = window.__faceLog; window.__faceLog = null;
      const cur = K.anim.current, te = t + (cur ? cur.def.t0 : 0); const sh = cur ? (cur.shots.find(x => te >= x.start && te < x.end) || {}).id : null;
      return [L.filter(r => r.id === 'eli1' || r.id === 'mila1').map(r => ({ id: r.id, pose: r.pose, view: r.view, body: r.body ? { box: r.body.box, px: r.body.px, cl: r.body.cl } : null })), sh]; }, [t2, Math.round(t2 * FPS)]);
    s.next = f2; s.next_shot = sh2;
  }
  res.push(Object.assign({ i, png, faces: mine }, s)); i++;
}
fs.writeFileSync(path.join(DIR, 'faces.json'), JSON.stringify({ block: B, out: OUT, samples: res }, null, 1));
console.log(`block ${B}: ${samples.length} key moments, ${res.length} with Eli / Mila`);
await browser.close(); server.close();
