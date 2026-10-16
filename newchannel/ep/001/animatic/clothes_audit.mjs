// Clothing audit, lab part (Producer 2026-10-16: «Las ropas a veces tienen desperfectos»). Drives the clothes lab
// (art/scenes/clothes_lab.js): every pose x view the animatic uses (standing, in the car, sitting on the ground), both
// characters, at 1080p and draft scale, and logs per character draw (kit hook K.cast bodyStats while __faceLog is on):
//   * pal  — exact wardrobe-colour pixel counts (flat light) -> every garment part expected in that view is present
//   * thin — silhouette pixels thinner than ~2.6 ink widths outside head / hands (stray strokes, cords, stubs)
//   * time — the same counts over 20 consecutive frames (idle, walk, wave...) and over pose blends (rest -> pose,
//            k 0..1): a part that vanishes / appears in one frame is a POP.
// Also writes the visual contact sheets (4 lights x 2 sizes) for the by-eye pass. Results -> clothes_check.py.
//   node clothes_audit.mjs --dir <scratch>/clothes [--sheets 1] [--ids eli1,mila1]
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
const IDS = String(args.ids || 'eli1,mila1').split(',');
const SETS = ['stand1', 'stand2', 'car', 'ground'], LIGHTS = ['golden', 'dusk', 'night', 'noon'];
const PAL = {
  eli1: { beanie: '#f2c230', tee: '#f1ede2', collar: '#dcd5c6', apron: '#a4713d', strap: '#7d532a', band: '#3b2a20', bow: '#4a3326', jeans: '#3f5f96', boots: '#2b2729' },
  mila1: { sweater: '#7158b8', cuff: '#5a4596', overall: '#c99633', pocket: '#a87a24', button: '#e7c25a', earring: '#f0c24a', boots: '#2f6b45', hair: '#2e1d22' },
};

async function open(out, q) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/art/scenes/index.html?scene=clothes_lab&out=${out}&${q}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 180000 });
  const err = await page.evaluate(() => window.__error); if (err) { console.error(err); process.exit(2); }
  return page;
}
// one lab frame -> the per-cell logs (cells are drawn in order, one C.draw each)
async function frame(page, cfg, t) {
  return page.evaluate(([cfg, t]) => {
    const sc = K.scenes.clothes_lab; Object.assign(sc, cfg);
    window.__clothesPal = cfg.pal || null; window.__faceLog = [];
    window.__frame(t, Math.round(t * 30));
    const L = window.__faceLog; window.__faceLog = null; window.__clothesPal = null;
    const { poses, out } = K.cast.clothesCells(sc.set, sc.id);
    return L.map((r, i) => ({ view: r.view, pose: out[i] ? out[i].o.pose : r.pose, u: +r.u.toFixed(1), seated: r.seated, head: r.head.map(v => +v.toFixed(1)), body: r.body }));
  }, [cfg, t]);
}

const res = { parts: [], time: [], blend: [] };
for (const [out, tag] of (args.sheetsOnly ? [] : [['3840x2160', 'big'], ['1920x1080', '1080'], ['854x480', 'draft']])) {
  const page = await open(out, 'flat=1' + (tag === 'big' ? '&W=3840&H=2160' : ''));
  for (const id of IDS) for (const set of SETS) {
    // parts + thin, static (t = 0.6)
    const cells = await frame(page, { id, set, flat: true, blend: null, pal: PAL[id] }, 0);
    res.parts.push({ size: tag, id, set, cells });
    // time series: 20 consecutive frames (1080 only: the counts are what matter, draft repeats the same geometry)
    if (tag === '1080' && !args.noTime) {
      const series = [];
      for (let f = 0; f < 20; f++) series.push(await frame(page, { id, set, flat: true, blend: null, pal: PAL[id] }, f / 30));
      res.time.push({ id, set, series: series.map(fr => fr.map(c => ({ pal: c.body.pal, box: c.body.box, px: c.body.px }))), cells: series[0].map(c => ({ view: c.view, pose: c.pose, u: c.u })) });
      const bl = [];
      for (let f = 0; f <= 20; f++) bl.push(await frame(page, { id, set, flat: true, blend: f / 20, pal: PAL[id] }, 0));
      res.blend.push({ id, set, series: bl.map(fr => fr.map(c => ({ pal: c.body.pal, box: c.body.box, px: c.body.px }))), cells: bl[0].map(c => ({ view: c.view, pose: c.pose, u: c.u })) });
    }
    console.log(`${tag} ${id} ${set}: ${cells.length} cells`);
  }
  await page.close();
}
if (!args.sheetsOnly) fs.writeFileSync(path.join(DIR, 'clothes_lab.json'), JSON.stringify(res));

// contact sheets for the by-eye pass: every set x light, at 1080p and draft
if (args.sheets || args.sheetsOnly) {
  for (const [out, tag] of [['1920x1080', '1080'], ['854x480', 'draft']]) {
    const page = await open(out, 'flat=0');
    for (const id of IDS) for (const set of SETS) for (const light of LIGHTS) {
      await page.evaluate(([id, set, light]) => { Object.assign(K.scenes.clothes_lab, { id, set, light, flat: false, blend: null }); window.__frame(0, 0); }, [id, set, light]);
      const url = await page.evaluate(() => window.__grab('image/jpeg', 0.9));
      fs.writeFileSync(path.join(DIR, `sheet_${id}_${set}_${light}_${tag}.jpg`), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
    }
    await page.close();
  }
}
console.log('clothes lab audit written to', DIR);
await browser.close(); server.close();
