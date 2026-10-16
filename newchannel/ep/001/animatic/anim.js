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
  A.load = async function () {
    if (A.words) return;
    A.words = await (await fetch('../audio/timings_es.json')).json();
    A.words.forEach((w, i) => { w.i = i; w.key = norm(w.word); });
  };
  A.word = function (word, n = 1, o = {}) {
    const key = norm(word);
    const hits = A.words.filter(w => w.key === key && (!o.beat || w.beat === o.beat) && (!o.speaker || w.speaker === o.speaker));
    if (hits.length < n) throw new Error(`animatic: word «${word}» #${n} ${o.beat ? 'in beat ' + o.beat : ''} not found (${hits.length})`);
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

  // ------------------------------------------------------------------ overlays (screen space, design units)
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
      if (A._autoBadge && (id === 'eli1' || id === 'eli') && !o.noBadge && !v.startsWith('back') && v !== 'side' && K.props && K.props.badgeCard && r && r.head && r.head[2] > 0) {
        const pose = (o.blend && o.blend.k > 0.5) ? o.blend.pose : (o.pose || 'stand');
        K.props.badgeCard(ctx, r.head, u, 0, ctx.globalAlpha, !!HIGH[pose]);
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
  A.LINES = {
    b03_02_eli: { kind: 'shout' }, b04_06_mila: {}, b04_07_eli: {}, b06_11_eli: {}, b07_14_eli: { kind: 'shout' },
    b09_18_eli: {}, b10_21_eli: { kind: 'shout' }, b12_24_eli: { kind: 'shout' }, b13_27_eli: {}, b14_29_eli: {},
    b17_33_eli: { kind: 'shout' }, b17_35_mila: {}, b17_36_eli: { kind: 'whisper' }, b18_39_eli: {}, b18_40_mila: {},
    b19_43_eli: {}, b21_47_eli: { kind: 'shout' }, b21_49_eli: { kind: 'shout' }, b23_54_eli: { kind: 'whisper' },
    b23_55_mila: {}, bend_58_eli: { kind: 'shout' },
  };
  A.lineList = function () {
    if (A._lineList) return A._lineList;
    const by = {};
    for (const w of A.words) if (w.speaker === 'eli' || w.speaker === 'mila') {
      const L = by[w.line] = by[w.line] || { id: w.line, speaker: w.speaker, start: w.start, end: w.end, words: [] };
      L.start = Math.min(L.start, w.start); L.end = Math.max(L.end, w.end); L.words.push(w.text);
    }
    A._lineList = Object.values(by).map(L => Object.assign(L, { text: L.words.join(' ') }, A.LINES[L.id] || {}));
    for (const L of A._lineList) { L.show0 = L.start - 0.06; L.show1 = Math.max(L.end, L.start + K.tbox.readTime(L.text)) + 0.12; }
    return A._lineList;
  };
  A.speaker = function (who, head, o = {}) { if (head && A._heads) A._heads[who] = Object.assign({ head, light: A._heads[who] && A._heads[who].light, pinned: true }, o); };
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
        if (hx > -200 && hx < K.W + 200 && hy > -200 && hy < K.H + 200) A._heads[who] = { head: [hx, hy, r.head[2] * k], light };
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
    if (S.label) avoid.push([20, 10, 640, 120]);                 // the shot's label pill (top left)
    avoid.push(...(S.sayAvoid || []));                           // per shot: important action the boxes must not cover
    for (const L of A.lineList()) {
      if (t < L.show0 || t > L.show1 || L.show1 < def.t0 || L.show0 > def.t1) continue;
      const h = H[L.speaker], ov = (S.say && S.say[L.id]) || {};
      const out = K.clamp((t - (L.show1 - 0.16)) / 0.16);
      const rr = K.tbox.draw(ctx, Object.assign({ text: L.text, kind: L.kind || 'speech', head: h ? h.head : null, light: ov.light || S.tbLight || def.tbLight || (h && h.light) || 'golden',
        age: t - L.show0, a: 1 - out, out, avoid, side: L.side || (h && h.side), at: L.at || (h ? null : [K.W * 0.27, K.H * 0.2]) }, ov));
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
        await A.load();
        A._demo = opts.tbdemo ? opts.tbdemo.split('|').map(x => x.split(':')) : null;
        A._bySpk = {}; for (const w of A.words) (A._bySpk[w.speaker] = A._bySpk[w.speaker] || []).push(w);
        A.installBadge();
        A.installHeads();
        if (def.setup) await def.setup(ctx, opts);
        shots = def.shots(A).map((s, k) => Object.assign({ k }, s));
        for (let k = 0; k < shots.length; k++) shots[k].end = k + 1 < shots.length ? shots[k + 1].start : def.t1;
        for (const s of shots) if (!(s.end > s.start)) throw new Error(`animatic: shot ${s.id} has no duration (${s.start} -> ${s.end})`);
        cues = (def.cues ? def.cues(A) : []).concat(...shots.map(s => (typeof s.cues === 'function' ? s.cues(A, s) : s.cues) || []));
        A.current = { shots, cues, def };
      },
      draw(ctx, tv, frame) {
        const t = def.t0 + tv;                 // block-local video time -> episode time (narration time)
        A._autoBadge = !!def.eliBadge;
        A._heads = {};
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
          ambience: (def.ambience ? def.ambience(A) : []).map(a => Object.assign({}, a, { t0: +(a.t0 - def.t0).toFixed(3), t1: +(a.t1 - def.t0).toFixed(3) })) };
      },
      duration: def.t1 - def.t0,
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
