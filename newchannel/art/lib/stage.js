/* Diez Mil Puntos art kit · stage: the page harness. A scene registers itself:
     K.scene('name', { setup(ctx, opts) {...} (may be async), draw(ctx, t, frame) {...}, post: { grain, vignette, ... },
                       events() -> any JSON (optional: sim events for the sound bed), duration })
   The renderer (render/render.mjs) opens index.html?scene=name, awaits window.__ready, then for each frame calls
   window.__frame(t, frame) and grabs the canvas. Time only ever comes from the renderer: no wall clock anywhere. */
(function (root) {
  const K = root.K;
  K.scenes = {};
  K.scene = (name, def) => { K.scenes[name] = def; };

  K.post = function (ctx, frame, p = {}) {
    if (p.bloom) K.light.bloom(ctx, p.bloom, p.bloomR || 22);
    if (p.vignette !== 0) K.light.vignette(ctx, p.vignette ?? 0.4, p.vignetteColor || '#1d1022', p.vignetteInner ?? 0.42);
    if (p.grain !== 0) K.tex.grain(ctx, frame, { amount: p.grain ?? 0.14 });
  };

  K.stage = async function () {
    const q = new URLSearchParams(root.location.search);
    const name = q.get('scene');
    const cv = document.getElementById('cv');
    // output size (?out=854x480): scenes keep drawing in design units (K.W x K.H, 1920x1080 by default) and the stage
    // scales the whole frame (draw + post) to the output canvas. Without ?out the canvas is K.W x K.H (scale 1).
    const oq = (q.get('out') || '').split('x').map(Number);
    const OW = oq[0] || K.W, OH = oq[1] || K.H, SC = OW / K.W;
    K.OUT = [OW, OH]; K.OUTSCALE = SC;
    cv.width = OW; cv.height = OH;
    const ctx = cv.getContext('2d', { alpha: false });
    await Promise.all([
      document.fonts.load(`800 100px "Martian Mono"`), document.fonts.load(`500 100px "Martian Mono"`),
      document.fonts.load(`500 100px "Space Grotesk"`), document.fonts.load(`700 100px "Space Grotesk"`),
      document.fonts.load(`100px "TB Speech"`), document.fonts.load(`100px "TB Shout"`), document.fonts.load(`100px "TB Soft"`),
    ]);
    const sc = K.scenes[name];
    if (!sc) throw new Error('unknown scene ' + name);
    const opts = Object.fromEntries(q.entries());
    if (sc.setup) await sc.setup(ctx, opts);
    root.__frame = (t, frame) => {
      ctx.save(); ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
      sc.draw(ctx, t, frame);
      ctx.restore(); ctx.setTransform(SC, 0, 0, SC, 0, 0);
      const p = typeof sc.post === 'function' ? sc.post(t) : (sc.post || {});
      K.post(ctx, frame, p);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return true;
    };
    root.__grab = (type = 'image/png', q2 = 0.95) => cv.toDataURL(type, q2);
    root.__events = () => (sc.events ? sc.events() : null);
    root.__duration = sc.duration || 0;
    root.__ready = true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
