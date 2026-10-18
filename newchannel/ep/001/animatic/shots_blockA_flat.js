/* Ep 001 · BLOCK A in the FLAT style (A/B style test, 2026-10-18): the hook (beats 1-3, 0:00 -> the first word of beat 4,
   ≈ 30 s) as THREE held shots instead of fourteen, drawn with art/lib/flat.js (flat fills, one thick ink line, no light,
   grain, haze, parallax or camera breathing; a caption bar at the top with the key phrase of each beat; flat text boxes;
   a thought bubble with icons for the «ni choque, ni conos, ni semáforo» gag). Same clock as block A: every time comes
   from a narration word (A.at) or a sim event of S1 (A.ev); the cars are the S1 run (the art is still a skin over the
   real simulation). Scene: index.html?scene=ep001_Aflat&out=854x480&style=flat. An OPTION: block A is untouched. */
(function (root) {
  const K = root.K, A = K.anim, F = K.flat;
  const ELI = 20, TAP = 26, N = 30;

  A.block('Aflat', {
    t0: 0,
    t1: null,
    flat: true,
    async setup() { this.t1 = A.at('Mila', 1, { beat: '04' }) - 0.05; A._noSay = true; F.on = true; },   // the boxes are drawn flat by the shots
    post: { grain: 0, vignette: 0, bloom: 0 },
    shots(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      // ---------------------------------------------------------------- the clock: words
      const tAlla = w('Allá', 1, '01'), tCond = w('conductor', 1, '01'), tFreno = w('freno', 1, '01'), tUna2 = w('Una', 2, '01'), tApenas = w('Apenas', 1, '01');
      const tDetras = w('Detrás', 1, '02'), tMas1 = w('más', 1, '02'), tMas2 = w('Más', 2, '02'), tMas3 = w('Más', 3, '02'), tQuietoMid = w('quieto', 1, '02', { edge: 'mid' });
      const tEli2 = w('Eli', 1, '02'), tQuien = A.at('Quién', 1, { beat: '03', speaker: 'eli' }), tFueEnd = A.at('fue', 1, { beat: '03', speaker: 'eli', edge: 'end' });
      const tEliN = A.at('Eli', 1, { beat: '03', speaker: 'narrator' }), tAlguien = w('alguien', 1, '03'), tPero = w('Pero', 1, '03');
      const tNi = w('Ni', 1, '03'), tChoque = w('choque', 1, '03'), tChoqueE = w('choque', 1, '03', { edge: 'end' }), tConos = w('conos', 1, '03'), tConosE = w('conos', 1, '03', { edge: 'end' });
      const tSema = w('semáforo', 1, '03'), tSemaE = w('semáforo', 1, '03', { edge: 'end' }), tMila = w('Mila', 1, '04');
      const gap0 = tSemaE + 0.25, gap1 = tMila - 0.05, gapU = (gap1 - gap0) / 3;
      // ---------------------------------------------------------------- the clock: sim events (S1)
      const sTap = A.ev('S1', 'tap_start'), s23 = A.ev('S1', 'brake_onset', e => e.car === 23), sLead = A.ev('S1', 'leader_brake_onset');
      const sEliOn = A.ev('S1', 'eli_brake_onset'), sEliHard = A.ev('S1', 'eli_hard_brake'), sStop = A.ev('S1', 'eli_stop'), sRestart = A.ev('S1', 'eli_restart');
      const G1 = A.map(sTap, tFreno, 3);                                   // the tap starts on «freno» (×3)
      // one continuous time warp for the held wave shot: through the same anchors block A cuts between (×3 -> ×2 -> ×1)
      const keys = [[tMas1, s23], [tMas2, sLead], [tQuietoMid, sStop]];
      const G2 = t => { if (t <= keys[0][0]) return keys[0][1] - (keys[0][0] - t) * 3; for (let i = 0; i + 1 < keys.length; i++) if (t <= keys[i + 1][0]) return K.lerp(keys[i][1], keys[i + 1][1], (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
        return Math.min(sStop + (t - tQuietoMid), sRestart - 0.6); };
      const rate = t => (t <= keys[0][0] ? 3 : t <= keys[1][0] ? (keys[1][1] - keys[0][1]) / (keys[1][0] - keys[0][0]) : t <= keys[2][0] ? (keys[2][1] - keys[1][1]) / (keys[2][0] - keys[1][0]) : 1);
      const HOLD = t => Math.min(sStop + Math.max(0, t - tQuietoMid), sRestart - 0.6);
      const tHard = tQuietoMid - (sStop - sEliHard), tEliOn = tQuietoMid - (sStop - sEliOn);
      const eliBlink = t => A.blink(3, t), milaBlink = t => A.blink(5, t);
      const R = () => A.s1();
      // ---------------------------------------------------------------- captions (the key phrase of each beat) + the speed pill
      const CAP = [[0, 'Una carretera despejada.'], [tAlla - 0.05, 'Allá adelante, un conductor toca el freno.'], [tUna2 - 0.05, 'Una sola vez. Apenas un poquito.'],
        [tDetras - 0.05, 'Detrás, cada auto frena un poco más fuerte.'], [tMas3 - 0.05, '...hasta que alguien se queda quieto.'],
        [tEli2 - 0.05, 'Eli está seguro:'], [tAlguien - 0.05, 'Alguien allá adelante tiene la culpa.'], [tPero - 0.05, 'Pero allá no hay nada.'], [tNi - 0.05, 'Ni choque, ni conos, ni semáforo.']];
      const caption = (c, t, pill) => { let i = 0; while (i + 1 < CAP.length && t >= CAP[i + 1][0]) i++; F.caption(c, CAP[i][1], K.clamp((t - CAP[i][0]) / 0.18), { pill }); };
      const pillOf = r => (r > 1.15 ? `ACELERADO ×${Math.round(r)}` : null);
      // the characters' lines (Eli's «¡¿Quién fue?!»): the same word slots and reading times as block A, drawn flat
      const lines = (c, t) => { for (const L of A.lineList()) { if (t < L.show0 || t > L.show1) continue; const h = A._heads[L.speaker];
        F.box(c, { text: L.text, kind: L.kind || 'speech', head: h ? h.head : null, age: t - L.show0, a: 1 - K.clamp((t - (L.show1 - 0.16)) / 0.16), side: L.side }); } };
      // ---------------------------------------------------------------- the world: side view, cars facing LEFT (ahead = left), camera fixed on Eli's car
      const GY = 800;
      const drawCars = (c, ts, ppm, eliX, crew, o = {}) => {
        const X = R().at(ts).x, L = 4.5 * ppm, LANE = o.lane || GY - 18;
        for (let i = 0; i < N; i++) {
          const sx = eliX - (X[i] - X[ELI]) * ppm; if (sx < -L || sx > K.W + L) continue;
          const br = R().brake(i, ts);
          if (i === ELI) F.car(c, sx, LANE, L, { color: F.PAL.teal, brake: br, crew: (cc, cx, seatY, u) => crew(cc, cx, seatY, u, sx, L) });
          else F.car(c, sx, LANE, L, { color: K.car.COLORS[(i * 7) % K.car.COLORS.length], brake: br, persona: i % 6, extraFace: o.face ? (cc, hx, hy, hr) => o.face(cc, i, hx, hy, hr, br) : null });
        }
      };
      // Eli drives (front seat, left), Mila behind him: the crew callback draws them seated at the seat line
      const crewAt = (eO, mO) => (c, cx, seatY, u, sx, L) => {
        const e = F.cast(c, 'eli1', cx - L * 0.17, seatY, u, Object.assign({ seated: true, view: 'q', dir: -1 }, eO));
        const m = F.cast(c, 'mila1', cx + L * 0.2, seatY, u, Object.assign({ seated: true, view: 'q', dir: -1 }, mO));
        A.speaker('eli', e.head); A.speaker('mila', m.head);
        return { eliHead: e.head, milaHead: m.head };
      };
      const extraFace = (c, i, hx, hy, hr, br) => { c.fillStyle = F.INK; const o = br > 0.5 ? 1.5 : 1;   // the extras: two dots; a braking driver's eyes go wide
        K.circle(c, hx - hr * 0.42, hy + hr * 0.02, hr * 0.12 * o); c.fill(); K.circle(c, hx + hr * 0.02, hy + hr * 0.02, hr * 0.12 * o); c.fill();
        if (br > 0.5) { F.ink(c, F.LW * 0.7); c.beginPath(); c.moveTo(hx - hr * 0.6, hy - hr * 0.3); c.lineTo(hx - hr * 0.2, hy - hr * 0.38); c.moveTo(hx + hr * 0.2, hy - hr * 0.38); c.lineTo(hx - hr * 0.2, hy - hr * 0.3); c.stroke(); } };

      const shots = [];
      // ================================================================ SHOT 1 · a tap (beat 1): the road, Eli's car, a slide to the tapper six cars ahead
      shots.push({ id: 'F01_tap', start: 0, bg: 'hw', breath: false,
        draw(c, t) {
          const ts = G1(t), ppm = 30, X = R().at(ts).x, LANE = GY - 18;
          // the only camera move: a slide along the line of cars, from Eli's car to the tapper six cars ahead
          const slide = ((X[TAP] - X[ELI]) * ppm - 1000) * K.ease.inOut(A.ramp(t, tAlla + 0.05, 0.9));
          const eliX = 1480 + slide;
          F.bg(c, t, { scroll: X[ELI] * ppm - slide, ground: GY, roadH: 120, poleH: 300, poleGap: 560 });
          drawCars(c, ts, ppm, eliX, crewAt({ pose: 'drive', expr: 'happy', blink: eliBlink(t), look: [0.6, 0], tilt: 0.03 * Math.sin(t * 9) }, { pose: 'lap', expr: 'neutral', blink: milaBlink(t), look: [-0.4, -0.2] }), { face: extraFace });
          // the tapper hums (thought bubble: a note) and taps the brake once
          const tapX = eliX - (X[TAP] - X[ELI]) * ppm, L = 4.5 * ppm, hb = [tapX - L * 0.12, LANE - L * 0.105 * 0.55 - L * 0.3 - L * 0.075 * 0.35, L * 0.075];
          const a = A.ramp(t, tCond, 0.25) * (1 - A.ramp(t, tApenas + 0.6, 0.25));
          this._thought = { head: hb, a, x: tapX + 60, y: hb[1] - 250, w: 200, h: 160 };
        },
        over(c, t) { if (this._thought) F.thought(c, this._thought.head, Object.assign({ icons: [{ kind: 'note', a: 1 }] }, this._thought)); caption(c, t, pillOf(3)); },
        cues: A => [{ t: tFreno, kind: 'brake_note', step: 1 }] });

      // ================================================================ SHOT 2 · it breaks (beat 2): one held frame, the wave of brake lights runs from the tapper to Eli
      shots.push({ id: 'F02_wave', start: tDetras - 0.08, bg: 'hw', breath: false,
        draw(c, t) {
          const ts = G2(t), ppm = 21, X = R().at(ts).x, since = t - tQuietoMid;
          const lurch = since > 0 ? 0.1 * Math.exp(-since * 4) * Math.cos(since * 9) : (t > tHard ? 0.04 : 0);
          F.bg(c, t, { scroll: X[ELI] * ppm, ground: GY, roadH: 120, poleH: 300, poleGap: 560 });
          const eO = Object.assign({ pose: 'drive', blink: 0, lean: lurch }, A.seq(t, [[0, { pose: 'drive', expr: 'happy', look: [0.6, 0] }], [tEliOn, { pose: 'drive', expr: 'determined', look: [0.9, 0] }],
            [tHard, { pose: 'drive', expr: 'surprised', look: [0.9, 0] }], [tHard + 0.55, { pose: 'drive', expr: 'worried', look: [0.9, 0] }], [tQuietoMid + 0.12, { pose: 'drive', expr: 'annoyed', look: [0.6, 0.05] }]], 0.16));
          const mO = Object.assign({ blink: t < tHard - 0.1 ? milaBlink(t) : 0, lean: lurch * 1.2 }, A.seq(t, [[0, { pose: 'lap', expr: 'neutral', look: [-0.3, -0.2] }],
            [tHard, { pose: 'clasp', expr: 'surprised', look: [0.7, 0] }], [tQuietoMid + 0.05, { pose: 'lap', expr: 'annoyed', look: [0.7, 0] }]], 0.2));
          drawCars(c, ts, ppm, 1760, crewAt(eO, mO), { face: extraFace });
        },
        over(c, t) { caption(c, t, pillOf(rate(t))); },
        cues: A => [{ t: tMas1, kind: 'brake_note', step: 2 }, { t: tEliOn, kind: 'brake_note', step: 6 }, { t: tHard, kind: 'squeal' }, { t: tQuietoMid, kind: 'stop_thunk' }] });

      // ================================================================ SHOT 3 · ¿Quién fue? (beat 3): close on the teal car; Eli stands, yells, points, thinks, and a bird answers
      const eliRise = t => A.ramp(t, tEli2 + 0.1, 0.28);
      const birdIn = t => A.ramp(t, gap0 + gapU * 1.75, 0.3), shrug = t => A.ramp(t, gap0 + gapU * 2.55, 0.18) * (1 - A.ramp(t, gap1 - 0.05, 0.2));
      shots.push({ id: 'F03_quien', start: tEli2 - 0.06, bg: 'close', breath: false,
        draw(c, t) {
          const ts = HOLD(t), ppm = 200, X = R().at(ts).x;
          F.bg(c, t, { scroll: X[ELI] * ppm, ground: 960, roadH: 300, horizon: 600, poles: false, sunX: 420, sunY: 260, sunR: 150 });
          const perch = F.pole(c, 1700, 608, 500, 40);                                  // one pole at the right: the bird's perch
          const lookUp = A.ramp(t, gap0 + 0.15, gapU * 1.4);
          const eO = Object.assign({ blink: 0, rise: eliRise(t), extras: t >= tQuien - 0.03 && t < tFueEnd + 0.5 ? ['anger', 'puff'] : undefined }, A.seq(t, [
            [0, { pose: 'stand', expr: 'annoyed', look: [0.8, -0.1] }], [tQuien - 0.45, { pose: 'fist', expr: 'grumpy', look: [0.8, -0.1], lean: -0.05 }],
            [tQuien - 0.03, { pose: 'fist', expr: 'furious', look: [0.8, -0.1], lean: 0.06 }], [tFueEnd + 0.5, { pose: 'fist', expr: 'furious', look: [0.8, -0.1], lean: 0.03 }],
            [tEliN + 0.1, { pose: 'visor', expr: 'determined', look: [1, -0.1], tilt: -0.04 }], [tAlguien + 0.25, { pose: 'point', expr: 'furious', look: [1, -0.05] }],
            [tPero + 0.1, { pose: 'visor', expr: 'curious', look: [1, -0.15] }], [tPero + 0.9, { pose: 'visor', expr: 'worried', look: [1, -0.1] }],
            [tNi, { pose: 'crossed', expr: 'annoyed', look: [0.8, 0] }], [gap0 + 0.15, { pose: 'crossed', expr: 'annoyed', look: [0.9, -0.85], tilt: -0.08 }]], 0.2));
          if (t > gap0 + 0.15) eO.look = [K.lerp(0.8, 0.9, lookUp), K.lerp(0, -0.85, lookUp)];
          const mO = Object.assign({ blink: milaBlink(t) }, A.seq(t, [[0, { pose: 'lap', expr: 'annoyed', look: [0.4, -0.1] }], [tFueEnd + 0.05, { pose: 'lap', expr: 'curious', look: [0.6, -0.2] }],
            [tFueEnd + 0.6, { pose: 'lap', expr: 'neutral', look: [0.4, -0.1] }], [tPero, { pose: 'lap', expr: 'smug', look: [0.5, -0.1] }], [tNi + 0.3, { pose: 'lap', expr: 'neutral', look: [0.3, -0.1] }],
            [gap0 + gapU * 1.75, { pose: 'lap', expr: 'curious', look: [0.5, -0.9] }]], 0.2));
          let heads = null;
          drawCars(c, ts, ppm, 1240, (cc, cx, seatY, u, sx, L) => { heads = crewAt(eO, mO)(cc, cx, seatY, u, sx, L); }, { lane: 900 });
          // the bird drops onto the pole's crossbar and shrugs («pío»)
          const bi = birdIn(t); if (bi > 0) { const by = K.lerp(-80, perch[1], K.ease.out(bi)); F.bird(c, perch[0] - 20, by, 60, { dir: -1, shrug: shrug(t), open: shrug(t) > 0.5, look: shrug(t) > 0.3 ? [-0.6, 0.3] : [0.6, 0.6] }); }
          this._heads = heads;
        },
        over(c, t) {
          const h = this._heads && this._heads.eliHead;
          // the «ni choque, ni conos, ni semáforo» gag: a thought bubble, one flat icon per word, each crossed out when the word ends
          const a = A.ramp(t, tNi - 0.1, 0.25) * (1 - A.ramp(t, gap0 + 0.1, 0.2));
          if (a > 0 && h) F.thought(c, h, { a, x: 520, y: 330, w: 620, h: 250, icons: [
            { kind: 'crash', a: A.ramp(t, tChoque - 0.05, 0.2), cross: A.ramp(t, tChoqueE - 0.05, 0.22) }, { kind: 'cone', a: A.ramp(t, tConos - 0.05, 0.2), cross: A.ramp(t, tConosE - 0.05, 0.22) },
            { kind: 'light', a: A.ramp(t, tSema - 0.05, 0.2), cross: A.ramp(t, tSemaE - 0.05, 0.22) }] });
          F.callout(c, 1520, 240, 'pío', A.pulse(t, gap0 + gapU * 2.62, 0.1, 0.55, 0.2));
          lines(c, t); caption(c, t, null);
        },
        cues: A => [{ t: tEli2 + 0.12, kind: 'whoosh_up' }, { t: tQuien, kind: 'pop' }, { t: tFueEnd + 0.08, kind: 'blow' }, { t: tChoqueE, kind: 'scratch', n: 0 }, { t: tConosE, kind: 'scratch', n: 1 }, { t: tSemaE + 0.05, kind: 'scratch', n: 2 },
          { t: gap0 + gapU * 2.55, kind: 'flutter' }, { t: gap0 + gapU * 2.62, kind: 'chirp' }] });
      return shots;
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
