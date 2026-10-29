/* Eli skin-tone options (Producer 2026-10-29: «Haría a Eli no tan oscuro, quizás algo más claro»). Lab only: the canonical
   skin stays in cast_alts.js (ELI_SKIN) until the Producer picks. ?scene=eli_tone_lab&v=A|B|C|D&mode=neutral|golden|night
   Each option sets skin + hands + blush together (warm, never ashy; always darker than Mila's tan #d9a66c). */
(function (root) {
  const K = root.K, C = K.cast, E = K.ep1;
  const TONES = { A: { skin: '#905a38', blush: '#ff7a6a' }, B: { skin: '#9e6441', blush: '#f8725f' }, C: { skin: '#ad7049', blush: '#ef6b58' }, D: { skin: '#bb7d53', blush: '#e86452' } };
  K.ELI_TONES = TONES;
  function variant(v) {
    const id = 'eliTone' + v; if (C.SPECS[id]) return id; const b = C.SPECS.eli1, T = TONES[v];
    C.define(id, Object.assign({}, b, { skin: T.skin, handColor: T.skin, arm: Object.assign({}, b.arm), face: Object.assign({}, b.face, { blushColor: T.blush }) }));
    return id;
  }
  K.scene('eli_tone_lab', {
    setup(ctx, o) { this.v = o.v || 'A'; this.mode = o.mode || 'neutral'; this.id = variant(this.v); if (this.mode === 'golden') E.highway(); },
    draw(ctx, t) {
      const id = this.id;
      if (this.mode === 'neutral') {
        ctx.fillStyle = '#ece3d3'; ctx.fillRect(0, 0, K.W, K.H);
        const L = C.LIGHT.golden ? Object.assign({}, C.LIGHT.golden, { rim: '#fff4dc', rimA: 0.35 }) : null;
        C.draw(ctx, id, 640, 1000, 1000, { view: 'front', pose: 'stand', expr: 'happy', t: 0.6, light: L, shadow: 0.3, blink: 0 });
        C.draw(ctx, id, 1280, 1000, 1000, { view: 'q', dir: 1, pose: 'stand', expr: 'neutral', t: 0.9, light: L, shadow: 0.3, blink: 0, look: [0.6, 0] });
      } else if (this.mode === 'golden') {
        E.drawCloseup(ctx, 2.0, null, { t0: 1e9, frame: { z: 2.0, wx: 600, wy: 640, sx: 960, sy: 600 },
          crew: (cx, sx, sy, SC, info) => K.cast.crew2(cx, sx, sy, SC, { driver: id, passenger: 'mila1', t: info.tau, light: Object.assign({}, C.LIGHT.golden, { rim: info.rim }), bob: 0, u: 2.7 * SC,
            driverO: { pose: 'drive', expr: 'happy', look: [0.6, 0], blink: 0 }, passengerO: { pose: 'lap', expr: 'happy', view: 'q', dir: 1, look: [-0.7, 0], blink: 0 } }) });
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#2c3366'); g.addColorStop(1, '#463f6e'); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
        const r = K.rng(5); ctx.fillStyle = '#e8ecff'; for (let k = 0; k < 160; k++) { K.circle(ctx, r() * K.W, r() * 700, 0.8 + r() * 1.6); ctx.fill(); }
        K.light.glow(ctx, 1600, 160, 500, '#9fb4ff', 0.35, 'screen');
        ctx.fillStyle = '#0a0f22'; ctx.beginPath(); ctx.moveTo(0, 1000); ctx.quadraticCurveTo(960, 930, K.W, 1000); ctx.lineTo(K.W, K.H); ctx.lineTo(0, K.H); ctx.fill();
        C.draw(ctx, id, 780, 990, 900, { view: 'q', dir: 1, pose: 'stand', expr: 'happy', t: 0.6, light: C.LIGHT.night, blink: 0, look: [0.6, -0.1] });
        C.draw(ctx, 'mila1', 1180, 990, 900, { view: 'q', dir: -1, pose: 'stand', expr: 'happy', t: 0.9, light: C.LIGHT.night, blink: 0, look: [-0.6, -0.1] });
        K.light.grade(ctx, '#3a4aa0', 0.25, 'soft-light');
      }
    },
    post() { return this.mode === 'neutral' ? { grain: 0, vignette: 0, bloom: 0 } : this.mode === 'night' ? { grain: 0.12, vignette: 0.5, vignetteColor: '#03040c', bloom: 0.3 } : { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
