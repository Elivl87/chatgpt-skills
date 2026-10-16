/* Ep 001 · BLOCK E1 · Act 4, beats 20-21: a hundred cars on a real highway (S10, golden dawn, four lanes from a crane;
   one lane is the sim, three replay it shifted) and «the wave remembers»: the red bump on the speed line shrinks when
   it crosses smart cars and grows when it crosses cars with the system off (S10 events wave_passes_active /
   wave_passes_inactive land on «achica» / «crece»). Eli becomes a fan with a teal pennant, does the wave on time.
   Times from words or S10 events, never typed seconds. */
(function (root) {
  const K = root.K, E = K.ep1, A = K.anim, P = K.props;
  const REC = 'RECREACIÓN ILUSTRADA', SRC = 'Lee et al., IEEE Control Systems 2025 · 1 carril simulado, 3 ilustrados';

  A.block('E1', {
    eliBadge: true,   // Guardian: Eli keeps the badge on between «¡Mi lema!» (D1) and the glovebox (E2)
    t0: null, t1: null,
    async setup() { this.t0 = A.at('Funciona', 1, { beat: '20' }); this.t1 = A.at('O', 1, { beat: '22' }); },
    post: { grain: 0.12, vignette: 0.38, vignetteColor: '#2a1a2a', bloom: 0.2 },
    shots(A) {
      const def = this, T0 = def.t0, w = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat }, o));
      const el = (word, n, beat, o = {}) => A.at(word, n, Object.assign({ beat, speaker: 'eli' }, o));
      // ---- words
      const tNov = w('noviembre', 1, '20'), tNash = w('Nashville', 1, '20'), tEquipo = w('equipo', 1, '20'), tCien = w('cien', 1, '20'), tAutos = w('autos', 1, '20');
      const tCon = w('con', 1, '20'), tInt = w('inteligente', 1, '20'), tProg = w('programa', 1, '20'), tAcel = w('acelerar', 1, '20'), tFrenar = w('frenar', 1, '20');
      const tResult = w('resultado', 1, '20'), tCompl = w('complicado', 1, '20'), tCien2 = w('Cien', 2, '20'), tGota = w('gota', 1, '20'), tBorr = w('borraron', 1, '20');
      const tTampoco = w('tampoco', 1, '20'), tHacerloE = w('hacerlo', 1, '20', { edge: 'end' });
      const tPero = w('Pero', 1, '21'), tEliN = w('Eli', 1, '21', { speaker: 'narrator' }), tUna = w('Una', 1, '21'), tAtras = w('atrás', 1, '21');
      const tPasan1 = w('Pasan', 1, '21'), tAchica1 = w('achica', 1, '21'), tDale = el('Dale', 1, '21'), tDale2E = el('dale', 2, '21', { edge: 'end' });
      const tPasan2 = w('Pasan', 2, '21'), tCuatro = w('cuatro', 1, '21'), tApagado = w('apagado', 1, '21'), tCrece = w('crece', 1, '21'), tNooo = el('Nooo', 1, '21'), tNoooE = el('Nooo', 1, '21', { edge: 'end' });
      const tPasan3 = w('Pasan', 3, '21'), tAchica2 = w('achica', 2, '21'), tCada = w('Cada', 1, '21'), tCrecer = w('crecer', 1, '21'), tEncoger = w('encoger', 1, '21');
      // ---- sim (S10): one base clock for beat 20 (×1, the tap at sim 20 lands near «gota»), then one mapping per
      // stretch of beat 21 so each pass lands on its word (labels say each speed-up)
      const R = () => A.s10(), ev = (type, car) => A.ev('S10', type, e => e.car === car);
      const G20 = A.map(0, T0, 1);
      const G12 = A.map(ev('wave_passes_active', 221), tAchica1, 12);
      const G14 = A.map(ev('wave_passes_inactive', 169), tCrece, 9);
      const G16 = A.map(ev('wave_passes_active', 130), tAchica2 - 0.2, 14);
      const LD = A.LIGHT_DAWN, GY = A.BRIDGE.GY;
      const rec = c => P.pill(c, 96, 84, REC, 26, 1), src = c => P.source(c, SRC, 1);
      const eliBlink = t => A.blink(3, t), milaBlink = t => A.blink(5, t);
      const skinE = K.cast.SPECS.eli1.skin, skinM = K.cast.SPECS.mila1.skin;
      // the pair on the bridge (low angle): Eli left, Mila right; eO / mO acting, extra(ctx, rE, rM)
      const pair = (c, t, eO, mO, o = {}) => {
        let rE = null, rM = null; const ex = o.ex ?? 780, mx = o.mx ?? 1170, u = o.u ?? 820, fy = GY + 150;
        A.bridge(c, t, { cars: o.cars ?? 1, chars: cx => {
          if (o.extras) o.extras(cx);
          rM = K.cast.draw(cx, 'mila1', mx, fy, u * 0.96, Object.assign({ view: 'q', dir: -1, pose: 'crossed', expr: 'happy', t, light: LD, blink: milaBlink(t) }, mO));
          rE = K.cast.draw(cx, 'eli1', ex, fy, u, Object.assign({ view: 'q', dir: 1, pose: 'stand', expr: 'curious', t, light: LD, blink: eliBlink(t) }, eO));
          if (o.inFront) o.inFront(cx, rE, rM);
        } });
        if (o.after) o.after(c, rE, rM);
        return { rE, rM };
      };
      const shots = [];

      // ================================================================ BEAT 20 · a hundred cars
      shots.push({ id: 'G01_crane', start: T0 - 0.05, bg: 'i24_wide', focus: [960, 560], push: 0.03, pushDir: -1, over: c => { rec(c); src(c); },
        draw(c, t, lt) { const ts = G20(t); A.i24(c, t, { simT: ts, sC: R().at(ts).x[200] + 40 + lt * 3, sc: 3.4, sinE: 0.62, oy: 700, sky: 250, zk: 2.6 }); },
        cues: A => [{ t: T0 + 0.1, kind: 'whoosh_up' }] });
      shots.push({ id: 'G02_card', start: tNov - 0.35, bg: 'i24_mid', focus: [960, 540], push: 0.025, pushDir: 1,
        over: (c, t) => { rec(c); src(c); P.pill(c, 960, 840, 'nov. 2022', 40, A.ramp(t, tNov, 0.25), { align: 'center' }); P.pill(c, 960, 760, 'cerca de Nashville', 44, A.ramp(t, tNash, 0.25), { align: 'center', bg: K.rgba('#23746C', 0.92) }); },
        draw(c, t, lt) { const ts = G20(t); A.i24(c, t, { simT: ts, sC: R().at(ts).x[214] + 10, sc: 6, sinE: 0.55, oy: 470 }); },
        cues: A => [{ t: tNov, kind: 'plate' }, { t: tNash, kind: 'pop' }] });
      shots.push({ id: 'G03_100', start: tEquipo - 0.15, bg: 'i24_halo', focus: [960, 560], push: 0.025, pushDir: 1,
        over: (c, t) => { rec(c); src(c); P.badge(c, K.W - 250, 250, '100', 100, A.ramp(t, tCien - 0.05, 0.3), 'autos inteligentes'); },
        draw(c, t, lt) { const ts = G20(t), h = A.ramp(t, tAutos, 0.5); A.i24(c, t, { simT: ts, sC: R().at(ts).x[214], sc: 3.6, sinE: 0.6, oy: 640, sky: 200, zk: 2.6, halo: h, haloAll: h }); },
        cues: A => [{ t: tCien, kind: 'ding' }] });
      // Eli and Mila on the footbridge: Eli squints down, starts pointing at the halos
      shots.push({ id: 'G04_bridge', start: tCon - 0.1, bg: 'bridge', focus: [900, 420], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const p = t > tInt;
          pair(c, t, { ...A.pz(t, tInt, 'visor', 'point'), expr: p ? 'determined' : 'curious', look: [-0.3, 0.7], dir: p ? -1 : 1 }, { pose: 'crossed', expr: 'curious', look: [-0.7, 0.2] }); } });
      shots.push({ id: 'G05_chip', start: tProg - 0.1, bg: 'i24_close', focus: [960, 540], push: 0.03, pushDir: -1,
        over: (c, t) => { rec(c); P.pill(c, 960, 210, '▲ acelerar', 44, A.ramp(t, tAcel, 0.2) * (1 - A.ramp(t, tFrenar - 0.15, 0.15)), { align: 'center', bg: K.rgba('#23746C', 0.92) });
          P.pill(c, 960, 210, '▼ frenar', 44, A.ramp(t, tFrenar, 0.2), { align: 'center', bg: K.rgba('#b8452f', 0.92) }); },
        draw(c, t, lt) { const ts = G20(t), s = R().at(ts).x[221]; A.i24(c, t, { simT: ts, sC: s + 1, sc: 22, sinE: 0.6, oy: 520, halo: 1, carK: 1.1 });
          // the program: a little chip over the car
          const k = A.ramp(t, tProg, 0.25); if (k > 0.01) { c.save(); c.globalAlpha = k; c.translate(960, 330); c.fillStyle = '#1c2433'; c.strokeStyle = '#4fb3a8'; c.lineWidth = 6; K.rrect(c, -70, -50, 140, 100, 14); c.fill(); c.stroke();
            for (let j = -2; j <= 2; j++) { c.fillStyle = '#4fb3a8'; c.fillRect(j * 24 - 4, 50, 8, 18); c.fillRect(j * 24 - 4, -68, 8, 18); }
            c.fillStyle = '#4fb3a8'; c.font = '700 30px "Martian Mono"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ACC', 0, 2); c.restore(); } },
        cues: A => [{ t: tAcel, kind: 'click' }, { t: tFrenar, kind: 'click' }] });
      // the counting gag: Eli counts the halos on his fingers, runs out, borrows Mila's hands, runs out again
      const counts = (t) => { const a = tResult - 0.15, b = tCompl - 0.05, c2 = tCompl + 0.25, d = tCien2 - 0.25;
        if (t < a) return 0; if (t < b) return Math.min(10, 1 + Math.floor((t - a) / ((b - a) / 10))); if (t < c2) return 10; return Math.min(20, 10 + 1 + Math.floor((t - c2) / ((d - c2) / 10))); };
      const handsInsert = (c, t, n, milaIn, droop) => {
        A.bridge(c, t, { cars: 0 }); c.fillStyle = K.rgba('#2a1830', 0.25); c.fillRect(0, 0, K.W, K.H);
        const eN = [Math.min(5, n), Math.max(0, Math.min(5, n - 5))], mN = [Math.max(0, Math.min(5, n - 10)), Math.max(0, Math.min(5, n - 15))];
        const slide = K.ease.outBack(K.clamp(milaIn)), dy = droop * 160, rot = droop * 0.5;
        const ex = milaIn > 0 ? K.lerp(780, 560, slide) : 780;
        P.hand(c, ex - 170, 740 + dy, 150, eN[0], { dir: -1, skin: skinE, sleeve: '#f3ecdd', rot: -0.12 - rot });
        P.hand(c, ex + 170, 740 + dy, 150, eN[1], { dir: 1, skin: skinE, sleeve: '#f3ecdd', rot: 0.12 + rot });
        if (milaIn > 0) { const mx = K.lerp(2300, 1340, slide); P.hand(c, mx - 160, 760 + dy, 140, mN[0], { dir: -1, skin: skinM, sleeve: '#7158b8', rot: -0.1 - rot }); P.hand(c, mx + 160, 760 + dy, 140, mN[1], { dir: 1, skin: skinM, sleeve: '#7158b8', rot: 0.1 + rot }); }
      };
      shots.push({ id: 'G06_count', start: tResult - 0.3, bg: 'hands', focus: [960, 600], push: 0.03, pushDir: 1,
        draw(c, t, lt) { const n = counts(t); handsInsert(c, t, n, A.ramp(t, tCompl + 0.0, 0.25), 0);
          if (n > 0) P.num(c, 960, 230, n, 140, 1, n > 10); },
        cues: A => { const out = [], a = tResult - 0.15, b = tCompl - 0.05, c2 = tCompl + 0.25, d = tCien2 - 0.25;
          for (let k = 0; k < 10; k++) out.push({ t: a + k * (b - a) / 10, kind: 'tick_pencil' }); out.push({ t: tCompl, kind: 'swish' });
          for (let k = 0; k < 10; k++) out.push({ t: c2 + k * (d - c2) / 10, kind: 'tick_pencil' }); return out; } });
      shots.push({ id: 'G07_drop', start: tCien2 - 0.1, bg: 'i24_drop', focus: [960, 600], push: 0.025, pushDir: -1,
        over: (c, t) => { rec(c); src(c); P.badge(c, K.W - 250, 250, '100', 70, 1, 'autos'); },
        draw(c, t, lt) { const ts = G20(t), g = A.i24(c, t, { simT: ts, sC: R().at(ts).x[214] + 60, sc: 2.6, sinE: 0.62, oy: 690, sky: 280, zk: 2.8, halo: 1, haloAll: 1 });
          P.drop(c, 960, 690, K.clamp((t - (tGota - 0.45)) / 0.45), K.clamp((t - tGota) / 1.2), 0.62); },
        cues: A => [{ t: tGota, kind: 'plop' }] });
      shots.push({ id: 'G08_waves', start: tBorr - 0.25, bg: 'i24_front', focus: [960, 540], push: 0.03, pushDir: 1, over: c => { rec(c); src(c); },
        draw(c, t, lt) { const ts = G20(t); A.i24(c, t, { simT: ts, sC: R().at(ts).x[248], sc: 5.5, sinE: 0.55, oy: 520, halo: 1 }); } });
      shots.push({ id: 'G09_giveup', start: tTampoco - 0.15, bg: 'hands2', focus: [960, 620], push: 0.03, pushDir: -1,
        draw(c, t, lt) { handsInsert(c, t, 20, 1, A.ramp(t, tTampoco + 0.25, 0.6));
          P.num(c, 960, 230, '?', 140, 1 - A.ramp(t, tTampoco + 0.6, 0.3), true); },
        cues: A => [{ t: tTampoco + 0.25, kind: 'flump' }] });
      shots.push({ id: 'G09_faces', start: tHacerloE - 0.45, bg: 'bridge2', focus: [960, 420], push: 0.03, pushDir: 1,
        draw(c, t, lt) { pair(c, t, { pose: 'shrug', expr: 'sheepish', look: [0.6, 0.1], extras: ['sweat'] }, { pose: 'crossed', expr: 'laugh', look: [-0.8, 0.1] }); } });

      // ================================================================ BEAT 21 · the wave remembers
      shots.push({ id: 'G10_flag', start: tPero - 0.1, bg: 'bridge_flag', focus: [820, 400], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const out = t > tEliN; pair(c, t, { ...A.pz(t, tEliN, 'stand', 'cheer'), expr: out ? 'happy' : 'determined', look: [0.4, 0.3], extras: out && t < tEliN + 0.6 ? ['sparkle'] : [] },
          { pose: 'crossed', expr: out ? 'curious' : 'happy', look: [-0.9, -0.1] }, { after: (cx, rE, rM) => { if (out && rE) P.flag(cx, rE.hands.lead[0], rE.hands.lead[1], 300, t, { ang: 0.1 }); if (out && rM) P.shrug(cx, rM.head[0], rM.head[1] - rM.head[2] * 1.6, 40, A.pulse(t, tEliN + 0.4, 0.2, 0.8, 0.2)); } }); },
        cues: A => [{ t: tEliN, kind: 'pop' }] });
      const strip = (c, t, ts, o = {}) => { const g = A.i24(c, t, { simT: ts, sC: A.waveS(ts) + (o.dx || 0), sc: o.sc || 4.2, sinE: 0.5, oy: o.oy || 830, zk: 2.6, halo: 1, off: o.off || 0 });
        return A.speedLine(c, ts, g, { y: o.y || 560, kpx: o.kpx || 26, zoom: o.zoom }); };
      shots.push({ id: 'G11_line', start: tUna - 0.1, bg: 'line', label: 'ACELERADO ×12', focus: [960, 540], push: 0.022, pushDir: -1, over: c => src(c),
        draw(c, t, lt) { const r = strip(c, t, G12(t)); if (r) P.chevron(c, r.maxX - 140, 330, 50, Math.PI, A.ramp(t, tAtras - 0.1, 0.25), '#2a1a1e'); },
        cues: A => [{ t: tAtras, kind: 'swish' }] });
      shots.push({ id: 'G12_act', start: tPasan1 - 0.1, bg: 'line_act', label: 'ACELERADO ×12', focus: [960, 520], push: 0.03, pushDir: 1, over: c => src(c),
        draw(c, t, lt) { strip(c, t, G12(t), { sc: 5.2, dx: 25 }); },
        cues: A => [{ t: tAchica1 - 0.3, kind: 'crowd_wave', t1: tAchica1 + 1.0 }] });
      shots.push({ id: 'G13_dale', start: tDale - 0.15, bg: 'bridge_dale', focus: [800, 380], push: 0.035, pushDir: 1,
        draw(c, t, lt) { const sp = A.talk('eli', t); let head = null;
          pair(c, t, { pose: 'cheer', expr: 'laugh', look: [0.2, 0.5], talk: sp.talk, viseme: sp.viseme, lean: 0.04 * Math.sin(t * 14) }, { pose: 'crossed', expr: 'happy', look: [-0.9, -0.1] },
            { after: (cx, rE) => { if (rE) { P.flag(cx, rE.hands.lead[0], rE.hands.lead[1], 300, t, { ang: 0.2, wave: 0.5, f: 14 }); head = rE.head; } } });
          if (head) A.speaker('eli', head); },   // the text box avoids both heads itself
        cues: A => [{ t: tDale, kind: 'pop' }] });
      shots.push({ id: 'G14_off', start: tPasan2 - 0.08, bg: 'line_off', label: 'ACELERADO ×9', focus: [960, 540], push: 0.025, pushDir: -1, over: c => src(c),
        draw(c, t, lt) { strip(c, t, G14(t), { off: 1, dx: -20, kpx: 70, zoom: 'escala ×2,7' }); },
        cues: A => [{ t: tApagado, kind: 'murmur' }, { t: tCrece - 0.6, kind: 'whisper_grow', n: 5, d: 0.15 }] });
      shots.push({ id: 'G15_nooo', start: tNooo - 0.2, bg: 'bridge_nooo', focus: [780, 500], push: 0.04, pushDir: 1,   // Guardian: focus y 380 -> 500 (Mila's ponytail cut by the top edge)
        draw(c, t, lt) { const sp = A.talk('eli', t); let head = null;
          pair(c, t, { pose: 'surprise', expr: 'worried', look: [0.1, 0.6], talk: sp.talk, viseme: sp.viseme, extras: ['sweat'] }, { pose: 'crossed', expr: 'surprised', look: [-0.9, 0] },
            { after: (cx, rE) => { if (rE) { P.flag(cx, rE.hands.lead[0], rE.hands.lead[1], 300, t, { ang: 3.05, wave: 0.04 }); head = rE.head; } }, u: 740 });   // Guardian: u 820 -> 740 (Mila's ponytail touched the top edge)
          if (head) A.speaker('eli', head); },   // the text box avoids both heads itself
        cues: A => [{ t: tNooo, kind: 'minor' }] });
      shots.push({ id: 'G16_act2', start: tPasan3 - 0.08, bg: 'line_act2', label: 'ACELERADO ×14', focus: [960, 520], push: 0.03, pushDir: 1, over: c => src(c),
        draw(c, t, lt) { strip(c, t, G16(t), { sc: 4.8, dx: 30, kpx: 70, zoom: 'escala ×2,7' }); },
        cues: A => [{ t: tPasan3 + 0.3, kind: 'murmur' }] });
      // Eli does the wave ON TIME on the last «se achica», the people on the bridge follow him; he is surprised at himself
      const tUp = tAchica2;
      shots.push({ id: 'G17_wave', start: tAchica2 - 0.2, bg: 'bridge_wave', focus: [960, 420], push: 0.02, pushDir: -1,
        draw(c, t, lt) {
          const up = k => A.pulse(t, tUp + k * 0.12, 0.14, 0.25, 0.25);
          const people = [[180, 1, 'cap'], [400, 2, 'bun'], [1450, 3, 'short'], [1660, 4, 'cap'], [1850, 5, 'long']];
          pair(c, t, { ...A.pzv(up(0), 0.4, 'stand', 'cheer'), expr: t > tUp + 0.55 ? 'surprised' : 'happy', look: t > tUp + 0.55 ? [0.6, -0.1] : [0, 0.3], lift: up(0) * 0.05 },
            { pose: 'crossed', expr: 'happy', look: [-0.9, -0.1] },
            { u: 640, ex: 760, mx: 1060, extras: cx => people.forEach(([x, seed, hs], k) => { const kk = x < 760 ? 1 + k * 0 : 2 + k; const u2 = up(x < 760 ? -1 : k); const pe = K.car.persona(seed * 7, 3);
              K.char.person(cx, x, GY - 90 - u2 * 40, 54, { t, seed: seed * 7, skin: pe.skin, hair: pe.hair, hairStyle: pe.hairStyle, capColor: pe.capColor, shirt: K.car.COLORS[seed % 10], ...A.pzv(u2, 0.4, 'stand', 'cheer'), expr: u2 > 0.4 ? 'laugh' : 'content', light: { ang: -0.6, rim: '#ffd99a', shade: '#3c2a52' } }); void kk; }),
              after: (cx, rE) => { if (rE) P.flag(cx, rE.hands.lead[0], rE.hands.lead[1], 230, t, up(0) > 0.4 || t > tUp ? { ang: 0.1, wave: 0.3 } : { ang: 3.05, wave: 0.04 }); } }); },
        cues: A => [{ t: tUp - 0.1, kind: 'crowd_wave', t1: tUp + 1.3 }] });
      shots.push({ id: 'G18_mila', start: tCada - 0.1, bg: 'bridge_mila', focus: [1100, 500], push: 0.035, pushDir: 1,   // Guardian: focus y 380 -> 500, u 880 -> 760 (Mila's head cut by the top edge)
        draw(c, t, lt) { pair(c, t, { pose: 'cheer', expr: 'surprised', look: [0.7, -0.2] }, { pose: 'crossed', expr: 'happy', look: [-1, 0.05], headTurn: -0.2 }, { ex: 600, mx: 1150, u: 760 }); } });
      // «la hace crecer o encoger»: what each car that crosses did to the bump (the true S10 profile, front → back)
      shots.push({ id: 'G19_profile', start: tCrecer - 0.5, bg: 'profile', focus: [960, 540], push: 0.025, pushDir: -1, post: { grain: 0.1, vignette: 0.3, vignetteColor: '#5a4a50', bloom: 0.08 },
        over: c => src(c),
        draw(c, t, lt) { const run = R().raw, ro = run.roles, cars = []; for (let i = ro.tap - 1; i >= ro.act2[4] - 12; i--) cars.push(i);
          c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
          c.font = '700 34px "Martian Mono"'; c.fillStyle = '#2a1a1e'; c.fillText('tamaño del bache que ve cada auto (km/h)', 120, 150);
          const x0 = 1800, dx = (1800 - 120) / cars.length, base = 800, k = 40, rev = K.clamp((t - (tCrecer - 0.4)) / 1.8);
          c.strokeStyle = '#2a1a1e'; c.lineWidth = 4; c.beginPath(); c.moveTo(110, base); c.lineTo(1810, base); c.stroke();
          cars.forEach((i, n) => { if (n / cars.length > rev) return; const amp = Math.max(0, (A.I24.V - run.minV(i, 20)) * 3.6), x = x0 - n * dx, act = ro.active.includes(i), off = ro.inactive.includes(i);
            c.fillStyle = act ? '#4fb3a8' : off ? '#9a96a6' : K.rgba('#e0503a', 0.8); c.fillRect(x - dx * 0.4, base - amp * k, dx * 0.8, amp * k);
            if (act || off) { c.fillStyle = act ? '#23746C' : '#6f6a7c'; K.circle(c, x, base + 30, 12); c.fill(); } });
          c.font = '600 28px "Space Grotesk"'; c.fillStyle = '#23746C'; c.fillText('● auto inteligente', 120, 1010); c.fillStyle = '#6f6a7c'; c.fillText('● sistema apagado', 460, 1010);
          c.fillStyle = '#2a1a1e'; c.fillText('← hacia atrás', 1560, 1010); },
        cues: A => [{ t: tCrecer - 0.4, kind: 'chain', t1: tCrecer + 1.4 }] });
      return shots;
    },
    ambience(A) {
      const t0 = A.at('Funciona', 1, { beat: '20' }), t1 = A.at('O', 1, { beat: '22' }), tPero = A.at('Pero', 1, { beat: '21' });
      return [{ kind: 'road', t0, t1 }, { kind: 'field_birds', t0, t1: tPero }, { kind: 'wind', t0, t1 }, { kind: 'crowd', t0: tPero, t1 }, { kind: 'music_light', t0, t1 }];
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
