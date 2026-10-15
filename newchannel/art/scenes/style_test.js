/* Ep 001 · 19.6 s style test (v4): golden-hour highway (the wave, from the real IDM run) -> close-up of Eli + Mila as
   the wave reaches them (Eli yells «¡¿Quién fue?!», Mila looks back) -> the wordmark (Mila flicks the dot). One idea per shot. events() exports the sim-derived cues for the sound bed. */
(function (root) {
  const K = root.K, E = K.ep1;
  const CUT1 = 6.0, CUT2 = 15.2, XF = 0.4, DUR = 19.6;   // v4: the close-up holds to the yell and Mila's look back
  let off = null;
  K.scene('style_test', {
    duration: DUR,
    setup() { E.highway(); E.oncoming(); },
    draw(ctx, t, frame) {
      if (t < CUT1) E.drawGolden(ctx, t, frame, { label: true, labelAlpha: K.clamp(t / 0.3) });   // the wide shot runs the sim at 2x: say so
      else if (t < CUT2) E.drawCloseup(ctx, t, frame, { t0: CUT1 });
      else {
        const tl = t - CUT2;
        if (tl < XF) {      // dissolve close-up -> wordmark
          E.drawCloseup(ctx, t, frame, { t0: CUT1 });
          off = off || K.canvas(K.W, K.H);
          E.drawWordmark(off.ctx, tl, frame);
          ctx.save(); ctx.globalAlpha = K.ease.sine(tl / XF); ctx.drawImage(off.c, 0, 0); ctx.restore();
        } else E.drawWordmark(ctx, tl, frame);
      }
    },
    post(t) {
      if (t < CUT1) return { grain: 0.13, vignette: 0.45, vignetteColor: '#2a1330', bloom: 0.25 };
      if (t < CUT2) return { grain: 0.13, vignette: 0.42, vignetteColor: '#2a1330', bloom: 0.22 };
      return { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 };
    },
    events() {
      const run = E.highway(), out = { cuts: [CUT1, CUT2], duration: DUR, brakeOnsets: [], closeup: {}, wordmark: {} };
      // wide shot: each car's first brake-light onset while on screen (sonified as a falling pluck ladder)
      for (let i = 0; i < run.N; i++) {
        for (const t of run.onsets(i, 0, CUT1)) {
          const sCam = E.camS(t) - 31, s = run.at(t).x[i], d = ((s - sCam) % run.p.L + run.p.L) % run.p.L;
          if (d > 10 && d < 700) out.brakeOnsets.push({ t, car: i, dist: d });
        }
      }
      const st = E.closeState(CUT1 + 1);
      const v = x => x - E.CLOSE.simOffset;       // sim time -> video time in the close-up
      out.closeup = { leaderBrake: v(st.leadOn), mascotBrake: v(st.selfOn), mascotStop: v(st.tStop), grumpy: v(st.tStop) + 0.9 };
      out.closeupSpeed = []; for (let t = CUT1; t <= CUT2 + 0.01; t += 0.1) out.closeupSpeed.push([+t.toFixed(2), +run.at(t + E.CLOSE.simOffset).v[E.MASCOT].toFixed(3)]);
      out.wideSpeed = []; for (let t = 0; t <= CUT1 + 0.01; t += 0.1) out.wideSpeed.push([+t.toFixed(2), +run.at(t).v[E.MASCOT].toFixed(3)]);
      out.wordmark = Object.fromEntries(Object.entries(E.WM).map(([k, x]) => [k, x + CUT2]));
      return out;
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
