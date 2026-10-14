// DOM sampler for Hyperframes compositions: seeks the composition to each requested time and dumps the box,
// effective opacity, text, font size and role of every visible element. Used by scripts/frame_critic.py.
// Usage: node dom_sampler.cjs <index.html> <times comma-separated> <out.json> [shotsDir]
// Needs puppeteer-core + the Hyperframes runtime from tools/hyperframes_ep003/node_modules (env.sh sets the browser).
const path = require('path');
const fs = require('fs');
const NM = process.env.HF_NODE_MODULES || path.resolve(__dirname, '../../tools/hyperframes_ep003/node_modules');
const puppeteer = require(path.join(NM, 'puppeteer-core'));
const RUNTIME = path.join(NM, 'hyperframes/dist/hyperframe.runtime.iife.js');

const [html, timesArg, out, shotsDir] = process.argv.slice(2);
const times = timesArg.split(',').map(Number);
const exe = process.env.HYPERFRAMES_BROWSER_PATH;

(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--use-gl=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 300)));
  const root0 = await (async () => {
    await page.goto('file://' + path.resolve(html), { waitUntil: 'load', timeout: 60000 });
    return page.evaluate(() => { const r = document.querySelector('[data-composition-id]');
      return { w: +(r && r.getAttribute('data-width')) || innerWidth, h: +(r && r.getAttribute('data-height')) || innerHeight }; });
  })();
  await page.setViewport({ width: root0.w, height: root0.h, deviceScaleFactor: 1 });
  let mode = 'runtime';
  if (fs.existsSync(RUNTIME)) {
    await page.addScriptTag({ path: RUNTIME }).catch((e) => errors.push('runtime inject: ' + e.message));
  }
  const ready = await page.waitForFunction(() => window.__player && typeof window.__player.renderSeek === 'function', { timeout: 15000 })
    .then(() => true).catch(() => false);
  if (!ready) mode = 'manual';
  await new Promise((r) => setTimeout(r, 1200));           // let registry components (motion blur) attach
  // warm every image up front (a cold jump to t=36 otherwise screenshots art that has not been decoded yet)
  await page.evaluate(async () => { document.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
    await Promise.all(Array.from(document.images).map((im) => im.decode().catch(() => {}))); });
  const settle = +(process.env.CRITIC_SETTLE_MS || 120);
  const frames = [];
  for (const t of times) {
    await page.evaluate(async (t, mode) => {
      if (mode === 'runtime') { await window.__player.renderSeek(t); }
      else {
        // manual fallback: clip visibility from data-start/data-duration + seek every registered timeline
        const absStart = (el) => { let s = 0, p = el.parentElement; while (p) { if (p.hasAttribute('data-composition-id') && p.hasAttribute('data-start')) s += +p.getAttribute('data-start') || 0; p = p.parentElement; } return s; };
        document.querySelectorAll('.clip[data-start][data-duration]').forEach((el) => {
          const a = absStart(el) + (+el.getAttribute('data-start')), d = +el.getAttribute('data-duration');
          el.style.visibility = (t >= a && t < a + d) ? 'visible' : 'hidden'; });
        const reg = window.__timelines || {};
        Object.values(reg).forEach((tl) => { try { tl.pause(); tl.seek(t, false); } catch (e) {} });
      }
      await Promise.all(Array.from(document.images).map((im) => (im.complete ? Promise.resolve() : im.decode().catch(() => {}))));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, t, mode);
    const els = await page.evaluate(() => {
      const W = innerWidth, H = innerHeight;
      const effOpacity = (el) => { let o = 1; for (let p = el; p && p.nodeType === 1; p = p.parentElement) { const cs = getComputedStyle(p);
        if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); } return o; };
      const ownText = (el) => Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
      const sel = (el) => el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
      const path = (el) => { const a = []; for (let p = el; p && p.nodeType === 1 && a.length < 6; p = p.parentElement) a.unshift(sel(p)); return a.join(' > '); };
      const flag = (el, name) => !!el.closest('[' + name + ']');
      const roleOf = (el) => {
        const r = el.closest('[data-role]'); if (r) return r.getAttribute('data-role');
        if (el.closest('#hud, .hud, [data-hud]')) return 'hud';
        if (el.closest('#caps, .caps, .caption, [data-caption]')) return 'caption';
        return '';
      };
      const badge = (el) => { for (let p = el.parentElement; p && p.nodeType === 1; p = p.parentElement) { const cs = getComputedStyle(p);
        const br = parseFloat(cs.borderTopLeftRadius) || 0, w = p.getBoundingClientRect().width;
        if (cs.overflow === 'hidden' && w > 0 && br >= 0.4 * w) return true; if (p.hasAttribute('data-composition-id')) break; } return false; };
      const out = [];
      document.querySelectorAll('body *').forEach((el) => {
        if (['SCRIPT', 'STYLE', 'AUDIO', 'TEMPLATE', 'BR'].includes(el.tagName)) return;
        const txt = ownText(el); const isMedia = ['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(el.tagName.toUpperCase());
        const bgImg = getComputedStyle(el).backgroundImage; const isBg = bgImg && bgImg.startsWith('url(');
        if (!txt && !isMedia && !isBg) return;
        if (el.closest('svg') && el.tagName.toUpperCase() !== 'SVG') return;
        const op = effOpacity(el); if (op < 0.05) return;
        let r = el.getBoundingClientRect();
        if (txt) { // tight ink box of the element's own text (a block span is as wide as the frame; its words are not)
          const rg = document.createRange(); let u = null;
          el.childNodes.forEach((n) => { if (n.nodeType !== 3 || !n.textContent.trim()) return; rg.selectNodeContents(n);
            const b = rg.getBoundingClientRect(); if (b.width < 1) return;
            u = u ? { left: Math.min(u.left, b.left), top: Math.min(u.top, b.top), right: Math.max(u.right, b.right), bottom: Math.max(u.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; });
          if (u) r = { left: u.left, top: u.top, right: u.right, bottom: u.bottom, width: u.right - u.left, height: u.bottom - u.top };
        }
        if (r.width < 1 || r.height < 1) return;
        if (r.right <= 0 || r.bottom <= 0 || r.left >= W || r.top >= H) return;
        const cs = getComputedStyle(el);
        const scale = el.offsetHeight ? r.height / el.offsetHeight : 1;
        out.push({ sel: sel(el), path: path(el), tag: el.tagName.toLowerCase(), text: txt.slice(0, 120), op: +op.toFixed(3),
          box: [r.left, r.top, r.right, r.bottom].map((v) => +v.toFixed(1)),
          fontPx: txt ? +(parseFloat(cs.fontSize) * scale).toFixed(1) : 0,
          src: el.tagName === 'IMG' ? (el.getAttribute('src') || '') : (isBg ? bgImg.slice(0, 160) : ''),
          role: roleOf(el), badge: isMedia || isBg ? badge(el) : false,
          mbCopy: !!el.closest('[data-hf-motion-blur-group]') && !el.closest('[data-hf-motion-blur]'),
          mb: flag(el, 'data-hf-motion-blur'), allowOverlap: flag(el, 'data-layout-allow-overlap') || flag(el, 'data-critic-allow-overlap'),
          ignore: flag(el, 'data-layout-ignore') || flag(el, 'data-critic-ignore'), allowDup: flag(el, 'data-critic-allow-duplicate') });
      });
      return out;
    });
    await new Promise((r) => setTimeout(r, settle));
    let shot = null;
    if (shotsDir) { fs.mkdirSync(shotsDir, { recursive: true }); shot = path.join(shotsDir, `t${t.toFixed(2)}.png`); await page.screenshot({ path: shot }); }
    frames.push({ t, els, shot });
  }
  fs.writeFileSync(out, JSON.stringify({ html: path.resolve(html), width: root0.w, height: root0.h, mode, errors, frames }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
