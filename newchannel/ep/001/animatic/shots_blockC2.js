/* Ep 001 · BLOCK C2 · Act 2, beats 11-13: a wave, not a place (S2 marked car + the stadium wave), three cars too many
   (the dome, S5_25 vs S5_28, split screen) and «hace media hora» (S6 at night, the driver at dinner). Times from words
   (A.at) or sim events (A.ev). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const REC = 'RECREACIÓN ILUSTRADA', SRC2 = 'Tadaki et al., New J. Phys. 2013';

  A.block('C2', {
    t0: null, t1: null,
    async setup() { this.t0 = A.at('No', 1, { beat: '11' }); this.t1 = A.at('Entonces', 1, { beat: '14' }); },
    post: { grain: 0.13, vignette: 0.4, vignetteColor: '#2a1a2a', bloom: 0.18 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      // ---- words
      const tEntran = w('entran', 1, '11'), tSalen = w('salen', 1, '11'), tLos2 = w('Los', 2, '11'), tVan = w('van', 1, '11'), tQueda = w('queda', 1, '11');
      const tEs1 = w('Es', 2, '11'), tNadie = w('nadie', 1, '11'), tPero11 = w('pero', 1, '11'), tVueltaE = w('entera', 1, '11', { edge: 'end' }), tUn = w('Un', 3, '11'), tEs2 = w('Es', 3, '11'), tOla3 = w('ola', 3, '11');
      const tPero = w('Pero', 1, '12'), tEl = w('El', 1, '12'), tEstadio = w('estadio', 1, '12'), tCon1 = w('con', 1, '12'), tTresc = w('trescientos', 1, '12'), tMetrosE = w('metros', 1, '12', { edge: 'end' });
      const tCon2 = w('Con', 2, '12'), tVeinti5 = w('veinticinco', 1, '12'), tCon3 = w('Con', 3, '12'), tVeinti8 = w('veintiocho', 1, '12'), tEmbot = w('embotellamiento', 1, '12'), tTres = w('Tres', 1, '12');
      const tQuien = A.at('Quién', 1, { beat: '12', speaker: 'eli' }), tF = A.at('f', 1, { beat: '12', speaker: 'eli', edge: 'end' }), tLo = w('Lo', 1, '12'), tTramo = w('tramo', 1, '12');
      const tLos12 = w('los', 2, '12'), tDens = w('densidad', 1, '12'), tPor1 = w('Por', 1, '12'), tPor2 = w('Por', 2, '12'), tCrecenE = w('crecen', 1, '12', { edge: 'end' });
      const tAhora = w('Ahora', 1, '13'), tAhi = w('Ahí', 1, '13'), tDiez = w('diez', 1, '13'), tA13 = w('a', 2, '13'), tO = w('O', 2, '13');
      const tEmb13 = w('embotellamiento', 1, '13'), tTrancon = w('trancón', 1, '13'), tTaco = w('taco', 1, '13'), tTrafico = w('tráfico', 1, '13'), tEn13 = w('en', 2, '13');
      const tPudo = w('pudo', 1, '13'), tMedia = w('media', 1, '13'), tEse = w('Ese', 2, '13'), tCasa = w('casa', 1, '13'), tSeguro = w('Seguro', 1, '13'), tPor13 = w('Por', 2, '13');
      const tRazon2 = w('razón', 2, '13'), tCenarE = w('cenar', 1, '13', { edge: 'end' }), tNi = A.at('Ni', 1, { beat: '13', speaker: 'eli' }), tPerdonE = A.at('perdón', 1, { beat: '13', speaker: 'eli', edge: 'end' });
      // ---- sim events
      const sEnter = A.ev('S2', 'marked_enters_jam'), M2 = A.map(sEnter, tEntran, 3);
      const s28 = A.ev('S5_28', 'first_stop'), D28 = A.map(s28, tEmbot, 10), D25 = A.map(s28, tEmbot, 10);
      const sTap6 = A.ev('S6', 'tap_start'), N6 = A.map(sTap6, tAhi, 120);
      const LF = A.LIGHT_FIELD, NL = Object.assign({}, K.cast.LIGHT.night);
      const rec = (c, acc) => P.pill(c, 96, acc ? 152 : 84, REC, 26, 1);
      const R25 = () => A.adapter('S5_25'), R28 = () => A.adapter('S5_28');
      const shots = [];

      // ================================================================ BEAT 11 · a wave, not a place (S2, marked car)
      const MARK = 3;
      const balloon = (cx, x, y, a = 1) => { cx.save(); cx.globalAlpha = a; cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x, y - 6); cx.quadraticCurveTo(x + 6, y - 40, x, y - 70); cx.stroke();
        cx.fillStyle = '#f2c230'; cx.lineWidth = 3; K.ellipse(cx, x, y - 92, 18, 22); cx.fill(); cx.stroke(); cx.fillStyle = K.rgba('#ffffff', 0.6); K.ellipse(cx, x - 6, y - 99, 5, 7); cx.fill(); cx.restore(); };
      const follow = (c, t, z, ts, pick) => { const p = A.clampView(pick(ts), z); c.translate(960, 540); c.scale(z, z); c.translate(-p[0], -p[1]); };
      shots.push({ id: 'D01_notfixed', start: T0 - 0.05, bg: 'ring_follow', label: 'ACELERADO ×3', focus: [960, 540], push: 0.025, over: (c) => rec(c, true),
        draw(c, t, lt) { const ts = M2(t); c.save(); follow(c, t, 1.5, ts, tt => A.angPt(A.jamSmooth(tt, 3) - 0.35));
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'), carOver: (cx, i, x, y) => { if (i === MARK) balloon(cx, x, y - 10); } }); c.restore(); } });
      shots.push({ id: 'D02_through', start: tEntran - 0.25, bg: 'ring_close', label: 'ACELERADO ×3', focus: [960, 540], push: 0.03, pushDir: 1, over: (c) => rec(c, true),
        draw(c, t, lt) { const ts = M2(t); c.save(); follow(c, t, 2.3, ts, tt => { const S = A.s2().at(tt); return A.ringPt(MARK, S); });
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (i === MARK ? (st ? 'sleepy' : 'delighted') : st ? 'annoyed' : 'content'), carOver: (cx, i, x, y, b, S) => { if (i === MARK) balloon(cx, x, y - 10);
            if (S.v[i] > 2 && i === MARK) { const a = A.ringAng(i, S), p1 = A.angPt(a), p2 = A.angPt(a + 0.05); P.chevron(cx, x + 40, y - 30, 12, Math.atan2(p2[1] - p1[1], p2[0] - p1[0]), 1); } } }); c.restore(); },
        cues: A => [{ t: tEntran, kind: 'pop' }, { t: tSalen, kind: 'whoosh_up' }] });
      shots.push({ id: 'D03_stays', start: tLos2 - 0.1, bg: 'ring', label: 'ACELERADO ×3', focus: [960, 540], push: 0.022, pushDir: -1, over: (c) => rec(c, true),
        draw(c, t, lt) { const ts = M2(t);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'),
            carOver: (cx, i, x, y, b, S) => { if (i === MARK) balloon(cx, x, y - 10); if (S.v[i] < 1) P.ring(cx, x, y - 8, 26, 18, A.ramp(t, tQueda - 0.2, 0.3), { w: 3 }); } }); } });

      // ---- the stadium wave; Eli is late (1st time)
      const waveX = t => K.lerp(-300, 2300, (t - tNadie + 0.3) / 3.0);           // the crest crosses the frame in ~3 s
      const waveAt = t => x => Math.exp(-Math.pow((x - waveX(t)) / 160, 2));
      const lateUp = tVueltaE + 0.15;
      // stand-up in the stands (Guardian v3: it was a one-frame jump of a whole leg length): e 0 -> 1 raises the hips
      // continuously from the seat (y) to standing (+ jump px); in between the character stands crouched (K.cast crouch)
      // with the feet just below the seat line, behind the row in front
      const rise = (c, id, x, y, u, e, jump, o) => {
        if (e <= 0.002) return Object.assign(K.cast.draw(c, id, x, y, u, Object.assign({}, o, { seated: true })), { lap: 0 });
        const L = K.cast.SPECS[K.cast.ALIAS[id] || id].legLen, D = 0.75 * L * (1 - e), yh = y - e * (L * u + jump);
        return Object.assign(K.cast.draw(c, id, x, yh + (L - D) * u, u, Object.assign({}, o, { seated: false, crouch: D })), { lap: y - yh });
      };
      const upK = v => K.ease.sine(K.clamp((v - 0.12) / 0.5));
      const heroes = (c, t, y, R, o = {}) => {
        const mUp = waveAt(t)(860), eUp = t > lateUp - 0.04 ? A.pulse(t, lateUp - 0.04, 0.24, 0.76, 0.4) : 0;
        rise(c, 'mila1', 860, y + 8, 260, upK(mUp), 0, { view: 'front', ...A.pzv(mUp, 0.4, 'lap', 'cheer'), ...A.ez(mUp, 0.4, 'happy', 'laugh', 0.12), t, light: LF });
        const rE = rise(c, 'eli1', 1000, y + 8, 260, eUp, 60, { view: 'front', ...A.pzv(eUp, 0.3, 'lap', 'cheer'), expr: eUp > 0.3 ? (t > lateUp + 0.5 ? 'sheepish' : 'happy') : (o.popcorn ? 'content' : 'happy'), look: eUp > 0.3 && t > lateUp + 0.45 ? [Math.sin(t * 4) * 0.8, 0] : [0, 0.3], t, light: LF });
        // the popcorn bucket stays with Eli in every stadium shot (Guardian: it vanished when he stood up and in D06):
        // on his lap when seated, carried up into his raised hand as he jumps up late (no one-frame jump)
        popBucket(c, y, rE, K.ease.sine(K.clamp((eUp - 0.1) / 0.6)));
      };
      const popBucket = (c, y, rE, k) => { const lx = 1031, ly = y - 17 - rE.lap;
        if (k <= 0) popcorn(c, lx, ly); else popcorn(c, K.lerp(lx, rE.hands.trail[0] + 6, k), K.lerp(ly, rE.hands.trail[1] - 20, k), K.lerp(1, 0.85, k)); };
      const popcorn = (c, x, y, k = 1) => { c.save(); c.translate(x, y); c.scale(k, k);
        c.fillStyle = '#c94a5a'; c.strokeStyle = '#2a1a1e'; c.lineWidth = 3; c.beginPath(); c.moveTo(-21, -23); c.lineTo(21, -23); c.lineTo(15, 23); c.lineTo(-15, 23); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#fff4dc'; for (let j = 0; j < 6; j++) { K.circle(c, -17 + j * 7, -27 - (j % 2) * 6, 7); c.fill(); } c.restore(); };
      shots.push({ id: 'D04_stadium', start: tEs1 - 0.1, bg: 'stadium', focus: [960, 560], push: 0.022, pushDir: 1,
        draw(c, t, lt) { A.stadium(c, t, { wave: waveAt(t), row: 2, skip: f => f.row === 2 && f.x > 800 && f.x < 1070, chars: (cx, y, R) => heroes(cx, t, y, R, { popcorn: true }) }); },
        cues: A => [{ t: tNadie - 0.2, kind: 'crowd_wave', t1: tVueltaE }] });
      shots.push({ id: 'D05_row', start: tNadie + 0.4, bg: 'stadium_close', focus: [960, 600], push: 0.03, pushDir: -1, breath: true,
        draw(c, t, lt) { c.save(); c.translate(960, 600); c.scale(1.9, 1.9); c.translate(-930, -820);
          A.stadium(c, t, { wave: waveAt(t), row: 2, skip: f => f.row === 2 && f.x > 800 && f.x < 1070, chars: (cx, y, R) => heroes(cx, t, y, R, { popcorn: true }) }); c.restore(); } });
      shots.push({ id: 'D05_late', start: lateUp - 0.35, bg: 'stadium_eli', focus: [960, 520], push: 0.035, pushDir: 1,
        draw(c, t, lt) { c.save(); c.translate(960, 560); c.scale(3.0, 3.0); c.translate(-1000, -750);
          A.stadium(c, t, { wave: waveAt(t), row: 2, skip: f => f.row === 2 && f.x > 800 && f.x < 1070, chars: (cx, y, R) => heroes(cx, t, y, R) }); c.restore(); },
        cues: A => [{ t: lateUp, kind: 'eh' }] });
      shots.push({ id: 'D06_plate', start: tUn - 0.1, bg: 'stadium_wide', focus: [960, 520], push: 0.022, pushDir: -1,
        draw(c, t, lt) { const w2 = x => Math.exp(-Math.pow((x - K.lerp(-300, 2300, ((t - tUn) % 3.2) / 3.2)) / 160, 2));
          A.stadium(c, t, { wave: w2, row: 2, skip: f => f.row === 2 && f.x > 800 && f.x < 1070, chars: (cx, y) => { rise(cx, 'mila1', 860, y + 8, 260, upK(w2(860)), 0, { view: 'front', ...A.pzv(w2(860), 0.4, 'lap', 'cheer'), expr: 'laugh', t, light: LF });
            const rE = rise(cx, 'eli1', 1000, y + 8, 260, upK(w2(1000)), 0, { view: 'front', ...A.pzv(w2(1000), 0.4, 'lap', 'cheer'), ...A.ez(w2(1000), 0.4, 'happy', 'laugh', 0.12), t, light: LF });
            popBucket(cx, y, rE, K.ease.sine(K.clamp((w2(1000) - 0.3) / 0.2))); } });
          P.plate(c, 960, 240, 'UN EMBOTELLAMIENTO ES UNA OLA', 54, A.ramp(t, tEs2 - 0.1, 0.3)); },
        cues: A => [{ t: tEs2 - 0.1, kind: 'plate' }] });

      // ================================================================ BEAT 12 · three cars too many (the dome)
      const dsrc = (c) => P.source(c, SRC2, 1);
      shots.push({ id: 'D07_dome', start: tPero - 0.1, bg: 'dome', focus: [960, 560], push: 0.022, pushDir: 1, over: (c) => { rec(c, false); },
        post: { grain: 0.13, vignette: 0.45, vignetteColor: '#1a1020', bloom: 0.25 },
        draw(c, t, lt) { A.dome(c, t, { run: R25(), simT: 100 + (t - tPero) }); } });
      shots.push({ id: 'D08_cars', start: tEl - 0.1, bg: 'dome_close', focus: [960, 560], push: 0.03, pushDir: -1, over: (c) => { rec(c, false); dsrc(c); },
        post: { grain: 0.13, vignette: 0.45, vignetteColor: '#1a1020', bloom: 0.25 },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(2.0, 2.0); c.translate(-1060, -800); A.dome(c, t, { run: R25(), simT: 100 + (t - tPero) }); c.restore(); } });
      shots.push({ id: 'D08_domo', start: tEstadio - 0.1, bg: 'dome', focus: [960, 520], push: 0.02, pushDir: -1, zBase: 1.08, over: (c) => { rec(c, false); dsrc(c); },
        post: { grain: 0.13, vignette: 0.45, vignetteColor: '#1a1020', bloom: 0.25 },
        draw(c, t, lt) { A.dome(c, t, { run: R25(), simT: 100 + (t - tPero) }); } });
      shots.push({ id: 'D09_314', start: tCon1 - 0.1, bg: 'dome_tape', focus: [960, 560], push: 0.025, pushDir: 1, over: (c) => { rec(c, false); dsrc(c); },
        post: { grain: 0.13, vignette: 0.45, vignetteColor: '#1a1020', bloom: 0.25 },
        draw(c, t, lt) { const k = K.clamp((t - tTresc + 0.2) / (tMetrosE - tTresc + 0.2)), v = A.domeView();
          A.dome(c, t, { run: R25(), simT: 100 + (t - tPero), marks: (cx, view) => { const n = 120, m = Math.max(2, Math.round(n * k)); cx.save(); cx.lineCap = 'round'; cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 15; cx.beginPath();
            for (let j = 0; j <= m; j++) { const p = A.domePt(2.2 + j / n * K.TAU, view, 6.5); j ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); } cx.stroke(); cx.strokeStyle = '#e2b04a'; cx.lineWidth = 10; cx.stroke(); cx.restore(); } });
          if (k > 0.95) P.badge(c, 1500, 260, '314 m', 70, K.clamp((k - 0.95) / 0.05)); void v; } });
      // split screen: 25 (left) vs 28 (right), same drivers, same seed (×10)
      const split = (c, t, o) => {
        const vL = A.domeView(7.6, 480, 600), vR = A.domeView(7.6, 1440, 600);
        A.dome(c, t, { run: R25(), simT: D25(t), view: vL, k: 2.6 });
        c.save(); c.beginPath(); c.rect(960, 0, 960, K.H); c.clip(); A.dome(c, t, { run: R28(), simT: D28(t), view: vR, k: 2.6, bg: false, eli: 18, drop: o.drop, hide: o.hide, carOver: o.carOver28, marks: o.marks28 }); c.restore();
        if (o.marks25) o.marks25(c, vL, R25().at(D25(t)));
        c.fillStyle = '#1a1020'; c.fillRect(956, 0, 8, K.H);
        P.badge(c, 480, 300, '25', 80, o.a25 ?? 1); P.badge(c, 1440, 300, '28', 80, o.a28 ?? 1);
      };
      const domePost = { grain: 0.13, vignette: 0.4, vignetteColor: '#1a1020', bloom: 0.22 };
      shots.push({ id: 'D10_25', start: tCon2 - 0.12, bg: 'split', label: 'ACELERADO ×10', focus: [960, 560], push: 0.02, post: domePost, over: (c) => { rec(c, true); dsrc(c); },
        draw(c, t, lt) { split(c, t, { a25: A.ramp(t, tVeinti5, 0.2), a28: 0.25 }); } });
      shots.push({ id: 'D11_28', start: tCon3 - 0.12, bg: 'split2', label: 'ACELERADO ×10', focus: [1250, 560], push: 0.03, pushDir: 1, post: domePost, over: (c) => { rec(c, true); dsrc(c); },
        draw(c, t, lt) { split(c, t, { a28: A.ramp(t, tVeinti8, 0.2), carOver28: (cx, i, x, y, S) => { if (S.v[i] < 0.5) P.ring(cx, x, y - 6, 22, 14, A.ramp(t, tEmbot, 0.3), { w: 3 }); } }); },
        cues: A => [{ t: tEmbot, kind: 'clonc' }] });
      // three cars drop into the right ring (Eli is one of them)
      const added = [9, 18, 27], dropT = i => tTres + 0.12 + added.indexOf(i) * 0.28;
      shots.push({ id: 'D12_drop', start: tTres - 0.12, bg: 'dome28', label: 'ACELERADO ×10', focus: [960, 560], push: 0.03, post: domePost, over: (c) => rec(c, true),
        draw(c, t, lt) { A.dome(c, t, { run: R28(), simT: D28(t), eli: 18, drop: i => (added.includes(i) ? Math.max(0, 1 - K.ease.in(K.clamp((t - dropT(i) + 0.4) / 0.4))) * 700 : 0),
          carOver: (cx, i, x, y, S) => { if (added.includes(i) && t > dropT(i) && t < dropT(i) + 0.4) P.ring(cx, x, y - 6, 40, 22, 1 - (t - dropT(i)) / 0.4, { w: 4 }); } }); },
        cues: A => added.map(i => ({ t: dropT(i), kind: 'plop' })) });
      // Eli in his car on the dome: «¡¿Quién f…?» — sees himself on the big screen — closes his mouth; Mila: «upsi»
      shots.push({ id: 'D13_quienf', start: tQuien - 0.3, bg: 'dome_eli', focus: [960, 520], push: 0.035, pushDir: 1, post: domePost,
        draw(c, t, lt) { const ts = D28(t);
          c.save(); c.translate(960, 560); c.scale(3.4, 3.4); const v = A.domeView(), S = R28().at(ts), a = A.ringAng ? ((S.x[18] % 314) / 314 * K.TAU) : 0, p = A.domePt(a, v); c.translate(-p[0], -p[1] + 20);
          A.dome(c, t, { run: R28(), simT: ts, eli: 18, carOver: (cx, i, x, y) => { if (i === 18) { const r = K.cast.draw(cx, 'eli1', x + 6, y - 6, 80, { view: 'front', pose: 'fist', expr: 'furious', t, light: K.cast.LIGHT.golden, talk: 0 }); A._eh = r.head; } } });
          c.restore();
          },
        cues: A => [{ t: tQuien, kind: 'pop' }, { t: tF, kind: 'record_scratch' }] });
      shots.push({ id: 'D13_screen', start: tF + 0.05, bg: 'dome_screen', sayAvoid: [[520, 30, 1400, 520]],   // the big screen is the gag: no text box on it
        focus: [960, 500], push: 0.03, pushDir: -1, post: domePost,
        draw(c, t, lt) { A.dome(c, t, { run: R28(), simT: D28(t), eli: 18 });
          // the stadium's big screen: Eli, mouth open, with an arrow pointing at him
          c.fillStyle = '#14101e'; K.rrect(c, 560, 70, 800, 450, 18); c.fill(); c.fillStyle = '#3a3050'; K.rrect(c, 580, 90, 760, 410, 10); c.fill();
          c.save(); c.beginPath(); c.rect(580, 90, 760, 410); c.clip(); c.fillStyle = '#6f8a5a'; c.fillRect(580, 90, 760, 410);
          K.cast.draw(c, 'eli1', 900, 700, 620, { view: 'front', pose: 'fist', expr: 'furious', t, light: K.cast.LIGHT.board }); c.restore();
          P.chevron(c, 1240, 230, 50, Math.PI * 0.8, 1, '#f2c230'); P.pill(c, 1250, 150, 'ÉL', 40, 1, { align: 'center' }); } });
      shots.push({ id: 'D13_upsi', start: tF + 0.75, bg: 'dome_stand', focus: [960, 520], push: 0.03, pushDir: 1, post: domePost,
        draw(c, t, lt) { c.save(); c.translate(960, 600); c.scale(1.6, 1.6); c.translate(-760, -395); A.dome(c, t, { run: R28(), simT: D28(t), eli: 18 }); c.restore();   // Guardian: y -300 -> -395 (a dark band showed above the dome canvas)
          // Eli is still IN his car (he is one of the three cars that fell; script: «cierra la boca despacio»). Guardian:
          // he used to stand on the field in the drive pose with no car under him
          K.car.front(c, 1420, 1150, 259, { color: K.TEAL, head: 0.35, glowScale: 0.5, lit: { rim: '#ffd99a', shade: '#3a3358', ang: -1.2, shadeK: 0.2 },
            drawDriver: (x, top, s) => K.cast.draw(c, 'eli1', x, top + 0.34 * s, 700, { view: 'front', pose: 'lap', seated: true, look: [-0.5, 0], expr: t < tF + 1.5 ? 'surprised' : 'sheepish', t, light: K.cast.LIGHT.golden }) });
          K.cast.draw(c, 'mila1', 520, 1100, 520, { view: 'q', dir: 1, pose: 'wave', expr: 'smug', t, light: K.cast.LIGHT.golden }); { const ua = A.pulse(t, tF + 1.3, 0.1, 0.6, 0.2), hm = A._heads && A._heads.mila;   // Mila's «upsi»: a text box (no voice)
            if (ua > 0.003) { c.save(); c.setTransform(K.OUTSCALE, 0, 0, K.OUTSCALE, 0, 0);   // screen space (heads are screen coords)
              K.tbox.draw(c, { text: 'upsi', kind: 'speech', head: hm ? hm.head : null, light: hm ? hm.light : 'golden', age: t - (tF + 1.3), a: ua, out: K.clamp((t - (tF + 2.0)) / 0.2), avoid: [] }); c.restore(); } } } });
      // density: a stretch of track counted (4 vs 5), the word, the meter
      const segMarks = (cx, view, S, R) => { const a0 = -0.3, a1 = 0.45; cx.save(); cx.strokeStyle = K.rgba('#f2c230', 0.85); cx.lineWidth = 20; cx.lineCap = 'round'; cx.beginPath();
        for (let j = 0; j <= 20; j++) { const p = A.domePt(K.lerp(a0, a1, j / 20), view, -6); j ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); } cx.stroke(); cx.restore();
        let n = 0; for (let i = 0; i < R.N; i++) { const a = ((S.x[i] % 314) / 314) * K.TAU; const d = Math.atan2(Math.sin(a - (a0 + a1) / 2), Math.cos(a - (a0 + a1) / 2)); if (Math.abs(d) < (a1 - a0) / 2) n++; }
        const p = A.domePt((a0 + a1) / 2, view, 16); P.badge(cx, p[0] + 40, p[1] + 50, String(n), 56, 1); };
      shots.push({ id: 'D14_tramo', start: tLo + 0.55, bg: 'split3', label: 'ACELERADO ×10', focus: [960, 560], push: 0.022, pushDir: -1, post: domePost, over: (c) => rec(c, true),
        draw(c, t, lt) { split(c, t, { marks25: (cx, v, S) => { if (t > tTramo - 0.2) segMarks(cx, v, S, R25()); }, marks28: (cx, v, S) => { if (t > tTramo - 0.2) segMarks(cx, v, S, R28()); } }); } });
      const meter = (c, x, y, v, a) => { if (a <= 0.01) return; c.save(); c.globalAlpha = a; c.translate(x, y);
        const cols = ['#5aa36a', '#a3b85a', '#e2b04a', '#d9773a', '#a8466e']; for (let k = 0; k < 5; k++) { c.strokeStyle = cols[k]; c.lineWidth = 34; c.beginPath(); c.arc(0, 0, 150, Math.PI + k / 5 * Math.PI, Math.PI + (k + 1) / 5 * Math.PI); c.stroke(); }
        c.strokeStyle = '#2a1a1e'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 168, Math.PI, 0); c.stroke();
        const an = Math.PI + K.clamp(v) * Math.PI; c.strokeStyle = '#2a1a1e'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * 130, Math.sin(an) * 130); c.stroke();
        c.fillStyle = '#2a1a1e'; K.circle(c, 0, 0, 16); c.fill(); c.font = '700 30px "Martian Mono"'; c.textAlign = 'center'; c.fillStyle = '#fbf3e4'; c.fillText('25', -150, 50); c.fillText('28', 150, 50); c.restore(); };
      shots.push({ id: 'D15_densidad', start: tLos12 - 0.1, bg: 'dome_meter', focus: [960, 520], push: 0.025, pushDir: 1, post: domePost,
        draw(c, t, lt) { c.save(); c.globalAlpha = 1; A.dome(c, t, { run: R25(), simT: D25(t) }); c.restore(); c.fillStyle = K.rgba('#1a1020', 0.45); c.fillRect(0, 0, K.W, K.H);
          P.plate(c, 960, 380, 'DENSIDAD', 96, A.ramp(t, tDens - 0.05, 0.3)); meter(c, 960, 820, 0.35, A.ramp(t, tDens + 0.3, 0.3)); },
        cues: A => [{ t: tDens, kind: 'plate' }] });
      shots.push({ id: 'D16_below', start: tPor1 - 0.1, bg: 'dome_meter2', label: 'ACELERADO ×10', focus: [700, 560], push: 0.025, pushDir: -1, post: domePost,
        draw(c, t, lt) { split(c, t, {}); c.fillStyle = K.rgba('#1a1020', 0.25); c.fillRect(960, 0, 960, K.H); meter(c, 480, 930, 0.3, 1); } });
      shots.push({ id: 'D16_above', start: tPor2 - 0.1, bg: 'dome_meter3', label: 'ACELERADO ×10', focus: [1250, 560], push: 0.03, pushDir: 1, post: domePost,
        draw(c, t, lt) { split(c, t, {}); c.fillStyle = K.rgba('#1a1020', 0.25); c.fillRect(0, 0, 960, K.H); meter(c, 1440, 930, K.lerp(0.3, 0.92, A.ramp(t, tPor2 + 0.1, 0.5)), 1); },
        cues: A => [{ t: tPor2 + 0.1, kind: 'minor' }] });

      // ================================================================ BEAT 13 · half an hour ago (S6, night)
      const nightPost = { grain: 0.15, vignette: 0.55, vignetteColor: '#03040c', bloom: 0.45, bloomR: 26 };
      const finger = (t) => (t < tNi - 0.4 ? 1 : 1 - A.ramp(t, tNi - 0.4, 1.0));
      const hillChars = (c, t, hillY, o = {}) => { const ex = 330, mx = 560, fu = o.finger ?? 1;
        K.cast.draw(c, 'eli1', ex, hillY(ex) - 2, 300, { view: 'backq', dir: 1, pose: 'sit', blend: { pose: 'sitPoint', k: fu }, seated: true, legs: true, sitGround: true, t, light: NL, fog: ['#141a3a', 0.2] });
        K.cast.draw(c, 'mila1', mx, hillY(mx) - 2, 300, { view: 'backq', dir: 1, pose: 'sit', seated: true, legs: true, sitGround: true, t, light: NL, fog: ['#141a3a', 0.2] }); };
      const clock6 = (c, ts) => P.clock(c, Math.max(0, ts - sTap6));
      shots.push({ id: 'D17_hill', start: tAhora - 0.12, bg: 'night', focus: [800, 600], push: 0.025, post: nightPost,
        draw(c, t, lt) { A.night(c, t, { simT: sTap6 - 4 + (t - tAhora), chars: (cx, hy) => hillChars(cx, t, hy) }); } });
      const ruler10 = (c, roadPt, b0, b1, k) => { if (k <= 0) return; const u0 = 1 - (0 - b0) / (b1 - b0), u1 = 1 - (10000 - b0) / (b1 - b0); c.save(); c.strokeStyle = '#e2b04a'; c.lineWidth = 6; c.setLineDash([18, 10]); c.beginPath();
        for (let j = 0; j <= 40 * k; j++) { const p = roadPt(K.lerp(u0, u1, j / 40)); j ? c.lineTo(p[0], p[1] - 40 * p[2] - 14) : c.moveTo(p[0], p[1] - 40 * p[2] - 14); } c.stroke(); c.restore();
        if (k > 0.95) { const p = roadPt(K.lerp(u0, u1, 0.55)); P.badge(c, p[0], p[1] - 40 * p[2] - 95, '10 km', 54, 1); } };   // Guardian: was at the near end, over Eli and Mila on the hill
      shots.push({ id: 'D18_wave', start: tAhi - 0.1, bg: 'night_wide', label: 'ACELERADO ×120', focus: [900, 600], push: 0.022, pushDir: 1, post: nightPost,
        over: (c, t) => clock6(c, N6(t)),
        draw(c, t, lt) { A.night(c, t, { simT: N6(t), label: (cx, roadPt, b0, b1) => ruler10(cx, roadPt, b0, b1, A.ramp(t, tDiez - 0.3, 0.8)), chars: (cx, hy) => hillChars(cx, t, hy) }); } });
      shots.push({ id: 'D19_speed', start: tA13 - 0.12, bg: 'night_close', label: 'ACELERADO ×120', focus: [960, 540], push: 0.03, pushDir: -1, post: nightPost, over: (c, t) => { clock6(c, N6(t)); P.badge(c, K.W - 330, 230, '≈20 km/h ←', 50, 1); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.6, 1.6); c.translate(-820, -720); A.night(c, t, { simT: N6(t) }); c.restore(); } });
      const regional = [[tEmb13, 'embotellamiento'], [tTrancon, 'trancón'], [tTaco, 'taco'], [tTrafico, 'tráfico']];
      shots.push({ id: 'D20_names', start: tO - 0.1, bg: 'night_close2', label: 'ACELERADO ×120', focus: [960, 540], push: 0.03, pushDir: 1, post: nightPost, over: (c, t) => clock6(c, N6(t)),
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(2.1, 2.1); c.translate(-700, -800); A.night(c, t, { simT: N6(t) }); c.restore();
          let cur = null; for (const [tt, n] of regional) if (t > tt - 0.05) cur = [tt, n]; if (cur) P.plate(c, 960, 300, cur[1], 64, A.ramp(t, cur[0] - 0.05, 0.12)); },
        cues: A => regional.map(([tt]) => ({ t: tt, kind: 'flip' })) });
      shots.push({ id: 'D21_halfhour', start: tEn13 - 0.1, bg: 'night_wide2', label: 'ACELERADO ×120', focus: [1000, 560], push: 0.022, pushDir: -1, post: nightPost, over: (c, t) => clock6(c, N6(t)),
        draw(c, t, lt) { A.night(c, t, { simT: N6(t), label: (cx, roadPt, b0, b1) => { const p = roadPt(1 - (0 - b0) / (b1 - b0)); P.ring(cx, p[0], p[1], 50, 30, A.ramp(t, tMedia - 0.4, 0.5), { w: 4 }); if (t > tMedia) P.pill(cx, p[0], p[1] - 70, 'hace 0:33', 30, A.ramp(t, tMedia, 0.2), { align: 'center' }); }, chars: (cx, hy) => hillChars(cx, t, hy) }); } });
      shots.push({ id: 'D22_farm', start: tEse - 0.1, bg: 'night_farm', focus: [1210, 700], push: 0.04, pushDir: 1, post: nightPost,
        draw(c, t, lt) { const z = K.lerp(1.4, 3.6, K.ease.inOut(K.clamp((t - tEse) / (tSeguro - tEse)))); c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-1210, -740); A.night(c, t, { simT: N6(t) }); c.restore(); } });
      shots.push({ id: 'D23_dinner', start: tSeguro - 0.1, bg: 'window', focus: [960, 540], push: 0.03, pushDir: 1, post: nightPost,
        draw(c, t, lt) { A.window(c, t, { fork: A.pulse(t, tSeguro + 0.4, 0.3, 0.4, 0.3) }); },
        cues: A => [{ t: tSeguro + 0.4, kind: 'cutlery' }] });
      shots.push({ id: 'D24_finger', start: tPor13 - 0.1, bg: 'night_eli', focus: [600, 700], push: 0.03, pushDir: -1, post: nightPost,
        draw(c, t, lt) { c.save(); c.translate(960, 600); c.scale(1.9, 1.9); c.translate(-460, -720); A.night(c, t, { simT: N6(t), chars: (cx, hy) => hillChars(cx, t, hy) }); c.restore(); } });
      shots.push({ id: 'D25_bite', start: tRazon2 - 0.2, bg: 'window2', focus: [880, 560], push: 0.035, pushDir: 1, zBase: 1.12, post: nightPost,
        draw(c, t, lt) { A.window(c, t, { fork: A.ramp(t, tRazon2 + 0.15, 0.35) }); },
        cues: A => [{ t: tCenarE - 0.2, kind: 'cutlery' }] });
      // «¿Ni un perdón?» — Eli lowers the finger; Mila hands him half her sandwich; crunch
      const sandT = tPerdonE + 0.15;
      shots.push({ id: 'D26_perdon', start: tCenarE + 0.1, bg: 'night_pair', focus: [960, 560], push: 0.03, pushDir: 1, post: nightPost,
        draw(c, t, lt) {
          c.fillStyle = '#0b1030'; c.fillRect(0, 0, K.W, K.H);
          { const g = c.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, '#0b1030'); g.addColorStop(0.7, '#2c3366'); g.addColorStop(1, '#463f6e'); c.fillStyle = g; c.fillRect(0, 0, K.W, K.H); }
          K.sky.stars(c, { seed: 41, n: 260, y1: 700, t }); K.light.glow(c, 1500, 980, 600, '#ff4a36', 0.15, 'screen');
          c.fillStyle = '#0a0f22'; c.beginPath(); c.moveTo(0, 900); c.quadraticCurveTo(960, 820, 1920, 930); c.lineTo(1920, 1080); c.lineTo(0, 1080); c.fill();
          const sp = A.talk('eli', t), fu = finger(t);
          K.cast.draw(c, 'eli1', 760, 960, 700, { view: 'q', dir: 1, ...(fu > 0.001 ? { pose: t > sandT + 0.35 ? 'belly' : 'sit', blend: { pose: 'sitPoint', k: fu } } : A.pz(t, sandT + 0.35, 'sit', 'belly')), seated: true, legs: true, sitGround: true, t, light: NL,
            expr: t < tNi - 0.3 ? 'grumpy' : t < sandT + 0.3 ? 'sad' in K.cast.EXPR ? 'sad' : 'worried' : 'happy', talk: sp.talk, viseme: sp.viseme, look: t > sandT ? [0.6, 0.1] : [0.9, 0] });
          const give = A.ramp(t, sandT, 0.35);
          const rm = K.cast.draw(c, 'mila1', 1180, 960, 700, { view: 'q', dir: -1, ...A.pzv(give, 0.1, 'sit', 'palm'), seated: true, legs: true, sitGround: true, t, light: NL, expr: 'happy', look: [-0.8, 0] });
          if (give > 0.05) { const hx = K.lerp(rm.hands.lead[0], 980, give), hy = K.lerp(rm.hands.lead[1], 760, give);   // half a sandwich
            c.save(); c.translate(hx, hy); c.rotate(-0.2); c.fillStyle = '#e8c48a'; c.strokeStyle = '#2a1a1e'; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, 20); c.lineTo(40, 20); c.lineTo(-40, -40); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#7fb06a'; c.fillRect(-38, 6, 70, 8); c.restore(); }
          K.terrain.fireflies(c, t, { n: 30, seed: 66, x0: 0, x1: K.W, y0: 500, y1: 1000, size: 2 });
        },
        cues: A => [{ t: sandT + 0.6, kind: 'crunch' }] });
      return shots;
    },
    ambience(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const t0 = A.at('No', 1, { beat: '11' }), t1 = A.at('Entonces', 1, { beat: '14' });
      return [{ kind: 'music_light', t0, t1: w('Ahora', 1, '13') - 0.2 }, { kind: 'wind_grass', t0, t1: w('Es', 2, '11') - 0.1 },
        { kind: 'crowd', t0: w('Es', 2, '11') - 0.1, t1: w('Pero', 1, '12') - 0.1 }, { kind: 'dome_room', t0: w('Pero', 1, '12') - 0.1, t1: w('Ahora', 1, '13') - 0.2 },
        { kind: 'crickets', t0: w('Ahora', 1, '13') - 0.2, t1 }, { kind: 'night_pad', t0: w('Ahora', 1, '13') - 0.2, t1 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
