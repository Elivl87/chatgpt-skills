# Eli + Mila · the channel's characters (final spec, 2026-10-15)

Producer decisions (PRODUCER_DECISIONS.md, 2026-10-15): the pair is **Eli + Mila**, design **Alt 1 «Taller»** (Max &
Leo adapted to the channel style, Max turned into a woman; the man renamed Eli). The 2D versions drawn in code are
canonical. No mascot. **Standing rule:** every character in this universe (Eli, Mila **and** the round-headed extras)
must express every emotion clearly in front, 3/4 and profile, and every delivery keeps improving the details.

Sheets: `model_sheet.png` (+ `model_sheet_small.jpg`) · `emotion_sheet.png` (+ `emotion_sheet_small.jpg`) ·
history: `alternatives/` (the 5 designs the Producer chose from).

## 1 · Identity

| | **Eli** | **Mila** |
|---|---|---|
| Role | loud, impatient, optimistic; the gap-closer; yells «¡¿Quién fue?!» | tall, calm, curious, patient; sees what nobody sees; «Fuiste tú.» |
| Height (units, 1 = an extra) | **0.95** | **1.08** (≈ 14 % taller) |
| Head | short, wide capsule (hw 0.082, hh 0.138), dark brown skin | tall, narrow capsule (hw 0.063, hh 0.152), tan skin |
| Face | big googly eyes, tiny pupils that don't quite agree, nose bump, big grin, dark brows (drawn over the beanie cuff) | googly eyes with sleepy lids (lid bias 0.36), lashes, wine lips, dark brows, nose bump |
| Hair / hat | yellow ribbed beanie with a folded cuff (bobs; squashes when hit) | high ponytail with a mustard tie (swings, trails in the wind), side fringe |
| Clothes | white tee, brown canvas apron (bib, neck cord, waist tie with a bow at the back, skirt with a patch pocket that sways), blue jeans, black work boots | purple long sleeves with darker cuffs, mustard bib overalls (straps crossing in an X at the back, brass buttons, chest pocket), green rubber boots with a rolled lip |
| Accessories | none | small gold **drop earrings** (stud on the head edge + a drop hanging outside the silhouette; they swing) |
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
| skin | `#7a4d32` | hair | `#2e1d22` |
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
| surprised | brows high, eyes 1.24×, tiny pupils | «o» | stretch 5 % | palms up by the shoulders | ticks |
| curious | one brow arched, eyes wide | small «o» | tilted, leaning in | hand at the chin | — |
| awe | brows up, huge pupils with double catchlights | tall «o» | up and back | hands clasped | sparkles |
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
3. Hands never kinked: elbows are soft curves; idle arms hang with a slight bend; hands relaxed.
4. Rim light hugs the ink line (no second line); shade crescent on the far side; grain on top.
5. Earrings hang outside the head (never read as bolts); ponytail and apron move with `t`.
6. In cars: heads and torsos big in close-ups (the pair fills about half the frame); the wheel stays put while the
   hands act (`K.cast.probe`).
7. Talk visemes alternate (M / E / A / O); blinks every 2-5 s in long holds.
8. No vermilion on the characters; signature yellow / purple visible in every shot.
9. Extras: emotions read in 3/4 and profile too (profile nose, one eye, one brow, edge mouth).
10. Light JPG (≤ 400 KB) for the Producer of everything he will see.

## 6 · Never

- Never change their silhouettes (capsule heads, heights, beanie, ponytail), their signature colours or their wardrobe
  without the Producer.
- Never copy anything from the game that inspired Max & Leo (see `secondquest/docs/ep003/characters/FRIENDS_MAX_LEO.md`):
  shapes, faces, outfits and colours are our own.
- Never give them round heads (that is the extras' shape) or a mascot companion.
- Never portray a real person; never use vermilion on them; never leave a story beat with a blank face.
