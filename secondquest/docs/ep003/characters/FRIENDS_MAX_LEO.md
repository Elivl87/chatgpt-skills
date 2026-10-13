# Max and Leo: EP003 friends (our 3D), v1

The two recurring friends in the boat chat ("The boat": Quest, Pixie, **Max**, **Leo**) are built as our own
procedural 3D characters in `tools/props3d` and rendered in the house toon style: the 3-tone ramp plus ink outlines
from `render.py`, the same pipeline as fish v2. They stand next to the 2D Quest and Pixie.

- Design sheet: `docs/ep003/characters/FRIENDS_MAX_LEO_v1.jpg` (turnaround, expressions, poses, scale line-up).
- Model: `tools/props3d/scene.ts` → `worm()`, `friendMax()`, `friendLeo()` (part ids 3000–3040 and 3100–3140).
- Jobs: `python3 tools/props3d/render.py friends` (50 cut-outs) and `friends_sheet` (the sheet).
- Cut-outs (transparent PNG, not in git, archived with the episode's art):
  `public/art/ep003/props3d/`
  - standing: `<who>_<34|front>_<neutral|laugh|shock|sideeye|sweat>.png`, `<who>_side_neutral.png`
  - poses: `<who>_sit_34_<all 5 expressions>.png`, `<who>_sit_front_neutral.png`, `<who>_sit_side_<neutral|laugh>.png`,
    `<who>_point_<34|front>_neutral.png`, `<who>_cheer_<34|front>_laugh.png`, `<who>_phone_<34|front>_neutral.png`
  - `who` = `max` | `leo`. The 3/4 view sees the character's left side (flip the PNG for the other side).

## The characters

| | **Max** (purple) | **Leo** (yellow) |
|---|---|---|
| Role | tall, lanky, calm | shorter, chunkier, loud ("I'll get it later") |
| Height | ≈ 180 cm model, **1.08 × Quest** | ≈ 158 cm with beanie, **0.95 × Quest** |
| Head | tall narrow capsule (46 × 18 cm), tan `#d9a66c`, bald | shorter, wider capsule (40 × 21 cm), dark brown `#7a4d32` |
| Hat | none | yellow knit beanie `#f2c230`, ribbed, folded cuff |
| Top | purple long sleeves `#7158b8` with cuffs | white tee `#f1ede2`, short sleeves |
| Outfit | mustard-ochre bib overalls `#c4922f`: two straps over the shoulders crossing to the back waist, brass buttons, chest pocket with flap | brown canvas work apron `#a4713d`: bib, dark waist tie, neck cord, skirt with a patch pocket, over blue jeans `#3f5f96` |
| Boots | dark green rubber boots up the shin, rolled lip | black work boots |
| Default face | sleepy lids (0.42), small smile | wide eyes, big open grin with teeth and tongue |

Palette ties to the chat colours of the episode (`--max: #7860be`, `--leo: #d69628` in the Hyperframes blocks):
Max reads purple, Leo reads yellow (the beanie) at any size.

## Driving them from a shot

`shot.max` / `shot.leo` = `{ expr, pose, at? }` (like `shot.fish` for fish v2):

- `expr`: `neutral`, `laugh` (mouth wide open, head back), `shock` (eyes 1.22×, pupils half size, "o" mouth),
  `sideeye` (half lids, both pupils to one side, flat mouth), `sweat` (worried tilted lids, wobbly mouth, sweat drop).
  A `FriendFace` object can be passed instead: `lid`, `low`, `tilt`, `look [up, side]`, `goofy`, `eye`, `pupil`,
  `mouth` (`smile | flat | grin | open | o | wobble`), `sweat`, `nod`.
- `pose`: `stand`, `sit`, `point` (left arm forward and out, index finger), `cheer` (both arms up), `phone`
  (phone in the right hand, head and eyes down).
- `at`: `[x, y, z, yaw]` places the character in a multi-prop render (e.g. on a rowboat thwart).

**Seated convention:** in `sit` the model's y = 0 is the seat (the underside of the thighs). Knees go up (thighs rise
~39°, shins near vertical) because a rowboat thwart is only ~22 cm above the floorboards; checked in a render with
the `rowboat` prop (middle thwart at about x = -9, y = 27 cm, facing the stern): both fit the boat at the right scale
and the feet stay inside the hull. Seated, Leo's apron skirt lies hidden in his lap (bib and tie still show).

## Inspired by the game vs. ours

What we take from *How to Fish* (the idea, so they read as "How to Fish people"):
- the "worm person" silhouette: head and neck as one soft capsule leaning forward, no ears, bald;
- big bulging googly eyes sitting on the surface with tiny pupils that don't quite agree; a nose bump; a small mouth;
- long limp limbs, long arms, simple hands, chunky boots, flat colours;
- the fishing-town wardrobe types: bib overalls over long sleeves, a work apron, a beanie.

What is ours (the distance):
- **Rendering:** our toon ramp, ink outlines and smooth shading, not the game's low-poly faceted, textured look.
  Nothing is taken from the game: no meshes, textures, UVs, rigs or proportions were copied; every shape is our own
  procedural geometry (lathe capsules, swept straps, projected face decals) written from scratch.
- **Faces:** our eyes have skin-coloured lids (sleepy, worried, side-eye) and a catchlight; our mouths are drawn
  decals (smile line, toothy grin with tongue, "o", wobble), designed for comedy beats. The game's faces are fixed.
- **Outfits and colours:** the game's signature is orange overalls on navy; ours are mustard-ochre on purple (Max)
  and a brown apron on a white tee with a yellow beanie (Leo), keyed to our chat colours. The cuts are generic
  workwear (straps crossing to the back, a pocket flap, a neck cord, a ribbed cuffed beanie), not the game's outfits.
