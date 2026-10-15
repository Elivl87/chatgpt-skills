# QC · Block B (Act 1 «Es real», beats 6-8) · draft 854x480 · 2026-10-15

**Files:** `blockB_draft.mp4` (53.38 s = narration 42.04 → 95.41, 7.7 MB) · `blockB_contact_small.jpg` (1 frame/s) ·
numbers in `qc/` (`QC_blockB.md`, `shots_blockB.md`, `summary_blockB.json`). Rebuild: `build_block.sh B draft`.

## How it is built

- Worlds: the high-angle ring (kit `E.drawRing`, now driven by the **S2** run through `A.adapter('S2')`: 22 cars,
  230 m, the real 2008-style drivers) and a new eye-level «field side» (`anim_ring.js`: the near arc of the same S2 ring
  as a band of side-view cars, Eli and Mila big in the foreground). «RECREACIÓN ILUSTRADA» on every shot; source line
  *Sugiyama et al., New J. Phys. 2008* on the ring shots.
- Keyed to words / S2 events: counter 1→22 on «veintidós», tape round the ring from «circular» to «metros» (230 m),
  dial on «treinta» (needle = the true mean speed of the sim, ~27 km/h, label «~30 km/h»), clock starts on «Al
  principio» (×10), 3:00 lands on «minutos» (`clock_3min`), the five stopped cars on «cinco» at real speed (5 really
  stopped in the sim at 3:00), the jam followed at ×1 with the backward arrow on «atrás», «≈20 km/h ←» on «veinte»
  (measured −18.8 km/h), the bicycle bell on «bicicleta». The ×10 clock jumps at two cuts (elisions shown on the clock).
- Gags: Mila drags Eli by the apron strap (heels plough two furrows); «¡Fue el de adelante!» point; the finger follows
  the car ahead round the circle (7 views) and ends pointing at himself (surprised → sheepish → arms crossed); «¡¿QUIÉN
  FUE?!» balloon; the shrug wave runs backwards round the ring, then the observers and Eli shrug; Mila sits in the grass
  in awe; Mila walks backwards with the jam while Eli walks forwards with a car; the bike rides by the jam; Eli
  scratches his head.

## Measured

| | |
|---|---|
| Shots / cuts | 23 / 22 → **24.7 cuts/min** |
| Longest shot | 4.58 s (B06 finger gag: 7 body turns + hit + reaction inside it) |
| style_bible + pacing_qc | all PASS (cuts/min 23.6 · avg 2.42 · longest 4.5 · motion 1.0 · still 0 · wpm 139) |
| Loudness | −14.1 LUFS, TP −1.4 dBTP · no black / freeze / silence |

## Fixes made after looking (round 1 → 2)

- Cars on the ring were drawn off the track: `K.car.top` set absolute transforms; it now composes with the caller's
  transform (identical under identity — ring style frame re-checked pixel-identical).
- Zoomed ring shots showed stale pixels beyond the baked field: views are clamped inside the world and every animatic
  frame is cleared first.
- Shrug marks enlarged; the bike and walking Mila moved inside the ring so they stay in frame; Eli placed in B07.

## Weaknesses (honest)

- Many ring wides in beat 7 look alike (different zooms, same high angle); the field-side shots carry the faces.
- In the ring view the observers' acting is the kit's (tiny at this scale); Eli and Mila read by colour, not face.
- The ring background is a baked 1920 canvas: the 1.6-2.2× zooms will be soft at the final 1080p.
- Mila «de rodillas, barbilla en las manos» is drawn sitting on the grass (knees up), awe.
- The finger gag ends pointing at his chest («¿yo?») rather than literally at his own back.
- B07: Eli in the foreground is only a sliver at the left edge.
