# Eli + Mila · the channel's characters (final spec, 2026-10-15)

Producer decisions (PRODUCER_DECISIONS.md, 2026-10-15): the pair is **Eli + Mila**, design **Alt 1 «Taller»** (Max &
Leo adapted to the channel style, Max turned into a woman; the man renamed Eli). The 2D versions drawn in code are
canonical. No mascot. **Standing rule:** every character in this universe (Eli, Mila **and** the round-headed extras)
must express every emotion clearly in front, 3/4 and profile, and every delivery keeps improving the details.

Sheets: `model_sheet.png` (+ `model_sheet_small.jpg`) · `emotion_sheet.png` (+ `emotion_sheet_small.jpg`) ·
detail pass: `DETAIL_AUDIT.md` (+ `audit_crops_small.jpg`, `detail_before_after_small.jpg`) · eyes pass (2026-10-16):
§6b + `eyes_before_after_small.jpg` + `ep/001/animatic/qc/QC_eyes.md` · Guardian log: `GUARDIAN_LOG.md` ·
history: `alternatives/` (the 5 designs the Producer chose from).

## 1 · Identity

| | **Eli** | **Mila** |
|---|---|---|
| Role | loud, impatient, optimistic; the gap-closer; yells «¡¿Quién fue?!» | tall, calm, curious, patient; sees what nobody sees; «Fuiste tú.» |
| Height (units, 1 = an extra) | **0.95** | **1.08** (≈ 14 % taller) |
| Head | short, wide capsule (hw 0.082, hh 0.138), dark brown skin | tall, narrow capsule (hw 0.063, hh 0.152), tan skin |
| Face | big googly eyes, pupils that don't quite agree (they do agree in surprise / awe), small catchlight, nose bump, big grin, dark brows that always sit on the skin (the beanie pops up when they rise) | googly eyes with sleepy lids (lid bias 0.36), small catchlight, lashes, wine lips, dark brows, nose bump |
| Hair / hat | yellow ribbed beanie with a folded cuff (bobs; squashes when hit) | high ponytail with a mustard tie (swings, trails in the wind), side fringe |
| Clothes | white tee (rib crew collar, short sleeves cut square at the hem), brown canvas apron (bib, flat neck straps over the collar, waist tie with a bow at the back, skirt with a patch pocket that sways), blue jeans, black work boots | purple long sleeves with darker cuffs and a rib crew collar, mustard bib overalls (straps over the collar with brass buttons, flap chest pocket; at the back the straps meet the bib under a stitched patch), green rubber boots with a rolled lip |
| Accessories | none | small gold **drop earrings** (stud on the head edge + a drop hanging outside the silhouette; they swing) |
| Relationship | **Mila's partner** (they are a couple; Producer, 2026-10-28) | **Eli's partner** |
| Signature colour | **yellow** | **purple** |

They stand out from the extras by silhouette (capsule heads vs round heads; tall-thin vs short-wide) and by colour
(yellow / purple read apart at phone size and against golden, dusk, night and overcast palettes).

### Colours (hex)

| Eli | | Mila | |
|---|---|---|---|
| beanie | `#f2c230` (rib `#cf9d1f`) | sweater | `#7158b8` (cuff `#5a4596`) |
| tee | `#f1ede2` | overalls | `#c99633` (pocket `#a87a24`) |
| apron | `#a4713d` (pocket `#7d532a`, ties `#3b2a20`) | boots | `#2f6b45` |
| jeans | `#3f5f96` | skin | `#d9a66c` |
| skin | `#d9a66c` = Mila's tan (2026-10-29, «Le pondría el mismo color de Mila»; was `#905a38`, before that `#7a4d32`); blush `#f07a5e` | hair | `#2e1d22` |
| boots | `#2b2729` (sole `#151214`) | earrings / buttons | `#f0c24a` / `#e7c25a` |
| brows | `#1a100e` | lips | `#8e3346` |

