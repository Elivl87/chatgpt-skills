/* Ep 001 · animatic core. A block is a list of shots; every start time, acting beat, label and sound cue is computed
   from the narration word timings (audio/timings_es.json) or from the true sims (sim/states.js run events), never typed
   in seconds. One renderer for every block: index.html?scene=ep001_<block>&out=854x480 (draft, default) | 1280x720
   (review) | 1920x1080 (final). The scenes draw in design units (1920x1080); the stage scales the frame.

     A.at('freno', 1, { beat: '01' })            -> start of the 1st «freno» in beat 01 (video seconds)
     A.at('quieto', 1, { beat: '02', edge: 'end', after: -0.1 })
     A.talk('eli', t)                            -> { talk, viseme } while Eli is saying a word, else talk 0
     A.ev('S1', 'eli_stop')                      -> sim time (s) of a run event
     A.map(simAnchor, tAnchor, N)                -> t -> sim time (×N), so a sim event lands on a word
     A.block('A', { t0, t1, shots(A) -> [...], post, cues(A) -> [...] })
   Shot: { id, start, bg, draw(ctx, t, lt, S, frame), focus: [x, y], push: 0.02-0.03, drift: <= 0.012, label, post,
           cues: [{ t, kind, ... }] }. The end of a shot is the start of the next. Camera breathing (push + drift,
   own phase per shot) is applied on top of each shot's own framing. */