- **Characters:** Max and Leo are our own personalities with their own heights, builds and skin tones; neither is a
  copy of a game NPC (no names, no specific NPC outfit such as the seller's striped shirt or the old captain).
- No game screenshot, logo or asset is in the repo or in any output; the reference was studied only.

## Renders

- 50 cut-outs: **about 130 s** on 4 CPUs (4 in parallel, ≈ 10 s per cut-out per core, 1000–1700 × 1500 px canvas,
  2× supersampled). The sheet job takes about 2 s.
- Line weight 4.4 at 1500 px height (same on-screen weight as fish v2); `despeckle=34` drops the small crease ticks
  that bent elbows and knees produce in the normal pass.
- `friend_render` warns if a figure touches the canvas edge.

## Known limits (v1)

- The face is projected on the capsule front: in a pure side view the mouth reads as a short edge.
- Hands are mittens (thumb + index finger when pointing); no individual fingers.
- The phone screen is a flat light-blue card (not a green key colour); swap the colour if a screen insert is needed.
- Seated: the apron skirt is hidden (lap). In a strict side view Max's near arm covers most of the bib.
- Leo's apron neck cord is visible behind the head in the side view (a small loop above the collar).
- The despeckle threshold could also remove a genuine tiny ink detail under ~30 px (none seen in the 50 cut-outs).

## Extras (Producer, 2026-10-13): lip-flap + blink, legs-flat sit, inside the rowboat

All are new files and new jobs; the v1 cut-outs, names and jobs above are unchanged. Review sheet:
`docs/ep003/characters/FRIENDS_MAX_LEO_v1_extras.jpg` (`render.py friends_extras_sheet`).

### Lip-flap and blink frames (`render.py friends_talk`, 144 files, ~400 s)

`<v1 name>_<frame>.png` next to every face it belongs to, `frame` = `m0` (mouth closed), `m1` (mid), `m2` (open),
`blink` (lids shut with a lash line, mouth as in the base face). Bases:
- standing `<who>_<34|front>_<neutral|laugh|shock|sideeye|sweat>`,
- seated `<who>_sit_34_<all 5>`, `<who>_sit_front_neutral`,
- legs-flat `<who>_sitflat_34_<neutral|laugh>`.

Example: `max_34_neutral_m1.png`, `leo_sit_34_laugh_m2.png`, `leo_front_shock_blink.png`. Each frame is rendered with
the same canvas and camera as its base, but cropped on its own alpha: align by the **bottom centre** (the feet; a
seated base keeps its feet line too). Mouths per face: the eyes and head tilt stay; m0/m1/m2 open a talking mouth
(teeth from m1, tongue at m2); `shock` keeps its "o" at three sizes; `sideeye` and `sweat` close to their own line
(flat / wobble). Lip-flap suggestion: m0 → m1 → m2 → m1 per syllable at 8–12 fps, a blink every 2–4 s
(blink frame held 2–3 frames at 30 fps).

In scene code: `setExpr('neutral+m1')`, `setExpr('laugh+blink')` (modifiers `m0 | m1 | m2 | blink`), or
`FriendFace.talk = 0..1`.

### Legs-flat sit (`render.py friends_sitflat`, 16 files, ~65 s)

Pose `sitflat`: on a dock or floor, legs straight out, hands planted beside the hips, a slight lean back; Leo's
apron skirt lies over his lap. Files: `<who>_sitflat_34_<all 5>`, `<who>_sitflat_front_neutral`,
`<who>_sitflat_side_<neutral|laugh>` (+ the talk frames above). As in `sit`, the model's y = 0 is the seat, and the
3/4 and front views are seen from 12° higher so the lap reads.

### Inside the rowboat (`render.py friends_boat`, 42 files, ~130 s)

Side view of the boat, same camera as `rowboat_side*.png` (the boat halves the EP003 blocks stack), on a taller canvas
with the same focal length, so the boat keeps its exact size and the friends' heads fit above it. **Every layer has the
same size (1453 × 535 px) and crop box: stack them at the same position**, bottom to top:

1. `rowboat_side_back_tall.png`: far side and interior (= `rowboat_side_back.png` + 216 px of headroom on top);
2. `boat_max_<expr>.png`: Max on the middle thwart; `boat_leo_<expr>.png`: Leo on the forward thwart; both turned
   ~35° toward the camera and toward each other; `expr` = `neutral | laugh | sideeye | shock`, each also as
   `_m0 | _m1 | _m2 | _blink` frames (e.g. `boat_leo_laugh_m2.png`);
3. the 2D crew (Quest, Pixie) if they share the boat;
4. `rowboat_side_front_tall.png`: near hull, rail, oarlock and oar (= `rowboat_side_front.png` + the same headroom).

`public/art/ep003/props3d/boat_layers.json` records the size, `extra_top_px` (216: the tall layers are the v1 halves'
box plus 216 px above; width and bottom edge match within 1 px) and the seats. The friends' legs are hidden by the
front layer, so a friend layer can slide sideways (about ±40 cm, ±150 px) to make room for the 2D crew without
showing the seat contact. Seat heights were checked in a 3D render with the boat (both sit on their thwarts; feet
stay inside the hull).

### Extras renders and limits

- Total for the three jobs: ~10 min on 4 CPUs (≈ 2.7 s per cut-out with 4 in parallel). Disk: about 70 MB of PNGs.
- In the boat layers a friend's knees sit just above the gunwale (knees-up seat in a small boat): intended, it reads
  as "too tall for the boat".
- The blink lash line is a fixed arc; it does not follow the `tilt` of worried lids.
