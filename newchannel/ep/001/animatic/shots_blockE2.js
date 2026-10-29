/* Ep 001 · BLOCK E2 · Act 5 + finale + end screen (beats 22-24, end card): the golden road of the hook again, same
   framing, same light (S11: the same tap as S1, Eli now keeps a safe gap; true sim). Cards DEJA UN ESPACIO SEGURO /
   MANEJA AL PROMEDIO, the glovebox gag, the same tap, the cascade dies at Eli, nobody brakes behind him, 5 s of
   silence, «¿…Quién fue?» / «Fuiste tú.», the bird raises a wing; crane up, the wordmark where Eli now CATCHES the dot
   and places it himself, fist bump; end screen (script v5, Producer 2026-10-28: no next-episode tag): the same sunset
   title scene HOLDS 20 s after the tagline: the foreground (letters, the pair, tagline) eases up and smaller to leave the
   lower half clear for the YouTube end-screen elements, idle acting only, the theme resolves, 1 s fade to black.
   Before the sim's own start (sim < 0) the cars cruise in the run's steady state (x0 + v t), which is exact: the run
   starts in equilibrium. Times from words or S11 events. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const ELI = 20, TAP = 26;
  const TAG = 1.9, END_HOLD = TAG + 20;   // the tagline lands TAG s after the end of «Puntos» (WM.tagline below); the title scene then holds 20 s

  A.block('E2', {
    t0: null, t1: null,
    async setup() {
      this.t0 = A.at('O', 1, { beat: '22' });
      this.t1 = A.at('Puntos', 1, { beat: '24', edge: 'end' }) + END_HOLD;   // tagline (+1.9 s after «Puntos») + 20 s (script v5)
      const run = A.run('S11');
      if (!run._pre) { const at = run.atSim.bind(run), br = run.brakeSim.bind(run);
        run.atSim = ts => { if (ts >= 0) return at(ts); const S = at(0); return Object.assign({}, S, { x: S.x.map((x, i) => x + S.v[i] * ts), a: S.a.map(() => 0), tSim: ts }); };
        run.brakeSim = (i, ts) => (ts >= 0 ? br(i, ts) : 0); run._pre = true; }
      A._hwR = A.adapter('S11');
    },
    post: { grain: 0.13, vignette: 0.45, vignetteColor: '#2a1330', bloom: 0.24 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const el = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'eli' }, o)), mi = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'mila' }, o));
      // ---- words
      const tAsi = w('Así', 1, '22'), tEspacio = w('espacio', 1, '22'), tSeguro = w('seguro', 1, '22'), tEnorme = w('enorme', 1, '22'), tCorras = w('corras', 1, '22'), tCerrarloE = w('cerrarlo', 1, '22', { edge: 'end' });
      const tManeja = w('Maneja', 1, '22'), tVel = w('velocidad', 1, '22'), tTrafE = w('tráfico', 1, '22', { edge: 'end' }), tGustaria = w('gustaría', 1, '22'), tLlegas = w('llegas', 1, '22');
      const tMisma = w('misma', 1, '22'), tMismo22 = w('mismo', 1, '22'), tMenos = w('menos', 1, '22'), tFrenazosE = w('frenazos', 1, '22', { edge: 'end' });
      const tMismo1 = w('Mismo', 1, '23'), tMismo2 = w('Mismo', 2, '23'), tFreno = w('freno', 1, '23'), tSolo = w('Solo', 1, '23'), tEliN = w('Eli', 1, '23', { speaker: 'narrator' }), tEspE = w('espacio', 1, '23', { edge: 'end' });
      const tQuien = el('Quién', 1, '23'), tFueE = el('fue', 1, '23', { edge: 'end' }), tFuiste = mi('Fuiste', 1, '23'), tTuE = mi('tú', 1, '23', { edge: 'end' });
      const tDetras = w('detrás', 1, '24'), tEmb2 = w('embotellamiento', 2, '24'), tEs2 = w('Es', 2, '24'), tSolo24 = w('solo', 1, '24'), tPaciente = w('paciente', 1, '24'), tEsto = w('Esto', 1, '24'), tPuntosE = w('Puntos', 1, '24', { edge: 'end' });
      // ---- sim (S11)
      const ev = (type, f) => A.ev('S11', type, f);
      const sTap = ev('tap_start'), sLead = ev('leader_brake_onset'), sGap = ev('eli_gap_min');
      const G22 = A.map(sTap, tFreno, 1);                     // beat 22 at ×1, the same clock that later lands the tap on «freno»
      const G23 = A.map(sTap, tFreno, 3);                     // beat 23: the same tap on «freno», ×3 (like the hook)
      const tLeadV = tFreno + (sLead - sTap) / 3, tGapV = tFreno + (sGap - sTap) / 3;
      const R = () => A.s1(), eliBlink = t => A.blink(3, t), milaBlink = t => A.blink(5, t);
      const BACK = Object.assign({}, K.cast.LIGHT.backlit), FRONTLIT = Object.assign({}, K.cast.LIGHT.golden, { ang: -1.2, shadeA: 0.2, rimA: 0.45 });
      // the ink spring of the gap, drawn on the road between Eli's nose and the leader's tail
      const spring = (c, g, ts, a) => { const S = R().at(ts), p = A.proj(g, S.x[ELI] + 2.3, 1.85, 0.6), q = A.proj(g, S.x[ELI + 1] - 2.3, 1.85, 0.6); if (p && q) P.spring(c, [p.x, p.y], [q.x, q.y], a); };
      const wide = (c, t, ts, o = {}) => A.hw(c, t, Object.assign({ simT: ts, camOn: [ELI, -31], H: 8.2, pitch: 0.068, f: 1600, fg: true,
        crew: tt => ({ eli: { pose: 'drive', expr: 'happy', blink: eliBlink(t), tilt: 0.03 * Math.sin(t * 9) }, mila: { pose: 'lap', headTurn: 0 } }) }, o));
      const ots = (c, t, ts, o = {}) => { const S = R().at(ts), xE = A.camX(ELI, ts, 1.2), xL = S.x[ELI + 1];
        const sCam = xE - 6.4, aim = A.aim(sCam, 1.45, 3.1, 1150, xL, 1.85, 0.7, [1000, 360]);
        return A.hw(c, t, Object.assign({ simT: ts, sCam, lCam: 1.45, H: 3.1, pitch: aim.pitch, yaw: aim.yaw, f: 1150, rays: true, crew: tt => ({ eli: { pose: 'drive', blink: 0 }, mila: { pose: 'lap' } }) }, o)); };
      const inCar = (c, t, ts, frame, eO, mO, o = {}) => { let heads = null;
        A.close(c, t, 0, { id: 'S11', simT: ts, frame, crew: (cx, sx, sy, SC, info) => { heads = A.crew(cx, sx, sy, SC, info, eO, mO, o); if (o.extra) o.extra(cx, sx, sy, SC, heads); } });
        if (o.badge > 0.01 && heads && heads.eliHead) { const [hx, hy, hr] = heads.eliHead; c.save(); c.globalAlpha = K.clamp(o.badge); P.gloveBadge(c, hx + hr * 0.15, hy + hr * 1.75, hr / 260); c.restore(); }
        return heads; };
      const shots = [];

      // ================================================================ BEAT 22 · be the gap (same frame as the hook)
      // Guardian: the «TÚ TAMBIÉN» plate sat right over the crew car (y 860): moved up to the sky (y 300)
      shots.push({ id: 'H01_same', start: T0 - 0.05, bg: 'hw', focus: [960, 520], push: 0.025, pushDir: 1,
        draw(c, t, lt) { wide(c, t, G22(t)); P.plate(c, 960, 300, 'TÚ TAMBIÉN', 56, A.pulse(t, w('tú', 1, '22'), 0.25, 1.4, 0.3)); },
        cues: A => [{ t: w('tú', 1, '22'), kind: 'plate' }] });
      // v5 #14 «Sí, tú. No el de adelante.»: in the car, Eli hears his own excuse from the hook and goes sheepish; Mila turns
      // to him, smug (H01_same was 6.1 s with the new line)
      const tSi22 = w('Sí', 1, '22'), tNo22 = w('No', 1, '22'), tAdel22 = w('adelante', 1, '22');
      shots.push({ id: 'H01_you', start: tSi22 - 0.1, bg: 'close_you', focus: [930, 540], push: 0.03, pushDir: 1,
        draw(c, t, lt) { inCar(c, t, G22(t), { z: 1.45, wx: 640, wy: 620, sx: 950, sy: 545 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tNo22 + 0.1, 'happy', 'sheepish'), look: t > tNo22 + 0.1 ? [0.3, 0.4] : [0.9, -0.05], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, ...A.ez(t, tAdel22, 'neutral', 'smug'), headTurn: 0.25 * A.ramp(t, tAdel22 - 0.2, 0.3), look: [0.9, -0.05], blink: milaBlink(t) }, { badge: 1 }); } });   // the badge is still on (it goes to the glovebox on «cerrarlo»)
      shots.push({ id: 'H02_gap', start: tAsi - 0.1, bg: 'hw_ots', focus: [960, 600], push: 0.03, pushDir: 1,
        // Guardian: the gap spring is drawn on the ground layer (under the cars and the crew): drawn on top it ran through
        // Eli's back and beanie in this over-the-shoulder view
        draw(c, t, lt) { const ts = G22(t); ots(c, t, ts, { onGround: (cx, G) => spring(cx, G, ts, A.ramp(t, tEspacio, 0.3)) });
          P.plate(c, 960, 170, 'DEJA UN ESPACIO SEGURO', 56, A.ramp(t, tAsi + 0.1, 0.3));
          P.pill(c, 1380, 300, '✓ seguro', 34, A.ramp(t, tSeguro, 0.2), { bg: K.rgba('#23746C', 0.92) }); P.pill(c, 1380, 370, '✗ enorme', 34, A.ramp(t, tEnorme, 0.2), { bg: K.rgba('#b8452f', 0.92) }); },
        cues: A => [{ t: tAsi + 0.1, kind: 'plate' }, { t: tEspacio + 0.1, kind: 'spring' }] });
      // the glovebox gag: Eli takes off the badge and stores it (clac) -> the glovebox pops open, the badge jumps out
      // (boing) -> hold -> Mila's knee shuts it without looking. Continuity M1 (script audit 2026-10-23, script v4 beat 22):
      // the badge STAYS in the glovebox; from H03_back to the end Eli wears no badge (the image must not say «cierra el
      // hueco» while the voice says «deja un espacio»). Before this fix it came back on his chest at tKnee + 0.9.
      const tStore = tCerrarloE - 0.1;
      shots.push({ id: 'H03_store', start: tCorras - 0.2, bg: 'close', focus: [930, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G22(t), off = A.ramp(t, tCorras + 0.25, 0.25), lean = A.ramp(t, tCorras + 0.6, 0.3) * (1 - A.ramp(t, tStore, 0.2));
          inCar(c, t, ts, { z: 1.62, wx: 600, wy: 615, sx: 940, sy: 540 },
            { ...A.pzv(off, 0.5, 'clasp', 'point', 1.0), view: 0.55 * Math.abs(1 - 2 * K.ease.sine(off)), dir: off < 0.5 ? 1 : -1, expr: 'determined', look: [K.lerp(0.3, -0.8, off), K.lerp(0.6, 0.5, off)],   /* Guardian v3 (2): turns through the front view, pose and eyes follow the ramp (was a one-frame mirror flip) */ lean: lean * 0.12, blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, expr: 'neutral', look: [0.9, 0], blink: milaBlink(t) }, { badge: 1 - off }); },
        cues: A => [{ t: tStore, kind: 'clonc' }] });
      const tPop = tStore + 0.55, tKnee = tPop + 0.95;
      shots.push({ id: 'H03_pop', start: tStore + 0.25, bg: 'glovebox', focus: [960, 540], push: 0.04, pushDir: 1, breath: true,
        draw(c, t, lt) { P.glovebox(c, t, { open: A.ramp(t, tPop, 0.12), badge: K.clamp((t - tPop) / 0.55), knee: A.ramp(t, tKnee, 0.18), badgeIn: t < tPop }); },
        cues: A => [{ t: tPop, kind: 'boink' }, { t: tKnee + 0.15, kind: 'clonc' }] });
      shots.push({ id: 'H03_back', start: tKnee + 0.45, bg: 'close2', focus: [920, 540], push: 0.03, pushDir: -1,
        over: (c, t) => P.plate(c, 960, 160, 'MANEJA AL PROMEDIO', 56, A.ramp(t, tVel, 0.3)),
        draw(c, t, lt) { const ts = G22(t), give = A.pulse(t, tKnee + 0.6, 0.2, 0.6, 0.2);
          inCar(c, t, ts, { z: 1.5, wx: 620, wy: 625, sx: 950, sy: 545 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tKnee + 1.0, 'surprised', 'sheepish'), look: [0.2, 0.3], blink: eliBlink(t) },
            { ...A.pzv(give, 0.5, 'lap', 'palm', 1.0), view: 'q', dir: 1, expr: 'smug', look: [0.9, -0.05], blink: milaBlink(t) },
            { badge: 0 }); },   // M1: no badge on Eli after the glovebox
        cues: A => [{ t: tVel, kind: 'plate' }] });
      // fingers drum on the wheel, a deep breath, the fingers calm down
      shots.push({ id: 'H04_breathe', start: tTrafE - 0.1, bg: 'close3', focus: [880, 480], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const ts = G22(t), calm = A.ramp(t, tGustaria + 0.2, 0.5), drum = 1 - calm;
          inCar(c, t, ts, { z: 2.0, wx: 650, wy: 560, sx: 940, sy: 560 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tGustaria + 0.45, 'worried', 'happy'), look: [0.9, 0], tilt: drum * 0.04 * Math.sin(t * 30), lean: drum * 0.02 * Math.sin(t * 22), extras: calm > 0.3 && calm < 0.9 ? ['puff'] : [], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, expr: 'happy', look: [0.9, 0], blink: milaBlink(t) }, { badge: 0 });   // M1
          if (drum > 0.05) for (let k = 0; k < 3; k++) P.callout(c, 1300 + k * 50, 760 - (k % 2) * 30, 'tap', 30, drum * (Math.sin(t * 25 + k * 2) > 0 ? 1 : 0.3)); },   // Guardian: the «tap» marks moved down to the wheel (they floated beside Eli's face)
        cues: A => [{ t: tTrafE, kind: 'tick_tock', t1: tGustaria + 0.2 }, { t: tGustaria + 0.25, kind: 'blow' }] });
      shots.push({ id: 'H05_calm', start: tLlegas - 0.15, bg: 'close4', focus: [930, 540], push: 0.03, pushDir: -1,
        draw(c, t, lt) { inCar(c, t, G22(t), { z: 1.4, wx: 700, wy: 610, sx: 950, sy: 540 },
          { pose: 'drive', view: 'q', dir: 1, expr: 'happy', look: [0.9, -0.05], blink: eliBlink(t) }, { pose: 'lap', view: 'q', dir: -1, expr: 'happy', look: [-0.8, 0], headTurn: -0.2, blink: milaBlink(t) }, { badge: 0 }); } });   // M1
      shots.push({ id: 'H05_same', start: tMisma - 0.2, bg: 'hw_crane', focus: [960, 470], push: 0.025, pushDir: -1,
        over: (c, t) => { P.badge(c, 520, 860, '= distancia', 58, A.ramp(t, tMisma, 0.3)); P.badge(c, 960, 860, '= tiempo', 58, A.ramp(t, tMismo22, 0.3)); P.badge(c, 1400, 860, '− frenazos', 58, A.ramp(t, tMenos, 0.3)); },
        draw(c, t, lt) { const ts = G22(t), S = R().at(ts), xE = A.camX(ELI, ts, 2), sCam = xE - 22, aim = A.aim(sCam, -1.2, 11, 2100, xE + 12, 1.85, 0, [980, 400]);
          A.hw(c, t, { simT: ts, sCam, lCam: -1.2, H: 11, pitch: aim.pitch, yaw: aim.yaw, f: 2100, fg: false, onGround: (cx, G) => spring(cx, G, ts, 0.8), crew: tt => ({ eli: { pose: 'drive', expr: 'happy' }, mila: { pose: 'lap' } }) }); void S; },   // Guardian: spring under the crew (it crossed Eli's beanie)
        cues: A => [{ t: tMisma, kind: 'ding' }, { t: tMismo22, kind: 'ding' }, { t: tMenos, kind: 'ding' }] });

      // ================================================================ BEAT 23 · the same tap
      shots.push({ id: 'I01_same', start: tMismo1 - 0.1, bg: 'hw', label: 'ACELERADO ×3', focus: [960, 520], push: 0.025, pushDir: -1,
        draw(c, t, lt) { wide(c, t, G23(t)); } });
      shots.push({ id: 'I02_tele', start: tMismo2 - 0.1, bg: 'hw_tele', label: 'ACELERADO ×3', focus: [960, 560], push: 0.03,
        draw(c, t, lt) { const ts = G23(t), S = R().at(ts), xE = A.camX(ELI, ts), xT = S.x[TAP];
          const sCam = xE + 3, aim = A.aim(sCam, 0.2, 6.5, 4600, xT, 1.85, 0.9, [960, 560]);
          const g = A.hw(c, t, { simT: ts, sCam, lCam: 0.2, H: 6.5, pitch: aim.pitch, yaw: aim.yaw, f: 4600, hide: i => i === ELI, rays: true });
          const p = A.proj(g, xT, 1.85, 0.8); if (p) P.ring(c, p.x, p.y - 4, p.s * 2.1, p.s * 1.5, A.ramp(t, tFreno - 0.1, 0.45), { w: 6, alpha: 0.95 }); },
        cues: A => [{ t: tFreno, kind: 'brake_note', step: 1 }] });
      shots.push({ id: 'I03_ots', start: tSolo - 0.1, bg: 'hw_ots', label: 'ACELERADO ×3', focus: [960, 600], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t); ots(c, t, ts, { onGround: (cx, G) => spring(cx, G, ts, 1), crew: tt => ({ eli: { pose: 'drive', blink: 0 }, mila: { pose: 'lap' } }) }); },   // Guardian: spring under the crew
        cues: A => [23, 22].map((car, k) => ({ t: tFreno + (A.ev('S11', 'brake_onset', e => e.car === car) - sTap) / 3, kind: 'brake_note', step: k + 2 })) });
      // the cascade reaches the car ahead... Eli eases off, never stops; the spring shrinks and stretches again
      shots.push({ id: 'I04_ease', start: tLeadV - 0.35, bg: 'close', label: 'ACELERADO ×3', focus: [920, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t);
          inCar(c, t, ts, { z: 1.45, wx: 700, wy: 615, sx: 940, sy: 540 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tLeadV + 0.2, 'determined', 'happy'), look: [0.9, 0], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, expr: 'curious', look: [0.9, -0.05], blink: milaBlink(t) }, { badge: 0 }); },   // M1
        cues: A => [{ t: tLeadV, kind: 'brake_note', step: 6 }] });
      // over Eli's shoulder, looking back: the golden road, flowing, not one brake light
      shots.push({ id: 'I05_back', start: tLeadV + 1.6, bg: 'hw_rev', label: 'ACELERADO ×3', focus: [960, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), S = R().at(ts), xE = S.x[ELI];
          const sCam = xE + 0.6, aim = A.aim(sCam, 2.25, 1.55, 1050, xE - 45, 1.85, 0, [1120, 600], true);
          A.hw(c, t, { simT: ts, sCam, lCam: 2.25, H: 1.55, pitch: aim.pitch, yaw: aim.yaw, f: 1050, reverse: true, hide: i => i === ELI, carExpr: () => 'content' });
          // eyes pass: was a back-3/4 (only the back of the beanie read); now Eli turned round in his seat, 3/4 toward the
          // camera and looking down the road behind: curious, then the incredulous double take (no brake light at all)
          const rE = K.cast.draw(c, 'eli1', 300, 1400, 1500, { view: 'q', dir: 1, seated: true, pose: 'drive', t, light: FRONTLIT, look: [0.9, -0.05], blink: 0,
            ...A.ez(t, tLeadV + 2.0, 'curious', 'surprised'), tilt: -0.06 * A.ramp(t, tLeadV + 2.0, 0.25) });
          void rE; },   // M1 (2026-10-23): no badge on his chest any more; it stayed in the glovebox (H03_pop)
        cues: A => [{ t: tLeadV + 2.6, kind: 'chirp' }] });
      shots.push({ id: 'I06_who', start: tQuien - 0.45, bg: 'close_tight', focus: [980, 470], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), sp = A.talk('eli', t, { gain: 0.6 });
          inCar(c, t, ts, { z: 1.9, wx: 650, wy: 500, sx: 980, sy: 560 },
            { pose: 'drive', view: 'q', dir: -1, expr: 'curious', look: [-0.9, -0.1], headTurn: 0.3, talk: sp.talk, viseme: sp.viseme, blink: 0 },
            { pose: 'lap', view: 'q', dir: 1, expr: 'happy', look: [-0.6, -0.1], blink: milaBlink(t) }, { badge: 0 });   // M1
          /* the whisper «¿…Quién fue?» is a text box now (A.drawLines) */ } });
      shots.push({ id: 'I07_you', start: tFuiste - 0.25, bg: 'close_mila', focus: [880, 500], push: 0.035, pushDir: -1,
        draw(c, t, lt) { const ts = G23(t), sp = A.talk('mila', t), laugh = t > tTuE + 0.2; let heads = null;
          heads = inCar(c, t, ts, { z: 1.7, wx: 600, wy: 560, sx: 900, sy: 560 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tTuE + 0.2, 'sheepish', 'laugh'), look: [-0.5, 0], blink: eliBlink(t) },
            { pose: 'lap', blend: { pose: 'point', k: 0.62 }, view: 'q', dir: 1, expr: 'happy', look: [0.9, 0], talk: sp.talk, viseme: sp.viseme, blink: 0 }, { badge: 0 });   // Guardian: a lower, shorter point at HIM (the full point covered Eli's nose and mouth); M1: no badge to point at
          if (heads && heads.milaHead) A.speaker('mila', heads.milaHead); },
        cues: A => [{ t: tTuE + 0.25, kind: 'mm' }] });
      shots.push({ id: 'I08_bird', start: tTuE + 0.1, bg: 'bird', focus: [960, 520], push: 0.035, pushDir: 1,
        draw(c, t, lt) { birdInsert(c, t, A.ramp(t, tTuE + 0.75, 0.2)); P.callout(c, 1260, 330, 'pío', 80, A.pulse(t, tTuE + 0.85, 0.08, 0.5, 0.2)); },
        cues: A => [{ t: tTuE + 0.75, kind: 'flutter' }, { t: tTuE + 0.85, kind: 'chirp' }] });

      // ================================================================ BEAT 24 · goodbye: crane up, then the wordmark
      shots.push({ id: 'J01_crane', start: tDetras - 0.3, bg: 'hw_crane_up', label: 'ACELERADO ×3', focus: [960, 470], push: 0.02, pushDir: -1,
        draw(c, t, lt, S) { const ts = G23(t), xE = A.camX(ELI, ts, 2), up = K.ease.inOut(K.clamp(lt / (S.end - S.start))), H = K.lerp(6, 24, up);
          const sCam = xE - 18 - up * 20, aim = A.aim(sCam, -1.2, H, 1900, xE + 10, 1.85, 0, [960, 700]);
          A.hw(c, t, { simT: ts, sCam, lCam: -1.2, H, pitch: aim.pitch, yaw: aim.yaw, f: 1900, fg: false, crew: tt => ({ eli: { pose: 'drive', expr: 'happy' }, mila: { pose: 'lap' } }) }); } });
      // «un embotellamiento que nunca pasó»: looking back from high up, the road behind them flows
      shots.push({ id: 'J01_never', start: w('embotellamiento', 1, '24') - 0.15, bg: 'hw_rev_high', label: 'ACELERADO ×3', focus: [960, 560], push: 0.025, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), S = R().at(ts), xE = S.x[ELI], sCam = xE + 14, aim = A.aim(sCam, 2.6, 9, 1300, xE - 60, 1.85, 0, [960, 640], true);
          A.hw(c, t, { simT: ts, sCam, lCam: 2.6, H: 9, pitch: aim.pitch, yaw: aim.yaw, f: 1300, reverse: true, carExpr: () => 'content' });
          P.callout(c, 1300, 300, '¿embotellamiento?', 44, A.pulse(t, w('nunca', 1, '24'), 0.2, 0.7, 0.3)); } });
      shots.push({ id: 'J02_plate', start: tEmb2 - 0.2, bg: 'hw_high', label: 'ACELERADO ×3', focus: [960, 500], push: 0.025, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), xE = A.camX(ELI, ts, 2), sCam = xE - 60, aim = A.aim(sCam, -1.2, 26, 1700, xE - 30, 1.85, 0, [960, 640]);
          A.hw(c, t, { simT: ts, sCam, lCam: -1.2, H: 26, pitch: aim.pitch, yaw: aim.yaw, f: 1700, fg: true });
          c.fillStyle = K.rgba('#1a1020', 0.25 * A.ramp(t, tEmb2, 0.3)); c.fillRect(0, 0, K.W, K.H);
          P.plate(c, 960, 380, 'UN EMBOTELLAMIENTO NO ES UN LUGAR.', 52, A.ramp(t, tEmb2, 0.3)); P.plate(c, 960, 520, 'ES UNA OLA.', 70, A.ramp(t, tEs2, 0.3)); },
        cues: A => [{ t: tEmb2, kind: 'plate' }, { t: tEs2, kind: 'plate' }] });
      shots.push({ id: 'J03_calm', start: tSolo24 - 0.2, bg: 'close_wide', label: 'ACELERADO ×3', focus: [930, 540], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t);
          inCar(c, t, ts, { z: 1.3, wx: 760, wy: 600, sx: 960, sy: 540 },
            { pose: 'drive', view: 'q', dir: 1, expr: 'happy', look: [0.9, -0.05], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, ...A.ez(t, tPaciente, 'neutral', 'happy'), look: [0.9, -0.1], blink: milaBlink(t) }, { badge: 0 }); } });   // M1
      // v5 #16 «Hasta Eli.»: tighter on the pair, Mila's hand on his shoulder, Eli beams (J03_calm was 4.9 s)
      const tHasta = w('Hasta', 1, '24');
      shots.push({ id: 'J03_eli', start: tHasta - 0.1, bg: 'close_eli', label: 'ACELERADO ×3', focus: [930, 520], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), give = A.ramp(t, tHasta, 0.3);
          inCar(c, t, ts, { z: 1.75, wx: 640, wy: 600, sx: 950, sy: 545 },
            { pose: 'drive', view: 'q', dir: 1, ...A.ez(t, tHasta + 0.3, 'happy', 'laugh'), look: [0.9, -0.05], blink: eliBlink(t) },
            { ...A.pzv(give, 0.5, 'lap', 'palm', 1.0), view: 'q', dir: 1, expr: 'happy', look: [0.9, -0.1], blink: milaBlink(t) }, { badge: 0 }); } });   // M1
      // the wordmark, the payoff: Eli catches the dot ON TIME and places it on the i himself; fist bump
      const tWM = tEsto - 0.15, WM = { drop: 0.55, c1: 1.0, c2: tPuntosE - tWM, place: tPuntosE - tWM + 0.75, land: tPuntosE - tWM + 1.25, tagline: tPuntosE - tWM + TAG };
      const tTag = tWM + WM.tagline, T1 = def.t1;
      // end-screen hold (tl = t - tWM): H = tagline start. Idle acting only: they look at each other, Eli bobs on his heels,
      // both glance down at the valley, Mila folds her arms, both turn a smile to camera; Mila's ponytail in the breeze.
      const H = WM.tagline, bob = tl => { const k = K.clamp((tl - (H + 4.6)) / 1.3); return k > 0 && k < 1 ? 0.035 * Math.abs(Math.sin(k * Math.PI * 2)) : 0; };
      const breeze = tl => K.ease.sine(K.clamp((tl - H) / 2)) * (0.32 + 0.22 * Math.sin(tl * 1.15) + 0.08 * Math.sin(tl * 2.9));
      const tBump = tWM + WM.land + 0.65;
      const wmOpt = { wm: WM, catch: true,
        // Guardian v3: blended sequences (the catch, the place and the fist bump used to snap arms and faces in one frame)
        eli: (o, tl, W) => Object.assign(o, A.seq(tl, [[0, { pose: 'stand', blend: null, expr: 'neutral', look: o.look }],
          [W.c1 - 0.1, { pose: 'stand', blend: null, expr: 'determined', look: [-0.5, -0.8] }], [W.c2 - 0.08, { pose: 'palm', blend: null, expr: 'surprised', look: [-0.4, -0.6] }],
          [W.c2 + 0.25, { pose: 'palm', blend: null, expr: 'awe', look: [-0.3, -0.5] }], [W.place, { pose: 'point', blend: null, expr: 'happy', look: [-0.8, -0.3] }],
          [W.land + 0.3, { pose: 'pump', blend: null, expr: 'laugh', look: [-0.8, 0] }],
          [H + 1.2, { pose: 'stand', blend: null, expr: 'happy', look: [-0.8, -0.1] }], [H + 7.5, { pose: 'stand', blend: null, expr: 'happy', look: [0.3, 0.4] }],
          [H + 10.5, { pose: 'hips', blend: null, expr: 'happy', look: [-0.8, -0.1] }], [H + 15.5, { pose: 'hips', blend: null, expr: 'happy', look: [-0.15, 0] }]], tl < H + 0.8 ? 0.16 : 0.4),   /* idle blends slower than the catch */
          tl > H ? { crouch: bob(tl), blink: eliBlink(tl + tWM) } : {}),
        mila: (o, tl, W) => { if (tl > W.c2) Object.assign(o, A.ez(tl, W.c2 + 0.07, 'curious', 'awe'), { look: [0.8, -0.4] });
          if (tl > W.land) Object.assign(o, A.seq(tl, [[0, { pose: 'palm', blend: null, expr: 'awe', look: [0.8, -0.4] }], [W.land + 0.3, { pose: 'pump', blend: null, expr: 'laugh', look: [0.8, 0] }],
            [H + 1.4, { pose: 'stand', blend: null, expr: 'happy', look: [0.8, -0.05] }], [H + 7.8, { pose: 'stand', blend: null, expr: 'happy', look: [0.3, 0.4] }],
            [H + 10.8, { pose: 'crossed', blend: null, expr: 'smug', look: [0.8, -0.05] }], [H + 15.7, { pose: 'crossed', blend: null, expr: 'happy', look: [0.15, 0] }]], tl < H + 0.8 ? 0.2 : 0.4));
          if (tl > H) Object.assign(o, { drag: breeze(tl), blink: milaBlink(tl + tWM) }); },
        fg: null };
      shots.push({ id: 'J04_wm', start: tWM, bg: 'wm', xf: 0.3, focus: [960, 520], push: 0.02, pushDir: 1, breath: true,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { E.drawWordmark(c, t - tWM, 0, wmOpt); },
        cues: A => [{ t: tWM - 0.2, kind: 'whoosh_wm' }, { t: tWM + WM.drop, kind: 'sting_drop' }, { t: tWM + WM.c1, kind: 'flick' }] });
      shots.push({ id: 'J05_catch', start: tWM + WM.c2 - 0.35, bg: 'wm_close', focus: [960, 540], push: 0.02, pushDir: 1, breath: false,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { c.save(); const z = 2.2 + 0.06 * K.ease.sine(K.clamp(lt / 1.2)); c.translate(960, 540); c.scale(z, z); c.translate(-930, -350); E.drawWordmark(c, t - tWM, 0, wmOpt); c.restore(); },
        cues: A => [{ t: tWM + WM.c2, kind: 'pop' }, { t: tWM + WM.land, kind: 'tin' }] });
      // the end-screen hold (script v5): one continuous camera from the fist bump to the end (no visible cut between the
      // K shots; they only mark the acting beats for QC and the sound bed). Drift <= 1.5 %: a 1.2 % push in + ~0.5 % sway.
      const tJ6 = tWM + WM.land + 0.4, FG = { s: 0.82, dy: -170 }, fgK = t => K.ease.inOut(K.clamp((t - (tTag + 1.0)) / 2.5));
      const holdCam = (c, t) => { const lt = t - tJ6, u = K.ease.sine(K.clamp(lt / (T1 - tJ6))), z = 1.06 + 0.012 * u;
        c.translate(960 + 0.005 * K.W * Math.sin(lt * 0.23), 470 + 0.004 * K.H * Math.sin(lt * 0.19 + 1.1)); c.scale(z, z); c.translate(-960, -470); };
      const holdDraw = (c, t) => { const k = fgK(t); wmOpt.fg = k > 0 ? { s: K.lerp(1, FG.s, k), dy: FG.dy * k } : null;
        c.save(); holdCam(c, t); E.drawWordmark(c, t - tWM, 0, wmOpt); c.restore(); wmOpt.fg = null; };
      // screen space: the fade to black (no end-card guides: the clear lower half is enough)
      // Producer 2026-10-29: the dashed end-card guide boxes were animatic-only: removed (the lower half stays clear for the cards)
      const holdOver = (c, t) => {
        const f = K.clamp((t - (T1 - 1.0)) / 1.0); if (f > 0) { c.fillStyle = K.rgba('#000000', 0.9 * K.ease.sine(f)); c.fillRect(0, 0, K.W, K.H); } };   // to 90 % (QC: no pure-black frames at the end)
      const WMPOST = { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 };
      shots.push({ id: 'J06_bump', start: tJ6, bg: 'wm', breath: false, post: WMPOST,
        draw(c, t, lt) { holdDraw(c, t); c.save(); holdCam(c, t); K.char.extra(c, 900, 300, 60, 'ticks', t, { ink: '#fbe9cf' }); c.restore(); },
        cues: A => [{ t: tBump, kind: 'bonk_small' }] });

      // ================================================================ END SCREEN · the title scene holds (no tag)
      const hold = (id, start, o = {}) => shots.push(Object.assign({ id, start, bg: 'wm_hold', breath: false, post: WMPOST, draw(c, t, lt) { holdDraw(c, t); }, over: holdOver }, o));
      hold('K01_hold', tTag + 0.8);       // the tagline is in; the foreground starts to ease up (cards zone opens below)
      hold('K02_look', tTag + 4.4);       // they look at each other; Eli bobs on his heels
      hold('K03_valley', tTag + 7.3);     // both glance down at the valley road
      hold('K04_breeze', tTag + 10.3);    // Mila folds her arms (smug), Eli hands on hips; the ponytail in the breeze
      hold('K05_smile', tTag + 15.3);     // a smile to camera
      hold('K06_fade', T1 - 1.0, { fade: true });   // fade to black (declared: the audits do not sample faces inside it)
      return shots;
    },
    ambience(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const t0 = A.at('O', 1, { beat: '22' }), t1 = A.at('Puntos', 1, { beat: '24', edge: 'end' }) + END_HOLD, tEspE = w('espacio', 1, '23', { edge: 'end' }), tQ = A.at('Quién', 1, { beat: '23', speaker: 'eli' });
      const tWM = w('Esto', 1, '24') - 0.15;
      return [{ kind: 'wind', t0, t1: tWM }, { kind: 'road', t0, t1: tEspE + 0.3 }, { kind: 'music_light', t0, t1: tEspE }, { kind: 'road', t0: tQ + 1.5, t1: tWM },
        { kind: 'mila_theme', t0: w('detrás', 1, '24'), t1: tWM }, { kind: 'dusk_pad', t0: tWM, t1 }];   // v5: the title scene to the end (the score resolves on G)
    },
  });

  // ---------------------------------------------------------------- the bird insert again (the wire, golden sky): a wing up = approved
  let BI = null;
  function birdInsert(c, t, wing) {
    if (!BI) { const sky = K.canvas(K.W, K.H); K.sky.gradient(sky.ctx, [[0, '#6f72ad'], [0.45, '#c08fa8'], [0.8, '#f3ae84'], [1, '#ffd49a']], 0, K.H); K.sky.wash(sky.ctx, 1500, 900, 900, '#ffcf8a', 0.55);
      K.tex.paint(sky, { amount: 0.35, mottle: { w: 1200, h: 540, sx: 0.0025, sy: 0.02, seed: 23, amp: 30 } }); BI = { sky, clouds: E.goldenClouds([1500, 900], [[300, 300, 640, 130, 11, 4], [1200, 180, 560, 120, 12, 5], [1750, 420, 420, 90, 13, 6]]) }; }
    c.drawImage(BI.sky.c, 0, 0); K.sky.drawClouds(c, BI.clouds, t, {});
    const wy = x => 640 - (x - 960) * 0.12 + Math.pow((x - 960) / 960, 2) * 60;
    c.strokeStyle = K.rgba('#2e2028', 0.9); c.lineWidth = 6; c.beginPath(); for (let x = -40; x <= K.W + 40; x += 40) (x < 0 ? c.moveTo(x, wy(x)) : c.lineTo(x, wy(x))); c.stroke();
    c.lineWidth = 4; c.beginPath(); for (let x = -40; x <= K.W + 40; x += 40) (x < 0 ? c.moveTo(x, wy(x) + 70) : c.lineTo(x, wy(x) + 70)); c.stroke();
    K.particles.motes(c, t, { n: 30, seed: 41, color: '#ffe6b0', alpha: 0.5, size: 2.6, vx: 8, vy: -4 });
    P.bird(c, 980, wy(980), 120, { t, expr: 'calm', look: [-0.7, 0.4], rim: '#ffd88f', dir: -1, wing });
    K.light.grade(c, '#ff9a5a', 0.2, 'soft-light');
  }
})(typeof window !== 'undefined' ? window : globalThis);
