# style_test_v2.mp4 + style frames v2 · QC (2026-10-14)

**File:** `art/test/style_test_v2.mp4` · 18.6 s · 1920x1080 · 30 fps · H.264 High yuv420p, 2-pass 10.5 Mb/s · AAC
192 kb/s 48 kHz · **24.5 MB** (limit 30 MB) · `+faststart`. Contact sheet: `art/test/contact_sheet_v2.jpg`.
Style frames: `art/styleframes/v2/` (a-e, 1920x1080 PNG, 4.4-5.2 MB each because of the film grain), thumbnail B
re-rendered with the new clouds, and the comparison sheet `styleframes/v2/compare_v1_v2.jpg` (v1 | v2 per row, plus
the new frame e). v1 files are kept untouched for reference.

## Edit (same as v1)

0-6 s golden wide shot (IDM run at 2x, now labelled **ACELERADO ×2** top-left in Martian Mono 700 on an ink pill,
fades in over 0.3 s) → 6-13 s close-up (same run, sim = video − 0.6 s) → 0.4 s dissolve → wordmark at dusk.
Sim, cues and sound bed are unchanged and still come from the same arrays (`events()`).

## Measurements

| Check | Result | Target |
|---|---|---|
| Integrated loudness (ffmpeg ebur128 on the mp4) | **−14.0 LUFS** | −14 |
| True peak | **−1.5 dBTP** | ≤ −1.0 |
| LRA | 5.8 LU | — |
| blackdetect / freezedetect | none / none | none |
| Streams | h264 1920x1080 yuv420p 30/1 + aac, both 18.600 s | — |
| Determinism | t = 3.0 s rendered in two processes (one after other frames) = identical md5 `3ff0ffc1720e…` | identical |
| Wordmark contrast (cream letter vs sky) | 3.5:1 in the glow-lit counters, 5.5:1 beside the letters | ≥ 3:1 |

**Render speed** (4 shared CPUs, no GPU, 2 Chromium workers): 558 frames in **195 s wall** (v1: 294 s), about
**0.35 s per frame effective**. Per worker ≈ 0.55 s/frame for the golden wide shot and the close-up (v1: 0.52 — the new
brushwork, clouds, framing and shimmer cost ≈ +5 %), and the wordmark still costs 0.30-0.34 s incl. PNG encode vs 1.3-1.6 s in v1 (**about 4x cheaper, more than halved**: the lit glyphs are baked once into sprites
instead of blurred twice per glyph per frame, and the mascot shadow is a pre-blurred sprite). Single stills incl. PNG
encode: golden 0.56-0.61 s, close-up 0.69-0.74 s, ring 0.41 s, night 0.52 s, toll plaza 0.39-0.43 s. First frame of each
scene adds 0.5-2 s of setup (sim, cached layers, cloud sprites). Encode adds about 2 min.

## What changed per point (and how it looks now)

1. **Clouds**: capsule banks replaced by painterly lobed cumulus sprites (shade mass → body pushed to the light → lit
   caps → sun rim), each lit toward its scene's sun, flat bellies, brush mottle; they drift. Noon variant with lit tops,
   grey bellies and a few lobe contours; night variant moon-rimmed; dusk variant with salmon bellies.
2. **Ground**: the screen-fixed mottle is gone. World-anchored brush dabs per cell (travel with the camera), local
   colour patches inside every field, wildflowers, meadow tufts, a fence along the verge; close-up verge tile with dense
   tufts and flowers, a worn-asphalt tile scrolling with the road; the ring field got soft colour patches, dabs, flowers
   and soil scuffs. Framing: blurred branch + reeds (golden), foreground grass passing in the close-up, branch + reeds
   (ring), branch + grass (toll plaza).
3. **Characters**: `K.char.person`, full body, 10 poses, breathing, sim-driven acting (ring observers point / shrug /
   look up when the jam forms; toll attendants hand the ticket and wave cars off; a supervisor with a clipboard; a
   worker walking). **Mascot**: decided and documented: ink stick arms (and legs outside cars) for beats of acting;
   used for the shrug + fist in the close-up, the shrug in the queue, the point on the night hill.
4. **Top-down cars**: bean footprint, one smooth wall, domed top with highlight and rim, cockpit, windshield, wheels,
   contact shadow, tail lamps with glow and red ground spill.
5. **Night**: headlight cones on the asphalt, wet-road reflection streaks under every lamp, town clusters with halos,
   street-light strings and a blinking mast, a lit farmhouse (warm windows, porch lamp, TV flicker, chimney smoke) and
   smaller farms, fireflies, moon-rimmed drifting clouds, the hill tree sways.
6. **Ambient motion**: cloud drift, tree sway (per tree), grass / reed wind, branch sway, motes, heat shimmer over the
   far road, birds (+ shadows on the ring), cloud shadows crossing the ring field, smoke, flicker, fireflies, windsock,
   breathing characters. No frame of the test is static (freezedetect clean).
7. **Wordmark**: deep violet band behind the letters, darker outline / shadow baked into the glyph sprites, violet
   pool behind the tagline; render cost below half of v1.
8. **Overcast noon**: frame e, a four-lane toll plaza driven by the new `K.sim.queue` (IDM + a barrier that opens after
   a seeded service time; lane 4 free-flow).

## Frames I looked at

Every v2 style frame at full size, the comparison sheet, the contact sheet, crops of the clouds, the ring observers,
and video frames 3.0 (label), 11.9 (shrug) and 13.2 (dissolve). Fixed after looking: bubble-wrap clouds (every lobe
outlined) → mass shading; grey belly circles; clouds cut by the top edge; flowers like confetti; brick-like dabs (shorter,
softer, more varied); people's hands hidden behind the body; hips / think poses; ring observers too small for the cars;
tent too small; toll islands drawn over the cars (depth sort) and the queue never moving (service trigger used a 0.9 m
window while IDM stops 1.6 m short: fixed to s0 + 1 m); booths too small for the cartoon people; tagline contrast.

## Honest comparison with the reference

**Now close:** layered painterly clouds that read as masses with lit edges; fields with visible brushwork and local
colour; foreground framing for depth; full-body round-headed characters with readable poses and acting; night scenes
with a lit house, smoke and fireflies; motion in every corner. Frames a, c, d and e would sit in the same reel.

**Still below it:**
1. **Clouds** are still a little "cut-paper": the lit caps show as clean circles and the flat bases are ruler-straight;
   the reference's clouds are softer at the edges. Big clouds near the top edge can look cropped.
2. **Ground brushwork** is convincing near and mid, but far fields are still mostly flat polygons, and on the dark
   night plain the dabs read slightly like bricks.
3. **Characters** are clean but simpler than the reference (no clothing folds, no hands with fingers, poses are a fixed
   set blended by time, not keyframed acting). Seen small (ring, plaza) they read; we have not yet staged one big
   (close-up) full-body performance.
4. **Close-up**: the motion-blurred poles still read as pale columns while the car moves; the foreground grass is
   translucent while blurred. The leader's driver is cut by the frame edge.
5. **Toll plaza** geometry is boxy (booths, canopy are plain boxes with flat faces), and the empty fields at the sides
   are large; it is the least "painted" of the five.
6. **Heat shimmer** is subtle to the point of being barely visible at 1080p.
7. The golden branch overlaps the ACELERADO ×2 pill slightly (the pill stays readable).

## Known gaps

- The close-up still uses the 0.6 s editorial overlap of sim time; the wide shot is now labelled ×2.
- Frame e is a style frame only; it is not in the animated test (same edit as v1, as asked).
- No new third-party resources (LICENSES.md unchanged): everything is drawn in our own code with the brand fonts.