Ink line `#2a1a1e` (weight 0.0066 units). Brand vermilion `#E8553A` is **never** on them: it belongs to the wordmark
dot / brand accent only (in the wordmark gag Mila handles the dot, but it stays a separate flat disc).

## 2 · Proportions (units; ground = 0)

| | Eli | Mila |
|---|---|---|
| top of head (without hat) | 0.92 | 1.07 |
| head centre | 0.782 | 0.918 |
| shoulder | 0.649 | 0.771 |
| hip (leg length) | 0.37 | 0.46 |
| arm (upper + fore) | 0.324 | 0.356 |
| torso width top / bottom (front) | 0.107 / 0.099 | 0.087 / 0.079 |

In cars the cartoon scale is `u = 2.7 × px-per-metre` (the head and torso clear the door of the teal two-seater). In
wide scenes next to extras, 1 unit = an extra's height (`K.char.person` R ≈ u / 4.1); protagonists may be drawn up to
1.75× larger than world scale where they must read (ring field), as the ART_BIBLE allows for sprites.

## 3 · API (Canvas 2D, `art/lib/cast.js` + `art/lib/cast_alts.js`)

```js
K.cast.draw(ctx, 'eli1' | 'mila1', x, y, u, {
  view: 'front' | 'q' | 'side' | 'back' | 'backq',  dir: 1 | -1,     // 3/4 and profile turn toward dir
  pose, expr, t,                                                     // t drives breathing, idle sway, hair, apron, blinks you pass
  look: [x, y], headTurn: -1.6..1, tilt, lean, blink: 0|1, talk: 0..1, viseme: 'M'|'E'|'A'|'O',
  blend: { pose, k },                                                // cross-fade two poses (no pops)
  seated, legs, sitGround,                                           // car seat (no legs) / sitting on the ground (knees up)
  drag: 0..1, hatHit: 0..1,                                          // wind on ponytail / apron, beanie squash impulse
  light: K.cast.LIGHT.golden | backlit | night | noon | dusk | board, fog: [colour, k], shadow, extras: ['anger', ...] })
  -> { head: [x, y, r], hands: { lead, trail }, top }
K.cast.probe(id, x, y, u, o)       // where hands/head would be for a pose, without drawing (props such as the wheel)
K.cast.crew2(ctx, sx, sy, SC, { driver, passenger, driverO, passengerO, t, light })   // the pair in the teal car
K.cast.bubble(ctx, head, '¡¿Quién fue?!', a)                     // paper speech balloon (screen space)
```

Aliases: `eli` → `eli1`. Drawing is re-rasterised at true pixel size under any transform (crisp push-ins) and cropped
to the visible canvas. Deterministic: time only from `t`.

**Poses:** `stand` (arms hang with a slight bend and sway), `walk` (cycle: knees, foot lift, arm swing, body bob),
`point`, `shrug`, `wave`, `crossed`, `hips`, `think`, `chin`, `cheer`, `open`, `surprise`, `clasp`, `belly`, `scratch`,
`pump`, `fist`, `clipboard` (Mila: board + pencil that writes), `detective` (Eli: magnifier to the eye), `drive`,
`driveFist` (one hand on the wheel, fist shaking out of the car), `lap`, `lapPoint`, `sit`, `sitPoint` (ground).

**Expressions (15):** `neutral`, `happy`, `laugh`, `surprised`, `curious`, `awe`, `smug` (= `sly`), `thinking`,
`worried`, `sheepish`, `annoyed`, `grumpy`, `furious` (yelling), `determined`, `talk`; plus `blink` and the four talk
visemes. Each expression also carries its default body language (`K.cast.EXPR[e].body`) and head squash/tilt.

**Extras (`K.char.person` / `K.char.head`):** same 13-emotion vocabulary (`happy laugh surprised curious awe smug
thinking worried sheepish annoyed furious determined`, plus the older ones), `view: 'front' | 'q' | 'side'` with a
profile nose, one eye, one brow and a profile mouth; body language poses in `K.char.EMO_POSE`.

