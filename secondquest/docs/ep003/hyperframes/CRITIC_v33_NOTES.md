# EP003 v3.3 critics · builder's companion notes

Companion to `CRITIC_v33_AB.md` (design, FAIL) and `CRITIC_RETENTION_v33_hook.md` (retention, FIX). The critic files
themselves are left as they were written; this file records what the builder changed in answer.
Episode time unless marked. Narration v3.3 is unchanged (approved by the Producer); only SFX and beds moved.

## v3.3 → v3.3.1

| # | Critic finding | v3.3.1 change |
|---|---|---|
| 1 | 0–3.2 s empty lake; frame 0 broke the click promise (retention #1) | Frame 0 is the four friends in the boat at the punch-in framing, with "HOW TO FISH" already on screen and the unimpressed fish at the bow edge. "A boat." is a pull-back, "A rod." a tilt up the rod, and "A lot of fish." the fish leaps. The empty-lake build-up, the boat slide-in, the rod drop and the crew pop-in are gone. |
| 2 | 10.2–11.3 nobody slaps (head-bump lean, sticker in the sky) | Cut on "slapping" to the approved art 02 `02_slap_revive.png` (Pixie slaps Quest, as in the approved plan) with a slow push-in onto the hand on the cheek, the flash and the shake on the cut, and the slap SFX on the cut. The SLAP! sticker and the KO stars are gone. |
| 3 | H8 empty seat does not read; bubble pasted in the sky; expressions wrong; fade crosses the cut | Leo's rod is left propped on the stern rim where he sits, so the standing rod no longer hides the place. Quest and Pixie switch to their thinking poses (existing library art), looking toward the stern; Max gives a dry side-eye toward it. The camera makes a slow push onto the empty place from "same boat" (27.22). Leo's bubble now pops up out of his place with its tail tip on the rim (26.54), greys out on "harder" and is gone by 30.60 (the cut is at 30.81). The bubble is no longer pasted in the sky. |
| 4 | Fleet: heads floating over the hulls, airborne boats; Leo back at 30.83 undercuts the joke | Every fleet boat is now the two-pass side boat (far half, crew, near half), with heads inside the hull behind the near rim. There are no 3/4 boats and no overshoot on the pop-in. Three friends and the empty place hold through the fleet zoom-out; Leo drops into his seat only on "Together." (36.5). |
| 5 | Fishing-line loops across faces | The tangled loops are replaced by one clean arc from the rod tip out over the stern into the water, which stays off faces in every main-boat shot. The line is hidden in H8, where the rod lies on the rim. |
| 6 | 57.43–61.30 portrait badges (CHAR_BADGE); 61.2–61.6 see-through crossfade | The badges are gone. The four friends sit in the hull as full figures (the hook's two-pass boat and in-boat layers at 1.5x; Quest and Pixie in their wave poses). The game boxes land in their hands, on the near rim in front of their chests. The fly-and-dissolve is gone, so there is no crossfade. |
| 7 | 55.0–57.45 empty spotlight | Quest stands full figure in the light from "Because" (55.06). On "alone" the light narrows on him; on "Everyone" the stage lights come up on the four of them in the boat. |
| 8 | 51.13 reel reads "00,000,000"; 53.5–55.0 hold | The reel appears already rolling, and a slow push now runs on the 10,000,000+ hold up to "Because". |
| 9 | 61.60–61.77 box→phone match does not land; block C reopens the chat in another skin | B now ends on the four friends holding their boxes (slow push), then a clean cut to C. C's opening phone (C1) wears the hook's chat skin: phone body, island, header "The boat · Quest, Pixie, Max, Leo", white incoming bubbles with AA names, yellow outgoing bubbles, and die-cut "Bought." stickers with the check mark (the floating stickers match too). The lines and narration are unchanged. |
| 10 | Dead air (beds about −60 dBFS); Bought #2 silent; cuts at 11.4 and 25.8 arrive in silence; crack in the "So, why?" rest | The lake and room beds are raised to about −35 dBFS RMS in the mix (about −32 after the −14 LUFS master). In 0–62 s no 0.25 s window is below −43 dBFS except the "So, why?" rest, which keeps only a very low water bed at about −58. Beds cross their cuts by 0.3 s. Bought #2 has its pop, pitched between #1 and #3. The fleet explosion layer, the title cue and the two wordmark cues inside the rest are cut. The count stays at 12 onsets / 61.8 s. |
| 11 | Small fixes | "THEY HOPED" shrinks to 0.92 (22 px) and the source line is 26 px. Chat names are darkened to AA on the cream (Quest #a8241c, Pixie #0b5a60, Max #5a3fa6, Leo #7a4f00). The "Message" placeholder is darker and marked as decoration. The third "Bought." punches in opaque. Leo's typing row leaves 0.3 s before his message lands. The wordmark is reeled from just under its place, so it never crosses the boat or faces. The envelope lands clear of Quest's phone hand. |
| 12 | 272.233 single dark frame (block F) | This was a render glitch: a 20 ms gap between block F's `shotLake` and `shotRoom` clips. `shotLake` now overlaps `shotRoom` by 10 ms, and block F is re-rendered. |

### Also fixed while sweeping
- Block C threw a runtime error in the frame critic's seek harness (`window.__timelines` was never initialised; the Hyperframes renderer itself was unaffected), so the automated critic had never sampled C's frames. With that fixed, the 0–66 s sweeps of C pass. The designed repeats (four phones of the same chat, the "Bought." stickers) are declared, and the floating text stickers no longer carry motion blur.
- **Known, not fixed (out of this revision's scope):** with the runtime error gone, a 0.5 s sweep of the rest of block C (from 66 s on) shows errors that existed before: motion blur on the calendar speed-ramp and on the 3-weeks phones (ghost text), and rows overlapping in those phones. These are listed for a block C pass.

### v3.3.1 gates (builder; the independent critic still has to re-run)
- `hyperframes lint`: 0 errors on hook, blockB and blockC.
- `frame_critic.py --lint`:
  - 0.25 s sweep: hook 0 errors / 397 samples, blockB 0 / 85, blockC 0–4.3 s 0 / 18.
  - 1/30 s ±0.5 s around every cut, title and bubble in 0–66 s: hook 0 errors / 591 samples (after the bubble fix: 0 / 40 at 26.3–27.6), blockB 0 / 270, blockC opening 0 / 121.
- `sfx_audit` (A–B, episode budget, mixed from the review): 12 onsets / 61.8 s (12/min), rest 88 %, −14.6 LUFS, −1.1 dBTP. 0 errors; 3 warnings: two cues flagged HARSH (Money_37, BookFlip2) and one SOUNDALIKE pair (stamp at 52.8 / thump at 60.6).
- Sound floor (master, 0.25 s RMS, 0–61.7 s): nothing below −40 dBFS except the first 0.25 s (−40.4) and the "So, why?" rest (39.0–40.5 s, −42 to −54: the very low water bed).
- `pacing_qc`: all PASS (19.9 cuts/min, average shot 2.98 s, longest 17.7 s, motion 0.85, 161 wpm).
- Master −14.1 LUFS / −1.3 dBTP; 720p review −14.2 LUFS / −1.0 dBTP, 29.2 MB. Blackdetect finds only the designed F→G fade (292.7–294.0 s); luma around 272.233 s is steady (69→74).
