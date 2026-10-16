/* Ep 001 · BLOCK D1 · Act 3, beats 14-16: «cierra el hueco», the different car (FollowerStopper, S7) and the wave
   melting. Ring in the field again, now S7 (21 cars on 260 m; car 0 = the computer-driven car, teal halo). Times from
   words or S7 events (control_on, wave_melted). Numbers on screen come from the paper (FACTS), never from the sim. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const REC = 'RECREACIÓN ILUSTRADA', SRC = 'Stern et al., Transp. Res. C 2018', AV = 0;

  // the badge Eli pins to his chest («¡Mi lema!»): a paper card hanging from one pin; droop 0..1 bends it down
  P.badgeCard = function (ctx, head, u, droop = 0, a = 1) {
    if (a <= 0.01 || !head) return;
    const x = head[0] + u * 0.01, y = head[1] + u * 0.24, w = u * 0.11, h = u * 0.075;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x - w / 2, y); ctx.rotate(droop * 1.1);
    ctx.fillStyle = '#fbf3e4'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = Math.max(1.5, u * 0.004); K.rrect(ctx, 0, 0, w, h, h * 0.15); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a1a1e'; for (let k = 0; k < 3; k++) ctx.fillRect(w * 0.12, h * (0.25 + k * 0.22), w * (0.76 - k * 0.15), Math.max(1, h * 0.07));
    ctx.fillStyle = '#e7c25a'; K.circle(ctx, w * 0.06, h * 0.12, Math.max(2, u * 0.006)); ctx.fill(); ctx.restore();
  };
  // a paper thought bubble (cloud) that pops
  P.thought = function (ctx, x, y, w, h, a, inner) {
    if (a <= 0.01) return;
    const k = 0.6 + 0.4 * K.ease.outBack(K.clamp(a));
    ctx.save(); ctx.globalAlpha = K.clamp(a * 2); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = '#fbf3e4'; ctx.strokeStyle = '#2a1a1e'; ctx.lineWidth = 6;
    ctx.beginPath(); for (let j = 0; j < 14; j++) { const an = j / 14 * K.TAU, rx = w / 2 * (1 + 0.08 * Math.sin(j * 3)), ry = h / 2 * (1 + 0.08 * Math.cos(j * 2)); ctx.moveTo(Math.cos(an) * rx + 60, Math.sin(an) * ry); ctx.arc(Math.cos(an) * rx, Math.sin(an) * ry, 60, 0, K.TAU); }
    ctx.stroke(); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, K.TAU); ctx.fill();
    for (const [dx, dy, r] of [[-w * 0.35, h * 0.62, 26], [-w * 0.45, h * 0.85, 16]]) { K.circle(ctx, dx, dy, r); ctx.fill(); ctx.stroke(); }
    if (inner) inner(ctx);
    ctx.restore();
  };
  // a percent gauge (paper), with the paper's figure
  P.gauge = function (ctx, x, y, text, sub, a) {
    if (a <= 0.01) return; P.badge(ctx, x, y, text, 84, a, sub);
  };

  A.block('D1', {
    t0: null, t1: null,
    async setup() { this.t0 = A.at('Entonces', 1, { beat: '14' }); this.t1 = A.at('Después', 1, { beat: '17' }); A._rr = A.adapter('S7'); },
    post: { grain: 0.13, vignette: 0.4, vignetteColor: '#2a1a2a', bloom: 0.18 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const tHay = w('Hay', 1, '14'), tLlenar = w('Llenar', 1, '14'), tUnos = w('Unos', 1, '14'), tEquipo = w('equipo', 1, '14'), tCon = w('con', 1, '14'), tVeinti = w('veintiún', 1, '14');
      const tA = w('A', 2, '14'), tPara = w('para', 1, '14'), tManejen = w('manejen', 1, '14'), tSi = w('Si', 1, '14'), tMi = A.at('Mi', 1, { beat: '14', speaker: 'eli' });
      const tPero = w('Pero', 1, '15'), tUna = w('Una', 1, '15'), tCompu = w('computadora', 1, '15'), tNo = w('no', 1, '15'), tIr = w('Ir', 1, '15'), tO = w('o', 1, '15'), tContando = w('contando', 1, '15');
      const tEl = w('El', 1, '15'), tEstira = w('estira', 1, '15'), tComo = w('como', 1, '15'), tResorteE = w('resorte', 1, '15', { edge: 'end' });
      const tLa = w('La', 1, '16'), tDerr = w('derritió', 1, '16'), tLos1 = w('Los', 1, '16'), tOchenta = w('ochenta', 1, '16'), tLos2 = w('Los', 2, '16'), tCasi = w('casi', 1, '16');
      const tEn = w('En', 1, '16'), tLos3 = w('los', 3, '16'), tCuarenta = w('cuarenta', 1, '16'), tTodo = w('Todo', 1, '16'), tSolo = w('solo', 1, '16');
      const sOn = A.ev('S7', 'control_on'), sMelt = A.ev('S7', 'wave_melted');
      const S7 = () => A.adapter('S7');
      const PRE = A.map(sOn - 60, tUnos, 4);                  // before the computer switches on: the waves (×4)
      const CTRL = A.map(sOn, tCompu, 4);                      // the computer takes over on «computadora»
      const MELT = A.map(sMelt, tDerr, 4);                     // the wave has melted on «derritió»
      const LF = A.LIGHT_FIELD, G = A.FIELD.GROUND;
      const rec = (c, acc) => P.pill(c, 96, acc ? 152 : 84, REC, 26, 1), src = c => P.source(c, SRC, 1);
      const halo = (cx, x, y, a = 1) => { K.light.glow(cx, x, y - 6, 70, '#23746C', 0.55 * a, 'screen'); cx.save(); cx.globalAlpha = a; cx.strokeStyle = '#4fb3a8'; cx.lineWidth = 4; K.ellipse(cx, x, y - 4, 44, 24); cx.stroke(); cx.restore(); };
      const ringOpts = (ts, o = {}) => Object.assign({ run: S7(), simT: ts, carExpr: (i, st) => (i === AV ? 'content' : st ? 'annoyed' : 'content'),
        carOver: (cx, i, x, y, b, S) => { if (i === AV) halo(cx, x, y); if (o.carOver) o.carOver(cx, i, x, y, b, S); } }, o.extra || {});
      // Eli's badge state: pinned on «Mi»; droops with each gauge; held straight with a finger at the end
      const tPin = tMi - 0.1, droops = [tOchenta + 0.4, tCasi + 0.4], fixT = tCuarenta + 0.6;
      const droop = t => { if (t < droops[0]) return 0; if (t < droops[0] + 0.9) return A.ramp(t, droops[0], 0.25) * (1 - A.ramp(t, droops[0] + 0.6, 0.2)); if (t < droops[1]) return 0; if (t < fixT) return A.ramp(t, droops[1], 0.25); return 1 - A.ramp(t, fixT, 0.15); };
      const eliBadge = (c, r, u, t) => { if (t > tPin) P.badgeCard(c, r.head, u, droop(t), A.ramp(t, tPin, 0.15)); };
      const shots = [];

      // ================================================================ BEAT 14
      shots.push({ id: 'E01_how', start: T0 - 0.05, bg: 'field', focus: [960, 520], push: 0.025, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S7(), simT: PRE(t) - 20, frame: { z: 1.35, x: 960, y: 580 }, chars: cx => {
          K.cast.draw(cx, 'mila1', 1140, G - 6, 600, { view: 'q', dir: -1, pose: 'chin', expr: 'thinking', t, look: [-0.5, -0.6], light: LF, shadow: 0.3 });
          K.cast.draw(cx, 'eli1', 760, G, 600, { view: 'q', dir: 1, pose: 'think', expr: 'thinking', t, look: [0.6, -0.7], light: LF, shadow: 0.3 }); } }); } });
      // E02 · a rulebook «para todos»: Eli tries to lift it and buckles
      shots.push({ id: 'E02_rulebook', start: tHay - 0.1, bg: 'field_book', focus: [960, 500], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { const k = A.ramp(t, tHay + 0.5, 0.4);
          A.field(c, t, { run: S7(), simT: PRE(t) - 20, frame: { z: 1.5, x: 960, y: 600 }, chars: cx => {
            const r = K.cast.draw(cx, 'eli1', 960, G + k * 20, 620, { view: 'front', pose: 'cheer', expr: k > 0.5 ? 'worried' : 'determined', t, lean: 0, light: LF, shadow: 0.3, extras: k > 0.5 ? ['sweat'] : [] });
            const bx = (r.hands.lead[0] + r.hands.trail[0]) / 2, by = Math.min(r.hands.lead[1], r.hands.trail[1]) - 20 + k * 40 + Math.sin(t * 18) * 3 * k;
            cx.save(); cx.translate(bx, by); cx.rotate(-0.05 + 0.08 * k); cx.fillStyle = '#7a3f4a'; cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 6; K.rrect(cx, -230, -170, 460, 170, 14); cx.fill(); cx.stroke();
            cx.fillStyle = '#fbf3e4'; cx.fillRect(-222, -40, 444, 30); cx.font = '800 44px "Martian Mono"'; cx.textAlign = 'center'; cx.fillStyle = '#f2c230'; cx.fillText('PARA TODOS', 0, -90); cx.restore(); } });
          P.callout(c, 960, 140, '¡pop!', 70, A.pulse(t, tLlenar - 0.25, 0.06, 0.2, 0.1)); },
        cues: A => [{ t: tLlenar - 0.25, kind: 'pop' }] });
      // E03 · a fleet of robot cars, «$$$$»
      shots.push({ id: 'E03_robots', start: tLlenar - 0.1, bg: 'paper_robots', focus: [960, 540], push: 0.03, pushDir: -1, post: { grain: 0.1, vignette: 0.3, vignetteColor: '#5a4a50', bloom: 0 },
        draw(c, t, lt) { c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H);
          P.thought(c, 960, 520, 1300, 640, A.ramp(t, tLlenar, 0.25) * (1 - A.ramp(t, tUnos - 0.25, 0.12)), cx => {
            for (let k = 0; k < 5; k++) { const x = -480 + k * 240, y = 40 + Math.sin(t * 6 + k) * 4; K.car.side(cx, x, y + 60, 46, { color: '#b9c4cc', lit: { rim: '#ffffff', shade: '#4a5068' } });
              cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(x - 10, y - 30); cx.lineTo(x - 10, y - 70); cx.stroke(); cx.fillStyle = '#4fb3a8'; K.circle(cx, x - 10, y - 74, 9); cx.fill(); cx.stroke();
              cx.fillStyle = '#2a1a1e'; K.rrect(cx, x - 30, y - 30, 50, 22, 6); cx.fill(); cx.fillStyle = '#7fe0d0'; K.circle(cx, x - 15, y - 19, 5); cx.fill(); K.circle(cx, x + 5, y - 19, 5); cx.fill(); }
            P.pill(cx, 0, -200, '$$$$', 70, 1, { align: 'center', bg: '#5aa36a' }); });
          P.callout(c, 960, 160, '¡pop!', 70, A.pulse(t, tUnos - 0.25, 0.06, 0.2, 0.1)); },
        cues: A => [{ t: tLlenar, kind: 'whoosh_up' }, { t: tUnos - 0.25, kind: 'pop' }] });
      // E04 · the US ring (S7, before the computer: waves)
      shots.push({ id: 'E04_us', start: tUnos - 0.1, bg: 'ring', label: 'ACELERADO ×4', focus: [960, 540], push: 0.022, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { A.ring(c, t, ringOpts(PRE(t))); } });
      shots.push({ id: 'E04_close', start: tEquipo - 0.1, bg: 'ring_close', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.6, 1.6); c.translate(-1100, -700); A.ring(c, t, ringOpts(PRE(t))); c.restore(); } });
      shots.push({ id: 'E05_21', start: tCon - 0.1, bg: 'ring2', label: 'ACELERADO ×4', focus: [960, 520], push: 0.024, pushDir: -1, over: (c, t) => { rec(c, true); P.badge(c, K.W - 260, 220, String(Math.max(1, Math.round(21 * A.ramp(t, tVeinti, 0.4)))), 110, A.ramp(t, tVeinti - 0.1, 0.2), 'autos'); src(c); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.18, 1.18); c.translate(-960, -600); A.ring(c, t, ringOpts(PRE(t))); c.restore(); } });
      // E06 · the instruction: an observer hands the drivers a card; the waves; «manejen como en hora pico»
      shots.push({ id: 'E06_instr', start: tA - 0.1, bg: 'field_obs', focus: [960, 520], push: 0.03, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S7(), simT: PRE(t), frame: { z: 1.45, x: 960, y: 600 }, chars: cx => {
          K.char.person(cx, 700, G, 64, { t, seed: 3, skin: '#c98a64', hair: '#2b1d1a', hairStyle: 'cap', capColor: '#5d8a8f', shirt: '#d8e04a', pose: 'point', expr: 'focused', light: { ang: -2.4, rim: '#ffd99a', shade: '#3a3358' } });
          K.cast.draw(cx, 'mila1', 1240, G - 6, 560, { view: 'q', dir: -1, pose: 'clipboard', expr: 'curious', t, look: [-0.8, 0], light: LF, shadow: 0.3 });
          cx.save(); cx.translate(900, 700); cx.rotate(-0.08); P.plate(cx, 0, 0, '¡NO ARREGLEN NADA!', 34, A.ramp(t, tPara - 0.2, 0.3)); cx.restore(); } }); } });
      shots.push({ id: 'E06_waves', start: tPara + 0.95, bg: 'ring_jam', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = PRE(t), j = A.clampView(A.angPt(A.jamSmooth(ts, 3) || 0), 1.9); c.save(); c.translate(960, 540); c.scale(1.9, 1.9); c.translate(-j[0], -j[1]); A.ring(c, t, ringOpts(ts)); c.restore(); } });
      shots.push({ id: 'E06_rush', start: tManejen - 0.1, bg: 'field_track', focus: [960, 600], push: 0.035, pushDir: -1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S7(), simT: PRE(t), frame: { z: 2.5, x: 1000, y: 680 }, front: false, carExpr: () => 'determined' }); } });
      // E07 · the card
      shots.push({ id: 'E07_card', start: tSi - 0.1, bg: 'field_card', focus: [960, 520], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S7(), simT: PRE(t), frame: { z: 1.2, x: 960, y: 560 } }); c.fillStyle = K.rgba('#1a1020', 0.25); c.fillRect(0, 0, K.W, K.H);
          P.plate(c, 960, 480, 'SI SE ABRE UN HUECO, CIÉRRALO.', 56, A.ramp(t, tSi, 0.3)); },
        cues: A => [{ t: tSi, kind: 'plate' }] });
      // E08 · «¡Mi lema!»: Eli pins the card on his chest; Mila raises an eyebrow
      shots.push({ id: 'E08_lema', start: tMi - 0.45, bg: 'field_lema', focus: [960, 480], push: 0.035, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { const sp = A.talk('eli', t);
          A.field(c, t, { run: S7(), simT: PRE(t), frame: { z: 1.6, x: 960, y: 560 }, chars: cx => {
            K.cast.draw(cx, 'mila1', 1290, G - 6, 640, { view: 'q', dir: -1, pose: 'crossed', expr: t > tMi + 0.3 ? 'smug' : 'neutral', t, look: [-0.9, 0], light: LF, shadow: 0.3 });
            const u = 660, r = K.cast.draw(cx, 'eli1', 860, G, u, { view: 'q', dir: 1, pose: t > tMi ? 'pump' : 'clasp', expr: t > tMi - 0.05 ? 'happy' : 'curious', t, light: LF, shadow: 0.3, talk: sp.talk, viseme: sp.viseme, extras: t > tMi + 0.1 ? ['sparkle'] : [] });
            eliBadge(cx, r, u, t); } }); },
        cues: A => [{ t: tMi, kind: 'ding' }] });

      // ================================================================ BEAT 15 · the different car
      shots.push({ id: 'E09_distinct', start: tPero - 0.1, bg: 'ring_av', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = CTRL(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 1.8); c.save(); c.translate(960, 540); c.scale(1.8, 1.8); c.translate(-p[0], -p[1]); A.ring(c, t, ringOpts(ts)); c.restore(); } });
      // eyes pass (2026-10-16): in the two tight E10 shots (the computer car is the subject) Eli + Mila stood at the very
      // frame edge, cut off (head over the top / right edge): they are left out of these two shots (hero: () => true)
      shots.push({ id: 'E10_computer', start: tUna - 0.1, bg: 'ring_av_close', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = CTRL(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 2.6); c.save(); c.translate(960, 540); c.scale(2.6, 2.6); c.translate(-p[0], -p[1]);
          A.ring(c, t, ringOpts(ts, { extra: { hero: () => true }, carOver: (cx, i, x, y) => { if (i === AV) P.pill(cx, x, y - 70, 'COMPUTADORA', 14, A.ramp(t, tCompu - 0.1, 0.2), { align: 'center', bg: K.rgba('#23746C', 0.92) }); } })); c.restore(); } });
      shots.push({ id: 'E10_nochase', start: tNo - 0.1, bg: 'ring_av2', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: -1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = CTRL(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 2.1); c.save(); c.translate(960, 540); c.scale(2.1, 2.1); c.translate(-p[0], -p[1]);
          A.ring(c, t, ringOpts(ts, { extra: { hero: () => true, over: (cx, g2s, cars, S2) => { const q = A.ringPt(AV, S2), lead = A.ringPt(AV + 1, S2); P.spring(cx, q, lead, 0.9); } } })); c.restore(); } });
      // E11 · PROMEDIO: the computer's needle stays still while the others jump
      shots.push({ id: 'E11_promedio', start: tIr - 0.1, bg: 'ring_needles', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = CTRL(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 1.7);
          c.save(); c.translate(960, 540); c.scale(1.7, 1.7); c.translate(-p[0], -p[1]);
          A.ring(c, t, ringOpts(ts, { carOver: (cx, i, x, y, b, S2) => { const v = S2.v[i]; cx.save(); cx.translate(x, y - 48); cx.fillStyle = '#fbf3e4'; cx.strokeStyle = '#2a1a1e'; cx.lineWidth = 2;
            cx.beginPath(); cx.arc(0, 0, 14, Math.PI, 0); cx.closePath(); cx.fill(); cx.stroke(); const an = Math.PI + K.clamp(v / 12) * Math.PI; cx.strokeStyle = i === AV ? '#23746C' : '#a8466e'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(an) * 12, Math.sin(an) * 12); cx.stroke(); cx.restore();
            if (i === AV) P.pill(cx, x, y - 90, 'PROMEDIO', 18, A.ramp(t, w('promedio', 1, '15') - 0.1, 0.2), { align: 'center', bg: K.rgba('#23746C', 0.92) }); } }));
          c.restore(); } });
      // E12 · «contando frenadas y arrancones»: one ordinary car's speed (up and down) and the straight average
      shots.push({ id: 'E12_avg', start: tO - 0.1, bg: 'graph_speed', focus: [960, 540], push: 0.05, drift: 0.012, pushDir: 1, post: { grain: 0.1, vignette: 0.25, vignetteColor: '#5a4a50', bloom: 0 },
        draw(c, t, lt) { c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H);
          const R = S7(), ts0 = sOn - 60, span = 120, k = K.clamp(0.04 + (t - tO + 0.1) / (tEl - tO - 0.3)), x0 = 200, x1 = 1720, yb = 760, sc = 34;
          c.strokeStyle = K.rgba('#2a1a1e', 0.5); c.lineWidth = 3; c.beginPath(); c.moveTo(x0, yb); c.lineTo(x1, yb); c.moveTo(x0, yb); c.lineTo(x0, 260); c.stroke();
          let avg = 0, n = 0; for (let j = 0; j <= 300; j++) { const ts = ts0 + j / 300 * span, S = R.at(ts); let m = 0; for (let i = 0; i < R.N; i++) m += S.v[i]; avg += m / R.N; n++; } avg /= n;
          c.strokeStyle = '#a8466e'; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath();
          let hx = x0, hy = yb; for (let j = 0; j <= 300 * k; j++) { const ts = ts0 + j / 300 * span, v = R.at(ts).v[5], x = K.lerp(x0, x1, j / 300), y = yb - v * sc; j ? c.lineTo(x, y) : c.moveTo(x, y); hx = x; hy = y; } c.stroke();
          c.fillStyle = '#a8466e'; c.strokeStyle = '#2a1a1e'; c.lineWidth = 3; K.circle(c, hx, hy, 12); c.fill(); c.stroke();   // the pen
          if (t > tContando + 0.4) { const kk = A.ramp(t, tContando + 0.4, 0.6); c.strokeStyle = '#23746C'; c.lineWidth = 8; c.beginPath(); c.moveTo(x0, yb - avg * sc); c.lineTo(K.lerp(x0, x1, kk), yb - avg * sc); c.stroke();
            P.pill(c, x1 - 140, yb - avg * sc - 46, 'PROMEDIO', 30, kk, { align: 'center', bg: K.rgba('#23746C', 0.92) }); }
          c.font = '600 26px "Space Grotesk"'; c.fillStyle = K.rgba('#2a1a1e', 0.7); c.fillText('velocidad de un auto normal', x0 + 20, 240); c.fillText('tiempo →', x1 - 140, yb + 44); },
        cues: A => [{ t: tContando + 0.4, kind: 'chime_avg' }] });
      // E13 · the spring in front of the computer car; Eli's fingers itch, he steps in to push... Mila pulls him back
      shots.push({ id: 'E13_spring', start: tEl - 0.1, bg: 'ring_spring', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { const ts = CTRL(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 2.3); c.save(); c.translate(960, 540); c.scale(2.3, 2.3); c.translate(-p[0], -p[1]);
          A.ring(c, t, ringOpts(ts, { extra: { over: (cx, g2s, cars, S2) => P.spring(cx, A.ringPt(AV, S2), A.ringPt(AV + 1, S2), 1) } })); c.restore(); },
        cues: A => [{ t: tEstira, kind: 'spring' }, { t: w('encoge', 1, '15'), kind: 'spring' }] });
      const pull = tResorteE - 0.15;
      shots.push({ id: 'E13_pull', start: tComo - 0.1, bg: 'field_pull', focus: [960, 520], push: 0.03, pushDir: -1, over: c => rec(c, false),
        draw(c, t, lt) { const step = A.ramp(t, tComo + 0.1, 0.35) * (1 - A.ramp(t, pull, 0.12));
          A.field(c, t, { run: S7(), simT: CTRL(t), frame: { z: 1.5, x: 960, y: 580 }, chars: cx => {
            const ex = 900 - step * 160 + 0, u = 620;
            const rE = K.cast.draw(cx, 'eli1', ex, G, u, { view: 'q', dir: -1, pose: t < pull + 0.3 ? 'open' : t < pull + 0.9 ? 'open' : 'stand', expr: t < pull ? 'determined' : 'surprised', t, lean: step * 0.12 - (t > pull ? 0.06 * Math.exp(-(t - pull) * 4) : 0), light: LF, shadow: 0.3 });
            eliBadge(cx, rE, u, t);
            const rM = K.cast.draw(cx, 'mila1', 1260, G - 6, 600, { view: 'q', dir: -1, pose: t > pull - 0.1 ? 'point' : 'clipboard', expr: 'neutral', t, look: [-0.2, 0.3], light: LF, shadow: 0.3 });
            if (t > pull - 0.1) { cx.strokeStyle = K.cast.INK; cx.lineWidth = 9; cx.beginPath(); cx.moveTo(rE.head[0] + 30, rE.head[1] + u * 0.22); cx.lineTo(rM.hands.lead[0], rM.hands.lead[1]); cx.stroke(); cx.strokeStyle = '#3b2a20'; cx.lineWidth = 5; cx.stroke(); } } }); },
        cues: A => [{ t: pull, kind: 'whoosh_up' }] });

      // ================================================================ BEAT 16 · the wave melts
      shots.push({ id: 'E14_melt', start: tLa - 0.05, bg: 'ring', label: 'ACELERADO ×4', focus: [960, 540], push: 0.022, pushDir: 1, over: c => { rec(c, true); src(c); },
        draw(c, t, lt) { A.ring(c, t, ringOpts(MELT(t))); } });
      const gaugeShot = (id, start, text, sub, keyT, bg) => shots.push({ id, start, bg, focus: [960, 520], push: 0.03, pushDir: 1, over: c => rec(c, false),
        draw(c, t, lt) { A.field(c, t, { run: S7(), simT: MELT(t), frame: { z: 1.5, x: 960, y: 580 }, chars: cx => {
          K.cast.draw(cx, 'mila1', 1300, G - 6 - (t > keyT ? 14 * Math.abs(Math.sin(t * 7)) : 0), 600, { view: 'q', dir: -1, pose: t > keyT ? 'clasp' : 'clipboard', expr: t > keyT ? 'happy' : 'curious', t, light: LF, shadow: 0.3 });
          const u = 620, r = K.cast.draw(cx, 'eli1', 780, G, u, { view: 'q', dir: 1, pose: t > fixT ? 'point' : 'crossed', expr: droop(t) > 0.3 ? 'sheepish' : 'neutral', t, look: droop(t) > 0.3 ? [0.2, 0.8] : [0.8, 0], light: LF, shadow: 0.3 }); eliBadge(cx, r, u, t); } });
          P.gauge(c, 960, 260, text, sub, A.ramp(t, keyT - 0.1, 0.25)); },
        cues: A => [{ t: keyT, kind: 'gauge' }] });
      gaugeShot('E15_80', tLos1 - 0.1, '−80 %', 'cambios de velocidad', tOchenta, 'field_g1');
      shots.push({ id: 'E16_brakes', start: tLos2 - 0.1, bg: 'ring_candles', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: -1, over: (c, t) => { rec(c, true); P.gauge(c, K.W - 470, 240, 'frenazos ≈ 0', null, A.ramp(t, tCasi, 0.25)); src(c); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.3, 1.3); c.translate(-960, -620); A.ring(c, t, ringOpts(MELT(t))); c.restore(); } });
      shots.push({ id: 'E17_fuel', start: tEn - 0.1, bg: 'ring_fuel', label: 'ACELERADO ×4', focus: [960, 540], push: 0.025, pushDir: 1, over: (c, t) => { rec(c, true); src(c); },
        draw(c, t, lt) { c.save(); c.translate(960, 540); c.scale(1.12, 1.12); c.translate(-960, -560); A.ring(c, t, ringOpts(MELT(t))); c.restore(); } });
      gaugeShot('E17_40', tLos3 - 0.1, 'hasta −40 %', 'gasolina', tCuarenta, 'field_g2');
      shots.push({ id: 'E18_one', start: tTodo - 0.1, bg: 'ring_one', label: 'ACELERADO ×4', focus: [960, 540], push: 0.03, pushDir: 1, over: (c, t) => { rec(c, true); P.badge(c, K.W - 260, 230, '1 / 21', 90, A.ramp(t, tSolo - 0.1, 0.25)); src(c); },
        draw(c, t, lt) { const ts = MELT(t), S = S7().at(ts), p = A.clampView(A.ringPt(AV, S), 1.9); c.save(); c.translate(960, 540); c.scale(1.9, 1.9); c.translate(-p[0], -p[1]); A.ring(c, t, ringOpts(ts)); c.restore(); },
        cues: A => [{ t: tSolo, kind: 'ding' }] });
      return shots;
    },
    ambience(A) {
      const t0 = A.at('Entonces', 1, { beat: '14' }), t1 = A.at('Después', 1, { beat: '17' });
      return [{ kind: 'field_birds', t0, t1 }, { kind: 'wind_grass', t0, t1 }, { kind: 'music_light', t0, t1 },
        { kind: 'ring_hum_fast', t0: A.at('Unos', 1, { beat: '14' }), t1: A.at('derritió', 1, { beat: '16' }) }, { kind: 'patient_tone', t0: A.at('Pero', 1, { beat: '15' }), t1 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
