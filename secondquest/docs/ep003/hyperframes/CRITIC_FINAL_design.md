# EP003 v3.3.3 · Final independent design critic · whole episode (0–328.4 s)

Critic: frame-critic skill, independent (did not build the piece; edited nothing in it).
Date: 2026-10-17. Commit reviewed: ed1089f (D, E, F block renders) on top of 246960a (review cut re-joined 11:03);
HEAD at review time 928b5ad (adds only `CRITIC_FINAL_retention.md`).

**Material**
- Review render `EP003_full_hyperframes_review.mp4` (1280×720, 328.4 s) and its own audio track.
- Projects `tools/hyperframes_ep003/{hook,blockB..G}`. Block starts: C 61.76, D 105.97, E 163.27, F 239.24, G 293.90
  (local = episode − start). All timestamps are episode time unless marked "local".
- Claims verified: `CRITIC_v333_C-G.md` §2 (D-1..D-4, E-1..E-5, F-1, G-1..G-5) and the builder's table in
  `CRITIC_v33_NOTES.md` ("v3.3.3 · retention critic FIX … and design critic C–G").

```
VERDICT: FIX   (not PASS: 2 claimed fixes did not land, 1 fix regressed onto a face, 1 new HUD-over-faces, all in D–E)
1 Hierarchy ........ PASS  - one focal point per beat; CLUTTER warnings are the chat phones (designed)
2 Overlaps ......... FIX   - 138.3-139.0 JOB badge covers Quest's face (D-3 regression); 110.1-115.8 $7.99 PAID
                             still on Max's "Bought." + 11:43 (D-2 not fixed); 208.45-209.25 FAIL x3 panel covers
                             Pixie's, Max's and Leo's heads in the line-up (new); 213.0-215.3 hearts pill on Quest's
                             head (E-3 not fixed); 233.0-234.5 "2026->2031" rolls over the "$0" polaroid (E-4 half)
3 Safe/legibility .. PASS  - warnings only (phone chrome, PAID 20 px, "How to meet" 13 px on the shrunken phone)
4 Characters ....... FIX   - everyone inside the hull in every boat shot; but half out of frame: Pixie 213.0-215.3
                             (eye shot) and 270.0-272.2 (F push); 127.6-127.85 the "..." bubble drops across Quest's face
5 Art fit .......... PASS  - art fits the lines; light always sourced (lantern, spot, moon, door)
6 Motion ........... FIX   - blurred snaps 139.0-139.4, 144.0, 145.0, 207.6 = 4 (budget 1-3); D-1 slam fixed
7 Sound ............ PASS  - 61 onsets / 327 s = 11/min, rest 90 %, -14.3 LUFS / -1.5 dBTP, 0 err, 3 fatigue warn
8 Repeats .......... checked: outside hull no repeat; badges no repeat; ghost text no repeat; see-through
                     crossfade no repeat (G fish dives); unmotivated light no repeat; letter avatars no repeat (G);
                     text/HUD over faces REPEATS (138.3, 208.45, 213.0); person half out of frame REPEATS (213, 270)
Automated: lint 0 err (7 blocks); frame_critic 0.25 s 0 err (all 7 blocks, 1,286 samples); 1/30 s 18 windows D-G
           0 err (726 samples); sfx_audit 0 err / 3 warn; check: __CHECK_SUMMARY__
Top fix: unhook the JOB badge from Quest's face and move the FAIL x3 card + hearts pill off the crew (D/E), then
         put the $7.99 PAID mark where the notes say it is (empty phone background).
```

## 1. Previous findings (CRITIC_v333_C-G §2 and the builder's table)

