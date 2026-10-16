/* Ep 001 · BLOCK E2 · Act 5 + finale + end screen (beats 22-24, end card): the golden road of the hook again, same
   framing, same light (S11: the same tap as S1, Eli now keeps a safe gap; true sim). Cards DEJA UN ESPACIO SEGURO /
   MANEJA AL PROMEDIO, the glovebox gag, the same tap, the cascade dies at Eli, nobody brakes behind him, 5 s of
   silence, «¿…Quién fue?» / «Fuiste tú.», the bird raises a wing; crane up, the wordmark where Eli now CATCHES the dot
   and places it himself, fist bump; end screen: our bus stop, three buses at once, «¡¿Quién fue?!», Mila shrugs.
   Before the sim's own start (sim < 0) the cars cruise in the run's steady state (x0 + v t), which is exact: the run
   starts in equilibrium. Times from words or S11 events. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const ELI = 20, TAP = 26;

  A.block('E2', {
    t0: null, t1: null,
    async setup() {
      this.t0 = A.at('O', 1, { beat: '22' });
      this.t1 = A.at('La', 1, { beat: 'end' }) + 20;          // the end screen lasts 20 s (script)
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
      const tLa = w('La', 1, 'end'), tBuses = w('buses', 1, 'end'), tTres = w('tres', 1, 'end'), tQ2 = el('Quién', 1, 'end'), tQ2E = el('fue', 1, 'end', { edge: 'end' });
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
      shots.push({ id: 'H01_same', start: T0 - 0.05, bg: 'hw', focus: [960, 520], push: 0.025, pushDir: 1,
        draw(c, t, lt) { wide(c, t, G22(t)); P.plate(c, 960, 860, 'TÚ TAMBIÉN', 56, A.pulse(t, w('tú', 1, '22'), 0.25, 1.4, 0.3)); },
        cues: A => [{ t: w('tú', 1, '22'), kind: 'plate' }] });
      shots.push({ id: 'H02_gap', start: tAsi - 0.1, bg: 'hw_ots', focus: [960, 600], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G22(t), g = ots(c, t, ts); spring(c, g, ts, A.ramp(t, tEspacio, 0.3));
          P.plate(c, 960, 170, 'DEJA UN ESPACIO SEGURO', 56, A.ramp(t, tAsi + 0.1, 0.3));
          P.pill(c, 1380, 300, '✓ seguro', 34, A.ramp(t, tSeguro, 0.2), { bg: K.rgba('#23746C', 0.92) }); P.pill(c, 1380, 370, '✗ enorme', 34, A.ramp(t, tEnorme, 0.2), { bg: K.rgba('#b8452f', 0.92) }); },
        cues: A => [{ t: tAsi + 0.1, kind: 'plate' }, { t: tEspacio + 0.1, kind: 'spring' }] });
      // the glovebox gag: Eli takes off the badge and stores it (clac) -> the glovebox pops open, the badge jumps out
      // (boing) -> hold -> Mila's knee shuts it without looking; she hands the badge back... no: she keeps it, eyes on the road
      const tStore = tCerrarloE - 0.1;
      shots.push({ id: 'H03_store', start: tCorras - 0.2, bg: 'close', focus: [930, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G22(t), off = A.ramp(t, tCorras + 0.25, 0.25), lean = A.ramp(t, tCorras + 0.6, 0.3) * (1 - A.ramp(t, tStore, 0.2));
          inCar(c, t, ts, { z: 1.62, wx: 600, wy: 615, sx: 940, sy: 540 },
            { pose: off > 0.5 ? 'point' : 'clasp', view: 'q', dir: off > 0.5 ? -1 : 1, expr: 'determined', look: off > 0.5 ? [-0.8, 0.5] : [0.3, 0.6], lean: lean * 0.12, blink: eliBlink(t) },
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
            { pose: 'drive', view: 'q', dir: 1, expr: t < tKnee + 1.0 ? 'surprised' : 'sheepish', look: [0.2, 0.3], blink: eliBlink(t) },
            { pose: give > 0.3 ? 'palm' : 'lap', view: 'q', dir: 1, expr: 'smug', look: [0.9, -0.05], blink: milaBlink(t) },
            { badge: A.ramp(t, tKnee + 0.9, 0.2) }); },
        cues: A => [{ t: tVel, kind: 'plate' }] });
      // fingers drum on the wheel, a deep breath, the fingers calm down
      shots.push({ id: 'H04_breathe', start: tTrafE - 0.1, bg: 'close3', focus: [880, 480], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const ts = G22(t), calm = A.ramp(t, tGustaria + 0.2, 0.5), drum = 1 - calm;
          inCar(c, t, ts, { z: 2.0, wx: 650, wy: 560, sx: 940, sy: 560 },
            { pose: 'drive', view: 'q', dir: 1, expr: calm > 0.5 ? 'happy' : 'worried', look: [0.9, 0], tilt: drum * 0.04 * Math.sin(t * 30), lean: drum * 0.02 * Math.sin(t * 22), extras: calm > 0.3 && calm < 0.9 ? ['puff'] : [], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, expr: 'happy', look: [0.9, 0], blink: milaBlink(t) }, { badge: 1 });
          if (drum > 0.05) for (let k = 0; k < 3; k++) P.callout(c, 1240 + k * 50, 640 - (k % 2) * 30, 'tap', 30, drum * (Math.sin(t * 25 + k * 2) > 0 ? 1 : 0.3)); },
        cues: A => [{ t: tTrafE, kind: 'tick_tock', t1: tGustaria + 0.2 }, { t: tGustaria + 0.25, kind: 'blow' }] });
      shots.push({ id: 'H05_calm', start: tLlegas - 0.15, bg: 'close4', focus: [930, 540], push: 0.03, pushDir: -1,
        draw(c, t, lt) { inCar(c, t, G22(t), { z: 1.4, wx: 700, wy: 610, sx: 950, sy: 540 },
          { pose: 'drive', view: 'q', dir: 1, expr: 'happy', look: [0.9, -0.05], blink: eliBlink(t) }, { pose: 'lap', view: 'q', dir: -1, expr: 'happy', look: [-0.8, 0], headTurn: -0.2, blink: milaBlink(t) }, { badge: 1 }); } });
      shots.push({ id: 'H05_same', start: tMisma - 0.2, bg: 'hw_crane', focus: [960, 470], push: 0.025, pushDir: -1,
        over: (c, t) => { P.badge(c, 520, 860, '= distancia', 58, A.ramp(t, tMisma, 0.3)); P.badge(c, 960, 860, '= tiempo', 58, A.ramp(t, tMismo22, 0.3)); P.badge(c, 1400, 860, '− frenazos', 58, A.ramp(t, tMenos, 0.3)); },
        draw(c, t, lt) { const ts = G22(t), S = R().at(ts), xE = A.camX(ELI, ts, 2), sCam = xE - 22, aim = A.aim(sCam, -1.2, 11, 2100, xE + 12, 1.85, 0, [980, 400]);
          const g = A.hw(c, t, { simT: ts, sCam, lCam: -1.2, H: 11, pitch: aim.pitch, yaw: aim.yaw, f: 2100, fg: false, crew: tt => ({ eli: { pose: 'drive', expr: 'happy' }, mila: { pose: 'lap' } }) }); spring(c, g, ts, 0.8); void S; },
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
        draw(c, t, lt) { const ts = G23(t), g = ots(c, t, ts, { crew: tt => ({ eli: { pose: 'drive', blink: 0 }, mila: { pose: 'lap' } }) }); spring(c, g, ts, 1); },
        cues: A => [23, 22].map((car, k) => ({ t: tFreno + (A.ev('S11', 'brake_onset', e => e.car === car) - sTap) / 3, kind: 'brake_note', step: k + 2 })) });
      // the cascade reaches the car ahead... Eli eases off, never stops; the spring shrinks and stretches again
      shots.push({ id: 'I04_ease', start: tLeadV - 0.35, bg: 'close', label: 'ACELERADO ×3', focus: [920, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t);
          inCar(c, t, ts, { z: 1.45, wx: 700, wy: 615, sx: 940, sy: 540 },
            { pose: 'drive', view: 'q', dir: 1, expr: t < tLeadV + 0.2 ? 'determined' : 'happy', look: [0.9, 0], blink: eliBlink(t) },
            { pose: 'lap', view: 'q', dir: 1, expr: 'curious', look: [0.9, -0.05], blink: milaBlink(t) }, { badge: 1 }); },
        cues: A => [{ t: tLeadV, kind: 'brake_note', step: 6 }] });
      // over Eli's shoulder, looking back: the golden road, flowing, not one brake light
      shots.push({ id: 'I05_back', start: tLeadV + 1.6, bg: 'hw_rev', label: 'ACELERADO ×3', focus: [960, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), S = R().at(ts), xE = S.x[ELI];
          const sCam = xE + 0.6, aim = A.aim(sCam, 2.25, 1.55, 1050, xE - 45, 1.85, 0, [1120, 600], true);
          A.hw(c, t, { simT: ts, sCam, lCam: 2.25, H: 1.55, pitch: aim.pitch, yaw: aim.yaw, f: 1050, reverse: true, hide: i => i === ELI, carExpr: () => 'content' });
          // eyes pass: was a back-3/4 (only the back of the beanie read); now Eli turned round in his seat, 3/4 toward the
          // camera and looking down the road behind: curious, then the incredulous double take (no brake light at all)
          K.cast.draw(c, 'eli1', 300, 1400, 1500, { view: 'q', dir: 1, seated: true, pose: 'drive', t, light: FRONTLIT, look: [0.9, -0.05], blink: 0,
            expr: t < tLeadV + 2.0 ? 'curious' : 'surprised', tilt: -0.06 * A.ramp(t, tLeadV + 2.0, 0.25) }); },
        cues: A => [{ t: tLeadV + 2.6, kind: 'chirp' }] });
      shots.push({ id: 'I06_who', start: tQuien - 0.45, bg: 'close_tight', focus: [980, 470], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const ts = G23(t), sp = A.talk('eli', t, { gain: 0.6 });
          inCar(c, t, ts, { z: 1.9, wx: 650, wy: 500, sx: 980, sy: 560 },
            { pose: 'drive', view: 'q', dir: -1, expr: 'curious', look: [-0.9, -0.1], headTurn: 0.3, talk: sp.talk, viseme: sp.viseme, blink: 0 },
            { pose: 'lap', view: 'q', dir: 1, expr: 'happy', look: [-0.6, -0.1], blink: milaBlink(t) }, { badge: 1 });
          P.callout(c, 1300, 300, '¿…quién fue?', 52, A.pulse(t, tQuien, 0.15, tFueE - tQuien + 0.2, 0.2)); } });
      shots.push({ id: 'I07_you', start: tFuiste - 0.25, bg: 'close_mila', focus: [880, 500], push: 0.035, pushDir: -1,
        draw(c, t, lt) { const ts = G23(t), sp = A.talk('mila', t), laugh = t > tTuE + 0.2; let heads = null;
          heads = inCar(c, t, ts, { z: 1.7, wx: 600, wy: 560, sx: 900, sy: 560 },
            { pose: 'drive', view: 'q', dir: 1, expr: laugh ? 'laugh' : 'sheepish', look: [-0.5, 0], blink: eliBlink(t) },
            { pose: 'point', view: 'q', dir: 1, expr: 'happy', look: [0.9, 0], talk: sp.talk, viseme: sp.viseme, blink: 0 }, { badge: 1 });
          if (heads && heads.milaHead) K.cast.bubble(c, heads.milaHead, 'Fuiste tú.', A.pulse(t, tFuiste - 0.05, 0.1, tTuE - tFuiste + 0.25, 0.2)); },
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
            { pose: 'lap', view: 'q', dir: 1, expr: t > tPaciente ? 'happy' : 'neutral', look: [0.9, -0.1], blink: milaBlink(t) }, { badge: 1 }); } });
      // the wordmark, the payoff: Eli catches the dot ON TIME and places it on the i himself; fist bump
      const tWM = tEsto - 0.15, WM = { drop: 0.55, c1: 1.0, c2: tPuntosE - tWM, place: tPuntosE - tWM + 0.75, land: tPuntosE - tWM + 1.25, tagline: tPuntosE - tWM + 1.9 };
      const tBump = tWM + WM.land + 0.65;
      const wmOpt = { wm: WM, catch: true,
        eli: (o, tl, W) => {
          if (tl > W.c1 - 0.1) Object.assign(o, { look: [-0.5, -0.8], expr: 'determined' });
          if (tl > W.c2 - 0.12) Object.assign(o, { pose: 'palm', expr: 'surprised', blend: null, look: [-0.4, -0.6] });
          if (tl > W.c2 + 0.25) Object.assign(o, { pose: 'palm', expr: 'awe', look: [-0.3, -0.5] });
          if (tl > W.place) Object.assign(o, { pose: 'point', expr: 'happy', look: [-0.8, -0.3] });
          if (tl > W.land + 0.3) Object.assign(o, { pose: 'pump', expr: 'laugh', look: [-0.8, 0] });
        },
        mila: (o, tl, W) => { if (tl > W.c2) Object.assign(o, { expr: 'awe', look: [0.8, -0.4] }); if (tl > W.land + 0.3) Object.assign(o, { pose: 'pump', blend: null, expr: 'laugh', look: [0.8, 0] }); } };
      shots.push({ id: 'J04_wm', start: tWM, bg: 'wm', xf: 0.3, focus: [960, 520], push: 0.02, pushDir: 1, breath: true,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { E.drawWordmark(c, t - tWM, 0, wmOpt); },
        cues: A => [{ t: tWM - 0.2, kind: 'whoosh_wm' }, { t: tWM + WM.drop, kind: 'sting_drop' }, { t: tWM + WM.c1, kind: 'flick' }] });
      shots.push({ id: 'J05_catch', start: tWM + WM.c2 - 0.35, bg: 'wm_close', focus: [960, 540], push: 0.02, pushDir: 1, breath: false,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { c.save(); const z = 2.2 + 0.06 * K.ease.sine(K.clamp(lt / 1.2)); c.translate(960, 540); c.scale(z, z); c.translate(-930, -350); E.drawWordmark(c, t - tWM, 0, wmOpt); c.restore(); },
        cues: A => [{ t: tWM + WM.c2, kind: 'pop' }, { t: tWM + WM.land, kind: 'tin' }] });
      shots.push({ id: 'J06_bump', start: tWM + WM.land + 0.4, bg: 'wm', focus: [960, 470], push: 0.018, pushDir: -1, zBase: 1.08,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { E.drawWordmark(c, t - tWM, 0, wmOpt); K.char.extra(c, 900, 300, 60, 'ticks', t, { ink: '#fbe9cf' }); },
        cues: A => [{ t: tBump, kind: 'bonk_small' }] });

      // ================================================================ END SCREEN · three buses
      const ARR = tTres - 0.55, buses = (t, leave = -1) => [0, 1, 2].map(k => { const stopX = 230 + k * 580, arr = ARR + k * 0.18, u = K.clamp((t - (arr - 0.9)) / 0.9);
        let x = K.lerp(2300 + k * 600, stopX, K.ease.out(u)); if (leave > 0) x -= Math.pow(Math.max(0, t - leave - k * 0.15), 2) * 900;
        return { x, col: '#e2b04a', seed: k + 3, route: '3', puff: K.clamp((t - arr) / 0.6) * (t < arr + 0.6 ? 1 : 0), door: A.ramp(t, arr + 0.4, 0.2) }; });
      const duo = (c, t, GY, SEAT, eO, mO, o = {}) => {
        const rM = K.cast.draw(c, 'mila1', o.mx ?? 380, o.mSeat ? SEAT + 10 : GY, o.u ?? 520, Object.assign({ view: 'q', dir: 1, pose: 'crossed', expr: 'neutral', t, light: FRONTLIT, blink: milaBlink(t), seated: !!o.mSeat }, mO));
        const rE = K.cast.draw(c, 'eli1', o.ex ?? 600, o.eFeet ?? (o.eSeat ? SEAT + 10 : GY), o.u ?? 540, Object.assign({ view: 'q', dir: -1, pose: 'hips', expr: 'annoyed', t, light: FRONTLIT, blink: eliBlink(t), seated: !!o.eSeat }, eO));
        return { rE, rM }; };
      const watch = (c, t, a) => P.thought(c, 760, 230, 170, 130, a, cx => { cx.fillStyle = '#fbf3e4'; cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 6; K.circle(cx, 0, 0, 44); cx.fill(); cx.stroke();
        cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, -32); cx.moveTo(0, 0); const an = t * 4; cx.lineTo(Math.cos(an) * 26, Math.sin(an) * 26); cx.stroke(); });
      shots.push({ id: 'K01_wait', start: tLa - 0.15, bg: 'busstop', xf: 0.25, focus: [700, 500], push: 0.03, pushDir: 1, post: { grain: 0.12, vignette: 0.35, vignetteColor: '#3a2030', bloom: 0.18 },
        draw(c, t, lt) { A.busStop(c, t, { chars: (cx, GY, SEAT) => duo(cx, t, GY, SEAT, { pose: 'hips', expr: 'annoyed', look: [0.9, 0], lean: 0.02 * Math.sin(t * 8) }, { pose: 'lap', expr: 'neutral', look: [0.9, 0] }), buses: buses(t) });
          watch(c, t, A.pulse(t, tLa + 0.4, 0.2, 1.4, 0.2)); },
        cues: A => [{ t: tLa + 0.5, kind: 'tick_tock', t1: tBuses }] });
      shots.push({ id: 'K02_three', start: ARR - 0.5, bg: 'busstop_buses', focus: [960, 600], push: 0.025, pushDir: -1, post: { grain: 0.12, vignette: 0.35, vignetteColor: '#3a2030', bloom: 0.18 },
        draw(c, t, lt) { A.busStop(c, t, { chars: (cx, GY, SEAT) => duo(cx, t, GY, SEAT, { pose: 'surprise', expr: 'surprised', look: [0.9, 0] }, { pose: 'crossed', expr: 'curious', look: [0.9, 0] }), buses: buses(t) });
          P.badge(c, 1560, 180, '3', 90, A.ramp(t, tTres, 0.25), 'de a tres'); },
        cues: A => [0, 1, 2].map(k => ({ t: ARR + k * 0.18, kind: 'blow' })).concat([{ t: ARR + 0.5, kind: 'ding' }]) });
      shots.push({ id: 'K03_who', start: tQ2 - 0.45, bg: 'busstop_bench', focus: [600, 360], push: 0.04, pushDir: 1, post: { grain: 0.12, vignette: 0.35, vignetteColor: '#3a2030', bloom: 0.18 },
        draw(c, t, lt) { const sp = A.talk('eli', t); let rr = null, shrug = t > tQ2E + 0.25;
          A.busStop(c, t, { chars: (cx, GY, SEAT) => { rr = duo(cx, t, GY, SEAT, { pose: 'fist', expr: 'furious', look: [0.8, -0.1], talk: sp.talk, viseme: sp.viseme, extras: ['anger'] },
            shrug ? { view: 'front', pose: 'shrug', expr: 'happy', look: [0, 0] } : { pose: 'crossed', expr: 'neutral', look: [0.6, -0.4] }, { eFeet: SEAT }); }, buses: buses(t) });
          if (rr && rr.rE) K.cast.bubble(c, rr.rE.head, '¡¿QUIÉN FUE?!', A.pulse(t, tQ2 - 0.05, 0.08, tQ2E - tQ2 + 0.35, 0.2)); },
        cues: A => [{ t: tQ2, kind: 'pop' }, { t: tQ2E + 0.3, kind: 'shrug_wave', n: 3, d: 0.1 }] });
      // the end-card zone: the pair sits on the left, the right 55 % stays clear (YouTube end-screen elements go there)
      const tSit = tQ2E + 1.4, tLeave = tSit + 0.3;
      const cards = c => { c.save(); c.setLineDash([16, 12]); c.strokeStyle = K.rgba('#fbf3e4', 0.35); c.lineWidth = 4; K.rrect(c, 1100, 150, 680, 383, 18); c.stroke(); K.rrect(c, 1100, 580, 680, 383, 18); c.stroke(); c.restore(); };
      const endShot = (id, start, o) => shots.push({ id, start, bg: 'busstop_end_' + id, focus: o.focus || [700, 560], push: 0.02, pushDir: o.dir || 1, post: { grain: 0.12, vignette: 0.35, vignetteColor: '#3a2030', bloom: 0.18 },
        over: cards, draw(c, t, lt) { const stand = o.stand ? o.stand(t) : false; A.busStop(c, t, { chars: (cx, GY, SEAT) => duo(cx, t, GY, SEAT, o.eO(t), o.mO(t), { eSeat: !stand, mSeat: true, mx: 360, ex: 610 }), buses: o.buses ? o.buses(t) : buses(t, tLeave), bird: o.bird ? (cx, x, y) => o.bird(cx, x, y, t) : null }); },
        cues: o.cues });
      endShot('K04_sit', tSit, { eO: t => ({ pose: 'crossed', expr: 'grumpy', look: [-0.6, 0.1] }), mO: t => ({ pose: 'sit', expr: 'happy', look: [0.7, 0] }), cues: A => [{ t: tLeave + 0.2, kind: 'whoosh_up' }] });
      // a fourth bus goes by without stopping: Eli jumps up waving, it is gone, he sits back down
      const tBy = tSit + 4.5, inBy = t => t > tBy - 0.2 && t < tBy + 1.9;
      endShot('K05_late', tSit + 4.0, { focus: [620, 520], dir: -1, stand: inBy,
        eO: t => (inBy(t) ? { pose: 'wave', view: 'front', expr: 'worried', look: [0.8, 0] } : { pose: 'sit', expr: t > tBy ? 'sheepish' : 'annoyed', look: [0.8, -0.3] }),
        mO: t => ({ pose: 'sit', expr: t > tBy + 0.6 ? 'laugh' : 'neutral', look: [0.8, 0] }),
        buses: t => [{ x: K.lerp(2300, -900, K.clamp((t - tBy) / 1.4)), col: '#e2b04a', seed: 9, route: '3' }],
        cues: A => [{ t: tBy + 0.3, kind: 'whoosh_up' }, { t: tBy + 1.0, kind: 'minor' }] });
      endShot('K06_bird', tSit + 8.0, { focus: [760, 480], eO: t => ({ pose: 'sit', expr: 'happy', look: [0.4, -0.8] }), mO: t => ({ pose: 'sit', expr: 'happy', look: [0.5, -0.8] }),
        bird: (cx, x, y, t) => { const land = K.clamp((t - (tSit + 8.4)) / 0.6); P.bird(cx, K.lerp(x + 400, x, K.ease.out(land)), K.lerp(y - 300, y, K.ease.out(land)), 30, { t, expr: 'calm', look: [-0.6, 0.4], dir: -1, rim: '#ffd88f', wing: A.pulse(t, tSit + 9.4, 0.2, 0.6, 0.2) }); },
        cues: A => [{ t: tSit + 8.4, kind: 'flutter' }, { t: tSit + 9.5, kind: 'chirp' }] });
      endShot('K07_hold', tSit + 11.8, { focus: [700, 540], dir: -1, eO: t => ({ pose: 'belly', expr: 'laugh', look: [-0.5, 0] }), mO: t => ({ pose: 'sit', expr: 'happy', look: [-0.5, 0] }),
        bird: (cx, x, y, t) => P.bird(cx, x, y, 30, { t, expr: 'calm', look: [-0.6, 0.4], dir: -1, rim: '#ffd88f' }) });
      return shots;
    },
    ambience(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const t0 = A.at('O', 1, { beat: '22' }), t1 = A.at('La', 1, { beat: 'end' }) + 20, tEspE = w('espacio', 1, '23', { edge: 'end' }), tQ = A.at('Quién', 1, { beat: '23', speaker: 'eli' });
      const tWM = w('Esto', 1, '24') - 0.15, tLa = w('La', 1, 'end');
      return [{ kind: 'wind', t0, t1: tWM }, { kind: 'road', t0, t1: tEspE + 0.3 }, { kind: 'music_light', t0, t1: tEspE }, { kind: 'road', t0: tQ + 1.5, t1: tWM },
        { kind: 'mila_theme', t0: w('detrás', 1, '24'), t1: tWM }, { kind: 'dusk_pad', t0: tWM, t1: tLa }, { kind: 'music_light', t0: tLa, t1 }, { kind: 'field_birds', t0: tLa, t1 }];
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
