/* Ep 001 · thumbnail B "SÉ ESTE PUNTO." redrawn in the illustrated style. Rendered at 1920x1080 and downscaled to
   1280x720 (render/build_stills.sh). Low camera in the lane, the jam's brake lights run to the sun; Quest (v3: replaces
   the mascot) has left his gap open and is calm (the patient driver who absorbs the wave); Pixie rides beside him. */
(function (root) {
  const K = root.K, E = K.ep1;
  let Wt = null;
  K.scene('thumb_b', {
    setup() { E.highway(); E.oncoming(); },
    draw(ctx, t, frame) {
      const P = E.PAL.golden;
      if (!Wt) Wt = E.highwayWorld({ P, horizon: 560, seed: 11, cloudList: E.goldenClouds([1250, 300]) });
      const run = E.highway(), T = 9.0;
      // camera low, right behind the mascot, which hangs back (we draw it ourselves, big, in the foreground)
      const sM = run.at(T).x[E.MASCOT];
      const st = { t: T, simT: T, run, onc: null, sCam: sM - 7, lCam: 0.6, H: 4.2, pitch: 0.03, yaw: 0.03, f: 1500, cy: 600, glowScale: 7,
        sun: { az: 0.11, elev: 0.06, r: 46 }, brake: i => run.brake(i, T) };
      // hide the mascot's own car and the cars behind it from the world pass
      const hide = { at: (tt) => { const S = run.at(tt); for (let i = 0; i <= E.MASCOT; i++) S.x[i] = -1e6; return S; }, N: run.N, p: run.p, brake: run.brake };
      st.run = hide;
      const g = E.drawHighway(ctx, Wt, st);
      K.light.rays(ctx, g.sunX, g.sunY, { n: 12, spread: 2.6, angle: Math.PI / 2, len: 1600, width: 0.05, alpha: 0.12, color: '#ffe0a0', t: 2, seed: 5 });
      K.sky.wash(ctx, g.sunX, g.sunY, 800, '#ffb070', 0.35);
      // left side darkened for the words
      const lg = ctx.createLinearGradient(0, 0, 1100, 0); lg.addColorStop(0, K.rgba('#2a1534', 0.82)); lg.addColorStop(0.6, K.rgba('#2a1534', 0.45)); lg.addColorStop(1, K.rgba('#2a1534', 0));
      ctx.fillStyle = lg; ctx.fillRect(0, 0, 1100, K.H);
      // v3: Quest and Pixie, big, in their teal two-seater (rear view). Quest has left his gap open and turns to us, calm;
      // Pixie looks ahead at the jam
      const lit = { rim: P.rim, shade: P.shadow, ang: -2.0, dx: -1, shadeK: 0.3 };
      const cx = 1440, cy = 1080 + 40, s = 300, W = 1.7 * 1.24 * s, top = cy - 1.0 * s;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(P.shadow, 0.45); K.ellipse(ctx, cx - 40, cy - 10, s * 1.4, s * 0.12); ctx.fill(); ctx.restore();
      K.car.rear(ctx, cx, cy, s, { color: K.TEAL, lit, brake: 0, driver: false, seats: 2 });
      const HL = Object.assign({}, K.hero.LIGHT.backlit, { ang: -1.9 });
      K.hero.draw(ctx, 'pixie', cx + W * 0.22, top + 0.45 * s, 0.6 * s, { pose: 'ride', seat: 0, noLegs: true, contact: 0, yaw: Math.PI + 0.15, t: 1, light: HL });
      K.hero.draw(ctx, 'quest', cx - W * 0.2, top + 0.45 * s, 0.6 * s, { pose: 'ride', seat: 0, noLegs: true, contact: 0, yaw: 0.45, headYaw: -0.25, t: 1, light: HL, expr: 'smug', look: [-0.5, 0.1], blink: 0 });
      ctx.save(); ctx.beginPath(); ctx.rect(cx - s * 2, top, s * 4, s * 1.2); ctx.clip();
      K.car.rear(ctx, cx, cy, s, { color: K.TEAL, lit, brake: 0, driver: false, seats: 2 }); ctx.restore();
      // words
      ctx.save();
      ctx.font = '800 190px "Martian Mono"'; ctx.textBaseline = 'alphabetic';
      const lines = ['SÉ', 'ESTE', 'PUNTO.'], x = 92;
      lines.forEach((ln, k) => {
        const y = 330 + k * 215;
        const dot = ln.endsWith('.'), txt = dot ? ln.slice(0, -1) : ln, w = ctx.measureText(txt).width, r = 190 * 0.105;
        const paint = (dx, dy) => { ctx.fillText(txt, x + dx, y + dy); if (dot) { K.circle(ctx, x + w + r * 1.6 + dx, y - r + dy, r); ctx.fill(); } };   // brand rule: the period is a true circle
        ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = K.rgba('#1a0c22', 0.75); paint(6, 12); ctx.restore();
        ctx.fillStyle = '#f6ecd8'; paint(0, 0);
      });
      ctx.restore();
      K.light.grade(ctx, P.grade, 0.18, 'soft-light');
    },
    post: { grain: 0.1, vignette: 0.4, vignetteColor: '#2a1330', bloom: 0.25 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
