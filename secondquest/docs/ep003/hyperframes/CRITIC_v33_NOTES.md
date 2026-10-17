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

## v3.3.1 · block C pass + D–G lint sweeps (coordinator order, after the A–B pass)

**Retention FIX (light), folded in (`CRITIC_RETENTION_v331_hook.md`):**
- **53.5–58.3:**
  - The push on the 10,000,000+ hold is now 8 %.
  - From "Because" to "alone" there is a continuous push of about 10 % on Quest.
  - On "alone" the light cone narrows to half, and its floor pool with it.
  - Under "a game you play alone", Quest holds his game (library pose `08_holding_cartridge`) instead of waving.
- **Beds:**
  - The crickets loop has ~0.1 s holes, so a gapless synthesised room tone now lies under every room bed (the hook chat, block B's room and stage until "Everyone", and block C's opening up to l13).
  - In the mix, 0–66 s, no 0.1 s window falls below −45 dBFS except the first 0.1 s and the "So, why?" rest. That covers the old dropouts at 25.37, 54.69 and 65.19–65.58.
- **Cheap extras:**
  - a very slow push from frame 0 to "A boat";
  - the fleet starts popping on "millions";
  - Leo's bubble greys out on "harder" (27.96);
  - the third "Bought." is now the loudest of the three (−15 dB).

**Block C (in scope), every error fixed. The 0.25 s `--lint` sweep of the whole block is 0 errors / 177 samples; 1/30 s ±0.5 s around every cut and title is 0 / 509.**
- **Motion blur on readable text:** removed from the calendar pages (≈72 s), the scrolling "3 weeks later" chat (≈77–82 s), the clock + NOT IT stamp (≈87 s) and the $7.99 tag (≈105 s).
- **Declared as designed** (stacked or layered by intent):
  - the flip calendar's opaque stacked pages;
  - the 3-weeks phone (rows scroll under the header, two Leo rows);
  - the handwritten "Want to play?" (script letters touch);
  - the $7.99 tag that stamps out "asking".

**D–G 0.25 s `--lint` sweeps. All four are now at 0 errors (D 230, E 304, F 219, G 138 samples).**
- D, E and G registered their timeline without creating the registry first, which the critic's seek harness needs. Fixed by a one-line init. The Hyperframes renderer was unaffected, so D needs no re-render.
- **Motion blur removed from readable text:**
  - E: the "Alibi props" list and the SOLD stamps;
  - F: the FRIEND·SLOP sign and its stickers, and the June→August calendar with "#1";
  - G: "FISH" in the closing title.
- **F ≈247.7–253 s, portrait discs removed:** the four friend discs under the FRIENDSLOP sign were removed (a CHAR_BADGE error, the pattern the Producer rejected) together with their four pops in `ep003-sfx.py`.
- **F 272.233 s:** the clip gap fixed earlier in this pass.
- **Declared as designed:**
  - D: the "$7.99 PAID" stamp on the message, the "JOB: silence" badge, the "ALIBIS" header type, NEWEST, and the chat phones (UI rows, repeated stickers).
  - E: the game HUD's own digits and slot numbers, the GOAL tag with the ALIBI stamp, the Steam quote ("fish" twice), the polaroid table with "2031 · years later", and the years-later phone; the mini list worn by the fish is marked ignore (a 17 px prop).
  - F: the stacked yearbook pages, the wall of identical chats, and the chat UI avatars.
- **Re-rendered:** C, E, F, G (and A, B for the retention items). D unchanged.

**Needs real redesign: proposed, not changed**

| Time | Block | Issue | Proposal |
|---|---|---|---|
| ≈247.7–253 s (F 8.5–13.75) | F | "…built for playing with friends" now has no friends on screen (the discs were removed) | Bring the four friends in full figure on "playing" (the cheer poses already used around the trash can), instead of on "we" |
| 109–115 s, 158–163 s (D) · 234–239 s (E) · 289–292 s (F) | D, E, F | The chat phones still use three older skins; only C's opening matches the hook's chat now | Move every EP003 phone onto `src/components/chat.html` (the hook's ChatPhone), with the same names, colours and stickers |
| ≈109–115 s (D 4.25–9.75) | D | The "$7.99 PAID" stamp sits on the quoted message, so "It's eight dollars. Just get it." is partly covered (declared, but it hurts legibility) | Stamp the empty lower half of the phone, or scale the message up first |
| ≈176–181 s (E 13–18) | E | The fish wearing the mini "Alibi props" list swims across the roulette and HUD numbers | Route the fish under the boat line, away from the HUD |
