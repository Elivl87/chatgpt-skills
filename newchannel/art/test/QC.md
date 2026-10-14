# style_test.mp4 · QC (2026-10-14)

**File:** `art/test/style_test.mp4` · 18.6 s · 1920x1080 · 30 fps · H.264 High (yuv420p), 2-pass at 10.5 Mb/s · AAC
192 kb/s 48 kHz · **24.5 MB** (limit 30 MB) · `+faststart`. Contact sheet: `art/test/contact_sheet.jpg` (one frame
every 0.6 s).

## Edit

| Time | Shot | What drives it |
|---|---|---|
| 0.0–6.0 s | Golden-hour highway, tracking crane with a slow push-in (f 1600 → 2020) | IDM run, 40 cars on an 800 m closed lane, string-unstable at ~45 km/h. Car 20 taps the brakes at 0.6 s. Brake lights switch on car after car back toward the camera (onsets 0.73 s … 5.63 s) until the wave reaches the mascot (car 8) at 6.2 s. Shown at 2× sim speed. |
| 6.0–13.0 s | Close-up of the mascot (side view) | Same run, sim time = video − 0.6 s (a 0.6 s editorial overlap, so the leader's brake onset is seen in the close-up). Leader brakes at 6.23 → surprised; own brake at 6.80 → worried, then focused; stops at 11.50 → annoyed (steam); grumpy at 12.40 (anger mark). Nose dip = simulated deceleration. |
| 13.0–18.6 s | 0.4 s dissolve to the wordmark at dusk | The mascot drops in at 13.45, steps on the dot of "Diez" at 14.05, hops off the M at 14.42, and lands as the dot of the i of "Mil" at 14.82. Tagline at 15.2. Wink at about 16.4. |

## Measurements

| Check | Result | Target |
|---|---|---|
| Integrated loudness (ffmpeg ebur128 on the mp4) | **−14.0 LUFS** | −14 |
| True peak | **−1.5 dBTP** | ≤ −1.0 |
| LRA | 5.8 LU | — |
| blackdetect (d ≥ 0.1 s, pix_th 0.08) | none | none |
| freezedetect (n 0.002, d ≥ 0.5 s) | none | none |
| Streams | h264 1920x1080 yuv420p 30/1, aac; both 18.600 s | — |
| Determinism | frame 90 rendered in a separate process = identical md5 (`df8e2d97…`) | identical |

**Render speed** (4 shared CPUs, no GPU, 2 Chromium workers): 558 frames in **294 s wall**, which is about **0.53 s per
frame effective**. Per worker: the highway and close-up take **≈ 0.52 s/frame**. The wordmark takes **≈ 1.05 s/frame**,
because it blurs the text glow and shadow and draws the rim offscreen on every frame. The page sets up in about 3 s per
worker (sim + cached layers). Encoding (2-pass x264 slow) adds about 2 min. Style frames take 0.6–1.6 s each.

**Sound bed** (`render/sound_test.py`, numpy only, engine helpers imported read-only): a pad in G moves to C for the
title. Under it are wind and road rumble. There is **one marimba note per brake onset**, falling pentatonic as the wave
comes toward the camera (the wave you hear is the wave you see; 12 onsets). The engine hum follows the mascot's
simulated speed. A whoosh covers the cut, and the stop gets a pop, tyres, a thunk and a "hmph". The channel sting falls
on the three wordmark contacts. Mastered with `engine/sound.py master()`.

## Frames I looked at

I read every style frame at full size, the contact sheet, and individual frames 90, 165 and 178 (wide), 6.4, 8.0, 9.5
and 12.3 s (close-up), and 13.2, 14.05 and 17.2 s (title). Things I fixed after looking:
- the sun was hidden behind the far ridge
- a black band appeared above the sky when the horizon moved
- a haze seam appeared in the tiled layers
- shadows were rectangular instead of trunk + canopy
- cars ran off the oval in the ring frame
- the windshield crossed the mascot's face
- the sweat drop never appeared, because a time-vs-progress bug placed it off the head
- the steam puffs read as bokeh, so they got an ink outline
- the wordmark was too wide and its shadows too heavy
- the clouds read as neon stripes

## Honest comparison with the reference

**Where we are close:** big gradient skies with a banded sun halo, god rays, long backlit shadows, layered hazy ridges,
brush mottle and grain, warm grading, rim light on every silhouette, simple round characters with dot eyes, and one
idea per shot. The golden wide shot and the close-up would sit comfortably in the same reel as the reference's
sunset and lakeside frames.

**Where we are still below it:**
1. **Clouds.** The reference paints soft, irregular cloud masses. Ours are capsule banks, softer than v0 but still a
   little "UI-flat" and stripy.
2. **Painterly richness in large flat areas.** Its fields and rock walls carry visible brush strokes and local colour
   shifts. Our near fields are large single-colour polygons with a screen-space mottle that does not move with the
   ground.
3. **Character acting range.** The reference has full bodies, poses and props. We have heads, hands on a wheel and
   faces. That is enough for a driver, but the generic people barely act yet (two expressions).
4. **Night frame.** After this pass the jam is denser (130 cars) and the mascot's small body has a moonlit rim.
   The middle ground is still emptier than the reference's night scenes, and there are no wet-road light streaks yet.
5. **Ring frame.** The car sprites seen from above are readable but blocky (stacked extrusion). The tree line is
   generic.
6. **Motion.** There is no secondary animation on the scenery (no trees swaying in the wide shot, no wheel spin on
   distant cars). Car bob is the only life on the cars.
7. **Wordmark.** Cream letters on a rose sky are lit and readable, but the contrast is only moderate behind "Diez".

## Known gaps

- The close-up uses a 0.6 s editorial overlap of sim time (stated above). The wide shot runs the sim at 2×, and a real
  episode must say so on screen (ACELERADO ×2).
- The overcast-noon recipe is specified in the bible but not drawn yet.
- The wordmark is 2× slower to render than the other scenes (cache the lit letters once per pose to fix it).