## 4 · Emotion guide (do / don't)

Every emotion is built from **four layers**, strongest first: (1) **brows + lids** (the shape of the eye), (2)
**mouth**, (3) **head** (tilt, squash/stretch, lean), (4) **body** (shoulders, arms, posture). Secondary cues (sweat
drop, anger mark, steam puffs, sparkles, ticks) are seasoning: at most one or two at a time.

| Emotion | Brows / lids / pupils | Mouth | Head | Body | Cue |
|---|---|---|---|---|---|
| neutral | relaxed (Mila sleepy) | small smile | — | arms hang | — |
| happy | brows up, cheeks push lower lids | open grin | back a little, stretch | palms open | — |
| laugh | eyes closed in arcs | wide open, tongue | thrown back | hands on belly, shoulders up | blush |
| surprised | brows high and arched, whites fully open (no lid), eyes 1.24×, pupils centred a touch up with a clear catchlight, pupils agree; Eli's beanie pops up | «o» | stretch 5 % | palms up by the shoulders | ticks |
| curious | one brow arched, eyes wide | small «o» | tilted, leaning in | hand at the chin | — |
| awe | brows up and arched, whites fully open, big pupils looking up with a catchlight + a small second sparkle (never bigger than ~0.4× the pupil) | tall «o» with tongue | up and back | hands clasped | sparkles |
| sly / smug | heavy lid + raised lower lid, one brow up, side glance | smirk | tilt | arms crossed | — |
| thinking | one brow up, eyes up-side | mouth pushed aside | tilt | hand to chin | — |
| worried | inner brows up, wobbly lids | wobble | squash 2 % | hands clasped at the chest | sweat |
| sheepish | worried brows, eyes away and down | clenched wavy grin | down-tilt | hand scratching the back of the head | blush + sweat |
| annoyed | flat heavy lids, brows down | flat line | — | arms crossed | — |
| furious (yelling) | brows slammed down at the centre | big shout: arched top lip, corners down, both rows of teeth | squash, forward | fist up / shaking, leaning in | anger mark (+ puffs) |
| determined | brows down, lids narrowed | set line | slight squash | fist pump at the chest | — |

- **Do** keep the brows readable in every view: in profile there is one brow, one eye (drawn 25 % bigger) and the mouth
  on the face edge (a wedge when open, a curl when closed). Turn the **body** toward the camera when a key emotion
  must read (Mila turns round in her seat to look back, 3/4 toward the camera, rather than showing a tiny profile).
- **Do** drive acting from the simulation (brake onsets, stop, gap, speed), blend poses over 0.15-0.3 s, and add
  anticipation for big moves (head first, then the body snaps).
- **Don't** stack more than two secondary cues; don't use vermilion for cues; don't cover the face with a hand (the
  surprise and curious hands stay below the mouth in profile); don't leave a face neutral in a story beat.
- **Don't** let an emotion rely only on the mouth: at 120 px wide a mouth is 6 px; the brows and the body must carry it.

## 5 · QC checklist (run before any delivery)

1. Render the `emotion_sheet` and look at the **phone-size** JPG (≈ 1600 px wide): every cell must read instantly.
2. Front / 3/4 / profile / back turnaround: same proportions, colours and accessories in every view.
3. Hands never kinked: elbows are soft curves; idle arms hang with a slight bend; hands are mittens with a thumb (§6).
4. Rim light: a thin edge just inside the ink, light side only, never a second line (§6); shade crescent capped; grain on top.
5. Earrings hang outside the head (never read as bolts); ponytail and apron move with `t`.
6. In cars: heads and torsos big in close-ups (the pair fills about half the frame); the wheel stays put while the
   hands act (`K.cast.probe`).
