/**
 * Fairy actor (EP002, Producer-approved look from the cartridge animatic, 2026-10-03).
 *
 * Procedural, no generated art: a soft blue-white glow, a bright core and two pairs of flapping wings,
 * with a hover bob and a fading sparkle trail. Flies along a smooth path through keyframes.
 * Option C: an own fairy that evokes a guide light, never a copy of a game character.
 * tools/fx/fairy.py is the Python twin used by planning animatics: keep the maths identical.
 */
export interface FairyKey { t: number; x: number; y: number }

export const FAIRY_DEFAULTS = { size: 0.1, color: '#aae1ff', glow: 0.85, flapHz: 6.4, bob: 0.012, trail: 8 };

/** Catmull-Rom through the keyframes, eased in time between keys; holds before the first and after the last. */
export const fairyPath = (keys: FairyKey[], t: number): { x: number; y: number } => {
  if (!keys.length) return { x: 0.5, y: 0.5 };
  if (t <= keys[0].t) return { x: keys[0].x, y: keys[0].y };
  const n = keys.length;
  if (t >= keys[n - 1].t) return { x: keys[n - 1].x, y: keys[n - 1].y };
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const p0 = keys[Math.max(0, i - 1)], p1 = keys[i], p2 = keys[i + 1], p3 = keys[Math.min(n - 1, i + 2)];
  const k = (t - p1.t) / Math.max(1e-6, p2.t - p1.t);
  const u = k * k * (3 - 2 * k);
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return { x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y) };
};

/** Position with hover bob (in frame fractions) at time t. */
export const fairyAt = (keys: FairyKey[], t: number, bob = FAIRY_DEFAULTS.bob) => {
  const p = fairyPath(keys, t);
  return { x: p.x + 0.4 * bob * Math.sin(t * 2.3), y: p.y + bob * Math.sin(t * 3.7) };
};

/** Wing opening 0.2..1 at time t. */
export const fairyFlap = (t: number, hz = FAIRY_DEFAULTS.flapHz) => 0.6 + 0.4 * Math.sin(t * hz * 2 * Math.PI);
