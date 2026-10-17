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

## v3.3.1 · design critic FAIL on A–B (`CRITIC_v331_AB.md`), folded into the same render

| # | Finding | Change |
|---|---|---|
| 1 | Hook `hyperframes check` stopped with "Target closed" | It runs to the end here, including `--at-transitions` (≈25–30 min, alone on the CPU), so it no longer stops. Real findings fixed: the chat chrome now passes WCAG AA (sub-title, system chips, timestamps and "typing…" darkened), and the phone carries `data-layout-allow-overlap` for the designed rows that scroll under the header and input. Results are in the report. |
| 2 | 45.05–45.30 `#envShine` slides past the envelope (white streak) | The sheen now lives inside a clip the shape of the envelope (`#envShineClip`, overflow hidden, 14 px radius), so it never leaves the paper. |
| 3 | 7.5–9.3 and 36.6–40.7: Leo's rod shaft crosses his eye | The standing rod (and the start of its line) is shifted 25 px toward the bow. On "Together." Leo leans −1°/+6 px instead of −6°/−14 px, so he no longer leans into the shaft. |
| 4 | Block C opening: A/B initials; the hook's chat repeated; Leo the organiser | The avatar initials are M/L (header and the labels under the four phones). C's opening is now a later evening of the same group: "FRIDAY", Max "who's in for the lake?", "9 pm. same boat.", "IN!" stickers (the floating stickers too), Quest "boat. tonight.", Pixie brings the chips, Leo "next time!", Max "omw". Narration is unchanged. |
| 5 | 60.53–60.90: boxes fall across the faces | No fall. Each box pops up out of the hull into its owner's hands. |
| 6 | Free extras | Leo's beanie is left on the rim at his place in H8. It is a crop of his own 3D render as a layer; the art is unchanged. Quest and Pixie lean toward the empty place. The boxes sit in the hull, between the crew and the near half. The harsh cues are swapped for darker takes: Money_02 at 19.73, Stationery_18 at 43.28, and a cardboard "place" for the boxes, which also clears the sound-alike thump. sfx_audit is 0/0. |

### Final gates for this round (builder; both critics still to re-run on the review cut)
- **`hyperframes check hook --json --at-transitions`:** runs to the end with ok: true. lint 0 errors / 9 warnings; runtime 0 / 4; layout 0 / 80; motion 0 / 0; contrast 0 / 0.
  - The chat list carries `data-layout-ignore`: its rows scroll under the header and input, and grow or collapse by design (the critic accepted this in `CRITIC_v33_AB.md`).
- **`frame_critic --lint`:**
  - 0.25 s, all 0 errors: hook 164 samples, B 84, C 177, D 230, E 304, F 219, G 138.
  - 1/30 s ±0.5 s around every cut and title, 0 errors: hook 591, B 270, C opening 121, whole C 509.
- **`sfx_audit` (A–B, from the review audio):** 12 onsets / 61.8 s, rest 91 %, −14.6 LUFS, −1.1 dBTP, 0 errors, 0 warnings.
- **Sound floor (review, 0.1 s RMS, 0–66 s):** nothing below −40 dBFS except the first 0.1 s and the "So, why?" rest (−45 to −55, the very low water bed).
- **`pacing_qc`:** all PASS (20.1 cuts/min, average shot 2.96 s, longest 17.7 s).
- **Loudness:** master −14.2 LUFS / −1.3 dBTP. The 720p review is −14.2 LUFS / −1.4 dBTP (a safety limiter on the AAC encode), 29.2 MB, 328.4 s. Blackdetect finds only the designed F→G fade.

## v3.3.2 · the redesign list (D, E, F only; A, B, C untouched)

