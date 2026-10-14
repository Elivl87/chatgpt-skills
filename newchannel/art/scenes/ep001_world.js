/* Ep 001 (phantom traffic jams) · shared world: palettes per mood, the highway IDM run that drives the wide shot, the
   close-up and the sound bed, and the cast (deterministic personas). */
(function (root) {
  const K = root.K;
  const E = K.ep1 = {};

  E.PAL = {
    golden: {
      sky: [[0, '#5d6aa3'], [0.28, '#b48aa8'], [0.55, '#f0a77f'], [0.8, '#ffc98a'], [1, '#ffe2a8']],
      sun: '#fff4d6', halo: '#ffcf86', haze: '#ffd9a0', far: '#c99a9a', mid: '#a5788a', near: '#6f5a74',
      grass: '#7f8a4c', grassFar: '#cdb072', field: '#d9a85c', field2: '#a3a65c', road: '#5b5266', roadFar: '#b99a96',
      line: '#f3e2bd', shadow: '#3c2a52', rim: '#ffd88f', tree: '#4e6b4a', treeDark: '#2f3a44',
      grade: '#ff9a5a', vignette: '#2a1330',
    },
    night: {
      sky: [[0, '#0b1030'], [0.45, '#18214d'], [0.8, '#2c3366'], [1, '#463f6e']],
      haze: '#4a4a7a', far: '#283057', mid: '#1c2347', near: '#121834', grass: '#16203a', road: '#0f1428',
      rim: '#9fb4ff', shadow: '#050816', grade: '#3a4aa0', vignette: '#03040c', moon: '#f6efd8',
    },
    field: {
      sky: [[0, '#8fb0c8'], [0.5, '#e8c9a0'], [1, '#ffd9a0']],
      grass: '#a2a457', grassLight: '#d6c070', grassDark: '#6c7a45', track: '#6b6170', trackLine: '#f1e7cf',
      shadow: '#3a3358', rim: '#ffd99a', tree: '#56794c', treeDark: '#33473f', grade: '#ffb070', vignette: '#2a1a2a',
    },
  };

  // ---- the highway lane: 40 cars on an 800 m closed lane (a stretch of highway with periodic boundary), IDM
  // string-unstable at ~45 km/h. One driver (car 20) taps the brakes at t = 0.6 s; nothing else is scripted.
  E.HW = { N: 40, L: 800, v0: 22, T: 1.0, a: 0.5, b: 1.5, s0: 2, carLen: 4.5, timeScale: 2, fps: 30, preroll: 3, duration: 20,
    taps: [{ car: 20, t: 0.6, dur: 1.2, decel: 5 }] };
  E.MASCOT = 8; E.LEADER = 9;
  let hw = null;
  E.highway = () => (hw = hw || K.sim.ring(E.HW));
  // oncoming lane: free flow, sparse
  let onc = null;
  E.oncoming = () => (onc = onc || K.sim.ring({ N: 9, L: 800, v0: 16, T: 1.2, a: 1.0, b: 1.5, s0: 2, timeScale: 2, fps: 30, preroll: 3, duration: 20, jitter: 40, seed: 3 }));

  E.persona = i => K.car.persona(i, 1);

  // the road: gentle S-curves toward the sun
  let road = null;
  E.road = () => (road = road || K.road({ len: 6000, s0: -600, ds: 2, curves: [[0.10, 1400, 0.4], [0.05, 520, 1.3]] }));

  // camera that tracks the mascot (heavily smoothed, non-causal, deterministic)
  E.camS = function (t) {
    const run = E.highway(); let acc = 0, w = 0;
    for (let k = -12; k <= 12; k++) { const tt = t + k * 0.1, ww = Math.exp(-(k * k) / 50); acc += run.at(tt).x[E.MASCOT] * ww; w += ww; }
    return acc / w;
  };
})(typeof window !== 'undefined' ? window : globalThis);