7. Talk visemes alternate (M / E / A / O); blinks every 2-5 s in long holds.
8. No vermilion on the characters; signature yellow / purple visible in every shot.
9. Extras: emotions read in 3/4 and profile too (profile nose, one eye, one brow, edge mouth).
10. Light JPG (≤ 400 KB) for the Producer of everything he will see.
11. Run the **Detail QC checklist** (§6) on every delivery.
12. Run the **automated eye check** (§6b) on every delivery: 0 pupil failures.
13. Run the **Guardian body audit** (§6c) on every delivery: 0 body failures, every warning looked at.
14. Run the **clothing audit** (§6d) on every delivery and after any kit change: 0 clothing failures.
15. Run the **face-crossing check** (§6e, `face_cross_check.py`) on every finished block: every run looked at, no prop over a face.

## 6 · Detail QC checklist (run on EVERY delivery that shows Eli or Mila)

Producer, 2026-10-15: «los detalles son raros … ese tipo de cosas toca cuidar». Look at every item **at full size and
at phone size** (the delivery's small JPG, and a 168×94 tile for thumbnails). Close-ups:
`art/render/render.mjs --scene detail_lab --still 1 --query "part=faces|hands|clothes|rim&W=2400&H=1350"`.
A delivery with one unchecked box is not finished. History of what went wrong: `DETAIL_AUDIT.md`.

**Eyes, per emotion** (rules in §6b; the automated eye check of §6b is mandatory)
- [ ] No grey / shaded slab on any eye white, in any light (eyes are masked from shade, rim and grain).
- [ ] Pupils fully inside the white, never cut by the outline or parked on the edge; a small catchlight up-left inside
      the pupil (<= 0.32x the pupil radius: never so big that only a dark crescent is left).
- [ ] **Surprise:** whites fully open (no lid), eyes 1.24×, pupils centred or a touch up, pupils agree, brows high
      and arched, mouth «o». **Awe:** the same plus bigger pupils looking up with a second small sparkle, tall «o».
- [ ] Lidded emotions (neutral Mila, smug, annoyed, determined, happy's lower lid): the lid is the face; no ring of
      eye outline over the lid skin (no "spectacles"), some white always visible except on a blink.
- [ ] Eyes pop past the head edge only a little (<= 0.22× eye radius; profile <= 0.5×), cleanly inked.
- [ ] Brows on the skin, never on Eli's beanie cuff (the beanie pops up instead); one brow in profile.

**Mouths and faces**
- [ ] Yell: arched top lip, both rows of teeth and the tongue visible, the whole mouth above the collar.
- [ ] Profile mouths sit inside the face edge (no notch cut into the outline); worried = a smooth wave.
- [ ] No hand over an eye or across the mouth (scratch = side/back of the head; curious = curled fingers under the chin).
- [ ] Blush only where the emotion calls for it; no ears on either character, in any view.

**Hands** (`K.cast` `hand`, drawn at 1.45× `arm.hand`, about 1.5× the forearm)
- [ ] Every hand reads as a hand at phone size: relaxed mitten + thumb, open hand (three fingers + thumb), fist
      (knuckle creases + thumb across), point (index + tucked thumb), grip on the wheel, clasped (two fists).
- [ ] No balls, stumps or blobs; at most two short creases per hand; same size relative to the head in every shot.

**Clothing items**
- [ ] Eli: apron neck straps are flat bands from the bib over the collar, never thin cords or stubs outside the
      silhouette; collar is a narrow rib band under the straps; tee sleeves are short tubes cut square at the hem (no
      balloons, no shoulder lumps, also with the arm up); waist band = torso width; bow at the back.
- [ ] Eli: beanie = 7 soft ribs + aligned cuff ribs + one light fold edge; never split half-yellow / half-dark.
- [ ] Mila: rib collar under the overall straps; straps over the collar to the shoulder line; brass buttons; flap
      pocket; at the back the straps meet the bib under a patch (no letter shapes); ponytail tie small; fringe one
      clean shape; drop earrings hang outside the head; boots with the rolled lip.
- [ ] Nothing pokes out of the silhouette in 3/4, profile or back (collars, straps, cords are clipped to the torso).

**Rim light and shade**
- [ ] Rim = a thin light edge just inside the ink (<= 0.75× the ink width), on the side facing the light only, never
      a second outline, never on internal edges (arm over torso).
- [ ] Shade crescent narrow (capped 0.028 units): it never splits a face, a beanie or a sleeve in half.

**Line hygiene**
- [ ] Every seam, fold and crease is a single purposeful line; no stray strokes, no doubled lines, no gaps between
      ink and fill, no AA ghost rings.
- [ ] Ink weight consistent between the two characters and with the props in the same shot.

## 6b · Eye rules + the automated eye check (Producer, 2026-10-16: «el punto de los ojos no está funcionando»)

The pupil is the most important pixel of the face. These rules live in `cast.js` (`drawEye`, constants `K.cast.EYE`)
and hold at **every** size (from a ~6 px eye to a close-up), view, light and render quality (draft / review / final):

| Rule | Value (`K.cast.EYE`) |
|---|---|
| Pupil = a clear dark dot inside the white, in every emotion; it grows with the emotion's eye scale | radius >= **0.36x** the eye's height radius (`pupilMin`) |
| Minimum on-screen pupil (survives draft scale, AA, grain, bloom) | >= **1.7 px** radius (`pupilPx`), capped at 0.55x the eye |
| Catchlight: one small white disc up-left, fully inside the pupil | <= **0.32x** the pupil radius (`catchMax`; default 0.28) — no line-width floor, never `K.circle` (it clamps r >= 0.01 units = a pupil-sized disc in head units) |
| Small eyes (eye radius < **9 px**, `smallPx`) | pupil + ONE catchlight: no awe second sparkle, no iris ring, one lash |
| Micro eyes (< **4.5 px**, `microPx`) | a plain dark dot, pupil >= 0.5x the eye, no catchlight |
| Lids never cover the pupil | pupil centre >= 0.85x its radius below the upper lid line / above the lower lid; lid capped at **0.58** (`lidMax`) except blink / shut |
| Declared lid-cover emotions (sly) | `smug` / `sly`, `annoyed`, `grumpy` (`E.lidCover`): pupil centred in the slit, >= 0.6x its radius inside |
| Declared closed eyes | `laugh` (^ ^ arcs), `blink`, a shut lid (>= 0.75) |
| Brows carry the emotion | brows + lid shape first (see §4); the pupil only says *where* they look |

**Automated eye check (MANDATORY on every delivery with Eli / Mila on screen):**
`TMPD=<scratch> ep/001/animatic/faces_audit.sh A B …` (or `node faces_audit.mjs --page <page> --scene <scene>` for any
scene) renders the key acting frames of each shot (start / middle / end, every word Eli or Mila says, every sound cue),
with the kit's face log on (`window.__faceLog`: each eye in canvas px), then `faces_check.py` checks the **final pixels**
(after light, grade, bloom, grain): eye white present, a dark pupil blob covering >= 55 % of a 0.8x-pupil disc (35 % for
the declared sly emotions; 40 % behind the magnifier glass), pupil >= 0.33x the eye, catchlight <= 0.36x the pupil.
Declared closed eyes, the ponytail-flop gag, fades and crowd-scale eyes (< 3 px radius) are reported apart. It writes
`qc/faces_<X>.json` and the face contact sheet `qc/faces_block<X>_small.jpg` (red border = failure). **A delivery with one
pupil failure is not finished.** Then look at the sheet yourself: the expression matches the script beat, the mouth
syncs, the eyes look at something, faces are not cut by the frame, overlays or balloons, and not lost in the grade.
Lab: `art/scenes/eye_lab.js` (`?scene=eye_lab&part=sizes|lights`, also at `&out=854x480`).

## 6c · Guardian body audit (head to toe, automated + by eye) — 2026-10-16

`TMPD=<scratch> ep/001/animatic/body_audit.sh A B …` renders the key acting frames ONCE (`faces_audit.mjs`) and runs
both the eye check (`faces_check.py`, 0 pupil failures) and the body check (`body_check.py`). The kit logs, while the
audit is on, the tight box of each Eli / Mila draw (their own pixels), wardrobe colour shares, the ground point and seat
state; every extra's box; and every overlay rect (labels, pills, badges, plates, balloons, source line). Checks:
**overlay-head** (FAIL: an overlay crosses the head zone, beanie / ponytail included), **overlay-body** (warn, look),
**cut-head** (FAIL: head zone crossing a frame edge), **colour** (FAIL: no beanie yellow on Eli / no sweater purple on Mila
when >= 18 px tall; any vermilion), **float** (FAIL: standing feet above the ground point), **scale** (warn: side by side
with different u — heights must read Eli 0.95 / Mila 1.08). Body pages (`<TMPD>/pages/body_<X>_pNN.jpg`: frame at
phone size with the boxes + head-to-toe crops) are then read by eye. For close inspection render the audit at
`OUT=1920x1080` too, and use `art/scenes/guardian_lab.js` (`?scene=guardian_lab&cfg=[…]`) to reproduce a pose / view.

Rules added by the Guardian (2026-10-16), enforced in the kit:
- Back views: a hand anchored in front of the face / chest (visor, magnifier, chin, crossed arms, clasp, belly, lap,
  clipboard) is hidden behind the head and torso, never painted on the back of the head or across the back.
- `visor` sits at the hat brim / hairline and `scratch` (nape) at the back edge of the head at temple height (front view:
  at the side of the beanie / crown): the brows and eyes always stay clear.
- Balloon tails stop beside the speaker's head (never cross the beanie, eyes or face); `bubble(..., { side: -1 })` puts
  the balloon up-left when someone stands to the speaker's right.
- Highway wires behind the crew car are drawn before it (no wire across Eli / Mila).
- Continuity props: the «SI SE ABRE UN HUECO, CIÉRRALO» badge is on Eli from «¡Mi lema!» (D1) to the glovebox (E2)
  (`def.eliBadge` in the animatic block, `heroAfter` in ring shots); the popcorn bucket stays with Eli in the stadium.
- When Eli + Mila ride car AV (S9) or the camera follows a car tight, they are not also drawn among the ring observers.

## 6d · Clothing audit (MANDATORY QC, Producer 2026-10-16: «Las ropas a veces tienen desperfectos»)

Two parts, both must report **0 failures** before a delivery:

1. **Lab (after any change to `cast.js` / `cast_alts.js`):** `node ep/001/animatic/clothes_audit.mjs --dir <scratch>/clothes
   --sheets 1` then `python3 ep/001/animatic/clothes_check.py lab <scratch>/clothes ep/001/animatic/qc`. The clothes lab
   (`art/scenes/clothes_lab.js`, `?scene=clothes_lab&id=eli1|mila1&light=golden|dusk|night|noon&set=stand1|stand2|car|ground`)
   draws every pose the animatic uses (standing: stand walk point crossed hips scratch fist wave clipboard detective
   visor surprise clasp shrug palm cheer pump think pointSelf open chin belly; in the car: drive driveFist lap lapPoint
   crossed cheer palm fist point visor belly; on the ground: sit sitPoint belly palm crossed point) in all five views
   (front, 3/4, profile, back, back 3/4). Checks, on the character's own pixels:
   - **parts** (flat light, exact wardrobe colours, interior pixels only): every garment part expected in that view is
     there — Eli: beanie, tee, apron bib + skirt (3/4 back: the skirt edge), neck straps (back: the strap loop), waist
     band, jeans, boots; Mila: sweater, overalls, back patch / pockets, brass buttons (front / 3/4 with open arms),
     earrings, hair, boots;
   - **thin**: silhouette pixels thinner than ~2.6 ink widths outside the head and hands (stray strokes, cords, stubs);
   - **pop**: over 20 consecutive frames (idle, walk, wave) and over every pose blend (rest -> pose, k 0..1) no part
     appears / vanishes in one frame.
   Then **look** at the 32 contact sheets (`sheet_<id>_<set>_<light>_<1080|draft>.jpg`) and at 4x crops of anything odd.
2. **Animatic blocks:** `body_audit.sh` now also runs `clothes_check.py block` on the same key acting frames plus the
   frame 1/30 s later (`faces_audit.mjs` stores it): **colour** (tee white / apron brown / jeans blue on Eli, sweater
   purple / overall mustard / green boots on Mila, where the view shows them), **thin** (where the ink is >= 1.4 px)
   and **pop** (a garment family share or the silhouette jumping between consecutive frames of the same shot).

**Clothing rules enforced in the kit (2026-10-16, see GUARDIAN_LOG):**
- Garment pieces drawn on top of the body (bib, skirt, overall panel, back panel) are **stroked first, then filled**,
  so they show ONE ink weight like every silhouette (fill-then-stroke showed the full 2 lw ink: thick black bars).
- Tee sleeves: the round-capped part stops one cap radius before the hem (no white crescent below the hem line); the
  hem line has butt caps and ends on the sleeve's outer ink (no knobs).
- Holes that are not gaps in the form (the leg slot under Eli's skirt / Mila's seat) are solid for the shade test (no
  shade patch on the hem between the legs).
- A hand behind the back (detective) is drawn behind the torso in front view and is a relaxed hand, never a stump.
- Back views: hands in front of the face / chest are hidden, but the **upper arm** shows along the back (no armless
  torso); blending into / out of such a pose shortens the arm continuously (no pop at k = 0.5).
- Pose blends solve both poses and blend the joints (an elbow never flips side mid-blend); the walk knee eases in;
  props (clipboard, magnifier) fade over the middle of a blend.
- Eli back: the apron neck strap is the same flat band as in front; the bow and its ties hang free over the jeans
  (seated: they rest, clipped); back 3/4: the far edge of the apron skirt peeks past the body. Seated: the skirt is a
  short flap over the lap and the waist band stays.
- Mila back 3/4: the back panel (straps, patch, pockets) turns with the body.
- Small round details (buttons, jewel highlights, the bow knot) are true-radius discs, never `K.circle` in body units
  (it clamps r >= 0.01 = a pale disc as big as the button).

## 6e · Motion audit: one-frame pops in the finished video (Guardian v3, 2026-10-16)

The key-frame audits (6b-6d) sample a few moments per shot; a garment, arm, prop or face that snaps between two of
them is invisible to them. **Every delivery with Eli / Mila in motion also runs**
`python3 ep/001/animatic/pop_check.py block<X>_draft.mp4 <events.json> X <qc dir> --body qc/body_<X>.json` (decodes
EVERY frame, 24 px cells inside the characters' boxes; STEP = a cell changes in one frame while its neighbourhood was
quiet the frame before and after; FLASH = something shows for exactly one frame; cuts excluded) and the sheet of
before / now / after crops is **read by eye**: blinks, mouth visemes, text-box pop-ins and scripted hits are fine; a
sleeve, strap, apron, limb, prop, badge or a whole face that snaps is a defect.

Rules (kit `art/lib/cast.js` + `ep/001/animatic/anim.js`):
- **No hard switches in shot lists.** Never `pose: t > T ? 'b' : 'a'`, `if / else` chains of `{ pose, expr }`, or
  `cond ? A.pz(..) : A.pz(..)`. Use `A.pz` / `A.pzv` (pose), `A.ez` / `A.ezs` (face: `o.exprBlend = { expr, k }`
  interpolates lids, brows, eye / pupil scale, gaze, head tilt; mouth and flags switch at k = 0.5) and `A.seq(t, keys, d)`
  (pose + face + lean / tilt / headTurn / look + front-3/4-profile view, all blended at each boundary).
- **Value-driven blends follow the whole travel of the value** (Guardian v3, 2026-10-18): `A.pzv(v, 0.5, a, b, 1.0)` (now
  the default band) and `A.ez(v, 0.4, a, b, 0.6)`. A 0.16 band on a value that ramps 0..1 in 0.14-0.35 s is a one-frame
  snap (E1 G17, C2 D05/D06/D16, E2 H03/I04 all had it). Turns never flip `dir` inside a blend: go through the front view
  (`view: 0.55 * Math.abs(1 - 2 * K.ease.sine(k))`, `dir: k < 0.5 ? 1 : -1`).
- **Stand-ups / sit-downs are continuous**: `o.crouch` (units) draws the body lower with the feet on the ground and the
  knees bent (forward in profile, out in front); `o.crouchFwd` puts the feet where a chair-seated pose has them. Stadium
  (C2) and bench (E2 K05) use it; never flip `seated` in one frame.
- **Seated on an open bench / chair: `legs: true`** (the legs were missing on the bus-stop bench, E2 K04-K07).
- Props that depend on a pose follow its blend weight (Eli's badge height, the popcorn bucket from lap to hand).
- Turns away from camera go through profile (numeric view) before the back view, never q -> back 3/4 mirrored.
- Text boxes: the tail never crosses another head or box (`K.tbox.place` penalty; `textbox_check.mjs` fails it).
- **Props never cross a face (Guardian independent v4 pass, 2026-10-24).** `python3 ep/001/animatic/face_cross_check.py
  block<X>_review.mp4 <audit dir>/body_<X> X <qc dir>` decodes EVERY frame, interpolates the kit's head discs between the
  audited key frames inside each shot and measures the share of colours a head cannot have (teal / green, red /
  vermilion, saturated blue) inside the disc: > 5 % = a run on the sheet `facecross_<X>_small.jpg`, read by eye (a teal
  car door behind a chin in a wide shot is fine; a flag, bucket, pole or cloth over an eye or a mouth is a defect; the
  E1 G17 flag swept Mila's face for 2 frames at 46.70 s and the key-frame audits + pop check did not see it). Rule for
  shot lists: a prop with a pole or cloth (flag, magnifier, bucket, sandwich, clipboard) is held in the hand **away** from
  the other character and its whole arc (up AND down) is rendered frame by frame before the shot is accepted.
- **Brows never touch the headwear (Guardian, 2026-10-29).** `python3 art/render/brow_clear_check.py <scratch> [n...]`
  renders `eli_hat_lab` for every headwear option x happy / surprised / furious x hat hit 0 / 1 x front / 3/4 / profile /
  beside Mila, twice with the brows painted red (`&probe=1`, with and without the headwear `&nohat=1`), and fails any
  case where the headwear or its hair changes the skin 2-5 px around the brows. Headwear rules: the lift is measured from
  the lowest ink edge (brim / lens / band, + stroke + hit push-down), the hairline under a hat stays clear over the
  brows' span, nothing re-strokes the head outline over the face (the googly eyes bulge past it in 3/4 and profile), and
  a tall headwear sets `extraK` so the surprise ticks / anger mark sit outside it. Any new headwear, or a change to the
  chosen one, passes this check before a sheet or a shot leaves the studio. Option 1 (the current beanie) fails it by
  design of the beanie (its lift is capped at 0.034): known, logged, not to be shipped as «fixed».

## 7 · Never

- Never change their silhouettes (capsule heads, heights, beanie, ponytail), their signature colours or their wardrobe
  without the Producer.
- Never copy anything from the game that inspired Max & Leo (see `secondquest/docs/ep003/characters/FRIENDS_MAX_LEO.md`):
  shapes, faces, outfits and colours are our own.
- Never give them round heads (that is the extras' shape) or a mascot companion.
- Never portray a real person; never use vermilion on them; never leave a story beat with a blank face.
- Never ship eyes without a visible pupil (unless the emotion is a declared closed-eye one); never draw an eye detail
  with `K.circle` in head units.
