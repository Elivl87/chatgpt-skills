/* Ep 001 · BLOCK A · hook + wordmark (beats 1-5). Every time below comes from a narration word (A.at) or from a sim
   event of S1 (A.ev), never from a typed second. Sim mappings: ACELERADO ×3 on the wide wave shots, ×2 on the
   over-the-shoulder, ×1 (no label) from Eli's brake to the end of the hook (PRODUCTION_NOTES 6), ×3 again on the
   look back (the stop travelling back down the queue). */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const ELI = 20, TAP = 26;

  A.block('A', {
    t0: 0,
    t1: null,          // set in setup: the first word of block B
    async setup() { this.t1 = A.at('Mila', 1, { beat: '06' }); },
    post: { grain: 0.13, vignette: 0.45, vignetteColor: '#2a1330', bloom: 0.24 },
    shots(A) {
      const B = this, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      // ---------------------------------------------------------------- the clock: words
      const tAlla = w('Allá', 1, '01'), tCond = w('conductor', 1, '01'), tFreno = w('freno', 1, '01'), tUna2 = w('Una', 2, '01'), tApenas = w('Apenas', 1, '01');
      const tDetras = w('Detrás', 1, '02'), tMas1 = w('más', 1, '02'), tMas2 = w('Más', 2, '02'), tMas3 = w('Más', 3, '02'), tQuietoMid = w('quieto', 1, '02', { edge: 'mid' });
      const tEli2 = w('Eli', 1, '02'), tQuien = A.at('Quién', 1, { beat: '03', speaker: 'eli' }), tFueEnd = A.at('fue', 1, { beat: '03', speaker: 'eli', edge: 'end' });
      const tEliN = A.at('Eli', 1, { beat: '03', speaker: 'narrator' }), tAlguien = w('alguien', 1, '03'), tPero = w('Pero', 1, '03');
      const tNi = w('Ni', 1, '03'), tChoqueE = w('choque', 1, '03', { edge: 'end' }), tConos = w('conos', 1, '03'), tConosE = w('conos', 1, '03', { edge: 'end' });
      const tSema = w('semáforo', 1, '03'), tSemaE = w('semáforo', 1, '03', { edge: 'end' }), tChoque = w('choque', 1, '03');
      const tMila = w('Mila', 1, '04'), tMira = w('mira', 1, '04'), tAtrasN = A.at('atrás', 1, { beat: '04', speaker: 'narrator' });
      const tEliM = A.at('Eli', 1, { beat: '04', speaker: 'mila' }), tVa = A.at('va', 1, { beat: '04', speaker: 'mila' }), tAtrasM = A.at('atrás', 1, { beat: '04', speaker: 'mila' });
      const tQue = A.at('Qué', 1, { beat: '04', speaker: 'eli' }), tEntonces = w('Entonces', 1, '04'), tAparE = w('aparente', 1, '04', { edge: 'end' });
      // the pause after «semáforo» (no narration) is the bird gag: split it in thirds (anticipation, hit + hold, reaction)
      const gap0 = tSemaE + 0.25, gap1 = tMila - 0.05, gapU = (gap1 - gap0) / 3;
      // ---------------------------------------------------------------- the clock: sim events (S1)
      const sTap = A.ev('S1', 'tap_start'), sTapEnd = A.ev('S1', 'tap_end'), s23 = A.ev('S1', 'brake_onset', e => e.car === 23);
      const sLead = A.ev('S1', 'leader_brake_onset'), sEliOn = A.ev('S1', 'eli_brake_onset'), sEliHard = A.ev('S1', 'eli_hard_brake');
      const sStop = A.ev('S1', 'eli_stop'), sRestart = A.ev('S1', 'eli_restart');
      const G1 = A.map(sTap, tFreno, 3);                 // the tap starts on «freno» (×3)
      const G5 = A.map(s23, tMas1, 3);                   // the 4th car behind the tapper lights up on «más»
      const G6 = A.map(sLead, tMas2, 2);                 // Eli's leader lights up on the 2nd «Más» (×2)
      const G7 = A.map(sStop, tQuietoMid, 1);            // Eli stops on «quieto» (×1: his onset falls on the 3rd «Más»)
      const HOLD = t => Math.min(G7(t), sRestart - 0.6); // Eli stays stopped through the rest of the hook (held, not faked)
      const tHard = tQuietoMid - (sStop - sEliHard), tEliOn = tQuietoMid - (sStop - sEliOn);
      const stop15 = A.ev('S1', 'stop', e => e.car === 15);
      // wordmark gag timing (local seconds from the cut), sound cues follow it
      const tWM = tAparE + 0.32, WM = { drop: 0.5, c1: 1.12, c2: 1.58, land: 2.02, tagline: 2.75 };
      const sDot = 0.5;
      // ---------------------------------------------------------------- light recipes for the cast
      const BACK = Object.assign({}, K.cast.LIGHT.backlit), FRONTLIT = Object.assign({}, K.cast.LIGHT.golden, { ang: -1.2, shadeA: 0.2, rimA: 0.45 });
      const eliBlink = t => A.blink(3, t), milaBlink = t => A.blink(5, t);
      const milaFlop = t => (t < tQuietoMid + 0.02 ? 0 : t < tFueEnd + 0.12 ? K.ease.out(K.clamp((t - tQuietoMid - 0.02) / 0.24)) : Math.max(0, 1 - K.ease.inOut(K.clamp((t - tFueEnd - 0.12) / 0.3)) * 1.0));
      const blowK = t => K.clamp((t - tFueEnd - 0.05) / 0.45);

      const shots = [];
      // ================================================================ BEAT 1 · a tap
      shots.push({ id: 'A01_wide', start: 0, bg: 'hw', label: 'ACELERADO ×3', focus: [960, 520],
        draw(c, t, lt) { A.hw(c, t, { simT: A.map(0, 0, 3)(t), camOn: [ELI, -31], H: 8.2, pitch: 0.068, f: 1600, fg: true,
          crew: tt => ({ eli: { pose: 'drive', expr: 'happy', blink: eliBlink(t), tilt: 0.04 * Math.sin(t * 11) }, mila: { pose: 'lap', headTurn: 0.4 } }) }); } });

      shots.push({ id: 'A02_tele', start: tAlla - 0.12, bg: 'hw_tele', label: 'ACELERADO ×3', push: 0.03,
        draw(c, t, lt) {
          const ts = G1(t), R = A.s1(), xE = A.camX(ELI, ts), xT = R.at(ts).x[TAP];
          const sCam = xE + 3, aim = A.aim(sCam, 0.2, 6.5, 4600, xT, 1.85, 0.9, [960, 560]);
          const g = A.hw(c, t, { simT: ts, sCam, lCam: 0.2, H: 6.5, pitch: aim.pitch, yaw: aim.yaw, f: 4600, hide: i => i === ELI, rays: true });
          const p = A.proj(g, xT, 1.85, 0.8);
          if (p) P.ring(c, p.x, p.y - 4, p.s * 2.1, p.s * 1.5, A.ramp(t, tCond, 0.45), { w: 6, alpha: 0.95 * (1 - A.ramp(t, tUna2 - 0.25, 0.3)) });
        } });

      shots.push({ id: 'A03_tapper', start: tUna2 - 0.1, bg: 'hw_rev_tapper', label: 'ACELERADO ×3', focus: [900, 560], push: 0.03,
        draw(c, t, lt) {
          const ts = G1(t), R = A.s1(), xT = R.at(ts).x[TAP], sCam = xT + 6.5, aim = A.aim(sCam, 2.5, 1.6, 1350, xT, 1.85, 0.9, [880, 600], true);
          const g = A.hw(c, t, { simT: ts, sCam, lCam: 2.5, H: 1.6, pitch: aim.pitch, yaw: aim.yaw, f: 1350, reverse: true,
            carExpr: (i, b) => (i === TAP ? (A.blink(9, t) ? 'sleepy' : 'content') : b > 0.5 ? 'surprised' : 'content') });
          const p = A.proj(g, xT, 1.85 - 0.32, 1.5);
          if (p) P.notes(c, p.x + p.s * 0.6, p.y - p.s * 0.3, p.s * 0.55, t, 1);
        } });

      shots.push({ id: 'A04_pair', start: tApenas - 0.04, bg: 'close', focus: [930, 560],
        draw(c, t, lt, S) {
          const ts = A.map(sTapEnd, S.start, 1)(t);
          A.close(c, t, 0, { simT: ts, frame: { z: 1.55, wx: 630, wy: 640, sx: 960, sy: 560 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info,
              { pose: 'drive', expr: 'happy', look: [0.9, -0.05], tilt: 0.05 * Math.sin(t * 12.5), lean: 0.02 * Math.sin(t * 6.2), blink: eliBlink(t) },
              { pose: 'lap', expr: 'neutral', view: 'q', dir: 1, headTurn: -0.35, look: [-0.5, -0.25], drag: 0.55, blink: milaBlink(t) }) });
        } });

      // ================================================================ BEAT 2 · it breaks
      shots.push({ id: 'A05_crane', start: tDetras - 0.08, bg: 'hw_crane', label: 'ACELERADO ×3', focus: [960, 470], push: 0.025,
        draw(c, t, lt) {
          const ts = G5(t), R = A.s1(), xE = A.camX(ELI, ts, 2), xT = R.at(ts).x[TAP];
          const sCam = xE - 22, aim = A.aim(sCam, -1.2, 11, 2100, (xE + xT) / 2 + 4, 1.85, 0, [980, 400]);
          A.hw(c, t, { simT: ts, sCam, lCam: -1.2, H: 11, pitch: aim.pitch, yaw: aim.yaw, f: 2100, fg: false,
            crew: tt => ({ eli: { pose: 'drive', blink: 0 }, mila: { pose: 'lap' } }) });
        },
        cues: A => [23, 22].map((car, k) => ({ t: tMas1 + (A.ev('S1', 'brake_onset', e => e.car === car) - s23) / 3, kind: 'brake_note', step: k + 2 })) });

      shots.push({ id: 'A06_ots', start: tMas2 - 0.5, bg: 'hw_ots', label: 'ACELERADO ×2', focus: [960, 600], push: 0.03,
        draw(c, t, lt) {
          const ts = G6(t), R = A.s1(), xE = A.camX(ELI, ts, 1.2), xL = R.at(ts).x[ELI + 1];
          const sCam = xE - 6.4, aim = A.aim(sCam, 1.45, 3.1, 1150, xL, 1.85, 0.7, [1000, 360]);
          const bL = R.brake(ELI + 1, ts), bM = R.brake(ELI, ts);
          let bLs = 0; for (let k = 0; k < 10; k++) bLs += R.brake(ELI + 1, ts - k * 0.05) / 10;   // smoothed: Mila's point blends in (Guardian v3)
          A.hw(c, t, { simT: ts, sCam, lCam: 1.45, H: 3.1, pitch: aim.pitch, yaw: aim.yaw, f: 1150, rays: true,
            crew: tt => ({ eli: { pose: 'drive', lean: 0.06 * K.clamp(bL * 2) + 0.05 * bM, blink: 0 }, mila: A.pzv(bLs, 0.3, 'lap', 'point', 0.5) }) });
        },
        cues: A => [{ t: tMas2, kind: 'brake_note', step: 4 }, { t: tMas2 + (sEliOn - sLead) / 2, kind: 'brake_note', step: 5 }] });

      shots.push({ id: 'A07_brake', start: tMas3 - 0.28, bg: 'close', focus: [900, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = G7(t), stopT = tQuietoMid, since = t - stopT;
          const lurch = since > 0 ? 0.12 * Math.exp(-since * 4) * Math.cos(since * 9) : (t > tHard ? 0.05 : 0);
          // Guardian v3: the faces / Mila's arms used to snap (lap -> clasp -> lap in one frame each); A.seq blends them
          const eO = Object.assign({ pose: 'drive', blink: 0, lean: lurch, extras: since > 0.35 ? ['puff'] : [] }, A.seq(t, [
            [0, { pose: 'drive', expr: 'determined', look: [0.9, 0] }], [tHard, { pose: 'drive', expr: 'surprised', look: [0.9, 0] }],
            [tHard + 0.55, { pose: 'drive', expr: 'worried', look: [0.9, 0] }], [stopT + 0.12, { pose: 'drive', expr: 'annoyed', look: [0.6, 0.05] }]], 0.16));
          eO.lean = lurch;
          const mO = Object.assign({ view: 'q', dir: 1, lean: lurch * 1.2, blink: t < tHard - 0.1 ? milaBlink(t) : 0, hairFlop: milaFlop(t), drag: 0.5 * (1 - A.ramp(t, tHard, 0.3)) }, A.seq(t, [
            [0, { pose: 'lap', expr: 'neutral', look: [-0.3, -0.2], headTurn: -0.2 }], [tHard, { pose: 'clasp', expr: 'surprised', look: [0.7, 0], headTurn: 0.25 }],
            [stopT + 0.05, { pose: 'lap', expr: 'annoyed', look: [0.7, 0], headTurn: 0.25 }]], 0.2));
          mO.lean = lurch * 1.2;
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.62, wx: 600, wy: 615, sx: 940, sy: 540 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info, eO, mO) });
        },
        cues: A => [{ t: tEliOn, kind: 'brake_note', step: 6 }, { t: tHard, kind: 'squeal' }, { t: tQuietoMid, kind: 'stop_thunk' }, { t: tQuietoMid + 0.24, kind: 'flump' }] });

      // ================================================================ BEAT 3 · ¿Quién fue?
      const eliRise = t => A.ramp(t, tEli2 + 0.1, 0.28);
      shots.push({ id: 'A08_yell', start: tEli2 - 0.06, bg: 'close', focus: [880, 520], push: 0.028, pushDir: -1,
        draw(c, t, lt) {
          const ts = HOLD(t), yell = A.pulse(t, tQuien - 0.03, 0.08, tFueEnd - tQuien + 0.35, 0.3);
          // Guardian v3: stand -> fist used to snap the arm up in one frame; blended (A.seq), anticipation kept
          const eO = Object.assign({ view: 'q', dir: 1, blink: 0, look: [0.8, -0.1], extras: t < tQuien - 0.03 ? [] : t < tFueEnd + 0.5 ? ['anger', 'puff'] : ['anger'] }, A.seq(t, [
            [0, { pose: 'stand', expr: 'annoyed', lean: -0.04 * eliRise(t) }], [tQuien - 0.45, { pose: 'fist', expr: 'grumpy', lean: -0.05 }],   // inhale (anticipation)
            [tQuien - 0.03, { pose: 'fist', expr: 'furious', lean: 0.06 }], [tFueEnd + 0.5, { pose: 'fist', expr: 'furious', lean: 0.03 }]], 0.2));
          const mO = { pose: 'lap', view: 'q', dir: 1, headTurn: 0.2, look: [0.4, -0.1], blink: 0, hairFlop: milaFlop(t), ...A.ezs(t, [[0, 'annoyed'], [tFueEnd + 0.05, 'curious'], [tFueEnd + 0.5, 'annoyed'], [tFueEnd + 0.6, 'neutral']], 0.1) };
          let heads = null;
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.25, wx: 800, wy: 560, sx: 960, sy: 540 },
            crew: (cx, sx, sy, SC, info) => { heads = A.crew(cx, sx, sy, SC, info, eO, mO, { eliStand: eliRise(t) }); } });
          if (heads && heads.milaHead) { const [hx, hy, hr] = heads.milaHead; P.blow(c, hx + hr * 0.5, hy + hr * 0.25, hr * 1.4, blowK(t), 1); }
          if (heads && heads.eliHead) A.speaker('eli', heads.eliHead);   // the line is a text box (A.drawLines)
        },
        cues: A => [{ t: tEli2 + 0.12, kind: 'whoosh_up' }, { t: tQuien, kind: 'pop' }, { t: tFueEnd + 0.08, kind: 'blow' }] });

      shots.push({ id: 'A09_visor', start: tEliN - 0.12, bg: 'close_tight', focus: [980, 470], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t);
          const eO = { view: 'q', dir: 1, pose: 'visor', expr: 'determined', look: [1, -0.1], blink: eliBlink(t), tilt: -0.04 };
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.95, wx: 650, wy: 470, sx: 1000, sy: 560 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info, eO, { pose: 'lap', view: 'q', dir: 1, expr: 'neutral', blink: milaBlink(t) }, { eliStand: 1 }) });
        } });

      shots.push({ id: 'A10_point', start: tAlguien - 0.15, bg: 'hw_ots_eli', focus: [960, 520], push: 0.025,
        draw(c, t, lt) {
          const ts = HOLD(t), R = A.s1(), xE = R.at(ts).x[ELI];
          const sCam = xE - 3.6, aim = A.aim(sCam, 1.2, 2.5, 1050, xE + 40, 1.85, 1.0, [1080, 430]);
          A.hw(c, t, { simT: ts, sCam, lCam: 1.2, H: 2.5, pitch: aim.pitch, yaw: aim.yaw, f: 1050,
            crew: tt => ({ eli: { view: 'backq', dir: 1, seated: false, ...A.pz(t, tAlguien + 0.25, 'fist', 'point'), expr: 'furious', blink: 0, extras: [] },
              mila: { pose: 'lap', view: 'back' } }) });
        } });

      // v5 #1 «Eli siempre está seguro.»: back to the tight close-up of A09, arms crossed now, a smug nod on «seguro»; Mila
      // rolls her eyes on «siempre» (A10_point was 4.5 s with the new line)
      const tEliS = A.at('Eli', 2, { beat: '03', speaker: 'narrator' }), tSiempre = w('siempre', 1, '03'), tSeguro2 = w('seguro', 2, '03');
      shots.push({ id: 'A10_sure', start: tEliS - 0.1, bg: 'close_tight2', focus: [980, 470], push: 0.03, pushDir: -1,
        draw(c, t, lt) {
          const ts = HOLD(t);
          const eO = { view: 'q', dir: 1, ...A.pz(t, tEliS + 0.1, 'visor', 'crossed', 0.25), ...A.ez(t, tSeguro2, 'determined', 'smug'), look: [1, -0.1], blink: eliBlink(t), tilt: -0.04 + 0.06 * A.pulse(t, tSeguro2, 0.12, 0.12, 0.18) };
          const mO = { pose: 'lap', view: 'q', dir: 1, ...A.ez(t, tSiempre, 'neutral', 'annoyed'), look: t > tSiempre ? [0.2, -0.9] : [0.5, 0], blink: t > tSiempre ? 0 : milaBlink(t) };
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.95, wx: 650, wy: 470, sx: 1000, sy: 560 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info, eO, mO, { eliStand: 1 }) });
        } });
      shots.push({ id: 'A11_empty', start: tPero - 0.1, bg: 'hw_high', focus: [960, 500], push: 0.022, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t), R = A.s1(), xE = R.at(ts).x[ELI];
          const sCam = xE - 12, aim = A.aim(sCam, -0.5, 9, 1350, xE, 1.85, 0, [960, 820]);
          A.hw(c, t, { simT: ts, sCam, lCam: -0.5, H: 9, pitch: aim.pitch, yaw: aim.yaw, f: 1350, fg: true,
            crew: tt => ({ eli: { view: 'back', seated: false, pose: 'visor' }, mila: { pose: 'lap', view: 'back' } }) });
        } });

      shots.push({ id: 'A12_nothing', start: tNi - 0.2, bg: 'hw_pov', focus: [960, 560], push: 0.025, pushDir: -1,
        draw(c, t, lt) {
          const ts = HOLD(t), R = A.s1(), xE = R.at(ts).x[ELI];
          const sCam = xE + 2.5, aim = A.aim(sCam, 1.85, 1.75, 1150, xE + 200, 1.85, 0, [960, 600]);
          A.hw(c, t, { simT: ts, sCam, lCam: 1.85, H: 1.75, pitch: aim.pitch, yaw: aim.yaw, f: 1150 });
          const ap = (t0) => A.ramp(t, t0 - 0.08, 0.3), cx = (a, b) => K.clamp((t - a) / (b - a));
          P.card(c, 520, 360, 300, 'crash', ap(tChoque), cx(tChoqueE - 0.12, tChoqueE + 0.18), { t, rot: -0.08 });
          P.card(c, 960, 300, 300, 'cone', ap(tConos), cx(tConosE - 0.12, tConosE + 0.18), { t, rot: 0.05 });
          P.card(c, 1400, 360, 300, 'light', ap(tSema), cx(tSemaE - 0.1, tSemaE + 0.2), { t, rot: 0.09 });
        },
        cues: A => [{ t: tChoqueE, kind: 'scratch', n: 0 }, { t: tConosE, kind: 'scratch', n: 1 }, { t: tSemaE + 0.05, kind: 'scratch', n: 2 }] });

      // the bird gag: anticipation (Eli squints, turns his head slowly up to the bird) -> hit (cut: the bird, caught) ->
      // hold (silence) -> reaction (the bird shrugs its wings, «pío»)
      shots.push({ id: 'A13_squint', start: gap0, bg: 'close_bird', focus: [1050, 450], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t), k = A.ramp(t, gap0 + 0.15, gapU * 1.4);
          const eO = { view: 'q', dir: 1, pose: 'crossed', expr: 'annoyed', look: [K.lerp(0.8, 0.9, k), K.lerp(0, -0.85, k)], headTurn: 0, tilt: -0.08 * k, blink: 0 };
          let st = null;
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.55, wx: 760, wy: 420, sx: 900, sy: 560 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info, eO, { pose: 'lap', view: 'q', dir: 1, expr: 'neutral', blink: milaBlink(t) }, { eliStand: 1 }),
            after: (cx, CX, GY, SC, s2) => {} });
          // the bird on the wire above Eli (world coords of the close-up, through the shot's frame)
          const s1 = A.closeState('S1', ELI, ts); let wp = null; for (let j = -3; j < 6; j++) { const q = A.wireAt(s1, j, 0.62); if (!wp || Math.abs(q[0] - 1000) < Math.abs(wp[0] - 1000)) wp = q; }
          const fr = { z: 1.55, wx: 760, wy: 420, sx: 900, sy: 560 }, bx = fr.sx + (wp[0] - fr.wx) * fr.z, by = fr.sy + (wp[1] - fr.wy) * fr.z;
          P.bird(c, bx, by, 40, { t, expr: 'calm', look: [-0.6, 0.3], rim: '#ffd88f', dir: -1 });
          void st;
        },
        cues: A => [{ t: gap0 + 0.15, kind: 'creak' }] });

      shots.push({ id: 'A13_bird', start: gap0 + gapU * 1.75, bg: 'bird', focus: [960, 520], push: 0.035, pushDir: 1, breath: true,
        draw(c, t, lt) {
          drawBirdInsert(c, t, { shrug: A.ramp(t, gap0 + gapU * 2.55, 0.18) * (1 - A.ramp(t, gap1 - 0.05, 0.2)), caught: t < gap0 + gapU * 2.55 });
          P.callout(c, 1260, 330, 'pío', 80, A.pulse(t, gap0 + gapU * 2.62, 0.08, 0.5, 0.2));
        },
        cues: A => [{ t: gap0 + gapU * 2.55, kind: 'flutter' }, { t: gap0 + gapU * 2.62, kind: 'chirp' }] });

      // ================================================================ BEAT 4 · the question
      shots.push({ id: 'A14_turn', start: tMila - 0.05, bg: 'hw_behind', focus: [960, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t), R = A.s1(), xE = R.at(ts).x[ELI];
          const sCam = xE - 4.6, aim = A.aim(sCam, 1.85, 1.65, 1150, xE - 0.4, 1.85, 1.15, [960, 600]);   // Guardian: was 520 (beanie cut by the top edge)
          const turnHead = A.ramp(t, tMira, 0.14), snap = t > tAtrasN, sp = A.talk('mila', t);
          const mila = snap ? { view: 'front', seated: true, pose: 'crossed', ...A.ez(t, tEliM - 0.25, 'curious', 'awe'), look: [0.15, -0.15], lean: 0.08, light: FRONTLIT, talk: sp.talk, viseme: sp.viseme,
            tilt: 0.06 * Math.exp(-(t - tAtrasN) * 6), blink: milaBlink(t) }
            : { view: 'back', seated: true, pose: 'lap', headTurn: -1.2 * turnHead, light: BACK };
          // Guardian v3: the whip turn goes through the profile over 0.14 s (it was back -> front in one frame)
          const wt = K.clamp((t - (tAtrasN - 0.14)) / 0.14);
          if (wt > 0 && wt < 1) { const e = K.ease.sine(wt);
            Object.assign(mila, { view: e < 0.5 ? e * 2 : 2 - e * 2, backView: e < 0.5, dir: 1, headTurn: 0, pose: 'lap', blend: { pose: 'crossed', k: e }, expr: 'curious', look: [0.15, -0.15], light: e < 0.5 ? BACK : FRONTLIT }); }
          A.hw(c, t, { simT: ts, sCam, lCam: 1.85, H: 1.65, pitch: aim.pitch, yaw: aim.yaw, f: 1150,
            crew: tt => ({ eli: { view: 'back', seated: false, pose: 'visor', light: BACK }, mila }) });
        },
        cues: A => [{ t: tAtrasN, kind: 'whoosh_turn' }] });

      shots.push({ id: 'A15_back', start: tVa - 0.06, bg: 'hw_rev', label: 'ACELERADO ×3', focus: [960, 560], push: 0.03, pushDir: 1,
        draw(c, t, lt, S) {
          const ts = A.map(stop15, tAtrasM, 3)(t), R = A.s1(), xE = R.at(HOLD(t)).x[ELI];
          const sCam = xE + 0.6, aim = A.aim(sCam, 2.25, 1.55, 1050, xE - 45, 1.85, 0, [1120, 600], true);
          A.hw(c, t, { simT: ts, sCam, lCam: 2.25, H: 1.55, pitch: aim.pitch, yaw: aim.yaw, f: 1050, reverse: true, hide: i => i === ELI,
            carExpr: (i, b) => (b > 0.55 ? (A.blink(i, t) ? 'annoyed' : 'surprised') : 'content'),
            onGround: (cx, G) => P.groundArrow(cx, G, xE - 5, xE - 60, -1.5, A.ramp(t, tAtrasM - 0.05, 0.55)),
            onTop: (cx, G) => { for (let i = ELI - 1; i >= ELI - 7; i--) { const s = R.at(ts).x[i], w0 = A.road().world(s, 1.85), cc = G.rig.toCam(w0.x, w0.z); if (cc[1] < 2) continue;
              const p = G.cam.proj(cc[0], 2.3, cc[1]); P.chevron(cx, p.x, p.y, Math.max(14, p.s * 0.8), Math.PI / 2, A.pulse(t, tVa + (ELI - 1 - i) * 0.05, 0.15, 0.5, 0.25)); } } });
          // Mila in the foreground, from behind (over her shoulder), her ponytail
          K.cast.draw(c, 'mila1', 360, 1350, 1250, { view: 'backq', dir: -1, seated: true, pose: 'crossed', t, light: FRONTLIT, headTurn: 0.1 });
        },
        cues: A => [{ t: tAtrasM - 0.05, kind: 'swish' }].concat([16, 15, 14, 13].map(car => ({ t: tAtrasM + (A.ev('S1', 'stop', e => e.car === car) - stop15) / 3, kind: 'far_brake' }))) });

      shots.push({ id: 'A16_lens', start: tQue - 0.12, bg: 'hw_rev_front', focus: [1060, 470], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t), R = A.s1(), xE = R.at(ts).x[ELI];
          const sCam = xE + 3.4, aim = A.aim(sCam, 1.6, 1.85, 1300, xE, 1.85, 2.0, [1000, 545], true);
          const g = A.hw(c, t, { simT: ts, sCam, lCam: 1.6, H: 1.85, pitch: aim.pitch, yaw: aim.yaw, f: 1300, reverse: true, hide: i => i === ELI });
          const p = A.proj(g, xE, 1.85, 0); if (!p) return;
          const sp = A.talk('eli', t); let eliR = null;
          K.car.front(c, p.x, p.y, p.s, { seats: 2, color: K.TEAL, lit: { rim: '#ffd88f', shade: '#3c2a52', ang: -1.2, shadeK: 0.18, rimAlpha: 0.5 }, head: 0.15, glass: 0.12,
            drawDriver: (x, top, s, Wd) => {
              K.cast.draw(c, 'mila1', x - Wd * 0.21, top + 0.34 * s, 2.7 * s, { view: 'backq', dir: 1, seated: true, pose: 'crossed', t, light: FRONTLIT });
              eliR = K.cast.draw(c, 'eli1', x + Wd * 0.21, top + 0.34 * s, 2.7 * s, { view: 'front', seated: false, pose: 'detective', expr: 'curious', look: [0, -0.1], t, light: FRONTLIT, talk: sp.talk, viseme: sp.viseme, blink: 0 });
            } });
          // Producer 2026-10-29: the overlay eye here sat beside the kit lens (a doubled, blurred-looking eye); the kit lens now
          // draws the magnified eye itself, crisp, in every view
        },
        cues: A => [{ t: tQue - 0.1, kind: 'plink' }] });

      shots.push({ id: 'A17_backtoback', start: tEntonces - 0.15, bg: 'close_wide', focus: [930, 540], push: 0.03, pushDir: 1,
        draw(c, t, lt) {
          const ts = HOLD(t);
          const eO = { view: 'side', dir: 1, pose: 'detective', expr: 'curious', look: [1, -0.05], blink: eliBlink(t) };
          const mO = { view: 'side', dir: -1, pose: 'crossed', ...A.ez(t, A.at('embotellamientos', 1, { beat: '04' }), 'curious', 'awe'), look: [1, -0.2], lean: 0.05, blink: milaBlink(t) };
          A.close(c, t, 0, { simT: ts, tStop: sStop, frame: { z: 1.3, wx: 760, wy: 600, sx: 960, sy: 540 },
            crew: (cx, sx, sy, SC, info) => A.crew(cx, sx, sy, SC, info, eO, mO, { eliStand: 1 }) });
        },
        cues: A => [{ t: tEntonces, kind: 'chord_in', t1: tAparE }] });

      // ================================================================ BEAT 5 · wordmark
      const wmOpt = { wm: WM,
        eli: (o, tl, W) => {                            // ducks late, rubs his head, looks up: grudging smile
          // Guardian v3: one blended sequence (the base flinch and these overrides used to fight: full surprise for 2
          // frames, back to stand, then surprise again; surprise -> scratch swapped poses at full weight)
          Object.assign(o, A.seq(tl, [[0, { pose: 'stand', blend: null, expr: 'neutral', look: o.look }],
            [W.c2 + 0.13, { pose: 'surprise', blend: null, expr: 'surprised', look: o.look }],
            [W.c2 + 0.5, { pose: 'scratch', blend: null, expr: 'annoyed', look: [0.6, 0.1] }],
            [W.land + 0.75, { pose: 'scratch', blend: null, expr: 'sheepish', look: [0.45, -0.9] }],
            [W.land + 1.5, { pose: 'stand', blend: null, expr: 'happy', look: [0.5, -0.8] }]], 0.16));
        } };
      shots.push({ id: 'A18_wordmark', start: tWM, bg: 'wm', xf: 0.28, focus: [960, 520], push: 0.02, pushDir: 1,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { E.drawWordmark(c, t - tWM, 0, wmOpt); },
        cues: A => [{ t: tWM - 0.25, kind: 'whoosh_wm' }, { t: tWM + WM.drop, kind: 'sting_drop' }, { t: tWM + WM.c1, kind: 'flick' }] });
      shots.push({ id: 'A19_bonk', start: tWM + WM.c2 - 0.32, bg: 'wm_close', focus: [960, 540], push: 0.02, pushDir: 1, breath: false,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { c.save(); const z = 2.3 + 0.06 * K.ease.sine(K.clamp(lt / 1.2)); c.translate(960, 540); c.scale(z, z); c.translate(-900, -335); E.drawWordmark(c, t - tWM, 0, wmOpt); c.restore(); },
        cues: A => [{ t: tWM + WM.c2, kind: 'boink' }, { t: tWM + WM.land, kind: 'tin' }] });
      shots.push({ id: 'A20_title', start: tWM + WM.land + 0.62, bg: 'wm', focus: [960, 470], push: 0.018, pushDir: -1, zBase: 1.08,
        post: { grain: 0.13, vignette: 0.5, vignetteColor: '#1a0f26', bloom: 0.3 },
        draw(c, t, lt) { E.drawWordmark(c, t - tWM, 0, wmOpt); } });
      return shots;
    },
    ambience(A) {
      const w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const tQuietoE = w('quieto', 1, '02', { edge: 'end' }), tSemaE = w('semáforo', 1, '03', { edge: 'end' }), tMila = w('Mila', 1, '04');
      const tPero = w('Pero', 1, '03'), tAparE = w('aparente', 1, '04', { edge: 'end' }), tWM = tAparE + 0.32, t1 = A.at('Mila', 1, { beat: '06' });
      return [
        { kind: 'music_hook', t0: 0, t1: tQuietoE },                 // the music cuts dead on «quieto»
        { kind: 'wind', t0: 0, t1: tWM }, { kind: 'road', t0: 0, t1: tQuietoE },
        { kind: 'crickets', t0: tPero - 0.2, t1: tMila },             // «allá no hay nada»: crickets
        { kind: 'dusk_pad', t0: tWM, t1: t1 - 1.0 },                  // 1 s of total silence at the end of the sting
        { kind: 'silence', t0: t1 - 1.0, t1 },
      ];
    },
  });

  // ---------------------------------------------------------------- the bird insert (low angle, golden sky, the wire)
  let BI = null;
  function drawBirdInsert(c, t, o) {
    if (!BI) {
      const sky = K.canvas(K.W, K.H);
      K.sky.gradient(sky.ctx, [[0, '#6f72ad'], [0.45, '#c08fa8'], [0.8, '#f3ae84'], [1, '#ffd49a']], 0, K.H);
      K.sky.wash(sky.ctx, 1500, 900, 900, '#ffcf8a', 0.55);
      K.tex.paint(sky, { amount: 0.35, mottle: { w: 1200, h: 540, sx: 0.0025, sy: 0.02, seed: 23, amp: 30 } });
      BI = { sky, clouds: E.goldenClouds([1500, 900], [[300, 300, 640, 130, 11, 4], [1200, 180, 560, 120, 12, 5], [1750, 420, 420, 90, 13, 6]]) };
    }
    c.drawImage(BI.sky.c, 0, 0);
    K.sky.drawClouds(c, BI.clouds, t, {});
    K.light.rays(c, 1500, 950, { n: 9, spread: 1.6, angle: -Math.PI / 2 - 0.3, len: 1400, width: 0.05, alpha: 0.08, color: '#ffe0a0', t, seed: 31 });
    // the wire (two, slightly apart, sagging across the frame) and a pole top at the right
    const wy = x => 640 - (x - 960) * 0.12 + Math.pow((x - 960) / 960, 2) * 60;
    c.strokeStyle = K.rgba('#2e2028', 0.9); c.lineWidth = 6; c.beginPath(); for (let x = -40; x <= K.W + 40; x += 40) (x < 0 ? c.moveTo(x, wy(x)) : c.lineTo(x, wy(x))); c.stroke();
    c.lineWidth = 4; c.beginPath(); for (let x = -40; x <= K.W + 40; x += 40) (x < 0 ? c.moveTo(x, wy(x) + 70) : c.lineTo(x, wy(x) + 70)); c.stroke();
    c.fillStyle = '#33232a'; c.fillRect(1780, 420, 40, 700); c.fillStyle = K.rgba('#ffd88f', 0.55); c.fillRect(1784, 420, 6, 700);
    c.fillStyle = '#33232a'; K.rrect(c, 1620, 560, 360, 26, 8); c.fill();
    const bx = 980, by = wy(bx);
    K.particles.motes(c, t, { n: 30, seed: 41, color: '#ffe6b0', alpha: 0.5, size: 2.6, vx: 8, vy: -4 });
    P.bird(c, bx, by, 120, { t, expr: o.shrug > 0.3 ? 'shrug' : o.caught ? 'caught' : 'calm', shrug: o.shrug, look: o.shrug > 0.3 ? [0.6, 0.2] : [-0.7, 0.55], rim: '#ffd88f', dir: -1 });
    K.light.grade(c, '#ff9a5a', 0.2, 'soft-light');
  }
})(typeof window !== 'undefined' ? window : globalThis);
