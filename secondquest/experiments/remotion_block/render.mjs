// node render.mjs [stills a,b,c | video]  - renders at 2560x1440 (scale 4/3) with SwiftShader WebGL in headless Chromium
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
const mode = process.argv[2] ?? 'video';
const serveUrl = await bundle({ entryPoint: './src/index.ts' });
const opts = { serveUrl, browserExecutable: process.env.CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: { gl: 'swiftshader' }, logLevel: process.env.LOG ?? 'error', timeoutInMilliseconds: 240000 };
// One browser for the whole run (opened once, reused by every render call, closed at the end).
const browser = await openBrowser('chrome', { browserExecutable: opts.browserExecutable, chromiumOptions: opts.chromiumOptions, logLevel: opts.logLevel });
opts.puppeteerInstance = browser;
const composition = await selectComposition({ ...opts, id: 'block' });
if (mode === 'stills') {
  for (const s of (process.argv[3] ?? '0').split(',')) {
    const frame = Math.round(Number(s) * 24);
    await renderStill({ ...opts, composition, frame, output: `out/still_${s}.png`, scale: 0.5 });
  }
} else if (mode === 'bench') {
  const [a, b] = (process.argv[3] ?? '0,23').split(',').map(Number);
  const t0 = Date.now();
  await renderMedia({ ...opts, composition, codec: 'h264', crf: 17, scale: 4 / 3, outputLocation: 'out/bench.mp4', concurrency: 4, frameRange: [a, b] });
  console.log(`frames ${a}-${b}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} else if (mode === 'chunk') {
  // node render.mjs chunk <from> <to> <out.mp4>: silent video chunk (the whole video is rendered in chunks by render_chunks.sh)
  const [a, b, out] = [Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
  await renderMedia({ ...opts, composition, codec: 'h264', crf: 17, scale: 4 / 3, outputLocation: out, concurrency: Number(process.env.CONC ?? 2), frameRange: [a, b], muted: true });
} else if (mode === 'audio') {
  await renderMedia({ ...opts, composition, codec: 'wav', outputLocation: 'out/audio.wav' });
} else {
  const t0 = Date.now();
  await renderMedia({ ...opts, composition, codec: 'h264', crf: 17, scale: 4 / 3, outputLocation: 'out/remotion_block_1440p.mp4', concurrency: 4,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${Math.round(progress * 100)}%`); } });
  console.log(`\nrendered in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await browser.close({ silent: true });
