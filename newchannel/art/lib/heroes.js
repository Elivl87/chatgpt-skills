/* Diez Mil Puntos art kit · heroes: QUEST and PIXIE, the channel's recurring characters (Producer, 2026-10-15).
   They are the Producer's own SecondQuest characters, redrawn 100 % in code in the channel's v2 style. Identity specs
   (binding): secondquest/docs/QUEST_V1_PROMPT_SPEC.md, secondquest/docs/characters/PIXIE_V1_PROMPT_SPEC.md.
   Full guide: art/characters/CHARACTERS.md.

   K.hero.draw(ctx, who, x, y, u, o) -> info
     who  'quest' | 'pixie'
     x,y  ground point between the feet (for seated poses: the seat point under the hips)
     u    px per QUEST head height. Use the same u for both characters: Pixie's scale follows automatically
          (Quest 5.5 heads, Pixie 5.8 heads of 0.901 u = 95 % of Quest's height; Pixie's face = 0.88 x Quest's).
     o    { pose, t, yaw (0 front, +PI/2 faces screen-right, PI back), expr, look:[x,y], blink, talk (0..1 lip flap),
            viseme, headYaw, headPitch, headRoll, armL/armR: { ik:[x,y,z], pole:[x,y,z], hand } | { dir:[[..],[..]] },
            light: K.hero.LIGHT.golden | {...}, fog:[colour,k], noLegs, extras:[..], prop, badge:{text,droop},
            shadow:{ alpha, dx, k } (cast shadow) , contact (contact shadow alpha), seed }
   Body space: x = screen right when facing front, y up (head units from the ground), z toward the viewer.
   Construction: a 2-bone IK skeleton in 3D, rotated by yaw and projected orthographically; the head is a sphere-mapped
   face (features sit at a longitude, so 3/4 and profile turns are continuous); curls / ponytail / drawstrings are
   driven by t (secondary motion). Each body part is a flat fill with the warm ink line, then the scene's light is
   added per part: a flat shade crescent on the side away from the key and a rim on the side toward it (silhouette
   minus itself shifted), exactly like the kit's other characters; then the gouache texture. Deterministic. */
