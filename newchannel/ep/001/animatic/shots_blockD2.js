/* Ep 001 · BLOCK D2 · Act 3, beats 17-19: too eager (S8, the knob; the big «¡¿Quién fue?!»), a patient person (S9,
   Mila at the wheel) and the shock absorber (S3B_ELI vs S3B_MILA, two timelines; the toll plaza; the overfull dome
   S5_40). Times from words or sim events (knob_up, wave_back, knob_down, mila_takes_wheel, eli_stop...). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const REC = 'RECREACIÓN ILUSTRADA', SRC = 'Stern et al., Transp. Res. C 2018', SRC3 = 'Nishi et al., Transp. Res. B 2013', AV = 0;

  A.block('D2', {
    t0: null, t1: null,
    async setup() { this.t0 = A.at('Después', 1, { beat: '17' }); this.t1 = A.at('Funciona', 1, { beat: '20' }); A._rr = A.adapter('S8'); },
    post: { grain: 0.13, vignette: 0.4, vignetteColor: '#2a1a2a', bloom: 0.18 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const el = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'eli' }, o)), mi = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'mila' }, o));
      // ---- words
      const tUn = w('un', 1, '17'), tRapido = w('rápido', 1, '17'), tLa = w('La', 2, '17'), tVolvio = w('volvió', 1, '17'), tQuien = el('Quién', 1, '17'), tFueE = el('fue', 1, '17', { edge: 'end' });
      const tEliM = mi('Eli', 1, '17'), tFue2 = el('Fue', 2, '17'), tVientoE = el('viento', 1, '17', { edge: 'end' }), tSer = w('Ser', 1, '17'), tLento = w('lento', 1, '17'), tEs = w('Es', 2, '17');
      const tEsta = w('Esta', 1, '18'), tEn = w('En', 1, '18'), tCompu = w('computadora', 1, '18'), tSolo = w('Solo', 1, '18'), tCon = w('con', 1, '18');
      const tHay = el('Hay', 1, '18'), tEse = mi('Ese', 1, '18'), tAmigoE = mi('amigo', 1, '18', { edge: 'end' }), tLos = w('Los', 1, '18'), tMitad = w('mitad', 1, '18'), tLa18 = w('La', 4, '18'), tQuinta = w('quinta', 1, '18'), tUna = w('Una', 1, '18');
      const tPor = w('Por', 1, '19'), tAmort = w('amortiguador', 1, '19'), tEl = w('El', 2, '19'), tEmbot = w('embotellamiento', 1, '19'), tCuando = w('cuando', 1, '19'), tAsi = w('así', 1, '19');
      const tLos19 = w('Los', 2, '19'), tPor2 = w('Por', 2, '19'), tYo = el('Yo', 1, '19'), tTodoE = el('todo', 1, '19', { edge: 'end' }), tEnJ = w('En', 1, '19'), tManejo = w('manejo', 1, '19');
      const tOjo = w('Ojo', 1, '19'), tSi = w('Si', 1, '19'), tNingun = w('ningún', 1, '19');
      // ---- sim
      const ev = (id, type) => A.ev(id, type);
      const S8 = () => A.adapter('S8'), S9 = () => A.adapter('S9');
      const K8u = A.map(ev('S8', 'knob_up'), tRapido, 4), K8b = A.map(ev('S8', 'wave_back'), tVolvio, 4), K8d = A.map(ev('S8', 'knob_down'), tLento, 4);
      const M9 = A.map(ev('S9', 'mila_takes_wheel'), tCompu, 4);
      const EL = A.map(ev('S3B_ELI', 'eli_stop'), tEmbot, 2), MI = A.map(ev('S3B_ELI', 'eli_stop'), tEmbot, 2);
      const LF = A.LIGHT_FIELD, G = A.FIELD.GROUND, N = A.LIGHT_NOON;
      const rec = (c, acc) => P.pill(c, 96, acc ? 152 : 84, REC, 26, 1), src = (c, s = SRC) => P.source(c, s, 1);
      const halo = (cx, x, y, a = 1, col = '#23746C') => { K.light.glow(cx, x, y - 6, 70, col, 0.55 * a, 'screen'); cx.save(); cx.globalAlpha = a; cx.strokeStyle = '#4fb3a8'; cx.lineWidth = 4; K.ellipse(cx, x, y - 4, 44, 24); cx.stroke(); cx.restore(); };
      const ring8 = (ts, o = {}) => Object.assign({ run: S8(), simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'), carOver: (cx, i, x, y) => { if (i === AV) halo(cx, x, y); } }, o);
      // the observers' laptop (generic, no brand) with the on-screen knob; k = knob position (0 = average, 1 = a bit faster)
      const laptop = (c, x, y, s, k, t) => { c.save(); c.translate(x, y); c.scale(s, s);
        c.fillStyle = '#c9b48f'; c.fillRect(-260, 60, 520, 26); c.fillStyle = '#9aa0ac'; K.rrect(c, -170, 20, 340, 40, 8); c.fill(); c.strokeStyle = '#2a1a1e'; c.lineWidth = 4; c.stroke();
        c.fillStyle = '#6a7080'; K.rrect(c, -160, -190, 320, 210, 12); c.fill(); c.stroke(); c.fillStyle = '#1c2433'; K.rrect(c, -145, -175, 290, 180, 6); c.fill();
        c.strokeStyle = '#4fb3a8'; c.lineWidth = 8; c.beginPath(); c.arc(0, -70, 60, Math.PI * 0.8, Math.PI * 2.2); c.stroke();
        const an = Math.PI * 1.5 + (k * 0.5 - 0.0) * 0.9; c.strokeStyle = '#fbf3e4'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -70); c.lineTo(Math.cos(an) * 52, -70 + Math.sin(an) * 52); c.stroke();
        c.fillStyle = '#fbf3e4'; c.font = '700 20px "Martian Mono"'; c.textAlign = 'center'; c.fillText('PROMEDIO', 0, -16); c.restore(); };
      const shots = [];

      // ================================================================ BEAT 17 · too eager
      const knob = t => A.ramp(t, tRapido - 0.15, 0.35) * (1 - A.ramp(t, tVientoE + 0.2, 0.3));
      shots.push({ id: 'F01_laptop', start: T0 - 0.05, bg: 'field_laptop', focus: [960, 560], push: 0.03, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S8(), simT: K8u(t), frame: { z: 1.4, x: 960, y: 580 }, chars: cx => {
          K.cast.draw(cx, 'eli1', 1250, G, 620, { view: 'q', dir: -1, pose: t > tUn - 0.2 ? 'point' : 'crossed', expr: 'smug', t, look: [0.2, -0.9], light: LF, shadow: 0.3, extras: [] });
          laptop(cx, 800, 860, 1.25, knob(t), t); } }); },
        cues: A => [{ t: T0 + 0.2, kind: 'whistle', t1: tRapido - 0.2 }, { t: tRapido - 0.15, kind: 'click' }] });
      shots.push({ id: 'F01_knob', start: tRapido - 0.35, bg: 'laptop_close', focus: [960, 520], push: 0.035, pushDir: 1, post: { grain: 0.1, vignette: 0.3, vignetteColor: '#5a4a50', bloom: 0.1 },
        draw(c, t, lt) { c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H); laptop(c, 960, 640, 2.6, knob(t), t);
          K.cast.draw(c, 'eli1', 1500, 1500, 1100, { view: 'q', dir: -1, pose: 'point', expr: 'smug', t, look: [0, -0.9], light: K.cast.LIGHT.board }); } });
      shots.push({ id: 'F02_back', start: tLa - 0.1, bg: 'ring', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { A.ring(c, t, ring8(K8b(t))); } });
      shots.push({ id: 'F03_yell', start: tQuien - 0.3, bg: 'field_eli', focus: [900, 480], push: 0.03, pushDir: -1, over: c => rec(c, false),
        draw(c, t, lt) { let head = null; const yell = A.pulse(t, tQuien - 0.03, 0.08, tFueE - tQuien + 0.25, 0.2);
          A.field(c, t, { run: S8(), simT: K8b(t), frame: { z: 1.55, x: 900, y: 560 }, chars: cx => { const r = K.cast.draw(cx, 'eli1', 860, G, 640, { view: 'q', dir: -1, pose: 'fist', expr: 'furious', t, light: LF, shadow: 0.3, lean: 0.06, extras: ['anger'] }); head = r.head; } });
          if (head && yell > 0.01) K.cast.bubble(c, [960 + (head[0] - 900) * 1.55, 540 + (head[1] - 560) * 1.55, head[2] * 1.55], '¡¿QUIÉN FUE?!', yell); },
        cues: A => [{ t: tQuien, kind: 'pop' }] });
      // F04 · silence: everybody turns to look at him (the drivers in the band, the observers, Mila)
      shots.push({ id: 'F04_stare', start: tFueE + 0.3, bg: 'field_stare', focus: [960, 540], push: 0.02, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S8(), simT: K8b(tFueE + 0.3), frame: { z: 1.25, x: 960, y: 600 }, carExpr: () => 'annoyed', chars: cx => {
          K.char.person(cx, 520, G - 20, 62, { t, seed: 4, skin: '#e3a983', hair: '#2b1d1a', hairStyle: 'bun', shirt: '#d8e04a', pose: 'stand', expr: 'annoyed', look: [0.9, 0], light: { ang: -2.4, rim: '#ffd99a', shade: '#3a3358' } });
          K.char.person(cx, 660, G - 20, 62, { t, seed: 5, skin: '#9a6447', hair: '#2b1d1a', hairStyle: 'cap', capColor: '#5d8a8f', shirt: '#d8e04a', pose: 'clipboard', expr: 'annoyed', look: [0.9, 0], light: { ang: -2.4, rim: '#ffd99a', shade: '#3a3358' } });
          K.cast.draw(cx, 'mila1', 1050, G - 6, 560, { view: 'q', dir: 1, pose: 'crossed', expr: 'annoyed', t, look: [0.9, 0], light: LF, shadow: 0.3 });
          K.cast.draw(cx, 'eli1', 1420, G, 580, { view: 'front', pose: 'fist', expr: 'sheepish', t, look: [-0.6, 0], light: LF, shadow: 0.3 }); } }); },
        cues: A => [{ t: tFueE + 0.3, kind: 'silence_hit' }] });
      shots.push({ id: 'F05_eli', start: tEliM - 0.2, bg: 'field_mila', focus: [960, 500], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { const sp = A.talk('mila', t); A.field(c, t, { run: S8(), simT: K8b(t), frame: { z: 1.8, x: 980, y: 560 }, chars: cx =>
          K.cast.draw(cx, 'mila1', 980, G, 660, { view: 'q', dir: 1, pose: 'crossed', expr: 'annoyed', t, look: [-0.3, 0.1], light: LF, shadow: 0.3, talk: sp.talk, viseme: sp.viseme }) }); } });
      // F06 · «…Fue el viento.» — whistling, a leaf crosses very slowly; Mila turns the knob back down with one finger
      shots.push({ id: 'F06_wind', start: tFue2 - 0.35, bg: 'field_leaf', focus: [960, 520], push: 0.025, pushDir: -1, over: c => rec(c, false),
        draw(c, t, lt) { const sp = A.talk('eli', t);
          A.field(c, t, { run: S8(), simT: K8b(t), frame: { z: 1.45, x: 960, y: 580 }, chars: cx => {
            K.cast.draw(cx, 'eli1', 820, G, 620, { view: 'q', dir: 1, pose: 'clasp', expr: 'sheepish', t, look: [0.3, -0.8], light: LF, shadow: 0.3, talk: sp.talk, viseme: sp.viseme });
            laptop(cx, 1320, 880, 0.9, knob(t), t);
            // eyes pass: Mila was half out of frame (x 1560 -> screen 1830) and blank; now inside, skeptical at Eli, then smug at the knob
            K.cast.draw(cx, 'mila1', 1470, G - 6, 600, { view: 'q', dir: -1, pose: t > tVientoE ? 'point' : 'crossed', expr: t > tVientoE ? 'smug' : 'annoyed', t, look: t > tVientoE ? [0.5, 0.5] : [0.8, -0.05], light: LF, shadow: 0.3 }); } });
          // the leaf
          const u = K.clamp((t - tFue2) / 2.2), lx = K.lerp(-60, 1980, u), ly = 400 + Math.sin(u * 9) * 40;
          c.save(); c.translate(lx, ly); c.rotate(Math.sin(u * 12) * 0.8); c.fillStyle = '#c99633'; c.strokeStyle = '#2a1a1e'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 26, 12, 0, 0, K.TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.stroke(); c.restore(); },
        cues: A => [{ t: tFue2 - 0.3, kind: 'whistle', t1: tVientoE + 0.4 }, { t: tFue2, kind: 'fiu' }, { t: tVientoE + 0.2, kind: 'click' }] });
      shots.push({ id: 'F07_down', start: tSer - 0.1, bg: 'ring_down', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.25, 1.25); c.translate(-960, -600); A.ring(c, t, ring8(K8d(t) + 20)); c.restore(); } });
      shots.push({ id: 'F07_plate', start: tEs - 0.1, bg: 'ring_plate', focus: [960, 520], push: 0.022, pushDir: -1, over: c => rec(c, false),
        draw(c, t, lt) { A.ring(c, t, ring8(K8d(t) + 20)); c.fillStyle = K.rgba('#1a1020', 0.3); c.fillRect(0, 0, K.W, K.H); P.plate(c, 960, 520, 'PACIENTE = PROMEDIO', 70, A.ramp(t, tEs, 0.3)); },
        cues: A => [{ t: tEs, kind: 'plate' }] });

      // ================================================================ BEAT 18 · a patient person (S9, Mila at the wheel)
      const ring9 = (ts, o = {}) => Object.assign({ run: S9(), simT: ts, carExpr: (i, st) => (st ? 'annoyed' : 'content'), carOver: (cx, i, x, y) => { if (i === AV && ts > ev('S9', 'mila_takes_wheel')) halo(cx, x, y); } }, o);
      shots.push({ id: 'F08_fav', start: tEsta - 0.1, bg: 'field_mila2', focus: [960, 500], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S9(), simT: M9(t), frame: { z: 1.7, x: 980, y: 560 }, chars: cx => K.cast.draw(cx, 'mila1', 980, G, 660, { view: 'front', pose: 'clasp', expr: 'awe', t, look: [0, -0.3], light: LF, shadow: 0.3 }) }); } });
      shots.push({ id: 'F09_jump', start: tEn - 0.1, bg: 'ring9', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, over: (c, t) => { rec(c, true); src(c); P.pill(c, K.W - 96, 230, 'Mila hace de conductora', 28, A.ramp(t, tCompu + 0.2, 0.3), { align: 'right', bg: K.rgba('#7158b8', 0.92) }); },
        draw(c, t, lt) { A._rr = S9(); A.ring(c, t, ring9(M9(t))); A._rr = S8(); },
        cues: A => [{ t: tCompu, kind: 'ding' }] });
      // F10-F12 · in the car, side view: Mila drives (one hand on the wheel), Eli is the passenger
      const inCar = (c, t, frame, mO, eO, extra) => A.close(c, t, 0, { id: 'S9', idx: AV, simT: M9(t), frame,
        crew: (cx, sx, sy, SC, info) => { const r = K.cast.crew2(cx, sx, sy, SC, { driver: 'mila1', passenger: 'eli1', t, light: Object.assign({}, K.cast.LIGHT.golden, { rim: info.rim }), bob: info.bob, u: 2.7 * SC, driverO: mO, passengerO: eO });
          if (extra) extra(cx, sx, sy, SC, r); } });
      const sticker = (cx, sx, sy, SC, a) => { cx.save(); cx.translate(sx + 0.75 * SC, sy - 0.05 * SC); cx.rotate(-0.12); P.pill(cx, 0, 0, 'PROMEDIO', 0.09 * SC, a, { align: 'center', bg: K.rgba('#23746C', 0.95) }); cx.restore(); };
      shots.push({ id: 'F10_wheel', start: tSolo - 0.1, bg: 'close9', focus: [920, 540], push: 0.03, pushDir: 1,
        draw(c, t, lt) { inCar(c, t, { z: 1.55, wx: 600, wy: 640, sx: 940, sy: 560 }, { pose: 'drive', expr: 'happy', look: [0.9, 0] }, { pose: 'lap', expr: 'curious', look: [0.7, -0.1] }, (cx, sx, sy, SC) => sticker(cx, sx, sy, SC, A.ramp(t, tCon, 0.3))); } });
      shots.push({ id: 'F10_sticker', start: tCon - 0.1, bg: 'close9s', focus: [960, 540], push: 0.035, pushDir: 1,
        draw(c, t, lt) { inCar(c, t, { z: 2.6, wx: 690, wy: 700, sx: 960, sy: 560 }, { pose: 'drive', expr: 'happy', look: [0.9, 0] }, { pose: 'lap', expr: 'curious', look: [0.7, -0.1] }, (cx, sx, sy, SC) => sticker(cx, sx, sy, SC, A.ramp(t, tCon + 0.3, 0.3))); } });
      shots.push({ id: 'F11_gap', start: tHay - 0.25, bg: 'close9b', focus: [980, 520], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const sp = A.talk('eli', t); let head = null;
          inCar(c, t, { z: 1.6, wx: 620, wy: 630, sx: 960, sy: 560 }, { pose: 'drive', expr: 'neutral', look: [0.9, 0] },
            { pose: 'point', view: 'q', dir: 1, expr: 'worried', look: [0.9, -0.1], talk: sp.talk, viseme: sp.viseme, extras: ['sweat'], lean: 0.05 }, (cx, sx, sy, SC) => sticker(cx, sx, sy, SC, 1));
          P.ruler(c, 1500, 1880, 760, Math.max(0, A.closeState('S9', AV, M9(t)).gapL), 1); } });
      shots.push({ id: 'F12_friend', start: tEse - 0.2, bg: 'close9c', focus: [900, 520], push: 0.03, pushDir: -1,
        draw(c, t, lt) { const sp = A.talk('mila', t), grab = A.ramp(t, tAmigoE + 0.1, 0.2) * (1 - A.ramp(t, tAmigoE + 0.7, 0.2)), crossed = t > tAmigoE + 0.9, back = t > tAmigoE + 1.4;
          inCar(c, t, { z: 1.75, wx: 560, wy: 610, sx: 900, sy: 560 }, { pose: grab > 0.3 ? 'drive' : 'drive', expr: 'happy', look: grab > 0.3 ? [-0.6, 0.3] : [0.9, 0], talk: sp.talk, viseme: sp.viseme },
            { pose: crossed ? 'crossed' : grab > 0.3 ? 'drive' : 'lap', view: back ? 'backq' : 'q', dir: back ? -1 : 1, expr: crossed ? (back ? 'surprised' : 'grumpy') : 'worried', look: [0.9, 0] }, (cx, sx, sy, SC) => sticker(cx, sx, sy, SC, 1)); } });
      const g9 = (id, start, text, sub, keyT) => shots.push({ id, start, bg: 'ring9_' + id, label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, pushDir: 1,
        over: (c, t) => { rec(c, true); src(c); P.badge(c, 960, 240, text, 84, A.ramp(t, keyT - 0.1, 0.25), sub); },
        draw(c, t, lt) { A._rr = S9(); const ts = M9(t), S = S9().at(ts), p = A.clampView(A.ringPt(AV, S), 1.5); c.save(); c.translate(960, 600); c.scale(1.5, 1.5); c.translate(-p[0], -p[1]); A.ring(c, t, ring9(ts)); c.restore(); A._rr = S8(); },
        cues: A => [{ t: keyT, kind: 'gauge' }] });
      g9('F13_50', tLos - 0.1, '≈ −50 %', 'cambios de velocidad', tMitad);
      g9('F14_22', tLa18 - 0.1, '−22 %', 'gasolina', tQuinta);
      shots.push({ id: 'F15_one', start: tUna - 0.1, bg: 'close9d', focus: [960, 540], push: 0.03, pushDir: 1,
        draw(c, t, lt) { inCar(c, t, { z: 1.3, wx: 640, wy: 640, sx: 960, sy: 560 }, { pose: 'drive', expr: 'happy', look: [0.9, 0] }, { pose: 'lap', view: 'q', dir: 1, expr: 'happy', look: [-0.8, 0] }); } });

      // ================================================================ BEAT 19 · a shock absorber: two timelines
      const runE = () => A.adapter('S3B_ELI'), runM = () => A.adapter('S3B_MILA');
      const strips = (c, t, ts, o = {}) => {
        const pxm = o.pxm || 17, eliI = 5;
        for (const [k, run, who] of [[0, runE(), 'eli1'], [1, runM(), 'mila1']]) {
          c.save(); c.beginPath(); c.rect(0, k * 540, K.W, 540); c.clip(); c.translate(0, k * 540 - 480 + (o.dy || 0));
          const S = run.at(ts), camS = o.camS ? o.camS(S, k) : S.x[eliI] + 12;
          A.line(c, t, { run, simT: ts, camS, pxm, carK: 2.0, eliI,
            eli: (cx, sx, sy, s) => K.cast.crew2(cx, sx, sy, s, { driver: who, t, light: N, u: 2.7 * s, driverO: { pose: 'drive', expr: who === 'eli1' ? (S.v[eliI] < 0.5 ? 'annoyed' : 'determined') : 'happy' } }),
            carOver: (cx, i, x, y, s, S2, b) => { if (k === 1 && i === eliI && o.spring) { const lx = A.LINE.GY; void lx; const xl = (S2.x[i + 1] - S2.x[i]) * pxm; P.spring(cx, [x + 1.7 * s, y - 0.9 * s], [x + xl - 1.7 * s, y - 0.9 * s], o.spring); } } });
          c.restore();
          P.pill(c, K.W - 96, k * 540 + 60, k ? 'MILA MANEJA' : 'ELI MANEJA', 30, 1, { align: 'right', bg: k ? K.rgba('#7158b8', 0.9) : K.rgba('#c99633', 0.9) });
        }
        c.fillStyle = '#1a1020'; c.fillRect(0, 536, K.W, 8);
      };
      shots.push({ id: 'F16_two', start: tPor - 0.1, bg: 'two', label: 'ACELERADO ×2', focus: [960, 540], push: 0.02, breath: true,
        draw(c, t, lt) { strips(c, t, EL(t)); } });
      shots.push({ id: 'F16_spring', start: tAmort - 0.3, bg: 'two_mila', label: 'ACELERADO ×2', focus: [960, 820], push: 0.03, pushDir: 1, zBase: 1.12,
        draw(c, t, lt) { strips(c, t, EL(t), { spring: 1 }); },
        cues: A => [{ t: tAmort, kind: 'spring' }] });
      shots.push({ id: 'F17_late', start: tEl - 0.1, bg: 'two_top', label: 'ACELERADO ×2', focus: [960, 270], push: 0.03, pushDir: 1, zBase: 1.1,
        draw(c, t, lt) { strips(c, t, EL(t)); },
        cues: A => [{ t: tEmbot, kind: 'stop_thunk' }] });
      shots.push({ id: 'F17_pass', start: tCuando - 0.1, bg: 'two_bottom', label: 'ACELERADO ×2', focus: [960, 810], push: 0.03, pushDir: -1, zBase: 1.1,
        draw(c, t, lt) { strips(c, t, EL(t), { spring: 1 }); } });
      shots.push({ id: 'F18_behind', start: tLos19 - 0.1, bg: 'two_wide', label: 'ACELERADO ×2', focus: [960, 540], push: 0.02, pushDir: 1,
        draw(c, t, lt) { strips(c, t, EL(t), { pxm: 10, camS: (S) => S.x[2] + 8 }); } });
      // «llegar tarde es la jugada» → «¡Yo llego tarde a todo!»: thumbs at himself; Mila pats him
      shots.push({ id: 'F19_late', start: tPor2 - 0.1, bg: 'field_late', focus: [960, 500], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { const sp = A.talk('eli', t), lit = t > w('llegar', 1, '19');
          A.field(c, t, { run: S9(), simT: M9(t), frame: { z: 1.6, x: 960, y: 570 }, chars: cx => {
            K.cast.draw(cx, 'mila1', 1240, G - 6, 620, { view: 'q', dir: -1, pose: t > tTodoE ? 'palm' : 'crossed', expr: 'happy', t, look: [-0.9, 0], light: LF, shadow: 0.3 });
            K.cast.draw(cx, 'eli1', 840, G, 640, { view: 'front', pose: t > tYo - 0.1 ? 'pointSelf' : lit ? 'surprise' : 'think', expr: lit ? 'happy' : 'thinking', t, light: LF, shadow: 0.3, talk: sp.talk, viseme: sp.viseme, extras: lit ? ['sparkle'] : [] }); } }); },
        cues: A => [{ t: w('llegar', 1, '19'), kind: 'ding' }] });
      shots.push({ id: 'F21_japan', start: tEnJ - 0.1, bg: 'two_jp', label: 'ACELERADO ×2', focus: [960, 540], push: 0.022, pushDir: -1, over: (c) => src(c, SRC3),
        draw(c, t, lt) { strips(c, t, EL(t), { spring: 1 }); } });
      shots.push({ id: 'F21_plate', start: tManejo - 0.1, bg: 'plate_jp', focus: [960, 520], push: 0.025, pushDir: 1, over: (c) => src(c, SRC3),
        draw(c, t, lt) { strips(c, t, EL(t), { spring: 1 }); c.fillStyle = K.rgba('#1a1020', 0.35); c.fillRect(0, 0, K.W, K.H); P.plate(c, 960, 540, 'MANEJO QUE ABSORBE EMBOTELLAMIENTOS', 48, A.ramp(t, tManejo, 0.3)); },
        cues: A => [{ t: tManejo, kind: 'plate' }] });
      shots.push({ id: 'F22_ojo', start: tOjo - 0.15, bg: 'field_ojo', focus: [960, 480], push: 0.035, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S9(), simT: M9(t), frame: { z: 1.8, x: 980, y: 560 }, chars: cx => K.cast.draw(cx, 'mila1', 980, G, 660, { view: 'front', pose: 'point', expr: 'determined', t, look: [0, 0], light: LF, shadow: 0.3 }) }); } });
      // «Si la vía está simplemente repleta…»: the overcast toll plaza (more cars arrive than the booths serve), then the overfull dome
      shots.push({ id: 'F23_toll', start: tSi - 0.1, bg: 'toll', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, post: { grain: 0.12, vignette: 0.32, vignetteColor: '#3a3a4a', bloom: 0.1 },
        draw(c, t, lt) { E.drawToll(c, 4 + (t - tSi) * 2, 0); },
        cues: A => [{ t: tSi + 0.8, kind: 'horn' }] });
      shots.push({ id: 'F23_dome40', start: tNingun - 0.1, bg: 'dome40', label: 'ACELERADO ×10', focus: [960, 560], push: 0.025, pushDir: 1, post: { grain: 0.13, vignette: 0.4, vignetteColor: '#1a1020', bloom: 0.22 },
        over: (c, t) => P.badge(c, K.W - 260, 230, '40', 90, 1, 'autos'),
        draw(c, t, lt) { const R = A.adapter('S5_40'); A.dome(c, t, { run: R, simT: 300 + (t - tNingun) * 10, carOver: (cx, i, x, y) => { if (i === 0) halo(cx, x, y); } }); } });
      return shots;
    },
    ambience(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const t0 = A.at('Después', 1, { beat: '17' }), t1 = A.at('Funciona', 1, { beat: '20' }), tQ = A.at('fue', 1, { beat: '17', speaker: 'eli', edge: 'end' });
      return [{ kind: 'field_birds', t0, t1: w('Por', 1, '19') }, { kind: 'wind_grass', t0, t1: tQ + 0.25 }, { kind: 'wind_grass', t0: A.at('Eli', 1, { beat: '17', speaker: 'mila' }) - 0.3, t1 },
        { kind: 'music_light', t0, t1: tQ + 0.2 }, { kind: 'mila_theme', t0: w('Esta', 1, '18'), t1: w('Por', 1, '19') }, { kind: 'music_light', t0: w('Por', 1, '19'), t1 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
