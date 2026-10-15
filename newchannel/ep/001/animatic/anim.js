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
    return { N: run.N, p: { L: 1e9 }, at: ts => run.atSim(ts), brake: (i, ts) => run.brakeSim(i, ts), raw: run };
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
        A._bySpk = {}; for (const w of A.words) (A._bySpk[w.speaker] = A._bySpk[w.speaker] || []).push(w);
        if (def.setup) await def.setup(ctx, opts);
        shots = def.shots(A).map((s, k) => Object.assign({ k }, s));
        for (let k = 0; k < shots.length; k++) shots[k].end = k + 1 < shots.length ? shots[k + 1].start : def.t1;
        for (const s of shots) if (!(s.end > s.start)) throw new Error(`animatic: shot ${s.id} has no duration (${s.start} -> ${s.end})`);
        cues = (def.cues ? def.cues(A) : []).concat(...shots.map(s => (typeof s.cues === 'function' ? s.cues(A, s) : s.cues) || []));
        A.current = { shots, cues, def };
      },
      draw(ctx, tv, frame) {
        const t = def.t0 + tv;                 // block-local video time -> episode time (narration time)
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
