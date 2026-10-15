# QC · style test v4 + v4 style frames (Eli + Mila) · 2026-10-15

## Deliverables

| File | Notes |
|---|---|
| `test/style_test_v4.mp4` | 19.6 s, 1920×1080, 30 fps, H.264 High 4.1 + AAC 48 kHz, **25.7 MB** (≤ 30 MB) |
| `test/contact_sheet_v4.jpg` (+ `_small.jpg`, 336 KB) | one frame every 0.6 s |
| `styleframes/v4/a…e_*.png` (+ `_small.jpg`, 190-352 KB) | the five pilot frames with Eli + Mila |
| `styleframes/v4/compare_v2_v4.jpg` (+ `_small.jpg`, 319 KB) | v2 (approved, mascot) next to v4 |
| `characters/leo_mila/model_sheet.png` (+ `_small.jpg`, 385 KB) | final model sheet |
| `characters/leo_mila/emotion_sheet.png` (+ `_small.jpg`, 363 KB) | 13 emotions × front / 3/4 / profile × Eli, Mila, extra |

Rebuild: `art/render/build_stills_v4.sh` (stills + sheets + small JPGs) and `TMPD=<tmp> art/render/build_test_v4.sh`
(video: 588 frames in 269 s with 2 Chromium workers).

## Measured

- Loudness: **I = −14.1 LUFS**, true peak **−1.4 dBTP** (≤ −1), LRA 6.9 LU (ebur128 on the final mp4).
- No black or frozen segments (blackdetect / freezedetect).
- Duration 19.600 s for both video and audio streams.

## The edit (same structure as v2)

1. **0-6.0 s · golden highway, wide** with the «ACELERADO ×2» pill: the real IDM wave runs toward the camera; Eli and
   Mila ride in the teal car, seen from behind (back views). Mila points ahead when the car in front brakes.
2. **6.0-15.2 s · close-up in the car**, tight framing (they fill about half the frame, 7 % push-in). All the acting is
   driven by the sim: Mila is chatting (talk visemes) → both **surprised** at the leader's brake onset → **worried** at
   their own brake → Eli sets his jaw (**determined**) while the gap closes → at the stop Eli **shrugs, annoyed** → 0.9 s
   later he is **furious**, fist out of the car, yelling «¡¿Quién fue?!» (paper balloon, anger mark, steam) → Mila
   turns her head, then snaps round in her seat to look back (**curious**, 3/4 toward camera) → **awe** → **sly**
   («Fuiste tú.»), while Eli calms to **grumpy**. The wheel stays put while his hands act.
3. **15.2-19.6 s · wordmark** (0.4 s dissolve): Mila stands on the M with the brand dot on her palm, winds up and
   **flicks** it (16.2 s), it **bonks Eli's beanie** (16.62 s: beanie squash, flinch, ticks) and bounces back to **land**
   as the dot of the «i» (16.98 s, squash + settle). Eli grumbles, scratches his head, then laughs; Mila crosses her
   arms, smug. The gag lasts 2.4 s (≤ 3 s). Tagline from 17.5 s. Sound: sting on flick / bonk / land.

## Looked at (every output was opened and checked)

- Emotion sheet at phone size (1600 px): every Eli / Mila cell reads at a glance; the extras now read in 3/4 and
  profile too (profile nose, one eye, one brow, mouth on the edge).
- Frame b: Eli's furious yell and Mila's curious look-back are both big and clear.
- Frame d: the pair, seen from behind sitting on the hill (knees up), are large enough to read; Mila points at the
  ribbon.
- Frame e: Eli turns round in the queue and shrugs at the camera, annoyed; Mila faces the booth.
- Frame c: Eli (detective, magnifier) and Mila (clipboard) among the observers, drawn 1.75× world scale so they read.

## Known defects (honest)

- **Wide shots (a, c, e):** the pair is small, as the shot requires. They read by silhouette and colour (beanie and
  ponytail; yellow and purple) more than by facial expression.
- **Mila's snap-turn** in the close-up is a one-frame pivot (head first, then the body). It reads as a deliberate 2D
  snap, but it is not an in-between turn.
- **Wordmark:** the characters are small next to the 140 px letters, so their faces read less well than in the
  close-up. The bonk and the landing read clearly.
- **Ring field:** the shadows of Eli and Mila are simple ellipses, not the long swept shadows the extras cast.
- **Model sheet:** the expression busts crop the top of the beanie and the hair, and the talk-mouth visemes are small on
  the sheet; they are clearer in the video.
- **Not updated:** `thumb_b` (thumbnail B) still uses the rejected Quest & Pixie (the thumbnail waits for the art to be
  closed), and the old candidate boards were not rebuilt.
- **Speech balloon:** it is new (ART_BIBLE §3c) and has not been approved by the Producer yet.