(function (root) {
  const K = root.K, E = K.ep1;
  const A = K.anim = {};
  A.QUALITY = { draft: [854, 480], review: [1280, 720], final: [1920, 1080] };

  // ------------------------------------------------------------------ word timings
  const norm = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]+/g, '');
  A.load = async function (src) {
    if (A.words) return;
    // ?timings=<path> loads another word file (dry runs of a re-timed script, e.g. ../audio/timings_es_v4_provisional.json);
    // the real timeline always comes from ../audio/timings_es.json
    A.words = await (await fetch(src || '../audio/timings_es.json')).json();
    A.words.forEach((w, i) => { w.i = i; w.key = norm(w.word); });
  };
  A.word = function (word, n = 1, o = {}) {
    const key = norm(word);
    const hits = A.words.filter(w => w.key === key && (!o.beat || w.beat === o.beat) && (!o.speaker || w.speaker === o.speaker));
    if (hits.length < n) throw new Error(`animatic: word «${word}» #${n} ${o.beat ? 'in beat ' + o.beat : ''} not found (${hits.length})`);
    // ?anchors=1: every lookup is listed in events().anchors with its context (re-pointing QC when the voice changes)
    if (A._anchors) { const w = hits[n - 1]; A._anchors.push({ word, n, beat: o.beat || null, speaker: o.speaker || null, i: w.i, line: w.line, t: w.start,
      ctx: A.words.slice(Math.max(0, w.i - 3), w.i + 4).map(x => x.i === w.i ? '[' + x.word + ']' : x.word).join(' ') }); }
    return hits[n - 1];
  };
  A.at = function (word, n = 1, o = {}) {
    if (typeof n === 'object') { o = n; n = 1; }
    const w = A.word(word, n, o);
    return (o.edge === 'end' ? w.end : o.edge === 'mid' ? (w.start + w.end) / 2 : w.start) + (o.after || 0);
  };
  A.span = (a, b) => [A.at(...a), A.at(...b)];

  // mouth shapes from the speaker's own words (talk 0 between words): the letter under the playhead picks the viseme
  const VIS = { a: 'A', e: 'E', i: 'E', o: 'O', u: 'O', m: 'M', b: 'M', p: 'M', f: 'E', v: 'M' };
  A.talk = function (speaker, t, o = {}) {
    const ws = A._bySpk[speaker] || []; let w = null;
    for (const x of ws) { if (t >= x.start - 0.02 && t <= x.end + 0.03) { w = x; break; } if (x.start > t) break; }
    if (!w) return { talk: 0, viseme: undefined };
    const letters = w.key || 'a', u = K.clamp((t - w.start) / Math.max(0.05, w.end - w.start)), ch = letters[Math.min(letters.length - 1, Math.floor(u * letters.length))];
    let v = VIS[ch]; if (!v) { const rest = letters.slice(letters.indexOf(ch)); const m = rest.match(/[aeiou]/); v = m ? VIS[m[0]] : 'E'; }
    const env = Math.sin(Math.PI * K.clamp((t - w.start + 0.02) / (w.end - w.start + 0.05)));
    return { talk: K.clamp((o.gain || 1) * (0.45 + 0.55 * env)), viseme: v };
  };
  // deterministic blinks: one every 2.2-4.6 s, 0.11 s long
  A.blink = function (seed, t) {
    const r = K.rng(seed * 977 + 13); let x = r() * 2;
    while (x < t + 0.2) { if (t >= x && t < x + 0.11) return 1; x += 2.2 + r() * 2.4; }
    return 0;
  };

  // ------------------------------------------------------------------ sims
  A.run = id => K.ep1sim.get(id);
  A.ev = function (id, type, f = null) {
    const e = A.run(id).events.find(x => x.type === type && (!f || f(x)));
    if (!e) throw new Error(`animatic: event ${type} not in ${id}`);
    return e.tSim;
  };
  A.map = (simAnchor, tAnchor, N = 1) => t => simAnchor + (t - tAnchor) * N;
  // an adapter with the K.sim.ring interface expected by the kit's highway (sim seconds in, open road = no wrap)
  A.adapter = function (id) {
    const run = A.run(id);
    return { N: run.N, p: { L: run.p.geometry === 'ring' ? run.p.L : 1e9 }, at: ts => run.atSim(ts), brake: (i, ts) => run.brakeSim(i, ts), raw: run };
  };
  // the close-up state for car i of a run at sim time ts (same fields as E.closeState, so E.drawCloseup can draw it)
  A.closeState = function (id, i, ts, o = {}) {
    const run = A.run(id), S = run.atSim(ts), v = S.v[i];
    let acc = 0, w = 0;
    for (let k = 0; k < 10; k++) { const a = run.atSim(ts - k * 0.03).a[i], ww = Math.exp(-k / 4); acc += a * ww; w += ww; }
    const stop = o.tStop ?? null;
    return { run, tau: ts, S, v, aS: acc / w, x: S.x[i] + (o.dx || 0), gapL: i + 1 < run.N ? S.x[i + 1] - S.x[i] - 4.5 : 999, gapF: i > 0 ? S.x[i] - S.x[i - 1] - 4.5 : 999,
      bL: i + 1 < run.N ? run.brakeSim(i + 1, ts) : 0, bM: run.brakeSim(i, ts), bF: i > 0 ? run.brakeSim(i - 1, ts) : 0, leadI: i + 1, follI: i - 1, tStop: stop };
  };

  // ------------------------------------------------------------------ helpers for acting
  A.ramp = (t, a, d = 0.2) => K.ease.sine(K.clamp((t - a) / d));            // 0 -> 1 from a over d seconds
  A.pulse = (t, a, d = 0.2, hold = 0.5, out = 0.2) => A.ramp(t, a, d) * (1 - A.ramp(t, a + d + hold, out));
  A.after = (t, a) => t >= a;
  // pose switches without pops (clothes / acting QC 2026-10-16): instead of «pose: t > T ? 'b' : 'a'» (one-frame jump of
  // arms, sleeves and straps) the pose blends a -> b over d seconds centred on T (or on a value crossing a threshold)
  A.pz = (t, T, a, b, d = 0.2) => { const k = K.clamp((t - (T - d / 2)) / d); return k <= 0 ? { pose: a } : k >= 1 ? { pose: b } : { pose: a, blend: { pose: b, k: K.ease.sine(k) } }; };
  // expression change without a one-frame snap (Guardian v3): the face eases a -> b over d seconds centred on T
  A.ez = (t, T, a, b, d = 0.14) => { const k = K.clamp((t - (T - d / 2)) / d); return k <= 0 || a === b ? { expr: a } : k >= 1 ? { expr: b } : { expr: a, exprBlend: { expr: b, k: K.ease.sine(k) } }; };
  // expression sequence: keys = [[T, expr], ...] (first T ignored), each change eased over d (A.ez)
  A.ezs = (t, keys, d = 0.14) => { let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    if (i + 1 < keys.length && t > keys[i + 1][0] - d / 2) return A.ez(t, keys[i + 1][0], keys[i][1], keys[i + 1][1], d);
    if (i > 0 && t < keys[i][0] + d / 2) return A.ez(t, keys[i][0], keys[i - 1][1], keys[i][1], d);
    return { expr: keys[i][1] }; };
  // acting sequence (Guardian v3): keys = [[T, { pose, expr, view, look, lean, tilt, ... }], ...] in time order (the first T
  // is ignored). Instead of an if / else chain that snaps pose, face and limbs in one frame, each boundary blends the
  // pose (A.pz), the face (A.ez), numeric fields (lean, tilt, headTurn, look) and front / 3/4 / profile views over d s.
  const TURNV = { front: 0, q: 0.55, side: 1 };
  A.seq = function (t, keys, d = 0.2) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    let a = i, b = i, k = 0;
    if (i + 1 < keys.length && t > keys[i + 1][0] - d / 2) { b = i + 1; k = (t - (keys[b][0] - d / 2)) / d; }
    else if (i > 0 && t < keys[i][0] + d / 2) { a = i - 1; k = (t - (keys[i][0] - d / 2)) / d; }
    const A0 = keys[a][1], B0 = keys[b][1];
    if (a === b || k <= 0) return Object.assign({}, A0);
    if (k >= 1) return Object.assign({}, B0);
    const e = K.ease.sine(K.clamp(k)), o = Object.assign({}, e < 0.5 ? A0 : B0);
    const pa = A0.pose || 'stand', pb = B0.pose || 'stand';
    o.pose = pa; o.blend = pa === pb ? null : { pose: pb, k: e };
    if ((A0.expr || 'neutral') !== (B0.expr || 'neutral')) { o.expr = A0.expr || 'neutral'; o.exprBlend = { expr: B0.expr || 'neutral', k: e }; }
    for (const f of ['lean', 'tilt', 'headTurn']) if (f in A0 || f in B0) o[f] = K.lerp(A0[f] || 0, B0[f] || 0, e);
    if (A0.look || B0.look) { const la = A0.look || [0, 0], lb = B0.look || [0, 0]; o.look = [K.lerp(la[0], lb[0], e), K.lerp(la[1], lb[1], e)]; }
    const va = A0.view || 'front', vb = B0.view || 'front';
    if (va !== vb && (A0.dir || 1) === (B0.dir || 1) && (TURNV[va] ?? (typeof va === 'number' ? va : null)) !== null && (TURNV[vb] ?? (typeof vb === 'number' ? vb : null)) !== null)
      o.view = K.lerp(TURNV[va] ?? va, TURNV[vb] ?? vb, e);
    return o;
  };
  A.pzv = (v, th, a, b, w = 1.0) =>   /* Guardian v3 (2): default = the pose follows the whole 0..1 travel of v (th 0.5); a narrow band on a fast ramp is a one-frame snap */ { const k = K.clamp((v - (th - w / 2)) / w); return k <= 0 ? { pose: a } : k >= 1 ? { pose: b } : { pose: a, blend: { pose: b, k: K.ease.sine(k) } }; };

  // ------------------------------------------------------------------ overlays (screen space, design units)
  // art review 2026-10: the explainer paper (graphs, diagrams, thought panels on paper). It used to be a flat '#efe8da' fill;
  // now it is lit illustrated paper in the channel's finish: warm light pool from the upper left, a cool shade lower right,
  // gouache mottle + paper fibres (baked once), and a slow drifting light so the frame is never static (ART_BIBLE §7b).
  let paperL = null;
  A.paper = function (ctx, t = 0, o = {}) {
    if (!paperL) {
      const pc = K.canvas(K.W, K.H), c = pc.ctx;
      c.fillStyle = '#efe8da'; c.fillRect(0, 0, K.W, K.H);
      let g = c.createRadialGradient(560, 260, 80, 560, 260, 1300); g.addColorStop(0, K.rgba('#fff7e6', 0.75)); g.addColorStop(1, K.rgba('#fff7e6', 0)); c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
      g = c.createRadialGradient(1700, 1040, 60, 1700, 1040, 1100); g.addColorStop(0, K.rgba('#b9a888', 0.42)); g.addColorStop(1, K.rgba('#b9a888', 0)); c.fillStyle = g; c.fillRect(0, 0, K.W, K.H);
      K.tex.paint(pc, { amount: 0.32, mottle: { w: 1200, h: 680, sx: 0.003, sy: 0.018, seed: 271, amp: 34 } });
      const r = K.rng(272); c.lineCap = 'round';
      for (let k = 0; k < 2600; k++) { const x = r() * K.W, y = r() * K.H, l = 4 + r() * 18, a = (r() - 0.5) * 0.9; c.strokeStyle = K.rgba(r() < 0.5 ? '#fffaf0' : '#a8987c', 0.10 + r() * 0.08); c.lineWidth = 0.8 + r() * 1.2;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
      paperL = pc;
    }
    ctx.drawImage(paperL.c, 0, 0);
    if (o.still) return;
    const lx = 620 + Math.sin(t * 0.21) * 120, ly = 300 + Math.sin(t * 0.17 + 1) * 60;   // drifting window light
    K.light.glow(ctx, lx, ly, 900, '#fff1d0', 0.16 + 0.03 * Math.sin(t * 0.5), 'soft-light');
  };
  A.label = function (ctx, text, a = 1, o = {}) { if (a > 0.01) K.light.speedLabel(ctx, text, Object.assign({ alpha: a }, o)); };

  // ------------------------------------------------------------------ continuity: Eli's badge (Guardian 2026-10-16)
  // Script: Eli pins the «SI SE ABRE UN HUECO, CIÉRRALO» badge on at «¡Mi lema!» (block D1) and only takes it off in the
  // glovebox gag (block E2). Blocks that set def.eliBadge draw it on every front / 3/4 Eli automatically (it used to
  // vanish in D2 and E1). Drawn right after Eli, so a car door drawn later still covers it.
  const HIGH = { crossed: 1, clasp: 1, think: 1, chin: 1, pointSelf: 1, belly: 1 };
  A.installBadge = function () {
    if (K.cast.draw.__badge) return;
    const d0 = K.cast.draw;
    const d1 = function (ctx, id, x, y, u, o = {}) {
      const r = d0.call(this, ctx, id, x, y, u, o);
      const v = String(o.view || 'front');
      if (r && r.head) { r.head.view = v; r.head.dir = o.dir || 1; }   // the badge card reads them: on the yellow tee between the open flannel panels
      if (A._autoBadge && (id === 'eli1' || id === 'eli') && !o.noBadge && !o.backView && !v.startsWith('back') && v !== 'side' && K.props && K.props.badgeCard && r && r.head && r.head[2] > 0) {
        // the card slides between its two heights with the pose blend (it used to jump at k = 0.5: Guardian v3)
        const hA = HIGH[o.pose || 'stand'] ? 1 : 0, hB = o.blend ? (HIGH[o.blend.pose] ? 1 : 0) : hA;
        K.props.badgeCard(ctx, r.head, u, 0, ctx.globalAlpha, K.lerp(hA, hB, o.blend ? K.clamp(o.blend.k) : 0));
      }
      return r;
    };
    d1.__badge = 1; K.cast.draw = d1;
  };

  // ------------------------------------------------------------------ silent characters: text boxes (2026-10-16)
  // Producer: Eli and Mila have no voices; every line they had is a text box (art/lib/textbox.js, ART_BIBLE §3c). The
  // lines come from the word timings (speaker eli / mila, grouped by line id), so a box covers exactly the slot the voice
  // had (the voice agent keeps the slots), and stays up for max(slot, 0.4 s + 0.06 s per character). Each frame the kit
  // reports where Eli's / Mila's heads were drawn (screen design units); a shot may also register a head itself
  // (A.speaker) when it draws a character through its own transform. Off-screen speaker: the box sits at a corner with
  // no tail. Style per line (kind, preferred side, position) in A.LINES.
  // ids = script_parse segment ids of the David C v5 voice (2026-10-29: #2 and #4 are new narrator segments, so every
  // character line from beat 4 on moved up by one or two; ?anchors=1 lists any id here that the word file does not have)
  A.LINES = {
    b03_02_eli: { kind: 'shout' }, b04_07_mila: {}, b04_08_eli: {}, b06_12_eli: {}, b07_15_eli: { kind: 'shout' },
    b09_20_eli: {}, b10_23_eli: { kind: 'shout' }, b12_26_eli: { kind: 'shout' }, b13_29_eli: {}, b14_31_eli: {},
    b17_35_eli: { kind: 'shout' }, b17_37_mila: {}, b17_38_eli: { kind: 'whisper', side: -1 }, b18_41_eli: { side: -1 }, b18_42_mila: {},
    b19_45_eli: {}, b21_49_eli: { kind: 'shout' }, b21_51_eli: { kind: 'shout' }, b23_56_eli: { kind: 'whisper' },
    b23_57_mila: {},   // v5: no end-screen tag (bend_58_eli removed)
  };
  A.lineList = function () {
    if (A._lineList) return A._lineList;
    const by = {};
    for (const w of A.words) if (w.speaker === 'eli' || w.speaker === 'mila') {
      const L = by[w.line] = by[w.line] || { id: w.line, speaker: w.speaker, start: w.start, end: w.end, words: [] };
      L.start = Math.min(L.start, w.start); L.end = Math.max(L.end, w.end); L.words.push(w.text);
    }
    A._lineList = Object.values(by).map(L => Object.assign(L, { text: L.words.join(' ') }, A.LINES[L.id] || {}));
    // director 2026-10-29: fully visible (between pop-in and pop-out) for >= K.tbox.readTime, and never shorter than the slot
    for (const L of A._lineList) { const pin = K.tbox.POP_IN(L.kind || 'speech'); L.need = K.tbox.readTime(L.text); L.show0 = L.start - 0.06;
      L.full0 = L.show0 + pin; L.full1 = Math.max(L.full0 + L.need, L.end + 0.05) + 1 / 30;   // + 1 frame: the 30 fps sampling never shaves the minimum
      L.show1 = L.full1 + K.tbox.POP_OUT; }
    return A._lineList;
  };
  A.speaker = function (who, head, o = {}) { const p = A._heads && A._heads[who]; if (head && A._heads) A._heads[who] = Object.assign({ head, light: p && p.light, body: p && p.body, pinned: true }, o); };
  A.installHeads = function () {
    if (K.cast.draw.__heads) return;
    const d0 = K.cast.draw;
    const d1 = function (ctx, id, x, y, u, o = {}) {
      const r = d0.call(this, ctx, id, x, y, u, o);
      const who = id === 'eli1' || id === 'eli' ? 'eli' : id === 'mila1' ? 'mila' : null;
      if (who && A._heads && r && r.head && r.head[2] > 0 && ctx.canvas.isConnected && ctx.globalAlpha > 0.5 && !(A._heads[who] && A._heads[who].pinned)) {
        const m = ctx.getTransform(), S = K.OUTSCALE || 1, k = Math.hypot(m.a, m.b) / S;
        const hx = (m.a * r.head[0] + m.c * r.head[1] + m.e) / S, hy = (m.b * r.head[0] + m.d * r.head[1] + m.f) / S;
        const li = o.light || {}, rim = String(li.rim || '#ffd88f'), bl = parseInt(rim.slice(5, 7), 16) || 0, rd = parseInt(rim.slice(1, 3), 16) || 0;
        const light = bl > rd + 20 ? 'night' : (li.rimA != null && li.rimA < 0.5) ? 'noon' : 'golden';
        const fy = (m.b * x + m.d * y + m.f) / S, fx = (m.a * x + m.c * y + m.e) / S, hr = r.head[2] * k;
        if (hx > -200 && hx < K.W + 200 && hy > -200 && hy < K.H + 200) A._heads[who] = { head: [hx, hy, hr], light, body: [Math.min(hx, fx) - hr * 1.6, hy + hr, Math.max(hx, fx) + hr * 1.6, Math.max(fy, hy + hr * 2)] };
      }
      return r;
    };
    d1.__heads = 1; d1.__badge = d0.__badge; K.cast.draw = d1;
  };
  A.drawLines = function (ctx, t, def, S) {
    if (A._noSay) return;
    if (A._demo) {   // style sheet: ?tbdemo=kind:who:text|kind:who:text (boxes at rest, anchored to the heads in this frame)
      const H = A._heads || {}, av = Object.values(H).map(x => [x.head[0] - x.head[2] * 1.2, x.head[1] - x.head[2] * 1.8, x.head[0] + x.head[2] * 1.2, x.head[1] + x.head[2] * 1.25]);
      for (const [kind, who, text, side] of A._demo) { const h = H[who];
        const r = K.tbox.draw(ctx, { text, kind, head: h ? h.head : null, light: S.tbLight || def.tbLight || (h && h.light) || 'golden', age: 1.2, avoid: av, side: side ? Number(side) : undefined });
        if (r) av.push([r.full[0] - 16, r.full[1] - 16, r.full[2] + 16, r.full[3] + 16]); }
      return;
    }
    const H = A._heads || {}, avoid = [];
    for (const k in H) { const h = H[k].head; avoid.push([h[0] - h[2] * 1.2, h[1] - h[2] * 1.8, h[0] + h[2] * 1.2, h[1] + h[2] * 1.25]); }
    if (S.label) avoid.push([20, 10, 640, 120]);                 // the shot's label pill (top left; 2026-10-29: no speed labels left)
    if (A._srcZone) avoid.push(A._srcZone.slice());              // the study citation (bottom left, drawn by the shot's overlay)
    const soft = Object.values(H).filter(x => x.body).map(x => x.body);   // the characters' bodies: avoided when there is room
    avoid.push(...(S.sayAvoid || []));                           // per shot: important action the boxes must not cover
    for (const L of A.lineList()) {
      if (t < L.show0 || t > L.show1 || L.show1 < def.t0 || L.show0 > def.t1) continue;
      const h = H[L.speaker], ov = (S.say && S.say[L.id]) || {};
      const out = K.clamp((t - (L.show1 - 0.16)) / 0.16);
      const rr = K.tbox.draw(ctx, Object.assign({ text: L.text, kind: L.kind || 'speech', head: h ? h.head : null, light: ov.light || S.tbLight || def.tbLight || (h && h.light) || 'golden',
        age: t - L.show0, a: 1 - out, out, avoid, soft, side: L.side || (h && h.side), at: L.at || (h ? null : [K.W * 0.27, K.H * 0.2]) }, ov));
      if (rr) avoid.push([rr.full[0] - 16, rr.full[1] - 16, rr.full[2] + 16, rr.full[3] + 16]);   // two boxes never overlap
    }
  };

  // ------------------------------------------------------------------ the camera: breathing on top of each shot
  // push 2-3 % (in/out alternating by shot), drift <= 1.2 % of the width, own phase per shot (seeded by its id).
  function seedOf(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  A.breath = function (S, k, lt, dur) {
    const r = K.rng(seedOf(S.id)), ph = r() * K.TAU, ph2 = r() * K.TAU, dirIn = S.pushDir ?? (k % 2 === 0 ? 1 : -1);
    const push = S.push ?? 0.024, drift = S.drift ?? 0.007, u = K.ease.sine(K.clamp(lt / Math.max(0.5, dur)));
    const z = (S.zBase ?? 1.03) * (1 + push * (dirIn > 0 ? u : 1 - u));
    const dx = drift * K.W * Math.sin(ph + lt * (0.35 + r() * 0.25)) * 0.8, dy = drift * K.H * 0.6 * Math.sin(ph2 + lt * (0.3 + r() * 0.2));
    return { z, dx, dy };
  };

  // ------------------------------------------------------------------ block = scene
  A.blocks = {};
  A.block = function (name, def) {
    A.blocks[name] = def;
    let shots = null, cues = null, buf = null;
    K.scene('ep001_' + name, {
      async setup(ctx, opts) {
        await A.load(opts && opts.timings);
        A._anchors = opts && opts.anchors ? [] : null;
        A._demo = opts.tbdemo ? opts.tbdemo.split('|').map(x => x.split(':')) : null;
        A._bySpk = {}; for (const w of A.words) (A._bySpk[w.speaker] = A._bySpk[w.speaker] || []).push(w);
        A.installBadge();
        A.installHeads();
        if (def.setup) await def.setup(ctx, opts);
        shots = def.shots(A).map((s, k) => Object.assign({ k }, s));
        // director 2026-10-29: a text box never crosses a cut. Each box lives in the shot where it opens (a box that opens in
        // the last 0.2 s of a shot belongs to the next one when that does not cut an earlier box); the cut after it moves to
        // just after the box's pop-out and the later cuts cascade (each shot keeps >= max(0.7 s, its minDur)).
        A._cutMoves = [];
        if (!(opts && opts.nocutfix)) {
          const MIN = 0.7, lo = new Array(shots.length).fill(-1e9);   // lo[k]: shot k must not end before this (boxes inside it)
          const move = (j, to, why) => { if (j >= shots.length || shots[j].start >= to) return; A._cutMoves.push({ why, shot: shots[j].id, from: +(shots[j].start - def.t0).toFixed(3), to: +(to - def.t0).toFixed(3) }); shots[j].start = to;
            for (let i = j + 1; i < shots.length; i++) { const need = shots[i - 1].start + Math.max(MIN, shots[i - 1].minDur || 0); if (shots[i].start < need) { A._cutMoves.push({ why: 'cascade', shot: shots[i].id, from: +(shots[i].start - def.t0).toFixed(3), to: +(need - def.t0).toFixed(3) }); shots[i].start = need; } } };
          for (const L of A.lineList().filter(q => q.start >= def.t0 && q.start < def.t1).sort((p, q) => p.show0 - q.show0)) {
            let k = -1; for (let j = 0; j < shots.length; j++) if (shots[j].start <= L.show0) k = j;
            if (k + 1 < shots.length && shots[k + 1].start - L.show0 < 0.2 && lo[k] <= L.show0 - 0.02 && L.show0 - 0.02 - shots[k].start >= MIN) { A._cutMoves.push({ why: L.id + ' opens at the cut', shot: shots[k + 1].id, from: +(shots[k + 1].start - def.t0).toFixed(3), to: +(L.show0 - 0.02 - def.t0).toFixed(3) }); shots[k + 1].start = L.show0 - 0.02; k++; }
            lo[k] = Math.max(lo[k], L.show1 + 0.02);
            if (k + 1 < shots.length) move(k + 1, L.show1 + 0.02, L.id);
            else if (L.show1 > def.t1) A._cutMoves.push({ why: L.id, shot: 'BLOCK END', over: +(L.show1 - def.t1).toFixed(3) });
          }
        }
        for (let k = 0; k < shots.length; k++) shots[k].end = k + 1 < shots.length ? shots[k + 1].start : def.t1;
        for (const s of shots) if (!(s.end > s.start)) throw new Error(`animatic: shot ${s.id} has no duration (${s.start} -> ${s.end})`);
        cues = (def.cues ? def.cues(A) : []).concat(...shots.map(s => (typeof s.cues === 'function' ? s.cues(A, s) : s.cues) || []));
        A.current = { shots, cues, def };
      },
      draw(ctx, tv, frame) {
        const t = def.t0 + tv;                 // block-local video time -> episode time (narration time)
        A._autoBadge = !!def.eliBadge;
        A._heads = {}; A._srcZone = null;
        ctx.fillStyle = '#120c18'; ctx.fillRect(0, 0, K.W, K.H);   // never keep pixels from the previous frame
        let k = shots.findIndex(s => t >= s.start && t < s.end); if (k < 0) k = t < shots[0].start ? 0 : shots.length - 1;
        const S = shots[k], lt = t - S.start, dur = S.end - S.start;
        const drawShot = (c, Sx, kx) => {
          const ltx = t - Sx.start, b = Sx.breath === false ? { z: 1, dx: 0, dy: 0 } : A.breath(Sx, kx, ltx, Sx.end - Sx.start), f = Sx.focus || [K.W / 2, K.H / 2];
          c.save(); c.translate(f[0] + b.dx, f[1] + b.dy); c.scale(b.z, b.z); c.translate(-f[0], -f[1]);
          Sx.draw(c, t, ltx, Sx, frame);
          c.restore();
          if (Sx.over) Sx.over(c, t, ltx, Sx, frame);        // screen-space overlays (labels, pills)
          if (Sx.label) { const L = typeof Sx.label === 'function' ? Sx.label(t, ltx) : Sx.label; if (L) A.label(c, L, K.clamp(ltx / 0.15)); }
        };
        drawShot(ctx, S, k);
        // dissolve in (S.xf seconds): draw the previous shot underneath, this one on top with alpha
        if (S.xf && lt < S.xf && k > 0) {
          buf = buf || K.canvas(ctx.canvas.width, ctx.canvas.height);
          const m = ctx.getTransform(); buf.ctx.setTransform(m);
          buf.ctx.globalAlpha = 1; buf.ctx.globalCompositeOperation = 'source-over';
          buf.ctx.drawImage(ctx.canvas, 0, 0, K.W, K.H);     // this shot
          drawShot(ctx, shots[k - 1], k - 1);                 // previous shot
          ctx.save(); ctx.globalAlpha = K.ease.sine(lt / S.xf); ctx.drawImage(buf.c, 0, 0, K.W, K.H); ctx.restore();
        }
        A.drawLines(ctx, t, def, S);           // the characters' lines: text boxes, over the shot, under the grade
        A._post = S.post || def.post;
      },
      post(tv) { return A._post || { grain: 0.13, vignette: 0.45, vignetteColor: '#2a1330', bloom: 0.22 }; },
      events() {
        return { block: name, t0: def.t0, t1: def.t1, duration: def.t1 - def.t0,
          shots: shots.map(s => ({ id: s.id, start: +(s.start - def.t0).toFixed(3), end: +(s.end - def.t0).toFixed(3), bg: s.bg || null, label: typeof s.label === 'string' ? s.label : (s.label ? 'dynamic' : null) })),
          cues: cues.map(c => Object.assign({}, c, { t: +(c.t - def.t0).toFixed(3) })).sort((a, b) => a.t - b.t),
          ambience: (def.ambience ? def.ambience(A) : []).map(a => Object.assign({}, a, { t0: +(a.t0 - def.t0).toFixed(3), t1: +(a.t1 - def.t0).toFixed(3) })),
          cutMoves: A._cutMoves || [], lines: A.lineList().filter(L => L.start >= def.t0 && L.start < def.t1).map(L => ({ id: L.id, text: L.text, start: +(L.start - def.t0).toFixed(3), end: +(L.end - def.t0).toFixed(3), show0: +(L.show0 - def.t0).toFixed(3), show1: +(L.show1 - def.t0).toFixed(3), need: +L.need.toFixed(2) })),
          ...(A._anchors ? { anchors: A._anchors, linesMissing: Object.keys(A.LINES).filter(id => !A.words.some(w => w.line === id)) } : {}) };
      },
      duration: def.t1 - def.t0,
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
