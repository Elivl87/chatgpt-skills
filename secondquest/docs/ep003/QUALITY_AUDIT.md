# EP003 · "Top de top" quality audit (2026-10-12)

Producer: "revisa ABSOLUTAMENTE TODO, y lo mejores". Read-only audit by an agent (code + stills + measured audio), merged
here with status. 3D props and the companion fish are handled separately (fish v2 adopted; props v2 in progress).
Generated art is never edited; every fix is our own layer or engine.

| # | Item | Fix | Where | Status |
|---|---|---|---|---|
| 1 | Boat floats on the water, crew cut by a straight line | two-pass boat (back/front halves), submerged mask + wobbling contact line, displaced reflection of crew+boat | HF + kit | kit reflection/shadow/ripples ✔; two-pass boat with props v2 |
| 2 | Grey friends read as ghosts (same value as water) | lighter grey-violet, ink outline, bigger, inside the hull | HF | ✔ (full fix with the two-pass boat) |
| 3 | Wordmark visible at the bottom edge before the catch | logo waits fully out of frame | HF + kit | ✔ |
| 4 | Water shader flat, razor horizon, banding | mirrored sky with fresnel, displaced hills reflection, shoreline haze, dither, 2× canvas for final | HF | build |
| 5 | Hills/clouds flat and repeated | 3 ridges with aerial perspective, varied pines, lit cumulus bands | HF + kit | build |
| 6 | Night lake dead (moon cropped, lantern smudges) | moon inside safe area with halo + moon path, lantern light pool flickering, blue-hour sky | HF + kit | build |
| 7 | Character light doesn't match | per-cut-out grade clipped to alpha (dusk/night), contact shadow in the hull | HF | build |
| 8 | Fish looks like a sticker on the water | ~35 % submerged + tint, ring ripples, wet highlight | HF + kit | build |
| 9 | Doorway plate is the weakest | real room, moulded frame, door swinging in 3D, light beam with dust, handwritten "Want to play?" | HF | build |
| 10 | Alibi triptych mixes three styles | corkboard of polaroids, one grade; golf stripes, bunker, waving flag; poker felt under a lamp | HF | build |
| 11 | Chat phone too small to read | phone ≥ 82 % frame height, Inter 600 26 px bubbles, names in colour, ticks/timestamps, die-cut "Bought." stickers | HF | build |
| 12 | Typography | add an OFL handwriting font (Caveat / Patrick Hand), Inter 400, min 20 px text | HF | build |
| 13–16 | Shop strip cut by the frame; parchment small; FRIENDSLOP can floats; yearbook generic | inside safe area / deliberate scroll; bigger paper list; floor shadow + spotlight; textured page + hand chart | HF | build |
| 17 | SFX inaudible on a phone (~16 dB under the voice) | +7 dB on every cue (hits now ~7 dB under the voice); master −14 LUFS / −1 dBTP at the final | sfx | ✔ (+7 dB); mastering at the final |
| 18 | Free CC0 sounds unused | wood knock, punch layer on the slaps, page flips, door open/slam, coins, creak, cloth; crickets bed at night | sfx | ✔ |
| 19 | Repeats machine-gun; mono | ±3 semitones / ±2 dB per repeat ✔; stereo pans | sfx | variation ✔; stereo in the HF mix |
| 20 | SFX keyed to the Python visuals, not the HF choreography | HF exports its GSAP beats → cue list | HF + sfx | build |
| 21 | HF used a generic CSS grain, not the approved finish | `finish_post.py`: the exact finish.py pass on every HF frame | HF | ✔ |
| 22 | Breathing camera 1.06 ± .06 softens plates | 2–3 % push / ≤ 1.5 % drift with per-shot phase | kit + HF | ✔ (Producer approved) |
| 23 | All hard cuts | whip pans with motion blur, match cuts; white flash only for the slap | HF | build (DOPAMINE_PLAN) |
| 24 | Thumbnail sketch uses the v1 fish and a flat boat | v2 deadpan fish ≥ 18 % frame, 3/4 3D boat, glance test 168×94 | packaging | with the hero art |