| # | Claimed fix | Verified on the review cut |
|---|---|---|
| D-1 | WHY / FISHING? slam from ≤1.3×, grow apart | **Fixed.** 1/30 s over 106.20–106.70: FISHING? lands in its own slot right of WHY, no overlap, settles "WHY FISHING?" at 106.50. frame_critic 1/30 s local 0–1.2: 0 err. |
| D-2 | `$7.99 PAID` small mark on the empty phone background right of Max's "Bought." | **Not fixed.** 110.1–115.8 (full size 110.5, 113.0): the mark (`#stamp799`, left 352 top 446) lies on the end of Max's "Bought." ("Bought" + the stamp's "$") and on the 11:43 PM timestamp, and hangs ~25 px off the phone's right edge. From 113.2 the green SOLVED disc lands on top of it ("$7" visible). The gate passes only because `#stamp799` is declared `data-critic-allow-overlap` (v3.3.1, when it was meant to sit on the message). |
| D-3 | JOB badge clips onto the "…" bubble | **Regressed.** It does clip to the bubble's lower edge, but it hangs straight down over Quest's head: 138.3–139.0 (full size 138.5) the "JOB: silence" card hides Quest's whole face. Text over an acting face. `#badge` is also declared allow-overlap, so the gate is silent. |
| D-4 | Board phone enters opaque, up from below the string | **Fixed.** 1/15 s over 157.8–159.0: opaque, rises from below, pinned; no rows through the polaroids. |
| E-1 | "Alibi props" list on two strings from above; strings snap on the throw | **Fixed.** 165.5–171.0 hanging on strings; 171.5 thrown. |
| E-2 | FAIL ×1 card over the empty lake | **Fixed.** 202.5–203.6 (full size 202.8): card top-left over the lake, crew clear. |
| E-3 | Eye shot frames the crew lower/right of the hearts | **Not fixed (moved).** 213.0–215.3 (full size 213.1, 213.6): the hearts pill now sits on Quest's head (hair to the brows), and Pixie is cut by the left frame edge (face half out). |
| E-4 | "2031 / YEARS LATER" on the empty table right of the phone | **Half fixed.** The hold from 234.6 is right of the phone, clean. But the roll 233.0–234.5 (full size 234.1; 1/8 s sheet) still runs centre-frame over the dimmed polaroids: "2026→2031" sits on the "$0" headline (reads "2031 / $0") and on "dynamite night". Then the phone slides over the year at 234.55. |
| E-5 | Line-up and tumble as hard cuts, no blurred snaps | **Fixed** for the line-up (208.4–210 sharp). See §6 for the remaining blur count. |
| E minor | Roulette rolls in from the right under the money HUD | **Fixed** (179.3–180.5). |
| F-1 | Banner "Max: on?" on "same boat" | **Fixed.** 266.2–272.2, AA purple "Max:", Tue 9:00 PM, enters from the top. Note only: 268.5–270.6 Leo's raised hands and the tossed dynamite touch / pass behind the banner's lower edge. |
| G-1 | Question upright and sharp; reflection dimmer; drop breaks only the reflection | **Fixed.** 294.0–298.9 upright, reads; reflection below; 298.5 the drop breaks only the reflection. |
| G-2 | Fish dives with splash/ripple | **Fixed, acceptable.** 304.3–305.47: dive then splash; the fish is out of focus (rack focus on the boat) and dissolves for ~4 frames (305.30–305.40) as it goes under. Not a character crossfade. |
| G-3 | Pixie portrait avatar on "Bought." | **Fixed** (318.0). |
| G-4 | Fish dives low under the wordmark | **Fixed** (323–327, full size 325.6: under the underline, clear of "Q"). |
| G-5 | HOW TO FISH fades before the field rises from the bottom | **Fixed.** 1/12 s 310.9–312.2: title gone by 311.40, field rises 311.65. |
| Sound | E whip → cloth swish; stamps 5; soft thumps elsewhere; 0 HARSH | **Fixed.** sfx_audit: stamp family 5, 0 HARSH. |

**New since the C–G critic, verified:**
- C–G beds: no digital silence after 60 s. 50 ms RMS scan of the review audio: the only run below −50 dBFS ≥ 0.15 s is
  39.2–40.5 (the hook's "So, why?" rest, designed). 105.3, 162.6, 238.6 now sit at −37 to −40 dBFS; the F black
  lake 292.8–294 holds at −40 dBFS with the water bed.
- F 258.6–267 camera moves: wide → punch-in on "end too" (260.6) → out/across; night falls on a short ramp; lantern
  glow is sourced (263.4 full size). Clean, but the move ends with Pixie half out of frame (270.0–272.2, full size 272.0).
- Polaroid push (119.5–122.5), bobber/fish (132.5–137.5), garage push in/out (145.5–148.5), Steam quote mark
  (183.5): all read; timing matches the notes.
- A–B unchanged visually: per-frame PSNR of 0–61.7 s between the 7c0e4b3 review cut and this one: min 35.1 dB over
  1,851 frames (re-encode noise only). Block C also unchanged (61.8–105.8: min 35.2 dB). B's ten-million reel now
  lands on a soft wood thump (52.8, cue log).

## 2. Whole-episode 0.5 s pass: new findings

Method: 55 sheets at 2 fps (every frame of 0–328 s at 0.5 s), 1/6–1/30 s window sheets around every suspect, full-size
frames for each finding below.

| # | Time | Finding | Fix | Blocking |
|---|---|---|---|---|
| N-1 | 208.45–209.25 | Line-up: the FAIL ×3 card (top right, ~940–1230 × 170–325) stays put while the suspects pan under it, so it covers Pixie's head (208.45–208.6), Max's head (208.7–208.85) and Leo's head (208.95–209.25). HUD over acting faces. | Hide or shrink the card during the line-up (it returns at 210), or frame the suspects lower (heads below y ≈ 340). | yes |
| N-2 | 127.6–127.85 | The "…" bubble deflates and drops diagonally across Quest's face while fading (127.75 full size: semi-transparent bubble over his eye). | Let it pop/shrink in place above the heads, or fall behind the boat line. | no (FIX) |
| N-3 | 213.0–215.3 | (= E-3) hearts pill on Quest's head; Pixie half out of frame. | Frame the crew lower/right (full Pixie, heads below the pill) or drop the hearts for the eye close-up. | yes |
| N-4 | 270.0–272.2 | End of the F out/across move: Pixie cut by the left edge through her face (playbook: "a person half out of frame"). | End the move ~60 px further right, or let her exit fully. | no (FIX) |
| N-5 | 159.70–159.73 | NEWEST lands as a large 40 % ghost over the phone's rows for 2 frames, then settles on Max's 11:42 timestamp and past the phone edge (161.5 full size). | Enter opaque from the scale it lands at; nudge it 30 px right/down off the timestamp. | no (minor) |
| N-6 | 181.1–182.3 | The boss "???" bar touches the tops of Pixie's and Quest's heads during the bounce. | Bar 20 px higher or boat 20 px lower. | no (minor) |

Minor, noted (no action required): 116.0 caption change "aug. · the lake" → "the lake · that summer" (kept);
136.5–139 "a reason" covers the fish's face (builder: not done); 113.7 the phone dims to near-black for one frame
before greying; 195.5 / 199.5 ALIBI and FAILURE stamps enter as 1-frame ghosts (stamp convention); 254.7–254.8
stage push-out shows a dark plate edge for 2 frames.

## 3. Sound

| Scope | Cues / onsets | Rate | Rest | Result |
|---|---|---|---|---|
| A–B | 14 / 12 | 12/min | 91 % | 0 err, 0 warn |
| C | 10 / 8 | 11/min | 91 % | 0 err, 0 warn |
| D | 12 / 11 | 11/min | 92 % | 0 err, 0 warn |
| E | 17 / 15 | 12/min | 84 % | 0 err, 0 warn |
| F | 10 / 10 | 11/min | 92 % | 0 err, 0 warn |
| G | 5 / 5 | 9/min | 91 % | 0 err, 0 warn |
| Whole mix | 68 / 61 | 11/min | 90 % | −14.3 LUFS, −1.5 dBTP, LRA 3.2; 0 err, 3 warn (CATEGORY_FATIGUE impact 7×, notify 7×, stamp 5×) |

Every cue has a "why" tied to an on-screen event (incl. the new F roll 277.1 on "never" and drain 285.3 on "oof.").
Fewer, better: the notify family (7×) is the one to thin; the C opening ping and the G "Bought." ping are the ones
that matter, the F "every screen pings" (292.3) could ride the bed.

## 4. Repeated mistakes

| Item | Result |
|---|---|
| Anyone outside the hull (2026-10-14) | checked: no repeat (every boat shot 0–328 at 2 fps; 320.5 all four inside) |
| Portrait badge instead of full figure | checked: no repeat |
| Pasted floating box | checked: no repeat (Alibi list on strings, JOB badge clipped, banner from the top) |
| Ghost / blurred readable text | checked: no repeat on readable text (the 139.0 whip smears the badge only while unreadable) |
| Text / HUD over faces | **repeats**: 138.3–139.0 (JOB badge), 208.45–209.25 (FAIL ×3), 213.0–215.3 (hearts) |
| Text over text | **repeats**: 110.1–115.8 ($7.99 PAID on "Bought."), 233.0–234.5 (2031 on "$0") |
| See-through character crossfade | checked: no repeat (C kid hard cut; G fish dives) |
| Unmotivated light (2026-10-15) | checked: no repeat |
| Person half out of frame (playbook) | **repeats**: Pixie 213.0–215.3, 270.0–272.2 |
| Letter avatars (v3.3.1) | checked: no repeat on the hook-skin phones (C keeps its accepted Q P M L discs) |

## 5. Automated gates

| Gate | Result |
|---|---|
| `hyperframes lint` | 0 errors on hook, B, C, D, E, F, G (warnings 9/4/16/20/17/12/5) |
| `frame_critic --step 0.25 --lint` | 0 errors on all 7 blocks: hook 164 samples (14 warn), B 84 (9), C 177 (89), D 230 (65), E 304 (49), F 219 (46), G 138 (17). Warnings reviewed: CLUTTER = chat phones; TEXT_OVER_CHARACTER hits are bounding-box only (F "2" is the clock reel strip, G hits are on the blurred backdrop) |
| `frame_critic --step 1/30` around changed titles D–G | 0 errors in 18 windows (726 samples): D local 0–1.2, 3.8–5.0, 6.6–8.0, 31.9–33.2, 51.8–52.6, 53.3–54.3; E 1.5–3.0, 19.9–21.0, 38.8–40.4, 44.9–46.2, 69.4–71.6; F 26.3–27.6, 36.3–37.6, 45.6–46.8; G 0–1.5, 4.2–5.4, 17.0–18.4, 23.7–24.7 |
| `sfx_audit` whole mix | 0 errors, 3 warnings (above) |
| `hyperframes check --at-transitions` (D, E, F, G only) | __CHECK_TABLE__ |

**Gate blind spots (why 0 errors coexist with the findings):** D-2 and D-3 are silenced by declared overlaps
(`#stamp799`, `#badge` carry `data-critic-allow-overlap` since v3.3.1, when the stamp was meant to be on the
message); N-1 and N-3 are HUD-over-character, which no gate checks (TEXT_OVER_HUD is text over HUD, not HUD over
a face). Recommend: drop those two declarations, and add a HUD_OVER_CHARACTER check to `frame_critic.py`.

## 6. Motion blur budget
Blurred snaps on screen: 139.0–139.4 (D4 → board whip; smears the JOB badge and "a reason" while unreadable),
144.0 and 145.0 (golf → poker → garage whips), 207.6 (chip stack slides). 4 against "1–3 per video". FIX: keep the
two alibi whips (144/145), make 139.0 a hard cut or a short push, and leave the chips sharp.

## 7. Taste
This is a strong episode now: the hook-to-G arc reads, the false ending at 258–272 lands as a real breath, the night
lake with the upright question is the best frame in the piece, and the game-HUD comedy in E has rhythm. What keeps it
from "spectacular" is the same thing as last round, in fewer places: overlays that are placed on a fixed grid while
the camera or the characters move under them (the JOB badge, the FAIL card, the hearts). The single change that would
raise it most: in D–E, make every overlay respect the faces, so the eye always gets the character first and the joke
second.

## Remaining fixes (for the builder)
1. **138.3–139.0** (D local 32.3–33.0): JOB: silence badge off Quest's face (clip it to the bubble's right side or tail, above y ≈ 250). Drop `#badge` from the allow-overlap list.
2. **110.1–115.8** (D local 4.1–9.8): `$7.99 PAID` on the empty phone background (it currently covers "Bought." + 11:43 and overhangs the phone); keep the SOLVED disc off it. Drop `#stamp799` from the allow-overlap list.
3. **208.45–209.25** (E local 45.2–46.0): FAIL ×3 card off the suspects' heads during the line-up.
4. **213.0–215.3** (E local 49.7–52.0): hearts pill off Quest's head; Pixie fully in frame (or fully out).
5. **233.0–234.5** (E local 69.7–71.2): run the 2026→2031 roll where it holds (right of the phone) or above the polaroids, not on "$0".
6. FIX, not blocking: 127.6–127.85 bubble across Quest's face; 270.0–272.2 Pixie cut by the frame edge; 139.0 whip → cut (blur budget); 159.70 NEWEST ghost entrance and timestamp overlap; 181.1–182.3 boss bar on heads.

PASS once 1–5 are fixed and re-verified at 1/30 s; 6 can ride along.

## Evidence
Scratch (not committed), `/tmp/claude-0/-home-user-chatgpt-skills/0e21dcc3-ac09-565e-92e0-ea987a4a43f9/scratchpad/critic_final/`:
`sh/s_01..55.jpg` (2 fps sheets, sheet n starts at 6(n−1) s), `ev/f_<t>.jpg` full-size frames (110.5, 113.0, 127.75,
137.3, 138.5, 161.5, 181.5, 202.8, 208.6, 213.1, 213.6, 234.1, 263.4, 270.55, 272.0, 305.33, 325.6), `ev/w_<t>_n.jpg`
window sheets (106.2, 112.9, 127.2, 137.7, 138.9, 157.8, 159.3, 180.6, 207.3, 208.2, 212.7, 232.8, 253.8, 258.6,
267.6, 304.3, 310.9), `fc025_<block>/critic.md`, `fc30/<B>_<t0>/critic.md`, `check_<B>.json`, `lint_<block>.json`,
`sfx_all.json`.
