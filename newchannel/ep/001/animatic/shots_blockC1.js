/* Ep 001 · BLOCK C1 · Act 2, beats 9-10: the circle stretched into a line (S3, overcast noon) and chain instability
   (S4 graph). Times from words (A.at) or S3/S4 events (A.ev). Sim speed: ×1 (no label) on the close-ups of the first
   two cars («vamos más despacio»), ×3 on the cascade so that car 10 stops on «alto» (PRODUCTION_NOTES asked ×2; ×2
   cannot put the 3rd car on «tercero» and the stop on «alto»; the label always says the true factor). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const ELI = 2, NUM = i => 12 - i, IDX = n => 12 - n;

  A.block('C1', {
    t0: null, t1: null,
    async setup() { this.t0 = A.at('Vamos', 1, { beat: '09' }); this.t1 = A.at('No', 1, { beat: '11' }); },
    post: { grain: 0.12, vignette: 0.32, vignetteColor: '#3a3a4a', bloom: 0.12 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const tEstir = w('Estiremos', 1, '09'), tRecta = w('recta', 1, '09', { edge: 'end' }), tEl = w('El', 2, '09'), tToca = w('toca', 1, '09');
      const tSegundo = w('El', 4, '09'), tNota = w('nota', 1, '09'), tInstante = w('instante', 1, '09'), tTarde = w('tarde', 1, '09'), tEn = w('En', 1, '09');
      const tAsi = w('así', 1, '09'), tFrenar = w('frenar', 1, '09'), tEl3 = w('El', 5, '09'), tTercero = w('tercero', 1, '09');
      const noT = [1, 2, 3].map(n => A.at('no', n, { beat: '09', speaker: 'eli' })), tPara = w('Para', 1, '09'), tAlto = w('alto', 1, '09'), tTotal = w('total', 1, '09', { edge: 'end' });
      const tLos = w('Los', 1, '10'), tInest = w('inestabilidad', 1, '10'), tLa = w('La', 1, '10'), tCadena2 = w('cadena', 2, '10'), tAutos = w('autos', 1, '10', { edge: 'end' });
      const tSi1 = w('Si', 1, '10'), tSi2 = w('Si', 2, '10'), tComo = w('como', 1, '10'), tChisme = w('chisme', 1, '10'), tCuentaE = w('cuenta', 1, '10', { edge: 'end' });
      const tQue = A.at('Que', 1, { beat: '10', speaker: 'eli' }), tQueE = A.at('qué', 1, { beat: '10', speaker: 'eli', edge: 'end' });
      // S3 events
      const ev = (type, f) => A.ev('S3', type, f), on = n => ev('brake_onset', e => e.car === IDX(n));
      const sTap = ev('tap_start'), sWin = ev('car2_reaction_window'), sStop10 = ev('stop', e => e.car === ELI);
      const L1 = A.map(sTap, tToca, 2);                       // the first driver taps on «toca» (×2)
      const L2 = A.map(sWin, tNota, 1);                       // the 2nd driver sees it on «nota» (×1, close)
      const L3 = A.map(on(3), tTercero, 3);                   // the 3rd lights up on «tercero» (×3) ...
      const stopAt = tTercero + (sStop10 - on(3)) / 3;        // ... and car 10 stops on its own near «alto»
      const N = A.LIGHT_NOON;
      const R = () => A.s3();
      // camera on the platoon: smoothed mean of the numbered cars (sim seconds window)
      const platoon = (ts, a = 2, b = 11) => { let acc = 0, wsum = 0; for (let k = -6; k <= 6; k++) { const S = R().at(ts + k * 0.25), ww = Math.exp(-k * k / 12); let m = 0; for (let i = a; i <= b; i++) m += S.x[i]; acc += m / (b - a + 1) * ww; wsum += ww; } return acc / wsum; };
      const carCam = (i, ts) => { let acc = 0, wsum = 0; for (let k = -6; k <= 6; k++) { const ww = Math.exp(-k * k / 12); acc += R().at(ts + k * 0.25).x[i] * ww; wsum += ww; } return acc / wsum; };
      const bars = (cx, i, x, y, s, ts, scale = 160, aAll = 1, skipEli = false) => { if (i < 2 || (skipEli && i === ELI)) return; const h = A.peakSoFar(i, ts) * scale; P.bar(cx, x - 0.2 * s, y - 2.0 * s - 18, Math.max(16, s * 0.45), h, aAll * K.clamp(h / 8)); P.num(cx, x - 0.2 * s, y - 2.0 * s - 18 - h - 30, NUM(i), Math.max(34, s * 0.7), aAll, i === ELI); };
      const eliAt = (eO) => (cx, sx, sy, s, S, b) => K.cast.crew2(cx, sx, sy, s, { driver: 'eli1', t: cx.__t || 0, light: N, u: 2.7 * s, driverO: eO });
      // the camera rides back along the line with the brake wave (the car whose light comes on now), smoothed
      const waveCam = ts => { let acc = 0, wsum = 0; for (let k = -6; k <= 6; k++) { const tt = ts + k * 0.3, nf = K.clamp(3 + (tt - on(3)) / ((on(10) - on(3)) / 7), 1, 10), n0 = Math.floor(nf), u = nf - n0, S = R().at(tt), xa = S.x[IDX(n0)], xb = S.x[IDX(Math.min(10, n0 + 1))], ww = Math.exp(-k * k / 12); acc += K.lerp(xa, xb, u) * ww; wsum += ww; } return acc / wsum - 6; };
      const WZ = (c, f) => { c.save(); c.translate(960, 850); c.scale(1.35, 1.35); c.translate(-960, -850); f(); c.restore(); };   // wide line shots: frame the road, not the sky
      const shots = [];

      // C01 · «Vamos más despacio.» Mila, at the edge of the field, slows the class down
      shots.push({ id: 'C01_slow', start: T0, bg: 'field_mila', focus: [960, 520], push: 0.03,
        draw(c, t, lt) {
          A.field(c, t, { simT: A.ev('S2', 'clock_3min') + 40 + (t - T0) * 0.4, frame: { z: 1.6, x: 920, y: 600 },
            chars: (cx) => K.cast.draw(cx, 'mila1', 920, A.FIELD.GROUND, 660, { view: 'q', dir: -1, pose: 'palm', expr: 'happy', t, look: [-0.6, 0.1], light: A.LIGHT_FIELD, shadow: 0.3, talk: 0, blink: A.blink(5, t) }) });
        } });

      // C02 · «Estiremos el círculo hasta volverlo una línea recta»: the ring of dots straightens on paper
      shots.push({ id: 'C02_stretch', start: tEstir - 0.12, bg: 'paper', focus: [960, 540], push: 0.025, breath: true,
        post: { grain: 0.1, vignette: 0.25, vignetteColor: '#5a4a50', bloom: 0 },
        draw(c, t, lt) {
          c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H);
          const u = K.ease.inOut(K.clamp((t - tEstir - 0.2) / (tRecta - tEstir - 0.5)));
          c.save(); c.strokeStyle = K.rgba('#2a1a1e', 0.25); c.lineWidth = 3; c.setLineDash([12, 14]);
          c.beginPath(); for (let k = 0; k <= 60; k++) { const a = k / 60 * K.TAU, cpx = 960 + Math.cos(a) * 330, cpy = 540 + Math.sin(a) * 330 * 0.62, lx = 260 + k / 60 * 1400; const x = K.lerp(cpx, lx, u), y = K.lerp(cpy, 560, u); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
          for (let i = 0; i < 12; i++) {
            const a = -Math.PI / 2 + i / 12 * K.TAU, cpx = 960 + Math.cos(a) * 330, cpy = 540 + Math.sin(a) * 330 * 0.62, lx = 1600 - i * 125;
            const x = K.lerp(cpx, lx, u), y = K.lerp(cpy, 560, u), hd = K.lerp(a + Math.PI / 2, 0, u);
            const pe = E.persona(500 + i);
            K.car.top(c, { sc: 26, sinE: 0.62, cosE: 0.78, ox: x, oy: y }, 0, 0, hd, { k: 1, color: i === 9 ? K.TEAL : pe.color, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, expr: 'content' });
          }
          P.chevron(c, 1760, 560, 26, 0, u);
        },
        cues: A => [{ t: tEstir, kind: 'stretch', t1: tRecta }] });

      // C03 · «El primer conductor toca el freno»: the line, side view, overcast; car 1's bar starts
      shots.push({ id: 'C03_line', start: tEl - 0.1, bg: 'line', label: 'ACELERADO ×2', focus: [960, 560], push: 0.022,
        draw(c, t, lt) {
          const ts = L1(t);
          WZ(c, () => A.line(c, t, { simT: ts, camS: carCam(IDX(3), ts) + 2, pxm: 17, carK: 2.0, eli: eliAt({ pose: 'drive', expr: 'happy', t }), carOver: (cx, i, x, y, s) => bars(cx, i, x, y, s, ts, 130) }));
        },
        cues: A => [{ t: tToca + (on(1) - sTap) / 2, kind: 'line_brake', step: 1 }] });

      // C04 · «El segundo lo nota un instante tarde»: cars 1-2 close; the hourglass runs over car 2
      shots.push({ id: 'C04_late', start: tSegundo - 0.08, bg: 'line_close12', focus: [960, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = L2(t), i2 = IDX(2), i1 = IDX(1), x2 = carCam(i2, ts), x1 = carCam(i1, ts);
          const g = A.line(c, t, { simT: ts, camS: (x1 + x2) / 2 + 1, pxm: 60, carOver: (cx, i, x, y, s) => bars(cx, i, x, y, s, ts, 150) });
          const sx2 = g.toX(g.S.x[i2]); P.hourglass(c, sx2 + 30, 300, 120, K.clamp((ts - sWin) / (on(2) - sWin)), A.ramp(t, tInstante - 0.15, 0.2) * (1 - A.ramp(t, tEn + 0.6, 0.2)));
        },
        cues: A => [{ t: tNota, kind: 'line_brake', step: 1 }, { t: tInstante, kind: 'tick_tock', t1: tNota + (on(2) - sWin) }] });

      // C05a · «En ese instante ya se acercó»: the ruler shows the gap shrinking
      shots.push({ id: 'C05_ruler', start: tEn - 0.08, bg: 'line_close2', focus: [960, 600], push: 0.03, pushDir: -1,
        draw(c, t, lt) {
          const ts = L2(t), i2 = IDX(2), i1 = IDX(1);
          const g = A.line(c, t, { simT: ts, camS: carCam(i2, ts) + 5.5, pxm: 70 });
          const xa = g.toX(g.S.x[i2]) + 3.3 * 70 * 0.52, xb = g.toX(g.S.x[i1]) - 3.3 * 70 * 0.5;
          P.ruler(c, xa, Math.min(K.W + 40, xb), 640, g.S.x[i1] - g.S.x[i2] - 4.5, A.ramp(t, tEn + 0.1, 0.25));
        },
        cues: A => [{ t: tEn + 0.1, kind: 'ruler' }] });

      // C05b · «así que tiene que frenar un poco más fuerte»: bars 1 and 2 side by side
      shots.push({ id: 'C05_bars', start: tAsi - 0.12, bg: 'line_mid', focus: [960, 520], push: 0.025, pushDir: 1,
        draw(c, t, lt) {
          const ts = L2(t);
          A.line(c, t, { simT: ts, camS: carCam(IDX(2), ts) + 9, pxm: 26, carOver: (cx, i, x, y, s) => bars(cx, i, x, y, s, ts, 150) });
        } });

      // C06 · «El tercero, más tarde y más fuerte todavía»: the cascade, wide (×3)
      shots.push({ id: 'C06_cascade', start: tEl3 - 0.1, bg: 'line', label: 'ACELERADO ×3', focus: [960, 520], push: 0.022, pushDir: -1,
        draw(c, t, lt) {
          const ts = L3(t);
          WZ(c, () => A.line(c, t, { simT: ts, camS: waveCam(ts), pxm: 17, carK: 2.0, eli: eliAt({ pose: 'drive', expr: 'worried', look: [0.9, -0.2], t }), carOver: (cx, i, x, y, s) => bars(cx, i, x, y, s, ts, 130) }));
        },
        cues: A => [3, 4, 5, 6, 7].map(n => ({ t: tTercero + (on(n) - on(3)) / 3, kind: 'line_brake', step: n })) });

      // C07 · Eli: «No… no… ¡no!» — the bars come at him, each one higher
      shots.push({ id: 'C07_no', start: noT[0] - 0.22, bg: 'line_eli', label: 'ACELERADO ×3', focus: [900, 520], push: 0.035, pushDir: 1,
        draw(c, t, lt) {
          const ts = L3(t), sp = A.talk('eli', t), k = noT.filter(x => t > x - 0.02).length;
          const eO = { pose: 'drive', expr: k >= 3 ? 'surprised' : 'worried', look: [0.9, -0.3], t, talk: sp.talk, viseme: sp.viseme, lean: 0.02 * k };
          c.__t = t;
          A.line(c, t, { simT: ts, camS: carCam(ELI, ts) + 1.2, pxm: 190, eli: eliAt(eO), carOver: (cx, i, x, y, s) => bars(cx, i, x, y, s, ts, 140, 1, true) });
        },
        cues: A => [8, 9].map(n => ({ t: tTercero + (on(n) - on(3)) / 3, kind: 'line_brake', step: n })) });

      // C08 · «Para el auto número diez: alto total.» — the tallest bar lands on him like a hat; Mila ticks her board
      shots.push({ id: 'C08_hat', start: tPara - 0.12, bg: 'line_eli_stop', label: 'ACELERADO ×3', focus: [960, 520], push: 0.03, pushDir: -1,
        draw(c, t, lt) {
          const ts = L3(t), since = t - stopAt;
          const eO = { pose: 'drive', expr: since < 0 ? 'determined' : since < 0.5 ? 'surprised' : 'annoyed', look: since > 0.6 ? [0.15, -0.95] : [0.9, -0.1], t, lean: since > 0 ? 0.08 * Math.exp(-since * 5) : 0 };
          let head = null; c.__t = t; A._outer = c.getTransform();
          const g = A.line(c, t, { simT: ts, camS: carCam(ELI, ts) + 2.6, pxm: 150,
            eli: (cx, sx, sy, s, S, b) => { const r = K.cast.crew2(cx, sx, sy, s, { driver: 'eli1', t, light: N, u: 2.7 * s, driverO: eO }); head = A.toOuter(cx, r.driver.head[0], r.driver.head[1]); head[2] *= r.driver.head[2]; },
            chars: (cx, toX, S) => K.cast.draw(cx, 'mila1', toX(S.x[ELI]) - 430, 1070, 640, { view: 'q', dir: 1, pose: 'clipboard', expr: since > 0.3 ? 'smug' : 'thinking', t, look: [0.9, -0.2], light: N, shadow: 0.25 }) });
          if (head) {   // the bar of car 10 (its true peak) drops onto the beanie at the stop
            const h = A.peakSoFar(ELI, ts) * 140, drop = since < 0 ? 0 : K.ease.outBack(K.clamp(since / 0.35));
            const top = head[1] - head[2] * 1.55, yb = K.lerp(top - 320, top, drop);
            P.bar(c, head[0] + head[2] * 0.1, yb, 64, h, 1);
          }
        },
        cues: A => [{ t: stopAt, kind: 'stop_thunk' }, { t: stopAt + 0.3, kind: 'hat_clonk' }, { t: tTotal, kind: 'tick_pencil' }] });

      // ================================================================ BEAT 10 · chain instability
      shots.push({ id: 'C09_plate', start: tLos - 0.1, bg: 'line_wide', focus: [960, 520], push: 0.024, pushDir: 1,
        draw(c, t, lt) {
          const ts = sStop10 + 2 + (t - tLos) * 0.5;
          WZ(c, () => A.line(c, t, { simT: ts, camS: platoon(ts, 2, 7), pxm: 13, carK: 2.2 }));
          P.plate(c, 960, 260, 'INESTABILIDAD DE CADENA', 58, A.ramp(t, tInest - 0.05, 0.3));
        },
        cues: A => [{ t: tInest, kind: 'plate' }] });
      shots.push({ id: 'C10_chain', start: tLa - 0.1, bg: 'line_wide2', focus: [960, 560], push: 0.025, pushDir: -1,
        draw(c, t, lt) {
          const ts = sStop10 + 2 + (tLos - tLos) + (t - tLos) * 0.5, k = K.clamp((t - tCadena2) / (tAutos - tCadena2));
          WZ(c, () => A.line(c, t, { simT: ts, camS: platoon(ts, 4, 11) + 2, pxm: 13, carK: 2.2,
            chars: (cx, toX, S) => { for (let i = 1; i < 11; i++) { const a = toX(S.x[i]) + 3.3 * 13 * 2.2 * 0.5, b = toX(S.x[i + 1]) - 3.3 * 13 * 2.2 * 0.5; const kk = K.clamp(k * 10 - (10 - i)); P.chain(cx, a, b, A.LINE.GY - 0.6 * 13 * 2.2, kk); } } }));
        },
        cues: A => [{ t: tCadena2, kind: 'chain', t1: tAutos }] });
      const S4m = (anchor, N4) => A.map(A.s4().p.taps[0].t, anchor, N4);   // S4 records no events: the tap time comes from its spec
      shots.push({ id: 'C11_stable', start: tSi1 - 0.12, bg: 'graph', label: 'ACELERADO ×6', focus: [960, 420], push: 0.025, pushDir: 1,
        post: { grain: 0.1, vignette: 0.25, vignetteColor: '#5a4a50', bloom: 0 },
        draw(c, t, lt) { A.graphS4(c, t, S4m(tSi1, 6)(t), { focus: 'ESTABLE' }); } });
      shots.push({ id: 'C12_unstable', start: tSi2 - 0.12, bg: 'graph_low', label: 'ACELERADO ×8', focus: [960, 700], push: 0.03, pushDir: 1, zBase: 1.08,
        post: { grain: 0.1, vignette: 0.25, vignetteColor: '#5a4a50', bloom: 0 },
        draw(c, t, lt) { A.graphS4(c, t, S4m(tSi2, 8)(t), { focus: 'INESTABLE' }); } });
      // C13 · «como un chisme que crece cada vez que alguien lo cuenta»: Mila whispers a dot; the balloons grow car to car
      const g0 = tComo, gStep = (tCuentaE - tComo - 0.2) / 9;
      shots.push({ id: 'C13_gossip', start: tComo - 0.12, bg: 'line_gossip', focus: [960, 520], push: 0.022, pushDir: -1,
        draw(c, t, lt) {
          const ts = sStop10 + 1.2;
          const S0 = R().at(ts), kf = K.clamp((t - g0) / gStep - 0.3, 0, 9), k0 = Math.floor(kf), uu = K.ease.inOut(kf - k0), xg = K.lerp(S0.x[11 - k0], S0.x[Math.max(2, 10 - k0)], uu);
          A.line(c, t, { simT: ts, camS: Math.min(S0.x[11] - 560 / 12.5, xg + 2), pxm: 12.5, drivers: (i) => (i >= 2 && t > g0 + (11 - i) * gStep ? 'surprised' : 'neutral'),
            chars: (cx, toX, S) => {
              const xm = toX(S.x[11]) + 150; K.cast.draw(cx, 'mila1', xm, 1060, 420, { view: 'q', dir: -1, pose: 'cheek' in K.cast.POSES ? 'cheek' : 'palm', expr: 'smug', t, look: [-0.9, 0], light: N, shadow: 0.25 });
              for (let k = 0; k < 10; k++) { const i = 11 - k, a = A.pulse(t, g0 + k * gStep, 0.12, gStep * 1.3, 0.15); if (a <= 0) continue;
                const x = toX(S.x[i]) - 10, sz = 30 + k * k * 2.6; P.gossip(cx, x, A.LINE.GY - 120 - sz * 0.8, sz, a, { dot: k === 0, seed: 9 + k, doodle: k >= 8 }); }
            } });
        },
        cues: A => [{ t: g0, kind: 'whisper_grow', n: 10, d: gStep }] });
      // C14 · «¡¿Que yo qué?!» — the giant balloon reaches Eli, with a doodle of him; he shoves it away
      shots.push({ id: 'C14_queyoque', start: tQue - 0.75, bg: 'line_eli2', focus: [880, 470], push: 0.035, pushDir: 1,
        draw(c, t, lt) {
          const ts = sStop10 + 1.2, read = t < tQue - 0.05, shove = A.ramp(t, tQue + 0.1, 0.18);
          const eO = read ? { pose: 'drive', expr: 'curious', look: [-0.2, -0.6], t } : { pose: 'open', expr: 'furious', look: [-0.2, -0.3], t, lean: 0.06, extras: ['anger'] };
          c.__t = t; let head = null;
          A.line(c, t, { simT: ts, camS: carCam(ELI, ts) + 0.6, pxm: 200,
            eli: (cx, sx, sy, s) => { const r = K.cast.crew2(cx, sx, sy, s, { driver: 'eli1', t, light: N, u: 2.7 * s, driverO: eO }); head = r.driver.head; } });
          P.gossip(c, 520 - shove * 700, 330 - shove * 120, 230, 1 - A.ramp(t, tQueE + 0.25, 0.2), { seed: 31, doodle: true, tail: -1 });
          if (!read && head) K.cast.bubble(c, [960 + 40, 520, 120], '¡¿QUE YO QUÉ?!', A.pulse(t, tQue, 0.08, tQueE - tQue + 0.3, 0.2));
        },
        cues: A => [{ t: tQue - 0.7, kind: 'murmur' }, { t: tQue, kind: 'pop' }, { t: tQue + 0.15, kind: 'whoosh_up' }] });
      return shots;
    },
    ambience(A) {
      const t0 = A.at('Vamos', 1, { beat: '09' }), t1 = A.at('No', 1, { beat: '11' });
      return [{ kind: 'wind', t0, t1 }, { kind: 'music_light', t0, t1 }, { kind: 'ring_hum', t0: A.at('El', 1, { beat: '09' }), t1: A.at('alto', 1, { beat: '09' }) + 0.5 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