(function (root) {
  const K = root.K;
  const H = K.hero = {};
  const INK = '#24171a';

  // ------------------------------------------------------------------ identity (units: the character's own head heights)
  H.CHARS = {
    quest: {
      id: 'quest', name: 'Quest', heads: 5.5, hh: 1,
      skull: 5.33, chin: 4.33, neckB: 4.16, shJ: 3.94, shTop: 4.2, chest: 3.45, waist: 2.98, hem: 2.55, hipJ: 2.62, knee: 1.46, ankle: 0.38,
      headW: 0.86, headD: 0.98, neckW: 0.3,
      shHalf: 0.66, chestHalf: 0.66, waistHalf: 0.64, hemHalf: 0.56, depth: 0.46, hipHalf: 0.27, stance: 0.07,
      upper: 1.0, fore: 0.9, hand: 0.42,
      sleeve: [0.46, 0.40, 0.37], leg: [0.52, 0.47, 0.5],
      shoe: { L: 1.12, W: 0.56, H: 0.46 },
      face: { eyeL: 0.43, eyeY: 0.07, eyeW: 0.1, eyeH: 0.13, browY: -0.1, browW: 0.13, browT: 0.05, noseY: 0.19, mouthY: 0.32, mouthW: 0.15, iris: 0.74, lashes: 0 },
      col: { skin: '#f2bd94', skinShade: '#cf8a68', lip: '#b8584c', blush: '#ef8a72', freckle: '#a5583a', ear: '#e9a983',
        hair: '#4d2b1b', hairDark: '#2b170f', hairLite: '#8a5638', brow: '#3a1d12', iris: '#5d3318', pupil: '#1b0f0c',
        hood: '#cb3128', hoodDark: '#9f2320', rib: '#b2291f', under: '#34353d', string: '#f6f1e6',
        legs: '#38598e', legsDark: '#253f6c', legsLite: '#6488bf',
        shoe: '#c92c26', shoeDark: '#972019', sole: '#f5efe2', lace: '#ffffff', toe: '#f3ecdf' },
    },
    pixie: {
      id: 'pixie', name: 'Pixie', heads: 5.8, hh: 0.95 * 5.5 / 5.8,
      skull: 5.76, chin: 4.76, neckB: 4.54, shJ: 4.32, shTop: 4.56, chest: 3.86, waist: 3.3, hem: 2.72, hipJ: 2.96, knee: 1.6, ankle: 0.4,
      headW: 0.88 * 0.86 / (0.95 * 5.5 / 5.8), headD: 0.98, neckW: 0.27,
      shHalf: 0.64, chestHalf: 0.68, waistHalf: 0.68, hemHalf: 0.62, depth: 0.42, hipHalf: 0.22, stance: 0.04,
      upper: 1.08, fore: 0.98, hand: 0.42,
      sleeve: [0.47, 0.43, 0.40], leg: [0.36, 0.27, 0.2],
      shoe: { L: 1.02, W: 0.48, H: 0.42 },
      face: { eyeL: 0.45, eyeY: 0.08, eyeW: 0.102, eyeH: 0.138, browY: -0.1, browW: 0.13, browT: 0.042, noseY: 0.21, mouthY: 0.33, mouthW: 0.13, iris: 0.78, lashes: 1 },
      col: { skin: '#d9976a', skinShade: '#b06e4c', lip: '#a64e44', blush: '#e57a64', freckle: '#8a4a2e', ear: '#cc8660',
        hair: '#1d1b24', hairDark: '#0e0d13', hairLite: '#4d5670', brow: '#16141b', iris: '#7a431c', pupil: '#1a0e0a',
        hood: '#1f7d8c', hoodDark: '#155866', rib: '#1a6c79', under: '#2b3036', string: '#f6f1e6',
        legs: '#22222a', legsDark: '#15151b', legsLite: '#4a4a58',
        shoe: '#f6f3ec', shoeDark: '#cfcac0', sole: '#ebe6dc', lace: '#ffffff', toe: '#f6f3ec' },
    },
  };
  H.EXPRESSIONS = ['neutral', 'happy', 'laughing', 'surprised', 'worried', 'annoyed', 'grumpy', 'thinking', 'awe', 'smug', 'sleepy', 'determined'];
  H.POSES = ['stand', 'walk', 'point', 'shrug', 'wave', 'think', 'surprised', 'laugh', 'crossed', 'sit', 'drive', 'awe', 'fists', 'clipboard', 'explain', 'hips'];

  // lighting recipes (ART_BIBLE §5): ang = direction the key comes FROM (screen radians, -PI/2 = from above)
  H.LIGHT = {
    neutral: { ang: -2.1, rim: '#fff6e6', rimA: 0.35, rimW: 0.035, shade: '#4a3a5a', shadeK: 0.22, shadeD: 0.2, amb: null, ambK: 0 },
    golden:  { ang: -1.75, rim: '#ffd88f', rimA: 0.95, rimW: 0.05, shade: '#3c2a52', shadeK: 0.38, shadeD: 0.22, amb: '#ffb27e', ambK: 0.16 },
    backlit: { ang: -1.57, rim: '#ffd88f', rimA: 1.0, rimW: 0.06, shade: '#3c2a52', shadeK: 0.42, shadeD: 0.3, amb: '#e0a0a0', ambK: 0.22 },
    dusk:    { ang: -1.4, rim: '#ffb98a', rimA: 0.9, rimW: 0.05, shade: '#2a1838', shadeK: 0.42, shadeD: 0.24, amb: '#a06a9a', ambK: 0.26 },
    night:   { ang: -2.3, rim: '#a9bcff', rimA: 0.9, rimW: 0.05, shade: '#070a1c', shadeK: 0.45, shadeD: 0.26, amb: '#4a5aa8', ambK: 0.42, dark: 0.18 },
    noon:    { ang: -1.57, rim: '#ffffff', rimA: 0.22, rimW: 0.03, shade: '#4a5266', shadeK: 0.22, shadeD: 0.16, amb: '#cfd6de', ambK: 0.08 },
  };

  // ------------------------------------------------------------------ expressions
  // lid: [upper, lower] closure 0..1; brow: [outer dy, inner dy] (head units, negative = up), browR overrides the right one
  const EX = {
    neutral:   { lid: [0.12, 0.02], brow: [0, 0], mouth: 'soft' },
    happy:     { lid: [0.04, 0.22], brow: [-0.03, -0.035], mouth: 'smileOpen', cheek: 0.35 },
    laughing:  { eye: 'happy', brow: [-0.05, -0.06], mouth: 'laugh', cheek: 0.5 },
    surprised: { lid: [0, 0], eyeS: 1.14, pupil: 0.72, brow: [-0.08, -0.09], mouth: 'O' },
    worried:   { lid: [0.06, 0.08], brow: [0.035, -0.07], mouth: 'wavy', pupil: 0.9 },
    annoyed:   { lid: [0.44, 0.12], brow: [-0.01, 0.055], mouth: 'flat' },
    grumpy:    { lid: [0.5, 0.14], brow: [-0.025, 0.085], mouth: 'frown', puff: 1 },
    thinking:  { lid: [0.16, 0.04], brow: [0.01, 0.03], browR: [-0.075, -0.05], mouth: 'pursed', look: [0.55, -0.7] },
    awe:       { lid: [0, 0], eyeS: 1.1, sparkle: 1, brow: [-0.07, -0.085], mouth: 'o', look: [0, -0.75], cheek: 0.25 },
    smug:      { lid: [0.42, 0.16], brow: [0.01, 0.02], browR: [-0.06, -0.04], mouth: 'smirk', look: [0.35, 0] },
    sleepy:    { lid: [0.72, 0.1], brow: [0.035, 0.02], mouth: 'small' },
    determined:{ lid: [0.24, 0.14], brow: [-0.005, 0.07], mouth: 'grit' },
  };
  // lip-flap: deterministic viseme stream (about 10 shapes / s), use with o.talk
  const VIS = ['A', 'E', 'O', 'M', 'A', 'U', 'E', 'X', 'A', 'O', 'F', 'E'];
  H.viseme = (t, seed = 0, rate = 10) => VIS[Math.floor(K.hash(Math.floor(t * rate), seed, 7) * VIS.length)];
  H.blinkAt = (t, seed = 0) => { const p = 3.3 + (seed % 3) * 0.45, u = ((t + seed * 1.37) % p + p) % p; return u < 0.13 ? Math.sin(u / 0.13 * Math.PI) : 0; };

  // ------------------------------------------------------------------ vector helpers (3D, y up)
  const sFof = c => { const m = c.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  const v = (x, y, z) => [x, y, z];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const len = a => Math.hypot(a[0], a[1], a[2]);
  const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const rotY = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
  const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
  const rotZ = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };
  function ik(A, T, l1, l2, pole) {
    let d = sub(T, A), dl = len(d); const mx = (l1 + l2) * 0.999, mn = Math.abs(l1 - l2) + 1e-3;
    const dn = nrm(d); dl = K.clamp(dl, mn, mx);
    const a = (l1 * l1 - l2 * l2 + dl * dl) / (2 * dl), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    let p = sub(pole, mul(dn, dot(pole, dn))); p = nrm(len(p) < 1e-4 ? [0, 0, 1] : p);
    return [add(add(A, mul(dn, a)), mul(p, h)), add(A, mul(dn, dl))];
  }

  // ------------------------------------------------------------------ poses
  // Each pose is f(t, C, o, s) giving arms / legs / body. Points are in "stand space" (y from the ground when standing).
  // arm: { ik: point, pole, hand } or { dir: [upper, fore], hand }; leg: { ik: ankle point (root space), pole } .
  const lm = C => ({   // landmarks (character units)
    chin: v(0, C.chin + 0.02, C.headD * 0.38), chest: v(0, C.chest, C.depth), belly: v(0, C.waist + 0.05, C.depth * 1.05),
    hip: v(0, C.hem + 0.2, 0),
  });
  const standLegs = (C, w = 0) => ({ L: { ik: v(-(C.hipHalf + C.stance + w), C.ankle, 0.02), pole: v(0, 0, 1) }, R: { ik: v(C.hipHalf + C.stance + w, C.ankle, 0.02), pole: v(0, 0, 1) } });
  const relaxed = s => ({ dir: [v(s * 0.16, -1, -0.04), v(s * 0.02, -1, 0.3)], hand: 'relaxed' });
  const POSE = {
    stand: (t, C) => ({ arms: { L: relaxed(-1), R: relaxed(1) }, legs: standLegs(C), crouch: 0.03 }),
    walk: (t, C, o) => {
      const ph = t * (o.walkRate || 5.2), L = {}, A = {};
      for (const s of [-1, 1]) {
        const p = ph + (s > 0 ? Math.PI : 0), sw = Math.sin(p), lift = Math.max(0, Math.cos(p));
        L[s < 0 ? 'L' : 'R'] = { ik: v(s * (C.hipHalf + 0.02), C.ankle + lift * 0.22, sw * 0.5), pole: v(0, 0.2, 1) };
        const a = -sw * 0.5;   // arms opposite to the legs
        A[s < 0 ? 'L' : 'R'] = { dir: [v(s * 0.16, -Math.cos(a), Math.sin(a)), v(s * 0.08, -Math.cos(a + 0.45), Math.sin(a + 0.45))], hand: 'relaxed' };
      }
      return { arms: A, legs: L, crouch: 0.05, bob: Math.abs(Math.cos(ph)) * 0.05 - 0.03, bow: 0.04 };
    },
    point: (t, C, o) => {
      const a = o.aim ?? 0.12, az = o.aimZ ?? 0.25, d = nrm(v(Math.cos(a), Math.sin(a), az));
      return { arms: { L: relaxed(-1), R: { dir: [d, d], hand: 'point' } }, legs: standLegs(C), crouch: 0.03, lean: -0.03 };
    },
    shrug: (t, C) => ({ arms: { L: { ik: v(-1.12, C.shJ - 0.5, 0.5), pole: v(-0.3, -1, -0.3), hand: 'palmUp' }, R: { ik: v(1.12, C.shJ - 0.5, 0.5), pole: v(0.3, -1, -0.3), hand: 'palmUp' } },
      legs: standLegs(C), crouch: 0.03, lift: 0.16, head: { roll: 0.14 }, expr: 'annoyed' }),
    wave: (t, C) => { const w = 0.15 + 0.42 * Math.sin(t * 9);
      return { arms: { L: relaxed(-1), R: { dir: [nrm(v(0.62, 0.45, 0.15)), nrm(v(Math.sin(w), Math.cos(w), 0.15))], hand: 'open' } }, legs: standLegs(C), crouch: 0.03, lean: -0.04, expr: 'happy' }; },
    think: (t, C) => { const L = lm(C);
      return { arms: { R: { ik: add(L.chin, v(0.06, -0.04, 0.06)), pole: v(0.5, -1, 0), hand: 'fistUp' }, L: { ik: v(0.22, C.waist + 0.15, C.depth + 0.25), pole: v(-1, -0.6, 0.2), hand: 'fist' } },
        legs: standLegs(C), crouch: 0.03, head: { roll: -0.09, pitch: 0.08 }, expr: 'thinking' }; },
    surprised: (t, C) => ({ arms: { L: { ik: v(-0.95, C.shJ + 0.05, 0.55), pole: v(-1, -1, 0), hand: 'open' }, R: { ik: v(0.95, C.shJ + 0.05, 0.55), pole: v(1, -1, 0), hand: 'open' } },
      legs: standLegs(C, 0.04), crouch: 0.02, bow: -0.08, expr: 'surprised' }),
    laugh: (t, C) => { const L = lm(C);
      return { arms: { L: { ik: add(L.belly, v(-0.28, 0, 0.12)), pole: v(-1, -0.4, -0.2), hand: 'relaxed' }, R: { ik: add(L.belly, v(0.3, 0.1, 0.12)), pole: v(1, -0.4, -0.2), hand: 'relaxed' } },
        legs: standLegs(C), crouch: 0.05, bow: -0.12, bob: Math.abs(Math.sin(t * 16)) * 0.04, head: { pitch: 0.18, roll: 0.05 * Math.sin(t * 8) }, expr: 'laughing' }; },
    crossed: (t, C) => ({ arms: { R: { ik: v(-0.36, C.chest - 0.36, C.depth + 0.36), pole: v(1, -1, 0.15), hand: 'tuck' }, L: { ik: v(0.38, C.chest - 0.26, C.depth + 0.3), pole: v(-1, -1, 0.15), hand: 'tuck' } },
      legs: standLegs(C, 0.03), crouch: 0.03, head: { roll: 0.06 }, expr: 'annoyed' }),
    hips: (t, C) => ({ arms: { L: { ik: v(-0.66, C.hem + 0.25, 0.08), pole: v(-1, 0, -0.6), hand: 'fist' }, R: { ik: v(0.66, C.hem + 0.25, 0.08), pole: v(1, 0, -0.6), hand: 'fist' } },
      legs: standLegs(C, 0.08), crouch: 0.03, expr: 'annoyed' }),
    sit: (t, C) => ({ seat: 0.34,
      legs: { L: { ik: v(-(C.hipHalf + 0.12), C.ankle - 0.05, 1.55), pole: v(-0.1, 1, 0.3) }, R: { ik: v(C.hipHalf + 0.12, C.ankle - 0.05, 1.5), pole: v(0.1, 1, 0.3) } },
      arms: { L: { ik: v(-0.55, C.hipJ + 0.55, 1.2), pole: v(-1, -0.4, 0), hand: 'relaxed' }, R: { ik: v(0.55, C.hipJ + 0.55, 1.2), pole: v(1, -0.4, 0), hand: 'relaxed' } }, bow: 0.12 }),
    drive: (t, C, o) => ({ seat: 0.0,
      legs: { L: { ik: v(-(C.hipHalf + 0.06), -0.95, 1.7), pole: v(0, 1, 0.4) }, R: { ik: v(C.hipHalf + 0.06, -0.95, 1.7), pole: v(0, 1, 0.4) } },
      arms: { L: { ik: o.wheelL || v(-0.3, C.chest - 0.45, C.depth + 0.95), pole: v(-1, -1, 0), hand: 'grip' }, R: { ik: o.wheelR || v(0.3, C.chest - 0.45, C.depth + 0.95), pole: v(1, -1, 0), hand: 'grip' } }, bow: 0.08 }),
    ride: (t, C) => ({ seat: 0.0,   // passenger: hands in the lap
      legs: { L: { ik: v(-(C.hipHalf + 0.06), -0.95, 1.7), pole: v(0, 1, 0.4) }, R: { ik: v(C.hipHalf + 0.06, -0.95, 1.7), pole: v(0, 1, 0.4) } },
      arms: { L: { ik: v(-0.25, C.hipJ + 0.15, 0.95), pole: v(-1, -0.3, 0), hand: 'relaxed' }, R: { ik: v(0.25, C.hipJ + 0.15, 0.95), pole: v(1, -0.3, 0), hand: 'relaxed' } }, bow: 0.04 }),
    awe: (t, C) => ({ arms: { L: { dir: [nrm(v(-0.35, -0.92, 0.12)), nrm(v(-0.25, -0.55, 0.55))], hand: 'open' }, R: { dir: [nrm(v(0.35, -0.92, 0.12)), nrm(v(0.25, -0.55, 0.55))], hand: 'open' } },
      legs: standLegs(C), crouch: 0.02, bow: -0.06, head: { pitch: 0.38 }, expr: 'awe' }),
    fists: (t, C) => ({ arms: { L: { ik: v(-0.36, C.chest - 0.18 + Math.sin(t * 14) * 0.02, C.depth + 0.5), pole: v(-1, -1, -0.1), hand: 'fistUp' }, R: { ik: v(0.36, C.chest - 0.18 - Math.sin(t * 14) * 0.02, C.depth + 0.5), pole: v(1, -1, -0.1), hand: 'fistUp' } },
      legs: standLegs(C, 0.16), crouch: 0.07, bow: 0.04, expr: 'determined' }),
    clipboard: (t, C) => ({ arms: { L: { ik: v(-0.12, C.chest - 0.5, C.depth + 0.5), pole: v(-1, -1, 0), hand: 'hold' }, R: { ik: v(0.12 + Math.sin(t * 9) * 0.02, C.chest - 0.42, C.depth + 0.62), pole: v(1, -1, 0), hand: 'pencil' } },
      legs: standLegs(C), crouch: 0.03, head: { pitch: -0.1 }, prop: 'clipboard', expr: 'neutral' }),
    explain: (t, C) => ({ arms: { L: relaxed(-1), R: { ik: v(0.85 + Math.sin(t * 3) * 0.05, C.waist + 0.45 + Math.sin(t * 5.5) * 0.06, 0.7), pole: v(1, -1, -0.2), hand: 'palmUp' } },
      legs: standLegs(C), crouch: 0.03, head: { roll: -0.06 }, expr: 'happy' }),
  };

  // ------------------------------------------------------------------ canvases
  let BUF = null, SCR = null, PAT = null;
  function buf(w, h) {
    if (!BUF || BUF.w < w || BUF.h < h) { const W = Math.max(w, BUF ? BUF.w : 0), Hh = Math.max(h, BUF ? BUF.h : 0); BUF = K.canvas(W, Hh); SCR = K.canvas(W, Hh); }
    return BUF;
  }
  function pattern(c) {
    if (!PAT) { PAT = K.tex.mottleCanvas({ w: 256, h: 256, sx: 0.06, sy: 0.06, seed: 41, amp: 55 }); }
    return c.createPattern(PAT.c, 'repeat');
  }

  // ------------------------------------------------------------------ the main entry
  H.draw = function (ctx, who, x, y, u, o = {}) {
    const C = H.CHARS[who]; if (!C) throw new Error('unknown hero ' + who);
    const t = o.t || 0, seed = o.seed ?? (who === 'quest' ? 1 : 2), hh = C.hh, U = u * hh;   // U = px per this character's head height
    const m = ctx.getTransform(), sF = Math.hypot(m.a, m.b) || 1, P = U * sF;                // P = device px per head unit
    const poseA = (POSE[o.pose || 'stand'] || POSE.stand)(t, C, o);
    const bk = o.blend ? K.clamp(o.blend.k) : 0, poseB = bk > 0 ? (POSE[o.blend.pose] || POSE.stand)(t, C, o) : null;
    const num = (key, d = 0) => { const a = poseA[key] ?? d, b2 = poseB ? (poseB[key] ?? d) : a; return K.lerp(a, b2, bk); };
    const pose = Object.assign({}, poseA, { crouch: num('crouch'), bob: num('bob'), lean: num('lean'), bow: num('bow'), twist: num('twist'), lift: num('lift') });
    if (poseB && bk >= 0.5) { pose.expr = poseB.expr; pose.prop = poseB.prop; }
    if (poseA.seat !== undefined || (poseB && poseB.seat !== undefined)) pose.seat = K.lerp(poseA.seat ?? 0, poseB ? (poseB.seat ?? 0) : (poseA.seat ?? 0), bk);
    const hA = poseA.head || {}, hB = poseB ? (poseB.head || {}) : hA;
    pose.head = { yaw: K.lerp(hA.yaw || 0, hB.yaw || 0, bk), pitch: K.lerp(hA.pitch || 0, hB.pitch || 0, bk), roll: K.lerp(hA.roll || 0, hB.roll || 0, bk) };
    const arms = { L: o.armL || poseA.arms.L, R: o.armR || poseA.arms.R }, armsB = poseB ? { L: o.armLB || o.armL || poseB.arms.L, R: o.armRB || o.armR || poseB.arms.R } : null;
    const legsSpec = poseA.legs, legsB = poseB ? poseB.legs : null;
    const L = Object.assign({}, H.LIGHT.neutral, o.light || {});
    const yaw = o.yaw || 0;
    const breath = Math.sin(t * 2.1 + seed) * 0.012;
    const small = K.clamp((45 - u * sFof(ctx)) / 30);   // 0 at >= 45 px per head, 1 at <= 15 px

    // ---- skeleton -----------------------------------------------------------------------------------
    const crouch = pose.crouch || 0, seated = pose.seat !== undefined || o.seat !== undefined;
    const hipY = seated ? (o.seat ?? pose.seat ?? 0) + 0.22 + (pose.bob || 0) : C.hipJ - crouch + (pose.bob || 0);
    const hipC = v(0, hipY, 0), hipStand = v(0, C.hipJ, 0);
    const lean = (pose.lean || 0) + (o.lean || 0), bow = (pose.bow || 0) + (o.bow || 0), twist = (pose.twist || 0) + (o.twist || 0);
    const UB = p => add(rotZ(rotX(rotY(sub(p, hipStand), twist), -bow), lean), hipC);     // stand space -> root space (upper body)
    const ve = o.view || 0, cE = Math.cos(ve), sE = Math.sin(ve);   // camera elevation (looking down): far points rise on screen
    const toScr = p => { const r = rotY(p, yaw); return [r[0] * P, (-r[1] * cE + r[2] * sE) * P, r[2]]; };   // root space -> buffer px (origin = ground point)
    const lift = pose.lift || 0;
    const J = { arm: {}, leg: {} };
    for (const s of [-1, 1]) {
      const side = s < 0 ? 'L' : 'R', A = arms[side];
      const sh = v(s * C.shHalf * 0.8, C.shJ - 0.06 + lift * 0.6, 0);
      const armJ = A => { if (A.ik) return ik(sh, A.ik, C.upper, C.fore, A.pole || v(s, -1, 0)); const e = add(sh, mul(nrm(A.dir[0]), C.upper)); return [e, add(e, mul(nrm(A.dir[1]), C.fore))]; };
      let [el, wr] = armJ(A);
      if (armsB) { const [e2, w2] = armJ(armsB[side]); el = add(el, mul(sub(e2, el), bk)); wr = add(wr, mul(sub(w2, wr), bk)); }
      J.arm[side] = { sh: UB(sh), el: UB(el), wr: UB(wr), hand: (armsB && bk >= 0.5 ? armsB[side].hand : A.hand) || 'relaxed', s };
      const hp = add(hipC, v(s * C.hipHalf, 0, 0));
      const thigh = C.hipJ - C.knee, shin = C.knee - C.ankle;
      let Lt3 = legsSpec[side].ik; if (legsB) Lt3 = add(Lt3, mul(sub(legsB[side].ik, Lt3), bk));
      const [kn, an] = ik(hp, Lt3, thigh, shin, legsSpec[side].pole || v(0, 0, 1));
      J.leg[side] = { hp, kn, an, s };
    }
    const neck = UB(v(0, C.neckB - 0.06, 0.02)), headC = UB(v(0, C.chin + 0.5, 0.04));
    const hd = Object.assign({ yaw: 0, pitch: 0, roll: 0 }, pose.head || {});
    const headYaw = yaw + twist + hd.yaw + (o.headYaw || 0), headPitch = hd.pitch + (o.headPitch || 0) + bow * 0.4, headRoll = hd.roll + (o.headRoll || 0) + lean;

    // ---- projected joints + buffer bbox ------------------------------------------------------------
    const pts = [];
    const S2 = p => { const q = toScr(p); pts.push(q); return q; };
    const sa = {}, sl = {};
    for (const side of ['L', 'R']) {
      const a = J.arm[side]; sa[side] = { sh: S2(a.sh), el: S2(a.el), wr: S2(a.wr), hand: a.hand, s: a.s };
      const l = J.leg[side]; sl[side] = { hp: S2(l.hp), kn: S2(l.kn), an: S2(l.an), s: l.s };
    }
    const sNeck = S2(neck), sHead = S2(headC);
    const tor = { N: S2(UB(v(0, C.neckB, 0))), T: S2(UB(v(0, C.shTop, 0))), S: S2(UB(v(0, C.shJ, 0))), C: S2(UB(v(0, C.chest, 0))), W: S2(UB(v(0, C.waist, 0))), Hm: S2(UB(v(0, C.hem, 0))) };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const q of pts) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
    const pad = P * 1.6;
    x0 = Math.floor(x0 - pad); x1 = Math.ceil(x1 + pad); y0 = Math.floor(y0 - pad * 1.1); y1 = Math.ceil(Math.max(y1, 0) + pad * 0.6);
    if (who === 'pixie') { x0 -= Math.ceil(P * 1.2); x1 += Math.ceil(P * 1.2); y1 += Math.ceil(P * 0.8); }
    const bw = x1 - x0, bh = y1 - y0;
    if (bw < 2 || bh < 2 || bw > 6000 || bh > 6000) return null;
    const B = buf(bw, bh), b = B.ctx, Sx = SCR.ctx;
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.globalAlpha = 1; b.clearRect(0, 0, bw + 2, bh + 2);
    const ORG = [-x0, -y0];
    b.setTransform(1, 0, 0, 1, ORG[0], ORG[1]);

    // ---- colour pipeline (ambient tint + fog) -------------------------------------------------------
    const fog = o.fog;
    const col = c => { let r = c; if (L.amb && L.ambK) r = K.mix(r, K.tint(r, L.amb), L.ambK * 1.6); if (L.dark) r = K.mix(r, '#000000', L.dark * 0.5); if (fog) r = K.mix(r, fog[0], fog[1]); return r; };
    const CC = {}; for (const k in C.col) CC[k] = col(C.col[k]);
    const ink = fog ? K.mix(INK, fog[0], fog[1] * 0.8) : INK;
    const lw = Math.max(0.8, P * 0.034);
    const ld = [Math.cos(L.ang), Math.sin(L.ang)];
    let EXW = 0, PM = false;                       // EXW: outline expansion; PM: path-only mode (build a clip path)
    const F = c => { if (PM) return; c.fill(); if (EXW) c.stroke(); };
    const beginP = c => { if (!PM) c.beginPath(); };
    const clipTo = (c, shape) => { PM = true; c.beginPath(); shape(c); PM = false; c.clip(); };
    const area = q => { let a = 0; for (let i = 0; i < q.length; i++) { const p0 = q[i], p1 = q[(i + 1) % q.length]; a += p0[0] * p1[1] - p1[0] * p0[1]; } return a; };
    const blobCW = (c, q) => {                    // smooth closed curve, always clockwise (so unions clip correctly)
      if (area(q) < 0) q = q.slice().reverse();
      const n = q.length, Pq = i => q[(i + n) % n]; beginP(c); c.moveTo(q[0][0], q[0][1]);
      for (let i = 0; i < n; i++) { const p0 = Pq(i - 1), p1 = Pq(i), p2 = Pq(i + 1), p3 = Pq(i + 2);
        c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
      c.closePath();
    };
    // per-part pipeline: ink outline -> flat fill -> details -> shade crescent -> rim
    function part(shape, fill, o2 = {}) {
      b.save(); b.lineJoin = 'round'; b.lineCap = 'round';
      b.fillStyle = b.strokeStyle = o2.ink || ink; EXW = lw; b.lineWidth = 2 * lw; shape(b); EXW = 0;
      b.fillStyle = b.strokeStyle = fill; b.lineWidth = 0.01; shape(b);
      b.restore();
      if (o2.detail) { b.save(); o2.detail(b); b.restore(); }
      if (o2.noLight || o.dbgNoLight) { if (o2.after) { b.save(); o2.after(b); b.restore(); } return; }
      const doShade = L.shadeK > 0 && !o2.noShade, doRim = L.rimA > 0 && !o2.noRim;
      const pass = (color, dx, dy, alpha, mode) => {
        Sx.setTransform(1, 0, 0, 1, 0, 0); Sx.globalCompositeOperation = 'source-over'; Sx.clearRect(0, 0, bw + 2, bh + 2);
        Sx.setTransform(1, 0, 0, 1, ORG[0], ORG[1]); Sx.fillStyle = Sx.strokeStyle = color; Sx.lineWidth = 0.01; Sx.lineJoin = 'round'; shape(Sx);
        Sx.globalCompositeOperation = 'destination-out'; Sx.setTransform(1, 0, 0, 1, ORG[0] + dx, ORG[1] + dy); Sx.fillStyle = Sx.strokeStyle = '#000'; shape(Sx);
        b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = mode; b.globalAlpha = alpha; b.drawImage(SCR.c, 0, 0, bw, bh, 0, 0, bw, bh); b.restore();
      };
      if (doShade) { const d = (o2.shadeD ?? L.shadeD) * P; pass(L.shade, ld[0] * d, ld[1] * d, L.shadeK * (o2.shadeMul ?? 1), 'multiply'); }
      if (doRim) { const d = (o2.rimW ?? L.rimW) * P; pass(L.rim, -ld[0] * d, -ld[1] * d, L.rimA * (o2.rimMul ?? 1), 'source-over'); }
      if (o2.after) { b.save(); o2.after(b); b.restore(); }
    }
    // primitives (they honour EXW for the outline pass)
    const circ = (c, x, y, r) => { beginP(c); r = Math.max(0.01, r); c.moveTo(x + r, y); c.arc(x, y, r, 0, K.TAU); F(c); };
    const ell = (c, x, y, rx, ry, a = 0) => { beginP(c); rx = Math.max(0.01, rx); ry = Math.max(0.01, ry); c.moveTo(x + rx * Math.cos(a), y + rx * Math.sin(a)); c.ellipse(x, y, rx, ry, a, 0, K.TAU); F(c); };
    const blobF = (c, q) => { blobCW(c, q); F(c); };
    // tapered capsule chain through 2D points with radii
    const chain = (c, P2, R, capEnd = true) => {
      for (let i = 0; i < P2.length - 1; i++) {
        const a = P2[i], q = P2[i + 1], dx = q[0] - a[0], dy = q[1] - a[1], l = Math.hypot(dx, dy) || 1e-3, nx = -dy / l, ny = dx / l;
        let quad = [[a[0] + nx * R[i], a[1] + ny * R[i]], [q[0] + nx * R[i + 1], q[1] + ny * R[i + 1]], [q[0] - nx * R[i + 1], q[1] - ny * R[i + 1]], [a[0] - nx * R[i], a[1] - ny * R[i]]];
        if (area(quad) < 0) quad = quad.reverse();
        beginP(c); c.moveTo(quad[0][0], quad[0][1]); for (let k = 1; k < 4; k++) c.lineTo(quad[k][0], quad[k][1]); c.closePath(); F(c);
      }
      for (let i = 0; i < P2.length - (capEnd ? 0 : 1); i++) circ(c, P2[i][0], P2[i][1], R[i]);
    };

    // ---- items, depth sorted --------------------------------------------------------------------------
    const items = [];
    const cy = Math.cos(yaw + twist), sy = Math.sin(yaw + twist);
    const front = cy;                                       // > 0: we see the hoodie front
    // half width of a body slab at yaw
    const hwAt = a => Math.sqrt(Math.pow(a * cy, 2) + Math.pow(C.depth * sy, 2)) * P;

    // legs
    for (const side of ['L', 'R']) {
      if (o.noLegs) break;
      const l = sl[side], A3 = J.leg[side], s = l.s;
      const footF = rotY(v(s * 0.42, 0, 1), yaw);                       // toe direction (slight splay)
      const kneeZ = rotY(A3.kn, yaw)[2], hipZ = rotY(A3.hp, yaw)[2];
      const depth = Math.max(kneeZ, hipZ) * 0.6 + (kneeZ > 0.6 ? 0.4 : -0.35);
      items.push({ z: depth, draw: () => drawLeg(l, footF, s) });
    }
    // torso + hood + neck
    const hoodP = toScr(UB(v(0, C.shTop - 0.16, -C.depth * 0.8)));
    items.push({ z: hoodP[2] * 0.9 - (front > 0 ? 0.25 : -0.02), draw: () => drawHood(hoodP) });
    items.push({ z: -0.02, draw: drawNeck });
    items.push({ z: 0, draw: drawTorso });
    // arms
    for (const side of ['L', 'R']) {
      const a = sa[side], z = Math.max(a.sh[2] + 0.2 * Math.sign(front || 1), a.wr[2] * 0.85, a.el[2] * 0.7);
      items.push({ z, draw: () => drawArm(a, side) });
    }
    // head (+ ponytail as its own item, so it can fall behind or over the back)
    items.push({ z: sHead[2] + 0.3, draw: drawHead });
    if (who === 'pixie') {
      const tie = toScr(UB(add(v(0, C.chin + 0.5, 0.04), v(0.04, 0.44, -0.27))));
      items.push({ z: front > 0 ? hoodP[2] * 0.9 - 0.25 + 0.01 : tie[2] + 0.4, draw: () => drawPony(tie) });
    }
    const prop = o.prop || pose.prop;
    if (prop === 'clipboard') items.push({ z: Math.max(sa.L.wr[2], sa.R.wr[2]) - 0.01, draw: drawClipboard });
    items.sort((p, q) => p.z - q.z);

    // ---- part drawers -----------------------------------------------------------------------------------
    function drawLeg(l, footF, s) {
      const fx = footF[0], fz = footF[2];
      const an = l.an, kn = l.kn, hp = l.hp;
      const R = C.leg.map(w => w * 0.5 * P);
      // shoe first (the trouser hem sits over the collar)
      const sh = C.shoe, pr = Math.abs(fx), sg = fx >= 0 ? 1 : -1;
      const back = K.lerp(sh.W * 0.5, sh.L * 0.3, pr) * P, fwd = K.lerp(sh.W * 0.5, sh.L * 0.7, pr) * P, Hs = sh.H * P;
      const gx = an[0] + sg * pr * 0.06 * P, gy = an[1] + C.ankle * P * 0.95;    // sole line
      const shoePts = () => {
        // profile outline (toe toward +x), morphed with the front dome (|fx| -> 0)
        const prof = [[-back, 0], [-back * 1.02, -Hs * 0.55], [-back * 0.86, -Hs * 1.0], [-back * 0.2, -Hs * 0.92], [fwd * 0.12, -Hs * 1.0], [fwd * 0.55, -Hs * 0.72], [fwd * 0.92, -Hs * 0.5], [fwd * 1.02, -Hs * 0.22], [fwd * 0.96, 0]];
        const W2 = sh.W * 0.5 * P, dome = [[-W2, 0], [-W2 * 1.05, -Hs * 0.4], [-W2 * 0.85, -Hs * 0.82], [-W2 * 0.45, -Hs * 1.0], [0, -Hs * 1.04], [W2 * 0.45, -Hs * 1.0], [W2 * 0.85, -Hs * 0.82], [W2 * 1.05, -Hs * 0.4], [W2, 0]];
        const k = K.smooth(0.15, 0.85, pr);
        return prof.map((p, i) => [gx + sg * K.lerp(dome[i][0], p[0], k), gy + K.lerp(dome[i][1], p[1], k)]);
      };
      const shoeShape = c => { blobF(c, shoePts().concat([[gx, gy + Hs * 0.02]])); };
      part(shoeShape, CC.shoe, { detail: c => {
        c.save(); clipTo(c, shoeShape);
        // sole band
        c.fillStyle = CC.sole; c.fillRect(gx - 3 * P, gy - Hs * 0.26, 6 * P, Hs * 0.4);
        c.strokeStyle = K.rgba(ink, 0.55); c.lineWidth = lw * 0.6; c.beginPath(); c.moveTo(gx - 3 * P, gy - Hs * 0.26); c.lineTo(gx + 3 * P, gy - Hs * 0.26); c.stroke();
        if (who === 'quest') {   // white rubber toe cap
          const tx = gx + sg * K.lerp(0, fwd * 0.82, K.smooth(0.15, 0.85, pr)), ty = gy - Hs * 0.2;
          c.fillStyle = CC.toe; K.ellipse(c, tx, ty, K.lerp(sh.W * 0.36, sh.L * 0.2, pr) * P, Hs * 0.3); c.fill();
          c.strokeStyle = K.rgba(ink, 0.5); c.lineWidth = lw * 0.6; c.stroke();
        } else { c.strokeStyle = K.rgba('#9a958c', 0.6); c.lineWidth = lw * 0.5; c.beginPath(); c.moveTo(gx - 3 * P, gy - Hs * 0.33); c.lineTo(gx + 3 * P, gy - Hs * 0.33); c.stroke(); }
        // laces (visible from the front and the side, not from behind)
        if (fz > -0.25) {
          c.strokeStyle = CC.lace; c.lineWidth = Math.max(0.6, P * 0.035); c.lineCap = 'round';
          const k = K.smooth(0.15, 0.85, pr);
          for (let i = 0; i < 3; i++) {
            const ux = gx + sg * K.lerp(0, fwd * (0.05 + i * 0.17), k), uy = gy - Hs * K.lerp(0.86 - i * 0.14, 0.93 - i * 0.1, k), w = K.lerp(sh.W * 0.18, sh.W * 0.1, k) * P;
            c.beginPath(); c.moveTo(ux - w, uy - w * 0.15 * sg * k); c.lineTo(ux + w, uy + w * 0.15 * sg * k); c.stroke();
          }
          if (who === 'pixie') { c.strokeStyle = K.rgba('#8f8a82', 0.6); c.lineWidth = lw * 0.5; for (let i = 0; i < 3; i++) { const ux = gx + sg * K.lerp(0, fwd * (0.05 + i * 0.17), k), uy = gy - Hs * K.lerp(0.86 - i * 0.14, 0.93 - i * 0.1, k), w = K.lerp(sh.W * 0.18, sh.W * 0.1, k) * P; c.beginPath(); c.moveTo(ux - w, uy + lw); c.lineTo(ux + w, uy + lw); c.stroke(); } }
        }
        c.restore();
      }, shadeD: 0.12, rimW: 0.03 });
      // ankle skin (Pixie: a little tan ankle between leggings and sneaker)
      const anTop = [an[0], an[1] - 0.22 * P];
      if (who === 'pixie') part(c => chain(c, [anTop, [an[0], an[1] + 0.06 * P]], [R[2] * 0.85, R[2] * 0.85]), CC.skin, { shadeD: 0.08 });
      const legEnd = who === 'pixie' ? anTop : [an[0], an[1] - 0.02 * P];
      const legShape = c => chain(c, [hp, kn, legEnd], [R[0], R[1], R[2]], false);
      part(legShape, CC.legs, { detail: c => {
        if (who === 'quest') {   // denim: a hem cuff, a faint seam, a knee crease
          c.save(); clipTo(c, legShape);
          c.strokeStyle = K.rgba(CC.legsLite, 0.55); c.lineWidth = lw * 0.6;
          c.beginPath(); c.moveTo(K.lerp(hp[0], kn[0], 0.1) + l.s * R[0] * 0.55, K.lerp(hp[1], kn[1], 0.1)); c.lineTo(kn[0] + l.s * R[1] * 0.6, kn[1]); c.lineTo(legEnd[0] + l.s * R[2] * 0.6, legEnd[1]); c.stroke();
          c.fillStyle = CC.legsDark; c.save(); c.translate(legEnd[0], legEnd[1]); c.rotate(Math.atan2(legEnd[1] - kn[1], legEnd[0] - kn[0]) - Math.PI / 2);
          c.fillRect(-R[2] * 1.2, -0.17 * P, R[2] * 2.4, 0.05 * P); c.restore();
          c.strokeStyle = K.rgba(CC.legsDark, 0.7); c.lineWidth = lw * 0.6; c.beginPath(); c.moveTo(kn[0] - R[1] * 0.4, kn[1] - 0.05 * P); c.quadraticCurveTo(kn[0], kn[1] + 0.04 * P, kn[0] + R[1] * 0.3, kn[1] - 0.08 * P); c.stroke();
          c.restore();
        } else {                 // leggings: a soft sheen line
          c.save(); clipTo(c, legShape); c.strokeStyle = K.rgba(CC.legsLite, 0.5); c.lineWidth = lw * 0.9;
          c.beginPath(); c.moveTo(hp[0] - l.s * R[0] * 0.3, hp[1] + 0.2 * P); c.lineTo(kn[0] - l.s * R[1] * 0.35, kn[1]); c.lineTo(legEnd[0] - l.s * R[2] * 0.3, legEnd[1] - 0.1 * P); c.stroke(); c.restore();
        }
      }, shadeD: 0.16 });
    }

    function torsoPts() {
      const up = [tor.N[0] - tor.Hm[0], tor.N[1] - tor.Hm[1]], ul = Math.hypot(up[0], up[1]) || 1, px = -up[1] / ul, py = up[0] / ul;   // perpendicular (screen right when upright)
      const at = (q, w, dy = 0) => [[q[0] + px * w, q[1] + py * w + dy], [q[0] - px * w, q[1] - py * w + dy]];
      const br = 1 + breath;
      const n = at(tor.N, hwAt(C.neckW * 0.62)), tp = at(tor.T, hwAt(C.shHalf * 0.6), 0.04 * P), shp = at(tor.S, hwAt(C.shHalf) * br, 0.06 * P), ch = at(tor.C, hwAt(C.chestHalf) * br),
        wa = at(tor.W, hwAt(C.waistHalf) * 1.03), hb = at(tor.Hm, hwAt(C.hemHalf) * 0.98, -0.2 * P), hm = at(tor.Hm, hwAt(C.hemHalf) * 0.9);
      // right side down, then left side up (index 0 = +perp side)
      const R = [n[0], tp[0], shp[0], ch[0], wa[0], hb[0], hm[0]], Lf = [hm[1], hb[1], wa[1], ch[1], shp[1], tp[1], n[1]];
      return { R, Lf, px, py, up: [up[0] / ul, up[1] / ul] };
    }
    function drawTorso() {
      const tp = torsoPts();
      const shape = c => { const p = tp.R.concat(tp.Lf); c.beginPath(); c.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < 5; i++) c.lineTo(p[i][0], p[i][1]); c.lineTo(p[5][0], p[5][1]); c.lineTo(p[6][0], p[6][1]); c.lineTo(p[7][0], p[7][1]); c.lineTo(p[8][0], p[8][1]);
        for (let i = 9; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); c.closePath(); F(c); };
      const smoothShape = c => { blobF(c, tp.R.concat(tp.Lf)); };
      part(smoothShape, CC.hood, { detail: c => torsoDetail(c, tp, smoothShape), shadeD: 0.22 });
      void shape;
    }
    function torsoDetail(c, tp, shape) {
      const fs = Math.max(0, front), [ux, uy] = tp.up, px = tp.px, py = tp.py;
      const fc = q => [q[0] + px * sy * C.depth * 0.88 * P * 0, q[1]];   // front centre follows the turn
      const frontOff = sy * C.depth * 0.9 * P;
      const FC = q => [q[0] + px * frontOff, q[1] + py * frontOff];
      void fc;
      c.save(); clipTo(c, shape);
      // ribbed hem band
      const hm = tor.Hm, hbW = hwAt(C.hemHalf) * 1.2;
      c.fillStyle = CC.rib; c.beginPath();
      c.moveTo(hm[0] + px * hbW - ux * 0.0, hm[1] + py * hbW); c.lineTo(hm[0] - px * hbW, hm[1] - py * hbW);
      c.lineTo(hm[0] - px * hbW + ux * 0.18 * P, hm[1] - py * hbW + uy * 0.18 * P); c.lineTo(hm[0] + px * hbW + ux * 0.18 * P, hm[1] + py * hbW + uy * 0.18 * P); c.closePath(); c.fill();
      c.strokeStyle = K.rgba(ink, 0.7); c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(hm[0] - px * hbW + ux * 0.18 * P, hm[1] - py * hbW + uy * 0.18 * P); c.lineTo(hm[0] + px * hbW + ux * 0.18 * P, hm[1] + py * hbW + uy * 0.18 * P); c.stroke();
      c.strokeStyle = K.rgba(CC.hoodDark, 0.55); c.lineWidth = lw * 0.5;
      for (let k = -6; k <= 6; k++) { const q = [hm[0] + px * k * hbW / 7, hm[1] + py * k * hbW / 7]; c.beginPath(); c.moveTo(q[0] + ux * 0.03 * P, q[1] + uy * 0.03 * P); c.lineTo(q[0] + ux * 0.15 * P, q[1] + uy * 0.15 * P); c.stroke(); }
      if (front > 0.05) {
        // kangaroo pocket
        const p0 = FC([K.lerp(hm[0], tor.W[0], 0.0) + ux * 0.22 * P, hm[1] + uy * 0.22 * P]), p1 = FC([hm[0] + ux * 0.8 * P, hm[1] + uy * 0.8 * P]);
        const wB = 0.5 * C.hemHalf * 1.55 * fs * P, wT = 0.36 * C.hemHalf * 1.55 * fs * P;
        c.strokeStyle = K.rgba(ink, 0.8); c.lineWidth = lw * 0.75; c.fillStyle = K.rgba(CC.hoodDark, 0.18);
        c.beginPath(); c.moveTo(p0[0] - px * wB, p0[1] - py * wB); c.lineTo(p1[0] - px * wT, p1[1] - py * wT); c.quadraticCurveTo(p1[0] + ux * 0.04 * P, p1[1] + uy * 0.04 * P, p1[0] + px * wT, p1[1] + py * wT);
        c.lineTo(p0[0] + px * wB, p0[1] + py * wB); c.fill(); c.stroke();
        c.strokeStyle = K.rgba(ink, 0.6); c.lineWidth = lw * 0.6;   // pocket openings
        for (const s of [-1, 1]) { c.beginPath(); c.moveTo(p1[0] + s * px * wT * 1.02, p1[1] + s * py * wT); c.quadraticCurveTo(p0[0] + s * px * wB * 0.6 + ux * 0.32 * P, p0[1] + uy * 0.32 * P, p0[0] + s * px * wB * 1.02, p0[1] + s * py * wB + uy * 0.06 * P); c.stroke(); }
        // neckline: dark undershirt in the opening, with the hood's collar around it
        const nk = FC([tor.N[0] - ux * 0.02 * P, tor.N[1] - uy * 0.02 * P]), wN = 0.2 * fs * P + 0.03 * P;
        c.fillStyle = CC.under; c.beginPath(); c.moveTo(nk[0] - px * wN, nk[1] - py * wN - uy * 0.06 * P); c.quadraticCurveTo(nk[0] - ux * 0.36 * P, nk[1] - uy * 0.36 * P, nk[0] + px * wN, nk[1] + py * wN - uy * 0.06 * P);
        c.lineTo(nk[0] + px * wN, nk[1] - 0.3 * P); c.lineTo(nk[0] - px * wN, nk[1] - 0.3 * P); c.closePath(); c.fill();
        c.strokeStyle = CC.hoodDark; c.lineWidth = 0.1 * P; c.beginPath(); c.moveTo(nk[0] - px * (wN + 0.08 * P), nk[1] - uy * 0.0); c.quadraticCurveTo(nk[0] - ux * 0.44 * P, nk[1] - uy * 0.44 * P, nk[0] + px * (wN + 0.08 * P), nk[1]); c.stroke();
        c.strokeStyle = K.rgba(ink, 0.85); c.lineWidth = lw * 0.8; c.beginPath(); c.moveTo(nk[0] - px * (wN + 0.02 * P), nk[1] - uy * 0.02 * P); c.quadraticCurveTo(nk[0] - ux * 0.38 * P, nk[1] - uy * 0.38 * P, nk[0] + px * (wN + 0.02 * P), nk[1] - uy * 0.02 * P); c.stroke();
        c.restore();
        // drawstrings: white, hanging from the collar, swinging a little (secondary motion), aglets at the ends
        if (front > 0.15) {
          const sway = Math.sin(t * 2.7 + seed) * 0.06 + lean * 0.9 + (o.stringSwing || 0);
          for (const s of [-1, 1]) {
            const top = [nk[0] + px * s * 0.11 * fs * P - ux * 0.22 * P, nk[1] + py * s * 0.11 * fs * P - uy * 0.22 * P];
            const Ls = 0.82 * P, a = sway + s * 0.03 + Math.sin(t * 3.4 + s + seed) * 0.03;
            const end = [top[0] + Math.sin(a) * Ls, top[1] + Math.cos(a) * Ls];
            const mid = [K.lerp(top[0], end[0], 0.5) + Math.sin(a) * 0.04 * P, K.lerp(top[1], end[1], 0.5)];
            c.lineCap = 'round';
            c.strokeStyle = ink; c.lineWidth = 0.05 * P + lw * 1.4; c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mid[0], mid[1], end[0], end[1]); c.stroke();
            c.strokeStyle = CC.string; c.lineWidth = 0.05 * P; c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mid[0], mid[1], end[0], end[1]); c.stroke();
            c.fillStyle = CC.string; c.strokeStyle = ink; c.lineWidth = lw * 0.7; K.rrect(c, end[0] - 0.035 * P, end[1] - 0.02 * P, 0.07 * P, 0.11 * P, 0.03 * P); c.fill(); c.stroke();
          }
        }
        if (o.badge) drawBadge(c, FC([tor.C[0] + px * 0.32 * P * fs, tor.C[1] + 0.05 * P]));
        return;
      }
      // back: centre seam
      c.strokeStyle = K.rgba(CC.hoodDark, 0.6); c.lineWidth = lw * 0.6; const bc = [tor.C[0] - px * frontOff, tor.C[1]];
      c.beginPath(); c.moveTo(bc[0], tor.T[1] + 0.6 * P); c.lineTo(bc[0] + ux * 0, tor.Hm[1] - 0.2 * P); c.stroke();
      c.restore();
    }
    function drawBadge(c, at) {   // a round pin badge (script prop) that droops with o.badge.droop 0..1
      const r = 0.2 * P, d = o.badge.droop || 0;
      c.save(); c.translate(at[0], at[1]); c.rotate(d * 0.9);
      c.fillStyle = '#f3ecdd'; c.strokeStyle = ink; c.lineWidth = lw * 0.8; K.circle(c, 0, 0, r); c.fill(); c.stroke();
      c.strokeStyle = '#E8553A'; c.lineWidth = r * 0.16; K.circle(c, 0, 0, r * 0.78); c.stroke();
      if (o.badge.text && P > 60) { c.fillStyle = '#1C2433'; c.font = `700 ${r * 0.28}px "Martian Mono"`; c.textAlign = 'center'; c.textBaseline = 'middle';
        const w = String(o.badge.text).split(' '); const half = Math.ceil(w.length / 2);
        c.fillText(w.slice(0, half).join(' '), 0, -r * 0.18, r * 1.5); c.fillText(w.slice(half).join(' '), 0, r * 0.2, r * 1.5); }
      c.restore();
    }
    function drawHood(hp) {
      const fs = front;
      const w = Math.sqrt(Math.pow(0.5 * cy, 2) + Math.pow(0.3 * sy, 2)) * P, hgt = (0.92 - Math.abs(sy) * 0.2) * P;
      // a soft rounded triangle: wide at the top (behind the neck), tapering down the back
      const top = [hp[0], hp[1] - hgt * 0.42];
      const shape = c => { blobF(c, [[top[0] - w, top[1] + hgt * 0.1], [top[0] - w * 0.55, top[1] - hgt * 0.2], [top[0] + w * 0.55, top[1] - hgt * 0.2], [top[0] + w, top[1] + hgt * 0.1], [top[0] + w * 0.4, top[1] + hgt * 0.8], [top[0], top[1] + hgt * 1.0], [top[0] - w * 0.4, top[1] + hgt * 0.8]]); };
      part(shape, fs > 0 ? CC.hoodDark : CC.hood, { detail: c => { if (fs <= 0) { c.save(); clipTo(c, shape); c.strokeStyle = K.rgba(ink, 0.55); c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(top[0] - w * 0.6, top[1] + hgt * 0.05); c.quadraticCurveTo(top[0], top[1] + hgt * 0.5, top[0] + w * 0.6, top[1] + hgt * 0.05); c.stroke(); c.restore(); } }, shadeD: 0.18 });
    }
    function drawNeck() {
      const a = [sNeck[0], sNeck[1] + 0.05 * P], q = [sHead[0], sHead[1] + 0.25 * P];
      part(c => chain(c, [a, q], [C.neckW * 0.5 * P, C.neckW * 0.48 * P]), CC.skin, { shadeD: 0.18, shadeMul: 1.5 });
    }
    function drawArm(a, side) {
      const R = C.sleeve.map(w => w * 0.5 * P);
      const dx = a.wr[0] - a.el[0], dy = a.wr[1] - a.el[1], fl = Math.hypot(dx, dy) || 1e-3, fdx = dx / fl, fdy = dy / fl;
      const cuff = [a.wr[0] - fdx * 0.16 * P, a.wr[1] - fdy * 0.16 * P];
      const sleeve = c => chain(c, [a.sh, a.el, cuff], [R[0], R[1], R[2]]);
      // hand first when it points back into the sleeve? (always after: hands read over the cuff)
      part(sleeve, CC.hood, { detail: c => {
        c.save(); clipTo(c, sleeve);
        c.strokeStyle = K.rgba(CC.hoodDark, 0.7); c.lineWidth = lw * 0.7;   // elbow fold
        c.beginPath(); c.arc(a.el[0], a.el[1], R[1] * 0.7, Math.atan2(fdy, fdx) + 2.2, Math.atan2(fdy, fdx) + 3.4); c.stroke();
        c.restore();
      }, shadeD: 0.18 });
      const cuffShape = c => chain(c, [cuff, [a.wr[0] - fdx * 0.02 * P, a.wr[1] - fdy * 0.02 * P]], [R[2] * 0.96, R[2] * 0.9]);
      part(cuffShape, CC.rib, { shadeD: 0.1, rimW: 0.025 });
      drawHand(a, fdx, fdy);
    }
    function drawHand(a, fdx, fdy) {
      const hl = C.hand * P, kind = a.hand;
      const thumb = a.s * (front >= 0 ? 1 : -1);
      const px = -fdy * thumb, py = fdx * thumb;           // toward the thumb side
      const w = a.wr, ang = Math.atan2(fdy, fdx);
      let shape;
      const at = (along, across) => [w[0] + fdx * along * hl + px * across * hl, w[1] + fdy * along * hl + py * across * hl];
      if (kind === 'open' || kind === 'palmUp') {
        const spread = kind === 'open' ? 0.32 : 0.18;
        shape = c => {
          const pc = at(0.32, 0); ell(c, pc[0], pc[1], hl * 0.34, hl * 0.29, ang);
          for (let i = 0; i < 4; i++) { const da = (i - 1.6) * spread * 0.55, dd = [Math.cos(ang + da), Math.sin(ang + da)], b0 = at(0.5, (i - 1.5) * 0.15);
            const lf = (i === 0 || i === 3 ? 0.36 : 0.44) * hl; chain(c, [b0, [b0[0] + dd[0] * lf, b0[1] + dd[1] * lf]], [hl * 0.085, hl * 0.075]); }
          const t0 = at(0.22, 0.28), ta = ang - thumb * 0.95; chain(c, [t0, [t0[0] + Math.cos(ta) * hl * 0.3 + px * hl * 0.1, t0[1] + Math.sin(ta) * hl * 0.3 + py * hl * 0.1]], [hl * 0.1, hl * 0.085]);
        };
      } else if (kind === 'point') {
        shape = c => { const pc = at(0.28, 0); ell(c, pc[0], pc[1], hl * 0.3, hl * 0.25, ang);
          const b0 = at(0.42, 0.12); chain(c, [b0, at(1.02, 0.12)], [hl * 0.09, hl * 0.08]);
          const t0 = at(0.25, 0.26); chain(c, [t0, at(0.5, 0.3)], [hl * 0.095, hl * 0.085]); };
      } else if (kind === 'fist' || kind === 'fistUp' || kind === 'grip' || kind === 'tuck' || kind === 'hold' || kind === 'pencil') {
        const sz = kind === 'tuck' ? 0.75 : 1;
        shape = c => { const pc = at(0.3 * sz, 0); K.rrect; ell(c, pc[0], pc[1], hl * 0.29 * sz, hl * 0.27 * sz, ang);
          const t0 = at(0.2 * sz, 0.22 * sz); chain(c, [t0, at(0.42 * sz, 0.2 * sz)], [hl * 0.1 * sz, hl * 0.09 * sz]); };
      } else {    // relaxed mitten: palm + curled fingers
        shape = c => { const pc = at(0.34, 0); ell(c, pc[0], pc[1], hl * 0.36, hl * 0.25, ang);
          const t0 = at(0.18, 0.24); chain(c, [t0, at(0.42, 0.3)], [hl * 0.1, hl * 0.085]); };
      }
      part(shape, CC.skin, { shadeD: 0.1, rimW: 0.03, detail: c => {
        if (P < 30) return;
        c.strokeStyle = K.rgba(ink, 0.5); c.lineWidth = lw * 0.55;
        if (kind === 'fist' || kind === 'fistUp' || kind === 'grip') { for (let i = 0; i < 3; i++) { const q = at(0.42, -0.14 + i * 0.12); c.beginPath(); c.arc(q[0], q[1], hl * 0.05, ang - 1.2, ang + 1.2); c.stroke(); } }
        else if (kind === 'relaxed') { for (let i = 0; i < 2; i++) { const q = at(0.5, -0.1 + i * 0.13); c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[0] + fdx * hl * 0.16, q[1] + fdy * hl * 0.16); c.stroke(); } }
        if (kind === 'pencil') { const q0 = at(0.3, -0.1), q1 = at(0.3, -0.1); c.strokeStyle = '#e2b04a'; c.lineWidth = 0.06 * P; c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0] - 0.2 * P, q1[1] - 0.28 * P); c.stroke(); }
      } });
    }

    let headOutline = null;
    // ---- head --------------------------------------------------------------------------------------------
    function drawHead() {
      const S = P;                                    // head unit in px
      const hw = C.headW * 0.5, hdp = C.headD * 0.5, yh = headYaw, sY = Math.sin(yh), cY = Math.cos(yh), pr = Math.abs(sY), sg = sY >= 0 ? 1 : -1;
      const hwY = Math.sqrt(Math.pow(hw * cY, 2) + Math.pow(hdp * sY, 2));
      const fdy = -headPitch * 0.22;                  // features slide up when the head tilts back
      // outline as polar radius r(theta) (screen polar, theta from +x clockwise, y down), blended front -> profile
      const nose = K.smooth(0.55, 0.98, pr), N = 40;
      const rFront = th => { const c = Math.cos(th), s = Math.sin(th); const a = hwY * (s > 0 ? 1 - 0.2 * s * s : 1 - 0.03 * s * s) * (1 + 0.04 * Math.exp(-Math.pow((s - 0.25) / 0.25, 2))), bb = s > 0 ? 0.5 : 0.52; return 1 / Math.sqrt(c * c / (a * a) + s * s / (bb * bb)); };
      const rProf = th => {   // facing +x
        const c = Math.cos(th), s = Math.sin(th), a = (c > 0 ? 0.44 : 0.5) * (C.headD / 0.96), bb = s > 0 ? 0.5 : 0.52;
        let r = 1 / Math.sqrt(c * c / (a * a) + s * s / (bb * bb));
        const g = (x, m, w) => Math.exp(-Math.pow((x - m) / w, 2));
        r += 0.075 * g(th, 0.34, 0.1) - 0.02 * g(th, 0.1, 0.08) + 0.012 * g(th, 0.62, 0.07) - 0.06 * g(th, 1.25, 0.28) - 0.03 * g(th, 1.75, 0.3);
        return r;
      };
      const outline = [];
      for (let i = 0; i < N; i++) {
        const th = i / N * K.TAU;
        const thP = sg > 0 ? th : Math.PI - th;      // mirror for faces turned left
        const r = K.lerp(rFront(th), rProf(thP), nose * (cY > 0 ? 1 : 0.3));
        outline.push([Math.cos(th) * r * S, Math.sin(th) * r * S]);
      }
      const hc = sHead;
      const g2 = c => { c.save(); c.translate(hc[0], hc[1]); c.rotate(headRoll); };
      headOutline = outline;
      const headShape = c => { g2(c); blobF(c, outline); c.restore(); };
      // feature projection on the head: longitude lam, local y (head units). returns [x, y, visibility]
      const FP = (lam, yy, k = 0.88) => { const a = lam + yh; return [Math.sin(a) * hwY * k * S / Math.max(0.6, hwY / hw * 0.9 + 0.1 * cY), (yy + fdy) * S, Math.cos(a)]; };
      const rxAt = yy => hwY * Math.sqrt(Math.max(0.05, 1 - Math.pow(yy / 0.53, 2))) * (yy > 0 ? 1 - 0.2 * Math.pow(yy / 0.5, 2) : 1);
      const FPx = (lam, yy, k = 0.88) => { const a = lam + yh; return [Math.sin(a) * rxAt(yy) * k * S, (yy + fdy) * S, Math.cos(a)]; };
      void FP;
      const E = Object.assign({}, EX[o.expr || pose.expr || 'neutral'] || EX.neutral);
      const fc = C.face;
      const blink = o.blink ?? H.blinkAt(t, seed);
      const look = o.look || E.look || [0, 0];
      // ears: behind the head outline when on the silhouette, over the face when the head is in profile
      const ears = [];
      for (const s of [-1, 1]) { const q = FPx(s * Math.PI / 2 * 1.04, 0.06, 1.0); ears.push({ q, s, back: Math.abs(Math.sin(s * Math.PI / 2 * 1.04 + yh)) > 0.8 && q[2] > -0.6 }); }
      const earShape = (q, s) => c => { g2(c); const er = 0.105 * S, ex = q[0] + s * Math.abs(cY) * 0.025 * S; ell(c, ex, q[1], er * K.lerp(0.7, 0.95, pr), er * 1.3, 0); c.restore(); };
      const earDetail = (q, s) => c => { g2(c); c.strokeStyle = K.rgba(ink, 0.5); c.lineWidth = lw * 0.6; c.beginPath(); c.arc(q[0], q[1], 0.06 * S, -1.2, 1.4); c.stroke(); c.restore(); };
      // hair back layer
      if (who === 'quest') questHairBack(g2, hwY, yh, S, fdy);
      else pixieHairBack(g2, hwY, yh, S, fdy);
      for (const e of ears) if (e.back) part(earShape(e.q, e.s), CC.skin, { detail: earDetail(e.q, e.s), shadeD: 0.06 });
      part(headShape, CC.skin, { shadeD: 0.2, after: c => {
        g2(c);
        // freckles, blush
        const fr = who === 'quest' ? [[-0.36, 0.16], [-0.3, 0.2], [-0.24, 0.155], [-0.4, 0.21], [0.36, 0.16], [0.3, 0.2], [0.24, 0.155], [0.4, 0.21]] : [[-0.35, 0.17], [-0.28, 0.21], [-0.22, 0.165], [0.35, 0.17], [0.28, 0.21], [0.22, 0.165], [-0.06, 0.15], [0.06, 0.15]];
        const blush = (E.cheek || 0) + (who === 'pixie' ? 0.28 : 0.15);
        for (const s of [-1, 1]) { const q = FPx(s * 0.5, 0.2); if (q[2] > 0.1 && S > 14) { c.fillStyle = K.rgba(CC.blush, 0.32 * blush * q[2]); K.ellipse(c, q[0], q[1] + 0.02 * S, 0.1 * S * q[2], 0.055 * S); c.fill(); } }
        if (S > 18) for (const [lam, yy] of fr) { const q = FPx(lam * 1.25, yy + 0.02); if (q[2] > 0.2) { c.fillStyle = K.rgba(CC.freckle, 0.75 * q[2]); K.circle(c, q[0], q[1], Math.max(0.7, 0.017 * S)); c.fill(); } }
        drawFace(c, E, FPx, S, yh, blink, look, pr, sg, cY);
        c.restore();
      } });
      for (const e of ears) if (!e.back && e.q[2] > -0.1) part(earShape(e.q, e.s), CC.skin, { detail: earDetail(e.q, e.s), shadeD: 0.06 });
      if (who === 'quest') questHairFront(g2, hwY, yh, S, fdy, headShape);
      else pixieHairFront(g2, hwY, yh, S, fdy, headShape);
      // extras around the head (kit extras: sweat, puff, anger, sparkle, ticks, bang)
      const ex = (o.extras || []).concat(E.extras || []);
      for (const k of ex) K.char.extra(b, hc[0], hc[1] - 0.05 * S, 0.55 * S, k, k === 'sweat' ? (t * 0.8) % 1 : t, { color: k === 'puff' ? '#fff3df' : k === 'sparkle' ? '#fff3c8' : undefined });
    }
    function drawFace(c, E, FPx, S, yh, blink, look, pr, sg, cY) {
      const fc = C.face;
      if (cY < -0.05) return;
      const eyeS = E.eyeS || 1;
      // brows
      for (const s of [-1, 1]) {
        const br = (s > 0 && E.browR) ? E.browR : E.brow, qi = FPx(s * (fc.eyeL - 0.13), fc.browY + br[1], 0.88 - 0.18 * pr * pr), qo = FPx(s * (fc.eyeL + 0.15), fc.browY + br[0] + 0.02, 0.88 - 0.18 * pr * pr);
        if (Math.min(qi[2], qo[2]) < -0.05) continue;
        const vis = K.clamp((qi[2] + qo[2]) * 2);
        c.strokeStyle = CC.brow; c.lineCap = 'round'; c.lineWidth = fc.browT * S * K.lerp(0.6, 1, vis);
        c.beginPath(); c.moveTo(qi[0], qi[1]); c.quadraticCurveTo((qi[0] + qo[0]) / 2, (qi[1] + qo[1]) / 2 - 0.025 * S, qo[0], qo[1]); c.stroke();
      }
      // eyes
      for (const s of [-1, 1]) {
        const q = FPx(s * fc.eyeL, fc.eyeY, 0.86 - 0.2 * pr * pr); if (q[2] < 0.1) continue;
        const fsx = Math.pow(K.clamp(q[2]), 0.6), ew = fc.eyeW * S * fsx * eyeS, eh = fc.eyeH * S * eyeS;
        const lidT = Math.max(E.lid ? E.lid[0] : 0, blink), lidB = E.lid ? E.lid[1] : 0;
        if (E.eye === 'happy') {     // closed smiling arcs
          c.strokeStyle = ink; c.lineWidth = Math.max(1, 0.035 * S); c.lineCap = 'round'; c.beginPath(); c.arc(q[0], q[1] + eh * 0.35, ew * 1.05, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); continue;
        }
        if (lidT > 0.92) { c.strokeStyle = ink; c.lineWidth = Math.max(1, 0.03 * S); c.lineCap = 'round'; c.beginPath(); c.arc(q[0], q[1] - eh * 0.2, ew * 1.05, Math.PI * 0.18, Math.PI * 0.82); c.stroke();
          if (fc.lashes) { c.beginPath(); c.moveTo(q[0] + s * ew * 0.95, q[1] + eh * 0.12); c.lineTo(q[0] + s * ew * 1.3, q[1] + eh * 0.0); c.stroke(); } continue; }
        c.save();
        K.ellipse(c, q[0], q[1], ew, eh); c.fillStyle = '#fbf7ef'; c.fill(); c.clip();
        // iris + pupil + catchlights
        const ir = eh * 0.66 * fc.iris * (E.pupil || 1) / 0.74, ix = q[0] + look[0] * ew * 0.45 + sg * pr * ew * 0.25, iy = q[1] + look[1] * eh * 0.35 + eh * 0.06;
        c.fillStyle = CC.iris; K.ellipse(c, ix, iy, ir * fsx * 0.95 + ir * 0.05, ir); c.fill();
        c.fillStyle = CC.pupil; K.ellipse(c, ix, iy, ir * 0.5 * fsx + ir * 0.05, ir * 0.55); c.fill();
        c.fillStyle = '#ffffff'; K.circle(c, ix - ir * 0.32, iy - ir * 0.38, ir * (E.sparkle ? 0.38 : 0.3)); c.fill(); K.circle(c, ix + ir * 0.35, iy + ir * 0.35, ir * 0.13); c.fill();
        if (E.sparkle) { K.circle(c, ix + ir * 0.1, iy - ir * 0.55, ir * 0.12); c.fill(); }
        // lids (skin) closing from top / bottom
        if (lidT > 0.01) { c.fillStyle = CC.skin; c.fillRect(q[0] - ew * 2, q[1] - eh * 2, ew * 4, eh * (1 + lidT * 2) - eh * 0.0 - eh * 1 + eh * 2 * lidT + eh * 0); }
        if (lidB > 0.01) { c.fillStyle = CC.skin; c.beginPath(); c.ellipse(q[0], q[1] + eh * (2.1 - lidB * 1.2), ew * 1.4, eh * 1.2, 0, 0, K.TAU); c.fill(); }
        c.restore();
        // upper lid line (heavy), lower lid line (light)
        c.strokeStyle = ink; c.lineCap = 'round';
        const lidY = q[1] - eh + eh * 2 * lidT;
        c.lineWidth = Math.max(1, 0.036 * S);
        if (lidT > 0.01) { const hw2 = ew * Math.sqrt(Math.max(0.08, 1 - Math.pow((lidY - q[1]) / eh, 2))); c.beginPath(); c.moveTo(q[0] - hw2 * 1.02, lidY + eh * 0.04); c.quadraticCurveTo(q[0], lidY - eh * 0.1 * (1 - lidT), q[0] + hw2 * 1.02, lidY + eh * 0.04); c.stroke(); }
        else { c.beginPath(); c.ellipse(q[0], q[1], ew, eh, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
        c.lineWidth = Math.max(0.6, 0.016 * S); c.beginPath(); c.ellipse(q[0], q[1], ew, eh, 0, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
        if (fc.lashes) {   // Pixie: a lash flick at the outer corner
          c.lineWidth = Math.max(0.8, 0.026 * S); const ly = lidT > 0.01 ? lidY + eh * 0.05 : q[1] - eh * 0.3;
          c.beginPath(); c.moveTo(q[0] + s * ew * 0.85, ly); c.quadraticCurveTo(q[0] + s * ew * 1.2, ly - eh * 0.1, q[0] + s * ew * 1.38, ly - eh * 0.32); c.stroke();
        }
      }
      // nose
      const nq = FPx(0, fc.noseY, 0.97);
      if (nq[2] > -0.2 && pr < 0.93) {
        const nx = nq[0] + Math.sin(yh) * 0.05 * S;
        const side = Math.sin(yh) >= 0 ? 1 : -1;
        c.fillStyle = K.rgba(CC.skinShade, 0.55); K.ellipse(c, nx + side * 0.008 * S, nq[1] + 0.012 * S, 0.04 * S, 0.026 * S); c.fill();
        c.strokeStyle = K.rgba(ink, 0.7); c.lineWidth = Math.max(0.7, 0.018 * S); c.lineCap = 'round';
        c.beginPath(); c.moveTo(nx + side * 0.035 * S, nq[1] - 0.03 * S); c.quadraticCurveTo(nx + side * 0.05 * S, nq[1] + 0.02 * S, nx + side * 0.015 * S, nq[1] + 0.03 * S); c.stroke();
        c.fillStyle = K.rgba('#ffffff', 0.4); K.circle(c, nx - side * 0.01 * S, nq[1] - 0.012 * S, 0.012 * S); c.fill();
      } else if (pr >= 0.93) {   // profile nostril
        const q = FPx(0, fc.noseY + 0.02, 1.0); c.strokeStyle = K.rgba(ink, 0.6); c.lineWidth = Math.max(0.7, 0.018 * S); c.beginPath(); c.arc(q[0] + sg * 0.03 * S, q[1], 0.02 * S, 0, Math.PI); c.stroke();
      }
      // mouth
      const mq = FPx(0, fc.mouthY, 0.95);
      if (mq[2] > -0.3) drawMouth(c, E, mq, S, K.clamp(0.35 + 0.65 * Math.max(0, Math.cos(yh))), Math.sin(yh));
    }
    function drawMouth(c, E, mq, S, wk, sY) {
      const fc = C.face, mw = fc.mouthW * S * wk, x = mq[0] + sY * 0.03 * S, y = mq[1];
      let shape = E.mouth || 'soft';
      // lip flap: viseme replaces the open amount
      let vis = null;
      if (o.talk && o.talk > 0.01) vis = o.viseme || H.viseme(t, seed);
      const dark = '#5e1d24', tongue = '#d8676a';
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = ink; c.lineWidth = Math.max(0.9, 0.028 * S);
      const openMouth = (w, h, corner = 0, teeth = true) => {
        c.save(); c.beginPath(); c.moveTo(x - w, y - corner); c.quadraticCurveTo(x, y + corner * 0.4 - h * 0.15, x + w, y - corner);
        c.quadraticCurveTo(x + w * 0.85, y + h, x, y + h * 1.05); c.quadraticCurveTo(x - w * 0.85, y + h, x - w, y - corner); c.closePath();
        c.fillStyle = dark; c.fill(); c.save(); c.clip();
        if (teeth) { c.fillStyle = '#fbf6ee'; c.fillRect(x - w, y - h * 0.5, w * 2, h * 0.42 + h * 0.08); }
        c.fillStyle = tongue; K.ellipse(c, x + w * 0.1, y + h * 1.0, w * 0.55, h * 0.45); c.fill(); c.restore();
        c.stroke(); c.restore();
      };
      if (vis) {
        const a = o.talk;
        const V = { A: [1.0, 0.75], E: [1.15, 0.4], O: [0.65, 0.7], U: [0.45, 0.45], M: [0.85, 0], X: [0.9, 0.05], F: [0.85, 0.2] }[vis] || [0.9, 0.3];
        const smile = ['happy', 'laughing', 'smug', 'awe'].includes(o.expr) ? 0.25 : ['grumpy', 'worried'].includes(o.expr) ? -0.15 : 0;
        if (V[1] * a < 0.08) { c.beginPath(); c.moveTo(x - mw * V[0], y - smile * mw * 0.3); c.quadraticCurveTo(x, y + smile * mw * 0.5, x + mw * V[0], y - smile * mw * 0.3); c.stroke(); return; }
        openMouth(mw * V[0], mw * V[1] * a * 1.1, smile * mw * 0.3, vis !== 'O' && vis !== 'U');
        return;
      }
      switch (shape) {
        case 'soft': c.beginPath(); c.moveTo(x - mw * 0.75, y - 0.01 * S); c.quadraticCurveTo(x, y + mw * 0.32, x + mw * 0.75, y - 0.01 * S); c.stroke(); break;
        case 'smile': c.beginPath(); c.moveTo(x - mw, y - mw * 0.2); c.quadraticCurveTo(x, y + mw * 0.6, x + mw, y - mw * 0.2); c.stroke(); break;
        case 'smileOpen': openMouth(mw * 1.0, mw * 0.55, mw * 0.25); break;
        case 'laugh': openMouth(mw * 1.2, mw * 1.0, mw * 0.3); break;
        case 'O': c.save(); K.ellipse(c, x, y + mw * 0.2, mw * 0.42, mw * 0.55); c.fillStyle = dark; c.fill(); c.clip(); c.fillStyle = tongue; K.ellipse(c, x, y + mw * 0.65, mw * 0.32, mw * 0.25); c.fill(); c.restore(); K.ellipse(c, x, y + mw * 0.2, mw * 0.42, mw * 0.55); c.stroke(); break;
        case 'o': K.ellipse(c, x, y + mw * 0.1, mw * 0.26, mw * 0.32); c.fillStyle = dark; c.fill(); c.stroke(); break;
        case 'wavy': c.beginPath(); c.moveTo(x - mw * 0.8, y + mw * 0.08); for (let i = 1; i <= 6; i++) c.lineTo(x - mw * 0.8 + i * mw * 0.27, y + (i % 2 ? -1 : 1) * mw * 0.1 + mw * 0.04); c.stroke(); break;
        case 'flat': c.beginPath(); c.moveTo(x - mw * 0.65, y + mw * 0.06); c.lineTo(x + mw * 0.6, y - mw * 0.02); c.stroke(); break;
        case 'frown': c.beginPath(); c.moveTo(x - mw * 0.7, y + mw * 0.22); c.quadraticCurveTo(x, y - mw * 0.25, x + mw * 0.7, y + mw * 0.22); c.stroke(); break;
        case 'pursed': c.beginPath(); c.moveTo(x + mw * 0.05, y); c.quadraticCurveTo(x + mw * 0.35, y - mw * 0.12, x + mw * 0.55, y + mw * 0.05); c.stroke(); break;
        case 'smirk': c.beginPath(); c.moveTo(x - mw * 0.6, y + mw * 0.08); c.quadraticCurveTo(x + mw * 0.2, y + mw * 0.22, x + mw * 0.75, y - mw * 0.2); c.stroke(); break;
        case 'small': c.beginPath(); c.moveTo(x - mw * 0.25, y); c.lineTo(x + mw * 0.25, y); c.stroke(); break;
        case 'grit': c.save(); K.rrect(c, x - mw * 0.75, y - mw * 0.12, mw * 1.5, mw * 0.36, mw * 0.14); c.fillStyle = '#fbf6ee'; c.fill(); c.strokeStyle = K.rgba(ink, 0.6); c.lineWidth *= 0.6; c.beginPath(); c.moveTo(x - mw * 0.7, y + mw * 0.06); c.lineTo(x + mw * 0.7, y + mw * 0.06); c.stroke(); c.restore();
          K.rrect(c, x - mw * 0.75, y - mw * 0.12, mw * 1.5, mw * 0.36, mw * 0.14); c.stroke(); break;
      }
      if (E.puff && S > 20) { c.strokeStyle = K.rgba(ink, 0.35); c.lineWidth = Math.max(0.6, 0.014 * S); for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * mw * 1.25, y - mw * 0.1, mw * 0.25, s > 0 ? -0.9 : Math.PI - 0.6, s > 0 ? 0.6 : Math.PI + 0.9); c.stroke(); } }
    }

    // ---- Quest's hair: big dark-brown curls (lobes on an ellipsoid over the skull) -----------------------------
    function curlLobes(hwY, yh, S, fdy) {
      if (curlLobes.cache && curlLobes.key === hwY + ':' + yh + ':' + S + ':' + fdy) return curlLobes.cache;
      const out = [], r = K.rng(77);
      const bounce = Math.sin(t * 2.4 + seed) * 0.008 + (pose.bob || 0) * -0.25 + (o.hairBounce || 0);
      const rings = [[0.42, 22, 0.2], [0.85, 18, 0.2], [1.22, 12, 0.19], [1.48, 5, 0.17], [-0.05, 12, 0.18], [-0.45, 8, 0.16]];
      let k = 0;
      for (const [ph0, n, r0] of rings) for (let j = 0; j < n; j++, k++) {
        const L0 = ((j + (r() - 0.5) * 0.6) / n) * K.TAU - Math.PI, A = wrapA(L0);
        if (ph0 < 0.2 && A < 1.75) continue;                    // low rings only at the back (nape volume)
        const R0 = r0 * (0.85 + r() * 0.35) * (1 + small * 0.25), ext = (ph0 > 1.3 ? 1.0 : 1.07) + r() * (0.05 + small * 0.12) + small * 0.08;
        let phi = ph0 + (r() - 0.5) * 0.2;
        if (A < 1.9) {   // keep the face clear: the lobe's bottom stays above the hairline
          const maxY = -0.5 * Math.sin(hairlineQ(A)) - 0.72 * R0;
          if (-Math.sin(phi) * 0.5 * ext > maxY) phi = Math.asin(K.clamp(-maxY / (0.5 * ext), -1, 1));
        }
        const a = L0 + yh, cp = Math.cos(phi);
        const x = Math.sin(a) * cp * hwY * ext * 1.08 + Math.sin(t * 3.1 + k) * 0.005, y = -Math.sin(phi) * 0.5 * ext - 0.01 + bounce * (1 + Math.sin(phi)) * 0.5, z = Math.cos(a) * cp;
        out.push({ x: x * S, y: (y + fdy * 0.3) * S, z, r: R0 * S, k });
      }
      if (small > 0.15) for (let j = 0; j < 11; j++) {   // small sizes: a scalloped silhouette so the curls still read
        const al = -Math.PI * 0.55 + j / 10 * Math.PI * 1.1, R0 = 0.15 * (1 + small * 0.3);
        out.push({ x: Math.sin(al) * hwY * (1.18 + small * 0.08) * S, y: (-Math.cos(al) * 0.5 * (1.12 + small * 0.06) - 0.02) * S, z: -0.05, r: R0 * S, k: 200 + j });
      }
      // fringe: messy curls over the forehead (bottoms at about y = -0.13, above the brows)
      for (let j = 0; j < 9; j++) {
        const L0 = (j - 4) * 0.19 + (r() - 0.5) * 0.08, R0 = 0.1 + r() * 0.035, a = L0 + yh;
        const yc = -0.135 - R0 + Math.abs(j - 4) * 0.006 + (j === 3 ? 0.03 : 0), phi = Math.asin(K.clamp(-yc / 0.5, -1, 1));
        out.push({ x: Math.sin(a) * Math.cos(phi) * hwY * 1.04 * S, y: (yc + fdy * 0.5 + bounce * 0.6) * S, z: Math.cos(a) * Math.cos(phi) + 0.05, r: R0 * S, k: 100 + j, fringe: true });
      }
      curlLobes.cache = out; curlLobes.key = hwY + ':' + yh + ':' + S + ':' + fdy;
      return out;
    }
    function questHairBack(g2, hwY, yh, S, fdy) {
      const lobes = curlLobes(hwY, yh, S, fdy), back = lobes.filter(l => l.z < 0.15 && !l.fringe);
      const shape = c => { g2(c); for (const l of back) circ(c, l.x, l.y, l.r); c.restore(); };
      part(shape, CC.hair, { detail: c => curlDetail(c, g2, back, S), shadeD: 0.2, rimMul: 1.1 });
    }
    // hairline latitude per longitude (Quest: messy, low fringe; Pixie: clean, pulled back)
    const hairlineQ = A => (A < 0.9 ? 0.32 - A * 0.1 : A < 1.7 ? 0.23 - (A - 0.9) * 0.35 : -0.06 - (A - 1.7) * 0.3);
    const hairlineP = A => (A < 0.8 ? 0.36 - A * 0.06 : A < 1.7 ? 0.31 - (A - 0.8) * 0.36 : -0.02 - (A - 1.7) * 0.3);
    const wrapA = lam => Math.abs(((lam + Math.PI) % K.TAU + K.TAU) % K.TAU - Math.PI);
    function capShape(g2, hwY, yh, S, fdy, headShape, hl, ext) {
      return c => { c.save(); headShape && (c.save(), g2(c), K.blob(c, headOutline), c.restore(), c.clip());
        g2(c); c.beginPath();
        for (let i = 0; i <= 28; i++) { const al = -Math.PI / 2 + i / 28 * Math.PI, ph = hl(wrapA(al - yh));
          const px = Math.sin(al) * Math.cos(ph) * hwY * S * ext, py = (-Math.sin(ph) * 0.5 + fdy * 0.5) * S; i ? c.lineTo(px, py) : c.moveTo(px, py); }
        c.lineTo(hwY * S * 1.6, -S * 1.2); c.lineTo(-hwY * S * 1.6, -S * 1.2); c.closePath(); F(c); c.restore(); c.restore(); };
    }
    function questHairFront(g2, hwY, yh, S, fdy, headShape) {
      const lobes = curlLobes(hwY, yh, S, fdy), fr = lobes.filter(l => l.z >= 0.15 || l.fringe);
      part(capShape(g2, hwY, yh, S, fdy, headShape, hairlineQ, 1.06), CC.hair, { shadeD: 0.16 });
      const shape = c => { g2(c); for (const l of fr) circ(c, l.x, l.y, l.r); c.restore(); };
      part(shape, CC.hair, { ink: CC.hairDark, detail: c => curlDetail(c, g2, fr, S), shadeD: 0.16, rimMul: 1.1 });
    }
    function pixieHairFront(g2, hwY, yh, S, fdy, headShape) {
      const proj = (lam, yy, ext = 1.04) => { const a = lam + yh; return [Math.sin(a) * hwY * ext * S * Math.sqrt(Math.max(0, 1 - yy * yy * 3)), (yy + fdy * 0.5) * S, Math.cos(a)]; };
      part(capShape(g2, hwY, yh, S, fdy, headShape, hairlineP, 1.06), CC.hair, { shadeD: 0.16, detail: c => {
        if (S < 16) return; g2(c);   // sheen: a soft blue-grey band across the crown
        c.strokeStyle = K.rgba(CC.hairLite, 0.55); c.lineWidth = 0.05 * S; c.lineCap = 'round'; c.beginPath();
        for (let i = 0; i <= 10; i++) { const lam = -0.9 + i * 0.18, q = proj(lam, -0.37 + Math.abs(lam) * 0.03); if (q[2] < 0) continue; i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke(); c.restore(); } });
      // side-swept fringe from the part across the forehead
      const fringe = [[0.4, -0.42], [0.1, -0.33], [-0.25, -0.26], [-0.6, -0.17], [-0.82, -0.2], [-0.7, -0.3], [-0.35, -0.38], [0.05, -0.44]].map(([lam, yy]) => proj(lam, yy, 1.05));
      if (fringe.some(q => q[2] > 0.05)) {
        const shape = c => { g2(c); blobF(c, fringe.map(q => [q[0], q[1]])); c.restore(); };
        part(shape, CC.hair, { ink: CC.hair, shadeD: 0.1, detail: c => { if (S < 16) return; g2(c); c.strokeStyle = K.rgba(CC.hairLite, 0.55); c.lineWidth = 0.014 * S; c.lineCap = 'round'; c.beginPath(); const q0 = fringe[1], q1 = fringe[2], q2 = fringe[3]; c.moveTo(q0[0], q0[1] - 0.04 * S); c.quadraticCurveTo(q1[0], q1[1] - 0.05 * S, q2[0], q2[1] - 0.05 * S); c.stroke(); c.restore(); } });
      }
      // two loose strands framing the face (they sway a little)
      for (const s of [-1, 1]) {
        const sw = Math.sin(t * 2.3 + s + seed) * 0.02;
        const pts2 = [proj(s * 0.78, -0.2, 1.05), proj(s * 0.86 + sw, 0.02, 1.06), proj(s * 0.84 + sw * 2, 0.22, 1.06), proj(s * 0.78 + sw * 3, 0.36, 1.04)];
        if (pts2[1][2] < 0.25) continue;
        b.save(); g2(b); b.lineCap = 'round'; b.strokeStyle = CC.hair; b.lineWidth = 0.026 * S;
        b.beginPath(); b.moveTo(pts2[0][0], pts2[0][1]); b.bezierCurveTo(pts2[1][0], pts2[1][1], pts2[2][0], pts2[2][1], pts2[3][0], pts2[3][1]); b.stroke();
        b.strokeStyle = K.rgba(CC.hairLite, 0.5); b.lineWidth = 0.008 * S; b.stroke(); b.restore();
      }
    }
    function curlDetail(c, g2, ls, S) {
      if (S < 18) return;
      g2(c); c.lineCap = 'round';
      for (const l of ls) {
        c.strokeStyle = K.rgba(CC.hairDark, 0.8); c.lineWidth = Math.max(0.7, 0.022 * S);
        c.beginPath(); c.arc(l.x + l.r * 0.1, l.y + l.r * 0.1, l.r * 0.55, 0.4 + l.k, 2.6 + l.k); c.stroke();
        c.strokeStyle = K.rgba(CC.hairLite, 0.75); c.lineWidth = Math.max(0.6, 0.018 * S);
        c.beginPath(); c.arc(l.x - l.r * 0.15, l.y - l.r * 0.2, l.r * 0.5, 3.6, 4.6); c.stroke();
      }
      c.restore();
    }

    // ---- Pixie's hair: sleek black cap, a side part, loose strands framing the face; the ponytail is its own item --
    function pixieHairBack(g2, hwY, yh, S, fdy) {
      const shape = c => { g2(c); ell(c, 0, -0.03 * S, hwY * 1.04 * S, 0.54 * S); c.restore(); };
      part(shape, CC.hair, { shadeD: 0.2, rimMul: 1.1 });
    }

    function drawPony(tie) {
      const S = P, sw = Math.sin(t * 2.0 + seed) * 0.16 + (o.ponySwing || 0) + (o.pose === 'walk' ? Math.sin(t * (o.walkRate || 5.2)) * 0.12 : 0) - lean * 0.8;
      const yb = yaw + twist, side = Math.sin(yb), back = Math.cos(yb);
      // chain in 3D (relative to the tie, character units): up and back, then falling down the back with a swing
      const segs = 7, ptsP = [];
      let p = v(0, 0, 0), dir = nrm(v(0.16, 0.85, -0.5));
      const total = 2.05, step = total / segs;
      for (let i = 0; i <= segs; i++) {
        ptsP.push(p);
        const k = i / segs;
        const sb = Math.abs(Math.sin(yb)), target = nrm(v((0.3 + small * 0.25) * Math.max(0, 1 - sb * 3) * Math.sign(Math.cos(yb)) + Math.sin(sw) * 0.5, -1, -0.72 + 0.4 * sb * sb + Math.cos(sw * 1.3) * 0.05));
        dir = nrm(add(mul(dir, (i < 2 ? 0.6 : 0.22) - k * 0.1), mul(target, (i < 2 ? 0.4 : 0.78) + k * 0.1)));
        p = add(p, mul(dir, step * (i === 0 ? 0.6 : 1)));
      }
      const sc = ptsP.map(q => { const r = rotY(q, yb); return [tie[0] + r[0] * S, tie[1] - r[1] * S, r[2]]; });
      const widths = [0.11, 0.17, 0.2, 0.2, 0.18, 0.14, 0.09, 0.02].map(w => w * S * (1 + small * 0.35));
      const outlineP = [];
      for (let i = 0; i < sc.length; i++) { const a = sc[Math.max(0, i - 1)], q = sc[Math.min(sc.length - 1, i + 1)], dx = q[0] - a[0], dy = q[1] - a[1], l = Math.hypot(dx, dy) || 1; outlineP.push([sc[i][0] - dy / l * widths[i], sc[i][1] + dx / l * widths[i]]); }
      for (let i = sc.length - 1; i >= 0; i--) { const a = sc[Math.max(0, i - 1)], q = sc[Math.min(sc.length - 1, i + 1)], dx = q[0] - a[0], dy = q[1] - a[1], l = Math.hypot(dx, dy) || 1; outlineP.push([sc[i][0] + dy / l * widths[i], sc[i][1] - dx / l * widths[i]]); }
      const shape = c => { blobF(c, outlineP); };
      part(shape, CC.hair, { detail: c => {
        c.save(); clipTo(c, shape);
        c.strokeStyle = K.rgba(CC.hairLite, 0.7); c.lineWidth = Math.max(0.8, 0.035 * S); c.lineCap = 'round';
        c.beginPath(); for (let i = 1; i < sc.length - 1; i++) { const q = sc[i]; i === 1 ? c.moveTo(q[0] - 0.05 * S, q[1]) : c.lineTo(q[0] - 0.06 * S, q[1]); } c.stroke();
        c.strokeStyle = K.rgba(CC.hairDark, 0.8); c.lineWidth = Math.max(0.6, 0.02 * S);
        c.beginPath(); for (let i = 2; i < sc.length; i++) { const q = sc[i]; i === 2 ? c.moveTo(q[0] + 0.07 * S, q[1]) : c.lineTo(q[0] + 0.06 * S, q[1]); } c.stroke();
        c.restore();
        // hair tie
        c.fillStyle = col('#2c3a44'); c.strokeStyle = ink; c.lineWidth = lw * 0.7; K.ellipse(c, sc[0][0], sc[0][1], 0.1 * S, 0.075 * S); c.fill(); c.stroke();
      }, shadeD: 0.16, rimMul: 1.15 });
      void side; void back;
    }

    function drawClipboard() {
      const a = sa.L.wr, q = sa.R.wr, cx = K.lerp(a[0], q[0], 0.35), cy2 = K.lerp(a[1], q[1], 0.4) + 0.05 * P;
      const w = 0.62 * P, h2 = 0.8 * P;
      const shape = c => { c.save(); c.translate(cx, cy2); c.rotate(-0.15); beginP(c); c.rect(-w / 2, -h2 / 2, w, h2); F(c); c.restore(); };
      part(shape, col('#b88a5a'), { detail: c => { c.save(); c.translate(cx, cy2); c.rotate(-0.15);
        c.fillStyle = col('#f7f2e6'); K.rrect(c, -w * 0.42, -h2 * 0.4, w * 0.84, h2 * 0.84, 0.03 * P); c.fill();
        c.fillStyle = col('#8f8a88'); K.rrect(c, -w * 0.2, -h2 * 0.56, w * 0.4, h2 * 0.14, 0.03 * P); c.fill();
        c.strokeStyle = col('#9aa2b4'); c.lineWidth = Math.max(0.6, 0.025 * P); for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-w * 0.3, -h2 * 0.2 + k * h2 * 0.15); c.lineTo(w * (0.3 - (k % 2) * 0.12), -h2 * 0.2 + k * h2 * 0.15); c.stroke(); }
        c.restore(); }, shadeD: 0.12 });
      drawHand(sa.L, 0, 1);
      { const R2 = sa.R, dx = R2.wr[0] - R2.el[0], dy = R2.wr[1] - R2.el[1], l = Math.hypot(dx, dy) || 1; drawHand(R2, dx / l, dy / l); }
    }

    for (const it of items) it.draw();

    // ---- gouache texture inside the figure ---------------------------------------------------------------
    if (P > 14 && !o.dbgNoTex) {
      Sx.setTransform(1, 0, 0, 1, 0, 0); Sx.globalCompositeOperation = 'source-over'; Sx.clearRect(0, 0, bw + 2, bh + 2);
      Sx.fillStyle = pattern(Sx); Sx.fillRect(0, 0, bw, bh); Sx.globalCompositeOperation = 'destination-in'; Sx.drawImage(B.c, 0, 0, bw, bh, 0, 0, bw, bh);
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'soft-light'; b.globalAlpha = 0.3; b.drawImage(SCR.c, 0, 0, bw, bh, 0, 0, bw, bh); b.restore();
    }
    // ---- composite: (cast shadow) + figure ------------------------------------------------------------------
    const dx0 = x + x0 / sF, dy0 = y + y0 / sF;
    if (o.contact !== 0 && !seated && !o.noLegs) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = K.rgba(L.shade, o.contact ?? 0.35);
      K.ellipse(ctx, x, y + 0.02 * U, (C.hipHalf + C.stance + 0.55) * U, 0.14 * U); ctx.fill(); ctx.restore();
    }
    if (o.shadow) {
      const sd = o.shadow;
      Sx.setTransform(1, 0, 0, 1, 0, 0); Sx.globalCompositeOperation = 'copy'; Sx.drawImage(B.c, 0, 0, bw, bh, 0, 0, bw, bh);
      Sx.globalCompositeOperation = 'source-in'; Sx.fillStyle = sd.color || L.shade; Sx.fillRect(0, 0, bw, bh);
      ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, sd.dx ?? 0.6, sd.k ?? -0.35, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = sd.alpha ?? 0.4;
      ctx.drawImage(SCR.c, 0, 0, bw, bh, x0 / sF, y0 / sF, bw / sF, bh / sF); ctx.restore();
    }
    ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.globalAlpha = o.alpha ?? 1;
    if (o.clip) { ctx.beginPath(); o.clip(ctx); ctx.clip(); }
    ctx.drawImage(B.c, 0, 0, bw, bh, dx0, dy0, bw / sF, bh / sF); ctx.restore();
    const back = p => [x + p[0] / sF, y + p[1] / sF];
    return { head: back(sHead), headR: 0.5 * P / sF, hands: { L: back(sa.L.wr), R: back(sa.R.wr) }, top: y + (y0 + pad * 1.1) / sF, neck: back(sNeck) };
  };
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- helpers for cars: Quest drives (left seat, LHD), Pixie rides (right seat).
   K.hero.rearPair(ctx, x, top, s, W, o): rear view (K.car.rear drawDriver hook): both seen from behind, upper body only.
   o: { t, light, fog, quest:{...extra draw opts}, pixie:{...} } */
(function (root) {
  const K = root.K, H = K.hero;
  H.rearPair = function (ctx, x, top, s, W, o = {}) {
    const u = o.u || 0.6 * s, sy = top + (o.seatDy ?? 0.42) * s;
    const base = { t: o.t || 0, light: o.light, fog: o.fog, noLegs: true, contact: 0, seat: 0 };
    H.draw(ctx, 'pixie', x + W * 0.22, sy, u, Object.assign({}, base, { pose: 'ride', yaw: Math.PI + 0.12, seed: 2 }, o.pixie || {}));
    H.draw(ctx, 'quest', x - W * 0.2, sy, u, Object.assign({}, base, { pose: 'drive', yaw: Math.PI - 0.08, seed: 1 }, o.quest || {}));
  };
})(typeof window !== 'undefined' ? window : globalThis);
