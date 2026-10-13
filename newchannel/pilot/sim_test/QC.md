# sim_test · QC (2026-10-13)

20 s style test: phantom traffic jam on a ring road (Sugiyama 2008 setup: 22 cars, 230 m), Intelligent Driver Model.
Rebuild: `./make_video.sh` (deterministic: no randomness in the dynamics; grain/noise use fixed seeds).

## Deliverable
| Check | Result |
|---|---|
| File | `sim_test.mp4`, 21.2 MB (≤ 30 MB), ~8.5 Mb/s |
| Video | H.264 High, 1920x1080, 30 fps, yuv420p, 600 frames, 20.00 s, |
| Audio | AAC-LC 192 kb/s, 48 kHz stereo |
| Loudness (final mp4, ffmpeg ebur128) | **−14.0 LUFS integrated**, LRA 4.6 LU, **true peak −1.3 dBTP** (loudnorm pass agrees within 0.1) |
| blackdetect (d=0.1, pix_th=0.10) | no black segments |
| freezedetect (n=0.001, d=0.5) | no frozen segments |
| silencedetect (−50 dB, 0.5 s) | no silence |
| Contact sheet | `contact_sheet.jpg` (1 frame/s, 5x4), reviewed; plus full-res crops of the label, mascot faces (all 4 expressions) and a decoded mp4 frame |

## Timeline (video seconds)
- 0–4: uniform flow (all dots evenly spaced at 22 km/h), mascot neutral, steady lap-tick pulse.
- 4.0: car 0 taps the brakes (4 m/s² for 2.2 sim-s); ink ring marker, low thunk, label "one tap of the brakes" (Space Grotesk from `brand/fonts`) with second-ink pen-stroke underline + leader (4.0–7.8).
- 5–20: stop-and-go wave (≈6 stuck cars) forms and travels clockwise (backwards) while every dot keeps going counter-clockwise. Dots turn to the second ink (#23746C) when slow (second plate grows, ink core shrinks: two inks, no muddy mix). Inside the ring, a polar space-time trail drifts inward: the jam draws a teal spiral.
- 9.5–18.4: second-ink arrow rides outside the road, following the jam backwards; faint ink arrow inside shows the cars' direction.
- Companion/mascot (car 13, the ONLY vermilion accent dot per brand rules, 1.65x radius, face per `brand/mascot_expressions.png`: strokes ≥ 1/14 of diameter, surprise burst outside the disc, eyes look where it is going): neutral → surprised 7.2 → annoyed 7.9 → relieved 9.5 → neutral 11.7 → surprised 15.0 → annoyed 15.7 → relieved 17.9. Each change has a small squash "pop" and a chirp.

## Look
Palette read from `brand/palette.json` at render time (refined palette: second = #23746C; accent reserved for the companion). 2x supersampled Pillow.
Halftone: 45° screen on dot shadows, fine screen on the road, halftone bevel outside the road. Static paper fibre +
on-twos live grain + light vignette. Misregistration: colour plate offset 1.5/1 px vs ink plate (visible on mascot face
vs body, accent dots, road fill). Camera: 2.6 % push, drift ≤ 13 px x / 7 px y (≤ 0.7 %).

## Sound (numpy only)
Lap ticks (each car plucks a pentatonic note crossing the top of the ring → a steady pulse that breaks with the jam;
slow cars pluck softer; mascot has its own note), brake ticks (decel > 1 m/s², panned to screen position), tap thunk,
low E2 hum whose voice count/beating follows the number of stuck cars, quiet pad, mascot chirps. Mastered with gain +
look-ahead 4x-oversampled limiter (max ~8 dB GR only on the tap thunk, <1 % of samples above 3 dB GR).

## Known weaknesses (honest)
1. Slow dots are teal (second ink) rather than the brief's accent, to respect the brand rule that vermilion = companion only; teal on ink is less punchy than vermilion would be.
1b. **0–4 s is calm by design** (uniform flow): only the dots move; on the channel's pacing standard (no shot > ~4 s without change) this is on the edge. A real hook would start closer to the tap or open on the jam and rewind.
2. **Time is compressed 2.4x** (sim seconds per video second) and the IDM is tuned (T = 0.7 s, a = 1.5 m/s²) so the wave appears within seconds; the real Sugiyama jam took minutes to emerge from noise. Fine for a style test; a video must say "sped up".
3. The jam is triggered by a scripted brake tap, not by driver noise. No randomness at all; the pre-tap flow is perfectly uniform (correct for the model, slightly "too perfect" looking).
4. **Not listened to by a human** — the sound was designed and measured, not auditioned. Mix balance (ticks vs hum) may need ears; the low hum (E2 + harmonics) will be thin on phone speakers.
5. The faint ink space-time dots inside the ring read as a dotted "record" texture more than as car trajectories; the accent jam spiral is the clear part.
6. Mascot face is small at 1080p (≈43 px body): readable on desktop, marginal on a phone. A Short would need a closer framing.
7. Wide empty paper on the left/right; no Ten Thousand Dots wordmark in the clip (not asked for a style test).
8. Grain makes the file large for its length (8.3 Mb/s); YouTube's re-encode will soften the grain.
9. `pacing_qc.py` not run (this is one continuous shot, not an edited sequence).
