// Frame fingerprints for the scene render cache (scene_cache.py): seeks a built block (index.html) with the real
// Hyperframes runtime to every frame time i/fps and hashes everything that decides the pixels of that frame: every
// rendered element's box, transform, opacity, filter, clip, colours, background, text and image src, the content of
// pseudo-elements, and a downsampled read of every canvas. Two frames with the same fingerprint render the same
// pixels (the composition is seek-safe: a frame depends only on its time). False positives (a hidden element that
// changed) only cost a re-render; nothing visible can change without changing the hash.
// Usage: node scene_fp.cjs <index.html> <fps> <out.json>     (env.sh sets HYPERFRAMES_BROWSER_PATH)
// Out: {fps, frames, dur, fp: [hash per frame], clips: [visible top-level clip ids per frame], srcs: [asset urls]}
const path = require('path');
const fs = require('fs');
const NM = path.resolve(__dirname, 'node_modules');
const puppeteer = require(path.join(NM, 'puppeteer-core'));
const RUNTIME = path.join(NM, 'hyperframes/dist/hyperframe.runtime.iife.js');
const [html, fpsArg, out] = process.argv.slice(2);
const fps = +fpsArg;

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.HYPERFRAMES_BROWSER_PATH, headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--use-gl=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 300)));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(html), { waitUntil: 'load', timeout: 60000 });
  await page.addScriptTag({ path: RUNTIME });
  await page.waitForFunction(() => window.__player && typeof window.__player.renderSeek === 'function', { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(async () => { await Promise.all(Array.from(document.images).map((im) => im.decode().catch(() => {}))); });
  const dur = await page.evaluate(() => +document.querySelector('[data-composition-id]').getAttribute('data-duration'));
  const n = Math.ceil(dur * fps - 1e-6);
  await page.evaluate(() => {
    const P = ['opacity', 'visibility', 'display', 'transform', 'transform-origin', 'filter', 'backdrop-filter', 'clip-path',
      'mask-image', 'color', 'background-color', 'background-image', 'background-position', 'background-size', 'border-color',
      'border-radius', 'box-shadow', 'text-shadow', 'mix-blend-mode', 'z-index', 'font-size', 'letter-spacing', 'width', 'height',
      'object-position', '-webkit-text-stroke-color', 'stroke-dashoffset', 'fill', 'stroke'];
    const all = Array.from(document.querySelectorAll('body *')).filter((el) => !['SCRIPT', 'STYLE', 'AUDIO', 'TEMPLATE'].includes(el.tagName));
    const pseudo = [];
    all.forEach((el) => ['::before', '::after'].forEach((ps) => { if (getComputedStyle(el, ps).content !== 'none') pseudo.push([el, ps]); }));
    const scratch = document.createElement('canvas'); scratch.width = 160; scratch.height = 90;
    const sctx = scratch.getContext('2d', { willReadFrequently: true });
    const h32 = (s, h = 0x811c9dc5) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
    window.__fp = () => {
      let h = 0x811c9dc5, h2 = 0x12345678;
      const add = (s) => { h = h32(s, h); h2 = h32(s, h2 ^ 0x9e3779b9); };
      const srcs = new Set();
      for (const el of all) {
        if (!el.isConnected) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none') { add('-'); continue; }
        const r = el.getBoundingClientRect();
        let s = el.tagName + '|' + r.left.toFixed(2) + ',' + r.top.toFixed(2) + ',' + r.width.toFixed(2) + ',' + r.height.toFixed(2);
        for (const p of P) s += '|' + cs.getPropertyValue(p);
        for (const nd of el.childNodes) if (nd.nodeType === 3) s += '|' + nd.textContent;
        if (el.tagName === 'IMG') { s += '|' + el.currentSrc; srcs.add(el.getAttribute('src')); }
        if (cs.backgroundImage.startsWith('url(')) srcs.add(cs.backgroundImage);
        for (const a of ['d', 'points', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'transform', 'href', 'opacity', 'offset', 'stop-color'])
          if (el.hasAttribute && el.hasAttribute(a)) s += '|' + a + '=' + el.getAttribute(a);
        if (el.tagName === 'CANVAS' && r.width > 0 && cs.visibility !== 'hidden') {
          sctx.clearRect(0, 0, 160, 90);
          try { sctx.drawImage(el, 0, 0, 160, 90); const d = sctx.getImageData(0, 0, 160, 90).data;
            let c = 0; for (let i = 0; i < d.length; i++) c = (Math.imul(c, 31) + d[i]) >>> 0; s += '|cv' + c; } catch (e) { s += '|cv?'; }
        }
        add(s);
      }
      for (const [el, ps] of pseudo) { const cs = getComputedStyle(el, ps); let s = ps;
        for (const p of ['content', ...P]) s += '|' + cs.getPropertyValue(p); add(s); }
      const clips = Array.from(document.querySelectorAll('#root > .clip, [data-composition-id] > .clip'))
        .filter((c) => getComputedStyle(c).visibility !== 'hidden' && getComputedStyle(c).display !== 'none').map((c) => c.id || '?');
      return { fp: h.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'), clips, srcs: Array.from(srcs) };
    };
  });
  const fp = [], clips = [], srcs = new Set();
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate(async (t) => {
      await window.__player.renderSeek(t);
      await Promise.all(Array.from(document.images).map((im) => (im.complete ? 0 : im.decode().catch(() => {}))));
      return window.__fp();
    }, i / fps);
    fp.push(r.fp); clips.push(r.clips.join(',')); r.srcs.forEach((s) => srcs.add(s));
  }
  fs.writeFileSync(out, JSON.stringify({ fps, frames: n, dur, fp, clips, srcs: Array.from(srcs).sort(), errors }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