| # | Time | Block | Change |
|---|---|---|---|
| 1 | ≈247.5–253 s (F 8.24–13.8) | F | On "playing" the sign lifts and the four friends pop up as full figures in a row on the back of the stage floor. The row is Pixie, Max, Leo, Quest, in the order they will stand around the can. They use the same art as the can scene: `pixie_wave`, `max_cheer_34_laugh`, `leo_cheer_34_laugh`, `quest_wave`, at 0.6 scale, with their feet on the floor. They lean toward the can on "garbage". On "invited" they hop from the row into place around the can; before, they slid in from off screen. One quiet `pop` on "playing" replaces the stale `hud_off` "discs leave" cue, so the onset count is unchanged and the mix differs only at 247.46–248.91 s. |
| 2 | 109–115 s, 158–163 s (D) | D | Both D phones are now the hook's `ChatPhone` (`<!--SRC chat.html-->`), with the hook's portrait avatars (not A/B letters), AA name colours and chrome. D2 shows the hook's thread line by line: Max "It's eight dollars. Just get it.", Pixie / Quest / Max "Bought.", Leo "I'll get it later.". In the D6 board phone, the lake shrinks into a photo bubble Quest posted at 7:12 PM. That phone has fixed row heights, so the bubble's position is computed rather than measured. Pixie asks "tonight?" on "chat.". |
| 2 | 234–239 s (E) | E | Same skin (AA names and chrome, the hook's avatar crops, and the hook's chip style for system rows). The hook's thread sits scrolled up above "Today · 2031": Max's message, three "Bought.", Leo's "I'll get it later.". Sub-title: "Quest, Pixie, Max, Leo, Sam". `#phoneSh` is allow-duplicate (the repeated "Bought." is by design). |
| 2 | 289–292 s (F) | F | Leo no longer opens the hero chat ("on?" is gone). The chip "Max named the group "The boat"" replaces it, followed by Max's message and Pixie's "Bought.", as in the hook. AA names and chrome are applied on `#heroPhone`. The grid minis have no faces and are unchanged. |
| 3 | ≈109–115 s (D 3.5–9.75) | D | `#stamp799` is smaller (192×98) and lands on the "Bought." stickers (Quest's sticker and the end of Max's), never on Max's message. |
| 4 | ≈176–181 s (E 15.8–17.9) | E | The fish wearing the "Alibi props" list ducks under the water on "gamble", while the roulette drops in and the money rolls. It pops back up after the wheel has left, for "fight bosses". It is never on screen with the wheel or the money floats. |

**Gates (builder):**
- `hyperframes lint`: D, E, F each 0 errors.
- `frame_critic --lint` at 0.25 s, 0 errors: D 230 samples, E 304, F 219. E first flagged GHOST_TEXT on the scrolled-up hook thread, fixed with allow-duplicate.
- `frame_critic --lint` at 1/30 s, 0 errors:
  - D 3.0–10.5 s (225 samples)
  - F 8.0–15.5 s (225)
  - E 15.5–18.5 s (90)
- SFX: one cue swapped for one (no change in density); the mix diff is confined to 247.46–248.91 s.
- Re-rendered D, E, F only.

## v3.3.2 · design critic FAIL on block C (`CRITIC_v332_0-110.md`), folded into the same pass

| # | Finding | Change |
|---|---|---|
| 1 | Sound: C had 108 onsets in 44 s with no reasons; D–G were over budget too | `ep003-sfx.py`: the C–G cue lists are rebuilt to DESIGN_RUBRIC §7, one cue per story beat, each with its `why`. The beds carry the rest. Counts per block:<br>• C: 8 onsets (61.76 notify, 71.98 LATER stamp, 75.92 car clunk, 78.21 flatline, 86.54 clock NOT IT, 95.26 door open, 100.62 door slam, 104.56 $7.99 stamp + body). The 68.88 deflate was dropped, because 9 onsets in 44.2 s is 12.2/min.<br>• D: 11. • E: 15. • F: 10. • G: 5.<br>All page runs, ticks, rattles, typing clicks, confetti pops and whoosh trains are gone. Darker takes replace the harsh ones in D (Money_02, a soft impact, a wood place, a dark water foley), and E's dynamite has no metal latch. Per-block cue lists are exported to `build/ep003_sfx_cues_{C..G}.json`, and the whole episode to `build/ep003_sfx_cues_all.json`. |
| 2 | 95.67–95.80: see-through fade into the kid shot | A hard cut on a short white bloom (`#flash` from 0.85 to 0 in 0.3 s). `#kidImg` carries `data-role="character"`. |
| 3 | "MARCH" divider on the four phones | Now "OCTOBER". |
| 4 | 86.53–87.87: the NOT IT stamp was 8 % fill | `#stampClk` has an opaque cream fill (#fff3ea); the hands never show through. |
| 5 | 85.50–85.67: the map NOT IT landed late | Dropped, with its shake. The pins snapping shut is the beat. |
| 6 | "Message" placeholder contrast | #b3ada4 changed to #99948c. |
| 7 | 104.53–105.97: the ASKING chip stayed under $7.99 | The chip pops out (scale 0.5, opacity 0) the frame the tag lands. |
| 8 | Header titles crowd the avatar stack | The title and sub-title sit 7 px further right on every C phone. The optional C1 enlargement was not done (the phone is already 652/720 px tall). |
| 9 | D 106–110: the old "THE BOAT" phone with Q P A B, and the "WHY" ghost | The D phones are the hook's ChatPhone (see the redesign above). WHY and FISHING? are hidden until their slam, then fully opaque from the first frame (scale 1.9 to 1 in 0.16 s, no opacity fade). |
