/* Ep 001 · BLOCK B · Act 1 «Es real» (beats 6-8): the 2008 ring, recreated (S2: 22 cars, 230 m). Every time comes
   from a narration word (A.at) or an S2 event (A.ev). Sim mappings: ×1 for the real-speed shots (no label), ×10 with the
   sim clock for «a los tres minutos» (the clock jumps at the cuts: the elisions are shown, not hidden), ×1 on the jam
   sliding back. «RECREACIÓN ILUSTRADA» on every shot of the act (PRODUCTION_NOTES / script). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const REC = 'RECREACIÓN ILUSTRADA', SRC = 'Sugiyama et al., New J. Phys. 2008';

  A.block('B', {
    t0: null, t1: null,
    async setup() { this.t0 = A.at('Mila', 1, { beat: '06' }); this.t1 = A.at('Vamos', 1, { beat: '09' }); },
    post: { grain: 0.13, vignette: 0.4, vignetteColor: '#2a1a2a', bloom: 0.18 },
    shots(A) {
      const def = this, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o)), el = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'eli' }, o));
      const T0 = def.t0;
      // ---- words
      const tYa = el('Ya', 1, '06'), tFueE6 = el('adelante', 1, '06', { edge: 'end' }), tEn = w('En', 1, '06'), tPuso = w('puso', 1, '06'), tVeinti = w('veintidós', 1, '06');
      const tPista = w('pista', 1, '06'), tCirc = w('circular', 1, '06'), tMetrosE = w('metros', 1, '06', { edge: 'end' });
      const tProb = w('Problema', 1, '06'), tCirculo = w('círculo', 1, '06'), tAdel = w('adelante', 1, '06', { edge: 'end', speaker: 'narrator' }), tLos = w('Los', 1, '06'), tManejar = w('manejar', 1, '06'), tTreinta = w('treinta', 2, '06');
      const tAl = w('Al', 1, '07'), tLuego = w('Luego', 1, '07'), tHueco = w('hueco', 1, '07'), tUn2 = w('un', 2, '07'), tApreton = w('apretón', 1, '07'), tA7 = w('A', 1, '07'), tMinutos = w('minutos', 1, '07');
      const tCinco = w('cinco', 1, '07'), tEn7 = w('En', 1, '07'), tQuien = el('Quién', 1, '07'), tFueE = el('fue', 1, '07', { edge: 'end' }), tLo = w('Lo', 1, '08');
      const tLos8 = w('los', 1, '08'), tAvanzan = w('avanzan', 1, '08'), tY = w('y', 1, '08'), tAtras = w('atrás', 1, '08'), tA8 = w('a', 2, '08'), tVeinte = w('veinte', 1, '08');
      const tMas8 = w('Más', 1, '08'), tBici = w('bicicleta', 1, '08');
      // ---- S2 events
      const sThree = A.ev('S2', 'clock_3min');
      const C1 = A.map(0, tAl, 10);                         // the clock starts on «Al principio» (×10)
      const C2 = A.map(120, tUn2, 10);                      // later: the waves have grown (the clock jumps at the cut)
      const C3 = A.map(sThree, tMinutos, 10);               // 3:00 on «minutos»
      const C4 = A.map(sThree, tCinco, 1);                  // real speed: the five stopped cars on «cinco»
      const C5 = A.map(sThree + 20, tLos8, 1);              // the jam sliding back, real speed
      const LF = A.LIGHT_FIELD, G = A.FIELD.GROUND;
      const recPill = (c, acc) => { P.pill(c, 96, acc ? 152 : 84, REC, 26, 1); };
      const blink = (s, t) => A.blink(s, t);
      const shots = [];

      // ================================================================ BEAT 6
      // B01 · Mila drags Eli by the flannel collar; his heels plough two furrows
      // v5 #3 «…de verdad. Literalmente.»: the drag is one move over both shots (k from the block clock, not per shot); on
      // «Literalmente» the camera cuts in to follow Eli's heels ploughing the field
      const tLit = w('Literalmente', 1, '06'), tDragEnd = tYa - 0.28;
      const drag = (c, t, close) => {
          const ts = A.map(0, T0, 1)(t), u = 520, k = K.clamp((t - T0) / (tDragEnd - T0));
          const mx = 620 + 620 * k, ex = mx - 240, ex0 = 320;
          A.field(c, t, { simT: ts, frame: close ? { z: 1.6, x: ex + 120, y: G - 310 } : { z: 1.0, x: 960, y: 540 },
            chars: (cx) => {
              // furrows
              cx.strokeStyle = K.rgba('#5a4030', 0.75); cx.lineCap = 'round'; for (const dy of [-6, 10]) { cx.lineWidth = 9; cx.beginPath(); cx.moveTo(ex0 - 20, G + dy); cx.lineTo(ex + 10, G + dy); cx.stroke(); }
              cx.fillStyle = K.rgba('#6a4c38', 0.8); for (let j = 0; j < 14; j++) { const x = ex0 + (ex - ex0) * (j / 14) + Math.sin(j * 7) * 8; K.circle(cx, x, G - 8 + Math.cos(j * 3) * 6, 3 + (j % 3)); cx.fill(); }
              // Producer 2026-10-29: she pulls him BY THE HAND (hands touching, short distance, she leans into the walk, he skids
              // on his heels). No connector line / stretched cloth between them, ever.
              const grip = [(ex + mx) / 2 - 4, G - u * 0.55];
              K.cast.draw(cx, 'eli1', ex, G, u, { view: 'q', dir: 1, pose: 'surprise', expr: 'annoyed', t, lean: -0.16, look: [0.7, 0.1], light: LF, shadow: 0.3, blink: blink(3, t), extras: ['puff'], reach: { lead: { p: grip, hand: 'relax' } } });
              K.cast.draw(cx, 'mila1', mx, G, u, { view: 'q', dir: 1, pose: 'walk', expr: 'happy', t: t * 0.9, lean: 0.12, headTurn: -0.35, look: [-0.6, 0], light: LF, shadow: 0.3, blink: blink(5, t), reach: { trail: { p: [grip[0] - 10, grip[1] - 2], hand: 'mitt' } }   /* her fist closes over his wrist */ });
            } });
      };
      shots.push({ id: 'B01_drag', start: T0, bg: 'field', focus: [960, 600], push: 0.025,
        over: (c) => recPill(c, false),
        draw(c, t) { drag(c, t, false); },
        cues: A => [{ t: T0 + 0.1, kind: 'drag', t1: A.at('Ya', 1, { beat: '06', speaker: 'eli' }) - 0.3 }] });
      shots.push({ id: 'B01_heels', start: tLit - 0.1, bg: 'field_heels', focus: [960, 600], push: 0.03, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t) { drag(c, t, true); } });

      // B02 · «¡Ya entendí! ¡Fue el de adelante!»
      shots.push({ id: 'B02_gotit', start: tYa - 0.28, bg: 'field_eli', focus: [900, 520], push: 0.03, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          const ts = A.map(0, T0, 1)(t), sp = A.talk('eli', t), pt = t > el('Fue', 1, '06') - 0.1;
          A.field(c, t, { simT: ts, frame: { z: 1.35, x: 860, y: 560 },
            chars: (cx) => {
              K.cast.draw(cx, 'mila1', 1180, G - 8, 560, { view: 'q', dir: -1, pose: 'clipboard', ...A.ez(t, el('Fue', 1, '06') - 0.1, 'neutral', 'smug'), t, look: [-0.8, 0.1], light: LF, shadow: 0.3, blink: blink(5, t) });
              K.cast.draw(cx, 'eli1', 760, G, 600, { view: 'q', dir: -1, ...A.pz(t, el('Fue', 1, '06') - 0.1, 'pump', 'point'), ...A.ez(t, el('Fue', 1, '06') - 0.1, 'happy', 'smug'), t, look: [-0.9, 0], light: LF, shadow: 0.3, talk: sp.talk, viseme: sp.viseme, blink: blink(3, t) });
            } });
        } });

      // B03 · the ring, wide: «En dos mil ocho, un equipo de físicos en Japón»
      shots.push({ id: 'B03_ring', start: tEn - 0.15, bg: 'ring', focus: [960, 560], push: 0.022, pushDir: 1,
        over: (c, t) => { recPill(c, false); P.source(c, SRC, A.ramp(t, tEn + 0.3, 0.4)); },
        draw(c, t, lt) { A.ring(c, t, { simT: A.map(0, T0, 1)(t), carExpr: () => 'focused' }); } });

      // B04 · «puso veintidós autos»: closer, the counter
      shots.push({ id: 'B04_count', start: tPuso - 0.1, bg: 'ring_close', focus: [960, 540], push: 0.03, pushDir: -1,
        over: (c, t) => { recPill(c, false); const n = Math.round(22 * A.ramp(t, tVeinti - 0.05, 0.55)); P.badge(c, K.W - 260, 220, String(Math.max(1, n)), 110, A.ramp(t, tVeinti - 0.1, 0.2), 'autos'); P.source(c, SRC, 1); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.75, 1.75); c.translate(-1180, -700); A.ring(c, t, { simT: A.map(0, T0, 1)(t), carExpr: () => 'focused' }); c.restore(); } });

      // B05 · «en una pista circular de doscientos treinta metros»: the tape goes round
      shots.push({ id: 'B05_tape', start: tPista - 0.45, bg: 'ring', focus: [960, 520], push: 0.024, pushDir: -1,
        over: (c, t) => { recPill(c, false); P.source(c, SRC, 1); },
        draw(c, t, lt) { A.ring(c, t, { simT: A.map(0, T0, 1)(t), carExpr: () => 'focused',
          over: (cx) => P.tape(cx, K.clamp((t - tCirc) / (tMetrosE - tCirc)), '230 m') }); } });

      // B06 · the finger gag: he follows the car ahead... and the one ahead... all the way round to himself
      const turns = [['q', -1], ['side', -1], ['backq', -1], ['back', -1], ['backq', 1], ['side', 1], ['q', 1]];
      const g0 = tProb + 0.25, g1 = tAdel - 0.1, hit = tAdel - 0.05;
      shots.push({ id: 'B06_finger', start: tProb - 0.2, bg: 'field_eli', focus: [960, 520], push: 0.03, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          const ts = A.map(0, T0, 1)(t);
          let eO;
          // the spin is a staged turn through 7 held key views (each ~0.4 s, pointing at the next car); after it the pose
          // changes used to snap in one frame (point -> pointSelf -> scratch -> crossed): blended now (Guardian v3)
          // Guardian v3: each key view is held (pointing at the next car) and the body TURNS to the next one over the last
          // 0.12 s (numeric view; front <-> back swaps only at the profile), instead of 7 one-frame snaps of body and clothes
          if (t < g1) { const k = K.clamp((t - g0) / (g1 - g0)) * turns.length, j = Math.min(turns.length - 1, Math.floor(k)), seg = (g1 - g0) / turns.length;
            const KS = [[0.55, 0, -1], [1, 0, -1], [0.55, 1, -1], [0, 1, -1], [0.55, 1, 1], [1, 0, 1], [0.55, 0, 1]];
            const e = j + 1 < KS.length ? K.ease.sine(K.clamp((k - j - 1) * seg / 0.12 + 1)) : 0, A0 = KS[j], B0 = KS[Math.min(j + 1, KS.length - 1)];
            let sv, bk, dv;
            if (A0[1] === B0[1]) { sv = K.lerp(A0[0], B0[0], e); bk = A0[1]; dv = A0[0] === 0 ? B0[2] : A0[2]; }
            else if (e < 0.5) { sv = K.lerp(A0[0], 1, e * 2); bk = A0[1]; dv = A0[2]; } else { sv = K.lerp(1, B0[0], e * 2 - 1); bk = B0[1]; dv = B0[2]; }
            eO = { view: sv, backView: !!bk, dir: dv, pose: 'point', ...A.ez(t, (g0 + g1) / 2, 'determined', 'curious'), look: [0.9, 0], blink: 0 }; }
          else eO = Object.assign({ dir: 1, blink: t > hit + 0.95 ? blink(3, t) : 0 }, A.seq(t, [
            [0, { view: 'q', pose: 'point', expr: 'curious', look: [0.9, 0], tilt: 0 }], [hit, { view: 'front', pose: 'pointSelf', expr: 'surprised', look: [0, 0], tilt: 0.04 }],
            [hit + 0.45, { view: 'q', pose: 'scratch', expr: 'sheepish', look: [0, 0], tilt: 0 }], [hit + 0.85, { view: 'q', pose: 'crossed', expr: 'annoyed', look: [0.6, 0.1], tilt: 0 }]], 0.14));
          A.field(c, t, { simT: ts, frame: { z: 1.3, x: 960, y: 570 },
            chars: (cx) => {
              K.cast.draw(cx, 'mila1', 1330, G - 10, 560, { view: 'q', dir: -1, pose: 'clipboard', ...A.ez(t, hit + 0.1, 'thinking', 'smug'), t, look: t > hit ? [-0.9, 0] : [0.2, 0.6], light: LF, shadow: 0.3, blink: blink(5, t) });
              K.cast.draw(cx, 'eli1', 900, G + 6, 580, Object.assign({ t, light: LF, shadow: 0.3 }, eO));   // Guardian: was u 640 (Eli as tall as Mila side by side)
            } });
        },
        cues: A => [{ t: g0, kind: 'spin', t1: g1 }, { t: hit, kind: 'bonk_small' }, { t: hit + 0.5, kind: 'cough' }] });

      // B07 · «Los conductores tenían una sola tarea:» drivers at the wheel, Eli (arms crossed) in the foreground
      shots.push({ id: 'B07_drivers', start: hit + 1.25, bg: 'field_track', focus: [960, 560], push: 0.03, pushDir: -1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          A.field(c, t, { simT: A.map(0, T0, 1)(t), frame: { z: 2.5, x: 1000, y: 680 }, front: false, carExpr: () => (A.blink(7, t) ? 'neutral' : 'focused'),
            chars: (cx) => K.cast.draw(cx, 'eli1', 745, 1048, 520, { view: 'backq', dir: 1, pose: 'crossed', t, light: LF }) });   // eyes pass: was a sliver at the left edge (x 600 -> screen -40); Guardian: y 1010 -> 1048 (the «RECREACIÓN ILUSTRADA» pill touched the beanie)
        } });

      // B08 · «manejar con cuidado, a unos treinta kilómetros por hora»: the dial
      shots.push({ id: 'B08_dial', start: tManejar - 0.1, bg: 'ring_far', focus: [960, 520], push: 0.024, pushDir: 1,
        over: (c, t) => { recPill(c, false); const R = A.s2(), S = R.at(A.map(0, T0, 1)(t)); let v = 0; for (let i = 0; i < R.N; i++) v += S.v[i]; v = v / R.N * 3.6;
          P.dial(c, K.W - 250, 260, 120, v * A.ramp(t, tTreinta - 0.25, 0.5), 60, '~30 km/h', A.ramp(t, tManejar + 0.4, 0.3)); P.source(c, SRC, 1); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.22, 1.22); c.translate(-880, -560); A.ring(c, t, { simT: A.map(0, T0, 1)(t), carExpr: () => 'content' }); c.restore(); } });

      // ================================================================ BEAT 7 (×10, the clock)
      const acc = (c, t, map) => { A.label(c, 'ACELERADO ×10', 1); recPill(c, true); P.clock(c, map(t)); P.source(c, SRC, 1); };
      shots.push({ id: 'B09_fine', start: tAl - 0.12, bg: 'ring', focus: [960, 540], push: 0.022, pushDir: -1,
        over: (c, t) => acc(c, t, C1),
        draw(c, t, lt) { A.ring(c, t, { simT: C1(t), carExpr: () => 'content' }); } });

      // largest / smallest gap at a sim time (for the ink marks)
      const gaps = ts => { const R = A.s2(), S = R.at(ts), L = R.p.L, out = []; for (let i = 0; i < R.N; i++) { const j = (i + 1) % R.N; out.push({ i, j, g: ((S.x[j] - S.x[i]) % L + L) % L - 4.5 }); } return out.sort((a, b) => a.g - b.g); };
      shots.push({ id: 'B10_wobble', start: tLuego - 0.1, bg: 'ring_close', focus: [960, 540], push: 0.03, pushDir: 1,
        over: (c, t) => acc(c, t, C1),
        draw(c, t, lt) {
          const ts = C1(t), gs = gaps(C1(tHueco)), big = gs[gs.length - 1];
          c.save(); c.translate(960, 540); c.scale(1.6, 1.6); c.translate(-960, -620);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'worried' : 'content'),
            over: (cx, g2s, cars, S) => { if (t > tHueco - 0.1) P.spring(cx, A.ringPt(big.i, S), A.ringPt(big.j, S), A.ramp(t, tHueco - 0.1, 0.2)); } });
          c.restore();
        },
        cues: A => [{ t: tHueco, kind: 'spring' }] });
      shots.push({ id: 'B11_squeeze', start: tUn2 - 0.08, bg: 'ring_close2', focus: [960, 540], push: 0.03, pushDir: -1,
        over: (c, t) => acc(c, t, C2),
        draw(c, t, lt) {
          const ts = C2(t), gs = gaps(C2(tApreton)), sm = gs[0];
          c.save(); c.translate(960, 540); c.scale(1.6, 1.6); c.translate(-760, -520);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'worried' : 'content'),
            over: (cx, g2s, cars, S) => { if (t > tApreton - 0.1) { const p = A.ringPt(sm.i, S), q = A.ringPt(sm.j, S); P.squeeze(cx, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 16, A.pulse(t, tApreton - 0.1, 0.15, 0.7, 0.3)); } } });
          c.restore();
        },
        cues: A => [{ t: tApreton, kind: 'squeeze' }] });
      shots.push({ id: 'B12_3min', start: tA7 - 0.1, bg: 'ring', focus: [960, 540], push: 0.022, pushDir: 1,
        over: (c, t) => { acc(c, t, C3); },
        draw(c, t, lt) { A.ring(c, t, { simT: C3(t), carExpr: (i, st) => (st ? 'annoyed' : 'content') }); },
        cues: A => [{ t: tMinutos, kind: 'clock_tick' }] });
      // B13 · «cinco autos estaban completamente parados» (real speed: the five are stopped at 3:00)
      shots.push({ id: 'B13_five', start: tCinco - 0.25, bg: 'ring_jam', focus: [960, 540], push: 0.03, pushDir: 1,
        over: (c, t) => { recPill(c, false); P.clock(c, C4(t)); P.badge(c, K.W - 230, 230, '5', 120, A.ramp(t, tCinco, 0.2), 'parados'); P.source(c, SRC, 1); },
        draw(c, t, lt) {
          const ts = C4(t), j = A.jamSmooth(C4(tCinco), 2), jp = A.clampView(A.angPt(j), 2.0);
          c.save(); c.translate(960, 540); c.scale(2.0, 2.0); c.translate(-jp[0], -jp[1]);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? (A.blink(i + 2, t) ? 'grumpy' : 'annoyed') : 'worried'),
            carOver: (cx, i, x, y, b, S) => { if (S.v[i] < 0.3) P.ring(cx, x, y - 8, 30, 20, A.ramp(t, tCinco + 0.05 * (i % 5), 0.3), { w: 3.5 }); } });
          c.restore();
        },
        cues: A => [{ t: tCinco, kind: 'clonc' }] });
      // B14 · «En una pista vacía.» pull back
      shots.push({ id: 'B14_empty', start: tEn7 - 0.1, bg: 'ring_wide', focus: [960, 520], push: 0.03, pushDir: -1,
        over: (c, t) => { recPill(c, false); P.source(c, SRC, 1); },
        draw(c, t, lt) { A.ring(c, t, { simT: C4(t), carExpr: (i, st) => (st ? 'annoyed' : 'worried') }); },
        cues: A => [{ t: tEn7, kind: 'wind_gust' }] });
      // B15 · «¡¿Quién fue?!»
      shots.push({ id: 'B15_yell', start: tQuien - 0.35, bg: 'field_eli', focus: [900, 480], push: 0.03, pushDir: -1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          let head = null; const yell = A.pulse(t, tQuien - 0.03, 0.08, tFueE - tQuien + 0.2, 0.2);
          A.field(c, t, { simT: C4(t), frame: { z: 1.55, x: 900, y: 560 },
            chars: (cx) => { const r = K.cast.draw(cx, 'eli1', 860, G, 640, { view: 'q', dir: -1, pose: 'fist', ...A.ez(t, tQuien - 0.05, 'grumpy', 'furious'), t, look: [-0.8, -0.2], light: LF, shadow: 0.3, lean: t < tQuien ? -0.04 : 0.06, extras: t > tQuien ? ['anger'] : [] }); head = r.head; } });
          if (head) { const z = 1.55, hp = [960 + (head[0] - 900) * z, 540 + (head[1] - 560) * z, head[2] * z]; A.speaker('eli', hp); }
        },
        cues: A => [{ t: tQuien, kind: 'pop' }] });
      // B16 · the shrug wave: every driver shrugs, one after the other, backwards round the ring; then the observers
      const sw0 = tFueE + 0.4, swN = 22, swD = 0.055;
      shots.push({ id: 'B16_shrugs', start: tFueE + 0.35, bg: 'ring_shrug', focus: [960, 520], push: 0.025, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          const ts = C4(t), R = A.s2(), S0 = R.at(ts);
          let j0 = 0; for (let i = 0; i < R.N; i++) if (S0.v[i] < S0.v[j0]) j0 = i;
          const order = i => ((j0 - i) % R.N + R.N) % R.N;          // backwards from the jam
          const sh = i => A.pulse(t, sw0 + order(i) * swD, 0.1, 0.45, 0.25);
          c.save(); c.translate(960, 540); c.scale(1.18, 1.18); c.translate(-960, -600);
          A.ring(c, t, { simT: ts, carExpr: i => (sh(i) > 0.3 ? 'sheepish' : 'annoyed'),
            carOver: (cx, i, x, y) => P.shrug(cx, x, y - 34, 28, sh(i)),
            person: (p, ro) => { if (t > sw0 + swN * swD) { ro.pose = 'shrug'; ro.expr = 'sheepish'; } },
            hero: (cx, p, x, y, u, jam, tt) => { if (p.who === 'eli1') K.cast.draw(cx, 'eli1', x, y, u, { view: 'q', dir: 1, pose: 'fist', expr: 'furious', t: tt, light: LF, shadow: 0.3 });
              else K.cast.draw(cx, 'mila1', x, y, u, { view: 'q', dir: -1, pose: 'clasp', expr: 'happy', t: tt, light: LF, shadow: 0.3 }); return true; } });
          c.restore();
        },
        cues: A => [{ t: sw0, kind: 'shrug_wave', n: swN, d: swD }] });
      // B17 · Eli shrugs too — v5 #4: on «La larga: este video.» (the ring of shrugs carries «Respuesta corta: todos.»); he
      // drops the fist into the shrug, then looks at the camera on «video» (was a 0.65 s insert just before «Lo que…»)
      const tLarga = w('La', 1, '07'), tVideo = w('video', 1, '07');
      shots.push({ id: 'B17_eli_shrug', start: tLarga - 0.1, bg: 'field_eli2', focus: [940, 500], push: 0.03, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          A.field(c, t, { simT: C4(t), frame: { z: 1.7, x: 940, y: 560 },
            chars: (cx) => K.cast.draw(cx, 'eli1', 940, G, 640, { view: 'front', ...A.pz(t, tLarga + 0.15, 'fist', 'shrug', 0.3), ...A.ez(t, tLarga + 0.15, 'grumpy', 'sheepish'), t, look: t > tVideo ? [0, 0] : [0.3, 0.2], light: LF, shadow: 0.3 }) });
        },
        cues: A => [{ t: tLarga + 0.15, kind: 'mm' }] });

      // ================================================================ BEAT 8 · it slides back
      shots.push({ id: 'B18_mila', start: tLo - 0.05, bg: 'field_mila', focus: [960, 520], push: 0.03, pushDir: 1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          A.field(c, t, { simT: C5(t), frame: { z: 1.6, x: 980, y: 640 },
            chars: (cx) => K.cast.draw(cx, 'mila1', 980, G - 150 /* art review 2026-10: knees-up sitting puts the boots lower; keep them in frame */, 660, { view: 'q', dir: -1, pose: 'sit', seated: true, legs: true, sitGround: true, ...A.ez(t, A.at('encanta', 1, { beat: '08' }), 'curious', 'awe'), t, look: [-0.7, -0.3], light: LF, shadow: 0.3, blink: blink(5, t) }) });
        } });
      // B19 · «los autos siempre avanzan»: teal chevrons along the direction of travel
      const jamCam = (c, t, z) => { const j = A.jamSmooth(C5(t), 3), jp = A.clampView(A.angPt(j), z); c.translate(960, 540); c.scale(z, z); c.translate(-jp[0], -jp[1]); };
      shots.push({ id: 'B19_forward', start: tLos8 - 0.1, bg: 'ring_follow', focus: [960, 540], push: 0.025, pushDir: -1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          const ts = C5(t); c.save(); jamCam(c, t, 1.7);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'),
            carOver: (cx, i, x, y, b, S) => { if (S.v[i] > 2) { const a = A.ringAng(i, S), p1 = A.angPt(a), p2 = A.angPt(a + 0.05); P.chevron(cx, x, y - 34, 12, Math.atan2(p2[1] - p1[1], p2[0] - p1[0]), A.ramp(t, tAvanzan - 0.2, 0.25)); } } });
          c.restore();
        } });
      // B20 · «y el embotellamiento se desliza hacia atrás»: the camera follows the jam; the arrow points back
      shots.push({ id: 'B20_back', start: tY - 0.05, bg: 'ring_follow2', focus: [960, 540], push: 0.025, pushDir: 1,
        over: (c, t) => { recPill(c, false); },
        draw(c, t, lt) {
          const ts = C5(t); c.save(); jamCam(c, t, 2.2);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'),
            under: (cx) => { const j = A.jamSmooth(ts, 3), k = A.ramp(t, tAtras - 0.15, 0.45); if (k <= 0) return;
              const n = 30, pts = []; for (let q = 0; q <= n * k; q++) pts.push(A.angPt(j - 0.05 - q / n * 0.75, -6.5));
              cx.strokeStyle = '#23746C'; cx.lineWidth = 8; cx.lineCap = 'round'; cx.beginPath(); pts.forEach((p, q) => (q ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]))); cx.stroke();
              if (k > 0.9 && pts.length > 2) { const e = pts[pts.length - 1], f = pts[pts.length - 3], an = Math.atan2(e[1] - f[1], e[0] - f[0]); P.chevron(cx, e[0], e[1], 16, an, 1); } } });
          c.restore();
        },
        cues: A => [{ t: tAtras - 0.15, kind: 'swish' }] });
      // B21 · «a unos veinte kilómetros por hora»: Mila walks backwards with the jam, Eli forwards with a car
      const wk0 = tA8 - 0.05;
      shots.push({ id: 'B21_walk', start: wk0, bg: 'ring', focus: [960, 540], push: 0.022, pushDir: -1,
        over: (c, t) => { recPill(c, false); P.badge(c, 960, 800, '≈20 km/h ←', 54, A.ramp(t, tVeinte, 0.25)); P.source(c, SRC, 1); },
        draw(c, t, lt) {
          const ts = C5(t), R = A.s2(), S = R.at(ts), S0 = R.at(C5(wk0)), j0 = A.jamSmooth(C5(wk0), 3);
          let car = 0, best = 9; for (let i = 0; i < R.N; i++) { const d = Math.abs(Math.atan2(Math.sin(A.ringAng(i, S0) - j0 - 0.25), Math.cos(A.ringAng(i, S0) - j0 - 0.25))); if (d < best) { best = d; car = i; } }
          const aM = A.jamSmooth(ts, 3), aE = A.ringAng(car, S);
          A.ring(c, t, { simT: ts, noBranch: true, carExpr: (i, st) => (st ? 'annoyed' : 'content'),   // Guardian v4 (Qwen timings): the longer shot walks Mila under the foreground branch; no branch here
            over: (cx) => {
              const pm = A.angPt(aM, -5.4), pe = A.angPt(aE, 7.5), u = 17.5 * 7.2 * 1.6;   // P1-10: Mila walks the inner edge of the track (cones at −4.4 m), never on the asphalt
              K.cast.draw(cx, 'mila1', pm[0], pm[1], u, { view: 'q', dir: Math.cos(aM) > 0 ? -1 : 1, pose: 'walk', expr: 'happy', t: -t, light: LF, shadow: 0.3 });
              K.cast.draw(cx, 'eli1', pe[0], pe[1], u, { view: 'q', dir: Math.cos(aE) > 0 ? 1 : -1, pose: 'walk', expr: 'determined', t, light: LF, shadow: 0.3 });
            },
            hero: () => true });
        } });
      // B22 · «Más o menos lo que va una bicicleta»: the little ink bicycle rides beside the jam
      shots.push({ id: 'B22_bike', start: tMas8 - 0.1, bg: 'ring_follow3', focus: [960, 540], push: 0.03, pushDir: 1,
        over: (c, t) => recPill(c, false),
        draw(c, t, lt) {
          const ts = C5(t); c.save(); jamCam(c, t, 2.0);
          A.ring(c, t, { simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'), hero: () => true,
            over: (cx) => { const j = A.jamSmooth(ts, 3), pb = A.angPt(j - 0.22, -5.6), pm = A.angPt(j + 0.04, -5.4), u = 17.5 * 7.2 * 1.6;   // P1-10: inner edge of the track, the bike beside her
              K.cast.draw(cx, 'mila1', pm[0], pm[1], u, { view: 'q', dir: Math.cos(j) > 0 ? -1 : 1, pose: 'walk', expr: 'laugh', t: -t, light: LF, shadow: 0.3 });
              P.bike(cx, pb[0], pb[1] - 46 * 1.6 * 0.32, 46 * 1.6, t * 9, Math.cos(j) > 0 ? -1 : 1, A.pulse(t, tBici + 0.2, 0.05, 0.4, 0.2)); } });
          c.restore();
        },
        cues: A => [{ t: tBici + 0.2, kind: 'bell' }] });
      // B23 · on the far side Eli stops, looks across at Mila and the jam beside her, scratches his head
      shots.push({ id: 'B23_scratch', start: tBici - 0.15 + 0.85, bg: 'field_eli3', focus: [900, 500], push: 0.03, pushDir: -1,
        over: (c) => recPill(c, false),
        draw(c, t, lt) {
          A.field(c, t, { simT: C5(t), frame: { z: 1.5, x: 900, y: 580 },
            chars: (cx) => K.cast.draw(cx, 'eli1', 900, G, 640, { view: 'q', dir: -1, pose: 'scratch', expr: 'thinking', t, look: [-0.9, -0.2], light: LF, shadow: 0.3, blink: blink(3, t) }) });
        } });
      return shots;
    },
    ambience(A) {
      const t0 = A.at('Mila', 1, { beat: '06' }), t1 = A.at('Vamos', 1, { beat: '09' });
      return [{ kind: 'field_birds', t0, t1 }, { kind: 'wind_grass', t0, t1 }, { kind: 'ring_hum', t0, t1: A.at('Al', 1, { beat: '07' }) },
        { kind: 'ring_hum_fast', t0: A.at('Al', 1, { beat: '07' }), t1: A.at('cinco', 1, { beat: '07' }) - 0.25 }, { kind: 'music_light', t0, t1 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
